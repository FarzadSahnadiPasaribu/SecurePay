'use client'

import { useState } from 'react'
import { OCRExtractedData, mockDemoScanResult } from '../mockData'

export function useOCRScan() {
  const [ocrData, setOcrData] = useState<OCRExtractedData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const scanFile = async (file: File): Promise<OCRExtractedData> => {
    setLoading(true)
    setError(null)

    try {
      await new Promise((resolve) => setTimeout(resolve, 1200))

      // Try real API
      try {
        const formData = new FormData()
        formData.append('file', file)
        const response = await fetch('http://localhost:8000/api/ocr', {
          method: 'POST',
          body: formData,
        })
        if (response.ok) {
          const data = await response.json()
          setOcrData(data)
          return data
        }
      } catch {
        // Fall back to mock
      }

      const mockData = mockDemoScanResult.extractedData
      setOcrData(mockData)
      return mockData
    } catch {
      const msg = 'Failed to extract OCR data'
      setError(msg)
      throw new Error(msg)
    } finally {
      setLoading(false)
    }
  }

  const reset = () => {
    setOcrData(null)
    setError(null)
  }

  return { ocrData, loading, error, scanFile, reset }
}
