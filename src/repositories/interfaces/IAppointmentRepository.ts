import { ApiResponse, Cita, SlotDisponible, Recurrencia } from '@/types'

export interface IAppointmentRepository {
  getAll(params?: Record<string, string>): Promise<ApiResponse<Cita[]>>
  getById(id: number): Promise<ApiResponse<Cita>>
  create(data: Partial<Cita>): Promise<ApiResponse<Cita>>
  update(id: number, data: Partial<Cita>): Promise<ApiResponse<Cita>>
  cancel(id: number, motivo?: string): Promise<ApiResponse<void>>
  getDisponibilidad(
    empleadoId: number,
    fecha: string,
    servicioId?: number,
    duracionMin?: number,
    recursoId?: number
  ): Promise<{ success: boolean; data?: SlotDisponible[] }>
  reprogramar?(
    id: number,
    nuevaFechaInicio: string,
    nuevaFechaFin: string,
    nuevoRecursoId?: number
  ): Promise<ApiResponse<Cita>>
  iniciarAtencion?(id: number): Promise<ApiResponse<Cita>>
  completarAtencion?(id: number): Promise<ApiResponse<Cita>>
  marcarNoShow?(id: number): Promise<ApiResponse<Cita>>
  crearRecurrentes?(
    citaBase: Partial<Cita>,
    recurrencia: Recurrencia
  ): Promise<ApiResponse<Cita[]>>
}
