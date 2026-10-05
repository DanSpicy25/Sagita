import { salesRepository } from '@/repositories'
import {
  ApiResponse,
  Venta,
  SesionCaja,
  MovimientoCaja,
  TipoMovimientoCaja,
  MetodoPagoVenta,
} from '@/types'
import { commerceEngine, DatosVentaPayload, ResultadoProcesamientoVenta } from './commerceEngine.service'

export const ventasService = {
  getVentas: (params?: Record<string, string>): Promise<ApiResponse<Venta[]>> =>
    salesRepository.getVentas(params),

  getVenta: (id: number): Promise<ApiResponse<Venta>> =>
    salesRepository.getVenta(id),

  createVenta: (data: Partial<Venta>): Promise<ApiResponse<Venta>> =>
    salesRepository.createVenta(data),

  procesarVentaCompleta: (payload: DatosVentaPayload): Promise<ApiResponse<ResultadoProcesamientoVenta>> =>
    commerceEngine.procesarVenta(payload),

  procesarDevolucionVenta: (ventaId: number, motivo: string, monto?: number): Promise<ApiResponse<Venta>> =>
    commerceEngine.procesarDevolucion(ventaId, motivo, monto),

  reembolsarVenta: (ventaId: number, motivo: string, monto?: number): Promise<ApiResponse<Venta>> =>
    commerceEngine.procesarDevolucion(ventaId, motivo, monto),

  updateVenta: (id: number, data: Partial<Venta>): Promise<ApiResponse<Venta>> =>
    salesRepository.updateVenta(id, data),

  cancelarVenta: (id: number): Promise<ApiResponse<Venta>> =>
    salesRepository.cancelarVenta(id),

  getSesionActual: (): Promise<ApiResponse<SesionCaja | null>> =>
    salesRepository.getSesionActual(),

  abrirCaja: (montoInicial: number): Promise<ApiResponse<SesionCaja>> =>
    salesRepository.abrirCaja(montoInicial),

  cerrarCaja: (id: number, montoFinal: number, _observaciones?: string): Promise<ApiResponse<SesionCaja>> =>
    salesRepository.cerrarCaja(id, montoFinal),

  getMovimientosCaja: (sesionId?: number): Promise<ApiResponse<MovimientoCaja[]>> =>
    salesRepository.getMovimientosCaja(sesionId),

  registrarMovimientoCaja: (data: {
    sesion_id?: number
    tipo: TipoMovimientoCaja
    monto: number
    descripcion: string
    metodo_pago?: MetodoPagoVenta
    empleado_id?: number
  }): Promise<ApiResponse<MovimientoCaja>> =>
    salesRepository.registrarMovimientoCaja(data),
}

