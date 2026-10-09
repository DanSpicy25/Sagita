import { useState, useMemo } from 'react'
import { ChevronLeft, ChevronRight, Plus, X } from 'lucide-react'
import { Cita } from '@/types'
import { Badge, Button } from '@/components/ui'
import { CitaBlock } from './CitaBlock'

export interface CalendarioMensualProps {
  citas: Cita[]
  onSeleccionarCita?: (cita: Cita) => void
  onLongPressCita?: (cita: Cita) => void
  onCrearCitaEnFecha?: (fecha: string) => void
}

export function CalendarioMensual({
  citas,
  onSeleccionarCita,
  onLongPressCita,
  onCrearCitaEnFecha,
}: CalendarioMensualProps) {
  const [fechaActual, setFechaActual] = useState(() => new Date())
  const [diaExpandido, setDiaExpandido] = useState<string | null>(null)

  const anio = fechaActual.getFullYear()
  const mes = fechaActual.getMonth()

  // Inicio de semana en Lunes (Lun=0, ..., Dom=6)
  const primerDiaSemanaRaw = new Date(anio, mes, 1).getDay()
  const primerDiaOffset = primerDiaSemanaRaw === 0 ? 6 : primerDiaSemanaRaw - 1
  const diasEnMes = new Date(anio, mes + 1, 0).getDate()

  const diasSemana = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']

  const cambiarMes = (offset: number) => {
    setFechaActual(new Date(anio, mes + offset, 1))
    setDiaExpandido(null)
  }

  const irAHoy = () => {
    setFechaActual(new Date())
    setDiaExpandido(null)
  }

  const hoyDate = new Date()
  const hoyStr = `${hoyDate.getFullYear()}-${String(hoyDate.getMonth() + 1).padStart(2, '0')}-${String(hoyDate.getDate()).padStart(2, '0')}`

  // Total citas en el mes visible
  const totalCitasMes = useMemo(() => {
    const mesStr = `${anio}-${String(mes + 1).padStart(2, '0')}`
    return citas.filter((c) => c.fecha_inicio.startsWith(mesStr)).length
  }, [citas, anio, mes])

  // Citas del día expandido para modal/popover de "+N más"
  const citasDiaExpandido = useMemo(() => {
    if (!diaExpandido) return []
    return citas.filter((c) => c.fecha_inicio.startsWith(diaExpandido))
  }, [citas, diaExpandido])

  return (
    <div className="card p-4 sm:p-6 shadow-card space-y-4">
      {/* ── Header del mes y navegación ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-border">
        <div className="flex items-center gap-3">
          <h2 className="text-lg sm:text-xl font-bold text-text capitalize">
            {fechaActual.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}
          </h2>
          <Badge variant="primary" size="sm">
            {totalCitasMes} {totalCitasMes === 1 ? 'cita' : 'citas'}
          </Badge>
        </div>

        <div className="flex items-center gap-1.5 self-end sm:self-center">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => cambiarMes(-1)}
            aria-label="Mes anterior"
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
            onClick={() => cambiarMes(1)}
            aria-label="Mes siguiente"
            className="p-2 h-9 w-9 rounded-xl"
          >
            <ChevronRight className="w-5 h-5 text-text-muted" />
          </Button>
        </div>
      </div>

      {/* ── Grid días de semana ── */}
      <div className="grid grid-cols-7 gap-1 sm:gap-2 text-center pb-1">
        {diasSemana.map((dia) => (
          <div
            key={dia}
            className="py-1 text-xs font-bold text-text-muted uppercase tracking-wider"
          >
            {dia}
          </div>
        ))}
      </div>

      {/* ── Grid celdas de días del mes ── */}
      <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
        {/* Espacios vacíos antes del primer día del mes */}
        {Array.from({ length: primerDiaOffset }).map((_, i) => (
          <div
            key={`empty-${i}`}
            className="min-h-[96px] sm:min-h-[115px] p-1.5 rounded-xl bg-surface-subtle/20 border border-transparent opacity-40 select-none"
          />
        ))}

        {/* Celdas de los días del mes */}
        {Array.from({ length: diasEnMes }).map((_, i) => {
          const dia = i + 1
          const fechaDiaStr = `${anio}-${String(mes + 1).padStart(2, '0')}-${String(dia).padStart(2, '0')}`
          const esHoy = fechaDiaStr === hoyStr

          const citasDelDia = citas.filter((c) => c.fecha_inicio.startsWith(fechaDiaStr))
          const citasVisibles = citasDelDia.slice(0, 2)
          const citasRestantes = citasDelDia.length - citasVisibles.length

          return (
            <div
              key={dia}
              className={[
                'min-h-[96px] sm:min-h-[115px] p-1.5 sm:p-2 rounded-xl border flex flex-col justify-between transition-all group relative',
                esHoy
                  ? 'bg-primary-soft/15 border-primary/40 shadow-2xs'
                  : 'bg-surface border-border hover:border-border-hover hover:bg-surface-subtle/30',
              ].join(' ')}
            >
              {/* Cabecera del día */}
              <div className="flex items-center justify-between mb-1">
                <span
                  className={[
                    'text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full transition-colors',
                    esHoy
                      ? 'bg-primary text-white shadow-xs'
                      : 'text-text group-hover:bg-surface-subtle',
                  ].join(' ')}
                >
                  {dia}
                </span>

                <div className="flex items-center gap-1">
                  {citasDelDia.length > 0 && (
                    <Badge variant={esHoy ? 'primary' : 'default'} size="sm">
                      {citasDelDia.length}
                    </Badge>
                  )}
                  {onCrearCitaEnFecha && (
                    <button
                      type="button"
                      onClick={() => onCrearCitaEnFecha(fechaDiaStr)}
                      className="opacity-0 group-hover:opacity-100 p-0.5 rounded text-text-muted hover:text-primary hover:bg-primary-soft/30 transition-all cursor-pointer"
                      title={`Agendar cita el ${fechaDiaStr}`}
                      aria-label={`Agendar cita el ${dia}`}
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Lista compacta de citas en este día */}
              <div className="space-y-1 flex-1 overflow-hidden">
                {citasVisibles.map((cita) => (
                  <CitaBlock
                    key={cita.id}
                    cita={cita}
                    compact={true}
                    onClick={() => onSeleccionarCita?.(cita)}
                    onLongPress={() => onLongPressCita?.(cita)}
                  />
                ))}

                {citasRestantes > 0 && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      setDiaExpandido(fechaDiaStr)
                    }}
                    className="w-full text-center text-[10px] font-bold py-0.5 rounded-md bg-surface-subtle text-primary hover:bg-primary-soft/30 hover:underline transition-colors block cursor-pointer"
                  >
                    +{citasRestantes} más
                  </button>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* ── Modal Popover para "+N más" citas en un día ── */}
      {diaExpandido && (
        <div className="fixed inset-0 z-modal bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="card w-full max-w-md p-5 shadow-elevated space-y-4 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-2 border-b border-border">
              <div>
                <h3 className="font-bold text-text text-base">
                  Citas del {diaExpandido}
                </h3>
                <p className="text-xs text-text-muted">
                  {citasDiaExpandido.length} {citasDiaExpandido.length === 1 ? 'cita agendada' : 'citas agendadas'}
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setDiaExpandido(null)}
                className="p-1 h-8 w-8 rounded-lg"
                aria-label="Cerrar ventana de citas"
              >
                <X className="w-4 h-4 text-text-muted" />
              </Button>
            </div>

            <div className="space-y-2 overflow-y-auto flex-1 pr-1">
              {citasDiaExpandido.map((cita) => (
                <CitaBlock
                  key={cita.id}
                  cita={cita}
                  onClick={() => {
                    setDiaExpandido(null)
                    onSeleccionarCita?.(cita)
                  }}
                  onLongPress={() => {
                    setDiaExpandido(null)
                    onLongPressCita?.(cita)
                  }}
                />
              ))}
            </div>

            <div className="pt-2 border-t border-border flex justify-end gap-2">
              {onCrearCitaEnFecha && (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => {
                    const f = diaExpandido
                    setDiaExpandido(null)
                    onCrearCitaEnFecha(f)
                  }}
                  leftIcon={<Plus className="w-4 h-4" />}
                >
                  Agendar en esta fecha
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setDiaExpandido(null)}
              >
                Cerrar
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
