import { apiClient } from './api.client'
import {
  Tenant,
  CrmConfig,
  ApiKey,
  AuditLog,
  ApiResponse,
} from '@/types'
import { LocalStorageAdapter } from '@/repositories/local/LocalStorageAdapter'

const SEED_TENANTS: Tenant[] = [
  {
    id: 'sede-principal',
    nombre: 'Sede Principal (Centro)',
    slug: 'sede-principal',
    plan: 'enterprise',
    activo: true,
    es_principal: true,
    direccion: 'Av. Paseo de la Reforma 405, Piso 12',
    telefono: '+1 555-0100',
    citas_mes: 342,
    limite_citas: 1000,
  },
  {
    id: 'sucursal-norte',
    nombre: 'Sucursal Norte (Polanco)',
    slug: 'sucursal-norte',
    plan: 'pro',
    activo: true,
    es_principal: false,
    direccion: 'Calle Arquímedes 130',
    telefono: '+1 555-0200',
    citas_mes: 185,
    limite_citas: 500,
  },
  {
    id: 'sucursal-sur',
    nombre: 'Sucursal Sur (Coyoacán)',
    slug: 'sucursal-sur',
    plan: 'starter',
    activo: true,
    es_principal: false,
    direccion: 'Av. Miguel Ángel de Quevedo 410',
    telefono: '+1 555-0300',
    citas_mes: 78,
    limite_citas: 200,
  },
]

const SEED_CRM_CONFIGS: CrmConfig[] = [
  {
    id: 'hubspot',
    proveedor: 'hubspot',
    nombre: 'HubSpot CRM',
    descripcion: 'Sincronización bidireccional de clientes como Contactos y citas como Deals/Negocios.',
    estado: 'conectado',
    cuenta_conectada: 'Sagitta Corp (Portal ID: 9482103)',
    sincronizar_contactos: true,
    sincronizar_deals: true,
    ultima_sync: '2026-09-17T15:20:00Z',
    total_sincronizados: 438,
  },
  {
    id: 'salesforce',
    proveedor: 'salesforce',
    nombre: 'Salesforce Sales Cloud',
    descripcion: 'Mapeo de citas a Leads y Oportunidades comerciales con seguimiento de ingresos.',
    estado: 'desconectado',
    sincronizar_contactos: false,
    sincronizar_deals: false,
    total_sincronizados: 0,
  },
  {
    id: 'pipedrive',
    proveedor: 'pipedrive',
    nombre: 'Pipedrive CRM',
    descripcion: 'Creación automática de actividades y etapas en el pipeline de ventas.',
    estado: 'desconectado',
    sincronizar_contactos: false,
    sincronizar_deals: false,
    total_sincronizados: 0,
  },
  {
    id: 'zoho',
    proveedor: 'zoho',
    nombre: 'Zoho CRM',
    descripcion: 'Sincronización con módulo de contactos y calendario empresarial de Zoho.',
    estado: 'desconectado',
    sincronizar_contactos: false,
    sincronizar_deals: false,
    total_sincronizados: 0,
  },
]

const SEED_API_KEYS: ApiKey[] = [
  {
    id: 1,
    nombre: 'Producción Webflow / WordPress',
    token: 'sag_live_9f81a8b2c4e610d3e5f7a9b0c2d4e6f8',
    permisos: 'write',
    creada_en: '2026-08-10T10:00:00Z',
    ultimo_uso: '2026-09-17T15:10:00Z',
    activa: true,
  },
  {
    id: 2,
    nombre: 'Zapier / Make Automatización',
    token: 'sag_live_7c61d5e4b3a201f9e8d7c6b5a4f3e2d1',
    permisos: 'read',
    creada_en: '2026-09-01T14:30:00Z',
    ultimo_uso: '2026-09-17T12:00:00Z',
    activa: true,
  },
  {
    id: 3,
    nombre: 'ERP Interno Finanzas',
    token: 'sag_live_3b2a10f9e8d7c6b5a4f3e2d19f81a8b2',
    permisos: 'admin',
    creada_en: '2026-09-15T09:00:00Z',
    ultimo_uso: '2026-09-16T18:40:00Z',
    activa: true,
  },
]

const SEED_AUDIT_LOGS: AuditLog[] = [
  {
    id: 101,
    tenant_id: 'sede-principal',
    usuario: 'Carlos Rodríguez',
    email: 'administracion@sagitta.com',
    rol: 'admin',
    accion: 'Cita Cancelada y Reembolsada',
    modulo: 'Citas',
    ip: '190.14.88.22',
    detalles: 'Cita #204 (Consulta General) cancelada con reembolso por $50.00 a María López',
    nivel: 'warning',
    created_at: '2026-09-17T15:12:00Z',
  },
  {
    id: 102,
    tenant_id: 'sede-principal',
    usuario: 'Silvio Admin',
    email: 'silvio@sagitta.com',
    rol: 'admin',
    accion: 'Marca Blanca Actualizada',
    modulo: 'Configuración',
    ip: '181.42.10.95',
    detalles: 'Se cambió la paleta de colores a Esmeralda y se actualizó el logotipo corporativo',
    nivel: 'info',
    created_at: '2026-09-17T14:45:00Z',
  },
  {
    id: 103,
    tenant_id: 'sucursal-norte',
    usuario: 'Ana Gómez',
    email: 'ana.gomez@sagitta.com',
    rol: 'empleado',
    accion: 'Horario Laboral Modificado',
    modulo: 'Empleados',
    ip: '201.220.45.18',
    detalles: 'Bloqueo de horario para el día viernes 18 por capacitación interna',
    nivel: 'info',
    created_at: '2026-09-17T13:20:00Z',
  },
]

