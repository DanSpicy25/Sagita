import { useState, useMemo, useEffect } from 'react'
import {
  Calendar,
  Clock,
  User,
  Phone,
  Search,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ConciergeBell,
  Check,
  XCircle,
  DollarSign,
  Briefcase,
} from 'lucide-react'
import { Cita, EstadoCita } from '@/types'
import { Badge, Button, EmptyState, Pagination } from '@/components/ui'
import { useModules } from '@/context/ModulesContext'
import { useLongPress } from '@/hooks/useLongPress'

export interface VistaListaProps {
  citas: Cita[]
  onSeleccionarCita?: (cita: Cita) => void
  onLongPressCita?: (cita: Cita) => void
  onCancelarCita?: (id: number) => void
}

interface EstadoConfig {
  variant: 'warning' | 'success' | 'danger' | 'default' | 'info' | 'primary'
  label: string
  icon: React.ElementType
  borderClass: string
}

const estadoConfigs: Record<EstadoCita, EstadoConfig> = {
  confirmada: {
    variant: 'success',
    label: 'Confirmada',
    icon: CheckCircle2,
    borderClass: 'border-l-success',
  },
  pendiente: {
    variant: 'warning',
    label: 'Pendiente',
    icon: Clock,
    borderClass: 'border-l-warning',
  },
  en_atencion: {
    variant: 'info',
    label: 'En Atención',
    icon: Sparkles,
    borderClass: 'border-l-info',
  },
  en_cola: {
    variant: 'warning',
    label: 'En Cola',
    icon: ConciergeBell,
    borderClass: 'border-l-warning',
  },
  completada: {
    variant: 'default',
    label: 'Completada',
    icon: Check,
    borderClass: 'border-l-border-hover',
  },
  cancelada: {
    variant: 'danger',
    label: 'Cancelada',
    icon: XCircle,
    borderClass: 'border-l-danger',
  },
  no_asistio: {
    variant: 'danger',
    label: 'No Asistió',
    icon: AlertCircle,
    borderClass: 'border-l-danger',
  },
  reprogramada: {
    variant: 'info',
    label: 'Reprogramada',
    icon: Clock,
    borderClass: 'border-l-info',
  },
}

function CitaListItem({
  cita,
  onSeleccionar,
  onLongPress,
  onCancelar,
  servicioTerm,
  clienteTerm,
}: {
  cita: Cita
  onSeleccionar?: (c: Cita) => void
  onLongPress?: (c: Cita) => void
  onCancelar?: (id: number) => void
  servicioTerm: string
  clienteTerm: string
}) {
  const config = estadoConfigs[cita.estado] ?? {
    variant: 'default' as const,
    label: cita.estado,
    icon: Clock,
    borderClass: 'border-l-primary',
  }
  const StatusIcon = config.icon

  const { isPressing, progress, coords, handlers } = useLongPress({
    delay: 450,
    threshold: 10,
    onLongPress: () => {
      onLongPress?.(cita)
    },
    preventContextMenu: true,
  })

  const radius = 12
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference * (1 - progress)

  const horaInicio = cita.fecha_inicio.slice(11, 16) || '--:--'
  const fechaStr = new Date(cita.fecha_inicio).toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })

  return (
    <div
      {...handlers}
      onClick={() => onSeleccionar?.(cita)}
      className={[
        'card p-4 border border-border border-l-4 transition-all hover:border-primary/40 hover:shadow-card flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 cursor-pointer select-none group',
        config.borderClass,
      ].join(' ')}
      role="button"
      tabIndex={0}
      aria-label={`Cita para ${cita.cliente?.nombre || clienteTerm}, ${cita.servicio?.nombre || servicioTerm}`}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onSeleccionar?.(cita)
        }
      }}
    >
      <div className="flex items-start gap-3.5 min-w-0">
        {/* Bloque Hora */}
        <div className="w-14 h-14 rounded-2xl bg-surface-subtle text-primary border border-border flex flex-col items-center justify-center shrink-0 font-mono">
          <span className="text-xs font-bold leading-none">{horaInicio}</span>
          <span className="text-[10px] text-text-muted mt-1 leading-none">
            {cita.servicio?.duracion_base_min ?? 30}m
          </span>
        </div>

        {/* Detalles de la Cita */}
        <div className="min-w-0 space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <h4 className="font-bold text-sm text-text group-hover:text-primary transition-colors truncate">
              {cita.servicio?.nombre ?? servicioTerm}
            </h4>
            <Badge variant={config.variant} size="sm">
              <span className="inline-flex items-center gap-1">
                <StatusIcon className="w-3 h-3" />
                {config.label}
              </span>
            </Badge>
          </div>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-text-muted">
            <span className="flex items-center gap-1 text-text font-medium truncate">
              <User className="w-3.5 h-3.5 text-text-muted shrink-0" />
              {cita.cliente?.nombre ?? clienteTerm}
            </span>

            {cita.cliente?.telefono && (
              <a
                href={`tel:${cita.cliente.telefono}`}
                onClick={(e) => e.stopPropagation()}
                className="flex items-center gap-1 hover:text-primary transition-colors"
                title="Llamar al cliente"
              >
                <Phone className="w-3.5 h-3.5 text-text-muted shrink-0" />
                {cita.cliente.telefono}
              </a>
            )}

            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-text-muted shrink-0" />
              {fechaStr}
            </span>

            {cita.empleado?.nombre && (
              <span className="flex items-center gap-1">
                <Briefcase className="w-3.5 h-3.5 text-text-muted shrink-0" />
                {cita.empleado.nombre}
              </span>
            )}

            {cita.precio_total > 0 && (
              <span className="flex items-center gap-0.5 font-mono font-semibold text-text">
                <DollarSign className="w-3 h-3 text-text-muted" />
                {cita.precio_total}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Botones de acción */}
      <div
        className="flex items-center gap-2 w-full sm:w-auto justify-end pt-2 sm:pt-0 border-t sm:border-t-0 border-border"
        onClick={(e) => e.stopPropagation()}
      >
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onSeleccionar?.(cita)}
          className="text-xs font-semibold"
        >
          Detalles
        </Button>

        {cita.estado !== 'cancelada' && onCancelar && (
          <Button
            variant="danger"
            size="sm"
            onClick={() => onCancelar(cita.id)}
            className="text-xs font-semibold"
          >
            Cancelar
          </Button>
        )}
      </div>

      {/* Feedback visual de Long-Press en táctil */}
      {isPressing && (
        <div
          className="fixed pointer-events-none z-popover -translate-x-1/2 -translate-y-1/2"
          style={{ left: coords.x, top: coords.y }}
        >
          <svg className="w-10 h-10 -rotate-90 drop-shadow-md" viewBox="0 0 32 32">
            <circle cx="16" cy="16" r={radius} className="fill-surface/90 stroke-border/40" strokeWidth="2" />
            <circle
              cx="16"
              cy="16"
              r={radius}
              className="fill-none stroke-primary"
              strokeWidth="2.5"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
            />
          </svg>
        </div>
      )}
    </div>
  )
}

