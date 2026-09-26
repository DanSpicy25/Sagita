import { ApiResponse, Cita, SlotDisponible } from '@/types'

export interface IAppointmentRepository {
  getAll(params?: Record<string, string>): Promise<ApiResponse<Cita[]>>
  getById(id: number): Promise<ApiResponse<Cita>>
  create(data: Partial<Cita>): Promise<ApiResponse<Cita>>
  update(id: number, data: Partial<Cita>): Promise<ApiResponse<Cita>>
  cancel(id: number): Promise<ApiResponse<void>>
  getDisponibilidad(
    empleadoId: number,
    fecha: string,
    servicioId?: number,
    duracionMin?: number
  ): Promise<{ success: boolean; data?: SlotDisponible[] }>
}
