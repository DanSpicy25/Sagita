import { ApiResponse, UsuarioGestion, CrearUsuarioPayload } from '@/types'

export interface IUserRepository {
  getUsuarios(params?: Record<string, string>): Promise<ApiResponse<UsuarioGestion[]>>
  getUsuario(id: number): Promise<ApiResponse<UsuarioGestion>>
  crearUsuario(data: CrearUsuarioPayload): Promise<ApiResponse<UsuarioGestion>>
  actualizarUsuario(id: number, data: Partial<UsuarioGestion>): Promise<ApiResponse<UsuarioGestion>>
  eliminarUsuario(id: number): Promise<ApiResponse<void>>
  toggleActivo(id: number): Promise<ApiResponse<UsuarioGestion>>
}
