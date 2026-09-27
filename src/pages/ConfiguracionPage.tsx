import { useState, FormEvent, useRef, useEffect } from 'react'
import {
  Palette,
  Shield,
  Code2,
  Building2,
  Save,
  RotateCcw,
  Check,
  Globe,
  UploadCloud,
  Sparkles,
  Download,
  Upload,
  Sun,
  Moon,
  Monitor,
  Layers,
  Sliders,
  FileJson,
  AlertCircle,
} from 'lucide-react'
import {
  useConfiguracion,
  PALETAS_PREDEFINIDAS,
  CONFIGURACION_DEFAULT,
} from '@/context/ConfiguracionContext'
import {
  ConfiguracionMarcaBlanca,
  PaletaColor,
  FuenteTipografica,
  RadioEsquinas,
  EstiloSombras,
  Densidad,
  ModoVisual,
} from '@/types'
import { Button, Input, Modal } from '@/components/ui'
import {
  PrevisualizadorMarcaBlanca,
  GeneradorWidgetEmbebible,
} from '@/components/configuracion'
import { useToast } from '@/hooks/useToast'
import { THEME_PRESETS } from '@/config/themePresets'
import { applyTheme, configuracionToTema, temaToConfiguracion } from '@/utils/themeEngine'
import { descargarTema, importarTema } from '@/utils/themeValidator'

type TabConfig = 'marca_blanca' | 'apariencia' | 'widget' | 'negocio'

const FUENTES_DISPONIBLES: { id: FuenteTipografica; nombre: string; ejemplo: string }[] = [
  { id: 'Inter', nombre: 'Inter (Por defecto)', ejemplo: 'Moderna, técnica y altamente legible' },
  { id: 'Roboto', nombre: 'Roboto', ejemplo: 'Limpia, geométrica y balanceada' },
  { id: 'Poppins', nombre: 'Poppins', ejemplo: 'Amigable, redondeada y contemporánea' },
  { id: 'Montserrat', nombre: 'Montserrat', ejemplo: 'Elegante, estructurada y corporativa' },
  { id: 'Outfit', nombre: 'Outfit', ejemplo: 'Vanguardista, fresca y premium' },
]

const RADIOS_DISPONIBLES: { id: RadioEsquinas; nombre: string; clase: string; px: string }[] = [
  { id: 'cuadrado', nombre: 'Cuadrado', clase: 'rounded-none', px: '0px' },
  { id: 'suave', nombre: 'Suave', clase: 'rounded-md', px: '4-8px' },
  { id: 'moderno', nombre: 'Moderno', clase: 'rounded-xl', px: '8-12px' },
  { id: 'pronunciado', nombre: 'Pronunciado', clase: 'rounded-2xl', px: '16-24px' },
]

const SOMBRAS_DISPONIBLES: { id: EstiloSombras; nombre: string; desc: string; previewClass: string }[] = [
  {
    id: 'none',
    nombre: 'Sin Sombras (Flat)',
    desc: 'Diseño plano, moderno y minimalista sin elevaciones artificiales.',
    previewClass: 'shadow-none border border-slate-200 dark:border-slate-700',
  },
  {
    id: 'subtle',
    nombre: 'Sutil (Recomendada)',
    desc: 'Elevación suave y equilibrada, ideal para dashboards e interfaces limpias.',
    previewClass: 'shadow-sm border border-slate-100 dark:border-slate-800',
  },
  {
    id: 'elevated',
    nombre: 'Elevada (Profundidad)',
    desc: 'Sombras pronunciadas con relieve para resaltar tarjetas y componentes interactivos.',
    previewClass: 'shadow-lg border border-slate-100 dark:border-slate-800',
  },
]

const DENSIDADES_DISPONIBLES: { id: Densidad; nombre: string; desc: string }[] = [
  {
    id: 'compact',
    nombre: 'Compacta',
    desc: 'Mayor densidad de datos y márgenes reducidos para pantallas operativas y tablas.',
  },
  {
    id: 'comfortable',
    nombre: 'Confortable (Estándar)',
    desc: 'Espaciado armónico y legible para flujos de reservas y navegación general.',
  },
  {
    id: 'spacious',
    nombre: 'Espaciosa',
    desc: 'Márgenes amplios y respiro visual, ideal para experiencias táctiles y de bienestar.',
  },
]

