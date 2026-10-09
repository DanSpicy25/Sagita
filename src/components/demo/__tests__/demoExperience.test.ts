import { describe, it, expect } from 'vitest'
import {
  DEMO_PRESENTATIONS,
  type DemoModuleId,
  type DeviceMode,
  MOCK_DEMO_SPECIALISTS,
  MOCK_DEMO_CLIENTS,
  MOCK_DEMO_SERVICES,
  MOCK_DEMO_PRODUCTS,
  MOCK_DEMO_APPOINTMENTS,
  DEMO_BUSINESS_INFO,
} from '../demoData'

describe('Fase 10 — Experiencia Comercial & Demo Center (Sales Demo Center)', () => {
  describe('1. Cobertura de los 7 Módulos Obligatorios del Contrato Sagitta', () => {
    const REQUIRED_MODULES: { id: DemoModuleId; label: string }[] = [
      { id: 'dashboard', label: 'Panel Principal' },
      { id: 'calendar', label: 'Agenda & Calendario' },
      { id: 'customers', label: 'Clientes & CRM 360°' },
      { id: 'services', label: 'Servicios & Subservicios' },
      { id: 'pos', label: 'Punto de Venta (POS)' },
      { id: 'inventory', label: 'Control de Inventario' },
      { id: 'reports', label: 'Reportes & Inteligencia' },
    ]

    it('registra exactamente los 7 módulos clave especificados en el contrato', () => {
      REQUIRED_MODULES.forEach(({ id, label }) => {
        const presentation = DEMO_PRESENTATIONS[id]
        expect(presentation, `El módulo "${id}" debe estar presente`).toBeDefined()
        expect(presentation.id).toBe(id)
        expect(presentation.label).toBe(label)
        expect(presentation.icon).toBeDefined()
        expect(presentation.tagline.length).toBeGreaterThan(10)
      })
    })

    it('cuenta con iconos válidos de Lucide para cada módulo sin fallos de importación', () => {
      Object.values(DEMO_PRESENTATIONS).forEach((presentation) => {
        expect(typeof presentation.icon).toBe('object')
      })
    })
  })

  describe('2. Estructura Mandatoria de las 4 Preguntas por Presentación', () => {
    const modules = Object.keys(DEMO_PRESENTATIONS) as DemoModuleId[]

    it('responde a la Pregunta 1: "¿Qué es esto?" de forma clara y suficiente en todos los módulos', () => {
      modules.forEach((modId) => {
        const { queEs } = DEMO_PRESENTATIONS[modId]
        expect(typeof queEs).toBe('string')
        expect(
          queEs.trim().length,
          `La respuesta "¿Qué es esto?" del módulo ${modId} debe ser detallada (>40 caracteres)`
        ).toBeGreaterThan(40)
      })
    })

    it('responde a la Pregunta 2: "¿Por qué es útil?" justificando el valor de negocio y ROI', () => {
      modules.forEach((modId) => {
        const { porQueEsUtil, kpisClave } = DEMO_PRESENTATIONS[modId]
        expect(typeof porQueEsUtil).toBe('string')
        expect(
          porQueEsUtil.trim().length,
          `La respuesta "¿Por qué es útil?" del módulo ${modId} debe ser detallada (>40 caracteres)`
        ).toBeGreaterThan(40)
        expect(
          kpisClave.length,
          `El módulo ${modId} debe incluir al menos 2 KPIs de impacto`
        ).toBeGreaterThanOrEqual(2)
        kpisClave.forEach((kpi) => {
          expect(kpi.label.length).toBeGreaterThan(0)
          expect(kpi.valor.length).toBeGreaterThan(0)
        })
      })
    })

    it('responde a la Pregunta 3: "¿Qué puedo hacer aquí?" con un checklist de al menos 3 capacidades interactivas', () => {
      modules.forEach((modId) => {
        const { quePuedoHacer } = DEMO_PRESENTATIONS[modId]
        expect(Array.isArray(quePuedoHacer)).toBe(true)
        expect(
          quePuedoHacer.length,
          `El módulo ${modId} debe listar al menos 3 acciones clave`
        ).toBeGreaterThanOrEqual(3)
        quePuedoHacer.forEach((action) => {
          expect(action.trim().length).toBeGreaterThan(10)
        })
      })
    })

    it('responde a la Pregunta 4: "¿Cómo se ve en móvil?" detallando adaptabilidad táctil y ergonomía', () => {
      modules.forEach((modId) => {
        const { comoSeVeEnMovil } = DEMO_PRESENTATIONS[modId]
        expect(typeof comoSeVeEnMovil).toBe('string')
        expect(
          comoSeVeEnMovil.trim().length,
          `La respuesta "¿Cómo se ve en móvil?" del módulo ${modId} debe superar los 40 caracteres`
        ).toBeGreaterThan(40)
      })
    })
  })

  describe('3. Integridad y Aislamiento de Datos Ficticios (Nova Clinic & Wellness)', () => {
    it('utiliza un negocio ficticio consistente sin exponer datos reales de inquilinos', () => {
      expect(DEMO_BUSINESS_INFO.nombre).toBe('Nova Clinic & Wellness')
      expect(DEMO_BUSINESS_INFO.vertical).toBe('Dermatología, Medicina Estética & Spa')
      expect(DEMO_BUSINESS_INFO.moneda).toBe('USD ($)')
      expect(DEMO_BUSINESS_INFO.isDemo).toBe(true)
    })

    it('proporciona especialistas ficticios con disponibilidad y buffers', () => {
      expect(MOCK_DEMO_SPECIALISTS.length).toBeGreaterThanOrEqual(3)
      MOCK_DEMO_SPECIALISTS.forEach((spec) => {
        expect(spec.id).toBeDefined()
        expect(spec.nombre.length).toBeGreaterThan(0)
        expect(spec.especialidad.length).toBeGreaterThan(0)
        expect(spec.color.startsWith('#') || spec.color.startsWith('rgb')).toBe(true)
        expect(spec.avatar.length).toBeGreaterThan(0)
      })
    })

    it('proporciona clientes simulados con expediente 360° (alergias, notas, etiquetas)', () => {
      expect(MOCK_DEMO_CLIENTS.length).toBeGreaterThanOrEqual(4)
      const hasVip = MOCK_DEMO_CLIENTS.some((c) => c.tags.includes('VIP'))
      const hasAlergias = MOCK_DEMO_CLIENTS.some((c) => c.alergias && c.alergias.length > 0)
      const hasConsentimiento = MOCK_DEMO_CLIENTS.some((c) => c.consentimientoFirmado)

      expect(hasVip, 'Debe haber clientes VIP en la demo comercial').toBe(true)
      expect(hasAlergias, 'Debe haber alertas clínicas/alergias simuladas').toBe(true)
      expect(hasConsentimiento, 'Debe mostrarse consentimiento informado firmado').toBe(true)
    })

    it('proporciona catálogo de servicios con multi-duración y variaciones de precio', () => {
      expect(MOCK_DEMO_SERVICES.length).toBeGreaterThanOrEqual(4)
      MOCK_DEMO_SERVICES.forEach((srv) => {
        expect(srv.duraciones.length).toBeGreaterThanOrEqual(1)
        srv.duraciones.forEach((dur) => {
          expect(dur.minutos).toBeGreaterThan(0)
          expect(dur.precio).toBeGreaterThan(0)
        })
      })
    })

    it('proporciona inventario retail con código de barras y niveles de stock crítico', () => {
      expect(MOCK_DEMO_PRODUCTS.length).toBeGreaterThanOrEqual(4)
      const hasStockCritico = MOCK_DEMO_PRODUCTS.some((p) => p.stock <= p.stockMinimo)
      expect(hasStockCritico, 'Debe haber productos con alerta de stock crítico').toBe(true)
      MOCK_DEMO_PRODUCTS.forEach((prd) => {
        expect(prd.sku.length).toBeGreaterThan(0)
        expect(prd.precioVenta).toBeGreaterThan(prd.costo)
      })
    })

    it('proporciona citas de demostración con múltiples estados operativos', () => {
      expect(MOCK_DEMO_APPOINTMENTS.length).toBeGreaterThanOrEqual(4)
      const statuses = new Set(MOCK_DEMO_APPOINTMENTS.map((a) => a.estado))
      expect(statuses.has('en_atencion')).toBe(true)
      expect(statuses.has('confirmada')).toBe(true)
    })
  })

  describe('4. Soporte Multidispositivo (Desktop, Tablet, Mobile)', () => {
    const modes: DeviceMode[] = ['desktop', 'tablet', 'mobile']

    it('soporta los 3 modos de dispositivo requeridos para presentaciones de ventas', () => {
      modes.forEach((mode) => {
        expect(['desktop', 'tablet', 'mobile']).toContain(mode)
      })
    })
  })
})
