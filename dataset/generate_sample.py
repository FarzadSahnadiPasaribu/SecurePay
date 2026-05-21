"""
SecurePay Vision - Sample Dataset Generator
Generates realistic Indonesian UMKM transaction data for ML training
"""
import pandas as pd
import numpy as np
import random
import os
from datetime import datetime, timedelta

# Seed for reproducibility
np.random.seed(42)
random.seed(42)

# Indonesian UMKM merchant names
MERCHANTS_NORMAL = [
    "Warung Pak Budi", "Toko Bu Sari", "Jasa Print Pak Hendra",
    "Bakso Mas Eko", "Warung Makan Bu Tini", "Toko Sembako Pak Agus",
    "Laundry Kiloan Bu Dewi", "Fotocopy Pak Joko", "Toko ATK Mas Rudi",
    "Warung Kopi Bang Asep", "Bengkel Motor Pak Sobari", "Toko Buah Pak Salim",
    "Nasi Gudeg Bu Yanti", "Toko Oleh-oleh Bu Wati", "Jasa Jahit Bu Lastri",
    "Toko Elektronik Pak Hadi", "Warung Es Campur Mas Dani",
    "Rental Mobil Pak Surya", "Toko Kosmetik Bu Indah", "Apotek Pak Bintang",
    "Toko Sepatu Bu Mega", "Warung Sate Mas Udin", "Jasa AC Pak Wahyu",
    "Toko Baju Anak Bu Rini", "Percetakan Digital Mas Amir"
]

MERCHANTS_SUSPICIOUS = [
    "INVOICE VENDOR XYZ", "PT TRANSFER CEPAT", "INVEST UNTUNG 1000%",
    "LUCKY TRANSFER", "QUICK CASH SERVICE", "DANA KILAT INC",
    "TOKO ONLINE MURAH 888", "PROMO EKSKLUSIF LTD", "FAST PAYMENT CO"
]

PAYMENT_METHODS = [
    "QRIS", "BCA Transfer", "BNI Transfer", "Mandiri Transfer",
    "BRI Transfer", "GoPay", "OVO", "Dana", "ShopeePay",
    "LinkAja", "Jenius", "CIMB Transfer"
]

LOCATIONS = [
    "Jakarta Selatan", "Jakarta Pusat", "Jakarta Utara", "Jakarta Timur", "Jakarta Barat",
    "Surabaya", "Bandung", "Medan", "Yogyakarta", "Semarang",
    "Makassar", "Palembang", "Bekasi", "Depok", "Tangerang",
    "Bogor", "Solo", "Malang", "Denpasar", "Balikpapan"
]

SENDER_NAMES = [
    "Andi Pratama", "Rina Wulandari", "Budi Santoso", "Siti Rahayu",
    "Agus Setiawan", "Dewi Lestari", "Hendra Wijaya", "Yanti Kusuma",
    "Rizky Maulana", "Nurul Hidayah", "Fajar Ramadhan", "Putri Anjali",
    "Doni Saputra", "Maya Sari", "Eko Prasetyo", "Fitri Handayani",
    "Irwan Syahputra", "Lina Marlina", "Rendi Firmansyah", "Wulan Sari"
]

DEVICE_IDS = [f"DEV{str(i).zfill(4)}" for i in range(1, 51)]

def generate_normal_transaction(i):
    """Generate a normal transaction"""
    # Business hours - mostly 7 AM to 10 PM
    hour = np.random.choice(range(7, 22), p=np.ones(15)/15)
    date = datetime.now() - timedelta(days=random.randint(0, 90))
    date = date.replace(hour=int(hour), minute=random.randint(0, 59))

    # Normal amounts for UMKM (in IDR)
    amount_type = random.choice(['small', 'medium', 'large'])
    if amount_type == 'small':
        amount = random.uniform(5000, 100000)
    elif amount_type == 'medium':
        amount = random.uniform(100000, 1000000)
    else:
        amount = random.uniform(1000000, 5000000)

    # Round to nearest thousand
    amount = round(amount / 1000) * 1000

    merchant = random.choice(MERCHANTS_NORMAL)
    payment = random.choice(PAYMENT_METHODS)
    location = random.choice(LOCATIONS)
    sender = random.choice(SENDER_NAMES)
    device = random.choice(DEVICE_IDS[:20])  # Normal users have consistent devices

    return {
        'id': f'TXN{str(i).zfill(6)}',
        'amount': amount,
        'merchant_name': merchant,
        'payment_method': payment,
        'transaction_time': date.strftime('%Y-%m-%d %H:%M:%S'),
        'hour': int(hour),
        'day_of_week': date.weekday(),
        'device_id': device,
        'location': location,
        'sender_name': sender,
        'account_number': f'8{random.randint(100000000, 999999999)}',
        'is_fraud': 0,
        'fraud_type': 'normal'
    }

