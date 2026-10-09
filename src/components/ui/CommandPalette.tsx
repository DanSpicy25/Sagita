import React, { useState, useEffect, useRef } from 'react'
import { Search as SearchIcon, X } from 'lucide-react'

export interface CommandPaletteProps {
  isOpen: boolean
  onClose: () => void
  placeholder?: string
  searchQuery?: string
  onSearchChange?: (query: string) => void
  children: React.ReactNode
  className?: string
}

export function CommandPalette({
  isOpen,
  onClose,
  placeholder = 'Escribe un comando o busca...',
  searchQuery,
  onSearchChange,
  children,
  className = '',
}: CommandPaletteProps) {
  const [internalQuery, setInternalQuery] = useState('')
  const query = searchQuery !== undefined ? searchQuery : internalQuery

  const handleQueryChange = (val: string) => {
    if (searchQuery === undefined) setInternalQuery(val)
    onSearchChange?.(val)
  }

  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!isOpen) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [isOpen, onClose])

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-modal flex items-start justify-center pt-[10vh] p-4 animate-fade-in"
      role="dialog"
      aria-modal="true"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Palette Panel */}
      <div
        className={[
          'relative w-full max-w-xl bg-surface-elevated text-text rounded-2xl border border-border shadow-elevated overflow-hidden z-10 animate-slide-up flex flex-col max-h-[75vh]',
          className,
        ]
          .filter(Boolean)
          .join(' ')}
      >
        {/* Search header */}
        <div className="flex items-center px-4 py-3.5 border-b border-border gap-3">
          <SearchIcon className="w-5 h-5 text-text-muted shrink-0" aria-hidden="true" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => handleQueryChange(e.target.value)}
            placeholder={placeholder}
            className="w-full bg-transparent text-text text-sm sm:text-base placeholder:text-text-muted/60 focus:outline-none"
          />
          {query && (
            <button
              type="button"
              onClick={() => handleQueryChange('')}
              className="text-text-muted hover:text-text p-1 rounded-md"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-mono font-semibold text-text-muted bg-surface-subtle border border-border rounded">
            ESC
          </kbd>
        </div>

        {/* Scrollable commands list */}
        <div className="flex-1 overflow-y-auto overscroll-contain p-2 space-y-3">
          {children}
        </div>
      </div>
    </div>
  )
}

export function CommandGroup({
  heading,
  children,
  className = '',
}: {
  heading?: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={`space-y-1 ${className}`}>
      {heading && (
        <div className="px-3 py-1 text-[11px] font-semibold text-text-muted uppercase tracking-wider">
          {heading}
        </div>
      )}
      <div className="space-y-0.5">{children}</div>
    </div>
  )
}

export function CommandItem({
  icon,
  label,
  description,
  shortcut,
  onSelect,
  disabled = false,
  danger = false,
  className = '',
}: {
  icon?: React.ReactNode
  label: React.ReactNode
  description?: string
  shortcut?: string
  onSelect: () => void
  disabled?: boolean
  danger?: boolean
  className?: string
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onSelect}
      className={[
        'w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs sm:text-sm font-medium text-left transition-colors cursor-pointer select-none',
        'hover:bg-surface-subtle focus-visible:outline-none focus-visible:bg-surface-subtle',
        disabled ? 'opacity-40 cursor-not-allowed' : '',
        danger ? 'text-danger hover:bg-danger-soft' : 'text-text',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <div className="flex items-center gap-3 min-w-0">
        {icon && <span className="w-4 h-4 shrink-0 text-text-muted">{icon}</span>}
        <div className="truncate">
          <div className="truncate leading-snug">{label}</div>
          {description && (
            <div className="text-[11px] text-text-muted truncate mt-0.5 font-normal">
              {description}
            </div>
          )}
        </div>
      </div>

      {shortcut && (
        <kbd className="ml-3 shrink-0 px-1.5 py-0.5 text-[10px] font-mono text-text-muted bg-surface-subtle border border-border rounded">
          {shortcut}
        </kbd>
      )}
    </button>
  )
}

export function CommandEmpty({
  children = 'No se encontraron resultados.',
}: {
  children?: React.ReactNode
}) {
  return (
    <div className="py-10 text-center text-xs text-text-muted">
      {children}
    </div>
  )
}

