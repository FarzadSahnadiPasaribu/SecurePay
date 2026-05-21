import uuid
from datetime import datetime
from sqlalchemy import String, DateTime, Float, Boolean, Text, ForeignKey, JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship
from models.database import Base


class InvoiceScan(Base):
    __tablename__ = "invoice_scans"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id"), nullable=False, index=True)

    # File info
    filename: Mapped[str] = mapped_column(String(255), nullable=False)
    file_path: Mapped[str] = mapped_column(String(512), nullable=True)
    file_size: Mapped[int] = mapped_column(Float, nullable=True)
    file_type: Mapped[str] = mapped_column(String(50), nullable=True)  # image/pdf

    # OCR extracted data
    ocr_raw_text: Mapped[str] = mapped_column(Text, nullable=True)
    extracted_amount: Mapped[float] = mapped_column(Float, nullable=True)
    extracted_date: Mapped[str] = mapped_column(String(50), nullable=True)
    extracted_merchant: Mapped[str] = mapped_column(String(255), nullable=True)
    extracted_account: Mapped[str] = mapped_column(String(100), nullable=True)
    extracted_payment_method: Mapped[str] = mapped_column(String(50), nullable=True)
    extracted_transaction_id: Mapped[str] = mapped_column(String(100), nullable=True)
    ocr_confidence: Mapped[float] = mapped_column(Float, nullable=True)

    # Image forensics
    manipulation_score: Mapped[float] = mapped_column(Float, nullable=True)
    manipulation_detected: Mapped[bool] = mapped_column(Boolean, default=False)
    suspicious_regions: Mapped[dict] = mapped_column(JSON, nullable=True, default=list)
    forensics_details: Mapped[dict] = mapped_column(JSON, nullable=True, default=dict)

    # Fraud analysis
    fraud_probability: Mapped[float] = mapped_column(Float, nullable=True, default=0.0)
    risk_level: Mapped[str] = mapped_column(String(20), nullable=True, default="NORMAL")
    fraud_indicators: Mapped[dict] = mapped_column(JSON, nullable=True, default=list)
    is_fraud: Mapped[bool] = mapped_column(Boolean, default=False)

    # Analysis metadata
    analysis_complete: Mapped[bool] = mapped_column(Boolean, default=False)
    processing_time_ms: Mapped[float] = mapped_column(Float, nullable=True)
    error_message: Mapped[str] = mapped_column(Text, nullable=True)

    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    user: Mapped["User"] = relationship("User", back_populates="invoice_scans")

    def __repr__(self):
        return f"<InvoiceScan id={self.id} file={self.filename} risk={self.risk_level}>"
