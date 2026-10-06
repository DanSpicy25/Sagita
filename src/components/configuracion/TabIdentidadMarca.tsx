import { Globe, Shield, UploadCloud, Wand2 } from 'lucide-react'
import type { ConfiguracionMarcaBlanca } from '@/types'
import { Input } from '@/components/ui'

interface TabIdentidadMarcaProps {
  formData: ConfiguracionMarcaBlanca
  onChange: <K extends keyof ConfiguracionMarcaBlanca>(
    campo: K,
    valor: ConfiguracionMarcaBlanca[K]
  ) => void
}

const PRESETS_FAVICON = [
  {
    label: '⚡ Tech / SaaS',
    url: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%236366f1"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>',
  },
  {
    label: '🏥 Clínica / Salud',
    url: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%2310b981"><circle cx="12" cy="12" r="10"/><path stroke="white" stroke-width="3" stroke-linecap="round" d="M12 7v10M7 12h10"/></svg>',
  },
  {
    label: '🛍️ Comercio / Retail',
    url: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%23f59e0b"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6" stroke="white" stroke-width="2"/><path d="M16 10a4 4 0 0 1-8 0" stroke="white" stroke-width="2" fill="none"/></svg>',
  },
  {
    label: '✨ Belleza / Spa',
    url: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%23ec4899"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>',
  },
  {
    label: '✂️ Barbería / Salón',
    url: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%230284c7"><circle cx="6" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><line x1="20" y1="4" x2="8.12" y2="15.88" stroke="white" stroke-width="2"/><line x1="14.47" y1="14.48" x2="20" y2="20" stroke="white" stroke-width="2"/><line x1="8.12" y1="8.12" x2="12" y2="12" stroke="white" stroke-width="2"/></svg>',
  },
  {
    label: '🏋️ Gimnasio / Fitness',
    url: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%23ea580c"><rect x="2" y="9" width="4" height="6" rx="1"/><rect x="18" y="9" width="4" height="6" rx="1"/><line x1="6" y1="12" x2="18" y2="12" stroke="white" stroke-width="3"/></svg>',
  },
  {
    label: '🍽️ Gastronomía',
    url: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%23e11d48"><path d="M18 2v20M6 2v6a3 3 0 0 0 6 0V2M9 14v8"/></svg>',
  },
  {
    label: '🚗 Taller / Mecánica',
    url: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%23475569"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>',
  },
]

