import {
  TipoTriggerAutomatizacion,
  ReglaAutomatizacion,
  CondicionAutomatizacion,
  ContextoEventoAutomatizacion,
  EjecucionLogAutomatizacion,
  DetalleAccionEjecutada,
  CanalComunicacion,
} from '@/types'
import { LocalStorageAdapter } from '@/repositories/local/LocalStorageAdapter'
import { renderizarPlantilla } from '@/utils/templateEngine'
import { comunicacionService } from './comunicacion.service'

export const COLLECTION_REGLAS = 'automatizaciones_reglas'
export const COLLECTION_LOGS = 'automatizaciones_logs'

export const SEED_REGLAS: ReglaAutomatizacion[] = [
  {
    id: 1,
    nombre: 'Confirmación Automática de Cita',
    descripcion: 'Envía confirmación con fecha, hora y especialista vía WhatsApp y Email al crearse una reserva.',
    trigger: 'reserva_creada',
    activo: true,
    condiciones: [],
    acciones: [
      {
        id: 'acc-1a',
        tipo: 'enviar_whatsapp',
        canal: 'whatsapp',
        destinatario_tipo: 'cliente',
        plantilla_cuerpo_custom:
          '¡Hola {{client.first_name}}! Tu cita para {{service.name}} ha sido agendada con éxito para el {{appointment.date}} a las {{appointment.time}} con {{staff.name}}. En {{business.name}} te esperamos.',
      },
      {
        id: 'acc-1b',
        tipo: 'enviar_email',
        canal: 'email',
        destinatario_tipo: 'cliente',
        asunto: 'Confirmación de tu reserva - {{service.name}}',
        plantilla_cuerpo_custom:
          'Estimado(a) {{client.name}}, tu reserva para {{service.name}} el {{appointment.date}} a las {{appointment.time}} ha sido confirmada.',
      },
      {
        id: 'acc-1c',
        tipo: 'notificacion_interna',
        canal: 'in_app',
        destinatario_tipo: 'profesional',
        plantilla_cuerpo_custom:
          'Nueva reserva agendada: {{client.name}} para {{service.name}} el {{appointment.date}} a las {{appointment.time}}.',
      },
    ],
    ejecuciones_totales: 24,
    ultima_ejecucion: new Date(Date.now() - 3600000 * 4).toISOString(),
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z',
  },
  {
    id: 2,
    nombre: 'Recordatorio Preventivo de Cita (24h antes)',
    descripcion: 'Recuerda al cliente su cita agendada para evitar olvidos o inasistencias.',
    trigger: 'recordatorio_pendiente',
    activo: true,
    condiciones: [],
    acciones: [
      {
        id: 'acc-2a',
        tipo: 'enviar_whatsapp',
        canal: 'whatsapp',
        destinatario_tipo: 'cliente',
        plantilla_cuerpo_custom:
          'Hola {{client.first_name}}, te recordamos tu cita de mañana {{appointment.date}} a las {{appointment.time}} en {{business.name}}. Si requieres reprogramar, escríbenos.',
      },
      {
        id: 'acc-2b',
        tipo: 'enviar_push',
        canal: 'push',
        destinatario_tipo: 'cliente',
        asunto: 'Recordatorio de cita mañana',
        plantilla_cuerpo_custom:
          'Tu cita de {{service.name}} es mañana a las {{appointment.time}}.',
      },
    ],
    ejecuciones_totales: 58,
    ultima_ejecucion: new Date(Date.now() - 3600000 * 2).toISOString(),
    created_at: '2026-01-02T00:00:00Z',
    updated_at: '2026-01-02T00:00:00Z',
  },
  {
    id: 3,
    nombre: 'Aviso Inmediato por Cancelación de Cita',
    descripcion: 'Notifica al especialista y envía correo informativo al cliente cuando se cancela una cita.',
    trigger: 'reserva_cancelada',
    activo: true,
    condiciones: [],
    acciones: [
      {
        id: 'acc-3a',
        tipo: 'notificacion_interna',
        canal: 'in_app',
        destinatario_tipo: 'profesional',
        asunto: 'Cita Cancelada',
        plantilla_cuerpo_custom:
          'La cita de {{client.name}} programada para {{appointment.date}} {{appointment.time}} ha sido cancelada.',
      },
      {
        id: 'acc-3b',
        tipo: 'enviar_email',
        canal: 'email',
        destinatario_tipo: 'cliente',
        asunto: 'Cancelación confirmada de tu reserva',
        plantilla_cuerpo_custom:
          'Hola {{client.first_name}}, confirmamos que tu cita para {{service.name}} ha sido cancelada. Esperamos recibirte pronto.',
      },
    ],
    ejecuciones_totales: 6,
    ultima_ejecucion: new Date(Date.now() - 3600000 * 24).toISOString(),
    created_at: '2026-01-05T00:00:00Z',
    updated_at: '2026-01-05T00:00:00Z',
  },
  {
    id: 4,
    nombre: 'Recuperación de Cliente No-Show',
    descripcion: 'Envía un mensaje cordial invitando a reagendar tras una inasistencia.',
    trigger: 'no_show',
    activo: true,
    condiciones: [],
    acciones: [
      {
        id: 'acc-4a',
        tipo: 'enviar_whatsapp',
        canal: 'whatsapp',
        destinatario_tipo: 'cliente',
        plantilla_cuerpo_custom:
          'Hola {{client.first_name}}, lamentamos no haberte visto hoy en tu cita de {{service.name}}. Queremos ayudarte a reagendar tu sesión cuando gustes.',
      },
    ],
    ejecuciones_totales: 2,
    created_at: '2026-01-10T00:00:00Z',
    updated_at: '2026-01-10T00:00:00Z',
  },
  {
    id: 5,
    nombre: 'Bienvenida a Nuevos Clientes',
    descripcion: 'Envía mensaje de bienvenida y presentación de servicios al registrarse un nuevo cliente.',
    trigger: 'cliente_creado',
    activo: true,
    condiciones: [],
    acciones: [
      {
        id: 'acc-5a',
        tipo: 'enviar_email',
        canal: 'email',
        destinatario_tipo: 'cliente',
        asunto: '¡Bienvenido(a) a {{business.name}}!',
        plantilla_cuerpo_custom:
          '¡Hola {{client.first_name}}! Gracias por formar parte de la comunidad de {{business.name}}. Estamos a tu disposición para agendar tus experiencias y tratamientos favoritos.',
      },
    ],
    ejecuciones_totales: 15,
    created_at: '2026-01-15T00:00:00Z',
    updated_at: '2026-01-15T00:00:00Z',
  },
  {
    id: 6,
    nombre: 'Recibo Digital tras Compra / Venta en POS',
    descripcion: 'Envía comprobante digital y mensaje de agradecimiento cuando se completa una venta o cobro.',
    trigger: 'venta_completada',
    activo: true,
    condiciones: [],
    acciones: [
      {
        id: 'acc-6a',
        tipo: 'enviar_email',
        canal: 'email',
        destinatario_tipo: 'cliente',
        asunto: 'Comprobante de compra {{sale.number}} - {{business.name}}',
        plantilla_cuerpo_custom:
          'Hola {{client.name}}, gracias por tu compra. Tu comprobante número {{sale.number}} por un total de {{sale.total}} ha sido procesado con éxito.',
      },
    ],
    ejecuciones_totales: 31,
    created_at: '2026-02-01T00:00:00Z',
    updated_at: '2026-02-01T00:00:00Z',
  },
  {
    id: 7,
    nombre: 'Alerta de Stock Crítico / Bajo',
    descripcion: 'Genera notificación interna urgente al equipo de almacén cuando un producto alcanza su stock mínimo.',
    trigger: 'stock_bajo',
    activo: true,
    condiciones: [],
    acciones: [
      {
        id: 'acc-7a',
        tipo: 'notificacion_interna',
        canal: 'in_app',
        destinatario_tipo: 'admin',
        asunto: 'Stock Crítico Detectado',
        plantilla_cuerpo_custom:
          'El producto "{{product.name}}" (SKU: {{product.sku}}) ha alcanzado su nivel mínimo de existencias. Stock restante: {{product.stock}}.',
      },
    ],
    ejecuciones_totales: 5,
    created_at: '2026-02-10T00:00:00Z',
    updated_at: '2026-02-10T00:00:00Z',
  },
  {
    id: 8,
    nombre: 'Webhook a CRM Externo al Confirmar Cita',
    descripcion: 'Envía el payload completo de la cita y cliente hacia sistemas externos.',
    trigger: 'reserva_confirmada',
    activo: false,
    condiciones: [],
    acciones: [
      {
        id: 'acc-8a',
        tipo: 'ejecutar_webhook',
        destinatario_tipo: 'webhook_url',
        webhook_url: 'https://webhook.site/sagitta-events',
        webhook_metodo: 'POST',
      },
    ],
    ejecuciones_totales: 0,
    created_at: '2026-02-20T00:00:00Z',
    updated_at: '2026-02-20T00:00:00Z',
  },
]

