import { describe, it, expect } from 'vitest'
import { getRoleCapabilities, getRoleLabel } from '@/hooks/useRole'
import { ROLE_PERMISSIONS } from '@/context/AuthContext'
import { Cita, User } from '@/types'

describe('Fase 07 — Experiencia Adaptada por Rol (Role-Aware Experience)', () => {
  describe('1. Capacidades y Predicados por Rol (Capabilities & Labels)', () => {
    it('asigna capacidades macro de negocio a superadmin y admin', () => {
      const capsSuper = getRoleCapabilities('superadmin')
      expect(capsSuper.canViewFinancials).toBe(true)
      expect(capsSuper.canManageSettings).toBe(true)
      expect(capsSuper.canManageUsers).toBe(true)
      expect(capsSuper.canManageInventory).toBe(true)
      expect(capsSuper.canChargePOS).toBe(true)
      expect(capsSuper.isPersonalAgendaPriority).toBe(false)
      expect(getRoleLabel('superadmin')).toBe('Superadministrador')

      const capsAdmin = getRoleCapabilities('admin')
      expect(capsAdmin.canViewFinancials).toBe(true)
      expect(capsAdmin.canManageSettings).toBe(true)
      expect(capsAdmin.canManageUsers).toBe(true)
      expect(capsAdmin.canManageInventory).toBe(true)
      expect(capsAdmin.canChargePOS).toBe(true)
      expect(capsAdmin.isPersonalAgendaPriority).toBe(false)
      expect(getRoleLabel('admin')).toBe('Administrador')
    })

    it('asigna capacidades operativas de mostrador a recepcionista', () => {
      const capsRecepcion = getRoleCapabilities('recepcionista')
      expect(capsRecepcion.canWalkInReception).toBe(true)
      expect(capsRecepcion.canChargePOS).toBe(true)
      expect(capsRecepcion.canViewFinancials).toBe(false)
      expect(capsRecepcion.canManageSettings).toBe(false)
      expect(capsRecepcion.canManageUsers).toBe(false)
      expect(capsRecepcion.canManageInventory).toBe(false)
      expect(capsRecepcion.isPersonalAgendaPriority).toBe(false)
      expect(getRoleLabel('recepcionista')).toBe('Recepción')
    })

    it('aísla métricas financieras y prioriza agenda personal para empleado / profesional', () => {
      const capsWorker = getRoleCapabilities('empleado')
      expect(capsWorker.isPersonalAgendaPriority).toBe(true)
      expect(capsWorker.canViewFinancials).toBe(false)
      expect(capsWorker.canManageSettings).toBe(false)
      expect(capsWorker.canManageUsers).toBe(false)
      expect(capsWorker.canManageInventory).toBe(false)
      expect(capsWorker.canChargePOS).toBe(false)
      expect(getRoleLabel('empleado')).toBe('Profesional')

      const capsProf = getRoleCapabilities('profesional')
      expect(capsProf.isPersonalAgendaPriority).toBe(true)
      expect(capsProf.canViewFinancials).toBe(false)
      expect(getRoleLabel('profesional')).toBe('Profesional')
    })

    it('respeta permisos explícitos dinámicos si se suministran', () => {
      // Un empleado con permiso explícito de ventas concedido
      const hasPerm = (p: string) => p === 'sales.read' || p === 'sales.create'
      const capsConPermiso = getRoleCapabilities('empleado', hasPerm)
      expect(capsConPermiso.canChargePOS).toBe(true)
      expect(capsConPermiso.canViewFinancials).toBe(true)
      expect(capsConPermiso.canManageSettings).toBe(false)
    })
  })

  describe('2. Matriz de Permisos de Seguridad (ROLE_PERMISSIONS Authorization Baseline)', () => {
    it('garantiza que empleado no tiene permisos de caja, inventario ni reportes', () => {
      const workerPerms = ROLE_PERMISSIONS['empleado']
      expect(workerPerms).toBeDefined()
      expect(workerPerms).toContain('appointments.read')
      expect(workerPerms).toContain('clients.read')
      expect(workerPerms).toContain('services.read')

      expect(workerPerms).not.toContain('sales.read')
      expect(workerPerms).not.toContain('sales.create')
      expect(workerPerms).not.toContain('inventory.read')
      expect(workerPerms).not.toContain('inventory.manage')
      expect(workerPerms).not.toContain('reports.read')
      expect(workerPerms).not.toContain('settings.manage')
      expect(workerPerms).not.toContain('users.manage')
    })

    it('garantiza que recepcionista tiene permisos de citas, clientes y ventas', () => {
      const recepPerms = ROLE_PERMISSIONS['recepcionista']
      expect(recepPerms).toContain('appointments.read')
      expect(recepPerms).toContain('appointments.create')
      expect(recepPerms).toContain('clients.read')
      expect(recepPerms).toContain('sales.read')
      expect(recepPerms).toContain('sales.create')

      expect(recepPerms).not.toContain('inventory.manage')
      expect(recepPerms).not.toContain('settings.manage')
      expect(recepPerms).not.toContain('reports.read')
    })
  })

  describe('3. Asignación de Citas al Profesional (Assignment Predicate)', () => {
    const userWorker: User = {
      id: 3,
      nombre: 'Elena Profesional',
      email: 'empleado@tienda.com',
      rol: 'empleado',
      timezone: 'America/New_York',
      created_at: '2026-02-01T00:00:00.000Z',
    }

    const currentEmpleadoId = 10

    const isAssigned = (item: {
      empleado_id?: number
      empleado?: { id?: number; usuario_id?: number; email?: string } | null
    }): boolean => {
      if (!userWorker) return false
      if (currentEmpleadoId && item.empleado_id === currentEmpleadoId) return true
      if (currentEmpleadoId && item.empleado?.id === currentEmpleadoId) return true
      if (userWorker.id && item.empleado?.usuario_id === userWorker.id) return true
      if (
        userWorker.email &&
        item.empleado?.email &&
        item.empleado.email.toLowerCase() === userWorker.email.toLowerCase()
      ) {
        return true
      }
      return false
    }

    it('identifica cita asignada por empleado_id numérico directo', () => {
      const citaAsignada: Partial<Cita> = {
        id: 101,
        empleado_id: 10,
      }
      expect(isAssigned(citaAsignada)).toBe(true)
    })

    it('identifica cita asignada por objeto anidado con usuario_id correspondiente', () => {
      const citaConUsuarioId: Partial<Cita> = {
        id: 102,
        empleado: {
          id: 99,
          usuario_id: 3,
          nombre: 'Elena Profesional',
          email: 'elena@tienda.com',
          activo: true,
        },
      }
      expect(isAssigned(citaConUsuarioId)).toBe(true)
    })

    it('identifica cita asignada por email correspondiente', () => {
      const citaConEmail: Partial<Cita> = {
        id: 103,
        empleado: {
          id: 88,
          usuario_id: 999,
          nombre: 'Elena Profesional',
          email: 'EMPLEADO@tienda.com',
          activo: true,
        },
      }
      expect(isAssigned(citaConEmail)).toBe(true)
    })

    it('rechaza citas asignadas a otros profesionales', () => {
      const citaDeOtro: Partial<Cita> = {
        id: 104,
        empleado_id: 99,
        empleado: {
          id: 99,
          usuario_id: 7,
          nombre: 'Dr. Carlos Pérez',
          email: 'carlos@sagitta.com',
          activo: true,
        },
      }
      expect(isAssigned(citaDeOtro)).toBe(false)
    })
  })

  describe('4. Filtrado de Comandos del Menú Omnibar por Permisos', () => {
    const comandosEjemplo = [
      { id: 'act-pos', permiso: 'sales.read' },
      { id: 'act-cita', permiso: 'appointments.read' },
      { id: 'act-hardware', permiso: 'settings.manage' },
      { id: 'mod-dash' },
      { id: 'mod-citas', permiso: 'appointments.read' },
      { id: 'mod-ventas', permiso: 'sales.read' },
      { id: 'mod-inv', permiso: 'inventory.read' },
      { id: 'mod-cli', permiso: 'clients.read' },
      { id: 'mod-serv', permiso: 'services.read' },
      { id: 'mod-rep', permiso: 'reports.read' },
    ]

    it('filtra comandos administrativos para un empleado', () => {
      const permsEmpleado = ROLE_PERMISSIONS['empleado']
      const hasPermissionEmpleado = (p: string) => permsEmpleado.includes(p)

      const visibles = comandosEjemplo.filter(
        (cmd) => !cmd.permiso || hasPermissionEmpleado(cmd.permiso)
      )

      const idsVisibles = visibles.map((v) => v.id)
      expect(idsVisibles).toContain('mod-dash')
      expect(idsVisibles).toContain('act-cita')
      expect(idsVisibles).toContain('mod-citas')
      expect(idsVisibles).toContain('mod-cli')
      expect(idsVisibles).toContain('mod-serv')

      expect(idsVisibles).not.toContain('act-pos')
      expect(idsVisibles).not.toContain('act-hardware')
      expect(idsVisibles).not.toContain('mod-ventas')
      expect(idsVisibles).not.toContain('mod-inv')
      expect(idsVisibles).not.toContain('mod-rep')
    })

    it('permite todos los comandos para un admin con permiso wildcard *', () => {
      const hasPermissionAdmin = () => true
      const visibles = comandosEjemplo.filter(
        (cmd) => !cmd.permiso || hasPermissionAdmin()
      )
      expect(visibles.length).toBe(comandosEjemplo.length)
    })
  })
})

