import React from 'react'
import { Loader2 } from 'lucide-react'
import { ButtonVariant } from './Button'

export type IconButtonSize = 'xs' | 'sm' | 'md' | 'lg'

export interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon: React.ReactNode
  'aria-label': string
  variant?: ButtonVariant
  size?: IconButtonSize
  isLoading?: boolean
  rounded?: 'sm' | 'md' | 'lg' | 'full'
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

const sizes: Record<IconButtonSize, string> = {
  xs: 'w-7 h-7 text-xs',
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-11 h-11 text-base',
}

const roundedMap = {
  sm: 'rounded-sm',
  md: 'rounded-md',
  lg: 'rounded-lg',
  full: 'rounded-full',
}

export const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(function IconButton(
  {
    icon,
    'aria-label': ariaLabel,
    variant = 'ghost',
    size = 'md',
    isLoading = false,
    rounded = 'md',
    disabled,
    className = '',
    title,
    ...props
  },
  ref
) {
  return (
    <button
      ref={ref}
      aria-label={ariaLabel}
      title={title || ariaLabel}
      disabled={disabled || isLoading}
      className={[
        'inline-flex items-center justify-center transition-all duration-150 select-none cursor-pointer shrink-0',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-surface',
        'disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none active:scale-[0.96]',
        variants[variant],
        sizes[size],
        roundedMap[rounded],
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin text-current" aria-hidden="true" />
      ) : (
        icon
      )}
    </button>
  )
})

