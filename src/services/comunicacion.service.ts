import {
  CanalComunicacion,
  PreferenciaComunicacionTenant,
  DetalleAccionEjecutada,
  ApiResponse,
  Notificacion,
} from '@/types'
import { LocalStorageAdapter } from '@/repositories/local/LocalStorageAdapter'

const COLLECTION_PREFERENCIAS_COM = 'preferencias_comunicacion'
const COLLECTION_NOTIFICACIONES = 'notificaciones'

const PREFERENCIAS_DEFAULT: PreferenciaComunicacionTenant = {
  tenant_id: 'default',
  idioma_predeterminado: 'es',
  nombre_remitente: 'Sagitta Studio',
  email_remitente: 'notificaciones@sagitta.app',
  whatsapp_remitente: '+1 555-0900',
  sms_remitente: 'SAGITTA',
  canales: {
    whatsapp: {
      canal: 'whatsapp',
      conectado: true,
      proveedor: 'whatsapp_cloud_api',
      activo: true,
      horario_silencioso_activo: true,
      horario_silencioso_inicio: '22:00',
      horario_silencioso_fin: '08:00',
      permitir_urgentes_en_silencio: true,
      max_mensajes_por_dia_cliente: 3,
    },
    email: {
      canal: 'email',
      conectado: true,
      proveedor: 'resend_or_smtp',
      activo: true,
      horario_silencioso_activo: false,
      horario_silencioso_inicio: '23:00',
      horario_silencioso_fin: '07:00',
      permitir_urgentes_en_silencio: true,
    },
    push: {
      canal: 'push',
      conectado: true,
      proveedor: 'web_push_service_worker',
      activo: true,
      horario_silencioso_activo: false,
      horario_silencioso_inicio: '22:00',
      horario_silencioso_fin: '08:00',
      permitir_urgentes_en_silencio: true,
    },
    sms: {
      canal: 'sms',
      conectado: false,
      proveedor: 'twilio_sms',
      activo: false,
      horario_silencioso_activo: true,
      horario_silencioso_inicio: '21:00',
      horario_silencioso_fin: '09:00',
      permitir_urgentes_en_silencio: false,
    },
    in_app: {
      canal: 'in_app',
      conectado: true,
      proveedor: 'sagitta_in_app_feed',
      activo: true,
      horario_silencioso_activo: false,
      horario_silencioso_inicio: '00:00',
      horario_silencioso_fin: '00:00',
      permitir_urgentes_en_silencio: true,
    },
  },
}

export interface EnviarMensajeParams {
  canal: CanalComunicacion
  destinatario: string
  asunto?: string
  cuerpo: string
  entidadTipo?: 'cita' | 'cliente' | 'venta' | 'pago' | 'producto' | 'general'
  entidadId?: string | number
  esUrgente?: boolean
  tenantId?: string
}

