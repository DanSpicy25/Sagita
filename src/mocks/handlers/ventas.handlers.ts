import { http, HttpResponse } from 'msw'
import { Venta, SesionCaja, MovimientoCaja } from '@/types'
import { MOCK_PRODUCTOS, MOCK_MOVIMIENTOS } from './inventario.handlers'

import { API_BASE_URL as BASE } from '@/config/environment'

// ─── Mock Data ──────────────────────────────────────────────────────────────

export const MOCK_VENTAS: Venta[] = [
  {
    id: 1,
    numero: 'VTA-2026-001',
    cliente_id: 1,
    cliente: {
      id: 1,
      nombre: 'Ana García',
      email: 'ana@email.com',
      telefono: '+1 555-0101',
      total_citas: 8,
      created_at: '2026-01-10T00:00:00Z',
    },
    items: [
      {
        id: 'i1',
        tipo: 'servicio',
        referencia_id: 1,
        nombre: 'Consulta General',
        precio_unitario: 50,
        cantidad: 1,
        descuento_item: 0,
        total: 50,
      },
      {
        id: 'i2',
        tipo: 'producto',
        referencia_id: 10,
        nombre: 'Crema Hidratante Premium',
        precio_unitario: 22,
        cantidad: 2,
        descuento_item: 0,
        total: 44,
      },
    ],
    subtotal: 94,
    descuento_global: 0,
    impuesto: 9.4,
    total: 103.4,
    metodo_pago: 'tarjeta',
    estado: 'PAID',
    created_at: '2026-09-25T10:15:00Z',
  },
  {
    id: 2,
    numero: 'VTA-2026-002',
    cliente_id: 2,
    cliente: {
      id: 2,
      nombre: 'Luis Fernández',
      email: 'luis@email.com',
      telefono: '+1 555-0102',
      total_citas: 3,
      created_at: '2026-02-15T00:00:00Z',
    },
    items: [
      {
        id: 'i3',
        tipo: 'servicio',
        referencia_id: 2,
        nombre: 'Limpieza Facial Profunda',
        precio_unitario: 75,
        cantidad: 1,
        descuento_item: 10,
        total: 65,
      },
    ],
    subtotal: 75,
    descuento_global: 10,
    impuesto: 6.5,
    total: 71.5,
    metodo_pago: 'efectivo',
    estado: 'PAID',
    created_at: '2026-09-25T11:30:00Z',
  },
  {
    id: 3,
    numero: 'VTA-2026-003',
    cliente_id: 3,
    cliente: {
      id: 3,
      nombre: 'Sofía Torres',
      email: 'sofia@email.com',
      telefono: '+1 555-0103',
      total_citas: 12,
      created_at: '2025-11-20T00:00:00Z',
    },
    items: [
      {
        id: 'i4',
        tipo: 'servicio',
        referencia_id: 3,
        nombre: 'Masaje Relajante',
        precio_unitario: 60,
        cantidad: 1,
        descuento_item: 0,
        total: 60,
      },
      {
        id: 'i5',
        tipo: 'producto',
        referencia_id: 11,
        nombre: 'Aceite Esencial Lavanda',
        precio_unitario: 18,
        cantidad: 1,
        descuento_item: 0,
        total: 18,
      },
    ],
    subtotal: 78,
    descuento_global: 5,
    impuesto: 7.3,
    total: 80.3,
    metodo_pago: 'transferencia',
    estado: 'PAID',
    created_at: '2026-09-25T13:00:00Z',
  },
  {
    id: 4,
    numero: 'VTA-2026-004',
    cliente_id: 4,
    cliente: {
      id: 4,
      nombre: 'Miguel Ángel Ruiz',
      email: 'miguel@email.com',
      telefono: '+1 555-0104',
      total_citas: 1,
      created_at: '2026-09-01T00:00:00Z',
    },
    items: [
      {
        id: 'i6',
        tipo: 'servicio',
        referencia_id: 4,
        nombre: 'Exfoliación Corporal',
        precio_unitario: 45,
        cantidad: 1,
        descuento_item: 0,
        total: 45,
      },
    ],
    subtotal: 45,
    descuento_global: 0,
    impuesto: 4.5,
    total: 49.5,
    metodo_pago: 'mixto',
    estado: 'PENDING',
    created_at: '2026-09-25T14:20:00Z',
  },
  {
    id: 5,
    numero: 'VTA-2026-005',
    items: [
      {
        id: 'i7',
        tipo: 'producto',
        referencia_id: 12,
        nombre: 'Protector Solar SPF 50',
        precio_unitario: 30,
        cantidad: 3,
        descuento_item: 0,
        total: 90,
      },
    ],
    subtotal: 90,
    descuento_global: 0,
    impuesto: 9,
    total: 99,
    metodo_pago: 'efectivo',
    estado: 'PAID',
    created_at: '2026-09-25T15:10:00Z',
  },
  {
    id: 6,
    numero: 'VTA-2026-006',
    cliente_id: 5,
    cliente: {
      id: 5,
      nombre: 'Carla Mendoza',
      email: 'carla@email.com',
      telefono: '+1 555-0105',
      total_citas: 5,
      created_at: '2026-03-01T00:00:00Z',
    },
    items: [
      {
        id: 'i8',
        tipo: 'servicio',
        referencia_id: 1,
        nombre: 'Consulta General',
        precio_unitario: 50,
        cantidad: 1,
        descuento_item: 0,
        total: 50,
      },
    ],
    subtotal: 50,
    descuento_global: 0,
    impuesto: 5,
    total: 55,
    metodo_pago: 'tarjeta',
    estado: 'CANCELLED',
    notas: 'Cliente canceló al llegar',
    created_at: '2026-09-24T09:00:00Z',
  },
]