const MODOS_DISPONIBLES: { id: ModoVisual; nombre: string; desc: string; icon: typeof Sun }[] = [
  { id: 'light', nombre: 'Modo Claro', desc: 'Fondo blanco y contrastes luminosos', icon: Sun },
  { id: 'dark', nombre: 'Modo Oscuro', desc: 'Fondo nocturno para baja luminosidad', icon: Moon },
  { id: 'system', nombre: 'Automático', desc: 'Sigue la preferencia del sistema operativo', icon: Monitor },
]

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
  const [jsonImportar, setJsonImportar] = useState('')
  const [erroresImportacion, setErroresImportacion] = useState<string[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

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

  // Aplicación de Presets predefinidos (Corporate, Modern, Elegant, Wellness, Medical, Minimal)
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
      setJsonImportar('')
      toast.success('Tema Importado', 'La configuración visual ha sido validada y aplicada con éxito.')
    } catch (err) {
      setErroresImportacion([err instanceof Error ? err.message : 'Error al guardar el tema importado.'])
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      const content = event.target?.result as string
      if (content) {
        setJsonImportar(content)
        handleProcesarImportacion(content)
      }
    }
    reader.readAsText(file)
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            Configuración & Marca Blanca
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Personaliza el nombre comercial, logotipos, paleta de colores, geometría, sombras y presets visuales
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
              setJsonImportar('')
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
          className={[
            'px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-2',
            tabActivo === 'marca_blanca'
              ? 'bg-primary-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800',
          ].join(' ')}
        >
          <Shield className="w-4 h-4" />
          Identidad & Marca Blanca
        </button>

        <button
          onClick={() => setTabActivo('apariencia')}
          className={[
            'px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-2',
            tabActivo === 'apariencia'
              ? 'bg-primary-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800',
          ].join(' ')}
        >
          <Palette className="w-4 h-4" />
          Aspecto Visual & Presets
        </button>

        <button
          onClick={() => setTabActivo('widget')}
          className={[
            'px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-2',
            tabActivo === 'widget'
              ? 'bg-primary-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800',
          ].join(' ')}
        >
          <Code2 className="w-4 h-4" />
          Portal & Widget Embebible
        </button>

        <button
          onClick={() => setTabActivo('negocio')}
          className={[
            'px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-2',
            tabActivo === 'negocio'
              ? 'bg-primary-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800',
          ].join(' ')}
        >
          <Building2 className="w-4 h-4" />
          Negocio & Datos Regionales
        </button>
      </div>

      {/* Grid: Formulario (Izq) + Previsualizador en Vivo (Der) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-7 space-y-6">
          {/* TAB 1: IDENTIDAD & MARCA BLANCA */}
          {tabActivo === 'marca_blanca' && (
            <div className="space-y-5">
              {/* Banner de Marca Blanca Total */}
              <div className="card p-6 border-2 border-primary-500/20 dark:border-primary-500/30 bg-primary-50/40 dark:bg-primary-950/20 space-y-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="font-bold text-base text-slate-900 dark:text-slate-100 flex items-center gap-2">
                      <Shield className="w-5 h-5 text-primary-600" />
                      Modo Marca Blanca Total
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                      Oculta completamente toda referencia a la plataforma base,
                      permitiéndote revender o usar la plataforma bajo tu propio nombre comercial.
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer shrink-0">
                    <input
                      type="checkbox"
                      checked={formData.marca_blanca_activa}
                      onChange={(e) => handleChange('marca_blanca_activa', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                  </label>
                </div>

                {formData.marca_blanca_activa && (
                  <div className="pt-3 border-t border-primary-200/50 dark:border-primary-900/40 flex flex-col gap-2 text-xs">
                    <label className="flex items-center gap-2 font-medium text-slate-700 dark:text-slate-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.ocultar_marca_sistema}
                        onChange={(e) => handleChange('ocultar_marca_sistema', e.target.checked)}
                        className="rounded text-primary-600 focus:ring-primary-500"
                      />
                      <span>Suprimir el nombre y mención en comprobantes fiscales y correos automáticos</span>
                    </label>

                    <label className="flex items-center gap-2 font-medium text-slate-700 dark:text-slate-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={!formData.mostrar_powered_by}
                        onChange={(e) => handleChange('mostrar_powered_by', !e.target.checked)}
                        className="rounded text-primary-600 focus:ring-primary-500"
                      />
                      <span>Eliminar el pie de página &quot;Powered by&quot; en toda la aplicación</span>
                    </label>
                  </div>
                )}
              </div>

              {/* Datos de Identidad */}
              <div className="card p-6 border border-slate-100 dark:border-slate-800 space-y-4">
                <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                  Nombres y Títulos Comerciales
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Nombre Comercial del Negocio"
                    value={formData.nombre_negocio}
                    onChange={(e) => handleChange('nombre_negocio', e.target.value)}
                    placeholder="Ej. Nexus Consultoría"
                    hint="Reemplazará el nombre en toda la app y pestañas"
                  />

                  <Input
                    label="Lema o Eslogan"
                    value={formData.lema_negocio}
                    onChange={(e) => handleChange('lema_negocio', e.target.value)}
                    placeholder="Ej. Cuidamos tu tiempo y bienestar"
                    hint="Visible en pantallas de login y bienvenida"
                  />
                </div>

                <Input
                  label="Texto del Pie de Página (Copyright)"
                  value={formData.texto_pie_pagina}
                  onChange={(e) => handleChange('texto_pie_pagina', e.target.value)}
                  placeholder="© 2026 Tu Negocio. Todos los derechos reservados."
                />
              </div>

              {/* Logotipos y Favicon */}
              <div className="card p-6 border border-slate-100 dark:border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                    Logotipos Corporativos & Favicon
                  </h3>
                  <span className="text-[11px] text-slate-400 flex items-center gap-1">
                    <UploadCloud className="w-3.5 h-3.5" />
                    PNG, SVG o WebP
                  </span>
                </div>

                <div className="space-y-3">
                  <Input
                    label="URL Logo Principal (Modo Claro)"
                    value={formData.logo_url}
                    onChange={(e) => handleChange('logo_url', e.target.value)}
                    placeholder="https://ejemplo.com/logo-principal.png"
                    hint="Aparecerá en el Navbar superior y comprobantes"
                  />

                  <Input
                    label="URL Logo Tema Oscuro (Opcional)"
                    value={formData.logo_dark_url}
                    onChange={(e) => handleChange('logo_dark_url', e.target.value)}
                    placeholder="https://ejemplo.com/logo-dark.png"
                    hint="Se aplicará cuando el usuario active el modo oscuro"
                  />

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input
                      label="URL Isotipo / Icono Reducido"
                      value={formData.logo_icono_url}
                      onChange={(e) => handleChange('logo_icono_url', e.target.value)}
                      placeholder="https://ejemplo.com/icono.png"
                      hint="Visible cuando la barra lateral está colapsada"
                    />

                    <Input
                      label="URL Favicon (.ico o .svg)"
                      value={formData.favicon_url}
                      onChange={(e) => handleChange('favicon_url', e.target.value)}
                      placeholder="https://ejemplo.com/favicon.ico"
                      hint="Icono de la pestaña del navegador"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: ASPECTO VISUAL & PRESETS */}
          {tabActivo === 'apariencia' && (
            <div className="space-y-6">
              {/* Presets Visuales Predefinidos (1-Click) */}
              <div className="card p-6 border border-slate-100 dark:border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-primary-500" />
                      Presets de Diseño (1-Click)
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Plantillas completas de color, tipografía, bordes y sombras para diferentes verticales.
                    </p>
                  </div>
                  {formData.preset_nombre && (
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-primary-50 dark:bg-primary-950/40 text-primary-700 dark:text-primary-300">
                      Actual: {formData.preset_nombre}
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {Object.values(THEME_PRESETS).map((preset) => {
                    const isSelected = formData.preset_nombre === preset.name
                    return (
                      <div
                        key={preset.id}
                        className={[
                          'p-4 rounded-xl border text-left flex flex-col justify-between transition-all space-y-3',
                          isSelected
                            ? 'border-primary-500 ring-2 ring-primary-500/20 bg-primary-50/20 dark:bg-primary-950/20'
                            : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900',
                        ].join(' ')}
                      >
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-sm text-slate-900 dark:text-slate-100">
                              {preset.name}
                            </span>
                            <div className="flex items-center gap-1">
                              {preset.previewColors.map((color, idx) => (
                                <span
                                  key={idx}
                                  className="w-3.5 h-3.5 rounded-full border border-black/10 inline-block shadow-xs"
                                  style={{ backgroundColor: color }}
                                />
                              ))}
                            </div>
                          </div>
                          <p className="text-[11px] font-medium text-primary-600 dark:text-primary-400">
                            {preset.category}
                          </p>
                          <p className="text-xs text-slate-500 dark:text-slate-400 leading-snug">
                            {preset.description}
                          </p>
                        </div>

                        <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                          <span>{preset.config.typography.fontBody} • {preset.config.radius}</span>
                          <button
                            type="button"
                            onClick={() => handleAplicarPreset(preset.id)}
                            className={[
                              'px-2.5 py-1 rounded-lg font-semibold transition-all',
                              isSelected
                                ? 'bg-primary-600 text-white'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-primary-50 dark:hover:bg-primary-950 hover:text-primary-600',
                            ].join(' ')}
                          >
                            {isSelected ? 'Activo' : 'Aplicar'}
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Paletas de Colores */}
              <div className="card p-6 border border-slate-100 dark:border-slate-800 space-y-4">
                <div>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                    Paleta de Color Primaria
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Selecciona una paleta diseñada por expertos o escribe tu color de marca exacto.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {(Object.keys(PALETAS_PREDEFINIDAS) as PaletaColor[]).map((key) => {
                    const item = PALETAS_PREDEFINIDAS[key]
                    const activo = formData.paleta_predefinida === key

                    return (
                      <button
                        key={key}
                        type="button"
                        onClick={() => handleSeleccionarPaleta(key)}
                        className={[
                          'p-3.5 rounded-xl border text-left flex items-start gap-3 transition-all',
                          activo
                            ? 'border-primary-500 ring-2 ring-primary-500/20 bg-primary-50/30 dark:bg-primary-950/20'
                            : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900',
                        ].join(' ')}
                      >
                        <div
                          className="w-8 h-8 rounded-lg shrink-0 flex items-center justify-center shadow-xs"
                          style={{ backgroundColor: item.hex }}
                        >
                          {activo && <Check className="w-4 h-4 text-white" />}
                        </div>
                        <div className="space-y-0.5 min-w-0">
                          <p className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                            {item.nombre}
                          </p>
                          <p className="text-[11px] text-slate-400 leading-tight">
                            {item.desc}
                          </p>
                        </div>
                      </button>
                    )
                  })}
                </div>

                {/* Color Hexadecimal Libre */}
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={formData.color_primario}
                      onChange={(e) => {
                        handleChange('color_primario', e.target.value)
                        handleChange('paleta_predefinida', 'custom')
                      }}
                      className="w-10 h-10 rounded-xl cursor-pointer border border-slate-200 dark:border-slate-700 p-0.5"
                    />
                    <div>
                      <span className="text-xs text-slate-400 block">Color Primario HEX:</span>
                      <span className="font-mono font-bold text-xs text-slate-800 dark:text-slate-200">
                        {formData.color_primario.toUpperCase()}
                      </span>
                    </div>
                  </div>

                  <div className="flex-1">
                    <Input
                      value={formData.color_primario}
                      onChange={(e) => {
                        handleChange('color_primario', e.target.value)
                        handleChange('paleta_predefinida', 'custom')
                      }}
                      placeholder="#6366f1"
                    />
                  </div>
                </div>
              </div>

              {/* Tipografía Corporativa */}
              <div className="card p-6 border border-slate-100 dark:border-slate-800 space-y-4">
                <div>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                    Fuente Tipográfica Corporativa
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Se cargará e inyectará automáticamente desde Google Fonts en toda la aplicación.
                  </p>
                </div>

                <div className="space-y-2">
                  {FUENTES_DISPONIBLES.map((f) => {
                    const seleccionado = formData.fuente_tipografica === f.id
                    return (
                      <button
                        key={f.id}
                        type="button"
                        onClick={() => handleChange('fuente_tipografica', f.id)}
                        className={[
                          'w-full p-3 rounded-xl border text-left flex items-center justify-between transition-all',
                          seleccionado
                            ? 'border-primary-500 bg-primary-50/20 dark:bg-primary-950/20 ring-1 ring-primary-500'
                            : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700',
                        ].join(' ')}
                      >
                        <div style={{ fontFamily: `"${f.id}", sans-serif` }}>
                          <span className="font-bold text-sm text-slate-900 dark:text-slate-100 block">
                            {f.nombre}
                          </span>
                          <span className="text-xs text-slate-400">{f.ejemplo}</span>
                        </div>
                        {seleccionado && <Check className="w-4 h-4 text-primary-600" />}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Geometría: Radio de Esquinas (Border Radius) */}
              <div className="card p-6 border border-slate-100 dark:border-slate-800 space-y-4">
                <div>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                    Estilo de Botones, Inputs y Tarjetas (Bordes)
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Define la curvatura arquitectónica de botones, inputs y contenedores.
                  </p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {RADIOS_DISPONIBLES.map((r) => {
                    const activo = formData.radio_esquinas === r.id
                    return (
                      <button
                        key={r.id}
                        type="button"
                        onClick={() => handleChange('radio_esquinas', r.id)}
                        className={[
                          'p-3.5 border text-center transition-all flex flex-col items-center gap-2 rounded-xl',
                          activo
                            ? 'border-primary-500 bg-primary-50/20 dark:bg-primary-950/20 ring-1 ring-primary-500'
                            : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700',
                        ].join(' ')}
                      >
                        <div
                          className={`w-10 h-10 bg-slate-300 dark:bg-slate-700 ${r.clase} shadow-xs flex items-center justify-center`}
                        >
                          {activo && <Check className="w-4 h-4 text-primary-600" />}
                        </div>
                        <div>
                          <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 block">
                            {r.nombre}
                          </span>
                          <span className="text-[10px] text-slate-400 block">{r.px}</span>
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Profundidad: Sombras y Elevación */}
              <div className="card p-6 border border-slate-100 dark:border-slate-800 space-y-4">
                <div>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
                    <Layers className="w-4 h-4 text-primary-500" />
                    Profundidad y Sombras (Elevación)
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Controla el nivel de relieve y sombras proyectadas en tarjetas, menús y modales.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {SOMBRAS_DISPONIBLES.map((s) => {
                    const activo = (formData.sombras || 'subtle') === s.id
                    return (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => handleChange('sombras', s.id)}
                        className={[
                          'p-4 rounded-xl border text-left transition-all space-y-3',
                          activo
                            ? 'border-primary-500 ring-2 ring-primary-500/20 bg-primary-50/20 dark:bg-primary-950/20'
                            : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900',
                        ].join(' ')}
                      >
                        <div className={`h-12 rounded-lg bg-white dark:bg-slate-800 flex items-center justify-center ${s.previewClass}`}>
                          <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                            {s.nombre.split(' ')[0]}
                          </span>
                        </div>
                        <div className="space-y-1">
                          <p className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center justify-between">
                            <span>{s.nombre}</span>
                            {activo && <Check className="w-3.5 h-3.5 text-primary-600" />}
                          </p>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight">
                            {s.desc}
                          </p>
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Densidad de la Interfaz */}
              <div className="card p-6 border border-slate-100 dark:border-slate-800 space-y-4">
                <div>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
                    <Sliders className="w-4 h-4 text-primary-500" />
                    Densidad de la Interfaz
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Ajusta el espaciado interior (padding y gaps) para adaptar la densidad visual.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {DENSIDADES_DISPONIBLES.map((d) => {
                    const activo = (formData.densidad || 'comfortable') === d.id
                    return (
                      <button
                        key={d.id}
                        type="button"
                        onClick={() => handleChange('densidad', d.id)}
                        className={[
                          'p-4 rounded-xl border text-left transition-all space-y-2',
                          activo
                            ? 'border-primary-500 ring-2 ring-primary-500/20 bg-primary-50/20 dark:bg-primary-950/20'
                            : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900',
                        ].join(' ')}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                            {d.nombre}
                          </span>
                          {activo && <Check className="w-3.5 h-3.5 text-primary-600" />}
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight">
                          {d.desc}
                        </p>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Modo Visual (Claro / Oscuro / Sistema) */}
              <div className="card p-6 border border-slate-100 dark:border-slate-800 space-y-4">
                <div>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
                    <Sun className="w-4 h-4 text-primary-500" />
                    Modo Visual de la Sede
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Configura la apariencia inicial o forzada para los usuarios de este tenant.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {MODOS_DISPONIBLES.map((m) => {
                    const activo = (formData.modo_visual || 'light') === m.id
                    const IconComponent = m.icon
                    return (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => handleChange('modo_visual', m.id)}
                        className={[
                          'p-4 rounded-xl border text-left transition-all flex items-start gap-3',
                          activo
                            ? 'border-primary-500 ring-2 ring-primary-500/20 bg-primary-50/20 dark:bg-primary-950/20'
                            : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900',
                        ].join(' ')}
                      >
                        <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 shrink-0">
                          <IconComponent className="w-4 h-4" />
                        </div>
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                              {m.nombre}
                            </span>
                            {activo && <Check className="w-3.5 h-3.5 text-primary-600" />}
                          </div>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight">
                            {m.desc}
                          </p>
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: WIDGET EMBEBIBLE */}
          {tabActivo === 'widget' && (
            <GeneradorWidgetEmbebible configuracion={formData} />
          )}

          {/* TAB 4: NEGOCIO & DATOS REGIONALES */}
          {tabActivo === 'negocio' && (
            <div className="space-y-5">
              <div className="card p-6 border border-slate-100 dark:border-slate-800 space-y-4">
                <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                  Moneda & Configuración Horaria
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Moneda Principal
                    </label>
                    <select
                      value={formData.moneda}
                      onChange={(e) => {
                        const m = e.target.value
                        let sim = '$'
                        if (m === 'EUR') sim = '€'
                        if (m === 'GBP') sim = '£'
                        handleChange('moneda', m)
                        handleChange('simbolo_moneda', sim)
                      }}
                      className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-slate-200"
                    >
                      <option value="USD">Dólar Estadounidense (USD - $)</option>
                      <option value="EUR">Euro (EUR - €)</option>
                      <option value="MXN">Peso Mexicano (MXN - $)</option>
                      <option value="COP">Peso Colombiano (COP - $)</option>
                      <option value="ARS">Peso Argentino (ARS - $)</option>
                      <option value="CLP">Peso Chileno (CLP - $)</option>
                      <option value="PEN">Sol Peruano (PEN - S/)</option>
                      <option value="GBP">Libra Esterlina (GBP - £)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Zona Horaria del Negocio
                    </label>
                    <select
                      value={formData.zona_horaria}
                      onChange={(e) => handleChange('zona_horaria', e.target.value)}
                      className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-slate-200"
                    >
                      <option value="America/New_York">América / New York (UTC-5)</option>
                      <option value="America/Mexico_City">América / Ciudad de México (UTC-6)</option>
                      <option value="America/Bogota">América / Bogotá (UTC-5)</option>
                      <option value="America/Lima">América / Lima (UTC-5)</option>
                      <option value="America/Santiago">América / Santiago (UTC-4)</option>
                      <option value="America/Buenos_Aires">América / Buenos Aires (UTC-3)</option>
                      <option value="Europe/Madrid">Europa / Madrid (UTC+1)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Formato de Horas
                    </label>
                    <div className="flex gap-2">
                      {(['12h', '24h'] as const).map((fmt) => (
                        <button
                          key={fmt}
                          type="button"
                          onClick={() => handleChange('formato_hora', fmt)}
                          className={[
                            'flex-1 py-2 text-xs font-semibold rounded-xl border transition-all',
                            formData.formato_hora === fmt
                              ? 'border-primary-500 bg-primary-50/20 text-primary-600'
                              : 'border-slate-200 dark:border-slate-800 text-slate-500',
                          ].join(' ')}
                        >
                          {fmt === '12h' ? '12 Horas (02:30 PM)' : '24 Horas (14:30)'}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Formato de Fechas
                    </label>
                    <select
                      value={formData.formato_fecha}
                      onChange={(e) => handleChange('formato_fecha', e.target.value as 'DD/MM/YYYY' | 'YYYY-MM-DD')}
                      className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-slate-200"
                    >
                      <option value="DD/MM/YYYY">DD/MM/YYYY (Ej. 17/09/2026)</option>
                      <option value="YYYY-MM-DD">YYYY-MM-DD (Ej. 2026-09-17)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Canales Oficiales de Atención */}
              <div className="card p-6 border border-slate-100 dark:border-slate-800 space-y-4">
                <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                  Canales Oficiales de Soporte & Legal
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Correo Electrónico de Contacto"
                    value={formData.email_soporte}
                    onChange={(e) => handleChange('email_soporte', e.target.value)}
                    placeholder="contacto@tunegocio.com"
                  />

                  <Input
                    label="Teléfono / WhatsApp de Soporte"
                    value={formData.telefono_soporte}
                    onChange={(e) => handleChange('telefono_soporte', e.target.value)}
                    placeholder="+1 555-0900"
                  />
                </div>

                <Input
                  label="Sitio Web Oficial"
                  value={formData.sitio_web}
                  onChange={(e) => handleChange('sitio_web', e.target.value)}
                  placeholder="https://tunegocio.com"
                  leftIcon={<Globe className="w-4 h-4 text-slate-400" />}
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <Input
                    label="URL de Términos y Condiciones"
                    value={formData.url_terminos ?? ''}
                    onChange={(e) => handleChange('url_terminos', e.target.value)}
                    placeholder="https://tunegocio.com/terminos"
                  />

                  <Input
                    label="URL de Política de Privacidad"
                    value={formData.url_privacidad ?? ''}
                    onChange={(e) => handleChange('url_privacidad', e.target.value)}
                    placeholder="https://tunegocio.com/privacidad"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Panel Lateral: Previsualizador en Vivo (Sticky) */}
        <div className="lg:col-span-5 sticky top-20 space-y-4">
          <PrevisualizadorMarcaBlanca configuracion={formData} />
        </div>
      </div>

      {/* Modal de Importación de Tema */}
      <Modal
        isOpen={modalImportar}
        onClose={() => setModalImportar(false)}
        title="Importar Configuración de Tema Visual"
        size="lg"
        footer={
          <div className="flex items-center justify-end gap-2">
            <Button variant="secondary" size="sm" onClick={() => setModalImportar(false)}>
              Cancelar
            </Button>
            <Button
              size="sm"
              disabled={!jsonImportar.trim()}
              onClick={() => handleProcesarImportacion(jsonImportar)}
            >
              Validar y Aplicar Tema
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            Puedes cargar un archivo de tema (<code>.json</code>) exportado previamente o pegar el
            contenido JSON en el editor. El sistema validará exhaustivamente la estructura y
            garantizará que no contenga credenciales ni claves privadas.
          </p>

          <div className="flex items-center gap-3">
            <input
              type="file"
              ref={fileInputRef}
              accept=".json,application/json"
              onChange={handleFileChange}
              className="hidden"
            />
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              leftIcon={<FileJson className="w-4 h-4" />}
            >
              Seleccionar Archivo JSON
            </Button>
            <span className="text-xs text-slate-400">o pega el JSON directamente abajo:</span>
          </div>

          <div>
            <textarea
              rows={8}
              value={jsonImportar}
              onChange={(e) => setJsonImportar(e.target.value)}
              placeholder='{\n  "version": "1.0.0",\n  "brand": { "name": "Mi Negocio" },\n  "colors": { "primary": "#2563eb" },\n  "typography": { "fontBody": "Poppins" },\n  "radius": "moderno",\n  "shadows": "subtle",\n  "density": "comfortable",\n  "mode": "light"\n}'
              className="w-full font-mono text-xs p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          {erroresImportacion.length > 0 && (
            <div className="p-3.5 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/40 text-xs space-y-1.5 text-red-700 dark:text-red-300">
              <div className="flex items-center gap-1.5 font-bold">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>El tema no pasó la validación de seguridad e integridad:</span>
              </div>
              <ul className="list-disc list-inside space-y-0.5 text-[11px] pl-1">
                {erroresImportacion.map((err, i) => (
                  <li key={i}>{err}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </Modal>
    </div>
  )
}
