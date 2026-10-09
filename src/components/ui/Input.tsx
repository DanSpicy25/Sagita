import React from 'react'
import { X } from 'lucide-react'

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  hint?: string
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  clearable?: boolean
  onClear?: () => void
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(function Input(
  {
    label,
    error,
    hint,
    leftIcon,
    rightIcon,
    clearable = false,
    onClear,
    id,
    value,
    className = '',
    disabled,
    ...props
  },
  ref
) {
  const generatedId = React.useId()
  const inputId = id ?? (label ? `input-${label.toLowerCase().replace(/\s+/g, '-')}` : generatedId)
  const errorId = `${inputId}-error`
  const hintId = `${inputId}-hint`

  const hasValue = value !== undefined && value !== ''

  return (
    <div className="flex flex-col gap-1.5 w-full">
      {label && (
        <label
          htmlFor={inputId}
          className="text-xs font-semibold text-text tracking-wide block"
        >
          {label}
        </label>
      )}
      <div className="relative flex items-center">
        {leftIcon && (
          <span className="absolute left-3 text-text-muted pointer-events-none flex items-center justify-center shrink-0 w-4 h-4">
            {leftIcon}
          </span>
        )}
        <input
          ref={ref}
          id={inputId}
          value={value}
          disabled={disabled}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? errorId : hint ? hintId : undefined}
          className={[
            'w-full px-3 py-2 text-sm bg-surface text-text rounded-md border transition-all duration-150',
            'placeholder:text-text-muted/60 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-offset-surface',
            'disabled:opacity-60 disabled:cursor-not-allowed disabled:bg-surface-subtle',
            error
              ? 'border-danger focus:border-danger focus:ring-danger/20 text-danger'
              : 'border-border hover:border-border-hover focus:border-primary focus:ring-primary-soft',
            leftIcon ? 'pl-9' : '',
            rightIcon || (clearable && hasValue) ? 'pr-9' : '',
            className,
          ]
            .filter(Boolean)
            .join(' ')}
          {...props}
        />
        {clearable && hasValue && !disabled && (
          <button
            type="button"
            onClick={onClear}
            tabIndex={-1}
            aria-label="Borrar texto"
            className="absolute right-3 text-text-muted hover:text-text p-0.5 rounded transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
        {!clearable && rightIcon && (
          <span className="absolute right-3 text-text-muted pointer-events-none flex items-center justify-center shrink-0 w-4 h-4">
            {rightIcon}
          </span>
        )}
      </div>
      {error && (
        <p id={errorId} className="text-xs text-danger font-medium flex items-center gap-1 mt-0.5" role="alert">
          {error}
        </p>
      )}
      {hint && !error && (
        <p id={hintId} className="text-xs text-text-muted mt-0.5">
          {hint}
        </p>
      )}
    </div>
  )
})
