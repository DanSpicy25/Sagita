import { http, HttpResponse } from 'msw'
import { Producto, MovimientoStock, AlertaStock } from '@/types'

const BASE = import.meta.env.VITE_API_BASE_URL as string

// ─── Mock Data ─────────────────────────────────────────────────────────────

export const MOCK_PRODUCTOS: Producto[] = [
  {
    id: 1,
    sku: 'BEL-001',
    nombre: 'Serum Vitamina C 30ml',
    descripcion: 'Suero concentrado antioxidante con ácido ascórbico al 15%.',
    categoria: 'Productos de Belleza',
    precio_venta: 38.5,
    precio_costo: 18.0,
    stock_actual: 42,
    stock_minimo: 10,
    unidad: 'unidad',
    activo: true,
    proveedor: 'DermaLab Pro',
    created_at: '2026-01-15T00:00:00Z',
  },
  {
    id: 2,
    sku: 'BEL-002',
    nombre: 'Crema Hidratante FPS 50',
    descripcion: 'Hidratación intensa con protección solar para uso diario.',
    categoria: 'Productos de Belleza',
    precio_venta: 25.0,
    precio_costo: 11.5,
    stock_actual: 5,
    stock_minimo: 8,
    unidad: 'unidad',
    activo: true,
    proveedor: 'DermaLab Pro',
    created_at: '2026-02-01T00:00:00Z',
  },
  {
    id: 3,
    sku: 'MED-001',
    nombre: 'Guantes de Nitrilo (caja x100)',
    descripcion: 'Guantes desechables sin látex, talla M.',
    categoria: 'Insumos Médicos',
    precio_venta: 14.99,
    precio_costo: 8.0,
    stock_actual: 3,
    stock_minimo: 10,
    unidad: 'caja',
    activo: true,
    proveedor: 'MediSupply Corp',
    created_at: '2026-01-10T00:00:00Z',
  },
  {
    id: 4,
    sku: 'MED-002',
    nombre: 'Alcohol Isopropílico 1L',
    descripcion: 'Desinfectante de superficies al 70%.',
    categoria: 'Insumos Médicos',
    precio_venta: 9.5,
    precio_costo: 4.25,
    stock_actual: 20,
    stock_minimo: 12,
    unidad: 'litro',
    activo: true,
    proveedor: 'MediSupply Corp',
    created_at: '2026-01-20T00:00:00Z',
  },
  {
    id: 5,
    sku: 'SUP-001',
    nombre: 'Colágeno Hidrolizado 500g',
    descripcion: 'Suplemento proteico para piel, uñas y articulaciones.',
    categoria: 'Suplementos',
    precio_venta: 45.0,
    precio_costo: 22.0,
    stock_actual: 18,
    stock_minimo: 5,
    unidad: 'pote',
    activo: true,
    proveedor: 'NutriVital',
    created_at: '2026-03-05T00:00:00Z',
  },
  {
    id: 6,
    sku: 'SUP-002',
    nombre: 'Vitamina D3 2000 UI (60 cápsulas)',
    descripcion: 'Apoyo inmunológico y salud ósea.',
    categoria: 'Suplementos',
    precio_venta: 18.0,
    precio_costo: 7.5,
    stock_actual: 0,
    stock_minimo: 6,
    unidad: 'frasco',
    activo: false,
    proveedor: 'NutriVital',
    created_at: '2026-03-10T00:00:00Z',
  },
  {
    id: 7,
    sku: 'ROA-001',
    nombre: 'Bata Desechable Talla Única',
    descripcion: 'Bata de protección no tejida para procedimientos estéticos.',
    categoria: 'Ropa y Accesorios',
    precio_venta: 3.5,
    precio_costo: 1.2,
    stock_actual: 80,
    stock_minimo: 20,
    unidad: 'unidad',
    activo: true,
    proveedor: 'TextilMed',
    created_at: '2026-02-14T00:00:00Z',
  },
  {
    id: 8,
    sku: 'ROA-002',
    nombre: 'Gorro Quirúrgico (bolsa x50)',
    descripcion: 'Gorros desechables de polipropileno azul.',
    categoria: 'Ropa y Accesorios',
    precio_venta: 6.0,
    precio_costo: 2.5,
    stock_actual: 4,
    stock_minimo: 5,
    unidad: 'bolsa',
    activo: true,
    proveedor: 'TextilMed',
    created_at: '2026-02-18T00:00:00Z',
  },
]

