import { useState, useEffect, useMemo } from 'react'
import {
  BarChart2,
  Calendar,
  Users,
  Briefcase,
  ShoppingCart,
  TrendingUp,
  TrendingDown,
  Filter,
  Download,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  DollarSign,
  Activity,
} from 'lucide-react'
import { Badge, Loader, EmptyState } from '@/components/ui'
import { reportesService } from '@/services/reportes.service'
import { Cita, Cliente, Servicio, Factura, EstadoCita } from '@/types'

// ─── Types ──────────────────────────────────────────────────────────────────

type TabId = 'resumen' | 'citas' | 'ventas' | 'clientes' | 'servicios'
type DateRange = 'this_week' | 'this_month' | 'last_month' | 'custom'

// ─── Helpers ─────────────────────────────────────────────────────────────────

function fmt(n: number): string {
  return new Intl.NumberFormat('es-ES').format(n)
}

function fmtMoney(n: number): string {
  return new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n)
}

function fmtDate(iso: string): string {
  return new Date(iso).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })
}

function estadoBadgeVariant(estado: EstadoCita): 'success' | 'warning' | 'danger' | 'default' {
  switch (estado) {
    case 'completada':  return 'success'
    case 'confirmada':  return 'warning'
    case 'cancelada':   return 'danger'
    case 'no_asistio':  return 'danger'
    default:            return 'default'
  }
}

function getDateBounds(range: DateRange): { from: Date; to: Date } {
  const now = new Date()
  const to = new Date(now)
  to.setHours(23, 59, 59, 999)

  if (range === 'this_week') {
    const day = now.getDay()
    const diff = (day === 0 ? -6 : 1 - day)
    const from = new Date(now)
    from.setDate(now.getDate() + diff)
    from.setHours(0, 0, 0, 0)
    return { from, to }
  }
  if (range === 'this_month') {
    const from = new Date(now.getFullYear(), now.getMonth(), 1)
    return { from, to }
  }
  if (range === 'last_month') {
    const from = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    const lastTo = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999)
    return { from, to: lastTo }
  }
  // custom — return last 90 days as fallback
  const from = new Date(now)
  from.setDate(now.getDate() - 90)
  from.setHours(0, 0, 0, 0)
  return { from, to }
}

// ─── KPI Card ───────────────────────────────────────────────────────────────

interface KpiCardProps {
  label: string
  value: string
  sub?: string
  icon: React.ReactNode
  color: string
  trend?: 'up' | 'down' | 'neutral'
}

