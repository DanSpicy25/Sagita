import { useState } from 'react'
import {
  Check,
  Sparkles,
  Layers,
  Sliders,
  Sun,
  Moon,
  Monitor,
  Type,
} from 'lucide-react'
import type {
  ConfiguracionMarcaBlanca,
  PaletaColor,
  FuenteTipografica,
  EscalaFuente,
  RadioEsquinas,
  EstiloSombras,
  Densidad,
  ModoVisual,
} from '@/types'
import { Input } from '@/components/ui'
import { PALETAS_PREDEFINIDAS } from '@/context/ConfiguracionContext'
import { THEME_PRESETS } from '@/config/themePresets'

export const FUENTES_DISPONIBLES: { id: FuenteTipografica; nombre: string; desc: string; sample: string }[] = [
  { id: 'Inter', nombre: 'Inter (Estándar)', desc: 'Técnica, neutral y de máxima legibilidad en interfaces complejas.', sample: 'The quick brown fox jumps over the lazy dog 12345' },
  { id: 'Plus Jakarta Sans', nombre: 'Plus Jakarta Sans', desc: 'Geométrica, moderna y sofisticada. Ideal para marcas premium.', sample: 'The quick brown fox jumps over the lazy dog 12345' },
  { id: 'DM Sans', nombre: 'DM Sans', desc: 'Limpia, balanceada y de fácil escaneo visual para dashboards.', sample: 'The quick brown fox jumps over the lazy dog 12345' },
  { id: 'Geist', nombre: 'Geist Sans', desc: 'Estética de ingeniería desarrollada por Vercel para SaaS moderno.', sample: 'The quick brown fox jumps over the lazy dog 12345' },
  { id: 'Outfit', nombre: 'Outfit', desc: 'Vanguardista, amigable y contemporánea para comercio y moda.', sample: 'The quick brown fox jumps over the lazy dog 12345' },
  { id: 'Poppins', nombre: 'Poppins', desc: 'Geométrica con curvas suaves, muy acogedora para salud y belleza.', sample: 'The quick brown fox jumps over the lazy dog 12345' },
  { id: 'Montserrat', nombre: 'Montserrat', desc: 'Elegante, estructurada y corporativa con alta presencia visual.', sample: 'The quick brown fox jumps over the lazy dog 12345' },
  { id: 'Roboto', nombre: 'Roboto', desc: 'Sólida, universal y con renderizado perfecto en cualquier pantalla.', sample: 'The quick brown fox jumps over the lazy dog 12345' },
]

export const ESCALAS_DISPONIBLES: { id: EscalaFuente; nombre: string; desc: string; size: string }[] = [
  { id: 'compacto', nombre: 'Compacto (13px)', desc: 'Alta densidad. Ideal para terminales POS y pantallas con muchos datos.', size: '13px' },
  { id: 'normal', nombre: 'Normal (14px)', desc: 'Estándar empresarial equilibrado y versátil.', size: '14px' },
  { id: 'comodo', nombre: 'Cómodo (15px)', desc: 'Lectura descansada y agradable en tablets y portátiles.', size: '15px' },
  { id: 'grande', nombre: 'Grande (16px)', desc: 'Tipografía agrandada para kioscos táctiles y máxima accesibilidad.', size: '16px' },
]

export const RADIOS_DISPONIBLES: { id: RadioEsquinas; nombre: string; clase: string; px: string }[] = [
  { id: 'cuadrado', nombre: 'Cuadrado', clase: 'rounded-none', px: '0px' },
  { id: 'suave', nombre: 'Suave', clase: 'rounded-md', px: '4-8px' },
  { id: 'moderno', nombre: 'Moderno', clase: 'rounded-xl', px: '8-12px' },
  { id: 'pronunciado', nombre: 'Pronunciado', clase: 'rounded-2xl', px: '16-24px' },
]

