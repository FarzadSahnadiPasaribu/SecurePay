'use client'

import { motion } from 'framer-motion'
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  ScatterChart, Scatter,
} from 'recharts'
import {
  BarChart3, Target, TrendingUp, Activity, CheckCircle2, AlertTriangle,
} from 'lucide-react'
import Navbar from '@/components/Navbar'
import Sidebar from '@/components/Sidebar'
import {
  mockAnomalyDistribution,
  mockTrendData,
  mockPaymentMethodData,
  mockFraudDistribution,
  mockModelMetrics,
  mockROCData,
} from '@/lib/mockData'

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="glass-card p-3 border border-white/20 text-xs">
        <p className="text-white/50 mb-2">{label}</p>
        {payload.map((p: any) => (
          <p key={p.name} className="font-medium" style={{ color: p.color || p.fill }}>
            {p.name}: {p.value}
          </p>
        ))}
      </div>
    )
  }
  return null
}

const datasetStats = [
  { label: 'Total Samples', value: '10,000', color: 'text-neon-blue' },
  { label: 'Fraud Cases', value: '800 (8%)', color: 'text-red-400' },
  { label: 'Normal Cases', value: '9,200 (92%)', color: 'text-emerald-400' },
  { label: 'Features Used', value: '24 features', color: 'text-neon-cyan' },
  { label: 'Train / Test Split', value: '80% / 20%', color: 'text-amber-400' },
  { label: 'Cross-Validation', value: '5-fold CV', color: 'text-purple-400' },
]

// Heatmap correlation data
const correlationFeatures = ['Amount', 'Hour', 'Method', 'Freq', 'Location', 'Score']
const correlationData = correlationFeatures.map((feat, i) =>
  correlationFeatures.map((_, j) => {
    if (i === j) return 1.0
    const base = Math.abs(Math.sin(i * 7 + j * 3)) * 0.8
    return Math.round(base * 100) / 100
  })
)

