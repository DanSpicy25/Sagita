import React from 'react'
import { FolderOpen } from 'lucide-react'
import { Button } from './Button'

export interface EmptyStateProps {
  icon?: React.ReactNode
  title: string
  description?: string
  actionLabel?: string
  onAction?: () => void
  action?: React.ReactNode
  secondaryAction?: React.ReactNode
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  action,
  secondaryAction,
  size = 'md',
  className = '',
}: EmptyStateProps) {
  const sizePadding = {
    sm: 'p-6 sm:p-8',
    md: 'p-8 sm:p-12',
    lg: 'p-12 sm:p-16',
  }

  const iconSizes = {
    sm: 'w-10 h-10',
    md: 'w-14 h-14',
    lg: 'w-16 h-16',
  }

  return (
    <div
      className={[
        'flex flex-col items-center justify-center text-center bg-surface rounded-2xl border border-dashed border-border transition-all duration-200',
        sizePadding[size],
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <div
        className={[
          'rounded-2xl bg-surface-subtle border border-border/60 flex items-center justify-center text-text-muted mb-4 shadow-xs',
          iconSizes[size],
        ].join(' ')}
      >
        {icon ?? <FolderOpen className="w-6 h-6 stroke-[1.5]" aria-hidden="true" />}
      </div>
      <h3 className="text-base font-semibold text-text tracking-tight font-heading max-w-md">
        {title}
      </h3>
      {description && (
        <p className="text-xs sm:text-sm text-text-muted mt-1.5 max-w-md leading-relaxed">
          {description}
        </p>
      )}

      {(action || (actionLabel && onAction) || secondaryAction) && (
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          {action ? (
            action
          ) : actionLabel && onAction ? (
            <Button onClick={onAction} size="sm">
              {actionLabel}
            </Button>
          ) : null}
          {secondaryAction}
        </div>
      )}
    </div>
  )
}
