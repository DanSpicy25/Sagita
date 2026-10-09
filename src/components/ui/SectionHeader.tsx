import React from 'react'

export interface SectionHeaderProps {
  title: React.ReactNode
  description?: React.ReactNode
  action?: React.ReactNode
  badge?: React.ReactNode
  className?: string
}

export function SectionHeader({
  title,
  description,
  action,
  badge,
  className = '',
}: SectionHeaderProps) {
  return (
    <div className={`flex items-start justify-between gap-3 mb-4 pb-2 border-b border-border-subtle ${className}`}>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <h2 className="text-base font-semibold text-text font-heading leading-snug tracking-tight">
            {title}
          </h2>
          {badge && <div className="shrink-0">{badge}</div>}
        </div>
        {description && (
          <p className="text-xs text-text-muted mt-0.5 leading-relaxed">
            {description}
          </p>
        )}
      </div>
      {action && <div className="shrink-0 self-center">{action}</div>}
    </div>
  )
}

