import {
  Cita,
  Empleado,
  Servicio,
  Recurso,
  BloqueoHorario,
  ExcepcionHorario,
  SlotDisponible,
  ConflictoReserva,
  Recurrencia,
  ItemListaEspera,
} from '@/types'

/**
 * Convierte una cadena de hora "HH:mm" a minutos desde las 00:00.
 */
export function timeToMinutes(timeStr: string): number {
  if (!timeStr) return 0
  const parts = timeStr.trim().split(':')
  const h = parseInt(parts[0], 10) || 0
  const m = parseInt(parts[1], 10) || 0
  return h * 60 + m
}

/**
 * Convierte minutos desde las 00:00 a formato "HH:mm".
 */
export function minutesToTime(totalMinutes: number): string {
  const normalized = Math.max(0, Math.min(23 * 60 + 59, Math.round(totalMinutes)))
  const h = Math.floor(normalized / 60)
  const m = normalized % 60
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}

/**
 * Extrae la fecha (YYYY-MM-DD) y minutos de inicio/fin de una cadena de fecha/hora.
 */
export function parseDateTimeToMinutes(dateTimeStr: string): {
  date: string
  time: string
  minutes: number
} {
  if (!dateTimeStr) {
    return { date: '', time: '00:00', minutes: 0 }
  }

  const normalized = dateTimeStr.includes(' ') ? dateTimeStr.replace(' ', 'T') : dateTimeStr
  const parsedDate = new Date(normalized)

  if (!Number.isNaN(parsedDate.getTime())) {
    const y = parsedDate.getFullYear()
    const m = String(parsedDate.getMonth() + 1).padStart(2, '0')
    const d = String(parsedDate.getDate()).padStart(2, '0')
    const hh = String(parsedDate.getHours()).padStart(2, '0')
    const mm = String(parsedDate.getMinutes()).padStart(2, '0')
    const date = `${y}-${m}-${d}`
    const time = `${hh}:${mm}`
    return { date, time, minutes: parsedDate.getHours() * 60 + parsedDate.getMinutes() }
  }

  const parts = dateTimeStr.split(/[\sT]+/)
  const date = parts[0] || ''
  const time = parts[1] ? parts[1].slice(0, 5) : '00:00'
  return { date, time, minutes: timeToMinutes(time) }
}

/**
 * Verifica si dos intervalos de tiempo se solapan: [startA, endA) y [startB, endB).
 */
export function seSolapanIntervalos(
  startA: number,
  endA: number,
  startB: number,
  endB: number
): boolean {
  return startA < endB && endA > startB
}

/**
 * Estados de cita que ocupan tiempo y recursos.
 */
export const ESTADOS_OCUPANTES = new Set(['pendiente', 'confirmada', 'en_cola', 'en_atencion'])

export interface VerificarConflictoParams {
  fechaInicio: string // "YYYY-MM-DD HH:mm" o ISO
  fechaFin: string
  empleadoId?: number
  servicioId?: number
  recursoId?: number
  excluirCitaId?: number
  citas: Cita[]
  recursos?: Recurso[]
  bloqueos?: BloqueoHorario[]
  excepciones?: ExcepcionHorario[]
  empleados?: Empleado[]
  servicios?: Servicio[]
  ignorarHorarioLaboral?: boolean
}

/**
 * Validador estricto de conflictos para reservas.
 * Evita doble reserva de empleados o recursos, y verifica pausas, feriados y ausencias.
 */
