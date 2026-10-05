import { Recurso, TipoRecurso, EstadoRecurso, ApiResponse } from '@/types'
import { LocalStorageAdapter } from '@/repositories/local/LocalStorageAdapter'

const SEED_RECURSOS: Recurso[] = [
  {
    id: 1,
    nombre: 'Consultorio Médico 1',
    tipo: 'sala',
    descripcion: 'Consultorio principal para atención clínica general.',
    capacidad: 1,
    estado: 'disponible',
    activo: true,
  },
  {
    id: 2,
    nombre: 'Consultorio Médico 2',
    tipo: 'sala',
    descripcion: 'Consultorio secundario con camilla para exámenes.',
    capacidad: 1,
    estado: 'disponible',
    activo: true,
  },
  {
    id: 3,
    nombre: 'Cabina Estética Spa A',
    tipo: 'cabina',
    descripcion: 'Cabina climatizada para masajes, limpiezas y estética.',
    capacidad: 1,
    estado: 'disponible',
    activo: true,
  },
  {
    id: 4,
    nombre: 'Sillón de Estilismo 1',
    tipo: 'silla',
    descripcion: 'Puesto ergonómico para corte, tinte y peinado.',
    capacidad: 1,
    estado: 'disponible',
    activo: true,
  },
  {
    id: 5,
    nombre: 'Equipo Láser Diodo',
    tipo: 'equipo',
    descripcion: 'Equipo de depilación láser de alta precisión.',
    capacidad: 1,
    estado: 'disponible',
    activo: true,
  },
]

export const recursosService = {
  getAll: async (params?: { tipo?: TipoRecurso; activo?: boolean }): Promise<ApiResponse<Recurso[]>> => {
    let list = LocalStorageAdapter.getCollection<Recurso>('recursos', SEED_RECURSOS)
    if (params?.tipo) {
      list = list.filter((r) => r.tipo === params.tipo)
    }
    if (params?.activo !== undefined) {
      list = list.filter((r) => r.activo === params.activo)
    }
    return { success: true, message: 'OK', data: list }
  },

  getById: async (id: number): Promise<ApiResponse<Recurso>> => {
    const list = LocalStorageAdapter.getCollection<Recurso>('recursos', SEED_RECURSOS)
    const item = list.find((r) => r.id === id)
    if (!item) throw new Error('Recurso no encontrado')
    return { success: true, message: 'OK', data: item }
  },

  create: async (data: Omit<Recurso, 'id'>): Promise<ApiResponse<Recurso>> => {
    const created = LocalStorageAdapter.insert<Recurso>('recursos', {
      ...data,
      capacidad: data.capacidad || 1,
      estado: data.estado || 'disponible',
      activo: data.activo ?? true,
    } as Recurso)
    return { success: true, message: 'Recurso creado exitosamente', data: created }
  },

  update: async (id: number, data: Partial<Recurso>): Promise<ApiResponse<Recurso>> => {
    const updated = LocalStorageAdapter.update<Recurso>('recursos', id, data)
    if (!updated) throw new Error('Recurso no encontrado')
    return { success: true, message: 'Recurso actualizado', data: updated }
  },

  cambiarEstado: async (id: number, nuevoEstado: EstadoRecurso): Promise<ApiResponse<Recurso>> => {
    const updated = LocalStorageAdapter.update<Recurso>('recursos', id, { estado: nuevoEstado })
    if (!updated) throw new Error('Recurso no encontrado')
    return { success: true, message: `Estado cambiado a ${nuevoEstado}`, data: updated }
  },

  delete: async (id: number): Promise<ApiResponse<void>> => {
    LocalStorageAdapter.remove('recursos', id)
    return { success: true, message: 'Recurso eliminado' }
  },
}
