import { http, HttpResponse } from 'msw'
import { Cliente } from '@/types'

const BASE = import.meta.env.VITE_API_BASE_URL as string

export const MOCK_CLIENTES: Cliente[] = [
  { id: 1, nombre: 'Ana García', email: 'ana@email.com', telefono: '+1 555-0101', total_citas: 8, created_at: '2026-01-10T00:00:00Z' },
  { id: 2, nombre: 'Luis Fernández', email: 'luis@email.com', telefono: '+1 555-0102', total_citas: 3, created_at: '2026-02-15T00:00:00Z' },
  { id: 3, nombre: 'Sofía Torres', email: 'sofia@email.com', telefono: '+1 555-0103', total_citas: 12, created_at: '2025-11-20T00:00:00Z' },
  { id: 4, nombre: 'Miguel Ángel Ruiz', email: 'miguel@email.com', telefono: '+1 555-0104', total_citas: 1, created_at: '2026-09-01T00:00:00Z' },
  { id: 5, nombre: 'Elena Navarro', email: 'elena@email.com', total_citas: 5, created_at: '2026-03-28T00:00:00Z' },
]

export const clientesHandlers = [
  http.get(`${BASE}/clientes`, ({ request }) => {
    const url = new URL(request.url)
    const q = url.searchParams.get('q')?.toLowerCase()
    const data = q
      ? MOCK_CLIENTES.filter(c => c.nombre.toLowerCase().includes(q) || c.email.toLowerCase().includes(q))
      : MOCK_CLIENTES
    return HttpResponse.json({ success: true, message: 'OK', data,
      meta: { total: data.length, per_page: 20, current_page: 1, last_page: 1 } })
  }),

  http.get(`${BASE}/clientes/:id`, ({ params }) =>
    HttpResponse.json({ success: true, message: 'OK',
      data: MOCK_CLIENTES.find(c => c.id === Number(params.id)) ?? MOCK_CLIENTES[0] })
  ),

  http.post(`${BASE}/clientes`, async ({ request }) => {
    const body = await request.json() as Partial<Cliente>
    return HttpResponse.json({ success: true, message: 'Cliente creado',
      data: { ...MOCK_CLIENTES[0], id: Date.now(), ...body, total_citas: 0 } }, { status: 201 })
  }),
]

