import { http, HttpResponse } from 'msw'
import { Servicio, CategoriaServicio } from '@/types'

const BASE = import.meta.env.VITE_API_BASE_URL as string

const MOCK_CATEGORIAS: CategoriaServicio[] = [
  { id: 1, nombre: 'Consultas', color: '#6366f1', icono: 'stethoscope' },
  { id: 2, nombre: 'Estética', color: '#ec4899', icono: 'sparkles' },
  { id: 3, nombre: 'Bienestar', color: '#10b981', icono: 'heart' },
]

const MOCK_SERVICIOS: Servicio[] = [
  {
    id: 1, nombre: 'Consulta General', categoria_id: 1, categoria: MOCK_CATEGORIAS[0],
    descripcion: 'Consulta médica de rutina con evaluación completa.',
    duracion_base_min: 30, precio_base: 50, color: '#6366f1',
    activo: true, buffer_antes_min: 5, buffer_despues_min: 10,
    duraciones: [
      { id: 1, servicio_id: 1, duracion_min: 30, precio: 50, etiqueta: 'Estándar' },
      { id: 2, servicio_id: 1, duracion_min: 60, precio: 90, etiqueta: 'Extendida' },
    ],
  },
  {
    id: 2, nombre: 'Limpieza Facial', categoria_id: 2, categoria: MOCK_CATEGORIAS[1],
    descripcion: 'Tratamiento de limpieza profunda e hidratación.',
    duracion_base_min: 60, precio_base: 75, color: '#ec4899',
    activo: true, buffer_antes_min: 10, buffer_despues_min: 15,
    duraciones: [
      { id: 3, servicio_id: 2, duracion_min: 60, precio: 75, etiqueta: 'Básica' },
      { id: 4, servicio_id: 2, duracion_min: 90, precio: 110, etiqueta: 'Premium' },
    ],
  },
  {
    id: 3, nombre: 'Masaje Relajante', categoria_id: 3, categoria: MOCK_CATEGORIAS[2],
    descripcion: 'Masaje terapéutico para aliviar tensiones musculares.',
    duracion_base_min: 45, precio_base: 60, color: '#10b981',
    activo: true, buffer_antes_min: 5, buffer_despues_min: 10,
  },
  {
    id: 4, nombre: 'Corte de Cabello', categoria_id: 2, categoria: MOCK_CATEGORIAS[1],
    descripcion: 'Corte personalizado según el estilo del cliente.',
    duracion_base_min: 30, precio_base: 35, color: '#f59e0b',
    activo: true, buffer_antes_min: 0, buffer_despues_min: 5,
  },
]

export const serviciosHandlers = [
  http.get(`${BASE}/servicios`, () =>
    HttpResponse.json({ success: true, message: 'OK', data: MOCK_SERVICIOS,
      meta: { total: 4, per_page: 20, current_page: 1, last_page: 1 } })
  ),

  http.get(`${BASE}/servicios/:id`, ({ params }) =>
    HttpResponse.json({ success: true, message: 'OK',
      data: MOCK_SERVICIOS.find(s => s.id === Number(params.id)) ?? MOCK_SERVICIOS[0] })
  ),

  http.get(`${BASE}/categorias-servicio`, () =>
    HttpResponse.json({ success: true, message: 'OK', data: MOCK_CATEGORIAS })
  ),

  http.post(`${BASE}/servicios`, async ({ request }) => {
    const body = await request.json() as Partial<Servicio>
    return HttpResponse.json({ success: true, message: 'Servicio creado',
      data: { ...MOCK_SERVICIOS[0], id: Date.now(), ...body } }, { status: 201 })
  }),

  http.put(`${BASE}/servicios/:id`, async ({ params, request }) => {
    const body = await request.json() as Partial<Servicio>
    const actualizado = { ...MOCK_SERVICIOS.find(s => s.id === Number(params.id)), ...body }
    return HttpResponse.json({ success: true, message: 'Servicio actualizado', data: actualizado })
  }),

  http.delete(`${BASE}/servicios/:id`, () =>
    HttpResponse.json({ success: true, message: 'Servicio eliminado' })
  ),
]

