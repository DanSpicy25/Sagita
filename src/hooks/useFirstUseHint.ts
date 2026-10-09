import { useState, useEffect, useCallback } from 'react'

const HINT_STORAGE_PREFIX = 'sagitta_hint_'
const HINTS_UPDATED_EVENT = 'sagitta:hints-updated'

export function useFirstUseHint(hintKey?: string) {
  const [dismissed, setDismissed] = useState<boolean>(() => {
    if (!hintKey) return false
    try {
      return localStorage.getItem(`${HINT_STORAGE_PREFIX}${hintKey}`) === 'true'
    } catch {
      return false
    }
  })

  // Sincronizar estado si otro componente o settings restablece los hints
  useEffect(() => {
    const handleUpdate = () => {
      if (hintKey) {
        try {
          const val = localStorage.getItem(`${HINT_STORAGE_PREFIX}${hintKey}`) === 'true'
          setDismissed(val)
        } catch {
          setDismissed(false)
        }
      }
    }

    window.addEventListener(HINTS_UPDATED_EVENT, handleUpdate)
    return () => window.removeEventListener(HINTS_UPDATED_EVENT, handleUpdate)
  }, [hintKey])

  const dismiss = useCallback(
    (keyToDismiss?: string) => {
      const key = keyToDismiss || hintKey
      if (!key) return
      try {
        localStorage.setItem(`${HINT_STORAGE_PREFIX}${key}`, 'true')
        if (key === hintKey) setDismissed(true)
        window.dispatchEvent(new CustomEvent(HINTS_UPDATED_EVENT))
      } catch {
        // Ignorar excepciones de cuota de storage
      }
    },
    [hintKey]
  )

  const isDismissed = useCallback((key: string): boolean => {
    try {
      return localStorage.getItem(`${HINT_STORAGE_PREFIX}${key}`) === 'true'
    } catch {
      return false
    }
  }, [])

  const resetHint = useCallback((key: string) => {
    try {
      localStorage.removeItem(`${HINT_STORAGE_PREFIX}${key}`)
      window.dispatchEvent(new CustomEvent(HINTS_UPDATED_EVENT))
    } catch {
      // Ignorar
    }
  }, [])

  const resetAllHints = useCallback(() => {
    try {
      const keysToRemove: string[] = []
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i)
        if (k && k.startsWith(HINT_STORAGE_PREFIX)) {
          keysToRemove.push(k)
        }
      }
      keysToRemove.forEach((k) => localStorage.removeItem(k))
      window.dispatchEvent(new CustomEvent(HINTS_UPDATED_EVENT))
    } catch {
      // Ignorar
    }
  }, [])

  const getDismissedCount = useCallback((): number => {
    try {
      let count = 0
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i)
        if (k && k.startsWith(HINT_STORAGE_PREFIX)) {
          count++
        }
      }
      return count
    } catch {
      return 0
    }
  }, [])

  return {
    isDismissed: dismissed,
    isHintDismissed: isDismissed,
    dismiss,
    complete: dismiss,
    resetHint,
    resetAllHints,
    getDismissedCount,
  }
}

