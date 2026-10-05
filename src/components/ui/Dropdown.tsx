import React, { useState, useRef, useEffect } from 'react'

export interface DropdownItem {
  id: string | number
  label: React.ReactNode
  icon?: React.ReactNode
  danger?: boolean
  disabled?: boolean
  onClick?: () => void
}

export interface DropdownProps {
  trigger: React.ReactNode
  items: DropdownItem[]
  align?: 'left' | 'right'
  className?: string
}

export function Dropdown({
  trigger,
  items,
  align = 'right',
  className = '',
}: DropdownProps) {
  const [abierto, setAbierto] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

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

  return (
    <div className={`relative inline-block text-left ${className}`} ref={menuRef}>
      <div onClick={() => setAbierto((prev) => !prev)} className="cursor-pointer">
        {trigger}
      </div>

      {abierto && (
        <div
          className={`absolute z-50 mt-1.5 w-52 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl py-1.5 animate-in fade-in zoom-in-95 duration-100 ${
            align === 'right' ? 'right-0' : 'left-0'
          }`}
        >
          {items.map((item) => (
            <button
              key={item.id}
              disabled={item.disabled}
              onClick={() => {
                if (!item.disabled && item.onClick) {
                  item.onClick()
                  setAbierto(false)
                }
              }}
              className={`w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-medium text-left transition-colors ${
                item.disabled
                  ? 'opacity-40 cursor-not-allowed text-slate-400'
                  : item.danger
                  ? 'text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30'
                  : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              {item.icon && <span className="w-4 h-4 flex-shrink-0">{item.icon}</span>}
              <span className="truncate">{item.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
