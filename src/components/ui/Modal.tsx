import React, { useEffect } from 'react'
import { X } from 'lucide-react'

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
      className="fixed inset-0 z-modal flex items-center justify-center overflow-y-auto p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] animate-fade-in sm:p-4"
      aria-modal="true"
      role="dialog"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/45 backdrop-blur-md transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Dialog Panel (Apple Continuous Squircle) */}
      <div
        className={[
          'relative flex max-h-[calc(100dvh-1.5rem)] w-full flex-col overflow-hidden',
          'bg-surface-elevated/95 dark:bg-[#1C1C1E]/95 text-text border border-white/40 dark:border-white/10 shadow-[0_20px_60px_-10px_rgba(0,0,0,0.25)] rounded-[26px] sm:rounded-[30px] z-10 animate-scale-in sm:max-h-[calc(100dvh-2.5rem)] backdrop-blur-2xl',
          maxWidth || sizes[size],
        ].join(' ')}
      >
        {/* iOS Grabber Handle for Touch / Mobile */}
        <div className="ios-grabber sm:hidden" />

        {/* Header */}
        {title && (
          <div className="flex shrink-0 items-center justify-between border-b border-border/70 px-5 py-3.5 sm:px-6 sm:py-4 bg-surface-subtle/30">
            <div className="min-w-0 pr-2">
              <h2 className="text-base sm:text-lg font-bold text-text font-heading leading-snug tracking-tight truncate">
                {title}
              </h2>
              {description && (
                <p className="text-xs text-text-muted mt-0.5 leading-relaxed">{description}</p>
              )}
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Cerrar modal"
              className="w-8 h-8 rounded-full bg-black/[0.06] dark:bg-white/[0.1] text-text-muted hover:text-text flex items-center justify-center transition-all active:scale-90 cursor-pointer"
            >
              <X className="w-4 h-4 stroke-[2.5]" />
            </button>
          </div>
        )}

        {/* Body */}
        <div className="min-h-0 overflow-y-auto overscroll-contain px-5 py-4 sm:px-6">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="flex shrink-0 items-center justify-end gap-3 border-t border-border/70 bg-surface-subtle/50 px-5 py-3.5 sm:px-6 rounded-b-[26px] sm:rounded-b-[30px]">
            {footer}
          </div>
        )}
      </div>
    </div>
  )
}
