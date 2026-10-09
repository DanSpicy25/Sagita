import { describe, it, expect, beforeEach } from 'vitest'
import {
  getWidgetPreferences,
  saveWidgetPreferences,
  getWidgetOrder,
  saveWidgetOrder,
  resetWidgetConfig,
  DEFAULT_WIDGET_ORDER,
  type DashboardWidgetId,
} from '@/components/dashboard/dashboardConfig'
import { WORKSPACE_DEFAULTS } from '@/hooks/useWorkspacePreferences'
import { translateTerm } from '@/config/industries'
import { MODULES, PLAN_ORDER } from '@/config/modules'
import type { TermKey } from '@/types'

// Mock Storage para pruebas en Node / Vitest
class MemoryStorage {
  private store: Record<string, string> = {}
  getItem(key: string) { return this.store[key] ?? null }
  setItem(key: string, val: string) { this.store[key] = String(val) }
  removeItem(key: string) { delete this.store[key] }
  clear() { this.store = {} }
}

describe('Fase 06 — Control Center & Personalization (Sagitta Master UX/UI)', () => {
  beforeEach(() => {
    const memory = new MemoryStorage()
    Object.defineProperty(globalThis, 'localStorage', {
      value: memory,
      writable: true,
      configurable: true,
    })
  })

  describe('1. Personalización del Dashboard (Visibilidad, Orden y Reset)', () => {
    it('inicia con los 5 widgets predeterminados visibles', () => {
      const prefs = getWidgetPreferences()
      expect(prefs.metricas).toBe(true)
      expect(prefs.agenda_hoy).toBe(true)
      expect(prefs.cola_recepcion).toBe(true)
      expect(prefs.alertas_operativas).toBe(true)
      expect(prefs.acciones_rapidas).toBe(true)
    })

    it('persiste cambios en la visibilidad de los widgets', () => {
      const updated = {
        metricas: true,
        agenda_hoy: false,
        cola_recepcion: true,
        alertas_operativas: false,
        acciones_rapidas: true,
      }
      saveWidgetPreferences(updated)
      expect(getWidgetPreferences().agenda_hoy).toBe(false)
      expect(getWidgetPreferences().alertas_operativas).toBe(false)
      expect(getWidgetPreferences().metricas).toBe(true)
    })

    it('inicia con el orden estándar de widgets y permite reordenar', () => {
      const initialOrder = getWidgetOrder()
      expect(initialOrder).toEqual(DEFAULT_WIDGET_ORDER)

      const reordered: DashboardWidgetId[] = [
        'agenda_hoy',
        'metricas',
        'acciones_rapidas',
        'cola_recepcion',
        'alertas_operativas',
      ]
      saveWidgetOrder(reordered)
      expect(getWidgetOrder()).toEqual(reordered)
    })

    it('restaura el orden y visibilidad de fábrica con resetWidgetConfig', () => {
      saveWidgetPreferences({
        metricas: false,
        agenda_hoy: false,
        cola_recepcion: false,
        alertas_operativas: false,
        acciones_rapidas: false,
      })
      saveWidgetOrder(['acciones_rapidas', 'metricas', 'agenda_hoy', 'alertas_operativas', 'cola_recepcion'])

      const { prefs, order } = resetWidgetConfig()
      expect(prefs.metricas).toBe(true)
      expect(prefs.agenda_hoy).toBe(true)
      expect(order).toEqual(DEFAULT_WIDGET_ORDER)
    })
  })

  describe('2. Preferencias del Espacio de Trabajo (Workspace Defaults)', () => {
    it('define valores predeterminados ergonómicos y estables', () => {
      expect(WORKSPACE_DEFAULTS.densidad).toBe('comfortable')
      expect(WORKSPACE_DEFAULTS.modoVisual).toBe('light')
      expect(WORKSPACE_DEFAULTS.vistaPredeterminadaCalendario).toBe('mes')
      expect(WORKSPACE_DEFAULTS.rutaInicioPredeterminada).toBe('/dashboard')
      expect(WORKSPACE_DEFAULTS.sonidosNotificacion).toBe(true)
      expect(WORKSPACE_DEFAULTS.alertasStockCritico).toBe(true)
    })
  })

  describe('3. Matriz de Estados de Módulos (active, available, disabled, restricted)', () => {
    it('valida que no existan módulos fabricados fuera de MODULES', () => {
      expect(MODULES.length).toBeGreaterThanOrEqual(18)
      MODULES.forEach((mod) => {
        expect(mod.id).toBeDefined()
        expect(mod.label).toBeDefined()
        expect(mod.category).toBeDefined()
        expect(mod.minPlan).toBeDefined()
      })
    })

    it('identifica correctamente módulos restringidos por plan', () => {
      const planStarterLevel = PLAN_ORDER['starter'] // 0
      const planProLevel = PLAN_ORDER['pro']         // 1

      // Módulo con minPlan 'pro' está restringido en plan starter
      const moduloPro = MODULES.find((m) => m.minPlan === 'pro')
      if (moduloPro) {
        const isRestricted = planStarterLevel < (PLAN_ORDER[moduloPro.minPlan] ?? 0)
        expect(isRestricted).toBe(true)

        const isAvailableInPro = planProLevel >= (PLAN_ORDER[moduloPro.minPlan] ?? 0)
        expect(isAvailableInPro).toBe(true)
      }
    })

    it('asegura que los módulos core no puedan ser omitidos', () => {
      const coreModules = MODULES.filter((m) => m.core)
      expect(coreModules.some((m) => m.id === 'dashboard')).toBe(true)
    })
  })

  describe('4. Arquitectura de Terminología de Dominio Configurable', () => {
    it('traduce términos según el preset del sector seleccionado', () => {
      expect(translateTerm('belleza', 'profesional', 'Profesional')).toBe('Especialista')
      expect(translateTerm('belleza', 'servicio', 'Servicio')).toBe('Tratamiento')
      expect(translateTerm('salud', 'cliente', 'Cliente')).toBe('Paciente')
      expect(translateTerm('salud', 'cita', 'Cita')).toBe('Consulta')
      expect(translateTerm('educacion', 'cliente', 'Cliente')).toBe('Alumno / Estudiante')
    })

    it('permite sobreescribir cualquier término con terminos_personalizados', () => {
      const customTerms: Partial<Record<TermKey, string>> = {
        cliente: 'Socio VIP',
        clientes: 'Socios VIP',
        cita: 'Sesión Personalizada',
      }

      // En el sector belleza normalmente sería Especialista y Tratamiento
      expect(translateTerm('belleza', 'cliente', 'Cliente', customTerms)).toBe('Socio VIP')
      expect(translateTerm('belleza', 'clientes', 'Clientes', customTerms)).toBe('Socios VIP')
      expect(translateTerm('belleza', 'cita', 'Cita', customTerms)).toBe('Sesión Personalizada')

      // Términos no sobreescritos mantienen el preset del sector
      expect(translateTerm('belleza', 'profesional', 'Profesional', customTerms)).toBe('Especialista')
      expect(translateTerm('belleza', 'servicio', 'Servicio', customTerms)).toBe('Tratamiento')
    })

    it('utiliza el fallback si no existe en el preset ni en los personalizados', () => {
      expect(translateTerm('general', 'recurso', 'Recurso Base')).toBe('Recurso')
    })
  })
})

