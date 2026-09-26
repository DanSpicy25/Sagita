import { useState, useEffect } from 'react'
import {
  Calendar,
  Video,
  MessageSquare,
  Bell,
  Webhook as WebhookIcon,
  CheckCircle2,
  Plus,
  Play,
  Trash2,
  Copy,
  Check,
} from 'lucide-react'
import {
  Integracion,
  EstadoIntegracion,
  Webhook,
  PlantillaMensaje,
} from '@/types'
import { integracionesService } from '@/services/integraciones.service'
import { Button, Badge, Loader, EmptyState } from '@/components/ui'
import { ModalWebhook, PlantillaEditor } from '@/components/integraciones'
import { useToast } from '@/hooks/useToast'

type TabIntegracion = 'calendarios' | 'whatsapp' | 'notificaciones' | 'webhooks'

export default function IntegracionesPage() {
  const [tabActivo, setTabActivo] = useState<TabIntegracion>('calendarios')
  const [integraciones, setIntegraciones] = useState<Integracion[]>([])
  const [webhooks, setWebhooks] = useState<Webhook[]>([])
  const [plantillas, setPlantillas] = useState<PlantillaMensaje[]>([])
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
      integracionesService.getPlantillas(),
    ])
      .then(([intRes, webRes, planRes]) => {
        if (intRes.data) setIntegraciones(intRes.data)
        if (webRes.data) setWebhooks(webRes.data)
        if (planRes.data) setPlantillas(planRes.data)
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
    const nuevoEstado = estadoActual === 'conectado' ? 'desconectado' : 'conectado'
    try {
      await integracionesService.toggleIntegracion(id, nuevoEstado)
      toast.success(
        'Integración actualizada',
        nuevoEstado === 'conectado' ? 'Servicio vinculado con éxito' : 'Servicio desvinculado'
      )
      cargarDatos()
    } catch {
      toast.error('Error', 'No se pudo actualizar el estado de la integración')
    }
  }

  const handleGuardarWebhook = async (nuevo: Partial<Webhook>) => {
    try {
      await integracionesService.crearWebhook(nuevo)
      toast.success('Webhook registrado', 'El endpoint comenzará a recibir eventos en tiempo real')
      cargarDatos()
    } catch {
      toast.error('Error', 'No se pudo registrar el webhook')
    }
  }

  const handleEliminarWebhook = async (id: number) => {
    if (!confirm('¿Deseas eliminar este endpoint de webhook?')) return
    try {
      await integracionesService.eliminarWebhook(id)
      toast.success('Webhook eliminado', 'El endpoint ya no recibirá peticiones')
      cargarDatos()
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
    toast.info('Copiado', 'Clave secreta copiada al portapapeles')
  }

  const handleGuardarPlantilla = async (id: number, data: Partial<PlantillaMensaje>) => {
    await integracionesService.actualizarPlantilla(id, data)
    cargarDatos()
  }

  const handleProbarPush = () => {
    if ('Notification' in window) {
      Notification.requestPermission().then((perm) => {
        if (perm === 'granted') {
          new Notification('Sagitta - Prueba de Notificación', {
            body: '¡Las notificaciones Web Push están funcionando correctamente!',
            icon: '/manifest.json',
          })
          toast.success('Notificación enviada', 'Revisa la esquina de tu pantalla')
        } else {
          toast.warning('Permiso denegado', 'Debes permitir notificaciones en tu navegador')
        }
      })
    } else {
      toast.info('Simulación Push', 'Tu navegador no soporta Web Push API')
    }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            Integraciones y Notificaciones
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Sincroniza con Google Calendar, videollamadas Meet/Zoom, WhatsApp, Push y Webhooks
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
          className={[
            'px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-2',
            tabActivo === 'calendarios'
              ? 'bg-primary-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800',
          ].join(' ')}
        >
          <Calendar className="w-4 h-4" />
          Calendarios & Videollamadas
        </button>

        <button
          onClick={() => setTabActivo('whatsapp')}
          className={[
            'px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-2',
            tabActivo === 'whatsapp'
              ? 'bg-primary-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800',
          ].join(' ')}
        >
          <MessageSquare className="w-4 h-4" />
          WhatsApp Automatizado
        </button>

        <button
          onClick={() => setTabActivo('notificaciones')}
          className={[
            'px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-2',
            tabActivo === 'notificaciones'
              ? 'bg-primary-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800',
          ].join(' ')}
        >
          <Bell className="w-4 h-4" />
          Email & Web Push
        </button>

        <button
          onClick={() => setTabActivo('webhooks')}
          className={[
            'px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-2',
            tabActivo === 'webhooks'
              ? 'bg-primary-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800',
          ].join(' ')}
        >
          <WebhookIcon className="w-4 h-4" />
          Webhooks & API ({webhooks.length})
        </button>
      </div>

      {/* Contenido de Tabs */}
      {cargando ? (
        <Loader text="Cargando integraciones..." />
      ) : (
        <div className="space-y-6">
          {/* TAB 1: CALENDARIOS & VIDEOLLAMADAS */}
          {tabActivo === 'calendarios' && (() => {
            const gcal = integraciones.find((i) => i.id === 'google_calendar')
            const gmeet = integraciones.find((i) => i.id === 'google_meet')
            const zoom = integraciones.find((i) => i.id === 'zoom')
            return (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
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
                          Sincronización automática bidireccional
                        </p>
                      </div>
                    </div>
                    <Badge variant={gcal?.estado === 'conectado' ? 'success' : 'default'} size="sm" dot={gcal?.estado === 'conectado'}>
                      {gcal?.estado === 'conectado' ? 'Conectado' : 'Desconectado'}
                    </Badge>
                  </div>

                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
                    {gcal?.descripcion ?? 'Tus citas se guardan automáticamente en tu calendario de Google y los bloqueos de tu agenda personal impiden reservas superpuestas.'}
                  </p>

                  <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl text-xs space-y-1">
                    <p className="text-slate-400">Cuenta vinculada:</p>
                    <p className="font-semibold text-slate-800 dark:text-slate-200">
                      {gcal?.cuenta_vinculada ?? 'Sin cuenta vinculada'}
                    </p>
                  </div>
                </div>

                <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400">
                    {gcal?.ultima_sync ? 'Sincronizado recientemente' : 'Sin sincronizar'}
                  </span>
                  <Button
                    variant={gcal?.estado === 'conectado' ? 'secondary' : 'primary'}
                    size="sm"
                    onClick={() => handleToggleIntegracion('google_calendar', gcal?.estado ?? 'desconectado')}
                  >
                    {gcal?.estado === 'conectado' ? 'Desvincular' : 'Vincular Google'}
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
                        <p className="text-xs text-slate-400">Telemedicina y Citas Virtuales</p>
                      </div>
                    </div>
                    <Badge variant={gmeet?.estado === 'conectado' ? 'success' : 'default'} size="sm" dot={gmeet?.estado === 'conectado'}>
                      {gmeet?.estado === 'conectado' ? 'Activo' : 'Inactivo'}
                    </Badge>
                  </div>

                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
                    {gmeet?.descripcion ?? 'Genera una sala de reunión única de Google Meet al programar cualquier servicio de modalidad virtual o teleconsulta.'}
                  </p>

                  <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl text-xs space-y-1">
                    <p className="text-slate-400">Enlace de muestra:</p>
                    <code className="text-primary-600 font-semibold">https://meet.google.com/sag-demo</code>
                  </div>
                </div>

                <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <span className="text-[11px] text-emerald-600 font-semibold">Listo para citas online</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleToggleIntegracion('google_meet', gmeet?.estado ?? 'desconectado')}
                  >
                    {gmeet?.estado === 'conectado' ? 'Desactivar' : 'Activar'}
                  </Button>
                </div>
              </div>

              {/* Zoom */}
              <div className="card p-6 border border-slate-100 dark:border-slate-800 flex flex-col justify-between">
                <div>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-500 flex items-center justify-center">
                        <Video className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-bold text-base text-slate-900 dark:text-slate-100">
                          {zoom?.nombre ?? 'Zoom Video'}
                        </h4>
                        <p className="text-xs text-slate-400">Salas de conferencias Zoom</p>
                      </div>
                    </div>
                    <Badge variant={zoom?.estado === 'conectado' ? 'success' : 'default'} size="sm" dot={zoom?.estado === 'conectado'}>
                      {zoom?.estado === 'conectado' ? 'Conectado' : 'Desconectado'}
                    </Badge>
                  </div>

                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
                    {zoom?.descripcion ?? 'Conecta tu cuenta de Zoom para crear salas y enviar ID y contraseña a tus pacientes automáticamente.'}
                  </p>
                </div>

                <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end">
                  <Button
                    size="sm"
                    variant={zoom?.estado === 'conectado' ? 'secondary' : 'primary'}
                    onClick={() => handleToggleIntegracion('zoom', zoom?.estado ?? 'desconectado')}
                  >
                    {zoom?.estado === 'conectado' ? 'Desvincular Zoom' : 'Conectar Zoom'}
                  </Button>
                </div>
              </div>

              {/* Formato iCalendar .ICS */}
              <div className="card p-6 border border-slate-100 dark:border-slate-800 flex flex-col justify-between">
                <div>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-600 flex items-center justify-center">
                        <Calendar className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-bold text-base text-slate-900 dark:text-slate-100">
                          Apple Calendar & Outlook (.ics)
                        </h4>
                        <p className="text-xs text-slate-400">Descarga universal de eventos</p>
                      </div>
                    </div>
                    <Badge variant="success" size="sm" dot>
                      Habilitado
                    </Badge>
                  </div>

                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Todos los clientes pueden exportar sus citas directamente a la app Calendario
                    de iOS, macOS o Microsoft Outlook con un solo clic.
                  </p>
                </div>

                <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400">Estándar RFC 5545</span>
                  <span className="text-xs font-semibold text-primary-600">Activo en tarjetas</span>
                </div>
              </div>
            </div>
            )
          })()}

          {/* TAB 2: WHATSAPP AUTOMATIZADO */}
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
                      {wa?.nombre ?? 'WhatsApp Business API'}
                    </h3>
                    <p className="text-xs text-slate-400">
                      Número emisor: <strong>{wa?.cuenta_vinculada ?? '+1 555-0900 (Cuenta Oficial Verificada)'}</strong>
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
                        'Recordatorios activos',
                        'Los mensajes se disparan 24 horas antes de cada cita'
                      )
                    }
                  >
                    Estado del Servicio
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {plantillas
                  .filter((p) => p.canal === 'whatsapp')
                  .map((p) => (
                    <PlantillaEditor
                      key={p.id}
                      plantilla={p}
                      onGuardar={handleGuardarPlantilla}
                    />
                  ))}
              </div>
            </div>
            )
          })()}

          {/* TAB 3: NOTIFICACIONES & PUSH */}
          {tabActivo === 'notificaciones' && (
            <div className="space-y-6">
              <div className="card p-6 border border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-purple-50 dark:bg-purple-950/40 text-purple-600 flex items-center justify-center">
                    <Bell className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">
                      Notificaciones Web Push en Navegador
                    </h3>
                    <p className="text-xs text-slate-400">
                      Alertas instantáneas gestionadas vía Service Worker
                    </p>
                  </div>
                </div>

                <Button onClick={handleProbarPush} size="sm">
                  Enviar Notificación de Prueba
                </Button>
              </div>

              {/* Editores de plantillas para Email y Push */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {plantillas
                  .filter((p) => p.canal !== 'whatsapp')
                  .map((p) => (
                    <PlantillaEditor
                      key={p.id}
                      plantilla={p}
                      onGuardar={handleGuardarPlantilla}
                    />
                  ))}
              </div>
            </div>
          )}

          {/* TAB 4: WEBHOOKS & API */}
          {tabActivo === 'webhooks' && (
            <div className="card shadow-card overflow-hidden">
              <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200">
                    Endpoints de Webhook Registrados
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Envío de eventos en tiempo real hacia tus sistemas o CRM externos
                  </p>
                </div>
              </div>

              {webhooks.length === 0 ? (
                <EmptyState
                  title="No hay webhooks configurados"
                  description="Registra un endpoint HTTPS para recibir eventos de citas y pagos."
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
                          <span>Secret Key:</span>
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
