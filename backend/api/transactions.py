"""
Transaction CRUD endpoints with automatic fraud detection on creation.
"""
import uuid
import logging
from datetime import datetime
from typing import Optional, List

from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel, Field
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, desc

from models.database import get_db
from models.user import User
from models.transaction import Transaction
from models.fraud_analysis import FraudAnalysis
from services.auth_service import get_current_user
from services.fraud_service import FraudService

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/transactions", tags=["Transactions"])

_fraud_service = FraudService()


# ---------------------------------------------------------------------------
# Pydantic schemas
# ---------------------------------------------------------------------------

class TransactionCreate(BaseModel):
    amount: float = Field(..., gt=0, description="Transaction amount in IDR")
    merchant_name: str = Field(..., min_length=1, max_length=255)
    payment_method: str = Field(..., description="QRIS, BCA, GoPay, etc.")
    transaction_time: Optional[datetime] = None
    device_id: Optional[str] = None
    location: Optional[str] = None
    sender: Optional[str] = None
    receiver: Optional[str] = None
    description: Optional[str] = None

    model_config = {
        "json_schema_extra": {
            "example": {
                "amount": 250000,
                "merchant_name": "Warung Pak Budi",
                "payment_method": "QRIS",
                "location": "Jakarta Selatan",
                "sender": "Andi Wijaya",
                "receiver": "Pak Budi",
            }
        }
    }


class FraudAnalysisResponse(BaseModel):
    id: str
    fraud_probability: float
    risk_level: str
    is_anomaly: bool
    fraud_indicators: list
    recommendations: list
    isolation_forest_score: Optional[float] = None
    lof_score: Optional[float] = None
    svm_score: Optional[float] = None
    ensemble_score: Optional[float] = None
    analysis_duration_ms: Optional[float] = None
    model_version: Optional[str] = None

    model_config = {"from_attributes": True, "protected_namespaces": ()}


class TransactionResponse(BaseModel):
    id: str
    amount: float
    merchant_name: str
    payment_method: str
    transaction_time: datetime
    device_id: Optional[str] = None
    location: Optional[str] = None
    sender: Optional[str] = None
    receiver: Optional[str] = None
    description: Optional[str] = None
    is_fraud: Optional[bool] = None
    fraud_type: Optional[str] = None
    fraud_probability: Optional[float] = None
    anomaly_score: Optional[float] = None
    risk_level: Optional[str] = None
    created_at: datetime

    model_config = {"from_attributes": True}


class TransactionWithAnalysis(TransactionResponse):
    fraud_analysis: Optional[FraudAnalysisResponse] = None


class PaginatedTransactions(BaseModel):
    items: List[TransactionResponse]
    total: int
    page: int
    page_size: int
    total_pages: int


class DashboardStats(BaseModel):
    total_transactions: int
    fraud_count: int
    fraud_rate: float
    high_risk_count: int
    medium_risk_count: int
    low_risk_count: int
    normal_count: int
    total_amount: float
    fraud_amount: float
    recent_fraud: List[TransactionResponse]


# ---------------------------------------------------------------------------
# Endpoints
# ---------------------------------------------------------------------------

