import React from 'react'
import { ChevronDown } from 'lucide-react'

export interface SelectOption {
  value: string | number
  label: string
  disabled?: boolean
}

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  error?: string
  hint?: string
  options?: SelectOption[]
  placeholder?: string
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(function Select(
  {
    label,
    error,
    hint,
    options,
    placeholder,
    id,
    className = '',
    children,
    disabled,
    ...props
  },
  ref
) {
  const generatedId = React.useId()
  const selectId = id ?? (label ? `select-${label.toLowerCase().replace(/\s+/g, '-')}` : generatedId)
  const errorId = `${selectId}-error`
  const hintId = `${selectId}-hint`

  return (
    <div className="flex flex-col gap-1.5 w-full">
      {label && (
        <label
          htmlFor={selectId}
          className="text-xs font-semibold text-text tracking-wide block"
        >
          {label}
        </label>
      )}
      <div className="relative flex items-center">
        <select
          ref={ref}
          id={selectId}
          disabled={disabled}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? errorId : hint ? hintId : undefined}
          className={[
            'w-full px-3.5 py-2.5 pr-9 text-sm bg-black/[0.035] dark:bg-white/[0.06] text-text rounded-2xl border appearance-none transition-all duration-150 cursor-pointer',
            'focus:outline-none focus:ring-4 focus:ring-offset-0',
            'disabled:opacity-60 disabled:cursor-not-allowed disabled:bg-surface-subtle',
            error
              ? 'border-[#FF3B30] focus:border-[#FF3B30] focus:ring-[#FF3B30]/15 text-[#FF3B30]'
              : 'border-border/80 hover:border-border-hover focus:border-[#007AFF] focus:ring-[#007AFF]/15',
            className,
          ]
            .filter(Boolean)
            .join(' ')}
          {...props}
        >
          {placeholder && <option value="">{placeholder}</option>}
          {options
            ? options.map((opt) => (
                <option key={opt.value} value={opt.value} disabled={opt.disabled}>
                  {opt.label}
                </option>
              ))
            : children}
        </select>
        <ChevronDown
          className="absolute right-3 w-4 h-4 text-text-muted pointer-events-none shrink-0"
          aria-hidden="true"
        />
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
