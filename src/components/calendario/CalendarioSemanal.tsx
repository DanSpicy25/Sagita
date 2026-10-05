import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Cita } from '@/types'

interface CalendarioSemanalProps {
  citas: Cita[]
  onSeleccionarCita?: (cita: Cita) => void
}

export function CalendarioSemanal({
  citas,
  onSeleccionarCita,
}: CalendarioSemanalProps) {
  const [fechaInicioSemana, setFechaInicioSemana] = useState<Date>(() => {
    const d = new Date()
    const dia = d.getDay()
    d.setDate(d.getDate() - dia)
    return d
  })

  const cambiarSemana = (offset: number) => {
    const nueva = new Date(fechaInicioSemana)
    nueva.setDate(nueva.getDate() + offset * 7)
    setFechaInicioSemana(nueva)
  }

  const diasSemana = Array.from({ length: 7 }).map((_, idx) => {
    const d = new Date(fechaInicioSemana)
    d.setDate(d.getDate() + idx)
    return d
  })

  const hoyStr = new Date().toISOString().slice(0, 10)
  const horas = Array.from({ length: 11 }).map((_, i) => i + 8) // 08:00 a 18:00

  return (
    <div className="card p-6 shadow-card overflow-x-auto">
      {/* Header navegación de semana */}
      <div className="flex items-center justify-between mb-6 min-w-[700px]">
        <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
          Semana del {diasSemana[0].toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })} al{' '}
          {diasSemana[6].toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })}
        </h2>
        <div className="flex items-center gap-1">
          <button
            onClick={() => cambiarSemana(-1)}
            className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors"
            aria-label="Semana anterior"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={() => {
              const d = new Date()
              d.setDate(d.getDate() - d.getDay())
              setFechaInicioSemana(d)
            }}
            className="px-3 py-1.5 text-xs font-semibold rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors"
          >
            Esta semana
          </button>
          <button
            onClick={() => cambiarSemana(1)}
            className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors"
            aria-label="Semana siguiente"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Grid horario de la semana */}
      <div className="min-w-[700px]">
        {/* Cabecera de días */}
        <div className="grid grid-cols-8 gap-2 pb-3 border-b border-slate-100 dark:border-slate-800 text-center">
          <div className="text-xs font-medium text-slate-400">Hora</div>
          {diasSemana.map((dia) => {
            const fechaIso = dia.toISOString().slice(0, 10)
            const esHoy = fechaIso === hoyStr
            return (
              <div key={fechaIso} className="flex flex-col items-center">
                <span className="text-[11px] font-semibold text-slate-400 uppercase">
                  {dia.toLocaleDateString('es-ES', { weekday: 'short' })}
                </span>
                <span
                  className={[
                    'text-sm font-bold w-7 h-7 flex items-center justify-center rounded-full mt-0.5',
                    esHoy
                      ? 'bg-primary-600 text-white shadow-sm'
                      : 'text-slate-800 dark:text-slate-200',
                  ].join(' ')}
                >
                  {dia.getDate()}
                </span>
              </div>
            )
          })}
        </div>

        {/* Filas por hora */}
        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {horas.map((hora) => {
            const horaStr = `${String(hora).padStart(2, '0')}:00`
            return (
              <div key={hora} className="grid grid-cols-8 gap-2 py-3 min-h-[56px] items-start">
                <div className="text-xs font-medium text-slate-400 pt-1">{horaStr}</div>
                {diasSemana.map((dia) => {
                  const fechaIso = dia.toISOString().slice(0, 10)
                  // Filtrar citas que caen en esta hora y día
                  const citasSlot = citas.filter((c) => {
                    if (!c.fecha_inicio.startsWith(fechaIso)) return false
                    const hCita = parseInt(c.fecha_inicio.slice(11, 13), 10)
                    return hCita === hora
                  })

                  return (
                    <div
                      key={fechaIso}
                      className="min-h-[44px] rounded-lg p-1 bg-slate-50/40 dark:bg-slate-900/30 flex flex-col gap-1 border border-dashed border-slate-200/50 dark:border-slate-800/50"
                    >
                      {citasSlot.map((cita) => (
                        <button
                          key={cita.id}
                          onClick={() => onSeleccionarCita?.(cita)}
                          className="text-left text-[11px] p-1.5 rounded-md bg-primary-100 dark:bg-primary-900/50 text-primary-900 dark:text-primary-100 font-medium hover:bg-primary-200 dark:hover:bg-primary-800 transition-colors truncate"
                          title={`${cita.servicio?.nombre} con ${cita.cliente?.nombre}`}
                        >
                          <p className="truncate font-semibold">{cita.servicio?.nombre}</p>
                          <p className="text-[10px] text-primary-700 dark:text-primary-300 truncate">
                            {cita.cliente?.nombre}
                          </p>
                        </button>
                      ))}
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
