import React, { useState, useRef, useEffect } from 'react'
import { HelpCircle, X } from 'lucide-react'

export interface HelpTooltipProps {
  title?: string
  content: React.ReactNode
  position?: 'top' | 'bottom' | 'left' | 'right'
  className?: string
  size?: 'xs' | 'sm' | 'md'
  icon?: React.ReactNode
  ariaLabel?: string
}

export function HelpTooltip({
  title,
  content,
  position = 'top',
  className = '',
  size = 'xs',
  icon,
  ariaLabel = 'Más información de ayuda',
}: HelpTooltipProps) {
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const tooltipId = React.useId()

  const sizeClasses = {
    xs: 'w-3.5 h-3.5',
    sm: 'w-4 h-4',
    md: 'w-4.5 h-4.5',
  }

  // Cerrar al hacer clic fuera o presionar Escape
  useEffect(() => {
    if (!isOpen) return

    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen])

  const positions = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
  }

  return (
    <div
      ref={containerRef}
      className={`relative inline-flex items-center align-middle ${className}`}
    >
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault()
          e.stopPropagation()
          setIsOpen(!isOpen)
        }}
        onMouseEnter={() => setIsOpen(true)}
        onMouseLeave={() => setIsOpen(false)}
        aria-expanded={isOpen}
        aria-describedby={isOpen ? tooltipId : undefined}
        aria-label={ariaLabel}
        className="p-0.5 rounded-full text-text-muted hover:text-primary transition-colors focus:outline-none focus:ring-2 focus:ring-primary/40 cursor-help"
      >
        {icon || <HelpCircle className={`${sizeClasses[size]} shrink-0`} />}
      </button>

      {isOpen && (
        <div
          id={tooltipId}
          role="tooltip"
          className={[
            'absolute z-tooltip w-64 max-w-xs p-3 rounded-xl text-xs leading-relaxed',
            'bg-surface-elevated text-text border border-border shadow-md backdrop-blur-md animate-fade-in select-text',
            positions[position],
          ]
            .filter(Boolean)
            .join(' ')}
          onMouseEnter={() => setIsOpen(true)}
          onMouseLeave={() => setIsOpen(false)}
        >
          <div className="flex items-start justify-between gap-1.5 mb-1">
            {title && (
              <h5 className="font-semibold text-text text-[11px] leading-tight">
                {title}
              </h5>
            )}
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="sm:hidden -mr-1 -mt-1 p-1 text-text-muted hover:text-text rounded-md"
              aria-label="Cerrar ayuda"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
          <div className="text-[11px] text-text-muted leading-normal">
            {content}
          </div>
        </div>
      )}
    </div>
  )
}

