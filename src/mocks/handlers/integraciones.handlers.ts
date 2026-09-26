import { http, HttpResponse } from 'msw'
import {
  Integracion,
  Webhook,
  Notificacion,
  PlantillaMensaje,
} from '@/types'

const BASE = import.meta.env.VITE_API_BASE_URL as string

export const MOCK_INTEGRACIONES: Integracion[] = [
  {
    id: 'google_calendar',
    tipo: 'google_calendar',
    nombre: 'Google Calendar',
    descripcion: 'Sincronización bidireccional de citas y bloqueo de disponibilidad.',
    estado: 'conectado',
    cuenta_vinculada: 'administracion@sagitta.com',
    sincronizacion_automatica: true,
    ultima_sync: '2026-09-17T14:30:00Z',
  },
  {
    id: 'google_meet',
    tipo: 'google_meet',
    nombre: 'Google Meet',
    descripcion: 'Genera enlaces de videollamada automáticos para citas virtuales.',
    estado: 'conectado',
    cuenta_vinculada: 'administracion@sagitta.com',
    sincronizacion_automatica: true,
  },
  {
    id: 'zoom',
    tipo: 'zoom',
    nombre: 'Zoom Video',
    descripcion: 'Creación automática de reuniones y salas virtuales vía Zoom API.',
    estado: 'desconectado',
  },
  {
    id: 'whatsapp',
    tipo: 'whatsapp',
    nombre: 'WhatsApp Business API',
    descripcion: 'Recordatorios automáticos 24h antes y confirmaciones instantáneas.',
    estado: 'conectado',
    cuenta_vinculada: '+1 555-0900 (Verificado)',
    sincronizacion_automatica: true,
    ultima_sync: '2026-09-17T15:10:00Z',
  },
  {
    id: 'webpush',
    tipo: 'webpush',
    nombre: 'Notificaciones Web Push',
    descripcion: 'Alertas en tiempo real directo en el navegador de clientes y staff.',
    estado: 'conectado',
    sincronizacion_automatica: true,
  },
]

export const MOCK_WEBHOOKS: Webhook[] = [
  {
    id: 1,
    url: 'https://api.crm-sagitta.com/v1/citas-webhook',
    eventos: ['cita.creada', 'cita.cancelada', 'cita.pagada'],
    secret_key: 'whsec_sagitta_live_981723ab9c8',
    activo: true,
    ultimo_envio: '2026-09-17T15:00:00Z',
    ultimo_status: 200,
  },
]

export const MOCK_NOTIFICACIONES: Notificacion[] = [
  {
    id: 1,
    titulo: 'Nueva cita agendada',
    mensaje: 'Ana García reservó Consulta General para el 20 Sep a las 10:00.',
    tipo: 'cita',
    leida: false,
    fecha: '2026-09-17T15:00:00Z',
    enlace: '/citas',
  },
  {
    id: 2,
    titulo: 'Factura pagada',
    mensaje: 'Se cobró exitosamente la factura FAC-2026-002 ($60) vía Tarjeta.',
    tipo: 'pago',
    leida: false,
    fecha: '2026-09-17T14:45:00Z',
    enlace: '/finanzas',
  },
  {
    id: 3,
    titulo: 'Cliente en lista de espera',
    mensaje: 'Miguel Ángel Ruiz solicitó turno libre para Consulta General.',
    tipo: 'espera',
    leida: true,
    fecha: '2026-09-17T13:20:00Z',
    enlace: '/finanzas',
  },
  {
    id: 4,
    titulo: 'Sincronización Google Calendar',
    mensaje: 'Se sincronizaron 3 nuevas citas con tu cuenta de Google Calendar.',
    tipo: 'sistema',
    leida: true,
    fecha: '2026-09-17T12:00:00Z',
    enlace: '/integraciones',
  },
]

export const MOCK_PLANTILLAS: PlantillaMensaje[] = [
  {
    id: 1,
    canal: 'whatsapp',
    evento: 'recordatorio_24h',
    nombre: 'Recordatorio WhatsApp 24h Antes',
    cuerpo:
      'Hola {cliente}, te recordamos tu cita de {servicio} agendada para el {fecha} a las {hora} con {profesional}. Si necesitas reagendar, responde a este mensaje.',
    activo: true,
  },
  {
    id: 2,
    canal: 'email',
    evento: 'confirmacion_cita',
    nombre: 'Email Confirmación Inmediata',
    asunto: '¡Tu cita en Sagitta está confirmada!',
    cuerpo:
      'Hola {cliente},\n\nTu cita para {servicio} ha sido programada exitosamente.\nFecha: {fecha}\nHora: {hora}\nProfesional: {profesional}\n\nGracias por confiar en nosotros.',
    activo: true,
  },
  {
    id: 3,
    canal: 'push',
    evento: 'recordatorio_1h',
    nombre: 'Notificación Push 1h Antes',
    cuerpo: 'Tu cita para {servicio} comienza en 1 hora con {profesional}.',
    activo: true,
  },
]

