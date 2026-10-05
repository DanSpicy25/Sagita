import React, { useContext } from 'react'
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react'
import { AppContext } from '@/context/AppContext'
import { Toast as ToastType, ToastType as TT } from '@/types'

const icons: Record<TT, React.ReactNode> = {
  success: <CheckCircle className="w-5 h-5 text-success shrink-0" />,
  error:   <XCircle className="w-5 h-5 text-danger shrink-0" />,
  warning: <AlertTriangle className="w-5 h-5 text-warning shrink-0" />,
  info:    <Info className="w-5 h-5 text-info shrink-0" />,
}

const borders: Record<TT, string> = {
  success: 'border-l-success',
  error:   'border-l-danger',
  warning: 'border-l-warning',
  info:    'border-l-info',
}

function ToastItem({ toast, onRemove }: { toast: ToastType; onRemove: (id: string) => void }) {
  return (
    <div
      className={[
        'flex items-start gap-3 p-4 border-l-4 animate-slide-up rounded-lg',
        'bg-surface-elevated text-text border-y border-r border-border shadow-lg',
        'w-full min-w-0 max-w-sm',
        borders[toast.type],
      ].join(' ')}
      role="alert"
    >
      {icons[toast.type]}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-text">{toast.title}</p>
        {toast.message && (
          <p className="text-xs text-text-muted mt-0.5 leading-relaxed">{toast.message}</p>
        )}
      </div>
      <button
        onClick={() => onRemove(toast.id)}
        className="text-text-muted hover:text-text transition-colors p-1 rounded focus:outline-none focus:ring-2 focus:ring-primary"
        aria-label="Cerrar"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  )
}

export function ToastContainer() {
  const ctx = useContext(AppContext)
  if (!ctx || ctx.toasts.length === 0) return null

  return (
    <div
      className="fixed inset-x-3 bottom-[max(0.75rem,env(safe-area-inset-bottom))] z-[100] mx-auto flex w-auto max-w-sm flex-col gap-2 sm:inset-x-auto sm:right-6 sm:mx-0 sm:w-full"
      aria-live="polite"
    >
      {ctx.toasts.map((t) => (
        <ToastItem key={t.id} toast={t} onRemove={ctx.removeToast} />
      ))}
    </div>
  )
}
