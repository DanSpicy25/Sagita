import { ApiResponse, UsuarioGestion, CrearUsuarioPayload } from '@/types'
import { IUserRepository } from '../interfaces/IUserRepository'
import { LocalStorageAdapter } from './LocalStorageAdapter'
import { USUARIOS_INICIALES } from '@/services/usuarios.service'

export class LocalUserRepository implements IUserRepository {
  private collection = 'usuarios'

  async getUsuarios(params?: Record<string, string>): Promise<ApiResponse<UsuarioGestion[]>> {
    let list = LocalStorageAdapter.getCollection<UsuarioGestion>(this.collection, USUARIOS_INICIALES)
    if (params?.rol) {
      list = list.filter((u) => u.rol === params.rol)
    }
    if (params?.q) {
      const q = params.q.toLowerCase()
      list = list.filter(
        (u) => u.nombre.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)
      )
    }
    return { success: true, message: 'OK', data: list }
  }

  async getUsuario(id: number): Promise<ApiResponse<UsuarioGestion>> {
    const list = LocalStorageAdapter.getCollection<UsuarioGestion>(this.collection, USUARIOS_INICIALES)
    const user = list.find((u) => u.id === id)
    if (!user) throw new Error('Usuario no encontrado')
    return { success: true, message: 'OK', data: user }
  }

  async crearUsuario(data: CrearUsuarioPayload): Promise<ApiResponse<UsuarioGestion>> {
    const nuevo: UsuarioGestion = {
      id: Date.now(),
      nombre: data.nombre,
      email: data.email,
      rol: data.rol,
      telefono: data.telefono,
      sucursal_id: data.sucursal_id,
      sucursal_nombre: data.sucursal_id ? 'Sede Asignada' : undefined,
      activo: true,
      timezone: 'America/New_York',
      created_at: new Date().toISOString(),
    }
    const created = LocalStorageAdapter.insert<UsuarioGestion>(this.collection, nuevo)
    return { success: true, message: 'Usuario creado', data: created }
  }

  async actualizarUsuario(
    id: number,
    data: Partial<UsuarioGestion>
  ): Promise<ApiResponse<UsuarioGestion>> {
    const updated = LocalStorageAdapter.update<UsuarioGestion>(this.collection, id, data)
    if (!updated) throw new Error('Usuario no encontrado')
    return { success: true, message: 'Usuario actualizado', data: updated }
  }

  async eliminarUsuario(id: number): Promise<ApiResponse<void>> {
    LocalStorageAdapter.remove<UsuarioGestion>(this.collection, id)
    return { success: true, message: 'Usuario eliminado' }
  }

  async toggleActivo(id: number): Promise<ApiResponse<UsuarioGestion>> {
    const list = LocalStorageAdapter.getCollection<UsuarioGestion>(this.collection, USUARIOS_INICIALES)
    const user = list.find((u) => u.id === id)
    if (!user) throw new Error('Usuario no encontrado')
    const updated = LocalStorageAdapter.update<UsuarioGestion>(this.collection, id, {
      activo: !user.activo,
    })
    return { success: true, message: 'Estado actualizado', data: updated! }
  }
}
