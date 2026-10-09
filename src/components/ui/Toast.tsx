import React, { useContext } from 'react'
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react'
import { AppContext } from '@/context/AppContext'
import { Toast as ToastType, ToastType as TT } from '@/types'
import { IconButton } from './IconButton'

const icons: Record<TT, React.ReactNode> = {
  success: <CheckCircle className="w-5 h-5 text-success shrink-0" aria-hidden="true" />,
  error:   <XCircle className="w-5 h-5 text-danger shrink-0" aria-hidden="true" />,
  warning: <AlertTriangle className="w-5 h-5 text-warning shrink-0" aria-hidden="true" />,
  info:    <Info className="w-5 h-5 text-info shrink-0" aria-hidden="true" />,
}

const borders: Record<TT, string> = {
  success: 'border-l-success',
  error:   'border-l-danger',
  warning: 'border-l-warning',
  info:    'border-l-info',
}

const progressColors: Record<TT, string> = {
  success: 'bg-success',
  error:   'bg-danger',
  warning: 'bg-warning',
  info:    'bg-info',
}

function ToastItem({ toast, onRemove }: { toast: ToastType; onRemove: (id: string) => void }) {
  const duration = toast.duration ?? 4000

  return (
    <div
      className={[
        'relative overflow-hidden flex flex-col gap-2 p-3.5 border-l-4 animate-slide-up rounded-xl',
        'bg-surface-elevated text-text border-y border-r border-border shadow-elevated',
        'w-full min-w-0 max-w-sm transition-all',
        borders[toast.type],
      ].join(' ')}
      role={toast.type === 'error' ? 'alert' : 'status'}
      aria-live={toast.type === 'error' ? 'assertive' : 'polite'}
    >
      <div className="flex items-start gap-3 w-full">
        <div className="pt-0.5">{icons[toast.type]}</div>
        <div className="flex-1 min-w-0">
          <p className="text-xs sm:text-sm font-semibold text-text leading-tight">{toast.title}</p>
          {toast.message && (
            <p className="text-xs text-text-muted mt-1 leading-relaxed">{toast.message}</p>
          )}

          {/* Interactive Action Button (Undo / Retry) */}
          {toast.action && (
            <div className="mt-2.5">
              <button
                type="button"
                onClick={() => {
                  toast.action?.onClick()
                  onRemove(toast.id)
                }}
                className="inline-flex items-center px-2.5 py-1 text-xs font-semibold rounded-md bg-surface text-primary border border-border hover:bg-surface-subtle hover:border-primary/50 transition-colors shadow-2xs cursor-pointer active:scale-95"
              >
                {toast.action.label}
              </button>
            </div>
          )}
        </div>

        <IconButton
          icon={<X className="w-3.5 h-3.5" />}
          aria-label="Cerrar notificación"
          variant="ghost"
          size="xs"
          onClick={() => onRemove(toast.id)}
        />
      </div>

      {/* Subtle Progress Bar */}
      {duration > 0 && (
        <div className="absolute bottom-0 inset-x-0 h-0.5 bg-surface-subtle overflow-hidden">
          <div
            className={`h-full ${progressColors[toast.type]} opacity-40`}
            style={{
              animation: `shrinkWidth ${duration}ms linear forwards`,
            }}
          />
        </div>
      )}
    </div>
  )
}

export function ToastContainer() {
  const ctx = useContext(AppContext)
  if (!ctx || ctx.toasts.length === 0) return null

  return (
    <div
      className="fixed inset-x-3 bottom-20 sm:bottom-6 sm:right-6 sm:inset-x-auto z-toast mx-auto flex w-auto max-w-sm flex-col gap-2.5 sm:mx-0 sm:w-full pointer-events-none"
    >
      {ctx.toasts.map((t) => (
        <div key={t.id} className="pointer-events-auto">
          <ToastItem toast={t} onRemove={ctx.removeToast} />
        </div>
      ))}
    </div>
  )
}
