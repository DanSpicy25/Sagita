import React, { useState, useRef, useEffect } from 'react'

export interface TooltipProps {
  content: React.ReactNode
  children: React.ReactNode
  position?: 'top' | 'bottom' | 'left' | 'right'
  delay?: number
  className?: string
}

export function Tooltip({
  content,
  children,
  position = 'top',
  delay = 120,
  className = '',
}: TooltipProps) {
  const [visible, setVisible] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const tooltipId = React.useId()

  const handleMouseEnter = () => {
    timerRef.current = setTimeout(() => {
      setVisible(true)
    }, delay)
  }

  const handleMouseLeave = () => {
    if (timerRef.current) clearTimeout(timerRef.current)
    setVisible(false)
  }

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && visible) {
        setVisible(false)
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [visible])

  const positions = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
  }

  return (
    <div
      className={`relative inline-flex ${className}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onFocus={() => setVisible(true)}
      onBlur={() => setVisible(false)}
      aria-describedby={visible ? tooltipId : undefined}
    >
      {children}
      {visible && content && (
        <div
          id={tooltipId}
          role="tooltip"
          className={[
            'absolute z-tooltip pointer-events-none whitespace-nowrap px-2.5 py-1 text-xs font-medium',
            'bg-surface-elevated text-text border border-border shadow-md rounded-md animate-fade-in',
            positions[position],
          ].join(' ')}
        >
          {content}
        </div>
      )}
    </div>
  )
}