export function verificarConflictoCita({
  fechaInicio,
  fechaFin,
  empleadoId,
  servicioId,
  recursoId,
  excluirCitaId,
  citas,
  recursos = [],
  bloqueos = [],
  excepciones = [],
  empleados = [],
  servicios = [],
  ignorarHorarioLaboral = false,
}: VerificarConflictoParams): ConflictoReserva {
  const parsedInicio = parseDateTimeToMinutes(fechaInicio)
  const parsedFin = parseDateTimeToMinutes(fechaFin)
  const fecha = parsedInicio.date
  const slotStart = parsedInicio.minutes
  const slotEnd = parsedFin.minutes

  if (!fecha || slotEnd <= slotStart) {
    return {
      hayConflicto: true,
      motivo: 'fuera_de_horario',
      mensaje: 'El horario seleccionado no es válido (inicio posterior al fin o fecha vacía).',
    }
  }

  // 1. Obtener servicio y buffers
  const servicio = servicios.find((s) => s.id === servicioId)
  const bufferAntes = servicio?.buffer_antes_min || 0
  const bufferDespues = servicio?.buffer_despues_min || 0

  const reqEffectiveStart = slotStart - bufferAntes
  const reqEffectiveEnd = slotEnd + bufferDespues

  // 2. Verificar Feriados o Bloqueos Generales / por Empleado / por Recurso
  for (const b of bloqueos) {
    const bInicio = parseDateTimeToMinutes(b.fecha_inicio)
    const bFin = parseDateTimeToMinutes(b.fecha_fin)

    if (bInicio.date > fecha || bFin.date < fecha) continue

    const aplicaAEmpleado = !b.empleado_id || (empleadoId && b.empleado_id === empleadoId)
    const aplicaARecurso = !b.recurso_id || (recursoId && b.recurso_id === recursoId)

    if (aplicaAEmpleado || aplicaARecurso) {
      if (b.todo_el_dia) {
        return {
          hayConflicto: true,
          motivo: b.tipo === 'feriado' ? 'feriado' : 'bloqueo_horario',
          mensaje: `Fecha bloqueada por ${b.tipo.toUpperCase()}: ${b.titulo || b.motivo || 'No disponible'}`,
          detalles: { bloqueoId: b.id },
        }
      }

      const bStartMin = bInicio.date === fecha ? bInicio.minutes : 0
      const bEndMin = bFin.date === fecha ? bFin.minutes : 24 * 60

      if (seSolapanIntervalos(slotStart, slotEnd, bStartMin, bEndMin)) {
        return {
          hayConflicto: true,
          motivo: b.tipo === 'feriado' ? 'feriado' : 'bloqueo_horario',
          mensaje: `Horario bloqueado: ${b.titulo} (${b.motivo || 'Bloqueo programado'})`,
          detalles: { bloqueoId: b.id },
        }
      }
    }
  }

  // 3. Verificar Empleado (Días libres, Horario laboral, Pausas)
  if (empleadoId) {
    const empleado = empleados.find((e) => e.id === empleadoId)

    if (empleado) {
      if (empleado.dias_libres?.some((d) => d.fecha === fecha)) {
        const diaLibre = empleado.dias_libres.find((d) => d.fecha === fecha)
        return {
          hayConflicto: true,
          motivo: 'dia_libre',
          mensaje: `${empleado.nombre} tiene día libre / vacaciones (${diaLibre?.motivo || 'Ausencia autorizada'}).`,
          detalles: { empleadoNombre: empleado.nombre },
        }
      }

      if (!ignorarHorarioLaboral) {
        const excepcion = excepciones.find(
          (ex) => ex.fecha === fecha && (!ex.empleado_id || ex.empleado_id === empleadoId)
        )

        if (excepcion) {
          if (excepcion.cerrado) {
            return {
              hayConflicto: true,
              motivo: 'fuera_de_horario',
              mensaje: `Horario especial cerrado en esta fecha (${excepcion.motivo || 'Cerrado'}).`,
            }
          }
          const exStart = timeToMinutes(excepcion.hora_inicio || '00:00')
          const exEnd = timeToMinutes(excepcion.hora_fin || '23:59')
          if (slotStart < exStart || slotEnd > exEnd) {
            return {
              hayConflicto: true,
              motivo: 'fuera_de_horario',
              mensaje: `El horario excede la jornada especial (${excepcion.hora_inicio || '00:00'} a ${excepcion.hora_fin || '23:59'}).`,
            }
          }
        } else {
          const dObj = new Date(fecha + 'T12:00:00')
          const diaSemana = dObj.getDay() as 0 | 1 | 2 | 3 | 4 | 5 | 6

          const horarioDia = empleado.horarios?.find((h) => h.dia_semana === diaSemana && h.activo)

          if (empleado.horarios && empleado.horarios.length > 0 && !horarioDia) {
            return {
              hayConflicto: true,
              motivo: 'fuera_de_horario',
              mensaje: `${empleado.nombre} no atiende en este día de la semana.`,
              detalles: { empleadoNombre: empleado.nombre },
            }
          }

          const openingMin = horarioDia ? timeToMinutes(horarioDia.hora_inicio) : 9 * 60
          const closingMin = horarioDia ? timeToMinutes(horarioDia.hora_fin) : 18 * 60

          if (slotStart < openingMin || slotEnd > closingMin) {
            return {
              hayConflicto: true,
              motivo: 'fuera_de_horario',
              mensaje: `El horario solicitado (${minutesToTime(slotStart)} - ${minutesToTime(
                slotEnd
              )}) está fuera de la jornada (${minutesToTime(openingMin)} - ${minutesToTime(
                closingMin
              )}).`,
              detalles: { empleadoNombre: empleado.nombre },
            }
          }

          if (horarioDia?.pausas && horarioDia.pausas.length > 0) {
            for (const pausa of horarioDia.pausas) {
              const pausaStart = timeToMinutes(pausa.hora_inicio)
              const pausaEnd = timeToMinutes(pausa.hora_fin)

              if (seSolapanIntervalos(slotStart, slotEnd, pausaStart, pausaEnd)) {
                return {
                  hayConflicto: true,
                  motivo: 'pausa_laboral',
                  mensaje: `${empleado.nombre} está en descanso / pausa laboral (${pausa.nombre || 'Almuerzo'} de ${pausa.hora_inicio} a ${pausa.hora_fin}).`,
                  detalles: { empleadoNombre: empleado.nombre },
                }
              }
            }
          }
        }
      }
    }

    for (const c of citas) {
      if (excluirCitaId && c.id === excluirCitaId) continue
      if (!ESTADOS_OCUPANTES.has(c.estado)) continue
      if (c.empleado_id !== empleadoId) continue

      const cInicio = parseDateTimeToMinutes(c.fecha_inicio)
      const cFin = parseDateTimeToMinutes(c.fecha_fin)
      if (cInicio.date !== fecha) continue

      const cBufAntes = c.servicio?.buffer_antes_min || 0
      const cBufDesp = c.servicio?.buffer_despues_min || 0

      const cEffStart = cInicio.minutes - cBufAntes
      const cEffEnd = cFin.minutes + cBufDesp

      if (seSolapanIntervalos(reqEffectiveStart, reqEffectiveEnd, cEffStart, cEffEnd)) {
        return {
          hayConflicto: true,
          motivo: 'empleado_ocupado',
          mensaje: `El profesional ya tiene una cita asignada en ese horario (${cInicio.time} - ${cFin.time}) con buffers de preparación.`,
          detalles: {
            citaConflictivaId: c.id,
            empleadoNombre: c.empleado?.nombre,
          },
        }
      }
    }
  }

  // 5. Verificar Recursos Físicos y Capacidad
  if (recursoId) {
    const recurso = recursos.find((r) => r.id === recursoId)

    if (recurso) {
      if (!recurso.activo || recurso.estado === 'inactivo' || recurso.estado === 'mantenimiento') {
        return {
          hayConflicto: true,
          motivo: 'recurso_ocupado',
          mensaje: `El recurso '${recurso.nombre}' se encuentra en estado '${recurso.estado}' o inactivo.`,
          detalles: { recursoNombre: recurso.nombre },
        }
      }

      const citasConRecurso = citas.filter((c) => {
        if (excluirCitaId && c.id === excluirCitaId) return false
        if (!ESTADOS_OCUPANTES.has(c.estado)) return false
        if (c.recurso_id !== recursoId) return false

        const cInicio = parseDateTimeToMinutes(c.fecha_inicio)
        const cFin = parseDateTimeToMinutes(c.fecha_fin)
        if (cInicio.date !== fecha) return false

        const cBufAntes = c.servicio?.buffer_antes_min || 0
        const cBufDesp = c.servicio?.buffer_despues_min || 0

        return seSolapanIntervalos(
          reqEffectiveStart,
          reqEffectiveEnd,
          cInicio.minutes - cBufAntes,
          cFin.minutes + cBufDesp
        )
      })

      const capacidadMaxima = Math.max(1, recurso.capacidad || 1)
      if (citasConRecurso.length >= capacidadMaxima) {
        return {
          hayConflicto: true,
          motivo: 'recurso_ocupado',
          mensaje: `El recurso '${recurso.nombre}' alcanzó su capacidad máxima (${citasConRecurso.length}/${capacidadMaxima}) para este horario.`,
          detalles: {
            recursoNombre: recurso.nombre,
            citaConflictivaId: citasConRecurso[0]?.id,
          },
        }
      }
    }
  }

  return { hayConflicto: false }
}

