'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import {
  Shield,
  Zap,
  Eye,
  Brain,
  BarChart3,
  Lock,
  ArrowRight,
  ScanLine,
  ChevronRight,
} from 'lucide-react'
import Navbar from '@/components/Navbar'

const features = [
  {
    icon: ScanLine,
    title: 'Pemindaian OCR Berbasis AI',
    description:
      'Ekstrak data transaksi dari invoice dan bukti transfer dengan akurasi 95%+ menggunakan computer vision canggih.',
    color: 'text-neon-blue',
    bg: 'bg-neon-blue/10 border-neon-blue/20',
  },
  {
    icon: Brain,
    title: 'Deteksi Machine Learning',
    description:
      'Model Random Forest & XGBoost dilatih pada 10.000+ transaksi UMKM untuk mengidentifikasi pola fraud secara real-time.',
    color: 'text-neon-cyan',
    bg: 'bg-neon-cyan/10 border-neon-cyan/20',
  },
  {
    icon: Zap,
    title: 'Analisis Real-Time',
    description:
      'Dapatkan skor risiko fraud secara instan dalam hitungan detik. Klasifikasi High, Medium, Low, dan Normal dengan AI yang dapat dijelaskan.',
    color: 'text-amber-400',
    bg: 'bg-amber-500/10 border-amber-500/20',
  },
  {
    icon: Eye,
    title: 'Deteksi Manipulasi Gambar',
    description:
      'Deteksi bukti transfer palsu dan nominal transaksi yang diubah menggunakan analisis metadata dan verifikasi tingkat piksel.',
    color: 'text-purple-400',
    bg: 'bg-purple-500/10 border-purple-500/20',
  },
  {
    icon: BarChart3,
    title: 'Analitik Komprehensif',
    description:
      'Dashboard dengan analisis tren, grafik distribusi fraud, dan metrik performa model untuk pengambilan keputusan yang tepat.',
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/10 border-emerald-500/20',
  },
  {
    icon: Lock,
    title: 'Keamanan Khusus UMKM',
    description:
      'Dirancang khusus untuk usaha kecil Indonesia. Mendukung QRIS, GoPay, OVO, Dana, ShopeePay, dan Transfer Bank.',
    color: 'text-red-400',
    bg: 'bg-red-500/10 border-red-500/20',
  },
]

const techStack = [
  { name: 'Python', desc: 'Backend & ML' },
  { name: 'FastAPI', desc: 'REST API' },
  { name: 'Scikit-learn', desc: 'Model ML' },
  { name: 'EasyOCR', desc: 'Mesin OCR' },
  { name: 'Next.js 14', desc: 'Frontend' },
  { name: 'PostgreSQL', desc: 'Database' },
  { name: 'Supabase', desc: 'Auth & Realtime' },
  { name: 'Docker', desc: 'Deployment' },
]

