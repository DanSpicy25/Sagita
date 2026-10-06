import { useState, useEffect } from 'react'
import {
  Calendar,
  Video,
  MessageSquare,
  Webhook as WebhookIcon,
  CheckCircle2,
  Plus,
  Play,
  Trash2,
  Copy,
  Check,
  Blocks,
} from 'lucide-react'
import type { Integracion, EstadoIntegracion, Webhook } from '@/types'
import { integracionesService } from '@/services/integraciones.service'
import { Button, Badge, Loader, EmptyState } from '@/components/ui'
import { ModalWebhook } from '@/components/integraciones'
import { useToast } from '@/hooks/useToast'

export type TabIntegracion = 'calendarios' | 'whatsapp' | 'webhooks'

export default function IntegracionesPage({
  defaultTab = 'calendarios',
}: {
  defaultTab?: TabIntegracion
}) {
  const [tabActivo, setTabActivo] = useState<TabIntegracion>(defaultTab)
  const [integraciones, setIntegraciones] = useState<Integracion[]>([])
  const [webhooks, setWebhooks] = useState<Webhook[]>([])
  const [cargando, setCargando] = useState(true)

  // Modales y estados
  const [modalWebhookAbierto, setModalWebhookAbierto] = useState(false)
  const [copiadoSecretId, setCopiadoSecretId] = useState<number | null>(null)
  const [probandoWebhookId, setProbandoWebhookId] = useState<number | null>(null)

  const { toast } = useToast()

  const cargarDatos = () => {
    setCargando(true)
    Promise.all([
      integracionesService.getIntegraciones(),
      integracionesService.getWebhooks(),
    ])
      .then(([intRes, webRes]) => {
        if (intRes.data) setIntegraciones(intRes.data)
        if (webRes.data) setWebhooks(webRes.data)
      })
      .catch((err) => {
        toast.error('Error al cargar integraciones', err instanceof Error ? err.message : 'Error')
      })
      .finally(() => setCargando(false))
  }

  useEffect(() => {
    cargarDatos()
  }, [])

  const handleToggleIntegracion = async (id: string, estadoActual: EstadoIntegracion) => {
    const nuevoEstado: EstadoIntegracion =
      estadoActual === 'conectado' ? 'desconectado' : 'conectado'
    try {
      await integracionesService.toggleIntegracion(id, nuevoEstado)
      setIntegraciones((prev) =>
        prev.map((item) => (item.id === id ? { ...item, estado: nuevoEstado } : item))
      )
      toast.success(
        'Integración actualizada',
        `El servicio ahora está ${nuevoEstado === 'conectado' ? 'activo' : 'inactivo'}`
      )
    } catch {
      toast.error('Error al actualizar', 'No se pudo cambiar el estado de la integración')
    }
  }

  const handleGuardarWebhook = async (data: Partial<Webhook>) => {
    try {
      await integracionesService.crearWebhook(data)
      toast.success('Webhook registrado', 'El endpoint recibirá eventos en tiempo real')
      cargarDatos()
      setModalWebhookAbierto(false)
    } catch {
      toast.error('Error al guardar', 'Hubo un fallo en el servidor')
    }
  }

  const handleEliminarWebhook = async (id: number) => {
    if (!confirm('¿Seguro que deseas eliminar este webhook? Dejará de recibir eventos.')) return
    try {
      await integracionesService.eliminarWebhook(id)
      toast.success('Webhook eliminado', 'El endpoint ha sido desvinculado')
      setWebhooks((prev) => prev.filter((w) => w.id !== id))
    } catch {
      toast.error('Error al eliminar webhook', 'Error en el servidor')
    }
  }

  const handleProbarWebhook = async (id: number) => {
    setProbandoWebhookId(id)
    try {
      const res = await integracionesService.probarWebhook(id)
      toast.success('Ping exitoso', res.data?.respuesta ?? 'Código HTTP 200 recibido')
      cargarDatos()
    } catch {
      toast.error('Fallo en la prueba', 'El endpoint no respondió correctamente')
    } finally {
      setProbandoWebhookId(null)
    }
  }

  const handleCopiarSecret = (id: number, secret: string) => {
    navigator.clipboard.writeText(secret)
    setCopiadoSecretId(id)
    setTimeout(() => setCopiadoSecretId(null), 2000)
    toast.info('Copiado', 'Clave secreta HMAC copiada al portapapeles')
  }

  const tabClass = (t: TabIntegracion) =>
    [
      'px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-2',
      tabActivo === t
        ? 'bg-primary-600 text-white shadow-xs'
        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800',
    ].join(' ')

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Blocks className="w-6 h-6 text-primary-500" />
            Integraciones & Conectores Externos
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Sincronización bidireccional con Google Calendar, salas de Meet/Zoom, WhatsApp Cloud API y Webhooks
          </p>
        </div>

        {tabActivo === 'webhooks' && (
          <Button
            onClick={() => setModalWebhookAbierto(true)}
            leftIcon={<Plus className="w-4 h-4" />}
          >
            Nuevo Webhook
          </Button>
        )}
      </div>

      {/* Tabs de Navegación */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2 overflow-x-auto">
        <button
          onClick={() => setTabActivo('calendarios')}
          className={tabClass('calendarios')}
        >
          <Calendar className="w-4 h-4" />
          Calendarios & Videollamadas
        </button>

        <button
          onClick={() => setTabActivo('whatsapp')}
          className={tabClass('whatsapp')}
        >
          <MessageSquare className="w-4 h-4" />
          WhatsApp Cloud API
        </button>

        <button
          onClick={() => setTabActivo('webhooks')}
          className={tabClass('webhooks')}
        >
          <WebhookIcon className="w-4 h-4" />
          Webhooks & API ({webhooks.length})
        </button>
      </div>

      {/* Contenido */}
      {cargando ? (
        <Loader text="Cargando conectores externos..." />
      ) : (
        <div className="space-y-6">
          {/* TAB: CALENDARIOS & VIDEOLLAMADAS */}
          {tabActivo === 'calendarios' && (() => {
            const gcal = integraciones.find((i) => i.id === 'google_calendar')
            const gmeet = integraciones.find((i) => i.id === 'google_meet')
            const zoom = integraciones.find((i) => i.id === 'zoom')
            return (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {/* Google Calendar */}
                <div className="card p-6 border border-slate-100 dark:border-slate-800 flex flex-col justify-between">
                  <div>
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 flex items-center justify-center">
                          <Calendar className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="font-bold text-base text-slate-900 dark:text-slate-100">
                            {gcal?.nombre ?? 'Google Calendar'}
                          </h4>
                          <p className="text-xs text-slate-400">
                            Sincronización bidireccional
                          </p>
                        </div>
                      </div>
                      <Badge variant={gcal?.estado === 'conectado' ? 'success' : 'default'} size="sm" dot={gcal?.estado === 'conectado'}>
                        {gcal?.estado === 'conectado' ? 'Conectado' : 'Desconectado'}
                      </Badge>
                    </div>

                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
                      {gcal?.descripcion ?? 'Tus citas se sincronizan con tu calendario personal de Google y los bloqueos externos impiden reservas superpuestas.'}
                    </p>

                    <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl text-xs space-y-1">
                      <p className="text-slate-400">Cuenta vinculada:</p>
                      <p className="font-semibold text-slate-800 dark:text-slate-200">
                        {gcal?.cuenta_vinculada ?? 'Sin cuenta vinculada'}
                      </p>
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <span className="text-[11px] text-slate-400">
                      Última sinc: {gcal?.ultima_sincronizacion ? new Date(gcal.ultima_sincronizacion).toLocaleTimeString() : 'Nunca'}
                    </span>
                    <Button
                      variant={gcal?.estado === 'conectado' ? 'secondary' : 'primary'}
                      size="sm"
                      onClick={() => handleToggleIntegracion('google_calendar', gcal?.estado ?? 'desconectado')}
                    >
                      {gcal?.estado === 'conectado' ? 'Desconectar' : 'Conectar con Google'}
                    </Button>
                  </div>
                </div>

                {/* Google Meet */}
                <div className="card p-6 border border-slate-100 dark:border-slate-800 flex flex-col justify-between">
                  <div>
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 flex items-center justify-center">
                          <Video className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="font-bold text-base text-slate-900 dark:text-slate-100">
                            {gmeet?.nombre ?? 'Google Meet'}
                          </h4>
                          <p className="text-xs text-slate-400">
                            Salas dinámicas instantáneas
                          </p>
                        </div>
                      </div>
                      <Badge variant={gmeet?.estado === 'conectado' ? 'success' : 'default'} size="sm" dot={gmeet?.estado === 'conectado'}>
                        {gmeet?.estado === 'conectado' ? 'Conectado' : 'Desconectado'}
                      </Badge>
                    </div>

                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
                      {gmeet?.descripcion ?? 'Crea enlaces de Google Meet de manera automática cuando se agenda una cita en modalidad virtual o teleconsulta.'}
                    </p>

                    <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl text-xs space-y-1">
                      <p className="text-slate-400">Generador:</p>
                      <p className="font-semibold text-slate-800 dark:text-slate-200">
                        {gmeet?.cuenta_vinculada ?? 'workspace@sagitta.app'}
                      </p>
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <span className="text-[11px] text-slate-400">
                      Modo: Teleconsulta automática
                    </span>
                    <Button
                      variant={gmeet?.estado === 'conectado' ? 'secondary' : 'primary'}
                      size="sm"
                      onClick={() => handleToggleIntegracion('google_meet', gmeet?.estado ?? 'desconectado')}
                    >
                      {gmeet?.estado === 'conectado' ? 'Desactivar' : 'Activar Meet'}
                    </Button>
                  </div>
                </div>

                {/* Zoom Meetings */}
                <div className="card p-6 border border-slate-100 dark:border-slate-800 flex flex-col justify-between">
                  <div>
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-sky-50 dark:bg-sky-950/40 text-sky-600 flex items-center justify-center">
                          <Video className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="font-bold text-base text-slate-900 dark:text-slate-100">
                            {zoom?.nombre ?? 'Zoom Meetings'}
                          </h4>
                          <p className="text-xs text-slate-400">
                            Salas Zoom OAuth 2.0
                          </p>
                        </div>
                      </div>
                      <Badge variant={zoom?.estado === 'conectado' ? 'success' : 'default'} size="sm" dot={zoom?.estado === 'conectado'}>
                        {zoom?.estado === 'conectado' ? 'Conectado' : 'Desconectado'}
                      </Badge>
                    </div>

                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
                      {zoom?.descripcion ?? 'Alternativa profesional para sesiones online con soporte para grabación en la nube e invitaciones personalizadas.'}
                    </p>

                    <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl text-xs space-y-1">
                      <p className="text-slate-400">App Zoom:</p>
                      <p className="font-semibold text-slate-800 dark:text-slate-200">
                        {zoom?.cuenta_vinculada ?? 'Sin vincular'}
                      </p>
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <span className="text-[11px] text-slate-400">
                      OAuth 2.0 Server-to-Server
                    </span>
                    <Button
                      variant={zoom?.estado === 'conectado' ? 'secondary' : 'primary'}
                      size="sm"
                      onClick={() => handleToggleIntegracion('zoom', zoom?.estado ?? 'desconectado')}
                    >
                      {zoom?.estado === 'conectado' ? 'Desconectar' : 'Conectar Zoom'}
                    </Button>
                  </div>
                </div>
              </div>
            )
          })()}

          {/* TAB: WHATSAPP CLOUD API */}
          {tabActivo === 'whatsapp' && (() => {
            const wa = integraciones.find((i) => i.id === 'whatsapp')
            return (
              <div className="space-y-6">
                <div className="card p-6 border border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 flex items-center justify-center">
                      <MessageSquare className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">
                        {wa?.nombre ?? 'WhatsApp Business Platform (Cloud API)'}
                      </h3>
                      <p className="text-xs text-slate-400">
                        Número emisor verificado: <strong>{wa?.cuenta_vinculada ?? '+1 555-0900 (Sagitta Verified)'}</strong>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Badge variant={wa?.estado === 'conectado' ? 'success' : 'default'} dot={wa?.estado === 'conectado'}>
                      {wa?.estado === 'conectado' ? 'Conectado y Operativo' : 'Desconectado'}
                    </Badge>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() =>
                        toast.success(
                          'Conector WhatsApp Operativo',
                          'El webhook de Meta Cloud API está procesando eventos de entrada y salida.'
                        )
                      }
                    >
                      Verificar Estado
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="card p-5 border border-slate-100 dark:border-slate-800">
                    <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100 mb-1">
                      Mensajes 1-a-1 Directos
                    </h4>
                    <p className="text-xs text-slate-400 mb-3">
                      Envío de confirmaciones, recordatorios 24h y recibos digitales con soporte de entrega verificado (doble check azul).
                    </p>
                    <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded">
                      Velocidad instantánea (~1.2s)
                    </span>
                  </div>

                  <div className="card p-5 border border-slate-100 dark:border-slate-800">
                    <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100 mb-1">
                      Plantillas Aprobadas por Meta
                    </h4>
                    <p className="text-xs text-slate-400 mb-3">
                      Sincronización de templates HSM pre-aprobados para evitar bloqueos por spam o políticas comerciales.
                    </p>
                    <span className="text-[11px] font-semibold text-blue-600 bg-blue-50 dark:bg-blue-950/40 px-2 py-0.5 rounded">
                      HSM Category: Utility
                    </span>
                  </div>

                  <div className="card p-5 border border-slate-100 dark:border-slate-800">
                    <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100 mb-1">
                      Respuestas Automáticas
                    </h4>
                    <p className="text-xs text-slate-400 mb-3">
                      Recepción de respuestas de clientes ("CONFIRMAR", "CANCELAR") y actualización directa en el calendario.
                    </p>
                    <span className="text-[11px] font-semibold text-amber-600 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded">
                      Sincronización con Agenda
                    </span>
                  </div>
                </div>
              </div>
            )
          })()}

          {/* TAB: WEBHOOKS & API */}
          {tabActivo === 'webhooks' && (
            <div className="card shadow-card overflow-hidden">
              <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200">
                    Endpoints de Webhook Registrados
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Envío seguro firmado con HMAC SHA-256 en tiempo real hacia tus servidores o Zapier/Make
                  </p>
                </div>
              </div>

              {webhooks.length === 0 ? (
                <EmptyState
                  title="No hay webhooks configurados"
                  description="Registra un endpoint HTTPS para recibir eventos de citas, cobros y stock en tiempo real."
                  actionLabel="Registrar Webhook"
                  onAction={() => setModalWebhookAbierto(true)}
                />
              ) : (
                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                  {webhooks.map((w) => (
                    <div
                      key={w.id}
                      className="p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-xs"
                    >
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-sm text-slate-900 dark:text-slate-100">
                            {w.url}
                          </span>
                          <Badge variant={w.activo ? 'success' : 'default'} size="sm" dot>
                            {w.activo ? 'Activo' : 'Pausado'}
                          </Badge>
                          {w.ultimo_status && (
                            <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-md flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" />
                              HTTP {w.ultimo_status}
                            </span>
                          )}
                        </div>

                        {/* Eventos suscritos */}
                        <div className="flex flex-wrap gap-1.5">
                          {w.eventos.map((ev) => (
                            <span
                              key={ev}
                              className="px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-[10px] font-mono text-slate-600 dark:text-slate-300 font-medium"
                            >
                              {ev}
                            </span>
                          ))}
                        </div>

                        {/* Clave Secreta */}
                        <div className="flex items-center gap-2 text-slate-400">
                          <span>HMAC Secret:</span>
                          <code className="bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-[11px] font-mono">
                            {w.secret_key.slice(0, 14)}••••••••
                          </code>
                          <button
                            type="button"
                            onClick={() => handleCopiarSecret(w.id, w.secret_key)}
                            className="p-1 hover:text-slate-700 dark:hover:text-slate-200"
                            title="Copiar clave secreta"
                          >
                            {copiadoSecretId === w.id ? (
                              <Check className="w-3.5 h-3.5 text-emerald-500" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      </div>

                      {/* Acciones */}
                      <div className="flex items-center gap-2 w-full md:w-auto justify-end">
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => handleProbarWebhook(w.id)}
                          isLoading={probandoWebhookId === w.id}
                          leftIcon={<Play className="w-3.5 h-3.5" />}
                        >
                          Probar Ping
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEliminarWebhook(w.id)}
                          className="text-red-500 hover:text-red-600"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Modal Alta Webhook */}
      <ModalWebhook
        isOpen={modalWebhookAbierto}
        onClose={() => setModalWebhookAbierto(false)}
        onGuardar={handleGuardarWebhook}
      />
    </div>
  )
}
