import { ApiResponse, AuthTokens, LoginPayload, User } from '@/types'

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
  if (response.status === 401) {
    clearTokens()
    window.location.href = '/login'
    throw new Error('Sesión expirada. Por favor inicia sesión nuevamente.')
  }

  const data = (await response.json()) as ApiResponse<T>

  if (!response.ok) {
    throw new Error(data.message ?? 'Error inesperado del servidor')
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
    const res = await apiClient.post<{ user: User; tokens: AuthTokens }>(
      '/auth/login',
      payload,
      { skipAuth: true }
    )
    if (!res.data) throw new Error('Respuesta inválida del servidor')
    apiClient.setTokens(res.data.tokens)
    return res.data
  },

  logout: async (): Promise<void> => {
    try {
      await apiClient.post('/auth/logout', {})
    } finally {
      apiClient.clearTokens()
    }
  },

  me: async (): Promise<User> => {
    const res = await apiClient.get<User>('/auth/me')
    if (!res.data) throw new Error('No se pudo obtener el usuario')
    return res.data
  },
}

