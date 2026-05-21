'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  History, Search, Filter, Download, ChevronLeft, ChevronRight,
  Calendar, RefreshCw,
} from 'lucide-react'
import Navbar from '@/components/Navbar'
import Sidebar from '@/components/Sidebar'
import TransactionTable from '@/components/TransactionTable'
import FraudBadge from '@/components/FraudBadge'
import { useTransactions } from '@/lib/hooks/useTransactions'
import type { RiskLevel } from '@/lib/mockData'

const RISK_OPTIONS = [
  { value: 'all', label: 'All Risks' },
  { value: 'HIGH', label: 'High Risk' },
  { value: 'MEDIUM', label: 'Medium Risk' },
  { value: 'LOW', label: 'Low Risk' },
  { value: 'NORMAL', label: 'Normal' },
]

const METHOD_OPTIONS = [
  { value: 'all', label: 'All Methods' },
  { value: 'QRIS', label: 'QRIS' },
  { value: 'Bank Transfer', label: 'Bank Transfer' },
  { value: 'GoPay', label: 'GoPay' },
  { value: 'OVO', label: 'OVO' },
  { value: 'Dana', label: 'Dana' },
  { value: 'ShopeePay', label: 'ShopeePay' },
  { value: 'Cash', label: 'Cash' },
]

export default function HistoryPage() {
  const [search, setSearch] = useState('')
  const [riskFilter, setRiskFilter] = useState('all')
  const [methodFilter, setMethodFilter] = useState('all')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [page, setPage] = useState(1)
  const limit = 10

  const { transactions, totalCount, loading } = useTransactions({
    page, limit, riskFilter, methodFilter, search, startDate, endDate,
  })

  const totalPages = Math.ceil(totalCount / limit)

  const handleExportCSV = () => {
    const headers = ['ID', 'Date', 'Merchant', 'Amount (IDR)', 'Method', 'Risk', 'Anomaly Score', 'Fraud %']
    const rows = transactions.map((t) => [
      t.id,
      new Date(t.date).toLocaleString('id-ID'),
      t.merchantName,
      t.amount,
      t.paymentMethod,
      t.riskLevel,
      t.anomalyScore,
      t.fraudProbability,
    ])
    const csv = [headers, ...rows].map((r) => r.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `securepay_transactions_${Date.now()}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const resetFilters = () => {
    setSearch('')
    setRiskFilter('all')
    setMethodFilter('all')
    setStartDate('')
    setEndDate('')
    setPage(1)
  }

  return (
    <div className="min-h-screen bg-navy-900">
      <Navbar />
      <Sidebar />

      <main className="pt-16 pl-16 md:pl-56 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between mb-8"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-neon-blue/10 border border-neon-blue/20 flex items-center justify-center">
                <History size={20} className="text-neon-blue" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Transaction History</h1>
                <p className="text-white/40 text-sm">All scanned invoices and fraud analysis results</p>
              </div>
            </div>
            <button onClick={handleExportCSV} className="btn-secondary flex items-center gap-2 text-sm">
              <Download size={14} />
              Export CSV
            </button>
          </motion.div>

          {/* Filters */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass-card p-4 border border-white/10 mb-6"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
              <div className="relative lg:col-span-2">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
                <input
                  type="text"
                  placeholder="Search merchant, ID, sender..."
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); setPage(1) }}
                  className="input-field pl-8 text-sm"
                />
              </div>

              <select
                value={riskFilter}
                onChange={(e) => { setRiskFilter(e.target.value); setPage(1) }}
                className="input-field text-sm"
                style={{ background: 'rgba(255,255,255,0.05)' }}
              >
                {RISK_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value} className="bg-navy-800 text-white">{o.label}</option>
                ))}
              </select>

              <select
                value={methodFilter}
                onChange={(e) => { setMethodFilter(e.target.value); setPage(1) }}
                className="input-field text-sm"
                style={{ background: 'rgba(255,255,255,0.05)' }}
              >
                {METHOD_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value} className="bg-navy-800 text-white">{o.label}</option>
                ))}
              </select>

              <button onClick={resetFilters} className="btn-secondary flex items-center justify-center gap-2 text-sm">
                <RefreshCw size={13} />
                Reset
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 mt-3">
              <div className="relative">
                <Calendar size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
                <input type="date" value={startDate} onChange={(e) => { setStartDate(e.target.value); setPage(1) }} className="input-field pl-8 text-sm" />
              </div>
              <div className="relative">
                <Calendar size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
                <input type="date" value={endDate} onChange={(e) => { setEndDate(e.target.value); setPage(1) }} className="input-field pl-8 text-sm" />
              </div>
            </div>

            {(riskFilter !== 'all' || methodFilter !== 'all' || search) && (
              <div className="flex flex-wrap items-center gap-2 mt-3 pt-3 border-t border-white/5">
                <span className="text-white/30 text-xs">Active filters:</span>
                {riskFilter !== 'all' && <FraudBadge level={riskFilter as RiskLevel} size="sm" showIcon={false} />}
                {methodFilter !== 'all' && (
                  <span className="text-xs bg-neon-blue/10 border border-neon-blue/20 text-neon-blue px-2 py-0.5 rounded-full">
                    {methodFilter}
                  </span>
                )}
                {search && (
                  <span className="text-xs bg-white/5 border border-white/10 text-white/60 px-2 py-0.5 rounded-full">
                    &quot;{search}&quot;
                  </span>
                )}
                <span className="text-white/30 text-xs ml-auto">{totalCount} results</span>
              </div>
            )}
          </motion.div>

          {/* Table */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass-card border border-white/10 overflow-hidden"
          >
            <div className="p-4 border-b border-white/5 flex items-center justify-between">
              <p className="text-white/50 text-sm">
                Showing{' '}
                <span className="text-white font-medium">
                  {Math.min((page - 1) * limit + 1, totalCount)}–{Math.min(page * limit, totalCount)}
                </span>{' '}
                of <span className="text-white font-medium">{totalCount}</span> transactions
              </p>
              <Filter size={14} className="text-white/30" />
            </div>

            <TransactionTable transactions={transactions} loading={loading} showActions />

            {totalPages > 1 && (
              <div className="p-4 border-t border-white/5 flex items-center justify-between">
                <button
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page === 1}
                  className="btn-secondary flex items-center gap-1.5 text-sm px-3 py-2 disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <ChevronLeft size={14} />
                  Previous
                </button>

                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const pageNum = Math.max(1, Math.min(page - 2, totalPages - 4)) + i
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setPage(pageNum)}
                        className={`w-8 h-8 rounded-lg text-sm font-medium transition-all ${
                          pageNum === page
                            ? 'bg-neon-blue/20 border border-neon-blue/40 text-neon-blue'
                            : 'text-white/40 hover:text-white/70 hover:bg-white/5'
                        }`}
                      >
                        {pageNum}
                      </button>
                    )
                  })}
                </div>

                <button
                  onClick={() => setPage(Math.min(totalPages, page + 1))}
                  disabled={page === totalPages}
                  className="btn-secondary flex items-center gap-1.5 text-sm px-3 py-2 disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  Next
                  <ChevronRight size={14} />
                </button>
              </div>
            )}
          </motion.div>
        </div>
      </main>
    </div>
  )
}
