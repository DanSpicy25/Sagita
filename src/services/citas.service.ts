import { appointmentRepository } from '@/repositories'
import { Cita, SlotDisponible, Recurrencia, ApiResponse } from '@/types'

export const citasService = {
  getAll: (params?: Record<string, string>) => appointmentRepository.getAll(params),

  getById: (id: number) => appointmentRepository.getById(id),

  create: (data: Partial<Cita>) => appointmentRepository.create(data),

  update: (id: number, data: Partial<Cita>) => appointmentRepository.update(id, data),

  cancel: (id: number, motivo?: string) => appointmentRepository.cancel(id, motivo),

  reprogramar: (
    id: number,
    nuevaFechaInicio: string,
    nuevaFechaFin: string,
    nuevoRecursoId?: number
  ): Promise<ApiResponse<Cita>> => {
    if (appointmentRepository.reprogramar) {
      return appointmentRepository.reprogramar(id, nuevaFechaInicio, nuevaFechaFin, nuevoRecursoId)
    }
    return appointmentRepository.update(id, {
      fecha_inicio: nuevaFechaInicio,
      fecha_fin: nuevaFechaFin,
      recurso_id: nuevoRecursoId,
      estado: 'confirmada',
    })
  },

  iniciarAtencion: (id: number): Promise<ApiResponse<Cita>> => {
    if (appointmentRepository.iniciarAtencion) {
      return appointmentRepository.iniciarAtencion(id)
    }
    return appointmentRepository.update(id, {
      estado: 'en_atencion',
      hora_inicio_atencion: new Date().toISOString(),
    })
  },

  completarAtencion: (id: number): Promise<ApiResponse<Cita>> => {
    if (appointmentRepository.completarAtencion) {
      return appointmentRepository.completarAtencion(id)
    }
    return appointmentRepository.update(id, {
      estado: 'completada',
      hora_fin_atencion: new Date().toISOString(),
    })
  },

  marcarNoShow: (id: number): Promise<ApiResponse<Cita>> => {
    if (appointmentRepository.marcarNoShow) {
      return appointmentRepository.marcarNoShow(id)
    }
    return appointmentRepository.update(id, { estado: 'no_asistio' })
  },

  crearRecurrentes: (
    citaBase: Partial<Cita>,
    recurrencia: Recurrencia
  ): Promise<ApiResponse<Cita[]>> => {
    if (appointmentRepository.crearRecurrentes) {
      return appointmentRepository.crearRecurrentes(citaBase, recurrencia)
    }
    throw new Error('Método crearRecurrentes no disponible')
  },

  getDisponibilidad: (
    empleadoId: number,
    fecha: string,
    servicioId?: number,
    duracionMin?: number,
    recursoId?: number
  ): Promise<{ success: boolean; data?: SlotDisponible[] }> =>
    appointmentRepository.getDisponibilidad(empleadoId, fecha, servicioId, duracionMin, recursoId),
}
