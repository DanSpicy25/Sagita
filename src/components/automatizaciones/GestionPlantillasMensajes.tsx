import { useState, useMemo } from 'react'
import {
  Sparkles,
  MessageSquare,
  Mail,
  Smartphone,
  Bell,
  Save,
  Eye,
  CheckCircle,
} from 'lucide-react'
import { PlantillaMensaje, CanalNotificacion } from '@/types'
import { Button, Input, Badge } from '@/components/ui'
import {
  CATALOGO_VARIABLES,
  renderizarPlantilla,
  generarContextoEjemplo,
} from '@/utils/templateEngine'
import { useToast } from '@/hooks/useToast'

interface GestionPlantillasMensajesProps {
  plantillas: PlantillaMensaje[]
  onGuardarPlantilla: (id: number, data: Partial<PlantillaMensaje>) => Promise<void>
}

export function GestionPlantillasMensajes({
  plantillas,
  onGuardarPlantilla,
}: GestionPlantillasMensajesProps) {
  const [canalFiltro, setCanalFiltro] = useState<string>('todos')
  const [plantillaSeleccionadaId, setPlantillaSeleccionadaId] = useState<number | null>(
    plantillas.length > 0 ? plantillas[0].id : null
  )
  const [formAsunto, setFormAsunto] = useState('')
  const [formCuerpo, setFormCuerpo] = useState('')
  const [formActivo, setFormActivo] = useState(true)
  const [guardando, setGuardando] = useState(false)

  const { toast } = useToast()

  // Plantilla activa seleccionada
  const plantillaActiva = useMemo(() => {
    return plantillas.find((p) => p.id === plantillaSeleccionadaId) || plantillas[0] || null
  }, [plantillas, plantillaSeleccionadaId])

  // Contexto demo para la vista previa
  const contextoEjemplo = useMemo(() => generarContextoEjemplo(), [])

  // Al cambiar selección
  const handleSeleccionar = (p: PlantillaMensaje) => {
    setPlantillaSeleccionadaId(p.id)
    setFormAsunto(p.asunto || '')
    setFormCuerpo(p.cuerpo)
    setFormActivo(p.activo)
  }

  // Previsualización renderizada en vivo
  const cuerpoPrevisualizado = useMemo(() => {
    const texto = formCuerpo || plantillaActiva?.cuerpo || ''
    return renderizarPlantilla(texto, contextoEjemplo)
  }, [formCuerpo, plantillaActiva, contextoEjemplo])

  const asuntoPrevisualizado = useMemo(() => {
    const texto = formAsunto || plantillaActiva?.asunto || ''
    return renderizarPlantilla(texto, contextoEjemplo)
  }, [formAsunto, plantillaActiva, contextoEjemplo])

  const handleInsertarVariable = (token?: string) => {
    if (!token) return
    setFormCuerpo((prev) => `${prev} ${token}`)
  }

  const handleGuardar = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!plantillaActiva) return
    if (!formCuerpo.trim()) {
      toast.warning('Validación', 'El contenido de la plantilla no puede estar vacío.')
      return
    }

    setGuardando(true)
    try {
      await onGuardarPlantilla(plantillaActiva.id, {
        asunto: formAsunto,
        cuerpo: formCuerpo,
        activo: formActivo,
      })
      toast.success(
        'Plantilla Guardada',
        `La plantilla "${plantillaActiva.nombre}" ha sido actualizada con éxito.`
      )
    } catch (err) {
      toast.error('Error al guardar', err instanceof Error ? err.message : 'Error')
    } finally {
      setGuardando(false)
    }
  }

  const getCanalIcon = (canal: CanalNotificacion) => {
    switch (canal) {
      case 'whatsapp':
        return <MessageSquare className="w-4 h-4 text-emerald-500" />
      case 'email':
        return <Mail className="w-4 h-4 text-blue-500" />
      case 'sms':
        return <Smartphone className="w-4 h-4 text-amber-500" />
      case 'push':
        return <Bell className="w-4 h-4 text-purple-500" />
      default:
        return <MessageSquare className="w-4 h-4 text-slate-400" />
    }
  }

  const plantillasFiltradas = plantillas.filter((p) => {
    if (canalFiltro !== 'todos' && p.canal !== canalFiltro) return false
    return true
  })

  return (
    <div className="space-y-6">
      {/* Header explicativo */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-gradient-to-r from-primary-500/10 via-primary-500/5 to-transparent border border-primary-200 dark:border-primary-900/40">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary-500" />
            Plantillas Dinámicas de Comunicación
          </h2>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
            Personaliza el texto de los recordatorios, confirmaciones y avisos para WhatsApp, Email y SMS. Usa etiquetas inteligentes que se reemplazan en tiempo real con datos de la reserva y negocio.
          </p>
        </div>

        {/* Filtro Canal */}
        <div className="flex items-center gap-1.5 self-start sm:self-auto bg-white dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
          {(['todos', 'whatsapp', 'email', 'sms', 'push'] as const).map((canal) => (
            <button
              key={canal}
              onClick={() => setCanalFiltro(canal)}
              className={[
                'px-2.5 py-1 rounded-lg text-xs font-semibold capitalize transition-all',
                canalFiltro === canal
                  ? 'bg-primary-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700',
              ].join(' ')}
            >
              {canal}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Lista Lateral de Plantillas */}
        <div className="lg:col-span-4 space-y-2">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider px-1">
            Plantillas Disponibles ({plantillasFiltradas.length})
          </p>
          <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
            {plantillasFiltradas.map((p) => {
              const esActiva = plantillaActiva?.id === p.id
              return (
                <button
                  key={p.id}
                  onClick={() => handleSeleccionar(p)}
                  className={[
                    'w-full text-left p-3.5 rounded-xl border transition-all flex items-start gap-3',
                    esActiva
                      ? 'bg-primary-50/70 dark:bg-primary-950/40 border-primary-300 dark:border-primary-700 shadow-xs'
                      : 'bg-white dark:bg-slate-850 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700',
                  ].join(' ')}
                >
                  <div className="mt-0.5 p-2 rounded-lg bg-slate-100 dark:bg-slate-800">
                    {getCanalIcon(p.canal)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <h4 className="font-bold text-xs text-slate-900 dark:text-slate-100 truncate">
                        {p.nombre}
                      </h4>
                      <Badge variant={p.activo ? 'success' : 'default'} size="sm">
                        {p.activo ? 'Activa' : 'Pausa'}
                      </Badge>
                    </div>
                    <span className="text-[10px] text-slate-400 capitalize block mt-0.5">
                      Canal: {p.canal} • Evento: {p.evento}
                    </span>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1 mt-1">
                      {p.cuerpo}
                    </p>
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        {/* Editor y Mockup de Vista Previa */}
        {plantillaActiva ? (
          <div className="lg:col-span-8 grid grid-cols-1 xl:grid-cols-2 gap-5">
            {/* Editor */}
            <form
              onSubmit={handleGuardar}
              className="card p-5 border border-slate-200 dark:border-slate-800 space-y-4"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800">
                    {getCanalIcon(plantillaActiva.canal)}
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                      {plantillaActiva.nombre}
                    </h3>
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider font-mono">
                      {plantillaActiva.canal} / {plantillaActiva.evento}
                    </span>
                  </div>
                </div>

                <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700 dark:text-slate-300">
                  <input
                    type="checkbox"
                    checked={formActivo}
                    onChange={(e) => setFormActivo(e.target.checked)}
                    className="w-4 h-4 rounded text-primary-600 focus:ring-primary-500"
                  />
                  <span>Habilitada</span>
                </label>
              </div>

              {plantillaActiva.canal === 'email' && (
                <Input
                  label="Línea de Asunto (Subject)"
                  placeholder="Ej: Confirmación de tu reserva - {{business.name}}"
                  value={formAsunto}
                  onChange={(e) => setFormAsunto(e.target.value)}
                />
              )}

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Cuerpo del Mensaje
                  </label>
                  <span className="text-[11px] text-slate-400">
                    {formCuerpo.length} caracteres
                  </span>
                </div>

                <textarea
                  rows={8}
                  className="input-base text-xs w-full font-mono leading-relaxed resize-y"
                  value={formCuerpo}
                  onChange={(e) => setFormCuerpo(e.target.value)}
                  placeholder="Escribe el mensaje..."
                  required
                />
              </div>

              {/* Botones de Variables Disponibles */}
              <div className="space-y-1.5">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  Insertar Variable Dinámica:
                </span>
                <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto p-2 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700">
                  {CATALOGO_VARIABLES.map((v) => (
                    <button
                      key={v.token ?? v.variable}
                      type="button"
                      onClick={() => handleInsertarVariable(v.token ?? v.variable)}
                      className="px-2 py-1 rounded-md bg-white dark:bg-slate-750 hover:bg-primary-50 dark:hover:bg-primary-950/40 text-slate-700 hover:text-primary-600 dark:text-slate-300 text-[10px] font-mono border border-slate-200 dark:border-slate-700 shadow-2xs transition-colors"
                      title={v.descripcion}
                    >
                      {v.token ?? v.variable}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <Button
                  type="submit"
                  disabled={guardando}
                  leftIcon={<Save className="w-4 h-4" />}
                >
                  {guardando ? 'Guardando...' : 'Guardar Plantilla'}
                </Button>
              </div>
            </form>

            {/* Mockup de Vista Previa en Vivo */}
            <div className="card p-5 border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800 mb-4">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300">
                    <Eye className="w-4 h-4 text-primary-500" />
                    Vista Previa en Tiempo Real
                  </div>
                  <Badge variant="info" size="sm">
                    Datos Simulados
                  </Badge>
                </div>

                {plantillaActiva.canal === 'whatsapp' ? (
                  /* Mockup WhatsApp */
                  <div className="bg-[#EFEAE2] dark:bg-[#0B141A] rounded-2xl p-4 border border-[#DAD3CC] dark:border-[#222E35] shadow-inner space-y-3">
                    <div className="flex items-center gap-2 pb-2 border-b border-[#D1D7DB] dark:border-[#222E35]">
                      <div className="w-7 h-7 rounded-full bg-emerald-600 text-white text-[10px] font-bold flex items-center justify-center">
                        WA
                      </div>
                      <div>
                        <p className="text-xs font-bold text-[#111B21] dark:text-[#E9EDEF]">
                          Sagitta Demo Business
                        </p>
                        <span className="text-[9px] text-[#667781]">Cuenta Comercial Verificada</span>
                      </div>
                    </div>

                    <div className="bg-white dark:bg-[#1F2C34] text-[#111B21] dark:text-[#E9EDEF] p-3 rounded-2xl rounded-tl-none text-xs shadow-xs space-y-2 whitespace-pre-wrap font-sans">
                      <p>{cuerpoPrevisualizado}</p>
                      <div className="text-[10px] text-right text-slate-400 flex items-center justify-end gap-1">
                        <span>10:45 AM</span>
                        <CheckCircle className="w-3 h-3 text-blue-500" />
                      </div>
                    </div>
                  </div>
                ) : plantillaActiva.canal === 'email' ? (
                  /* Mockup Email */
                  <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 border border-slate-200 dark:border-slate-700 shadow-sm space-y-3">
                    <div className="space-y-1 pb-2 border-b border-slate-100 dark:border-slate-700 text-xs">
                      <p className="text-slate-500">
                        <span className="font-semibold text-slate-700 dark:text-slate-300">De:</span>{' '}
                        Sagitta Demo &lt;reservas@sagitta.io&gt;
                      </p>
                      <p className="text-slate-500">
                        <span className="font-semibold text-slate-700 dark:text-slate-300">Para:</span>{' '}
                        Valdez &lt;valdez@ejemplo.com&gt;
                      </p>
                      <p className="text-slate-800 dark:text-slate-200 font-bold">
                        <span className="text-slate-500 font-normal">Asunto:</span>{' '}
                        {asuntoPrevisualizado || '(Sin Asunto)'}
                      </p>
                    </div>

                    <div className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap py-2">
                      {cuerpoPrevisualizado}
                    </div>

                    <div className="pt-3 border-t border-slate-100 dark:border-slate-700 text-[10px] text-slate-400 text-center">
                      Mensaje enviado de forma automatizada por la plataforma de reservas
                    </div>
                  </div>
                ) : (
                  /* Mockup SMS / Push */
                  <div className="bg-slate-900 text-white rounded-2xl p-4 shadow-lg space-y-2">
                    <div className="flex items-center justify-between text-[11px] text-slate-400">
                      <span className="font-bold flex items-center gap-1">
                        <Smartphone className="w-3.5 h-3.5" />
                        MENSAJE SMS
                      </span>
                      <span>Ahora</span>
                    </div>
                    <div className="bg-slate-800 p-3 rounded-xl text-xs text-slate-100 leading-relaxed whitespace-pre-wrap">
                      {cuerpoPrevisualizado}
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-4 p-3 bg-amber-50/70 dark:bg-amber-950/30 rounded-xl border border-amber-200 dark:border-amber-900/40 text-[11px] text-amber-800 dark:text-amber-300">
                <span className="font-bold block mb-0.5">Nota de resolución:</span>
                Los valores como fecha, hora, nombre y montos se inyectarán de forma dinámica cuando la cita o transacción sea procesada.
              </div>
            </div>
          </div>
        ) : (
          <div className="lg:col-span-8 p-12 text-center text-slate-400 text-sm card border border-dashed border-slate-200 dark:border-slate-700">
            Selecciona una plantilla de la lista para editarla y previsualizarla.
          </div>
        )}
      </div>
    </div>
  )
}