export interface CalcularDisponibilidadParams {
  fecha: string
  empleadoId?: number
  servicioId?: number
  duracionSolicitadaMin?: number
  recursoId?: number
  empleados?: Empleado[]
  servicios?: Servicio[]
  citas?: Cita[]
  recursos?: Recurso[]
  bloqueos?: BloqueoHorario[]
  excepciones?: ExcepcionHorario[]
  intervaloMin?: number
  horaAperturaPorDefecto?: string
  horaCierrePorDefecto?: string
}

export function calcularDisponibilidad({
  fecha,
  empleadoId,
  servicioId,
  duracionSolicitadaMin,
  recursoId,
  empleados = [],
  servicios = [],
  citas = [],
  recursos = [],
  bloqueos = [],
  excepciones = [],
  intervaloMin = 30,
  horaAperturaPorDefecto = '09:00',
  horaCierrePorDefecto = '18:00',
}: CalcularDisponibilidadParams): SlotDisponible[] {
  if (!fecha) return []

  const fechaTarget = fecha.slice(0, 10)

  const servicio = servicios.find((s) => s.id === servicioId)
  const duracion =
    duracionSolicitadaMin && duracionSolicitadaMin > 0
      ? duracionSolicitadaMin
      : servicio?.duracion_base_min || 30

  let openingMin = timeToMinutes(horaAperturaPorDefecto)
  let closingMin = timeToMinutes(horaCierrePorDefecto)

  const empleado = empleados.find((e) => e.id === empleadoId)

  const excepcion = excepciones.find(
    (ex) => ex.fecha === fechaTarget && (!ex.empleado_id || ex.empleado_id === empleadoId)
  )

  if (excepcion) {
    if (excepcion.cerrado) {
      return []
    }
    openingMin = timeToMinutes(excepcion.hora_inicio || horaAperturaPorDefecto)
    closingMin = timeToMinutes(excepcion.hora_fin || horaCierrePorDefecto)
  } else if (empleado?.horarios && empleado.horarios.length > 0) {
    const dObj = new Date(fechaTarget + 'T12:00:00')
    const diaSemana = dObj.getDay() as 0 | 1 | 2 | 3 | 4 | 5 | 6
    const horarioDia = empleado.horarios.find((h) => h.dia_semana === diaSemana && h.activo)
    if (!horarioDia) {
      return []
    }
    openingMin = timeToMinutes(horarioDia.hora_inicio)
    closingMin = timeToMinutes(horarioDia.hora_fin)
  }

  const slots: SlotDisponible[] = []
  const step = Math.max(15, intervaloMin)

  for (let slotStart = openingMin; slotStart + duracion <= closingMin; slotStart += step) {
    const slotEnd = slotStart + duracion
    const horaInicioStr = minutesToTime(slotStart)
    const horaFinStr = minutesToTime(slotEnd)

    const fechaInicioSlot = `${fechaTarget} ${horaInicioStr}`
    const fechaFinSlot = `${fechaTarget} ${horaFinStr}`

    const conflicto = verificarConflictoCita({
      fechaInicio: fechaInicioSlot,
      fechaFin: fechaFinSlot,
      empleadoId,
      servicioId,
      recursoId,
      citas,
      recursos,
      bloqueos,
      excepciones,
      empleados,
      servicios,
    })

    slots.push({
      hora_inicio: horaInicioStr,
      hora_fin: horaFinStr,
      disponible: !conflicto.hayConflicto,
      motivo_no_disponible: conflicto.hayConflicto ? conflicto.mensaje : undefined,
      recurso_id: recursoId,
    })
  }

  return slots
}

