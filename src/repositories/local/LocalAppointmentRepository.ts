import { ApiResponse, Cita, SlotDisponible } from '@/types'
import { IAppointmentRepository } from '../interfaces/IAppointmentRepository'
import { LocalStorageAdapter } from './LocalStorageAdapter'

const SEED_CITAS: Cita[] = [
  {
    id: 1,
    cliente_id: 1,
    cliente: {
      id: 1,
      nombre: 'Ana García',
      email: 'ana@email.com',
      telefono: '+1 555-0101',
      total_citas: 8,
      created_at: '2026-01-10T00:00:00Z',
    },
    empleado_id: 1,
    empleado: {
      id: 1,
      usuario_id: 2,
      nombre: 'Dr. Carlos Pérez',
      email: 'carlos@sagitta.com',
      especialidad: 'Medicina General',
      activo: true,
    },
    servicio_id: 1,
    servicio: {
      id: 1,
      nombre: 'Consulta General',
      duracion_base_min: 30,
      precio_base: 50,
      activo: true,
      buffer_antes_min: 5,
      buffer_despues_min: 10,
    },
    fecha_inicio: new Date().toISOString().replace('T', ' ').slice(0, 16),
    fecha_fin: new Date(Date.now() + 30 * 60000).toISOString().replace('T', ' ').slice(0, 16),
    estado: 'confirmada',
    precio_total: 50,
    notas: 'Primera consulta del paciente',
    created_at: new Date().toISOString(),
  },
  {
    id: 2,
    cliente_id: 1,
    cliente: {
      id: 1,
      nombre: 'Ana García',
      email: 'ana@email.com',
      telefono: '+1 555-0101',
      total_citas: 8,
      created_at: '2026-01-10T00:00:00Z',
    },
    empleado_id: 1,
    empleado: {
      id: 1,
      usuario_id: 2,
      nombre: 'Dr. Carlos Pérez',
      email: 'carlos@sagitta.com',
      especialidad: 'Medicina General',
      activo: true,
    },
    servicio_id: 1,
    servicio: {
      id: 1,
      nombre: 'Consulta General',
      duracion_base_min: 30,
      precio_base: 50,
      activo: true,
      buffer_antes_min: 5,
      buffer_despues_min: 10,
    },
    fecha_inicio: new Date(Date.now() + 86400000).toISOString().replace('T', ' ').slice(0, 16),
    fecha_fin: new Date(Date.now() + 86400000 + 30 * 60000).toISOString().replace('T', ' ').slice(0, 16),
    estado: 'pendiente',
    precio_total: 50,
    created_at: new Date().toISOString(),
  },
]

export class LocalAppointmentRepository implements IAppointmentRepository {
  private collection = 'citas'

  async getAll(params?: Record<string, string>): Promise<ApiResponse<Cita[]>> {
    let list = LocalStorageAdapter.getCollection<Cita>(this.collection, SEED_CITAS)
    if (params?.fecha) {
      list = list.filter((c) => c.fecha_inicio.startsWith(params.fecha))
    }
    if (params?.estado) {
      list = list.filter((c) => c.estado === params.estado)
    }
    if (params?.empleado_id) {
      list = list.filter((c) => String(c.empleado_id) === params.empleado_id)
    }
    return { success: true, message: 'OK', data: list }
  }

  async getById(id: number): Promise<ApiResponse<Cita>> {
    const list = LocalStorageAdapter.getCollection<Cita>(this.collection, SEED_CITAS)
    const cita = list.find((c) => c.id === id)
    if (!cita) throw new Error('Cita no encontrada')
    return { success: true, message: 'OK', data: cita }
  }

  async create(data: Partial<Cita>): Promise<ApiResponse<Cita>> {
    const created = LocalStorageAdapter.insert<Cita>(this.collection, {
      ...data,
      created_at: new Date().toISOString(),
    } as Cita)
    return { success: true, message: 'Cita creada exitosamente', data: created }
  }

  async update(id: number, data: Partial<Cita>): Promise<ApiResponse<Cita>> {
    const updated = LocalStorageAdapter.update<Cita>(this.collection, id, data)
    if (!updated) throw new Error('Cita no encontrada para actualizar')
    return { success: true, message: 'Cita actualizada exitosamente', data: updated }
  }

  async cancel(id: number): Promise<ApiResponse<void>> {
    LocalStorageAdapter.update<Cita>(this.collection, id, { estado: 'cancelada' })
    return { success: true, message: 'Cita cancelada' }
  }

  async getDisponibilidad(
    empleadoId: number,
    fecha: string,
    _servicioId?: number
  ): Promise<{ success: boolean; data?: SlotDisponible[] }> {
    const citas = LocalStorageAdapter.getCollection<Cita>(this.collection, SEED_CITAS)
    const ocupadas = new Set(
      citas
        .filter(
          (c) =>
            c.empleado_id === empleadoId &&
            c.fecha_inicio.startsWith(fecha) &&
            c.estado !== 'cancelada'
        )
        .map((c) => {
          const timePart = c.fecha_inicio.includes(' ')
            ? c.fecha_inicio.split(' ')[1]?.slice(0, 5)
            : c.fecha_inicio.split('T')[1]?.slice(0, 5)
          return timePart
        })
        .filter(Boolean)
    )

    const baseHours = [
      '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
      '14:00', '14:30', '15:00', '15:30', '16:00'
    ]

    const slots: SlotDisponible[] = baseHours.map((h) => ({
      hora_inicio: h,
      hora_fin: h.endsWith(':00') ? `${h.slice(0, 2)}:30` : `${String(Number(h.slice(0, 2)) + 1).padStart(2, '0')}:00`,
      disponible: !ocupadas.has(h),
    }))
    return { success: true, data: slots }
  }
}
