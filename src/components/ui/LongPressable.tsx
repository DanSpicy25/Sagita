import React from 'react'
import { useLongPress } from '@/hooks/useLongPress'

export interface LongPressableProps {
  children: React.ReactNode
  onLongPress: (e: React.PointerEvent | React.KeyboardEvent | React.MouseEvent) => void
  delay?: number
  threshold?: number
  disabled?: boolean
  className?: string
  indicatorPosition?: 'pointer' | 'center'
}

export function LongPressable({
  children,
  onLongPress,
  delay = 500,
  threshold = 10,
  disabled = false,
  className = '',
  indicatorPosition = 'pointer',
}: LongPressableProps) {
  const { isPressing, progress, coords, handlers } = useLongPress({
    delay,
    threshold,
    onLongPress,
    preventContextMenu: true,
  })

  const radius = 14
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference * (1 - progress)

  return (
    <div
      {...(!disabled ? handlers : {})}
      className={`relative select-none ${disabled ? '' : 'touch-none'} ${className}`}
      tabIndex={!disabled ? 0 : undefined}
      role="button"
      aria-disabled={disabled}
      aria-label="Elemento con acción por pulsación sostenida"
    >
      {children}

      {/* ── Indicador sutil de progreso durante la pulsación sostenida ── */}
      {isPressing && !disabled && (
        indicatorPosition === 'pointer' ? (
          <div
            className="fixed pointer-events-none z-popover -translate-x-1/2 -translate-y-1/2"
            style={{ left: coords.x, top: coords.y }}
          >
            <svg
              className="w-10 h-10 -rotate-90 drop-shadow-sm"
              viewBox="0 0 36 36"
              aria-hidden="true"
            >
              <circle
                cx="18"
                cy="18"
                r={radius}
                className="fill-surface/80 stroke-border/40"
                strokeWidth="2.5"
              />
              <circle
                cx="18"
                cy="18"
                r={radius}
                className="fill-none stroke-primary"
                strokeWidth="2.5"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
              />
            </svg>
          </div>
        ) : (
          <div className="absolute inset-0 pointer-events-none rounded-[inherit] overflow-hidden flex items-center justify-center bg-primary/5 transition-opacity">
            <svg
              className="w-9 h-9 -rotate-90"
              viewBox="0 0 36 36"
              aria-hidden="true"
            >
              <circle
                cx="18"
                cy="18"
                r={radius}
                className="fill-none stroke-border/30"
                strokeWidth="2"
              />
              <circle
                cx="18"
                cy="18"
                r={radius}
                className="fill-none stroke-primary"
                strokeWidth="2.5"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
              />
            </svg>
          </div>
        )
      )}
    </div>
  )
}

