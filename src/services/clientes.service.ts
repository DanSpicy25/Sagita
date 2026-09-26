import { clientRepository } from '@/repositories'
import { Cliente } from '@/types'

export const clientesService = {
  getAll: (q?: string) => clientRepository.getAll(q),
  getById: (id: number) => clientRepository.getById(id),
  create: (data: Partial<Cliente>) => clientRepository.create(data),
  update: (id: number, data: Partial<Cliente>) => clientRepository.update(id, data),
}