export interface GenerarRecurrentesParams {
  citaBase: Partial<Cita>
  recurrencia: Recurrencia
  citasExistentes: Cita[]
  recursos?: Recurso[]
  bloqueos?: BloqueoHorario[]
  excepciones?: ExcepcionHorario[]
  empleados?: Empleado[]
  servicios?: Servicio[]
}

export function generarCitasRecurrentes({
  citaBase,
  recurrencia,
  citasExistentes,
  recursos = [],
  bloqueos = [],
  excepciones = [],
  empleados = [],
  servicios = [],
}: GenerarRecurrentesParams): {
  citasGeneradas: Partial<Cita>[]
  conflictosDetectados: { fecha: string; motivo: string }[]
} {
  const citasGeneradas: Partial<Cita>[] = []
  const conflictosDetectados: { fecha: string; motivo: string }[] = []

  if (!citaBase.fecha_inicio || !citaBase.fecha_fin) {
    return { citasGeneradas, conflictosDetectados }
  }

  const MAX_REPETICIONES_SEGURAS = 24
  const numRepeticiones = Math.min(
    recurrencia.max_repeticiones && recurrencia.max_repeticiones > 0
      ? recurrencia.max_repeticiones
      : 12,
    MAX_REPETICIONES_SEGURAS
  )
  const intervalo = Math.max(1, recurrencia.intervalo || 1)

  const fechaFinLimite = recurrencia.fecha_fin
    ? new Date(recurrencia.fecha_fin + 'T23:59:59')
    : new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)

  const duracionMin =
    parseDateTimeToMinutes(citaBase.fecha_fin).minutes -
    parseDateTimeToMinutes(citaBase.fecha_inicio).minutes

  const baseStart = new Date(
    citaBase.fecha_inicio.includes(' ')
      ? citaBase.fecha_inicio.replace(' ', 'T')
      : citaBase.fecha_inicio
  )

  const timePartInicio = citaBase.fecha_inicio.includes(' ')
    ? citaBase.fecha_inicio.split(' ')[1]
    : citaBase.fecha_inicio.slice(11, 16)

  let instanciaActual = 1
  const currentDate = new Date(baseStart)

  while (instanciaActual <= numRepeticiones) {
    switch (recurrencia.tipo) {
      case 'diaria':
        currentDate.setDate(currentDate.getDate() + intervalo)
        break
      case 'semanal':
        currentDate.setDate(currentDate.getDate() + 7 * intervalo)
        break
      case 'mensual':
        currentDate.setMonth(currentDate.getMonth() + intervalo)
        break
      case 'anual':
        currentDate.setFullYear(currentDate.getFullYear() + intervalo)
        break
    }

    if (currentDate.getTime() > fechaFinLimite.getTime()) {
      break
    }

    const y = currentDate.getFullYear()
    const m = String(currentDate.getMonth() + 1).padStart(2, '0')
    const d = String(currentDate.getDate()).padStart(2, '0')
    const nuevaFechaStr = `${y}-${m}-${d}`

    const startMin = timeToMinutes(timePartInicio)
    const endMin = startMin + (duracionMin > 0 ? duracionMin : 30)

    const nuevaFechaInicio = `${nuevaFechaStr} ${minutesToTime(startMin)}`
    const nuevaFechaFin = `${nuevaFechaStr} ${minutesToTime(endMin)}`

    const conflicto = verificarConflictoCita({
      fechaInicio: nuevaFechaInicio,
      fechaFin: nuevaFechaFin,
      empleadoId: citaBase.empleado_id,
      servicioId: citaBase.servicio_id,
      recursoId: citaBase.recurso_id,
      citas: [...citasExistentes, ...(citasGeneradas as Cita[])],
      recursos,
      bloqueos,
      excepciones,
      empleados,
      servicios,
    })

    if (conflicto.hayConflicto) {
      conflictosDetectados.push({
        fecha: nuevaFechaInicio,
        motivo: conflicto.mensaje || 'Conflicto de horario o recurso',
      })
    } else {
      citasGeneradas.push({
        ...citaBase,
        fecha_inicio: nuevaFechaInicio,
        fecha_fin: nuevaFechaFin,
        recurrencia_id: recurrencia.id,
        created_at: new Date().toISOString(),
      })
    }

    instanciaActual++
  }

  return { citasGeneradas, conflictosDetectados }
}