export const MOCK_MOVIMIENTOS: MovimientoStock[] = [
  {
    id: 1,
    producto_id: 1,
    producto: MOCK_PRODUCTOS[0],
    tipo: 'PURCHASE',
    cantidad: 50,
    cantidad_anterior: 0,
    cantidad_nueva: 50,
    motivo: 'Compra inicial al proveedor DermaLab',
    referencia: 'OC-2026-001',
    usuario: 'admin@sagitta.io',
    created_at: '2026-01-15T09:00:00Z',
  },
  {
    id: 2,
    producto_id: 1,
    producto: MOCK_PRODUCTOS[0],
    tipo: 'SALE',
    cantidad: 8,
    cantidad_anterior: 50,
    cantidad_nueva: 42,
    motivo: 'Venta en consultorio',
    usuario: 'recep@sagitta.io',
    created_at: '2026-09-10T14:30:00Z',
  },
  {
    id: 3,
    producto_id: 3,
    producto: MOCK_PRODUCTOS[2],
    tipo: 'LOSS',
    cantidad: 2,
    cantidad_anterior: 5,
    cantidad_nueva: 3,
    motivo: 'Cajas dañadas en almacén',
    usuario: 'admin@sagitta.io',
    created_at: '2026-09-18T11:00:00Z',
  },
  {
    id: 4,
    producto_id: 2,
    producto: MOCK_PRODUCTOS[1],
    tipo: 'ADJUSTMENT',
    cantidad: 3,
    cantidad_anterior: 8,
    cantidad_nueva: 5,
    motivo: 'Ajuste por inventario físico',
    referencia: 'INV-2026-09',
    usuario: 'gerente@sagitta.io',
    created_at: '2026-09-20T09:00:00Z',
  },
  {
    id: 5,
    producto_id: 5,
    producto: MOCK_PRODUCTOS[4],
    tipo: 'PURCHASE',
    cantidad: 18,
    cantidad_anterior: 0,
    cantidad_nueva: 18,
    motivo: 'Reposición mensual',
    referencia: 'OC-2026-005',
    usuario: 'admin@sagitta.io',
    created_at: '2026-09-05T10:00:00Z',
  },
  {
    id: 6,
    producto_id: 7,
    producto: MOCK_PRODUCTOS[6],
    tipo: 'TRANSFER',
    cantidad: 20,
    cantidad_anterior: 100,
    cantidad_nueva: 80,
    motivo: 'Transferencia a sucursal norte',
    referencia: 'TRF-2026-003',
    usuario: 'gerente@sagitta.io',
    created_at: '2026-09-22T08:30:00Z',
  },
]

function computeAlertas(): AlertaStock[] {
  return MOCK_PRODUCTOS.filter(
    (p) => p.activo && p.stock_actual <= p.stock_minimo
  ).map((p) => ({
    producto_id: p.id,
    producto: p,
    stock_actual: p.stock_actual,
    stock_minimo: p.stock_minimo,
  }))
}

// ─── Handlers ──────────────────────────────────────────────────────────────

