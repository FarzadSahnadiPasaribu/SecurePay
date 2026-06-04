'use client'

import { motion } from 'framer-motion'
import {
  Info, Brain, ScanLine, Shield, Database, Cpu,
  Github, Globe, ArrowRight, CheckCircle2,
} from 'lucide-react'
import Navbar from '@/components/Navbar'
import Sidebar from '@/components/Sidebar'

const techStack = [
  { name: 'Python 3.10', desc: 'Backend & ML pipeline', icon: '🐍', color: 'text-neon-blue' },
  { name: 'FastAPI', desc: 'High-performance REST API', icon: '⚡', color: 'text-neon-cyan' },
  { name: 'Scikit-learn', desc: 'Machine learning models', icon: '🤖', color: 'text-purple-400' },
  { name: 'EasyOCR', desc: 'Multi-language OCR engine', icon: '👁️', color: 'text-amber-400' },
  { name: 'OpenCV', desc: 'Computer vision & image processing', icon: '📷', color: 'text-emerald-400' },
  { name: 'Next.js 14', desc: 'React App Router framework', icon: '▲', color: 'text-neon-blue' },
  { name: 'TypeScript', desc: 'Type-safe JavaScript', icon: '📘', color: 'text-blue-400' },
  { name: 'Tailwind CSS', desc: 'Utility-first styling', icon: '🎨', color: 'text-cyan-400' },
  { name: 'Framer Motion', desc: 'Production-ready animations', icon: '✨', color: 'text-purple-400' },
  { name: 'Recharts', desc: 'Composable chart library', icon: '📊', color: 'text-emerald-400' },
  { name: 'Supabase', desc: 'Backend as a Service + Auth', icon: '🔐', color: 'text-neon-cyan' },
  { name: 'Docker', desc: 'Containerized deployment', icon: '🐳', color: 'text-blue-400' },
]

const methodology = [
  {
    step: 1,
    icon: ScanLine,
    title: 'Document Input & OCR',
    desc: 'Invoice or receipt is uploaded. EasyOCR engine extracts all text fields including transaction amount, date, merchant name, account number, and payment method.',
    details: ['EasyOCR with Indonesian language support', 'Image preprocessing: contrast, denoise, deskew', 'Confidence scoring per extracted field'],
    color: 'neon-blue',
  },
  {
    step: 2,
    icon: Cpu,
    title: 'Feature Engineering',
    desc: 'Extracted data is transformed into machine learning features. Temporal features, amount normalization, merchant encoding, and behavioral patterns are computed.',
    details: ['24 engineered features from raw data', 'Normalization and outlier handling', 'Categorical encoding for payment methods'],
    color: 'neon-cyan',
  },
  {
    step: 3,
    icon: Brain,
    title: 'ML Anomaly Detection',
    desc: 'Ensemble model (Random Forest + XGBoost + Isolation Forest) classifies the transaction and generates anomaly scores, fraud probability, and risk level.',
    details: ['Random Forest: 96.8% accuracy', 'XGBoost gradient boosting', 'Isolation Forest for unsupervised anomaly detection', 'Ensemble voting for final prediction'],
    color: 'purple',
  },
  {
    step: 4,
    icon: Shield,
    title: 'Result & Explainability',
    desc: 'Risk classification (HIGH/MEDIUM/LOW/NORMAL) is generated with SHAP feature importance to explain which factors contributed most to the fraud decision.',
    details: ['SHAP value explanations', 'Top fraud indicators identified', 'Manipulation score via image forensics'],
    color: 'emerald',
  },
]

