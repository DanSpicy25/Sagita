import { ApiResponse, Cliente } from '@/types'

export interface IClientRepository {
  getAll(q?: string): Promise<ApiResponse<Cliente[]>>
  getById(id: number): Promise<ApiResponse<Cliente>>
  create(data: Partial<Cliente>): Promise<ApiResponse<Cliente>>
  update(id: number, data: Partial<Cliente>): Promise<ApiResponse<Cliente>>
  delete(id: number): Promise<ApiResponse<void>>
}
