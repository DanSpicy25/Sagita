import { useState } from 'react'
import {
  History,
  CheckCircle2,
  XCircle,
  Trash2,
  RefreshCw,
  Search,
  Eye,
  Zap,
  Terminal,
} from 'lucide-react'
import { EjecucionLogAutomatizacion } from '@/types'
import { Button, Input, Select, Badge, Modal, EmptyState } from '@/components/ui'
import { useToast } from '@/hooks/useToast'

interface HistorialEjecucionesProps {
  logs: EjecucionLogAutomatizacion[]
  onLimpiarLogs: () => Promise<void>
  onRecargar: () => void
}

export function HistorialEjecuciones({
  logs,
  onLimpiarLogs,
  onRecargar,
}: HistorialEjecucionesProps) {
  const [busqueda, setBusqueda] = useState('')
  const [filtroEstado, setFiltroEstado] = useState<string>('todos')
  const [logSeleccionado, setLogSeleccionado] = useState<EjecucionLogAutomatizacion | null>(null)
  const [limpiando, setLimpiando] = useState(false)

  const { toast } = useToast()

  const handleLimpiar = async () => {
    if (!confirm('¿Deseas vaciar todo el registro histórico de ejecuciones de automatizaciones?')) {
      return
    }
    setLimpiando(true)
    try {
      await onLimpiarLogs()
      toast.success('Historial Vaciado', 'Se han eliminado los logs de ejecución.')
    } catch (err) {
      toast.error('Error al limpiar logs', err instanceof Error ? err.message : 'Error')
    } finally {
      setLimpiando(false)
    }
  }

  const logsFiltrados = logs.filter((log) => {
    if (busqueda) {
      const q = busqueda.toLowerCase()
      const match =
        log.regla_nombre.toLowerCase().includes(q) ||
        log.trigger.toLowerCase().includes(q) ||
        log.detalles.toLowerCase().includes(q)
      if (!match) return false
    }
    if (filtroEstado === 'exitoso' && !log.exito) return false
    if (filtroEstado === 'fallido' && log.exito) return false
    return true
  })

  return (
    <div className="space-y-6">
      {/* Header y Filtros */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <History className="w-5 h-5 text-primary-500" />
            Registro de Auditoría y Ejecución de Automatizaciones
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Inspecciona cada regla disparada, diagnósticos de entrega en canales y respuestas en tiempo real.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={onRecargar}
            leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
          >
            Actualizar
          </Button>

          {logs.length > 0 && (
            <Button
              variant="danger"
              size="sm"
              onClick={handleLimpiar}
              disabled={limpiando}
              leftIcon={<Trash2 className="w-3.5 h-3.5" />}
            >
              {limpiando ? 'Vaciando...' : 'Vaciar Historial'}
            </Button>
          )}
        </div>
      </div>

      {/* Barra de Filtros */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="w-full sm:flex-1">
          <Input
            placeholder="Buscar por regla, trigger o detalle..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            leftIcon={<Search className="w-4 h-4 text-slate-400" />}
          />
        </div>

        <div className="w-full sm:w-48">
          <Select
            value={filtroEstado}
            onChange={(e) => setFiltroEstado(e.target.value)}
            options={[
              { value: 'todos', label: 'Todos los estados' },
              { value: 'exitoso', label: 'Solo exitosos' },
              { value: 'fallido', label: 'Solo fallidos' },
            ]}
          />
        </div>
      </div>

      {/* Tabla de Logs */}
      {logs.length === 0 ? (
        <EmptyState
          icon={<History className="w-10 h-10 text-slate-300" />}
          title="No hay ejecuciones registradas"
          description="Cuando se activen reservas, pagos o recordatorios, los eventos de ejecución quedarán auditados aquí."
        />
      ) : logsFiltrados.length === 0 ? (
        <div className="p-8 text-center text-sm text-slate-400 card border border-slate-200 dark:border-slate-800">
          No hay registros que coincidan con la búsqueda.
        </div>
      ) : (
        <div className="card border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="py-3 px-4 font-semibold">Estado</th>
                  <th className="py-3 px-4 font-semibold">Regla / Automatización</th>
                  <th className="py-3 px-4 font-semibold">Disparador (Trigger)</th>
                  <th className="py-3 px-4 font-semibold">Acciones</th>
                  <th className="py-3 px-4 font-semibold">Fecha y Hora</th>
                  <th className="py-3 px-4 font-semibold text-right">Detalle</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-sans">
                {logsFiltrados.map((log) => {
                  const tieneSimulado = log.acciones_ejecutadas.some(
                    (a) => a.estado === 'simulado_no_conectado'
                  )
                  return (
                    <tr
                      key={log.id}
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors"
                    >
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5">
                          {log.exito ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                          ) : (
                            <XCircle className="w-4 h-4 text-red-500" />
                          )}
                          <span
                            className={[
                              'font-bold',
                              log.exito
                                ? 'text-emerald-700 dark:text-emerald-400'
                                : 'text-red-700 dark:text-red-400',
                            ].join(' ')}
                          >
                            {log.exito ? 'Éxito' : 'Fallo'}
                          </span>
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-900 dark:text-slate-100">
                          {log.regla_nombre}
                        </div>
                        <span className="text-[10px] text-slate-400">ID Regla: #{log.regla_id}</span>
                      </td>

                      <td className="py-3 px-4">
                        <Badge variant="default" size="sm">
                          {log.trigger}
                        </Badge>
                      </td>

                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1 flex-wrap">
                          <span className="font-mono text-slate-600 dark:text-slate-300">
                            {log.acciones_ejecutadas.length} ejecutada(s)
                          </span>
                          {tieneSimulado && (
                            <Badge variant="warning" size="sm" title="Canal simulado (no conectado)">
                              Simulado
                            </Badge>
                          )}
                        </div>
                      </td>

                      <td className="py-3 px-4 text-slate-500 font-mono text-[11px]">
                        {new Date(log.fecha).toLocaleString()}
                      </td>

                      <td className="py-3 px-4 text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setLogSeleccionado(log)}
                          leftIcon={<Eye className="w-3.5 h-3.5" />}
                        >
                          Ver
                        </Button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal de Detalle de Log */}
      {logSeleccionado && (
        <Modal
          isOpen={!!logSeleccionado}
          onClose={() => setLogSeleccionado(null)}
          title={
            <div className="flex items-center gap-2">
              <Terminal className="w-5 h-5 text-primary-500" />
              <span>Diagnóstico de Ejecución</span>
            </div>
          }
          size="2xl"
        >
          <div className="space-y-4">
            <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl space-y-2 text-xs border border-slate-200 dark:border-slate-700">
              <div className="flex justify-between items-center">
                <span className="font-bold text-slate-700 dark:text-slate-300">
                  Regla Disparada:
                </span>
                <span className="font-mono">{logSeleccionado.regla_nombre}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-bold text-slate-700 dark:text-slate-300">Trigger:</span>
                <Badge variant="default" size="sm">
                  {logSeleccionado.trigger}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-bold text-slate-700 dark:text-slate-300">Timestamp:</span>
                <span className="font-mono text-[11px]">{logSeleccionado.fecha}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-bold text-slate-700 dark:text-slate-300">Resumen:</span>
                <span>{logSeleccionado.detalles}</span>
              </div>
            </div>

            <div>
              <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                Acciones Realizadas ({logSeleccionado.acciones_ejecutadas.length})
              </h4>
              <div className="space-y-2">
                {logSeleccionado.acciones_ejecutadas.map((acc, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-850 text-xs space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Zap className="w-3.5 h-3.5 text-amber-500" />
                        <span className="font-bold text-slate-900 dark:text-slate-100">
                          {acc.tipo}
                        </span>
                        {acc.canal && (
                          <Badge variant="info" size="sm">
                            {acc.canal}
                          </Badge>
                        )}
                      </div>
                      <Badge
                        variant={
                          acc.estado === 'enviado' || acc.estado === 'creado'
                            ? 'success'
                            : acc.estado === 'simulado_no_conectado'
                            ? 'warning'
                            : 'danger'
                        }
                        size="sm"
                      >
                        {acc.estado}
                      </Badge>
                    </div>

                    {acc.destinatario && (
                      <p className="text-slate-500 text-[11px]">
                        <span className="font-semibold text-slate-600 dark:text-slate-400">
                          Destinatario:
                        </span>{' '}
                        {acc.destinatario}
                      </p>
                    )}

                    {acc.mensaje && (
                      <p className="p-2 bg-slate-50 dark:bg-slate-900 rounded-lg text-slate-600 dark:text-slate-300 text-[11px] font-mono leading-relaxed">
                        {acc.mensaje}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-200 dark:border-slate-800">
              <Button onClick={() => setLogSeleccionado(null)}>Cerrar</Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}
