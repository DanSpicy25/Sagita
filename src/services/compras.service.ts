import { Proveedor, OrdenCompra, Producto, MovimientoStock, ApiResponse } from '@/types'
import { LocalStorageAdapter } from '@/repositories/local/LocalStorageAdapter'

const COLLECTION_PROVEEDORES = 'proveedores'
const COLLECTION_COMPRAS = 'ordenes_compra'
const COLLECTION_PRODUCTOS = 'productos'
const COLLECTION_MOVIMIENTOS = 'movimientos_stock'

const SEED_PROVEEDORES: Proveedor[] = [
  {
    id: 1,
    nombre: 'CosmÃ©ticos del Valle S.A.',
    rnc_rif: 'J-30912445-1',
    contacto: 'Lic. Roberto Morales',
    email: 'ventas@cosmeticosvalle.com',
    telefono: '+58 414 901 2345',
    direccion: 'Zona Industrial La Candelaria, Caracas',
    activo: true,
  },
  {
    id: 2,
    nombre: 'Aromas Naturales Spa C.A.',
    rnc_rif: 'J-40129883-2',
    contacto: 'Elena MÃ©ndez',
    email: 'pedidos@aromasnaturales.com',
    telefono: '+58 412 888 7766',
    direccion: 'Av. Las Delicias, Maracay',
    activo: true,
  },
  {
    id: 3,
    nombre: 'Distribuidora MÃ©dica Central',
    rnc_rif: 'J-29837119-0',
    contacto: 'Dr. VÃ­ctor Rivas',
    email: 'contacto@distrimedicacentral.com',
    telefono: '+58 212 555 4321',
    direccion: 'Centro MÃ©dico Los Andes, Valencia',
    activo: true,
  },
]

const SEED_ORDENES: OrdenCompra[] = [
  {
    id: 1,
    numero: 'OC-2026-001',
    proveedor_id: 1,
    proveedor_nombre: 'CosmÃ©ticos del Valle S.A.',
    items: [
      {
        producto_id: 1,
        producto_nombre: 'Shampoo Profesional Hidratante 500ml',
        cantidad: 20,
        costo_unitario: 12,
        total: 240,
      },
    ],
    subtotal: 240,
    impuesto: 38.4,
    total: 278.4,
    estado: 'recibida',
    fecha_creacion: '2026-09-10T10:00:00Z',
    fecha_recepcion: '2026-09-15T14:30:00Z',
    notas: 'Entrega regular mensual de shampoos.',
  },
]

