import { useState, useEffect, useCallback } from 'react'

export interface WorkspacePreferences {
  densidad: 'compact' | 'comfortable' | 'spacious'
  modoVisual: 'light' | 'dark' | 'system'
  vistaPredeterminadaCalendario: 'dia' | 'semana' | 'mes' | 'lista'
  rutaInicioPredeterminada: string
  sidebarColapsadaPorDefecto: boolean
  sonidosNotificacion: boolean
  alertasStockCritico: boolean
  alertasNuevasCitas: boolean
  confirmarCierreVenta: boolean
}

export const WORKSPACE_DEFAULTS: WorkspacePreferences = {
  densidad: 'comfortable',
  modoVisual: 'light',
  vistaPredeterminadaCalendario: 'mes',
  rutaInicioPredeterminada: '/dashboard',
  sidebarColapsadaPorDefecto: false,
  sonidosNotificacion: true,
  alertasStockCritico: true,
  alertasNuevasCitas: true,
  confirmarCierreVenta: false,
}

const STORAGE_WORKSPACE_KEY = 'sagitta_workspace_preferences_v1'
const STORAGE_FAVORITES_KEY = 'sagitta_favorite_commands'
const STORAGE_RECENTS_KEY = 'sagitta_recent_commands'
const WORKSPACE_EVENT = 'sagitta:workspace-updated'

export function useWorkspacePreferences() {
  const [preferences, setPreferences] = useState<WorkspacePreferences>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_WORKSPACE_KEY)
      if (raw) {
        return { ...WORKSPACE_DEFAULTS, ...JSON.parse(raw) }
      }
    } catch {
      // fallback
    }
    return { ...WORKSPACE_DEFAULTS }
  })

  const [favorites, setFavorites] = useState<string[]>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_FAVORITES_KEY)
      if (raw) return JSON.parse(raw)
    } catch {
      // fallback
    }
    return []
  })

  const [recents, setRecents] = useState<string[]>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_RECENTS_KEY)
      if (raw) return JSON.parse(raw)
    } catch {
      // fallback
    }
    return []
  })

  const updatePreference = useCallback(
    <K extends keyof WorkspacePreferences>(key: K, value: WorkspacePreferences[K]) => {
      setPreferences((prev) => {
        const next = { ...prev, [key]: value }
        try {
          localStorage.setItem(STORAGE_WORKSPACE_KEY, JSON.stringify(next))
          window.dispatchEvent(new CustomEvent(WORKSPACE_EVENT, { detail: next }))
        } catch {
          // ignore
        }
        return next
      })
    },
    []
  )

  const resetPreferences = useCallback(() => {
    setPreferences({ ...WORKSPACE_DEFAULTS })
    try {
      localStorage.setItem(STORAGE_WORKSPACE_KEY, JSON.stringify(WORKSPACE_DEFAULTS))
      window.dispatchEvent(new CustomEvent(WORKSPACE_EVENT, { detail: WORKSPACE_DEFAULTS }))
    } catch {
      // ignore
    }
  }, [])

  const removeFavorite = useCallback((id: string) => {
    setFavorites((prev) => {
      const next = prev.filter((favId) => favId !== id)
      try {
        localStorage.setItem(STORAGE_FAVORITES_KEY, JSON.stringify(next))
      } catch {
        // ignore
      }
      return next
    })
  }, [])

  const clearFavorites = useCallback(() => {
    setFavorites([])
    try {
      localStorage.removeItem(STORAGE_FAVORITES_KEY)
    } catch {
      // ignore
    }
  }, [])

  const clearRecents = useCallback(() => {
    setRecents([])
    try {
      localStorage.removeItem(STORAGE_RECENTS_KEY)
    } catch {
      // ignore
    }
  }, [])

  // Sincronizar cambios entre ventanas / componentes
  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_WORKSPACE_KEY && e.newValue) {
        try {
          setPreferences({ ...WORKSPACE_DEFAULTS, ...JSON.parse(e.newValue) })
        } catch {
          // ignore
        }
      }
      if (e.key === STORAGE_FAVORITES_KEY && e.newValue) {
        try {
          setFavorites(JSON.parse(e.newValue))
        } catch {
          // ignore
        }
      }
      if (e.key === STORAGE_RECENTS_KEY && e.newValue) {
        try {
          setRecents(JSON.parse(e.newValue))
        } catch {
          // ignore
        }
      }
    }

    window.addEventListener('storage', handleStorage)
    return () => window.removeEventListener('storage', handleStorage)
  }, [])

  return {
    preferences,
    updatePreference,
    resetPreferences,
    favorites,
    removeFavorite,
    clearFavorites,
    recents,
    clearRecents,
  }
}

