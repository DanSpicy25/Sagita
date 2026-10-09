import { describe, it, expect } from 'vitest'
import {
  TactileButton,
  BioluminescentBadge,
  QuickPeekCard,
  StreakCounter,
  EffervescentParticles,
  SkeletonShimmer,
  SkeletonMetric,
  SkeletonCard,
  SkeletonTransition,
} from '../index'

describe('Micro-interacciones Sensoriales & Skeletons de Cristal', () => {
  describe('1. Exportación y Definición de Primitivas', () => {
    it('exporta todos los componentes de shimmer de cristal', () => {
      expect(SkeletonShimmer).toBeDefined()
      expect(SkeletonMetric).toBeDefined()
      expect(SkeletonCard).toBeDefined()
      expect(SkeletonTransition).toBeDefined()
    })

    it('exporta las primitivas de micro-interacción y respuesta física', () => {
      expect(TactileButton).toBeDefined()
      expect(BioluminescentBadge).toBeDefined()
      expect(QuickPeekCard).toBeDefined()
      expect(StreakCounter).toBeDefined()
      expect(EffervescentParticles).toBeDefined()
    })
  })

  describe('2. Verificación de Tipos y Comportamiento', () => {
    it('TactileButton es un componente funcional con displayName adecuado', () => {
      expect(typeof TactileButton).toBe('object') // forwardRef render function
      expect(TactileButton.displayName).toBe('TactileButton')
    })

    it('BioluminescentBadge y QuickPeekCard son funciones React válidas', () => {
      expect(typeof BioluminescentBadge).toBe('function')
      expect(typeof QuickPeekCard).toBe('function')
      expect(typeof StreakCounter).toBe('function')
    })
  })
})