export const comprasService = {
  // â”€â”€â”€ Proveedores â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  getProveedores: async (): Promise<ApiResponse<Proveedor[]>> => {
    const data = LocalStorageAdapter.getCollection<Proveedor>(COLLECTION_PROVEEDORES, SEED_PROVEEDORES)
    return { success: true, message: 'OK', data }
  },

  crearProveedor: async (data: Omit<Proveedor, 'id'>): Promise<ApiResponse<Proveedor>> => {
    const nuevo: Proveedor = {
      ...data,
      id: Date.now(),
      created_at: new Date().toISOString(),
    }
    const created = LocalStorageAdapter.insert<Proveedor>(COLLECTION_PROVEEDORES, nuevo)
    return { success: true, message: 'Proveedor creado', data: created }
  },

  actualizarProveedor: async (id: number, data: Partial<Proveedor>): Promise<ApiResponse<Proveedor>> => {
    const updated = LocalStorageAdapter.update<Proveedor>(COLLECTION_PROVEEDORES, id, data)
    if (!updated) throw new Error('Proveedor no encontrado')
    return { success: true, message: 'Proveedor actualizado', data: updated }
  },

  eliminarProveedor: async (id: number): Promise<ApiResponse<void>> => {
    LocalStorageAdapter.remove<Proveedor>(COLLECTION_PROVEEDORES, id)
    return { success: true, message: 'Proveedor eliminado' }
  },

  // â”€â”€â”€ Ã“rdenes de Compra â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  getOrdenes: async (): Promise<ApiResponse<OrdenCompra[]>> => {
    const data = LocalStorageAdapter.getCollection<OrdenCompra>(COLLECTION_COMPRAS, SEED_ORDENES)
    return { success: true, message: 'OK', data }
  },

  crearOrden: async (data: Partial<OrdenCompra>): Promise<ApiResponse<OrdenCompra>> => {
    const list = LocalStorageAdapter.getCollection<OrdenCompra>(COLLECTION_COMPRAS, SEED_ORDENES)
    const numero = `OC-${new Date().getFullYear()}-${String(list.length + 1).padStart(3, '0')}`

    const nueva: OrdenCompra = {
      id: Date.now(),
      numero,
      proveedor_id: data.proveedor_id || 1,
      proveedor_nombre: data.proveedor_nombre || 'Proveedor',
      items: data.items || [],
      subtotal: data.subtotal || 0,
      impuesto: data.impuesto || 0,
      total: data.total || 0,
      estado: data.estado || 'borrador',
      fecha_creacion: new Date().toISOString(),
      notas: data.notas,
    }

    const created = LocalStorageAdapter.insert<OrdenCompra>(COLLECTION_COMPRAS, nueva)
    return { success: true, message: `Orden de compra ${numero} generada`, data: created }
  },

  actualizarOrden: async (id: number, data: Partial<OrdenCompra>): Promise<ApiResponse<OrdenCompra>> => {
    const updated = LocalStorageAdapter.update<OrdenCompra>(COLLECTION_COMPRAS, id, data)
    if (!updated) throw new Error('Orden de compra no encontrada')
    return { success: true, message: 'Orden actualizada', data: updated }
  },

  recibirOrden: async (id: number): Promise<ApiResponse<OrdenCompra>> => {
    const list = LocalStorageAdapter.getCollection<OrdenCompra>(COLLECTION_COMPRAS, SEED_ORDENES)
    const orden = list.find((o) => o.id === id)

    if (!orden) throw new Error('Orden de compra no encontrada')
    if (orden.estado === 'recibida') throw new Error('La orden de compra ya fue recibida previamente')
    if (orden.estado === 'cancelada') throw new Error('No se puede recibir una orden cancelada')

    const now = new Date().toISOString()
    orden.estado = 'recibida'
    orden.fecha_recepcion = now

    // Incrementar inventario de cada producto
    const productos = LocalStorageAdapter.getCollection<Producto>(COLLECTION_PRODUCTOS, [])

    for (const item of orden.items) {
      const prod = productos.find((p) => p.id === item.producto_id)
      if (prod) {
        const anterior = prod.stock_actual
        const nuevoStock = anterior + item.cantidad

        LocalStorageAdapter.update<Producto>(COLLECTION_PRODUCTOS, prod.id, {
          stock_actual: nuevoStock,
          precio_costo: item.costo_unitario > 0 ? item.costo_unitario : prod.precio_costo,
        })

        const mov: MovimientoStock = {
          id: Date.now() + Math.floor(Math.random() * 1000),
          producto_id: prod.id,
          producto: prod,
          tipo: 'PURCHASE',
          cantidad: item.cantidad,
          cantidad_anterior: anterior,
          cantidad_nueva: nuevoStock,
          motivo: `RecepciÃ³n Orden de Compra ${orden.numero}`,
          referencia: orden.numero,
          usuario: 'Administrador de Compras',
          created_at: now,
        }
        LocalStorageAdapter.insert<MovimientoStock>(COLLECTION_MOVIMIENTOS, mov)
      }
    }

    LocalStorageAdapter.setCollection(COLLECTION_COMPRAS, list)
    return {
      success: true,
      message: `Orden ${orden.numero} recibida. Stock de ${orden.items.length} productos actualizado exitosamente.`,
      data: orden,
    }
  },
}
