import { serviceRepository } from '@/repositories'
import { Servicio, CategoriaServicio } from '@/types'
import { LocalStorageAdapter } from '@/repositories/local/LocalStorageAdapter'

export const serviciosService = {
  getAll: (params?: Record<string, string>) => serviceRepository.getAll(params),
  getById: (id: number) => serviceRepository.getById(id),
  create: (data: Partial<Servicio>) => serviceRepository.create(data),
  update: (id: number, data: Partial<Servicio>) => serviceRepository.update(id, data),
  delete: (id: number) => serviceRepository.delete(id),
  getCategorias: () => serviceRepository.getCategorias(),
  createCategoria: async (data: Partial<CategoriaServicio>) => {
    if (serviceRepository.createCategoria) {
      return serviceRepository.createCategoria(data)
    }
    const created = LocalStorageAdapter.insert<CategoriaServicio>('categorias_servicios', {
      ...data,
      id: Date.now(),
      color: data.color || '#6366f1',
    } as CategoriaServicio)
    return { success: true, message: 'Categoría creada', data: created }
  },
  updateCategoria: async (id: number, data: Partial<CategoriaServicio>) => {
    if (serviceRepository.updateCategoria) {
      return serviceRepository.updateCategoria(id, data)
    }
    const updated = LocalStorageAdapter.update<CategoriaServicio>('categorias_servicios', id, data)
    return { success: true, message: 'Categoría actualizada', data: updated || (data as CategoriaServicio) }
  },
  deleteCategoria: async (id: number) => {
    if (serviceRepository.deleteCategoria) {
      return serviceRepository.deleteCategoria(id)
    }
    LocalStorageAdapter.remove<CategoriaServicio>('categorias_servicios', id)
    return { success: true, message: 'Categoría eliminada' }
  },
}
