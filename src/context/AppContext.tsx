import React, {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react'
import { Theme, Toast, ToastAction, ToastType } from '@/types'

export interface ToastOptions {
  duration?: number
  action?: ToastAction
}

// ─── Tipos ─────────────────────────────────────────────────────────────────

interface AppContextValue {
  theme: Theme
  setTheme: (theme: Theme) => void
  sidebarOpen: boolean
  toggleSidebar: () => void
  toasts: Toast[]
  addToast: (toast: Omit<Toast, 'id'>) => void
  removeToast: (id: string) => void
  toast: {
    success: (title: string, message?: string, options?: ToastOptions) => void
    error: (title: string, message?: string, options?: ToastOptions) => void
    warning: (title: string, message?: string, options?: ToastOptions) => void
    info: (title: string, message?: string, options?: ToastOptions) => void
    custom: (toast: Omit<Toast, 'id'>) => void
  }
}

// ─── Contexto ─────────────────────────────────────────────────────────────

export const AppContext = createContext<AppContextValue | undefined>(undefined)

const THEME_MIGRATION_KEY = 'sagitta_theme_migration'
const THEME_MIGRATION_VERSION = 'light-default-v1'

// ─── Provider ─────────────────────────────────────────────────────────────

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(() => {
    if (localStorage.getItem(THEME_MIGRATION_KEY) !== THEME_MIGRATION_VERSION) return 'light'
    return (localStorage.getItem('sagitta_theme') as Theme) ?? 'light'
  })
  const [sidebarOpen, setSidebarOpen] = useState(() => window.matchMedia('(min-width: 768px)').matches)
  const [toasts, setToasts] = useState<Toast[]>([])

  // Aplicar tema al html
  useEffect(() => {
    const root = document.documentElement
    localStorage.setItem(THEME_MIGRATION_KEY, THEME_MIGRATION_VERSION)
    if (theme === 'dark') root.classList.add('dark')
    else if (theme === 'light') root.classList.remove('dark')
    else {
      const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      root.classList.toggle('dark', isDark)
    }
    localStorage.setItem('sagitta_theme', theme)
  }, [theme])

  const setTheme = useCallback((t: Theme) => setThemeState(t), [])
  const toggleSidebar = useCallback(() => setSidebarOpen((o) => !o), [])

  const addToast = useCallback((toast: Omit<Toast, 'id'>) => {
    const id = crypto.randomUUID()
    const duration = toast.duration ?? 4000
    setToasts((prev) => [...prev, { ...toast, id }])
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), duration)
  }, [])

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const makeToast = useCallback(
    (type: ToastType) =>
      (title: string, message?: string, options?: ToastOptions) =>
        addToast({
          type,
          title,
          message,
          duration: options?.duration,
          action: options?.action,
        }),
    [addToast]
  )

  const value = useMemo<AppContextValue>(
    () => ({
      theme,
      setTheme,
      sidebarOpen,
      toggleSidebar,
      toasts,
      addToast,
      removeToast,
      toast: {
        success: makeToast('success'),
        error:   makeToast('error'),
        warning: makeToast('warning'),
        info:    makeToast('info'),
        custom:  addToast,
      },
    }),
    [theme, setTheme, sidebarOpen, toggleSidebar, toasts, addToast, removeToast, makeToast]
  )

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

