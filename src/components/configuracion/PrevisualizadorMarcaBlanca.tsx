import type { ConfiguracionMarcaBlanca } from '@/types'
import { Check, Sparkles, Calendar, Star, ShieldCheck } from 'lucide-react'

interface Props {
  configuracion: ConfiguracionMarcaBlanca
}

export function PrevisualizadorMarcaBlanca({ configuracion }: Props) {
  const {
    nombre_negocio,
    lema_negocio,
    logo_url,
    favicon_url,
    titulo_pestana,
    color_primario,
    radio_esquinas,
    marca_blanca_activa,
    ocultar_marca_sistema,
    texto_pie_pagina,
    mostrar_powered_by,
    texto_powered_by,
    fuente_tipografica,
    escala_fuente,
    sombras,
    densidad,
    preset_nombre,
  } = configuracion

  // Determinar clases de radio
  const radiusClass = {
    cuadrado: 'rounded-none',
    suave: 'rounded-md',
    moderno: 'rounded-xl',
    pronunciado: 'rounded-2xl',
  }[radio_esquinas] ?? 'rounded-xl'

  const shadowClass = {
    none: 'shadow-none',
    subtle: 'shadow-sm',
    elevated: 'shadow-lg',
  }[sombras || 'subtle'] ?? 'shadow-sm'

  const densityPadding = {
    compact: 'p-3 space-y-3',
    comfortable: 'p-4 space-y-4',
    spacious: 'p-5 space-y-5',
  }[densidad || 'comfortable'] ?? 'p-4 space-y-4'

  const fontSizeMap = {
    compacto: '13px',
    normal: '14px',
    comodo: '15px',
    grande: '16px',
  }
  const baseFontSize = fontSizeMap[escala_fuente || 'normal'] || '14px'

  const businessSlug = (nombre_negocio || 'sagitta')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '') || 'mitienda'

  return (
    <div className="card border border-slate-200 dark:border-slate-800 p-5 space-y-4 shadow-card overflow-hidden">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-primary-500" />
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">
            Vista Previa de Marca & Navegador
          </h3>
          {preset_nombre && (
            <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-primary-100 dark:bg-primary-950/60 text-primary-700 dark:text-primary-300">
              {preset_nombre}
            </span>
          )}
        </div>
        {marca_blanca_activa && ocultar_marca_sistema ? (
          <span className="px-2 py-0.5 text-[10px] font-bold uppercase rounded bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 flex items-center gap-1">
            <ShieldCheck className="w-3 h-3" />
            100% White-Label
          </span>
        ) : (
          <span className="text-[11px] text-slate-400 font-mono">
            {baseFontSize} · {fuente_tipografica}
          </span>
        )}
      </div>

      {/* Simulación de Ventana de Navegador Realista */}
      <div className={`rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-200 dark:bg-slate-900 overflow-hidden ${shadowClass}`}>
        {/* Barra superior de pestañas del navegador */}
        <div className="bg-slate-300/70 dark:bg-slate-950 px-3 pt-2.5 pb-0 flex items-center gap-2">
          {/* Botones de ventana macOS / Chrome */}
          <div className="flex gap-1.5 mr-1 mb-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-red-400 inline-block" />
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block" />
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 inline-block" />
          </div>

          {/* Pestaña Activa con Favicon y Título */}
          <div className="flex-1 max-w-[260px] bg-white dark:bg-slate-900 text-[11px] font-medium px-2.5 py-1.5 rounded-t-lg text-slate-800 dark:text-slate-200 truncate flex items-center justify-between gap-1.5 border-t border-x border-slate-300 dark:border-slate-800 shadow-xs">
            <div className="flex items-center gap-1.5 truncate">
              {favicon_url ? (
                <img
                  src={favicon_url}
                  alt="Favicon"
                  className="w-3.5 h-3.5 rounded-xs object-contain shrink-0"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none'
                  }}
                />
              ) : (
                <div
                  className="w-3.5 h-3.5 rounded-xs flex items-center justify-center text-white font-bold text-[8px] shrink-0"
                  style={{ backgroundColor: color_primario }}
                >
                  {(nombre_negocio || 'S').charAt(0).toUpperCase()}
                </div>
              )}
              <span className="truncate font-semibold">
                {titulo_pestana || nombre_negocio || 'Sagitta Platform'}
              </span>
            </div>
            <span className="text-slate-400 text-xs hover:text-slate-600 cursor-pointer ml-1">×</span>
          </div>

          {/* Botón de nueva pestaña */}
          <span className="text-slate-400 text-xs px-1.5 mb-1 cursor-pointer">+</span>
        </div>

        {/* Barra de Direcciones URL */}
        <div className="bg-white dark:bg-slate-900 px-3 py-1.5 border-y border-slate-200 dark:border-slate-800 flex items-center gap-2">
          <div className="flex-1 bg-slate-100 dark:bg-slate-950 px-2.5 py-0.5 rounded-md border border-slate-200/80 dark:border-slate-800 text-[11px] font-mono text-slate-600 dark:text-slate-400 flex items-center gap-1.5 truncate">
            <span className="text-emerald-600 font-bold flex items-center gap-1">
              🔒 https://
            </span>
            <span className="truncate">portal.{businessSlug}.com/reservas</span>
          </div>
        </div>

        {/* Contenido Simulado de la App */}
        <div
          className={`bg-white dark:bg-slate-950 ${densityPadding}`}
          style={{
            fontFamily: `"${fuente_tipografica}", sans-serif`,
            fontSize: baseFontSize,
          }}
        >
          {/* Header Simulado */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2.5">
              {logo_url ? (
                <img
                  src={logo_url}
                  alt={nombre_negocio}
                  className="h-7 w-auto object-contain max-w-[120px]"
                />
              ) : (
                <div
                  className={`w-7 h-7 ${radiusClass} flex items-center justify-center text-white font-bold text-xs shadow-xs`}
                  style={{ backgroundColor: color_primario }}
                >
                  {(nombre_negocio || 'S').charAt(0).toUpperCase()}
                </div>
              )}
              <span className="font-bold text-sm text-slate-900 dark:text-slate-100">
                {nombre_negocio || 'Sagitta'}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[11px] text-slate-400 hidden sm:inline">Portal de Citas</span>
              <button
                type="button"
                className={`px-3 py-1 text-xs text-white font-semibold transition-all ${radiusClass}`}
                style={{ backgroundColor: color_primario }}
              >
                Reservar Cita
              </button>
            </div>
          </div>

          {/* Banner Hero Simulado */}
          <div
            className={`p-4 border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/40 ${radiusClass}`}
          >
            <div className="flex items-start gap-3">
              <div
                className={`w-9 h-9 ${radiusClass} flex items-center justify-center text-white shrink-0`}
                style={{ backgroundColor: color_primario }}
              >
                <Calendar className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                  Bienvenido a {nombre_negocio || 'Sagitta'}
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {lema_negocio || 'Gestiona tu cita en minutos con confirmación inmediata.'}
                </p>
              </div>
            </div>

            <div className="mt-3 pt-3 border-t border-slate-200/60 dark:border-slate-800 flex flex-wrap gap-2">
              {['Atención Inmediata', 'Confirmación por WhatsApp', 'Garantía de Servicio'].map((item) => (
                <span
                  key={item}
                  className={`px-2.5 py-0.5 text-[11px] font-medium bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 flex items-center gap-1 ${radiusClass}`}
                >
                  <Check className="w-3 h-3 text-emerald-500" />
                  {item}
                </span>
              ))}
            </div>
          </div>

          {/* Tarjeta de Servicio Destacado Simulado */}
          <div className={`p-3.5 border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 ${radiusClass} flex items-center justify-between gap-3 shadow-xs`}>
            <div>
              <div className="flex items-center gap-1.5">
                <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                <span className="font-bold text-xs text-slate-900 dark:text-slate-100">
                  Servicio Principal
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Duración: 45 min · Profesional asignado
              </p>
            </div>
            <span className="font-bold text-xs text-slate-900 dark:text-slate-100 font-mono">
              $45.00
            </span>
          </div>

          {/* Pie de Página Simulado */}
          <div className="pt-2 text-[11px] text-slate-400 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-1">
            <span>{texto_pie_pagina || '© 2026 Todos los derechos reservados.'}</span>
            {mostrar_powered_by && !ocultar_marca_sistema && (
              <span className="text-[10px] text-slate-400">
                {texto_powered_by || 'Powered by Sagitta Platform'}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="bg-slate-50 dark:bg-slate-800/40 p-3 rounded-xl text-xs space-y-1 text-slate-600 dark:text-slate-400">
        <p className="font-semibold text-slate-800 dark:text-slate-200">
          💡 Control de Marca Blanca:
        </p>
        <p>
          Al marcar <strong>Ocultar mención de plataforma</strong>, ningún cliente final verá el
          nombre de Sagitta en la interfaz, correos, tickets de caja ni en la pestaña del navegador.
        </p>
      </div>
    </div>
  )
}
