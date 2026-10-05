import { TurnoCola, EstadoTurnoCola, Cita, ApiResponse } from '@/types'
import { LocalStorageAdapter } from '@/repositories/local/LocalStorageAdapter'
import { citasService } from './citas.service'

const SEED_TURNOS: TurnoCola[] = [
  {
    id: 1,
    codigo_turno: 'W-01',
    cliente_nombre: 'Mariana López',
    cliente_telefono: '+1 555-4422',
    servicio_id: 1,
    servicio_nombre: 'Consulta General',
    empleado_id: 1,
    empleado_nombre: 'Dr. Carlos Pérez',
    recurso_id: 1,
    recurso_nombre: 'Consultorio Médico 1',
    hora_llegada: new Date(Date.now() - 25 * 60000).toISOString(),
    estado: 'en_espera',
    notas: 'Paciente sin cita previa, dolor leve de cabeza',
  },
]

export const colaService = {
  getCola: async (fecha?: string): Promise<ApiResponse<TurnoCola[]>> => {
    const list = LocalStorageAdapter.getCollection<TurnoCola>('turnos_cola', SEED_TURNOS)
    if (fecha) {
      const fechaStr = fecha.slice(0, 10)
      const filtrados = list.filter((t) => t.hora_llegada.startsWith(fechaStr))
      return { success: true, message: 'OK', data: filtrados }
    }
    return { success: true, message: 'OK', data: list }
  },

  registrarWalkIn: async (data: {
    cliente_nombre: string
    cliente_telefono?: string
    cliente_id?: number
    servicio_id: number
    servicio_nombre: string
    empleado_id?: number
    empleado_nombre?: string
    recurso_id?: number
    recurso_nombre?: string
    notas?: string
  }): Promise<ApiResponse<TurnoCola>> => {
    const hoy = new Date().toISOString().slice(0, 10)
    const turnosHoy = LocalStorageAdapter.getCollection<TurnoCola>('turnos_cola', SEED_TURNOS).filter(
      (t) => t.hora_llegada.startsWith(hoy)
    )

    const correlativo = turnosHoy.length + 1
    const codigo_turno = `W-${String(correlativo).padStart(2, '0')}`
    const hora_llegada = new Date().toISOString()

    const nuevoTurno = LocalStorageAdapter.insert<TurnoCola>('turnos_cola', {
      codigo_turno,
      cliente_nombre: data.cliente_nombre,
      cliente_telefono: data.cliente_telefono,
      cliente_id: data.cliente_id,
      servicio_id: data.servicio_id,
      servicio_nombre: data.servicio_nombre,
      empleado_id: data.empleado_id,
      empleado_nombre: data.empleado_nombre,
      recurso_id: data.recurso_id,
      recurso_nombre: data.recurso_nombre,
      hora_llegada,
      estado: 'en_espera' as EstadoTurnoCola,
      notas: data.notas,
    } as TurnoCola)

    try {
      const resCita = await citasService.create({
        cliente_id: data.cliente_id || 1,
        cliente: {
          id: data.cliente_id || 1,
          nombre: data.cliente_nombre,
          email: `${data.cliente_nombre.toLowerCase().replace(/\s+/g, '.')}@walkin.local`,
          telefono: data.cliente_telefono,
          total_citas: 1,
          created_at: hora_llegada,
        },
        empleado_id: data.empleado_id || 1,
        servicio_id: data.servicio_id,
        recurso_id: data.recurso_id,
        fecha_inicio: hora_llegada.replace('T', ' ').slice(0, 16),
        fecha_fin: new Date(Date.now() + 30 * 60000).toISOString().replace('T', ' ').slice(0, 16),
        estado: 'en_cola',
        precio_total: 0,
        es_walk_in: true,
        hora_llegada_cola: hora_llegada,
        notas: `[Turno Walk-In: ${codigo_turno}] ${data.notas || ''}`,
      })

      if (resCita.data) {
        nuevoTurno.cita_id = resCita.data.id
        LocalStorageAdapter.update<TurnoCola>('turnos_cola', nuevoTurno.id, {
          cita_id: resCita.data.id,
        })
      }
    } catch (e) {
      console.warn('Error al vincular cita de walk-in:', e)
    }

    return { success: true, message: `Turno ${codigo_turno} emitido con éxito`, data: nuevoTurno }
  },

  llamarTurno: async (id: number): Promise<ApiResponse<TurnoCola>> => {
    const updated = LocalStorageAdapter.update<TurnoCola>('turnos_cola', id, {
      estado: 'llamado',
    })
    if (!updated) throw new Error('Turno no encontrado')
    return { success: true, message: `Turno ${updated.codigo_turno} llamado`, data: updated }
  },

  iniciarAtencion: async (
    id: number,
    empleado_id?: number,
    empleado_nombre?: string,
    recurso_id?: number,
    recurso_nombre?: string
  ): Promise<ApiResponse<TurnoCola>> => {
    const nowIso = new Date().toISOString()
    const cambiosTurno: Partial<TurnoCola> = {
      estado: 'en_atencion',
      hora_estimada_inicio: nowIso,
    }
    if (empleado_id) {
      cambiosTurno.empleado_id = empleado_id
      cambiosTurno.empleado_nombre = empleado_nombre
    }
    if (recurso_id) {
      cambiosTurno.recurso_id = recurso_id
      cambiosTurno.recurso_nombre = recurso_nombre
    }

    const updated = LocalStorageAdapter.update<TurnoCola>('turnos_cola', id, cambiosTurno)
    if (!updated) throw new Error('Turno no encontrado')

    if (updated.cita_id) {
      const cambiosCita: Partial<Cita> = {
        estado: 'en_atencion',
        hora_inicio_atencion: nowIso,
      }
      if (empleado_id) cambiosCita.empleado_id = empleado_id
      if (recurso_id) cambiosCita.recurso_id = recurso_id
      await citasService.update(updated.cita_id, cambiosCita)
    }

    return { success: true, message: `Atención del turno ${updated.codigo_turno} iniciada`, data: updated }
  },

  completarAtencion: async (id: number): Promise<ApiResponse<TurnoCola>> => {
    const updated = LocalStorageAdapter.update<TurnoCola>('turnos_cola', id, {
      estado: 'completado',
    })
    if (!updated) throw new Error('Turno no encontrado')

    if (updated.cita_id) {
      await citasService.update(updated.cita_id, {
        estado: 'completada',
        hora_fin_atencion: new Date().toISOString(),
      })
    }

    return { success: true, message: `Turno ${updated.codigo_turno} completado`, data: updated }
  },

  cancelarTurno: async (id: number, motivo?: string): Promise<ApiResponse<TurnoCola>> => {
    const updated = LocalStorageAdapter.update<TurnoCola>('turnos_cola', id, {
      estado: 'cancelado',
      notas: motivo ? `Cancelado: ${motivo}` : undefined,
    })
    if (!updated) throw new Error('Turno no encontrado')

    if (updated.cita_id) {
      await citasService.cancel(updated.cita_id)
    }

    return { success: true, message: `Turno cancelado`, data: updated }
  },

  marcarNoShow: async (id: number): Promise<ApiResponse<TurnoCola>> => {
    const updated = LocalStorageAdapter.update<TurnoCola>('turnos_cola', id, {
      estado: 'no_asistio',
    })
    if (!updated) throw new Error('Turno no encontrado')

    if (updated.cita_id) {
      await citasService.update(updated.cita_id, { estado: 'no_asistio' })
    }

    return { success: true, message: `Turno marcado como No asistió`, data: updated }
  },
}
