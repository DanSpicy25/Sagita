import { useState } from 'react'
import { Clock } from 'lucide-react'
import { DEMO_ESPECIALISTAS, DEMO_CITAS, DemoCita, type DeviceMode } from '../demoData'

export function DemoCalendar({ deviceMode: _deviceMode }: { deviceMode?: DeviceMode } = {}) {
  const [especialistaFiltro, setEspecialistaFiltro] = useState<number | 'todos'>('todos')
  const [citaSeleccionada, setCitaSeleccionada] = useState<DemoCita | null>(DEMO_CITAS[1])
  const [citas, setCitas] = useState(DEMO_CITAS)

  const cambiarEstadoCita = (id: number, nuevoEstado: DemoCita['estado']) => {
    setCitas((prev) =>
      prev.map((c) => (c.id === id ? { ...c, estado: nuevoEstado } : c))
    )
    if (citaSeleccionada && citaSeleccionada.id === id) {
      setCitaSeleccionada({ ...citaSeleccionada, estado: nuevoEstado })
    }
  }

  const citasFiltradas = especialistaFiltro === 'todos'
    ? citas
    : citas.filter((c) => {
        const esp = DEMO_ESPECIALISTAS.find((e) => e.id === especialistaFiltro)
        return esp ? c.especialista === esp.nombre : true
      })

  return (
    <div className="space-y-4 animate-fade-in text-text">
      {/* Selector de Especialistas (Columnas / Filtros) */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <button
          onClick={() => setEspecialistaFiltro('todos')}
          className={[
            'px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer',
            especialistaFiltro === 'todos'
              ? 'bg-primary text-white shadow-2xs'
              : 'bg-surface border border-border text-text-muted hover:text-text',
          ].join(' ')}
        >
          Todo el Equipo ({citas.length})
        </button>

        {DEMO_ESPECIALISTAS.map((esp) => (
          <button
            key={esp.id}
            onClick={() => setEspecialistaFiltro(esp.id)}
            className={[
              'px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer flex items-center gap-2',
              especialistaFiltro === esp.id
                ? 'bg-primary text-white shadow-2xs'
                : 'bg-surface border border-border text-text-muted hover:text-text',
            ].join(' ')}
          >
            <span
              className="w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: esp.color }}
            />
            {esp.nombre}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Grilla / Lista de Horarios */}
        <div className="lg:col-span-2 space-y-2.5">
          <div className="p-3 bg-surface-subtle border border-border rounded-xl text-xs font-semibold text-text-muted flex items-center justify-between">
            <span>Hoy: Jueves, 15 de Octubre • Horario 09:00 a 19:00</span>
            <span className="text-primary">Buffers de 10 min automáticos</span>
          </div>

          <div className="space-y-2">
            {citasFiltradas.map((cita) => {
              const esSeleccionada = citaSeleccionada?.id === cita.id
              const esAtencion = cita.estado === 'en_atencion'
              const esCompletada = cita.estado === 'completada'

              return (
                <div
                  key={cita.id}
                  onClick={() => setCitaSeleccionada(cita)}
                  className={[
                    'p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 text-xs',
                    esSeleccionada
                      ? 'border-primary ring-2 ring-primary/20 bg-primary-soft/20 shadow-2xs'
                      : 'border-border bg-surface hover:border-border-hover',
                  ].join(' ')}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-surface-subtle border border-border flex flex-col items-center justify-center font-mono shrink-0">
                      <Clock className="w-3.5 h-3.5 text-primary mb-0.5" />
                      <span className="text-[10px] font-bold">{cita.hora.split(' - ')[0]}</span>
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-text text-sm">{cita.cliente}</span>
                        {esAtencion && (
                          <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                            En Atención
                          </span>
                        )}
                        {esCompletada && (
                          <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                            Finalizada
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-text-muted mt-0.5">
                        {cita.servicio} • {cita.especialista}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="font-bold font-mono text-sm block">${cita.precio}</span>
                    <span className="text-[10px] text-text-muted">{cita.sala}</span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Ficha Lateral de Cita Seleccionada */}
        {citaSeleccionada && (
          <div className="p-4 rounded-2xl bg-surface border border-border shadow-2xs space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <span className="text-xs font-bold text-text">Detalle de la Cita</span>
              <span className="text-[10px] font-mono font-bold text-primary">#{citaSeleccionada.id}</span>
            </div>

            <div className="space-y-2.5 text-xs">
              <div>
                <span className="text-[10px] uppercase font-bold text-text-muted block">Paciente</span>
                <span className="font-bold text-text text-sm">{citaSeleccionada.cliente}</span>
              </div>

              <div>
                <span className="text-[10px] uppercase font-bold text-text-muted block">Tratamiento</span>
                <span className="font-medium text-text">{citaSeleccionada.servicio}</span>
              </div>

              <div>
                <span className="text-[10px] uppercase font-bold text-text-muted block">Especialista & Sala</span>
                <span className="font-medium text-text">{citaSeleccionada.especialista}</span>
                <span className="text-text-muted block text-[11px]">{citaSeleccionada.sala}</span>
              </div>

              <div>
                <span className="text-[10px] uppercase font-bold text-text-muted block">Horario</span>
                <span className="font-medium text-text">{citaSeleccionada.hora} (con 10 min de desinfección)</span>
              </div>
            </div>

            <div className="pt-3 border-t border-border space-y-2">
              <span className="text-[11px] font-bold text-text block">Cambiar Estado (Simulación):</span>
              <div className="grid grid-cols-2 gap-1.5">
                <button
                  onClick={() => cambiarEstadoCita(citaSeleccionada.id, 'en_atencion')}
                  className="px-2 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 font-semibold text-[11px] hover:bg-emerald-100 transition-colors"
                >
                  Iniciar Atención
                </button>
                <button
                  onClick={() => cambiarEstadoCita(citaSeleccionada.id, 'completada')}
                  className="px-2 py-1.5 rounded-lg bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-300 font-semibold text-[11px] hover:bg-sky-100 transition-colors"
                >
                  Marcar Cobrada
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

