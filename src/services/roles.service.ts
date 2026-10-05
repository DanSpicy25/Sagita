import { apiClient } from '@/services/api.client'
import { Permiso, Rol } from '@/types'

export const rolesService = {
  getRoles: () => apiClient.get<Rol[]>('/roles'),

  getRol: (id: number) => apiClient.get<Rol>(`/roles/${id}`),

  createRol: (data: Pick<Rol, 'nombre' | 'descripcion' | 'permisos'>) =>
    apiClient.post<Rol>('/roles', data),

  updateRol: (id: number, data: Partial<Pick<Rol, 'nombre' | 'descripcion' | 'permisos' | 'activo'>>) =>
    apiClient.put<Rol>(`/roles/${id}`, data),

  deleteRol: (id: number) => apiClient.delete<void>(`/roles/${id}`),

  getPermisos: () => apiClient.get<Permiso[]>('/permisos'),
}
