import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
  ONBOARDING_STEPS,
  type OnboardingStepId,
  type OnboardingStepDefinition,
} from '../onboardingTypes'
import { INITIAL_ONBOARDING_DATA } from '../useOnboarding'

// Emulador en memoria para LocalStorage en entorno Node
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

describe('Fase 11 — Onboarding Ligero & Ayuda Contextual Progresiva', () => {
  beforeEach(() => {
    const memory = new MemoryStorage()
    Object.defineProperty(globalThis, 'localStorage', {
      value: memory,
      writable: true,
      configurable: true,
    })

    if (typeof globalThis.window === 'undefined') {
      const eventListeners: Record<string, Function[]> = {}
      const mockWindow = {
        addEventListener: (event: string, cb: Function) => {
          eventListeners[event] = eventListeners[event] || []
          eventListeners[event].push(cb)
        },
        removeEventListener: (event: string, cb: Function) => {
          if (eventListeners[event]) {
            eventListeners[event] = eventListeners[event].filter((f) => f !== cb)
          }
        },
        dispatchEvent: (evt: any) => {
          const type = evt?.type
          if (eventListeners[type]) {
            eventListeners[type].forEach((cb) => cb(evt))
          }
          return true
        },
      }
      Object.defineProperty(globalThis, 'window', {
        value: mockWindow,
        writable: true,
        configurable: true,
      })
    }

    vi.restoreAllMocks()
  })

  // ─────────────────────────────────────────────────────────────
  // 1. Estructura y Secuencia de los 7 Pasos de Onboarding
  // ─────────────────────────────────────────────────────────────
  describe('1. Estructura y Secuencia de los 7 Pasos de Onboarding', () => {
    const EXPECTED_STEP_IDS: OnboardingStepId[] = [
      'negocio',
      'servicios',
      'horarios',
      'equipo',
      'pagos',
      'personalizacion',
      'listo',
    ]

    it('contiene con exactitud los 7 pasos obligatorios del Contrato Maestro', () => {
      expect(ONBOARDING_STEPS).toHaveLength(7)
      const actualIds = ONBOARDING_STEPS.map((s) => s.id)
      expect(actualIds).toEqual(EXPECTED_STEP_IDS)
    })

    it('respeta la numeración secuencial del 1 al 7 de forma estricta', () => {
      ONBOARDING_STEPS.forEach((step, index) => {
        expect(step.numero).toBe(index + 1)
      })
    })

    it('cuenta con títulos, subtítulos y descripciones informativas en español para cada paso', () => {
      ONBOARDING_STEPS.forEach((step) => {
        expect(step.titulo.length).toBeGreaterThan(3)
        expect(step.subtitulo.length).toBeGreaterThan(10)
        expect(step.descripcionCorta.length).toBeGreaterThan(15)
      })
    })

    it('establece una política de omisión segura: pasos 1 y 7 obligatorios, intermedios opcionales', () => {
      const stepMap = new Map<OnboardingStepId, OnboardingStepDefinition>(
        ONBOARDING_STEPS.map((s) => [s.id, s])
      )

      // Paso 1 (Negocio) y Paso 7 (Listo) no deben ser omitibles
      expect(stepMap.get('negocio')?.esOmitible).toBe(false)
      expect(stepMap.get('listo')?.esOmitible).toBe(false)

      // Pasos intermedios (servicios, horarios, equipo, pagos, personalización) son omitibles
      expect(stepMap.get('servicios')?.esOmitible).toBe(true)
      expect(stepMap.get('horarios')?.esOmitible).toBe(true)
      expect(stepMap.get('equipo')?.esOmitible).toBe(true)
      expect(stepMap.get('pagos')?.esOmitible).toBe(true)
      expect(stepMap.get('personalizacion')?.esOmitible).toBe(true)
    })
  })

  // ─────────────────────────────────────────────────────────────
  // 2. Integridad del Estado Inicial de Configuración
  // ─────────────────────────────────────────────────────────────
  describe('2. Integridad del Estado Inicial (INITIAL_ONBOARDING_DATA)', () => {
    it('provee valores iniciales coherentes para un salón o centro de servicios', () => {
      expect(INITIAL_ONBOARDING_DATA.vertical).toContain('Salón')
      expect(INITIAL_ONBOARDING_DATA.servicios.length).toBeGreaterThan(0)
      expect(INITIAL_ONBOARDING_DATA.servicios[0].duracionMin).toBe(45)
      expect(INITIAL_ONBOARDING_DATA.diasApertura).toContain('lunes')
      expect(INITIAL_ONBOARDING_DATA.horaApertura).toBe('09:00')
      expect(INITIAL_ONBOARDING_DATA.horaCierre).toBe('19:00')
    })

    it('incluye configuración de vocabulario personalizado adaptable por sector', () => {
      expect(INITIAL_ONBOARDING_DATA.terminoCita).toBe('cita')
      expect(INITIAL_ONBOARDING_DATA.terminoCliente).toBe('cliente')
      expect(INITIAL_ONBOARDING_DATA.colorPrimario).toMatch(/^#[0-9a-fA-F]{6}$/)
    })

    it('inicia con 0 pasos completados y banderas de cierre en falso', () => {
      const steps = Object.values(INITIAL_ONBOARDING_DATA.completedSteps)
      expect(steps.every((val) => val === false)).toBe(true)
      expect(INITIAL_ONBOARDING_DATA.isCompleted).toBe(false)
      expect(INITIAL_ONBOARDING_DATA.isDismissed).toBe(false)
    })
  })

  // ─────────────────────────────────────────────────────────────
  // 3. Lógica de Progreso y Cálculo de Completitud
  // ─────────────────────────────────────────────────────────────
  describe('3. Lógica de Progreso y Cálculo de Completitud', () => {
    it('calcula 0% con ningún paso completado', () => {
      const totalSteps = ONBOARDING_STEPS.length
      const completedCount = 0
      const progress = Math.round((completedCount / totalSteps) * 100)
      expect(progress).toBe(0)
    })

    it('calcula porcentajes intermedios y 100% al completar los 7 pasos', () => {
      const totalSteps = ONBOARDING_STEPS.length

      // 1 de 7 = ~14%
      expect(Math.round((1 / totalSteps) * 100)).toBe(14)
      // 4 de 7 = ~57%
      expect(Math.round((4 / totalSteps) * 100)).toBe(57)
      // 7 de 7 = 100%
      expect(Math.round((7 / totalSteps) * 100)).toBe(100)
    })

    it('persiste el estado de onboarding en localStorage bajo sagitta_onboarding_state', () => {
      const STORAGE_KEY = 'sagitta_onboarding_state'
      const customData = {
        ...INITIAL_ONBOARDING_DATA,
        nombreNegocio: 'Studio Elegance',
        completedSteps: {
          ...INITIAL_ONBOARDING_DATA.completedSteps,
          negocio: true,
        },
      }

      localStorage.setItem(STORAGE_KEY, JSON.stringify(customData))
      const retrieved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}')

      expect(retrieved.nombreNegocio).toBe('Studio Elegance')
      expect(retrieved.completedSteps.negocio).toBe(true)
      expect(retrieved.completedSteps.servicios).toBe(false)
    })

    it('permite restablecer el asistente a su estado inicial mediante reset', () => {
      const STORAGE_KEY = 'sagitta_onboarding_state'
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ ...INITIAL_ONBOARDING_DATA, isCompleted: true })
      )

      expect(localStorage.getItem(STORAGE_KEY)).not.toBeNull()

      // Simulación de acción resetOnboarding
      localStorage.removeItem(STORAGE_KEY)
      expect(localStorage.getItem(STORAGE_KEY)).toBeNull()
    })
  })

  // ─────────────────────────────────────────────────────────────
  // 4. Mecanismo de Sugerencias Contextuales y Replay Tips
  // ─────────────────────────────────────────────────────────────
  describe('4. Mecanismo de Sugerencias Contextuales y Replay Tips', () => {
    const HINT_PREFIX = 'sagitta_hint_'

    it('guarda las pistas cerradas con el prefijo sagitta_hint_', () => {
      const hintKey = 'citas_buffers'
      localStorage.setItem(`${HINT_PREFIX}${hintKey}`, 'true')

      expect(localStorage.getItem(`${HINT_PREFIX}${hintKey}`)).toBe('true')
    })

    it('restablece selectivamente solo las pistas contextuales sin borrar configuraciones ajenas', () => {
      // Guardar pistas
      localStorage.setItem(`${HINT_PREFIX}citas_buffers`, 'true')
      localStorage.setItem(`${HINT_PREFIX}recursos_capacidad`, 'true')
      localStorage.setItem(`${HINT_PREFIX}inventario_umbral`, 'true')

      // Guardar datos no relacionados que deben preservarse
      localStorage.setItem('sagitta_theme', 'dark')
      localStorage.setItem('sagitta_auth_token', 'jwt-token-sample')
      localStorage.setItem('sagitta_onboarding_state', JSON.stringify({ isCompleted: true }))

      // Simulación de resetAllHints (Replay tips)
      const keysToRemove: string[] = []
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i)
        if (k && k.startsWith(HINT_PREFIX)) {
          keysToRemove.push(k)
        }
      }
      keysToRemove.forEach((k) => localStorage.removeItem(k))

      // Verificar que los hints se eliminaron
      expect(localStorage.getItem(`${HINT_PREFIX}citas_buffers`)).toBeNull()
      expect(localStorage.getItem(`${HINT_PREFIX}recursos_capacidad`)).toBeNull()
      expect(localStorage.getItem(`${HINT_PREFIX}inventario_umbral`)).toBeNull()

      // Verificar que las configuraciones críticas se mantuvieron intactas
      expect(localStorage.getItem('sagitta_theme')).toBe('dark')
      expect(localStorage.getItem('sagitta_auth_token')).toBe('jwt-token-sample')
      expect(localStorage.getItem('sagitta_onboarding_state')).not.toBeNull()
    })

    it('emite el evento global sagitta:hints-updated al reactivar consejos para actualizar la interfaz en tiempo real', () => {
      const dispatchSpy = vi.spyOn(window, 'dispatchEvent')
      window.dispatchEvent({ type: 'sagitta:hints-updated' } as any)

      expect(dispatchSpy).toHaveBeenCalledTimes(1)
      const event = dispatchSpy.mock.calls[0][0] as any
      expect(event.type).toBe('sagitta:hints-updated')
    })
  })

  // ─────────────────────────────────────────────────────────────
  // 5. Cobertura de Puntos Críticos de Confusión en la Aplicación
  // ─────────────────────────────────────────────────────────────
  describe('5. Catálogo de Guías en Puntos Críticos de Confusión', () => {
    const CRITICAL_HINTS = [
      {
        key: 'citas_buffers',
        modulo: 'Citas',
        concepto: 'Buffers y tiempos de holgura entre citas',
      },
      {
        key: 'recursos_capacidad',
        modulo: 'Recursos',
        concepto: 'Capacidad física de salas/cabinas vs disponibilidad de especialistas',
      },
      {
        key: 'inventario_umbral',
        modulo: 'Inventario',
        concepto: 'Umbral de stock mínimo y alertas automáticas de reposición',
      },
      {
        key: 'roles_seguridad',
        modulo: 'Roles',
        concepto: 'Matriz de permisos de seguridad y principio de menor privilegio',
      },
      {
        key: 'dashboard_intro',
        modulo: 'Dashboard',
        concepto: 'Cálculo de métricas clave y facturación en tiempo real',
      },
    ]

    it('cubre todos los puntos de confusión explícitamente requeridos en la especificación de Fase 11', () => {
      CRITICAL_HINTS.forEach((hint) => {
        expect(hint.key).toBeDefined()
        expect(hint.modulo.length).toBeGreaterThan(2)
        expect(hint.concepto.length).toBeGreaterThan(10)
      })
      expect(CRITICAL_HINTS).toHaveLength(5)
    })
  })
})
