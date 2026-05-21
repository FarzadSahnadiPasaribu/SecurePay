"""
Generate a synthetic UMKM transaction dataset for training and demo purposes.
Produces dataset/transactions.csv with 1000 rows (80% normal, 20% fraud).
"""
import os
import csv
import uuid
import random
from datetime import datetime, timedelta
from typing import Optional

DATASET_DIR = os.path.join(os.path.dirname(__file__), "..", "..", "dataset")
DATASET_PATH = os.path.join(DATASET_DIR, "transactions.csv")

# ---------------------------------------------------------------------------
# Reference data
# ---------------------------------------------------------------------------

MERCHANTS = [
    "Warung Pak Budi", "Toko Online Bu Sari", "Jasa Print Pak Hendra",
    "Bengkel Motor Mas Agus", "Warung Makan Bu Tini", "Toko Baju Murah Pak Rahmat",
    "Supermarket Berkah Jaya", "Apotek Sehat Sejahtera", "Minimarket Bu Endah",
    "Toko Elektronik Mas Dedi", "Laundry Kilat Bu Wati", "Bakso Pak Soleh",
    "Kios Pulsa Mas Feri", "Toko Sembako Bu Yanti", "Warung Kopi Mas Rizky",
    "Toko Buah Bu Lastri", "Salon Cantik Bu Dewi", "Bengkel Las Pak Slamet",
    "Konter HP Bu Nurul", "Toko Alat Tulis Mas Erwan",
]

PAYMENT_METHODS = ["QRIS", "BCA", "BNI", "Mandiri", "BRI", "GoPay", "OVO", "Dana", "ShopeePay", "LinkAja"]

LOCATIONS = [
    "Jakarta Selatan", "Jakarta Pusat", "Jakarta Utara", "Jakarta Barat", "Jakarta Timur",
    "Surabaya", "Bandung", "Medan", "Yogyakarta", "Semarang",
    "Makassar", "Palembang", "Depok", "Bekasi", "Tangerang",
]

FIRST_NAMES = [
    "Andi", "Budi", "Citra", "Dewi", "Eko", "Fajar", "Gilang", "Hani",
    "Irwan", "Joko", "Kartini", "Lina", "Mira", "Nanda", "Oka",
    "Putri", "Reza", "Sari", "Tono", "Umi", "Vina", "Wahyu", "Xena",
    "Yanto", "Zahra",
]

LAST_NAMES = [
    "Santoso", "Wijaya", "Suharto", "Kusuma", "Prasetyo", "Hidayat",
    "Susanto", "Wibowo", "Nugroho", "Rahayu", "Setiawan", "Handoko",
    "Firmansyah", "Kurniawan", "Saputra", "Lestari", "Ariani", "Purnama",
]

DEVICE_PREFIXES = ["ANDROID-", "IOS-", "WEB-"]

FRAUD_TYPES = [
    "duplicate",
    "amount_anomaly",
    "suspicious_pattern",
    "invoice_manipulation",
    "identity_fraud",
]


def random_name() -> str:
    return f"{random.choice(FIRST_NAMES)} {random.choice(LAST_NAMES)}"


def random_device() -> str:
    return f"{random.choice(DEVICE_PREFIXES)}{uuid.uuid4().hex[:8].upper()}"


def normal_amount() -> float:
    """Return a realistic UMKM transaction amount in IDR."""
    ranges = [
        (10_000, 100_000, 0.40),    # small purchase
        (100_000, 500_000, 0.35),   # medium purchase
        (500_000, 2_000_000, 0.18), # larger purchase
        (2_000_000, 5_000_000, 0.07),
    ]
    r = random.random()
    cumulative = 0
    for lo, hi, prob in ranges:
        cumulative += prob
        if r < cumulative:
            return round(random.uniform(lo, hi), -3)  # round to nearest 1000
    return round(random.uniform(10_000, 5_000_000), -3)


def fraud_amount(fraud_type: str) -> float:
    if fraud_type == "amount_anomaly":
        return round(random.uniform(50_000_000, 200_000_000), -3)
    if fraud_type == "duplicate":
        return round(random.uniform(100_000, 1_000_000), -3)
    return normal_amount()


