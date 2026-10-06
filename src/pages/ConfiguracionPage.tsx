import { useState, FormEvent, useEffect } from 'react'
import {
  Palette,
  Shield,
  Code2,
  Building2,
  Save,
  RotateCcw,
  Download,
  Upload,
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
} from '@/components/configuracion'
import { useToast } from '@/hooks/useToast'
import { applyTheme, configuracionToTema, temaToConfiguracion } from '@/utils/themeEngine'
import { descargarTema, importarTema } from '@/utils/themeValidator'

export type TabConfig = 'marca_blanca' | 'apariencia' | 'widget' | 'negocio'

export default function ConfiguracionPage() {
  const {
    configuracion,
    actualizarConfiguracion,
    actualizarTema,
    aplicarPreset,
    resetConfiguracion,
    cargando,
  } = useConfiguracion()
  const { toast } = useToast()

  const [tabActivo, setTabActivo] = useState<TabConfig>('marca_blanca')
  const [formData, setFormData] = useState<ConfiguracionMarcaBlanca>({ ...configuracion })
  const [guardando, setGuardando] = useState(false)

  // Estado para el modal de importar tema
  const [modalImportar, setModalImportar] = useState(false)
  const [erroresImportacion, setErroresImportacion] = useState<string[]>([])

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
      toast.success('Configuración guardada', 'Los cambios de marca blanca y diseño se han guardado con éxito.')
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
      'px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-2 cursor-pointer',
      tabActivo === t
        ? 'bg-primary-600 text-white shadow-sm'
        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800',
    ].join(' ')

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            Configuración & Marca Blanca
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Personaliza el nombre comercial, logotipos, favicon, tipografías, geometría y presets visuales
          </p>
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

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2 overflow-x-auto">
        <button
          onClick={() => setTabActivo('marca_blanca')}
          className={tabClass('marca_blanca')}
        >
          <Shield className="w-4 h-4" />
          Identidad & Marca Blanca
        </button>

        <button
          onClick={() => setTabActivo('apariencia')}
          className={tabClass('apariencia')}
        >
          <Palette className="w-4 h-4" />
          Aspecto Visual & Tipografías
        </button>

        <button
          onClick={() => setTabActivo('widget')}
          className={tabClass('widget')}
        >
          <Code2 className="w-4 h-4" />
          Portal & Widget Embebible
        </button>

        <button
          onClick={() => setTabActivo('negocio')}
          className={tabClass('negocio')}
        >
          <Building2 className="w-4 h-4" />
          Negocio & Datos Regionales
        </button>
      </div>

      {/* Grid: Formulario (Izq) + Previsualizador en Vivo (Der) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-7 space-y-6">
          {tabActivo === 'marca_blanca' && (
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

          {tabActivo === 'negocio' && (
            <TabNegocioRegional
              formData={formData}
              onChange={handleChange}
            />
          )}
        </div>

        {/* Panel Lateral: Previsualizador en Vivo (Sticky) */}
        <div className="lg:col-span-5 sticky top-20 space-y-4">
          <PrevisualizadorMarcaBlanca configuracion={formData} />
        </div>
      </div>

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

