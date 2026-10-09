import React from 'react'
import { Loader2 } from 'lucide-react'

export type ButtonVariant =
  | 'primary'
  | 'secondary'
  | 'ghost'
  | 'danger'
  | 'warning'
  | 'outline'
  | 'success'
  | 'accent'
export type ButtonSize = 'xs' | 'sm' | 'md' | 'lg'

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  isLoading?: boolean
  loading?: boolean
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  fullWidth?: boolean
}

const variants: Record<ButtonVariant, string> = {
  primary:
    'bg-primary hover:bg-primary-hover text-white shadow-xs focus-visible:ring-primary border border-transparent',
  secondary:
    'bg-secondary-soft hover:bg-border/60 text-text border border-border focus-visible:ring-secondary',
  ghost:
    'bg-transparent hover:bg-secondary-soft text-text focus-visible:ring-secondary border border-transparent',
  danger:
    'bg-danger hover:bg-danger-hover text-white shadow-xs focus-visible:ring-danger border border-transparent',
  warning:
    'bg-warning hover:bg-warning-hover text-white shadow-xs focus-visible:ring-warning border border-transparent',
  outline:
    'border border-border bg-surface hover:bg-secondary-soft text-text focus-visible:ring-primary shadow-xs',
  success:
    'bg-success hover:bg-success-hover text-white shadow-xs focus-visible:ring-success border border-transparent',
  accent:
    'bg-accent hover:bg-accent-hover text-white shadow-xs focus-visible:ring-accent border border-transparent',
}

const sizes: Record<ButtonSize, string> = {
  xs: 'h-7 px-2.5 text-xs rounded-sm gap-1.5',
  sm: 'h-8 px-3 py-1 text-xs rounded-md gap-1.5 font-medium',
  md: 'h-10 px-4 py-2 text-sm rounded-md gap-2 font-medium',
  lg: 'h-11 px-5 py-2.5 text-base rounded-lg gap-2.5 font-semibold',
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    variant = 'primary',
    size = 'md',
    isLoading = false,
    loading,
    leftIcon,
    rightIcon,
    fullWidth = false,
    children,
    disabled,
    className = '',
    ...props
  },
  ref
) {
  const resolvedLoading = isLoading || loading || false

  return (
    <button
      ref={ref}
      disabled={disabled ?? resolvedLoading}
      className={[
        'inline-flex items-center justify-center transition-all duration-150 select-none cursor-pointer',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-surface',
        'disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none active:scale-[0.98]',
        variants[variant],
        sizes[size],
        fullWidth ? 'w-full' : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      {...props}
    >
      {resolvedLoading ? (
        <Loader2 className="w-4 h-4 animate-spin shrink-0 text-current" aria-hidden="true" />
      ) : (
        leftIcon && <span className="shrink-0 leading-none">{leftIcon}</span>
      )}
      {children && <span className="truncate">{children}</span>}
      {!resolvedLoading && rightIcon && <span className="shrink-0 leading-none">{rightIcon}</span>}
    </button>
  )
})
