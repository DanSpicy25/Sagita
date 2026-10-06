import { Search, Filter, X, ChevronDown } from 'lucide-react'
import type { EstadoCita } from '@/types'

export interface AgendaFiltros {
  busqueda: string
  empleadoId: number | 'todos'
  estado: EstadoCita | 'todos'
}

interface AgendaFiltrosBarProps {
  filtros: AgendaFiltros
  onFiltrosChange: (nuevosFiltros: AgendaFiltros) => void
  empleados: { id: number; nombre: string }[]
  totalCitas: number
  citasFiltradas: number
  citasTerm?: string
}

const ESTADOS_DISPONIBLES: { value: EstadoCita | 'todos'; label: string }[] = [
  { value: 'todos', label: 'Todos los estados' },
  { value: 'confirmada', label: 'Confirmada' },
  { value: 'pendiente', label: 'Pendiente' },
  { value: 'en_atencion', label: 'En atención' },
  { value: 'completada', label: 'Completada' },
  { value: 'cancelada', label: 'Cancelada' },
  { value: 'no_asistio', label: 'No asistió' },
]

export function AgendaFiltrosBar({
  filtros,
  onFiltrosChange,
  empleados,
  totalCitas,
  citasFiltradas,
  citasTerm = 'Citas',
}: AgendaFiltrosBarProps) {
  const tieneFiltrosActivos =
    filtros.busqueda.trim() !== '' ||
    filtros.empleadoId !== 'todos' ||
    filtros.estado !== 'todos'

  const limpiarFiltros = () => {
    onFiltrosChange({
      busqueda: '',
      empleadoId: 'todos',
      estado: 'todos',
    })
  }

  return (
    <div className="card p-3.5 border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between shadow-xs">
      <div className="flex flex-1 flex-col sm:flex-row gap-2.5 items-stretch sm:items-center">
        {/* Buscador de Cita / Cliente */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder={`Buscar ${citasTerm.toLowerCase()} por cliente, folio o servicio...`}
            value={filtros.busqueda}
            onChange={(e) => onFiltrosChange({ ...filtros, busqueda: e.target.value })}
            className="w-full pl-9 pr-4 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>

        {/* Filtro por Profesional / Especialista */}
        <div className="relative">
          <select
            value={filtros.empleadoId}
            onChange={(e) =>
              onFiltrosChange({
                ...filtros,
                empleadoId: e.target.value === 'todos' ? 'todos' : Number(e.target.value),
              })
            }
            className="w-full sm:w-auto pl-3 pr-8 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-primary-500 appearance-none"
          >
            <option value="todos">Todos los profesionales</option>
            {empleados.map((emp) => (
              <option key={emp.id} value={emp.id}>
                {emp.nombre}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
        </div>

        {/* Filtro por Estado */}
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
          <select
            value={filtros.estado}
            onChange={(e) =>
              onFiltrosChange({
                ...filtros,
                estado: e.target.value as EstadoCita | 'todos',
              })
            }
            className="w-full sm:w-auto pl-8 pr-8 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-primary-500 appearance-none"
          >
            {ESTADOS_DISPONIBLES.map((st) => (
              <option key={st.value} value={st.value}>
                {st.label}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
        </div>

        {tieneFiltrosActivos && (
          <button
            type="button"
            onClick={limpiarFiltros}
            className="flex items-center gap-1 px-2.5 py-1 text-xs text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-colors cursor-pointer shrink-0"
          >
            <X className="w-3.5 h-3.5" />
            Limpiar filtros
          </button>
        )}
      </div>

      {/* Contador de Citas Visibles */}
      <div className="text-right text-[11px] text-slate-400 shrink-0 font-medium">
        Mostrando <strong className="text-slate-700 dark:text-slate-300">{citasFiltradas}</strong> de{' '}
        <span>{totalCitas} {citasTerm.toLowerCase()}</span>
      </div>
    </div>
  )
}
