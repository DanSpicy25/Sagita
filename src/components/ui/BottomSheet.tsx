import React, { useEffect } from 'react'
import { X } from 'lucide-react'
import { IconButton } from './IconButton'

export interface BottomSheetProps {
  isOpen: boolean
  onClose: () => void
  title?: React.ReactNode
  description?: string
  children: React.ReactNode
  footer?: React.ReactNode
  maxHeight?: string
  className?: string
}

export function BottomSheet({
  isOpen,
  onClose,
  title,
  description,
  children,
  footer,
  maxHeight = 'max-h-[90dvh]',
  className = '',
}: BottomSheetProps) {
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

  return (
    <div
      className="fixed inset-0 z-modal flex flex-col justify-end overflow-hidden animate-fade-in"
      aria-modal="true"
      role="dialog"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Sheet Panel */}
      <div
        className={[
          'relative z-10 flex w-full flex-col bg-surface-elevated text-text shadow-elevated rounded-t-2xl border-t border-x border-border animate-slide-up',
          maxHeight,
          className,
        ]
          .filter(Boolean)
          .join(' ')}
      >
        {/* Grab Handle */}
        <div className="flex justify-center pt-2.5 pb-1">
          <div className="w-10 h-1 rounded-full bg-border-hover/80" />
        </div>

        {/* Header */}
        {(title || description) && (
          <div className="flex shrink-0 items-center justify-between border-b border-border px-4 py-2.5 sm:px-6">
            <div className="min-w-0 pr-2">
              {title && (
                <h3 className="text-base font-semibold text-text font-heading leading-snug truncate">
                  {title}
                </h3>
              )}
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

        {/* Scrollable Body */}
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-4 sm:px-6">
          {children}
        </div>

        {/* Footer with hardware safe-area */}
        {footer && (
          <div className="flex shrink-0 items-center justify-end gap-3 border-t border-border bg-surface-subtle/40 px-4 py-3 sm:px-6 pb-[max(1rem,calc(env(safe-area-inset-bottom)+0.75rem))]">
            {footer}
          </div>
        )}
      </div>
    </div>
  )
}

