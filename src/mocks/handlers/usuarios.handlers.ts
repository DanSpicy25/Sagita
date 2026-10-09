import { http, HttpResponse } from 'msw'
import { CrearUsuarioPayload, UsuarioGestion } from '@/types'
import { API_BASE_URL as BASE } from '@/config/environment'
import { LocalStorageAdapter } from '@/repositories/local/LocalStorageAdapter'
import { USUARIOS_INICIALES } from '@/services/usuarios.service'

const COLLECTION_USUARIOS = 'usuarios'

function getStoredUsuarios(): UsuarioGestion[] {
  return LocalStorageAdapter.getCollection<UsuarioGestion>(COLLECTION_USUARIOS, USUARIOS_INICIALES)
}

function saveStoredUsuarios(usuarios: UsuarioGestion[]): void {
  LocalStorageAdapter.setCollection(COLLECTION_USUARIOS, usuarios)
}

export const usuariosHandlers = [
  // GET /api/usuarios
  http.get(`${BASE}/usuarios`, () => {
    const list = getStoredUsuarios()
    return HttpResponse.json({ success: true, message: 'OK', data: list })
  }),

  // GET /api/usuarios/:id
  http.get(`${BASE}/usuarios/:id`, ({ params }) => {
    const id = Number(params.id)
    const list = getStoredUsuarios()
    const user = list.find((u) => u.id === id)
    if (!user) {
      return HttpResponse.json({ success: false, message: 'Usuario no encontrado' }, { status: 404 })
    }
    return HttpResponse.json({ success: true, message: 'OK', data: user })
  }),

  // POST /api/usuarios
  http.post(`${BASE}/usuarios`, async ({ request }) => {
    const body = (await request.json()) as CrearUsuarioPayload
    const list = getStoredUsuarios()
    const nuevo: UsuarioGestion = {
      id: Date.now(),
      nombre: body.nombre,
      email: body.email,
      rol: body.rol,
      telefono: body.telefono,
      sucursal_id: body.sucursal_id,
      sucursal_nombre: body.sucursal_id ? 'Sede Asignada' : undefined,
      activo: true,
      timezone: 'America/New_York',
      created_at: new Date().toISOString(),
    }
    list.unshift(nuevo)
    saveStoredUsuarios(list)
    return HttpResponse.json({ success: true, message: 'Usuario creado', data: nuevo }, { status: 201 })
  }),

  // PUT /api/usuarios/:id
  http.put(`${BASE}/usuarios/:id`, async ({ params, request }) => {
    const id = Number(params.id)
    const body = (await request.json()) as Partial<UsuarioGestion>
    const list = getStoredUsuarios()
    const idx = list.findIndex((u) => u.id === id)
    if (idx === -1) {
      return HttpResponse.json({ success: false, message: 'Usuario no encontrado' }, { status: 404 })
    }
    list[idx] = { ...list[idx], ...body }
    saveStoredUsuarios(list)
    return HttpResponse.json({ success: true, message: 'Usuario actualizado', data: list[idx] })
  }),

  // DELETE /api/usuarios/:id
  http.delete(`${BASE}/usuarios/:id`, ({ params }) => {
    const id = Number(params.id)
    const list = getStoredUsuarios()
    const filtered = list.filter((u) => u.id !== id)
    saveStoredUsuarios(filtered)
    return HttpResponse.json({ success: true, message: 'Usuario eliminado' })
  }),
]
