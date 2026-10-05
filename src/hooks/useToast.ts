import { useContext } from 'react'
import { AppContext } from '@/context/AppContext'

export function useToast() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useToast debe usarse dentro de <AppProvider>')
  return {
    toast: ctx.toast,
    toasts: ctx.toasts,
    addToast: ctx.addToast,
    removeToast: ctx.removeToast,
  }
}

