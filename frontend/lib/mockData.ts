// Mock data for SecurePay Vision - Indonesian UMKM transactions

export type RiskLevel = 'HIGH' | 'MEDIUM' | 'LOW' | 'NORMAL'
export type PaymentMethod = 'QRIS' | 'Bank Transfer' | 'GoPay' | 'OVO' | 'Dana' | 'ShopeePay' | 'Cash'
export type TransactionStatus = 'FRAUD' | 'SUSPICIOUS' | 'NORMAL'

export interface Transaction {
  id: string
  date: string
  merchantName: string
  merchantCategory: string
  amount: number
  paymentMethod: PaymentMethod
  riskLevel: RiskLevel
  status: TransactionStatus
  anomalyScore: number
  fraudProbability: number
  city: string
  senderName: string
  receiverName: string
  accountNumber: string
  transactionRef: string
  indicators: string[]
}

export interface FraudAnalysisResult {
  transactionId: string
  status: RiskLevel
  anomalyScore: number
  fraudProbability: number
  ocrConfidence: number
  manipulationScore: number
  indicators: string[]
  extractedData: OCRExtractedData
}

export interface OCRExtractedData {
  amount: number
  date: string
  merchantName: string
  accountNumber: string
  paymentMethod: PaymentMethod
  transactionId: string
  senderName: string
  receiverName: string
}

const merchants = [
  { name: 'Warung Bu Sari', category: 'Kuliner' },
  { name: 'Toko Baju Online Fitri', category: 'Fashion' },
  { name: 'Bengkel Motor Pak Budi', category: 'Jasa Otomotif' },
  { name: 'Warung Nasi Padang Minang', category: 'Kuliner' },
  { name: 'Toko Sembako Pak Haji', category: 'Sembako' },
  { name: 'Salon Kecantikan Dewi', category: 'Kecantikan' },
  { name: 'Laundry Kilat Express', category: 'Jasa Laundry' },
  { name: 'Toko Elektronik Jaya', category: 'Elektronik' },
  { name: 'Apotek Sehat Sejahtera', category: 'Kesehatan' },
  { name: 'Bakso Malang Pak Agus', category: 'Kuliner' },
  { name: 'Toko Buku & Alat Tulis', category: 'Pendidikan' },
  { name: 'Warung Kopi Nusantara', category: 'Kuliner' },
  { name: 'Toko Handphone & Aksesoris', category: 'Elektronik' },
  { name: 'Jasa Pengiriman Cepat', category: 'Logistik' },
  { name: 'Minimarket Berkah', category: 'Retail' },
  { name: 'Kedai Mie Ayam Spesial', category: 'Kuliner' },
  { name: 'Toko Oleh-oleh Nusantara', category: 'Retail' },
  { name: 'CV Maju Bersama', category: 'Perdagangan' },
  { name: 'UD Sumber Rezeki', category: 'Perdagangan' },
  { name: 'Toko Material Bangunan', category: 'Bangunan' },
]

const cities = ['Jakarta', 'Surabaya', 'Bandung', 'Medan', 'Semarang', 'Yogyakarta', 'Makassar', 'Palembang', 'Tangerang', 'Bekasi']
const paymentMethods: PaymentMethod[] = ['QRIS', 'Bank Transfer', 'GoPay', 'OVO', 'Dana', 'ShopeePay', 'Cash']

const indonesianNames = [
  'Budi Santoso', 'Siti Rahayu', 'Ahmad Fauzi', 'Dewi Lestari', 'Eko Prasetyo',
  'Fitri Handayani', 'Gunawan Hadi', 'Hana Pertiwi', 'Irfan Maulana', 'Joko Widodo',
  'Kartini Wulandari', 'Lukman Hakim', 'Maya Indah', 'Nurul Hidayat', 'Rina Susanti',
  'Surya Dharma', 'Tina Amelia', 'Udin Sedunia', 'Vina Cantika', 'Wawan Setiawan',
]

