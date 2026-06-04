import uuid
from datetime import datetime
from sqlalchemy import String, DateTime, Float, Boolean, Text, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from models.database import Base


class Transaction(Base):
    __tablename__ = "transactions"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id"), nullable=False, index=True)

    # Core transaction data
    amount: Mapped[float] = mapped_column(Float, nullable=False)
    merchant_name: Mapped[str] = mapped_column(String(255), nullable=False)
    payment_method: Mapped[str] = mapped_column(String(50), nullable=False)
    transaction_time: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    device_id: Mapped[str] = mapped_column(String(100), nullable=True)
    location: Mapped[str] = mapped_column(String(255), nullable=True)
    sender: Mapped[str] = mapped_column(String(255), nullable=True)
    receiver: Mapped[str] = mapped_column(String(255), nullable=True)
    transaction_id_external: Mapped[str] = mapped_column(String(100), nullable=True)
    description: Mapped[str] = mapped_column(Text, nullable=True)

    # Fraud detection results
    is_fraud: Mapped[bool] = mapped_column(Boolean, default=False, nullable=True)
    fraud_type: Mapped[str] = mapped_column(String(100), nullable=True)
    fraud_probability: Mapped[float] = mapped_column(Float, nullable=True)
    anomaly_score: Mapped[float] = mapped_column(Float, nullable=True)
    risk_level: Mapped[str] = mapped_column(String(20), nullable=True)  # NORMAL, LOW, MEDIUM, HIGH

    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user: Mapped["User"] = relationship("User", back_populates="transactions")
    fraud_analysis: Mapped[list] = relationship("FraudAnalysis", back_populates="transaction", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<Transaction id={self.id} amount={self.amount} merchant={self.merchant_name}>"
