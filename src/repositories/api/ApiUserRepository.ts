import { apiClient } from '@/services/api.client'
import { ApiResponse, UsuarioGestion, CrearUsuarioPayload } from '@/types'
import { IUserRepository } from '../interfaces/IUserRepository'
import { LocalUserRepository } from '../local/LocalUserRepository'

export class ApiUserRepository implements IUserRepository {
  private local = new LocalUserRepository()

  async getUsuarios(params?: Record<string, string>): Promise<ApiResponse<UsuarioGestion[]>> {
    try {
      const qs = params ? '?' + new URLSearchParams(params).toString() : ''
      const res = await apiClient.get<UsuarioGestion[]>(`/usuarios${qs}`)
      if (res && res.data) return res
    } catch (err) {
      console.warn('[ApiUserRepository] Fallback a repositorio local getUsuarios:', err)
    }
    return this.local.getUsuarios(params)
  }

  async getUsuario(id: number): Promise<ApiResponse<UsuarioGestion>> {
    try {
      const res = await apiClient.get<UsuarioGestion>(`/usuarios/${id}`)
      if (res && res.data) return res
    } catch (err) {
      console.warn('[ApiUserRepository] Fallback a repositorio local getUsuario:', err)
    }
    return this.local.getUsuario(id)
  }

  async crearUsuario(data: CrearUsuarioPayload): Promise<ApiResponse<UsuarioGestion>> {
    try {
      const res = await apiClient.post<UsuarioGestion>('/usuarios', data)
      if (res && res.data) return res
    } catch (err) {
      console.warn('[ApiUserRepository] Fallback a repositorio local crearUsuario:', err)
    }
    return this.local.crearUsuario(data)
  }

  async actualizarUsuario(
    id: number,
    data: Partial<UsuarioGestion>
  ): Promise<ApiResponse<UsuarioGestion>> {
    try {
      const res = await apiClient.put<UsuarioGestion>(`/usuarios/${id}`, data)
      if (res && res.data) return res
    } catch (err) {
      console.warn('[ApiUserRepository] Fallback a repositorio local actualizarUsuario:', err)
    }
    return this.local.actualizarUsuario(id, data)
  }

  async eliminarUsuario(id: number): Promise<ApiResponse<void>> {
    try {
      return await apiClient.delete<void>(`/usuarios/${id}`)
    } catch {
      return this.local.eliminarUsuario(id)
    }
  }

  async toggleActivo(id: number): Promise<ApiResponse<UsuarioGestion>> {
    try {
      const res = await apiClient.post<UsuarioGestion>(`/usuarios/${id}/toggle-activo`, {})
      if (res && res.data) return res
    } catch (err) {
      console.warn('[ApiUserRepository] Fallback a repositorio local toggleActivo:', err)
    }
    return this.local.toggleActivo(id)
  }
}
