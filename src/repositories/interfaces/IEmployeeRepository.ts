import { ApiResponse, Empleado } from '@/types'

export interface IEmployeeRepository {
  getAll(params?: Record<string, string>): Promise<ApiResponse<Empleado[]>>
  getById(id: number): Promise<ApiResponse<Empleado>>
  create(data: Partial<Empleado>): Promise<ApiResponse<Empleado>>
  update(id: number, data: Partial<Empleado>): Promise<ApiResponse<Empleado>>
}
