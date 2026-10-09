import { useState } from 'react'
import {
  Clock,
  DollarSign,
  Edit2,
  Copy,
  Trash2,
  DoorOpen,
  Eye,
  EyeOff,
  Sparkles,
  ChevronDown,
  Layers,
  Users,
} from 'lucide-react'
import { Servicio, Empleado } from '@/types'
import { Switch, Tooltip } from '@/components/ui'

export interface ServicioCardProps {
  servicio: Servicio
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

export function ServicioCard({
  servicio,
  empleados,
  onEditar,
  onDuplicar,
  onToggleActivo,
  onEliminar,
}: ServicioCardProps) {
  const [variantesAbiertas, setVariantesAbiertas] = useState(false)

  // Empleados compatibles
  const empleadosAsignados = empleados.filter((e) =>
    (servicio.empleados_compatibles_ids || []).includes(e.id)
  )

  // Cálculo de rango de precios de subservicios / variantes
  const duraciones = servicio.duraciones || []
  let precioTexto = formatPrice(servicio.precio_base)
  if (duraciones.length > 0) {
    const precios = [servicio.precio_base, ...duraciones.map((d) => d.precio)]
    const minPrecio = Math.min(...precios)
    const maxPrecio = Math.max(...precios)
    if (minPrecio !== maxPrecio) {
      precioTexto = `${formatPrice(minPrecio)} – ${formatPrice(maxPrecio)}`
    }
  }

  // Buffers
  const totalBuffer = (servicio.buffer_antes_min || 0) + (servicio.buffer_despues_min || 0)

  return (
    <div
      className={[
        'rounded-2xl border transition-all duration-200 flex flex-col justify-between overflow-hidden shadow-2xs hover:shadow-xs group',
        servicio.activo
          ? 'bg-surface border-border hover:border-border-hover'
          : 'bg-surface-subtle/60 border-border/60 opacity-80',
      ].join(' ')}
    >
      <div className="p-4 sm:p-5 space-y-3.5">
        {/* ── 1. Header: Icon, Category, Status & Price ── */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white shadow-2xs shrink-0"
              style={{ backgroundColor: servicio.color || '#6366f1' }}
            >
              <Sparkles className="w-5 h-5" />
            </div>

            <div className="min-w-0">
              <h3 className="font-bold font-heading text-sm sm:text-base text-text truncate group-hover:text-primary transition-colors">
                {servicio.nombre}
              </h3>
              <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                {servicio.categoria && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-medium text-text-muted">
                    <span
                      className="w-2 h-2 rounded-full shrink-0"
                      style={{ backgroundColor: servicio.categoria.color || '#6366f1' }}
                    />
                    <span className="truncate max-w-[120px]">{servicio.categoria.nombre}</span>
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="text-right shrink-0">
            <span className="text-base sm:text-lg font-bold font-heading text-text block leading-tight">
              {precioTexto}
            </span>
            <span className="text-[10px] text-text-muted">
              {duraciones.length > 0 ? `${duraciones.length + 1} variantes` : 'Precio único'}
            </span>
          </div>
        </div>

        {/* ── 2. Description ── */}
        {servicio.descripcion && (
          <p className="text-xs text-text-muted line-clamp-2 leading-relaxed">
            {servicio.descripcion}
          </p>
        )}

        {/* ── 3. Duración, Buffers & Recursos ── */}
        <div className="flex flex-wrap items-center gap-2 pt-1 text-xs text-text-muted">
          <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-surface-subtle border border-border text-[11px] font-medium text-text">
            <Clock className="w-3 h-3 text-primary shrink-0" />
            <span>{servicio.duracion_base_min} min</span>
            {totalBuffer > 0 && (
              <span className="text-[10px] text-text-muted">
                (+{totalBuffer}m buffer)
              </span>
            )}
          </div>

          {servicio.recurso_requerido_tipo && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-secondary-soft border border-border text-[11px] font-medium text-text capitalize">
              <DoorOpen className="w-3 h-3 text-secondary" />
              <span>{servicio.recurso_requerido_tipo}</span>
            </span>
          )}

          {servicio.requiere_deposito && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-warning-soft border border-warning/20 text-[11px] font-semibold text-warning">
              <DollarSign className="w-3 h-3" />
              <span>
                Seña {servicio.tipo_deposito === 'porcentaje' ? `${servicio.monto_deposito}%` : `$${servicio.monto_deposito}`}
              </span>
            </span>
          )}

          {servicio.visible_portal_publico ? (
            <span className="inline-flex items-center gap-1 text-[10px] text-success font-medium">
              <Eye className="w-3 h-3" /> Portal web
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-[10px] text-text-muted">
              <EyeOff className="w-3 h-3" /> Privado
            </span>
          )}
        </div>

        {/* ── 4. Subservicios / Variantes de Duración (Collapsible) ── */}
        {duraciones.length > 0 && (
          <div className="pt-2 border-t border-border-subtle">
            <button
              type="button"
              onClick={() => setVariantesAbiertas(!variantesAbiertas)}
              className="w-full flex items-center justify-between text-xs font-semibold text-text-muted hover:text-text py-0.5 cursor-pointer"
            >
              <span className="flex items-center gap-1.5 text-[11px]">
                <Layers className="w-3 h-3 text-primary" />
                <span>Variantes de duración ({duraciones.length})</span>
              </span>
              <ChevronDown
                className={`w-3.5 h-3.5 transition-transform duration-200 ${
                  variantesAbiertas ? 'rotate-180' : ''
                }`}
              />
            </button>

            {variantesAbiertas && (
              <div className="mt-2 space-y-1.5 animate-slide-down">
                <div className="flex items-center justify-between p-1.5 px-2 rounded-lg bg-surface-subtle text-xs border border-border">
                  <span className="text-[11px] font-medium text-text">
                    Estándar (Base)
                  </span>
                  <span className="text-[11px] font-semibold text-text font-mono">
                    {servicio.duracion_base_min}m • {formatPrice(servicio.precio_base)}
                  </span>
                </div>
                {duraciones.map((d) => (
                  <div
                    key={d.id}
                    className="flex items-center justify-between p-1.5 px-2 rounded-lg bg-surface-subtle text-xs border border-border"
                  >
                    <span className="text-[11px] font-medium text-text truncate max-w-[150px]">
                      {d.etiqueta || `Variante ${d.duracion_min} min`}
                    </span>
                    <span className="text-[11px] font-semibold text-text font-mono shrink-0">
                      {d.duracion_min}m • {formatPrice(d.precio)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── 5. Personal Asignado ── */}
        <div className="pt-2 border-t border-border-subtle flex items-center justify-between gap-2">
          <span className="text-[11px] text-text-muted flex items-center gap-1">
            <Users className="w-3 h-3" />
            <span>Personal:</span>
          </span>

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
            <span className="text-[10px] text-text-muted italic">
              Todo el equipo
            </span>
          )}
        </div>
      </div>

      {/* ── 6. Footer Actions Bar ── */}
      <div className="p-3 sm:px-4 border-t border-border bg-surface-subtle/40 flex items-center justify-between gap-2">
        {/* Toggle Activo Directo */}
        <div className="flex items-center gap-2">
          <Switch
            checked={servicio.activo}
            onChange={(checked) => onToggleActivo(servicio, checked)}
            aria-label={`Activar o desactivar servicio ${servicio.nombre}`}
          />
          <span className="text-[11px] font-medium text-text-muted">
            {servicio.activo ? 'Activo' : 'Inactivo'}
          </span>
        </div>

        {/* Botones de Acción */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => onDuplicar(servicio)}
            className="p-1.5 rounded-lg text-text-muted hover:text-text hover:bg-surface transition-colors cursor-pointer"
            title="Duplicar / Clonar servicio"
            aria-label="Duplicar servicio"
          >
            <Copy className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={() => onEditar(servicio)}
            className="p-1.5 rounded-lg text-text-muted hover:text-text hover:bg-surface transition-colors cursor-pointer"
            title="Editar configuración completa"
            aria-label="Editar servicio"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={() => onEliminar(servicio)}
            className="p-1.5 rounded-lg text-text-muted hover:text-danger hover:bg-danger-soft transition-colors cursor-pointer"
            title="Archivar o eliminar servicio"
            aria-label="Eliminar servicio"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  )
}

