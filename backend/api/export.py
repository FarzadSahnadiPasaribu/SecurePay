"""
Export endpoints: PDF reports and CSV transaction exports.
"""
import io
import csv
import logging
from datetime import datetime
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from fastapi.responses import StreamingResponse, Response
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc

from models.database import get_db
from models.user import User
from models.transaction import Transaction
from models.invoice_scan import InvoiceScan
from services.auth_service import get_current_user
from services.report_service import ReportService

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/export", tags=["Export"])

_report_service = ReportService()


def _user_dict(user: User) -> dict:
    return {
        "id": user.id,
        "full_name": user.full_name,
        "email": user.email,
        "business_name": user.business_name or "",
    }


@router.get(
    "/pdf/{scan_id}",
    summary="Export a single invoice scan as PDF",
    response_class=Response,
)
async def export_scan_pdf(
    scan_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(InvoiceScan).where(
            InvoiceScan.id == scan_id,
            InvoiceScan.user_id == current_user.id,
        )
    )
    scan = result.scalar_one_or_none()
    if not scan:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Scan not found")

    scan_data = {
        "id": scan.id,
        "filename": scan.filename,
        "file_size": scan.file_size,
        "file_type": scan.file_type,
        "ocr_raw_text": scan.ocr_raw_text,
        "extracted_amount": scan.extracted_amount,
        "extracted_date": scan.extracted_date,
        "extracted_merchant": scan.extracted_merchant,
        "extracted_account": scan.extracted_account,
        "extracted_payment_method": scan.extracted_payment_method,
        "extracted_transaction_id": scan.extracted_transaction_id,
        "ocr_confidence": scan.ocr_confidence,
        "manipulation_score": scan.manipulation_score,
        "manipulation_detected": scan.manipulation_detected,
        "suspicious_regions": scan.suspicious_regions or [],
        "forensics_details": scan.forensics_details or {},
        "fraud_probability": scan.fraud_probability,
        "risk_level": scan.risk_level,
        "fraud_indicators": scan.fraud_indicators or [],
        "is_fraud": scan.is_fraud,
        "processing_time_ms": scan.processing_time_ms,
        "recommendations": [],
    }

    # Add recommendations
    from services.fraud_service import FraudService
    fs = FraudService()
    scan_data["recommendations"] = fs._get_recommendations(scan.risk_level or "NORMAL")

    try:
        pdf_bytes = _report_service.generate_scan_report(scan_data, _user_dict(current_user))
        filename = f"securepay_scan_{scan_id[:8]}_{datetime.now().strftime('%Y%m%d')}.pdf"
        return Response(
            content=pdf_bytes,
            media_type="application/pdf",
            headers={"Content-Disposition": f'attachment; filename="{filename}"'},
        )
    except Exception as exc:
        logger.error("PDF generation failed: %s", exc)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"PDF generation failed: {exc}",
        )


@router.get(
    "/report",
    summary="Export full fraud analysis report as PDF",
    response_class=Response,
)
async def export_full_report(
    days: int = Query(30, ge=1, le=365),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    from datetime import timedelta

    cutoff = datetime.utcnow() - timedelta(days=days)

    txn_result = await db.execute(
        select(Transaction)
        .where(
            Transaction.user_id == current_user.id,
            Transaction.created_at >= cutoff,
        )
        .order_by(desc(Transaction.created_at))
        .limit(100)
    )
    txns = txn_result.scalars().all()

    fraud_txns = [t for t in txns if t.is_fraud]
    total = len(txns)

    risk_dist = {
        "HIGH": sum(1 for t in txns if t.risk_level == "HIGH"),
        "MEDIUM": sum(1 for t in txns if t.risk_level == "MEDIUM"),
        "LOW": sum(1 for t in txns if t.risk_level == "LOW"),
        "NORMAL": sum(1 for t in txns if t.risk_level in ("NORMAL", None)),
    }

    report_data = {
        "stats": {
            "total_transactions": total,
            "fraud_count": len(fraud_txns),
            "fraud_rate": round(len(fraud_txns) / total * 100, 2) if total else 0.0,
            "total_scans": 0,
        },
        "risk_distribution": risk_dist,
        "recent_transactions": [
            {
                "merchant_name": t.merchant_name,
                "amount": t.amount,
                "payment_method": t.payment_method,
                "risk_level": t.risk_level or "NORMAL",
                "fraud_probability": t.fraud_probability,
                "created_at": t.created_at.isoformat(),
            }
            for t in txns[:20]
        ],
    }

    try:
        pdf_bytes = _report_service.generate_full_report(report_data, _user_dict(current_user))
        filename = f"securepay_report_{datetime.now().strftime('%Y%m%d_%H%M')}.pdf"
        return Response(
            content=pdf_bytes,
            media_type="application/pdf",
            headers={"Content-Disposition": f'attachment; filename="{filename}"'},
        )
    except Exception as exc:
        logger.error("Full report generation failed: %s", exc)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Report generation failed: {exc}",
        )


@router.get(
    "/csv",
    summary="Export transactions as CSV",
    response_class=Response,
)
async def export_csv(
    days: int = Query(30, ge=1, le=365),
    fraud_only: bool = Query(False, description="Export only fraud transactions"),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    from datetime import timedelta

    cutoff = datetime.utcnow() - timedelta(days=days)
    query = select(Transaction).where(
        Transaction.user_id == current_user.id,
        Transaction.created_at >= cutoff,
    )
    if fraud_only:
        query = query.where(Transaction.is_fraud == True)
    query = query.order_by(desc(Transaction.created_at))

    result = await db.execute(query)
    txns = result.scalars().all()

    buffer = io.StringIO()
    writer = csv.writer(buffer)
    writer.writerow([
        "id", "amount", "merchant_name", "payment_method", "transaction_time",
        "location", "sender", "receiver", "device_id", "description",
        "is_fraud", "fraud_type", "fraud_probability", "anomaly_score", "risk_level",
        "created_at",
    ])
    for t in txns:
        writer.writerow([
            t.id, t.amount, t.merchant_name, t.payment_method,
            t.transaction_time.isoformat() if t.transaction_time else "",
            t.location or "", t.sender or "", t.receiver or "",
            t.device_id or "", t.description or "",
            t.is_fraud, t.fraud_type or "",
            t.fraud_probability, t.anomaly_score, t.risk_level or "NORMAL",
            t.created_at.isoformat(),
        ])

    csv_bytes = buffer.getvalue().encode("utf-8-sig")
    filename = f"securepay_transactions_{datetime.now().strftime('%Y%m%d')}.csv"
    return Response(
        content=csv_bytes,
        media_type="text/csv",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )
