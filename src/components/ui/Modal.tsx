import React, { useEffect } from 'react'
import { X } from 'lucide-react'
import { Button } from './Button'

export interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title?: React.ReactNode
  description?: string
  children: React.ReactNode
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl'
  maxWidth?: string
  footer?: React.ReactNode
}

const sizes: Record<'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl', string> = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  '2xl': 'max-w-2xl',
  '3xl': 'max-w-3xl',
  '4xl': 'max-w-4xl',
  '5xl': 'max-w-5xl',
}

export function Modal({
  isOpen,
  onClose,
  title,
  description,
  children,
  size = 'md',
  maxWidth,
  footer,
}: ModalProps) {
  // Cerrar con Escape
  useEffect(() => {
    if (!isOpen) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [isOpen, onClose])

  // Bloquear scroll del body
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
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] animate-fade-in sm:p-4"
      aria-modal="true"
      role="dialog"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Dialog Panel */}
      <div
        className={[
          'relative flex max-h-[calc(100dvh-1.5rem)] w-full flex-col overflow-hidden',
          'bg-surface-elevated text-text border border-border shadow-lg rounded-xl z-10 animate-slide-up sm:max-h-[calc(100dvh-2rem)]',
          maxWidth || sizes[size],
        ].join(' ')}
      >
        {/* Header */}
        {title && (
          <div className="flex shrink-0 items-center justify-between border-b border-border px-4 py-3 sm:px-6 sm:py-4">
            <div>
              <h2 className="text-base sm:text-lg font-semibold text-text font-heading">
                {title}
              </h2>
              {description && (
                <p className="text-xs text-text-muted mt-0.5">{description}</p>
              )}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              aria-label="Cerrar"
              className="p-1 h-8 w-8 text-text-muted hover:text-text rounded-md"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        )}

        {/* Body */}
        <div className="min-h-0 overflow-y-auto overscroll-contain px-4 py-4 sm:px-6">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="flex shrink-0 items-center justify-end gap-3 border-t border-border bg-secondary-soft/20 px-4 py-3 sm:px-6">
            {footer}
          </div>
        )}
      </div>
    </div>
  )
}
