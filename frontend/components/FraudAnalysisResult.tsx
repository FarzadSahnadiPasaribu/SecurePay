'use client'

import { motion } from 'framer-motion'
import { Shield, AlertTriangle, Activity, Eye, Percent, CheckCircle2 } from 'lucide-react'
import FraudBadge from './FraudBadge'
import type { FraudAnalysisResult as FraudResult } from '@/lib/mockData'

interface Props {
  result: FraudResult
}

function MetricBar({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between text-xs">
        <span className="text-white/50">{label}</span>
        <span className={`font-mono font-semibold ${color}`}>{value.toFixed(1)}%</span>
      </div>
      <div className="h-2 bg-white/10 rounded-full overflow-hidden">
        <motion.div
          className={`h-full rounded-full ${color.replace('text-', 'bg-').replace('/80', '').replace('/60', '')}`}
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 1, ease: 'easeOut', delay: 0.3 }}
        />
      </div>
    </div>
  )
}

export default function FraudAnalysisResult({ result }: Props) {
  const isHighRisk = result.status === 'HIGH'
  const isMediumRisk = result.status === 'MEDIUM'

  const bgColor = isHighRisk
    ? 'border-red-500/30 bg-red-500/5'
    : isMediumRisk
    ? 'border-amber-500/30 bg-amber-500/5'
    : result.status === 'LOW'
    ? 'border-emerald-500/30 bg-emerald-500/5'
    : 'border-blue-500/30 bg-blue-500/5'

  const glowColor = isHighRisk
    ? '0 0 30px rgba(239,68,68,0.15)'
    : isMediumRisk
    ? '0 0 30px rgba(245,158,11,0.15)'
    : '0 0 30px rgba(16,185,129,0.15)'

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className={`glass-card border p-6 ${bgColor}`}
      style={{ boxShadow: glowColor }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div
            className={`w-12 h-12 rounded-xl flex items-center justify-center ${
              isHighRisk ? 'bg-red-500/20' : isMediumRisk ? 'bg-amber-500/20' : 'bg-emerald-500/20'
            }`}
          >
            {isHighRisk || isMediumRisk ? (
              <AlertTriangle size={22} className={isHighRisk ? 'text-red-400' : 'text-amber-400'} />
            ) : (
              <Shield size={22} className="text-emerald-400" />
            )}
          </div>
          <div>
            <p className="text-white/50 text-xs uppercase tracking-wider font-medium">Fraud Analysis Result</p>
            <p className="text-white/30 text-xs font-mono mt-0.5">{result.transactionId}</p>
          </div>
        </div>
        <FraudBadge level={result.status} size="lg" pulse={isHighRisk} />
      </div>

      {/* Score Grid */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        {[
          {
            icon: Activity,
            label: 'Anomaly Score',
            value: result.anomalyScore.toFixed(3),
            sub: '(0–1 scale)',
            color: isHighRisk ? 'text-red-400' : 'text-amber-400',
          },
          {
            icon: Percent,
            label: 'Fraud Probability',
            value: `${result.fraudProbability.toFixed(1)}%`,
            sub: 'ML prediction',
            color: isHighRisk ? 'text-red-400' : 'text-amber-400',
          },
          {
            icon: Eye,
            label: 'OCR Confidence',
            value: `${result.ocrConfidence.toFixed(1)}%`,
            sub: 'Text extraction',
            color: 'text-neon-cyan',
          },
          {
            icon: AlertTriangle,
            label: 'Manipulation Score',
            value: `${result.manipulationScore.toFixed(1)}%`,
            sub: 'Image integrity',
            color: result.manipulationScore > 50 ? 'text-red-400' : 'text-amber-400',
          },
        ].map((metric) => {
          const Icon = metric.icon
          return (
            <div
              key={metric.label}
              className="bg-white/5 border border-white/10 rounded-xl p-4 text-center"
            >
              <div className="flex justify-center mb-2">
                <Icon size={16} className={metric.color} />
              </div>
              <p className={`text-2xl font-bold font-mono ${metric.color}`}>{metric.value}</p>
              <p className="text-white/50 text-xs mt-1">{metric.label}</p>
              <p className="text-white/25 text-xs">{metric.sub}</p>
            </div>
          )
        })}
      </div>

      {/* Metric bars */}
      <div className="space-y-3 mb-6 bg-white/3 rounded-xl p-4 border border-white/5">
        <p className="text-white/40 text-xs uppercase tracking-wider font-medium mb-3">Score Breakdown</p>
        <MetricBar label="Fraud Probability" value={result.fraudProbability} color="text-red-400" />
        <MetricBar label="OCR Confidence" value={result.ocrConfidence} color="text-neon-cyan" />
        <MetricBar label="Manipulation Score" value={result.manipulationScore} color="text-amber-400" />
      </div>

      {/* Detected Indicators */}
      {result.indicators.length > 0 && (
        <div>
          <p className="text-white/40 text-xs uppercase tracking-wider font-medium mb-3 flex items-center gap-2">
            <AlertTriangle size={12} className="text-red-400" />
            Detected Indicators ({result.indicators.length})
          </p>
          <div className="space-y-2">
            {result.indicators.map((indicator, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + i * 0.07 }}
                className="flex items-start gap-2 bg-red-500/5 border border-red-500/15 rounded-lg p-2.5"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-red-400 mt-1.5 flex-shrink-0" />
                <span className="text-white/70 text-xs leading-relaxed">{indicator}</span>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {result.indicators.length === 0 && (
        <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4">
          <CheckCircle2 size={16} className="text-emerald-400" />
          <span className="text-emerald-400 text-sm">No suspicious indicators detected</span>
        </div>
      )}
    </motion.div>
  )
}
