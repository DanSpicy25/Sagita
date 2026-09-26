import { serviceRepository } from '@/repositories'
import { Servicio } from '@/types'

export const serviciosService = {
  getAll: (params?: Record<string, string>) => serviceRepository.getAll(params),
  getById: (id: number) => serviceRepository.getById(id),
  create: (data: Partial<Servicio>) => serviceRepository.create(data),
  update: (id: number, data: Partial<Servicio>) => serviceRepository.update(id, data),
  delete: (id: number) => serviceRepository.delete(id),
  getCategorias: () => serviceRepository.getCategorias(),
}
