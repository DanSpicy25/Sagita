import { useState, useEffect } from 'react'
import { Zap, Plus, Trash2, ChevronRight, Clock, Bell } from 'lucide-react'
import {
  ReglaAutomatizacion,
  TipoTriggerAutomatizacion,
  TipoAccionAutomatizacion,
  AccionAutomatizacion,
  CondicionAutomatizacion,
  CanalComunicacion,
} from '@/types'
import { Modal, Button, Input, Select } from '@/components/ui'
import { useToast } from '@/hooks/useToast'
import { automatizacionesService } from '@/services/automatizaciones.service'

interface ModalEditorAutomatizacionProps {
  isOpen: boolean
  onClose: () => void
  regla?: ReglaAutomatizacion | null
  onSaved?: () => void
}

// ─── Catálogos ──────────────────────────────────────────────────────────────

const TRIGGER_OPTIONS: { value: TipoTriggerAutomatizacion; label: string }[] = [
  { value: 'reserva_creada', label: 'Reserva Creada' },
  { value: 'reserva_confirmada', label: 'Reserva Confirmada' },
  { value: 'reserva_cancelada', label: 'Reserva Cancelada' },
  { value: 'reserva_reprogramada', label: 'Reserva Reprogramada' },
  { value: 'recordatorio_pendiente', label: 'Recordatorio Pendiente' },
  { value: 'cliente_creado', label: 'Nuevo Cliente' },
  { value: 'venta_completada', label: 'Venta Completada' },
  { value: 'pago_recibido', label: 'Pago Recibido' },
  { value: 'no_show', label: 'No Show' },
  { value: 'cumpleanos', label: 'Cumpleaños del cliente' },
  { value: 'stock_bajo', label: 'Stock Bajo' },
]

const TIPO_ACCION_OPTIONS: { value: TipoAccionAutomatizacion; label: string }[] = [
  { value: 'enviar_email', label: 'Enviar Email' },
  { value: 'enviar_whatsapp', label: 'Enviar WhatsApp' },
  { value: 'enviar_sms', label: 'Enviar SMS' },
  { value: 'notificacion_interna', label: 'Notificación Interna' },
  { value: 'enviar_push', label: 'Push Notification' },
  { value: 'ejecutar_webhook', label: 'Ejecutar Webhook' },
  { value: 'crear_tarea', label: 'Crear Tarea' },
  { value: 'aplicar_etiqueta', label: 'Aplicar Etiqueta' },
]

const CANAL_OPTIONS: { value: CanalComunicacion; label: string }[] = [
  { value: 'email', label: 'Email' },
  { value: 'whatsapp', label: 'WhatsApp' },
  { value: 'sms', label: 'SMS' },
  { value: 'push', label: 'Push' },
  { value: 'in_app', label: 'In-App' },
]

const DESTINATARIO_OPTIONS = [
  { value: 'cliente', label: 'Cliente' },
  { value: 'profesional', label: 'Profesional asignado' },
  { value: 'admin', label: 'Administrador' },
  { value: 'custom', label: 'Personalizado' },
  { value: 'webhook_url', label: 'URL del Webhook' },
]

const MENSAJES_CANALES: TipoAccionAutomatizacion[] = [
  'enviar_email',
  'enviar_whatsapp',
  'enviar_sms',
  'notificacion_interna',
  'enviar_push',
]

// ─── Helpers ────────────────────────────────────────────────────────────────

