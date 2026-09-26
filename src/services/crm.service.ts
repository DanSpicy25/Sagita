import { apiClient } from './api.client'
import {
  Tenant,
  CrmConfig,
  ApiKey,
  AuditLog,
} from '@/types'

export const crmService = {
  // ─── Multi-Tenant ────────────────────────────────────────────────────────
  getTenants: () =>
    apiClient.get<Tenant[]>('/tenants'),

  crearTenant: (data: Partial<Tenant>) =>
    apiClient.post<Tenant>('/tenants', data),

  // ─── Conectores CRM ──────────────────────────────────────────────────────
  getCrmConfigs: () =>
    apiClient.get<CrmConfig[]>('/crm/conectores'),

  toggleCrm: (id: string, estado: 'conectado' | 'desconectado') =>
    apiClient.put<CrmConfig>(`/crm/conectores/${id}`, { estado }),

  sincronizarCrm: (id: string) =>
    apiClient.post<{ sincronizados: number; timestamp: string }>(`/crm/conectores/${id}/sync`, {}),

  // ─── Claves de API para Desarrolladores ──────────────────────────────────
  getApiKeys: () =>
    apiClient.get<ApiKey[]>('/api-keys'),

  crearApiKey: (data: { nombre: string; permisos: 'read' | 'write' | 'admin' }) =>
    apiClient.post<ApiKey>('/api-keys', data),

  revocarApiKey: (id: number) =>
    apiClient.delete<void>(`/api-keys/${id}`),

  // ─── Registros de Auditoría (Audit Logs) ─────────────────────────────────
  getAuditLogs: (params?: { search?: string; nivel?: string }) => {
    const query = new URLSearchParams()
    if (params?.search) query.set('search', params.search)
    if (params?.nivel) query.set('nivel', params.nivel)
    const qs = query.toString() ? `?${query.toString()}` : ''
    return apiClient.get<AuditLog[]>(`/audit-logs${qs}`)
  },
}

