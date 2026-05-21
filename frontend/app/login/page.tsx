'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { Shield, Eye, EyeOff, Lock, Mail, ArrowRight, AlertCircle } from 'lucide-react'

interface LoginForm {
  email: string
  password: string
}

export default function LoginPage() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>()

  const onSubmit = async (data: LoginForm) => {
    setLoading(true)
    setError('')
    try {
      // Simulate auth - replace with real Supabase auth
      await new Promise((r) => setTimeout(r, 1200))

      // Demo: accept any credentials
      if (data.email && data.password) {
        localStorage.setItem('auth_token', 'demo_token_' + Date.now())
        router.push('/dashboard')
      }
    } catch {
      setError('Invalid email or password. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-navy-900 flex items-center justify-center px-4 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 cyber-grid-bg opacity-50" />
      <div className="absolute top-1/4 left-1/3 w-64 h-64 bg-neon-blue/5 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/3 w-80 h-80 bg-neon-purple/5 rounded-full blur-3xl" />

      {/* Scan line */}
      <motion.div
        className="absolute inset-x-0 h-px bg-gradient-to-r from-transparent via-neon-blue/15 to-transparent pointer-events-none"
        animate={{ y: ['-10vh', '110vh'] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'linear', repeatDelay: 3 }}
      />

      <div className="relative z-10 w-full max-w-sm">
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <Link href="/" className="inline-flex flex-col items-center gap-3">
            <div
              className="w-14 h-14 rounded-2xl bg-neon-blue/10 border border-neon-blue/30 flex items-center justify-center"
              style={{ boxShadow: '0 0 20px rgba(0,212,255,0.2)' }}
            >
              <Shield size={28} className="text-neon-blue" />
            </div>
            <div>
              <h1 className="text-xl font-black">
                <span className="text-white">SecurePay </span>
                <span className="text-neon-blue">Vision</span>
              </h1>
              <p className="text-white/30 text-xs mt-0.5">AI Fraud Detection for UMKM</p>
            </div>
          </Link>
        </motion.div>

        {/* Form card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card p-8 border border-white/10"
          style={{ boxShadow: '0 0 40px rgba(0,212,255,0.05)' }}
        >
          <h2 className="text-xl font-bold text-white mb-1">Welcome back</h2>
          <p className="text-white/40 text-sm mb-6">Sign in to your SecurePay account</p>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20 mb-4"
            >
              <AlertCircle size={14} className="text-red-400 flex-shrink-0" />
              <p className="text-red-400 text-sm">{error}</p>
            </motion.div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Email */}
            <div>
              <label className="text-white/50 text-xs font-medium uppercase tracking-wider mb-1.5 block">
                Email Address
              </label>
              <div className="relative">
                <Mail size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" />
                <input
                  type="email"
                  placeholder="admin@umkm.id"
                  {...register('email', {
                    required: 'Email is required',
                    pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Invalid email format' },
                  })}
                  className="input-field pl-9 text-sm"
                />
              </div>
              {errors.email && (
                <p className="text-red-400 text-xs mt-1">{errors.email.message}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="text-white/50 text-xs font-medium uppercase tracking-wider mb-1.5 block">
                Password
              </label>
              <div className="relative">
                <Lock size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  {...register('password', {
                    required: 'Password is required',
                    minLength: { value: 6, message: 'Password must be at least 6 characters' },
                  })}
                  className="input-field pl-9 pr-10 text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
                >
                  {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
              {errors.password && (
                <p className="text-red-400 text-xs mt-1">{errors.password.message}</p>
              )}
            </div>

            {/* Forgot password */}
            <div className="flex justify-end">
              <Link href="#" className="text-xs text-neon-blue/70 hover:text-neon-blue transition-colors">
                Forgot password?
              </Link>
            </div>

            {/* Submit */}
            <motion.button
              type="submit"
              disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-2 py-3.5 disabled:opacity-50 disabled:cursor-not-allowed"
              whileHover={!loading ? { scale: 1.02 } : {}}
              whileTap={!loading ? { scale: 0.98 } : {}}
            >
              {loading ? (
                <>
                  <motion.div
                    className="w-4 h-4 rounded-full border-2 border-navy-900/30"
                    style={{ borderTopColor: '#0a0f1e' }}
                    animate={{ rotate: 360 }}
                    transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
                  />
                  Signing in...
                </>
              ) : (
                <>
                  Sign In
                  <ArrowRight size={16} />
                </>
              )}
            </motion.button>
          </form>

          {/* Demo credentials */}
          <div className="mt-4 p-3 rounded-xl bg-neon-blue/5 border border-neon-blue/15">
            <p className="text-neon-blue/70 text-xs text-center">
              Demo: Any email + password (min 6 chars) will work
            </p>
          </div>

          <div className="mt-6 pt-5 border-t border-white/5 text-center">
            <p className="text-white/40 text-sm">
              Don&apos;t have an account?{' '}
              <Link href="/register" className="text-neon-blue hover:text-neon-cyan transition-colors font-medium">
                Register
              </Link>
            </p>
          </div>
        </motion.div>

        <p className="text-center text-white/20 text-xs mt-6">
          &copy; 2024 SecurePay Vision · Final Project
        </p>
      </div>
    </div>
  )
}
