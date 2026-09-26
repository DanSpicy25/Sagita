import { apiClient } from '@/services/api.client'
import { ApiResponse, Cita, SlotDisponible } from '@/types'
import { IAppointmentRepository } from '../interfaces/IAppointmentRepository'

export class ApiAppointmentRepository implements IAppointmentRepository {
  getAll(params?: Record<string, string>): Promise<ApiResponse<Cita[]>> {
    const qs = params ? '?' + new URLSearchParams(params).toString() : ''
    return apiClient.get<Cita[]>(`/citas${qs}`)
  }

  getById(id: number): Promise<ApiResponse<Cita>> {
    return apiClient.get<Cita>(`/citas/${id}`)
  }

  create(data: Partial<Cita>): Promise<ApiResponse<Cita>> {
    return apiClient.post<Cita>('/citas', data)
  }

  update(id: number, data: Partial<Cita>): Promise<ApiResponse<Cita>> {
    return apiClient.put<Cita>(`/citas/${id}`, data)
  }

  cancel(id: number): Promise<ApiResponse<void>> {
    return apiClient.delete<void>(`/citas/${id}`)
  }

  getDisponibilidad(
    empleadoId: number,
    fecha: string,
    servicioId?: number,
    duracionMin?: number
  ): Promise<{ success: boolean; data?: SlotDisponible[] }> {
    const params = new URLSearchParams({ empleado_id: String(empleadoId), fecha })
    if (servicioId) params.set('servicio_id', String(servicioId))
    if (duracionMin) params.set('duracion_min', String(duracionMin))
    return apiClient.get<SlotDisponible[]>(`/citas/disponibilidad?${params.toString()}`)
  }
}
