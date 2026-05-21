'use client'

import { useState, useEffect, useCallback } from 'react'
import { mockTransactions, Transaction } from '../mockData'

interface UseTransactionsOptions {
  page?: number
  limit?: number
  riskFilter?: string
  methodFilter?: string
  search?: string
  startDate?: string
  endDate?: string
}

export function useTransactions(options: UseTransactionsOptions = {}) {
  const { page = 1, limit = 10, riskFilter = 'all', methodFilter = 'all', search = '', startDate, endDate } = options

  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [totalCount, setTotalCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchTransactions = useCallback(async () => {
    setLoading(true)
    try {
      await new Promise((resolve) => setTimeout(resolve, 400))

      let filtered = [...mockTransactions]

      if (riskFilter !== 'all') {
        filtered = filtered.filter((t) => t.riskLevel === riskFilter.toUpperCase())
      }

      if (methodFilter !== 'all') {
        filtered = filtered.filter((t) => t.paymentMethod === methodFilter)
      }

      if (search) {
        const lower = search.toLowerCase()
        filtered = filtered.filter(
          (t) =>
            t.merchantName.toLowerCase().includes(lower) ||
            t.transactionRef.toLowerCase().includes(lower) ||
            t.senderName.toLowerCase().includes(lower) ||
            t.id.toLowerCase().includes(lower)
        )
      }

      if (startDate) {
        filtered = filtered.filter((t) => new Date(t.date) >= new Date(startDate))
      }

      if (endDate) {
        filtered = filtered.filter((t) => new Date(t.date) <= new Date(endDate))
      }

      setTotalCount(filtered.length)
      const start = (page - 1) * limit
      setTransactions(filtered.slice(start, start + limit))
    } catch {
      setError('Failed to load transactions')
    } finally {
      setLoading(false)
    }
  }, [page, limit, riskFilter, methodFilter, search, startDate, endDate])

  useEffect(() => {
    fetchTransactions()
  }, [fetchTransactions])

  return { transactions, totalCount, loading, error, refetch: fetchTransactions }
}
