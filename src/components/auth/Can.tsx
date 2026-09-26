import React from 'react'
import { useAuth } from '@/hooks/useAuth'

interface CanProps {
  permission?: string
  permissions?: string[]
  children: React.ReactNode
  fallback?: React.ReactNode
}

/**
 * Componente declarativo para control de acceso en la UI.
 * Renderiza children si el usuario autenticado tiene el permiso requerido.
 */
export function Can({ permission, permissions, children, fallback = null }: CanProps) {
  const { hasPermission, hasAnyPermission } = useAuth()

  if (permission && !hasPermission(permission)) {
    return <>{fallback}</>
  }

  if (permissions && permissions.length > 0 && !hasAnyPermission(permissions)) {
    return <>{fallback}</>
  }

  return <>{children}</>
}
