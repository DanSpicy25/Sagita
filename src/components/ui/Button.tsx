import React from 'react'
import { Loader2 } from 'lucide-react'

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'warning' | 'outline' | 'success' | 'accent'
export type ButtonSize = 'sm' | 'md' | 'lg'

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
    'bg-primary hover:bg-primary-hover text-white shadow-sm focus:ring-primary',
  secondary:
    'bg-secondary-soft hover:bg-border text-text border border-border focus:ring-secondary',
  ghost:
    'bg-transparent hover:bg-secondary-soft text-text focus:ring-secondary',
  danger:
    'bg-danger hover:bg-danger-hover text-white shadow-sm focus:ring-danger',
  warning:
    'bg-warning hover:bg-warning-hover text-white shadow-sm focus:ring-warning',
  outline:
    'border border-border bg-transparent hover:bg-secondary-soft text-text focus:ring-primary',
  success:
    'bg-success hover:bg-success-hover text-white shadow-sm focus:ring-success',
  accent:
    'bg-accent hover:bg-accent-hover text-white shadow-sm focus:ring-accent',
}

const sizes: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-xs rounded-sm gap-1.5',
  md: 'px-4 py-2 text-sm rounded-md gap-2',
  lg: 'px-5 py-2.5 text-base rounded-lg gap-2.5',
}

export function Button({
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
}: ButtonProps) {
  const resolvedLoading = isLoading || loading || false
  return (
    <button
      disabled={disabled ?? resolvedLoading}
      className={[
        'inline-flex items-center justify-center font-medium transition-all duration-150',
        'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-surface',
        'disabled:opacity-50 disabled:cursor-not-allowed select-none active:scale-[0.99]',
        variants[variant],
        sizes[size],
        fullWidth ? 'w-full' : '',
        className,
      ].filter(Boolean).join(' ')}
      {...props}
    >
      {resolvedLoading ? (
        <Loader2 className="w-4 h-4 animate-spin shrink-0" />
      ) : (
        leftIcon && <span className="shrink-0">{leftIcon}</span>
      )}
      {children}
      {!resolvedLoading && rightIcon && <span className="shrink-0">{rightIcon}</span>}
    </button>
  )
}
