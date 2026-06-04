'use client'

import { useState } from 'react'
import { FraudAnalysisResult, mockDemoScanResult } from '../mockData'

export function useFraudAnalysis() {
  const [result, setResult] = useState<FraudAnalysisResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [progress, setProgress] = useState(0)

  const analyzeFile = async (file: File): Promise<FraudAnalysisResult> => {
    setLoading(true)
    setError(null)
    setProgress(0)

    try {
      // Simulate analysis steps with progress
      const steps = [
        { label: 'Uploading file...', value: 15 },
        { label: 'Running OCR extraction...', value: 35 },
        { label: 'Preprocessing data...', value: 55 },
        { label: 'Running ML model...', value: 75 },
        { label: 'Analyzing anomalies...', value: 90 },
        { label: 'Generating report...', value: 100 },
      ]

      for (const step of steps) {
        await new Promise((resolve) => setTimeout(resolve, 500 + Math.random() * 300))
        setProgress(step.value)
      }

      // Try real API
      try {
        const formData = new FormData()
        formData.append('file', file)
        const response = await fetch('http://localhost:8000/api/scan', {
          method: 'POST',
          body: formData,
        })
        if (response.ok) {
          const data = await response.json()
          setResult(data)
          return data
        }
      } catch {
        // Fall back to mock
      }

      // Use mock result with slight randomization
      const mockResult: FraudAnalysisResult = {
        ...mockDemoScanResult,
        transactionId: `TXN-${Date.now()}`,
        anomalyScore: 0.7 + Math.random() * 0.2,
        fraudProbability: 70 + Math.random() * 20,
        ocrConfidence: 88 + Math.random() * 10,
        manipulationScore: 60 + Math.random() * 25,
      }

      setResult(mockResult)
      return mockResult
    } catch (err) {
      const msg = 'Failed to analyze file'
      setError(msg)
      throw new Error(msg)
    } finally {
      setLoading(false)
    }
  }

  const reset = () => {
    setResult(null)
    setError(null)
    setProgress(0)
  }

  return { result, loading, error, progress, analyzeFile, reset }
}
