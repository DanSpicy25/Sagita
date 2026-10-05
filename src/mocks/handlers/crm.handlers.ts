import { http, HttpResponse } from 'msw'
import {
  Tenant,
  CrmConfig,
  ApiKey,
  AuditLog,
} from '@/types'

import { API_BASE_URL as BASE } from '@/config/environment'
import { LocalStorageAdapter } from '@/repositories/local/LocalStorageAdapter'

export const MOCK_TENANTS: Tenant[] = [
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

export const MOCK_CRM_CONFIGS: CrmConfig[] = [
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

export const MOCK_API_KEYS: ApiKey[] = [
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

export const MOCK_AUDIT_LOGS: AuditLog[] = [
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
  {
    id: 104,
    tenant_id: 'sede-principal',
    usuario: 'Sistema Automático',
    email: 'cron@sagitta.com',
    rol: 'sistema',
    accion: 'Fallo de Sincronización Webhook',
    modulo: 'Webhooks',
    ip: '127.0.0.1',
    detalles: 'Endpoint https://api.crm-externo.com/hook devolvió código HTTP 500',
    nivel: 'error',
    created_at: '2026-09-17T12:05:00Z',
  },
  {
    id: 105,
    tenant_id: 'sede-principal',
    usuario: 'Carlos Rodríguez',
    email: 'administracion@sagitta.com',
    rol: 'admin',
    accion: 'Nueva API Key Generada',
    modulo: 'Desarrolladores',
    ip: '190.14.88.22',
    detalles: 'Se generó token sag_live_*** con permisos WRITE para integración Zapier',
    nivel: 'info',
    created_at: '2026-09-17T10:30:00Z',
  },
]

const tenants = [...MOCK_TENANTS]
const crmConfigs = [...MOCK_CRM_CONFIGS]
let apiKeys = [...MOCK_API_KEYS]
const auditLogs = [...MOCK_AUDIT_LOGS]

export const crmHandlers = [
  // ─── Tenants ─────────────────────────────────────────────────────────────
  http.get(`${BASE}/tenants`, () => {
    return HttpResponse.json({
      success: true,
      data: tenants,
      message: 'Lista de sucursales recuperada',
    })
  }),

  http.post(`${BASE}/tenants`, async ({ request }) => {
    const body = (await request.json()) as Partial<Tenant>
    const nuevo: Tenant = {
      id: `sucursal-${Date.now()}`,
      nombre: body.nombre ?? 'Nueva Sucursal',
      slug: body.slug ?? 'nueva-sucursal',
      plan: body.plan ?? 'pro',
      activo: true,
      es_principal: false,
      direccion: body.direccion ?? '',
      telefono: body.telefono ?? '',
      citas_mes: 0,
      limite_citas: 500,
      ...body,
    }
    tenants.push(nuevo)
    return HttpResponse.json({
      success: true,
      data: nuevo,
      message: 'Sucursal creada con éxito',
    })
  }),

  // ─── CRM ─────────────────────────────────────────────────────────────────
  http.get(`${BASE}/crm/conectores`, () => {
    return HttpResponse.json({
      success: true,
      data: crmConfigs,
      message: 'Conectores CRM cargados',
    })
  }),

  http.put(`${BASE}/crm/conectores/:id`, async ({ params, request }) => {
    const { id } = params
    const body = (await request.json()) as Partial<CrmConfig>
    const index = crmConfigs.findIndex((c) => c.id === id)
    if (index !== -1) {
      crmConfigs[index] = { ...crmConfigs[index], ...body }
      return HttpResponse.json({
        success: true,
        data: crmConfigs[index],
        message: 'Conector actualizado',
      })
    }
    return new HttpResponse(null, { status: 404 })
  }),

  http.post(`${BASE}/crm/conectores/:id/sync`, ({ params }) => {
    const { id } = params
    const index = crmConfigs.findIndex((c) => c.id === id)
    const clientesReales = LocalStorageAdapter.getCollection<any>('clientes', []).length
    const totalSincronizados = clientesReales > 0 ? clientesReales : 15

    if (index !== -1) {
      crmConfigs[index].ultima_sync = new Date().toISOString()
      crmConfigs[index].total_sincronizados = totalSincronizados
    }
    return HttpResponse.json({
      success: true,
      data: {
        sincronizados: totalSincronizados,
        timestamp: new Date().toISOString(),
      },
      message: `Sincronización completada con éxito: ${totalSincronizados} contactos vinculados`,
    })
  }),

  // ─── API Keys ────────────────────────────────────────────────────────────
  http.get(`${BASE}/api-keys`, () => {
    return HttpResponse.json({
      success: true,
      data: apiKeys,
      message: 'Claves de API obtenidas',
    })
  }),

  http.post(`${BASE}/api-keys`, async ({ request }) => {
    const body = (await request.json()) as { nombre: string; permisos: 'read' | 'write' | 'admin' }
    const nueva: ApiKey = {
      id: Date.now(),
      nombre: body.nombre,
      token: `sag_live_${crypto.randomUUID().replace(/-/g, '')}`,
      permisos: body.permisos ?? 'read',
      creada_en: new Date().toISOString(),
      activa: true,
    }
    apiKeys.unshift(nueva)
    return HttpResponse.json({
      success: true,
      data: nueva,
      message: 'Clave de API generada con éxito',
    })
  }),

  http.delete(`${BASE}/api-keys/:id`, ({ params }) => {
    const id = Number(params.id)
    apiKeys = apiKeys.filter((k) => k.id !== id)
    return HttpResponse.json({
      success: true,
      data: null,
      message: 'Clave de API revocada',
    })
  }),

  // ─── Audit Logs ──────────────────────────────────────────────────────────
  http.get(`${BASE}/audit-logs`, ({ request }) => {
    const url = new URL(request.url)
    const search = url.searchParams.get('search')?.toLowerCase()
    const nivel = url.searchParams.get('nivel')

    let resultado = [...auditLogs]
    if (nivel) {
      resultado = resultado.filter((l) => l.nivel === nivel)
    }
    if (search) {
      resultado = resultado.filter(
        (l) =>
          l.usuario.toLowerCase().includes(search) ||
          l.accion.toLowerCase().includes(search) ||
          l.modulo.toLowerCase().includes(search) ||
          l.detalles.toLowerCase().includes(search) ||
          l.ip.includes(search)
      )
    }

    return HttpResponse.json({
      success: true,
      data: resultado,
      message: 'Registros de auditoría recuperados',
    })
  }),
]