def random_datetime(
    start: datetime,
    end: datetime,
    fraud_type: Optional[str] = None,
) -> datetime:
    delta = (end - start).total_seconds()
    t = start + timedelta(seconds=random.uniform(0, delta))

    if fraud_type == "suspicious_pattern":
        # Force 2–4 AM
        t = t.replace(hour=random.randint(2, 4), minute=random.randint(0, 59))

    return t


def generate_dataset(n: int = 1000, fraud_rate: float = 0.20, seed: int = 42) -> str:
    """
    Generate synthetic transactions and write to CSV.

    Returns the path to the generated CSV file.
    """
    random.seed(seed)
    os.makedirs(DATASET_DIR, exist_ok=True)

    n_fraud = int(n * fraud_rate)
    n_normal = n - n_fraud

    start_date = datetime(2024, 1, 1)
    end_date = datetime(2024, 12, 31)

    rows = []

    # --- Normal transactions ---
    for _ in range(n_normal):
        t = random_datetime(start_date, end_date)
        # Business hours bias: 07:00 – 22:00
        if random.random() < 0.85:
            t = t.replace(hour=random.randint(7, 22))
        name = random_name()
        rows.append({
            "id": str(uuid.uuid4()),
            "amount": normal_amount(),
            "merchant_name": random.choice(MERCHANTS),
            "payment_method": random.choice(PAYMENT_METHODS),
            "transaction_time": t.isoformat(),
            "device_id": random_device(),
            "location": random.choice(LOCATIONS),
            "sender": name,
            "receiver": random.choice(MERCHANTS),
            "is_fraud": 0,
            "fraud_type": "",
        })

    # --- Fraud transactions ---
    for i in range(n_fraud):
        fraud_type = FRAUD_TYPES[i % len(FRAUD_TYPES)]
        t = random_datetime(start_date, end_date, fraud_type)

        if fraud_type == "duplicate":
            # Same merchant, same amount close in time
            base_row = rows[random.randint(0, max(1, len(rows) - 1))]
            amount = base_row["amount"]
            merchant = base_row["merchant_name"]
            sender = base_row["sender"]
            t = datetime.fromisoformat(base_row["transaction_time"]) + timedelta(minutes=random.randint(1, 4))
        elif fraud_type == "amount_anomaly":
            amount = fraud_amount("amount_anomaly")
            merchant = random.choice(MERCHANTS)
            sender = random_name()
        elif fraud_type == "suspicious_pattern":
            amount = normal_amount()
            merchant = random.choice(MERCHANTS)
            sender = random_name()
        elif fraud_type == "invoice_manipulation":
            amount = round(random.uniform(500_000, 5_000_000), -3)
            merchant = f"FAKE-{random.choice(MERCHANTS)}"
            sender = random_name()
        else:  # identity_fraud
            amount = normal_amount()
            merchant = random.choice(MERCHANTS)
            sender = f"Anonim-{random.randint(1000, 9999)}"

        rows.append({
            "id": str(uuid.uuid4()),
            "amount": amount,
            "merchant_name": merchant,
            "payment_method": random.choice(PAYMENT_METHODS),
            "transaction_time": t.isoformat(),
            "device_id": random_device(),
            "location": random.choice(LOCATIONS),
            "sender": sender,
            "receiver": random.choice(MERCHANTS),
            "is_fraud": 1,
            "fraud_type": fraud_type,
        })

    # Shuffle
    random.shuffle(rows)

    # Write CSV
    fieldnames = [
        "id", "amount", "merchant_name", "payment_method", "transaction_time",
        "device_id", "location", "sender", "receiver", "is_fraud", "fraud_type",
    ]
    with open(DATASET_PATH, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(rows)

    print(f"Dataset generated: {DATASET_PATH} ({len(rows)} rows, {n_fraud} fraud)")
    return DATASET_PATH


if __name__ == "__main__":
    generate_dataset()
