'use client'

import { useState, useEffect } from 'react'
import { mockDashboardStats, mockTrendData, mockFraudDistribution, mockPaymentMethodData } from '../mockData'

export interface DashboardStats {
  totalTransactions: number
  fraudDetected: number
  normalTransactions: number
  anomalyPercentage: number
  invoicesScanned: number
  highRisk: number
  mediumRisk: number
  lowRisk: number
  previousTotal: number
  previousFraud: number
}

export function useDashboardStats() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [trendData, setTrendData] = useState<typeof mockTrendData>([])
  const [fraudDistribution, setFraudDistribution] = useState<typeof mockFraudDistribution>([])
  const [paymentMethodData, setPaymentMethodData] = useState<typeof mockPaymentMethodData>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true)
      try {
        // Try real API first, fall back to mock
        await new Promise((resolve) => setTimeout(resolve, 800)) // Simulate network delay
        setStats(mockDashboardStats)
        setTrendData(mockTrendData)
        setFraudDistribution(mockFraudDistribution)
        setPaymentMethodData(mockPaymentMethodData)
      } catch {
        setError('Failed to load dashboard stats')
        setStats(mockDashboardStats)
        setTrendData(mockTrendData)
        setFraudDistribution(mockFraudDistribution)
        setPaymentMethodData(mockPaymentMethodData)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  return { stats, trendData, fraudDistribution, paymentMethodData, loading, error }
}
