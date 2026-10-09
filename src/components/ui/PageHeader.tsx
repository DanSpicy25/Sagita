import React from 'react'
import { ArrowLeft } from 'lucide-react'
import { IconButton } from './IconButton'

export interface PageHeaderProps {
  title: React.ReactNode
  description?: React.ReactNode
  badge?: React.ReactNode
  breadcrumbs?: React.ReactNode
  onBack?: () => void
  backLabel?: string
  actions?: React.ReactNode
  className?: string
}

export function PageHeader({
  title,
  description,
  badge,
  breadcrumbs,
  onBack,
  backLabel = 'Regresar',
  actions,
  className = '',
}: PageHeaderProps) {
  return (
    <div className={`space-y-2 pb-5 border-b border-border-subtle ${className}`}>
      {breadcrumbs && <div className="mb-1">{breadcrumbs}</div>}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3 min-w-0">
          {onBack && (
            <IconButton
              icon={<ArrowLeft className="w-5 h-5" />}
              aria-label={backLabel}
              variant="ghost"
              size="sm"
              onClick={onBack}
              className="mt-0.5"
            />
          )}

          <div className="min-w-0">
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-bold text-text font-heading tracking-tight leading-tight">
                {title}
              </h1>
              {badge && <div className="shrink-0">{badge}</div>}
            </div>

            {description && (
              <p className="text-xs sm:text-sm text-text-muted mt-1 leading-relaxed max-w-2xl">
                {description}
              </p>
            )}
          </div>
        </div>

        {actions && (
          <div className="flex items-center gap-2.5 flex-wrap shrink-0 sm:self-center">
            {actions}
          </div>
        )}
      </div>
    </div>
  )
}

