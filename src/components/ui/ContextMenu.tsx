import React, { useState, useEffect, useRef, useCallback } from 'react'
import { createPortal } from 'react-dom'

export interface ContextMenuItem {
  id: string
  label: React.ReactNode
  icon?: React.ReactNode
  shortcut?: string
  disabled?: boolean
  danger?: boolean
  separator?: boolean
  onClick?: () => void
}

export interface ContextMenuProps {
  items: ContextMenuItem[]
  children: React.ReactNode
  onOpenChange?: (open: boolean) => void
  disabled?: boolean
  className?: string
}

export function ContextMenu({
  items,
  children,
  onOpenChange,
  disabled = false,
  className = '',
}: ContextMenuProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [coords, setCoords] = useState<{ x: number; y: number }>({ x: 0, y: 0 })
  const [focusedIndex, setFocusedIndex] = useState(-1)
  const menuRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLDivElement>(null)

  const openMenu = useCallback(
    (clientX: number, clientY: number) => {
      if (disabled) return
      setCoords({ x: clientX, y: clientY })
      setIsOpen(true)
      setFocusedIndex(-1)
      onOpenChange?.(true)
    },
    [disabled, onOpenChange]
  )

  const closeMenu = useCallback(() => {
    setIsOpen(false)
    setFocusedIndex(-1)
    onOpenChange?.(false)
  }, [onOpenChange])

  // Manejar click derecho
  const handleContextMenu = (e: React.MouseEvent) => {
    if (disabled) return
    e.preventDefault()
    e.stopPropagation()
    openMenu(e.clientX, e.clientY)
  }

  // Ajustar coordenadas dentro del viewport tras renderizar
  useEffect(() => {
    if (!isOpen || !menuRef.current) return

    const menuEl = menuRef.current
    const rect = menuEl.getBoundingClientRect()
    const padding = 12

    let adjustedX = coords.x
    let adjustedY = coords.y

    if (adjustedX + rect.width > window.innerWidth - padding) {
      adjustedX = Math.max(padding, window.innerWidth - rect.width - padding)
    }

    if (adjustedY + rect.height > window.innerHeight - padding) {
      adjustedY = Math.max(padding, window.innerHeight - rect.height - padding)
    }

    menuEl.style.left = `${adjustedX}px`
    menuEl.style.top = `${adjustedY}px`
  }, [isOpen, coords])

  // Cerrar al hacer clic fuera o redimensionar
  useEffect(() => {
    if (!isOpen) return

    const handleClickOutside = (e: MouseEvent | TouchEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        closeMenu()
      }
    }

    const handleScrollOrResize = () => {
      closeMenu()
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('touchstart', handleClickOutside)
    window.addEventListener('scroll', handleScrollOrResize, true)
    window.addEventListener('resize', handleScrollOrResize)

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('touchstart', handleClickOutside)
      window.removeEventListener('scroll', handleScrollOrResize, true)
      window.removeEventListener('resize', handleScrollOrResize)
    }
  }, [isOpen, closeMenu])

  // Navegación por teclado
  useEffect(() => {
    if (!isOpen) return

    const activeItems = items.filter((item) => !item.separator && !item.disabled)

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        closeMenu()
      } else if (e.key === 'ArrowDown') {
        e.preventDefault()
        setFocusedIndex((prev) => (prev + 1 < activeItems.length ? prev + 1 : 0))
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        setFocusedIndex((prev) => (prev - 1 >= 0 ? prev - 1 : activeItems.length - 1))
      } else if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault()
        if (focusedIndex >= 0 && activeItems[focusedIndex]) {
          const item = activeItems[focusedIndex]
          item.onClick?.()
          closeMenu()
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, items, focusedIndex, closeMenu])

  return (
    <>
      <div
        ref={triggerRef}
        onContextMenu={handleContextMenu}
        className={className}
      >
        {children}
      </div>

      {isOpen &&
        createPortal(
          <div
            ref={menuRef}
            role="menu"
            aria-orientation="vertical"
            className="fixed z-popover min-w-[180px] max-w-[280px] py-1.5 rounded-xl bg-surface-elevated text-text border border-border shadow-elevated animate-scale-in select-none text-xs"
            style={{ left: coords.x, top: coords.y }}
          >
            {items.map((item, index) => {
              if (item.separator) {
                return (
                  <div
                    key={`sep-${index}`}
                    role="separator"
                    className="my-1 border-t border-border-subtle"
                  />
                )
              }

              const isFocused =
                focusedIndex >= 0 &&
                items.filter((i) => !i.separator && !i.disabled)[focusedIndex]?.id === item.id

              return (
                <button
                  key={item.id}
                  type="button"
                  role="menuitem"
                  disabled={item.disabled}
                  onClick={() => {
                    if (item.disabled) return
                    item.onClick?.()
                    closeMenu()
                  }}
                  className={[
                    'w-full flex items-center justify-between px-3 py-2 text-left rounded-lg transition-colors cursor-pointer',
                    item.disabled ? 'opacity-40 cursor-not-allowed' : '',
                    item.danger
                      ? 'text-danger hover:bg-danger-soft focus:bg-danger-soft'
                      : 'text-text hover:bg-surface-subtle focus:bg-surface-subtle',
                    isFocused ? (item.danger ? 'bg-danger-soft' : 'bg-surface-subtle font-semibold') : '',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    {item.icon && (
                      <span className="w-4 h-4 shrink-0 flex items-center justify-center opacity-70">
                        {item.icon}
                      </span>
                    )}
                    <span className="truncate">{item.label}</span>
                  </div>

                  {item.shortcut && (
                    <span className="ml-3 text-[10px] font-mono text-text-muted/70 shrink-0">
                      {item.shortcut}
                    </span>
                  )}
                </button>
              )
            })}
          </div>,
          document.body
        )}
    </>
  )
}

