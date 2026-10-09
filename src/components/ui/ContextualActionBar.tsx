import React from 'react'
import { X } from 'lucide-react'
import { Badge } from './Badge'
import { IconButton } from './IconButton'

export interface ContextualAction {
  id: string
  label: React.ReactNode
  icon?: React.ReactNode
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost'
  disabled?: boolean
  onClick: () => void
}

export interface ContextualActionBarProps {
  selectedCount: number
  onClearSelection: () => void
  actions: ContextualAction[]
  label?: string
  className?: string
}

export function ContextualActionBar({
  selectedCount,
  onClearSelection,
  actions,
  label = 'seleccionados',
  className = '',
}: ContextualActionBarProps) {
  if (selectedCount <= 0) return null

  return (
    <div
      role="toolbar"
      aria-label="Acciones sobre elementos seleccionados"
      className={[
        'fixed bottom-20 md:bottom-6 left-1/2 -translate-x-1/2 z-sticky',
        'w-[calc(100%-2rem)] max-w-xl mx-auto',
        'flex items-center justify-between gap-3 px-4 py-2.5 rounded-2xl',
        'bg-surface-elevated/95 text-text border border-border shadow-elevated backdrop-blur-md animate-slide-up',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {/* ── Conteo & Cancelar ── */}
      <div className="flex items-center gap-2 shrink-0">
        <IconButton
          icon={<X className="w-4 h-4" />}
          aria-label="Cancelar selección"
          variant="ghost"
          size="xs"
          onClick={onClearSelection}
        />
        <div className="flex items-center gap-1.5">
          <Badge variant="primary" size="sm" className="font-mono">
            {selectedCount}
          </Badge>
          <span className="text-xs font-medium text-text hidden sm:inline">
            {label}
          </span>
        </div>
      </div>

      {/* ── Separador Vertical ── */}
      <div className="h-5 w-px bg-border-subtle shrink-0" />

      {/* ── Botones de Acción ── */}
      <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-0.5">
        {actions.map((act) => {
          const isDanger = act.variant === 'danger'
          const isPrimary = act.variant === 'primary'

          return (
            <button
              key={act.id}
              type="button"
              disabled={act.disabled}
              onClick={act.onClick}
              className={[
                'inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl transition-all cursor-pointer select-none shrink-0 active:scale-95',
                act.disabled ? 'opacity-40 cursor-not-allowed' : '',
                isDanger
                  ? 'bg-danger-soft text-danger hover:bg-danger hover:text-white border border-danger/20'
                  : isPrimary
                  ? 'bg-primary text-white hover:bg-primary-hover shadow-2xs'
                  : 'bg-surface text-text hover:bg-surface-subtle border border-border',
              ]
                .filter(Boolean)
                .join(' ')}
            >
              {act.icon && <span className="w-3.5 h-3.5 shrink-0">{act.icon}</span>}
              <span className="truncate">{act.label}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

