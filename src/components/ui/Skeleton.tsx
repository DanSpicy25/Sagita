import React from 'react'

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'text' | 'circular' | 'rectangular' | 'card' | 'avatar' | 'button'
  width?: string | number
  height?: string | number
  count?: number
}

export const Skeleton: React.FC<SkeletonProps> = ({
  variant = 'text',
  width,
  height,
  count = 1,
  className = '',
  style = {},
  ...props
}) => {
  const getVariantClass = () => {
    switch (variant) {
      case 'circular':
      case 'avatar':
        return 'rounded-full'
      case 'rectangular':
      case 'button':
        return 'rounded-md h-9'
      case 'card':
        return 'rounded-xl h-32 w-full'
      case 'text':
      default:
        return 'rounded-md h-4'
    }
  }

  const computedStyle: React.CSSProperties = {
    ...style,
    ...(width !== undefined ? { width } : {}),
    ...(height !== undefined ? { height } : {}),
  }

  const items = Array.from({ length: Math.max(1, count) })

  return (
    <>
      {items.map((_, index) => (
        <div
          key={index}
          className={`relative overflow-hidden bg-neutral-800/40 dark:bg-white/[0.04] border border-white/5 backdrop-blur-xs ${getVariantClass()} ${className}`}
          style={computedStyle}
          aria-hidden="true"
          {...props}
        >
          <div
            className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/10 dark:via-white/[0.07] to-transparent animate-glass-shimmer"
            aria-hidden="true"
          />
        </div>
      ))}
    </>
  )
}

export function SkeletonTable({
  rows = 5,
  cols = 4,
  className = '',
}: {
  rows?: number
  cols?: number
  className?: string
}) {
  return (
    <div
      className={`w-full space-y-3 p-4 rounded-xl border border-border bg-surface ${className}`}
      aria-label="Cargando tabla de datos..."
      role="status"
    >
      <div className="flex gap-4 pb-2 border-b border-border">
        {Array.from({ length: cols }).map((_, i) => (
          <Skeleton key={`th-${i}`} variant="text" width={`${100 / cols}%`} height={16} />
        ))}
      </div>
      {Array.from({ length: rows }).map((_, r) => (
        <div
          key={`tr-${r}`}
          className="flex gap-4 py-2 border-b border-border-subtle/50 last:border-0"
        >
          {Array.from({ length: cols }).map((_, c) => (
            <Skeleton key={`td-${r}-${c}`} variant="text" width={`${100 / cols}%`} height={14} />
          ))}
        </div>
      ))}
    </div>
  )
}

export function SkeletonCardGrid({
  count = 4,
  cols = 3,
  className = '',
}: {
  count?: number
  cols?: 2 | 3 | 4
  className?: string
}) {
  const gridClasses = {
    2: 'sm:grid-cols-2',
    3: 'sm:grid-cols-2 md:grid-cols-3',
    4: 'sm:grid-cols-2 md:grid-cols-4',
  }

  return (
    <div
      className={`grid grid-cols-1 ${gridClasses[cols]} gap-4 ${className}`}
      aria-label="Cargando contenido..."
      role="status"
    >
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="p-4 rounded-xl border border-border bg-surface space-y-3">
          <Skeleton variant="rectangular" height={36} width="40%" />
          <Skeleton variant="text" width="90%" />
          <Skeleton variant="text" width="60%" />
        </div>
      ))}
    </div>
  )
}
