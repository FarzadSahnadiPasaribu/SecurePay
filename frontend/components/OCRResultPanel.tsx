'use client'

import { motion } from 'framer-motion'
import { DollarSign, Calendar, Store, Hash, CreditCard, User, ArrowRight } from 'lucide-react'
import type { OCRExtractedData } from '@/lib/mockData'
import { format } from 'date-fns'

interface OCRResultPanelProps {
  data: OCRExtractedData
  confidence?: number
}

function formatIDR(amount: number): string {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(amount)
}

export default function OCRResultPanel({ data, confidence = 92.3 }: OCRResultPanelProps) {
  const fields = [
    {
      icon: DollarSign,
      label: 'Transaction Amount',
      value: formatIDR(data.amount),
      highlight: true,
      color: 'text-neon-cyan',
    },
    {
      icon: Calendar,
      label: 'Transaction Date',
      value: format(new Date(data.date), 'dd MMMM yyyy, HH:mm'),
      color: 'text-white/90',
    },
    {
      icon: Store,
      label: 'Merchant Name',
      value: data.merchantName,
      color: 'text-white/90',
    },
    {
      icon: Hash,
      label: 'Account Number',
      value: data.accountNumber,
      color: 'text-neon-blue font-mono',
    },
    {
      icon: CreditCard,
      label: 'Payment Method',
      value: data.paymentMethod,
      color: 'text-white/90',
    },
    {
      icon: Hash,
      label: 'Transaction ID',
      value: data.transactionId,
      color: 'text-neon-blue/80 font-mono text-xs',
    },
    {
      icon: User,
      label: 'Sender',
      value: data.senderName,
      color: 'text-white/90',
    },
    {
      icon: ArrowRight,
      label: 'Receiver',
      value: data.receiverName,
      color: 'text-white/90',
    },
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="glass-card border border-neon-cyan/20 p-6"
      style={{ boxShadow: '0 0 20px rgba(0,255,204,0.08)' }}
    >
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-neon-cyan animate-pulse" />
          <h3 className="text-neon-cyan font-semibold text-sm uppercase tracking-wider">OCR Extracted Data</h3>
        </div>
        <div className="flex items-center gap-2">
          <div
            className="text-xs font-mono bg-neon-cyan/10 border border-neon-cyan/20 px-2 py-1 rounded-full text-neon-cyan"
          >
            {confidence.toFixed(1)}% confidence
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {fields.map((field, i) => {
          const Icon = field.icon
          return (
            <motion.div
              key={field.label}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className={`flex items-center gap-3 p-3 rounded-xl ${
                field.highlight
                  ? 'bg-neon-cyan/10 border border-neon-cyan/20'
                  : 'bg-white/3 border border-white/5'
              }`}
            >
              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                  field.highlight ? 'bg-neon-cyan/20' : 'bg-white/5'
                }`}
              >
                <Icon size={14} className={field.highlight ? 'text-neon-cyan' : 'text-white/40'} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white/40 text-xs uppercase tracking-wider mb-0.5">{field.label}</p>
                <p className={`text-sm font-medium truncate ${field.color}`}>{field.value}</p>
              </div>
            </motion.div>
          )
        })}
      </div>
    </motion.div>
  )
}
