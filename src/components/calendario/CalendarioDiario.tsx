import { useState, useMemo, useEffect } from 'react'
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  CheckCircle2,
  Sparkles,
} from 'lucide-react'
import { Cita, Empleado } from '@/types'
import { Badge, Button } from '@/components/ui'
import { CitaBlock } from './CitaBlock'

export interface CalendarioDiarioProps {
  citas: Cita[]
  empleados?: Empleado[]
  fechaInicial?: Date
  onSeleccionarCita?: (cita: Cita) => void
  onLongPressCita?: (cita: Cita) => void
  onCrearCitaEnFecha?: (fechaIso: string, horaStr?: string) => void
}

export function CalendarioDiario({
  citas,
  empleados = [],
  fechaInicial,
  onSeleccionarCita,
  onLongPressCita,
  onCrearCitaEnFecha,
}: CalendarioDiarioProps) {
  const [fechaActual, setFechaActual] = useState<Date>(() => fechaInicial || new Date())
  const [ahora, setAhora] = useState<Date>(new Date())

  // Actualizar indicador de hora actual cada 60s
  useEffect(() => {
    const timer = setInterval(() => setAhora(new Date()), 60000)
    return () => clearInterval(timer)
  }, [])

  const cambiarDia = (offset: number) => {
    const nueva = new Date(fechaActual)
    nueva.setDate(nueva.getDate() + offset)
    setFechaActual(nueva)
  }

  const irAHoy = () => {
    setFechaActual(new Date())
  }

  const anio = fechaActual.getFullYear()
  const mes = String(fechaActual.getMonth() + 1).padStart(2, '0')
  const dia = String(fechaActual.getDate()).padStart(2, '0')
  const fechaIso = `${anio}-${mes}-${dia}`

  const hoyDate = new Date()
  const hoyIso = `${hoyDate.getFullYear()}-${String(hoyDate.getMonth() + 1).padStart(2, '0')}-${String(hoyDate.getDate()).padStart(2, '0')}`
  const esHoy = fechaIso === hoyIso

  // Horas operativas del calendario: 08:00 a 20:00 (13 horas)
  const horas = useMemo(() => Array.from({ length: 13 }).map((_, i) => i + 8), [])

  // Citas del día seleccionado
  const citasDelDia = useMemo(() => {
    return citas.filter((c) => c.fecha_inicio.startsWith(fechaIso))
  }, [citas, fechaIso])

  // Métricas del día para el encabezado
  const stats = useMemo(() => {
    const total = citasDelDia.length
    const completadas = citasDelDia.filter((c) => c.estado === 'completada').length
    const enAtencion = citasDelDia.filter((c) => c.estado === 'en_atencion').length
    const pendientes = citasDelDia.filter((c) => c.estado === 'pendiente' || c.estado === 'confirmada').length
    return { total, completadas, enAtencion, pendientes }
  }, [citasDelDia])

  // Posición del marcador de hora actual (porcentaje de 08:00 a 21:00)
  const indicadorPosicionPct = useMemo(() => {
    if (!esHoy) return null
    const horaActual = ahora.getHours()
    const minActual = ahora.getMinutes()
    if (horaActual < 8 || horaActual >= 21) return null

    const totalMinutosRango = 13 * 60 // de 08:00 a 21:00
    const minutosTranscurridos = (horaActual - 8) * 60 + minActual
    return (minutosTranscurridos / totalMinutosRango) * 100
  }, [esHoy, ahora])

  const fechaFormateada = fechaActual.toLocaleDateString('es-ES', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  return (
    <div className="card p-4 sm:p-6 shadow-card space-y-6">
      {/* ── Barra de Navegación del Día y Métricas ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg sm:text-xl font-bold text-text capitalize">
              {fechaFormateada}
            </h2>
            {esHoy && (
              <Badge variant="primary" size="sm">
                Hoy
              </Badge>
            )}
          </div>
          <p className="text-xs text-text-muted mt-1 flex items-center gap-3">
            <span>Total: <strong className="text-text">{stats.total}</strong></span>
            {stats.enAtencion > 0 && (
              <span className="text-info flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                {stats.enAtencion} en atención
              </span>
            )}
            <span>Confirmadas/Pendientes: <strong className="text-text">{stats.pendientes}</strong></span>
            {stats.completadas > 0 && (
              <span className="text-success flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                {stats.completadas} completadas
              </span>
            )}
          </p>
        </div>

        {/* Controles de Navegación */}
        <div className="flex items-center gap-1.5 self-end sm:self-center">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => cambiarDia(-1)}
            aria-label="Día anterior"
            className="p-2 h-9 w-9 rounded-xl"
          >
            <ChevronLeft className="w-5 h-5 text-text-muted" />
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={irAHoy}
            className="text-xs font-semibold px-3 h-9 rounded-xl"
          >
            Hoy
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => cambiarDia(1)}
            aria-label="Día siguiente"
            className="p-2 h-9 w-9 rounded-xl"
          >
            <ChevronRight className="w-5 h-5 text-text-muted" />
          </Button>

          {onCrearCitaEnFecha && (
            <Button
              variant="primary"
              size="sm"
              onClick={() => onCrearCitaEnFecha(fechaIso, '09:00')}
              className="text-xs font-semibold ml-2 h-9 rounded-xl"
              leftIcon={<Plus className="w-4 h-4" />}
            >
              Agendar en este día
            </Button>
          )}
        </div>
      </div>

      {/* ── Rejilla de Horas del Día ── */}
      <div className="relative overflow-x-auto min-w-[620px]">
        {/* Línea de hora actual */}
        {indicadorPosicionPct !== null && (
          <div
            className="absolute left-16 right-0 z-20 pointer-events-none flex items-center"
            style={{ top: `${indicadorPosicionPct}%` }}
          >
            <div className="w-2.5 h-2.5 rounded-full bg-danger -ml-1.5 ring-2 ring-surface shadow-xs" />
            <div className="w-full border-t-2 border-danger border-dashed opacity-80" />
            <span className="font-mono text-[10px] bg-danger text-white font-bold px-1.5 py-0.5 rounded shadow-xs ml-1 shrink-0">
              {String(ahora.getHours()).padStart(2, '0')}:{String(ahora.getMinutes()).padStart(2, '0')}
            </span>
          </div>
        )}

        <div className="divide-y divide-border-subtle">
          {horas.map((hora) => {
            const horaStr = `${String(hora).padStart(2, '0')}:00`
            const horaProxStr = `${String(hora + 1).padStart(2, '0')}:00`

            // Citas que inician en este bloque horario
            const citasBloque = citasDelDia.filter((c) => {
              const hCita = parseInt(c.fecha_inicio.slice(11, 13), 10)
              return hCita === hora
            })

            return (
              <div
                key={hora}
                className="grid grid-cols-12 gap-3 py-2.5 min-h-[76px] group transition-colors hover:bg-surface-subtle/30"
              >
                {/* Columna Horario */}
                <div className="col-span-2 sm:col-span-1 pt-1 text-right pr-3 select-none">
                  <span className="font-mono text-xs font-semibold text-text-muted">
                    {horaStr}
                  </span>
                  <p className="text-[10px] text-text-muted/60 font-mono">
                    {horaProxStr}
                  </p>
                </div>

                {/* Columna de Citas y Acciones del Bloque */}
                <div className="col-span-10 sm:col-span-11 relative rounded-xl border border-dashed border-border/50 bg-surface/50 p-1.5 transition-all group-hover:border-border">
                  {citasBloque.length === 0 ? (
                    <div
                      onClick={() => onCrearCitaEnFecha?.(fechaIso, horaStr)}
                      className="w-full h-full min-h-[48px] rounded-lg flex items-center justify-between px-3 text-xs text-text-muted/40 hover:text-primary hover:bg-primary-soft/10 cursor-pointer transition-colors"
                      role="button"
                      tabIndex={0}
                      aria-label={`Espacio disponible a las ${horaStr}. Click para agendar.`}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault()
                          onCrearCitaEnFecha?.(fechaIso, horaStr)
                        }
                      }}
                    >
                      <span className="text-[11px] font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                        Disponible · Click para agendar a las {horaStr}
                      </span>
                      <Plus className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity text-primary shrink-0" />
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                      {citasBloque.map((cita) => (
                        <CitaBlock
                          key={cita.id}
                          cita={cita}
                          onClick={() => onSeleccionarCita?.(cita)}
                          onLongPress={() => onLongPressCita?.(cita)}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* ── Resumen de Profesionales Asignados en el Día ── */}
      {empleados.length > 0 && stats.total > 0 && (
        <div className="pt-4 border-t border-border flex flex-wrap items-center gap-2 text-xs text-text-muted">
          <span className="font-semibold text-text">Profesionales con actividad:</span>
          {empleados
            .filter((emp) => citasDelDia.some((c) => c.empleado_id === emp.id))
            .map((emp) => {
              const cant = citasDelDia.filter((c) => c.empleado_id === emp.id).length
              return (
                <span
                  key={emp.id}
                  className="px-2.5 py-1 rounded-lg bg-surface-subtle text-text border border-border inline-flex items-center gap-1.5"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                  <strong>{emp.nombre}</strong> ({cant})
                </span>
              )
            })}
        </div>
      )}
    </div>
  )
}

