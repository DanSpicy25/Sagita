import { ApiResponse, AuthTokens, LoginPayload, User } from '@/types'
import { usuariosService } from './usuarios.service'

const BASE_URL = import.meta.env.VITE_API_BASE_URL as string

// ─── Helpers ───────────────────────────────────────────────────────────────

function getToken(): string | null {
  return localStorage.getItem('sagitta_token')
}

function setTokens(tokens: AuthTokens): void {
  localStorage.setItem('sagitta_token', tokens.access_token)
  localStorage.setItem('sagitta_refresh_token', tokens.refresh_token)
}

function clearTokens(): void {
  localStorage.removeItem('sagitta_token')
  localStorage.removeItem('sagitta_refresh_token')
}

// ─── Cliente HTTP base ─────────────────────────────────────────────────────

interface RequestOptions extends RequestInit {
  skipAuth?: boolean
}

async function request<T>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<ApiResponse<T>> {
  const { skipAuth = false, ...fetchOptions } = options

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    ...fetchOptions.headers,
  }

  if (!skipAuth) {
    const token = getToken()
    if (token) {
      (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`
    }
  }

  // Multi-Tenancy: propagar la sucursal/tenant activa al backend
  const activeTenantId = localStorage.getItem('sagitta_active_tenant_id') || 'sede-principal'
  ;(headers as Record<string, string>)['X-Tenant-ID'] = activeTenantId

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...fetchOptions,
    headers,
  })

  // Token expirado → limpiar sesión y redirigir
  if (response.status === 401 && !skipAuth) {
    clearTokens()
    window.location.href = '/login'
    throw new Error('Sesión expirada. Por favor inicia sesión nuevamente.')
  }

  const text = await response.text()
  let data: ApiResponse<T>
  try {
    data = (text ? JSON.parse(text) : {}) as ApiResponse<T>
  } catch {
    throw new Error(`Respuesta no válida del servidor (${response.status})`)
  }

  if (!response.ok) {
    throw new Error(data.message ?? `Error del servidor (${response.status})`)
  }

  return data
}

// ─── Métodos HTTP ──────────────────────────────────────────────────────────

export const apiClient = {
  get: <T>(endpoint: string, options?: RequestOptions) =>
    request<T>(endpoint, { method: 'GET', ...options }),

  post: <T>(endpoint: string, body: unknown, options?: RequestOptions) =>
    request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(body),
      ...options,
    }),

  put: <T>(endpoint: string, body: unknown, options?: RequestOptions) =>
    request<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(body),
      ...options,
    }),

  delete: <T>(endpoint: string, options?: RequestOptions) =>
    request<T>(endpoint, { method: 'DELETE', ...options }),

  setTokens,
  clearTokens,
  getToken,
}

// ─── Servicios de Auth ─────────────────────────────────────────────────────

export const authService = {
  login: async (payload: LoginPayload): Promise<{ user: User; tokens: AuthTokens }> => {
    try {
      const res = await apiClient.post<{ user: User; tokens: AuthTokens }>(
        '/auth/login',
        payload,
        { skipAuth: true }
      )
      if (res.data) {
        apiClient.setTokens(res.data.tokens)
        localStorage.setItem('sagitta_user', JSON.stringify(res.data.user))
        return res.data
      }
    } catch {
      // Fallback a autenticación local si la API remota o MSW no responden
    }

    const localAuth = usuariosService.verificarCredenciales(payload.email, payload.password)
    if (localAuth) {
      apiClient.setTokens(localAuth.tokens)
      localStorage.setItem('sagitta_user', JSON.stringify(localAuth.user))
      return localAuth
    }

    throw new Error('Credenciales inválidas. Verifica tu correo o contraseña.')
  },

  logout: async (): Promise<void> => {
    try {
      await apiClient.post('/auth/logout', {})
    } catch {
      // Ignorar si el backend no responde
    } finally {
      apiClient.clearTokens()
      localStorage.removeItem('sagitta_user')
    }
  },

  me: async (): Promise<User> => {
    try {
      const res = await apiClient.get<User>('/auth/me')
      if (res.data) return res.data
    } catch {
      // Fallback a localStorage
    }

    const saved = localStorage.getItem('sagitta_user')
    if (saved) {
      try {
        return JSON.parse(saved) as User
      } catch {
        // noop
      }
    }

    throw new Error('No se pudo obtener el usuario')
  },
}

