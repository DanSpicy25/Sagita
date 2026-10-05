import React from 'react'

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'text' | 'circular' | 'rectangular'
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
        return 'rounded-full'
      case 'rectangular':
        return 'rounded-lg'
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
          className={`animate-pulse bg-slate-200 dark:bg-slate-800 ${getVariantClass()} ${className}`}
          style={computedStyle}
          aria-hidden="true"
          {...props}
        />
      ))}
    </>
  )
}
