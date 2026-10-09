import React, { useState, useRef, useEffect } from 'react'

export interface DropdownItem {
  id: string | number
  label?: React.ReactNode
  icon?: React.ReactNode
  danger?: boolean
  disabled?: boolean
  shortcut?: string
  divider?: boolean
  onClick?: () => void
}

export interface DropdownProps {
  trigger: React.ReactNode
  items: DropdownItem[]
  align?: 'left' | 'right'
  className?: string
  width?: string
}

export function Dropdown({
  trigger,
  items,
  align = 'right',
  className = '',
  width = 'w-52',
}: DropdownProps) {
  const [abierto, setAbierto] = useState(false)
  const [focusedIndex, setFocusedIndex] = useState(-1)
  const menuRef = useRef<HTMLDivElement>(null)
  const itemsRef = useRef<(HTMLButtonElement | null)[]>([])

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setAbierto(false)
      }
    }
    if (abierto) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [abierto])

  // Navegación por teclado
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!abierto) {
      if (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ') {
        e.preventDefault()
        setAbierto(true)
        setFocusedIndex(0)
      }
      return
    }

    const selectableItems = items.filter((it) => !it.disabled && !it.divider)

    if (e.key === 'Escape') {
      e.preventDefault()
      setAbierto(false)
      setFocusedIndex(-1)
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      setFocusedIndex((prev) => (prev + 1) % selectableItems.length)
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setFocusedIndex((prev) => (prev - 1 + selectableItems.length) % selectableItems.length)
    }
  }

  useEffect(() => {
    if (abierto && focusedIndex >= 0 && itemsRef.current[focusedIndex]) {
      itemsRef.current[focusedIndex]?.focus()
    }
  }, [focusedIndex, abierto])

  return (
    <div
      className={`relative inline-block text-left ${className}`}
      ref={menuRef}
      onKeyDown={handleKeyDown}
    >
      <div
        onClick={() => {
          setAbierto((prev) => !prev)
          setFocusedIndex(0)
        }}
        className="cursor-pointer inline-flex items-center"
      >
        {trigger}
      </div>

      {abierto && (
        <div
          role="menu"
          aria-orientation="vertical"
          className={[
            'absolute z-popover mt-2 rounded-xl bg-surface text-text border border-border shadow-lg p-1.5 animate-fade-in',
            align === 'right' ? 'right-0' : 'left-0',
            width,
          ].join(' ')}
        >
          {items.map((item, idx) => {
            if (item.divider) {
              return <div key={`div-${item.id || idx}`} className="my-1 border-t border-black/[0.06] dark:border-white/[0.08]" role="separator" />
            }

            return (
              <button
                key={item.id}
                ref={(el) => {
                  itemsRef.current[idx] = el
                }}
                role="menuitem"
                disabled={item.disabled}
                onClick={() => {
                  if (!item.disabled && item.onClick) {
                    item.onClick()
                    setAbierto(false)
                  }
                }}
                className={[
                  'w-full flex items-center justify-between px-3 py-2 text-xs font-medium text-left transition-all duration-150 cursor-pointer rounded-xl ios-press',
                  'focus:outline-none focus:bg-black/[0.05] dark:focus:bg-white/[0.08]',
                  item.disabled
                    ? 'opacity-40 cursor-not-allowed text-text-muted'
                    : item.danger
                    ? 'text-[#FF3B30] hover:bg-[#FF3B30]/10'
                    : 'text-text dark:text-white hover:bg-black/[0.05] dark:hover:bg-white/[0.08]',
                ]
                  .filter(Boolean)
                  .join(' ')}
              >
                <div className="flex items-center gap-2.5 truncate">
                  {item.icon && <span className="w-4 h-4 shrink-0 text-text-muted">{item.icon}</span>}
                  <span className="truncate">{item.label}</span>
                </div>
                {item.shortcut && (
                  <kbd className="text-[10px] font-mono text-text-muted ml-2">{item.shortcut}</kbd>
                )}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
