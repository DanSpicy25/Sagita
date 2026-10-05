import React from 'react'
import { AlertCircle, RotateCcw } from 'lucide-react'
import { Button } from './Button'

export interface ErrorStateProps {
  title?: string
  description?: string
  icon?: React.ReactNode
  onRetry?: () => void
  retryLabel?: string
  className?: string
}

export function ErrorState({
  title = 'Ha ocurrido un error inesperado',
  description = 'No pudimos cargar la información. Por favor inténtalo de nuevo.',
  icon,
  onRetry,
  retryLabel = 'Reintentar',
  className = '',
}: ErrorStateProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center p-8 text-center rounded-2xl border border-dashed border-red-200 dark:border-red-900/50 bg-red-50/30 dark:bg-red-950/10 ${className}`}
    >
      <div className="w-12 h-12 rounded-2xl bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400 flex items-center justify-center mb-4">
        {icon || <AlertCircle className="w-6 h-6" />}
      </div>
      <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100 mb-1">
        {title}
      </h3>
      <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mb-5">
        {description}
      </p>
      {onRetry && (
        <Button
          variant="secondary"
          size="sm"
          onClick={onRetry}
          leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
        >
          {retryLabel}
        </Button>
      )}
    </div>
  )
}
