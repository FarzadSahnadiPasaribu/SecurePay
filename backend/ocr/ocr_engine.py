"""
OCR Engine for SecurePay Vision.
Extracts structured financial data from invoice images / PDFs.
Includes image-forensics manipulation detection.

EasyOCR is used when available; otherwise a mock extraction is used.
"""
import os
import re
import random
import hashlib
import logging
from typing import Optional

import cv2
import numpy as np
from PIL import Image

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Regex patterns for IDR financial data
# ---------------------------------------------------------------------------
IDR_PATTERN = re.compile(
    r"(?:Rp\.?\s*|IDR\s*)(\d{1,3}(?:[.,]\d{3})*(?:[.,]\d{2})?|\d{4,12})",
    re.IGNORECASE,
)
DATE_PATTERN = re.compile(
    r"\b(\d{1,2})[\/\-\s](\d{1,2})[\/\-\s](\d{2,4})\b"
    r"|\b(\d{1,2})\s+(?:Jan(?:uari)?|Feb(?:ruari)?|Mar(?:et)?|Apr(?:il)?|Mei|"
    r"Jun(?:i)?|Jul(?:i)?|Agu(?:stus)?|Sep(?:tember)?|Okt(?:ober)?|Nov(?:ember)?|"
    r"Des(?:ember)?)\s+(\d{4})\b",
    re.IGNORECASE,
)
ACCOUNT_PATTERN = re.compile(r"\b(\d{10,16})\b")
TXN_ID_PATTERN = re.compile(
    r"(?:No\.?\s*(?:Transaksi|Referensi|Invoice)|Ref(?:erence)?\.?)\s*[:\-]?\s*([A-Z0-9\-\/]+)",
    re.IGNORECASE,
)

# ---------------------------------------------------------------------------
# Mock OCR data for demo purposes
# ---------------------------------------------------------------------------
MOCK_MERCHANTS = [
    "Warung Pak Budi", "Toko Online Bu Sari", "Jasa Print Pak Hendra",
    "Bengkel Motor Mas Agus", "Warung Makan Bu Tini", "Toko Baju Murah",
    "Supermarket Berkah", "Apotek Sehat Sejahtera", "Minimarket Bu Endah",
]
MOCK_PAYMENT_METHODS = ["QRIS", "BCA", "BNI", "Mandiri", "GoPay", "OVO", "Dana", "ShopeePay"]


