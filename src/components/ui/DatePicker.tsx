import React, { useState, useRef, useEffect } from 'react'
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react'

export interface DatePickerProps {
  value?: string // Formato YYYY-MM-DD
  onChange: (date: string) => void
  label?: string
  placeholder?: string
  minDate?: string
  maxDate?: string
  error?: string
  hint?: string
  disabled?: boolean
  className?: string
  presets?: { label: string; daysFromNow: number }[]
}

const MONTH_NAMES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
]

const DAYS_SHORT = ['Do', 'Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sá']

export function DatePicker({
  value,
  onChange,
  label,
  placeholder = 'Selecciona una fecha',
  minDate,
  maxDate,
  error,
  hint,
  disabled = false,
  className = '',
  presets = [
    { label: 'Hoy', daysFromNow: 0 },
    { label: 'Mañana', daysFromNow: 1 },
    { label: 'En 7 días', daysFromNow: 7 },
  ],
}: DatePickerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  // Parse initial view date
  const initialDate = value ? new Date(value + 'T00:00:00') : new Date()
  const [viewYear, setViewYear] = useState(initialDate.getFullYear())
  const [viewMonth, setViewMonth] = useState(initialDate.getMonth())

  useEffect(() => {
    if (value) {
      const d = new Date(value + 'T00:00:00')
      if (!isNaN(d.getTime())) {
        setViewYear(d.getFullYear())
        setViewMonth(d.getMonth())
      }
    }
  }, [value])

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false)
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      document.addEventListener('keydown', handleKeyDown)
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen])

  const handlePrevMonth = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (viewMonth === 0) {
      setViewMonth(11)
      setViewYear((y) => y - 1)
    } else {
      setViewMonth((m) => m - 1)
    }
  }

  const handleNextMonth = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (viewMonth === 11) {
      setViewMonth(0)
      setViewYear((y) => y + 1)
    } else {
      setViewMonth((m) => m + 1)
    }
  }

  const formatLocalDate = (year: number, month: number, day: number) => {
    const mm = String(month + 1).padStart(2, '0')
    const dd = String(day).padStart(2, '0')
    return `${year}-${mm}-${dd}`
  }

  // Generate days matrix
  const firstDayOfWeek = new Date(viewYear, viewMonth, 1).getDay()
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate()

  const todayStr = formatLocalDate(
    new Date().getFullYear(),
    new Date().getMonth(),
    new Date().getDate()
  )

  const handleSelectDay = (day: number) => {
    const formatted = formatLocalDate(viewYear, viewMonth, day)
    onChange(formatted)
    setIsOpen(false)
  }

  const handlePreset = (daysFromNow: number) => {
    const target = new Date()
    target.setDate(target.getDate() + daysFromNow)
    const formatted = formatLocalDate(
      target.getFullYear(),
      target.getMonth(),
      target.getDate()
    )
    onChange(formatted)
    setIsOpen(false)
  }

  // Format display text (e.g., "14 de Octubre de 2026")
  const formatDisplay = (valStr?: string) => {
    if (!valStr) return ''
    const parts = valStr.split('-')
    if (parts.length !== 3) return valStr
    const y = parseInt(parts[0], 10)
    const m = parseInt(parts[1], 10) - 1
    const d = parseInt(parts[2], 10)
    return `${d} de ${MONTH_NAMES[m]} ${y}`
  }

  return (
    <div className={`flex flex-col gap-1.5 w-full ${className}`} ref={containerRef}>
      {label && (
        <label className="text-xs font-semibold text-text tracking-wide block">
          {label}
        </label>
      )}

      <div className="relative">
        <button
          type="button"
          disabled={disabled}
          onClick={() => !disabled && setIsOpen(!isOpen)}
          aria-haspopup="dialog"
          aria-expanded={isOpen}
          className={[
            'w-full px-3 py-2 text-sm bg-surface text-text rounded-md border text-left flex items-center justify-between transition-all duration-150',
            'focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-offset-surface',
            'disabled:opacity-60 disabled:cursor-not-allowed disabled:bg-surface-subtle',
            error
              ? 'border-danger focus:border-danger focus:ring-danger/20 text-danger'
              : 'border-border hover:border-border-hover focus:border-primary focus:ring-primary-soft',
          ].join(' ')}
        >
          <span className={value ? 'text-text font-medium' : 'text-text-muted/60'}>
            {value ? formatDisplay(value) : placeholder}
          </span>
          <CalendarIcon className="w-4 h-4 text-text-muted shrink-0" aria-hidden="true" />
        </button>

        {isOpen && (
          <div
            role="dialog"
            aria-label="Calendario"
            className="absolute z-popover left-0 mt-1.5 w-72 rounded-xl bg-surface-elevated text-text border border-border shadow-elevated p-3 animate-fade-in"
          >
            {/* Quick Presets */}
            {presets && presets.length > 0 && (
              <div className="flex items-center gap-1.5 pb-2 mb-2 border-b border-border-subtle overflow-x-auto">
                {presets.map((p) => (
                  <button
                    key={p.label}
                    type="button"
                    onClick={() => handlePreset(p.daysFromNow)}
                    className="px-2 py-0.5 text-[11px] font-medium rounded-md bg-surface-subtle text-text hover:bg-surface hover:text-primary border border-border-subtle transition-colors cursor-pointer"
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            )}

            {/* Header: Month & Year with Navigation */}
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-text font-heading">
                {MONTH_NAMES[viewMonth]} {viewYear}
              </span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={handlePrevMonth}
                  aria-label="Mes anterior"
                  className="p-1 rounded-md text-text-muted hover:text-text hover:bg-surface-subtle transition-colors cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={handleNextMonth}
                  aria-label="Mes siguiente"
                  className="p-1 rounded-md text-text-muted hover:text-text hover:bg-surface-subtle transition-colors cursor-pointer"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Weekday headers */}
            <div className="grid grid-cols-7 text-center mb-1">
              {DAYS_SHORT.map((d) => (
                <span key={d} className="text-[11px] font-semibold text-text-muted py-1">
                  {d}
                </span>
              ))}
            </div>

            {/* Days grid */}
            <div className="grid grid-cols-7 gap-1 text-center">
              {Array.from({ length: firstDayOfWeek }).map((_, i) => (
                <div key={`empty-${i}`} />
              ))}

              {Array.from({ length: daysInMonth }).map((_, i) => {
                const dayNum = i + 1
                const dateStr = formatLocalDate(viewYear, viewMonth, dayNum)
                const isSelected = value === dateStr
                const isToday = todayStr === dateStr
                const isBeforeMin = minDate ? dateStr < minDate : false
                const isAfterMax = maxDate ? dateStr > maxDate : false
                const isDisabled = isBeforeMin || isAfterMax

                return (
                  <button
                    key={dayNum}
                    type="button"
                    disabled={isDisabled}
                    onClick={() => handleSelectDay(dayNum)}
                    className={[
                      'w-8 h-8 rounded-lg text-xs font-medium transition-all flex items-center justify-center cursor-pointer mx-auto',
                      isSelected
                        ? 'bg-primary text-white font-semibold shadow-xs'
                        : isToday
                        ? 'bg-primary-soft text-primary font-semibold'
                        : 'text-text hover:bg-surface-subtle',
                      isDisabled ? 'opacity-30 cursor-not-allowed hover:bg-transparent' : '',
                    ].join(' ')}
                  >
                    {dayNum}
                  </button>
                )
              })}
            </div>
          </div>
        )}
      </div>

      {error && (
        <p className="text-xs text-danger font-medium flex items-center gap-1 mt-0.5" role="alert">
          {error}
        </p>
      )}
      {hint && !error && (
        <p className="text-xs text-text-muted mt-0.5">{hint}</p>
      )}
    </div>
  )
}