export const SOMBRAS_DISPONIBLES: { id: EstiloSombras; nombre: string; desc: string; previewClass: string }[] = [
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

export const DENSIDADES_DISPONIBLES: { id: Densidad; nombre: string; desc: string }[] = [
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

export const MODOS_DISPONIBLES: { id: ModoVisual; nombre: string; desc: string; icon: typeof Sun }[] = [
  { id: 'light', nombre: 'Modo Claro', desc: 'Fondo blanco y contrastes luminosos', icon: Sun },
  { id: 'dark', nombre: 'Modo Oscuro', desc: 'Fondo nocturno para baja luminosidad', icon: Moon },
  { id: 'system', nombre: 'Automático', desc: 'Sigue la preferencia del sistema operativo', icon: Monitor },
]

interface TabTipografiaDisenoProps {
  formData: ConfiguracionMarcaBlanca
  onChange: <K extends keyof ConfiguracionMarcaBlanca>(
    campo: K,
    valor: ConfiguracionMarcaBlanca[K]
  ) => void
  onSeleccionarPaleta: (paleta: PaletaColor) => void
  onAplicarPreset: (presetId: string) => void
}

export function TabTipografiaDiseno({
  formData,
  onChange,
  onSeleccionarPaleta,
  onAplicarPreset,
}: TabTipografiaDisenoProps) {
  const [textoMuestra, setTextoMuestra] = useState('Gestiona tu negocio con precisión absoluta y diseño a medida.')

  return (
    <div className="space-y-6">
      {/* Presets Visuales Predefinidos (1-Click) */}
      <div className="card p-6 border border-slate-100 dark:border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary-500" />
              Presets de Diseño Empresarial (1-Click)
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Plantillas de diseño para diferentes sectores: salud, corporativo, estética, retail o minimalista.
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
                    onClick={() => onAplicarPreset(preset.id)}
                    className={[
                      'px-2.5 py-1 rounded-lg font-semibold transition-all cursor-pointer',
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

      {/* Paletas de Color */}
      <div className="card p-6 border border-slate-100 dark:border-slate-800 space-y-4">
        <div>
          <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">
            Paleta de Color Primaria & Marca
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Selecciona una armonía cromática predefinida o ingresa el código HEX de tu manual de marca.
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
                onClick={() => onSeleccionarPaleta(key)}
                className={[
                  'p-3.5 rounded-xl border text-left flex items-start gap-3 transition-all cursor-pointer',
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
                onChange('color_primario', e.target.value)
                onChange('paleta_predefinida', 'custom')
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
                onChange('color_primario', e.target.value)
                onChange('paleta_predefinida', 'custom')
              }}
              placeholder="#6366f1"
            />
          </div>
        </div>
      </div>

      {/* Tipografía Corporativa y Muestrario Interactivo */}
      <div className="card p-6 border border-slate-100 dark:border-slate-800 space-y-5">
        <div>
          <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Type className="w-4 h-4 text-primary-500" />
            Tipografía Corporativa & Escala Visual
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Personaliza la familia tipográfica, el tamaño global de fuente y experimenta con la muestra en vivo.
          </p>
        </div>

        {/* Muestrario de Fuentes con Tarjetas Visuales */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {FUENTES_DISPONIBLES.map((f) => {
            const seleccionado = formData.fuente_tipografica === f.id
            return (
              <button
                key={f.id}
                type="button"
                onClick={() => onChange('fuente_tipografica', f.id)}
                className={[
                  'p-4 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between space-y-2',
                  seleccionado
                    ? 'border-primary-500 bg-primary-50/20 dark:bg-primary-950/20 ring-2 ring-primary-500/20 shadow-xs'
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900',
                ].join(' ')}
              >
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span
                      className="font-bold text-base text-slate-900 dark:text-slate-100"
                      style={{ fontFamily: `"${f.id}", sans-serif` }}
                    >
                      {f.nombre}
                    </span>
                    {seleccionado && <Check className="w-4 h-4 text-primary-600 shrink-0" />}
                  </div>
                  <p className="text-[11px] text-slate-400 leading-snug">{f.desc}</p>
                </div>

                <div
                  className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 truncate"
                  style={{ fontFamily: `"${f.id}", sans-serif` }}
                >
                  <span className="font-semibold block text-[13px]">Aa Bb Gg 123</span>
                  <span className="text-[11px] text-slate-400 block truncate mt-0.5">{f.sample}</span>
                </div>
              </button>
            )
          })}
        </div>

        {/* Escala de Tamaño de Fuente Global */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
          <div>
            <h4 className="font-semibold text-xs text-slate-800 dark:text-slate-200">
              Escala de Tamaño de Fuente Global (Base Root)
            </h4>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Escala toda la tipografía de Sagitta (13px a 16px) para adaptarse a monitores grandes, portátiles o kioscos táctiles.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {ESCALAS_DISPONIBLES.map((esc) => {
              const activo = (formData.escala_fuente || 'normal') === esc.id
              return (
                <button
                  key={esc.id}
                  type="button"
                  onClick={() => onChange('escala_fuente', esc.id)}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                    activo
                      ? 'border-primary-500 bg-primary-50/20 dark:bg-primary-950/20 ring-1 ring-primary-500 shadow-xs'
                      : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 bg-white dark:bg-slate-900'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-xs text-slate-900 dark:text-slate-100 font-mono">
                      {esc.size}
                    </span>
                    {activo && <Check className="w-3.5 h-3.5 text-primary-600" />}
                  </div>
                  <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">{esc.nombre}</p>
                  <p className="text-[10px] text-slate-400 mt-0.5 leading-tight">{esc.desc}</p>
                </button>
              )
            })}
          </div>
        </div>

        {/* Banco de Pruebas de Tipografía en Vivo */}
        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/50 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Banco de Pruebas en Vivo (Edita el texto para evaluar legibilidad):
            </span>
            <span className="text-[10px] font-mono text-primary-600 font-semibold">
              Fuente: {formData.fuente_tipografica} · Escala: {formData.escala_fuente || 'normal'}
            </span>
          </div>
          <input
            type="text"
            value={textoMuestra}
            onChange={(e) => setTextoMuestra(e.target.value)}
            className="w-full text-base font-medium px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
            style={{ fontFamily: `"${formData.fuente_tipografica}", sans-serif` }}
          />
        </div>
      </div>

      {/* Geometría: Radio de Esquinas */}
      <div className="card p-6 border border-slate-100 dark:border-slate-800 space-y-4">
        <div>
          <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">
            Estilo de Botones, Inputs y Tarjetas (Radio de Esquinas)
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
                onClick={() => onChange('radio_esquinas', r.id)}
                className={[
                  'p-3.5 border text-center transition-all flex flex-col items-center gap-2 rounded-xl cursor-pointer',
                  activo
                    ? 'border-primary-500 bg-primary-50/20 dark:bg-primary-950/20 ring-1 ring-primary-500'
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900',
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
                onClick={() => onChange('sombras', s.id)}
                className={[
                  'p-4 rounded-xl border text-left transition-all space-y-3 cursor-pointer',
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
                onClick={() => onChange('densidad', d.id)}
                className={[
                  'p-4 rounded-xl border text-left transition-all space-y-2 cursor-pointer',
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
                onClick={() => onChange('modo_visual', m.id)}
                className={[
                  'p-4 rounded-xl border text-left transition-all flex items-start gap-3 cursor-pointer',
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
  )
}

