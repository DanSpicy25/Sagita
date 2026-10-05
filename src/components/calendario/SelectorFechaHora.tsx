import { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight, Clock, Calendar as CalendarIcon } from 'lucide-react'
import { SlotDisponible } from '@/types'
import { citasService } from '@/services/citas.service'
import { Loader } from '@/components/ui'

interface SelectorFechaHoraProps {
  empleadoId?: number
  servicioId?: number
  fechaSeleccionada?: string
  horaSeleccionada?: string
  onSeleccionar: (fecha: string, hora: string) => void
}

export function SelectorFechaHora({
  empleadoId,
  servicioId,
  fechaSeleccionada,
  horaSeleccionada,
  onSeleccionar,
}: SelectorFechaHoraProps) {
  const [fechaActual, setFechaActual] = useState<Date>(() => {
    return fechaSeleccionada ? new Date(fechaSeleccionada + 'T00:00:00') : new Date()
  })
  const [slots, setSlots] = useState<SlotDisponible[]>([])
  const [cargandoSlots, setCargandoSlots] = useState(false)

  const fechaStr = fechaActual.toISOString().slice(0, 10)

  useEffect(() => {
    if (!empleadoId) return
    let isMounted = true
    setCargandoSlots(true)

    citasService
      .getDisponibilidad(empleadoId, fechaStr, servicioId)
      .then((res) => {
        if (isMounted && res.data) {
          setSlots(res.data)
        }
      })
      .catch(() => {
        if (isMounted) setSlots([])
      })
      .finally(() => {
        if (isMounted) setCargandoSlots(false)
      })

    return () => {
      isMounted = false
    }
  }, [empleadoId, fechaStr, servicioId])

  const cambiarDia = (offset: number) => {
    const nueva = new Date(fechaActual)
    nueva.setDate(nueva.getDate() + offset)
    setFechaActual(nueva)
  }

  // Separar slots de mañana y tarde
  const slotsManana = slots.filter((s) => parseInt(s.hora_inicio.split(':')[0], 10) < 13)
  const slotsTarde = slots.filter((s) => parseInt(s.hora_inicio.split(':')[0], 10) >= 13)

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Selector de Fecha */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2 text-slate-800 dark:text-slate-200 font-semibold">
            <CalendarIcon className="w-5 h-5 text-primary-500" />
            <span>Fecha seleccionada</span>
          </div>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => cambiarDia(-1)}
              className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors"
              aria-label="Día anterior"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={() => cambiarDia(1)}
              className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors"
              aria-label="Día siguiente"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-primary-50/50 dark:bg-primary-950/30 border border-primary-100 dark:border-primary-900/50 text-center mb-6">
          <p className="text-xs uppercase tracking-wider font-semibold text-primary-600 dark:text-primary-400">
            {fechaActual.toLocaleDateString('es-ES', { weekday: 'long' })}
          </p>
          <p className="text-3xl font-bold text-slate-800 dark:text-slate-100 mt-1">
            {fechaActual.getDate()}
          </p>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {fechaActual.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}
          </p>
        </div>

        {/* Mini selector de días de la semana actual */}
        <div className="grid grid-cols-7 gap-1 text-center">
          {['D', 'L', 'M', 'M', 'J', 'V', 'S'].map((dia, idx) => (
            <span key={idx} className="text-xs font-medium text-slate-400 py-1">
              {dia}
            </span>
          ))}
          {Array.from({ length: 7 }).map((_, idx) => {
            const d = new Date(fechaActual)
            const diaSemana = d.getDay()
            d.setDate(d.getDate() - diaSemana + idx)
            const esHoy = d.toISOString().slice(0, 10) === fechaStr
            return (
              <button
                key={idx}
                type="button"
                onClick={() => setFechaActual(new Date(d))}
                className={[
                  'h-9 rounded-lg text-xs font-semibold flex items-center justify-center transition-all',
                  esHoy
                    ? 'bg-primary-600 text-white shadow-sm'
                    : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300',
                ].join(' ')}
              >
                {d.getDate()}
              </button>
            )
          })}
        </div>
      </div>

      {/* Selector de Horarios Disponibles */}
      <div className="card p-6">
        <div className="flex items-center gap-2 text-slate-800 dark:text-slate-200 font-semibold mb-4">
          <Clock className="w-5 h-5 text-primary-500" />
          <span>Horarios disponibles</span>
        </div>

        {cargandoSlots ? (
          <div className="py-12">
            <Loader text="Consultando disponibilidad..." size="sm" />
          </div>
        ) : slots.length === 0 ? (
          <p className="text-sm text-slate-500 dark:text-slate-400 py-8 text-center">
            No hay horarios disponibles para este día. Prueba con otra fecha.
          </p>
        ) : (
          <div className="space-y-4 max-h-72 overflow-y-auto pr-1">
            {slotsManana.length > 0 && (
              <div>
                <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">
                  Mañana
                </p>
                <div className="grid grid-cols-3 gap-2">
                  {slotsManana.map((slot) => {
                    const isSelected =
                      fechaSeleccionada === fechaStr && horaSeleccionada === slot.hora_inicio
                    return (
                      <button
                        key={slot.hora_inicio}
                        type="button"
                        disabled={!slot.disponible}
                        onClick={() => onSeleccionar(fechaStr, slot.hora_inicio)}
                        className={[
                          'py-2 px-3 text-xs font-medium rounded-xl border transition-all text-center',
                          !slot.disponible
                            ? 'opacity-40 cursor-not-allowed bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 text-slate-400 line-through'
                            : isSelected
                            ? 'bg-primary-600 text-white border-primary-600 shadow-sm ring-2 ring-primary-300 dark:ring-primary-900'
                            : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:border-primary-500 hover:text-primary-600',
                        ].join(' ')}
                      >
                        {slot.hora_inicio}
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

            {slotsTarde.length > 0 && (
              <div>
                <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">
                  Tarde
                </p>
                <div className="grid grid-cols-3 gap-2">
                  {slotsTarde.map((slot) => {
                    const isSelected =
                      fechaSeleccionada === fechaStr && horaSeleccionada === slot.hora_inicio
                    return (
                      <button
                        key={slot.hora_inicio}
                        type="button"
                        disabled={!slot.disponible}
                        onClick={() => onSeleccionar(fechaStr, slot.hora_inicio)}
                        className={[
                          'py-2 px-3 text-xs font-medium rounded-xl border transition-all text-center',
                          !slot.disponible
                            ? 'opacity-40 cursor-not-allowed bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 text-slate-400 line-through'
                            : isSelected
                            ? 'bg-primary-600 text-white border-primary-600 shadow-sm ring-2 ring-primary-300 dark:ring-primary-900'
                            : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:border-primary-500 hover:text-primary-600',
                        ].join(' ')}
                      >
                        {slot.hora_inicio}
                      </button>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
