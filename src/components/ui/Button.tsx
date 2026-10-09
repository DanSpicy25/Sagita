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
    'bg-primary hover:bg-primary-hover text-white shadow-xs border border-transparent font-semibold',
  secondary:
    'bg-secondary-soft hover:bg-black/10 dark:hover:bg-white/10 text-text border border-transparent font-semibold',
  ghost:
    'bg-transparent hover:bg-black/[0.06] dark:hover:bg-white/[0.08] text-text border border-transparent font-semibold',
  danger:
    'bg-danger hover:bg-danger-hover text-white shadow-xs border border-transparent font-semibold',
  warning:
    'bg-warning hover:bg-warning-hover text-white shadow-xs border border-transparent font-semibold',
  outline:
    'border border-border bg-surface hover:bg-surface-subtle text-text font-semibold',
  success:
    'bg-success hover:bg-success-hover text-white shadow-xs border border-transparent font-semibold',
  accent:
    'bg-accent hover:bg-accent-hover text-white shadow-xs border border-transparent font-semibold',
}

const sizes: Record<ButtonSize, string> = {
  xs: 'h-7 px-3 text-xs rounded-md gap-1.5 font-semibold',
  sm: 'h-9 px-3.5 py-1 text-xs rounded-lg gap-1.5 font-semibold',
  md: 'h-10 px-4 py-2 text-sm rounded-lg gap-2 font-semibold',
  lg: 'h-12 px-6 py-2.5 text-base rounded-xl gap-2.5 font-bold',
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
        'inline-flex items-center justify-center transition-all duration-150 select-none cursor-pointer ios-press',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-surface',
        'disabled:opacity-45 disabled:cursor-not-allowed disabled:pointer-events-none active:scale-[0.96]',
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
