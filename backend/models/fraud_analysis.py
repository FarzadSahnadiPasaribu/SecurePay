import uuid
from datetime import datetime
from sqlalchemy import String, DateTime, Float, Boolean, Text, ForeignKey, JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship
from models.database import Base


class FraudAnalysis(Base):
    __tablename__ = "fraud_analyses"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    transaction_id: Mapped[str] = mapped_column(String(36), ForeignKey("transactions.id"), nullable=False, index=True)

    # ML model scores
    isolation_forest_score: Mapped[float] = mapped_column(Float, nullable=True)
    lof_score: Mapped[float] = mapped_column(Float, nullable=True)
    svm_score: Mapped[float] = mapped_column(Float, nullable=True)
    ensemble_score: Mapped[float] = mapped_column(Float, nullable=True)

    # Final verdict
    fraud_probability: Mapped[float] = mapped_column(Float, nullable=False, default=0.0)
    risk_level: Mapped[str] = mapped_column(String(20), nullable=False, default="NORMAL")
    is_anomaly: Mapped[bool] = mapped_column(Boolean, default=False)

    # Detailed indicators stored as JSON
    fraud_indicators: Mapped[dict] = mapped_column(JSON, nullable=True, default=list)
    feature_importance: Mapped[dict] = mapped_column(JSON, nullable=True, default=dict)
    recommendations: Mapped[dict] = mapped_column(JSON, nullable=True, default=list)

    # Model metadata
    model_version: Mapped[str] = mapped_column(String(50), nullable=True, default="1.0.0")
    analysis_duration_ms: Mapped[float] = mapped_column(Float, nullable=True)

    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    transaction: Mapped["Transaction"] = relationship("Transaction", back_populates="fraud_analysis")

    class Config:
        protected_namespaces = ()

    def __repr__(self):
        return f"<FraudAnalysis id={self.id} risk={self.risk_level} prob={self.fraud_probability:.2f}>"
