import React from 'react'

export interface SwitchProps {
  checked: boolean
  onChange: (checked: boolean) => void
  label?: React.ReactNode
  description?: React.ReactNode
  disabled?: boolean
  size?: 'sm' | 'md'
  className?: string
  id?: string
}

export function Switch({
  checked,
  onChange,
  label,
  description,
  disabled = false,
  size = 'md',
  className = '',
  id,
}: SwitchProps) {
  const generatedId = React.useId()
  const switchId = id || (label ? `sw-${String(label).replace(/\s+/g, '-').toLowerCase()}` : generatedId)

  const dimensions = {
    sm: { track: 'w-8 h-4', thumb: 'w-3 h-3', translate: 'translate-x-4' },
    md: { track: 'w-11 h-6', thumb: 'w-4 h-4', translate: 'translate-x-5' },
  }

  const { track, thumb, translate } = dimensions[size]

  return (
    <div className={`flex items-start gap-3 ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}>
      <button
        id={switchId}
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => !disabled && onChange(!checked)}
        className={[
          'relative inline-flex items-center shrink-0 cursor-pointer rounded-full transition-colors duration-200 ease-in-out border border-transparent',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-surface',
          track,
          checked ? 'bg-primary' : 'bg-surface-subtle border-border',
          disabled ? 'cursor-not-allowed' : '',
        ]
          .filter(Boolean)
          .join(' ')}
      >
        <span
          className={[
            'pointer-events-none inline-block rounded-full bg-white shadow-xs transform transition duration-200 ease-in-out',
            thumb,
            checked ? translate : 'translate-x-1',
          ]
            .filter(Boolean)
            .join(' ')}
        />
      </button>

      {(label || description) && (
        <div className="text-sm select-none">
          {label && (
            <label
              htmlFor={switchId}
              onClick={() => !disabled && onChange(!checked)}
              className="font-medium text-text cursor-pointer block leading-tight text-xs sm:text-sm"
            >
              {label}
            </label>
          )}
          {description && (
            <p className="text-xs text-text-muted mt-0.5 leading-relaxed">
              {description}
            </p>
          )}
        </div>
      )}
    </div>
  )
}
