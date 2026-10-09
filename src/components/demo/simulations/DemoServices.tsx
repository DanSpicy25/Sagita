import { useState } from 'react'
import {
  Sparkles,
  Clock,
  ChevronDown,
  ChevronUp,
  Tag,
} from 'lucide-react'
import { DEMO_SERVICIOS, DEMO_ESPECIALISTAS, type DeviceMode } from '../demoData'

export function DemoServices({ deviceMode: _deviceMode }: { deviceMode?: DeviceMode } = {}) {
  const [categoriaFiltro, setCategoriaFiltro] = useState<string>('todas')
  const [expandidoId, setExpandidoId] = useState<number | null>(201)

  const categorias = Array.from(new Set(DEMO_SERVICIOS.map((s) => s.categoria)))

  const serviciosFiltrados = categoriaFiltro === 'todas'
    ? DEMO_SERVICIOS
    : DEMO_SERVICIOS.filter((s) => s.categoria === categoriaFiltro)

  return (
    <div className="space-y-4 animate-fade-in text-text">
      {/* Selector de Categorías */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <button
          onClick={() => setCategoriaFiltro('todas')}
          className={[
            'px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer',
            categoriaFiltro === 'todas'
              ? 'bg-primary text-white shadow-2xs'
              : 'bg-surface border border-border text-text-muted hover:text-text',
          ].join(' ')}
        >
          Todas las Categorías ({DEMO_SERVICIOS.length})
        </button>

        {categorias.map((cat) => (
          <button
            key={cat}
            onClick={() => setCategoriaFiltro(cat)}
            className={[
              'px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer',
              categoriaFiltro === cat
                ? 'bg-primary text-white shadow-2xs'
                : 'bg-surface border border-border text-text-muted hover:text-text',
            ].join(' ')}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Grid de Tarjetas de Servicios con Subservicios */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {serviciosFiltrados.map((serv) => {
          const tieneVariantes = serv.duraciones.length > 0
          const esExpandido = expandidoId === serv.id

          let precioTexto = `$${serv.precioBase}`
          if (tieneVariantes) {
            const precios = [serv.precioBase, ...serv.duraciones.map((d) => d.precio)]
            const minP = Math.min(...precios)
            const maxP = Math.max(...precios)
            if (minP !== maxP) {
              precioTexto = `$${minP} – $${maxP}`
            }
          }

          return (
            <div
              key={serv.id}
              className="p-5 rounded-2xl bg-surface border border-border shadow-2xs hover:shadow-card transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold shadow-2xs shrink-0"
                      style={{ backgroundColor: serv.color }}
                    >
                      <Sparkles className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-text leading-snug">
                        {serv.nombre}
                      </h4>
                      <span className="text-[11px] font-semibold text-text-muted">
                        {serv.categoria}
                      </span>
                    </div>
                  </div>

                  <span className="text-base font-bold font-mono text-text shrink-0">
                    {precioTexto}
                  </span>
                </div>

                <div className="mt-3 flex items-center gap-3 text-xs text-text-muted">
                  <span className="flex items-center gap-1 font-medium">
                    <Clock className="w-3.5 h-3.5 text-primary" />
                    Base {serv.duracionBase} min
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Tag className="w-3.5 h-3.5 text-primary" />
                    +10 min buffer
                  </span>
                </div>

                {/* Subservicios / Duraciones Expandibles */}
                {tieneVariantes && (
                  <div className="mt-3 pt-3 border-t border-border-subtle">
                    <button
                      onClick={() => setExpandidoId(esExpandido ? null : serv.id)}
                      className="w-full flex items-center justify-between text-xs font-semibold text-primary hover:underline cursor-pointer"
                    >
                      <span>Variantes de Duración ({serv.duraciones.length})</span>
                      {esExpandido ? (
                        <ChevronUp className="w-3.5 h-3.5" />
                      ) : (
                        <ChevronDown className="w-3.5 h-3.5" />
                      )}
                    </button>

                    {esExpandido && (
                      <div className="mt-2 space-y-1.5 pt-1">
                        {serv.duraciones.map((dur) => (
                          <div
                            key={dur.id}
                            className="p-2 rounded-xl bg-surface-subtle border border-border-subtle text-xs flex items-center justify-between"
                          >
                            <div>
                              <span className="font-semibold text-text">{dur.etiqueta}</span>
                              <span className="text-[10px] text-text-muted block">
                                Duración: {dur.duracionMin} minutos
                              </span>
                            </div>
                            <span className="font-bold font-mono text-text">
                              ${dur.precio}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Especialistas asignados */}
              <div className="mt-4 pt-3 border-t border-border-subtle flex items-center justify-between text-xs">
                <span className="text-[10px] text-text-muted font-medium">
                  Especialistas asignados:
                </span>
                <div className="flex -space-x-1.5">
                  {DEMO_ESPECIALISTAS.slice(0, 3).map((esp) => (
                    <img
                      key={esp.id}
                      src={esp.avatar}
                      alt={esp.nombre}
                      title={esp.nombre}
                      className="w-6 h-6 rounded-full border-2 border-surface object-cover"
                    />
                  ))}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

