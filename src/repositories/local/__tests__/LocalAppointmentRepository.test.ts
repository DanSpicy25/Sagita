import { describe, it, expect, beforeEach } from 'vitest'
import { LocalAppointmentRepository } from '../LocalAppointmentRepository'
import { LocalStorageAdapter } from '../LocalStorageAdapter'
import { Cita } from '@/types'

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
}

describe('LocalAppointmentRepository — Validación de Colisiones de Horario y Recursos', () => {
  let repo: LocalAppointmentRepository

  beforeEach(() => {
    const memory = new MemoryStorage()
    Object.defineProperty(globalThis, 'localStorage', {
      value: memory,
      writable: true,
      configurable: true,
    })
    repo = new LocalAppointmentRepository()

    // Configurar cita existente en 2026-10-10 de 10:00 a 11:00 con Especialista 1 y Recurso/Cabina 5
    const citaInicial: Cita = {
      id: 100,
      cliente_id: 1,
      empleado_id: 1,
      recurso_id: 5,
      servicio_id: 1,
      fecha_inicio: '2026-10-10 10:00:00',
      fecha_fin: '2026-10-10 11:00:00',
      estado: 'confirmada',
      precio_total: 50,
      created_at: '2026-10-01T00:00:00Z',
    }
    LocalStorageAdapter.setCollection('citas', [citaInicial])
  })

  it('detecta colisión cuando se intenta agendar al mismo especialista en horario solapado', async () => {
    await expect(
      repo.create({
        cliente_id: 2,
        empleado_id: 1, // Mismo especialista
        recurso_id: 6, // Otro recurso
        servicio_id: 1,
        fecha_inicio: '2026-10-10 10:30:00',
        fecha_fin: '2026-10-10 11:30:00',
        estado: 'confirmada',
        precio_total: 50,
      })
    ).rejects.toThrow(/Conflicto de horario: El profesional ya tiene una cita agendada/)
  })

  it('detecta colisión de recurso físico cuando otro especialista intenta reservar la misma cabina solapada', async () => {
    await expect(
      repo.create({
        cliente_id: 2,
        empleado_id: 2, // Diferente especialista
        recurso_id: 5, // Misma cabina/sala
        servicio_id: 1,
        fecha_inicio: '2026-10-10 10:15:00',
        fecha_fin: '2026-10-10 10:45:00',
        estado: 'confirmada',
        precio_total: 40,
      })
    ).rejects.toThrow(/Conflicto de recurso: La cabina\/sala seleccionada ya se encuentra ocupada/)
  })

  it('permite agendar con éxito si los horarios no se solapan', async () => {
    const res = await repo.create({
      cliente_id: 2,
      empleado_id: 1,
      recurso_id: 5,
      servicio_id: 1,
      fecha_inicio: '2026-10-10 11:30:00',
      fecha_fin: '2026-10-10 12:30:00',
      estado: 'confirmada',
      precio_total: 50,
    })

    expect(res.success).toBe(true)
    expect(res.data?.id).toBeDefined()
  })

  it('permite agendar en el mismo horario si tanto el especialista como el recurso son distintos', async () => {
    const res = await repo.create({
      cliente_id: 3,
      empleado_id: 2, // Especialista distinto
      recurso_id: 8, // Cabina distinta
      servicio_id: 2,
      fecha_inicio: '2026-10-10 10:00:00',
      fecha_fin: '2026-10-10 11:00:00',
      estado: 'confirmada',
      precio_total: 60,
    })

    expect(res.success).toBe(true)
  })

  it('calcula la disponibilidad considerando colisión del recurso solicitado', async () => {
    // Si consultamos disponibilidad para Especialista 2 pero en Cabina 5 (que está ocupada de 10:00 a 11:00)
    const res = await repo.getDisponibilidad(2, '2026-10-10', 1, 30, 5)

    expect(res.success).toBe(true)
    const slot10 = res.data?.find((s) => s.hora_inicio === '10:00')
    const slot1030 = res.data?.find((s) => s.hora_inicio === '10:30')
    const slot11 = res.data?.find((s) => s.hora_inicio === '11:00')

    expect(slot10?.disponible).toBe(false)
    expect(slot1030?.disponible).toBe(false)
    expect(slot11?.disponible).toBe(true)
  })
})
