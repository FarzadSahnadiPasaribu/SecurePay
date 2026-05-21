'use client'

import { motion } from 'framer-motion'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

interface StatsCardProps {
  title: string
  value: string | number
  icon: LucideIcon
  trend?: number
  trendLabel?: string
  color?: 'blue' | 'red' | 'green' | 'amber' | 'purple' | 'cyan'
  subtitle?: string
  delay?: number
}

const colorMap = {
  blue: {
    icon: 'text-neon-blue',
    bg: 'bg-neon-blue/10',
    border: 'border-neon-blue/20',
    glow: 'hover:shadow-[0_0_20px_rgba(0,212,255,0.2)]',
    value: 'text-neon-blue',
  },
  red: {
    icon: 'text-red-400',
    bg: 'bg-red-500/10',
    border: 'border-red-500/20',
    glow: 'hover:shadow-[0_0_20px_rgba(239,68,68,0.2)]',
    value: 'text-red-400',
  },
  green: {
    icon: 'text-emerald-400',
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/20',
    glow: 'hover:shadow-[0_0_20px_rgba(16,185,129,0.2)]',
    value: 'text-emerald-400',
  },
  amber: {
    icon: 'text-amber-400',
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/20',
    glow: 'hover:shadow-[0_0_20px_rgba(245,158,11,0.2)]',
    value: 'text-amber-400',
  },
  purple: {
    icon: 'text-purple-400',
    bg: 'bg-purple-500/10',
    border: 'border-purple-500/20',
    glow: 'hover:shadow-[0_0_20px_rgba(124,58,237,0.2)]',
    value: 'text-purple-400',
  },
  cyan: {
    icon: 'text-neon-cyan',
    bg: 'bg-neon-cyan/10',
    border: 'border-neon-cyan/20',
    glow: 'hover:shadow-[0_0_20px_rgba(0,255,204,0.2)]',
    value: 'text-neon-cyan',
  },
}

export default function StatsCard({
  title,
  value,
  icon: Icon,
  trend,
  trendLabel,
  color = 'blue',
  subtitle,
  delay = 0,
}: StatsCardProps) {
  const colors = colorMap[color]
  const isPositiveTrend = trend !== undefined && trend > 0
  const isNeutral = trend === undefined || trend === 0

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className={`
        glass-card p-5 border transition-all duration-300 cursor-default
        ${colors.border}
        ${colors.glow}
        group relative overflow-hidden
      `}
    >
      {/* Background glow */}
      <div
        className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 ${colors.bg} rounded-2xl`}
      />

      <div className="relative z-10">
        <div className="flex items-start justify-between mb-3">
          <div className={`w-10 h-10 rounded-xl ${colors.bg} flex items-center justify-center`}>
            <Icon size={20} className={colors.icon} />
          </div>

          {trend !== undefined && (
            <div
              className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full ${
                isNeutral
                  ? 'text-white/40 bg-white/5'
                  : isPositiveTrend
                  ? 'text-emerald-400 bg-emerald-500/10'
                  : 'text-red-400 bg-red-500/10'
              }`}
            >
              {isNeutral ? (
                <Minus size={10} />
              ) : isPositiveTrend ? (
                <TrendingUp size={10} />
              ) : (
                <TrendingDown size={10} />
              )}
              {trend !== 0 && `${Math.abs(trend)}%`}
            </div>
          )}
        </div>

        <div className="space-y-1">
          <p className="text-white/50 text-xs font-medium uppercase tracking-wider">{title}</p>
          <motion.p
            className={`text-2xl font-bold ${colors.value}`}
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.3, delay: delay + 0.2 }}
          >
            {value}
          </motion.p>
          {subtitle && <p className="text-white/40 text-xs">{subtitle}</p>}
          {trendLabel && <p className="text-white/30 text-xs">{trendLabel}</p>}
        </div>
      </div>
    </motion.div>
  )
}
