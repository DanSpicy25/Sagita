import React, { useState } from 'react'
import {
  CheckCircle2,
  Clock,
  Check,
  XCircle,
  ConciergeBell,
  Sparkles,
  User,
  Scissors,
} from 'lucide-react'
import { Cita, EstadoCita } from '@/types'
import { useLongPress } from '@/hooks/useLongPress'

export interface CitaBlockProps {
  cita: Cita
  onClick?: (cita: Cita) => void
  onLongPress?: (cita: Cita) => void
  compact?: boolean
  className?: string
}

export function getEstadoConfig(estado: EstadoCita): {
  icon: React.ElementType
  label: string
  badgeClass: string
  borderClass: string
  bgClass: string
  textClass: string
} {
  switch (estado) {
    case 'confirmada':
      return {
        icon: CheckCircle2,
        label: 'Confirmada',
        badgeClass: 'bg-success-soft text-success border-success/30',
        borderClass: 'border-l-success',
        bgClass: 'bg-success-soft/20 hover:bg-success-soft/30',
        textClass: 'text-success',
      }
    case 'pendiente':
      return {
        icon: Clock,
        label: 'Pendiente',
        badgeClass: 'bg-warning-soft text-warning border-warning/30',
        borderClass: 'border-l-warning',
        bgClass: 'bg-warning-soft/20 hover:bg-warning-soft/30',
        textClass: 'text-warning',
      }
    case 'en_atencion':
      return {
        icon: Sparkles,
        label: 'En Atención',
        badgeClass: 'bg-info-soft text-info border-info/30',
        borderClass: 'border-l-info',
        bgClass: 'bg-info-soft/20 hover:bg-info-soft/30',
        textClass: 'text-info',
      }
    case 'en_cola':
      return {
        icon: ConciergeBell,
        label: 'En Cola',
        badgeClass: 'bg-warning-soft text-warning border-warning/30',
        borderClass: 'border-l-warning',
        bgClass: 'bg-warning-soft/20 hover:bg-warning-soft/30',
        textClass: 'text-warning',
      }
    case 'completada':
      return {
        icon: Check,
        label: 'Completada',
        badgeClass: 'bg-surface-subtle text-text-muted border-border',
        borderClass: 'border-l-border-hover',
        bgClass: 'bg-surface-subtle/50 hover:bg-surface-subtle/80 opacity-80',
        textClass: 'text-text-muted',
      }
    case 'cancelada':
    case 'no_asistio':
      return {
        icon: XCircle,
        label: estado === 'no_asistio' ? 'No Asistió' : 'Cancelada',
        badgeClass: 'bg-danger-soft text-danger border-danger/30',
        borderClass: 'border-l-danger',
        bgClass: 'bg-danger-soft/15 hover:bg-danger-soft/25 opacity-75',
        textClass: 'text-danger',
      }
    default:
      return {
        icon: Clock,
        label: String(estado),
        badgeClass: 'bg-surface text-text-muted border-border',
        borderClass: 'border-l-primary',
        bgClass: 'bg-primary-soft/20 hover:bg-primary-soft/30',
        textClass: 'text-primary',
      }
  }
}

