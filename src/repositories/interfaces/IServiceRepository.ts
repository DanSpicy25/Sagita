import { ApiResponse, Servicio, CategoriaServicio } from '@/types'

export interface IServiceRepository {
  getAll(params?: Record<string, string>): Promise<ApiResponse<Servicio[]>>
  getById(id: number): Promise<ApiResponse<Servicio>>
  create(data: Partial<Servicio>): Promise<ApiResponse<Servicio>>
  update(id: number, data: Partial<Servicio>): Promise<ApiResponse<Servicio>>
  delete(id: number): Promise<ApiResponse<void>>
  getCategorias(): Promise<ApiResponse<CategoriaServicio[]>>
  createCategoria?(data: Partial<CategoriaServicio>): Promise<ApiResponse<CategoriaServicio>>
  updateCategoria?(id: number, data: Partial<CategoriaServicio>): Promise<ApiResponse<CategoriaServicio>>
  deleteCategoria?(id: number): Promise<ApiResponse<void>>
}
