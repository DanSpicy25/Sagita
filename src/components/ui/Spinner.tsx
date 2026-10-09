import { Loader2 } from 'lucide-react'

export interface SpinnerProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  color?: 'primary' | 'white' | 'text' | 'muted'
  className?: string
  label?: string
}

const sizeClasses = {
  xs: 'w-3 h-3',
  sm: 'w-4 h-4',
  md: 'w-6 h-6',
  lg: 'w-8 h-8',
  xl: 'w-10 h-10',
}

const colorClasses = {
  primary: 'text-primary',
  white: 'text-white',
  text: 'text-text',
  muted: 'text-text-muted',
}

export function Spinner({
  size = 'md',
  color = 'primary',
  className = '',
  label = 'Cargando...',
}: SpinnerProps) {
  return (
    <div
      role="status"
      className={`inline-flex items-center justify-center ${className}`}
      aria-label={label}
    >
      <Loader2
        className={`${sizeClasses[size]} ${colorClasses[color]} animate-spin shrink-0`}
        aria-hidden="true"
      />
      <span className="sr-only">{label}</span>
    </div>
  )
}
