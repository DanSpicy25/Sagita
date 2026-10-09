import { describe, it, expect } from 'vitest'
import {
  SECTOR_PRESETS,
  SectorId,
  playSynthesizedHapticClick,
} from '../SectorContext'

describe('Rediseño Camaleónico Multivertical — SectorContext & Tokens Paramétricos', () => {
  describe('1. Cobertura Estricta de los 4 Sectores Comerciales Requeridos', () => {
    const requiredSectors: SectorId[] = ['gastronomia', 'retail', 'farmacia', 'spa']

    it('registra los 4 presets de industria sin omisiones', () => {
      requiredSectors.forEach((sectorId) => {
        const preset = SECTOR_PRESETS[sectorId]
        expect(preset, `Preset para ${sectorId} debe existir`).toBeDefined()
        expect(preset.vocabulario).toBeDefined()
        expect(preset.tokens).toBeDefined()
        expect(preset.mockItems.length).toBeGreaterThan(0)
        expect(preset.mockOrders.length).toBeGreaterThan(0)
      })
    })

    it('Gastronomía & Fast Food: inyecta vocabulario y tokens estéticos exactos', () => {
      const { vocabulario, tokens } = SECTOR_PRESETS.gastronomia

      // Vocabulario estricto
      expect(vocabulario.unidad).toBe('Comanda / Mesa')
      expect(vocabulario.item).toBe('Platillo / Menú')
      expect(vocabulario.stock).toBe('Receta & Insumos')
      expect(vocabulario.accionPrincipal).toBe('Despachar KDS')
      expect(vocabulario.cola).toBe('Cola de Cocina')

      // Tokens estéticos estrictos
      expect(tokens.bgDark).toBe('#0A0A0C') // Obsidiana profunda
      expect(tokens.accentColor).toBe('#f97316') // Ámbar / naranja vibrante
      expect(tokens.radiusClass).toBe('rounded-xl')
    })

    it('Retail & Tiendas de Ropa: inyecta vocabulario y tokens estéticos exactos', () => {
      const { vocabulario, tokens } = SECTOR_PRESETS.retail

      // Vocabulario estricto
      expect(vocabulario.unidad).toBe('Ticket Mostrador')
      expect(vocabulario.item).toBe('Prenda / Modelo')
      expect(vocabulario.stock).toBe('Tallas & Colores')
      expect(vocabulario.accionPrincipal).toBe('Escanear Código')
      expect(vocabulario.cola).toBe('Línea de Caja')

      // Tokens estéticos estrictos
      expect(tokens.accentColor).toBe('#6366f1') // Índigo / azul eléctrico
      expect(tokens.radiusClass).toBe('rounded-xl')
    })

    it('Farmacias & Salud: inyecta vocabulario y tokens estéticos exactos', () => {
      const { vocabulario, tokens } = SECTOR_PRESETS.farmacia

      // Vocabulario estricto
      expect(vocabulario.unidad).toBe('Dispensación')
      expect(vocabulario.item).toBe('Medicamento / Fármaco')
      expect(vocabulario.stock).toBe('Lotes & Vencimientos')
      expect(vocabulario.accionPrincipal).toBe('Verificar Receta')
      expect(vocabulario.cola).toBe('Mostrador Ético')

      // Tokens estéticos estrictos
      expect(tokens.accentColor).toBe('#10b981') // Esmeralda / menta técnica
      expect(tokens.radiusClass).toBe('rounded-lg') // Bordes compactos
    })

    it('Spas & Centros de Estética: inyecta vocabulario y tokens estéticos exactos', () => {
      const { vocabulario, tokens } = SECTOR_PRESETS.spa

      // Vocabulario estricto
      expect(vocabulario.unidad).toBe('Cita / Sesión')
      expect(vocabulario.item).toBe('Tratamiento')
      expect(vocabulario.stock).toBe('Cabinas & Protocolos')
      expect(vocabulario.accionPrincipal).toBe('Iniciar Cita')
      expect(vocabulario.cola).toBe('Recepción Zen')

      // Tokens estéticos estrictos
      expect(tokens.accentColor).toBe('#ec4899') // Lavanda / rosa empolvado
      expect(tokens.radiusClass).toBe('rounded-3xl') // Curvatura amplia de lujo
    })
  })

  describe('2. Consistencia de Catálogos Mock y Atributos Técnicos', () => {
    it('cada sector cuenta con ítems catalogados con atributos sectoriales', () => {
      Object.entries(SECTOR_PRESETS).forEach(([, preset]) => {
        expect(preset.mockItems.length).toBeGreaterThanOrEqual(4)

        preset.mockItems.forEach((item) => {
          expect(item.id).toBeDefined()
          expect(item.nombre.length).toBeGreaterThan(2)
          expect(item.precio).toBeGreaterThan(0)
          expect(item.codigo).toMatch(/^#[A-Z0-9-]+$/)
          expect(item.stockOAtributo.length).toBeGreaterThan(0)
          expect(item.notaTecnica.length).toBeGreaterThan(0)
          expect(item.tiempoMin).toBeGreaterThan(0)
        })
      })
    })

    it('cada sector cuenta con órdenes activas en cola de despacho', () => {
      Object.entries(SECTOR_PRESETS).forEach(([, preset]) => {
        expect(preset.mockOrders.length).toBeGreaterThanOrEqual(2)

        preset.mockOrders.forEach((orden) => {
          expect(orden.id).toBeDefined()
          expect(orden.clienteOIdentificador.length).toBeGreaterThan(0)
          expect(orden.items.length).toBeGreaterThan(0)
          expect(orden.total).toBeGreaterThan(0)
          expect(['en_cola', 'en_preparacion', 'listo', 'completado']).toContain(
            orden.estado
          )
        })
      })
    })
  })

  describe('3. Audio Síntesis Háptico Táctil a Nivel Mecánico', () => {
    it('la función playSynthesizedHapticClick es segura y no lanza excepciones en entornos sin audio', () => {
      expect(() => {
        playSynthesizedHapticClick()
      }).not.toThrow()
    })
  })
})
