import React, {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react'
import { User, LoginPayload, UserRole } from '@/types'
import { authService, apiClient } from '@/services/api.client'

// ─── Tipos del contexto ────────────────────────────────────────────────────

export const ROLE_PERMISSIONS: Record<UserRole, string[]> = {
  superadmin: ['*'],
  admin: [
    'appointments.read', 'appointments.create', 'appointments.update', 'appointments.delete',
    'clients.read', 'clients.create', 'clients.update', 'clients.delete',
    'services.read', 'services.create', 'services.update',
    'employees.read', 'employees.manage',
    'sales.read', 'sales.create',
    'inventory.read', 'inventory.manage',
    'reports.read',
    'settings.manage',
    'users.manage'
  ],
  gerente: [
    'appointments.read', 'appointments.create', 'appointments.update', 'appointments.delete',
    'clients.read', 'clients.create', 'clients.update',
    'services.read', 'services.create', 'services.update',
    'employees.read',
    'sales.read', 'sales.create',
    'inventory.read', 'inventory.manage',
    'reports.read'
  ],
  recepcionista: [
    'appointments.read', 'appointments.create', 'appointments.update',
    'clients.read', 'clients.create', 'clients.update',
    'services.read',
    'sales.read', 'sales.create'
  ],
  empleado: [
    'appointments.read',
    'clients.read',
    'services.read'
  ],
  cliente: []
}

interface AuthContextValue {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (payload: LoginPayload) => Promise<void>
  logout: () => Promise<void>
  permissions: string[]
  hasPermission: (perm: string) => boolean
  hasAnyPermission: (perms: string[]) => boolean
}

// ─── Contexto ─────────────────────────────────────────────────────────────

export const AuthContext = createContext<AuthContextValue | undefined>(undefined)

// ─── Provider ─────────────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Restaurar sesión al montar
  useEffect(() => {
    const token = apiClient.getToken()
    if (!token) {
      setIsLoading(false)
      return
    }
    authService
      .me()
      .then(setUser)
      .catch(() => apiClient.clearTokens())
      .finally(() => setIsLoading(false))
  }, [])

  const login = useCallback(async (payload: LoginPayload) => {
    const { user: me } = await authService.login(payload)
    setUser(me)
  }, [])

  const logout = useCallback(async () => {
    await authService.logout()
    setUser(null)
  }, [])

  const permissions = useMemo<string[]>(() => {
    if (!user) return []
    if (user.permisos && user.permisos.length > 0) return user.permisos
    return ROLE_PERMISSIONS[user.rol] || []
  }, [user])

  const hasPermission = useCallback((perm: string): boolean => {
    if (!user) return false
    return permissions.includes('*') || permissions.includes(perm)
  }, [user, permissions])

  const hasAnyPermission = useCallback((perms: string[]): boolean => {
    if (!user) return false
    if (permissions.includes('*')) return true
    return perms.some((p) => permissions.includes(p))
  }, [user, permissions])

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated: !!user,
      isLoading,
      login,
      logout,
      permissions,
      hasPermission,
      hasAnyPermission,
    }),
    [user, isLoading, login, logout, permissions, hasPermission, hasAnyPermission]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

