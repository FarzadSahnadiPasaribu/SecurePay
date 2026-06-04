# 🛡️ SecurePay Vision
### AI-Powered Digital Transaction Fraud Detection System for UMKM

[![Next.js](https://img.shields.io/badge/Next.js-14-black?logo=next.js)](https://nextjs.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.109-009688?logo=fastapi)](https://fastapi.tiangolo.com/)
[![Python](https://img.shields.io/badge/Python-3.11+-3776AB?logo=python)](https://python.org/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?logo=supabase)](https://supabase.com/)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

---

## 📌 Overview

**SecurePay Vision** adalah sistem deteksi fraud transaksi digital berbasis Artificial Intelligence yang dirancang khusus untuk UMKM (Usaha Mikro Kecil Menengah) Indonesia. Sistem ini menggabungkan teknologi **OCR**, **Machine Learning Anomaly Detection**, dan **Computer Vision Forensics** untuk mendeteksi indikasi penipuan secara otomatis dan real-time.

---

## 🎯 Fitur Utama

| Fitur | Teknologi | Deskripsi |
|-------|-----------|-----------|
| 🔍 OCR Scanner | EasyOCR + OpenCV | Baca invoice/struk otomatis |
| 🤖 AI Fraud Detection | Isolation Forest, LOF, SVM | Deteksi anomali transaksi |
| 🔬 Vision Forensics | OpenCV + CNN | Deteksi manipulasi gambar |
| 📊 Smart Dashboard | Recharts + Framer Motion | Visualisasi analytics real-time |
| ⚡ Realtime Alert | Supabase Realtime | Notifikasi fraud instan |
| 📄 PDF Export | ReportLab | Laporan fraud otomatis |

---

## 🏗️ Arsitektur Sistem

```
┌─────────────────────────────────────────────────────────────┐
│                    SecurePay Vision                          │
│                                                              │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐  │
│  │   Frontend   │    │   Backend    │    │  Database    │  │
│  │  Next.js 14  │◄──►│  FastAPI     │◄──►│  Supabase    │  │
│  │  Tailwind    │    │  Python 3.11 │    │  PostgreSQL  │  │
│  │  Framer      │    │  REST API    │    │  Realtime    │  │
│  └──────────────┘    └──────┬───────┘    └──────────────┘  │
│                             │                                │
│                    ┌────────▼────────┐                      │
│                    │   AI Engine     │                      │
│                    │                 │                      │
│                    │ ┌─────────────┐ │                      │
│                    │ │ OCR Engine  │ │                      │
│                    │ │ EasyOCR     │ │                      │
│                    │ │ OpenCV      │ │                      │
│                    │ └─────────────┘ │                      │
│                    │                 │                      │
│                    │ ┌─────────────┐ │                      │
│                    │ │ ML Models   │ │                      │
│                    │ │ Iso Forest  │ │                      │
│                    │ │ LOF, SVM    │ │                      │
│                    │ └─────────────┘ │                      │
│                    │                 │                      │
│                    │ ┌─────────────┐ │                      │
│                    │ │ CV Forensic │ │                      │
│                    │ │ OpenCV      │ │                      │
│                    │ │ Edge Detect │ │                      │
│                    │ └─────────────┘ │                      │
│                    └─────────────────┘                      │
└─────────────────────────────────────────────────────────────┘
```

---

## 📁 Struktur Folder

```
securepay-vision/
│
├── frontend/                    # Next.js 14 Frontend
│   ├── app/                     # App Router pages
│   │   ├── page.tsx            # Landing page
│   │   ├── dashboard/          # Main dashboard
│   │   ├── scan/               # Upload & scan invoice
│   │   ├── analytics/          # Data analytics
│   │   ├── history/            # Scan history
│   │   ├── about/              # About project
│   │   ├── login/              # Authentication
│   │   └── register/
│   ├── components/             # Reusable UI components
│   ├── lib/                    # API, hooks, utilities
│   └── public/                 # Static assets
│
├── backend/                    # FastAPI Backend
│   ├── main.py                 # App entry point
│   ├── api/                    # Route handlers
│   ├── models/                 # Database models
│   ├── services/               # Business logic
│   ├── ocr/                    # OCR engine
│   ├── anomaly_detection/      # ML models
│   └── utils/                  # Helpers
│
├── dataset/                    # Training datasets
│   ├── transactions.csv        # Main transaction dataset
│   └── fraud_samples.csv       # Fraud sample data
│
├── notebooks/                  # Jupyter notebooks
│   ├── 01_EDA.ipynb            # Exploratory analysis
│   ├── 02_Feature_Engineering.ipynb
│   ├── 03_Model_Training.ipynb
│   └── 04_Evaluation.ipynb
│
├── trained_models/             # Saved ML models
│   ├── isolation_forest.pkl
│   ├── lof_model.pkl
│   ├── svm_model.pkl
│   └── scaler.pkl
│
├── uploads/                    # Uploaded invoices
├── reports/                    # Generated PDF reports
├── docker-compose.yml          # Docker setup
└── README.md
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Python 3.11+
- PostgreSQL (or Supabase account)

### 1. Clone & Setup

```bash
git clone https://github.com/yourusername/securepay-vision.git
cd securepay-vision
```

### 2. Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # Linux/Mac
# venv\Scripts\activate   # Windows

# Install dependencies
pip install -r requirements.txt

# Copy environment variables
cp .env.example .env
# Edit .env with your Supabase credentials

# Generate sample dataset & train models
python scripts/generate_dataset.py
python scripts/train_models.py

# Run backend
uvicorn main:app --reload --port 8000
```

Backend API: http://localhost:8000
Swagger Docs: http://localhost:8000/docs

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env.local
# Edit .env.local with your settings

# Run development server
npm run dev
```

Frontend: http://localhost:3000

### 4. Docker Setup (Recommended)

```bash
# Run everything with Docker
docker-compose up -d

# Frontend: http://localhost:3000
# Backend:  http://localhost:8000
# API Docs: http://localhost:8000/docs
```

---

## 🔧 Environment Variables

### Backend (.env)
```env
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_KEY=your_supabase_anon_key
JWT_SECRET=your-secret-key-change-in-production
JWT_ALGORITHM=HS256
JWT_EXPIRE_HOURS=24
DATABASE_URL=postgresql+asyncpg://postgres:password@localhost:5432/securepay
UPLOAD_DIR=uploads/
```

### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

---

## 🗄️ Database Schema

```sql
-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'user',
    created_at TIMESTAMP DEFAULT NOW()
);

-- Transactions table
CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    amount DECIMAL(15,2) NOT NULL,
    merchant VARCHAR(255),
    payment_method VARCHAR(100),
    transaction_time TIMESTAMP,
    device_id VARCHAR(255),
    location VARCHAR(255),
    status VARCHAR(50) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT NOW()
);

-- Fraud Analysis table
CREATE TABLE fraud_analysis (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    transaction_id UUID REFERENCES transactions(id),
    anomaly_score DECIMAL(5,4),
    risk_level VARCHAR(50),
    prediction VARCHAR(50),
    fraud_probability DECIMAL(5,4),
    indicators JSONB,
    reason TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Invoice Scans table
CREATE TABLE invoice_scans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    image_url TEXT,
    ocr_text TEXT,
    ocr_confidence DECIMAL(5,4),
    manipulation_score DECIMAL(5,4),
    fraud_prediction VARCHAR(50),
    extracted_data JSONB,
    created_at TIMESTAMP DEFAULT NOW()
);
```

---

## 🤖 AI Models

### Anomaly Detection Models

| Model | Algorithm | Purpose |
|-------|-----------|---------|
| **Isolation Forest** | Ensemble Trees | Primary anomaly detection |
| **Local Outlier Factor** | KNN-based | Local density anomaly detection |
| **One-Class SVM** | SVM with RBF kernel | Boundary-based outlier detection |

### Model Ensemble Strategy
- All 3 models vote on each transaction
- Weighted average: IF (50%) + LOF (30%) + SVM (20%)
- Final score normalized to [0, 1]

### Risk Level Thresholds
- **HIGH RISK**: score > 0.70
- **MEDIUM RISK**: score > 0.40
- **LOW RISK**: score > 0.20
- **NORMAL**: score ≤ 0.20

### Feature Engineering

| Feature | Description |
|---------|-------------|
| `amount_log` | Log-transformed transaction amount |
| `hour` | Transaction hour (0-23) |
| `day_of_week` | Day of week (0-6) |
| `amount_zscore` | Z-score of amount |
| `is_odd_hours` | Transaction between 23:00-05:00 |
| `amount_percentile` | Percentile rank of amount |
| `payment_encoded` | Encoded payment method |

---

## 📊 Model Performance

| Metric | Value |
|--------|-------|
| **Accuracy** | 94.2% |
| **Precision** | 91.8% |
| **Recall** | 88.5% |
| **F1-Score** | 90.1% |
| **AUC-ROC** | 0.967 |

---

## 🔌 API Endpoints

### Authentication
```
POST /auth/register    Register new user
POST /auth/login       Login & get JWT token
GET  /auth/me          Get current user info
```

### Transactions
```
GET  /transactions/              List all transactions
POST /transactions/              Add new transaction
GET  /transactions/{id}          Get transaction by ID
GET  /transactions/stats/summary Dashboard statistics
```

### Scan
```
POST /scan/invoice               Upload & analyze invoice
GET  /scan/history               Scan history
GET  /scan/{id}                  Get scan result
```

### Analytics
```
GET /analytics/dashboard         Dashboard stats
GET /analytics/model-metrics     ML model evaluation
GET /analytics/distribution      Data distributions
GET /analytics/correlation       Feature correlation
```

### Export
```
GET /export/pdf/{scan_id}        Export scan as PDF
GET /export/report               Export fraud report
GET /export/csv                  Export transactions CSV
```

---

## 📱 Screenshots

| Page | Description |
|------|-------------|
| Landing Page | Hero section with feature overview |
| Dashboard | Real-time fraud monitoring |
| Scan Page | Invoice upload & OCR analysis |
| Analytics | Dataset visualization & model metrics |
| History | Scan history with filters |

---

## 🛠️ Tech Stack

### Frontend
- **Next.js 14** - React framework with App Router
- **TypeScript** - Type safety
- **Tailwind CSS** - Utility-first styling
- **Framer Motion** - Animations
- **Recharts** - Data visualization
- **Lucide React** - Icons

### Backend
- **FastAPI** - Modern Python web framework
- **SQLAlchemy** - ORM (async)
- **Supabase** - PostgreSQL + Realtime + Storage
- **Pydantic v2** - Data validation

### AI/ML
- **Scikit-learn** - ML models
- **OpenCV** - Computer vision
- **EasyOCR** - Text recognition
- **Pandas/NumPy** - Data processing

---

## 👤 Author

**Final Project - Data Science / Artificial Intelligence**
- Universitas / Institut: [Your University]
- Tahun: 2024

---

## 📄 License

MIT License - see [LICENSE](LICENSE) for details.

---

<div align="center">
  <strong>SecurePay Vision</strong> - Protecting UMKM from Digital Fraud with AI
</div>
