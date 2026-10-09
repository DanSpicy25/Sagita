import { apiClient } from '@/services/api.client'
import { ApiResponse, Empleado } from '@/types'
import { IEmployeeRepository } from '../interfaces/IEmployeeRepository'
import { LocalEmployeeRepository } from '../local/LocalEmployeeRepository'

export class ApiEmployeeRepository implements IEmployeeRepository {
  private local = new LocalEmployeeRepository()

  async getAll(params?: Record<string, string>): Promise<ApiResponse<Empleado[]>> {
    try {
      const qs = params ? '?' + new URLSearchParams(params).toString() : ''
      const res = await apiClient.get<Empleado[]>(`/empleados${qs}`)
      if (res && res.data) return res
    } catch (err) {
      console.warn('[ApiEmployeeRepository] Fallback a repositorio local:', err)
    }
    return this.local.getAll(params)
  }

  async getById(id: number): Promise<ApiResponse<Empleado>> {
    try {
      const res = await apiClient.get<Empleado>(`/empleados/${id}`)
      if (res && res.data) return res
    } catch (err) {
      console.warn('[ApiEmployeeRepository] Fallback a repositorio local getById:', err)
    }
    return this.local.getById(id)
  }

  async create(data: Partial<Empleado>): Promise<ApiResponse<Empleado>> {
    try {
      const res = await apiClient.post<Empleado>('/empleados', data)
      if (res && res.data) return res
    } catch (err) {
      console.warn('[ApiEmployeeRepository] Fallback a repositorio local create:', err)
    }
    return this.local.create(data)
  }

  async update(id: number, data: Partial<Empleado>): Promise<ApiResponse<Empleado>> {
    try {
      const res = await apiClient.put<Empleado>(`/empleados/${id}`, data)
      if (res && res.data) return res
    } catch (err) {
      console.warn('[ApiEmployeeRepository] Fallback a repositorio local update:', err)
    }
    return this.local.update(id, data)
  }
}
