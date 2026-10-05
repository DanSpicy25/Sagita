import { apiClient } from './api.client'
import {
  Factura,
  Cupon,
  ValidacionCupon,
  Reembolso,
  PaqueteServicio,
  ServicioExtra,
  ItemListaEspera,
  ApiResponse,
} from '@/types'
import { LocalStorageAdapter } from '@/repositories/local/LocalStorageAdapter'

// ─── Seeds locales para ejecución Standalone / Demo / Fallback ──────────────

export const SEED_FACTURAS: Factura[] = [
  {
    id: 1,
    numero: 'FAC-2026-001',
    cita_id: 1,
    cliente_id: 1,
    cliente: {
      id: 1,
      nombre: 'Ana García',
      email: 'ana@email.com',
      telefono: '+1 555-0101',
      total_citas: 8,
      created_at: '2026-01-10T00:00:00Z',
    },
    subtotal: 50,
    descuento: 0,
    total: 50,
    metodo_pago: 'tarjeta',
    estado: 'pagada',
    items: [
      {
        descripcion: 'Consulta General (30 min)',
        cantidad: 1,
        precio_unitario: 50,
        total: 50,
      },
    ],
    created_at: '2026-09-15T10:30:00Z',
  },
  {
    id: 2,
    numero: 'FAC-2026-002',
    cita_id: 2,
    cliente_id: 2,
    cliente: {
      id: 2,
      nombre: 'Luis Fernández',
      email: 'luis@email.com',
      telefono: '+1 555-0102',
      total_citas: 3,
      created_at: '2026-02-15T00:00:00Z',
    },
    subtotal: 75,
    descuento: 15,
    total: 60,
    metodo_pago: 'stripe',
    estado: 'pagada',
    cupon_aplicado: 'SAGITTA20',
    items: [
      {
        descripcion: 'Limpieza Facial Profunda (60 min)',
        cantidad: 1,
        precio_unitario: 75,
        total: 75,
      },
    ],
    created_at: '2026-09-16T15:00:00Z',
  },
  {
    id: 3,
    numero: 'FAC-2026-003',
    cita_id: 3,
    cliente_id: 3,
    cliente: {
      id: 3,
      nombre: 'Sofía Torres',
      email: 'sofia@email.com',
      telefono: '+1 555-0103',
      total_citas: 12,
      created_at: '2025-11-20T00:00:00Z',
    },
    subtotal: 60,
    descuento: 0,
    total: 60,
    metodo_pago: 'efectivo',
    estado: 'reembolsada',
    items: [
      {
        descripcion: 'Masaje Relajante (45 min)',
        cantidad: 1,
        precio_unitario: 60,
        total: 60,
      },
    ],
    created_at: '2026-09-14T11:00:00Z',
  },
  {
    id: 4,
    numero: 'FAC-2026-004',
    cita_id: 4,
    cliente_id: 4,
    cliente: {
      id: 4,
      nombre: 'Miguel Ángel Ruiz',
      email: 'miguel@email.com',
      telefono: '+1 555-0104',
      total_citas: 2,
      created_at: '2026-09-01T00:00:00Z',
    },
    subtotal: 35,
    descuento: 0,
    total: 35,
    metodo_pago: 'transferencia',
    estado: 'pagada',
    items: [
      {
        descripcion: 'Corte de Cabello Estilo (30 min)',
        cantidad: 1,
        precio_unitario: 35,
        total: 35,
      },
    ],
    created_at: '2026-09-18T16:00:00Z',
  },
]

export const SEED_CUPONES: Cupon[] = [
  {
    id: 1,
    codigo: 'BIENVENIDA10',
    tipo: 'porcentual',
    valor: 10,
    valido_hasta: '2026-12-31',
    usos_max: 100,
    usos_actuales: 18,
    activo: true,
  },
  {
    id: 2,
    codigo: 'SAGITTA20',
    tipo: 'porcentual',
    valor: 20,
    valido_hasta: '2026-10-31',
    usos_max: 50,
    usos_actuales: 12,
    activo: true,
  },
  {
    id: 3,
    codigo: 'DESCUENTO15',
    tipo: 'fijo',
    valor: 15,
    valido_hasta: '2026-11-15',
    usos_max: 30,
    usos_actuales: 5,
    activo: true,
  },
]

