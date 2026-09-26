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
    servicioId?: number
  ): Promise<{ success: boolean; data?: SlotDisponible[] }> {
    return apiClient.get<SlotDisponible[]>(
      `/citas/disponibilidad?empleado_id=${empleadoId}&fecha=${fecha}${
        servicioId ? `&servicio_id=${servicioId}` : ''
      }`
    )
  }
}