function KpiCard({ label, value, sub, icon, color, trend }: KpiCardProps) {
  return (
    <div className="card p-5 border border-slate-100 dark:border-slate-800 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
          {icon}
        </div>
        {trend && (
          <span className={`text-xs font-medium ${trend === 'up' ? 'text-emerald-500' : trend === 'down' ? 'text-red-500' : 'text-slate-400'}`}>
            {trend === 'up' ? <TrendingUp className="w-4 h-4" /> : trend === 'down' ? <TrendingDown className="w-4 h-4" /> : null}
          </span>
        )}
      </div>
      <div>
        <p className="text-2xl font-bold text-slate-900 dark:text-slate-100 leading-tight">{value}</p>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{label}</p>
        {sub && <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">{sub}</p>}
      </div>
    </div>
  )
}

// ─── Table helpers ───────────────────────────────────────────────────────────

function Th({ children }: { children: React.ReactNode }) {
  return (
    <th className="px-4 py-2.5 text-left text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider whitespace-nowrap">
      {children}
    </th>
  )
}

function Td({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <td className={`px-4 py-3 text-sm text-slate-700 dark:text-slate-300 ${className}`}>
      {children}
    </td>
  )
}

// ─── Filter Bar ──────────────────────────────────────────────────────────────

interface FilterBarProps {
  range: DateRange
  onRange: (r: DateRange) => void
  extraFilters?: React.ReactNode
}

const DATE_OPTIONS: { value: DateRange; label: string }[] = [
  { value: 'this_week',  label: 'Esta semana' },
  { value: 'this_month', label: 'Este mes' },
  { value: 'last_month', label: 'Mes anterior' },
  { value: 'custom',     label: 'Últimos 90 días' },
]

function FilterBar({ range, onRange, extraFilters }: FilterBarProps) {
  return (
    <div className="flex flex-wrap items-center gap-2 mb-4">
      <Filter className="w-4 h-4 text-slate-400 flex-shrink-0" />
      <div className="flex gap-1 flex-wrap">
        {DATE_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            onClick={() => onRange(opt.value)}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
              range === opt.value
                ? 'bg-primary-600 text-white'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>
      {extraFilters}
    </div>
  )
}

// ─── Resumen Tab ─────────────────────────────────────────────────────────────

interface ResumenTabProps {
  citas: Cita[]
  clientes: Cliente[]
  servicios: Servicio[]
  facturas: Factura[]
  range: DateRange
  onRange: (r: DateRange) => void
}

function ResumenTab({ citas, clientes, facturas, range, onRange }: ResumenTabProps) {
  const { from, to } = getDateBounds(range)

  const citasFiltradas = citas.filter((c) => {
    const d = new Date(c.fecha_inicio)
    return d >= from && d <= to
  })

  const clientesFiltrados = clientes.filter((c) => {
    const d = new Date(c.created_at)
    return d >= from && d <= to
  })

  const facturasFiltradas = facturas.filter((f) => {
    const d = new Date(f.created_at)
    return d >= from && d <= to && f.estado === 'pagada'
  })

  const totalIngresos = facturasFiltradas.reduce((sum, f) => sum + f.total, 0)
  const canceladas = citasFiltradas.filter((c) => c.estado === 'cancelada').length
  const tasaCancelacion = citasFiltradas.length > 0
    ? ((canceladas / citasFiltradas.length) * 100).toFixed(1)
    : '0.0'

  // Top 5 servicios
  const servicioConteo: Record<number, { nombre: string; cantidad: number; ingresos: number }> = {}
  citasFiltradas.forEach((c) => {
    if (!c.servicio) return
    if (!servicioConteo[c.servicio_id]) {
      servicioConteo[c.servicio_id] = { nombre: c.servicio.nombre, cantidad: 0, ingresos: 0 }
    }
    servicioConteo[c.servicio_id].cantidad += 1
    servicioConteo[c.servicio_id].ingresos += c.precio_total
  })
  const topServicios = Object.values(servicioConteo)
    .sort((a, b) => b.cantidad - a.cantidad)
    .slice(0, 5)

  // Top 5 empleados
  const empConteo: Record<number, { nombre: string; citas: number }> = {}
  citasFiltradas.forEach((c) => {
    if (!c.empleado) return
    if (!empConteo[c.empleado_id]) {
      empConteo[c.empleado_id] = { nombre: c.empleado.nombre, citas: 0 }
    }
    empConteo[c.empleado_id].citas += 1
  })
  const topEmpleados = Object.values(empConteo)
    .sort((a, b) => b.citas - a.citas)
    .slice(0, 5)

  return (
    <div className="space-y-6">
      <FilterBar range={range} onRange={onRange} />

      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <KpiCard label="Total Ingresos" value={fmtMoney(totalIngresos)} icon={<DollarSign className="w-5 h-5" />} color="text-emerald-500 bg-emerald-50 dark:bg-emerald-900/30" trend="up" />
        <KpiCard label="Total Citas" value={fmt(citasFiltradas.length)} icon={<Calendar className="w-5 h-5" />} color="text-primary-500 bg-primary-50 dark:bg-primary-900/30" />
        <KpiCard label="Nuevos Clientes" value={fmt(clientesFiltrados.length)} icon={<Users className="w-5 h-5" />} color="text-blue-500 bg-blue-50 dark:bg-blue-900/30" />
        <KpiCard label="Tasa Cancelación" value={`${tasaCancelacion}%`} icon={<Activity className="w-5 h-5" />} color="text-rose-500 bg-rose-50 dark:bg-rose-900/30" trend="down" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top servicios */}
        <div className="card border border-slate-100 dark:border-slate-800">
          <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800">
            <h3 className="font-semibold text-sm text-slate-900 dark:text-slate-100">Top 5 Servicios Más Vendidos</h3>
          </div>
          {topServicios.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-8">Sin datos para el período</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 dark:bg-slate-800/50">
                  <tr>
                    <Th>Servicio</Th>
                    <Th>Cantidad</Th>
                    <Th>Ingresos</Th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {topServicios.map((s, i) => (
                    <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                      <Td><span className="font-medium">{s.nombre}</span></Td>
                      <Td>{fmt(s.cantidad)}</Td>
                      <Td className="font-semibold text-emerald-600 dark:text-emerald-400">{fmtMoney(s.ingresos)}</Td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Top empleados */}
        <div className="card border border-slate-100 dark:border-slate-800">
          <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800">
            <h3 className="font-semibold text-sm text-slate-900 dark:text-slate-100">Top 5 Empleados por Citas</h3>
          </div>
          {topEmpleados.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-8">Sin datos para el período</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 dark:bg-slate-800/50">
                  <tr>
                    <Th>#</Th>
                    <Th>Empleado</Th>
                    <Th>Citas</Th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {topEmpleados.map((e, i) => (
                    <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                      <Td><span className="text-slate-400 font-medium">{i + 1}</span></Td>
                      <Td><span className="font-medium">{e.nombre}</span></Td>
                      <Td>{fmt(e.citas)}</Td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Citas Tab ───────────────────────────────────────────────────────────────

interface CitasTabProps { citas: Cita[] }

function CitasTab({ citas }: CitasTabProps) {
  const [range, setRange] = useState<DateRange>('this_month')
  const [estadoFilter, setEstadoFilter] = useState<EstadoCita | 'todas'>('todas')

  const { from, to } = getDateBounds(range)
  const filtered = citas.filter((c) => {
    const d = new Date(c.fecha_inicio)
    const inRange = d >= from && d <= to
    const inEstado = estadoFilter === 'todas' || c.estado === estadoFilter
    return inRange && inEstado
  })

  const counts = {
    total: filtered.length,
    confirmadas: filtered.filter((c) => c.estado === 'confirmada').length,
    completadas: filtered.filter((c) => c.estado === 'completada').length,
    canceladas: filtered.filter((c) => c.estado === 'cancelada').length,
    no_asistio: filtered.filter((c) => c.estado === 'no_asistio').length,
  }

  const ESTADOS: { value: EstadoCita | 'todas'; label: string }[] = [
    { value: 'todas', label: 'Todas' },
    { value: 'confirmada', label: 'Confirmadas' },
    { value: 'completada', label: 'Completadas' },
    { value: 'cancelada', label: 'Canceladas' },
    { value: 'no_asistio', label: 'No asistió' },
    { value: 'pendiente', label: 'Pendientes' },
  ]

  return (
    <div className="space-y-5">
      <FilterBar
        range={range}
        onRange={setRange}
        extraFilters={
          <select
            value={estadoFilter}
            onChange={(e) => setEstadoFilter(e.target.value as EstadoCita | 'todas')}
            className="ml-2 px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            {ESTADOS.map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
        }
      />

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        <KpiCard label="Total Citas" value={fmt(counts.total)} icon={<Calendar className="w-5 h-5" />} color="text-primary-500 bg-primary-50 dark:bg-primary-900/30" />
        <KpiCard label="Confirmadas" value={fmt(counts.confirmadas)} icon={<Clock className="w-5 h-5" />} color="text-amber-500 bg-amber-50 dark:bg-amber-900/30" />
        <KpiCard label="Completadas" value={fmt(counts.completadas)} icon={<CheckCircle className="w-5 h-5" />} color="text-emerald-500 bg-emerald-50 dark:bg-emerald-900/30" />
        <KpiCard label="Canceladas" value={fmt(counts.canceladas)} icon={<XCircle className="w-5 h-5" />} color="text-red-500 bg-red-50 dark:bg-red-900/30" />
        <KpiCard label="No Asistió" value={fmt(counts.no_asistio)} icon={<AlertCircle className="w-5 h-5" />} color="text-slate-500 bg-slate-100 dark:bg-slate-800" />
      </div>

      <div className="card border border-slate-100 dark:border-slate-800 overflow-hidden">
        {filtered.length === 0 ? (
          <p className="text-sm text-slate-400 text-center py-10">No hay citas para el período/filtro seleccionado.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 dark:bg-slate-800/50">
                <tr>
                  <Th>Fecha</Th>
                  <Th>Cliente</Th>
                  <Th>Servicio</Th>
                  <Th>Empleado</Th>
                  <Th>Estado</Th>
                  <Th>Precio</Th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filtered.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                    <Td className="whitespace-nowrap">{fmtDate(c.fecha_inicio)}</Td>
                    <Td>{c.cliente?.nombre ?? '—'}</Td>
                    <Td>{c.servicio?.nombre ?? '—'}</Td>
                    <Td>{c.empleado?.nombre ?? '—'}</Td>
                    <Td>
                      <Badge variant={estadoBadgeVariant(c.estado)} size="sm">
                        {c.estado.replace('_', ' ')}
                      </Badge>
                    </Td>
                    <Td className="font-semibold">{fmtMoney(c.precio_total)}</Td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Ventas Tab ──────────────────────────────────────────────────────────────

interface VentasTabProps { facturas: Factura[] }

function VentasTab({ facturas }: VentasTabProps) {
  const [range, setRange] = useState<DateRange>('this_month')
  const { from, to } = getDateBounds(range)

  const filtered = facturas.filter((f) => {
    const d = new Date(f.created_at)
    return d >= from && d <= to
  })

  const pagadas = filtered.filter((f) => f.estado === 'pagada')
  const montoTotal = pagadas.reduce((sum, f) => sum + f.total, 0)
  const promedio = pagadas.length > 0 ? montoTotal / pagadas.length : 0
  const canceladas = filtered.filter((f) => f.estado === 'reembolsada').length

  const METODO_LABELS: Record<string, string> = {
    tarjeta: 'Tarjeta', efectivo: 'Efectivo', transferencia: 'Transferencia', stripe: 'Stripe',
  }

  return (
    <div className="space-y-5">
      <FilterBar range={range} onRange={setRange} />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard label="Total Ventas" value={fmt(pagadas.length)} icon={<ShoppingCart className="w-5 h-5" />} color="text-primary-500 bg-primary-50 dark:bg-primary-900/30" />
        <KpiCard label="Monto Total" value={fmtMoney(montoTotal)} icon={<DollarSign className="w-5 h-5" />} color="text-emerald-500 bg-emerald-50 dark:bg-emerald-900/30" trend="up" />
        <KpiCard label="Promedio por Venta" value={fmtMoney(promedio)} icon={<TrendingUp className="w-5 h-5" />} color="text-blue-500 bg-blue-50 dark:bg-blue-900/30" />
        <KpiCard label="Reembolsadas" value={fmt(canceladas)} icon={<TrendingDown className="w-5 h-5" />} color="text-rose-500 bg-rose-50 dark:bg-rose-900/30" />
      </div>

      <div className="card border border-slate-100 dark:border-slate-800 overflow-hidden">
        {filtered.length === 0 ? (
          <p className="text-sm text-slate-400 text-center py-10">No hay ventas para el período seleccionado.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 dark:bg-slate-800/50">
                <tr>
                  <Th>Número</Th>
                  <Th>Cliente</Th>
                  <Th>Items</Th>
                  <Th>Total</Th>
                  <Th>Método Pago</Th>
                  <Th>Estado</Th>
                  <Th>Fecha</Th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filtered.map((f) => (
                  <tr key={f.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                    <Td><span className="font-mono text-xs text-primary-600 dark:text-primary-400">{f.numero}</span></Td>
                    <Td>{f.cliente?.nombre ?? '—'}</Td>
                    <Td className="max-w-[180px]">
                      <span className="text-xs text-slate-500 truncate block">
                        {f.items.map((i) => i.descripcion).join(', ')}
                      </span>
                    </Td>
                    <Td className="font-semibold text-emerald-600 dark:text-emerald-400">{fmtMoney(f.total)}</Td>
                    <Td>{METODO_LABELS[f.metodo_pago] ?? f.metodo_pago}</Td>
                    <Td>
                      <Badge
                        variant={f.estado === 'pagada' ? 'success' : f.estado === 'pendiente' ? 'warning' : 'danger'}
                        size="sm"
                      >
                        {f.estado}
                      </Badge>
                    </Td>
                    <Td className="whitespace-nowrap">{fmtDate(f.created_at)}</Td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Clientes Tab ─────────────────────────────────────────────────────────────

interface ClientesTabProps { clientes: Cliente[]; citas: Cita[] }

function ClientesTab({ clientes, citas }: ClientesTabProps) {
  const [range, setRange] = useState<DateRange>('this_month')
  const { from, to } = getDateBounds(range)

  const nuevos = clientes.filter((c) => {
    const d = new Date(c.created_at)
    return d >= from && d <= to
  })

  const recurrentes = clientes.filter((c) => c.total_citas > 3)

  // Last cita per client
  const ultimaCita: Record<number, string> = {}
  citas.forEach((c) => {
    const prev = ultimaCita[c.cliente_id]
    if (!prev || c.fecha_inicio > prev) {
      ultimaCita[c.cliente_id] = c.fecha_inicio
    }
  })

  return (
    <div className="space-y-5">
      <FilterBar range={range} onRange={setRange} />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <KpiCard label="Total Clientes" value={fmt(clientes.length)} icon={<Users className="w-5 h-5" />} color="text-primary-500 bg-primary-50 dark:bg-primary-900/30" />
        <KpiCard label="Nuevos Este Período" value={fmt(nuevos.length)} icon={<TrendingUp className="w-5 h-5" />} color="text-emerald-500 bg-emerald-50 dark:bg-emerald-900/30" />
        <KpiCard label="Clientes Recurrentes (+3 citas)" value={fmt(recurrentes.length)} icon={<Activity className="w-5 h-5" />} color="text-blue-500 bg-blue-50 dark:bg-blue-900/30" />
      </div>

      <div className="card border border-slate-100 dark:border-slate-800 overflow-hidden">
        {clientes.length === 0 ? (
          <p className="text-sm text-slate-400 text-center py-10">No hay clientes registrados.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 dark:bg-slate-800/50">
                <tr>
                  <Th>Nombre</Th>
                  <Th>Email</Th>
                  <Th>Teléfono</Th>
                  <Th>Total Citas</Th>
                  <Th>Última Cita</Th>
                  <Th>Estado</Th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {clientes.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                    <Td><span className="font-medium">{c.nombre}</span></Td>
                    <Td className="text-slate-500">{c.email}</Td>
                    <Td className="text-slate-500">{c.telefono ?? '—'}</Td>
                    <Td>{fmt(c.total_citas)}</Td>
                    <Td className="whitespace-nowrap">
                      {ultimaCita[c.id] ? fmtDate(ultimaCita[c.id]) : '—'}
                    </Td>
                    <Td>
                      {c.total_citas > 3
                        ? <Badge variant="success" size="sm">Recurrente</Badge>
                        : <Badge variant="default" size="sm">Nuevo</Badge>
                      }
                    </Td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Servicios Tab ───────────────────────────────────────────────────────────

interface ServiciosTabProps { servicios: Servicio[]; citas: Cita[] }

function ServiciosTab({ servicios, citas }: ServiciosTabProps) {
  const servicioStats = useMemo(() => {
    const map: Record<number, { totalCitas: number; ingresos: number }> = {}
    citas.forEach((c) => {
      if (!map[c.servicio_id]) map[c.servicio_id] = { totalCitas: 0, ingresos: 0 }
      map[c.servicio_id].totalCitas += 1
      map[c.servicio_id].ingresos += c.precio_total
    })
    return map
  }, [citas])

  const activos = servicios.filter((s) => s.activo).length
  const inactivos = servicios.filter((s) => !s.activo).length

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <KpiCard label="Servicios Activos" value={fmt(activos)} icon={<CheckCircle className="w-5 h-5" />} color="text-emerald-500 bg-emerald-50 dark:bg-emerald-900/30" />
        <KpiCard label="Servicios Inactivos" value={fmt(inactivos)} icon={<XCircle className="w-5 h-5" />} color="text-rose-500 bg-rose-50 dark:bg-rose-900/30" />
      </div>

      <div className="card border border-slate-100 dark:border-slate-800 overflow-hidden">
        {servicios.length === 0 ? (
          <p className="text-sm text-slate-400 text-center py-10">No hay servicios registrados.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 dark:bg-slate-800/50">
                <tr>
                  <Th>Nombre</Th>
                  <Th>Categoría</Th>
                  <Th>Precio</Th>
                  <Th>Duración</Th>
                  <Th>Total Citas</Th>
                  <Th>Ingresos</Th>
                  <Th>Estado</Th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {servicios.map((s) => {
                  const stats = servicioStats[s.id] ?? { totalCitas: 0, ingresos: 0 }
                  return (
                    <tr key={s.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                      <Td><span className="font-medium">{s.nombre}</span></Td>
                      <Td>{s.categoria?.nombre ?? '—'}</Td>
                      <Td>{fmtMoney(s.precio_base)}</Td>
                      <Td>{s.duracion_base_min} min</Td>
                      <Td>{fmt(stats.totalCitas)}</Td>
                      <Td className="font-semibold text-emerald-600 dark:text-emerald-400">{fmtMoney(stats.ingresos)}</Td>
                      <Td>
                        <Badge variant={s.activo ? 'success' : 'default'} size="sm">
                          {s.activo ? 'Activo' : 'Inactivo'}
                        </Badge>
                      </Td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Main Page ───────────────────────────────────────────────────────────────

const TABS: { id: TabId; label: string; icon: React.ReactNode }[] = [
  { id: 'resumen',   label: 'Resumen',   icon: <BarChart2 className="w-4 h-4" /> },
  { id: 'citas',     label: 'Citas',     icon: <Calendar className="w-4 h-4" /> },
  { id: 'ventas',    label: 'Ventas',    icon: <ShoppingCart className="w-4 h-4" /> },
  { id: 'clientes',  label: 'Clientes',  icon: <Users className="w-4 h-4" /> },
  { id: 'servicios', label: 'Servicios', icon: <Briefcase className="w-4 h-4" /> },
]

export default function ReportesPage() {
  const [activeTab, setActiveTab] = useState<TabId>('resumen')
  const [range, setRange] = useState<DateRange>('this_month')

  const [citas, setCitas] = useState<Cita[]>([])
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [servicios, setServicios] = useState<Servicio[]>([])
  const [facturas, setFacturas] = useState<Factura[]>([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setCargando(true)
    Promise.all([
      reportesService.getCitas(),
      reportesService.getClientes(),
      reportesService.getServicios(),
      reportesService.getFacturas(),
    ])
      .then(([rCitas, rClientes, rServicios, rFacturas]) => {
        if (rCitas.data)    setCitas(rCitas.data)
        if (rClientes.data) setClientes(rClientes.data)
        if (rServicios.data) setServicios(rServicios.data)
        if (rFacturas.data) setFacturas(rFacturas.data)
      })
      .catch((err: Error) => setError(err.message))
      .finally(() => setCargando(false))
  }, [])

  if (cargando) return <Loader text="Cargando reportes..." />

  if (error) {
    return (
      <EmptyState
        title="Error al cargar reportes"
        description={error}
        icon={<AlertCircle className="w-10 h-10 text-red-400" />}
      />
    )
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Reportes</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">
            Análisis de rendimiento y métricas del negocio
          </p>
        </div>
        <button className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
          <Download className="w-4 h-4" />
          Exportar
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-slate-100 dark:bg-slate-800/60 rounded-xl w-fit">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all ${
              activeTab === tab.id
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-sm'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            {tab.icon}
            <span className="hidden sm:inline">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'resumen' && (
        <ResumenTab citas={citas} clientes={clientes} servicios={servicios} facturas={facturas} range={range} onRange={setRange} />
      )}
      {activeTab === 'citas' && <CitasTab citas={citas} />}
      {activeTab === 'ventas' && <VentasTab facturas={facturas} />}
      {activeTab === 'clientes' && <ClientesTab clientes={clientes} citas={citas} />}
      {activeTab === 'servicios' && <ServiciosTab servicios={servicios} citas={citas} />}
    </div>
  )
}
