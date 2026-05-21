'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Shield, Menu, X, Bell, Search, LogOut, User } from 'lucide-react'
import { createClient } from '@/lib/supabase'
import type { User as SupabaseUser } from '@supabase/supabase-js'

const navLinks = [
  { href: '/', label: 'Beranda' },
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/scan', label: 'Scan' },
  { href: '/analytics', label: 'Analitik' },
  { href: '/history', label: 'Riwayat' },
  { href: '/about', label: 'Tentang' },
]

export default function Navbar() {
  const pathname = usePathname()
  const router = useRouter()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [authUser, setAuthUser] = useState<SupabaseUser | null>(null)

  useEffect(() => {
    const supabase = createClient()

    supabase.auth.getUser().then(({ data }) => {
      setAuthUser(data.user)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setAuthUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  const isDashboardPage = ['/dashboard', '/scan', '/analytics', '/history', '/about', '/admin'].some(
    (p) => pathname.startsWith(p)
  )

  const displayName = authUser?.user_metadata?.full_name || authUser?.email?.split('@')[0] || ''

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 border-b border-white/5"
      style={{
        background: 'rgba(10, 15, 30, 0.85)',
        backdropFilter: 'blur(20px)',
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div
              className="w-8 h-8 rounded-xl bg-neon-blue/10 border border-neon-blue/30 flex items-center justify-center transition-all duration-300 group-hover:bg-neon-blue/20"
              style={{ boxShadow: '0 0 12px rgba(0,212,255,0.2)' }}
            >
              <Shield size={16} className="text-neon-blue" />
            </div>
            <div className="flex items-baseline gap-1">
              <span className="font-bold text-white text-sm">SecurePay</span>
              <span
                className="font-bold text-xs"
                style={{ color: '#00d4ff', textShadow: '0 0 8px rgba(0,212,255,0.5)' }}
              >
                Vision
              </span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const isActive = link.href === '/' ? pathname === '/' : pathname.startsWith(link.href)
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`relative px-3 py-1.5 text-sm font-medium rounded-lg transition-all duration-200 ${
                    isActive
                      ? 'text-neon-blue bg-neon-blue/10'
                      : 'text-white/50 hover:text-white/80 hover:bg-white/5'
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="nav-indicator"
                      className="absolute inset-0 bg-neon-blue/10 rounded-lg border border-neon-blue/20"
                      transition={{ type: 'spring', duration: 0.3 }}
                    />
                  )}
                  <span className="relative z-10">{link.label}</span>
                </Link>
              )
            })}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-2">
            {isDashboardPage && authUser && (
              <>
                <button className="p-2 rounded-lg hover:bg-white/5 transition-colors hidden md:flex">
                  <Search size={16} className="text-white/40" />
                </button>
                <button className="relative p-2 rounded-lg hover:bg-white/5 transition-colors hidden md:flex">
                  <Bell size={16} className="text-white/40" />
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full border border-navy-900" />
                </button>
              </>
            )}

            {authUser ? (
              <div className="hidden md:flex items-center gap-2">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5">
                  <div className="w-6 h-6 rounded-full bg-neon-blue/20 border border-neon-blue/30 flex items-center justify-center">
                    <User size={12} className="text-neon-blue" />
                  </div>
                  <span className="text-white/70 text-xs font-medium">{displayName}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1.5 text-xs text-white/40 hover:text-red-400 px-3 py-1.5 rounded-lg hover:bg-red-500/5 transition-all"
                >
                  <LogOut size={14} />
                  Keluar
                </button>
              </div>
            ) : (
              <div className="hidden md:flex items-center gap-2">
                <Link
                  href="/login"
                  className="text-sm font-medium text-white/50 hover:text-white/80 px-3 py-1.5 rounded-lg hover:bg-white/5 transition-all"
                >
                  Masuk
                </Link>
                <Link
                  href="/register"
                  className="btn-primary text-xs px-4 py-2"
                >
                  Daftar
                </Link>
              </div>
            )}

            {/* Mobile menu toggle */}
            <button
              className="md:hidden p-2 rounded-lg hover:bg-white/5 transition-colors"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <X size={18} className="text-white" /> : <Menu size={18} className="text-white" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="md:hidden border-t border-white/5 overflow-hidden"
            style={{ background: 'rgba(10,15,30,0.95)' }}
          >
            <div className="px-4 py-3 space-y-1">
              {navLinks.map((link) => {
                const isActive = link.href === '/' ? pathname === '/' : pathname.startsWith(link.href)
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className={`block px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isActive ? 'text-neon-blue bg-neon-blue/10' : 'text-white/60 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    {link.label}
                  </Link>
                )
              })}
              <div className="pt-2 flex gap-2">
                {authUser ? (
                  <button
                    onClick={() => { setMobileOpen(false); handleLogout() }}
                    className="flex-1 btn-secondary text-center text-sm py-2 flex items-center justify-center gap-1"
                  >
                    <LogOut size={14} />
                    Keluar
                  </button>
                ) : (
                  <>
                    <Link href="/login" onClick={() => setMobileOpen(false)} className="flex-1 btn-secondary text-center text-sm py-2">
                      Masuk
                    </Link>
                    <Link href="/register" onClick={() => setMobileOpen(false)} className="flex-1 btn-primary text-center text-sm py-2">
                      Daftar
                    </Link>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  )
}
