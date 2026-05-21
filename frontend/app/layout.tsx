import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'SecurePay Vision - AI-Powered Fraud Detection for UMKM',
  description: 'Advanced AI-powered digital transaction fraud detection system designed specifically for Indonesian small businesses (UMKM). Real-time OCR scanning, anomaly detection, and comprehensive analytics.',
  keywords: 'fraud detection, UMKM, Indonesia, AI, OCR, transaction security, fintech',
  openGraph: {
    title: 'SecurePay Vision',
    description: 'AI-Powered Fraud Detection for UMKM',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-navy-900 text-white antialiased min-h-screen">
        {children}
      </body>
    </html>
  )
}
