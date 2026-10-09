import React from 'react'

export interface CardProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title'> {
  children?: React.ReactNode
  title?: React.ReactNode
  description?: React.ReactNode
  headerAction?: React.ReactNode
  footer?: React.ReactNode
  padding?: 'none' | 'sm' | 'md' | 'lg'
  hoverable?: boolean
  variant?: 'default' | 'elevated' | 'subtle' | 'outline'
}

const paddingMap = {
  none: 'p-0',
  sm: 'p-3 sm:p-4',
  md: 'p-4 sm:p-5',
  lg: 'p-5 sm:p-6',
}

const variantMap = {
  default: 'bg-surface border border-border shadow-card',
  elevated: 'bg-surface-elevated border border-border/80 shadow-md',
  subtle: 'bg-surface-subtle border border-border-subtle shadow-xs',
  outline: 'bg-transparent border border-border shadow-none',
}

export const Card: React.FC<CardProps> = ({
  children,
  title,
  description,
  headerAction,
  footer,
  padding = 'md',
  hoverable = false,
  variant = 'default',
  className = '',
  ...props
}) => {
  const isCustomCompound = !title && !description && !headerAction && !footer

  return (
    <div
      className={[
        'rounded-xl text-text transition-all duration-200',
        variantMap[variant],
        hoverable
          ? 'hover:shadow-md hover:border-border-hover cursor-pointer active:scale-[0.985] ios-press'
          : '',
        isCustomCompound ? '' : paddingMap[padding],
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      {...props}
    >
      {(title || description || headerAction) && (
        <div className="flex items-start justify-between mb-4 pb-3 border-b border-border-subtle gap-3">
          <div className="min-w-0 flex-1">
            {title && (typeof title === 'string' ? (
              <h3 className="font-semibold text-text text-base tracking-tight leading-snug">{title}</h3>
            ) : (
              title
            ))}
            {description && (
              <p className="text-xs text-text-muted mt-0.5 leading-relaxed">{description}</p>
            )}
          </div>
          {headerAction && <div className="shrink-0">{headerAction}</div>}
        </div>
      )}

      {isCustomCompound ? children : children}

      {footer && (
        <div className="mt-4 pt-3 border-t border-border-subtle text-sm text-text-muted flex items-center justify-between">
          {footer}
        </div>
      )}
    </div>
  )
}

export function CardHeader({ className = '', children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`flex items-start justify-between p-4 sm:p-5 pb-3 border-b border-border-subtle gap-3 ${className}`} {...props}>
      {children}
    </div>
  )
}

export function CardTitle({ className = '', children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3 className={`font-semibold text-text text-base tracking-tight leading-snug ${className}`} {...props}>
      {children}
    </h3>
  )
}

export function CardDescription({ className = '', children, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p className={`text-xs text-text-muted mt-0.5 leading-relaxed ${className}`} {...props}>
      {children}
    </p>
  )
}

export function CardContent({ className = '', children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`p-4 sm:p-5 ${className}`} {...props}>
      {children}
    </div>
  )
}

export function CardFooter({ className = '', children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`p-4 sm:p-5 pt-3 border-t border-border-subtle text-sm text-text-muted flex items-center justify-between ${className}`} {...props}>
      {children}
    </div>
  )
}
