'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  Users, Shield, AlertTriangle, CheckCircle2,
  Activity, Eye, UserCheck, UserX, Crown
} from 'lucide-react'
import Navbar from '@/components/Navbar'
import Sidebar from '@/components/Sidebar'
import { createClient } from '@/lib/supabase'
import { ROLE_PERMISSIONS } from '@/lib/auth'
import type { User as SupabaseUser } from '@supabase/supabase-js'

const mockUsers = [
  { id: 'user-001', name: 'Budi Santoso', email: 'umkm@securepay.id', role: 'user', totalScans: 24, fraudFound: 3, lastActive: '2 jam lalu', status: 'aktif' },
  { id: 'user-002', name: 'Siti Rahayu', email: 'siti@warung.id', role: 'user', totalScans: 18, fraudFound: 1, lastActive: '1 hari lalu', status: 'aktif' },
  { id: 'user-003', name: 'Andi Pratama', email: 'andi@toko.id', role: 'user', totalScans: 31, fraudFound: 5, lastActive: '3 hari lalu', status: 'aktif' },
  { id: 'user-004', name: 'Dewi Lestari', email: 'dewi@salon.id', role: 'user', totalScans: 9, fraudFound: 0, lastActive: '1 minggu lalu', status: 'nonaktif' },
]

const globalStats = [
  { label: 'Total Pengguna', value: '4', icon: Users, color: 'text-neon-blue', bg: 'bg-neon-blue/10 border-neon-blue/20' },
  { label: 'Total Scan', value: '82', icon: Activity, color: 'text-neon-cyan', bg: 'bg-neon-cyan/10 border-neon-cyan/20' },
  { label: 'Total Fraud Ditemukan', value: '9', icon: AlertTriangle, color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/20' },
  { label: 'Pengguna Aktif', value: '3', icon: CheckCircle2, color: 'text-green-400', bg: 'bg-green-500/10 border-green-500/20' },
]

export default function AdminPage() {
  const router = useRouter()
  const [authUser, setAuthUser] = useState<SupabaseUser | null>(null)
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data }) => {
      const u = data.user
      if (!u || u.app_metadata?.role !== 'admin') {
        router.push('/dashboard')
        return
      }
      setAuthUser(u)
      setChecking(false)
    })
  }, [router])

  if (checking) return null

  const perms = ROLE_PERMISSIONS.admin

  return (
    <div className="min-h-screen bg-navy-900">
      <Navbar />
      <Sidebar />
      <main className="pt-16 pl-16 md:pl-56 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-8">

          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-neon-purple/10 border border-neon-purple/20 flex items-center justify-center">
                <Crown size={20} className="text-neon-purple" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Panel Admin</h1>
                <p className="text-white/40 text-sm">Kelola pengguna & pantau seluruh aktivitas sistem</p>
              </div>
            </div>
          </motion.div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {globalStats.map((s, i) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className={`glass-card p-5 border ${s.bg}`}
              >
                <s.icon className={`w-6 h-6 ${s.color} mb-2`} />
                <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
                <p className="text-gray-400 text-xs mt-1">{s.label}</p>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass-card p-6 mb-8 border border-neon-purple/20"
          >
            <h2 className="text-white font-semibold mb-4 flex items-center gap-2">
              <Shield size={16} className="text-neon-purple" />
              Hak Akses Role Admin
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {[
                { label: 'Lihat Semua Transaksi', ok: perms.canViewAllTransactions },
                { label: 'Lihat Semua Pengguna', ok: perms.canViewAllUsers },
                { label: 'Kelola Pengguna', ok: perms.canManageUsers },
                { label: 'Analytics Global', ok: perms.canViewGlobalAnalytics },
                { label: 'Export Semua Data', ok: perms.canExportAll },
                { label: 'Hapus Scan', ok: perms.canDeleteScans },
              ].map((p) => (
                <div key={p.label} className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/5">
                  {p.ok
                    ? <CheckCircle2 size={14} className="text-green-400 flex-shrink-0" />
                    : <AlertTriangle size={14} className="text-red-400 flex-shrink-0" />
                  }
                  <span className="text-gray-300 text-xs">{p.label}</span>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="glass-card overflow-hidden"
          >
            <div className="p-5 border-b border-white/5">
              <h2 className="text-white font-semibold flex items-center gap-2">
                <Users size={16} className="text-neon-blue" />
                Manajemen Pengguna
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/5">
                    {['Pengguna', 'Role', 'Total Scan', 'Fraud Ditemukan', 'Terakhir Aktif', 'Status', 'Aksi'].map(h => (
                      <th key={h} className="text-left py-3 px-4 text-gray-400 text-xs font-medium">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {mockUsers.map((u, i) => (
                    <motion.tr
                      key={u.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 + i * 0.05 }}
                      className="hover:bg-white/3 transition-colors"
                    >
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-neon-blue/20 text-neon-blue flex items-center justify-center text-xs font-bold">
                            {u.name.charAt(0)}
                          </div>
                          <div>
                            <p className="text-white text-xs font-medium">{u.name}</p>
                            <p className="text-gray-500 text-[10px]">{u.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold border bg-neon-blue/20 text-neon-blue border-neon-blue/30">
                          Pengguna UMKM
                        </span>
                      </td>
                      <td className="py-3 px-4 text-gray-300 text-xs">{u.totalScans}</td>
                      <td className="py-3 px-4">
                        <span className={`text-xs font-medium ${u.fraudFound > 0 ? 'text-red-400' : 'text-green-400'}`}>
                          {u.fraudFound} {u.fraudFound > 0 ? '⚠️' : '✓'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-gray-400 text-xs">{u.lastActive}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${
                          u.status === 'aktif' ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'
                        }`}>
                          {u.status === 'aktif' ? 'Aktif' : 'Nonaktif'}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1">
                          <button className="p-1.5 rounded-lg hover:bg-neon-blue/10 text-gray-400 hover:text-neon-blue transition-colors" title="Lihat detail">
                            <Eye size={12} />
                          </button>
                          <button className="p-1.5 rounded-lg hover:bg-green-500/10 text-gray-400 hover:text-green-400 transition-colors" title="Aktifkan">
                            <UserCheck size={12} />
                          </button>
                          <button className="p-1.5 rounded-lg hover:bg-red-500/10 text-gray-400 hover:text-red-400 transition-colors" title="Nonaktifkan">
                            <UserX size={12} />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>

        </div>
      </main>
    </div>
  )
}
