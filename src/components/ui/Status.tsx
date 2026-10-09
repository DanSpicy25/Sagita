export type StatusType =
  | 'active'
  | 'inactive'
  | 'pending'
  | 'confirmed'
  | 'completed'
  | 'cancelled'
  | 'in_progress'
  | 'warning'
  | 'draft'

export interface StatusProps {
  status: StatusType
  label?: string
  size?: 'sm' | 'md'
  showDot?: boolean
  className?: string
}

const statusConfig: Record<
  StatusType,
  { defaultLabel: string; dotClass: string; bgClass: string; textClass: string; borderClass: string }
> = {
  active: {
    defaultLabel: 'Activo',
    dotClass: 'bg-success',
    bgClass: 'bg-success-soft',
    textClass: 'text-success',
    borderClass: 'border-success/20',
  },
  inactive: {
    defaultLabel: 'Inactivo',
    dotClass: 'bg-text-muted',
    bgClass: 'bg-surface-subtle',
    textClass: 'text-text-muted',
    borderClass: 'border-border',
  },
  pending: {
    defaultLabel: 'Pendiente',
    dotClass: 'bg-warning',
    bgClass: 'bg-warning-soft',
    textClass: 'text-warning',
    borderClass: 'border-warning/20',
  },
  confirmed: {
    defaultLabel: 'Confirmado',
    dotClass: 'bg-primary',
    bgClass: 'bg-primary-soft',
    textClass: 'text-primary',
    borderClass: 'border-primary/20',
  },
  completed: {
    defaultLabel: 'Completado',
    dotClass: 'bg-success',
    bgClass: 'bg-success-soft',
    textClass: 'text-success',
    borderClass: 'border-success/20',
  },
  cancelled: {
    defaultLabel: 'Cancelado',
    dotClass: 'bg-danger',
    bgClass: 'bg-danger-soft',
    textClass: 'text-danger',
    borderClass: 'border-danger/20',
  },
  in_progress: {
    defaultLabel: 'En Proceso',
    dotClass: 'bg-info',
    bgClass: 'bg-info-soft',
    textClass: 'text-info',
    borderClass: 'border-info/20',
  },
  warning: {
    defaultLabel: 'Atención',
    dotClass: 'bg-warning',
    bgClass: 'bg-warning-soft',
    textClass: 'text-warning',
    borderClass: 'border-warning/20',
  },
  draft: {
    defaultLabel: 'Borrador',
    dotClass: 'bg-secondary',
    bgClass: 'bg-secondary-soft',
    textClass: 'text-secondary',
    borderClass: 'border-border',
  },
}

export function Status({
  status,
  label,
  size = 'md',
  showDot = true,
  className = '',
}: StatusProps) {
  const config = statusConfig[status] || statusConfig.draft
  const displayLabel = label || config.defaultLabel

  return (
    <span
      className={[
        'inline-flex items-center rounded-full font-medium border select-none',
        config.bgClass,
        config.textClass,
        config.borderClass,
        size === 'sm' ? 'px-2 py-0.5 text-[11px] gap-1.5' : 'px-2.5 py-0.5 text-xs gap-2',
        className,
      ].join(' ')}
    >
      {showDot && (
        <span
          className={`w-1.5 h-1.5 rounded-full shrink-0 ${config.dotClass}`}
          aria-hidden="true"
        />
      )}
      <span>{displayLabel}</span>
    </span>
  )
}
