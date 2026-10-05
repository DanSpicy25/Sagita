import { http, HttpResponse } from 'msw'
import { Cita, Cliente, Empleado, Servicio, SlotDisponible } from '@/types'

import { API_BASE_URL as BASE } from '@/config/environment'

const MOCK_CLIENTE: Cliente = {
  id: 1,
  usuario_id: 1,
  nombre: 'Ana García',
  email: 'ana@email.com',
  telefono: '+1 555-0101',
  total_citas: 8,
  created_at: '2026-01-10T00:00:00Z',
}

const MOCK_EMPLEADO: Empleado = {
  id: 1,
  usuario_id: 2,
  nombre: 'Dr. Carlos Pérez',
  email: 'carlos@sagitta.com',
  bio: 'Especialista con 10 años de experiencia.',
  especialidad: 'Medicina General',
  activo: true,
}

const MOCK_SERVICIO: Servicio = {
  id: 1,
  nombre: 'Consulta General',
  duracion_base_min: 30,
  precio_base: 50,
  color: '#6366f1',
  activo: true,
  buffer_antes_min: 5,
  buffer_despues_min: 10,
}

const formatLocalDateTime = (date: Date): string => {
  const datePart = [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, '0'),
    String(date.getDate()).padStart(2, '0'),
  ].join('-')
  const timePart = [
    String(date.getHours()).padStart(2, '0'),
    String(date.getMinutes()).padStart(2, '0'),
  ].join(':')
  return `${datePart} ${timePart}`
}

const formatMinutesToTime = (minutes: number): string =>
  `${String(Math.floor(minutes / 60)).padStart(2, '0')}:${String(minutes % 60).padStart(2, '0')}`

const MOCK_CITAS: Cita[] = [
  {
    id: 1,
    cliente_id: 1,
    cliente: MOCK_CLIENTE,
    empleado_id: 1,
    empleado: MOCK_EMPLEADO,
    servicio_id: 1,
    servicio: MOCK_SERVICIO,
    fecha_inicio: formatLocalDateTime(new Date()),
    fecha_fin: formatLocalDateTime(new Date(Date.now() + 30 * 60000)),
    estado: 'confirmada',
    precio_total: 50,
    notas: 'Primera consulta del paciente',
    created_at: new Date().toISOString(),
  },
  {
    id: 2,
    cliente_id: 1,
    cliente: MOCK_CLIENTE,
    empleado_id: 1,
    empleado: MOCK_EMPLEADO,
    servicio_id: 1,
    servicio: MOCK_SERVICIO,
    fecha_inicio: formatLocalDateTime(new Date(Date.now() + 86400000)),
    fecha_fin: formatLocalDateTime(new Date(Date.now() + 86400000 + 30 * 60000)),
    estado: 'pendiente',
    precio_total: 50,
    created_at: new Date().toISOString(),
  },
  {
    id: 3,
    cliente_id: 1,
    cliente: MOCK_CLIENTE,
    empleado_id: 1,
    empleado: MOCK_EMPLEADO,
    servicio_id: 1,
    servicio: MOCK_SERVICIO,
    fecha_inicio: formatLocalDateTime(new Date(Date.now() - 86400000)),
    fecha_fin: formatLocalDateTime(new Date(Date.now() - 86400000 + 30 * 60000)),
    estado: 'completada',
    precio_total: 50,
    created_at: new Date().toISOString(),
  },
]

export const citasHandlers = [
  http.get(`${BASE}/citas`, () =>
    HttpResponse.json({
      success: true,
      message: 'OK',
      data: MOCK_CITAS,
      meta: { total: MOCK_CITAS.length, per_page: 20, current_page: 1, last_page: 1 },
    })
  ),

  http.get(`${BASE}/citas/:id`, ({ params }) => {
    const cita = MOCK_CITAS.find((item) => item.id === Number(params.id))
    return cita
      ? HttpResponse.json({ success: true, message: 'OK', data: cita })
      : HttpResponse.json({ success: false, message: 'Cita no encontrada' }, { status: 404 })
  }),

  http.post(`${BASE}/citas`, async ({ request }) => {
    const body = (await request.json()) as Partial<Cita>
    const nueva: Cita = {
      ...MOCK_CITAS[0],
      ...body,
      id: Date.now(),
      created_at: new Date().toISOString(),
    }
    MOCK_CITAS.push(nueva)
    return HttpResponse.json({ success: true, message: 'Cita creada', data: nueva }, { status: 201 })
  }),

  http.put(`${BASE}/citas/:id`, async ({ params, request }) => {
    const index = MOCK_CITAS.findIndex((item) => item.id === Number(params.id))
    if (index < 0) {
      return HttpResponse.json({ success: false, message: 'Cita no encontrada' }, { status: 404 })
    }

    const body = (await request.json()) as Partial<Cita>
    MOCK_CITAS[index] = { ...MOCK_CITAS[index], ...body }
    return HttpResponse.json({ success: true, message: 'Cita actualizada', data: MOCK_CITAS[index] })
  }),

  http.delete(`${BASE}/citas/:id`, ({ params }) => {
    const cita = MOCK_CITAS.find((item) => item.id === Number(params.id))
    if (cita) cita.estado = 'cancelada'
    return HttpResponse.json({ success: true, message: 'Cita cancelada' })
  }),

  http.get(`${BASE}/citas/disponibilidad`, ({ request }) => {
    const query = new URL(request.url).searchParams
    const empleadoId = Number(query.get('empleado_id') ?? MOCK_EMPLEADO.id)
    const fecha = query.get('fecha') ?? ''
    const servicioId = Number(query.get('servicio_id'))
    const citasDelDia = MOCK_CITAS.filter(
      (cita) => {
        const fechaInicio = new Date(cita.fecha_inicio.replace(' ', 'T'))
        const fechaLocal = formatLocalDateTime(fechaInicio).slice(0, 10)
        return (
          cita.empleado_id === empleadoId &&
          fechaLocal === fecha &&
          (cita.estado === 'pendiente' || cita.estado === 'confirmada')
        )
      }
    )
    const duracionSolicitadaMin = Number(query.get('duracion_min'))
    const duracionMin =
      duracionSolicitadaMin > 0
        ? duracionSolicitadaMin
        : servicioId === MOCK_SERVICIO.id
          ? MOCK_SERVICIO.duracion_base_min
          : 30

    const data: SlotDisponible[] = []
    for (let horaInicio = 9 * 60; horaInicio < 18 * 60; horaInicio += 30) {
      const horaFin = horaInicio + duracionMin
      const disponible =
        horaFin <= 18 * 60 &&
        !citasDelDia.some((cita) => {
          const fechaInicio = new Date(cita.fecha_inicio.replace(' ', 'T'))
          const fechaFin = new Date(cita.fecha_fin.replace(' ', 'T'))
          const inicioCita = fechaInicio.getHours() * 60 + fechaInicio.getMinutes()
          const finCita = fechaFin.getHours() * 60 + fechaFin.getMinutes()
          return horaInicio < finCita && horaFin > inicioCita
        })

      data.push({
        hora_inicio: formatMinutesToTime(horaInicio),
        hora_fin: formatMinutesToTime(horaFin),
        disponible,
      })
    }

    return HttpResponse.json({ success: true, message: 'OK', data })
  }),
]