"""
FraudService – orchestrates OCR + anomaly detection for invoice scans
and standalone transaction analysis.
"""
import logging
import time
import uuid
from datetime import datetime
from typing import Optional

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from models.transaction import Transaction
from models.fraud_analysis import FraudAnalysis
from models.invoice_scan import InvoiceScan

logger = logging.getLogger(__name__)


class FraudService:
    """
    Singleton-style service that lazily initialises the OCR engine
    and fraud detector so startup is fast.
    """

    _detector = None
    _ocr = None

    @classmethod
    def _get_detector(cls):
        if cls._detector is None:
            from anomaly_detection.detector import FraudDetector
            cls._detector = FraudDetector()
        return cls._detector

    @classmethod
    def _get_ocr(cls):
        if cls._ocr is None:
            from ocr.ocr_engine import OCREngine
            cls._ocr = OCREngine()
        return cls._ocr

    # ------------------------------------------------------------------
    # Transaction analysis
    # ------------------------------------------------------------------

    async def analyze_transaction(
        self,
        transaction: Transaction,
        db: AsyncSession,
        recent_transactions: Optional[list] = None,
    ) -> FraudAnalysis:
        """Analyse a transaction and persist a FraudAnalysis record."""
        t0 = time.time()
        detector = self._get_detector()

        txn_dict = {
            "id": transaction.id,
            "amount": transaction.amount,
            "merchant_name": transaction.merchant_name,
            "payment_method": transaction.payment_method,
            "transaction_time": transaction.transaction_time,
            "device_id": transaction.device_id,
            "location": transaction.location,
            "sender": transaction.sender,
            "receiver": transaction.receiver,
        }

        result = detector.predict(txn_dict)

        duration_ms = (time.time() - t0) * 1000

        analysis = FraudAnalysis(
            id=str(uuid.uuid4()),
            transaction_id=transaction.id,
            isolation_forest_score=result["model_scores"].get("isolation_forest"),
            lof_score=result["model_scores"].get("lof"),
            svm_score=result["model_scores"].get("svm"),
            ensemble_score=result["model_scores"].get("ensemble"),
            fraud_probability=result["fraud_probability"],
            risk_level=result["risk_level"],
            is_anomaly=result["is_fraud"],
            fraud_indicators=result["fraud_indicators"],
            feature_importance={},
            recommendations=self._get_recommendations(result["risk_level"]),
            model_version=result.get("model_version", "1.0.0"),
            analysis_duration_ms=round(duration_ms, 2),
            created_at=datetime.utcnow(),
        )

        db.add(analysis)

        # Update transaction fraud fields
        transaction.is_fraud = result["is_fraud"]
        transaction.fraud_probability = result["fraud_probability"]
        transaction.anomaly_score = result["anomaly_score"]
        transaction.risk_level = result["risk_level"]
        if result["is_fraud"] and result["fraud_indicators"]:
            transaction.fraud_type = result["fraud_indicators"][0][:100]

        await db.commit()
        await db.refresh(analysis)
        return analysis

    # ------------------------------------------------------------------
    # Invoice scan analysis
    # ------------------------------------------------------------------

    async def analyze_invoice(
        self,
        scan: InvoiceScan,
        file_path: str,
        db: AsyncSession,
    ) -> InvoiceScan:
        """Run OCR + forensics + fraud detection on an uploaded invoice."""
        t0 = time.time()
        ocr = self._get_ocr()
        detector = self._get_detector()

        try:
            # --- OCR extraction ---
            ocr_result = ocr.extract_text(file_path)
            scan.ocr_raw_text = ocr_result.get("raw_text", "")
            scan.extracted_amount = ocr_result.get("amount")
            scan.extracted_date = ocr_result.get("date")
            scan.extracted_merchant = ocr_result.get("merchant")
            scan.extracted_account = ocr_result.get("account_number")
            scan.extracted_payment_method = ocr_result.get("payment_method")
            scan.extracted_transaction_id = ocr_result.get("transaction_id")
            scan.ocr_confidence = ocr_result.get("confidence", 0.0)

            # --- Image forensics ---
            forensics = ocr.detect_manipulation(file_path)
            scan.manipulation_score = forensics.get("manipulation_score", 0.0)
            scan.manipulation_detected = forensics.get("manipulation_detected", False)
            scan.suspicious_regions = forensics.get("suspicious_regions", [])
            scan.forensics_details = forensics.get("details", {})

            # --- Fraud detection on extracted data ---
            txn_dict = {
                "amount": scan.extracted_amount or 0,
                "merchant_name": scan.extracted_merchant or "Unknown",
                "payment_method": scan.extracted_payment_method or "Other",
                "transaction_time": datetime.utcnow(),
            }
            fraud_result = detector.predict(txn_dict)

            # Boost score if image is manipulated
            combined_prob = fraud_result["fraud_probability"]
            if scan.manipulation_detected:
                combined_prob = min(1.0, combined_prob + 0.35)
                fraud_result["fraud_indicators"].insert(0, "Image manipulation detected in invoice")

            if forensics.get("manipulation_score", 0) > 0.3:
                combined_prob = min(1.0, combined_prob + 0.15)
                fraud_result["fraud_indicators"].append(
                    f"Suspicious image forensics score: {forensics['manipulation_score']:.2f}"
                )

            scan.fraud_probability = round(combined_prob, 4)
            scan.risk_level = detector._get_risk_level(combined_prob)
            scan.fraud_indicators = fraud_result["fraud_indicators"]
            scan.is_fraud = combined_prob > 0.5
            scan.analysis_complete = True
            scan.processing_time_ms = round((time.time() - t0) * 1000, 2)

        except Exception as exc:
            logger.error("Invoice analysis failed for scan %s: %s", scan.id, exc)
            scan.error_message = str(exc)
            scan.analysis_complete = False

        await db.commit()
        await db.refresh(scan)
        return scan

    # ------------------------------------------------------------------
    # Helpers
    # ------------------------------------------------------------------

    @staticmethod
    def _get_recommendations(risk_level: str) -> list:
        recs = {
            "HIGH": [
                "Immediately contact your bank / e-wallet provider to verify this transaction.",
                "Do NOT release goods or services until payment is confirmed through official channels.",
                "Report to Kominfo / BSSN fraud hotline if identity fraud is suspected.",
                "Enable two-factor authentication on your payment accounts.",
                "Keep all evidence (screenshots, receipts) for potential dispute filing.",
            ],
            "MEDIUM": [
                "Verify transaction status directly in your banking app before proceeding.",
                "Request additional identification from the customer if amount is large.",
                "Check for duplicate transactions in your recent history.",
                "Consider calling your bank's customer service to confirm.",
            ],
            "LOW": [
                "Double-check the transaction amount and merchant name match your records.",
                "Monitor your account for follow-up suspicious activity.",
                "Keep a copy of this transaction record.",
            ],
            "NORMAL": [
                "Transaction appears normal. Continue with standard verification.",
                "Always keep transaction records for accounting purposes.",
            ],
        }
        return recs.get(risk_level, recs["NORMAL"])
