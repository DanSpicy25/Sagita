import { User as UserIcon } from 'lucide-react'

interface AvatarProps {
  src?: string
  alt?: string
  name?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
}

const sizes = {
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-12 h-12 text-base',
  xl: 'w-16 h-16 text-lg',
}

const iconSizes = {
  sm: 'w-4 h-4',
  md: 'w-5 h-5',
  lg: 'w-6 h-6',
  xl: 'w-8 h-8',
}

export function Avatar({ src, alt, name, size = 'md', className = '' }: AvatarProps) {
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
    <div
      className={[
        'relative inline-flex items-center justify-center rounded-full overflow-hidden bg-primary-100 dark:bg-primary-900/40 text-primary-700 dark:text-primary-300 font-semibold select-none flex-shrink-0',
        sizes[size],
        className,
      ].join(' ')}
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
        <UserIcon className={iconSizes[size]} />
      )}
    </div>
  )
}
