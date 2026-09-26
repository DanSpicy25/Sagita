import { apiClient } from './api.client'
import {
  Integracion,
  Webhook,
  Notificacion,
  PlantillaMensaje,
} from '@/types'

export const integracionesService = {
  // ─── Integraciones Generales (Google Calendar, Meet, Zoom, WhatsApp) ─────
  getIntegraciones: () =>
    apiClient.get<Integracion[]>('/integraciones'),

  toggleIntegracion: (id: string, estado: 'conectado' | 'desconectado') =>
    apiClient.put<Integracion>(`/integraciones/${id}`, { estado }),

  sincronizarGoogleCalendar: (citaId: number) =>
    apiClient.post<{ evento_id: string; enlace: string }>(`/integraciones/google-calendar/sync`, {
      cita_id: citaId,
    }),

  generarEnlaceVideollamada: (citaId: number, plataforma: 'meet' | 'zoom') =>
    apiClient.post<{ enlace: string; plataforma: 'meet' | 'zoom' }>(`/integraciones/videollamada`, {
      cita_id: citaId,
      plataforma,
    }),

  // ─── Webhooks ────────────────────────────────────────────────────────────
  getWebhooks: () =>
    apiClient.get<Webhook[]>('/webhooks'),

  crearWebhook: (data: Partial<Webhook>) =>
    apiClient.post<Webhook>('/webhooks', data),

  eliminarWebhook: (id: number) =>
    apiClient.delete<void>(`/webhooks/${id}`),

  probarWebhook: (id: number) =>
    apiClient.post<{ status: number; respuesta: string }>(`/webhooks/${id}/test`, {}),

  // ─── Centro de Notificaciones ─────────────────────────────────────────────
  getNotificaciones: () =>
    apiClient.get<Notificacion[]>('/notificaciones'),

  marcarLeida: (id: number) =>
    apiClient.put<void>(`/notificaciones/${id}/leer`, {}),

  marcarTodasLeidas: () =>
    apiClient.put<void>('/notificaciones/leer-todas', {}),

  // ─── Plantillas de Mensajes ──────────────────────────────────────────────
  getPlantillas: () =>
    apiClient.get<PlantillaMensaje[]>('/plantillas'),

  actualizarPlantilla: (id: number, data: Partial<PlantillaMensaje>) =>
    apiClient.put<PlantillaMensaje>(`/plantillas/${id}`, data),

  // ─── WhatsApp Directo ────────────────────────────────────────────────────
  enviarMensajeWhatsApp: (citaId: number, telefono: string, mensaje: string) =>
    apiClient.post<{ enviado: boolean; mensaje_id: string }>('/integraciones/whatsapp/enviar', {
      cita_id: citaId,
      telefono,
      mensaje,
    }),
}

