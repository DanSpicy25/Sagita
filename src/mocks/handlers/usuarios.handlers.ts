import { http, HttpResponse } from 'msw'
import { usuariosService } from '@/services/usuarios.service'
import { CrearUsuarioPayload, UsuarioGestion } from '@/types'

const BASE = import.meta.env.VITE_API_BASE_URL as string

export const usuariosHandlers = [
  // GET /api/usuarios
  http.get(`${BASE}/usuarios`, async () => {
    const res = await usuariosService.getAll()
    return HttpResponse.json(res)
  }),

  // GET /api/usuarios/:id
  http.get(`${BASE}/usuarios/:id`, async ({ params }) => {
    const id = Number(params.id)
    const res = await usuariosService.getById(id)
    return HttpResponse.json(res, { status: res.success ? 200 : 404 })
  }),

  // POST /api/usuarios
  http.post(`${BASE}/usuarios`, async ({ request }) => {
    const body = (await request.json()) as CrearUsuarioPayload
    const res = await usuariosService.crear(body)
    return HttpResponse.json(res, { status: res.success ? 201 : 400 })
  }),

  // PUT /api/usuarios/:id
  http.put(`${BASE}/usuarios/:id`, async ({ params, request }) => {
    const id = Number(params.id)
    const body = (await request.json()) as Partial<UsuarioGestion>
    const res = await usuariosService.actualizar(id, body)
    return HttpResponse.json(res, { status: res.success ? 200 : 400 })
  }),

  // DELETE /api/usuarios/:id
  http.delete(`${BASE}/usuarios/:id`, async ({ params }) => {
    const id = Number(params.id)
    const res = await usuariosService.eliminar(id)
    return HttpResponse.json(res)
  }),
]
