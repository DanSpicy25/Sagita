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
  Layers,
} from 'lucide-react'
import { Badge, Loader, EmptyState } from '@/components/ui'
import { useToast } from '@/hooks/useToast'
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
    <div className="card p-4 sm:p-5 border border-slate-100 dark:border-slate-800 flex flex-col gap-2.5">
      <div className="flex items-center justify-between">
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${color}`}>
          {icon}
        </div>
        {trend && (
          <span className={`text-xs font-medium ${trend === 'up' ? 'text-emerald-500' : trend === 'down' ? 'text-red-500' : 'text-slate-400'}`}>
            {trend === 'up' ? <TrendingUp className="w-4 h-4" /> : trend === 'down' ? <TrendingDown className="w-4 h-4" /> : null}
          </span>
        )}
      </div>
      <div>
        <p className="text-xl sm:text-[1.65rem] font-bold tracking-tight text-slate-900 dark:text-slate-100 leading-tight">{value}</p>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{label}</p>
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
                ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900'
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

// ─── Componente de Volumen & Tendencias (Curva con Subidas y Bajadas) ───────

interface GraficoVolumenProps {
  facturas: Factura[]
  topVendidos: { nombre: string; cantidad: number; ingresos: number }[]
  from: Date
  to: Date
}

function GraficoVolumenYTendencia({
  facturas,
  topVendidos,
  from,
  to,
}: GraficoVolumenProps) {
  const [metricMode, setMetricMode] = useState<'volumen' | 'ingresos'>('volumen')
  const [puntoSeleccionado, setPuntoSeleccionado] = useState<number | null>(null)

  const puntos = useMemo(() => {
    const start = from.getTime()
    const duration = Math.max(to.getTime() - start + 1, 1)
    const list = Array.from({ length: 7 }, (_, index) => {
      const bucketStart = new Date(start + (duration * index) / 7)
      return {
        id: index,
        label: bucketStart.toLocaleDateString('es-MX', { day: 'numeric', month: 'short' }),
        volumen: 0,
        ingresos: 0,
      }
    })

    facturas.forEach((factura) => {
      const fechaVenta = new Date(factura.created_at).getTime()
      if (!Number.isFinite(fechaVenta) || fechaVenta < start || fechaVenta > to.getTime()) return

      const index = Math.min(6, Math.floor(((fechaVenta - start) / duration) * list.length))
      const unidades = (factura.items ?? []).reduce(
        (sum, item) => sum + Math.max(0, item.cantidad),
        0
      )
      list[index].volumen += unidades
      list[index].ingresos += factura.total
    })

    const vals = list.map((p) => (metricMode === 'volumen' ? p.volumen : p.ingresos))
    const maxVal = Math.max(...vals, 0)
    const scaleMax = maxVal > 0 ? maxVal * 1.15 : 1

    return list.map((p, index) => {
      const val = metricMode === 'volumen' ? p.volumen : p.ingresos
      const x = 40 + (index / (list.length - 1)) * 520
      const y = 140 - (val / scaleMax) * 96
      return {
        ...p,
        valor: val,
        x,
        y: Math.max(25, Math.min(145, y)),
      }
    })
  }, [facturas, metricMode, from, to])

  // Construir comando SVG Path suave (Curva Cúbica)
  const pathD = useMemo(() => {
    if (puntos.length < 2) return ''
    let d = `M ${puntos[0].x} ${puntos[0].y}`
    for (let i = 0; i < puntos.length - 1; i++) {
      const curr = puntos[i]
      const next = puntos[i + 1]
      const cpx1 = curr.x + (next.x - curr.x) / 2
      const cpy1 = curr.y
      const cpx2 = curr.x + (next.x - curr.x) / 2
      const cpy2 = next.y
      d += ` C ${cpx1} ${cpy1}, ${cpx2} ${cpy2}, ${next.x} ${next.y}`
    }
    return d
  }, [puntos])

  const areaD = useMemo(() => {
    if (puntos.length < 2) return ''
    const first = puntos[0]
    const last = puntos[puntos.length - 1]
    return `${pathD} L ${last.x} 155 L ${first.x} 155 Z`
  }, [pathD, puntos])

  const totalVolumenVendido = facturas.reduce(
    (total, factura) =>
      total + (factura.items ?? []).reduce((sum, item) => sum + Math.max(0, item.cantidad), 0),
    0
  )

  const maxItemCantidad = Math.max(...topVendidos.map((item) => item.cantidad), 1)

  return (
    <div className="card p-4 sm:p-5 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-4">
      {/* Cabecera del Gráfico y Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-primary-soft text-primary">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-slate-900 dark:text-slate-100">
                Ventas del período
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Tendencia real de unidades vendidas e ingresos
              </p>
            </div>
          </div>
        </div>

        {/* Toggle de Métrica */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-100 dark:bg-slate-800 self-start sm:self-auto text-xs font-semibold">
          <button
            type="button"
            onClick={() => {
              setMetricMode('volumen')
              setPuntoSeleccionado(null)
            }}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              metricMode === 'volumen'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs font-bold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Unidades vendidas
          </button>
          <button
            type="button"
            onClick={() => {
              setMetricMode('ingresos')
              setPuntoSeleccionado(null)
            }}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              metricMode === 'ingresos'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs font-bold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Ingresos ($)
          </button>
        </div>
      </div>

      {/* ── Gráfico SVG Interactivo con Puntos y Línea de Subida/Bajada ── */}
      <div className="relative pt-2">
      {facturas.length === 0 && (
        <p className="mb-2 text-sm text-text-muted">
          No hay ventas pagadas registradas en este período.
        </p>
      )}
      <div className="w-full h-44 sm:h-48 relative overflow-hidden">
          <svg
            className="w-full h-full overflow-visible"
            viewBox="0 0 600 170"
            preserveAspectRatio="none"
          >
            <defs>
              <linearGradient id="volumenGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--color-primary)" stopOpacity="0.18" />
                <stop offset="100%" stopColor="var(--color-primary)" stopOpacity="0.01" />
              </linearGradient>
            </defs>

            {/* Líneas horizontales de referencia (Grid) */}
            <line x1="40" y1="40" x2="560" y2="40" stroke="currentColor" strokeDasharray="3 3" className="text-slate-200 dark:text-slate-800" strokeWidth="1" />
            <line x1="40" y1="90" x2="560" y2="90" stroke="currentColor" strokeDasharray="3 3" className="text-slate-200 dark:text-slate-800" strokeWidth="1" />
            <line x1="40" y1="140" x2="560" y2="140" stroke="currentColor" className="text-slate-200 dark:text-slate-800" strokeWidth="1" />

            {/* Área sombreada bajo la curva */}
            <path d={areaD} fill="url(#volumenGradient)" />

            {/* Línea continua de tendencia */}
            <path
              d={pathD}
              fill="none"
              stroke="var(--color-primary)"
              strokeWidth="3.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Puntos interactivos sobre la curva */}
            {puntos.map((pt) => {
              const activo = puntoSeleccionado === pt.id
              return (
                <g
                  key={pt.id}
                  className="cursor-pointer"
                  role="button"
                  tabIndex={0}
                  aria-label={`${pt.label}: ${metricMode === 'volumen' ? `${pt.volumen} unidades vendidas` : fmtMoney(pt.ingresos)}`}
                  onClick={() => setPuntoSeleccionado(pt.id)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault()
                      setPuntoSeleccionado(pt.id)
                    }
                  }}
                >
                  {/* Círculo de interacción más amplio */}
                  <circle
                    cx={pt.x}
                    cy={pt.y}
                    r={activo ? 14 : 9}
                    className="fill-primary/20 transition-all duration-200"
                  />
                  {/* Punto central */}
                  <circle
                    cx={pt.x}
                    cy={pt.y}
                    r="5"
                    className="fill-primary stroke-white dark:stroke-slate-900 transition-all duration-200"
                    strokeWidth="2.5"
                  />

                  {/* Etiqueta del período en el eje X */}
                  <text
                    x={pt.x}
                    y="165"
                    textAnchor="middle"
                    className="text-[10px] font-bold fill-slate-500 dark:fill-slate-400 font-mono"
                  >
                    {pt.label}
                  </text>
                </g>
              )
            })}
          </svg>

          {/* Tooltip flotante al seleccionar o pulsar un punto */}
          {puntoSeleccionado !== null && (
            <div
              className="absolute top-2 left-1/2 -translate-x-1/2 px-4 py-2 rounded-xl bg-slate-900/95 dark:bg-slate-800/95 text-white shadow-xl text-xs flex items-center gap-3 border border-slate-700/60 animate-fade-in"
            >
              <div>
                <span className="text-[10px] uppercase font-mono text-slate-400 font-semibold">
                  {puntos[puntoSeleccionado].label}
                </span>
                <p className="font-bold text-sm text-white">
                  {metricMode === 'volumen'
                        ? `${puntos[puntoSeleccionado].volumen} unidades vendidas`
                    : fmtMoney(puntos[puntoSeleccionado].ingresos)}
                </p>
              </div>
              <div className="border-l border-slate-700 pl-3 text-[11px] text-slate-300">
                <p>Ingresos: <strong className="text-white">{fmtMoney(puntos[puntoSeleccionado].ingresos)}</strong></p>
                <p>Volumen: <strong className="text-white">{puntos[puntoSeleccionado].volumen} uds</strong></p>
              </div>
              <button
                type="button"
                onClick={() => setPuntoSeleccionado(null)}
                className="text-slate-400 hover:text-white text-xs font-bold ml-1 cursor-pointer"
              >
                ✕
              </button>
            </div>
          )}
        </div>

        {/* Leyenda explicativa de puntos */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-2 font-medium">
            <span className="w-2.5 h-2.5 rounded-full bg-primary inline-block" />
            <span>Ventas registradas · escala desde cero</span>
          </div>

          <span className="text-[11px] text-slate-400 italic">
            Selecciona un punto para ver el detalle del período.
          </span>
        </div>
      </div>

      {/* ─── Barras de Volumen de lo Más Vendido ─── */}
      <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
            <Layers className="w-4 h-4 text-primary" /> Más vendidos por unidades
          </h4>
          <span className="text-[11px] text-slate-400 font-mono">
            {totalVolumenVendido} unidades totales • {topVendidos.length} ítems en ranking
          </span>
        </div>

        {topVendidos.length === 0 ? (
          <p className="text-xs text-slate-400 italic py-2">Sin datos de volumen para este período.</p>
        ) : (
          <div className="space-y-3">
            {topVendidos.map((s, idx) => {
              const porcentaje = Math.round((s.cantidad / maxItemCantidad) * 100)
              return (
                <div key={idx} className="space-y-1 group">
                  <div className="flex items-center justify-between text-xs font-medium">
                    <span className="text-slate-800 dark:text-slate-200 font-semibold flex items-center gap-1.5">
                      <span className="w-4 h-4 rounded-full bg-slate-100 dark:bg-slate-800 text-[10px] font-bold flex items-center justify-center text-slate-500">
                        {idx + 1}
                      </span>
                      {s.nombre}
                    </span>
                    <div className="flex items-center gap-3">
                      <span className="font-mono font-bold text-primary text-xs">
                        {s.cantidad} {s.cantidad === 1 ? 'unidad' : 'unidades'} ({porcentaje}%)
                      </span>
                      <span className="font-mono text-emerald-600 dark:text-emerald-400 text-xs font-semibold">
                        {fmtMoney(s.ingresos)}
                      </span>
                    </div>
                  </div>

                  {/* Barra de volumen visual */}
                  <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full bg-primary transition-all duration-500 group-hover:brightness-110"
                      style={{ width: `${Math.max(8, porcentaje)}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
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

  const vendidosConteo: Record<string, { nombre: string; cantidad: number; ingresos: number }> = {}
  facturasFiltradas.forEach((factura) => {
    const items = factura.items ?? []
    items.forEach((item) => {
      const nombre = (item.descripcion ?? '').trim() || 'Artículo sin nombre'
      if (!vendidosConteo[nombre]) {
        vendidosConteo[nombre] = { nombre, cantidad: 0, ingresos: 0 }
      }
      vendidosConteo[nombre].cantidad += Math.max(0, item.cantidad)
      vendidosConteo[nombre].ingresos += item.total ?? 0
    })
  })
  const topVendidos = Object.values(vendidosConteo)
    .sort((a, b) => b.cantidad - a.cantidad)
    .slice(0, 5)

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

      <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4">
        <KpiCard label="Total Ingresos" value={fmtMoney(totalIngresos)} icon={<DollarSign className="w-5 h-5" />} color="text-emerald-500 bg-emerald-50 dark:bg-emerald-900/30" trend="up" />
        <KpiCard label="Total Citas" value={fmt(citasFiltradas.length)} icon={<Calendar className="w-5 h-5" />} color="text-primary-500 bg-primary-50 dark:bg-primary-900/30" />
        <KpiCard label="Nuevos Clientes" value={fmt(clientesFiltrados.length)} icon={<Users className="w-5 h-5" />} color="text-blue-500 bg-blue-50 dark:bg-blue-900/30" />
        <KpiCard label="Tasa Cancelación" value={`${tasaCancelacion}%`} icon={<Activity className="w-5 h-5" />} color="text-rose-500 bg-rose-50 dark:bg-rose-900/30" trend="down" />
      </div>

      {/* ─── Gráfico de Volumen y Tendencias de Demanda (Puntos con Subidas y Bajadas) ─── */}
      <GraficoVolumenYTendencia
        facturas={facturasFiltradas}
        topVendidos={topVendidos}
        from={from}
        to={to}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top servicios */}
        <div className="card border border-slate-100 dark:border-slate-800">
          <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800">
            <h3 className="font-semibold text-sm text-slate-900 dark:text-slate-100">Servicios con más citas</h3>
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

  const { toast } = useToast()

  const exportarReporte = () => {
    try {
      let csvContent = ''
      const fechaStr = new Date().toISOString().slice(0, 10)
      const filename = `sagitta_${activeTab}_${fechaStr}.csv`

      if (activeTab === 'citas') {
        const header = ['ID', 'Fecha', 'Hora', 'Cliente', 'Servicio', 'Profesional', 'Estado', 'Precio']
        const rows = citas.map((c) => [
          c.id,
          c.fecha,
          c.hora,
          `"${c.cliente?.nombre || ''}"`,
          `"${c.servicio?.nombre || ''}"`,
          `"${c.empleado?.nombre || ''}"`,
          c.estado,
          c.precio_total || c.servicio?.precio_base || 0,
        ])
        csvContent = [header.join(','), ...rows.map((r) => r.join(','))].join('\n')
      } else if (activeTab === 'ventas') {
        const header = ['ID', 'Número', 'Fecha', 'Cliente', 'Subtotal', 'Descuento', 'Total', 'Método', 'Estado']
        const rows = facturas.map((f) => [
          f.id,
          f.numero,
          f.created_at || '',
          `"${f.cliente?.nombre || ''}"`,
          f.subtotal,
          f.descuento || 0,
          f.total,
          f.metodo_pago,
          f.estado,
        ])
        csvContent = [header.join(','), ...rows.map((r) => r.join(','))].join('\n')
      } else if (activeTab === 'clientes') {
        const header = ['ID', 'Nombre', 'Email', 'Teléfono', 'Total Citas']
        const rows = clientes.map((cl) => [
          cl.id,
          `"${cl.nombre}"`,
          `"${cl.email || ''}"`,
          `"${cl.telefono || ''}"`,
          cl.total_citas || 0,
        ])
        csvContent = [header.join(','), ...rows.map((r) => r.join(','))].join('\n')
      } else if (activeTab === 'servicios') {
        const header = ['ID', 'Nombre', 'Duración (min)', 'Precio Base', 'Estado']
        const rows = servicios.map((s) => [
          s.id,
          `"${s.nombre}"`,
          s.duracion_base_min || 0,
          s.precio_base || 0,
          s.activo ? 'Activo' : 'Inactivo',
        ])
        csvContent = [header.join(','), ...rows.map((r) => r.join(','))].join('\n')
      } else {
        const totalFacturado = facturas.reduce((acc, f) => acc + (f.total || 0), 0)
        const totalCitasCompletadas = citas.filter((c) => c.estado === 'completada').length
        const totalCitasCanceladas = citas.filter((c) => c.estado === 'cancelada').length
        const header = ['Métrica', 'Valor']
        const rows = [
          ['Total Ingresos Registrados', `$${totalFacturado}`],
          ['Total Citas Registradas', citas.length],
          ['Citas Completadas', totalCitasCompletadas],
          ['Citas Canceladas', totalCitasCanceladas],
          ['Clientes Registrados', clientes.length],
          ['Servicios en Catálogo', servicios.length],
        ]
        csvContent = [header.join(','), ...rows.map((r) => r.join(','))].join('\n')
      }

      const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.setAttribute('href', url)
      link.setAttribute('download', filename)
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)

      toast.success('Reporte exportado', `Archivo ${filename} generado exitosamente`)
    } catch {
      toast.error('Error al exportar', 'No se pudo generar el archivo de reporte')
    }
  }

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
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">Reportes y análisis</h1>
          <p className="text-slate-500 dark:text-slate-400 text-base mt-1">
            Análisis de rendimiento y métricas del negocio
          </p>
        </div>
        <button
          onClick={exportarReporte}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-sm cursor-pointer"
        >
          <Download className="w-4 h-4" />
          Exportar CSV
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