function generateHex(len: number): string {
  const chars = '0123456789abcdef'
  let res = ''
  for (let i = 0; i < len; i++) {
    res += chars[Math.floor(Math.random() * chars.length)]
  }
  return res
}

export const crmService = {
  // ─── Multi-Tenant ────────────────────────────────────────────────────────
  getTenants: async (): Promise<ApiResponse<Tenant[]>> => {
    try {
      return await apiClient.get<Tenant[]>('/tenants')
    } catch {
      const data = LocalStorageAdapter.getCollection<Tenant>('tenants', SEED_TENANTS)
      return { success: true, message: 'OK', data }
    }
  },

  crearTenant: async (data: Partial<Tenant>): Promise<ApiResponse<Tenant>> => {
    try {
      return await apiClient.post<Tenant>('/tenants', data)
    } catch {
      const created = LocalStorageAdapter.insert<Tenant>('tenants', {
        ...data,
        id: data.slug || `tenant-${Date.now()}`,
        activo: true,
        citas_mes: 0,
        limite_citas: 500,
      } as Tenant)
      return { success: true, message: 'Sucursal creada con éxito', data: created }
    }
  },

  // ─── Conectores CRM ──────────────────────────────────────────────────────
  getCrmConfigs: async (): Promise<ApiResponse<CrmConfig[]>> => {
    try {
      return await apiClient.get<CrmConfig[]>('/crm/conectores')
    } catch {
      const data = LocalStorageAdapter.getCollection<CrmConfig>('crm_configs', SEED_CRM_CONFIGS)
      return { success: true, message: 'OK', data }
    }
  },

  toggleCrm: async (id: string, estado: 'conectado' | 'desconectado'): Promise<ApiResponse<CrmConfig>> => {
    try {
      return await apiClient.put<CrmConfig>(`/crm/conectores/${id}`, { estado })
    } catch {
      const updated = LocalStorageAdapter.update<CrmConfig>('crm_configs', id, { estado })
      return { success: true, message: 'OK', data: updated || undefined }
    }
  },

  sincronizarCrm: async (id: string): Promise<ApiResponse<{ sincronizados: number; timestamp: string }>> => {
    try {
      return await apiClient.post<{ sincronizados: number; timestamp: string }>(`/crm/conectores/${id}/sync`, {})
    } catch {
      const timestamp = new Date().toISOString()
      const syncCount = Math.floor(Math.random() * 25) + 10
      LocalStorageAdapter.update<CrmConfig>('crm_configs', id, {
        ultima_sync: timestamp,
      })
      return {
        success: true,
        message: 'Sincronizado',
        data: { sincronizados: syncCount, timestamp },
      }
    }
  },

  // ─── Claves de API para Desarrolladores ──────────────────────────────────
  getApiKeys: async (): Promise<ApiResponse<ApiKey[]>> => {
    try {
      return await apiClient.get<ApiKey[]>('/api-keys')
    } catch {
      const data = LocalStorageAdapter.getCollection<ApiKey>('api_keys', SEED_API_KEYS)
      return { success: true, message: 'OK', data }
    }
  },

  crearApiKey: async (data: { nombre: string; permisos: 'read' | 'write' | 'admin' }): Promise<ApiResponse<ApiKey>> => {
    try {
      return await apiClient.post<ApiKey>('/api-keys', data)
    } catch {
      const nuevaKey: ApiKey = {
        id: Date.now(),
        nombre: data.nombre,
        token: `sag_live_${generateHex(32)}`,
        permisos: data.permisos,
        creada_en: new Date().toISOString(),
        ultimo_uso: 'Nunca',
        activa: true,
      }
      LocalStorageAdapter.insert<ApiKey>('api_keys', nuevaKey)
      return { success: true, message: 'Clave generada con éxito', data: nuevaKey }
    }
  },

  revocarApiKey: async (id: number): Promise<ApiResponse<void>> => {
    try {
      return await apiClient.delete<void>(`/api-keys/${id}`)
    } catch {
      LocalStorageAdapter.remove<ApiKey>('api_keys', id)
      return { success: true, message: 'Clave revocada con éxito' }
    }
  },

  // ─── Registros de Auditoría (Audit Logs) ─────────────────────────────────
  getAuditLogs: async (params?: { search?: string; nivel?: string }): Promise<ApiResponse<AuditLog[]>> => {
    try {
      const query = new URLSearchParams()
      if (params?.search) query.set('search', params.search)
      if (params?.nivel) query.set('nivel', params.nivel)
      const qs = query.toString() ? `?${query.toString()}` : ''
      return await apiClient.get<AuditLog[]>(`/audit-logs${qs}`)
    } catch {
      let data = LocalStorageAdapter.getCollection<AuditLog>('audit_logs', SEED_AUDIT_LOGS)
      if (params?.nivel) {
        data = data.filter((l) => l.nivel === params.nivel)
      }
      if (params?.search) {
        const q = params.search.toLowerCase()
        data = data.filter(
          (l) =>
            l.usuario.toLowerCase().includes(q) ||
            l.accion.toLowerCase().includes(q) ||
            l.modulo.toLowerCase().includes(q)
        )
      }
      return { success: true, message: 'OK', data }
    }
  },
}