export default function AnalyticsPage() {
  return (
    <div className="min-h-screen bg-navy-900">
      <Navbar />
      <Sidebar />

      <main className="pt-16 pl-16 md:pl-56 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-8">
          {/* Header */}
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-neon-blue/10 border border-neon-blue/20 flex items-center justify-center">
                <BarChart3 size={20} className="text-neon-blue" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Analytics</h1>
                <p className="text-white/40 text-sm">Dataset statistics &amp; ML model evaluation</p>
              </div>
            </div>
          </motion.div>

          {/* Dataset Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass-card p-6 border border-white/10 mb-6"
          >
            <h2 className="text-white font-semibold mb-4 flex items-center gap-2">
              <Activity size={16} className="text-neon-blue" />
              Dataset Overview
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {datasetStats.map((stat, i) => (
                <div key={i} className="bg-white/3 rounded-xl p-4 border border-white/5 text-center">
                  <p className={`text-lg font-bold font-mono ${stat.color}`}>{stat.value}</p>
                  <p className="text-white/40 text-xs mt-1">{stat.label}</p>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Charts Row 1 */}
          <div className="grid lg:grid-cols-2 gap-6 mb-6">
            {/* Class Distribution */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="glass-card p-6 border border-white/10"
            >
              <h3 className="text-white font-semibold mb-1">Class Distribution</h3>
              <p className="text-white/40 text-xs mb-4">Normal vs Fraud sample counts</p>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart
                  data={[
                    { name: 'Normal', count: 9200, fill: '#10b981' },
                    { name: 'High Risk', count: 800, fill: '#ef4444' },
                    { name: 'Medium Risk', count: 1200, fill: '#f59e0b' },
                    { name: 'Low Risk', count: 1000, fill: '#3b82f6' },
                  ]}
                  barSize={40}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="name" tick={{ fill: '#6b7280', fontSize: 11 }} tickLine={false} />
                  <YAxis tick={{ fill: '#6b7280', fontSize: 10 }} tickLine={false} axisLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="count" name="Samples" radius={[6, 6, 0, 0]}>
                    {[{ fill: '#10b981' }, { fill: '#ef4444' }, { fill: '#f59e0b' }, { fill: '#3b82f6' }].map((entry, i) => (
                      <Cell key={i} fill={entry.fill} fillOpacity={0.8} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </motion.div>

            {/* Anomaly Score Distribution */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="glass-card p-6 border border-white/10"
            >
              <h3 className="text-white font-semibold mb-1">Anomaly Score Distribution</h3>
              <p className="text-white/40 text-xs mb-4">Histogram of anomaly scores</p>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={mockAnomalyDistribution} barSize={10}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="range" tick={{ fill: '#6b7280', fontSize: 9 }} tickLine={false} interval={3} />
                  <YAxis tick={{ fill: '#6b7280', fontSize: 10 }} tickLine={false} axisLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend formatter={(v) => <span className="text-xs text-white/50">{v}</span>} />
                  <Bar dataKey="count" name="Normal" fill="#10b981" fillOpacity={0.8} radius={[2, 2, 0, 0]} />
                  <Bar dataKey="fraud" name="Fraud" fill="#ef4444" fillOpacity={0.8} radius={[2, 2, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </motion.div>
          </div>

          {/* Charts Row 2 */}
          <div className="grid lg:grid-cols-2 gap-6 mb-6">
            {/* Trend line */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className="glass-card p-6 border border-white/10"
            >
              <h3 className="text-white font-semibold mb-1">Transactions Per Day</h3>
              <p className="text-white/40 text-xs mb-4">30-day trend</p>
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={mockTrendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="date" tick={{ fill: '#6b7280', fontSize: 10 }} tickLine={false} interval={6} />
                  <YAxis tick={{ fill: '#6b7280', fontSize: 10 }} tickLine={false} axisLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend formatter={(v) => <span className="text-xs text-white/50">{v}</span>} />
                  <Line type="monotone" dataKey="total" name="Total" stroke="#00d4ff" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="fraud" name="Fraud" stroke="#ef4444" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </motion.div>

            {/* Pie chart by payment method */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="glass-card p-6 border border-white/10"
            >
              <h3 className="text-white font-semibold mb-1">Transactions by Payment Method</h3>
              <p className="text-white/40 text-xs mb-4">Distribution by method</p>
              <div className="flex items-center gap-4">
                <ResponsiveContainer width="55%" height={200}>
                  <PieChart>
                    <Pie
                      data={mockPaymentMethodData}
                      dataKey="count"
                      nameKey="method"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      paddingAngle={2}
                    >
                      {mockPaymentMethodData.map((_, i) => (
                        <Cell
                          key={i}
                          fill={['#00d4ff', '#7c3aed', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#6b7280'][i % 7]}
                          fillOpacity={0.85}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(v: any, n: any) => [v, n]}
                      contentStyle={{ background: '#0d1117', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, fontSize: 11 }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex-1 space-y-1.5">
                  {mockPaymentMethodData.map((item, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs">
                      <div
                        className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                        style={{ background: ['#00d4ff', '#7c3aed', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#6b7280'][i % 7] }}
                      />
                      <span className="text-white/50 flex-1">{item.method}</span>
                      <span className="text-white font-medium font-mono">{item.count}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>

          {/* Correlation Heatmap */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="glass-card p-6 border border-white/10 mb-6"
          >
            <h3 className="text-white font-semibold mb-1">Feature Correlation Heatmap</h3>
            <p className="text-white/40 text-xs mb-5">Correlation between key transaction features</p>

            <div className="overflow-x-auto">
              <div className="inline-block min-w-full">
                {/* Header row */}
                <div className="flex ml-20">
                  {correlationFeatures.map((f) => (
                    <div key={f} className="w-14 text-center text-xs text-white/40 font-medium pb-2">{f}</div>
                  ))}
                </div>
                {/* Rows */}
                {correlationFeatures.map((rowFeat, i) => (
                  <div key={rowFeat} className="flex items-center gap-0">
                    <div className="w-20 text-xs text-white/40 font-medium text-right pr-3">{rowFeat}</div>
                    {correlationData[i].map((val, j) => {
                      const intensity = Math.abs(val)
                      const isPositive = val >= 0
                      const alpha = 0.1 + intensity * 0.8
                      const bg = i === j
                        ? `rgba(0, 212, 255, ${alpha})`
                        : isPositive
                        ? `rgba(16, 185, 129, ${alpha})`
                        : `rgba(239, 68, 68, ${alpha})`
                      return (
                        <div
                          key={j}
                          className="w-14 h-10 flex items-center justify-center text-xs font-mono transition-all hover:brightness-125 cursor-default"
                          style={{ background: bg, border: '1px solid rgba(255,255,255,0.05)' }}
                          title={`${rowFeat} × ${correlationFeatures[j]}: ${val}`}
                        >
                          <span className="text-white/80 text-[11px]">{val.toFixed(2)}</span>
                        </div>
                      )
                    })}
                  </div>
                ))}
                {/* Color legend */}
                <div className="flex items-center gap-4 mt-4 ml-20 text-xs text-white/40">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-3 rounded" style={{ background: 'rgba(16,185,129,0.8)' }} />
                    <span>Positive correlation</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-3 rounded" style={{ background: 'rgba(239,68,68,0.8)' }} />
                    <span>Negative correlation</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-3 rounded" style={{ background: 'rgba(0,212,255,0.8)' }} />
                    <span>Self (1.0)</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Model Evaluation */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mb-6"
          >
            <h2 className="text-white font-semibold mb-4 flex items-center gap-2">
              <Target size={18} className="text-neon-cyan" />
              Model Evaluation
            </h2>

            {/* Metric cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              {[
                { label: 'Accuracy', value: mockModelMetrics.accuracy, color: 'text-neon-blue', border: 'border-neon-blue/20', icon: CheckCircle2 },
                { label: 'Precision', value: mockModelMetrics.precision, color: 'text-neon-cyan', border: 'border-neon-cyan/20', icon: Target },
                { label: 'Recall', value: mockModelMetrics.recall, color: 'text-emerald-400', border: 'border-emerald-500/20', icon: TrendingUp },
                { label: 'F1-Score', value: mockModelMetrics.f1Score, color: 'text-amber-400', border: 'border-amber-500/20', icon: Activity },
              ].map((metric, i) => {
                const Icon = metric.icon
                return (
                  <motion.div
                    key={metric.label}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.45 + i * 0.05 }}
                    className={`glass-card p-5 border ${metric.border} text-center`}
                  >
                    <Icon size={20} className={`${metric.color} mx-auto mb-2`} />
                    <p className={`text-3xl font-bold font-mono ${metric.color}`}>
                      {metric.value.toFixed(1)}%
                    </p>
                    <p className="text-white/50 text-sm mt-1">{metric.label}</p>
                    {/* Circular progress indicator */}
                    <div className="mt-3 relative w-12 h-12 mx-auto">
                      <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                        <circle cx="18" cy="18" r="15" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="2" />
                        <circle
                          cx="18" cy="18" r="15"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeDasharray={`${(metric.value / 100) * 94.2} 94.2`}
                          className={metric.color}
                        />
                      </svg>
                      <span className="absolute inset-0 flex items-center justify-center text-[9px] font-mono text-white/50">
                        {metric.value.toFixed(0)}
                      </span>
                    </div>
                  </motion.div>
                )
              })}
            </div>

            {/* Confusion Matrix + ROC */}
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Confusion Matrix */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="glass-card p-6 border border-white/10"
              >
                <h3 className="text-white font-semibold mb-1">Confusion Matrix</h3>
                <p className="text-white/40 text-xs mb-5">Model prediction results on test set</p>

                <div className="max-w-xs mx-auto">
                  <div className="grid grid-cols-2 gap-2 mb-2">
                    <div />
                    <div className="text-center text-xs text-white/40 font-medium">Predicted</div>
                  </div>
                  <div className="flex gap-2">
                    <div className="flex items-center justify-center">
                      <span
                        className="text-xs text-white/40 font-medium"
                        style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}
                      >
                        Actual
                      </span>
                    </div>
                    <div className="flex-1">
                      <div className="grid grid-cols-2 gap-0.5 text-xs text-center mb-1">
                        <div />
                        <div className="flex gap-0.5">
                          <span className="flex-1 text-white/40 pb-1">Fraud</span>
                          <span className="flex-1 text-white/40 pb-1">Normal</span>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 gap-0.5">
                        {/* Row: Actual Fraud */}
                        <div className="flex gap-0.5">
                          <span className="w-12 text-xs text-white/40 flex items-center justify-end pr-2">Fraud</span>
                          <div
                            className="flex-1 p-4 rounded-tl-lg text-center"
                            style={{ background: 'rgba(16,185,129,0.25)', border: '1px solid rgba(16,185,129,0.3)' }}
                          >
                            <p className="text-2xl font-bold text-emerald-400">{mockModelMetrics.confusionMatrix.truePositive}</p>
                            <p className="text-xs text-emerald-400/70 mt-0.5">TP</p>
                          </div>
                          <div
                            className="flex-1 p-4 rounded-tr-lg text-center"
                            style={{ background: 'rgba(239,68,68,0.2)', border: '1px solid rgba(239,68,68,0.25)' }}
                          >
                            <p className="text-2xl font-bold text-red-400">{mockModelMetrics.confusionMatrix.falseNegative}</p>
                            <p className="text-xs text-red-400/70 mt-0.5">FN</p>
                          </div>
                        </div>
                        {/* Row: Actual Normal */}
                        <div className="flex gap-0.5">
                          <span className="w-12 text-xs text-white/40 flex items-center justify-end pr-2">Normal</span>
                          <div
                            className="flex-1 p-4 rounded-bl-lg text-center"
                            style={{ background: 'rgba(239,68,68,0.2)', border: '1px solid rgba(239,68,68,0.25)' }}
                          >
                            <p className="text-2xl font-bold text-red-400">{mockModelMetrics.confusionMatrix.falsePositive}</p>
                            <p className="text-xs text-red-400/70 mt-0.5">FP</p>
                          </div>
                          <div
                            className="flex-1 p-4 rounded-br-lg text-center"
                            style={{ background: 'rgba(16,185,129,0.25)', border: '1px solid rgba(16,185,129,0.3)' }}
                          >
                            <p className="text-2xl font-bold text-emerald-400">{mockModelMetrics.confusionMatrix.trueNegative}</p>
                            <p className="text-xs text-emerald-400/70 mt-0.5">TN</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* ROC Curve */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.55 }}
                className="glass-card p-6 border border-white/10"
              >
                <div className="flex items-center justify-between mb-1">
                  <h3 className="text-white font-semibold">ROC Curve</h3>
                  <span
                    className="text-xs font-mono bg-neon-blue/10 border border-neon-blue/20 px-2 py-1 rounded-full text-neon-blue"
                  >
                    AUC = {mockModelMetrics.auc}
                  </span>
                </div>
                <p className="text-white/40 text-xs mb-4">Receiver Operating Characteristic</p>
                <ResponsiveContainer width="100%" height={220}>
                  <LineChart data={mockROCData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis
                      dataKey="fpr"
                      tick={{ fill: '#6b7280', fontSize: 10 }}
                      tickLine={false}
                      label={{ value: 'False Positive Rate', position: 'insideBottom', offset: -2, fill: '#6b7280', fontSize: 10 }}
                    />
                    <YAxis
                      tick={{ fill: '#6b7280', fontSize: 10 }}
                      tickLine={false}
                      axisLine={false}
                      label={{ value: 'True Positive Rate', angle: -90, position: 'insideLeft', fill: '#6b7280', fontSize: 10 }}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    {/* Diagonal reference line (random classifier) */}
                    <Line
                      data={[{ fpr: 0, tpr: 0 }, { fpr: 1, tpr: 1 }]}
                      type="linear"
                      dataKey="tpr"
                      stroke="rgba(255,255,255,0.15)"
                      strokeDasharray="5 5"
                      strokeWidth={1}
                      dot={false}
                    />
                    <Line
                      type="monotone"
                      dataKey="tpr"
                      name="ROC"
                      stroke="#00d4ff"
                      strokeWidth={2.5}
                      dot={false}
                      style={{ filter: 'drop-shadow(0 0 4px rgba(0,212,255,0.5))' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  )
}
