import React from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Avatar } from './Avatar'

export interface CalendarHeaderProps {
  title: string
  subtitle?: string
  onPrev: () => void
  onNext: () => void
  onToday?: () => void
  viewMode?: 'day' | 'week' | 'month' | 'list'
  onViewModeChange?: (mode: 'day' | 'week' | 'month' | 'list') => void
  actions?: React.ReactNode
  className?: string
}

export function CalendarHeader({
  title,
  subtitle,
  onPrev,
  onNext,
  onToday,
  viewMode,
  onViewModeChange,
  actions,
  className = '',
}: CalendarHeaderProps) {
  return (
    <div
      className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border ${className}`}
    >
      <div className="flex items-center gap-2 sm:gap-3">
        <div>
          <h2 className="text-base sm:text-lg font-semibold text-text font-heading leading-tight">
            {title}
          </h2>
          {subtitle && <p className="text-xs text-text-muted mt-0.5">{subtitle}</p>}
        </div>

        <div className="flex items-center gap-1 ml-2">
          <button
            type="button"
            onClick={onPrev}
            aria-label="Anterior"
            className="p-1.5 rounded-lg border border-border text-text hover:bg-surface-subtle transition-colors cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          {onToday && (
            <button
              type="button"
              onClick={onToday}
              className="px-2.5 py-1 text-xs font-medium rounded-lg border border-border text-text hover:bg-surface-subtle transition-colors cursor-pointer"
            >
              Hoy
            </button>
          )}
          <button
            type="button"
            onClick={onNext}
            aria-label="Siguiente"
            className="p-1.5 rounded-lg border border-border text-text hover:bg-surface-subtle transition-colors cursor-pointer"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {viewMode && onViewModeChange && (
          <div className="inline-flex items-center p-0.5 bg-surface-subtle border border-border-subtle rounded-lg text-xs">
            {(['day', 'week', 'month', 'list'] as const).map((mode) => {
              const labels = { day: 'Día', week: 'Semana', month: 'Mes', list: 'Lista' }
              const isSelected = viewMode === mode
              return (
                <button
                  key={mode}
                  type="button"
                  onClick={() => onViewModeChange(mode)}
                  className={[
                    'px-2.5 py-1 font-medium rounded-md transition-all cursor-pointer capitalize',
                    isSelected
                      ? 'bg-surface text-text shadow-xs font-semibold'
                      : 'text-text-muted hover:text-text',
                  ].join(' ')}
                >
                  {labels[mode]}
                </button>
              )
            })}
          </div>
        )}
        {actions}
      </div>
    </div>
  )
}

export function CalendarGrid({
  columns = 7,
  children,
  className = '',
}: {
  columns?: number
  children: React.ReactNode
  className?: string
}) {
  return (
    <div
      className={`grid gap-px bg-border border border-border rounded-xl overflow-hidden ${className}`}
      style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
    >
      {children}
    </div>
  )
}

export function DayCell({
  dayNumber,
  isToday = false,
  isCurrentMonth = true,
  isSelected = false,
  onClick,
  children,
  className = '',
}: {
  dayNumber: number
  isToday?: boolean
  isCurrentMonth?: boolean
  isSelected?: boolean
  onClick?: () => void
  children?: React.ReactNode
  className?: string
}) {
  return (
    <div
      onClick={onClick}
      className={[
        'min-h-[90px] sm:min-h-[110px] p-1.5 sm:p-2 bg-surface transition-colors flex flex-col',
        isCurrentMonth ? 'text-text' : 'text-text-muted/40 bg-surface-subtle/30',
        isSelected ? 'ring-2 ring-inset ring-primary' : '',
        onClick ? 'cursor-pointer hover:bg-surface-subtle/50' : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <div className="flex items-center justify-between mb-1">
        <span
          className={[
            'w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold select-none',
            isToday
              ? 'bg-primary text-white shadow-xs'
              : 'text-text-muted',
          ].join(' ')}
        >
          {dayNumber}
        </span>
      </div>
      <div className="flex-1 space-y-1 overflow-hidden">{children}</div>
    </div>
  )
}

export function TimeSlotCell({
  time,
  isAvailable = true,
  isSelected = false,
  onClick,
  children,
  className = '',
}: {
  time: string
  isAvailable?: boolean
  isSelected?: boolean
  onClick?: () => void
  children?: React.ReactNode
  className?: string
}) {
  return (
    <div
      onClick={isAvailable ? onClick : undefined}
      className={[
        'p-2 min-h-[48px] border-b border-border-subtle bg-surface transition-colors flex items-start gap-2',
        isAvailable && onClick ? 'hover:bg-surface-subtle/70 cursor-pointer' : '',
        isSelected ? 'bg-primary-soft/40 border-l-2 border-l-primary' : '',
        !isAvailable ? 'opacity-40 bg-surface-subtle cursor-not-allowed' : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <span className="text-[11px] font-mono font-medium text-text-muted shrink-0 w-12 pt-0.5">
        {time}
      </span>
      <div className="flex-1 min-w-0">{children}</div>
    </div>
  )
}

export function AppointmentBadge({
  title,
  time,
  clientName,
  status,
  color = 'primary',
  onClick,
  className = '',
}: {
  title: string
  time?: string
  clientName?: string
  status?: string
  color?: 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'neutral'
  onClick?: (e: React.MouseEvent) => void
  className?: string
}) {
  const colorMap = {
    primary: 'bg-primary-soft border-primary/20 text-text hover:border-primary/40',
    success: 'bg-success-soft border-success/20 text-success hover:border-success/40',
    warning: 'bg-warning-soft border-warning/20 text-warning hover:border-warning/40',
    danger: 'bg-danger-soft border-danger/20 text-danger hover:border-danger/40',
    info: 'bg-info-soft border-info/20 text-info hover:border-info/40',
    neutral: 'bg-surface-subtle border-border text-text hover:border-border-hover',
  }

  return (
    <div
      onClick={onClick}
      title={status ? `${title} (${status})` : title}
      className={[
        'px-2 py-1 rounded-md text-xs border truncate shadow-xs transition-all select-none',
        colorMap[color],
        onClick ? 'cursor-pointer hover:shadow-sm' : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <div className="font-semibold truncate leading-tight">{title}</div>
      {(time || clientName) && (
        <div className="text-[10px] text-text-muted truncate mt-0.5 flex items-center gap-1.5">
          {time && <span className="font-mono">{time}</span>}
          {clientName && <span className="truncate">{clientName}</span>}
        </div>
      )}
    </div>
  )
}

export function ResourceColumn({
  name,
  role,
  avatarSrc,
  className = '',
}: {
  name: string
  role?: string
  avatarSrc?: string
  className?: string
}) {
  return (
    <div
      className={`p-3 bg-surface border-b border-border flex items-center gap-2.5 ${className}`}
    >
      <Avatar src={avatarSrc} name={name} size="sm" />
      <div className="min-w-0">
        <h4 className="text-xs font-semibold text-text truncate">{name}</h4>
        {role && <p className="text-[11px] text-text-muted truncate">{role}</p>}
      </div>
    </div>
  )
}
