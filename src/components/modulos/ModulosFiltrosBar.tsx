import { Search, X, ChevronDown } from 'lucide-react'
import { ModuleCategory } from '@/types'
import { MODULE_CATEGORIES } from '@/config/modules'

export type EstadoModuloFiltro = 'todos' | 'activos' | 'disponibles' | 'restringidos' | 'hoja_ruta'

export interface ModulosFiltros {
  busqueda: string
  categoria: ModuleCategory | 'todas'
  estado: EstadoModuloFiltro
}

export interface ModulosFiltrosBarProps {
  filtros: ModulosFiltros
  onFiltrosChange: (filtros: ModulosFiltros) => void
  totalModulos: number
  modulosFiltrados: number
}

export function ModulosFiltrosBar({
  filtros,
  onFiltrosChange,
  totalModulos,
  modulosFiltrados,
}: ModulosFiltrosBarProps) {
  const tieneFiltrosActivos =
    filtros.busqueda.trim() !== '' ||
    filtros.categoria !== 'todas' ||
    filtros.estado !== 'todos'

  const limpiarFiltros = () => {
    onFiltrosChange({
      busqueda: '',
      categoria: 'todas',
      estado: 'todos',
    })
  }

  return (
    <div className="space-y-3">
      {/* ── Barra Superior de Búsqueda y Estado ── */}
      <div className="p-3.5 rounded-2xl bg-surface border border-border shadow-2xs flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <div className="flex flex-1 flex-col sm:flex-row gap-2.5 items-stretch sm:items-center">
          {/* Input de Búsqueda */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
            <input
              type="text"
              placeholder="Buscar por módulo, capacidad, permiso (ej. citas, stock, pos)..."
              value={filtros.busqueda}
              onChange={(e) =>
                onFiltrosChange({ ...filtros, busqueda: e.target.value })
              }
              className="w-full pl-9 pr-8 py-1.5 text-xs rounded-xl border border-border bg-surface-subtle text-text placeholder:text-text-muted/70 focus:outline-none focus:ring-2 focus:ring-primary focus:bg-surface transition-all"
            />
            {filtros.busqueda && (
              <button
                type="button"
                onClick={() => onFiltrosChange({ ...filtros, busqueda: '' })}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-text-muted hover:text-text cursor-pointer"
                aria-label="Limpiar búsqueda"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Filtro por Estado */}
          <div className="relative">
            <select
              value={filtros.estado}
              onChange={(e) =>
                onFiltrosChange({
                  ...filtros,
                  estado: e.target.value as EstadoModuloFiltro,
                })
              }
              className="w-full sm:w-auto pl-3 pr-8 py-1.5 text-xs rounded-xl border border-border bg-surface-subtle text-text focus:outline-none focus:ring-2 focus:ring-primary appearance-none cursor-pointer"
            >
              <option value="todos">Todos los estados</option>
              <option value="activos">Módulos Activos</option>
              <option value="disponibles">Listos para Activar</option>
              <option value="restringidos">Requiere Plan Superior</option>
              <option value="hoja_ruta">En Hoja de Ruta (Próximamente)</option>
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-muted pointer-events-none" />
          </div>
        </div>

        {/* Contador y Limpiar */}
        <div className="flex items-center gap-2 justify-between sm:justify-end">
          <span className="text-[11px] text-text-muted">
            Mostrando <strong className="text-text font-bold">{modulosFiltrados}</strong> de {totalModulos} módulos
          </span>

          {tieneFiltrosActivos && (
            <button
              type="button"
              onClick={limpiarFiltros}
              className="text-[11px] text-primary hover:underline font-semibold cursor-pointer ml-1"
            >
              Restablecer
            </button>
          )}
        </div>
      </div>

      {/* ── Chips Horizontales de Categorías ── */}
      <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-1">
        <button
          type="button"
          onClick={() => onFiltrosChange({ ...filtros, categoria: 'todas' })}
          className={[
            'px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer',
            filtros.categoria === 'todas'
              ? 'bg-primary text-white shadow-2xs'
              : 'bg-surface text-text-muted hover:text-text hover:bg-surface-subtle border border-border',
          ].join(' ')}
        >
          Todas las Categorías
        </button>

        {MODULE_CATEGORIES.map((cat) => {
          const esActiva = filtros.categoria === cat.id
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => onFiltrosChange({ ...filtros, categoria: cat.id })}
              className={[
                'px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer',
                esActiva
                  ? 'bg-primary text-white shadow-2xs'
                  : 'bg-surface text-text-muted hover:text-text hover:bg-surface-subtle border border-border',
              ].join(' ')}
            >
              {cat.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}