export const integracionesHandlers = [
  // Integraciones
  http.get(`${BASE}/integraciones`, () =>
    HttpResponse.json({ success: true, message: 'OK', data: MOCK_INTEGRACIONES })
  ),

  http.put(`${BASE}/integraciones/:id`, async ({ params, request }) => {
    const body = (await request.json()) as { estado: 'conectado' | 'desconectado' }
    const int = MOCK_INTEGRACIONES.find((i) => i.id === params.id)
    if (int) {
      int.estado = body.estado
      if (body.estado === 'conectado') {
        int.cuenta_vinculada = int.cuenta_vinculada ?? 'conectado@usuario.com'
      }
    }
    return HttpResponse.json({ success: true, message: 'Integración actualizada', data: int })
  }),

  http.post(`${BASE}/integraciones/google-calendar/sync`, async ({ request }) => {
    const { cita_id } = (await request.json()) as { cita_id: number }
    return HttpResponse.json({
      success: true,
      message: 'Cita sincronizada con Google Calendar',
      data: {
        evento_id: `gcal_${cita_id}_${Date.now()}`,
        enlace: 'https://calendar.google.com',
      },
    })
  }),

  http.post(`${BASE}/integraciones/videollamada`, async ({ request }) => {
    const { cita_id, plataforma } = (await request.json()) as {
      cita_id: number
      plataforma: 'meet' | 'zoom'
    }
    const enlace =
      plataforma === 'meet'
        ? `https://meet.google.com/sag-${cita_id}-${Math.floor(Math.random() * 1000)}`
        : `https://zoom.us/j/98${cita_id}1234`

    return HttpResponse.json({
      success: true,
      message: 'Enlace generado',
      data: { enlace, plataforma },
    })
  }),

  // Webhooks
  http.get(`${BASE}/webhooks`, () =>
    HttpResponse.json({ success: true, message: 'OK', data: MOCK_WEBHOOKS })
  ),

  http.post(`${BASE}/webhooks`, async ({ request }) => {
    const body = (await request.json()) as Partial<Webhook>
    const nuevo: Webhook = {
      id: Date.now(),
      url: body.url ?? '',
      eventos: body.eventos ?? ['cita.creada'],
      secret_key: `whsec_${Math.random().toString(36).substring(2, 15)}`,
      activo: true,
      ultimo_status: 200,
      ...body,
    }
    MOCK_WEBHOOKS.push(nuevo)
    return HttpResponse.json({ success: true, message: 'Webhook creado', data: nuevo }, { status: 201 })
  }),

  http.delete(`${BASE}/webhooks/:id`, ({ params }) => {
    const idx = MOCK_WEBHOOKS.findIndex((w) => w.id === Number(params.id))
    if (idx !== -1) MOCK_WEBHOOKS.splice(idx, 1)
    return HttpResponse.json({ success: true, message: 'Webhook eliminado' })
  }),

  http.post(`${BASE}/webhooks/:id/test`, ({ params }) => {
    const w = MOCK_WEBHOOKS.find((item) => item.id === Number(params.id))
    if (w) {
      w.ultimo_envio = new Date().toISOString()
      w.ultimo_status = 200
    }
    return HttpResponse.json({
      success: true,
      message: 'Ping enviado exitosamente',
      data: { status: 200, respuesta: 'HTTP 200 OK — Receiver acknowledged payload' },
    })
  }),

  // Notificaciones
  http.get(`${BASE}/notificaciones`, () =>
    HttpResponse.json({ success: true, message: 'OK', data: MOCK_NOTIFICACIONES })
  ),

  http.put(`${BASE}/notificaciones/:id/leer`, ({ params }) => {
    const n = MOCK_NOTIFICACIONES.find((item) => item.id === Number(params.id))
    if (n) n.leida = true
    return HttpResponse.json({ success: true, message: 'Notificación leída' })
  }),

  http.put(`${BASE}/notificaciones/leer-todas`, () => {
    MOCK_NOTIFICACIONES.forEach((n) => (n.leida = true))
    return HttpResponse.json({ success: true, message: 'Todas marcadas como leídas' })
  }),

  // Plantillas
  http.get(`${BASE}/plantillas`, () =>
    HttpResponse.json({ success: true, message: 'OK', data: MOCK_PLANTILLAS })
  ),

  http.put(`${BASE}/plantillas/:id`, async ({ params, request }) => {
    const body = (await request.json()) as Partial<PlantillaMensaje>
    const p = MOCK_PLANTILLAS.find((item) => item.id === Number(params.id))
    if (p) Object.assign(p, body)
    return HttpResponse.json({ success: true, message: 'Plantilla actualizada', data: p })
  }),

  // WhatsApp
  http.post(`${BASE}/integraciones/whatsapp/enviar`, async () =>
    HttpResponse.json({
      success: true,
      message: 'Mensaje de WhatsApp enviado',
      data: { enviado: true, mensaje_id: `wamid_${Date.now()}` },
    })
  ),
]

