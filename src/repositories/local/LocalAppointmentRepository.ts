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

function parseTimeToMinutes(str: string): number | null {
  if (!str) return null
  const timePart = str.includes(' ')
    ? str.split(' ')[1]
    : str.includes('T')
      ? str.split('T')[1]
      : str
  if (!timePart) return null
  const [hStr, mStr] = timePart.split(':')
  const h = parseInt(hStr, 10)
  const m = parseInt(mStr, 10)
  if (isNaN(h) || isNaN(m)) return null
  return h * 60 + m
}

function formatMinutesToTime(totalMin: number): string {
  const h = Math.floor(totalMin / 60)
  const m = totalMin % 60
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}

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
    servicioId?: number
  ): Promise<{ success: boolean; data?: SlotDisponible[] }> {
    if (!fecha) {
      return { success: false, data: [] }
    }

    const fechaTarget = fecha.slice(0, 10)

    // Determinar la duración del servicio si fue provisto (default: 30 minutos)
    let duracionMin = 30
    if (servicioId) {
      try {
        const servicios = LocalStorageAdapter.getCollection<{ id: number; duracion_base_min?: number }>(
          'servicios',
          []
        )
        const serv = servicios.find((s) => s.id === servicioId)
        if (serv && serv.duracion_base_min && serv.duracion_base_min > 0) {
          duracionMin = serv.duracion_base_min
        }
      } catch {
        duracionMin = 30
      }
    }

    const citas = LocalStorageAdapter.getCollection<Cita>(this.collection, SEED_CITAS)

    // Citas activas para ese empleado y día
    const citasDelDia = citas
      .filter((c) => {
        if (c.empleado_id !== empleadoId || c.estado === 'cancelada') return false
        const cDate = c.fecha_inicio.slice(0, 10)
        return cDate === fechaTarget
      })
      .map((c) => {
        const startMin = parseTimeToMinutes(c.fecha_inicio)
        let endMin = parseTimeToMinutes(c.fecha_fin)
        if (startMin !== null && endMin === null) {
          endMin = startMin + (c.servicio?.duracion_base_min || 30)
        }
        return { startMin, endMin }
      })
      .filter((c): c is { startMin: number; endMin: number } => c.startMin !== null && c.endMin !== null)

    // Horario laboral: 09:00 (540 min) a 18:00 (1080 min), con slots de inicio cada 30 min
    const OPENING_MIN = 9 * 60 // 09:00
    const CLOSING_MIN = 18 * 60 // 18:00
    const STEP_MIN = 30

    const slots: SlotDisponible[] = []

    for (let slotStart = OPENING_MIN; slotStart < CLOSING_MIN; slotStart += STEP_MIN) {
      const slotEnd = slotStart + duracionMin

      // Si el slot excede el horario de cierre laboral, no está disponible
      let disponible = slotEnd <= CLOSING_MIN

      // Verificar solapamiento con cualquier cita activa existente:
      // startA < endB && endA > startB
      if (disponible) {
        const haySolapamiento = citasDelDia.some(
          (cita) => slotStart < cita.endMin && slotEnd > cita.startMin
        )
        if (haySolapamiento) {
          disponible = false
        }
      }

      slots.push({
        hora_inicio: formatMinutesToTime(slotStart),
        hora_fin: formatMinutesToTime(slotEnd),
        disponible,
      })
    }

    return { success: true, data: slots }
  }
}
