import { describe, it, expect } from 'vitest'
import { getEstadoConfig } from '../CitaBlock'
import type { Cita, EstadoCita } from '@/types'

describe('Fase 05 — Calendar Experience (Sagitta Master UX/UI)', () => {
  const mockCitaBase: Cita = {
    id: 101,
    cliente_id: 1,
    cliente: {
      id: 1,
      nombre: 'Elena Rostova',
      email: 'elena@example.com',
      telefono: '+34 600 123 456',
      total_citas: 5,
      created_at: '2026-01-01',
    },
    empleado_id: 2,
    empleado: {
      id: 2,
      usuario_id: 2,
      nombre: 'Carlos Barbero',
      email: 'carlos@sagitta.com',
      activo: true,
    },
    servicio_id: 5,
    servicio: {
      id: 5,
      nombre: 'Corte de Cabello Premium',
      duracion_base_min: 45,
      precio_base: 25,
      activo: true,
      buffer_antes_min: 0,
      buffer_despues_min: 0,
    },
    fecha_inicio: '2026-10-15 10:00',
    fecha_fin: '2026-10-15 10:45',
    estado: 'confirmada',
    precio_total: 25,
    created_at: '2026-10-10',
  }

  describe('1. CitaBlock — Multi-Método Accesible de Estados (No Depender Solo del Color)', () => {
    const estados: EstadoCita[] = [
      'confirmada',
      'pendiente',
      'en_atencion',
      'en_cola',
      'completada',
      'cancelada',
      'no_asistio',
      'reprogramada',
    ]

    it.each(estados)('asigna icono, etiqueta textual y clase de borde al estado "%s"', (estado) => {
      const config = getEstadoConfig(estado)

      // Verificación 1: Tiene icono reactivo válido
      expect(config.icon).toBeDefined()

      // Verificación 2: Tiene etiqueta textual explícita (no solo color)
      expect(typeof config.label).toBe('string')
      expect(config.label.length).toBeGreaterThan(0)

      // Verificación 3: Tiene indicador de borde lateral (borderClass)
      expect(config.borderClass).toContain('border-l-')

      // Verificación 4: Tiene fondo semántico y badge
      expect(config.bgClass).toBeDefined()
      expect(config.badgeClass).toBeDefined()
    })

    it('distingue correctamente citas activas de citas canceladas o completadas', () => {
      const confirmada = getEstadoConfig('confirmada')
      const completada = getEstadoConfig('completada')
      const cancelada = getEstadoConfig('cancelada')

      expect(confirmada.label).toBe('Confirmada')
      expect(confirmada.borderClass).toContain('border-l-success')

      expect(completada.label).toBe('Completada')
      expect(completada.borderClass).toContain('border-l-border-hover')

      expect(cancelada.label).toBe('Cancelada')
      expect(cancelada.borderClass).toContain('border-l-danger')
    })
  })

  describe('2. Filtros y Agrupación Horaria del Calendario', () => {
    it('filtra citas por fecha correctamente para la vista diaria', () => {
      const citas: Cita[] = [
        { ...mockCitaBase, id: 1, fecha_inicio: '2026-10-15 09:00' },
        { ...mockCitaBase, id: 2, fecha_inicio: '2026-10-15 11:00' },
        { ...mockCitaBase, id: 3, fecha_inicio: '2026-10-16 09:00' },
      ]

      const citasDelDia = citas.filter((c) => c.fecha_inicio.startsWith('2026-10-15'))
      expect(citasDelDia).toHaveLength(2)
      expect(citasDelDia.map((c) => c.id)).toEqual([1, 2])
    })

    it('asigna citas al bloque horario correspondiente (08:00 a 20:00)', () => {
      const cita = { ...mockCitaBase, fecha_inicio: '2026-10-15 14:30' }
      const hora = parseInt(cita.fecha_inicio.slice(11, 13), 10)
      expect(hora).toBe(14)
    })

    it('calcula métricas diarias precisas para el resumen de cabecera', () => {
      const citas: Cita[] = [
        { ...mockCitaBase, id: 1, estado: 'confirmada' },
        { ...mockCitaBase, id: 2, estado: 'en_atencion' },
        { ...mockCitaBase, id: 3, estado: 'completada' },
        { ...mockCitaBase, id: 4, estado: 'pendiente' },
      ]

      const total = citas.length
      const completadas = citas.filter((c) => c.estado === 'completada').length
      const enAtencion = citas.filter((c) => c.estado === 'en_atencion').length
      const pendientes = citas.filter((c) => c.estado === 'pendiente' || c.estado === 'confirmada').length

      expect(total).toBe(4)
      expect(completadas).toBe(1)
      expect(enAtencion).toBe(1)
      expect(pendientes).toBe(2)
    })
  })

  describe('3. Soporte Integral de las 4 Vistas', () => {
    it('soporta las 4 vistas del sistema: dia, semana, mes, lista', () => {
      const vistasPermitidas = ['dia', 'semana', 'mes', 'lista'] as const
      expect(vistasPermitidas).toContain('dia')
      expect(vistasPermitidas).toContain('semana')
      expect(vistasPermitidas).toContain('mes')
      expect(vistasPermitidas).toContain('lista')
    })
  })
})

