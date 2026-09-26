import { http, HttpResponse } from 'msw'
import {
  Factura,
  Cupon,
  Reembolso,
  PaqueteServicio,
  ServicioExtra,
  ItemListaEspera,
} from '@/types'

const BASE = import.meta.env.VITE_API_BASE_URL as string

// ─── Mock Data ─────────────────────────────────────────────────────────────

export const MOCK_FACTURAS: Factura[] = [
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
]

export const MOCK_CUPONES: Cupon[] = [
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

export const MOCK_REEMBOLSOS: Reembolso[] = [
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

export const MOCK_SERVICIOS_EXTRA: ServicioExtra[] = [
  {
    id: 1,
    nombre: 'Aromaterapia y Aceites Esenciales',
    descripcion: 'Difusión de aceites botánicos relajantes durante la sesión.',
    precio: 12,
    duracion_extra_min: 0,
    activo: true,
  },
  {
    id: 2,
    nombre: 'Exfoliación con Sales Minerales',
    descripcion: 'Tratamiento dérmico con sales marinas y nutrientes.',
    precio: 20,
    duracion_extra_min: 15,
    activo: true,
  },
  {
    id: 3,
    nombre: 'Ampolla Facial con Ácido Hialurónico',
    descripcion: 'Nutrición intensiva antiedad de absorción rápida.',
    precio: 25,
    duracion_extra_min: 10,
    activo: true,
  },
]

export const MOCK_PAQUETES: PaqueteServicio[] = [
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

export const MOCK_LISTA_ESPERA: ItemListaEspera[] = [
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
    fecha_deseada: '2026-09-22',
    hora_preferente: '10:00',
    notas: 'Urgente si alguien cancela',
    estado: 'en_espera',
    created_at: '2026-09-17T08:30:00Z',
  },
]

// ─── Handlers ──────────────────────────────────────────────────────────────

export const pagosHandlers = [
  // Facturas
  http.get(`${BASE}/facturas`, () =>
    HttpResponse.json({
      success: true,
      message: 'OK',
      data: MOCK_FACTURAS,
    })
  ),

  http.get(`${BASE}/facturas/:id`, ({ params }) => {
    const fac = MOCK_FACTURAS.find((f) => f.id === Number(params.id)) ?? MOCK_FACTURAS[0]
    return HttpResponse.json({ success: true, message: 'OK', data: fac })
  }),

  http.post(`${BASE}/facturas`, async ({ request }) => {
    const body = (await request.json()) as Partial<Factura>
    const nueva: Factura = {
      ...MOCK_FACTURAS[0],
      id: Date.now(),
      numero: `FAC-2026-${String(MOCK_FACTURAS.length + 1).padStart(3, '0')}`,
      ...body,
      created_at: new Date().toISOString(),
    }
    MOCK_FACTURAS.unshift(nueva)
    return HttpResponse.json({ success: true, message: 'Factura generada', data: nueva }, { status: 201 })
  }),

  // Cupones
  http.get(`${BASE}/cupones`, () =>
    HttpResponse.json({ success: true, message: 'OK', data: MOCK_CUPONES })
  ),

  http.post(`${BASE}/cupones/validar`, async ({ request }) => {
    const { codigo, total } = (await request.json()) as { codigo: string; total: number }
    const cupon = MOCK_CUPONES.find(
      (c) => c.codigo.toUpperCase() === codigo.trim().toUpperCase() && c.activo
    )

    if (!cupon) {
      return HttpResponse.json({
        success: true,
        data: { valido: false, mensaje: 'El código de cupón no es válido o ha expirado' },
      })
    }

    let descuento = 0
    if (cupon.tipo === 'porcentual') {
      descuento = Math.round((total * cupon.valor) / 100)
    } else {
      descuento = Math.min(cupon.valor, total)
    }

    return HttpResponse.json({
      success: true,
      data: {
        valido: true,
        mensaje: `Cupón ${cupon.codigo} aplicado (${cupon.tipo === 'porcentual' ? `${cupon.valor}%` : `$${cupon.valor}`})`,
        cupon,
        descuento_calculado: descuento,
      },
    })
  }),

  http.post(`${BASE}/cupones`, async ({ request }) => {
    const body = (await request.json()) as Partial<Cupon>
    const nuevo: Cupon = {
      id: Date.now(),
      codigo: (body.codigo ?? 'PROMO').toUpperCase(),
      tipo: body.tipo ?? 'porcentual',
      valor: body.valor ?? 10,
      usos_actuales: 0,
      activo: true,
      ...body,
    }
    MOCK_CUPONES.push(nuevo)
    return HttpResponse.json({ success: true, message: 'Cupón creado', data: nuevo }, { status: 201 })
  }),

  http.delete(`${BASE}/cupones/:id`, ({ params }) => {
    const idx = MOCK_CUPONES.findIndex((c) => c.id === Number(params.id))
    if (idx !== -1) MOCK_CUPONES.splice(idx, 1)
    return HttpResponse.json({ success: true, message: 'Cupón eliminado' })
  }),

  // Reembolsos
  http.get(`${BASE}/reembolsos`, () =>
    HttpResponse.json({ success: true, message: 'OK', data: MOCK_REEMBOLSOS })
  ),

  http.post(`${BASE}/reembolsos`, async ({ request }) => {
    const body = (await request.json()) as { factura_id: number; monto: number; motivo: string }
    const factura = MOCK_FACTURAS.find((f) => f.id === body.factura_id)
    if (factura) {
      factura.estado = 'reembolsada'
    }

    const nuevo: Reembolso = {
      id: Date.now(),
      factura_id: body.factura_id,
      factura_numero: factura?.numero ?? 'FAC-2026-XXX',
      cliente_nombre: factura?.cliente?.nombre ?? 'Cliente',
      monto: body.monto,
      motivo: body.motivo,
      estado: 'completado',
      created_at: new Date().toISOString(),
    }
    MOCK_REEMBOLSOS.unshift(nuevo)
    return HttpResponse.json({ success: true, message: 'Reembolso procesado', data: nuevo }, { status: 201 })
  }),

  // Paquetes
  http.get(`${BASE}/paquetes`, () =>
    HttpResponse.json({ success: true, message: 'OK', data: MOCK_PAQUETES })
  ),

  http.post(`${BASE}/paquetes`, async ({ request }) => {
    const body = (await request.json()) as Partial<PaqueteServicio>
    const nuevo: PaqueteServicio = {
      id: Date.now(),
      nombre: body.nombre ?? 'Nuevo Paquete',
      descripcion: body.descripcion ?? '',
      precio_total: body.precio_total ?? 80,
      precio_original: body.precio_original ?? 100,
      descuento_porcentaje: body.descuento_porcentaje ?? 20,
      servicios_ids: body.servicios_ids ?? [1],
      activo: true,
      ...body,
    }
    MOCK_PAQUETES.push(nuevo)
    return HttpResponse.json({ success: true, message: 'Paquete creado', data: nuevo }, { status: 201 })
  }),

  // Servicios Extra
  http.get(`${BASE}/servicios-extra`, () =>
    HttpResponse.json({ success: true, message: 'OK', data: MOCK_SERVICIOS_EXTRA })
  ),

  // Lista de Espera
  http.get(`${BASE}/lista-espera`, () =>
    HttpResponse.json({ success: true, message: 'OK', data: MOCK_LISTA_ESPERA })
  ),

  http.post(`${BASE}/lista-espera`, async ({ request }) => {
    const body = (await request.json()) as Partial<ItemListaEspera>
    const nuevo: ItemListaEspera = {
      id: Date.now(),
      cliente_id: body.cliente_id ?? 1,
      servicio_id: body.servicio_id ?? 1,
      fecha_deseada: body.fecha_deseada ?? new Date().toISOString().slice(0, 10),
      hora_preferente: body.hora_preferente ?? '10:00',
      notas: body.notas ?? '',
      estado: 'en_espera',
      created_at: new Date().toISOString(),
      ...body,
    }
    MOCK_LISTA_ESPERA.unshift(nuevo)
    return HttpResponse.json(
      { success: true, message: 'Agregado a lista de espera', data: nuevo },
      { status: 201 }
    )
  }),

  http.delete(`${BASE}/lista-espera/:id`, ({ params }) => {
    const idx = MOCK_LISTA_ESPERA.findIndex((item) => item.id === Number(params.id))
    if (idx !== -1) MOCK_LISTA_ESPERA.splice(idx, 1)
    return HttpResponse.json({ success: true, message: 'Eliminado de lista de espera' })
  }),
]