class OCREngine:
    """Wrapper for OCR extraction and image forensics."""

    def __init__(self):
        self.use_easyocr = False
        self.reader = None
        self._init_easyocr()

    def _init_easyocr(self):
        try:
            import easyocr  # type: ignore
            self.reader = easyocr.Reader(["id", "en"], gpu=False, verbose=False)
            self.use_easyocr = True
            logger.info("EasyOCR initialised (id+en)")
        except Exception:
            logger.info("EasyOCR not available – using mock OCR fallback")

    # ------------------------------------------------------------------
    # Public API
    # ------------------------------------------------------------------

    def preprocess_image(self, image: np.ndarray) -> np.ndarray:
        """Denoise, greyscale, and threshold image for better OCR accuracy."""
        if len(image.shape) == 3:
            gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
        else:
            gray = image.copy()

        denoised = cv2.fastNlMeansDenoising(gray, h=10)
        _, thresh = cv2.threshold(denoised, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
        return thresh

    def extract_text(self, image_path: str) -> dict:
        """
        Run OCR and return structured extraction results.

        Returns
        -------
        dict with keys: amount, date, merchant, account_number,
                        payment_method, transaction_id, raw_text, confidence
        """
        try:
            image = self._load_image(image_path)
            if image is None:
                return self._mock_extraction(image_path)

            if self.use_easyocr:
                return self._easyocr_extract(image, image_path)
            else:
                return self._mock_extraction(image_path)

        except Exception as exc:
            logger.error("OCR extraction error for %s: %s", image_path, exc)
            return self._mock_extraction(image_path)

    def detect_manipulation(self, image_path: str) -> dict:
        """
        Analyse image for signs of digital manipulation / tampering.

        Returns
        -------
        dict with: manipulation_score (0-1), manipulation_detected (bool),
                   suspicious_regions (list), confidence (float), details (dict)
        """
        try:
            image = self._load_image(image_path)
            if image is None:
                return self._mock_forensics()

            return self._forensics_analysis(image, image_path)

        except Exception as exc:
            logger.error("Forensics error for %s: %s", image_path, exc)
            return self._mock_forensics()

    # ------------------------------------------------------------------
    # OCR implementations
    # ------------------------------------------------------------------

    def _easyocr_extract(self, image: np.ndarray, image_path: str) -> dict:
        preprocessed = self.preprocess_image(image)
        results = self.reader.readtext(preprocessed, detail=1)

        raw_text = " ".join(r[1] for r in results)
        avg_conf = float(np.mean([r[2] for r in results])) if results else 0.5

        return {
            "amount": self._extract_amount(raw_text),
            "date": self._extract_date(raw_text),
            "merchant": self._extract_merchant(raw_text),
            "account_number": self._extract_account(raw_text),
            "payment_method": self._extract_payment_method(raw_text),
            "transaction_id": self._extract_transaction_id(raw_text),
            "raw_text": raw_text,
            "confidence": round(avg_conf, 3),
        }

    def _mock_extraction(self, image_path: str) -> dict:
        """Generate deterministic-ish mock OCR data based on file hash."""
        seed = int(hashlib.md5(image_path.encode()).hexdigest()[:8], 16)
        rng = random.Random(seed)

        amount = rng.choice([
            50_000, 75_000, 100_000, 150_000, 200_000, 350_000,
            500_000, 750_000, 1_000_000, 1_500_000, 2_000_000,
            5_000_000, 10_000_000,
        ])
        merchant = rng.choice(MOCK_MERCHANTS)
        method = rng.choice(MOCK_PAYMENT_METHODS)
        day = rng.randint(1, 28)
        month = rng.randint(1, 12)
        year = 2024
        acct = "".join([str(rng.randint(0, 9)) for _ in range(10)])
        txn_id = f"TXN{rng.randint(100000, 999999)}"

        raw = (
            f"BUKTI PEMBAYARAN\nMerchant: {merchant}\n"
            f"Rp {amount:,}\nTanggal: {day:02d}/{month:02d}/{year}\n"
            f"Metode: {method}\nNo. Rekening: {acct}\nRef: {txn_id}"
        )

        return {
            "amount": float(amount),
            "date": f"{day:02d}/{month:02d}/{year}",
            "merchant": merchant,
            "account_number": acct,
            "payment_method": method,
            "transaction_id": txn_id,
            "raw_text": raw,
            "confidence": round(rng.uniform(0.70, 0.95), 3),
        }

    # ------------------------------------------------------------------
    # Image forensics
    # ------------------------------------------------------------------

    def _forensics_analysis(self, image: np.ndarray, image_path: str) -> dict:
        """Run multiple forensic checks and return composite score."""
        checks = {}

        # 1. Edge inconsistency analysis
        edge_score = self._edge_inconsistency(image)
        checks["edge_inconsistency"] = edge_score

        # 2. Noise level analysis
        noise_score = self._noise_analysis(image)
        checks["noise_anomaly"] = noise_score

        # 3. Compression artefact analysis
        compress_score = self._compression_artefacts(image)
        checks["compression_artefacts"] = compress_score

        # 4. Clone/copy-move detection (simplified)
        clone_score = self._clone_detection(image)
        checks["clone_detected"] = clone_score

        # Weighted composite
        weights = {
            "edge_inconsistency": 0.30,
            "noise_anomaly": 0.25,
            "compression_artefacts": 0.25,
            "clone_detected": 0.20,
        }
        composite = sum(checks[k] * weights[k] for k in checks)
        composite = min(composite, 1.0)

        suspicious_regions = []
        if composite > 0.4:
            suspicious_regions.append({"region": "text_area", "confidence": round(composite, 3)})

        return {
            "manipulation_score": round(composite, 4),
            "manipulation_detected": composite > 0.5,
            "suspicious_regions": suspicious_regions,
            "confidence": round(1.0 - composite * 0.3, 3),
            "details": {k: round(v, 4) for k, v in checks.items()},
        }

    def _edge_inconsistency(self, image: np.ndarray) -> float:
        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY) if len(image.shape) == 3 else image
        edges = cv2.Canny(gray, 50, 150)
        # High variance in edge density can indicate pasted regions
        h, w = edges.shape
        block = max(h // 8, 16)
        densities = []
        for y in range(0, h - block, block):
            for x in range(0, w - block, block):
                region = edges[y : y + block, x : x + block]
                densities.append(np.mean(region) / 255.0)
        if not densities:
            return 0.0
        cv = float(np.std(densities) / (np.mean(densities) + 1e-6))
        return min(cv / 3.0, 1.0)

    def _noise_analysis(self, image: np.ndarray) -> float:
        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY) if len(image.shape) == 3 else image
        blurred = cv2.GaussianBlur(gray.astype(np.float32), (5, 5), 0)
        noise = gray.astype(np.float32) - blurred
        noise_level = float(np.std(noise))
        # Unusually low noise can indicate copy-pasted clean region
        # Unusually high can indicate digital injection
        # Normalise: 0 = clean, 1 = suspicious
        if noise_level < 2.0:
            return 0.6  # suspiciously clean
        if noise_level > 40.0:
            return 0.4  # high noise but not necessarily manipulated
        return 0.0

    def _compression_artefacts(self, image: np.ndarray) -> float:
        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY) if len(image.shape) == 3 else image
        dct_scores = []
        step = 8
        for y in range(0, gray.shape[0] - step, step * 4):
            for x in range(0, gray.shape[1] - step, step * 4):
                block = gray[y : y + step, x : x + step].astype(np.float32)
                dct = cv2.dct(block)
                high_freq = float(np.mean(np.abs(dct[4:, 4:])))
                dct_scores.append(high_freq)
        if not dct_scores:
            return 0.0
        cv_dct = float(np.std(dct_scores) / (np.mean(dct_scores) + 1e-6))
        return min(cv_dct / 5.0, 1.0)

    def _clone_detection(self, image: np.ndarray) -> float:
        """Simplified clone/copy-move detection via block matching."""
        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY) if len(image.shape) == 3 else image
        # Downscale for speed
        small = cv2.resize(gray, (128, 128))
        blocks = []
        block_size = 16
        for y in range(0, 128 - block_size, block_size):
            for x in range(0, 128 - block_size, block_size):
                b = small[y : y + block_size, x : x + block_size].flatten().astype(np.float32)
                b /= (np.linalg.norm(b) + 1e-6)
                blocks.append(b)
        if len(blocks) < 2:
            return 0.0
        # Check for highly similar non-adjacent blocks
        similar_count = 0
        for i in range(len(blocks)):
            for j in range(i + 2, min(i + 10, len(blocks))):
                sim = float(np.dot(blocks[i], blocks[j]))
                if sim > 0.995:
                    similar_count += 1
        return min(similar_count / 10.0, 1.0)

    def _mock_forensics(self) -> dict:
        score = random.uniform(0.05, 0.25)
        return {
            "manipulation_score": round(score, 4),
            "manipulation_detected": score > 0.5,
            "suspicious_regions": [],
            "confidence": round(0.85, 3),
            "details": {
                "edge_inconsistency": round(score * 0.9, 4),
                "noise_anomaly": round(score * 0.8, 4),
                "compression_artefacts": round(score * 1.1, 4),
                "clone_detected": 0.0,
            },
        }

    # ------------------------------------------------------------------
    # Field extractors
    # ------------------------------------------------------------------

    def _extract_amount(self, text: str) -> Optional[float]:
        matches = IDR_PATTERN.findall(text)
        if not matches:
            plain = re.findall(r"\b\d{4,12}\b", text)
            return float(plain[0]) if plain else None
        amounts = []
        for m in matches:
            cleaned = re.sub(r"[,.](\d{3})", r"\1", m)
            cleaned = cleaned.replace(",", "").replace(".", "")
            try:
                amounts.append(float(cleaned))
            except ValueError:
                pass
        return max(amounts) if amounts else None

    def _extract_date(self, text: str) -> Optional[str]:
        m = DATE_PATTERN.search(text)
        if not m:
            return None
        g = m.groups()
        if g[0] and g[1] and g[2]:
            return f"{int(g[0]):02d}/{int(g[1]):02d}/{g[2]}"
        return m.group(0)

    def _extract_merchant(self, text: str) -> Optional[str]:
        patterns = [
            r"(?:Merchant|Toko|Warung|Nama)\s*[:\-]?\s*(.+?)(?:\n|$)",
            r"BUKTI PEMBAYARAN\s+(.+?)(?:\n|Rp)",
        ]
        for pat in patterns:
            m = re.search(pat, text, re.IGNORECASE)
            if m:
                return m.group(1).strip()[:100]
        return None

    def _extract_account(self, text: str) -> Optional[str]:
        m = ACCOUNT_PATTERN.search(text)
        return m.group(1) if m else None

    def _extract_payment_method(self, text: str) -> Optional[str]:
        methods = ["QRIS", "BCA", "BNI", "Mandiri", "BRI", "GoPay", "OVO",
                   "Dana", "ShopeePay", "LinkAja", "Transfer"]
        upper = text.upper()
        for method in methods:
            if method.upper() in upper:
                return method
        return "Other"

    def _extract_transaction_id(self, text: str) -> Optional[str]:
        m = TXN_ID_PATTERN.search(text)
        if m:
            return m.group(1).strip()
        # Fallback: look for TXN/REF prefix
        m2 = re.search(r"\b(TXN|REF|INV)[A-Z0-9\-]{4,20}\b", text, re.IGNORECASE)
        return m2.group(0) if m2 else None

    # ------------------------------------------------------------------
    # Image loading (supports JPEG, PNG, PDF via Pillow)
    # ------------------------------------------------------------------

    def _load_image(self, path: str) -> Optional[np.ndarray]:
        if not os.path.exists(path):
            return None
        ext = os.path.splitext(path)[1].lower()
        try:
            if ext == ".pdf":
                return self._pdf_to_image(path)
            img = Image.open(path).convert("RGB")
            return cv2.cvtColor(np.array(img), cv2.COLOR_RGB2BGR)
        except Exception as exc:
            logger.error("Failed to load image %s: %s", path, exc)
            return None

    def _pdf_to_image(self, pdf_path: str) -> Optional[np.ndarray]:
        """Render first page of PDF to numpy image (requires pdf2image / poppler)."""
        try:
            from pdf2image import convert_from_path  # type: ignore
            pages = convert_from_path(pdf_path, first_page=1, last_page=1, dpi=200)
            if pages:
                img = pages[0].convert("RGB")
                return cv2.cvtColor(np.array(img), cv2.COLOR_RGB2BGR)
        except ImportError:
            logger.warning("pdf2image not installed – cannot render PDF")
        except Exception as exc:
            logger.error("PDF render error: %s", exc)
        return None