export const SEED_REEMBOLSOS: Reembolso[] = [
  {
    id: 1,
    factura_id: 3,
    factura_numero: 'FAC-2026-003',
    cliente_id: 3,
    cliente_nombre: 'Sofía Torres',
    monto: 60,
    motivo: 'Cancelación con más de 24 horas de antelación',
    estado: 'completado',
    created_at: '2026-09-15T09:12:00Z',
  },
]

export const SEED_PAQUETES: PaqueteServicio[] = [
  {
    id: 1,
    nombre: 'Pack Bienestar & Relax Total',
    descripcion: 'Incluye Consulta Médica Preventiva + Masaje Terapéutico.',
    precio_original: 110,
    precio_total: 89,
    descuento_porcentaje: 19,
    servicios_ids: [1, 3],
    activo: true,
  },
  {
    id: 2,
    nombre: 'Combo Estética Radiante',
    descripcion: 'Limpieza Facial Profunda + Exfoliación Completa con descuento especial.',
    precio_original: 110,
    precio_total: 85,
    descuento_porcentaje: 22,
    servicios_ids: [2, 4],
    activo: true,
  },
]

export const SEED_SERVICIOS_EXTRA: ServicioExtra[] = [
  {
    id: 1,
    servicio_id: 1,
    nombre: 'Evaluación Nutricional & Antropométrica',
    descripcion: 'Medición de bioimpedancia y pauta nutricional complementaria.',
    precio: 20,
    duracion_extra_min: 15,
    activo: true,
  },
  {
    id: 2,
    servicio_id: 1,
    nombre: 'Informe Clínico Detallado para Seguro',
    descripcion: 'Emisión de reporte médico exhaustivo firmado para reembolsos.',
    precio: 15,
    duracion_extra_min: 0,
    activo: true,
  },
  {
    id: 3,
    servicio_id: 2,
    nombre: 'Ampolla Facial con Ácido Hialurónico',
    descripcion: 'Nutrición intensiva antiedad de absorción ultrarrápida.',
    precio: 25,
    duracion_extra_min: 10,
    activo: true,
  },
  {
    id: 4,
    servicio_id: 2,
    nombre: 'Exfoliación con Sales Minerales',
    descripcion: 'Tratamiento dérmico purificante con sales marinas y nutrientes.',
    precio: 20,
    duracion_extra_min: 15,
    activo: true,
  },
  {
    id: 5,
    servicio_id: 2,
    nombre: 'Máscara LED Fototerapia Rejuvenecedora',
    descripcion: 'Estimulación de colágeno mediante luz fotónica roja y azul.',
    precio: 18,
    duracion_extra_min: 15,
    activo: true,
  },
  {
    id: 6,
    servicio_id: 3,
    nombre: 'Aromaterapia y Aceites Esenciales',
    descripcion: 'Difusión y aplicación de aceites botánicos orgánicos relajantes.',
    precio: 12,
    duracion_extra_min: 0,
    activo: true,
  },
  {
    id: 7,
    servicio_id: 3,
    nombre: 'Terapia de Piedras Volcánicas Calientes',
    descripcion: 'Aplicación de piedras basálticas a temperatura controlada.',
    precio: 25,
    duracion_extra_min: 20,
    activo: true,
  },
  {
    id: 8,
    servicio_id: 3,
    nombre: 'Reflexología Podal Focalizada',
    descripcion: 'Digitopresión en zonas reflejas podales para alivio sistémico.',
    precio: 22,
    duracion_extra_min: 15,
    activo: true,
  },
  {
    id: 9,
    servicio_id: 4,
    nombre: 'Lavado Capilar Profundo y Mascarilla',
    descripcion: 'Champú purificante más hidratación intensiva en lavacabezas.',
    precio: 10,
    duracion_extra_min: 10,
    activo: true,
  },
  {
    id: 10,
    servicio_id: 4,
    nombre: 'Perfilado de Barba con Toalla Caliente',
    descripcion: 'Delineado a navaja tradicional con bálsamo tonificante.',
    precio: 15,
    duracion_extra_min: 15,
    activo: true,
  },
  {
    id: 11,
    servicio_id: 4,
    nombre: 'Peinado & Fijación Mate Premium',
    descripcion: 'Modelado con pomada de arcilla de fijación flexible.',
    precio: 8,
    duracion_extra_min: 5,
    activo: true,
  },
]

