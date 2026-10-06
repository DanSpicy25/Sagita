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
  const normalized = str.includes(' ') ? str.replace(' ', 'T') : str
  const parsedDate = new Date(normalized)
  if (!Number.isNaN(parsedDate.getTime())) {
    return parsedDate.getHours() * 60 + parsedDate.getMinutes()
  }
  const timePart = str.includes(' ') ? str.split(' ')[1] : str.includes('T') ? str.split('T')[1] : str
  if (!timePart) return null
  const [hStr, mStr] = timePart.split(':')
  const h = parseInt(hStr, 10)
  const m = parseInt(mStr, 10)
  if (isNaN(h) || isNaN(m)) return null
  return h * 60 + m
}

function parseTimestamp(str?: string): number | null {
  if (!str) return null
  const normalized = str.includes(' ') ? str.replace(' ', 'T') : str
  const d = new Date(normalized)
  return Number.isNaN(d.getTime()) ? null : d.getTime()
}

function formatMinutesToTime(totalMin: number): string {
  const h = Math.floor(totalMin / 60)
  const m = totalMin % 60
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}

export class LocalAppointmentRepository implements IAppointmentRepository {
  private collection = 'citas'

  private verificarColisiones(
    nuevaCita: Partial<Cita>,
    ignorarCitaId?: number
  ): void {
    const startMs = parseTimestamp(nuevaCita.fecha_inicio)
    const endMs = parseTimestamp(nuevaCita.fecha_fin)
    if (!startMs || !endMs) return

    const citas = LocalStorageAdapter.getCollection<Cita>(this.collection, SEED_CITAS)

    for (const c of citas) {
      if (ignorarCitaId && c.id === ignorarCitaId) continue
      if (c.estado === 'cancelada') continue

      const cStartMs = parseTimestamp(c.fecha_inicio)
      const cEndMs = parseTimestamp(c.fecha_fin)
      if (!cStartMs || !cEndMs) continue

      // Verifica si hay solapamiento temporal (startA < endB && endA > startB)
      if (startMs < cEndMs && endMs > cStartMs) {
        // 1. Conflicto de Especialista / Empleado
        if (nuevaCita.empleado_id && c.empleado_id === nuevaCita.empleado_id) {
          throw new Error(
            `Conflicto de horario: El profesional ya tiene una cita agendada entre ${c.fecha_inicio} y ${c.fecha_fin}.`
          )
        }
        // 2. Conflicto de Recurso Físico (Cabina / Sala / Box)
        if (
          nuevaCita.recurso_id &&
          c.recurso_id &&
          c.recurso_id === nuevaCita.recurso_id
        ) {
          throw new Error(
            `Conflicto de recurso: La cabina/sala seleccionada ya se encuentra ocupada entre ${c.fecha_inicio} y ${c.fecha_fin}.`
          )
        }
      }
    }
  }

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
    this.verificarColisiones(data)
    const created = LocalStorageAdapter.insert<Cita>(this.collection, {
      ...data,
      created_at: new Date().toISOString(),
    } as Cita)
    return { success: true, message: 'Cita creada exitosamente', data: created }
  }

  async update(id: number, data: Partial<Cita>): Promise<ApiResponse<Cita>> {
    const list = LocalStorageAdapter.getCollection<Cita>(this.collection, SEED_CITAS)
    const citaActual = list.find((c) => c.id === id)
    if (!citaActual) throw new Error('Cita no encontrada para actualizar')

    if (data.fecha_inicio || data.fecha_fin || data.empleado_id || data.recurso_id) {
      this.verificarColisiones(
        {
          ...citaActual,
          ...data,
        },
        id
      )
    }

    const updated = LocalStorageAdapter.update<Cita>(this.collection, id, data)
    if (!updated) throw new Error('Cita no encontrada para actualizar')
    return { success: true, message: 'Cita actualizada exitosamente', data: updated }
  }

  async reprogramar(
    id: number,
    nuevaFechaInicio: string,
    nuevaFechaFin: string,
    nuevoRecursoId?: number
  ): Promise<ApiResponse<Cita>> {
    const list = LocalStorageAdapter.getCollection<Cita>(this.collection, SEED_CITAS)
    const citaActual = list.find((c) => c.id === id)
    if (!citaActual) throw new Error('Cita no encontrada para reprogramar')

    this.verificarColisiones(
      {
        ...citaActual,
        fecha_inicio: nuevaFechaInicio,
        fecha_fin: nuevaFechaFin,
        recurso_id: nuevoRecursoId ?? citaActual.recurso_id,
      },
      id
    )

    const updated = LocalStorageAdapter.update<Cita>(this.collection, id, {
      fecha_inicio: nuevaFechaInicio,
      fecha_fin: nuevaFechaFin,
      recurso_id: nuevoRecursoId ?? citaActual.recurso_id,
      estado: 'confirmada',
    })
    if (!updated) throw new Error('No se pudo reprogramar la cita')
    return { success: true, message: 'Cita reprogramada exitosamente', data: updated }
  }

  async cancel(id: number): Promise<ApiResponse<void>> {
    LocalStorageAdapter.update<Cita>(this.collection, id, { estado: 'cancelada' })
    return { success: true, message: 'Cita cancelada' }
  }

  async getDisponibilidad(
    empleadoId: number,
    fecha: string,
    servicioId?: number,
    duracionSolicitadaMin?: number,
    recursoId?: number
  ): Promise<{ success: boolean; data?: SlotDisponible[] }> {
    if (!fecha) {
      return { success: false, data: [] }
    }

    const fechaTarget = fecha.slice(0, 10)

    // Determinar la duración del servicio si fue provisto (default: 30 minutos)
    let duracionMin = duracionSolicitadaMin && duracionSolicitadaMin > 0 ? duracionSolicitadaMin : 30
    if (servicioId) {
      try {
        const servicios = LocalStorageAdapter.getCollection<{ id: number; duracion_base_min?: number }>(
          'servicios',
          []
        )
        const serv = servicios.find((s) => s.id === servicioId)
        if (
          !duracionSolicitadaMin &&
          serv &&
          serv.duracion_base_min &&
          serv.duracion_base_min > 0
        ) {
          duracionMin = serv.duracion_base_min
        }
      } catch {
        duracionMin = 30
      }
    }

    const citas = LocalStorageAdapter.getCollection<Cita>(this.collection, SEED_CITAS)

    // Citas activas para ese empleado o recurso en ese día
    const citasDelDia = citas
      .filter((c) => {
        if (c.estado === 'cancelada') return false
        const coincideEmpleado = c.empleado_id === empleadoId
        const coincideRecurso = Boolean(recursoId && c.recurso_id === recursoId)
        if (!coincideEmpleado && !coincideRecurso) return false

        const normalized = c.fecha_inicio.includes(' ')
          ? c.fecha_inicio.replace(' ', 'T')
          : c.fecha_inicio
        const localDate = new Date(normalized)
        const cDate = Number.isNaN(localDate.getTime())
          ? c.fecha_inicio.slice(0, 10)
          : [
              localDate.getFullYear(),
              String(localDate.getMonth() + 1).padStart(2, '0'),
              String(localDate.getDate()).padStart(2, '0'),
            ].join('-')
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

