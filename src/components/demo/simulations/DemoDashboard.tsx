import { useState } from 'react'
import {
  DollarSign,
  Calendar,
  Users,
  TrendingUp,
  AlertTriangle,
  Clock,
  Sparkles,
  CheckCircle2,
  X,
} from 'lucide-react'
import { DEMO_CITAS, type DeviceMode } from '../demoData'

export function DemoDashboard({ deviceMode: _deviceMode }: { deviceMode?: DeviceMode } = {}) {
  const [citas, setCitas] = useState(DEMO_CITAS)
  const [alertaVisible, setAlertaVisible] = useState(true)
  const [mensajeSimulado, setMensajeSimulado] = useState<string | null>(null)

  const handleCompletarCita = (id: number) => {
    setCitas((prev) =>
      prev.map((c) => (c.id === id ? { ...c, estado: 'completada' } : c))
    )
    setMensajeSimulado('Cita marcada como completada. Ingreso añadido a caja.')
    setTimeout(() => setMensajeSimulado(null), 3000)
  }

  return (
    <div className="space-y-5 animate-fade-in text-text">
      {/* Mensaje de simulación interactiva */}
      {mensajeSimulado && (
        <div className="p-3 rounded-xl bg-primary-soft border border-primary/20 text-primary text-xs font-medium flex items-center justify-between animate-slide-up">
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-primary" />
            {mensajeSimulado}
          </span>
          <button
            onClick={() => setMensajeSimulado(null)}
            className="text-primary hover:opacity-80"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Alerta Prioritaria Simulada */}
      {alertaVisible && (
        <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/50 flex items-start justify-between gap-3 text-xs">
          <div className="flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-amber-900 dark:text-amber-200">
                Alerta de Inventario: 1 producto en stock crítico
              </p>
              <p className="text-amber-700 dark:text-amber-300 text-[11px] mt-0.5">
                "Crema Regeneradora Noche" tiene solo 3 unidades en almacén. Se sugiere reordenar.
              </p>
            </div>
          </div>
          <button
            onClick={() => setAlertaVisible(false)}
            className="text-amber-600 dark:text-amber-400 hover:opacity-75 p-1"
            title="Descartar alerta de demo"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Tarjetas KPI Superiores */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded-2xl bg-surface border border-border shadow-2xs">
          <div className="flex items-center justify-between text-text-muted">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Ingresos Hoy</span>
            <DollarSign className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-xl sm:text-2xl font-bold font-mono">$3,480</span>
            <span className="text-[10px] text-emerald-600 font-semibold flex items-center">
              <TrendingUp className="w-2.5 h-2.5 mr-0.5" /> +14%
            </span>
          </div>
          <span className="text-[10px] text-text-muted mt-1 block">vs semana anterior</span>
        </div>

        <div className="p-4 rounded-2xl bg-surface border border-border shadow-2xs">
          <div className="flex items-center justify-between text-text-muted">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Citas del Día</span>
            <Calendar className="w-4 h-4 text-primary" />
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-xl sm:text-2xl font-bold font-mono">24</span>
            <span className="text-[10px] text-text-muted font-medium">3 en atención</span>
          </div>
          <span className="text-[10px] text-text-muted mt-1 block">92% de ocupación</span>
        </div>

        <div className="p-4 rounded-2xl bg-surface border border-border shadow-2xs">
          <div className="flex items-center justify-between text-text-muted">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Clientes Nuevos</span>
            <Users className="w-4 h-4 text-sky-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-xl sm:text-2xl font-bold font-mono">6</span>
            <span className="text-[10px] text-sky-600 font-semibold">+2 vs meta</span>
          </div>
          <span className="text-[10px] text-text-muted mt-1 block">Ticket prom. $85</span>
        </div>

        <div className="p-4 rounded-2xl bg-surface border border-border shadow-2xs">
          <div className="flex items-center justify-between text-text-muted">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Recurrencia</span>
            <Sparkles className="w-4 h-4 text-amber-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-xl sm:text-2xl font-bold font-mono">78%</span>
            <span className="text-[10px] text-amber-600 font-semibold">Excelente</span>
          </div>
          <span className="text-[10px] text-text-muted mt-1 block">Retorno a 30 días</span>
        </div>
      </div>

      {/* Agenda Operativa en Vivo */}
      <div className="p-5 rounded-2xl bg-surface border border-border shadow-2xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-bold text-sm text-text">Agenda Operativa de Hoy</h4>
            <p className="text-[11px] text-text-muted">Turnos coordinados por sala y especialista</p>
          </div>
          <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> En Vivo
          </span>
        </div>

        <div className="space-y-2.5">
          {citas.map((cita) => {
            const esAtencion = cita.estado === 'en_atencion'
            const esCompleta = cita.estado === 'completada'

            return (
              <div
                key={cita.id}
                className={[
                  'p-3 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs',
                  esAtencion
                    ? 'border-primary/40 bg-primary-soft/30 shadow-2xs'
                    : esCompleta
                    ? 'border-border/60 bg-surface-subtle opacity-75'
                    : 'border-border bg-surface hover:border-border-hover',
                ].join(' ')}
              >
                <div className="flex items-start sm:items-center gap-3">
                  <span className="font-mono font-semibold text-text-muted text-[11px] shrink-0">
                    <Clock className="w-3 h-3 inline mr-1 text-primary" />
                    {cita.hora}
                  </span>

                  <div>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="font-bold text-text">{cita.cliente}</span>
                      <span className="text-text-muted">•</span>
                      <span className="text-text-muted text-[11px]">{cita.servicio}</span>
                    </div>
                    <span className="text-[10px] text-text-muted block mt-0.5">
                      {cita.especialista} — {cita.sala}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-2 shrink-0">
                  <span className="font-bold font-mono text-text">${cita.precio}</span>

                  {esAtencion ? (
                    <button
                      onClick={() => handleCompletarCita(cita.id)}
                      className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-[10px] transition-colors shadow-2xs cursor-pointer flex items-center gap-1"
                    >
                      <CheckCircle2 className="w-3 h-3" /> Completar
                    </button>
                  ) : esCompleta ? (
                    <span className="text-[10px] text-emerald-600 font-semibold px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/40">
                      Finalizada
                    </span>
                  ) : (
                    <span className="text-[10px] text-sky-600 font-semibold px-2 py-0.5 rounded bg-sky-50 dark:bg-sky-950/40">
                      Confirmada
                    </span>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

