import { apiClient } from '@/services/api.client'
import { ApiResponse, Empleado } from '@/types'
import { IEmployeeRepository } from '../interfaces/IEmployeeRepository'

export class ApiEmployeeRepository implements IEmployeeRepository {
  getAll(params?: Record<string, string>): Promise<ApiResponse<Empleado[]>> {
    const qs = params ? '?' + new URLSearchParams(params).toString() : ''
    return apiClient.get<Empleado[]>(`/empleados${qs}`)
  }

  getById(id: number): Promise<ApiResponse<Empleado>> {
    return apiClient.get<Empleado>(`/empleados/${id}`)
  }

  create(data: Partial<Empleado>): Promise<ApiResponse<Empleado>> {
    return apiClient.post<Empleado>('/empleados', data)
  }

  update(id: number, data: Partial<Empleado>): Promise<ApiResponse<Empleado>> {
    return apiClient.put<Empleado>(`/empleados/${id}`, data)
  }
}
