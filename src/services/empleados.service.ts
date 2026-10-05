import { employeeRepository } from '@/repositories'
import { Empleado } from '@/types'

export const empleadosService = {
  getAll: (params?: Record<string, string>) => employeeRepository.getAll(params),
  getById: (id: number) => employeeRepository.getById(id),
  create: (data: Partial<Empleado>) => employeeRepository.create(data),
  update: (id: number, data: Partial<Empleado>) => employeeRepository.update(id, data),
}
