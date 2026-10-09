import { useEffect, useRef } from 'react'
import { AlertTriangle, AlertCircle, X, Info } from 'lucide-react'
import { Button } from './Button'
import { IconButton } from './IconButton'

export interface ConfirmDialogProps {
  open: boolean
  title: string
  description?: string
  confirmLabel?: string
  cancelLabel?: string
  variant?: 'warning' | 'danger' | 'info'
  loading?: boolean
  onConfirm: () => void | Promise<void>
  onCancel: () => void
}

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  variant = 'danger',
  loading = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const dialogRef = useRef<HTMLDivElement>(null)

  // Cerrar con tecla Escape (siempre que no esté procesando una acción)
  useEffect(() => {
    if (!open || loading) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation()
        onCancel()
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [open, loading, onCancel])

  // Bloquear scroll del documento y restaurar al desmontar o cerrar
  useEffect(() => {
    if (!open) return
    const originalOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = originalOverflow
    }
  }, [open])

  // Foco inicial accesible en la acción de cancelar para evitar confirmaciones accidentales por teclado
  useEffect(() => {
    if (open) {
      const timer = setTimeout(() => {
        const btn = dialogRef.current?.querySelector<HTMLButtonElement>('button[data-confirm-cancel="true"]')
        if (btn) {
          btn.focus()
        } else {
          dialogRef.current?.focus()
        }
      }, 50)
      return () => clearTimeout(timer)
    }
  }, [open])

  if (!open) return null

  const iconConfig = {
    danger: {
      icon: <AlertTriangle className="w-5 h-5" aria-hidden="true" />,
      style: 'bg-danger-soft text-danger border-danger/20',
      buttonVariant: 'danger' as const,
    },
    warning: {
      icon: <AlertCircle className="w-5 h-5" aria-hidden="true" />,
      style: 'bg-warning-soft text-warning border-warning/20',
      buttonVariant: 'warning' as const,
    },
    info: {
      icon: <Info className="w-5 h-5" aria-hidden="true" />,
      style: 'bg-info-soft text-info border-info/20',
      buttonVariant: 'primary' as const,
    },
  }

  const currentConfig = iconConfig[variant] || iconConfig.danger

  return (
    <div
      className="fixed inset-0 z-modal flex items-center justify-center overflow-y-auto p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] animate-fade-in sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-dialog-title"
      aria-describedby={description ? 'confirm-dialog-desc' : undefined}
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
        onClick={() => {
          if (!loading) onCancel()
        }}
        aria-hidden="true"
      />

      {/* Dialog Panel */}
      <div
        ref={dialogRef}
        tabIndex={-1}
        className="relative z-10 my-auto max-h-[calc(100dvh-1.5rem)] w-full max-w-md overflow-y-auto rounded-2xl border border-border bg-surface p-5 shadow-xl animate-slide-up focus:outline-none sm:max-h-[calc(100dvh-2rem)] sm:p-6"
      >
        {/* Botón cerrar esquina superior derecha */}
        <div className="absolute top-4 right-4">
          <IconButton
            icon={<X className="w-4 h-4" />}
            aria-label="Cerrar diálogo"
            variant="ghost"
            size="sm"
            disabled={loading}
            onClick={onCancel}
            className="rounded-full bg-black/[0.04] dark:bg-white/[0.06] hover:bg-black/[0.08] dark:hover:bg-white/[0.1] ios-press"
          />
        </div>

        <div className="flex items-start gap-4">
          {/* Badge de icono semántico */}
          <div
            className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border shadow-xs ${currentConfig.style}`}
          >
            {currentConfig.icon}
          </div>

          {/* Contenido textual */}
          <div className="flex-1 pr-6">
            <h2
              id="confirm-dialog-title"
              className="text-base font-semibold text-text font-heading leading-snug"
            >
              {title}
            </h2>
            {description && (
              <p
                id="confirm-dialog-desc"
                className="text-xs sm:text-sm text-text-muted mt-1.5 leading-relaxed"
              >
                {description}
              </p>
            )}
          </div>
        </div>

        {/* Acciones */}
        <div className="flex items-center justify-end gap-3 mt-6 pt-2">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={onCancel}
            disabled={loading}
            data-confirm-cancel="true"
          >
            {cancelLabel}
          </Button>

          <Button
            type="button"
            variant={currentConfig.buttonVariant}
            size="sm"
            isLoading={loading}
            disabled={loading}
            onClick={async () => {
              await onConfirm()
            }}
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  )
}
