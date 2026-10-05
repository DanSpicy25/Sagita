import { apiClient } from '@/services/api.client'
import { ApiResponse, Servicio, CategoriaServicio } from '@/types'
import { IServiceRepository } from '../interfaces/IServiceRepository'

export class ApiServiceRepository implements IServiceRepository {
  getAll(params?: Record<string, string>): Promise<ApiResponse<Servicio[]>> {
    const qs = params ? '?' + new URLSearchParams(params).toString() : ''
    return apiClient.get<Servicio[]>(`/servicios${qs}`)
  }

  getById(id: number): Promise<ApiResponse<Servicio>> {
    return apiClient.get<Servicio>(`/servicios/${id}`)
  }

  create(data: Partial<Servicio>): Promise<ApiResponse<Servicio>> {
    return apiClient.post<Servicio>('/servicios', data)
  }

  update(id: number, data: Partial<Servicio>): Promise<ApiResponse<Servicio>> {
    return apiClient.put<Servicio>(`/servicios/${id}`, data)
  }

  delete(id: number): Promise<ApiResponse<void>> {
    return apiClient.delete<void>(`/servicios/${id}`)
  }

  getCategorias(): Promise<ApiResponse<CategoriaServicio[]>> {
    return apiClient.get<CategoriaServicio[]>('/categorias-servicio')
  }
}