// ─── Sesión de caja actual (abierta) ────────────────────────────────────────

let MOCK_SESION_CAJA: SesionCaja | null = {
  id: 1,
  apertura_at: '2026-09-25T08:00:00Z',
  monto_inicial: 200,
  total_ventas: 403.2,
  total_ingresos: 50,
  total_egresos: 30,
  usuario: 'Admin',
  estado: 'abierta',
  movimientos: [
    {
      id: 1,
      tipo: 'apertura',
      monto: 200,
      descripcion: 'Apertura de caja del día',
      usuario: 'Admin',
      created_at: '2026-09-25T08:00:00Z',
    },
    {
      id: 2,
      tipo: 'ingreso',
      monto: 103.4,
      descripcion: 'Venta VTA-2026-001',
      usuario: 'Admin',
      created_at: '2026-09-25T10:15:00Z',
    },
    {
      id: 3,
      tipo: 'ingreso',
      monto: 71.5,
      descripcion: 'Venta VTA-2026-002',
      usuario: 'Admin',
      created_at: '2026-09-25T11:30:00Z',
    },
    {
      id: 4,
      tipo: 'egreso',
      monto: 30,
      descripcion: 'Compra de materiales de limpieza',
      usuario: 'Admin',
      created_at: '2026-09-25T12:00:00Z',
    },
    {
      id: 5,
      tipo: 'ingreso',
      monto: 80.3,
      descripcion: 'Venta VTA-2026-003',
      usuario: 'Admin',
      created_at: '2026-09-25T13:00:00Z',
    },
    {
      id: 6,
      tipo: 'ingreso',
      monto: 50,
      descripcion: 'Ingreso manual - pago adelantado cliente',
      usuario: 'Admin',
      created_at: '2026-09-25T13:45:00Z',
    },
    {
      id: 7,
      tipo: 'ingreso',
      monto: 99,
      descripcion: 'Venta VTA-2026-005',
      usuario: 'Admin',
      created_at: '2026-09-25T15:10:00Z',
    },
  ],
}

let _movimientoIdCounter = 8

// ─── Catálogo rápido de POS (servicios + productos) ──────────────────────────

const CATALOGO_SERVICIOS = [
  { id: 1, nombre: 'Consulta General', precio: 50, tipo: 'servicio' },
  { id: 2, nombre: 'Limpieza Facial Profunda', precio: 75, tipo: 'servicio' },
  { id: 3, nombre: 'Masaje Relajante', precio: 60, tipo: 'servicio' },
  { id: 4, nombre: 'Exfoliación Corporal', precio: 45, tipo: 'servicio' },
  { id: 5, nombre: 'Tratamiento Anti-edad', precio: 90, tipo: 'servicio' },
  { id: 6, nombre: 'Depilación Completa', precio: 55, tipo: 'servicio' },
]

