-- SecurePay Vision Database Schema
-- PostgreSQL / Supabase

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'user' CHECK (role IN ('admin', 'user')),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Transactions table
CREATE TABLE IF NOT EXISTS transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    amount DECIMAL(15,2) NOT NULL,
    merchant VARCHAR(255),
    payment_method VARCHAR(100),
    transaction_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    device_id VARCHAR(255),
    location VARCHAR(255),
    sender_name VARCHAR(255),
    receiver_name VARCHAR(255),
    account_number VARCHAR(100),
    transaction_ref VARCHAR(255),
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'analyzed', 'flagged', 'cleared')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Fraud Analysis table
CREATE TABLE IF NOT EXISTS fraud_analysis (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    transaction_id UUID REFERENCES transactions(id) ON DELETE CASCADE,
    anomaly_score DECIMAL(5,4) NOT NULL DEFAULT 0,
    risk_level VARCHAR(50) CHECK (risk_level IN ('HIGH', 'MEDIUM', 'LOW', 'NORMAL')),
    prediction VARCHAR(50),
    fraud_probability DECIMAL(5,4) DEFAULT 0,
    ocr_confidence DECIMAL(5,4),
    manipulation_score DECIMAL(5,4),
    indicators JSONB DEFAULT '[]',
    reason TEXT,
    model_scores JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Invoice Scans table
CREATE TABLE IF NOT EXISTS invoice_scans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    image_url TEXT,
    original_filename VARCHAR(255),
    file_size INTEGER,
    ocr_text TEXT,
    ocr_confidence DECIMAL(5,4),
    manipulation_score DECIMAL(5,4),
    fraud_prediction VARCHAR(50),
    anomaly_score DECIMAL(5,4),
    extracted_data JSONB DEFAULT '{}',
    fraud_indicators JSONB DEFAULT '[]',
    analysis_result JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON transactions(status);
CREATE INDEX IF NOT EXISTS idx_transactions_time ON transactions(transaction_time);
CREATE INDEX IF NOT EXISTS idx_fraud_analysis_transaction ON fraud_analysis(transaction_id);
CREATE INDEX IF NOT EXISTS idx_fraud_analysis_risk ON fraud_analysis(risk_level);
CREATE INDEX IF NOT EXISTS idx_invoice_scans_user ON invoice_scans(user_id);
CREATE INDEX IF NOT EXISTS idx_invoice_scans_prediction ON invoice_scans(fraud_prediction);

-- Insert demo admin user (password: admin123)
INSERT INTO users (name, email, password_hash, role) VALUES
    ('Admin SecurePay', 'admin@securepay.id', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/lewohPY.pFKIqAjTq', 'admin')
ON CONFLICT (email) DO NOTHING;

-- Insert sample transactions for demo
INSERT INTO transactions (amount, merchant, payment_method, transaction_time, device_id, location, sender_name, receiver_name, status) VALUES
    (150000, 'Warung Pak Budi', 'QRIS', NOW() - INTERVAL '1 day', 'DEV001', 'Jakarta Selatan', 'Andi Pratama', 'Warung Pak Budi', 'analyzed'),
    (2500000, 'Toko Online Bu Sari', 'BCA Transfer', NOW() - INTERVAL '2 days', 'DEV002', 'Surabaya', 'Rina Wulandari', 'Toko Bu Sari', 'analyzed'),
    (75000, 'Jasa Print Pak Hendra', 'GoPay', NOW() - INTERVAL '3 days', 'DEV001', 'Bandung', 'Budi Santoso', 'Pak Hendra Print', 'analyzed'),
    (15000000, 'Invoice Elektronik XYZ', 'BNI Transfer', NOW() - INTERVAL '4 days', 'DEV003', 'Jakarta Pusat', 'Unknown Sender', 'PT XYZ Corp', 'flagged'),
    (500000, 'Bakso Mas Eko', 'OVO', NOW() - INTERVAL '5 days', 'DEV002', 'Yogyakarta', 'Siti Rahayu', 'Mas Eko Bakso', 'analyzed');

