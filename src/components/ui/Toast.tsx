import { useContext } from 'react'
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react'
import { AppContext } from '@/context/AppContext'
import { Toast as ToastType, ToastType as TT } from '@/types'

const icons: Record<TT, React.ReactNode> = {
  success: <CheckCircle className="w-5 h-5 text-emerald-500" />,
  error:   <XCircle    className="w-5 h-5 text-red-500" />,
  warning: <AlertTriangle className="w-5 h-5 text-amber-500" />,
  info:    <Info       className="w-5 h-5 text-blue-500" />,
}

const borders: Record<TT, string> = {
  success: 'border-l-emerald-500',
  error:   'border-l-red-500',
  warning: 'border-l-amber-500',
  info:    'border-l-blue-500',
}

import React from 'react'

function ToastItem({ toast, onRemove }: { toast: ToastType; onRemove: (id: string) => void }) {
  return (
    <div
      className={[
        'flex items-start gap-3 card p-4 border-l-4 animate-slide-up',
        'min-w-72 max-w-sm shadow-lg',
        borders[toast.type],
      ].join(' ')}
      role="alert"
    >
      {icons[toast.type]}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">{toast.title}</p>
        {toast.message && (
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{toast.message}</p>
        )}
      </div>
      <button
        onClick={() => onRemove(toast.id)}
        className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
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
      className="fixed bottom-6 right-6 z-[100] flex flex-col gap-2"
      aria-live="polite"
    >
      {ctx.toasts.map((t) => (
        <ToastItem key={t.id} toast={t} onRemove={ctx.removeToast} />
      ))}
    </div>
  )
}

