import {
  ApiResponse,
  Producto,
  MovimientoStock,
  AlertaStock,
  MovimientoInventario,
} from '@/types'

export interface IInventoryRepository {
  getProductos(params?: Record<string, string>): Promise<ApiResponse<Producto[]>>
  getProducto(id: number): Promise<ApiResponse<Producto>>
  createProducto(data: Partial<Producto>): Promise<ApiResponse<Producto>>
  updateProducto(id: number, data: Partial<Producto>): Promise<ApiResponse<Producto>>
  deleteProducto(id: number): Promise<ApiResponse<void>>
  getMovimientos(productoId?: number): Promise<ApiResponse<MovimientoStock[]>>
  registrarMovimiento(data: {
    producto_id: number
    tipo: MovimientoInventario
    cantidad: number
    motivo?: string
    referencia?: string
  }): Promise<ApiResponse<MovimientoStock>>
  getAlertasStock(): Promise<ApiResponse<AlertaStock[]>>
}
