'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ScanLine, Play, RotateCcw, Cpu, AlertTriangle, CheckCircle2, MapPin } from 'lucide-react'
import Navbar from '@/components/Navbar'
import Sidebar from '@/components/Sidebar'
import UploadZone from '@/components/UploadZone'
import OCRResultPanel from '@/components/OCRResultPanel'
import FraudAnalysisResult from '@/components/FraudAnalysisResult'
import { useFraudAnalysis } from '@/lib/hooks/useFraudAnalysis'

const analysisSteps = [
  { label: 'Uploading file', icon: '📤' },
  { label: 'OCR text extraction', icon: '🔍' },
  { label: 'Data preprocessing', icon: '⚙️' },
  { label: 'ML fraud model', icon: '🤖' },
  { label: 'Anomaly analysis', icon: '📊' },
  { label: 'Generating report', icon: '📋' },
]

export default function ScanPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const { result, loading, error, progress, analyzeFile, reset } = useFraudAnalysis()

  const handleFileSelected = (file: File) => {
    setSelectedFile(file)
    reset()
  }

  const handleClear = () => {
    setSelectedFile(null)
    reset()
  }

  const handleAnalyze = async () => {
    if (!selectedFile) return
    await analyzeFile(selectedFile)
  }

  const currentStep = Math.floor((progress / 100) * analysisSteps.length)

  return (
    <div className="min-h-screen bg-navy-900">
      <Navbar />
      <Sidebar />

      <main className="pt-16 pl-16 md:pl-56 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-8">
          {/* Header */}
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-neon-blue/10 border border-neon-blue/20 flex items-center justify-center">
                <ScanLine size={20} className="text-neon-blue" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Upload &amp; Scan</h1>
                <p className="text-white/40 text-sm">AI-powered invoice fraud detection via OCR</p>
              </div>
            </div>
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-6">
            {/* Left column - Upload */}
            <div className="space-y-6">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="glass-card p-6 border border-white/10"
              >
                <h2 className="text-white font-semibold mb-4 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-neon-blue/20 text-neon-blue text-xs flex items-center justify-center font-bold">1</span>
                  Upload Invoice / Bukti Transfer
                </h2>

                <UploadZone
                  onFileSelected={handleFileSelected}
                  onClear={handleClear}
                  disabled={loading}
                  selectedFile={selectedFile}
                />

                {!selectedFile && !loading && (
                  <div className="mt-4 p-3 rounded-xl bg-neon-blue/5 border border-neon-blue/15">
                    <p className="text-neon-blue/70 text-xs text-center">
                      Demo mode: Upload any image to see a realistic fraud analysis result
                    </p>
                  </div>
                )}

                {selectedFile && !loading && !result && (
                  <motion.button
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    onClick={handleAnalyze}
                    className="btn-primary w-full mt-4 flex items-center justify-center gap-2 py-4"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Cpu size={18} />
                    Analyze with AI
                    <Play size={14} />
                  </motion.button>
                )}

                {result && (
                  <button
                    onClick={handleClear}
                    className="btn-secondary w-full mt-4 flex items-center justify-center gap-2"
                  >
                    <RotateCcw size={16} />
                    Scan New Invoice
                  </button>
                )}
              </motion.div>

              {/* Analysis Progress */}
              <AnimatePresence>
                {loading && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="glass-card p-6 border border-neon-blue/20"
                    style={{ boxShadow: '0 0 20px rgba(0,212,255,0.1)' }}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-white font-semibold text-sm">AI Analysis in Progress</h3>
                      <span className="text-neon-blue font-mono text-sm font-bold">{progress}%</span>
                    </div>

                    <div className="h-2 bg-white/10 rounded-full mb-6 overflow-hidden">
                      <motion.div
                        className="h-full rounded-full bg-gradient-to-r from-neon-blue to-neon-cyan"
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 0.3 }}
                      />
                    </div>

                    <div className="space-y-2">
                      {analysisSteps.map((step, i) => (
                        <div key={i} className="flex items-center gap-3">
                          <span className="text-base">{step.icon}</span>
                          <span
                            className={`text-xs transition-colors ${
                              i < currentStep
                                ? 'text-neon-cyan'
                                : i === currentStep
                                ? 'text-white animate-pulse'
                                : 'text-white/20'
                            }`}
                          >
                            {step.label}
                          </span>
                          {i < currentStep && (
                            <CheckCircle2 size={12} className="text-neon-cyan ml-auto" />
                          )}
                          {i === currentStep && (
                            <motion.div
                              className="w-3 h-3 rounded-full border-2 border-neon-blue ml-auto"
                              style={{ borderTopColor: 'transparent' }}
                              animate={{ rotate: 360 }}
                              transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
                            />
                          )}
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {error && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center gap-3"
                >
                  <AlertTriangle size={16} className="text-red-400" />
                  <p className="text-red-400 text-sm">{error}</p>
                </motion.div>
              )}
            </div>

            {/* Right column - Results */}
            <div className="space-y-6">
              {!result && !loading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="glass-card p-8 border border-white/10 text-center"
                  style={{ minHeight: 300 }}
                >
                  <div className="flex flex-col items-center justify-center h-full gap-4 py-8">
                    <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
                      <ScanLine size={28} className="text-white/20" />
                    </div>
                    <p className="text-white/30 text-sm">Upload an invoice and click Analyze to see results</p>
                    <div className="grid grid-cols-2 gap-3 mt-4 w-full max-w-xs text-left">
                      {[
                        { label: 'Anomaly Score', val: '—' },
                        { label: 'Fraud Probability', val: '—' },
                        { label: 'OCR Confidence', val: '—' },
                        { label: 'Manipulation Score', val: '—' },
                      ].map((m) => (
                        <div key={m.label} className="bg-white/3 rounded-xl p-3 border border-white/5">
                          <p className="text-white/25 text-xs">{m.label}</p>
                          <p className="text-white/20 text-lg font-mono font-bold mt-1">{m.val}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}

              <AnimatePresence>
                {result && !loading && (
                  <>
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                      <h2 className="text-white font-semibold mb-3 flex items-center gap-2 text-sm">
                        <span className="w-6 h-6 rounded-lg bg-neon-cyan/20 text-neon-cyan text-xs flex items-center justify-center font-bold">2</span>
                        OCR Extracted Data
                      </h2>
                      <OCRResultPanel data={result.extractedData} confidence={result.ocrConfidence} />
                    </motion.div>

                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                      <h2 className="text-white font-semibold mb-3 flex items-center gap-2 text-sm">
                        <span className="w-6 h-6 rounded-lg bg-red-500/20 text-red-400 text-xs flex items-center justify-center font-bold">3</span>
                        Fraud Analysis Result
                      </h2>
                      <FraudAnalysisResult result={result} />
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                      className="glass-card p-5 border border-amber-500/20"
                    >
                      <div className="flex items-center gap-2 mb-4">
                        <MapPin size={16} className="text-amber-400" />
                        <h3 className="text-white font-semibold text-sm">Suspicious Region Map</h3>
                      </div>

                      <div className="relative bg-navy-800 rounded-xl overflow-hidden border border-white/10" style={{ height: 160 }}>
                        <div className="absolute inset-0 cyber-grid-bg opacity-20" />
                        <div className="absolute inset-4 bg-white/5 rounded-lg border border-white/10 p-3">
                          <div className="space-y-1.5">
                            <div className="h-2 bg-white/10 rounded w-3/4" />
                            <div className="h-2 bg-white/10 rounded w-1/2" />
                            <div className="h-2 bg-white/10 rounded w-2/3" />
                          </div>
                          <div
                            className="absolute top-6 right-4 w-24 h-6 border-2 border-red-500 rounded"
                            style={{ boxShadow: '0 0 8px rgba(239,68,68,0.5)' }}
                          >
                            <div className="absolute inset-0 bg-red-500/10 rounded" />
                            <span className="absolute -top-4 left-0 text-[9px] text-red-400 whitespace-nowrap">
                              Suspicious amount
                            </span>
                          </div>
                          <div
                            className="absolute bottom-4 left-8 w-20 h-4 border-2 border-amber-500 rounded"
                            style={{ boxShadow: '0 0 8px rgba(245,158,11,0.4)' }}
                          >
                            <div className="absolute inset-0 bg-amber-500/10 rounded" />
                          </div>
                        </div>
                        <div className="absolute bottom-2 right-3 flex items-center gap-3 text-[10px]">
                          <div className="flex items-center gap-1">
                            <div className="w-2 h-2 border border-red-500 rounded-sm" />
                            <span className="text-white/40">Critical</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <div className="w-2 h-2 border border-amber-500 rounded-sm" />
                            <span className="text-white/40">Warning</span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
