import React from 'react'
import { Sparkles, X } from 'lucide-react'
import { useFirstUseHint } from '@/hooks/useFirstUseHint'
import { IconButton } from './IconButton'

export interface FirstUseHintProps {
  hintKey: string
  title: string
  description: React.ReactNode
  icon?: React.ReactNode
  variant?: 'callout' | 'banner' | 'compact'
  action?: {
    label: string
    onClick: () => void
  }
  onDismiss?: () => void
  className?: string
}

export function FirstUseHint({
  hintKey,
  title,
  description,
  icon,
  variant = 'callout',
  action,
  onDismiss,
  className = '',
}: FirstUseHintProps) {
  const { isDismissed, dismiss } = useFirstUseHint(hintKey)

  // Si ya fue completado/descartado, no renderizar nada
  if (isDismissed) return null

  const handleDismiss = () => {
    dismiss()
    onDismiss?.()
  }

  if (variant === 'compact') {
    return (
      <div
        role="note"
        aria-label={title}
        className={[
          'inline-flex items-center gap-2 px-2.5 py-1 rounded-lg text-xs',
          'bg-primary-soft text-primary border border-primary/20 shadow-2xs animate-fade-in',
          className,
        ]
          .filter(Boolean)
          .join(' ')}
      >
        <span className="shrink-0">{icon || <Sparkles className="w-3.5 h-3.5" />}</span>
        <span className="font-medium truncate">{title}</span>
        <IconButton
          icon={<X className="w-3 h-3" />}
          aria-label="Cerrar sugerencia"
          variant="ghost"
          size="xs"
          onClick={handleDismiss}
          className="text-primary hover:bg-primary/20 -mr-1"
        />
      </div>
    )
  }

  return (
    <div
      role="region"
      aria-label={`Sugerencia: ${title}`}
      className={[
        'relative overflow-hidden flex items-start gap-3 p-3.5 rounded-xl text-xs leading-relaxed',
        'bg-surface-elevated text-text border border-primary/30 shadow-xs animate-slide-up',
        variant === 'banner' ? 'w-full' : 'max-w-xl',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {/* ── Icon Accent ── */}
      <div className="w-7 h-7 rounded-lg bg-primary-soft text-primary border border-primary/20 flex items-center justify-center shrink-0 mt-0.5">
        {icon || <Sparkles className="w-4 h-4" aria-hidden="true" />}
      </div>

      {/* ── Body ── */}
      <div className="flex-1 min-w-0 pr-1">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-text leading-tight">{title}</span>
          <span className="text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.2 rounded bg-primary-soft text-primary">
            Tip
          </span>
        </div>

        <div className="text-text-muted mt-1 text-[11px] sm:text-xs">{description}</div>

        {/* ── Action / Entendido ── */}
        <div className="mt-2.5 flex items-center gap-2">
          {action && (
            <button
              type="button"
              onClick={() => {
                action.onClick()
                handleDismiss()
              }}
              className="inline-flex items-center px-2.5 py-1 text-xs font-semibold rounded-md bg-primary text-white hover:bg-primary-hover transition-colors shadow-2xs cursor-pointer active:scale-95"
            >
              {action.label}
            </button>
          )}

          <button
            type="button"
            onClick={handleDismiss}
            className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-md text-text-muted hover:text-text hover:bg-surface-subtle transition-colors cursor-pointer"
          >
            Entendido
          </button>
        </div>
      </div>

      {/* ── Close Icon Button ── */}
      <IconButton
        icon={<X className="w-3.5 h-3.5" />}
        aria-label="Descartar sugerencia"
        variant="ghost"
        size="xs"
        onClick={handleDismiss}
        className="shrink-0 text-text-muted hover:text-text -mr-1 -mt-1"
      />
    </div>
  )
}

