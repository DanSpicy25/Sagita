import React, {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react'
import { Theme, Toast, ToastType } from '@/types'

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
    success: (title: string, message?: string) => void
    error: (title: string, message?: string) => void
    warning: (title: string, message?: string) => void
    info: (title: string, message?: string) => void
  }
}

// ─── Contexto ─────────────────────────────────────────────────────────────

export const AppContext = createContext<AppContextValue | undefined>(undefined)

// ─── Provider ─────────────────────────────────────────────────────────────

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(() => {
    return (localStorage.getItem('sagitta_theme') as Theme) ?? 'dark'
  })
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [toasts, setToasts] = useState<Toast[]>([])

  // Aplicar tema al html
  useEffect(() => {
    const root = document.documentElement
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
      (title: string, message?: string) =>
        addToast({ type, title, message }),
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
      },
    }),
    [theme, setTheme, sidebarOpen, toggleSidebar, toasts, addToast, removeToast, makeToast]
  )

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

