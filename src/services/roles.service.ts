import { apiClient } from '@/services/api.client'
import { Permiso, Rol, ApiResponse } from '@/types'
import { LocalStorageAdapter } from '@/repositories/local/LocalStorageAdapter'
import { MOCK_ROLES, MOCK_PERMISOS } from '@/mocks/handlers/roles.handlers'

const COLLECTION_ROLES = 'roles'
const COLLECTION_PERMISOS = 'permisos'

function getStoredRoles(): Rol[] {
  return LocalStorageAdapter.getCollection<Rol>(COLLECTION_ROLES, MOCK_ROLES)
}

export const rolesService = {
  getRoles: async (): Promise<ApiResponse<Rol[]>> => {
    try {
      const res = await apiClient.get<Rol[]>('/roles')
      if (res && res.data) return res
    } catch (err) {
      console.warn('[rolesService] Fallback local para roles:', err)
    }
    return { success: true, message: 'OK', data: getStoredRoles() }
  },

  getRol: async (id: number): Promise<ApiResponse<Rol>> => {
    try {
      const res = await apiClient.get<Rol>(`/roles/${id}`)
      if (res && res.data) return res
    } catch (err) {
      console.warn('[rolesService] Fallback local para rol:', err)
    }
    const roles = getStoredRoles()
    const rol = roles.find((r) => r.id === id) || roles[0]
    return { success: true, message: 'OK', data: rol }
  },

  createRol: async (data: Pick<Rol, 'nombre' | 'descripcion' | 'permisos'>): Promise<ApiResponse<Rol>> => {
    try {
      const res = await apiClient.post<Rol>('/roles', data)
      if (res && res.data) return res
    } catch (err) {
      console.warn('[rolesService] Fallback local para createRol:', err)
    }
    const roles = getStoredRoles()
    const nuevo: Rol = {
      id: Date.now(),
      nombre: data.nombre,
      descripcion: data.descripcion,
      permisos: data.permisos,
      activo: true,
      usuarios_count: 0,
      created_at: new Date().toISOString(),
      es_sistema: false,
    }
    roles.push(nuevo)
    LocalStorageAdapter.setCollection(COLLECTION_ROLES, roles)
    return { success: true, message: 'Rol creado', data: nuevo }
  },

  updateRol: async (id: number, data: Partial<Pick<Rol, 'nombre' | 'descripcion' | 'permisos' | 'activo'>>): Promise<ApiResponse<Rol>> => {
    try {
      const res = await apiClient.put<Rol>(`/roles/${id}`, data)
      if (res && res.data) return res
    } catch (err) {
      console.warn('[rolesService] Fallback local para updateRol:', err)
    }
    const roles = getStoredRoles()
    const idx = roles.findIndex((r) => r.id === id)
    if (idx !== -1) {
      roles[idx] = { ...roles[idx], ...data }
      LocalStorageAdapter.setCollection(COLLECTION_ROLES, roles)
      return { success: true, message: 'Rol actualizado', data: roles[idx] }
    }
    throw new Error('Rol no encontrado')
  },

  deleteRol: async (id: number): Promise<ApiResponse<void>> => {
    try {
      return await apiClient.delete<void>(`/roles/${id}`)
    } catch {
      const roles = getStoredRoles().filter((r) => r.id !== id)
      LocalStorageAdapter.setCollection(COLLECTION_ROLES, roles)
      return { success: true, message: 'Rol eliminado' }
    }
  },

  getPermisos: async (): Promise<ApiResponse<Permiso[]>> => {
    try {
      const res = await apiClient.get<Permiso[]>('/permisos')
      if (res && res.data) return res
    } catch (err) {
      console.warn('[rolesService] Fallback local para permisos:', err)
    }
    const permisos = LocalStorageAdapter.getCollection<Permiso>(COLLECTION_PERMISOS, MOCK_PERMISOS)
    return { success: true, message: 'OK', data: permisos }
  },
}
