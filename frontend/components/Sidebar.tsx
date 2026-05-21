'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Shield,
  LayoutDashboard,
  ScanLine,
  BarChart3,
  History,
  Info,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Settings,
  User,
  Crown,
} from 'lucide-react'
import { createClient } from '@/lib/supabase'
import type { User as SupabaseUser } from '@supabase/supabase-js'

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/scan', label: 'Scan Invoice', icon: ScanLine },
  { href: '/analytics', label: 'Analitik', icon: BarChart3 },
  { href: '/history', label: 'Riwayat', icon: History },
  { href: '/about', label: 'Tentang', icon: Info },
]

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false)
  const pathname = usePathname()
  const router = useRouter()
  const [authUser, setAuthUser] = useState<SupabaseUser | null>(null)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data }) => setAuthUser(data.user))
  }, [])

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  const displayName = authUser?.user_metadata?.full_name || authUser?.email?.split('@')[0] || 'Pengguna'
  const displayEmail = authUser?.email || ''
  const isAdmin = authUser?.app_metadata?.role === 'admin'

  return (
    <motion.aside
      animate={{ width: collapsed ? 64 : 220 }}
      transition={{ duration: 0.25, ease: 'easeInOut' }}
      className="fixed left-0 top-16 bottom-0 z-40 flex flex-col border-r border-white/5 overflow-hidden"
      style={{
        background: 'rgba(10,15,30,0.95)',
        backdropFilter: 'blur(20px)',
      }}
    >
      {/* Logo area */}
      <div className="flex items-center justify-between px-4 py-4 border-b border-white/5">
        {!collapsed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col"
          >
            <span className="text-xs text-white/30 uppercase tracking-wider">Navigasi</span>
          </motion.div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1.5 rounded-lg hover:bg-white/5 transition-colors ml-auto"
        >
          {collapsed ? (
            <ChevronRight size={14} className="text-white/40" />
          ) : (
            <ChevronLeft size={14} className="text-white/40" />
          )}
        </button>
      </div>

      {/* Nav items */}
      <nav className="flex-1 px-2 py-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
          return (
            <Link key={item.href} href={item.href}>
              <motion.div
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 cursor-pointer group ${
                  isActive
                    ? 'bg-neon-blue/10 border border-neon-blue/20 text-neon-blue'
                    : 'text-white/50 hover:text-white/80 hover:bg-white/5'
                }`}
                style={isActive ? { boxShadow: '0 0 12px rgba(0,212,255,0.1)' } : {}}
              >
                <Icon
                  size={18}
                  className={`flex-shrink-0 transition-colors ${isActive ? 'text-neon-blue' : 'text-white/40 group-hover:text-white/60'}`}
                />
                <AnimatePresence>
                  {!collapsed && (
                    <motion.span
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: 'auto' }}
                      exit={{ opacity: 0, width: 0 }}
                      className="text-sm font-medium whitespace-nowrap overflow-hidden"
                    >
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>
                {isActive && (
                  <motion.div
                    layoutId="sidebar-active"
                    className="absolute left-0 w-0.5 h-6 bg-neon-blue rounded-r-full"
                    transition={{ type: 'spring', duration: 0.3 }}
                  />
                )}
              </motion.div>
            </Link>
          )
        })}

        {/* Admin link */}
        {isAdmin && (
          <Link href="/admin">
            <motion.div
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 cursor-pointer group ${
                pathname.startsWith('/admin')
                  ? 'bg-neon-purple/10 border border-neon-purple/20 text-neon-purple'
                  : 'text-white/50 hover:text-white/80 hover:bg-white/5'
              }`}
            >
              <Crown size={18} className={`flex-shrink-0 ${pathname.startsWith('/admin') ? 'text-neon-purple' : 'text-white/40 group-hover:text-white/60'}`} />
              <AnimatePresence>
                {!collapsed && (
                  <motion.span
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: 'auto' }}
                    exit={{ opacity: 0, width: 0 }}
                    className="text-sm font-medium whitespace-nowrap overflow-hidden"
                  >
                    Admin Panel
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.div>
          </Link>
        )}
      </nav>

      {/* Bottom section */}
      <div className="px-2 py-3 border-t border-white/5 space-y-1">
        <button
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-white/40 hover:text-white/70 hover:bg-white/5 transition-all"
        >
          <Settings size={18} className="flex-shrink-0" />
          {!collapsed && <span className="text-sm">Pengaturan</span>}
        </button>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-white/40 hover:text-red-400 hover:bg-red-500/5 transition-all"
        >
          <LogOut size={18} className="flex-shrink-0" />
          {!collapsed && <span className="text-sm">Keluar</span>}
        </button>
      </div>

      {/* User info */}
      {!collapsed && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="px-4 py-3 border-t border-white/5"
        >
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-neon-blue/20 border border-neon-blue/30 flex items-center justify-center flex-shrink-0">
              <User size={12} className="text-neon-blue" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-white/70 truncate">{displayName}</p>
              <p className="text-xs text-white/30 truncate">{displayEmail}</p>
            </div>
          </div>
        </motion.div>
      )}
    </motion.aside>
  )
}
