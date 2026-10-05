import React, { createContext, useContext } from 'react'

interface TabsContextType {
  value: string
  onValueChange: (val: string) => void
}

const TabsContext = createContext<TabsContextType | null>(null)

export interface TabsProps {
  value: string
  onValueChange: (val: string) => void
  children: React.ReactNode
  className?: string
}

export function Tabs({ value, onValueChange, children, className = '' }: TabsProps) {
  return (
    <TabsContext.Provider value={{ value, onValueChange }}>
      <div className={`w-full ${className}`}>{children}</div>
    </TabsContext.Provider>
  )
}

export function TabsList({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={`inline-flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-xl border border-slate-200/50 dark:border-slate-700/50 ${className}`}
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
}

export function TabsTrigger({ value, children, icon, className = '', disabled }: TabsTriggerProps) {
  const ctx = useContext(TabsContext)
  if (!ctx) throw new Error('TabsTrigger must be used within Tabs')

  const isSelected = ctx.value === value

  return (
    <button
      type="button"
      role="tab"
      aria-selected={isSelected}
      disabled={disabled}
      onClick={() => ctx.onValueChange(value)}
      className={`inline-flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer disabled:cursor-not-allowed disabled:opacity-40 ${
        isSelected
          ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
      } ${className}`}
    >
      {icon && <span className="w-3.5 h-3.5">{icon}</span>}
      <span>{children}</span>
    </button>
  )
}

export function TabsContent({ value, children, className = '' }: { value: string; children: React.ReactNode; className?: string }) {
  const ctx = useContext(TabsContext)
  if (!ctx) throw new Error('TabsContent must be used within Tabs')

  if (ctx.value !== value) return null

  return (
    <div className={`mt-4 animate-in fade-in-50 duration-150 ${className}`}>
      {children}
    </div>
  )
}
