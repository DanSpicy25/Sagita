import {
  ApiResponse,
  Venta,
  SesionCaja,
  MovimientoCaja,
  TipoMovimientoCaja,
} from '@/types'

export interface ISalesRepository {
  getVentas(params?: Record<string, string>): Promise<ApiResponse<Venta[]>>
  getVenta(id: number): Promise<ApiResponse<Venta>>
  createVenta(data: Partial<Venta>): Promise<ApiResponse<Venta>>
  updateVenta(id: number, data: Partial<Venta>): Promise<ApiResponse<Venta>>
  cancelarVenta(id: number): Promise<ApiResponse<Venta>>
  getSesionActual(): Promise<ApiResponse<SesionCaja | null>>
  abrirCaja(montoInicial: number): Promise<ApiResponse<SesionCaja>>
  cerrarCaja(id: number, montoFinal: number): Promise<ApiResponse<SesionCaja>>
  getMovimientosCaja(sesionId?: number): Promise<ApiResponse<MovimientoCaja[]>>
  registrarMovimientoCaja(data: {
    sesion_id?: number
    tipo: TipoMovimientoCaja
    monto: number
    descripcion: string
  }): Promise<ApiResponse<MovimientoCaja>>
}
