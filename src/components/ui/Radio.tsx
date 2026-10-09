import React, { forwardRef } from 'react'

export interface RadioOption {
  value: string | number
  label: React.ReactNode
  description?: React.ReactNode
  disabled?: boolean
}

export interface RadioProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: React.ReactNode
  description?: React.ReactNode
  error?: string
}

export const Radio = forwardRef<HTMLInputElement, RadioProps>(
  ({ className = '', label, description, error, disabled, id, ...props }, ref) => {
    const generatedId = React.useId()
    const inputId = id || (label ? `radio-${String(label).replace(/\s+/g, '-').toLowerCase()}` : generatedId)

    return (
      <div className={`flex items-start gap-2.5 ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}>
        <div className="flex items-center h-5">
          <input
            id={inputId}
            ref={ref}
            type="radio"
            disabled={disabled}
            aria-invalid={Boolean(error)}
            className="w-4.5 h-4.5 text-[#007AFF] accent-[#007AFF] border-border bg-black/[0.03] dark:bg-white/[0.06] focus:ring-2 focus:ring-[#007AFF] focus:ring-offset-1 focus:ring-offset-surface transition-all cursor-pointer disabled:cursor-not-allowed"
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

Radio.displayName = 'Radio'

export interface RadioGroupProps {
  name: string
  options: RadioOption[]
  value?: string | number
  onChange?: (val: string | number) => void
  disabled?: boolean
  className?: string
  direction?: 'vertical' | 'horizontal'
}

export function RadioGroup({
  name,
  options,
  value,
  onChange,
  disabled,
  className = '',
  direction = 'vertical',
}: RadioGroupProps) {
  return (
    <div
      role="radiogroup"
      className={`flex ${
        direction === 'horizontal' ? 'flex-row flex-wrap gap-4' : 'flex-col gap-2.5'
      } ${className}`}
    >
      {options.map((opt) => (
        <Radio
          key={String(opt.value)}
          name={name}
          value={opt.value}
          label={opt.label}
          description={opt.description}
          checked={value === opt.value}
          disabled={disabled || opt.disabled}
          onChange={() => onChange?.(opt.value)}
        />
      ))}
    </div>
  )
}
