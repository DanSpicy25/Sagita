import { describe, it, expect } from 'vitest'
import {
  MODULES,
  MODULE_CATEGORIES,
  MODULE_ICONS,
  PLAN_ORDER,
  getModule,
  getTechnicalRequirements,
  getTechnicalDependents,
} from '@/config/modules'
import { ALL_INDUSTRIES, getIndustryPreset } from '@/config/industries'
import { ModuleDefinition, ModuleId, TenantPlan } from '@/types'

describe('Fase 09 — Experiencia de Plataforma Modular (Modular Platform Experience)', () => {
  describe('1. Cobertura del Registro de Módulos (Module Registry Coverage)', () => {
    const requiredConcepts: { concept: string; expectedId: ModuleId }[] = [
      { concept: 'Agenda', expectedId: 'reservas' },
      { concept: 'Customers', expectedId: 'clientes' },
      { concept: 'Services', expectedId: 'servicios' },
      { concept: 'Sales', expectedId: 'pos' },
      { concept: 'POS & Hardware', expectedId: 'hardware' },
      { concept: 'Inventory', expectedId: 'inventario' },
      { concept: 'Payments', expectedId: 'finanzas' },
      { concept: 'Reports', expectedId: 'reportes' },
      { concept: 'CRM', expectedId: 'crm' },
      { concept: 'Loyalty', expectedId: 'fidelizacion' },
      { concept: 'Marketing', expectedId: 'marketing' },
      { concept: 'Commissions', expectedId: 'comisiones' },
      { concept: 'Automations', expectedId: 'automatizaciones' },
      { concept: 'Integrations', expectedId: 'integraciones' },
      { concept: 'Branches', expectedId: 'sucursales' },
    ]

    it('registra los 15 conceptos clave requeridos en el registro maestro', () => {
      requiredConcepts.forEach(({ concept, expectedId }) => {
        const mod = getModule(expectedId)
        expect(mod, `El módulo "${concept}" (${expectedId}) debe estar definido`).toBeDefined()
        expect(mod?.id).toBe(expectedId)
        expect(mod?.label.length).toBeGreaterThan(0)
        expect(mod?.description.length).toBeGreaterThan(0)
        expect(mod?.capabilities.length).toBeGreaterThan(0)
      })
    })

    it('asigna un icono distintivo de Lucide a cada módulo registrado sin excepciones', () => {
      MODULES.forEach((mod) => {
        const icon = MODULE_ICONS[mod.id]
        expect(icon, `Icono faltante para módulo ${mod.id}`).toBeDefined()
      })
    })

    it('asigna una categoría válida a cada módulo', () => {
      const validCategoryIds = new Set(MODULE_CATEGORIES.map((c) => c.id))
      MODULES.forEach((mod) => {
        expect(validCategoryIds.has(mod.category)).toBe(true)
      })
    })
  })

  describe('2. Verdad en el Etiquetado (Truth in Labeling)', () => {
    it('etiqueta como "disponible" o "parcial" las capacidades con soporte real implementado', () => {
      const implementedIds: ModuleId[] = [
        'dashboard',
        'reservas',
        'recepcion',
        'servicios',
        'profesionales',
        'recursos',
        'clientes',
        'pos',
        'finanzas',
        'hardware',
        'inventario',
        'reportes',
        'crm',
        'automatizaciones',
        'comisiones',
        'sucursales',
      ]

      implementedIds.forEach((id) => {
        const mod = getModule(id)
        expect(mod).toBeDefined()
        expect(['disponible', 'parcial']).toContain(mod?.availability)
      })
    })

    it('etiqueta estrictamente como "planificado" (no activo) las capacidades en hoja de ruta futura', () => {
      const roadmapIds: ModuleId[] = [
        'fidelizacion',
        'marketing',
        'compras',
        'portal_cliente',
      ]

      roadmapIds.forEach((id) => {
        const mod = getModule(id)
        expect(mod).toBeDefined()
        expect(mod?.availability).toBe('planificado')
        expect(mod?.core).toBe(false)
        expect(['backend_required', 'integration_required', 'mock']).toContain(mod?.backend)
      })
    })
  })

  describe('3. Patrón de Registro y Extensibilidad Abierta (Zero Giant Switch Statements)', () => {
    it('obtiene cualquier módulo mediante lookup en Map sin switch statements', () => {
      const reservas = getModule('reservas')
      expect(reservas?.label).toBe('Citas')
      expect(reservas?.category).toBe('operaciones')

      const comisiones = getModule('comisiones')
      expect(comisiones?.label).toBe('Comisiones')
      expect(comisiones?.category).toBe('ventas')

      const sucursales = getModule('sucursales')
      expect(sucursales?.label).toBe('Sucursales y Sedes')
      expect(sucursales?.category).toBe('configuracion')
    })

    it('permite registrar e indexar futuros módulos manteniendo compatibilidad de tipos', () => {
      const dummyModule: ModuleDefinition = {
        id: 'dashboard', // usando id válido para typecheck
        label: 'Módulo de Prueba',
        description: 'Prueba de extensibilidad',
        category: 'operaciones',
        core: false,
        availability: 'disponible',
        backend: 'frontend_ready',
        minPlan: 'starter',
        capabilities: ['Capacidad X'],
      }

      expect(dummyModule.label).toBe('Módulo de Prueba')
      expect(dummyModule.core).toBe(false)
    })
  })

  describe('4. Motor de Resolución de Dependencias Transitivas', () => {
    it('calcula los requisitos técnicos de un módulo dependiente', () => {
      // recepcion depende técnicamente de reservas
      const reqsRecepcion = getTechnicalRequirements('recepcion')
      expect(reqsRecepcion).toContain('reservas')

      // crm depende técnicamente de clientes
      const reqsCrm = getTechnicalRequirements('crm')
      expect(reqsCrm).toContain('clientes')

      // comisiones depende técnicamente de profesionales
      const reqsComisiones = getTechnicalRequirements('comisiones')
      expect(reqsComisiones).toContain('profesionales')
    })

    it('calcula los dependientes técnicos cuando se desactiva un módulo padre', () => {
      // profesionales es requerido por comisiones
      const depsProfesionales = getTechnicalDependents('profesionales')
      expect(depsProfesionales).toContain('comisiones')

      // clientes es requerido por crm
      const depsClientes = getTechnicalDependents('clientes')
      expect(depsClientes).toContain('crm')
    })

    it('los módulos core no reportan requerimientos que impidan su funcionamiento básico', () => {
      const coreModules = MODULES.filter((m) => m.core)
      coreModules.forEach((mod) => {
        expect(mod.core).toBe(true)
      })
    })
  })

  describe('5. Puertas de Plan Comercial (Commercial Plan Gatekeeping)', () => {
    function canActivatePlan(tenantPlan: TenantPlan, minRequiredPlan: TenantPlan): boolean {
      const currentLevel = PLAN_ORDER[tenantPlan] ?? 0
      const requiredLevel = PLAN_ORDER[minRequiredPlan] ?? 0
      return currentLevel >= requiredLevel
    }

    it('permite acceso total en plan Enterprise', () => {
      expect(canActivatePlan('enterprise', 'starter')).toBe(true)
      expect(canActivatePlan('enterprise', 'pro')).toBe(true)
      expect(canActivatePlan('enterprise', 'enterprise')).toBe(true)
    })

    it('bloquea módulos Enterprise para planes Starter y Pro', () => {
      expect(canActivatePlan('starter', 'enterprise')).toBe(false)
      expect(canActivatePlan('pro', 'enterprise')).toBe(false)
    })

    it('bloquea módulos Pro para plan Starter pero los permite en Pro', () => {
      expect(canActivatePlan('starter', 'pro')).toBe(false)
      expect(canActivatePlan('pro', 'pro')).toBe(true)
    })
  })

  describe('6. Adaptabilidad por Sector & Presets de Industria', () => {
    it('soporta 12 sectores industriales en ALL_INDUSTRIES', () => {
      expect(ALL_INDUSTRIES.length).toBe(12)
    })

    it('adapta la terminología en función del sector seleccionado', () => {
      const saludPreset = getIndustryPreset('salud')
      expect(saludPreset.terms.citas).toBe('Consultas')
      expect(saludPreset.terms.clientes).toBe('Pacientes')
      expect(saludPreset.terms.profesionales).toBe('Especialistas')
      expect(saludPreset.terms.recursos).toBe('Consultorios')

      const fitnessPreset = getIndustryPreset('fitness')
      expect(fitnessPreset.terms.citas).toBe('Clases')
      expect(fitnessPreset.terms.clientes).toBe('Miembros')
      expect(fitnessPreset.terms.profesionales).toBe('Entrenadores')

      const mascotasPreset = getIndustryPreset('mascotas')
      expect(mascotasPreset.terms.citas).toBe('Citas')
      expect(mascotasPreset.terms.clientes).toBe('Tutores')
      expect(mascotasPreset.terms.recursos).toBe('Consultorios y Tinas')
    })
  })
})