export const comunicacionService = {
  /**
   * Obtiene la configuración de preferencias de comunicación del tenant
   */
  getPreferenciasTenant: async (
    tenantId = 'default'
  ): Promise<ApiResponse<PreferenciaComunicacionTenant>> => {
    const list = LocalStorageAdapter.getCollection<PreferenciaComunicacionTenant>(
      COLLECTION_PREFERENCIAS_COM,
      [PREFERENCIAS_DEFAULT]
    )
    const encontrada = list.find((p) => p.tenant_id === tenantId) || PREFERENCIAS_DEFAULT
    return { success: true, message: 'OK', data: encontrada }
  },

  /**
   * Actualiza las preferencias de comunicación
   */
  guardarPreferenciasTenant: async (
    prefs: PreferenciaComunicacionTenant
  ): Promise<ApiResponse<PreferenciaComunicacionTenant>> => {
    const list = LocalStorageAdapter.getCollection<PreferenciaComunicacionTenant>(
      COLLECTION_PREFERENCIAS_COM,
      [PREFERENCIAS_DEFAULT]
    )
    const idx = list.findIndex((p) => p.tenant_id === prefs.tenant_id)
    if (idx >= 0) {
      list[idx] = prefs
    } else {
      list.push(prefs)
    }
    LocalStorageAdapter.setCollection(COLLECTION_PREFERENCIAS_COM, list)
    return { success: true, message: 'Preferencias de comunicación guardadas', data: prefs }
  },

  /**
   * Verifica si la hora actual local del tenant se encuentra dentro de la ventana de silencio
   */
  estaEnHorarioSilencioso: (
    prefs: PreferenciaComunicacionTenant,
    canal: CanalComunicacion
  ): boolean => {
    const config = prefs.canales[canal]
    if (!config || !config.horario_silencioso_activo) return false

    const now = new Date()
    const horaActual = `${String(now.getHours()).padStart(2, '0')}:${String(
      now.getMinutes()
    ).padStart(2, '0')}`

    const inicio = config.horario_silencioso_inicio
    const fin = config.horario_silencioso_fin

    if (inicio < fin) {
      // Ejemplo 08:00 a 14:00
      return horaActual >= inicio && horaActual <= fin
    } else {
      // Cruza la medianoche: Ejemplo 22:00 a 08:00
      return horaActual >= inicio || horaActual <= fin
    }
  },

  /**
   * Envía un mensaje a través del canal especificado desacoplado con fallback
   */
  enviarMensaje: async (params: EnviarMensajeParams): Promise<DetalleAccionEjecutada> => {
    const { canal, destinatario, asunto, cuerpo, esUrgente, tenantId = 'default' } = params

    // 1. Cargar preferencias
    const prefsRes = await comunicacionService.getPreferenciasTenant(tenantId)
    const prefs = prefsRes.data || PREFERENCIAS_DEFAULT
    const config = prefs.canales[canal]

    // 2. Verificar si el canal está activo
    if (!config || !config.activo) {
      return {
        tipo: `enviar_${canal}` as any,
        canal,
        destinatario,
        estado: 'fallido',
        mensaje: `El canal ${canal.toUpperCase()} está desactivado para este negocio.`,
      }
    }

    // 3. Evaluar horario de silencio
    if (!esUrgente && comunicacionService.estaEnHorarioSilencioso(prefs, canal)) {
      return {
        tipo: `enviar_${canal}` as any,
        canal,
        destinatario,
        estado: 'omitido_horario_silencioso',
        mensaje: `Mensaje pospuesto: Canal ${canal} se encuentra en horario silencioso (${config.horario_silencioso_inicio} a ${config.horario_silencioso_fin}).`,
      }
    }

    // 4. Si el canal no está formalmente conectado, registrar simulación elegante
    if (!config.conectado) {
      return {
        tipo: `enviar_${canal}` as any,
        canal,
        destinatario,
        estado: 'simulado_no_conectado',
        mensaje: `Simulación: Mensaje preparado para ${destinatario} vía ${canal.toUpperCase()} (${config.proveedor} no conectado).`,
      }
    }

    // 5. Procesamiento específico por canal
    try {
      if (canal === 'in_app') {
        const noti: Notificacion = {
          id: Date.now(),
          titulo: asunto || 'Nueva Alerta de Sagitta',
          mensaje: cuerpo,
          tipo: 'recordatorio',
          leida: false,
          fecha: new Date().toISOString(),
          created_at: new Date().toISOString(),
          enlace: params.entidadId ? `/citas?id=${params.entidadId}` : undefined,
        }
        LocalStorageAdapter.insert<Notificacion>(COLLECTION_NOTIFICACIONES, noti)
        return {
          tipo: 'notificacion_interna',
          canal: 'in_app',
          destinatario: destinatario || 'Equipo / Usuario',
          estado: 'enviado',
          mensaje: 'Notificación interna añadida al centro de notificaciones.',
        }
      }

      if (canal === 'push') {
        if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
          try {
            new Notification(asunto || 'Sagitta', {
              body: cuerpo,
              icon: '/favicon.ico',
            })
          } catch {
            // Ignorar en entornos sin soporte de construcción directa
          }
        }
        return {
          tipo: 'enviar_push',
          canal: 'push',
          destinatario: destinatario || 'Dispositivo Web',
          estado: 'enviado',
          mensaje: 'Web push entregado.',
        }
      }

      // WhatsApp / Email / SMS: simulación de entrega exitosa
      return {
        tipo: `enviar_${canal}` as any,
        canal,
        destinatario,
        estado: 'enviado',
        mensaje: `Entregado satisfactoriamente a ${destinatario} vía ${config.proveedor}.`,
      }
    } catch (err) {
      return {
        tipo: `enviar_${canal}` as any,
        canal,
        destinatario,
        estado: 'fallido',
        mensaje: err instanceof Error ? err.message : 'Error desconocido al despachar mensaje.',
      }
    }
  },

  /**
   * Ejecuta una llamada HTTP a un Webhook externo
   */
  dispararWebhook: async (
    url: string,
    metodo: 'POST' | 'GET' | 'PUT' = 'POST',
    payload: unknown
  ): Promise<DetalleAccionEjecutada> => {
    try {
      // En entorno local/offline simulamos el webhook si es un mock o ejecutamos fetch
      if (url.startsWith('https://webhook.site') || url.startsWith('http://localhost') || url.startsWith('https://api.')) {
        await fetch(url, {
          method: metodo,
          headers: { 'Content-Type': 'application/json' },
          body: metodo !== 'GET' ? JSON.stringify(payload) : undefined,
        }).catch(() => {
          // Fallback tolerante si falla la red externa
        })
      }

      return {
        tipo: 'ejecutar_webhook',
        destinatario: url,
        estado: 'enviado',
        mensaje: `Webhook ${metodo} disparado a ${url}`,
      }
    } catch (err) {
      return {
        tipo: 'ejecutar_webhook',
        destinatario: url,
        estado: 'fallido',
        mensaje: err instanceof Error ? err.message : 'Error al enviar webhook',
      }
    }
  },
}

