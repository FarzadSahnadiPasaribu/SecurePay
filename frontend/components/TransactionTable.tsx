'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { ChevronUp, ChevronDown, ExternalLink, ArrowUpDown } from 'lucide-react'
import FraudBadge from './FraudBadge'
import type { Transaction } from '@/lib/mockData'
import { format } from 'date-fns'

interface TransactionTableProps {
  transactions: Transaction[]
  loading?: boolean
  showActions?: boolean
}

type SortKey = 'date' | 'amount' | 'anomalyScore' | 'fraudProbability'
type SortDir = 'asc' | 'desc'

function formatIDR(amount: number): string {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(amount)
}

export default function TransactionTable({ transactions, loading, showActions = true }: TransactionTableProps) {
  const [sortKey, setSortKey] = useState<SortKey>('date')
  const [sortDir, setSortDir] = useState<SortDir>('desc')

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc')
    } else {
      setSortKey(key)
      setSortDir('desc')
    }
  }

  const sorted = [...transactions].sort((a, b) => {
    let diff = 0
    if (sortKey === 'date') diff = new Date(a.date).getTime() - new Date(b.date).getTime()
    else if (sortKey === 'amount') diff = a.amount - b.amount
    else if (sortKey === 'anomalyScore') diff = a.anomalyScore - b.anomalyScore
    else if (sortKey === 'fraudProbability') diff = a.fraudProbability - b.fraudProbability
    return sortDir === 'asc' ? diff : -diff
  })

  const SortIcon = ({ col }: { col: SortKey }) => {
    if (sortKey !== col) return <ArrowUpDown size={12} className="text-white/20" />
    return sortDir === 'asc' ? (
      <ChevronUp size={12} className="text-neon-blue" />
    ) : (
      <ChevronDown size={12} className="text-neon-blue" />
    )
  }

  if (loading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-12 bg-white/5 rounded-lg animate-pulse" />
        ))}
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-white/10">
            <th className="text-left py-3 px-4 text-white/40 font-medium text-xs uppercase tracking-wider">
              Invoice ID
            </th>
            <th className="text-left py-3 px-4 text-white/40 font-medium text-xs uppercase tracking-wider">
              Merchant
            </th>
            <th
              className="text-left py-3 px-4 text-white/40 font-medium text-xs uppercase tracking-wider cursor-pointer hover:text-white/70"
              onClick={() => handleSort('date')}
            >
              <span className="flex items-center gap-1">
                Date <SortIcon col="date" />
              </span>
            </th>
            <th
              className="text-right py-3 px-4 text-white/40 font-medium text-xs uppercase tracking-wider cursor-pointer hover:text-white/70"
              onClick={() => handleSort('amount')}
            >
              <span className="flex items-center justify-end gap-1">
                Amount <SortIcon col="amount" />
              </span>
            </th>
            <th className="text-left py-3 px-4 text-white/40 font-medium text-xs uppercase tracking-wider">
              Method
            </th>
            <th
              className="text-center py-3 px-4 text-white/40 font-medium text-xs uppercase tracking-wider cursor-pointer hover:text-white/70"
              onClick={() => handleSort('anomalyScore')}
            >
              <span className="flex items-center justify-center gap-1">
                Score <SortIcon col="anomalyScore" />
              </span>
            </th>
            <th className="text-center py-3 px-4 text-white/40 font-medium text-xs uppercase tracking-wider">
              Risk
            </th>
            {showActions && (
              <th className="text-center py-3 px-4 text-white/40 font-medium text-xs uppercase tracking-wider">
                Actions
              </th>
            )}
          </tr>
        </thead>
        <tbody>
          {sorted.map((tx, i) => (
            <motion.tr
              key={tx.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.02 }}
              className="table-row-hover border-b border-white/5 hover:bg-white/3 transition-colors group"
            >
              <td className="py-3 px-4">
                <span className="font-mono text-xs text-neon-blue/80">{tx.transactionRef.slice(0, 14)}</span>
              </td>
              <td className="py-3 px-4">
                <div>
                  <p className="text-white/90 font-medium text-xs leading-tight">{tx.merchantName}</p>
                  <p className="text-white/30 text-xs">{tx.merchantCategory}</p>
                </div>
              </td>
              <td className="py-3 px-4">
                <div>
                  <p className="text-white/70 text-xs">{format(new Date(tx.date), 'dd MMM yyyy')}</p>
                  <p className="text-white/30 text-xs">{format(new Date(tx.date), 'HH:mm')}</p>
                </div>
              </td>
              <td className="py-3 px-4 text-right">
                <span className="font-mono text-xs font-semibold text-white/90">
                  {formatIDR(tx.amount)}
                </span>
              </td>
              <td className="py-3 px-4">
                <span className="text-xs text-white/60 bg-white/5 border border-white/10 px-2 py-0.5 rounded-full">
                  {tx.paymentMethod}
                </span>
              </td>
              <td className="py-3 px-4 text-center">
                <div className="flex items-center justify-center gap-2">
                  <div className="w-12 h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        tx.anomalyScore > 0.7
                          ? 'bg-red-500'
                          : tx.anomalyScore > 0.45
                          ? 'bg-amber-500'
                          : tx.anomalyScore > 0.2
                          ? 'bg-emerald-500'
                          : 'bg-blue-500'
                      }`}
                      style={{ width: `${tx.anomalyScore * 100}%` }}
                    />
                  </div>
                  <span className="font-mono text-xs text-white/50">{tx.anomalyScore.toFixed(2)}</span>
                </div>
              </td>
              <td className="py-3 px-4 text-center">
                <FraudBadge level={tx.riskLevel} size="sm" showIcon={false} />
              </td>
              {showActions && (
                <td className="py-3 px-4 text-center">
                  <button className="p-1.5 rounded-lg hover:bg-neon-blue/10 transition-colors opacity-0 group-hover:opacity-100">
                    <ExternalLink size={12} className="text-neon-blue" />
                  </button>
                </td>
              )}
            </motion.tr>
          ))}
        </tbody>
      </table>

      {sorted.length === 0 && (
        <div className="text-center py-12 text-white/30">
          <p>No transactions found</p>
        </div>
      )}
    </div>
  )
}
