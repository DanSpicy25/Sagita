import { apiClient } from '@/services/api.client'
import {
  ApiResponse,
  Producto,
  MovimientoStock,
  AlertaStock,
  MovimientoInventario,
} from '@/types'
import { IInventoryRepository } from '../interfaces/IInventoryRepository'

export class ApiInventoryRepository implements IInventoryRepository {
  getProductos(params?: Record<string, string>): Promise<ApiResponse<Producto[]>> {
    const qs = params ? '?' + new URLSearchParams(params).toString() : ''
    return apiClient.get<Producto[]>(`/productos${qs}`)
  }

  getProducto(id: number): Promise<ApiResponse<Producto>> {
    return apiClient.get<Producto>(`/productos/${id}`)
  }

  createProducto(data: Partial<Producto>): Promise<ApiResponse<Producto>> {
    return apiClient.post<Producto>('/productos', data)
  }

  updateProducto(id: number, data: Partial<Producto>): Promise<ApiResponse<Producto>> {
    return apiClient.put<Producto>(`/productos/${id}`, data)
  }

  deleteProducto(id: number): Promise<ApiResponse<void>> {
    return apiClient.delete<void>(`/productos/${id}`)
  }

  getMovimientos(productoId?: number): Promise<ApiResponse<MovimientoStock[]>> {
    const qs = productoId ? `?producto_id=${productoId}` : ''
    return apiClient.get<MovimientoStock[]>(`/movimientos-stock${qs}`)
  }

  registrarMovimiento(data: {
    producto_id: number
    tipo: MovimientoInventario
    cantidad: number
    motivo?: string
    referencia?: string
  }): Promise<ApiResponse<MovimientoStock>> {
    return apiClient.post<MovimientoStock>('/movimientos-stock', data)
  }

  getAlertasStock(): Promise<ApiResponse<AlertaStock[]>> {
    return apiClient.get<AlertaStock[]>('/alertas-stock')
  }
}
