import { apiClient } from '@/services/api.client'
import { ApiResponse, Cliente } from '@/types'
import { IClientRepository } from '../interfaces/IClientRepository'

export class ApiClientRepository implements IClientRepository {
  getAll(q?: string): Promise<ApiResponse<Cliente[]>> {
    return apiClient.get<Cliente[]>(`/clientes${q ? `?q=${encodeURIComponent(q)}` : ''}`)
  }

  getById(id: number): Promise<ApiResponse<Cliente>> {
    return apiClient.get<Cliente>(`/clientes/${id}`)
  }

  create(data: Partial<Cliente>): Promise<ApiResponse<Cliente>> {
    return apiClient.post<Cliente>('/clientes', data)
  }

  update(id: number, data: Partial<Cliente>): Promise<ApiResponse<Cliente>> {
    return apiClient.put<Cliente>(`/clientes/${id}`, data)
  }
}
