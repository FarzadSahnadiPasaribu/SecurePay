"""
Analytics endpoints: dashboard stats, ML model metrics, distributions.
"""
import logging
from typing import Optional, List, Dict, Any
from datetime import datetime, timedelta

from fastapi import APIRouter, Depends, Query
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, desc

from models.database import get_db
from models.user import User
from models.transaction import Transaction
from models.invoice_scan import InvoiceScan
from models.fraud_analysis import FraudAnalysis
from services.auth_service import get_current_user

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/analytics", tags=["Analytics"])


# ---------------------------------------------------------------------------
# Pydantic schemas
# ---------------------------------------------------------------------------

class RiskDistribution(BaseModel):
    HIGH: int = 0
    MEDIUM: int = 0
    LOW: int = 0
    NORMAL: int = 0


class TimeSeriesPoint(BaseModel):
    date: str
    total: int
    fraud: int


class ModelScore(BaseModel):
    precision: float
    recall: float
    f1_score: float
    auc_roc: float


class ConfusionMatrix(BaseModel):
    true_positive: int
    false_positive: int
    true_negative: int
    false_negative: int


class ModelMetrics(BaseModel):
    isolation_forest: ModelScore
    lof: ModelScore
    one_class_svm: ModelScore
    ensemble: ModelScore
    confusion_matrix: ConfusionMatrix
    models_loaded: bool
    model_version: str


class DashboardData(BaseModel):
    total_transactions: int
    fraud_transactions: int
    fraud_rate: float
    total_scans: int
    fraud_scans: int
    high_risk: int
    medium_risk: int
    low_risk: int
    normal: int
    total_amount: float
    fraud_amount: float
    avg_fraud_probability: float
    time_series: List[TimeSeriesPoint]
    risk_distribution: RiskDistribution
    top_fraud_merchants: List[Dict[str, Any]]
    payment_method_fraud: List[Dict[str, Any]]


class DistributionData(BaseModel):
    amount_histogram: List[Dict[str, Any]]
    hour_distribution: List[Dict[str, Any]]
    payment_method_distribution: List[Dict[str, Any]]
    fraud_type_distribution: List[Dict[str, Any]]


class CorrelationData(BaseModel):
    features: List[str]
    matrix: List[List[float]]


# ---------------------------------------------------------------------------
# Endpoints
# ---------------------------------------------------------------------------

