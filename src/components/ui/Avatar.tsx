import React from 'react'
import { User as UserIcon } from 'lucide-react'

export type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl'
export type AvatarStatus = 'online' | 'offline' | 'busy' | 'away'

export interface AvatarProps {
  src?: string
  alt?: string
  name?: string
  size?: AvatarSize
  status?: AvatarStatus
  className?: string
}

const sizes: Record<AvatarSize, string> = {
  xs: 'w-6 h-6 text-[10px]',
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-12 h-12 text-base',
  xl: 'w-16 h-16 text-lg',
}

const iconSizes: Record<AvatarSize, string> = {
  xs: 'w-3 h-3',
  sm: 'w-4 h-4',
  md: 'w-5 h-5',
  lg: 'w-6 h-6',
  xl: 'w-8 h-8',
}

const statusPositions: Record<AvatarSize, string> = {
  xs: 'w-1.5 h-1.5 right-0 bottom-0',
  sm: 'w-2 h-2 right-0 bottom-0',
  md: 'w-2.5 h-2.5 right-0.5 bottom-0.5',
  lg: 'w-3 h-3 right-0.5 bottom-0.5',
  xl: 'w-4 h-4 right-1 bottom-1',
}

const statusColors: Record<AvatarStatus, string> = {
  online: 'bg-success ring-surface',
  offline: 'bg-text-muted ring-surface',
  busy: 'bg-danger ring-surface',
  away: 'bg-warning ring-surface',
}

export function Avatar({
  src,
  alt,
  name,
  size = 'md',
  status,
  className = '',
}: AvatarProps) {
  const getInitials = (n?: string) => {
    if (!n) return ''
    const parts = n.trim().split(' ')
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase()
    }
    return n.slice(0, 2).toUpperCase()
  }

  const initials = getInitials(name)

  return (
    <div className="relative inline-block shrink-0">
      <div
        className={[
          'relative inline-flex items-center justify-center rounded-full overflow-hidden bg-primary-soft text-primary font-semibold select-none border border-border/50',
          sizes[size],
          className,
        ]
          .filter(Boolean)
          .join(' ')}
      >
        {src ? (
          <img
            src={src}
            alt={alt ?? name ?? 'Avatar'}
            className="w-full h-full object-cover"
          />
        ) : initials ? (
          <span>{initials}</span>
        ) : (
          <UserIcon className={iconSizes[size]} aria-hidden="true" />
        )}
      </div>

      {status && (
        <span
          className={[
            'absolute rounded-full ring-2',
            statusPositions[size],
            statusColors[status],
          ].join(' ')}
          aria-label={`Estado: ${status}`}
        />
      )}
    </div>
  )
}

export function AvatarGroup({
  children,
  max = 4,
  className = '',
}: {
  children: React.ReactNode
  max?: number
  className?: string
}) {
  const childrenArray = React.Children.toArray(children)
  const visible = childrenArray.slice(0, max)
  const remaining = childrenArray.length - max

  return (
    <div className={`flex items-center -space-x-2 overflow-hidden ${className}`}>
      {visible.map((child, index) => (
        <div key={index} className="ring-2 ring-surface rounded-full">
          {child}
        </div>
      ))}
      {remaining > 0 && (
        <div className="relative inline-flex items-center justify-center w-8 h-8 rounded-full bg-surface-subtle text-text text-xs font-semibold ring-2 ring-surface border border-border select-none">
          +{remaining}
        </div>
      )}
    </div>
  )
}