const stats = [
  { value: '96.8%', label: 'Akurasi Deteksi' },
  { value: '< 2s', label: 'Waktu Analisis' },
  { value: '100K+', label: 'Transaksi Dianalisis' },
  { value: '0.978', label: 'AUC Score' },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-navy-900">
      <Navbar />

      {/* Hero */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
        <div className="absolute inset-0 cyber-grid-bg" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-navy-900" />

        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-neon-blue/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-neon-purple/5 rounded-full blur-3xl" />
        <div className="absolute top-1/3 right-1/3 w-48 h-48 bg-neon-cyan/5 rounded-full blur-3xl" />

        <motion.div
          className="absolute inset-x-0 h-px bg-gradient-to-r from-transparent via-neon-blue/20 to-transparent pointer-events-none"
          animate={{ y: ['-10vh', '110vh'] }}
          transition={{ duration: 6, repeat: Infinity, ease: 'linear', repeatDelay: 2 }}
        />

        <div className="relative z-10 text-center px-4 max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 bg-neon-blue/10 border border-neon-blue/20 rounded-full px-4 py-1.5 text-xs text-neon-blue font-medium mb-8"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-neon-blue animate-pulse" />
            Sistem Berbasis AI untuk UMKM Indonesia
            <ChevronRight size={12} />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
          >
            <h1 className="text-5xl md:text-7xl font-black leading-none mb-4">
              <span
                style={{
                  background: 'linear-gradient(135deg, #00d4ff, #00ffcc, #7c3aed)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  filter: 'drop-shadow(0 0 30px rgba(0,212,255,0.4))',
                }}
              >
                SecurePay Vision
              </span>
            </h1>
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="text-xl md:text-2xl text-white/60 font-light mb-4"
          >
            Deteksi Fraud Berbasis AI untuk{' '}
            <span className="text-neon-cyan font-semibold">UMKM</span>
          </motion.p>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="text-base text-white/40 max-w-2xl mx-auto mb-10 leading-relaxed"
          >
            Lindungi usaha kecil Anda dari fraud transaksi digital dengan pemindaian OCR canggih,
            deteksi anomali machine learning, dan penilaian risiko real-time. Dibangun khusus
            untuk UMKM Indonesia.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            <Link href="/login">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
                className="btn-primary flex items-center gap-2 text-base px-8 py-4"
              >
                <Shield size={18} />
                Mulai Sekarang
                <ArrowRight size={16} />
              </motion.button>
            </Link>
            <Link href="/register">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
                className="btn-secondary flex items-center gap-2 text-base px-8 py-4"
              >
                <ScanLine size={18} />
                Daftar Gratis
              </motion.button>
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.6 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-16 max-w-3xl mx-auto"
          >
            {stats.map((stat, i) => (
              <div key={i} className="glass-card p-4 text-center border-neon-blue/10">
                <p className="text-2xl font-bold text-neon-blue font-mono">{stat.value}</p>
                <p className="text-white/40 text-xs mt-1">{stat.label}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 px-4 relative">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <span className="text-neon-blue text-sm font-semibold uppercase tracking-widest">Fitur</span>
            <h2 className="text-4xl font-bold text-white mt-2 mb-4">Suite Deteksi Fraud Lengkap</h2>
            <p className="text-white/50 max-w-xl mx-auto">
              Semua yang Anda butuhkan untuk melindungi bisnis UMKM dari fraud transaksi digital
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feat, i) => {
              const Icon = feat.icon
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.08 }}
                  whileHover={{ y: -4, transition: { duration: 0.2 } }}
                  className="glass-card p-6 border border-white/10 hover:border-white/20 transition-all duration-300"
                >
                  <div className={`w-12 h-12 rounded-xl border flex items-center justify-center mb-4 ${feat.bg}`}>
                    <Icon size={22} className={feat.color} />
                  </div>
                  <h3 className="text-white font-semibold mb-2">{feat.title}</h3>
                  <p className="text-white/50 text-sm leading-relaxed">{feat.description}</p>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 px-4 border-t border-white/5">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <span className="text-neon-cyan text-sm font-semibold uppercase tracking-widest">Proses</span>
            <h2 className="text-4xl font-bold text-white mt-2 mb-4">3 Langkah Mudah</h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: '01',
                icon: ScanLine,
                title: 'Upload Invoice',
                desc: 'Unggah bukti transfer, kwitansi, atau invoice Anda dalam format JPG, PNG, atau PDF.',
                color: 'text-neon-blue',
                border: 'border-neon-blue/30',
                bg: 'bg-neon-blue/10',
              },
              {
                step: '02',
                icon: Brain,
                title: 'Analisis AI',
                desc: 'AI kami mengekstrak data transaksi via OCR, lalu menjalankan model ML untuk mendeteksi anomali dan pola fraud.',
                color: 'text-neon-cyan',
                border: 'border-neon-cyan/30',
                bg: 'bg-neon-cyan/10',
              },
              {
                step: '03',
                icon: Shield,
                title: 'Lihat Hasil',
                desc: 'Terima klasifikasi risiko instan (High/Medium/Low/Normal) dengan indikator fraud yang terperinci.',
                color: 'text-purple-400',
                border: 'border-purple-500/30',
                bg: 'bg-purple-500/10',
              },
            ].map((step, i) => {
              const Icon = step.icon
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.15 }}
                  className="text-center"
                >
                  <div
                    className={`w-16 h-16 rounded-2xl border ${step.border} ${step.bg} flex items-center justify-center mx-auto mb-4`}
                  >
                    <Icon size={28} className={step.color} />
                  </div>
                  <div className={`text-xs font-mono font-bold ${step.color} mb-2`}>{step.step}</div>
                  <h3 className="text-white font-semibold text-lg mb-2">{step.title}</h3>
                  <p className="text-white/50 text-sm leading-relaxed">{step.desc}</p>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Tech Stack */}
      <section className="py-20 px-4 border-t border-white/5">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-12"
          >
            <span className="text-white/30 text-sm uppercase tracking-widest">Dibangun dengan</span>
            <h2 className="text-3xl font-bold text-white mt-2 mb-4">Tumpukan Teknologi Modern</h2>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {techStack.map((tech, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="glass-card p-4 border border-white/10 hover:border-neon-blue/20 transition-all"
              >
                <p className="text-white font-semibold text-sm">{tech.name}</p>
                <p className="text-white/40 text-xs mt-1">{tech.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="glass-card p-12 border border-neon-blue/20 relative overflow-hidden"
            style={{ boxShadow: '0 0 60px rgba(0,212,255,0.1)' }}
          >
            <div className="absolute inset-0 cyber-grid-bg opacity-30" />
            <div className="relative z-10">
              <div className="w-16 h-16 rounded-2xl bg-neon-blue/10 border border-neon-blue/30 flex items-center justify-center mx-auto mb-6">
                <Shield size={30} className="text-neon-blue" />
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                Lindungi Bisnis Anda Sekarang
              </h2>
              <p className="text-white/50 mb-8 max-w-xl mx-auto">
                Bergabung dengan ribuan bisnis UMKM yang menggunakan SecurePay Vision untuk melindungi transaksi digital mereka.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/login">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.98 }}
                    className="btn-primary flex items-center gap-2 px-8 py-4"
                  >
                    <Shield size={18} />
                    Masuk ke Dashboard
                    <ArrowRight size={16} />
                  </motion.button>
                </Link>
                <Link href="/register">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.98 }}
                    className="btn-secondary flex items-center gap-2 px-8 py-4"
                  >
                    <ScanLine size={18} />
                    Daftar Gratis
                  </motion.button>
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-8 px-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Shield size={16} className="text-neon-blue" />
            <span className="text-white/50 text-sm">
              SecurePay Vision — Deteksi Fraud AI untuk UMKM Indonesia
            </span>
          </div>
          <p className="text-white/30 text-sm">© 2024 SecurePay Vision. Final Project</p>
        </div>
      </footer>
    </div>
  )
}
