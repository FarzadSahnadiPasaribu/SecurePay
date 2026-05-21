import numpy as np
from datetime import datetime
from typing import Optional


FEATURE_COLUMNS = [
    "amount_log",
    "hour",
    "day_of_week",
    "is_weekend",
    "payment_method_encoded",
    "is_night",
    "is_early_morning",
    "is_large_amount",
    "is_round_amount",
    "amount_normalized",
]


def compute_time_features(hour: int, day_of_week: int) -> dict:
    """Derive time-based risk features."""
    is_night = int(22 <= hour or hour < 6)
    is_early_morning = int(2 <= hour < 5)
    is_business_hours = int(8 <= hour < 18)
    is_weekend = int(day_of_week >= 5)
    return {
        "is_night": is_night,
        "is_early_morning": is_early_morning,
        "is_business_hours": is_business_hours,
        "is_weekend": is_weekend,
    }


def compute_amount_features(amount: float) -> dict:
    """Derive amount-based risk features."""
    is_large = int(amount > 5_000_000)
    is_very_large = int(amount > 50_000_000)
    is_round = int(amount % 100_000 == 0 and amount > 0)
    is_micro = int(0 < amount < 1_000)
    amount_log = float(np.log1p(amount))
    # Normalize against common UMKM range (10k – 5M IDR)
    amount_norm = min(1.0, amount / 5_000_000)
    return {
        "amount_log": amount_log,
        "is_large_amount": is_large,
        "is_very_large_amount": is_very_large,
        "is_round_amount": is_round,
        "is_micro_amount": is_micro,
        "amount_normalized": amount_norm,
    }


def extract_features(transaction: dict) -> np.ndarray:
    """
    Convert a preprocessed transaction dict into a fixed-length feature vector
    suitable for ML models.

    Returns a 1-D numpy array of shape (len(FEATURE_COLUMNS),).
    """
    amount = float(transaction.get("amount", 0) or 0)
    hour = int(transaction.get("hour", 12))
    day_of_week = int(transaction.get("day_of_week", 0))
    payment_encoded = int(transaction.get("payment_method_encoded", 12))

    time_feats = compute_time_features(hour, day_of_week)
    amount_feats = compute_amount_features(amount)

    feature_vec = [
        amount_feats["amount_log"],
        hour,
        day_of_week,
        time_feats["is_weekend"],
        payment_encoded,
        time_feats["is_night"],
        time_feats["is_early_morning"],
        amount_feats["is_large_amount"],
        amount_feats["is_round_amount"],
        amount_feats["amount_normalized"],
    ]

    return np.array(feature_vec, dtype=np.float32)


def build_feature_dataframe(transactions: list[dict]):
    """Build a pandas DataFrame of features from a list of transactions."""
    import pandas as pd
    rows = []
    for t in transactions:
        vec = extract_features(t)
        rows.append(vec)
    return pd.DataFrame(rows, columns=FEATURE_COLUMNS)