export function TabIdentidadMarca({ formData, onChange }: TabIdentidadMarcaProps) {
  const generarFaviconIniciales = () => {
    const iniciales = (formData.nombre_negocio || 'S')
      .split(' ')
      .map((w) => w.charAt(0))
      .slice(0, 2)
      .join('')
      .toUpperCase()

    const colorHex = encodeURIComponent(formData.color_primario || '#6366f1')
    const svg = `data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="16" fill="${colorHex}"/><text x="32" y="42" font-family="system-ui, sans-serif" font-size="28" font-weight="900" fill="white" text-anchor="middle">${iniciales}</text></svg>`
    onChange('favicon_url', svg)
  }

  return (
    <div className="space-y-6">
      {/* Banner de Marca Blanca Total */}
      <div className="card p-6 border-2 border-primary-500/20 dark:border-primary-500/30 bg-primary-50/40 dark:bg-primary-950/20 space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="font-bold text-base text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Shield className="w-5 h-5 text-primary-600" />
              Modo Marca Blanca Total
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
              Oculta completamente toda referencia al software base, permitiéndote operar, comercializar o revender la plataforma bajo tu propio nombre comercial e identidad de marca.
            </p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer shrink-0">
            <input
              type="checkbox"
              checked={formData.marca_blanca_activa}
              onChange={(e) => onChange('marca_blanca_activa', e.target.checked)}
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
                onChange={(e) => onChange('ocultar_marca_sistema', e.target.checked)}
                className="rounded text-primary-600 focus:ring-primary-500"
              />
              <span>Suprimir menciones de la plataforma en comprobantes fiscales, correos y tickets</span>
            </label>

            <label className="flex items-center gap-2 font-medium text-slate-700 dark:text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                checked={!formData.mostrar_powered_by}
                onChange={(e) => onChange('mostrar_powered_by', !e.target.checked)}
                className="rounded text-primary-600 focus:ring-primary-500"
              />
              <span>Eliminar el pie de página &quot;Powered by&quot; en toda la aplicación</span>
            </label>
          </div>
        )}
      </div>

      {/* Nombres y Títulos Comerciales */}
      <div className="card p-6 border border-slate-100 dark:border-slate-800 space-y-4">
        <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">
          Nombres y Títulos Comerciales
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Nombre Comercial del Negocio"
            value={formData.nombre_negocio}
            onChange={(e) => onChange('nombre_negocio', e.target.value)}
            placeholder="Ej. Nexus Consultoría"
            hint="Reemplazará el nombre en toda la app, portal y barra de navegación"
          />

          <Input
            label="Lema o Eslogan"
            value={formData.lema_negocio}
            onChange={(e) => onChange('lema_negocio', e.target.value)}
            placeholder="Ej. Cuidamos tu tiempo y bienestar"
            hint="Visible en portal de clientes, bienvenida y comprobantes"
          />
        </div>

        <Input
          label="Texto del Pie de Página (Copyright)"
          value={formData.texto_pie_pagina}
          onChange={(e) => onChange('texto_pie_pagina', e.target.value)}
          placeholder="© 2026 Tu Negocio. Todos los derechos reservados."
        />
      </div>

      {/* Logotipos Corporativos & Favicon */}
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
            onChange={(e) => onChange('logo_url', e.target.value)}
            placeholder="https://ejemplo.com/logo-principal.png"
            hint="Aparecerá en el Navbar superior y comprobantes"
          />

          <Input
            label="URL Logo Tema Oscuro (Opcional)"
            value={formData.logo_dark_url}
            onChange={(e) => onChange('logo_dark_url', e.target.value)}
            placeholder="https://ejemplo.com/logo-dark.png"
            hint="Se aplicará cuando el usuario active el modo oscuro"
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="URL Isotipo / Icono Reducido"
              value={formData.logo_icono_url}
              onChange={(e) => onChange('logo_icono_url', e.target.value)}
              placeholder="https://ejemplo.com/icono.png"
              hint="Visible cuando la barra lateral está contraída"
            />

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                  URL Favicon (.ico o .svg)
                </label>
                <button
                  type="button"
                  onClick={generarFaviconIniciales}
                  className="text-[10px] text-primary-600 dark:text-primary-400 hover:underline flex items-center gap-1 font-semibold"
                >
                  <Wand2 className="w-3 h-3" />
                  Auto-generar con iniciales
                </button>
              </div>
              <Input
                value={formData.favicon_url}
                onChange={(e) => onChange('favicon_url', e.target.value)}
                placeholder="https://ejemplo.com/favicon.ico"
                hint="Icono que se muestra en la esquina de la pestaña del navegador"
              />
            </div>
          </div>

          {/* Presets Rápidos de Favicon por Vertical */}
          <div className="p-3 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
              Presets de Favicon por Vertical de Negocio:
            </span>
            <div className="flex items-center gap-1.5 flex-wrap">
              {PRESETS_FAVICON.map((p) => (
                <button
                  key={p.label}
                  type="button"
                  onClick={() => onChange('favicon_url', p.url)}
                  className="text-[11px] px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-primary-500 hover:text-primary-600 text-slate-700 dark:text-slate-300 transition-colors shadow-xs"
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Input Título de Pestaña */}
          <Input
            label="Título en la Pestaña del Navegador"
            value={formData.titulo_pestana || ''}
            onChange={(e) => onChange('titulo_pestana', e.target.value)}
            placeholder="Mi Negocio · Sagitta Business Platform"
            hint="Texto que el cliente ve en la pestaña superior de Chrome / Safari / Edge"
          />

          {/* Simulador Interactivo de Pestaña del Navegador */}
          <div className="mt-4 p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100/70 dark:bg-slate-900/90 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                <Globe className="w-4 h-4 text-primary-600" />
                Simulador de Pestaña del Navegador (Chrome / Safari / macOS)
              </span>
              <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-semibold bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">
                ✓ Vista Previa Realista en Vivo
              </span>
            </div>

            {/* Marco del Navegador */}
            <div className="rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-200 dark:bg-slate-800/80 overflow-hidden shadow-sm">
              {/* Fila de Pestañas */}
              <div className="flex items-center px-3 pt-2 gap-2 bg-slate-300/60 dark:bg-slate-900">
                {/* Botones de Ventana */}
                <div className="flex items-center gap-1.5 mr-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                </div>

                {/* Pestaña Activa con Favicon y Título */}
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-t-lg bg-white dark:bg-slate-800 border-t border-x border-slate-300 dark:border-slate-700 max-w-[280px] shadow-sm">
                  {formData.favicon_url ? (
                    <img
                      src={formData.favicon_url}
                      alt="Favicon"
                      className="w-4 h-4 rounded-sm object-contain shrink-0"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = 'none'
                      }}
                    />
                  ) : (
                    <div
                      className="w-4 h-4 rounded-sm flex items-center justify-center shrink-0 text-white font-bold text-[9px]"
                      style={{ backgroundColor: formData.color_primario || '#6366f1' }}
                    >
                      {(formData.nombre_negocio || 'S').charAt(0).toUpperCase()}
                    </div>
                  )}
                  <span className="text-xs font-medium text-slate-800 dark:text-slate-200 truncate">
                    {formData.titulo_pestana || formData.nombre_negocio || 'Sagitta Store'}
                  </span>
                  <span className="text-slate-400 hover:text-slate-600 text-xs ml-auto cursor-pointer">
                    ×
                  </span>
                </div>

                {/* Botón Nueva Pestaña */}
                <span className="text-slate-400 text-sm px-1 cursor-pointer hover:text-slate-600">+</span>
              </div>

              {/* Barra de Direcciones URL */}
              <div className="px-3 py-2 bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 flex items-center gap-2">
                <div className="flex-1 flex items-center gap-2 px-3 py-1 rounded-md bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-400 font-mono">
                  <span className="text-emerald-600 font-semibold flex items-center gap-1">
                    🔒 https://
                  </span>
                  <span className="truncate">
                    portal.{formData.nombre_negocio.toLowerCase().replace(/[^a-z0-9]/g, '') || 'mitienda'}.com/reservas
                  </span>
                </div>
              </div>
            </div>

            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              💡 Al guardar los ajustes, este favicon y título se inyectan en tiempo real en{' '}
              <code className="text-primary-600 dark:text-primary-400 font-mono">&lt;link rel="icon"&gt;</code> y{' '}
              <code className="text-primary-600 dark:text-primary-400 font-mono">document.title</code> de la pestaña del navegador de tus clientes.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
