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
  const switchId = id || (label ? `sw-${String(label).replace(/\s+/g, '-').toLowerCase()}` : undefined)

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
        className={`relative inline-flex items-center shrink-0 cursor-pointer rounded-full transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 ${track} ${
          checked ? 'bg-primary-600' : 'bg-slate-200 dark:bg-slate-700'
        } ${disabled ? 'cursor-not-allowed' : ''}`}
      >
        <span
          className={`pointer-events-none inline-block rounded-full bg-white shadow transform ring-0 transition duration-200 ease-in-out ${thumb} ${
            checked ? translate : 'translate-x-1'
          }`}
        />
      </button>

      {(label || description) && (
        <div className="text-sm select-none">
          {label && (
            <label
              htmlFor={switchId}
              onClick={() => !disabled && onChange(!checked)}
              className="font-medium text-slate-700 dark:text-slate-300 cursor-pointer block leading-tight"
            >
              {label}
            </label>
          )}
          {description && (
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {description}
            </p>
          )}
        </div>
      )}
    </div>
  )
}
