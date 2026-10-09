import {
  CalendarDays,
  Users,
  DollarSign,
  TrendingUp,
  Receipt,
  CheckCircle2,
  Clock,
  UserCheck,
  ConciergeBell,
  Activity,
} from 'lucide-react'
import { useRole } from '@/hooks/useRole'
import { useSector } from '@/context/SectorContext'
import { Badge, HelpTooltip } from '@/components/ui'
import { Cita, Cliente, Factura } from '@/types'

export interface WidgetMetricasClaveProps {
  citas: Cita[]
  clientes: Cliente[]
  facturas: Factura[]
}

function formatCurrency(n: number) {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(n)
}

export function WidgetMetricasClave({
  citas,
  clientes,
  facturas,
}: WidgetMetricasClaveProps) {
  const { isWorker, isReceptionist, isManagement, isAssignedToUser } = useRole()
  const { vocabulario } = useSector()

  const hoyStr = new Date().toISOString().slice(0, 10)
  const mesActualStr = new Date().toISOString().slice(0, 7)

  // Citas calculadas para toda la sucursal
  const citasHoy = citas.filter((c) => c.fecha_inicio.startsWith(hoyStr))
  const citasPendientes = citasHoy.filter((c) => c.estado === 'pendiente' || c.estado === 'en_cola').length
  const citasConfirmadas = citasHoy.filter((c) => c.estado === 'confirmada').length
  const citasCompletadas = citasHoy.filter((c) => c.estado === 'completada').length

  // Métricas personales del profesional / empleado
  const misCitasHoy = citasHoy.filter((c) => isAssignedToUser(c))
  const misCitasCompletadas = misCitasHoy.filter((c) => c.estado === 'completada').length
  const misCitasEnAtencion = misCitasHoy.filter((c) => c.estado === 'en_atencion').length
  const misCitasPendientes = misCitasHoy.filter((c) => c.estado === 'pendiente' || c.estado === 'en_cola').length
  const misCitasConfirmadas = misCitasHoy.filter((c) => c.estado === 'confirmada').length

  // Clientes únicos asignados al profesional hoy
  const misClientesHoyIds = new Set(misCitasHoy.map((c) => c.cliente_id).filter(Boolean))
  const misClientesHoyCount = misClientesHoyIds.size

  // Próxima cita del profesional
  const proximaCita = misCitasHoy
    .filter((c) => c.estado === 'confirmada' || c.estado === 'pendiente' || c.estado === 'en_atencion')
    .sort((a, b) => a.fecha_inicio.localeCompare(b.fecha_inicio))[0]

  // Facturación y cobros
  const facturasHoy = facturas.filter(
    (f) => f.estado === 'pagada' && f.created_at.startsWith(hoyStr)
  )
  const ingresosHoy = facturasHoy.reduce((acc, f) => acc + f.total, 0)

  const facturasMes = facturas.filter(
    (f) => f.estado === 'pagada' && f.created_at.startsWith(mesActualStr)
  )
  const ingresosMes = facturasMes.reduce((acc, f) => acc + f.total, 0)

  const facturasPendientes = facturas.filter((f) => f.estado === 'pendiente')
  const totalMontoPendiente = facturasPendientes.reduce((acc, f) => acc + f.total, 0)

  // Clientes nuevos este mes
  const nuevosClientesMes = clientes.filter((c) =>
    c.created_at?.startsWith(mesActualStr)
  ).length

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* ── Tarjeta Principal Asimétrica Adaptada por Rol ── */}
      <div className="lg:col-span-2 relative overflow-hidden rounded-2xl bg-surface-elevated border border-border p-5 shadow-xs flex flex-col justify-between">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-text-muted">
                {isWorker
                  ? `Mis ${vocabulario.singularUnidad}s Hoy`
                  : isReceptionist
                  ? `Atención en Mostrador (${vocabulario.cola})`
                  : vocabulario.metricLabel1}
              </span>
              <HelpTooltip
                title={
                  isWorker
                    ? 'Jornada Operativa'
                    : isReceptionist
                    ? 'Mostrador Hoy'
                    : 'Facturación Diaria'
                }
                content={
                  isWorker
                    ? 'Total de citas asignadas a tu agenda para el día de hoy, con desglose de servicios completados y pendientes.'
                    : isReceptionist
                    ? 'Citas programadas en la sucursal para la fecha actual, con desglose de turnos confirmados y cobros en punto de venta.'
                    : 'Ingresos totales recaudados hoy por servicios pagados y facturación cerrada en la sucursal.'
                }
                size="sm"
              />
            </div>
            <div className="flex items-baseline gap-2 mt-1">
              <h2 className="text-2xl sm:text-3xl font-extrabold font-heading text-text">
                {isWorker ? (
                  `${misCitasHoy.length} ${misCitasHoy.length === 1 ? 'Cita' : 'Citas'}`
                ) : isReceptionist ? (
                  `${citasHoy.length} ${citasHoy.length === 1 ? 'Cita' : 'Citas'}`
                ) : (
                  formatCurrency(ingresosHoy)
                )}
              </h2>

              {isWorker && misCitasEnAtencion > 0 && (
                <span className="inline-flex items-center text-xs font-semibold text-info animate-pulse">
                  <Activity className="w-3.5 h-3.5 mr-0.5" />
                  {misCitasEnAtencion} en atención
                </span>
              )}

              {isReceptionist && (
                <span className="inline-flex items-center text-xs font-semibold text-success">
                  <TrendingUp className="w-3.5 h-3.5 mr-0.5" />
                  {facturasHoy.length} cobros POS
                </span>
              )}

              {isManagement && (
                <span className="inline-flex items-center text-xs font-semibold text-success">
                  <TrendingUp className="w-3.5 h-3.5 mr-0.5" />
                  {facturasHoy.length} ventas hoy
                </span>
              )}
            </div>
          </div>

          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${
              isWorker
                ? 'bg-secondary-soft text-secondary border-border'
                : isReceptionist
                ? 'bg-warning-soft text-warning border-warning/20'
                : 'bg-primary-soft text-primary border-primary/20'
            }`}
          >
            {isWorker ? (
              <UserCheck className="w-5 h-5 text-primary" />
            ) : isReceptionist ? (
              <ConciergeBell className="w-5 h-5" />
            ) : (
              <DollarSign className="w-5 h-5" />
            )}
          </div>
        </div>

        {/* Barra inferior de contexto */}
        <div className="mt-4 pt-3.5 border-t border-border-subtle flex flex-wrap items-center justify-between text-xs text-text-muted gap-2">
          {isWorker ? (
            <>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-success" />
                Completadas hoy: <strong className="text-text font-semibold">{misCitasCompletadas}</strong>
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-warning" />
                Pendientes: <strong className="text-warning font-semibold">{misCitasPendientes}</strong>
              </span>
            </>
          ) : isReceptionist ? (
            <>
              <span>
                Confirmadas: <strong className="text-success">{citasConfirmadas}</strong>
              </span>
              <span>
                Pendientes / Cola: <strong className="text-warning">{citasPendientes}</strong>
              </span>
            </>
          ) : (
            <>
              <span>
                Acumulado mensual: <strong className="text-text">{formatCurrency(ingresosMes)}</strong>
              </span>
              <span>
                Completadas hoy: <strong className="text-success">{citasCompletadas}</strong>
              </span>
              <span>
                Nuevos clientes mes: <strong className="text-text">+{nuevosClientesMes}</strong>
              </span>
            </>
          )}
        </div>
      </div>

      {/* ── Tarjeta 2: Ocupación & Estado de Citas ── */}
      <div className="rounded-2xl bg-surface border border-border p-5 shadow-xs flex flex-col justify-between">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-text-muted">
                {isWorker ? `Mis Turnos de ${vocabulario.singularUnidad}` : vocabulario.metricLabel2}
              </span>
              <HelpTooltip
                title={isWorker ? 'Turnos de Hoy' : 'Agenda General'}
                content={
                  isWorker
                    ? 'Conteo de citas confirmadas y pendientes asignadas a tu usuario en la fecha actual.'
                    : 'Estado de todas las citas del día: confirmadas listas para atender vs. pendientes en cola de espera.'
                }
                size="sm"
              />
            </div>
            <h3 className="text-2xl font-bold font-heading text-text mt-1">
              {isWorker ? misCitasHoy.length : citasHoy.length}
            </h3>
          </div>
          <div className="w-9 h-9 rounded-xl bg-info-soft text-info flex items-center justify-center shrink-0 border border-info/20">
            <CalendarDays className="w-4 h-4" />
          </div>
        </div>

        <div className="mt-3 space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-text-muted flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-success" /> Confirmadas
            </span>
            <span className="font-semibold text-text">
              {isWorker ? misCitasConfirmadas : citasConfirmadas}
            </span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-text-muted flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-warning" /> Pendientes
            </span>
            <span className="font-semibold text-text">
              {isWorker ? misCitasPendientes : citasPendientes}
            </span>
          </div>
        </div>
      </div>

      {/* ── Tarjeta 3: Clientes Asignados o Cuentas por Cobrar ── */}
      <div className="rounded-2xl bg-surface border border-border p-5 shadow-xs flex flex-col justify-between">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-text-muted">
                {isWorker
                  ? 'Clientes Asignados'
                  : isReceptionist
                  ? 'Directorio Clientes'
                  : 'Cuentas x Cobrar'}
              </span>
              <HelpTooltip
                title={
                  isWorker
                    ? 'Clientes Asignados'
                    : isReceptionist
                    ? 'Directorio de Clientes'
                    : 'Cuentas por Cobrar'
                }
                content={
                  isWorker
                    ? 'Número de clientes únicos que atenderás durante el día de hoy y hora de tu próximo turno.'
                    : isReceptionist
                    ? 'Total de clientes registrados en el sistema y nuevos clientes dados de alta durante el mes actual.'
                    : 'Suma económica de facturas y órdenes con saldo pendiente de pago o liquidación.'
                }
                size="sm"
              />
            </div>
            <h3 className="text-2xl font-bold font-heading text-text mt-1">
              {isWorker
                ? misClientesHoyCount
                : isReceptionist
                ? clientes.length
                : formatCurrency(totalMontoPendiente)}
            </h3>
          </div>
          <div className="w-9 h-9 rounded-xl bg-warning-soft text-warning flex items-center justify-center shrink-0 border border-warning/20">
            {isWorker || isReceptionist ? (
              <Users className="w-4 h-4" />
            ) : (
              <Receipt className="w-4 h-4" />
            )}
          </div>
        </div>

        <div className="mt-3 flex items-center justify-between text-xs pt-2 border-t border-border-subtle text-text-muted">
          {isWorker ? (
            <>
              <span className="truncate">
                {proximaCita ? `Próximo: ${proximaCita.cliente?.nombre || 'Cliente'}` : 'Sin turnos próximos'}
              </span>
              {proximaCita && (
                <span className="font-semibold text-text font-mono shrink-0">
                  {proximaCita.fecha_inicio.slice(11, 16)}
                </span>
              )}
            </>
          ) : isReceptionist ? (
            <>
              <span>Nuevos este mes:</span>
              <span className="font-semibold text-text">+{nuevosClientesMes}</span>
            </>
          ) : (
            <>
              <span>Facturas pendientes:</span>
              <Badge variant="warning" size="sm">
                {facturasPendientes.length}
              </Badge>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
