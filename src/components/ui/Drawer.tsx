import React, { useEffect } from 'react'
import { X } from 'lucide-react'
import { IconButton } from './IconButton'

export interface DrawerProps {
  isOpen: boolean
  onClose: () => void
  title?: React.ReactNode
  description?: string
  children: React.ReactNode
  side?: 'right' | 'left'
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
  footer?: React.ReactNode
}

const sizes = {
  sm: 'max-w-xs',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  full: 'max-w-full',
}

export function Drawer({
  isOpen,
  onClose,
  title,
  description,
  children,
  side = 'right',
  size = 'md',
  footer,
}: DrawerProps) {
  useEffect(() => {
    if (!isOpen) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [isOpen, onClose])

  useEffect(() => {
    if (!isOpen) return
    const original = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = original
    }
  }, [isOpen])

  if (!isOpen) return null

  const isRight = side === 'right'

  return (
    <div
      className="fixed inset-0 z-drawer flex overflow-hidden animate-fade-in"
      aria-modal="true"
      role="dialog"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      <div
        className={[
          'relative z-10 flex h-full w-full flex-col bg-surface-elevated text-text shadow-elevated border-border',
          isRight ? 'ml-auto border-l animate-slide-right' : 'mr-auto border-r animate-fade-in',
          sizes[size],
        ].join(' ')}
      >
        {/* Header */}
        {title && (
          <div className="flex shrink-0 items-center justify-between border-b border-border px-4 py-3 sm:px-6 sm:py-4">
            <div className="min-w-0 pr-2">
              <h2 className="text-base sm:text-lg font-semibold text-text font-heading leading-snug truncate">
                {title}
              </h2>
              {description && (
                <p className="text-xs text-text-muted mt-0.5 leading-relaxed">{description}</p>
              )}
            </div>
            <IconButton
              icon={<X className="w-4 h-4" />}
              aria-label="Cerrar panel"
              variant="ghost"
              size="sm"
              onClick={onClose}
            />
          </div>
        )}

        {/* Content */}
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-4 sm:px-6">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="flex shrink-0 items-center justify-end gap-3 border-t border-border bg-surface-subtle/50 px-4 py-3 sm:px-6 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
            {footer}
          </div>
        )}
      </div>
    </div>
  )
}

