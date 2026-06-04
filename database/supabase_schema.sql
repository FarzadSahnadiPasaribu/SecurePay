-- ============================================================
-- SecurePay Vision – Supabase Schema
-- Jalankan seluruh file ini di SQL Editor Supabase
-- ============================================================

-- ── Extensions ───────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ── Drop existing tables (jika ada yang salah sebelumnya) ────
DROP TABLE IF EXISTS public.fraud_analyses CASCADE;
DROP TABLE IF EXISTS public.invoice_scans CASCADE;
DROP TABLE IF EXISTS public.transactions CASCADE;
DROP TABLE IF EXISTS public.users CASCADE;

-- ── 1. USERS ─────────────────────────────────────────────────
-- Terhubung ke Supabase Auth (auth.users) via id yang sama
CREATE TABLE public.users (
    id            UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email         TEXT UNIQUE NOT NULL,
    username      TEXT UNIQUE,
    full_name     TEXT NOT NULL DEFAULT '',
    hashed_password TEXT NOT NULL DEFAULT '',
    business_name TEXT,
    business_type TEXT,
    phone         TEXT,
    is_active     BOOLEAN DEFAULT true,
    is_verified   BOOLEAN DEFAULT false,
    created_at    TIMESTAMPTZ DEFAULT NOW(),
    updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ── 2. TRANSACTIONS ──────────────────────────────────────────
CREATE TABLE public.transactions (
    id                      UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id                 UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    amount                  FLOAT NOT NULL,
    merchant_name           TEXT NOT NULL DEFAULT '',
    payment_method          TEXT NOT NULL DEFAULT '',
    transaction_time        TIMESTAMPTZ DEFAULT NOW(),
    device_id               TEXT,
    location                TEXT,
    sender                  TEXT,
    receiver                TEXT,
    transaction_id_external TEXT,
    description             TEXT,
    is_fraud                BOOLEAN DEFAULT false,
    fraud_type              TEXT,
    fraud_probability       FLOAT,
    anomaly_score           FLOAT,
    risk_level              TEXT DEFAULT 'NORMAL',
    created_at              TIMESTAMPTZ DEFAULT NOW(),
    updated_at              TIMESTAMPTZ DEFAULT NOW()
);

-- ── 3. FRAUD ANALYSES ────────────────────────────────────────
CREATE TABLE public.fraud_analyses (
    id                   UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    transaction_id       UUID NOT NULL REFERENCES public.transactions(id) ON DELETE CASCADE,
    isolation_forest_score FLOAT,
    lof_score            FLOAT,
    svm_score            FLOAT,
    ensemble_score       FLOAT,
    fraud_probability    FLOAT NOT NULL DEFAULT 0.0,
    risk_level           TEXT NOT NULL DEFAULT 'NORMAL',
    is_anomaly           BOOLEAN DEFAULT false,
    fraud_indicators     JSONB DEFAULT '[]',
    feature_importance   JSONB DEFAULT '{}',
    recommendations      JSONB DEFAULT '[]',
    model_version        TEXT DEFAULT '1.0.0',
    analysis_duration_ms FLOAT,
    created_at           TIMESTAMPTZ DEFAULT NOW()
);

-- ── 4. INVOICE SCANS ─────────────────────────────────────────
CREATE TABLE public.invoice_scans (
    id                       UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id                  UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    filename                 TEXT NOT NULL DEFAULT '',
    file_path                TEXT,
    file_size                FLOAT,
    file_type                TEXT,
    ocr_raw_text             TEXT,
    extracted_amount         FLOAT,
    extracted_date           TEXT,
    extracted_merchant       TEXT,
    extracted_account        TEXT,
    extracted_payment_method TEXT,
    extracted_transaction_id TEXT,
    ocr_confidence           FLOAT,
    manipulation_score       FLOAT,
    manipulation_detected    BOOLEAN DEFAULT false,
    suspicious_regions       JSONB DEFAULT '[]',
    forensics_details        JSONB DEFAULT '{}',
    fraud_probability        FLOAT DEFAULT 0.0,
    risk_level               TEXT DEFAULT 'NORMAL',
    fraud_indicators         JSONB DEFAULT '[]',
    is_fraud                 BOOLEAN DEFAULT false,
    analysis_complete        BOOLEAN DEFAULT false,
    processing_time_ms       FLOAT,
    error_message            TEXT,
    created_at               TIMESTAMPTZ DEFAULT NOW()
);

-- ── Indexes ──────────────────────────────────────────────────
CREATE INDEX idx_transactions_user_id    ON public.transactions(user_id);
CREATE INDEX idx_transactions_risk       ON public.transactions(risk_level);
CREATE INDEX idx_transactions_time       ON public.transactions(transaction_time);
CREATE INDEX idx_fraud_analyses_tx       ON public.fraud_analyses(transaction_id);
CREATE INDEX idx_invoice_scans_user      ON public.invoice_scans(user_id);
CREATE INDEX idx_invoice_scans_risk      ON public.invoice_scans(risk_level);

-- ── Auto-create user profile saat Supabase Auth signup ───────
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
    INSERT INTO public.users (id, email, full_name, username, is_verified)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
        split_part(NEW.email, '@', 1),
        NEW.email_confirmed_at IS NOT NULL
    )
    ON CONFLICT (id) DO NOTHING;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ── Row Level Security (RLS) ─────────────────────────────────
ALTER TABLE public.users          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fraud_analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoice_scans  ENABLE ROW LEVEL SECURITY;

-- Users: hanya bisa lihat/edit profil sendiri
CREATE POLICY "users_own_profile" ON public.users
    FOR ALL USING (auth.uid() = id);

-- Transactions: hanya bisa akses transaksi sendiri
CREATE POLICY "transactions_own" ON public.transactions
    FOR ALL USING (auth.uid() = user_id);

-- Fraud analyses: bisa akses jika punya transaksinya
CREATE POLICY "fraud_analyses_own" ON public.fraud_analyses
    FOR ALL USING (
        transaction_id IN (
            SELECT id FROM public.transactions WHERE user_id = auth.uid()
        )
    );

-- Invoice scans: hanya bisa akses scan sendiri
CREATE POLICY "invoice_scans_own" ON public.invoice_scans
    FOR ALL USING (auth.uid() = user_id);
