import React from 'react'

export type TimelineItemStatus = 'default' | 'success' | 'warning' | 'danger' | 'info' | 'primary'

export interface TimelineItem {
  id: string | number
  title: React.ReactNode
  description?: React.ReactNode
  timestamp?: React.ReactNode
  icon?: React.ReactNode
  status?: TimelineItemStatus
  tag?: React.ReactNode
}

export interface TimelineProps {
  items: TimelineItem[]
  className?: string
}

const statusColors: Record<TimelineItemStatus, { dot: string; line: string; ring: string }> = {
  default: { dot: 'bg-text-muted', line: 'bg-border', ring: 'ring-surface-subtle' },
  primary: { dot: 'bg-primary', line: 'bg-primary/20', ring: 'ring-primary-soft' },
  success: { dot: 'bg-success', line: 'bg-success/20', ring: 'ring-success-soft' },
  warning: { dot: 'bg-warning', line: 'bg-warning/20', ring: 'ring-warning-soft' },
  danger: { dot: 'bg-danger', line: 'bg-danger/20', ring: 'ring-danger-soft' },
  info: { dot: 'bg-info', line: 'bg-info/20', ring: 'ring-info-soft' },
}

export function Timeline({ items, className = '' }: TimelineProps) {
  if (items.length === 0) return null

  return (
    <div className={`relative space-y-6 ${className}`}>
      {items.map((item, index) => {
        const isLast = index === items.length - 1
        const currentStatus = item.status || 'default'
        const colors = statusColors[currentStatus]

        return (
          <div key={item.id} className="relative flex items-start gap-3.5 group">
            {/* Connecting line */}
            {!isLast && (
              <span
                className={`absolute left-[11px] top-6 -bottom-6 w-0.5 ${colors.line}`}
                aria-hidden="true"
              />
            )}

            {/* Icon / Dot badge */}
            <div
              className={`relative z-10 w-6 h-6 rounded-full flex items-center justify-center shrink-0 ring-4 ${colors.ring} ${colors.dot} text-white shadow-xs`}
            >
              {item.icon ? (
                <span className="w-3 h-3 flex items-center justify-center">{item.icon}</span>
              ) : (
                <span className="w-1.5 h-1.5 rounded-full bg-white" />
              )}
            </div>

            {/* Content block */}
            <div className="flex-1 min-w-0 pt-0.5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <h4 className="text-xs sm:text-sm font-semibold text-text leading-tight">
                    {item.title}
                  </h4>
                  {item.tag && <div className="shrink-0">{item.tag}</div>}
                </div>
                {item.timestamp && (
                  <span className="text-[11px] text-text-muted font-mono shrink-0">
                    {item.timestamp}
                  </span>
                )}
              </div>

              {item.description && (
                <div className="mt-1 text-xs text-text-muted leading-relaxed">
                  {item.description}
                </div>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}

