import type { PlatformFlag } from '@/types'

/**
 * Interruptores globales de plataforma (nivel build/entorno).
 * Apagan una capacidad para TODOS los negocios. La activación por negocio vive en
 * el perfil de negocio (`ModulesContext`) y el catálogo en `src/config/modules.ts`.
 */
export const FEATURES: Record<PlatformFlag, boolean> = {
  appointments: true,
  clients: true,
  services: true,
  employees: true,
  sales: true,
  inventory: true,
  billing: true,
  reports: true,
  crm: true,
  notifications: true,
  settings: true,
  roles: true,
}

export type FeatureKey = PlatformFlag

export function isFeatureEnabled(key: FeatureKey): boolean {
  return FEATURES[key]
}