const architectureNodes = [
  { id: 'client', label: 'Web Client', sub: 'Next.js 14', x: 0, color: 'neon-blue' },
  { id: 'api', label: 'FastAPI', sub: 'REST + Auth', x: 1, color: 'neon-cyan' },
  { id: 'ocr', label: 'OCR Engine', sub: 'EasyOCR', x: 2, color: 'amber' },
  { id: 'ml', label: 'ML Pipeline', sub: 'Scikit-learn', x: 2, color: 'purple' },
  { id: 'db', label: 'Supabase', sub: 'PostgreSQL + Auth', x: 3, color: 'emerald' },
]

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-navy-900">
      <Navbar />
      <Sidebar />

      <main className="pt-16 pl-16 md:pl-56 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-8">
          {/* Header */}
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-neon-blue/10 border border-neon-blue/20 flex items-center justify-center">
                <Info size={20} className="text-neon-blue" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">About SecurePay Vision</h1>
                <p className="text-white/40 text-sm">AI-Powered Digital Transaction Fraud Detection System</p>
              </div>
            </div>
          </motion.div>

          {/* Project Overview */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass-card p-8 border border-neon-blue/20 mb-8 relative overflow-hidden"
            style={{ boxShadow: '0 0 40px rgba(0,212,255,0.08)' }}
          >
            <div className="absolute inset-0 cyber-grid-bg opacity-20" />
            <div className="relative z-10">
              <h2 className="text-xl font-bold text-white mb-4">Project Overview</h2>
              <p className="text-white/60 leading-relaxed mb-4">
                <strong className="text-neon-blue">SecurePay Vision</strong> is an AI-powered fraud detection system
                specifically designed for Indonesian UMKM (Usaha Mikro, Kecil, dan Menengah — small and medium enterprises).
                The system combines Optical Character Recognition (OCR), computer vision image forensics, and machine
                learning anomaly detection to identify potentially fraudulent digital transactions.
              </p>
              <p className="text-white/60 leading-relaxed mb-6">
                As Indonesia&apos;s digital payment ecosystem grows rapidly — with QRIS transactions exceeding 1 billion
                in 2024 — UMKM businesses face increasing exposure to digital fraud. SecurePay Vision provides
                enterprise-grade fraud detection capabilities accessible to small businesses at scale.
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { val: '96.8%', label: 'Model Accuracy' },
                  { val: '0.978', label: 'AUC-ROC Score' },
                  { val: '< 2s', label: 'Analysis Time' },
                  { val: '4 Layers', label: 'Risk Classification' },
                ].map((s, i) => (
                  <div key={i} className="bg-white/5 rounded-xl p-3 text-center border border-white/10">
                    <p className="text-neon-blue font-bold text-xl font-mono">{s.val}</p>
                    <p className="text-white/40 text-xs mt-1">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* AI Methodology */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="mb-8"
          >
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <Brain size={20} className="text-neon-cyan" />
              AI Methodology
            </h2>

            <div className="space-y-4">
              {methodology.map((step, i) => {
                const Icon = step.icon
                const colors: Record<string, string> = {
                  'neon-blue': 'border-neon-blue/20 bg-neon-blue/5',
                  'neon-cyan': 'border-neon-cyan/20 bg-neon-cyan/5',
                  'purple': 'border-purple-500/20 bg-purple-500/5',
                  'emerald': 'border-emerald-500/20 bg-emerald-500/5',
                }
                const iconColors: Record<string, string> = {
                  'neon-blue': 'text-neon-blue bg-neon-blue/10',
                  'neon-cyan': 'text-neon-cyan bg-neon-cyan/10',
                  'purple': 'text-purple-400 bg-purple-500/10',
                  'emerald': 'text-emerald-400 bg-emerald-500/10',
                }
                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 + i * 0.08 }}
                    className={`glass-card p-6 border ${colors[step.color]}`}
                  >
                    <div className="flex items-start gap-4">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${iconColors[step.color]}`}>
                        <Icon size={22} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="text-white/30 text-xs font-mono font-bold">STEP {String(step.step).padStart(2, '0')}</span>
                          <h3 className="text-white font-semibold">{step.title}</h3>
                        </div>
                        <p className="text-white/50 text-sm leading-relaxed mb-3">{step.desc}</p>
                        <div className="flex flex-wrap gap-2">
                          {step.details.map((d, j) => (
                            <span
                              key={j}
                              className="flex items-center gap-1 text-xs text-white/40 bg-white/5 border border-white/10 px-2 py-1 rounded-full"
                            >
                              <CheckCircle2 size={10} className="text-emerald-400" />
                              {d}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </motion.div>

          {/* System Architecture */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="glass-card p-6 border border-white/10 mb-8"
          >
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <Database size={20} className="text-amber-400" />
              System Architecture
            </h2>

            {/* Flowchart */}
            <div className="overflow-x-auto pb-4">
              <div className="flex items-center gap-2 min-w-max">
                {[
                  { label: 'Browser', sub: 'Next.js 14\nApp Router', color: '#00d4ff', border: 'rgba(0,212,255,0.4)' },
                  null,
                  { label: 'FastAPI', sub: 'REST API\nJWT Auth', color: '#00ffcc', border: 'rgba(0,255,204,0.4)' },
                  null,
                  { label: 'OCR Engine', sub: 'EasyOCR\nOpenCV', color: '#f59e0b', border: 'rgba(245,158,11,0.4)' },
                  null,
                  { label: 'ML Pipeline', sub: 'RF + XGBoost\nIsolation Forest', color: '#7c3aed', border: 'rgba(124,58,237,0.4)' },
                  null,
                  { label: 'Database', sub: 'Supabase\nPostgreSQL', color: '#10b981', border: 'rgba(16,185,129,0.4)' },
                ].map((node, i) => {
                  if (node === null) {
                    return (
                      <div key={i} className="flex items-center">
                        <div className="w-8 h-px bg-white/20" />
                        <ArrowRight size={12} className="text-white/30 -ml-2" />
                      </div>
                    )
                  }
                  return (
                    <div
                      key={i}
                      className="rounded-2xl p-4 text-center min-w-[110px]"
                      style={{
                        background: `${node.color}10`,
                        border: `1px solid ${node.border}`,
                        boxShadow: `0 0 15px ${node.color}15`,
                      }}
                    >
                      <p className="font-bold text-sm whitespace-nowrap" style={{ color: node.color }}>{node.label}</p>
                      <p className="text-white/30 text-xs mt-1 whitespace-pre-line leading-tight">{node.sub}</p>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Second row: data flow */}
            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { title: 'Input', items: ['JPG / PNG / PDF upload', 'Multi-language support', 'Max 10MB file size'], color: 'text-neon-blue' },
                { title: 'Processing', items: ['OCR text extraction', 'Feature engineering', 'ML model inference', 'Image forensics'], color: 'text-neon-cyan' },
                { title: 'Output', items: ['Risk classification', 'Anomaly score (0-1)', 'Fraud probability (%)', 'SHAP explanations'], color: 'text-emerald-400' },
              ].map((section, i) => (
                <div key={i} className="bg-white/3 rounded-xl p-4 border border-white/5">
                  <p className={`text-xs font-bold uppercase tracking-wider ${section.color} mb-3`}>{section.title}</p>
                  <ul className="space-y-1.5">
                    {section.items.map((item, j) => (
                      <li key={j} className="flex items-center gap-2 text-xs text-white/50">
                        <div className={`w-1 h-1 rounded-full ${section.color.replace('text-', 'bg-')}`} />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Technology Stack */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="mb-8"
          >
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <Cpu size={20} className="text-purple-400" />
              Technology Stack
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {techStack.map((tech, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.4 + i * 0.03 }}
                  className="glass-card p-4 border border-white/10 hover:border-white/20 transition-all"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-xl">{tech.icon}</span>
                    <p className={`font-semibold text-sm ${tech.color}`}>{tech.name}</p>
                  </div>
                  <p className="text-white/40 text-xs leading-relaxed">{tech.desc}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Team */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="glass-card p-8 border border-white/10"
          >
            <h2 className="text-xl font-bold text-white mb-6">Development Team</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                { name: 'Lead Developer', role: 'Full-Stack & ML Engineer', emoji: '🧑‍💻', desc: 'Backend, ML pipeline, and frontend development' },
                { name: 'ML Researcher', role: 'Data Science & AI', emoji: '🔬', desc: 'Model training, feature engineering, and evaluation' },
                { name: 'UI/UX Designer', role: 'Frontend Developer', emoji: '🎨', desc: 'Dashboard design and user experience' },
              ].map((member, i) => (
                <div key={i} className="bg-white/3 rounded-2xl p-5 border border-white/5 text-center">
                  <div className="text-4xl mb-3">{member.emoji}</div>
                  <p className="text-white font-semibold">{member.name}</p>
                  <p className="text-neon-blue text-xs mt-0.5">{member.role}</p>
                  <p className="text-white/40 text-xs mt-2 leading-relaxed">{member.desc}</p>
                </div>
              ))}
            </div>

            <div className="mt-6 pt-6 border-t border-white/5 text-center">
              <p className="text-white/40 text-sm">
                Final Project — Universitas Indonesia · Fakultas Ilmu Komputer
              </p>
              <p className="text-white/20 text-xs mt-1">2024</p>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  )
}