export function VistaLista({
  citas,
  onSeleccionarCita,
  onLongPressCita,
  onCancelarCita,
}: VistaListaProps) {
  const { tTerm } = useModules()
  const citasTerm = tTerm('citas', 'Citas')
  const clienteTerm = tTerm('cliente', 'Cliente')
  const servicioTerm = tTerm('servicio', 'Servicio')

  const [busqueda, setBusqueda] = useState('')
  const [filtroEstado, setFiltroEstado] = useState<string>('todos')
  const [pagina, setPagina] = useState(1)
  const ITEMS_POR_PAGINA = 8

  useEffect(() => {
    setPagina(1)
  }, [busqueda, filtroEstado])

  const citasFiltradas = useMemo(() => {
    return citas.filter((c) => {
      const coincideTexto =
        (c.cliente?.nombre || '').toLowerCase().includes(busqueda.toLowerCase()) ||
        (c.servicio?.nombre || '').toLowerCase().includes(busqueda.toLowerCase()) ||
        (c.empleado?.nombre || '').toLowerCase().includes(busqueda.toLowerCase())
      const coincideEstado = filtroEstado === 'todos' || c.estado === filtroEstado
      return coincideTexto && coincideEstado
    })
  }, [citas, busqueda, filtroEstado])

  const totalPaginas = Math.ceil(citasFiltradas.length / ITEMS_POR_PAGINA)
  const citasPaginadas = useMemo(() => {
    return citasFiltradas.slice((pagina - 1) * ITEMS_POR_PAGINA, pagina * ITEMS_POR_PAGINA)
  }, [citasFiltradas, pagina])

  return (
    <div className="space-y-4">
      {/* ── Barra de búsqueda y filtros rápidos de estado ── */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-text-muted absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder={`Buscar por ${clienteTerm.toLowerCase()}, ${servicioTerm.toLowerCase()}...`}
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="input-base pl-9 text-xs py-2 w-full"
          />
        </div>

        {/* Filtro por estado */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          {[
            { id: 'todos', label: 'Todos' },
            { id: 'pendiente', label: 'Pendiente' },
            { id: 'confirmada', label: 'Confirmada' },
            { id: 'en_atencion', label: 'En Atención' },
            { id: 'completada', label: 'Completada' },
            { id: 'cancelada', label: 'Cancelada' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setFiltroEstado(item.id)}
              className={[
                'px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer',
                filtroEstado === item.id
                  ? 'bg-primary text-white shadow-xs'
                  : 'bg-surface text-text-muted hover:bg-surface-subtle border border-border',
              ].join(' ')}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Listado de citas ── */}
      {citasFiltradas.length === 0 ? (
        <EmptyState
          title={`No se encontraron ${citasTerm.toLowerCase()}`}
          description="Intenta cambiar los filtros o los términos de búsqueda."
        />
      ) : (
        <>
          <div className="grid grid-cols-1 gap-2.5">
            {citasPaginadas.map((cita) => (
              <CitaListItem
                key={cita.id}
                cita={cita}
                onSeleccionar={onSeleccionarCita}
                onLongPress={onLongPressCita}
                onCancelar={onCancelarCita}
                servicioTerm={servicioTerm}
                clienteTerm={clienteTerm}
              />
            ))}
          </div>

          {totalPaginas > 1 && (
            <Pagination
              currentPage={pagina}
              totalPages={totalPaginas}
              onPageChange={setPagina}
              totalItems={citasFiltradas.length}
              itemsPerPage={ITEMS_POR_PAGINA}
            />
          )}
        </>
      )}
    </div>
  )
}
