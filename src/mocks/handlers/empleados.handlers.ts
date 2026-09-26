import { http, HttpResponse } from 'msw'
import { Empleado, HorarioEmpleado, SlotDisponible } from '@/types'

const BASE = import.meta.env.VITE_API_BASE_URL as string

const HORARIOS_BASE: HorarioEmpleado[] = [
  { id: 1, empleado_id: 1, dia_semana: 1, hora_inicio: '09:00', hora_fin: '18:00', activo: true },
  { id: 2, empleado_id: 1, dia_semana: 2, hora_inicio: '09:00', hora_fin: '18:00', activo: true },
  { id: 3, empleado_id: 1, dia_semana: 3, hora_inicio: '09:00', hora_fin: '18:00', activo: true },
  { id: 4, empleado_id: 1, dia_semana: 4, hora_inicio: '09:00', hora_fin: '18:00', activo: true },
  { id: 5, empleado_id: 1, dia_semana: 5, hora_inicio: '09:00', hora_fin: '14:00', activo: true },
]

export const MOCK_EMPLEADOS: Empleado[] = [
  {
    id: 1, usuario_id: 2, nombre: 'Dr. Carlos Pérez', email: 'carlos@sagitta.com',
    bio: 'Médico general con 10 años de experiencia en consultas y preventiva.',
    especialidad: 'Medicina General', activo: true, horarios: HORARIOS_BASE,
  },
  {
    id: 2, usuario_id: 3, nombre: 'Lic. María Rodríguez', email: 'maria@sagitta.com',
    bio: 'Esteticista certificada especializada en tratamientos faciales y corporales.',
    especialidad: 'Estética y Belleza', activo: true,
    horarios: [
      { id: 6, empleado_id: 2, dia_semana: 1, hora_inicio: '10:00', hora_fin: '19:00', activo: true },
      { id: 7, empleado_id: 2, dia_semana: 2, hora_inicio: '10:00', hora_fin: '19:00', activo: true },
      { id: 8, empleado_id: 2, dia_semana: 3, hora_inicio: '10:00', hora_fin: '19:00', activo: true },
      { id: 9, empleado_id: 2, dia_semana: 4, hora_inicio: '10:00', hora_fin: '19:00', activo: true },
      { id: 10, empleado_id: 2, dia_semana: 6, hora_inicio: '09:00', hora_fin: '15:00', activo: true },
    ],
  },
  {
    id: 3, usuario_id: 4, nombre: 'Juan Martínez', email: 'juan@sagitta.com',
    bio: 'Terapeuta de masajes con certificación internacional.',
    especialidad: 'Masajes Terapéuticos', activo: true,
    horarios: [
      { id: 11, empleado_id: 3, dia_semana: 2, hora_inicio: '08:00', hora_fin: '16:00', activo: true },
      { id: 12, empleado_id: 3, dia_semana: 4, hora_inicio: '08:00', hora_fin: '16:00', activo: true },
      { id: 13, empleado_id: 3, dia_semana: 6, hora_inicio: '10:00', hora_fin: '18:00', activo: true },
    ],
  },
]

const generarSlots = (fecha: string): SlotDisponible[] => {
  const horas = ['09:00','09:30','10:00','10:30','11:00','11:30','12:00',
                 '14:00','14:30','15:00','15:30','16:00','16:30','17:00']
  const seed = fecha.charCodeAt(8) + fecha.charCodeAt(9)
  return horas.map((h, i) => ({
    hora_inicio: h,
    hora_fin: horas[i + 1] ?? '17:30',
    disponible: (seed + i) % 3 !== 0,
  }))
}

export const empleadosHandlers = [
  http.get(`${BASE}/empleados`, () =>
    HttpResponse.json({ success: true, message: 'OK', data: MOCK_EMPLEADOS,
      meta: { total: 3, per_page: 20, current_page: 1, last_page: 1 } })
  ),

  http.get(`${BASE}/empleados/:id`, ({ params }) =>
    HttpResponse.json({ success: true, message: 'OK',
      data: MOCK_EMPLEADOS.find(e => e.id === Number(params.id)) ?? MOCK_EMPLEADOS[0] })
  ),

  http.get(`${BASE}/empleados/:id/horario`, ({ params }) => {
    const empleado = MOCK_EMPLEADOS.find(e => e.id === Number(params.id))
    return HttpResponse.json({ success: true, message: 'OK', data: empleado?.horarios ?? [] })
  }),

  http.get(`${BASE}/empleados/:id/disponibilidad`, ({ request }) => {
    const url = new URL(request.url)
    const fecha = url.searchParams.get('fecha') ?? new Date().toISOString().slice(0, 10)
    return HttpResponse.json({ success: true, message: 'OK',
      data: { fecha, slots: generarSlots(fecha) } })
  }),
]

