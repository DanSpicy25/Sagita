import { useState } from 'react'
import { Calendar, Clock, User, Phone, Search } from 'lucide-react'
import { Cita, EstadoCita } from '@/types'
import { Badge, Button, EmptyState } from '@/components/ui'

interface VistaListaProps {
  citas: Cita[]
  onSeleccionarCita?: (cita: Cita) => void
  onCancelarCita?: (id: number) => void
}

const estadoBadges: Record<EstadoCita, { variant: 'warning' | 'success' | 'danger' | 'default' | 'info'; label: string }> = {
  pendiente: { variant: 'warning', label: 'Pendiente' },
  confirmada: { variant: 'success', label: 'Confirmada' },
  cancelada: { variant: 'danger', label: 'Cancelada' },
  completada: { variant: 'default', label: 'Completada' },
  no_asistio: { variant: 'danger', label: 'No asistió' },
}

export function VistaLista({ citas, onSeleccionarCita, onCancelarCita }: VistaListaProps) {
  const [busqueda, setBusqueda] = useState('')
  const [filtroEstado, setFiltroEstado] = useState<string>('todos')

  const citasFiltradas = citas.filter((c) => {
    const coincideTexto =
      c.cliente?.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      c.servicio?.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      c.empleado?.nombre.toLowerCase().includes(busqueda.toLowerCase())
    const coincideEstado = filtroEstado === 'todos' || c.estado === filtroEstado
    return coincideTexto && coincideEstado
  })

  return (
    <div className="space-y-4">
      {/* Filtros de búsqueda */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Buscar por cliente, servicio..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="input-base pl-9 text-xs py-2"
          />
        </div>

        {/* Filtro por estado */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          {['todos', 'pendiente', 'confirmada', 'completada', 'cancelada'].map((est) => (
            <button
              key={est}
              onClick={() => setFiltroEstado(est)}
              className={[
                'px-3 py-1.5 rounded-xl text-xs font-semibold capitalize whitespace-nowrap transition-colors',
                filtroEstado === est
                  ? 'bg-primary-600 text-white shadow-sm'
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700',
              ].join(' ')}
            >
              {est}
            </button>
          ))}
        </div>
      </div>

      {/* Lista de citas */}
      {citasFiltradas.length === 0 ? (
        <EmptyState
          title="No se encontraron citas"
          description="Intenta cambiar los filtros o los términos de búsqueda."
        />
      ) : (
        <div className="grid grid-cols-1 gap-3">
          {citasFiltradas.map((cita) => {
            const badge = estadoBadges[cita.estado] ?? { variant: 'default', label: cita.estado }
            return (
              <div
                key={cita.id}
                className="card p-4 hover:border-primary-300 dark:hover:border-primary-800 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
              >
                <div className="flex items-start gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-primary-50 dark:bg-primary-950/40 text-primary-600 dark:text-primary-400 flex items-center justify-center flex-shrink-0 font-bold text-sm">
                    {cita.fecha_inicio.slice(11, 16)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-sm text-slate-800 dark:text-slate-100">
                        {cita.servicio?.nombre ?? 'Servicio'}
                      </h4>
                      <Badge variant={badge.variant} dot>
                        {badge.label}
                      </Badge>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-xs text-slate-500 dark:text-slate-400">
                      <span className="flex items-center gap-1">
                        <User className="w-3.5 h-3.5" />
                        {cita.cliente?.nombre}
                      </span>
                      {cita.cliente?.telefono && (
                        <span className="flex items-center gap-1">
                          <Phone className="w-3.5 h-3.5" />
                          {cita.cliente.telefono}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {new Date(cita.fecha_inicio).toLocaleDateString('es-ES', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {cita.servicio?.duracion_base_min ?? 30} min
                      </span>
                    </div>
                  </div>
                </div>

                {/* Acciones */}
                <div className="flex items-center gap-2 w-full sm:w-auto justify-end pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-slate-800">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onSeleccionarCita?.(cita)}
                  >
                    Detalles
                  </Button>
                  {cita.estado !== 'cancelada' && onCancelarCita && (
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => onCancelarCita(cita.id)}
                    >
                      Cancelar
                    </Button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
