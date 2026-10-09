import {
  Search,
  X,
  LayoutGrid,
  List,
  Tag,
  ChevronDown,
} from 'lucide-react'
import { CategoriaServicio, Empleado } from '@/types'

export interface ServiciosFiltros {
  busqueda: string
  categoriaId: number | 'todas'
  estado: 'todos' | 'activos' | 'inactivos'
  empleadoId: number | 'todos'
}

export interface ServiciosFiltrosBarProps {
  filtros: ServiciosFiltros
  onFiltrosChange: (filtros: ServiciosFiltros) => void
  categorias: CategoriaServicio[]
  empleados: Empleado[]
  totalServicios: number
  serviciosFiltrados: number
  vistaModo: 'grid' | 'tabla'
  onVistaModoChange: (modo: 'grid' | 'tabla') => void
  onAbrirGestionCategorias: () => void
}

export function ServiciosFiltrosBar({
  filtros,
  onFiltrosChange,
  categorias,
  empleados,
  totalServicios,
  serviciosFiltrados,
  vistaModo,
  onVistaModoChange,
  onAbrirGestionCategorias,
}: ServiciosFiltrosBarProps) {
  const tieneFiltrosActivos =
    filtros.busqueda.trim() !== '' ||
    filtros.categoriaId !== 'todas' ||
    filtros.estado !== 'todos' ||
    filtros.empleadoId !== 'todos'

  const limpiarFiltros = () => {
    onFiltrosChange({
      busqueda: '',
      categoriaId: 'todas',
      estado: 'todos',
      empleadoId: 'todos',
    })
  }

  return (
    <div className="space-y-3">
      {/* ── Main Toolbar ── */}
      <div className="p-3.5 rounded-2xl bg-surface border border-border shadow-2xs flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        <div className="flex flex-1 flex-col sm:flex-row gap-2.5 items-stretch sm:items-center">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
            <input
              type="text"
              placeholder="Buscar servicio por nombre, descripción o código..."
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
                  estado: e.target.value as 'todos' | 'activos' | 'inactivos',
                })
              }
              className="w-full sm:w-auto pl-3 pr-8 py-1.5 text-xs rounded-xl border border-border bg-surface-subtle text-text focus:outline-none focus:ring-2 focus:ring-primary appearance-none cursor-pointer"
            >
              <option value="todos">Todos los estados</option>
              <option value="activos">Solo activos</option>
              <option value="inactivos">Solo inactivos</option>
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-muted pointer-events-none" />
          </div>

          {/* Filtro por Profesional Asignado */}
          {empleados.length > 0 && (
            <div className="relative">
              <select
                value={filtros.empleadoId}
                onChange={(e) =>
                  onFiltrosChange({
                    ...filtros,
                    empleadoId:
                      e.target.value === 'todos' ? 'todos' : Number(e.target.value),
                  })
                }
                className="w-full sm:w-auto pl-3 pr-8 py-1.5 text-xs rounded-xl border border-border bg-surface-subtle text-text focus:outline-none focus:ring-2 focus:ring-primary appearance-none cursor-pointer"
              >
                <option value="todos">Cualquier especialista</option>
                {empleados.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.nombre}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-muted pointer-events-none" />
            </div>
          )}

          {tieneFiltrosActivos && (
            <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-surface border border-border text-[11px]">
              <span className="text-text-muted">
                {serviciosFiltrados} de {totalServicios}
              </span>
              <button
                type="button"
                onClick={limpiarFiltros}
                className="text-primary hover:underline font-semibold cursor-pointer ml-1"
              >
                Limpiar
              </button>
            </div>
          )}
        </div>

        {/* View Switcher & Category Manager Trigger */}
        <div className="flex items-center gap-2 justify-between sm:justify-end border-t sm:border-t-0 border-border-subtle pt-2 sm:pt-0">
          <button
            type="button"
            onClick={onAbrirGestionCategorias}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-xl border border-border hover:border-primary/40 text-text hover:text-primary bg-surface-subtle transition-all cursor-pointer font-medium"
            title="Administrar categorías del catálogo"
          >
            <Tag className="w-3.5 h-3.5 text-primary" />
            <span>Categorías</span>
          </button>

          {/* Mode Switcher: Grid vs Table */}
          <div className="inline-flex p-1 rounded-xl bg-surface-subtle border border-border">
            <button
              type="button"
              onClick={() => onVistaModoChange('grid')}
              className={[
                'p-1.5 rounded-lg transition-colors cursor-pointer',
                vistaModo === 'grid'
                  ? 'bg-surface text-primary shadow-2xs font-semibold'
                  : 'text-text-muted hover:text-text',
              ].join(' ')}
              aria-label="Vista en cuadrícula"
              title="Vista en tarjetas"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => onVistaModoChange('tabla')}
              className={[
                'p-1.5 rounded-lg transition-colors cursor-pointer',
                vistaModo === 'tabla'
                  ? 'bg-surface text-primary shadow-2xs font-semibold'
                  : 'text-text-muted hover:text-text',
              ].join(' ')}
              aria-label="Vista en tabla"
              title="Vista en lista detallada"
            >
              <List className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* ── Category Chips Bar ── */}
      {categorias.length > 0 && (
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-1">
          <button
            type="button"
            onClick={() => onFiltrosChange({ ...filtros, categoriaId: 'todas' })}
            className={[
              'px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer',
              filtros.categoriaId === 'todas'
                ? 'bg-primary text-white shadow-2xs'
                : 'bg-surface text-text-muted hover:text-text hover:bg-surface-subtle border border-border',
            ].join(' ')}
          >
            Todas ({totalServicios})
          </button>

          {categorias.map((cat) => {
            const esActiva = filtros.categoriaId === cat.id
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => onFiltrosChange({ ...filtros, categoriaId: cat.id })}
                className={[
                  'px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5',
                  esActiva
                    ? 'bg-primary text-white shadow-2xs'
                    : 'bg-surface text-text-muted hover:text-text hover:bg-surface-subtle border border-border',
                ].join(' ')}
              >
                <span
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{ backgroundColor: cat.color || '#6366f1' }}
                />
                <span>{cat.nombre}</span>
              </button>
            )
          })}

          {tieneFiltrosActivos && (
            <button
              type="button"
              onClick={limpiarFiltros}
              className="text-xs text-text-muted hover:text-danger underline ml-2 cursor-pointer whitespace-nowrap"
            >
              Limpiar filtros
            </button>
          )}
        </div>
      )}
    </div>
  )
}

