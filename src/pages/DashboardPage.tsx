import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  CalendarDays,
  Users,
  Plus,
  ArrowRight,
  Receipt,
  ShoppingCart,
  Package,
  AlertTriangle,
  CheckCircle2,
  Clock,
  XCircle,
  BarChart2,
  DollarSign,
} from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { Badge, Button, Loader } from '@/components/ui'
import { Cita, Cliente, Factura } from '@/types'
import { citasService } from '@/services/citas.service'
import { clientesService } from '@/services/clientes.service'
import { pagosService } from '@/services/pagos.service'

// ─── Helpers ───────────────────────────────────────────────────────────────

function formatCurrency(n: number) {
  return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n)
}

function estadoBadgeVariant(estado: string) {
  switch (estado) {
    case 'confirmada': return 'success'
    case 'pendiente': return 'warning'
    case 'completada': return 'info'
    case 'cancelada': return 'error'
    default: return 'default'
  }
}

// ─── Component ─────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const { user } = useAuth()
  const [citas, setCitas] = useState<Cita[]>([])
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [facturas, setFacturas] = useState<Factura[]>([])
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    Promise.all([
      citasService.getAll().then(r => r.data ?? []),
      clientesService.getAll().then(r => r.data ?? []),
      pagosService.getFacturas().then(r => r.data ?? []),
    ])
      .then(([c, cl, f]) => {
        setCitas(c)
        setClientes(cl)
        setFacturas(f)
      })
      .finally(() => setCargando(false))
  }, [])

  // KPIs computed from real data
  const hoy = new Date().toISOString().slice(0, 10)
  const citasHoy = citas.filter(c => c.fecha_inicio.startsWith(hoy))
  const citasPendientes = citas.filter(c => c.estado === 'pendiente').length
  const citasConfirmadas = citas.filter(c => c.estado === 'confirmada').length
  const ingresosMes = facturas
    .filter(f => f.estado === 'pagada' && f.created_at.startsWith(new Date().toISOString().slice(0, 7)))
    .reduce((sum, f) => sum + f.total, 0)
  const ingresosTotales = facturas.filter(f => f.estado === 'pagada').reduce((sum, f) => sum + f.total, 0)
  const proximasCitas = citas
    .filter(c => c.fecha_inicio >= new Date().toISOString() && c.estado !== 'cancelada')
    .slice(0, 5)

  if (cargando) return <Loader fullScreen text="Cargando dashboard..." />

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            Hola, {user?.nombre?.split(' ')[0] ?? 'Usuario'}
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">
            {new Date().toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/ventas">
            <Button variant="outline" size="sm" leftIcon={<ShoppingCart className="w-4 h-4" />}>
              Nueva Venta
            </Button>
          </Link>
          <Link to="/citas/nueva">
            <Button size="sm" leftIcon={<Plus className="w-4 h-4" />}>
              Agendar Cita
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card p-5 border border-slate-100 dark:border-slate-800">
          <div className="flex items-start justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center">
              <CalendarDays className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            </div>
            <Badge variant="success" size="sm">Hoy</Badge>
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{citasHoy.length}</p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Citas hoy</p>
          <p className="text-xs text-slate-400 mt-1">{citasPendientes} pendientes · {citasConfirmadas} confirmadas</p>
        </div>

        <div className="card p-5 border border-slate-100 dark:border-slate-800">
          <div className="flex items-start justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center">
              <Users className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{clientes.length}</p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Clientes registrados</p>
          <p className="text-xs text-slate-400 mt-1">Total activos en sistema</p>
        </div>

        <div className="card p-5 border border-slate-100 dark:border-slate-800">
          <div className="flex items-start justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{formatCurrency(ingresosMes)}</p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Ingresos este mes</p>
          <p className="text-xs text-slate-400 mt-1">Total: {formatCurrency(ingresosTotales)}</p>
        </div>

        <div className="card p-5 border border-slate-100 dark:border-slate-800">
          <div className="flex items-start justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-900/30 flex items-center justify-center">
              <Receipt className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{facturas.filter(f => f.estado === 'pagada').length}</p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Facturas pagadas</p>
          <p className="text-xs text-slate-400 mt-1">{facturas.filter(f => f.estado === 'pendiente').length} pendientes</p>
        </div>
      </div>

      {/* Citas + Quick Links */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Próximas Citas */}
        <div className="lg:col-span-2 card border border-slate-100 dark:border-slate-800">
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
            <h2 className="font-semibold text-sm text-slate-900 dark:text-slate-100">Próximas Citas</h2>
            <Link to="/citas" className="text-xs text-indigo-600 dark:text-indigo-400 font-medium flex items-center gap-1 hover:underline">
              Ver agenda <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {proximasCitas.length === 0 ? (
              <div className="py-10 text-center">
                <CalendarDays className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="text-sm text-slate-400">No hay citas próximas</p>
                <Link to="/citas/nueva">
                  <Button size="sm" variant="outline" className="mt-3">Agendar ahora</Button>
                </Link>
              </div>
            ) : (
              proximasCitas.map(cita => (
                <div key={cita.id} className="px-6 py-3.5 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 font-semibold text-xs flex items-center justify-center flex-shrink-0">
                      {cita.fecha_inicio.slice(11, 16)}
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-sm text-slate-900 dark:text-slate-100 truncate">
                        {cita.servicio?.nombre ?? 'Servicio'}
                      </p>
                      <p className="text-xs text-slate-400 truncate">
                        {cita.cliente?.nombre} · {cita.empleado?.nombre}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <Badge variant={estadoBadgeVariant(cita.estado)} size="sm">
                      {cita.estado}
                    </Badge>
                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      {formatCurrency(cita.precio_total)}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Accesos Rápidos */}
        <div className="card border border-slate-100 dark:border-slate-800">
          <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800">
            <h2 className="font-semibold text-sm text-slate-900 dark:text-slate-100">Accesos Rápidos</h2>
          </div>
          <div className="p-3 space-y-1">
            {[
              { to: '/citas/nueva', icon: <CalendarDays className="w-4 h-4" />, label: 'Nueva Cita', sub: 'Asistente paso a paso', color: 'text-indigo-600 bg-indigo-50 dark:bg-indigo-950/40' },
              { to: '/ventas', icon: <ShoppingCart className="w-4 h-4" />, label: 'Punto de Venta', sub: 'Cobrar producto/servicio', color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40' },
              { to: '/clientes', icon: <Users className="w-4 h-4" />, label: 'Clientes', sub: 'Historial y contactos', color: 'text-blue-600 bg-blue-50 dark:bg-blue-950/40' },
              { to: '/inventario', icon: <Package className="w-4 h-4" />, label: 'Inventario', sub: 'Stock y movimientos', color: 'text-amber-600 bg-amber-50 dark:bg-amber-950/40' },
              { to: '/reportes', icon: <BarChart2 className="w-4 h-4" />, label: 'Reportes', sub: 'Métricas y análisis', color: 'text-violet-600 bg-violet-50 dark:bg-violet-950/40' },
              { to: '/finanzas', icon: <Receipt className="w-4 h-4" />, label: 'Finanzas', sub: 'Facturas y cupones', color: 'text-rose-600 bg-rose-50 dark:bg-rose-950/40' },
            ].map(item => (
              <Link
                key={item.to}
                to={item.to}
                className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${item.color}`}>
                    {item.icon}
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-800 dark:text-slate-100">{item.label}</p>
                    <p className="text-[11px] text-slate-400">{item.sub}</p>
                  </div>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-slate-400 group-hover:translate-x-0.5 transition-all" />
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Citas Totales', value: citas.length, icon: <CalendarDays className="w-4 h-4" />, color: 'text-indigo-500' },
          { label: 'Completadas', value: citas.filter(c => c.estado === 'completada').length, icon: <CheckCircle2 className="w-4 h-4" />, color: 'text-emerald-500' },
          { label: 'Pendientes', value: citas.filter(c => c.estado === 'pendiente').length, icon: <Clock className="w-4 h-4" />, color: 'text-amber-500' },
          { label: 'Canceladas', value: citas.filter(c => c.estado === 'cancelada').length, icon: <XCircle className="w-4 h-4" />, color: 'text-red-500' },
        ].map(s => (
          <div key={s.label} className="card p-4 border border-slate-100 dark:border-slate-800 flex items-center gap-3">
            <div className={`flex-shrink-0 ${s.color}`}>{s.icon}</div>
            <div>
              <p className="text-xl font-bold text-slate-900 dark:text-slate-100">{s.value}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Alert: stock bajo */}
      <div className="card border border-amber-100 dark:border-amber-900/40 bg-amber-50/50 dark:bg-amber-950/20 p-4 flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-amber-800 dark:text-amber-300">Revisión de inventario recomendada</p>
          <p className="text-xs text-amber-600 dark:text-amber-400 mt-0.5">
            Verifica el stock mínimo de tus productos en el módulo de inventario.
          </p>
        </div>
        <Link to="/inventario">
          <Button size="sm" variant="outline" className="border-amber-300 text-amber-700 hover:bg-amber-100 dark:border-amber-700 dark:text-amber-300 flex-shrink-0">
            Ver Inventario
          </Button>
        </Link>
      </div>
    </div>
  )
}
