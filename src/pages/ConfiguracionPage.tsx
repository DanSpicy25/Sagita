import { useState, FormEvent } from 'react'
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
} from 'lucide-react'
import {
  useConfiguracion,
  PALETAS_PREDEFINIDAS,
} from '@/context/ConfiguracionContext'
import {
  ConfiguracionMarcaBlanca,
  PaletaColor,
  FuenteTipografica,
  RadioEsquinas,
} from '@/types'
import { Button, Input } from '@/components/ui'
import {
  PrevisualizadorMarcaBlanca,
  GeneradorWidgetEmbebible,
} from '@/components/configuracion'
import { useToast } from '@/hooks/useToast'

type TabConfig = 'marca_blanca' | 'apariencia' | 'widget' | 'negocio'

const FUENTES_DISPONIBLES: { id: FuenteTipografica; nombre: string; ejemplo: string }[] = [
  { id: 'Inter', nombre: 'Inter (Por defecto)', ejemplo: 'Moderna, técnica y altamente legible' },
  { id: 'Roboto', nombre: 'Roboto', ejemplo: 'Limpia, geométrica y balanceada' },
  { id: 'Poppins', nombre: 'Poppins', ejemplo: 'Amigable, redondeada y contemporánea' },
  { id: 'Montserrat', nombre: 'Montserrat', ejemplo: 'Elegante, estructurada y corporativa' },
  { id: 'Outfit', nombre: 'Outfit', ejemplo: 'Vanguardista, fresca y premium' },
]

const RADIOS_DISPONIBLES: { id: RadioEsquinas; nombre: string; clase: string }[] = [
  { id: 'cuadrado', nombre: 'Cuadrado (0px)', clase: 'rounded-none' },
  { id: 'suave', nombre: 'Suave (6px)', clase: 'rounded-md' },
  { id: 'moderno', nombre: 'Moderno (14px)', clase: 'rounded-xl' },
  { id: 'pronunciado', nombre: 'Pronunciado (18px)', clase: 'rounded-2xl' },
]

export default function ConfiguracionPage() {
  const {
    configuracion,
    actualizarConfiguracion,
    resetConfiguracion,
    cargando,
  } = useConfiguracion()
  const { toast } = useToast()

  const [tabActivo, setTabActivo] = useState<TabConfig>('marca_blanca')
  const [formData, setFormData] = useState<ConfiguracionMarcaBlanca>({ ...configuracion })
  const [guardando, setGuardando] = useState(false)

  // Manejar cambios en el formulario local
  const handleChange = <K extends keyof ConfiguracionMarcaBlanca>(
    campo: K,
    valor: ConfiguracionMarcaBlanca[K]
  ) => {
    setFormData((prev) => ({
      ...prev,
      [campo]: valor,
    }))
  }

  // Selección de paleta predefinida
  const handleSeleccionarPaleta = (paletaKey: PaletaColor) => {
    const paleta = PALETAS_PREDEFINIDAS[paletaKey]
    setFormData((prev) => ({
      ...prev,
      paleta_predefinida: paletaKey,
      color_primario: paleta.hex,
    }))
  }

  // Guardar configuración en API y Contexto
  const handleSubmit = async (e?: FormEvent) => {
    if (e) e.preventDefault()
    setGuardando(true)
    try {
      await actualizarConfiguracion(formData)
      toast.success('Configuración guardada', 'Los cambios de marca blanca y diseño se han aplicado')
    } catch {
      toast.error('Error al guardar', 'No se pudo sincronizar la configuración con el servidor')
    } finally {
      setGuardando(false)
    }
  }

  // Restaurar por defecto
  const handleReset = async () => {
    if (!confirm('¿Deseas restaurar toda la configuración de marca blanca a los valores de fábrica?')) {
      return
    }
    setGuardando(true)
    try {
      await resetConfiguracion()
      toast.info('Configuración restaurada', 'Se restablecieron los valores por defecto')
      setFormData({ ...configuracion })
    } catch {
      toast.error('Error', 'No se pudo restablecer la configuración')
    } finally {
      setGuardando(false)
    }
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
            Personaliza el nombre comercial, logotipos, paleta de colores, widget embebible y directrices del sistema
          </p>
        </div>

        <div className="flex items-center gap-2">
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
          Aspecto Visual & Temas
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
                      Oculta completamente toda referencia a la plataforma base (Sagitta),
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
                    placeholder="Ej. Clínica Dental Sonrisas"
                    hint="Reemplazará el nombre en toda la app y pestañas"
                  />

                  <Input
                    label="Lema o Eslogan"
                    value={formData.lema_negocio}
                    onChange={(e) => handleChange('lema_negocio', e.target.value)}
                    placeholder="Ej. Cuidamos tu salud cada día"
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

          {/* TAB 2: ASPECTO VISUAL & TEMAS */}
          {tabActivo === 'apariencia' && (
            <div className="space-y-6">
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
                    Se cargará e inyectará automáticamente desde Google Fonts en todo el sitio.
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

              {/* Radio de Esquinas (Border Radius) */}
              <div className="card p-6 border border-slate-100 dark:border-slate-800 space-y-4">
                <div>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                    Estilo de Botones y Tarjetas (Bordes)
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Define la curvatura de botones, inputs y contenedores.
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
                          'p-3 border text-center transition-all flex flex-col items-center gap-2',
                          r.clase,
                          activo
                            ? 'border-primary-500 bg-primary-50/20 dark:bg-primary-950/20 ring-1 ring-primary-500'
                            : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700',
                        ].join(' ')}
                      >
                        <div
                          className={`w-8 h-8 bg-slate-300 dark:bg-slate-700 ${r.clase}`}
                        />
                        <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                          {r.nombre}
                        </span>
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
    </div>
  )
}

