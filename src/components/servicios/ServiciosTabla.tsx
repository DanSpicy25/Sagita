import {
  Clock,
  DoorOpen,
  Edit2,
  Copy,
  Trash2,
  Sparkles,
} from 'lucide-react'
import { Servicio, Empleado } from '@/types'
import { Switch, Tooltip } from '@/components/ui'

export interface ServiciosTablaProps {
  servicios: Servicio[]
  empleados: Empleado[]
  onEditar: (servicio: Servicio) => void
  onDuplicar: (servicio: Servicio) => void
  onToggleActivo: (servicio: Servicio, activo: boolean) => void
  onEliminar: (servicio: Servicio) => void
}

function formatPrice(n: number) {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(n)
}

export function ServiciosTabla({
  servicios,
  empleados,
  onEditar,
  onDuplicar,
  onToggleActivo,
  onEliminar,
}: ServiciosTablaProps) {
  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-surface shadow-2xs">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs divide-y divide-border-subtle">
          <thead className="bg-surface-subtle text-text-muted uppercase text-[10px] font-semibold tracking-wider">
            <tr>
              <th scope="col" className="px-4 py-3">Servicio</th>
              <th scope="col" className="px-4 py-3">Categoría</th>
              <th scope="col" className="px-4 py-3">Duración & Variantes</th>
              <th scope="col" className="px-4 py-3">Precio</th>
              <th scope="col" className="px-4 py-3">Recurso</th>
              <th scope="col" className="px-4 py-3">Personal</th>
              <th scope="col" className="px-4 py-3">Estado</th>
              <th scope="col" className="px-4 py-3 text-right">Acciones</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-border-subtle bg-surface">
            {servicios.map((serv) => {
              const duraciones = serv.duraciones || []
              const empleadosAsignados = empleados.filter((e) =>
                (serv.empleados_compatibles_ids || []).includes(e.id)
              )

              let precioTexto = formatPrice(serv.precio_base)
              if (duraciones.length > 0) {
                const precios = [serv.precio_base, ...duraciones.map((d) => d.precio)]
                const minPrecio = Math.min(...precios)
                const maxPrecio = Math.max(...precios)
                if (minPrecio !== maxPrecio) {
                  precioTexto = `${formatPrice(minPrecio)} – ${formatPrice(maxPrecio)}`
                }
              }

              return (
                <tr
                  key={serv.id}
                  className={[
                    'hover:bg-surface-subtle/50 transition-colors group',
                    !serv.activo ? 'opacity-70 bg-surface-subtle/20' : '',
                  ].join(' ')}
                >
                  {/* 1. Servicio: Nombre & descripción */}
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-2.5 min-w-[160px]">
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-white shadow-2xs shrink-0"
                        style={{ backgroundColor: serv.color || '#6366f1' }}
                      >
                        <Sparkles className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <span className="font-semibold text-text group-hover:text-primary transition-colors block truncate">
                          {serv.nombre}
                        </span>
                        {serv.descripcion && (
                          <span className="text-[11px] text-text-muted truncate block max-w-xs mt-0.5">
                            {serv.descripcion}
                          </span>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* 2. Categoría */}
                  <td className="px-4 py-3.5 whitespace-nowrap">
                    {serv.categoria ? (
                      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium bg-surface-subtle border border-border">
                        <span
                          className="w-2 h-2 rounded-full shrink-0"
                          style={{ backgroundColor: serv.categoria.color || '#6366f1' }}
                        />
                        <span>{serv.categoria.nombre}</span>
                      </span>
                    ) : (
                      <span className="text-text-muted italic">Sin categoría</span>
                    )}
                  </td>

                  {/* 3. Duración & Variantes */}
                  <td className="px-4 py-3.5 whitespace-nowrap">
                    <div className="flex flex-col gap-0.5">
                      <span className="font-medium text-text flex items-center gap-1">
                        <Clock className="w-3 h-3 text-primary shrink-0" />
                        {serv.duracion_base_min} min
                      </span>
                      {duraciones.length > 0 && (
                        <span className="text-[10px] text-primary font-medium">
                          +{duraciones.length} {duraciones.length === 1 ? 'variante' : 'variantes'}
                        </span>
                      )}
                    </div>
                  </td>

                  {/* 4. Precio */}
                  <td className="px-4 py-3.5 whitespace-nowrap">
                    <span className="font-bold text-text font-mono">
                      {precioTexto}
                    </span>
                  </td>

                  {/* 5. Recurso requerido */}
                  <td className="px-4 py-3.5 whitespace-nowrap">
                    {serv.recurso_requerido_tipo ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-medium text-text capitalize">
                        <DoorOpen className="w-3.5 h-3.5 text-secondary" />
                        {serv.recurso_requerido_tipo}
                      </span>
                    ) : (
                      <span className="text-text-muted">Cualquiera</span>
                    )}
                  </td>

                  {/* 6. Personal asignado */}
                  <td className="px-4 py-3.5 whitespace-nowrap">
                    {empleadosAsignados.length > 0 ? (
                      <div className="flex items-center -space-x-1.5 overflow-hidden">
                        {empleadosAsignados.slice(0, 3).map((emp) => (
                          <Tooltip key={emp.id} content={emp.nombre}>
                            <div className="w-6 h-6 rounded-full bg-primary-soft text-primary border border-surface text-[10px] font-bold flex items-center justify-center shrink-0 cursor-default">
                              {emp.nombre.charAt(0)}
                            </div>
                          </Tooltip>
                        ))}
                        {empleadosAsignados.length > 3 && (
                          <span className="w-6 h-6 rounded-full bg-surface-subtle border border-surface text-[9px] font-semibold text-text-muted flex items-center justify-center shrink-0">
                            +{empleadosAsignados.length - 3}
                          </span>
                        )}
                      </div>
                    ) : (
                      <span className="text-text-muted italic">Todo el equipo</span>
                    )}
                  </td>

                  {/* 7. Estado (Switch activo/inactivo) */}
                  <td className="px-4 py-3.5 whitespace-nowrap">
                    <div className="flex items-center gap-1.5">
                      <Switch
                        checked={serv.activo}
                        onChange={(checked) => onToggleActivo(serv, checked)}
                        aria-label={`Alternar estado de ${serv.nombre}`}
                      />
                      <span className="text-[11px] text-text-muted">
                        {serv.activo ? 'Activo' : 'Inactivo'}
                      </span>
                    </div>
                  </td>

                  {/* 8. Acciones */}
                  <td className="px-4 py-3.5 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        type="button"
                        onClick={() => onDuplicar(serv)}
                        className="p-1.5 rounded-lg text-text-muted hover:text-text hover:bg-surface-subtle transition-colors cursor-pointer"
                        title="Duplicar servicio"
                        aria-label="Duplicar servicio"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={() => onEditar(serv)}
                        className="p-1.5 rounded-lg text-text-muted hover:text-text hover:bg-surface-subtle transition-colors cursor-pointer"
                        title="Editar servicio"
                        aria-label="Editar servicio"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={() => onEliminar(serv)}
                        className="p-1.5 rounded-lg text-text-muted hover:text-danger hover:bg-danger-soft transition-colors cursor-pointer"
                        title="Archivar o eliminar"
                        aria-label="Eliminar servicio"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

