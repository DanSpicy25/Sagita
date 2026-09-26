import { ApiResponse, Cliente } from '@/types'
import { IClientRepository } from '../interfaces/IClientRepository'
import { LocalStorageAdapter } from './LocalStorageAdapter'

const SEED_CLIENTES: Cliente[] = [
  {
    id: 1,
    nombre: 'Ana García',
    email: 'ana@email.com',
    telefono: '+1 555-0101',
    total_citas: 8,
    created_at: '2026-01-10T00:00:00Z',
  },
  {
    id: 2,
    nombre: 'Luis Fernández',
    email: 'luis@email.com',
    telefono: '+1 555-0102',
    total_citas: 3,
    created_at: '2026-02-15T00:00:00Z',
  },
  {
    id: 3,
    nombre: 'Sofía Torres',
    email: 'sofia@email.com',
    telefono: '+1 555-0103',
    total_citas: 12,
    created_at: '2025-11-20T00:00:00Z',
  },
  {
    id: 4,
    nombre: 'Miguel Ángel Ruiz',
    email: 'miguel@email.com',
    telefono: '+1 555-0104',
    total_citas: 1,
    created_at: '2026-09-01T00:00:00Z',
  },
]

export class LocalClientRepository implements IClientRepository {
  private collection = 'clientes'

  async getAll(q?: string): Promise<ApiResponse<Cliente[]>> {
    let list = LocalStorageAdapter.getCollection<Cliente>(this.collection, SEED_CLIENTES)
    if (q) {
      const term = q.toLowerCase()
      list = list.filter(
        (c) =>
          c.nombre.toLowerCase().includes(term) ||
          c.email.toLowerCase().includes(term) ||
          (c.telefono && c.telefono.includes(term))
      )
    }
    return { success: true, message: 'OK', data: list }
  }

  async getById(id: number): Promise<ApiResponse<Cliente>> {
    const list = LocalStorageAdapter.getCollection<Cliente>(this.collection, SEED_CLIENTES)
    const cliente = list.find((c) => c.id === id)
    if (!cliente) throw new Error('Cliente no encontrado')
    return { success: true, message: 'OK', data: cliente }
  }

  async create(data: Partial<Cliente>): Promise<ApiResponse<Cliente>> {
    const created = LocalStorageAdapter.insert<Cliente>(this.collection, {
      ...data,
      total_citas: 0,
      created_at: new Date().toISOString(),
    } as Cliente)
    return { success: true, message: 'Cliente registrado', data: created }
  }

  async update(id: number, data: Partial<Cliente>): Promise<ApiResponse<Cliente>> {
    const updated = LocalStorageAdapter.update<Cliente>(this.collection, id, data)
    if (!updated) throw new Error('Cliente no encontrado')
    return { success: true, message: 'Cliente actualizado', data: updated }
  }
}