@router.post(
    "/",
    response_model=TransactionWithAnalysis,
    status_code=status.HTTP_201_CREATED,
    summary="Add a new transaction and auto-analyze for fraud",
)
async def create_transaction(
    payload: TransactionCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    txn = Transaction(
        id=str(uuid.uuid4()),
        user_id=current_user.id,
        amount=payload.amount,
        merchant_name=payload.merchant_name,
        payment_method=payload.payment_method,
        transaction_time=payload.transaction_time or datetime.utcnow(),
        device_id=payload.device_id,
        location=payload.location,
        sender=payload.sender,
        receiver=payload.receiver,
        description=payload.description,
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow(),
    )

    db.add(txn)
    await db.flush()  # get the ID without committing

    analysis = None
    try:
        analysis = await _fraud_service.analyze_transaction(txn, db)
    except Exception as exc:
        logger.error("Fraud analysis failed for transaction %s: %s", txn.id, exc)
        await db.commit()

    # Build response manually to avoid lazy-load in serialization
    txn_data = {
        "id": txn.id,
        "amount": txn.amount,
        "merchant_name": txn.merchant_name,
        "payment_method": txn.payment_method,
        "transaction_time": txn.transaction_time,
        "device_id": txn.device_id,
        "location": txn.location,
        "sender": txn.sender,
        "receiver": txn.receiver,
        "description": txn.description,
        "is_fraud": txn.is_fraud,
        "fraud_type": txn.fraud_type,
        "fraud_probability": txn.fraud_probability,
        "anomaly_score": txn.anomaly_score,
        "risk_level": txn.risk_level,
        "created_at": txn.created_at,
    }
    response = TransactionWithAnalysis(**txn_data)
    if analysis:
        response.fraud_analysis = FraudAnalysisResponse.model_validate(analysis)
    return response


@router.get(
    "/",
    response_model=PaginatedTransactions,
    summary="List transactions with pagination",
)
async def list_transactions(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    risk_level: Optional[str] = Query(None, description="Filter by risk level"),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    offset = (page - 1) * page_size

    query = select(Transaction).where(Transaction.user_id == current_user.id)
    if risk_level:
        query = query.where(Transaction.risk_level == risk_level.upper())
    query = query.order_by(desc(Transaction.created_at))

    count_q = select(func.count()).select_from(
        select(Transaction).where(Transaction.user_id == current_user.id).subquery()
    )
    total = (await db.execute(count_q)).scalar() or 0

    result = await db.execute(query.offset(offset).limit(page_size))
    items = result.scalars().all()

    return PaginatedTransactions(
        items=[TransactionResponse.model_validate(t) for t in items],
        total=total,
        page=page,
        page_size=page_size,
        total_pages=max(1, -(-total // page_size)),
    )


@router.get(
    "/stats/summary",
    response_model=DashboardStats,
    summary="Get dashboard statistics for current user",
)
async def get_stats(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Transaction).where(Transaction.user_id == current_user.id)
    )
    txns = result.scalars().all()

    total = len(txns)
    fraud = [t for t in txns if t.is_fraud]
    fraud_count = len(fraud)
    high_risk = sum(1 for t in txns if t.risk_level == "HIGH")
    medium_risk = sum(1 for t in txns if t.risk_level == "MEDIUM")
    low_risk = sum(1 for t in txns if t.risk_level == "LOW")
    normal = sum(1 for t in txns if t.risk_level == "NORMAL" or not t.risk_level)
    total_amount = sum(t.amount for t in txns)
    fraud_amount = sum(t.amount for t in fraud)

    recent_fraud_result = await db.execute(
        select(Transaction)
        .where(Transaction.user_id == current_user.id, Transaction.is_fraud == True)
        .order_by(desc(Transaction.created_at))
        .limit(5)
    )
    recent_fraud = recent_fraud_result.scalars().all()

    return DashboardStats(
        total_transactions=total,
        fraud_count=fraud_count,
        fraud_rate=round(fraud_count / total * 100, 2) if total else 0.0,
        high_risk_count=high_risk,
        medium_risk_count=medium_risk,
        low_risk_count=low_risk,
        normal_count=normal,
        total_amount=total_amount,
        fraud_amount=fraud_amount,
        recent_fraud=[TransactionResponse.model_validate(t) for t in recent_fraud],
    )


@router.get(
    "/{transaction_id}",
    response_model=TransactionWithAnalysis,
    summary="Get a single transaction with fraud analysis",
)
async def get_transaction(
    transaction_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Transaction).where(
            Transaction.id == transaction_id,
            Transaction.user_id == current_user.id,
        )
    )
    txn = result.scalar_one_or_none()
    if not txn:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Transaction not found")

    analysis_result = await db.execute(
        select(FraudAnalysis)
        .where(FraudAnalysis.transaction_id == transaction_id)
        .order_by(desc(FraudAnalysis.created_at))
        .limit(1)
    )
    analysis = analysis_result.scalar_one_or_none()

    txn_data = {
        "id": txn.id,
        "amount": txn.amount,
        "merchant_name": txn.merchant_name,
        "payment_method": txn.payment_method,
        "transaction_time": txn.transaction_time,
        "device_id": txn.device_id,
        "location": txn.location,
        "sender": txn.sender,
        "receiver": txn.receiver,
        "description": txn.description,
        "is_fraud": txn.is_fraud,
        "fraud_type": txn.fraud_type,
        "fraud_probability": txn.fraud_probability,
        "anomaly_score": txn.anomaly_score,
        "risk_level": txn.risk_level,
        "created_at": txn.created_at,
    }
    response = TransactionWithAnalysis(**txn_data)
    if analysis:
        response.fraud_analysis = FraudAnalysisResponse.model_validate(analysis)
    return response
