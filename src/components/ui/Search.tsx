import React from 'react'
import { Search as SearchIcon, X, Loader2 } from 'lucide-react'

export interface SearchProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string
  shortcut?: string
  isLoading?: boolean
  onClear?: () => void
  size?: 'sm' | 'md' | 'lg'
}

const sizeClasses = {
  sm: 'h-8 text-xs pl-8 pr-7',
  md: 'h-10 text-sm pl-9 pr-8',
  lg: 'h-12 text-base pl-11 pr-10',
}

const iconSizes = {
  sm: 'w-3.5 h-3.5 left-2.5',
  md: 'w-4 h-4 left-3',
  lg: 'w-5 h-5 left-3.5',
}

export const Search = React.forwardRef<HTMLInputElement, SearchProps>(function Search(
  {
    label,
    shortcut,
    isLoading = false,
    onClear,
    size = 'md',
    value,
    onChange,
    className = '',
    placeholder = 'Buscar...',
    ...props
  },
  ref
) {
  const hasValue = Boolean(value)

  return (
    <div className="relative flex items-center w-full">
      {label && <span className="sr-only">{label}</span>}
      <span className={`absolute text-text-muted pointer-events-none ${iconSizes[size]}`}>
        {isLoading ? (
          <Loader2 className="w-full h-full animate-spin text-primary" />
        ) : (
          <SearchIcon className="w-full h-full" />
        )}
      </span>

      <input
        ref={ref}
        type="search"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        aria-label={label || placeholder}
        className={[
          'w-full bg-surface text-text rounded-lg border border-border transition-all duration-150',
          'placeholder:text-text-muted/60 hover:border-border-hover',
          'focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary-soft focus:ring-offset-1 focus:ring-offset-surface',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          sizeClasses[size],
          shortcut && !hasValue ? 'pr-12' : '',
          className,
        ]
          .filter(Boolean)
          .join(' ')}
        {...props}
      />

      {hasValue && onClear && (
        <button
          type="button"
          onClick={onClear}
          aria-label="Limpiar búsqueda"
          className="absolute right-2.5 text-text-muted hover:text-text p-1 rounded-md transition-colors"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}

      {shortcut && !hasValue && (
        <kbd className="absolute right-2.5 hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-mono font-medium text-text-muted bg-surface-subtle border border-border rounded">
          {shortcut}
        </kbd>
      )}
    </div>
  )
})

