"""
Invoice scan endpoints: upload, OCR, fraud detection.
"""
import os
import uuid
import logging
from datetime import datetime
from typing import Optional, List

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Query, status
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc

from models.database import get_db
from models.user import User
from models.invoice_scan import InvoiceScan
from services.auth_service import get_current_user
from services.fraud_service import FraudService

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/scan", tags=["Invoice Scan"])

_fraud_service = FraudService()

UPLOAD_DIR = os.getenv("UPLOAD_DIR", "uploads/")
ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp", ".bmp", ".tiff", ".pdf"}
MAX_FILE_SIZE_MB = 10


# ---------------------------------------------------------------------------
# Pydantic schemas
# ---------------------------------------------------------------------------

class ForensicsDetails(BaseModel):
    edge_inconsistency: Optional[float] = None
    noise_anomaly: Optional[float] = None
    compression_artefacts: Optional[float] = None
    clone_detected: Optional[float] = None


class ScanResponse(BaseModel):
    id: str
    filename: str
    file_size: Optional[float] = None
    file_type: Optional[str] = None

    # OCR
    ocr_raw_text: Optional[str] = None
    extracted_amount: Optional[float] = None
    extracted_date: Optional[str] = None
    extracted_merchant: Optional[str] = None
    extracted_account: Optional[str] = None
    extracted_payment_method: Optional[str] = None
    extracted_transaction_id: Optional[str] = None
    ocr_confidence: Optional[float] = None

    # Forensics
    manipulation_score: Optional[float] = None
    manipulation_detected: Optional[bool] = None
    suspicious_regions: Optional[list] = None
    forensics_details: Optional[dict] = None

    # Fraud
    fraud_probability: Optional[float] = None
    risk_level: Optional[str] = None
    fraud_indicators: Optional[list] = None
    is_fraud: Optional[bool] = None

    # Meta
    analysis_complete: bool = False
    processing_time_ms: Optional[float] = None
    error_message: Optional[str] = None
    created_at: datetime

    model_config = {"from_attributes": True}


class ScanListResponse(BaseModel):
    items: List[ScanResponse]
    total: int
    page: int
    page_size: int


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _ensure_upload_dir():
    os.makedirs(UPLOAD_DIR, exist_ok=True)


def _safe_filename(original: str) -> str:
    ext = os.path.splitext(original)[1].lower()
    return f"{uuid.uuid4().hex}{ext}"


# ---------------------------------------------------------------------------
# Endpoints
# ---------------------------------------------------------------------------

@router.post(
    "/invoice",
    response_model=ScanResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Upload invoice image/PDF for OCR + fraud detection",
)
async def scan_invoice(
    file: UploadFile = File(..., description="Invoice image or PDF"),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    # --- Validate file ---
    ext = os.path.splitext(file.filename or "")[1].lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"File type '{ext}' not supported. Allowed: {', '.join(ALLOWED_EXTENSIONS)}",
        )

    content = await file.read()
    file_size_mb = len(content) / (1024 * 1024)
    if file_size_mb > MAX_FILE_SIZE_MB:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=f"File too large ({file_size_mb:.1f} MB). Maximum: {MAX_FILE_SIZE_MB} MB",
        )

    # --- Save file ---
    _ensure_upload_dir()
    safe_name = _safe_filename(file.filename or "invoice")
    file_path = os.path.join(UPLOAD_DIR, safe_name)
    with open(file_path, "wb") as f:
        f.write(content)

    # --- Create DB record ---
    scan = InvoiceScan(
        id=str(uuid.uuid4()),
        user_id=current_user.id,
        filename=file.filename or safe_name,
        file_path=file_path,
        file_size=len(content),
        file_type=ext.lstrip("."),
        analysis_complete=False,
        created_at=datetime.utcnow(),
    )
    db.add(scan)
    await db.flush()

    # --- Run analysis ---
    try:
        scan = await _fraud_service.analyze_invoice(scan, file_path, db)
    except Exception as exc:
        logger.error("Invoice analysis error: %s", exc)
        scan.error_message = str(exc)
        await db.commit()

    await db.refresh(scan)
    return ScanResponse.model_validate(scan)


@router.get(
    "/history",
    response_model=ScanListResponse,
    summary="List all invoice scans for current user",
)
async def list_scans(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    from sqlalchemy import func

    offset = (page - 1) * page_size
    count_result = await db.execute(
        select(func.count()).select_from(
            select(InvoiceScan).where(InvoiceScan.user_id == current_user.id).subquery()
        )
    )
    total = count_result.scalar() or 0

    result = await db.execute(
        select(InvoiceScan)
        .where(InvoiceScan.user_id == current_user.id)
        .order_by(desc(InvoiceScan.created_at))
        .offset(offset)
        .limit(page_size)
    )
    scans = result.scalars().all()

    return ScanListResponse(
        items=[ScanResponse.model_validate(s) for s in scans],
        total=total,
        page=page,
        page_size=page_size,
    )


@router.get(
    "/{scan_id}",
    response_model=ScanResponse,
    summary="Get a specific invoice scan by ID",
)
async def get_scan(
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
    return ScanResponse.model_validate(scan)
