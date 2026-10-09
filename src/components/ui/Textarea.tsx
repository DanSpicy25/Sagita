import React from 'react'

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
  hint?: string
  showCount?: boolean
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { label, error, hint, id, className = '', maxLength, value, showCount = false, disabled, ...props },
  ref
) {
  const generatedId = React.useId()
  const textareaId = id ?? (label ? `ta-${label.toLowerCase().replace(/\s+/g, '-')}` : generatedId)
  const errorId = `${textareaId}-error`
  const hintId = `${textareaId}-hint`

  const currentLength = typeof value === 'string' ? value.length : 0

  return (
    <div className="flex flex-col gap-1.5 w-full">
      <div className="flex items-center justify-between">
        {label && (
          <label
            htmlFor={textareaId}
            className="text-xs font-semibold text-text tracking-wide block"
          >
            {label}
          </label>
        )}
        {showCount && maxLength && (
          <span className="text-[11px] text-text-muted font-mono">
            {currentLength}/{maxLength}
          </span>
        )}
      </div>

      <textarea
        ref={ref}
        id={textareaId}
        value={value}
        disabled={disabled}
        maxLength={maxLength}
        rows={props.rows ?? 3}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? errorId : hint ? hintId : undefined}
        className={[
          'w-full px-3 py-2 text-sm bg-surface text-text rounded-md border resize-y transition-all duration-150',
          'placeholder:text-text-muted/60 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-offset-surface',
          'disabled:opacity-60 disabled:cursor-not-allowed disabled:bg-surface-subtle',
          error
            ? 'border-danger focus:border-danger focus:ring-danger/20 text-danger'
            : 'border-border hover:border-border-hover focus:border-primary focus:ring-primary-soft',
          className,
        ]
          .filter(Boolean)
          .join(' ')}
        {...props}
      />

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
