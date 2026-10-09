import React from 'react'
import { Info, CheckCircle2, AlertTriangle, AlertCircle, X } from 'lucide-react'

export type AlertVariant = 'info' | 'success' | 'warning' | 'danger'

export interface AlertProps {
  variant?: AlertVariant
  title?: React.ReactNode
  children?: React.ReactNode
  icon?: React.ReactNode
  action?: React.ReactNode
  onClose?: () => void
  className?: string
}

const variantStyles: Record<
  AlertVariant,
  { container: string; icon: React.ReactNode; text: string; title: string }
> = {
  info: {
    container: 'bg-info-soft border-info/25 text-info',
    icon: <Info className="w-5 h-5 text-info shrink-0" aria-hidden="true" />,
    text: 'text-text',
    title: 'text-info font-semibold',
  },
  success: {
    container: 'bg-success-soft border-success/25 text-success',
    icon: <CheckCircle2 className="w-5 h-5 text-success shrink-0" aria-hidden="true" />,
    text: 'text-text',
    title: 'text-success font-semibold',
  },
  warning: {
    container: 'bg-warning-soft border-warning/25 text-warning',
    icon: <AlertTriangle className="w-5 h-5 text-warning shrink-0" aria-hidden="true" />,
    text: 'text-text',
    title: 'text-warning font-semibold',
  },
  danger: {
    container: 'bg-danger-soft border-danger/25 text-danger',
    icon: <AlertCircle className="w-5 h-5 text-danger shrink-0" aria-hidden="true" />,
    text: 'text-text',
    title: 'text-danger font-semibold',
  },
}

export function Alert({
  variant = 'info',
  title,
  children,
  icon,
  action,
  onClose,
  className = '',
}: AlertProps) {
  const current = variantStyles[variant]

  return (
    <div
      role="alert"
      className={[
        'flex items-start gap-3 p-3.5 sm:p-4 rounded-[20px] border shadow-xs transition-all duration-150 backdrop-blur-md',
        current.container,
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <div className="shrink-0 pt-0.5">{icon || current.icon}</div>
      <div className="flex-1 min-w-0 text-xs sm:text-sm">
        {title && <h4 className={`text-sm ${current.title} leading-snug`}>{title}</h4>}
        {children && <div className={`${title ? 'mt-1' : ''} ${current.text} leading-relaxed`}>{children}</div>}
      </div>
      {action && <div className="shrink-0 ml-2">{action}</div>}
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          aria-label="Cerrar alerta"
          className="shrink-0 p-1 rounded-full text-text-muted hover:text-text hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  )
}