export const automationEngine = {
  /**
   * Evalúa una condición individual contra el contexto del evento
   */
  evaluarCondicion: (
    condicion: CondicionAutomatizacion,
    contexto: ContextoEventoAutomatizacion
  ): boolean => {
    let valorActual: unknown = undefined

    switch (condicion.campo) {
      case 'tenant_id':
        valorActual = contexto.tenant_id
        break
      case 'sucursal_id':
        valorActual = contexto.sucursal_id || contexto.cita?.ubicacion_id
        break
      case 'servicio_id':
        valorActual = contexto.servicio?.id || contexto.cita?.servicio_id
        break
      case 'empleado_id':
        valorActual = contexto.empleado?.id || contexto.cita?.empleado_id
        break
      case 'cliente_id':
        valorActual = contexto.cliente?.id || contexto.cita?.cliente_id
        break
      case 'estado':
        valorActual = contexto.cita?.estado || contexto.venta?.estado
        break
      case 'monto_minimo':
        valorActual = contexto.venta?.total || contexto.pago?.monto || 0
        break
      case 'etiquetas':
        valorActual = contexto.etiquetas || []
        break
      case 'horario_inicio':
      case 'horario_fin': {
        const fi = contexto.cita?.fecha_inicio
        valorActual =
          fi && fi.includes('T')
            ? fi.split('T')[1].slice(0, 5)
            : fi && fi.includes(' ')
            ? fi.split(' ')[1].slice(0, 5)
            : contexto.cita?.hora || ''
        break
      }
      default:
        return true
    }

    const { operador, valor } = condicion

    switch (operador) {
      case 'igual':
        return String(valorActual).toLowerCase() === String(valor).toLowerCase()
      case 'no_igual':
        return String(valorActual).toLowerCase() !== String(valor).toLowerCase()
      case 'contiene':
        if (Array.isArray(valorActual)) {
          return valorActual.map(String).includes(String(valor))
        }
        return String(valorActual).toLowerCase().includes(String(valor).toLowerCase())
      case 'no_contiene':
        if (Array.isArray(valorActual)) {
          return !valorActual.map(String).includes(String(valor))
        }
        return !String(valorActual).toLowerCase().includes(String(valor).toLowerCase())
      case 'mayor_que':
        return Number(valorActual) > Number(valor)
      case 'menor_que':
        return Number(valorActual) < Number(valor)
      case 'entre':
        if (Array.isArray(valor) && valor.length === 2) {
          const num = Number(valorActual)
          return num >= Number(valor[0]) && num <= Number(valor[1])
        }
        return true
      default:
        return true
    }
  },

  /**
   * Dispara un evento en el motor de automatizaciones, ejecutando las reglas coincidentes
   */
  dispararTrigger: async (
    trigger: TipoTriggerAutomatizacion,
    contexto: ContextoEventoAutomatizacion
  ): Promise<EjecucionLogAutomatizacion[]> => {
    const reglas = LocalStorageAdapter.getCollection<ReglaAutomatizacion>(
      COLLECTION_REGLAS,
      SEED_REGLAS
    )

    // Filtrar reglas que escuchen este trigger y estén activas
    const reglasCoincidentes = reglas.filter((r) => r.activo && r.trigger === trigger)
    const logsGenerados: EjecucionLogAutomatizacion[] = []

    for (const regla of reglasCoincidentes) {
      // 1. Evaluar condiciones
      let cumpleTodas = true
      for (const cond of regla.condiciones) {
        if (!automationEngine.evaluarCondicion(cond, contexto)) {
          cumpleTodas = false
          break
        }
      }

      if (!cumpleTodas) {
        continue
      }

      // 2. Ejecutar acciones
      const accionesEjecutadas: DetalleAccionEjecutada[] = []
      const cliente = contexto.cliente || contexto.cita?.cliente
      const empleado = contexto.empleado || contexto.cita?.empleado

      for (const accion of regla.acciones) {
        try {
          // Resolver destinatario
          let destino = ''
          if (accion.destinatario_tipo === 'cliente') {
            destino = accion.canal === 'email' ? cliente?.email || '' : cliente?.telefono || ''
          } else if (accion.destinatario_tipo === 'profesional') {
            destino = accion.canal === 'email' ? empleado?.email || '' : empleado?.telefono || ''
          } else if (accion.destinatario_tipo === 'webhook_url') {
            destino = accion.webhook_url || ''
          } else {
            destino = accion.destinatario_custom || 'General'
          }

          // Resolver texto con variables
          const cuerpoFinal = renderizarPlantilla(
            accion.plantilla_cuerpo_custom || '',
            contexto
          )
          const asuntoFinal = accion.asunto
            ? renderizarPlantilla(accion.asunto, contexto)
            : undefined

          if (accion.tipo === 'ejecutar_webhook') {
            const url = accion.webhook_url || 'https://webhook.site/sagitta-events'
            const resWh = await comunicacionService.dispararWebhook(
              url,
              accion.webhook_metodo || 'POST',
              {
                trigger,
                regla: regla.nombre,
                contexto,
                timestamp: new Date().toISOString(),
              }
            )
            accionesEjecutadas.push(resWh)
          } else if (accion.tipo === 'notificacion_interna') {
            const resNoti = await comunicacionService.enviarMensaje({
              canal: 'in_app',
              destinatario: destino || 'Equipo Sagitta',
              asunto: asuntoFinal,
              cuerpo: cuerpoFinal,
              entidadTipo: contexto.cita ? 'cita' : contexto.venta ? 'venta' : 'general',
              entidadId: contexto.cita?.id || contexto.venta?.id,
            })
            accionesEjecutadas.push(resNoti)
          } else if (accion.canal) {
            const resMsg = await comunicacionService.enviarMensaje({
              canal: accion.canal as CanalComunicacion,
              destinatario: destino,
              asunto: asuntoFinal,
              cuerpo: cuerpoFinal,
              entidadTipo: contexto.cita ? 'cita' : contexto.venta ? 'venta' : 'general',
              entidadId: contexto.cita?.id || contexto.venta?.id,
            })
            accionesEjecutadas.push(resMsg)
          }
        } catch (err) {
          accionesEjecutadas.push({
            tipo: accion.tipo,
            canal: accion.canal,
            destinatario: 'Error',
            estado: 'fallido',
            mensaje: err instanceof Error ? err.message : 'Error desconocido',
          })
        }
      }

      // 3. Actualizar contadores de la regla
      regla.ejecuciones_totales = (regla.ejecuciones_totales || 0) + 1
      regla.ultima_ejecucion = new Date().toISOString()
      LocalStorageAdapter.update<ReglaAutomatizacion>(COLLECTION_REGLAS, regla.id, {
        ejecuciones_totales: regla.ejecuciones_totales,
        ultima_ejecucion: regla.ultima_ejecucion,
      })

      // 4. Registrar auditoría de ejecución
      const log: EjecucionLogAutomatizacion = {
        id: `exec-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        regla_id: regla.id,
        regla_nombre: regla.nombre,
        trigger,
        exito: accionesEjecutadas.every((a) => a.estado !== 'fallido'),
        detalles: `Regla "${regla.nombre}" procesada. ${accionesEjecutadas.length} acciones ejecutadas.`,
        fecha: new Date().toISOString(),
        entidad_tipo: contexto.cita
          ? 'cita'
          : contexto.venta
          ? 'venta'
          : contexto.cliente
          ? 'cliente'
          : 'general',
        entidad_id: contexto.cita?.id || contexto.venta?.id || contexto.cliente?.id,
        acciones_ejecutadas: accionesEjecutadas,
      }

      LocalStorageAdapter.insert<EjecucionLogAutomatizacion>(COLLECTION_LOGS, log)
      logsGenerados.push(log)
    }

    return logsGenerados
  },

  /**
   * Ejecuta una prueba/simulación de una regla individual usando un contexto
   */
  simularRegla: async (
    regla: ReglaAutomatizacion,
    contexto: ContextoEventoAutomatizacion
  ): Promise<EjecucionLogAutomatizacion> => {
    const accionesEjecutadas: DetalleAccionEjecutada[] = []
    const cliente = contexto.cliente || contexto.cita?.cliente
    const empleado = contexto.empleado || contexto.cita?.empleado

    for (const accion of regla.acciones) {
      let destino = ''
      if (accion.destinatario_tipo === 'cliente') {
        destino = accion.canal === 'email' ? cliente?.email || '' : cliente?.telefono || ''
      } else if (accion.destinatario_tipo === 'profesional') {
        destino = accion.canal === 'email' ? empleado?.email || '' : empleado?.telefono || ''
      } else if (accion.destinatario_tipo === 'webhook_url') {
        destino = accion.webhook_url || ''
      } else {
        destino = accion.destinatario_custom || 'Prueba'
      }

      const cuerpo = renderizarPlantilla(accion.plantilla_cuerpo_custom || '', contexto)

      if (accion.tipo === 'ejecutar_webhook') {
        accionesEjecutadas.push({
          tipo: 'ejecutar_webhook',
          destinatario: accion.webhook_url || 'https://webhook.site/test',
          estado: 'enviado',
          mensaje: `(Simulación) Webhook ${accion.webhook_metodo || 'POST'} verificado correctamente`,
        })
      } else {
        accionesEjecutadas.push({
          tipo: accion.tipo,
          canal: accion.canal,
          destinatario: destino,
          estado: 'enviado',
          mensaje: `(Simulación) Mensaje renderizado: "${cuerpo.slice(0, 80)}${
            cuerpo.length > 80 ? '...' : ''
          }"`,
        })
      }
    }

    const log: EjecucionLogAutomatizacion = {
      id: `sim-${Date.now()}`,
      regla_id: regla.id,
      regla_nombre: regla.nombre,
      trigger: regla.trigger,
      exito: true,
      detalles: `Simulación manual completada con éxito. ${accionesEjecutadas.length} acciones evaluadas.`,
      fecha: new Date().toISOString(),
      entidad_tipo: 'general',
      acciones_ejecutadas: accionesEjecutadas,
    }

    LocalStorageAdapter.insert<EjecucionLogAutomatizacion>(COLLECTION_LOGS, log)
    return log
  },
}

