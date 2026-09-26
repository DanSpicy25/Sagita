import React from 'react'

type Variant = 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'error' | 'info' | 'outline'
type Size = 'sm' | 'md'

interface BadgeProps {
  children: React.ReactNode
  variant?: Variant
  size?: Size
  dot?: boolean
  className?: string
}

const variants: Record<Variant, string> = {
  default: 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300',
  primary: 'bg-primary-100 text-primary-700 dark:bg-primary-900/40 dark:text-primary-300',
  success: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
  warning: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
  danger:  'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
  error:   'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
  info:    'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
  outline: 'border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 bg-transparent',
}

const sizes: Record<Size, string> = {
  sm: 'px-2 py-0.5 text-[11px]',
  md: 'px-2.5 py-0.5 text-xs',
}

const dotColors: Record<Variant, string> = {
  default: 'bg-slate-400',
  primary: 'bg-primary-500',
  success: 'bg-emerald-500',
  warning: 'bg-amber-500',
  danger:  'bg-red-500',
  error:   'bg-red-500',
  info:    'bg-blue-500',
  outline: 'bg-slate-400',
}

export function Badge({
  children,
  variant = 'default',
  size = 'md',
  dot = false,
  className = '',
}: BadgeProps) {
  return (
    <span
      className={[
        'inline-flex items-center gap-1.5 rounded-full font-medium',
        variants[variant],
        sizes[size],
        className,
      ].join(' ')}
    >
      {dot && <span className={`w-1.5 h-1.5 rounded-full ${dotColors[variant]}`} />}
      {children}
    </span>
  )
}
