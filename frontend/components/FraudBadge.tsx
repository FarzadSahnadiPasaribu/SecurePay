'use client'

import { AlertTriangle, AlertCircle, CheckCircle, Info } from 'lucide-react'
import type { RiskLevel } from '@/lib/mockData'

interface FraudBadgeProps {
  level: RiskLevel
  size?: 'sm' | 'md' | 'lg'
  showIcon?: boolean
  pulse?: boolean
}

const badgeConfig = {
  HIGH: {
    className: 'bg-red-500/20 text-red-400 border-red-500/40',
    icon: AlertTriangle,
    label: 'HIGH RISK',
    glow: 'shadow-[0_0_12px_rgba(239,68,68,0.4)]',
  },
  MEDIUM: {
    className: 'bg-amber-500/20 text-amber-400 border-amber-500/40',
    icon: AlertCircle,
    label: 'MEDIUM RISK',
    glow: 'shadow-[0_0_12px_rgba(245,158,11,0.4)]',
  },
  LOW: {
    className: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40',
    icon: Info,
    label: 'LOW RISK',
    glow: 'shadow-[0_0_12px_rgba(16,185,129,0.3)]',
  },
  NORMAL: {
    className: 'bg-blue-500/20 text-blue-400 border-blue-500/40',
    icon: CheckCircle,
    label: 'NORMAL',
    glow: 'shadow-[0_0_12px_rgba(59,130,246,0.3)]',
  },
}

const sizeConfig = {
  sm: 'px-2 py-0.5 text-xs gap-1',
  md: 'px-3 py-1 text-xs gap-1.5',
  lg: 'px-4 py-2 text-sm gap-2',
}

export default function FraudBadge({ level, size = 'md', showIcon = true, pulse = false }: FraudBadgeProps) {
  const config = badgeConfig[level]
  const Icon = config.icon

  return (
    <span
      className={`
        inline-flex items-center font-semibold uppercase tracking-wider rounded-full border
        ${config.className}
        ${sizeConfig[size]}
        ${config.glow}
        ${pulse && level === 'HIGH' ? 'animate-pulse' : ''}
      `}
    >
      {showIcon && <Icon size={size === 'lg' ? 16 : 12} />}
      {config.label}
    </span>
  )
}
