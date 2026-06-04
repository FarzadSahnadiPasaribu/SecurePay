import re
import numpy as np
from datetime import datetime
from typing import Optional


PAYMENT_METHOD_MAP = {
    "QRIS": 0, "BCA": 1, "BNI": 2, "Mandiri": 3, "BRI": 4,
    "GoPay": 5, "OVO": 6, "Dana": 7, "ShopeePay": 8,
    "LinkAja": 9, "Cash": 10, "Transfer": 11, "Other": 12,
}

IDR_PATTERN = re.compile(
    r"(?:Rp\.?\s*|IDR\s*)"
    r"(\d{1,3}(?:[.,]\d{3})*(?:[.,]\d{2})?|\d+)"
    r"(?:\s*(?:,-|,00))?",
    re.IGNORECASE,
)


def normalize_amount(amount: float) -> float:
    """Normalize IDR amount to log scale for ML processing."""
    if amount <= 0:
        return 0.0
    return float(np.log1p(amount))


def encode_payment_method(method: str) -> int:
    """Encode payment method string to integer."""
    for key, val in PAYMENT_METHOD_MAP.items():
        if key.lower() in method.lower():
            return val
    return PAYMENT_METHOD_MAP["Other"]


def parse_idr_amount(text: str) -> Optional[float]:
    """Parse IDR amount from text string."""
    matches = IDR_PATTERN.findall(text)
    if not matches:
        # fallback: find plain number sequences
        plain = re.findall(r"\b\d{4,12}\b", text)
        if plain:
            return float(plain[0].replace(",", "").replace(".", ""))
        return None

    best = None
    for match in matches:
        cleaned = re.sub(r"[.,](\d{3})", r"\1", match)
        cleaned = cleaned.replace(",", ".").replace(" ", "")
        try:
            val = float(cleaned)
            if best is None or val > best:
                best = val
        except ValueError:
            continue
    return best


def preprocess_transaction(transaction: dict) -> dict:
    """
    Clean and normalize a raw transaction dict.
    Ensures all required fields exist with sensible defaults.
    """
    now = datetime.utcnow()

    # Parse transaction_time
    txn_time = transaction.get("transaction_time")
    if isinstance(txn_time, str):
        try:
            txn_time = datetime.fromisoformat(txn_time.replace("Z", "+00:00"))
        except (ValueError, AttributeError):
            txn_time = now
    elif not isinstance(txn_time, datetime):
        txn_time = now

    amount = float(transaction.get("amount", 0) or 0)
    payment_method = str(transaction.get("payment_method", "Other") or "Other")

    return {
        "id": transaction.get("id", ""),
        "amount": amount,
        "amount_log": normalize_amount(amount),
        "merchant_name": str(transaction.get("merchant_name", "") or ""),
        "payment_method": payment_method,
        "payment_method_encoded": encode_payment_method(payment_method),
        "transaction_time": txn_time,
        "hour": txn_time.hour,
        "day_of_week": txn_time.weekday(),
        "is_weekend": int(txn_time.weekday() >= 5),
        "device_id": str(transaction.get("device_id", "") or ""),
        "location": str(transaction.get("location", "") or ""),
        "sender": str(transaction.get("sender", "") or ""),
        "receiver": str(transaction.get("receiver", "") or ""),
    }


def compute_velocity_features(transactions: list[dict], current: dict) -> dict:
    """
    Compute velocity-based features comparing current transaction
    against recent history.
    """
    if not transactions:
        return {
            "txn_count_1h": 0,
            "txn_count_24h": 0,
            "avg_amount_7d": 0.0,
            "amount_deviation": 0.0,
            "duplicate_flag": 0,
        }

    now = current.get("transaction_time", datetime.utcnow())
    if isinstance(now, str):
        try:
            now = datetime.fromisoformat(now)
        except ValueError:
            now = datetime.utcnow()

    amounts = []
    count_1h = 0
    count_24h = 0
    duplicate = 0

    for t in transactions:
        t_time = t.get("transaction_time", now)
        if isinstance(t_time, str):
            try:
                t_time = datetime.fromisoformat(t_time)
            except ValueError:
                t_time = now

        diff_seconds = abs((now - t_time).total_seconds())
        if diff_seconds < 3600:
            count_1h += 1
        if diff_seconds < 86400:
            count_24h += 1
        if diff_seconds < 7 * 86400:
            amounts.append(float(t.get("amount", 0) or 0))

        # Duplicate detection
        same_amount = abs(float(t.get("amount", 0) or 0) - float(current.get("amount", 0) or 0)) < 1
        same_merchant = str(t.get("merchant_name", "")).lower() == str(current.get("merchant_name", "")).lower()
        if same_amount and same_merchant and diff_seconds < 300:
            duplicate = 1

    avg_amount = float(np.mean(amounts)) if amounts else 0.0
    cur_amount = float(current.get("amount", 0) or 0)
    amount_dev = abs(cur_amount - avg_amount) / (avg_amount + 1e-6) if avg_amount > 0 else 0.0

    return {
        "txn_count_1h": count_1h,
        "txn_count_24h": count_24h,
        "avg_amount_7d": avg_amount,
        "amount_deviation": amount_dev,
        "duplicate_flag": duplicate,
    }