def generate_fraud_transaction(i):
    """Generate a fraudulent transaction"""
    fraud_type = random.choice([
        'amount_anomaly', 'suspicious_hour', 'duplicate_pattern',
        'rapid_succession', 'new_device', 'location_mismatch'
    ])

    date = datetime.now() - timedelta(days=random.randint(0, 90))

    if fraud_type == 'amount_anomaly':
        # Unusually large amount
        amount = random.uniform(10000000, 50000000)
        hour = random.randint(7, 22)
        merchant = random.choice(MERCHANTS_SUSPICIOUS)
        device = random.choice(DEVICE_IDS)

    elif fraud_type == 'suspicious_hour':
        # Transaction at odd hours (midnight to 5 AM)
        hour = random.choice([0, 1, 2, 3, 4, 23])
        amount = random.uniform(500000, 5000000)
        merchant = random.choice(MERCHANTS_SUSPICIOUS + MERCHANTS_NORMAL)
        device = random.choice(DEVICE_IDS[30:])  # New/unknown device

    elif fraud_type == 'duplicate_pattern':
        # Same amount multiple times (simulate duplicate)
        amount = random.choice([1000000, 2000000, 5000000, 500000])
        hour = random.randint(9, 18)
        merchant = random.choice(MERCHANTS_SUSPICIOUS)
        device = random.choice(DEVICE_IDS[:5])

    elif fraud_type == 'rapid_succession':
        # Multiple transactions in short time
        amount = random.uniform(100000, 2000000)
        hour = random.randint(8, 20)
        merchant = random.choice(MERCHANTS_SUSPICIOUS)
        device = random.choice(DEVICE_IDS[40:])  # Unknown device

    elif fraud_type == 'new_device':
        # New/unknown device used
        amount = random.uniform(500000, 3000000)
        hour = random.randint(10, 22)
        merchant = random.choice(MERCHANTS_NORMAL)
        device = f"UNKNOWN_{random.randint(1000, 9999)}"

    else:  # location_mismatch
        # Transaction from unusual location
        amount = random.uniform(200000, 2000000)
        hour = random.randint(7, 23)
        merchant = random.choice(MERCHANTS_SUSPICIOUS)
        device = random.choice(DEVICE_IDS)

    date = date.replace(hour=int(hour), minute=random.randint(0, 59))
    amount = round(amount / 1000) * 1000

    return {
        'id': f'TXN{str(i).zfill(6)}',
        'amount': amount,
        'merchant_name': merchant,
        'payment_method': random.choice(PAYMENT_METHODS),
        'transaction_time': date.strftime('%Y-%m-%d %H:%M:%S'),
        'hour': int(hour),
        'day_of_week': date.weekday(),
        'device_id': device,
        'location': random.choice(LOCATIONS),
        'sender_name': random.choice(SENDER_NAMES) if random.random() > 0.3 else "Unknown Sender",
        'account_number': f'8{random.randint(100000000, 999999999)}',
        'is_fraud': 1,
        'fraud_type': fraud_type
    }

def generate_dataset(n_samples=1000, fraud_ratio=0.20):
    """Generate complete dataset"""
    transactions = []
    n_fraud = int(n_samples * fraud_ratio)
    n_normal = n_samples - n_fraud

    print(f"Generating {n_normal} normal and {n_fraud} fraud transactions...")

    for i in range(n_normal):
        transactions.append(generate_normal_transaction(i))

    for i in range(n_fraud):
        transactions.append(generate_fraud_transaction(n_normal + i))

    # Shuffle
    random.shuffle(transactions)

    df = pd.DataFrame(transactions)

    # Add derived features
    df['amount_log'] = np.log1p(df['amount'])
    df['amount_zscore'] = (df['amount'] - df['amount'].mean()) / df['amount'].std()
    df['is_odd_hours'] = ((df['hour'] >= 22) | (df['hour'] <= 5)).astype(int)
    df['is_weekend'] = (df['day_of_week'] >= 5).astype(int)
    df['amount_percentile'] = df['amount'].rank(pct=True)

    print(f"\nDataset Summary:")
    print(f"Total: {len(df)}")
    print(f"Normal: {len(df[df['is_fraud']==0])}")
    print(f"Fraud: {len(df[df['is_fraud']==1])}")
    print(f"Fraud Rate: {df['is_fraud'].mean():.1%}")
    print(f"\nFraud Types:")
    print(df[df['is_fraud']==1]['fraud_type'].value_counts())

    return df

if __name__ == '__main__':
    os.makedirs('dataset', exist_ok=True)

    df = generate_dataset(n_samples=1000, fraud_ratio=0.20)

    output_path = 'dataset/transactions.csv'
    df.to_csv(output_path, index=False)
    print(f"\nDataset saved to: {output_path}")

    # Also save fraud-only samples
    fraud_df = df[df['is_fraud'] == 1].copy()
    fraud_df.to_csv('dataset/fraud_samples.csv', index=False)
    print(f"Fraud samples saved to: dataset/fraud_samples.csv")

    print("\nSample data:")
    print(df.head(10).to_string())
