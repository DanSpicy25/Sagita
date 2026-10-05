import React from 'react'

export interface CardProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title'> {
  children?: React.ReactNode
  title?: React.ReactNode
  description?: React.ReactNode
  headerAction?: React.ReactNode
  footer?: React.ReactNode
  padding?: 'none' | 'sm' | 'md' | 'lg'
  hoverable?: boolean
}

export const Card: React.FC<CardProps> = ({
  children,
  title,
  description,
  headerAction,
  footer,
  padding = 'md',
  hoverable = false,
  className = '',
  ...props
}) => {
  const paddingMap = {
    none: 'p-0',
    sm: 'p-3',
    md: 'p-5',
    lg: 'p-6',
  }

  return (
    <div
      className={`bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl transition-all ${
        hoverable ? 'hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700 cursor-pointer' : 'shadow-sm'
      } ${paddingMap[padding]} ${className}`}
      {...props}
    >
      {(title || description || headerAction) && (
        <div className="flex items-start justify-between mb-4 pb-3 border-b border-slate-100 dark:border-slate-800">
          <div>
            {title && typeof title === 'string' ? (
              <h3 className="font-semibold text-slate-800 dark:text-slate-100 text-base">{title}</h3>
            ) : (
              title
            )}
            {description && (
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{description}</p>
            )}
          </div>
          {headerAction && <div>{headerAction}</div>}
        </div>
      )}
      {children}
      {footer && (
        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-sm">
          {footer}
        </div>
      )}
    </div>
  )
}
