import { ConfiguracionMarcaBlanca } from '@/types'
import { Check, Sparkles, Calendar, Globe } from 'lucide-react'

interface Props {
  configuracion: ConfiguracionMarcaBlanca
}

export function PrevisualizadorMarcaBlanca({ configuracion }: Props) {
  const {
    nombre_negocio,
    lema_negocio,
    logo_url,
    color_primario,
    radio_esquinas,
    marca_blanca_activa,
    ocultar_marca_sistema,
    texto_pie_pagina,
    mostrar_powered_by,
    texto_powered_by,
    fuente_tipografica,
  } = configuracion

  // Determinar clases de radio
  const radiusClass = {
    cuadrado: 'rounded-none',
    suave: 'rounded-md',
    moderno: 'rounded-xl',
    pronunciado: 'rounded-2xl',
  }[radio_esquinas] ?? 'rounded-xl'

  return (
    <div className="card border border-slate-200 dark:border-slate-800 p-5 space-y-4 shadow-card overflow-hidden">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-primary-500" />
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">
            Vista Previa de Marca Blanca
          </h3>
        </div>
        {marca_blanca_activa && ocultar_marca_sistema && (
          <span className="px-2 py-0.5 text-[10px] font-bold uppercase rounded bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300">
            100% Marca Blanca Activa
          </span>
        )}
      </div>

      {/* Simulación de Ventana de Navegador */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-900 overflow-hidden shadow-sm">
        {/* Barra superior de pestañas */}
        <div className="bg-slate-200 dark:bg-slate-800 px-3 py-2 flex items-center gap-2">
          <div className="flex gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-red-400 inline-block" />
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block" />
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 inline-block" />
          </div>
          <div className="flex-1 max-w-[220px] bg-white dark:bg-slate-900 text-[11px] font-medium px-2.5 py-1 rounded-md text-slate-700 dark:text-slate-300 truncate flex items-center gap-1.5 shadow-xs">
            <Globe className="w-3 h-3 text-slate-400" />
            <span className="truncate">{nombre_negocio || 'Sagitta'}</span>
          </div>
        </div>

        {/* Contenido Simulado de la App */}
        <div
          className="p-4 bg-white dark:bg-slate-950 space-y-4"
          style={{ fontFamily: `"${fuente_tipografica}", sans-serif` }}
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
              {['Limpieza Dental', 'Consulta Médica', 'Sesión Bienestar'].map((item) => (
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
          💡 Nota para la marca blanca:
        </p>
        <p>
          Al marcar <strong>Ocultar mención de plataforma</strong>, ningún cliente final verá el
          nombre ni enlaces de Sagitta en la interfaz, correos ni en el comprobante fiscal.
        </p>
      </div>
    </div>
  )
}

