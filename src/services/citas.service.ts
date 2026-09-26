import { appointmentRepository } from '@/repositories'
import { Cita, SlotDisponible } from '@/types'

export const citasService = {
  getAll: (params?: Record<string, string>) => appointmentRepository.getAll(params),

  getById: (id: number) => appointmentRepository.getById(id),

  create: (data: Partial<Cita>) => appointmentRepository.create(data),

  update: (id: number, data: Partial<Cita>) => appointmentRepository.update(id, data),

  cancel: (id: number) => appointmentRepository.cancel(id),

  getDisponibilidad: (
    empleadoId: number,
    fecha: string,
    servicioId?: number,
    duracionMin?: number
  ): Promise<{ success: boolean; data?: SlotDisponible[] }> =>
    appointmentRepository.getDisponibilidad(empleadoId, fecha, servicioId, duracionMin),
}
