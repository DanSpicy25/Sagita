import React, { forwardRef, useEffect, useRef } from 'react'

export interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: React.ReactNode
  description?: React.ReactNode
  error?: string
  indeterminate?: boolean
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className = '', label, description, error, disabled, id, indeterminate = false, ...props }, ref) => {
    const defaultRef = useRef<HTMLInputElement>(null)
    const resolvedRef = (ref as React.RefObject<HTMLInputElement>) || defaultRef
    const generatedId = React.useId()
    const inputId = id || (label ? `cb-${String(label).replace(/\s+/g, '-').toLowerCase()}` : generatedId)

    useEffect(() => {
      if (resolvedRef.current) {
        resolvedRef.current.indeterminate = indeterminate
      }
    }, [indeterminate, resolvedRef])

    return (
      <div className={`flex items-start gap-2.5 ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}>
        <div className="flex items-center h-5">
          <input
            id={inputId}
            ref={resolvedRef}
            type="checkbox"
            disabled={disabled}
            aria-invalid={Boolean(error)}
            className="w-4.5 h-4.5 rounded-[7px] border-border bg-black/[0.03] dark:bg-white/[0.06] text-[#007AFF] accent-[#007AFF] focus:ring-2 focus:ring-[#007AFF] focus:ring-offset-1 focus:ring-offset-surface transition-all cursor-pointer disabled:cursor-not-allowed"
            {...props}
          />
        </div>
        {(label || description) && (
          <div className="text-sm select-none">
            {label && (
              <label
                htmlFor={inputId}
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
            {error && (
              <p className="text-xs text-danger mt-1 font-medium" role="alert">
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
