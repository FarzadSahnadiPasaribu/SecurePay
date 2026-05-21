'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  AreaChart, Area, PieChart, Pie, Cell,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer,
} from 'recharts'
import {
  AlertTriangle, CheckCircle2, Activity, FileSearch,
  Shield, Zap, RefreshCw, TrendingUp,
} from 'lucide-react'
import Navbar from '@/components/Navbar'
import Sidebar from '@/components/Sidebar'
import StatsCard from '@/components/StatsCard'
import FraudBadge from '@/components/FraudBadge'
import AlertBanner from '@/components/AlertBanner'
import { mockDashboardStats, mockTrendData, mockFraudDistribution, mockPaymentMethodData, mockTransactions } from '@/lib/mockData'
import { format } from 'date-fns'

function formatIDR(n: number) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n)
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="glass-card p-3 border border-white/20 text-xs">
        <p className="text-white/50 mb-2 font-medium">{label}</p>
        {payload.map((p: any) => (
          <p key={p.name} className="font-medium mb-0.5" style={{ color: p.color }}>
            {p.name}: {p.value}
          </p>
        ))}
      </div>
    )
  }
  return null
}

export default function DashboardPage() {
  const [loading, setLoading] = useState(true)
  const [lastUpdate, setLastUpdate] = useState(new Date())

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 900)
    return () => clearTimeout(t)
  }, [])

  const refresh = () => {
    setLoading(true)
    setLastUpdate(new Date())
    setTimeout(() => setLoading(false), 600)
  }

  const recent = mockTransactions.slice(0, 8)

  return (
    <div className="min-h-screen bg-navy-900">
      <Navbar />
      <Sidebar />

      <main className="pt-16 pl-16 md:pl-56 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-bold text-white">Dashboard Monitoring Fraud</h1>
              <p className="text-white/40 text-sm mt-1">Analitik transaksi real-time &amp; deteksi fraud AI</p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs text-white/30 hidden sm:block">
                Diperbarui: {format(lastUpdate, 'HH:mm:ss')}
              </span>
              <button
                onClick={refresh}
                className="p-2 rounded-xl glass-card border border-white/10 hover:border-neon-blue/30 transition-all text-white/40 hover:text-neon-blue"
              >
                <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
              </button>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-emerald-400 text-xs font-medium">Live</span>
              </div>
            </div>
          </div>

          {/* Alert */}
          <AlertBanner />

          {/* Stats Row 1 */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <StatsCard
              title="Total Transaksi"
              value={mockDashboardStats.totalTransactions.toLocaleString('id-ID')}
              icon={Activity}
              trend={9.5}
              trendLabel="vs bulan lalu"
              color="blue"
              delay={0}
            />
            <StatsCard
              title="Fraud Terdeteksi"
              value={mockDashboardStats.fraudDetected.toLocaleString('id-ID')}
              icon={AlertTriangle}
              trend={18.2}
              trendLabel="vs bulan lalu"
              color="red"
              delay={0.05}
            />
            <StatsCard
              title="Transaksi Normal"
              value={mockDashboardStats.normalTransactions.toLocaleString('id-ID')}
              icon={CheckCircle2}
              trend={8.1}
              trendLabel="vs bulan lalu"
              color="green"
              delay={0.1}
            />
            <StatsCard
              title="Anomaly Rate"
              value={`${mockDashboardStats.anomalyPercentage}%`}
              icon={Zap}
              trend={-1.2}
              trendLabel="membaik"
              color="amber"
              delay={0.15}
            />
          </div>

          {/* Stats Row 2 */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <StatsCard
              title="Invoices Scanned"
              value={mockDashboardStats.invoicesScanned.toLocaleString('id-ID')}
              icon={FileSearch}
              trend={28.4}
              color="cyan"
              delay={0.2}
            />
            <StatsCard
              title="High Risk"
              value={mockDashboardStats.highRisk.toString()}
              icon={AlertTriangle}
              trend={-5.1}
              color="red"
              delay={0.25}
              subtitle="Immediate action required"
            />
            <StatsCard
              title="Medium Risk"
              value={mockDashboardStats.mediumRisk.toString()}
              icon={Shield}
              trend={2.1}
              color="amber"
              delay={0.3}
              subtitle="Needs monitoring"
            />
            <StatsCard
              title="Low Risk"
              value={mockDashboardStats.lowRisk.toString()}
              icon={TrendingUp}
              trend={-3.4}
              color="green"
              delay={0.35}
              subtitle="Borderline normal"
            />
          </div>

          {/* Charts Row 1 */}
          <div className="grid lg:grid-cols-3 gap-6 mb-6">
            {/* Area chart */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="lg:col-span-2 glass-card p-6 border border-white/10"
            >
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-white font-semibold">Transaction Trend (30 Days)</h3>
                  <p className="text-white/40 text-xs mt-0.5">Normal vs Fraud over time</p>
                </div>
                <TrendingUp size={18} className="text-neon-blue" />
              </div>
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={mockTrendData}>
                  <defs>
                    <linearGradient id="normalGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="fraudGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="date" tick={{ fill: '#6b7280', fontSize: 10 }} tickLine={false} interval={6} />
                  <YAxis tick={{ fill: '#6b7280', fontSize: 10 }} tickLine={false} axisLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend formatter={(v) => <span className="text-xs text-white/50">{v}</span>} />
                  <Area type="monotone" dataKey="normal" stroke="#10b981" strokeWidth={2} fill="url(#normalGrad)" />
                  <Area type="monotone" dataKey="fraud" stroke="#ef4444" strokeWidth={2} fill="url(#fraudGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            </motion.div>

            {/* Pie chart */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45 }}
              className="glass-card p-6 border border-white/10"
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-white font-semibold">Risk Distribution</h3>
                  <p className="text-white/40 text-xs mt-0.5">Fraud classification</p>
                </div>
                <Shield size={18} className="text-neon-purple" />
              </div>
              <ResponsiveContainer width="100%" height={160}>
                <PieChart>
                  <Pie
                    data={mockFraudDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={48}
                    outerRadius={70}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {mockFraudDistribution.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(v: any) => [`${v}%`, '']}
                    contentStyle={{ background: '#0d1117', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, fontSize: 12 }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2 mt-2">
                {mockFraudDistribution.map((item) => (
                  <div key={item.name} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ background: item.color }} />
                      <span className="text-white/50">{item.name}</span>
                    </div>
                    <span className="text-white font-medium font-mono">{item.value}%</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Charts Row 2 */}
          <div className="grid lg:grid-cols-2 gap-6 mb-6">
            {/* Bar chart payment method */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="glass-card p-6 border border-white/10"
            >
              <h3 className="text-white font-semibold mb-1">Transactions by Payment Method</h3>
              <p className="text-white/40 text-xs mb-6">Transaction volume breakdown</p>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={mockPaymentMethodData} barSize={14}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="method" tick={{ fill: '#6b7280', fontSize: 10 }} tickLine={false} />
                  <YAxis tick={{ fill: '#6b7280', fontSize: 10 }} tickLine={false} axisLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend formatter={(v) => <span className="text-xs text-white/50">{v}</span>} />
                  <Bar dataKey="count" name="Transactions" fill="#00d4ff" radius={[4, 4, 0, 0]} fillOpacity={0.8} />
                </BarChart>
              </ResponsiveContainer>
            </motion.div>

            {/* Recent transactions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.55 }}
              className="glass-card p-6 border border-white/10"
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-white font-semibold">Recent Transactions</h3>
                  <p className="text-white/40 text-xs mt-0.5">Real-time monitoring</p>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-emerald-400 text-xs">Live</span>
                </div>
              </div>
              <div className="space-y-1.5 overflow-y-auto" style={{ maxHeight: 250 }}>
                {recent.map((tx, i) => (
                  <motion.div
                    key={tx.id}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6 + i * 0.04 }}
                    className="flex items-center justify-between p-2.5 rounded-xl hover:bg-white/5 transition-colors"
                  >
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      <div
                        className={`w-8 h-8 rounded-lg flex-shrink-0 flex items-center justify-center ${
                          tx.riskLevel === 'HIGH'
                            ? 'bg-red-500/15'
                            : tx.riskLevel === 'MEDIUM'
                            ? 'bg-amber-500/15'
                            : tx.riskLevel === 'LOW'
                            ? 'bg-emerald-500/15'
                            : 'bg-blue-500/15'
                        }`}
                      >
                        {tx.riskLevel === 'HIGH' || tx.riskLevel === 'MEDIUM' ? (
                          <AlertTriangle
                            size={14}
                            className={tx.riskLevel === 'HIGH' ? 'text-red-400' : 'text-amber-400'}
                          />
                        ) : (
                          <CheckCircle2 size={14} className={tx.riskLevel === 'LOW' ? 'text-emerald-400' : 'text-blue-400'} />
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="text-white text-xs font-medium truncate">{tx.merchantName}</p>
                        <p className="text-white/30 text-[10px]">{tx.paymentMethod} · {format(new Date(tx.date), 'HH:mm')}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                      <FraudBadge level={tx.riskLevel} size="sm" showIcon={false} />
                      <span className="text-white/70 text-xs font-mono hidden sm:block">
                        {formatIDR(tx.amount)}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </main>
    </div>
  )
}
