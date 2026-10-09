import { useNavigate } from 'react-router-dom'
import {
  CalendarDays,
  Clock,
  User,
  Phone,
  ShoppingCart,
  RefreshCw,
  XCircle,
  Play,
  CheckCircle2,
  Receipt,
  FileText,
  Eye,
} from 'lucide-react'
import { Cita, EstadoCita } from '@/types'
import { BottomSheet, Button, Badge } from '@/components/ui'
import { getEstadoConfig } from './CitaBlock'

export interface MobileCitaPreviewSheetProps {
  cita: Cita | null
  isOpen: boolean
  onClose: () => void
  onDetalles?: (cita: Cita) => void
  onCambiarEstado?: (id: number, nuevoEstado: EstadoCita) => void
  onReprogramar?: (cita: Cita) => void
  onCancelar?: (id: number) => void
  onCancelarCita?: (id: number) => void
  onCobrar?: (cita: Cita) => void
  onVerFactura?: (cita: Cita) => void
}

export function MobileCitaPreviewSheet({
  cita,
  isOpen,
  onClose,
  onDetalles,
  onCambiarEstado,
  onReprogramar,
  onCancelar,
  onCancelarCita,
  onCobrar,
  onVerFactura,
}: MobileCitaPreviewSheetProps) {
  const navigate = useNavigate()

  if (!cita) return null

  const config = getEstadoConfig(cita.estado)
  const StatusIcon = config.icon

  const horaInicio = cita.fecha_inicio.slice(11, 16) || '--:--'
  const horaFin = cita.fecha_fin ? cita.fecha_fin.slice(11, 16) : ''
  const fechaStr = new Date(cita.fecha_inicio).toLocaleDateString('es-ES', {
    weekday: 'long',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })

  const handleCancelar = (id: number) => {
    if (onCancelar) {
      onCancelar(id)
    } else if (onCancelarCita) {
      onCancelarCita(id)
    }
  }

  return (
    <BottomSheet
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2">
          <span>{cita.servicio?.nombre || 'Detalle de Cita'}</span>
          <Badge variant="primary" size="sm" className="font-mono">
            #CIT-{String(cita.id).padStart(4, '0')}
          </Badge>
        </div>
      }
      description={`${fechaStr} • ${horaInicio}${horaFin ? ` - ${horaFin}` : ''}`}
    >
      <div className="space-y-4 py-2 text-xs">
        {/* ── Status Banner Card ── */}
        <div
          className={`p-3 rounded-xl border flex items-center justify-between gap-2 ${config.bgClass} ${config.borderClass} border-l-4`}
        >
          <div className="flex items-center gap-2">
            <StatusIcon className={`w-4 h-4 ${config.textClass}`} />
            <div>
              <span className="font-bold text-text">{config.label}</span>
              <p className="text-[11px] text-text-muted mt-0.5">
                Importe estimado: <strong className="text-text font-mono">${cita.precio_total}</strong>
              </p>
            </div>
          </div>

          <span className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded ${config.badgeClass}`}>
            {config.label}
          </span>
        </div>

        {/* ── Info Grid ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Cliente */}
          <div className="p-3 rounded-xl bg-surface border border-border space-y-1">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-text-muted flex items-center gap-1">
              <User className="w-3 h-3 text-primary" /> Cliente
            </span>
            <p className="font-semibold text-text text-sm truncate">
              {cita.cliente?.nombre || 'Sin cliente asignado'}
            </p>
            {cita.cliente?.telefono && (
              <a
                href={`tel:${cita.cliente.telefono}`}
                className="inline-flex items-center gap-1 text-[11px] text-primary hover:underline font-mono"
              >
                <Phone className="w-3 h-3" />
                <span>{cita.cliente.telefono}</span>
              </a>
            )}
          </div>

          {/* Profesional & Horario */}
          <div className="p-3 rounded-xl bg-surface border border-border space-y-1">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-text-muted flex items-center gap-1">
              <Clock className="w-3 h-3 text-primary" /> Profesional
            </span>
            <p className="font-semibold text-text text-sm truncate">
              {cita.empleado?.nombre || 'Cualquiera disponible'}
            </p>
            <p className="text-[11px] text-text-muted flex items-center gap-1 font-mono">
              <CalendarDays className="w-3 h-3" />
              <span>{horaInicio} - {horaFin || 'Fin no especificado'}</span>
            </p>
          </div>
        </div>

        {/* Notas si existen */}
        {cita.notas && (
          <div className="p-3 rounded-xl bg-surface-subtle/60 border border-border text-text space-y-1">
            <span className="text-[10px] font-semibold uppercase text-text-muted flex items-center gap-1">
              <FileText className="w-3 h-3" /> Notas de mostrador
            </span>
            <p className="text-xs text-text-muted italic">{cita.notas}</p>
          </div>
        )}

        {/* ── Acciones Operativas Contextuales ── */}
        <div className="pt-2 space-y-2">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-text-muted block px-1">
            Acciones Rápidas
          </span>

          <div className="grid grid-cols-2 gap-2">
            {/* Cobrar en POS */}
            <Button
              variant="primary"
              size="sm"
              leftIcon={<ShoppingCart className="w-4 h-4 text-white" />}
              onClick={() => {
                onClose()
                if (onCobrar) {
                  onCobrar(cita)
                } else {
                  navigate(`/ventas?cita_id=${cita.id}`)
                }
              }}
              className="w-full justify-center shadow-xs"
            >
              Cobrar en POS
            </Button>

            {/* Iniciar o Completar Atención */}
            {cita.estado === 'confirmada' || cita.estado === 'pendiente' ? (
              <Button
                variant="secondary"
                size="sm"
                leftIcon={<Play className="w-4 h-4 text-primary" />}
                onClick={() => {
                  onClose()
                  onCambiarEstado?.(cita.id, 'en_atencion')
                }}
                className="w-full justify-center"
              >
                Iniciar Atención
              </Button>
            ) : cita.estado === 'en_atencion' ? (
              <Button
                variant="secondary"
                size="sm"
                leftIcon={<CheckCircle2 className="w-4 h-4 text-success" />}
                onClick={() => {
                  onClose()
                  onCambiarEstado?.(cita.id, 'completada')
                }}
                className="w-full justify-center"
              >
                Completar Cita
              </Button>
            ) : (
              <Button
                variant="secondary"
                size="sm"
                leftIcon={<Receipt className="w-4 h-4 text-primary" />}
                onClick={() => {
                  onClose()
                  onVerFactura?.(cita)
                }}
                className="w-full justify-center"
              >
                Ver Factura
              </Button>
            )}

            {/* Reprogramar Cita */}
            <Button
              variant="outline"
              size="sm"
              leftIcon={<RefreshCw className="w-4 h-4" />}
              onClick={() => {
                onClose()
                onReprogramar?.(cita)
              }}
              className="w-full justify-center"
            >
              Reprogramar
            </Button>

            {/* Ver detalles completos */}
            {onDetalles && (
              <Button
                variant="outline"
                size="sm"
                leftIcon={<Eye className="w-4 h-4" />}
                onClick={() => {
                  onClose()
                  onDetalles(cita)
                }}
                className="w-full justify-center"
              >
                Ver Ficha
              </Button>
            )}

            {/* Cancelar Cita */}
            {cita.estado !== 'cancelada' && (
              <Button
                variant="ghost"
                size="sm"
                leftIcon={<XCircle className="w-4 h-4 text-danger" />}
                onClick={() => {
                  onClose()
                  handleCancelar(cita.id)
                }}
                className="w-full justify-center text-danger hover:bg-danger-soft hover:text-danger col-span-2 sm:col-span-1"
              >
                Cancelar Cita
              </Button>
            )}
          </div>
        </div>
      </div>
    </BottomSheet>
  )
}

