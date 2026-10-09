import { useState, useMemo } from 'react'
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react'
import { Cita } from '@/types'
import { Badge, Button } from '@/components/ui'
import { CitaBlock } from './CitaBlock'

export interface CalendarioSemanalProps {
  citas: Cita[]
  onSeleccionarCita?: (cita: Cita) => void
  onLongPressCita?: (cita: Cita) => void
  onCrearCitaEnFecha?: (fechaIso: string, horaStr?: string) => void
}

export function CalendarioSemanal({
  citas,
  onSeleccionarCita,
  onLongPressCita,
  onCrearCitaEnFecha,
}: CalendarioSemanalProps) {
  const [fechaInicioSemana, setFechaInicioSemana] = useState<Date>(() => {
    const d = new Date()
    const dia = d.getDay()
    // Ajustar para que la semana empiece en Lunes (1) o Domingo (0) - Sagitta usa Lunes como inicio estándar
    const offset = dia === 0 ? -6 : 1 - dia
    d.setDate(d.getDate() + offset)
    return d
  })

  const cambiarSemana = (offset: number) => {
    const nueva = new Date(fechaInicioSemana)
    nueva.setDate(nueva.getDate() + offset * 7)
    setFechaInicioSemana(nueva)
  }

  const irAEstaSemana = () => {
    const d = new Date()
    const dia = d.getDay()
    const offset = dia === 0 ? -6 : 1 - dia
    d.setDate(d.getDate() + offset)
    setFechaInicioSemana(d)
  }

  const diasSemana = useMemo(() => {
    return Array.from({ length: 7 }).map((_, idx) => {
      const d = new Date(fechaInicioSemana)
      d.setDate(d.getDate() + idx)
      return d
    })
  }, [fechaInicioSemana])

  const hoyDate = new Date()
  const hoyStr = `${hoyDate.getFullYear()}-${String(hoyDate.getMonth() + 1).padStart(2, '0')}-${String(hoyDate.getDate()).padStart(2, '0')}`

  // Horario operativo: 08:00 a 20:00 (12 horas)
  const horas = useMemo(() => Array.from({ length: 12 }).map((_, i) => i + 8), [])

  // Total citas de la semana visible
  const totalCitasSemana = useMemo(() => {
    const inicioStr = diasSemana[0].toISOString().slice(0, 10)
    const finStr = diasSemana[6].toISOString().slice(0, 10)
    return citas.filter((c) => {
      const f = c.fecha_inicio.slice(0, 10)
      return f >= inicioStr && f <= finStr
    }).length
  }, [citas, diasSemana])

  return (
    <div className="card p-4 sm:p-6 shadow-card overflow-x-auto space-y-4">
      {/* ── Header de navegación de semana ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 min-w-[760px] pb-3 border-b border-border">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-bold text-text">
            Semana del {diasSemana[0].toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })} al{' '}
            {diasSemana[6].toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })}
          </h2>
          <Badge variant="primary" size="sm">
            {totalCitasSemana} {totalCitasSemana === 1 ? 'cita' : 'citas'}
          </Badge>
        </div>

        <div className="flex items-center gap-1.5">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => cambiarSemana(-1)}
            aria-label="Semana anterior"
            className="p-2 h-9 w-9 rounded-xl"
          >
            <ChevronLeft className="w-5 h-5 text-text-muted" />
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={irAEstaSemana}
            className="text-xs font-semibold px-3 h-9 rounded-xl"
          >
            Esta semana
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => cambiarSemana(1)}
            aria-label="Semana siguiente"
            className="p-2 h-9 w-9 rounded-xl"
          >
            <ChevronRight className="w-5 h-5 text-text-muted" />
          </Button>
        </div>
      </div>

      {/* ── Grid horario de la semana ── */}
      <div className="min-w-[760px]">
        {/* Cabecera de días */}
        <div className="grid grid-cols-8 gap-2 pb-3 border-b border-border text-center">
          <div className="text-xs font-semibold text-text-muted self-end pb-1">
            Hora
          </div>
          {diasSemana.map((dia) => {
            const y = dia.getFullYear()
            const m = String(dia.getMonth() + 1).padStart(2, '0')
            const d = String(dia.getDate()).padStart(2, '0')
            const fechaIso = `${y}-${m}-${d}`
            const esHoy = fechaIso === hoyStr

            const citasEnEsteDia = citas.filter((c) => c.fecha_inicio.startsWith(fechaIso)).length

            return (
              <div
                key={fechaIso}
                className={[
                  'flex flex-col items-center p-1.5 rounded-xl transition-colors',
                  esHoy ? 'bg-primary-soft/20 border border-primary/20' : '',
                ].join(' ')}
              >
                <span className="text-[11px] font-bold text-text-muted uppercase tracking-wider">
                  {dia.toLocaleDateString('es-ES', { weekday: 'short' })}
                </span>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span
                    className={[
                      'text-sm font-bold w-7 h-7 flex items-center justify-center rounded-full',
                      esHoy
                        ? 'bg-primary text-white shadow-xs'
                        : 'text-text hover:bg-surface-subtle',
                    ].join(' ')}
                  >
                    {dia.getDate()}
                  </span>
                  {citasEnEsteDia > 0 && (
                    <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-surface-subtle text-text-muted border border-border">
                      {citasEnEsteDia}
                    </span>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {/* Filas por hora */}
        <div className="divide-y divide-border-subtle">
          {horas.map((hora) => {
            const horaStr = `${String(hora).padStart(2, '0')}:00`

            return (
              <div
                key={hora}
                className="grid grid-cols-8 gap-2 py-2 min-h-[64px] items-start hover:bg-surface-subtle/20 transition-colors"
              >
                {/* Columna con etiqueta de hora */}
                <div className="text-xs font-mono font-semibold text-text-muted pt-1 text-center select-none">
                  {horaStr}
                </div>

                {/* 7 columnas para cada día de la semana */}
                {diasSemana.map((dia) => {
                  const y = dia.getFullYear()
                  const m = String(dia.getMonth() + 1).padStart(2, '0')
                  const d = String(dia.getDate()).padStart(2, '0')
                  const fechaIso = `${y}-${m}-${d}`

                  // Filtrar citas que inician en este día y hora
                  const citasSlot = citas.filter((c) => {
                    if (!c.fecha_inicio.startsWith(fechaIso)) return false
                    const hCita = parseInt(c.fecha_inicio.slice(11, 13), 10)
                    return hCita === hora
                  })

                  return (
                    <div
                      key={fechaIso}
                      className="min-h-[50px] rounded-lg p-1 bg-surface-subtle/30 flex flex-col gap-1 border border-dashed border-border/40 hover:border-border transition-colors group relative"
                    >
                      {citasSlot.length === 0 ? (
                        <button
                          type="button"
                          onClick={() => onCrearCitaEnFecha?.(fechaIso, horaStr)}
                          className="w-full h-full min-h-[44px] rounded-md flex items-center justify-center text-text-muted/0 group-hover:text-primary group-hover:bg-primary-soft/10 transition-all cursor-pointer"
                          aria-label={`Agendar a las ${horaStr} el ${fechaIso}`}
                          title={`Click para agendar a las ${horaStr}`}
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      ) : (
                        citasSlot.map((cita) => (
                          <CitaBlock
                            key={cita.id}
                            cita={cita}
                            compact={true}
                            onClick={() => onSeleccionarCita?.(cita)}
                            onLongPress={() => onLongPressCita?.(cita)}
                          />
                        ))
                      )}
                    </div>
                  )
                })}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