export const SEED_LISTA_ESPERA: ItemListaEspera[] = [
  {
    id: 1,
    cliente_id: 4,
    cliente: {
      id: 4,
      nombre: 'Miguel Ángel Ruiz',
      email: 'miguel@email.com',
      telefono: '+1 555-0104',
      total_citas: 1,
      created_at: '2026-09-01T00:00:00Z',
    },
    servicio_id: 1,
    servicio: {
      id: 1,
      nombre: 'Consulta General',
      duracion_base_min: 30,
      precio_base: 50,
      activo: true,
      buffer_antes_min: 5,
      buffer_despues_min: 10,
    },
    fecha_deseada: '2026-09-28',
    hora_preferente: '10:00',
    estado: 'en_espera',
    created_at: '2026-09-20T10:00:00Z',
  },
]

export const pagosService = {
  // ─── Facturas ────────────────────────────────────────────────────────────
  getFacturas: async (params?: Record<string, string>): Promise<ApiResponse<Factura[]>> => {
    try {
      const qs = params ? '?' + new URLSearchParams(params).toString() : ''
      const res = await apiClient.get<Factura[]>(`/facturas${qs}`)
      if (res.data) return res
    } catch {
      // Fallback a localStorage
    }
    const data = LocalStorageAdapter.getCollection<Factura>('facturas', SEED_FACTURAS)
    return { success: true, message: 'OK', data }
  },

  getFacturaById: async (id: number): Promise<ApiResponse<Factura>> => {
    try {
      const res = await apiClient.get<Factura>(`/facturas/${id}`)
      if (res.data) return res
    } catch {
      // Fallback a localStorage
    }
    const list = LocalStorageAdapter.getCollection<Factura>('facturas', SEED_FACTURAS)
    const item = list.find((f) => f.id === id)
    if (!item) throw new Error('Factura no encontrada')
    return { success: true, message: 'OK', data: item }
  },

  crearFactura: async (data: Partial<Factura>): Promise<ApiResponse<Factura>> => {
    try {
      const res = await apiClient.post<Factura>('/facturas', data)
      if (res.data) return res
    } catch {
      // Fallback a localStorage
    }
    const nueva: Factura = {
      id: Date.now(),
      numero: `FAC-2026-${String(Math.floor(Math.random() * 900) + 100)}`,
      cita_id: data.cita_id ?? 0,
      cliente_id: data.cliente_id ?? 0,
      subtotal: data.subtotal ?? 0,
      descuento: data.descuento ?? 0,
      total: data.total ?? 0,
      metodo_pago: data.metodo_pago ?? 'efectivo',
      estado: data.estado ?? 'pagada',
      items: data.items ?? [],
      created_at: new Date().toISOString(),
    }
    LocalStorageAdapter.insert<Factura>('facturas', nueva)
    return { success: true, message: 'Factura generada', data: nueva }
  },

  // ─── Cupones ─────────────────────────────────────────────────────────────
  validarCupon: async (codigo: string, total: number): Promise<ApiResponse<ValidacionCupon>> => {
    try {
      const res = await apiClient.post<ValidacionCupon>('/cupones/validar', { codigo, total })
      if (res.data) return res
    } catch {
      // Fallback a validación local
    }
    const cupones = LocalStorageAdapter.getCollection<Cupon>('cupones', SEED_CUPONES)
    const match = cupones.find((c) => c.codigo.toUpperCase() === codigo.trim().toUpperCase() && c.activo)
    if (!match) {
      return {
        success: false,
        message: 'El cupón no es válido o ha expirado',
        data: { valido: false, mensaje: 'Cupón no encontrado o inactivo' },
      }
    }
    const descuento = match.tipo === 'porcentual' ? (total * match.valor) / 100 : Math.min(match.valor, total)
    return {
      success: true,
      message: 'Cupón aplicado',
      data: {
        valido: true,
        cupon: match,
        descuento_calculado: descuento,
        mensaje: `Descuento aplicado: ${match.tipo === 'porcentual' ? `${match.valor}%` : `$${match.valor}`}`,
      },
    }
  },

  getCupones: async (): Promise<ApiResponse<Cupon[]>> => {
    try {
      const res = await apiClient.get<Cupon[]>('/cupones')
      if (res.data) return res
    } catch {
      // Fallback a localStorage
    }
    const data = LocalStorageAdapter.getCollection<Cupon>('cupones', SEED_CUPONES)
    return { success: true, message: 'OK', data }
  },

  crearCupon: async (data: Partial<Cupon>): Promise<ApiResponse<Cupon>> => {
    try {
      const res = await apiClient.post<Cupon>('/cupones', data)
      if (res.data) return res
    } catch {
      // Fallback a localStorage
    }
    const nuevo: Cupon = {
      id: Date.now(),
      codigo: data.codigo?.toUpperCase() ?? 'PROMO',
      tipo: data.tipo ?? 'porcentual',
      valor: data.valor ?? 10,
      usos_max: data.usos_max ?? 50,
      usos_actuales: 0,
      activo: true,
      valido_hasta: data.valido_hasta ?? '2026-12-31',
    }
    LocalStorageAdapter.insert<Cupon>('cupones', nuevo)
    return { success: true, message: 'Cupón creado', data: nuevo }
  },

  eliminarCupon: async (id: number): Promise<ApiResponse<void>> => {
    try {
      await apiClient.delete<void>(`/cupones/${id}`)
    } catch {
      // Fallback a localStorage
    }
    LocalStorageAdapter.remove<Cupon>('cupones', id)
    return { success: true, message: 'Cupón eliminado' }
  },

  // ─── Reembolsos ──────────────────────────────────────────────────────────
  getReembolsos: async (): Promise<ApiResponse<Reembolso[]>> => {
    try {
      const res = await apiClient.get<Reembolso[]>('/reembolsos')
      if (res.data) return res
    } catch {
      // Fallback a localStorage
    }
    const data = LocalStorageAdapter.getCollection<Reembolso>('reembolsos', SEED_REEMBOLSOS)
    return { success: true, message: 'OK', data }
  },

  solicitarReembolso: async (data: { factura_id: number; monto: number; motivo: string }): Promise<ApiResponse<Reembolso>> => {
    try {
      const res = await apiClient.post<Reembolso>('/reembolsos', data)
      if (res.data) return res
    } catch {
      // Fallback a localStorage
    }
    const nuevo: Reembolso = {
      id: Date.now(),
      factura_id: data.factura_id,
      factura_numero: `FAC-REF-${data.factura_id}`,
      monto: data.monto,
      motivo: data.motivo,
      estado: 'completado',
      created_at: new Date().toISOString(),
    }
    LocalStorageAdapter.insert<Reembolso>('reembolsos', nuevo)
    return { success: true, message: 'Reembolso procesado', data: nuevo }
  },

  // ─── Paquetes y Bundles ──────────────────────────────────────────────────
  getPaquetes: async (): Promise<ApiResponse<PaqueteServicio[]>> => {
    try {
      const res = await apiClient.get<PaqueteServicio[]>('/paquetes')
      if (res.data) return res
    } catch {
      // Fallback a localStorage
    }
    const data = LocalStorageAdapter.getCollection<PaqueteServicio>('paquetes', SEED_PAQUETES)
    return { success: true, message: 'OK', data }
  },

  crearPaquete: async (data: Partial<PaqueteServicio>): Promise<ApiResponse<PaqueteServicio>> => {
    try {
      const res = await apiClient.post<PaqueteServicio>('/paquetes', data)
      if (res.data) return res
    } catch {
      // Fallback a localStorage
    }
    const nuevo: PaqueteServicio = {
      id: Date.now(),
      nombre: data.nombre ?? 'Nuevo Paquete',
      descripcion: data.descripcion ?? '',
      precio_original: data.precio_original ?? 100,
      precio_total: data.precio_total ?? 80,
      descuento_porcentaje: data.descuento_porcentaje ?? 20,
      servicios_ids: data.servicios_ids ?? [],
      activo: true,
    }
    LocalStorageAdapter.insert<PaqueteServicio>('paquetes', nuevo)
    return { success: true, message: 'Paquete creado', data: nuevo }
  },

  // ─── Servicios Extra (Add-ons / Aditamentos) ──────────────────────────────
  getServiciosExtra: async (servicioId?: number): Promise<ApiResponse<ServicioExtra[]>> => {
    try {
      const qs = servicioId ? `?servicio_id=${servicioId}` : ''
      const res = await apiClient.get<ServicioExtra[]>(`/servicios-extra${qs}`)
      if (res.data && res.data.length > 0) return res
    } catch {
      // Fallback a localStorage
    }
    let list = LocalStorageAdapter.getCollection<ServicioExtra>('servicios_extra', SEED_SERVICIOS_EXTRA)
    if (servicioId !== undefined) {
      list = list.filter((e) => e.servicio_id === servicioId || !e.servicio_id)
    }
    return { success: true, message: 'OK', data: list }
  },

  crearServicioExtra: async (data: Partial<ServicioExtra>): Promise<ApiResponse<ServicioExtra>> => {
    const nuevo: ServicioExtra = {
      id: Date.now(),
      servicio_id: data.servicio_id,
      nombre: data.nombre ?? 'Nuevo Aditamento',
      descripcion: data.descripcion ?? '',
      precio: Number(data.precio) || 10,
      duracion_extra_min: Number(data.duracion_extra_min) || 0,
      activo: true,
    }
    LocalStorageAdapter.insert<ServicioExtra>('servicios_extra', nuevo)
    return { success: true, message: 'Aditamento creado', data: nuevo }
  },

  actualizarServicioExtra: async (id: number, data: Partial<ServicioExtra>): Promise<ApiResponse<ServicioExtra>> => {
    const updated = LocalStorageAdapter.update<ServicioExtra>('servicios_extra', id, data)
    return { success: true, message: 'Aditamento actualizado', data: updated || undefined }
  },

  eliminarServicioExtra: async (id: number): Promise<ApiResponse<void>> => {
    LocalStorageAdapter.remove<ServicioExtra>('servicios_extra', id)
    return { success: true, message: 'Aditamento eliminado' }
  },

  // ─── Lista de Espera ─────────────────────────────────────────────────────
  getListaEspera: async (): Promise<ApiResponse<ItemListaEspera[]>> => {
    try {
      const res = await apiClient.get<ItemListaEspera[]>('/lista-espera')
      if (res.data) return res
    } catch {
      // Fallback a localStorage
    }
    const data = LocalStorageAdapter.getCollection<ItemListaEspera>('lista_espera', SEED_LISTA_ESPERA)
    return { success: true, message: 'OK', data }
  },

  unirseListaEspera: async (data: Partial<ItemListaEspera>): Promise<ApiResponse<ItemListaEspera>> => {
    try {
      const res = await apiClient.post<ItemListaEspera>('/lista-espera', data)
      if (res.data) return res
    } catch {
      // Fallback a localStorage
    }
    const nuevo: ItemListaEspera = {
      id: Date.now(),
      cliente_id: data.cliente_id ?? 1,
      servicio_id: data.servicio_id ?? 1,
      fecha_deseada: data.fecha_deseada ?? new Date().toISOString().split('T')[0],
      hora_preferente: data.hora_preferente ?? '10:00',
      estado: 'en_espera',
      created_at: new Date().toISOString(),
      cliente: data.cliente,
      servicio: data.servicio,
    }
    LocalStorageAdapter.insert<ItemListaEspera>('lista_espera', nuevo)
    return { success: true, message: 'Añadido a lista de espera', data: nuevo }
  },

  cancelarListaEspera: async (id: number): Promise<ApiResponse<void>> => {
    try {
      await apiClient.delete<void>(`/lista-espera/${id}`)
    } catch {
      // Fallback a localStorage
    }
    LocalStorageAdapter.remove<ItemListaEspera>('lista_espera', id)
    return { success: true, message: 'Removido de lista de espera' }
  },
}