const highRiskIndicators = [
  'Unusual transaction time (2-4 AM)',
  'Amount exceeds daily limit by 300%',
  'Multiple transactions in short interval',
  'Unverified merchant account',
  'IP address mismatch with location',
  'New device detected',
  'Transaction pattern anomaly',
  'Blacklisted account number',
  'Duplicate transaction detected',
  'Suspicious merchant category',
]

const mediumRiskIndicators = [
  'Slightly elevated transaction amount',
  'Transaction from new location',
  'Multiple failed attempts before success',
  'Unusual payment method for merchant type',
  'Transaction outside normal hours',
]

const lowRiskIndicators = [
  'Minor velocity increase detected',
  'New merchant for this customer',
  'Slightly unusual transaction time',
]

function generateAccountNumber(): string {
  return Array.from({ length: 10 }, () => Math.floor(Math.random() * 10)).join('')
}

function generateTransactionRef(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  return 'TXN-' + Array.from({ length: 12 }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
}

function generateDate(daysAgo: number): string {
  const date = new Date()
  date.setDate(date.getDate() - daysAgo)
  date.setHours(Math.floor(Math.random() * 24), Math.floor(Math.random() * 60))
  return date.toISOString()
}

export function generateMockTransactions(count: number = 100): Transaction[] {
  const transactions: Transaction[] = []

  for (let i = 0; i < count; i++) {
    const merchant = merchants[Math.floor(Math.random() * merchants.length)]
    const paymentMethod = paymentMethods[Math.floor(Math.random() * paymentMethods.length)]
    const city = cities[Math.floor(Math.random() * cities.length)]
    const sender = indonesianNames[Math.floor(Math.random() * indonesianNames.length)]
    const receiver = indonesianNames[Math.floor(Math.random() * indonesianNames.length)]

    // 20% fraud, 10% suspicious, 70% normal
    const rand = Math.random()
    let riskLevel: RiskLevel
    let status: TransactionStatus
    let anomalyScore: number
    let fraudProbability: number
    let indicators: string[]
    let amount: number

    if (rand < 0.08) {
      // HIGH risk (8%)
      riskLevel = 'HIGH'
      status = 'FRAUD'
      anomalyScore = 0.75 + Math.random() * 0.25
      fraudProbability = 75 + Math.random() * 25
      indicators = highRiskIndicators.slice(0, 2 + Math.floor(Math.random() * 4))
      amount = 5000000 + Math.floor(Math.random() * 45000000)
    } else if (rand < 0.20) {
      // MEDIUM risk (12%)
      riskLevel = 'MEDIUM'
      status = 'SUSPICIOUS'
      anomalyScore = 0.45 + Math.random() * 0.3
      fraudProbability = 35 + Math.random() * 40
      indicators = mediumRiskIndicators.slice(0, 1 + Math.floor(Math.random() * 3))
      amount = 1000000 + Math.floor(Math.random() * 10000000)
    } else if (rand < 0.30) {
      // LOW risk (10%)
      riskLevel = 'LOW'
      status = 'NORMAL'
      anomalyScore = 0.2 + Math.random() * 0.25
      fraudProbability = 10 + Math.random() * 25
      indicators = lowRiskIndicators.slice(0, 1 + Math.floor(Math.random() * 2))
      amount = 50000 + Math.floor(Math.random() * 2000000)
    } else {
      // NORMAL (70%)
      riskLevel = 'NORMAL'
      status = 'NORMAL'
      anomalyScore = Math.random() * 0.2
      fraudProbability = Math.random() * 10
      indicators = []
      amount = 50000 + Math.floor(Math.random() * 1000000)
    }

    transactions.push({
      id: `txn_${String(i + 1).padStart(4, '0')}`,
      date: generateDate(Math.floor(Math.random() * 30)),
      merchantName: merchant.name,
      merchantCategory: merchant.category,
      amount,
      paymentMethod,
      riskLevel,
      status,
      anomalyScore: Math.round(anomalyScore * 1000) / 1000,
      fraudProbability: Math.round(fraudProbability * 10) / 10,
      city,
      senderName: sender,
      receiverName: receiver,
      accountNumber: generateAccountNumber(),
      transactionRef: generateTransactionRef(),
      indicators,
    })
  }

  return transactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
}

export const mockTransactions = generateMockTransactions(100)

export const mockDashboardStats = {
  totalTransactions: 2847,
  fraudDetected: 234,
  normalTransactions: 2613,
  anomalyPercentage: 8.22,
  invoicesScanned: 1923,
  highRisk: 89,
  mediumRisk: 145,
  lowRisk: 312,
  previousTotal: 2601,
  previousFraud: 198,
}

export const mockTrendData = Array.from({ length: 30 }, (_, i) => {
  const date = new Date()
  date.setDate(date.getDate() - (29 - i))
  const total = 60 + Math.floor(Math.random() * 80)
  const fraud = Math.floor(total * (0.05 + Math.random() * 0.15))
  return {
    date: date.toLocaleDateString('id-ID', { day: '2-digit', month: 'short' }),
    total,
    fraud,
    normal: total - fraud,
    suspicious: Math.floor(Math.random() * 8),
  }
})

export const mockPaymentMethodData = [
  { method: 'QRIS', count: 847, amount: 124500000 },
  { method: 'GoPay', count: 623, amount: 89750000 },
  { method: 'Bank Transfer', count: 512, amount: 312400000 },
  { method: 'OVO', count: 398, amount: 67200000 },
  { method: 'Dana', count: 287, amount: 45600000 },
  { method: 'ShopeePay', count: 112, amount: 23100000 },
  { method: 'Cash', count: 68, amount: 18900000 },
]

export const mockFraudDistribution = [
  { name: 'Normal', value: 70, color: '#3b82f6' },
  { name: 'Low Risk', value: 10, color: '#10b981' },
  { name: 'Medium Risk', value: 12, color: '#f59e0b' },
  { name: 'High Risk', value: 8, color: '#ef4444' },
]

export const mockModelMetrics = {
  accuracy: 96.8,
  precision: 94.2,
  recall: 91.7,
  f1Score: 92.9,
  auc: 0.978,
  confusionMatrix: {
    truePositive: 187,
    falsePositive: 12,
    falseNegative: 17,
    trueNegative: 1983,
  },
}

export const mockAnomalyDistribution = Array.from({ length: 20 }, (_, i) => ({
  range: `${(i * 0.05).toFixed(2)}-${((i + 1) * 0.05).toFixed(2)}`,
  count: i < 14 ? Math.floor(100 - i * 5 + Math.random() * 20) : Math.floor(10 + Math.random() * 20),
  fraud: i > 14 ? Math.floor(5 + Math.random() * 15) : Math.floor(Math.random() * 3),
}))

export const mockROCData = Array.from({ length: 20 }, (_, i) => {
  const fpr = i / 19
  const tpr = Math.min(1, Math.pow(fpr, 0.1) * 0.97 + (i > 0 ? 0.02 : 0))
  return { fpr: Math.round(fpr * 100) / 100, tpr: Math.round(tpr * 100) / 100 }
})

export const mockDemoScanResult: FraudAnalysisResult = {
  transactionId: 'TXN-DEMO2024001',
  status: 'HIGH',
  anomalyScore: 0.847,
  fraudProbability: 84.7,
  ocrConfidence: 92.3,
  manipulationScore: 67.4,
  indicators: [
    'Transaction time outside normal business hours (02:34 AM)',
    'Amount (Rp 15,750,000) exceeds 90th percentile for this merchant',
    'Multiple rapid consecutive transactions detected',
    'Account number not found in verified merchant database',
    'Image metadata shows signs of digital manipulation',
    'Font inconsistency detected in amount field',
  ],
  extractedData: {
    amount: 15750000,
    date: '2024-11-15T02:34:00.000Z',
    merchantName: 'Toko Online Elektronik Murah',
    accountNumber: '1234567890',
    paymentMethod: 'Bank Transfer',
    transactionId: 'TXN-BNI-20241115-089234',
    senderName: 'Ahmad Fauzi',
    receiverName: 'Toko Online Elektronik Murah',
  },
}