export const inventarioHandlers = [
  // GET /productos
  http.get(`${BASE}/productos`, () =>
    HttpResponse.json({ success: true, message: 'OK', data: MOCK_PRODUCTOS })
  ),

  // GET /productos/:id
  http.get(`${BASE}/productos/:id`, ({ params }) => {
    const prod = MOCK_PRODUCTOS.find((p) => p.id === Number(params.id))
    if (!prod)
      return HttpResponse.json({ success: false, message: 'Producto no encontrado' }, { status: 404 })
    return HttpResponse.json({ success: true, message: 'OK', data: prod })
  }),

  // POST /productos
  http.post(`${BASE}/productos`, async ({ request }) => {
    const body = (await request.json()) as Partial<Producto>
    const nuevo: Producto = {
      id: Date.now(),
      sku: body.sku ?? `SKU-${Date.now()}`,
      nombre: body.nombre ?? 'Nuevo Producto',
      descripcion: body.descripcion,
      categoria: body.categoria ?? 'General',
      precio_venta: body.precio_venta ?? 0,
      precio_costo: body.precio_costo ?? 0,
      stock_actual: body.stock_actual ?? 0,
      stock_minimo: body.stock_minimo ?? 5,
      unidad: body.unidad ?? 'unidad',
      activo: body.activo ?? true,
      proveedor: body.proveedor,
      created_at: new Date().toISOString(),
      ...body,
    }
    MOCK_PRODUCTOS.unshift(nuevo)
    return HttpResponse.json({ success: true, message: 'Producto creado', data: nuevo }, { status: 201 })
  }),

  // PUT /productos/:id
  http.put(`${BASE}/productos/:id`, async ({ params, request }) => {
    const body = (await request.json()) as Partial<Producto>
    const idx = MOCK_PRODUCTOS.findIndex((p) => p.id === Number(params.id))
    if (idx === -1)
      return HttpResponse.json({ success: false, message: 'Producto no encontrado' }, { status: 404 })
    MOCK_PRODUCTOS[idx] = { ...MOCK_PRODUCTOS[idx], ...body }
    return HttpResponse.json({ success: true, message: 'Producto actualizado', data: MOCK_PRODUCTOS[idx] })
  }),

  // DELETE /productos/:id
  http.delete(`${BASE}/productos/:id`, ({ params }) => {
    const idx = MOCK_PRODUCTOS.findIndex((p) => p.id === Number(params.id))
    if (idx !== -1) MOCK_PRODUCTOS.splice(idx, 1)
    return HttpResponse.json({ success: true, message: 'Producto eliminado' })
  }),

  // GET /movimientos-stock
  http.get(`${BASE}/movimientos-stock`, ({ request }) => {
    const url = new URL(request.url)
    const productoId = url.searchParams.get('producto_id')
    const data = productoId
      ? MOCK_MOVIMIENTOS.filter((m) => m.producto_id === Number(productoId))
      : MOCK_MOVIMIENTOS
    return HttpResponse.json({ success: true, message: 'OK', data })
  }),

  // POST /movimientos-stock
  http.post(`${BASE}/movimientos-stock`, async ({ request }) => {
    const body = (await request.json()) as {
      producto_id: number
      tipo: MovimientoStock['tipo']
      cantidad: number
      motivo?: string
      referencia?: string
    }

    const prod = MOCK_PRODUCTOS.find((p) => p.id === body.producto_id)
    if (!prod)
      return HttpResponse.json({ success: false, message: 'Producto no encontrado' }, { status: 404 })

    const anterior = prod.stock_actual
    let nueva = anterior

    if (body.tipo === 'PURCHASE' || body.tipo === 'RETURN') {
      nueva = anterior + body.cantidad
    } else if (body.tipo === 'SALE' || body.tipo === 'LOSS' || body.tipo === 'TRANSFER') {
      nueva = Math.max(0, anterior - body.cantidad)
    } else if (body.tipo === 'ADJUSTMENT') {
      nueva = body.cantidad // direct set for adjustments
    }

    prod.stock_actual = nueva

    const mov: MovimientoStock = {
      id: Date.now(),
      producto_id: body.producto_id,
      producto: { ...prod },
      tipo: body.tipo,
      cantidad: body.cantidad,
      cantidad_anterior: anterior,
      cantidad_nueva: nueva,
      motivo: body.motivo,
      referencia: body.referencia,
      usuario: 'admin@sagitta.io',
      created_at: new Date().toISOString(),
    }
    MOCK_MOVIMIENTOS.unshift(mov)

    return HttpResponse.json(
      { success: true, message: 'Movimiento registrado', data: mov },
      { status: 201 }
    )
  }),

  // GET /alertas-stock
  http.get(`${BASE}/alertas-stock`, () =>
    HttpResponse.json({ success: true, message: 'OK', data: computeAlertas() })
  ),
]
