import { ApiResponse, Servicio, CategoriaServicio } from '@/types'
import { IServiceRepository } from '../interfaces/IServiceRepository'
import { LocalStorageAdapter } from './LocalStorageAdapter'

const SEED_SERVICIOS: Servicio[] = [
  {
    id: 1,
    nombre: 'Consulta General',
    categoria_id: 1,
    descripcion: 'Consulta de rutina con evaluación completa.',
    duracion_base_min: 30,
    precio_base: 50,
    color: '#6366f1',
    activo: true,
    buffer_antes_min: 5,
    buffer_despues_min: 10,
  },
  {
    id: 2,
    nombre: 'Limpieza Facial',
    categoria_id: 2,
    descripcion: 'Tratamiento de limpieza profunda e hidratación.',
    duracion_base_min: 60,
    precio_base: 75,
    color: '#ec4899',
    activo: true,
    buffer_antes_min: 10,
    buffer_despues_min: 15,
  },
  {
    id: 3,
    nombre: 'Masaje Relajante',
    categoria_id: 3,
    descripcion: 'Masaje terapéutico para aliviar tensiones musculares.',
    duracion_base_min: 45,
    precio_base: 60,
    color: '#10b981',
    activo: true,
    buffer_antes_min: 5,
    buffer_despues_min: 10,
  },
  {
    id: 4,
    nombre: 'Corte de Cabello',
    categoria_id: 2,
    descripcion: 'Corte personalizado según el estilo del cliente.',
    duracion_base_min: 30,
    precio_base: 35,
    color: '#f59e0b',
    activo: true,
    buffer_antes_min: 0,
    buffer_despues_min: 5,
  },
]

export class LocalServiceRepository implements IServiceRepository {
  private collection = 'servicios'

  async getAll(params?: Record<string, string>): Promise<ApiResponse<Servicio[]>> {
    let list = LocalStorageAdapter.getCollection<Servicio>(this.collection, SEED_SERVICIOS)
    if (params?.categoria_id) {
      list = list.filter((s) => String(s.categoria_id) === params.categoria_id)
    }
    if (params?.activo !== undefined) {
      const isActivo = params.activo === 'true'
      list = list.filter((s) => s.activo === isActivo)
    }
    return { success: true, message: 'OK', data: list }
  }

  async getById(id: number): Promise<ApiResponse<Servicio>> {
    const list = LocalStorageAdapter.getCollection<Servicio>(this.collection, SEED_SERVICIOS)
    const item = list.find((s) => s.id === id)
    if (!item) throw new Error('Servicio no encontrado')
    return { success: true, message: 'OK', data: item }
  }

  async create(data: Partial<Servicio>): Promise<ApiResponse<Servicio>> {
    const created = LocalStorageAdapter.insert<Servicio>(this.collection, {
      ...data,
      activo: data.activo ?? true,
      buffer_antes_min: data.buffer_antes_min ?? 0,
      buffer_despues_min: data.buffer_despues_min ?? 0,
    } as Servicio)
    return { success: true, message: 'Servicio creado', data: created }
  }

  async update(id: number, data: Partial<Servicio>): Promise<ApiResponse<Servicio>> {
    const updated = LocalStorageAdapter.update<Servicio>(this.collection, id, data)
    if (!updated) throw new Error('Servicio no encontrado')
    return { success: true, message: 'Servicio actualizado', data: updated }
  }

  async delete(id: number): Promise<ApiResponse<void>> {
    LocalStorageAdapter.remove<Servicio>(this.collection, id)
    return { success: true, message: 'Servicio eliminado' }
  }

  async getCategorias(): Promise<ApiResponse<CategoriaServicio[]>> {
    const cats: CategoriaServicio[] = [
      { id: 1, nombre: 'Consultas', color: '#6366f1', icono: 'stethoscope' },
      { id: 2, nombre: 'Estética', color: '#ec4899', icono: 'sparkles' },
      { id: 3, nombre: 'Bienestar', color: '#10b981', icono: 'heart' },
    ]
    return { success: true, message: 'OK', data: cats }
  }
}
