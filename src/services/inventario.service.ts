import { inventoryRepository } from '@/repositories'
import {
  ApiResponse,
  Producto,
  MovimientoStock,
  AlertaStock,
  MovimientoInventario,
} from '@/types'

export const inventarioService = {
  getProductos: (params?: Record<string, string>): Promise<ApiResponse<Producto[]>> =>
    inventoryRepository.getProductos(params),

  getProducto: (id: number): Promise<ApiResponse<Producto>> =>
    inventoryRepository.getProducto(id),

  createProducto: (data: Partial<Producto>): Promise<ApiResponse<Producto>> =>
    inventoryRepository.createProducto(data),

  updateProducto: (id: number, data: Partial<Producto>): Promise<ApiResponse<Producto>> =>
    inventoryRepository.updateProducto(id, data),

  deleteProducto: (id: number): Promise<ApiResponse<void>> =>
    inventoryRepository.deleteProducto(id),

  getMovimientos: (productoId?: number): Promise<ApiResponse<MovimientoStock[]>> =>
    inventoryRepository.getMovimientos(productoId),

  registrarMovimiento: (data: {
    producto_id: number
    tipo: MovimientoInventario
    cantidad: number
    motivo?: string
    referencia?: string
  }): Promise<ApiResponse<MovimientoStock>> =>
    inventoryRepository.registrarMovimiento(data),

  getAlertasStock: (): Promise<ApiResponse<AlertaStock[]>> =>
    inventoryRepository.getAlertasStock(),
}
