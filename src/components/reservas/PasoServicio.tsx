import { useState, useEffect } from 'react'
import { Clock, Check, Sparkles } from 'lucide-react'
import { Servicio, CategoriaServicio, DuracionServicio } from '@/types'
import { serviciosService } from '@/services/servicios.service'
import { Loader, Button } from '@/components/ui'

interface PasoServicioProps {
  servicioSeleccionado?: Servicio
  duracionSeleccionada?: DuracionServicio
  onSeleccionar: (servicio: Servicio, duracion?: DuracionServicio) => void
  onSiguiente: () => void
}

export function PasoServicio({
  servicioSeleccionado,
  duracionSeleccionada,
  onSeleccionar,
  onSiguiente,
}: PasoServicioProps) {
  const [servicios, setServicios] = useState<Servicio[]>([])
  const [categorias, setCategorias] = useState<CategoriaServicio[]>([])
  const [categoriaActiva, setCategoriaActiva] = useState<number | null>(null)
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    Promise.all([serviciosService.getAll(), serviciosService.getCategorias()])
      .then(([servRes, catRes]) => {
        if (servRes.data) setServicios(servRes.data)
        if (catRes.data) setCategorias(catRes.data)
      })
      .finally(() => setCargando(false))
  }, [])

  const serviciosFiltrados = categoriaActiva
    ? servicios.filter((s) => s.categoria_id === categoriaActiva)
    : servicios

  if (cargando) {
    return <Loader fullScreen={false} text="Cargando catálogo de servicios..." />
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
          Paso 1: Selecciona el servicio
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Elige el tratamiento o consulta que deseas agendar
        </p>
      </div>

      {/* Categorías */}
      {categorias.length > 0 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          <button
            type="button"
            onClick={() => setCategoriaActiva(null)}
            className={[
              'px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all',
              categoriaActiva === null
                ? 'bg-primary-600 text-white shadow-sm'
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700',
            ].join(' ')}
          >
            Todos los servicios
          </button>
          {categorias.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setCategoriaActiva(cat.id)}
              className={[
                'px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5',
                categoriaActiva === cat.id
                  ? 'bg-primary-600 text-white shadow-sm'
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700',
              ].join(' ')}
            >
              <Sparkles className="w-3.5 h-3.5" />
              {cat.nombre}
            </button>
          ))}
        </div>
      )}

      {/* Grid de servicios */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {serviciosFiltrados.map((serv) => {
          const esSeleccionado = servicioSeleccionado?.id === serv.id
          return (
            <div
              key={serv.id}
              onClick={() => onSeleccionar(serv, serv.duraciones?.[0])}
              className={[
                'card p-5 cursor-pointer transition-all border-2 flex flex-col justify-between group',
                esSeleccionado
                  ? 'border-primary-600 dark:border-primary-500 bg-primary-50/20 dark:bg-primary-950/20 shadow-md ring-2 ring-primary-100 dark:ring-primary-950'
                  : 'border-transparent hover:border-slate-300 dark:hover:border-slate-600',
              ].join(' ')}
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h4 className="font-bold text-slate-900 dark:text-slate-100 group-hover:text-primary-600 transition-colors">
                    {serv.nombre}
                  </h4>
                  <span className="text-base font-bold text-primary-600 dark:text-primary-400">
                    ${serv.precio_base}
                  </span>
                </div>
                {serv.descripcion && (
                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mb-3">
                    {serv.descripcion}
                  </p>
                )}
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <span className="flex items-center gap-1 text-xs text-slate-400">
                  <Clock className="w-3.5 h-3.5" />
                  {serv.duracion_base_min} min
                </span>

                {/* Selección de duraciones personalizadas si existen */}
                {serv.duraciones && serv.duraciones.length > 1 && esSeleccionado && (
                  <div
                    className="flex items-center gap-1"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {serv.duraciones.map((dur) => (
                      <button
                        key={dur.id}
                        type="button"
                        onClick={() => onSeleccionar(serv, dur)}
                        className={[
                          'text-[10px] px-2 py-0.5 rounded-lg font-semibold border transition-all',
                          duracionSeleccionada?.id === dur.id
                            ? 'bg-primary-600 text-white border-primary-600'
                            : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700',
                        ].join(' ')}
                      >
                        {dur.duracion_min}m (${dur.precio})
                      </button>
                    ))}
                  </div>
                )}

                {esSeleccionado && (
                  <span className="w-6 h-6 rounded-full bg-primary-600 text-white flex items-center justify-center">
                    <Check className="w-3.5 h-3.5" />
                  </span>
                )}
              </div>
            </div>
          )
        })}
      </div>

      <div className="flex justify-end pt-4">
        <Button
          onClick={onSiguiente}
          disabled={!servicioSeleccionado}
          size="md"
        >
          Continuar con Empleado
        </Button>
      </div>
    </div>
  )
}
