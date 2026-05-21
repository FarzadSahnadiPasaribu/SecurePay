'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { Shield, Eye, EyeOff, Lock, Mail, User, ArrowRight, AlertCircle, CheckCircle2 } from 'lucide-react'

interface RegisterForm {
  name: string
  email: string
  password: string
  confirmPassword: string
}

export default function RegisterPage() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterForm>()

  const password = watch('password', '')

  const onSubmit = async (data: RegisterForm) => {
    setLoading(true)
    setError('')
    try {
      await new Promise((r) => setTimeout(r, 1400))
      localStorage.setItem('auth_token', 'demo_token_' + Date.now())
      router.push('/dashboard')
    } catch {
      setError('Registration failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const passwordStrength = (pwd: string) => {
    let score = 0
    if (pwd.length >= 8) score++
    if (/[A-Z]/.test(pwd)) score++
    if (/[0-9]/.test(pwd)) score++
    if (/[^A-Za-z0-9]/.test(pwd)) score++
    return score
  }

  const strength = passwordStrength(password)
  const strengthLabel = ['', 'Weak', 'Fair', 'Good', 'Strong'][strength]
  const strengthColor = ['', 'bg-red-500', 'bg-amber-500', 'bg-yellow-400', 'bg-emerald-400'][strength]

  return (
    <div className="min-h-screen bg-navy-900 flex items-center justify-center px-4 py-12 relative overflow-hidden">
      <div className="absolute inset-0 cyber-grid-bg opacity-50" />
      <div className="absolute top-1/4 right-1/3 w-64 h-64 bg-neon-cyan/5 rounded-full blur-3xl" />
      <div className="absolute bottom-1/3 left-1/4 w-80 h-80 bg-neon-purple/5 rounded-full blur-3xl" />

      <motion.div
        className="absolute inset-x-0 h-px bg-gradient-to-r from-transparent via-neon-cyan/15 to-transparent pointer-events-none"
        animate={{ y: ['-10vh', '110vh'] }}
        transition={{ duration: 7, repeat: Infinity, ease: 'linear', repeatDelay: 4 }}
      />

      <div className="relative z-10 w-full max-w-sm">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
          <Link href="/" className="inline-flex flex-col items-center gap-3">
            <div
              className="w-14 h-14 rounded-2xl bg-neon-cyan/10 border border-neon-cyan/30 flex items-center justify-center"
              style={{ boxShadow: '0 0 20px rgba(0,255,204,0.2)' }}
            >
              <Shield size={28} className="text-neon-cyan" />
            </div>
            <div>
              <h1 className="text-xl font-black">
                <span className="text-white">SecurePay </span>
                <span className="text-neon-cyan">Vision</span>
              </h1>
              <p className="text-white/30 text-xs mt-0.5">Create your account</p>
            </div>
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card p-8 border border-white/10"
          style={{ boxShadow: '0 0 40px rgba(0,255,204,0.05)' }}
        >
          <h2 className="text-xl font-bold text-white mb-1">Create account</h2>
          <p className="text-white/40 text-sm mb-6">Start protecting your UMKM transactions</p>

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
            <div>
              <label className="text-white/50 text-xs font-medium uppercase tracking-wider mb-1.5 block">Full Name</label>
              <div className="relative">
                <User size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" />
                <input
                  type="text"
                  placeholder="Budi Santoso"
                  {...register('name', {
                    required: 'Full name is required',
                    minLength: { value: 2, message: 'Name must be at least 2 characters' },
                  })}
                  className="input-field pl-9 text-sm"
                />
              </div>
              {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name.message}</p>}
            </div>

            <div>
              <label className="text-white/50 text-xs font-medium uppercase tracking-wider mb-1.5 block">Email Address</label>
              <div className="relative">
                <Mail size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" />
                <input
                  type="email"
                  placeholder="budi@umkm.id"
                  {...register('email', {
                    required: 'Email is required',
                    pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Invalid email format' },
                  })}
                  className="input-field pl-9 text-sm"
                />
              </div>
              {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email.message}</p>}
            </div>

            <div>
              <label className="text-white/50 text-xs font-medium uppercase tracking-wider mb-1.5 block">Password</label>
              <div className="relative">
                <Lock size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Min 6 characters"
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
              {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password.message}</p>}
              {password && (
                <div className="mt-2">
                  <div className="flex gap-1 mb-1">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className={`h-1 flex-1 rounded-full transition-all ${i <= strength ? strengthColor : 'bg-white/10'}`} />
                    ))}
                  </div>
                  <p className={`text-xs ${strength === 4 ? 'text-emerald-400' : strength === 3 ? 'text-yellow-400' : strength === 2 ? 'text-amber-400' : 'text-red-400'}`}>
                    {strengthLabel} password
                  </p>
                </div>
              )}
            </div>

            <div>
              <label className="text-white/50 text-xs font-medium uppercase tracking-wider mb-1.5 block">Confirm Password</label>
              <div className="relative">
                <Lock size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Repeat password"
                  {...register('confirmPassword', {
                    required: 'Please confirm your password',
                    validate: (val) => val === password || 'Passwords do not match',
                  })}
                  className="input-field pl-9 text-sm"
                />
                {watch('confirmPassword') && watch('confirmPassword') === password && (
                  <CheckCircle2 size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-400" />
                )}
              </div>
              {errors.confirmPassword && <p className="text-red-400 text-xs mt-1">{errors.confirmPassword.message}</p>}
            </div>

            <p className="text-white/30 text-xs">
              By registering you agree to our{' '}
              <Link href="#" className="text-neon-blue hover:underline">Terms</Link>
              {' '}and{' '}
              <Link href="#" className="text-neon-blue hover:underline">Privacy Policy</Link>.
            </p>

            <motion.button
              type="submit"
              disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-2 py-3.5 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ background: 'linear-gradient(135deg, #00ffcc, #00d4ff)' }}
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
                  Creating account...
                </>
              ) : (
                <>
                  Create Account
                  <ArrowRight size={16} />
                </>
              )}
            </motion.button>
          </form>

          <div className="mt-6 pt-5 border-t border-white/5 text-center">
            <p className="text-white/40 text-sm">
              Already have an account?{' '}
              <Link href="/login" className="text-neon-cyan hover:text-neon-blue transition-colors font-medium">
                Sign in
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
