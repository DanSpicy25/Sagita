import { useState } from 'react'
import { TrendingUp } from 'lucide-react'
import { type DeviceMode } from '../demoData'

export function DemoReports({ deviceMode: _deviceMode }: { deviceMode?: DeviceMode } = {}) {
  const [periodo, setPeriodo] = useState<'mes' | 'trimestre'>('mes')

  return (
    <div className="space-y-4 animate-fade-in text-text">
      {/* Selector de Período */}
      <div className="flex items-center justify-between pb-1">
        <div>
          <h4 className="font-bold text-sm text-text">Inteligencia Comercial & Rentabilidad</h4>
          <p className="text-[11px] text-text-muted">Métricas consolidadas de facturación y asistencia</p>
        </div>

        <div className="inline-flex p-1 rounded-xl bg-surface-subtle border border-border">
          <button
            onClick={() => setPeriodo('mes')}
            className={[
              'px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer',
              periodo === 'mes'
                ? 'bg-surface text-primary shadow-2xs'
                : 'text-text-muted hover:text-text',
            ].join(' ')}
          >
            Últimos 30 días
          </button>
          <button
            onClick={() => setPeriodo('trimestre')}
            className={[
              'px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer',
              periodo === 'trimestre'
                ? 'bg-surface text-primary shadow-2xs'
                : 'text-text-muted hover:text-text',
            ].join(' ')}
          >
            Trimestre Actual
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Gráfico 1: Evolución de Facturación Semanal */}
        <div className="p-5 rounded-2xl bg-surface border border-border shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-text uppercase tracking-wider">
              Facturación Semanal ($)
            </span>
            <span className="text-emerald-600 font-bold text-xs flex items-center">
              <TrendingUp className="w-3.5 h-3.5 mr-1" /> +18.4% MoM
            </span>
          </div>

          <div className="h-44 flex items-end justify-between gap-3 pt-6 pb-2 px-2 border-b border-border-subtle">
            {[
              { sem: 'Sem 1', monto: 14200, altura: '45%' },
              { sem: 'Sem 2', monto: 18900, altura: '62%' },
              { sem: 'Sem 3', monto: 22100, altura: '75%' },
              { sem: 'Sem 4 (Actual)', monto: 28400, altura: '95%' },
            ].map((bar, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end group">
                <span className="text-[10px] font-mono font-bold text-text-muted opacity-0 group-hover:opacity-100 transition-opacity">
                  ${(bar.monto / 1000).toFixed(1)}k
                </span>
                <div
                  className="w-full max-w-[42px] rounded-t-xl bg-primary hover:bg-primary-hover transition-all shadow-sm"
                  style={{ height: bar.altura }}
                />
                <span className="text-[10px] text-text-muted font-semibold mt-1">
                  {bar.sem}
                </span>
              </div>
            ))}
          </div>

          <div className="flex justify-between text-xs text-text-muted pt-1">
            <span>Total Facturado Periodo:</span>
            <strong className="text-text font-bold font-mono">$83,600.00</strong>
          </div>
        </div>

        {/* Gráfico 2: Distribución de Estado de Citas */}
        <div className="p-5 rounded-2xl bg-surface border border-border shadow-2xs space-y-4">
          <span className="text-xs font-bold text-text uppercase tracking-wider block">
            Efectividad de Asistencia a Citas
          </span>

          <div className="space-y-3 pt-2">
            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-emerald-700 dark:text-emerald-400">Completadas & Cobradas (88%)</span>
                <span className="font-mono">312 citas</span>
              </div>
              <div className="w-full h-2.5 rounded-full bg-surface-subtle overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full" style={{ width: '88%' }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-amber-700 dark:text-amber-400">Reprogramadas con Aviso (8%)</span>
                <span className="font-mono">28 citas</span>
              </div>
              <div className="w-full h-2.5 rounded-full bg-surface-subtle overflow-hidden">
                <div className="h-full bg-amber-500 rounded-full" style={{ width: '8%' }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-red-700 dark:text-red-400">No Asistió / Cancelación Tardía (4%)</span>
                <span className="font-mono">14 citas</span>
              </div>
              <div className="w-full h-2.5 rounded-full bg-surface-subtle overflow-hidden">
                <div className="h-full bg-red-500 rounded-full" style={{ width: '4%' }} />
              </div>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-surface-subtle border border-border text-[11px] text-text-muted mt-2">
            💡 <strong>Impacto del Recordatorio Automático:</strong> La tasa de no-show cayó del 18% al 4% tras activar notificaciones por WhatsApp.
          </div>
        </div>
      </div>
    </div>
  )
}