export function CitaBlock({
  cita,
  onClick,
  onLongPress,
  compact = false,
  className = '',
}: CitaBlockProps) {
  const [showHoverPreview, setShowHoverPreview] = useState(false)
  const config = getEstadoConfig(cita.estado)
  const StatusIcon = config.icon

  const horaInicio = cita.fecha_inicio.slice(11, 16) || '--:--'
  const horaFin = cita.fecha_fin ? cita.fecha_fin.slice(11, 16) : ''

  // Manejo de pulsación sostenida (long-press) para móviles
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

  // ── Modalidad Compacta (para celda de Calendario Mensual) ──
  if (compact) {
    return (
      <div
        {...handlers}
        onClick={(e) => {
          e.stopPropagation()
          onClick?.(cita)
        }}
        onMouseEnter={() => setShowHoverPreview(true)}
        onMouseLeave={() => setShowHoverPreview(false)}
        className={[
          'relative text-[11px] font-medium px-1.5 py-0.5 rounded-md border-l-2 flex items-center justify-between gap-1 select-none transition-all cursor-pointer truncate',
          config.borderClass,
          config.bgClass,
          className,
        ]
          .filter(Boolean)
          .join(' ')}
        title={`${horaInicio} - ${cita.servicio?.nombre || 'Cita'} (${cita.cliente?.nombre || 'Cliente'})`}
      >
        <div className="flex items-center gap-1 min-w-0 truncate">
          <StatusIcon className={`w-3 h-3 shrink-0 ${config.textClass}`} aria-hidden="true" />
          <span className="font-mono text-[10px] font-semibold shrink-0 text-text">
            {horaInicio}
          </span>
          <span className="truncate text-text font-normal">
            {cita.servicio?.nombre || 'Cita'}
          </span>
        </div>

        {/* Feedback visual de Long-Press en táctil */}
        {isPressing && (
          <div
            className="fixed pointer-events-none z-popover -translate-x-1/2 -translate-y-1/2"
            style={{ left: coords.x, top: coords.y }}
          >
            <svg className="w-8 h-8 -rotate-90 drop-shadow-sm" viewBox="0 0 32 32">
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

  // ── Modalidad Normal (para Semanal y Diario) ──
  return (
    <div
      {...handlers}
      onClick={() => onClick?.(cita)}
      onMouseEnter={() => setShowHoverPreview(true)}
      onMouseLeave={() => setShowHoverPreview(false)}
      className={[
        'relative rounded-xl border border-border/80 border-l-[3.5px] p-2 sm:p-2.5 transition-all text-left shadow-2xs select-none cursor-pointer group active:scale-[0.99]',
        config.borderClass,
        config.bgClass,
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      role="button"
      tabIndex={0}
      aria-label={`Cita de ${cita.cliente?.nombre || 'Cliente'}, servicio ${cita.servicio?.nombre || ''}, estado ${config.label}`}
    >
      {/* Cabecera: Horario + Status Icon & Badge */}
      <div className="flex items-center justify-between gap-1 mb-1">
        <span className="font-mono text-[11px] font-bold text-text shrink-0 leading-tight">
          {horaInicio}{horaFin ? ` - ${horaFin}` : ''}
        </span>

        <div className="flex items-center gap-1 shrink-0">
          <StatusIcon className={`w-3 h-3 ${config.textClass}`} aria-hidden="true" />
          <span className={`text-[9px] font-semibold uppercase px-1 rounded ${config.badgeClass}`}>
            {config.label}
          </span>
        </div>
      </div>

      {/* Servicio Principal */}
      <div className="flex items-center gap-1 font-semibold text-xs text-text truncate">
        <Scissors className="w-3 h-3 text-text-muted shrink-0" aria-hidden="true" />
        <span className="truncate">{cita.servicio?.nombre || 'Servicio General'}</span>
      </div>

      {/* Cliente y Empleado */}
      <div className="mt-1 flex items-center justify-between text-[11px] text-text-muted gap-1">
        <span className="inline-flex items-center gap-1 truncate text-text/90 font-medium">
          <User className="w-2.5 h-2.5 text-text-muted shrink-0" />
          <span className="truncate">{cita.cliente?.nombre || 'Cliente'}</span>
        </span>

        {cita.empleado?.nombre && (
          <span className="truncate text-[10px] text-text-muted/80 max-w-[80px]">
            {cita.empleado.nombre.split(' ')[0]}
          </span>
        )}
      </div>

      {/* ── Hovercard Preview (Desktop) ── */}
      {showHoverPreview && !isPressing && (
        <div
          role="tooltip"
          className="hidden md:block absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-3 rounded-xl bg-surface-elevated text-text border border-border shadow-elevated z-popover pointer-events-none animate-scale-in text-xs"
        >
          <div className="flex items-center justify-between gap-1 pb-1.5 border-b border-border-subtle">
            <span className="font-mono font-bold text-text">
              {horaInicio} - {horaFin}
            </span>
            <span className={`text-[10px] font-semibold uppercase px-1 rounded ${config.badgeClass}`}>
              {config.label}
            </span>
          </div>

          <div className="mt-2 space-y-1">
            <p className="font-semibold text-text text-sm">
              {cita.servicio?.nombre || 'Servicio'}
            </p>
            <p className="text-text-muted text-[11px]">
              Cliente: <strong className="text-text">{cita.cliente?.nombre}</strong>
            </p>
            {cita.cliente?.telefono && (
              <p className="text-text-muted text-[10px]">
                Tel: {cita.cliente.telefono}
              </p>
            )}
            <p className="text-text-muted text-[11px]">
              Atiende: <strong className="text-text">{cita.empleado?.nombre || 'Sin asignar'}</strong>
            </p>
            <div className="pt-1 flex items-center justify-between font-mono font-bold text-primary">
              <span>Total</span>
              <span>${cita.precio_total}</span>
            </div>
          </div>
        </div>
      )}

      {/* ── Feedback visual de Long-Press en táctil ── */}
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

