import { salesRepository } from '@/repositories'
import {
  ApiResponse,
  Venta,
  SesionCaja,
  MovimientoCaja,
  TipoMovimientoCaja,
} from '@/types'

export const ventasService = {
  getVentas: (params?: Record<string, string>): Promise<ApiResponse<Venta[]>> =>
    salesRepository.getVentas(params),

  getVenta: (id: number): Promise<ApiResponse<Venta>> =>
    salesRepository.getVenta(id),

  createVenta: (data: Partial<Venta>): Promise<ApiResponse<Venta>> =>
    salesRepository.createVenta(data),

  updateVenta: (id: number, data: Partial<Venta>): Promise<ApiResponse<Venta>> =>
    salesRepository.updateVenta(id, data),

  cancelarVenta: (id: number): Promise<ApiResponse<Venta>> =>
    salesRepository.cancelarVenta(id),

  getSesionActual: (): Promise<ApiResponse<SesionCaja | null>> =>
    salesRepository.getSesionActual(),

  abrirCaja: (montoInicial: number): Promise<ApiResponse<SesionCaja>> =>
    salesRepository.abrirCaja(montoInicial),

  cerrarCaja: (id: number, montoFinal: number): Promise<ApiResponse<SesionCaja>> =>
    salesRepository.cerrarCaja(id, montoFinal),

  getMovimientosCaja: (sesionId?: number): Promise<ApiResponse<MovimientoCaja[]>> =>
    salesRepository.getMovimientosCaja(sesionId),

  registrarMovimientoCaja: (data: {
    sesion_id?: number
    tipo: TipoMovimientoCaja
    monto: number
    descripcion: string
  }): Promise<ApiResponse<MovimientoCaja>> =>
    salesRepository.registrarMovimientoCaja(data),
}
