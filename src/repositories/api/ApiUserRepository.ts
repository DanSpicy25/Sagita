import { apiClient } from '@/services/api.client'
import { ApiResponse, UsuarioGestion, CrearUsuarioPayload } from '@/types'
import { IUserRepository } from '../interfaces/IUserRepository'

export class ApiUserRepository implements IUserRepository {
  getUsuarios(params?: Record<string, string>): Promise<ApiResponse<UsuarioGestion[]>> {
    const qs = params ? '?' + new URLSearchParams(params).toString() : ''
    return apiClient.get<UsuarioGestion[]>(`/usuarios${qs}`)
  }

  getUsuario(id: number): Promise<ApiResponse<UsuarioGestion>> {
    return apiClient.get<UsuarioGestion>(`/usuarios/${id}`)
  }

  crearUsuario(data: CrearUsuarioPayload): Promise<ApiResponse<UsuarioGestion>> {
    return apiClient.post<UsuarioGestion>('/usuarios', data)
  }

  actualizarUsuario(
    id: number,
    data: Partial<UsuarioGestion>
  ): Promise<ApiResponse<UsuarioGestion>> {
    return apiClient.put<UsuarioGestion>(`/usuarios/${id}`, data)
  }

  eliminarUsuario(id: number): Promise<ApiResponse<void>> {
    return apiClient.delete<void>(`/usuarios/${id}`)
  }

  toggleActivo(id: number): Promise<ApiResponse<UsuarioGestion>> {
    return apiClient.post<UsuarioGestion>(`/usuarios/${id}/toggle-activo`, {})
  }
}
