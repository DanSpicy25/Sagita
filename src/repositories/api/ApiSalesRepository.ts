import { apiClient } from '@/services/api.client'
import {
  ApiResponse,
  Venta,
  SesionCaja,
  MovimientoCaja,
  TipoMovimientoCaja,
} from '@/types'
import { ISalesRepository } from '../interfaces/ISalesRepository'

export class ApiSalesRepository implements ISalesRepository {
  getVentas(params?: Record<string, string>): Promise<ApiResponse<Venta[]>> {
    const qs = params ? '?' + new URLSearchParams(params).toString() : ''
    return apiClient.get<Venta[]>(`/ventas${qs}`)
  }

  getVenta(id: number): Promise<ApiResponse<Venta>> {
    return apiClient.get<Venta>(`/ventas/${id}`)
  }

  createVenta(data: Partial<Venta>): Promise<ApiResponse<Venta>> {
    return apiClient.post<Venta>('/ventas', data)
  }

  updateVenta(id: number, data: Partial<Venta>): Promise<ApiResponse<Venta>> {
    return apiClient.put<Venta>(`/ventas/${id}`, data)
  }

  cancelarVenta(id: number): Promise<ApiResponse<Venta>> {
    return apiClient.post<Venta>(`/ventas/${id}/cancelar`, {})
  }

  getSesionActual(): Promise<ApiResponse<SesionCaja | null>> {
    return apiClient.get<SesionCaja | null>('/caja/sesion-actual')
  }

  abrirCaja(montoInicial: number): Promise<ApiResponse<SesionCaja>> {
    return apiClient.post<SesionCaja>('/caja/abrir', { monto_inicial: montoInicial })
  }

  cerrarCaja(id: number, montoFinal: number, observaciones?: string): Promise<ApiResponse<SesionCaja>> {
    return apiClient.post<SesionCaja>(`/caja/${id}/cerrar`, { monto_final: montoFinal, observaciones })
  }

  getMovimientosCaja(sesionId?: number): Promise<ApiResponse<MovimientoCaja[]>> {
    const qs = sesionId ? `?sesion_id=${sesionId}` : ''
    return apiClient.get<MovimientoCaja[]>(`/caja/movimientos${qs}`)
  }

  registrarMovimientoCaja(data: {
    sesion_id?: number
    tipo: TipoMovimientoCaja
    monto: number
    descripcion: string
    metodo_pago?: import('@/types').MetodoPagoVenta
    empleado_id?: number
  }): Promise<ApiResponse<MovimientoCaja>> {
    return apiClient.post<MovimientoCaja>('/caja/movimientos', data)
  }
}
