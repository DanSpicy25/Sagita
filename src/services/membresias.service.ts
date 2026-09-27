import { PlanMembresia, ClienteMembresia, ApiResponse } from '@/types'
import { LocalStorageAdapter } from '@/repositories/local/LocalStorageAdapter'

const COLLECTION_PLANES = 'planes_membresia'
const COLLECTION_CLIENTES_MEMBRESIAS = 'clientes_membresias'

export const SEED_PLANES: PlanMembresia[] = [
  {
    id: 1,
    nombre: 'Membresía VIP Platinum',
    descripcion: 'Acceso preferente, 2 sesiones de spa al mes y 15% de descuento en todos los productos cosméticos.',
    precio_recurrente: 89,
    frecuencia: 'mensual',
    descuento_servicios_porcentaje: 20,
    descuento_productos_porcentaje: 15,
    servicios_incluidos: [{ servicio_id: 2, sesiones_por_periodo: 2 }],
    beneficios: ['Reserva prioritaria 24/7', 'Bebida de bienvenida premium', '15% de descuento en compras'],
    activo: true,
  },
  {
    id: 2,
    nombre: 'Plan Cuidado Esencial',
    descripcion: '1 servicio mensual a elección y 10% de descuento en tratamientos complementarios.',
    precio_recurrente: 49,
    frecuencia: 'mensual',
    descuento_servicios_porcentaje: 10,
    descuento_productos_porcentaje: 5,
    servicios_incluidos: [{ servicio_id: 1, sesiones_por_periodo: 1 }],
    beneficios: ['Sin penalización por cancelación previa', '10% de descuento en servicios'],
    activo: true,
  },
]

export const SEED_CLIENTES_MEMBRESIAS: ClienteMembresia[] = [
  {
    id: 1,
    cliente_id: 1,
    plan_id: 1,
    plan: SEED_PLANES[0],
    estado: 'activa',
    fecha_inicio: '2026-08-01T00:00:00Z',
    fecha_proxima_renovacion: '2026-10-01T00:00:00Z',
  },
]

export const membresiasService = {
  getAll: async (params?: { activo?: boolean }): Promise<ApiResponse<PlanMembresia[]>> => {
    let list = LocalStorageAdapter.getCollection<PlanMembresia>(COLLECTION_PLANES, SEED_PLANES)
    if (params?.activo !== undefined) {
      list = list.filter((p) => p.activo === params.activo)
    }
    return { success: true, message: 'OK', data: list }
  },

  getById: async (id: number): Promise<ApiResponse<PlanMembresia>> => {
    const list = LocalStorageAdapter.getCollection<PlanMembresia>(COLLECTION_PLANES, SEED_PLANES)
    const found = list.find((p) => p.id === id)
    if (!found) throw new Error('Plan de membresía no encontrado')
    return { success: true, message: 'OK', data: found }
  },

  create: async (data: Partial<PlanMembresia>): Promise<ApiResponse<PlanMembresia>> => {
    const nuevo: PlanMembresia = {
      id: Date.now(),
      nombre: data.nombre || 'Nuevo Plan',
      descripcion: data.descripcion || '',
      precio_recurrente: Number(data.precio_recurrente) || 50,
      frecuencia: data.frecuencia || 'mensual',
      descuento_servicios_porcentaje: Number(data.descuento_servicios_porcentaje) || 10,
      descuento_productos_porcentaje: Number(data.descuento_productos_porcentaje) || 5,
      servicios_incluidos: data.servicios_incluidos || [],
      beneficios: data.beneficios || [],
      activo: data.activo !== undefined ? data.activo : true,
    }
    const created = LocalStorageAdapter.insert<PlanMembresia>(COLLECTION_PLANES, nuevo)
    return { success: true, message: 'Plan de membresía creado', data: created }
  },

  update: async (id: number, data: Partial<PlanMembresia>): Promise<ApiResponse<PlanMembresia>> => {
    const updated = LocalStorageAdapter.update<PlanMembresia>(COLLECTION_PLANES, id, data)
    if (!updated) throw new Error('Plan de membresía no encontrado')
    return { success: true, message: 'Plan de membresía actualizado', data: updated }
  },

  delete: async (id: number): Promise<ApiResponse<void>> => {
    LocalStorageAdapter.remove<PlanMembresia>(COLLECTION_PLANES, id)
    return { success: true, message: 'Plan de membresía eliminado' }
  },

  getClientesMembresias: async (clienteId?: number): Promise<ApiResponse<ClienteMembresia[]>> => {
    let list = LocalStorageAdapter.getCollection<ClienteMembresia>(
      COLLECTION_CLIENTES_MEMBRESIAS,
      SEED_CLIENTES_MEMBRESIAS
    )
    if (clienteId !== undefined) {
      list = list.filter((cm) => cm.cliente_id === clienteId)
    }
    return { success: true, message: 'OK', data: list }
  },

  asignarACliente: async (
    clienteId: number,
    planId: number,
    notas?: string
  ): Promise<ApiResponse<ClienteMembresia>> => {
    void notas
    const planes = LocalStorageAdapter.getCollection<PlanMembresia>(COLLECTION_PLANES, SEED_PLANES)
    const plan = planes.find((p) => p.id === planId)
    if (!plan) throw new Error('Plan de membresía no encontrado')

    const now = new Date()
    const renDate = new Date()
    if (plan.frecuencia === 'mensual') renDate.setMonth(renDate.getMonth() + 1)
    else if (plan.frecuencia === 'trimestral') renDate.setMonth(renDate.getMonth() + 3)
    else renDate.setFullYear(renDate.getFullYear() + 1)

    const nueva: ClienteMembresia = {
      id: Date.now(),
      cliente_id: clienteId,
      plan_id: planId,
      plan,
      estado: 'activa',
      fecha_inicio: now.toISOString(),
      fecha_proxima_renovacion: renDate.toISOString(),
    }

    const created = LocalStorageAdapter.insert<ClienteMembresia>(COLLECTION_CLIENTES_MEMBRESIAS, nueva)
    return { success: true, message: 'Membresía asignada al cliente con éxito', data: created }
  },

  cambiarEstado: async (
    clienteMembresiaId: number,
    estado: 'activa' | 'pausada' | 'cancelada'
  ): Promise<ApiResponse<ClienteMembresia>> => {
    const updated = LocalStorageAdapter.update<ClienteMembresia>(
      COLLECTION_CLIENTES_MEMBRESIAS,
      clienteMembresiaId,
      { estado }
    )
    if (!updated) throw new Error('Membresía no encontrada')
    return { success: true, message: `Membresía ${estado}`, data: updated }
  },
}

