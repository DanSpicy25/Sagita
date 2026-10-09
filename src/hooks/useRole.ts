import { useMemo, useState, useEffect, useCallback } from 'react'
import { useAuth } from './useAuth'
import { Empleado, UserRole } from '@/types'
import { LocalStorageAdapter } from '@/repositories/local/LocalStorageAdapter'

export interface RoleCapabilities {
  canViewFinancials: boolean
  canManageSettings: boolean
  canManageUsers: boolean
  canManageInventory: boolean
  canManageEmployees: boolean
  canChargePOS: boolean
  canWalkInReception: boolean
  isPersonalAgendaPriority: boolean
}

/**
 * Evalúa capacidades funcionales basadas en rol y permisos.
 * Nota: El frontend usa esto para adaptar la UX de forma ergonómica;
 * el backend sigue siendo la autoridad definitiva de seguridad.
 */
export function getRoleCapabilities(
  rol?: UserRole | string,
  hasPermission?: (perm: string) => boolean
): RoleCapabilities {
  const r = (rol || '').toLowerCase()
  const isSuper = r === 'superadmin'
  const isAdmin = r === 'admin' || isSuper
  const isManager = r === 'gerente'
  const isWorker = r === 'empleado' || r === 'profesional'
  const isReception = r === 'recepcionista'

  const check = (perm: string) => (hasPermission ? hasPermission(perm) : false)

  return {
    canViewFinancials:
      isSuper || isAdmin || isManager || check('reports.read') || check('sales.read'),
    canManageSettings: isSuper || isAdmin || check('settings.manage'),
    canManageUsers: isSuper || isAdmin || check('users.manage'),
    canManageInventory: isSuper || isAdmin || isManager || check('inventory.read'),
    canManageEmployees: isSuper || isAdmin || check('employees.manage'),
    canChargePOS:
      isSuper ||
      isAdmin ||
      isManager ||
      isReception ||
      check('sales.create') ||
      check('sales.read'),
    canWalkInReception:
      isSuper || isAdmin || isManager || isReception || check('appointments.create'),
    isPersonalAgendaPriority: isWorker,
  }
}

/**
 * Devuelve la etiqueta legible en español para la insignia y encabezados.
 */
export function getRoleLabel(rol?: UserRole | string): string {
  switch ((rol || '').toLowerCase()) {
    case 'superadmin':
      return 'Superadministrador'
    case 'admin':
      return 'Administrador'
    case 'gerente':
      return 'Gerente de Sucursal'
    case 'empleado':
    case 'profesional':
      return 'Profesional'
    case 'recepcionista':
      return 'Recepción'
    case 'cliente':
      return 'Cliente'
    default:
      return rol ? rol.charAt(0).toUpperCase() + rol.slice(1) : 'Usuario'
  }
}

export function useRole() {
  const { user, permissions, hasPermission, hasAnyPermission, logout } = useAuth()

  const rol = user?.rol?.toLowerCase() || ''
  const isSuperAdmin = rol === 'superadmin'
  const isAdmin = rol === 'admin' || isSuperAdmin
  const isManager = rol === 'gerente'
  const isManagement = isSuperAdmin || isAdmin || isManager
  const isWorker = rol === 'empleado' || rol === 'profesional'
  const isReceptionist = rol === 'recepcionista'
  const isClient = rol === 'cliente'

  const roleLabel = useMemo(() => getRoleLabel(user?.rol), [user?.rol])

  // Resolver ID de empleado vinculado al usuario de forma reactiva
  const [currentEmpleadoId, setCurrentEmpleadoId] = useState<number | undefined>(() => {
    if (!user) return undefined
    try {
      const stored = LocalStorageAdapter.getCollection<Empleado>('empleados', [])
      const match = stored.find(
        (e) =>
          e.usuario_id === user.id ||
          (user.email && e.email?.toLowerCase() === user.email.toLowerCase())
      )
      return match?.id
    } catch {
      return undefined
    }
  })

  useEffect(() => {
    if (!user) {
      setCurrentEmpleadoId(undefined)
      return
    }
    try {
      const stored = LocalStorageAdapter.getCollection<Empleado>('empleados', [])
      const match = stored.find(
        (e) =>
          e.usuario_id === user.id ||
          (user.email && e.email?.toLowerCase() === user.email.toLowerCase())
      )
      if (match) {
        setCurrentEmpleadoId(match.id)
      }
    } catch {
      // Ignorar fallas silenciosas en entornos aislados
    }
  }, [user])

  const capabilities = useMemo(
    () => getRoleCapabilities(user?.rol, hasPermission),
    [user?.rol, hasPermission]
  )

  const isAssignedToUser = useCallback(
    (item: {
      empleado_id?: number
      empleado?: { id?: number; usuario_id?: number; email?: string } | null
    }): boolean => {
      if (!user) return false
      if (currentEmpleadoId && item.empleado_id === currentEmpleadoId) return true
      if (currentEmpleadoId && item.empleado?.id === currentEmpleadoId) return true
      if (user.id && item.empleado?.usuario_id === user.id) return true
      if (
        user.email &&
        item.empleado?.email &&
        item.empleado.email.toLowerCase() === user.email.toLowerCase()
      ) {
        return true
      }
      return false
    },
    [user, currentEmpleadoId]
  )

  return {
    user,
    permissions,
    hasPermission,
    hasAnyPermission,
    logout,
    isSuperAdmin,
    isAdmin,
    isManager,
    isManagement,
    isWorker,
    isReceptionist,
    isClient,
    roleLabel,
    currentEmpleadoId,
    capabilities,
    isAssignedToUser,
  }
}

