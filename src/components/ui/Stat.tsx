import React from 'react'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'

export interface StatProps {
  title: string
  value: React.ReactNode
  change?: number | string
  changeType?: 'positive' | 'negative' | 'neutral'
  comparisonText?: string
  icon?: React.ReactNode
  helper?: string
  onClick?: () => void
  className?: string
}

export function Stat({
  title,
  value,
  change,
  changeType,
  comparisonText,
  icon,
  helper,
  onClick,
  className = '',
}: StatProps) {
  // Infer change type if numeric
  let resolvedType = changeType
  if (!resolvedType && typeof change === 'number') {
    resolvedType = change > 0 ? 'positive' : change < 0 ? 'negative' : 'neutral'
  } else if (!resolvedType) {
    resolvedType = 'neutral'
  }

  const changeStyles = {
    positive: 'text-success bg-success-soft border-success/20',
    negative: 'text-danger bg-danger-soft border-danger/20',
    neutral: 'text-text-muted bg-surface-subtle border-border-subtle',
  }

  const changeIcon = {
    positive: <TrendingUp className="w-3 h-3 shrink-0" aria-hidden="true" />,
    negative: <TrendingDown className="w-3 h-3 shrink-0" aria-hidden="true" />,
    neutral: <Minus className="w-3 h-3 shrink-0" aria-hidden="true" />,
  }

  return (
    <div
      onClick={onClick}
      className={[
        'p-4 sm:p-5 rounded-xl bg-surface border border-border shadow-card transition-all duration-200 flex flex-col justify-between',
        onClick ? 'hover:shadow-md hover:border-border-hover cursor-pointer' : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <div className="flex items-start justify-between gap-3">
        <span className="text-xs font-medium text-text-muted uppercase tracking-wider line-clamp-1">
          {title}
        </span>
        {icon && (
          <div className="w-8 h-8 rounded-lg bg-surface-subtle border border-border/50 flex items-center justify-center text-text-muted shrink-0">
            {icon}
          </div>
        )}
      </div>

      <div className="mt-2.5">
        <div className="text-2xl sm:text-3xl font-bold text-text font-heading tracking-tight leading-none">
          {value}
        </div>

        {(change !== undefined || comparisonText || helper) && (
          <div className="mt-2.5 flex items-center gap-2 flex-wrap text-xs">
            {change !== undefined && (
              <span
                className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md font-semibold border ${changeStyles[resolvedType]}`}
              >
                {changeIcon[resolvedType]}
                <span>
                  {typeof change === 'number' && change > 0 ? `+${change}%` : `${change}%`}
                </span>
              </span>
            )}
            {comparisonText && (
              <span className="text-text-muted truncate text-[11px]">{comparisonText}</span>
            )}
            {helper && !comparisonText && (
              <span className="text-text-muted truncate text-[11px]">{helper}</span>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

