'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { AlertTriangle, X, Bell } from 'lucide-react'

interface Alert {
  id: string
  message: string
  amount: string
  time: string
}

const mockAlerts: Alert[] = [
  {
    id: '1',
    message: 'Transaksi berisiko tinggi terdeteksi di Toko Online Elektronik',
    amount: 'Rp 15.750.000',
    time: '2 menit lalu',
  },
  {
    id: '2',
    message: 'Aktivitas mencurigakan terdeteksi di CV Maju Bersama',
    amount: 'Rp 8.200.000',
    time: '7 menit lalu',
  },
  {
    id: '3',
    message: 'Banyak transaksi cepat dari akun yang sama',
    amount: 'Rp 3.450.000',
    time: '12 menit lalu',
  },
]

export default function AlertBanner() {
  const [currentAlert, setCurrentAlert] = useState(0)
  const [visible, setVisible] = useState(true)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    if (dismissed) return
    const interval = setInterval(() => {
      setCurrentAlert((prev) => (prev + 1) % mockAlerts.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [dismissed])

  if (dismissed) return null

  const alert = mockAlerts[currentAlert]

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -100, opacity: 0 }}
          className="relative overflow-hidden rounded-xl border border-red-500/30 bg-red-500/10 backdrop-blur-sm p-3 mb-6"
          style={{ boxShadow: '0 0 20px rgba(239,68,68,0.15)' }}
        >
          {/* Animated scan line */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-red-500/10 to-transparent"
            animate={{ x: ['-100%', '200%'] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          />

          <div className="flex items-center gap-3">
            <div className="flex-shrink-0">
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
                className="w-8 h-8 rounded-full bg-red-500/20 border border-red-500/40 flex items-center justify-center"
              >
                <AlertTriangle size={14} className="text-red-400" />
              </motion.div>
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-bold text-red-400 uppercase tracking-wider flex items-center gap-1">
                  <Bell size={10} />
                  PERINGATAN FRAUD
                </span>
                <AnimatePresence mode="wait">
                  <motion.span
                    key={alert.id}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    className="text-sm text-white/80"
                  >
                    {alert.message}
                  </motion.span>
                </AnimatePresence>
              </div>
              <div className="flex items-center gap-3 mt-0.5">
                <span className="text-xs text-red-300 font-mono font-semibold">{alert.amount}</span>
                <span className="text-xs text-white/40">{alert.time}</span>
                <div className="flex gap-1 ml-auto">
                  {mockAlerts.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrentAlert(i)}
                      className={`w-1.5 h-1.5 rounded-full transition-colors ${
                        i === currentAlert ? 'bg-red-400' : 'bg-white/20'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>

            <button
              onClick={() => setDismissed(true)}
              className="flex-shrink-0 p-1 rounded-lg hover:bg-white/10 transition-colors"
            >
              <X size={14} className="text-white/40" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
