import React, { forwardRef } from 'react'

export interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: React.ReactNode
  description?: React.ReactNode
  error?: string
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className = '', label, description, error, disabled, id, ...props }, ref) => {
    const inputId = id || (label ? `cb-${String(label).replace(/\s+/g, '-').toLowerCase()}` : undefined)

    return (
      <div className={`flex items-start gap-2.5 ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}>
        <div className="flex items-center h-5">
          <input
            id={inputId}
            ref={ref}
            type="checkbox"
            disabled={disabled}
            className="w-4 h-4 rounded border-slate-300 dark:border-slate-700 text-primary-600 focus:ring-primary-500 focus:ring-offset-0 dark:bg-slate-800 dark:checked:bg-primary-600 transition-colors cursor-pointer disabled:cursor-not-allowed"
            {...props}
          />
        </div>
        {(label || description) && (
          <div className="text-sm select-none">
            {label && (
              <label
                htmlFor={inputId}
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
            {error && (
              <p className="text-xs text-red-500 dark:text-red-400 mt-1 font-medium">
                {error}
              </p>
            )}
          </div>
        )}
      </div>
    )
  }
)

Checkbox.displayName = 'Checkbox'