@router.get(
    "/dashboard",
    response_model=DashboardData,
    summary="Get comprehensive dashboard statistics",
)
async def get_dashboard(
    days: int = Query(30, ge=1, le=365, description="Number of days to include"),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    cutoff = datetime.utcnow() - timedelta(days=days)

    # Transactions
    txn_result = await db.execute(
        select(Transaction)
        .where(
            Transaction.user_id == current_user.id,
            Transaction.created_at >= cutoff,
        )
    )
    txns = txn_result.scalars().all()

    # Invoice scans
    scan_result = await db.execute(
        select(InvoiceScan)
        .where(
            InvoiceScan.user_id == current_user.id,
            InvoiceScan.created_at >= cutoff,
        )
    )
    scans = scan_result.scalars().all()

    total = len(txns)
    fraud_txns = [t for t in txns if t.is_fraud]
    fraud_count = len(fraud_txns)

    risk_dist = RiskDistribution(
        HIGH=sum(1 for t in txns if t.risk_level == "HIGH"),
        MEDIUM=sum(1 for t in txns if t.risk_level == "MEDIUM"),
        LOW=sum(1 for t in txns if t.risk_level == "LOW"),
        NORMAL=sum(1 for t in txns if t.risk_level in ("NORMAL", None)),
    )

    total_amount = sum(t.amount for t in txns)
    fraud_amount = sum(t.amount for t in fraud_txns)
    avg_prob = (
        sum(t.fraud_probability or 0 for t in txns) / total if total > 0 else 0.0
    )

    # Build 7-day time series
    time_series = []
    for i in range(min(days, 30) - 1, -1, -1):
        day = datetime.utcnow() - timedelta(days=i)
        day_str = day.strftime("%Y-%m-%d")
        day_txns = [
            t for t in txns
            if t.created_at.date() == day.date()
        ]
        day_fraud = sum(1 for t in day_txns if t.is_fraud)
        time_series.append(TimeSeriesPoint(
            date=day_str,
            total=len(day_txns),
            fraud=day_fraud,
        ))

    # Top fraud merchants
    merchant_fraud: Dict[str, int] = {}
    for t in fraud_txns:
        merchant_fraud[t.merchant_name] = merchant_fraud.get(t.merchant_name, 0) + 1
    top_merchants = [
        {"merchant": k, "fraud_count": v}
        for k, v in sorted(merchant_fraud.items(), key=lambda x: -x[1])[:5]
    ]

    # Payment method fraud rate
    method_total: Dict[str, int] = {}
    method_fraud: Dict[str, int] = {}
    for t in txns:
        method_total[t.payment_method] = method_total.get(t.payment_method, 0) + 1
        if t.is_fraud:
            method_fraud[t.payment_method] = method_fraud.get(t.payment_method, 0) + 1
    pm_fraud = [
        {
            "method": m,
            "total": method_total[m],
            "fraud": method_fraud.get(m, 0),
            "rate": round(method_fraud.get(m, 0) / method_total[m] * 100, 1),
        }
        for m in method_total
    ]

    return DashboardData(
        total_transactions=total,
        fraud_transactions=fraud_count,
        fraud_rate=round(fraud_count / total * 100, 2) if total else 0.0,
        total_scans=len(scans),
        fraud_scans=sum(1 for s in scans if s.is_fraud),
        high_risk=risk_dist.HIGH,
        medium_risk=risk_dist.MEDIUM,
        low_risk=risk_dist.LOW,
        normal=risk_dist.NORMAL,
        total_amount=total_amount,
        fraud_amount=fraud_amount,
        avg_fraud_probability=round(avg_prob, 4),
        time_series=time_series[-30:],
        risk_distribution=risk_dist,
        top_fraud_merchants=top_merchants,
        payment_method_fraud=pm_fraud,
    )


@router.get(
    "/model-metrics",
    response_model=ModelMetrics,
    summary="Get ML model performance metrics",
)
async def get_model_metrics(current_user: User = Depends(get_current_user)):
    from anomaly_detection.detector import FraudDetector
    detector = FraudDetector()
    metrics = detector.get_model_metrics()

    return ModelMetrics(
        isolation_forest=ModelScore(**metrics["isolation_forest"]),
        lof=ModelScore(**metrics["lof"]),
        one_class_svm=ModelScore(**metrics["one_class_svm"]),
        ensemble=ModelScore(**metrics["ensemble"]),
        confusion_matrix=ConfusionMatrix(**metrics["confusion_matrix"]),
        models_loaded=metrics["models_loaded"],
        model_version=metrics["model_version"],
    )


@router.get(
    "/distribution",
    response_model=DistributionData,
    summary="Get feature and class distributions",
)
async def get_distribution(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Transaction).where(Transaction.user_id == current_user.id).limit(500)
    )
    txns = result.scalars().all()

    # Amount histogram (log-based buckets)
    buckets = [
        ("< 50K", 0, 50_000),
        ("50K–200K", 50_000, 200_000),
        ("200K–1M", 200_000, 1_000_000),
        ("1M–5M", 1_000_000, 5_000_000),
        ("> 5M", 5_000_000, float("inf")),
    ]
    amount_hist = [
        {"range": label, "count": sum(1 for t in txns if lo <= t.amount < hi)}
        for label, lo, hi in buckets
    ]

    # Hour distribution
    hour_dist = [{"hour": h, "count": sum(1 for t in txns if t.transaction_time.hour == h)} for h in range(24)]

    # Payment method distribution
    method_counts: Dict[str, int] = {}
    for t in txns:
        method_counts[t.payment_method] = method_counts.get(t.payment_method, 0) + 1
    pm_dist = [{"method": k, "count": v} for k, v in sorted(method_counts.items(), key=lambda x: -x[1])]

    # Fraud type distribution
    fraud_type_counts: Dict[str, int] = {}
    for t in txns:
        if t.is_fraud and t.fraud_type:
            fraud_type_counts[t.fraud_type] = fraud_type_counts.get(t.fraud_type, 0) + 1
    ft_dist = [{"type": k, "count": v} for k, v in sorted(fraud_type_counts.items(), key=lambda x: -x[1])]

    return DistributionData(
        amount_histogram=amount_hist,
        hour_distribution=hour_dist,
        payment_method_distribution=pm_dist,
        fraud_type_distribution=ft_dist,
    )


@router.get(
    "/correlation",
    response_model=CorrelationData,
    summary="Get feature correlation matrix",
)
async def get_correlation(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Returns a correlation matrix for the key transaction features."""
    import numpy as np

    result = await db.execute(
        select(Transaction).where(Transaction.user_id == current_user.id).limit(200)
    )
    txns = result.scalars().all()

    features = ["amount", "hour", "day_of_week", "is_weekend", "fraud_probability"]

    if not txns:
        n = len(features)
        matrix = [[1.0 if i == j else 0.0 for j in range(n)] for i in range(n)]
        return CorrelationData(features=features, matrix=matrix)

    data = np.array([
        [
            t.amount,
            t.transaction_time.hour,
            t.transaction_time.weekday(),
            int(t.transaction_time.weekday() >= 5),
            t.fraud_probability or 0.0,
        ]
        for t in txns
    ])

    if data.shape[0] > 1:
        corr = np.corrcoef(data.T)
        corr = np.nan_to_num(corr, nan=0.0)
        matrix = [[round(float(v), 4) for v in row] for row in corr]
    else:
        n = len(features)
        matrix = [[1.0 if i == j else 0.0 for j in range(n)] for i in range(n)]

    return CorrelationData(features=features, matrix=matrix)
