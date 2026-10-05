export const FEATURES = {
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
} as const

export type FeatureKey = keyof typeof FEATURES

export function isFeatureEnabled(key: FeatureKey): boolean {
  return FEATURES[key]
}
