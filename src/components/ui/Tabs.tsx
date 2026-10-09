import React, { createContext, useContext } from 'react'

interface TabsContextType {
  value: string
  onValueChange: (val: string) => void
  variant?: 'pills' | 'underline'
}

const TabsContext = createContext<TabsContextType | null>(null)

export interface TabsProps {
  value: string
  onValueChange: (val: string) => void
  children: React.ReactNode
  variant?: 'pills' | 'underline'
  className?: string
}

export function Tabs({
  value,
  onValueChange,
  children,
  variant = 'pills',
  className = '',
}: TabsProps) {
  return (
    <TabsContext.Provider value={{ value, onValueChange, variant }}>
      <div className={`w-full ${className}`}>{children}</div>
    </TabsContext.Provider>
  )
}

export function TabsList({
  children,
  className = '',
  fullWidth = false,
}: {
  children: React.ReactNode
  className?: string
  fullWidth?: boolean
}) {
  const ctx = useContext(TabsContext)
  const isUnderline = ctx?.variant === 'underline'

  if (isUnderline) {
    return (
      <div
        role="tablist"
        className={`flex items-center gap-6 border-b border-border overflow-x-auto scrollbar-none ${className}`}
      >
        {children}
      </div>
    )
  }

  return (
    <div
      role="tablist"
      className={[
        'inline-flex items-center gap-1 p-1 bg-surface-subtle rounded-xl border border-border-subtle',
        fullWidth ? 'w-full' : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {children}
    </div>
  )
}

export interface TabsTriggerProps {
  value: string
  children: React.ReactNode
  icon?: React.ReactNode
  className?: string
  disabled?: boolean
  badge?: React.ReactNode
}

export function TabsTrigger({
  value,
  children,
  icon,
  className = '',
  disabled,
  badge,
}: TabsTriggerProps) {
  const ctx = useContext(TabsContext)
  if (!ctx) throw new Error('TabsTrigger must be used within Tabs')

  const isSelected = ctx.value === value
  const isUnderline = ctx.variant === 'underline'

  if (isUnderline) {
    return (
      <button
        type="button"
        role="tab"
        aria-selected={isSelected}
        tabIndex={isSelected ? 0 : -1}
        disabled={disabled}
        onClick={() => ctx.onValueChange(value)}
        className={[
          'inline-flex items-center gap-2 py-3 px-1 text-sm font-medium border-b-2 transition-all cursor-pointer select-none whitespace-nowrap',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
          'disabled:cursor-not-allowed disabled:opacity-40',
          isSelected
            ? 'border-primary text-primary font-semibold'
            : 'border-transparent text-text-muted hover:text-text hover:border-border',
          className,
        ]
          .filter(Boolean)
          .join(' ')}
      >
        {icon && <span className="w-4 h-4 shrink-0 leading-none">{icon}</span>}
        <span>{children}</span>
        {badge && <span className="shrink-0">{badge}</span>}
      </button>
    )
  }

  return (
    <button
      type="button"
      role="tab"
      aria-selected={isSelected}
      tabIndex={isSelected ? 0 : -1}
      disabled={disabled}
      onClick={() => ctx.onValueChange(value)}
      className={[
        'inline-flex items-center justify-center gap-2 px-3.5 py-1.5 text-xs font-medium rounded-lg transition-all duration-150 cursor-pointer select-none whitespace-nowrap',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1',
        'disabled:cursor-not-allowed disabled:opacity-40 active:scale-[0.98]',
        isSelected
          ? 'bg-surface text-text shadow-xs border border-border/50 font-semibold'
          : 'text-text-muted hover:text-text hover:bg-surface/50 border border-transparent',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {icon && <span className="w-3.5 h-3.5 shrink-0 leading-none">{icon}</span>}
      <span>{children}</span>
      {badge && <span className="shrink-0">{badge}</span>}
    </button>
  )
}

export function TabsContent({
  value,
  children,
  className = '',
}: {
  value: string
  children: React.ReactNode
  className?: string
}) {
  const ctx = useContext(TabsContext)
  if (!ctx) throw new Error('TabsContent must be used within Tabs')

  if (ctx.value !== value) return null

  return (
    <div
      role="tabpanel"
      tabIndex={0}
      className={`mt-4 animate-fade-in focus-visible:outline-none ${className}`}
    >
      {children}
    </div>
  )
}
