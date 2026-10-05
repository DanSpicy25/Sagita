import { useState, useEffect } from 'react'
import { Sparkles, Clock, Check } from 'lucide-react'
import { ServicioExtra } from '@/types'
import { pagosService } from '@/services/pagos.service'

interface ServiciosExtraSelectorProps {
  seleccionados: ServicioExtra[]
  onCambiar: (nuevos: ServicioExtra[]) => void
}

export function ServiciosExtraSelector({
  seleccionados,
  onCambiar,
}: ServiciosExtraSelectorProps) {
  const [extras, setExtras] = useState<ServicioExtra[]>([])
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    pagosService
      .getServiciosExtra()
      .then((res) => {
        if (res.data) setExtras(res.data)
      })
      .finally(() => setCargando(false))
  }, [])

  const toggleExtra = (extra: ServicioExtra) => {
    const yaEsta = seleccionados.some((s) => s.id === extra.id)
    if (yaEsta) {
      onCambiar(seleccionados.filter((s) => s.id !== extra.id))
    } else {
      onCambiar([...seleccionados, extra])
    }
  }

  if (cargando) return null
  if (extras.length === 0) return null

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300">
        <Sparkles className="w-3.5 h-3.5 text-primary-500" />
        <span>Añade tratamientos y servicios adicionales a tu cita</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {extras.map((extra) => {
          const estaSeleccionado = seleccionados.some((s) => s.id === extra.id)
          return (
            <div
              key={extra.id}
              onClick={() => toggleExtra(extra)}
              className={[
                'p-3 rounded-xl border cursor-pointer transition-all flex items-start justify-between gap-2 select-none',
                estaSeleccionado
                  ? 'bg-primary-50/50 dark:bg-primary-950/30 border-primary-500 ring-1 ring-primary-400'
                  : 'bg-white dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 hover:border-slate-300',
              ].join(' ')}
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-1">
                  <h5 className="font-semibold text-xs text-slate-800 dark:text-slate-100 truncate">
                    {extra.nombre}
                  </h5>
                  <span className="font-bold text-xs text-primary-600 dark:text-primary-400">
                    +${extra.precio}
                  </span>
                </div>
                {extra.descripcion && (
                  <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">
                    {extra.descripcion}
                  </p>
                )}
                {extra.duracion_extra_min > 0 && (
                  <span className="inline-flex items-center gap-1 text-[10px] text-slate-400 mt-1">
                    <Clock className="w-3 h-3" />
                    +{extra.duracion_extra_min} min
                  </span>
                )}
              </div>

              <div
                className={[
                  'w-4 h-4 rounded-md border flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors',
                  estaSeleccionado
                    ? 'bg-primary-600 border-primary-600 text-white'
                    : 'border-slate-300 dark:border-slate-600',
                ].join(' ')}
              >
                {estaSeleccionado && <Check className="w-3 h-3" />}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

