import { Globe, Printer } from 'lucide-react'
import type { ConfiguracionMarcaBlanca } from '@/types'
import { Input } from '@/components/ui'

interface TabNegocioRegionalProps {
  formData: ConfiguracionMarcaBlanca
  onChange: <K extends keyof ConfiguracionMarcaBlanca>(
    campo: K,
    valor: ConfiguracionMarcaBlanca[K]
  ) => void
}

export function TabNegocioRegional({ formData, onChange }: TabNegocioRegionalProps) {
  return (
    <div className="space-y-6">
      {/* Moneda & Configuración Horaria */}
      <div className="card p-6 border border-slate-100 dark:border-slate-800 space-y-4">
        <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">
          Moneda & Configuración Horaria y Regional
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
                if (m === 'PEN') sim = 'S/'
                onChange('moneda', m)
                onChange('simbolo_moneda', sim)
              }}
              className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-500"
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
              onChange={(e) => onChange('zona_horaria', e.target.value)}
              className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-500"
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
                  onClick={() => onChange('formato_hora', fmt)}
                  className={[
                    'flex-1 py-2 text-xs font-semibold rounded-xl border transition-all cursor-pointer',
                    formData.formato_hora === fmt
                      ? 'border-primary-500 bg-primary-50/20 text-primary-600 font-bold'
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
              onChange={(e) => onChange('formato_fecha', e.target.value as 'DD/MM/YYYY' | 'YYYY-MM-DD')}
              className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="DD/MM/YYYY">DD/MM/YYYY (Ej. 17/09/2026)</option>
              <option value="YYYY-MM-DD">YYYY-MM-DD (Ej. 2026-09-17)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Canales Oficiales de Atención & Legal */}
      <div className="card p-6 border border-slate-100 dark:border-slate-800 space-y-4">
        <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">
          Canales Oficiales de Soporte & Legal
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Correo Electrónico de Contacto"
            value={formData.email_soporte}
            onChange={(e) => onChange('email_soporte', e.target.value)}
            placeholder="contacto@tunegocio.com"
          />

          <Input
            label="Teléfono / WhatsApp de Soporte"
            value={formData.telefono_soporte}
            onChange={(e) => onChange('telefono_soporte', e.target.value)}
            placeholder="+1 555-0900"
          />
        </div>

        <Input
          label="Sitio Web Oficial"
          value={formData.sitio_web}
          onChange={(e) => onChange('sitio_web', e.target.value)}
          placeholder="https://tunegocio.com"
          leftIcon={<Globe className="w-4 h-4 text-slate-400" />}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100 dark:border-slate-800">
          <Input
            label="URL de Términos y Condiciones"
            value={formData.url_terminos ?? ''}
            onChange={(e) => onChange('url_terminos', e.target.value)}
            placeholder="https://tunegocio.com/terminos"
          />

          <Input
            label="URL de Política de Privacidad"
            value={formData.url_privacidad ?? ''}
            onChange={(e) => onChange('url_privacidad', e.target.value)}
            placeholder="https://tunegocio.com/privacidad"
          />
        </div>
      </div>

      {/* Impresión Térmica & Tickets POS */}
      <div className="card p-6 border border-slate-100 dark:border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Printer className="w-4 h-4 text-primary-500" />
            <span>Personalización de Ticket Térmico (58mm / 80mm & Bluetooth)</span>
          </h3>
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-primary-50 dark:bg-primary-950/40 text-primary-600 border border-primary-200 dark:border-primary-800">
            ESC/POS Compatible
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Identificador Fiscal / RUT / RFC / CIF"
            value={formData.rut_empresa ?? ''}
            onChange={(e) => onChange('rut_empresa', e.target.value)}
            placeholder="Ej. RUT 76.543.210-K / RFC XYZ123456"
          />

          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Ancho de Rollo Térmico por Defecto
            </label>
            <div className="flex gap-2">
              {([80, 58] as const).map((ancho) => (
                <button
                  key={ancho}
                  type="button"
                  onClick={() => onChange('ticket_ancho', ancho)}
                  className={[
                    'flex-1 py-2 text-xs font-semibold rounded-xl border transition-all cursor-pointer',
                    (formData.ticket_ancho || 80) === ancho
                      ? 'border-primary-500 bg-primary-50/20 text-primary-600 font-bold'
                      : 'border-slate-200 dark:border-slate-800 text-slate-500',
                  ].join(' ')}
                >
                  {ancho} mm {ancho === 80 ? '(Mostrador 80mm)' : '(Portátil 58mm)'}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Dirección Física del Local (Encabezado Ticket)"
            value={formData.direccion ?? ''}
            onChange={(e) => onChange('direccion', e.target.value)}
            placeholder="Av. Providencia 1234, Local 5"
          />

          <Input
            label="Teléfono impreso en Ticket"
            value={formData.telefono ?? ''}
            onChange={(e) => onChange('telefono', e.target.value)}
            placeholder="+56 9 8765 4321"
          />
        </div>

        <Input
          label="Mensaje al Pie del Ticket"
          value={formData.ticket_pie ?? ''}
          onChange={(e) => onChange('ticket_pie', e.target.value)}
          placeholder="¡Gracias por su visita! Wi-Fi: Local2026 | @milocal en Instagram"
        />

        <div className="flex items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
          <input
            type="checkbox"
            id="ticket_abrir_cajon"
            checked={formData.ticket_abrir_cajon ?? true}
            onChange={(e) => onChange('ticket_abrir_cajon', e.target.checked)}
            className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500 cursor-pointer"
          />
          <label htmlFor="ticket_abrir_cajon" className="text-xs text-slate-700 dark:text-slate-300 font-medium cursor-pointer">
            Abrir cajón portamonedas automáticamente (pulso RJ11) al confirmar cobro
          </label>
        </div>
      </div>
    </div>
  )
}

