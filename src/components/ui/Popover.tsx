import React, { useState, useRef, useEffect } from 'react'

export interface PopoverProps {
  trigger: React.ReactNode
  children: React.ReactNode
  align?: 'start' | 'center' | 'end'
  side?: 'top' | 'bottom'
  open?: boolean
  onOpenChange?: (open: boolean) => void
  className?: string
}

export function Popover({
  trigger,
  children,
  align = 'center',
  side = 'bottom',
  open: controlledOpen,
  onOpenChange,
  className = '',
}: PopoverProps) {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(false)
  const isControlled = controlledOpen !== undefined
  const isOpen = isControlled ? controlledOpen : uncontrolledOpen

  const popoverRef = useRef<HTMLDivElement>(null)

  const setOpen = (next: boolean) => {
    if (!isControlled) setUncontrolledOpen(next)
    onOpenChange?.(next)
  }

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape' && isOpen) {
        setOpen(false)
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

  const alignClasses = {
    start: 'left-0',
    center: 'left-1/2 -translate-x-1/2',
    end: 'right-0',
  }

  const sideClasses = {
    top: 'bottom-full mb-2',
    bottom: 'top-full mt-2',
  }

  return (
    <div className="relative inline-block" ref={popoverRef}>
      <div onClick={() => setOpen(!isOpen)} className="inline-block cursor-pointer">
        {trigger}
      </div>

      {isOpen && (
        <div
          role="dialog"
          aria-modal="false"
          className={[
            'absolute z-popover min-w-[200px] rounded-xl bg-surface-elevated text-text border border-border shadow-elevated p-3 animate-fade-in',
            sideClasses[side],
            alignClasses[align],
            className,
          ]
            .filter(Boolean)
            .join(' ')}
        >
          {children}
        </div>
      )}
    </div>
  )
}