const CATALOGO_PRODUCTOS = [
  { id: 10, nombre: 'Crema Hidratante Premium', precio: 22, tipo: 'producto' },
  { id: 11, nombre: 'Aceite Esencial Lavanda', precio: 18, tipo: 'producto' },
  { id: 12, nombre: 'Protector Solar SPF 50', precio: 30, tipo: 'producto' },
  { id: 13, nombre: 'Sérum Vitamina C', precio: 35, tipo: 'producto' },
  { id: 14, nombre: 'Tónico Micelar', precio: 15, tipo: 'producto' },
  { id: 15, nombre: 'Mascarilla de Arcilla', precio: 12, tipo: 'producto' },
]

// ─── Handlers ───────────────────────────────────────────────────────────────

export const ventasHandlers = [
  // GET /ventas
  http.get(`${BASE}/ventas`, () =>
    HttpResponse.json({ success: true, message: 'OK', data: MOCK_VENTAS })
  ),

  // GET /ventas/:id
  http.get(`${BASE}/ventas/:id`, ({ params }) => {
    const venta = MOCK_VENTAS.find((v) => v.id === Number(params.id)) ?? MOCK_VENTAS[0]
    return HttpResponse.json({ success: true, message: 'OK', data: venta })
  }),

  // POST /ventas
  http.post(`${BASE}/ventas`, async ({ request }) => {
    const body = (await request.json()) as Partial<Venta>
    const nueva: Venta = {
      id: Date.now(),
      numero: `VTA-2026-${String(MOCK_VENTAS.length + 1).padStart(3, '0')}`,
      items: body.items ?? [],
      subtotal: body.subtotal ?? 0,
      descuento_global: body.descuento_global ?? 0,
      impuesto: body.impuesto ?? 0,
      total: body.total ?? 0,
      metodo_pago: body.metodo_pago ?? 'efectivo',
      estado: 'PAID',
      notas: body.notas,
      cliente_id: body.cliente_id,
      cliente: body.cliente,
      cita_id: body.cita_id,
      created_at: new Date().toISOString(),
    }
    MOCK_VENTAS.unshift(nueva)

    // Descontar stock para cada producto vendido
    if (nueva.items && nueva.items.length > 0) {
      for (const item of nueva.items) {
        if (item.tipo === 'producto' && item.referencia_id) {
          const prod = MOCK_PRODUCTOS.find((p) => p.id === item.referencia_id)
          if (prod) {
            const anterior = prod.stock_actual
            const nuevoStock = Math.max(0, anterior - item.cantidad)
            prod.stock_actual = nuevoStock
            MOCK_MOVIMIENTOS.unshift({
              id: Date.now() + Math.floor(Math.random() * 1000),
              producto_id: prod.id,
              producto: prod,
              tipo: 'SALE',
              cantidad: item.cantidad,
              cantidad_anterior: anterior,
              cantidad_nueva: nuevoStock,
              motivo: `Venta ${nueva.numero}`,
              referencia: nueva.numero,
              usuario: 'Admin',
              created_at: nueva.created_at,
            })
          }
        }
      }
    }

    // Registrar movimiento en caja si hay sesión abierta
    if (MOCK_SESION_CAJA && MOCK_SESION_CAJA.estado === 'abierta') {
      const mov: MovimientoCaja = {
        id: _movimientoIdCounter++,
        tipo: 'ingreso',
        monto: nueva.total,
        descripcion: `Venta ${nueva.numero}`,
        usuario: 'Admin',
        created_at: nueva.created_at,
      }
      MOCK_SESION_CAJA.movimientos.push(mov)
      MOCK_SESION_CAJA.total_ventas += nueva.total
    }

    return HttpResponse.json(
      { success: true, message: 'Venta registrada', data: nueva },
      { status: 201 }
    )
  }),

  // PUT /ventas/:id
  http.put(`${BASE}/ventas/:id`, async ({ params, request }) => {
    const body = (await request.json()) as Partial<Venta>
    const idx = MOCK_VENTAS.findIndex((v) => v.id === Number(params.id))
    if (idx !== -1) {
      MOCK_VENTAS[idx] = { ...MOCK_VENTAS[idx], ...body }
    }
    return HttpResponse.json({ success: true, message: 'Venta actualizada', data: MOCK_VENTAS[idx] })
  }),

  // POST /ventas/:id/cancelar
  http.post(`${BASE}/ventas/:id/cancelar`, ({ params }) => {
    const idx = MOCK_VENTAS.findIndex((v) => v.id === Number(params.id))
    if (idx !== -1) {
      MOCK_VENTAS[idx].estado = 'CANCELLED'
    }
    return HttpResponse.json({ success: true, message: 'Venta cancelada', data: MOCK_VENTAS[idx] })
  }),

  // GET /caja/sesion-actual
  http.get(`${BASE}/caja/sesion-actual`, () =>
    HttpResponse.json({ success: true, message: 'OK', data: MOCK_SESION_CAJA })
  ),

  // GET /ventas/catalogo/servicios
  http.get(`${BASE}/ventas/catalogo/servicios`, () =>
    HttpResponse.json({ success: true, message: 'OK', data: CATALOGO_SERVICIOS })
  ),

  // GET /ventas/catalogo/productos
  http.get(`${BASE}/ventas/catalogo/productos`, () =>
    HttpResponse.json({ success: true, message: 'OK', data: CATALOGO_PRODUCTOS })
  ),

  // POST /caja/abrir
  http.post(`${BASE}/caja/abrir`, async ({ request }) => {
    const { monto_inicial } = (await request.json()) as { monto_inicial: number }
    MOCK_SESION_CAJA = {
      id: Date.now(),
      apertura_at: new Date().toISOString(),
      monto_inicial,
      total_ventas: 0,
      total_ingresos: 0,
      total_egresos: 0,
      usuario: 'Admin',
      estado: 'abierta',
      movimientos: [
        {
          id: _movimientoIdCounter++,
          tipo: 'apertura',
          monto: monto_inicial,
          descripcion: 'Apertura de caja',
          usuario: 'Admin',
          created_at: new Date().toISOString(),
        },
      ],
    }
    return HttpResponse.json(
      { success: true, message: 'Caja abierta', data: MOCK_SESION_CAJA },
      { status: 201 }
    )
  }),

  // POST /caja/:id/cerrar
  http.post(`${BASE}/caja/:id/cerrar`, async ({ request }) => {
    const { monto_final } = (await request.json()) as { monto_final: number }
    if (MOCK_SESION_CAJA) {
      const saldoTeorico =
        MOCK_SESION_CAJA.monto_inicial +
        MOCK_SESION_CAJA.total_ventas +
        MOCK_SESION_CAJA.total_ingresos -
        MOCK_SESION_CAJA.total_egresos
      MOCK_SESION_CAJA.estado = 'cerrada'
      MOCK_SESION_CAJA.cierre_at = new Date().toISOString()
      MOCK_SESION_CAJA.monto_final = monto_final
      MOCK_SESION_CAJA.diferencia = monto_final - saldoTeorico

      const cierreMovimiento: MovimientoCaja = {
        id: _movimientoIdCounter++,
        tipo: 'cierre',
        monto: monto_final,
        descripcion: `Cierre de caja. Diferencia: $${MOCK_SESION_CAJA.diferencia.toFixed(2)}`,
        usuario: 'Admin',
        created_at: new Date().toISOString(),
      }
      MOCK_SESION_CAJA.movimientos.push(cierreMovimiento)
    }
    return HttpResponse.json({ success: true, message: 'Caja cerrada', data: MOCK_SESION_CAJA })
  }),

  // GET /caja/:id/movimientos
  http.get(`${BASE}/caja/:id/movimientos`, () =>
    HttpResponse.json({
      success: true,
      message: 'OK',
      data: MOCK_SESION_CAJA?.movimientos ?? [],
    })
  ),

  // POST /caja/movimientos
  http.post(`${BASE}/caja/movimientos`, async ({ request }) => {
    const body = (await request.json()) as {
      sesion_id: number
      tipo: 'ingreso' | 'egreso'
      monto: number
      descripcion: string
    }
    const nuevo: MovimientoCaja = {
      id: _movimientoIdCounter++,
      tipo: body.tipo,
      monto: body.monto,
      descripcion: body.descripcion,
      usuario: 'Admin',
      created_at: new Date().toISOString(),
    }
    if (MOCK_SESION_CAJA) {
      MOCK_SESION_CAJA.movimientos.push(nuevo)
      if (body.tipo === 'ingreso') {
        MOCK_SESION_CAJA.total_ingresos += body.monto
      } else {
        MOCK_SESION_CAJA.total_egresos += body.monto
      }
    }
    return HttpResponse.json(
      { success: true, message: 'Movimiento registrado', data: nuevo },
      { status: 201 }
    )
  }),
]
