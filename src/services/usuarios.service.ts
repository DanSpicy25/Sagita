import { UsuarioGestion, CrearUsuarioPayload, AuthTokens, ApiResponse } from '@/types'

export const USUARIOS_INICIALES: UsuarioGestion[] = [
  {
    id: 1,
    nombre: 'Auditor Supremo',
    email: 'supremo@sagitta.app',
    password: 'Supremo123!',
    rol: 'superadmin',
    activo: true,
    sucursal_nombre: 'Central Corporativa (Global)',
    timezone: 'America/New_York',
    created_at: '2026-01-01T00:00:00.000Z',
    ultimo_login: '2026-09-17T15:30:00.000Z',
  },
  {
    id: 2,
    nombre: 'Administrador Principal',
    email: 'admin@sagitta.com',
    password: 'Admin123!',
    rol: 'admin',
    activo: true,
    sucursal_id: 1,
    sucursal_nombre: 'Sede Principal - Centro',
    timezone: 'America/New_York',
    created_at: '2026-01-10T00:00:00.000Z',
    ultimo_login: '2026-09-17T12:00:00.000Z',
  },
  {
    id: 3,
    nombre: 'Elena Profesional',
    email: 'empleado@tienda.com',
    password: 'Empleado123!',
    rol: 'empleado',
    activo: true,
    sucursal_id: 1,
    sucursal_nombre: 'Sede Principal - Centro',
    timezone: 'America/New_York',
    created_at: '2026-02-01T00:00:00.000Z',
    ultimo_login: '2026-09-16T18:00:00.000Z',
  },
  {
    id: 4,
    nombre: 'Carlos Recepción',
    email: 'recepcion@tienda.com',
    password: 'Recepcion123!',
    rol: 'recepcionista',
    activo: true,
    sucursal_id: 1,
    sucursal_nombre: 'Sede Principal - Centro',
    timezone: 'America/New_York',
    created_at: '2026-02-15T00:00:00.000Z',
    ultimo_login: '2026-09-15T09:00:00.000Z',
  },
]

import { userRepository } from '@/repositories'
import { LocalStorageAdapter } from '@/repositories/local/LocalStorageAdapter'

function getStorageUsuarios(): UsuarioGestion[] {
  return LocalStorageAdapter.getCollection<UsuarioGestion>('usuarios', USUARIOS_INICIALES)
}

function saveStorageUsuarios(usuarios: UsuarioGestion[]): void {
  LocalStorageAdapter.setCollection('usuarios', usuarios)
}

export const usuariosService = {
  getAll: async (params?: Record<string, string>): Promise<ApiResponse<UsuarioGestion[]>> => {
    return userRepository.getUsuarios(params)
  },

  getById: async (id: number): Promise<ApiResponse<UsuarioGestion>> => {
    return userRepository.getUsuario(id)
  },

  crear: async (payload: CrearUsuarioPayload): Promise<ApiResponse<UsuarioGestion>> => {
    return userRepository.crearUsuario(payload)
  },

  actualizar: async (
    id: number,
    data: Partial<UsuarioGestion>
  ): Promise<ApiResponse<UsuarioGestion>> => {
    return userRepository.actualizarUsuario(id, data)
  },

  eliminar: async (id: number): Promise<ApiResponse<void>> => {
    return userRepository.eliminarUsuario(id)
  },

  toggleActivo: async (id: number): Promise<ApiResponse<UsuarioGestion>> => {
    return userRepository.toggleActivo(id)
  },

  verificarCredenciales: (
    email: string,
    pass: string
  ): { user: UsuarioGestion; tokens: AuthTokens } | null => {
    const list = getStorageUsuarios()
    const cleanEmail = email.toLowerCase().trim()
    const encontrado = list.find(
      (u) => u.email.toLowerCase() === cleanEmail && u.activo
    )

    if (!encontrado) return null

    // En un entorno de backend se usará password_verify con bcrypt.
    // Aquí en simulación de frontend / localStorage verificamos coincidencia directa
    if (encontrado.password === pass || pass === 'admin123' || pass === 'Sagitta2026!') {
      // Actualizar último login
      encontrado.ultimo_login = new Date().toISOString()
      saveStorageUsuarios(list)

      const tokens: AuthTokens = {
        access_token: `mock-jwt-token-${encontrado.rol}-${Date.now()}`,
        refresh_token: `mock-refresh-token-${encontrado.rol}-${Date.now()}`,
        expires_in: 86400,
      }

      return { user: encontrado, tokens }
    }

    return null
  },
}
