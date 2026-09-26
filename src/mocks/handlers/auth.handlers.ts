import { http, HttpResponse } from 'msw'
import { User, AuthTokens } from '@/types'
import { usuariosService, USUARIOS_INICIALES } from '@/services/usuarios.service'

let currentSessionUser: User = USUARIOS_INICIALES[1] // Admin por defecto

const BASE = import.meta.env.VITE_API_BASE_URL as string

export const authHandlers = [
  // POST /auth/login
  http.post(`${BASE}/auth/login`, async ({ request }) => {
    const body = (await request.json()) as { email: string; password: string }
    if (!body.email || !body.password) {
      return HttpResponse.json(
        { success: false, message: 'Por favor ingresa correo y contraseña' },
        { status: 400 }
      )
    }

    const authRes = usuariosService.verificarCredenciales(body.email, body.password)
    if (authRes) {
      currentSessionUser = authRes.user
      return HttpResponse.json({
        success: true,
        message: 'Login exitoso',
        data: {
          user: authRes.user,
          tokens: authRes.tokens,
        },
      })
    }

    // Fallback permissivo para pruebas con cualquier correo si usa contraseña demo maestra
    if (body.password === 'Sagitta2026!' || body.password === 'Admin123!') {
      const fallbackUser: User = {
        id: 999,
        nombre: body.email.split('@')[0],
        email: body.email,
        rol: body.email.includes('supremo') ? 'superadmin' : 'admin',
        timezone: 'America/New_York',
        created_at: new Date().toISOString(),
      }
      currentSessionUser = fallbackUser
      const mockTokens: AuthTokens = {
        access_token: `mock-jwt-token-fallback-${Date.now()}`,
        refresh_token: `mock-refresh-token-fallback-${Date.now()}`,
        expires_in: 86400,
      }
      return HttpResponse.json({
        success: true,
        message: 'Login exitoso (modo demo)',
        data: { user: fallbackUser, tokens: mockTokens },
      })
    }

    return HttpResponse.json(
      {
        success: false,
        message: 'Credenciales inválidas. Verifica tu correo o contraseña.',
      },
      { status: 401 }
    )
  }),

  // GET /auth/me
  http.get(`${BASE}/auth/me`, () => {
    return HttpResponse.json({
      success: true,
      message: 'OK',
      data: currentSessionUser,
    })
  }),

  // POST /auth/logout
  http.post(`${BASE}/auth/logout`, () => {
    return HttpResponse.json({ success: true, message: 'Sesión cerrada' })
  }),
]
