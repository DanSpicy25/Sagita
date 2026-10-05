import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Cita } from '@/types'
import { Badge } from '@/components/ui'

interface CalendarioMensualProps {
  citas: Cita[]
  onSeleccionarCita?: (cita: Cita) => void
  onCrearCitaEnFecha?: (fecha: string) => void
}

export function CalendarioMensual({
  citas,
  onSeleccionarCita,
}: CalendarioMensualProps) {
  const [fechaActual, setFechaActual] = useState(new Date())

  const anio = fechaActual.getFullYear()
  const mes = fechaActual.getMonth()

  const primerDiaMes = new Date(anio, mes, 1).getDay()
  const diasEnMes = new Date(anio, mes + 1, 0).getDate()

  const diasSemana = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']

  const cambiarMes = (offset: number) => {
    setFechaActual(new Date(anio, mes + offset, 1))
  }

  const hoyStr = new Date().toISOString().slice(0, 10)

  return (
    <div className="card p-6 shadow-card">
      {/* Header del mes */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 capitalize">
          {fechaActual.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}
        </h2>
        <div className="flex items-center gap-1">
          <button
            onClick={() => cambiarMes(-1)}
            className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors"
            aria-label="Mes anterior"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={() => setFechaActual(new Date())}
            className="px-3 py-1.5 text-xs font-semibold rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors"
          >
            Hoy
          </button>
          <button
            onClick={() => cambiarMes(1)}
            className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors"
            aria-label="Mes siguiente"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Grid días de semana */}
      <div className="grid grid-cols-7 gap-px mb-2 text-center">
        {diasSemana.map((dia) => (
          <div
            key={dia}
            className="py-2 text-xs font-semibold text-slate-400 uppercase tracking-wider"
          >
            {dia}
          </div>
        ))}
      </div>

      {/* Grid días del mes */}
      <div className="grid grid-cols-7 gap-2">
        {/* Espacios vacíos antes del primer día */}
        {Array.from({ length: primerDiaMes }).map((_, i) => (
          <div
            key={`empty-${i}`}
            className="min-h-[90px] p-2 rounded-xl bg-slate-50/40 dark:bg-slate-800/20 border border-transparent"
          />
        ))}

        {/* Días del mes */}
        {Array.from({ length: diasEnMes }).map((_, i) => {
          const dia = i + 1
          const fechaDiaStr = `${anio}-${String(mes + 1).padStart(2, '0')}-${String(dia).padStart(2, '0')}`
          const esHoy = fechaDiaStr === hoyStr

          const citasDelDia = citas.filter((c) => c.fecha_inicio.startsWith(fechaDiaStr))

          return (
            <div
              key={dia}
              className={[
                'min-h-[90px] p-2 rounded-xl border flex flex-col justify-between transition-all group',
                esHoy
                  ? 'bg-primary-50/40 dark:bg-primary-950/20 border-primary-300 dark:border-primary-800'
                  : 'bg-white dark:bg-slate-800/60 border-slate-100 dark:border-slate-700/60 hover:border-slate-300 dark:hover:border-slate-600',
              ].join(' ')}
            >
              <div className="flex items-center justify-between mb-1">
                <span
                  className={[
                    'text-xs font-semibold w-6 h-6 flex items-center justify-center rounded-full',
                    esHoy
                      ? 'bg-primary-600 text-white shadow-sm'
                      : 'text-slate-700 dark:text-slate-300',
                  ].join(' ')}
                >
                  {dia}
                </span>
                {citasDelDia.length > 0 && (
                  <Badge variant="primary" size="sm">
                    {citasDelDia.length}
                  </Badge>
                )}
              </div>

              {/* Lista de citas en este día */}
              <div className="space-y-1 overflow-y-auto max-h-16 pr-0.5">
                {citasDelDia.map((cita) => (
                  <div
                    key={cita.id}
                    onClick={() => onSeleccionarCita?.(cita)}
                    className="text-[11px] font-medium p-1 rounded-lg bg-primary-100 dark:bg-primary-900/40 text-primary-800 dark:text-primary-200 truncate cursor-pointer hover:opacity-80 transition-opacity"
                    title={`${cita.servicio?.nombre ?? 'Cita'} - ${cita.cliente?.nombre ?? 'Cliente'}`}
                  >
                    {cita.fecha_inicio.slice(11, 16)} {cita.servicio?.nombre ?? 'Cita'}
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
