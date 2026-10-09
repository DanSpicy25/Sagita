import { useState, FormEvent, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import {
  Palette,
  Building2,
  Code2,
  Save,
  RotateCcw,
  Download,
  Upload,
  Sliders,
  Blocks,
  LayoutDashboard,
  Languages,
  Receipt,
  Sparkles,
  HelpCircle,
} from 'lucide-react'
import {
  useConfiguracion,
  PALETAS_PREDEFINIDAS,
  CONFIGURACION_DEFAULT,
} from '@/context/ConfiguracionContext'
import type {
  ConfiguracionMarcaBlanca,
  PaletaColor,
} from '@/types'
import { Button } from '@/components/ui'
import {
  PrevisualizadorMarcaBlanca,
  GeneradorWidgetEmbebible,
  TabIdentidadMarca,
  TabTipografiaDiseno,
  TabNegocioRegional,
  ModalImportarTema,
  TabEspacioTrabajo,
  TabModulosControl,
  TabPersonalizarDashboard,
  TabTerminologia,
  TabAyudaOnboarding,
} from '@/components/configuracion'
import { useToast } from '@/hooks/useToast'
import { applyTheme, configuracionToTema, temaToConfiguracion } from '@/utils/themeEngine'
import { descargarTema, importarTema } from '@/utils/themeValidator'

export type TabConfig =
  | 'identidad'
  | 'workspace'
  | 'modulos'
  | 'dashboard'
  | 'terminologia'
  | 'apariencia'
  | 'negocio'
  | 'widget'
  | 'ayuda'

export default function ConfiguracionPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const {
    configuracion,
    actualizarConfiguracion,
    actualizarTema,
    aplicarPreset,
    resetConfiguracion,
    cargando,
  } = useConfiguracion()
  const { toast } = useToast()

  const tabQuery = searchParams.get('tab') as TabConfig | null
  const initialTab: TabConfig =
    tabQuery &&
    ['identidad', 'workspace', 'modulos', 'dashboard', 'terminologia', 'apariencia', 'negocio', 'widget', 'ayuda'].includes(
      tabQuery
    )
      ? tabQuery
      : 'identidad'

  const [tabActivo, setTabActivo] = useState<TabConfig>(initialTab)
  const [formData, setFormData] = useState<ConfiguracionMarcaBlanca>({ ...configuracion })
  const [guardando, setGuardando] = useState(false)

  // Estado para el modal de importar tema
  const [modalImportar, setModalImportar] = useState(false)
  const [erroresImportacion, setErroresImportacion] = useState<string[]>([])

  // Sincronizar tab con URL query
  const handleTabChange = (t: TabConfig) => {
    setTabActivo(t)
    setSearchParams({ tab: t })
  }

  // Mantener sincronizado formData cuando la configuración externa cambia
  useEffect(() => {
    setFormData({ ...configuracion })
  }, [configuracion])

  // Manejar cambios en el formulario local y propagación inmediata en vivo al DOM
  const handleChange = <K extends keyof ConfiguracionMarcaBlanca>(
    campo: K,
    valor: ConfiguracionMarcaBlanca[K]
  ) => {
    setFormData((prev) => {
      const updated = {
        ...prev,
        [campo]: valor,
      }
      // Sincronizar en tiempo real con el ThemeEngine en toda la pantalla
      applyTheme(configuracionToTema(updated))
      return updated
    })
  }

  // Selección de paleta predefinida
  const handleSeleccionarPaleta = (paletaKey: PaletaColor) => {
    const paleta = PALETAS_PREDEFINIDAS[paletaKey]
    setFormData((prev) => {
      const updated = {
        ...prev,
        paleta_predefinida: paletaKey,
        color_primario: paleta.hex,
      }
      applyTheme(configuracionToTema(updated))
      return updated
    })
  }

  // Aplicación de Presets predefinidos
  const handleAplicarPreset = async (presetId: string) => {
    try {
      const nuevoTema = await aplicarPreset(presetId)
      const nuevaConfig = temaToConfiguracion(nuevoTema, formData)
      setFormData(nuevaConfig)
      applyTheme(nuevoTema)
      toast.success(
        'Preset de Diseño Aplicado',
        `Se ha aplicado el estilo visual "${nuevoTema.presetName}" a toda la plataforma.`
      )
    } catch (err) {
      toast.error('Error al aplicar preset', err instanceof Error ? err.message : 'Error desconocido')
    }
  }

  // Guardar configuración en API y Contexto
  const handleSubmit = async (e?: FormEvent) => {
    if (e) e.preventDefault()
    setGuardando(true)
    try {
      await actualizarConfiguracion(formData)
      toast.success('Configuración guardada', 'Los cambios del Centro de Control se han guardado con éxito.')
    } catch {
      toast.error('Error al guardar', 'No se pudo sincronizar la configuración con el servidor.')
    } finally {
      setGuardando(false)
    }
  }

  // Restaurar por defecto
  const handleReset = async () => {
    if (!confirm('¿Deseas restaurar toda la configuración visual a los valores de fábrica?')) {
      return
    }
    setGuardando(true)
    try {
      await resetConfiguracion()
      toast.info('Configuración restaurada', 'Se restablecieron los valores por defecto.')
      setFormData({ ...CONFIGURACION_DEFAULT })
      applyTheme(configuracionToTema(CONFIGURACION_DEFAULT))
    } catch {
      toast.error('Error', 'No se pudo restablecer la configuración.')
    } finally {
      setGuardando(false)
    }
  }

  // Exportar Tema a JSON (limpio y sin secretos)
  const handleExportarTema = () => {
    try {
      const temaActual = configuracionToTema(formData)
      descargarTema(temaActual)
      toast.success(
        'Tema Exportado',
        'El archivo JSON del tema ha sido generado y descargado sin datos sensibles ni secretos.'
      )
    } catch (err) {
      toast.error('Error al exportar tema', err instanceof Error ? err.message : 'Error desconocido')
    }
  }

  // Importar Tema desde archivo JSON o texto
  const handleProcesarImportacion = async (contenidoJson: string) => {
    setErroresImportacion([])
    const resultado = importarTema(contenidoJson)

    if (!resultado.valid || !resultado.data) {
      setErroresImportacion(resultado.errors)
      return
    }

    try {
      await actualizarTema(resultado.data)
      const nuevaConfig = temaToConfiguracion(resultado.data, formData)
      setFormData(nuevaConfig)
      applyTheme(resultado.data)
      setModalImportar(false)
      toast.success('Tema Importado', 'La configuración visual ha sido validada y aplicada con éxito.')
    } catch (err) {
      setErroresImportacion([err instanceof Error ? err.message : 'Error al guardar el tema importado.'])
    }
  }

  const tabClass = (t: TabConfig) =>
    [
      'px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-2 cursor-pointer select-none',
      tabActivo === t
        ? 'bg-primary text-white shadow-2xs'
        : 'text-text-muted hover:bg-surface-subtle hover:text-text',
    ].join(' ')

  const tabsConfig = [
    { id: 'identidad' as const, label: 'Identidad del Negocio', icon: Building2 },
    { id: 'workspace' as const, label: 'Espacio de Trabajo', icon: Sliders },
    { id: 'modulos' as const, label: 'Módulos & Capacidades', icon: Blocks },
    { id: 'dashboard' as const, label: 'Centro de Mando', icon: LayoutDashboard },
    { id: 'terminologia' as const, label: 'Terminología del Sector', icon: Languages },
    { id: 'apariencia' as const, label: 'Aspecto Visual & Presets', icon: Palette },
    { id: 'negocio' as const, label: 'Datos Regionales & Moneda', icon: Receipt },
    { id: 'widget' as const, label: 'Portal & Widget Web', icon: Code2 },
    { id: 'ayuda' as const, label: 'Ayuda & Onboarding', icon: HelpCircle },
  ]

  // Pestañas que se benefician del previsualizador de marca y tema a la derecha
  const muestraPrevisualizadorLateral = ['identidad', 'apariencia', 'widget'].includes(tabActivo)

  return (
    <div className="space-y-6 animate-fade-in">
      {/* ── Encabezado Principal del Centro de Control ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-primary-soft text-primary rounded-xl">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-text">
                Centro de Control & Personalización
              </h1>
              <p className="text-xs sm:text-sm text-text-muted mt-0.5">
                Adapta Sagitta a la identidad, flujos, módulos y lenguaje propio de tu empresa.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Button
            variant="secondary"
            size="sm"
            onClick={handleExportarTema}
            leftIcon={<Download className="w-4 h-4" />}
          >
            Exportar Tema
          </Button>

          <Button
            variant="secondary"
            size="sm"
            onClick={() => {
              setErroresImportacion([])
              setModalImportar(true)
            }}
            leftIcon={<Upload className="w-4 h-4" />}
          >
            Importar Tema
          </Button>

          <Button
            variant="secondary"
            size="sm"
            onClick={handleReset}
            isLoading={guardando || cargando}
            leftIcon={<RotateCcw className="w-4 h-4" />}
          >
            Restaurar
          </Button>

          <Button
            size="sm"
            onClick={() => handleSubmit()}
            isLoading={guardando || cargando}
            leftIcon={<Save className="w-4 h-4" />}
          >
            Guardar Cambios
          </Button>
        </div>
      </div>

      {/* ── Navegación Ergonómica por Pestañas del Centro de Control ── */}
      <div className="flex items-center gap-1.5 border-b border-border pb-2 overflow-x-auto scrollbar-none">
        {tabsConfig.map((t) => {
          const Icon = t.icon
          return (
            <button
              key={t.id}
              onClick={() => handleTabChange(t.id)}
              className={tabClass(t.id)}
              type="button"
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>{t.label}</span>
            </button>
          )
        })}
      </div>

      {/* ── Contenido de las Pestañas ── */}
      {muestraPrevisualizadorLateral ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-7 space-y-6">
            {tabActivo === 'identidad' && (
              <TabIdentidadMarca
                formData={formData}
                onChange={handleChange}
              />
            )}

            {tabActivo === 'apariencia' && (
              <TabTipografiaDiseno
                formData={formData}
                onChange={handleChange}
                onSeleccionarPaleta={handleSeleccionarPaleta}
                onAplicarPreset={handleAplicarPreset}
              />
            )}

            {tabActivo === 'widget' && (
              <GeneradorWidgetEmbebible configuracion={formData} />
            )}
          </div>

          {/* Panel Lateral: Previsualizador en Vivo (Sticky) */}
          <div className="lg:col-span-5 sticky top-20 space-y-4">
            <PrevisualizadorMarcaBlanca configuracion={formData} />
          </div>
        </div>
      ) : (
        <div className="w-full space-y-6">
          {tabActivo === 'workspace' && <TabEspacioTrabajo />}

          {tabActivo === 'modulos' && <TabModulosControl />}

          {tabActivo === 'dashboard' && <TabPersonalizarDashboard />}

          {tabActivo === 'terminologia' && <TabTerminologia />}

          {tabActivo === 'negocio' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              <div className="lg:col-span-8">
                <TabNegocioRegional
                  formData={formData}
                  onChange={handleChange}
                />
              </div>
              <div className="lg:col-span-4 sticky top-20">
                <PrevisualizadorMarcaBlanca configuracion={formData} />
              </div>
            </div>
          )}

          {tabActivo === 'ayuda' && <TabAyudaOnboarding />}
        </div>
      )}

      {/* Modal de Importación de Tema */}
      <ModalImportarTema
        isOpen={modalImportar}
        onClose={() => setModalImportar(false)}
        onProcesarImportacion={handleProcesarImportacion}
        erroresImportacion={erroresImportacion}
      />
    </div>
  )
}
