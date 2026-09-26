import { useState } from 'react'
import { ConfiguracionMarcaBlanca } from '@/types'
import { Button } from '@/components/ui'
import { Copy, Check, Code2, ExternalLink } from 'lucide-react'
import { useToast } from '@/hooks/useToast'

interface Props {
  configuracion: ConfiguracionMarcaBlanca
}

export function GeneradorWidgetEmbebible({ configuracion }: Props) {
  const [tipoEmbed, setTipoEmbed] = useState<'iframe' | 'script'>('iframe')
  const [altoWidget, setAltoWidget] = useState('780px')
  const [temaWidget, setTemaWidget] = useState<'auto' | 'light' | 'dark'>('auto')
  const [copiado, setCopiado] = useState(false)
  const { toast } = useToast()

  const baseUrl = window.location.origin
  const colorQuery = encodeURIComponent(configuracion.color_primario || '#6366f1')
  const embedUrl = `${baseUrl}/citas/nueva?embed=true&theme=${temaWidget}&primary=${colorQuery}&brand=${encodeURIComponent(configuracion.nombre_negocio)}`

  const codigoIframe = `<iframe
  src="${embedUrl}"
  width="100%"
  height="${altoWidget}"
  frameborder="0"
  allow="camera; microphone; payment"
  style="border: none; max-width: 100%; border-radius: 16px; box-shadow: 0 4px 24px rgba(0,0,0,0.08);"
  title="Reserva tu cita en ${configuracion.nombre_negocio}"
></iframe>`

  const codigoScript = `<!-- Sagitta White-Label Booking Widget -->
<div id="sagitta-booking-root"></div>
<script
  src="${baseUrl}/widget.js"
  data-brand-name="${configuracion.nombre_negocio}"
  data-primary-color="${configuracion.color_primario}"
  data-theme="${temaWidget}"
  data-target="#sagitta-booking-root"
  async
></script>`

  const codigoActivo = tipoEmbed === 'iframe' ? codigoIframe : codigoScript

  const handleCopiar = () => {
    navigator.clipboard.writeText(codigoActivo)
    setCopiado(true)
    setTimeout(() => setCopiado(false), 2200)
    toast.success('Código copiado', 'Pégalo en el HTML de tu sitio web (WordPress, Wix, etc.)')
  }

  return (
    <div className="space-y-6">
      <div className="card p-6 border border-slate-100 dark:border-slate-800 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="font-bold text-base text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Code2 className="w-5 h-5 text-primary-600" />
              Widget Embebible para Clientes
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Inserta el motor de reservas en tu propio sitio web manteniendo tus colores y sin
              logos externos.
            </p>
          </div>

          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs font-semibold">
            <button
              type="button"
              onClick={() => setTipoEmbed('iframe')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                tipoEmbed === 'iframe'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              Código iFrame
            </button>
            <button
              type="button"
              onClick={() => setTipoEmbed('script')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                tipoEmbed === 'script'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              JavaScript Embed
            </button>
          </div>
        </div>

        {/* Parámetros de Personalización del Embed */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
          <div>
            <label className="block text-slate-500 font-medium mb-1">Altura del Widget</label>
            <select
              value={altoWidget}
              onChange={(e) => setAltoWidget(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="650px">Compacto (650px)</option>
              <option value="780px">Recomendado (780px)</option>
              <option value="900px">Extendido (900px)</option>
            </select>
          </div>

          <div>
            <label className="block text-slate-500 font-medium mb-1">Tema del Widget</label>
            <select
              value={temaWidget}
              onChange={(e) => setTemaWidget(e.target.value as 'auto' | 'light' | 'dark')}
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="auto">Automático (Detecta navegador)</option>
              <option value="light">Siempre Claro (Light)</option>
              <option value="dark">Siempre Oscuro (Dark)</option>
            </select>
          </div>

          <div className="sm:col-span-2 md:col-span-1 flex items-end">
            <a
              href={embedUrl}
              target="_blank"
              rel="noreferrer"
              className="w-full flex items-center justify-center gap-1.5 px-3 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl text-slate-700 dark:text-slate-300 font-semibold transition-all"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              Probar en Pestaña Nueva
            </a>
          </div>
        </div>

        {/* Snippet de Código */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Copia y pega este snippet en tu página web:</span>
            <span className="font-mono text-[11px] text-primary-500">HTML / UTF-8</span>
          </div>

          <div className="relative group">
            <pre className="p-4 rounded-xl bg-slate-900 text-slate-100 font-mono text-xs overflow-x-auto border border-slate-800 leading-relaxed selection:bg-primary-500">
              {codigoActivo}
            </pre>
            <div className="absolute top-3 right-3">
              <Button
                size="sm"
                variant="secondary"
                onClick={handleCopiar}
                leftIcon={copiado ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              >
                {copiado ? 'Copiado' : 'Copiar Código'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

