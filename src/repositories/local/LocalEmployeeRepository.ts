import { ApiResponse, Empleado } from '@/types'
import { IEmployeeRepository } from '../interfaces/IEmployeeRepository'
import { LocalStorageAdapter } from './LocalStorageAdapter'

const SEED_EMPLEADOS: Empleado[] = [
  {
    id: 1,
    usuario_id: 2,
    nombre: 'Dr. Carlos Pérez',
    email: 'carlos@sagitta.com',
    bio: 'Especialista con 10 años de experiencia.',
    especialidad: 'Medicina General',
    activo: true,
  },
  {
    id: 2,
    usuario_id: 3,
    nombre: 'Dra. Laura Gómez',
    email: 'laura@sagitta.com',
    bio: 'Dermatóloga y especialista en estética.',
    especialidad: 'Dermatología',
    activo: true,
  },
  {
    id: 3,
    usuario_id: 4,
    nombre: 'Miguel Ángel Soto',
    email: 'miguel@sagitta.com',
    bio: 'Fisioterapeuta certificado.',
    especialidad: 'Fisioterapia',
    activo: true,
  },
]

export class LocalEmployeeRepository implements IEmployeeRepository {
  private collection = 'empleados'

  async getAll(params?: Record<string, string>): Promise<ApiResponse<Empleado[]>> {
    let list = LocalStorageAdapter.getCollection<Empleado>(this.collection, SEED_EMPLEADOS)
    if (params?.activo !== undefined) {
      const isActivo = params.activo === 'true'
      list = list.filter((e) => e.activo === isActivo)
    }
    return { success: true, message: 'OK', data: list }
  }

  async getById(id: number): Promise<ApiResponse<Empleado>> {
    const list = LocalStorageAdapter.getCollection<Empleado>(this.collection, SEED_EMPLEADOS)
    const emp = list.find((e) => e.id === id)
    if (!emp) throw new Error('Empleado no encontrado')
    return { success: true, message: 'OK', data: emp }
  }

  async create(data: Partial<Empleado>): Promise<ApiResponse<Empleado>> {
    const created = LocalStorageAdapter.insert<Empleado>(this.collection, {
      ...data,
      activo: data.activo ?? true,
    } as Empleado)
    return { success: true, message: 'Empleado creado', data: created }
  }

  async update(id: number, data: Partial<Empleado>): Promise<ApiResponse<Empleado>> {
    const updated = LocalStorageAdapter.update<Empleado>(this.collection, id, data)
    if (!updated) throw new Error('Empleado no encontrado')
    return { success: true, message: 'Empleado actualizado', data: updated }
  }
}
