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
    const inputId = id || (label ? `radio-${String(label).replace(/\s+/g, '-').toLowerCase()}` : undefined)

    return (
      <div className={`flex items-start gap-2.5 ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}>
        <div className="flex items-center h-5">
          <input
            id={inputId}
            ref={ref}
            type="radio"
            disabled={disabled}
            className="w-4 h-4 text-primary-600 border-slate-300 dark:border-slate-700 focus:ring-primary-500 focus:ring-offset-0 dark:bg-slate-800 transition-colors cursor-pointer disabled:cursor-not-allowed"
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
