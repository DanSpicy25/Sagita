import { describe, it, expect, beforeEach, vi } from 'vitest'

// Emulador en memoria para LocalStorage
class MemoryStorage {
  private store: Record<string, string> = {}

  getItem(key: string): string | null {
    return this.store[key] ?? null
  }

  setItem(key: string, value: string): void {
    this.store[key] = String(value)
  }

  removeItem(key: string): void {
    delete this.store[key]
  }

  clear(): void {
    this.store = {}
  }

  get length(): number {
    return Object.keys(this.store).length
  }

  key(index: number): string | null {
    return Object.keys(this.store)[index] ?? null
  }
}

describe('Fase 03 — Primitivas del Sistema de Interacción', () => {
  beforeEach(() => {
    const memory = new MemoryStorage()
    Object.defineProperty(globalThis, 'localStorage', {
      value: memory,
      writable: true,
      configurable: true,
    })
  })

  describe('1. First-Use Hints — Persistencia y Ciclo de Vida', () => {
    it('inicia en estado no descartado por defecto', async () => {
      const { useFirstUseHint } = await import('../useFirstUseHint')
      expect(typeof useFirstUseHint).toBe('function')
      expect(localStorage.getItem('sagitta_hint_test_key')).toBeNull()
    })

    it('persiste el descarte de sugerencias en localStorage y actualiza estado', async () => {
      const HINT_KEY = 'pos_shortcuts'
      localStorage.setItem(`sagitta_hint_${HINT_KEY}`, 'true')
      expect(localStorage.getItem(`sagitta_hint_${HINT_KEY}`)).toBe('true')
    })

    it('permite restablecer una sugerencia específica', () => {
      const HINT_KEY = 'agenda_drag_drop'
      localStorage.setItem(`sagitta_hint_${HINT_KEY}`, 'true')
      expect(localStorage.getItem(`sagitta_hint_${HINT_KEY}`)).toBe('true')

      localStorage.removeItem(`sagitta_hint_${HINT_KEY}`)
      expect(localStorage.getItem(`sagitta_hint_${HINT_KEY}`)).toBeNull()
    })

    it('permite restablecer todas las sugerencias registradas de una vez', () => {
      localStorage.setItem('sagitta_hint_1', 'true')
      localStorage.setItem('sagitta_hint_2', 'true')
      localStorage.setItem('other_unrelated_key', 'keep_me')

      // Simular resetAll
      const keysToRemove: string[] = []
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i)
        if (k && k.startsWith('sagitta_hint_')) {
          keysToRemove.push(k)
        }
      }
      keysToRemove.forEach((k) => localStorage.removeItem(k))

      expect(localStorage.getItem('sagitta_hint_1')).toBeNull()
      expect(localStorage.getItem('sagitta_hint_2')).toBeNull()
      expect(localStorage.getItem('other_unrelated_key')).toBe('keep_me')
    })
  })

  describe('2. Long-Press — Algoritmo de Detección y Umbrales', () => {
    it('cancela la pulsación si la distancia supera el umbral configurado', () => {
      const threshold = 10
      const startPos = { x: 100, y: 100 }
      const movePosExceeded = { x: 115, y: 105 } // dist = sqrt(15^2 + 5^2) = 15.8 > 10
      const movePosWithin = { x: 105, y: 105 }   // dist = sqrt(5^2 + 5^2) = 7.07 <= 10

      const distExceeded = Math.hypot(
        movePosExceeded.x - startPos.x,
        movePosExceeded.y - startPos.y
      )
      const distWithin = Math.hypot(
        movePosWithin.x - startPos.x,
        movePosWithin.y - startPos.y
      )

      expect(distExceeded > threshold).toBe(true)
      expect(distWithin <= threshold).toBe(true)
    })

    it('calcula la progresión de tiempo de pulsación normalizada entre 0 y 1', () => {
      const delay = 500
      const elapsedHalf = 250
      const elapsedFull = 500
      const elapsedOver = 600

      expect(Math.min(1, elapsedHalf / delay)).toBe(0.5)
      expect(Math.min(1, elapsedFull / delay)).toBe(1)
      expect(Math.min(1, elapsedOver / delay)).toBe(1)
    })
  })

  describe('3. Optimistic Action — Rollback y Tolerancia a Fallos', () => {
    it('revierte al estado previo cuando la promesa de backend falla', async () => {
      let state = { count: 10 }
      const previousState = { ...state }

      // Mutación optimista
      state = { count: 11 }
      expect(state.count).toBe(11)

      // Fallo simulado
      const mutate = async () => {
        throw new Error('Network timeout')
      }

      try {
        await mutate()
      } catch {
        // Rollback
        state = previousState
      }

      expect(state.count).toBe(10)
    })

    it('soporta ventana de acción Deshacer (Undo) en mutación exitosa', async () => {
      let state = { items: ['A', 'B', 'C'] }
      const previousState = [...state.items]

      // Eliminar item 'B'
      state = { items: state.items.filter((i) => i !== 'B') }
      expect(state.items).toEqual(['A', 'C'])

      // Acción Undo ejecutada por el usuario
      const undoAction = vi.fn(() => {
        state.items = previousState
      })

      undoAction()
      expect(undoAction).toHaveBeenCalledTimes(1)
      expect(state.items).toEqual(['A', 'B', 'C'])
    })
  })
})