export function buscarCandidatosListaEspera({
  citaLiberada,
  itemsLista,
  citasExistentes,
  recursos = [],
  bloqueos = [],
  excepciones = [],
  empleados = [],
  servicios = [],
}: {
  citaLiberada: Cita
  itemsLista: ItemListaEspera[]
  citasExistentes: Cita[]
  recursos?: Recurso[]
  bloqueos?: BloqueoHorario[]
  excepciones?: ExcepcionHorario[]
  empleados?: Empleado[]
  servicios?: Servicio[]
}): ItemListaEspera[] {
  const parsedLiberada = parseDateTimeToMinutes(citaLiberada.fecha_inicio)
  const fechaTarget = parsedLiberada.date

  const candidatos = itemsLista.filter((item) => {
    if (item.estado !== 'en_espera') return false
    if (item.fecha_deseada !== fechaTarget) return false

    if (item.servicio_id && item.servicio_id !== citaLiberada.servicio_id) {
      return false
    }

    if (item.empleado_id && item.empleado_id !== citaLiberada.empleado_id) {
      return false
    }

    return true
  })

  return candidatos.filter((candidato) => {
    const duracion = candidato.servicio?.duracion_base_min || citaLiberada.servicio?.duracion_base_min || 30
    const startMin = parsedLiberada.minutes
    const endMin = startMin + duracion

    const slotInicio = `${fechaTarget} ${minutesToTime(startMin)}`
    const slotFin = `${fechaTarget} ${minutesToTime(endMin)}`

    const conflicto = verificarConflictoCita({
      fechaInicio: slotInicio,
      fechaFin: slotFin,
      empleadoId: candidato.empleado_id || citaLiberada.empleado_id,
      servicioId: candidato.servicio_id,
      recursoId: citaLiberada.recurso_id,
      excluirCitaId: citaLiberada.id,
      citas: citasExistentes,
      recursos,
      bloqueos,
      excepciones,
      empleados,
      servicios,
    })

    return !conflicto.hayConflicto
  })
}
