import {
  ApiResponse,
  Producto,
  MovimientoStock,
  AlertaStock,
  MovimientoInventario,
} from '@/types'
import { IInventoryRepository } from '../interfaces/IInventoryRepository'
import { LocalStorageAdapter } from './LocalStorageAdapter'

const SEED_PRODUCTOS: Producto[] = [
  {
    id: 1,
    sku: 'PROD-001',
    nombre: 'Shampoo Profesional Hidratante 500ml',
    descripcion: 'Fórmula hidratante para cabello seco o maltratado con aceite de argán.',
    categoria: 'Productos de Belleza',
    precio_venta: 25,
    precio_costo: 12,
    stock_actual: 18,
    stock_minimo: 5,
    unidad: 'unidad',
    activo: true,
    proveedor: 'Cosméticos del Valle S.A.',
    created_at: '2026-01-15T10:00:00Z',
  },
  {
    id: 2,
    sku: 'PROD-002',
    nombre: 'Aceite de Masaje Relajante Lavanda 250ml',
    descripcion: 'Aceite corporal aromático para sesiones de fisioterapia y relajación.',
    categoria: 'Productos de Belleza',
    precio_venta: 30,
    precio_costo: 14,
    stock_actual: 3,
    stock_minimo: 6,
    unidad: 'unidad',
    activo: true,
    proveedor: 'Aromas Naturales Spa',
    created_at: '2026-02-01T12:00:00Z',
  },
  {
    id: 3,
    sku: 'PROD-003',
    nombre: 'Guantes de Nitrilo Desechables (Caja x100)',
    descripcion: 'Insumo médico de alta resistencia, libres de polvo.',
    categoria: 'Insumos Médicos',
    precio_venta: 18,
    precio_costo: 8,
    stock_actual: 2,
    stock_minimo: 8,
    unidad: 'caja',
    activo: true,
    proveedor: 'Distribuidora Médica Central',
    created_at: '2026-01-20T09:30:00Z',
  },
]

export class LocalInventoryRepository implements IInventoryRepository {
  private collectionProductos = 'productos'
  private collectionMovimientos = 'movimientos_stock'

  async getProductos(params?: Record<string, string>): Promise<ApiResponse<Producto[]>> {
    let list = LocalStorageAdapter.getCollection<Producto>(
      this.collectionProductos,
      SEED_PRODUCTOS
    )
    if (params?.categoria) {
      list = list.filter((p) => p.categoria === params.categoria)
    }
    if (params?.q) {
      const q = params.q.toLowerCase()
      list = list.filter(
        (p) =>
          p.nombre.toLowerCase().includes(q) ||
          p.sku.toLowerCase().includes(q) ||
          (p.proveedor && p.proveedor.toLowerCase().includes(q))
      )
    }
    return { success: true, message: 'OK', data: list }
  }

  async getProducto(id: number): Promise<ApiResponse<Producto>> {
    const list = LocalStorageAdapter.getCollection<Producto>(
      this.collectionProductos,
      SEED_PRODUCTOS
    )
    const prod = list.find((p) => p.id === id)
    if (!prod) throw new Error('Producto no encontrado')
    return { success: true, message: 'OK', data: prod }
  }

  async createProducto(data: Partial<Producto>): Promise<ApiResponse<Producto>> {
    const list = LocalStorageAdapter.getCollection<Producto>(
      this.collectionProductos,
      SEED_PRODUCTOS
    )
    const nuevo: Producto = {
      id: Date.now(),
      sku: data.sku || `PROD-${String(list.length + 1).padStart(3, '0')}`,
      nombre: data.nombre || 'Nuevo Producto',
      descripcion: data.descripcion,
      categoria: data.categoria || 'General',
      precio_venta: data.precio_venta || 0,
      precio_costo: data.precio_costo || 0,
      stock_actual: data.stock_actual || 0,
      stock_minimo: data.stock_minimo || 5,
      unidad: data.unidad || 'unidad',
      activo: data.activo ?? true,
      proveedor: data.proveedor,
      created_at: new Date().toISOString(),
    }
    const created = LocalStorageAdapter.insert<Producto>(this.collectionProductos, nuevo)
    return { success: true, message: 'Producto creado', data: created }
  }

  async updateProducto(id: number, data: Partial<Producto>): Promise<ApiResponse<Producto>> {
    const updated = LocalStorageAdapter.update<Producto>(this.collectionProductos, id, data)
    if (!updated) throw new Error('Producto no encontrado')
    return { success: true, message: 'Producto actualizado', data: updated }
  }

  async deleteProducto(id: number): Promise<ApiResponse<void>> {
    LocalStorageAdapter.remove<Producto>(this.collectionProductos, id)
    return { success: true, message: 'Producto eliminado' }
  }

  async getMovimientos(productoId?: number): Promise<ApiResponse<MovimientoStock[]>> {
    let list = LocalStorageAdapter.getCollection<MovimientoStock>(this.collectionMovimientos, [])
    if (productoId) {
      list = list.filter((m) => m.producto_id === productoId)
    }
    return { success: true, message: 'OK', data: list }
  }

  async registrarMovimiento(data: {
    producto_id: number
    tipo: MovimientoInventario
    cantidad: number
    motivo?: string
    referencia?: string
  }): Promise<ApiResponse<MovimientoStock>> {
    const prods = LocalStorageAdapter.getCollection<Producto>(
      this.collectionProductos,
      SEED_PRODUCTOS
    )
    const prod = prods.find((p) => p.id === data.producto_id)
    if (!prod) throw new Error('Producto no encontrado')

    const anterior = prod.stock_actual
    const esSuma = ['PURCHASE', 'RETURN'].includes(data.tipo)
    const nuevoStock = esSuma ? anterior + data.cantidad : Math.max(0, anterior - data.cantidad)

    LocalStorageAdapter.update<Producto>(this.collectionProductos, data.producto_id, {
      stock_actual: nuevoStock,
    })

    const mov: MovimientoStock = {
      id: Date.now(),
      producto_id: data.producto_id,
      producto: prod,
      tipo: data.tipo,
      cantidad: data.cantidad,
      cantidad_anterior: anterior,
      cantidad_nueva: nuevoStock,
      motivo: data.motivo,
      referencia: data.referencia,
      usuario: 'Admin',
      created_at: new Date().toISOString(),
    }

    const created = LocalStorageAdapter.insert<MovimientoStock>(
      this.collectionMovimientos,
      mov
    )
    return { success: true, message: 'Movimiento registrado', data: created }
  }

  async getAlertasStock(): Promise<ApiResponse<AlertaStock[]>> {
    const prods = LocalStorageAdapter.getCollection<Producto>(
      this.collectionProductos,
      SEED_PRODUCTOS
    )
    const alertas: AlertaStock[] = prods
      .filter((p) => p.stock_actual <= p.stock_minimo && p.activo)
      .map((p) => ({
        producto_id: p.id,
        producto: p,
        stock_actual: p.stock_actual,
        stock_minimo: p.stock_minimo,
      }))
    return { success: true, message: 'OK', data: alertas }
  }
}
