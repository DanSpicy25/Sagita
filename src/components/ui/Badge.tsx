import React from 'react'
import { X } from 'lucide-react'

export type BadgeVariant =
  | 'default'
  | 'primary'
  | 'secondary'
  | 'success'
  | 'warning'
  | 'danger'
  | 'error'
  | 'info'
  | 'outline'
export type BadgeSize = 'sm' | 'md'

export interface BadgeProps {
  children: React.ReactNode
  variant?: BadgeVariant
  size?: BadgeSize
  dot?: boolean
  onRemove?: () => void
  className?: string
  title?: string
}

const variants: Record<BadgeVariant, string> = {
  default: 'bg-surface-subtle text-text border border-border-subtle',
  primary: 'bg-primary-soft text-primary border border-primary/20',
  secondary: 'bg-secondary-soft text-secondary border border-border',
  success: 'bg-success-soft text-success border border-success/20',
  warning: 'bg-warning-soft text-warning border border-warning/20',
  danger: 'bg-danger-soft text-danger border border-danger/20',
  error: 'bg-danger-soft text-danger border border-danger/20',
  info: 'bg-info-soft text-info border border-info/20',
  outline: 'border border-border text-text bg-transparent',
}

const sizes: Record<BadgeSize, string> = {
  sm: 'px-2 py-0.5 text-[11px] gap-1',
  md: 'px-2.5 py-0.5 text-xs gap-1.5',
}

const dotColors: Record<BadgeVariant, string> = {
  default: 'bg-text-muted',
  primary: 'bg-primary',
  secondary: 'bg-secondary',
  success: 'bg-success',
  warning: 'bg-warning',
  danger: 'bg-danger',
  error: 'bg-danger',
  info: 'bg-info',
  outline: 'bg-text-muted',
}

export function Badge({
  children,
  variant = 'default',
  size = 'md',
  dot = false,
  onRemove,
  className = '',
  title,
}: BadgeProps) {
  return (
    <span
      title={title}
      className={[
        'inline-flex items-center rounded-full font-medium select-none',
        variants[variant],
        sizes[size],
        className,
      ].join(' ')}
    >
      {dot && <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${dotColors[variant]}`} aria-hidden="true" />}
      <span>{children}</span>
      {onRemove && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            onRemove()
          }}
          aria-label="Eliminar"
          className="ml-0.5 p-0.5 hover:bg-black/10 dark:hover:bg-white/10 rounded-full transition-colors cursor-pointer"
        >
          <X className="w-3 h-3" />
        </button>
      )}
    </span>
  )
}