const accionVacia = (): AccionAutomatizacion => ({
  id: `accion_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
  tipo: 'enviar_email',
  canal: 'email',
  destinatario_tipo: 'cliente',
  delay_minutos: 0,
})

// ─── Componente ─────────────────────────────────────────────────────────────

export function ModalEditorAutomatizacion({
  isOpen,
  onClose,
  regla,
  onSaved,
}: ModalEditorAutomatizacionProps) {
  const { toast } = useToast()

  const [nombre, setNombre] = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [trigger, setTrigger] = useState<TipoTriggerAutomatizacion>('reserva_creada')
  const [condiciones] = useState<CondicionAutomatizacion[]>([])
  const [acciones, setAcciones] = useState<AccionAutomatizacion[]>([accionVacia()])
  const [activo, setActivo] = useState(true)
  const [guardando, setGuardando] = useState(false)

  useEffect(() => {
    if (regla) {
      setNombre(regla.nombre)
      setDescripcion(regla.descripcion || '')
      setTrigger(regla.trigger)
      setAcciones(regla.acciones.length ? regla.acciones : [accionVacia()])
      setActivo(regla.activo)
    } else {
      setNombre('')
      setDescripcion('')
      setTrigger('reserva_creada')
      setAcciones([accionVacia()])
      setActivo(true)
    }
  }, [regla, isOpen])

  const agregarAccion = () => setAcciones((prev) => [...prev, accionVacia()])

  const actualizarAccion = (idx: number, patch: Partial<AccionAutomatizacion>) => {
    setAcciones((prev) => prev.map((a, i) => (i === idx ? { ...a, ...patch } : a)))
  }

  const eliminarAccion = (idx: number) => {
    setAcciones((prev) => prev.filter((_, i) => i !== idx))
  }

  const handleGuardar = async () => {
    if (!nombre.trim()) {
      toast.error('Campo requerido', 'El nombre de la automatización es obligatorio')
      return
    }
    if (acciones.length === 0) {
      toast.error('Sin acciones', 'Agrega al menos una acción para continuar')
      return
    }
    setGuardando(true)
    try {
      const payload: Partial<ReglaAutomatizacion> = {
        nombre: nombre.trim(),
        descripcion: descripcion.trim() || undefined,
        trigger,
        condiciones,
        acciones,
        activo,
      }
      if (regla?.id) {
        await automatizacionesService.actualizarRegla(regla.id, payload)
        toast.success('Automatización actualizada', `"${nombre}" guardada correctamente`)
      } else {
        await automatizacionesService.crearRegla(payload)
        toast.success('Automatización creada', `"${nombre}" está activa y lista`)
      }
      onSaved?.()
      onClose()
    } catch (err) {
      toast.error('Error al guardar', err instanceof Error ? err.message : 'Intenta nuevamente')
    } finally {
      setGuardando(false)
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={regla ? `Editar: ${regla.nombre}` : 'Nueva Automatización'}
      size="xl"
    >
      <div className="space-y-6 pb-2">

        {/* Info general */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
            <Zap className="w-4 h-4 text-violet-500" />
            Información General
          </h3>
          <Input
            label="Nombre"
            placeholder="Ej: Recordatorio 24h antes de cita"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
          />
          <Input
            label="Descripción (opcional)"
            placeholder="Breve descripción del propósito de esta automatización"
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
          />
        </div>

        {/* Trigger */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
            <ChevronRight className="w-4 h-4 text-emerald-500" />
            Disparador (Trigger)
          </h3>
          <Select
            label="¿Cuándo se activa?"
            value={trigger}
            options={TRIGGER_OPTIONS}
            onChange={(e) => setTrigger(e.target.value as TipoTriggerAutomatizacion)}
          />
        </div>

        {/* Acciones */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
              <Bell className="w-4 h-4 text-blue-500" />
              Acciones ({acciones.length})
            </h3>
            <Button variant="ghost" size="sm" onClick={agregarAccion}>
              <Plus className="w-3.5 h-3.5 mr-1" />
              Añadir acción
            </Button>
          </div>

          <div className="space-y-3">
            {acciones.map((accion, idx) => (
              <div
                key={accion.id}
                className="border border-slate-200 dark:border-slate-700 rounded-lg p-4 space-y-3 bg-slate-50 dark:bg-slate-800/50"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                    Acción #{idx + 1}
                  </span>
                  {acciones.length > 1 && (
                    <button
                      onClick={() => eliminarAccion(idx)}
                      className="text-red-400 hover:text-red-600 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <Select
                    label="Tipo de acción"
                    value={accion.tipo}
                    options={TIPO_ACCION_OPTIONS}
                    onChange={(e) =>
                      actualizarAccion(idx, { tipo: e.target.value as TipoAccionAutomatizacion })
                    }
                  />
                  {MENSAJES_CANALES.includes(accion.tipo) && (
                    <Select
                      label="Canal"
                      value={accion.canal || 'email'}
                      options={CANAL_OPTIONS}
                      onChange={(e) =>
                        actualizarAccion(idx, { canal: e.target.value as CanalComunicacion })
                      }
                    />
                  )}
                </div>

                <Select
                  label="Destinatario"
                  value={accion.destinatario_tipo}
                  options={DESTINATARIO_OPTIONS}
                  onChange={(e) =>
                    actualizarAccion(idx, {
                      destinatario_tipo: e.target.value as AccionAutomatizacion['destinatario_tipo'],
                    })
                  }
                />

                {accion.destinatario_tipo === 'custom' && (
                  <Input
                    label="Email / Teléfono personalizado"
                    placeholder="email@ejemplo.com o +1 555-0000"
                    value={accion.destinatario_custom || ''}
                    onChange={(e) => actualizarAccion(idx, { destinatario_custom: e.target.value })}
                  />
                )}

                {accion.tipo === 'ejecutar_webhook' && (
                  <Input
                    label="URL del Webhook"
                    placeholder="https://tu-api.com/webhook"
                    value={accion.webhook_url || ''}
                    onChange={(e) => actualizarAccion(idx, { webhook_url: e.target.value })}
                  />
                )}

                {MENSAJES_CANALES.includes(accion.tipo) && (
                  <div>
                    <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                      Mensaje / Plantilla
                    </label>
                    <textarea
                      rows={3}
                      className="w-full text-sm border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 placeholder-slate-400 resize-none focus:outline-none focus:ring-2 focus:ring-violet-500/40"
                      placeholder="Hola {{client.first_name}}, tu cita es el {{appointment.date}} a las {{appointment.time}}."
                      value={accion.plantilla_cuerpo_custom || ''}
                      onChange={(e) =>
                        actualizarAccion(idx, { plantilla_cuerpo_custom: e.target.value })
                      }
                    />
                  </div>
                )}

                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span>Delay:</span>
                  <input
                    type="number"
                    min={0}
                    className="w-20 border border-slate-200 dark:border-slate-700 rounded px-2 py-1 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 text-xs"
                    value={accion.delay_minutos || 0}
                    onChange={(e) =>
                      actualizarAccion(idx, { delay_minutos: Number(e.target.value) })
                    }
                  />
                  <span>minutos después del evento</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Estado */}
        <div className="flex items-center gap-3 pt-1">
          <input
            type="checkbox"
            id="estado-activo-modal"
            checked={activo}
            onChange={(e) => setActivo(e.target.checked)}
            className="w-4 h-4 accent-violet-600"
          />
          <label htmlFor="estado-activo-modal" className="text-sm text-slate-700 dark:text-slate-300">
            Automatización activa
          </label>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 pt-2 border-t border-slate-100 dark:border-slate-700">
          <Button variant="ghost" onClick={onClose} disabled={guardando}>
            Cancelar
          </Button>
          <Button variant="primary" onClick={handleGuardar} isLoading={guardando}>
            {regla ? 'Guardar Cambios' : 'Crear Automatización'}
          </Button>
        </div>
      </div>
    </Modal>
  )
}
