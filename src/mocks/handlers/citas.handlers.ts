import { http, HttpResponse } from 'msw'
import {
  Cita, Cliente, Empleado, Servicio, SlotDisponible
} from '@/types'

const BASE = import.meta.env.VITE_API_BASE_URL as string

// ─── Mock data ─────────────────────────────────────────────────────────────

const MOCK_CLIENTE: Cliente = {
  id: 1, usuario_id: 1, nombre: 'Ana García', email: 'ana@email.com',
  telefono: '+1 555-0101', total_citas: 8, created_at: '2026-01-10T00:00:00Z',
}

const MOCK_EMPLEADO: Empleado = {
  id: 1, usuario_id: 2, nombre: 'Dr. Carlos Pérez', email: 'carlos@sagitta.com',
  bio: 'Especialista con 10 años de experiencia.', especialidad: 'Medicina General',
  activo: true,
}

const MOCK_SERVICIO: Servicio = {
  id: 1, nombre: 'Consulta General', duracion_base_min: 30, precio_base: 50,
  color: '#6366f1', activo: true, buffer_antes_min: 5, buffer_despues_min: 10,
}

const generarSlots = (): SlotDisponible[] =>
  ['09:00','09:30','10:00','10:30','11:00','11:30','14:00','14:30','15:00','15:30','16:00'].map(h => ({
    hora_inicio: h,
    hora_fin: `${String(parseInt(h) + (h.includes(':30') ? 0 : 0)).padStart(2,'0')}:${h.includes(':30') ? '00' : '30'}`,
    disponible: Math.random() > 0.3,
  }))

const MOCK_CITAS: Cita[] = [
  {
    id: 1, cliente_id: 1, cliente: MOCK_CLIENTE,
    empleado_id: 1, empleado: MOCK_EMPLEADO,
    servicio_id: 1, servicio: MOCK_SERVICIO,
    fecha_inicio: new Date().toISOString().replace('T', ' ').slice(0, 16),
    fecha_fin: new Date(Date.now() + 30 * 60000).toISOString().replace('T', ' ').slice(0, 16),
    estado: 'confirmada', precio_total: 50,
    notas: 'Primera consulta del paciente', created_at: new Date().toISOString(),
  },
  {
    id: 2, cliente_id: 1, cliente: MOCK_CLIENTE,
    empleado_id: 1, empleado: MOCK_EMPLEADO,
    servicio_id: 1, servicio: MOCK_SERVICIO,
    fecha_inicio: new Date(Date.now() + 86400000).toISOString().replace('T', ' ').slice(0, 16),
    fecha_fin: new Date(Date.now() + 86400000 + 30 * 60000).toISOString().replace('T', ' ').slice(0, 16),
    estado: 'pendiente', precio_total: 50, created_at: new Date().toISOString(),
  },
  {
    id: 3, cliente_id: 1, cliente: MOCK_CLIENTE,
    empleado_id: 1, empleado: MOCK_EMPLEADO,
    servicio_id: 1, servicio: MOCK_SERVICIO,
    fecha_inicio: new Date(Date.now() - 86400000).toISOString().replace('T', ' ').slice(0, 16),
    fecha_fin: new Date(Date.now() - 86400000 + 30 * 60000).toISOString().replace('T', ' ').slice(0, 16),
    estado: 'completada', precio_total: 50, created_at: new Date().toISOString(),
  },
]

// ─── Handlers ──────────────────────────────────────────────────────────────

export const citasHandlers = [
  http.get(`${BASE}/citas`, () =>
    HttpResponse.json({ success: true, message: 'OK', data: MOCK_CITAS,
      meta: { total: 3, per_page: 20, current_page: 1, last_page: 1 } })
  ),

  http.get(`${BASE}/citas/:id`, ({ params }) =>
    HttpResponse.json({ success: true, message: 'OK',
      data: MOCK_CITAS.find(c => c.id === Number(params.id)) ?? MOCK_CITAS[0] })
  ),

  http.post(`${BASE}/citas`, async ({ request }) => {
    const body = await request.json() as Partial<Cita>
    const nueva: Cita = { ...MOCK_CITAS[0], id: Date.now(), ...body, created_at: new Date().toISOString() }
    return HttpResponse.json({ success: true, message: 'Cita creada', data: nueva }, { status: 201 })
  }),

  http.put(`${BASE}/citas/:id`, async ({ params, request }) => {
    const body = await request.json() as Partial<Cita>
    const actualizada = { ...MOCK_CITAS.find(c => c.id === Number(params.id)), ...body }
    return HttpResponse.json({ success: true, message: 'Cita actualizada', data: actualizada })
  }),

  http.delete(`${BASE}/citas/:id`, () =>
    HttpResponse.json({ success: true, message: 'Cita cancelada' })
  ),

  http.get(`${BASE}/citas/disponibilidad`, () =>
    HttpResponse.json({ success: true, message: 'OK', data: generarSlots() })
  ),
]

