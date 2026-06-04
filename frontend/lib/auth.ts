'use client'

export type UserRole = 'admin' | 'user'

export interface AuthUser {
  id: string
  name: string
  email: string
  role: UserRole
  avatar?: string
}

// Demo users untuk presentasi
export const DEMO_USERS: Record<string, AuthUser & { password: string }> = {
  'admin@securepay.id': {
    id: 'admin-001',
    name: 'Admin SecurePay',
    email: 'admin@securepay.id',
    password: 'admin123',
    role: 'admin',
  },
  'umkm@securepay.id': {
    id: 'user-001',
    name: 'Budi Santoso (UMKM)',
    email: 'umkm@securepay.id',
    password: 'user123',
    role: 'user',
  },
}

export function getCurrentUser(): AuthUser | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem('auth_user')
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function login(email: string, password: string): AuthUser | null {
  const found = DEMO_USERS[email.toLowerCase()]
  if (!found || found.password !== password) return null
  const { password: _, ...user } = found
  localStorage.setItem('auth_user', JSON.stringify(user))
  localStorage.setItem('auth_token', `demo_${user.role}_${Date.now()}`)
  return user
}

export function logout() {
  localStorage.removeItem('auth_user')
  localStorage.removeItem('auth_token')
}

export function isAdmin(): boolean {
  return getCurrentUser()?.role === 'admin'
}

// Hak akses per role
export const ROLE_PERMISSIONS = {
  admin: {
    canViewAllTransactions: true,
    canViewAllUsers: true,
    canManageUsers: true,
    canViewGlobalAnalytics: true,
    canExportAll: true,
    canDeleteScans: true,
    label: 'Administrator',
    badge: 'bg-neon-purple/20 text-neon-purple border-neon-purple/30',
  },
  user: {
    canViewAllTransactions: false,
    canViewAllUsers: false,
    canManageUsers: false,
    canViewGlobalAnalytics: false,
    canExportAll: false,
    canDeleteScans: false,
    label: 'Pengguna UMKM',
    badge: 'bg-neon-blue/20 text-neon-blue border-neon-blue/30',
  },
} satisfies Record<UserRole, {
  canViewAllTransactions: boolean
  canViewAllUsers: boolean
  canManageUsers: boolean
  canViewGlobalAnalytics: boolean
  canExportAll: boolean
  canDeleteScans: boolean
  label: string
  badge: string
}>
