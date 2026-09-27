import { useState, useEffect, useMemo } from 'react'
import {
  Package,
  PackagePlus,
  PackageMinus,
  AlertTriangle,
  Search,
  Filter,
  Plus,
  Pencil,
  Trash2,
  ArrowUpCircle,
  ArrowDownCircle,
  RefreshCw,
  RotateCcw,
  ArrowLeftRight,
  ChevronDown,
} from 'lucide-react'
import { Producto, MovimientoStock, AlertaStock, MovimientoInventario } from '@/types'
import { inventarioService } from '@/services/inventario.service'
import { Button, Badge, Loader, Modal, Input, Select, Textarea, EmptyState } from '@/components/ui'
import { useToast } from '@/hooks/useToast'

// ─── Types ───────────────────────────────────────────────────────────────────

type TabInventario = 'productos' | 'movimientos' | 'alertas'

const CATEGORIAS = [
  'Productos de Belleza',
  'Insumos Médicos',
  'Suplementos',
  'Ropa y Accesorios',
  'General',
]

const TIPOS_MOVIMIENTO: { value: MovimientoInventario; label: string }[] = [
  { value: 'PURCHASE', label: 'Compra / Entrada' },
  { value: 'SALE', label: 'Venta / Salida' },
  { value: 'SERVICE_CONSUMPTION', label: 'Consumo por Servicio (BOM)' },
  { value: 'ADJUSTMENT', label: 'Ajuste de Inventario' },
  { value: 'RETURN', label: 'Devolución' },
  { value: 'LOSS', label: 'Pérdida / Merma' },
  { value: 'TRANSFER', label: 'Transferencia' },
]

// ─── Helper Utilities ─────────────────────────────────────────────────────────

function stockVariant(actual: number, minimo: number): 'danger' | 'warning' | 'success' {
  if (actual <= minimo) return 'danger'
  if (actual <= minimo * 2) return 'warning'
  return 'success'
}

function stockLabel(actual: number, minimo: number) {
  if (actual <= minimo) return 'Crítico'
  if (actual <= minimo * 2) return 'Bajo'
  return 'OK'
}

function stockColorClass(actual: number, minimo: number) {
  if (actual <= minimo) return 'text-red-600 dark:text-red-400 font-bold'
  if (actual <= minimo * 2) return 'text-amber-600 dark:text-amber-400 font-semibold'
  return 'text-emerald-600 dark:text-emerald-400'
}

function tipoVariant(tipo: MovimientoInventario): 'success' | 'danger' | 'warning' | 'info' | 'default' {
  switch (tipo) {
    case 'PURCHASE': return 'success'
    case 'SALE': return 'info'
    case 'SERVICE_CONSUMPTION': return 'info'
    case 'ADJUSTMENT': return 'default'
    case 'RETURN': return 'warning'
    case 'LOSS': return 'danger'
    case 'TRANSFER': return 'info'
    default: return 'default'
  }
}

function tipoLabel(tipo: MovimientoInventario) {
  return TIPOS_MOVIMIENTO.find((t) => t.value === tipo)?.label ?? tipo
}

function tipoIcon(tipo: MovimientoInventario) {
  switch (tipo) {
    case 'PURCHASE': return <ArrowUpCircle className="w-3.5 h-3.5" />
    case 'SALE': return <ArrowDownCircle className="w-3.5 h-3.5" />
    case 'SERVICE_CONSUMPTION': return <ArrowDownCircle className="w-3.5 h-3.5" />
    case 'ADJUSTMENT': return <RefreshCw className="w-3.5 h-3.5" />
    case 'RETURN': return <RotateCcw className="w-3.5 h-3.5" />
    case 'LOSS': return <PackageMinus className="w-3.5 h-3.5" />
    case 'TRANSFER': return <ArrowLeftRight className="w-3.5 h-3.5" />
    default: return <RefreshCw className="w-3.5 h-3.5" />
  }
}

// ─── Empty form defaults ──────────────────────────────────────────────────────

const EMPTY_PRODUCTO: Partial<Producto> = {
  sku: '',
  nombre: '',
  descripcion: '',
  categoria: 'Productos de Belleza',
  precio_venta: 0,
  precio_costo: 0,
  stock_actual: 0,
  stock_minimo: 5,
  unidad: 'unidad',
  activo: true,
  proveedor: '',
}

const EMPTY_MOV = {
  producto_id: 0,
  tipo: 'PURCHASE' as MovimientoInventario,
  cantidad: 1,
  motivo: '',
  referencia: '',
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function InventarioPage() {
  const [tab, setTab] = useState<TabInventario>('productos')
  const [productos, setProductos] = useState<Producto[]>([])
  const [movimientos, setMovimientos] = useState<MovimientoStock[]>([])
  const [alertas, setAlertas] = useState<AlertaStock[]>([])
  const [cargando, setCargando] = useState(true)

  // Filters
  const [busqueda, setBusqueda] = useState('')
  const [filtroCategoria, setFiltroCategoria] = useState('')
  const [filtroEstado, setFiltroEstado] = useState('')

  // Modals
  const [modalProductoAbierto, setModalProductoAbierto] = useState(false)
  const [productoEditando, setProductoEditando] = useState<Producto | null>(null)
  const [formProducto, setFormProducto] = useState<Partial<Producto>>(EMPTY_PRODUCTO)

  const [modalMovimientoAbierto, setModalMovimientoAbierto] = useState(false)
  const [formMovimiento, setFormMovimiento] = useState(EMPTY_MOV)
  const [guardando, setGuardando] = useState(false)

  const { toast } = useToast()

  // ─── Load data ────────────────────────────────────────────────────────────

  const cargarDatos = () => {
    setCargando(true)
    Promise.all([
      inventarioService.getProductos(),
      inventarioService.getMovimientos(),
      inventarioService.getAlertasStock(),
    ])
      .then(([prodRes, movRes, alertRes]) => {
        if (prodRes.data) setProductos(prodRes.data)
        if (movRes.data) setMovimientos(movRes.data)
        if (alertRes.data) setAlertas(alertRes.data)
      })
      .catch((err) => {
        toast.error('Error al cargar inventario', err instanceof Error ? err.message : 'Error')
      })
      .finally(() => setCargando(false))
  }

  useEffect(() => {
    cargarDatos()
  }, [])

  // ─── Derived / Filtered ───────────────────────────────────────────────────

  const productosFiltrados = useMemo(() => {
    return productos.filter((p) => {
      const matchBusqueda =
        !busqueda ||
        p.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
        p.sku.toLowerCase().includes(busqueda.toLowerCase()) ||
        (p.proveedor ?? '').toLowerCase().includes(busqueda.toLowerCase())

      const matchCategoria = !filtroCategoria || p.categoria === filtroCategoria

      const matchEstado =
        !filtroEstado ||
        (filtroEstado === 'activo' && p.activo && p.stock_actual > 0) ||
        (filtroEstado === 'inactivo' && !p.activo) ||
        (filtroEstado === 'sin_stock' && p.stock_actual === 0)

      return matchBusqueda && matchCategoria && matchEstado
    })
  }, [productos, busqueda, filtroCategoria, filtroEstado])

  const kpiStockCritico = productos.filter((p) => p.activo && p.stock_actual <= p.stock_minimo).length
  const kpiValorInventario = productos.reduce((acc, p) => acc + p.precio_costo * p.stock_actual, 0)

  // ─── Producto CRUD ────────────────────────────────────────────────────────

  const abrirNuevoProducto = () => {
    setProductoEditando(null)
    setFormProducto(EMPTY_PRODUCTO)
    setModalProductoAbierto(true)
  }

  const abrirEditarProducto = (p: Producto) => {
    setProductoEditando(p)
    setFormProducto({ ...p })
    setModalProductoAbierto(true)
  }

  const handleGuardarProducto = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formProducto.nombre?.trim() || !formProducto.sku?.trim()) return
    setGuardando(true)
    try {
      if (productoEditando) {
        await inventarioService.updateProducto(productoEditando.id, formProducto)
        toast.success('Producto actualizado', formProducto.nombre ?? '')
      } else {
        await inventarioService.createProducto(formProducto)
        toast.success('Producto creado', formProducto.nombre ?? '')
      }
      setModalProductoAbierto(false)
      cargarDatos()
    } catch {
      toast.error('Error', 'No se pudo guardar el producto')
    } finally {
      setGuardando(false)
    }
  }

  const handleEliminarProducto = async (p: Producto) => {
    if (!confirm(`¿Eliminar el producto "${p.nombre}"?`)) return
    try {
      await inventarioService.deleteProducto(p.id)
      toast.success('Producto eliminado', p.nombre)
      cargarDatos()
    } catch {
      toast.error('Error', 'No se pudo eliminar el producto')
    }
  }

  // ─── Movimiento ───────────────────────────────────────────────────────────

  const handleRegistrarMovimiento = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formMovimiento.producto_id || formMovimiento.cantidad <= 0) return
    setGuardando(true)
    try {
      await inventarioService.registrarMovimiento(formMovimiento)
      toast.success('Movimiento registrado', tipoLabel(formMovimiento.tipo))
      setModalMovimientoAbierto(false)
      setFormMovimiento(EMPTY_MOV)
      cargarDatos()
    } catch {
      toast.error('Error', 'No se pudo registrar el movimiento')
    } finally {
      setGuardando(false)
    }
  }

  // ─── Tab button helper ────────────────────────────────────────────────────

  const tabClass = (t: TabInventario) =>
    [
      'px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-2',
      tab === t
        ? 'bg-primary-600 text-white shadow-sm'
        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800',
    ].join(' ')

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Inventario</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Gestión de productos, stock y movimientos de almacén
          </p>
        </div>

        <div className="flex items-center gap-2">
          {tab === 'productos' && (
            <Button onClick={abrirNuevoProducto} leftIcon={<Plus className="w-4 h-4" />}>
              Nuevo Producto
            </Button>
          )}
          {tab === 'movimientos' && (
            <Button
              onClick={() => setModalMovimientoAbierto(true)}
              leftIcon={<PackagePlus className="w-4 h-4" />}
            >
              Registrar Movimiento
            </Button>
          )}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card p-5 border border-slate-100 dark:border-slate-800">
          <div className="flex items-start justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-primary-50 dark:bg-primary-950/40 text-primary-600 flex items-center justify-center">
              <Package className="w-5 h-5" />
            </div>
            <span className="text-xs font-semibold text-primary-600 bg-primary-50 dark:bg-primary-950/30 px-2 py-0.5 rounded-full">
              Activos
            </span>
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            {productos.filter((p) => p.activo).length}
          </p>
          <p className="text-xs text-slate-400 mt-1">Productos en catálogo</p>
        </div>

        <div className="card p-5 border border-slate-100 dark:border-slate-800">
          <div className="flex items-start justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-red-50 dark:bg-red-950/40 text-red-600 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <span className="text-xs font-semibold text-red-600 bg-red-50 dark:bg-red-950/30 px-2 py-0.5 rounded-full">
              Alertas
            </span>
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{kpiStockCritico}</p>
          <p className="text-xs text-slate-400 mt-1">Productos bajo stock mínimo</p>
        </div>

        <div className="card p-5 border border-slate-100 dark:border-slate-800">
          <div className="flex items-start justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 flex items-center justify-center">
              <PackagePlus className="w-5 h-5" />
            </div>
            <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30 px-2 py-0.5 rounded-full">
              Valor
            </span>
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            ${kpiValorInventario.toFixed(0)}
          </p>
          <p className="text-xs text-slate-400 mt-1">Valor de inventario (costo)</p>
        </div>

        <div className="card p-5 border border-slate-100 dark:border-slate-800">
          <div className="flex items-start justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 flex items-center justify-center">
              <RefreshCw className="w-5 h-5" />
            </div>
            <span className="text-xs font-semibold text-amber-600 bg-amber-50 dark:bg-amber-950/30 px-2 py-0.5 rounded-full">
              Historial
            </span>
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{movimientos.length}</p>
          <p className="text-xs text-slate-400 mt-1">Movimientos registrados</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2 overflow-x-auto">
        <button onClick={() => setTab('productos')} className={tabClass('productos')}>
          <Package className="w-4 h-4" />
          Productos ({productos.length})
        </button>
        <button onClick={() => setTab('movimientos')} className={tabClass('movimientos')}>
          <RefreshCw className="w-4 h-4" />
          Movimientos ({movimientos.length})
        </button>
        <button onClick={() => setTab('alertas')} className={tabClass('alertas')}>
          <AlertTriangle className="w-4 h-4" />
          Alertas de Stock
          {alertas.length > 0 && (
            <span className="ml-1 inline-flex items-center justify-center w-4 h-4 text-[10px] font-bold bg-red-500 text-white rounded-full">
              {alertas.length}
            </span>
          )}
        </button>
      </div>

      {/* Tab Content */}
      {cargando ? (
        <Loader text="Cargando inventario..." />
      ) : (
        <>
          {/* ── TAB: PRODUCTOS ─────────────────────────────────────────────── */}
          {tab === 'productos' && (
            <div className="space-y-4">
              {/* Filters */}
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Buscar por nombre, SKU o proveedor..."
                    value={busqueda}
                    onChange={(e) => setBusqueda(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>

                <div className="relative">
                  <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                  <select
                    value={filtroCategoria}
                    onChange={(e) => setFiltroCategoria(e.target.value)}
                    className="pl-9 pr-8 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-primary-500 appearance-none"
                  >
                    <option value="">Todas las categorías</option>
                    {CATEGORIAS.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                </div>

                <div className="relative">
                  <select
                    value={filtroEstado}
                    onChange={(e) => setFiltroEstado(e.target.value)}
                    className="pl-4 pr-8 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-primary-500 appearance-none"
                  >
                    <option value="">Todos los estados</option>
                    <option value="activo">Activo</option>
                    <option value="inactivo">Inactivo</option>
                    <option value="sin_stock">Sin stock</option>
                  </select>
                  <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                </div>
              </div>

              {/* Table */}
              <div className="card shadow-card overflow-hidden">
                {productosFiltrados.length === 0 ? (
                  <EmptyState title="No se encontraron productos" description="Prueba ajustando los filtros o agrega un nuevo producto." />
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 dark:bg-slate-800/40 text-slate-400 uppercase font-semibold border-b border-slate-100 dark:border-slate-800">
                        <tr>
                          <th className="py-3 px-4">SKU</th>
                          <th className="py-3 px-4">Nombre</th>
                          <th className="py-3 px-4">Categoría</th>
                          <th className="py-3 px-4 text-center">Stock</th>
                          <th className="py-3 px-4 text-right">Precio Venta</th>
                          <th className="py-3 px-4 text-center">Estado</th>
                          <th className="py-3 px-4 text-center">Acciones</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-700 text-slate-700 dark:text-slate-300">
                        {productosFiltrados.map((p) => (
                          <tr
                            key={p.id}
                            className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors"
                          >
                            <td className="py-3 px-4 font-mono font-semibold text-primary-600 text-[11px]">
                              {p.sku}
                            </td>
                            <td className="py-3 px-4">
                              <p className="font-medium text-slate-900 dark:text-slate-100">{p.nombre}</p>
                              {p.proveedor && (
                                <p className="text-[11px] text-slate-400">{p.proveedor}</p>
                              )}
                            </td>
                            <td className="py-3 px-4 text-slate-500">{p.categoria}</td>
                            <td className="py-3 px-4 text-center">
                              <div className="flex flex-col items-center gap-0.5">
                                <span className={stockColorClass(p.stock_actual, p.stock_minimo)}>
                                  {p.stock_actual} {p.unidad}
                                </span>
                                <Badge variant={stockVariant(p.stock_actual, p.stock_minimo)} size="sm" dot>
                                  {stockLabel(p.stock_actual, p.stock_minimo)}
                                </Badge>
                              </div>
                            </td>
                            <td className="py-3 px-4 text-right font-semibold text-slate-900 dark:text-slate-100">
                              ${p.precio_venta.toFixed(2)}
                            </td>
                            <td className="py-3 px-4 text-center">
                              <Badge
                                variant={
                                  !p.activo
                                    ? 'default'
                                    : p.stock_actual === 0
                                    ? 'danger'
                                    : 'success'
                                }
                                size="sm"
                                dot
                              >
                                {!p.activo ? 'Inactivo' : p.stock_actual === 0 ? 'Sin Stock' : 'Activo'}
                              </Badge>
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex items-center justify-center gap-1">
                                <button
                                  onClick={() => abrirEditarProducto(p)}
                                  className="p-1.5 rounded-lg text-slate-400 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-950/30 transition-colors"
                                  title="Editar"
                                >
                                  <Pencil className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => handleEliminarProducto(p)}
                                  className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                                  title="Eliminar"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── TAB: MOVIMIENTOS ───────────────────────────────────────────── */}
          {tab === 'movimientos' && (
            <div className="card shadow-card overflow-hidden">
              <div className="p-4 border-b border-slate-100 dark:border-slate-800">
                <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200">
                  Historial de Movimientos de Stock
                </h3>
              </div>

              {movimientos.length === 0 ? (
                <EmptyState title="No hay movimientos registrados" />
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 dark:bg-slate-800/40 text-slate-400 uppercase font-semibold border-b border-slate-100 dark:border-slate-800">
                      <tr>
                        <th className="py-3 px-4">Tipo</th>
                        <th className="py-3 px-4">Producto</th>
                        <th className="py-3 px-4 text-center">Cantidad</th>
                        <th className="py-3 px-4 text-center">Anterior → Nuevo</th>
                        <th className="py-3 px-4">Motivo</th>
                        <th className="py-3 px-4">Usuario</th>
                        <th className="py-3 px-4">Fecha</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-700 text-slate-700 dark:text-slate-300">
                      {movimientos.map((m) => {
                        const esSalida =
                          m.tipo === 'SALE' || m.tipo === 'LOSS' || m.tipo === 'TRANSFER'
                        return (
                          <tr
                            key={m.id}
                            className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors"
                          >
                            <td className="py-3 px-4">
                              <Badge variant={tipoVariant(m.tipo)} size="sm">
                                <span className="flex items-center gap-1">
                                  {tipoIcon(m.tipo)}
                                  {tipoLabel(m.tipo)}
                                </span>
                              </Badge>
                            </td>
                            <td className="py-3 px-4">
                              <p className="font-medium text-slate-900 dark:text-slate-100">
                                {m.producto?.nombre ?? `Producto #${m.producto_id}`}
                              </p>
                              {m.referencia && (
                                <p className="text-[11px] text-slate-400 font-mono">{m.referencia}</p>
                              )}
                            </td>
                            <td className="py-3 px-4 text-center">
                              <span
                                className={
                                  esSalida
                                    ? 'text-red-600 dark:text-red-400 font-bold'
                                    : 'text-emerald-600 dark:text-emerald-400 font-bold'
                                }
                              >
                                {esSalida ? '−' : '+'}{m.cantidad}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-center text-slate-500">
                              {m.cantidad_anterior} → {m.cantidad_nueva}
                            </td>
                            <td className="py-3 px-4 text-slate-500 max-w-[180px] truncate">
                              {m.motivo ?? '—'}
                            </td>
                            <td className="py-3 px-4 text-slate-400 text-[11px]">{m.usuario ?? '—'}</td>
                            <td className="py-3 px-4 text-slate-400 whitespace-nowrap">
                              {new Date(m.created_at).toLocaleString('es-ES', {
                                day: 'numeric',
                                month: 'short',
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* ── TAB: ALERTAS ───────────────────────────────────────────────── */}
          {tab === 'alertas' && (
            <div className="space-y-4">
              {alertas.length === 0 ? (
                <div className="card p-10 border border-slate-100 dark:border-slate-800 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-14 h-14 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 flex items-center justify-center">
                      <Package className="w-7 h-7" />
                    </div>
                    <p className="font-semibold text-slate-800 dark:text-slate-200">
                      ¡Todo en orden!
                    </p>
                    <p className="text-sm text-slate-400">
                      No hay productos por debajo del stock mínimo.
                    </p>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400 font-medium">
                    <AlertTriangle className="w-4 h-4" />
                    {alertas.length} {alertas.length === 1 ? 'producto requiere' : 'productos requieren'} reposición urgente
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {alertas.map((a) => (
                      <div
                        key={a.producto_id}
                        className="card p-5 border border-red-200 dark:border-red-900/50 bg-red-50/30 dark:bg-red-950/10"
                      >
                        <div className="flex items-start justify-between gap-2 mb-3">
                          <div className="w-9 h-9 rounded-xl bg-red-100 dark:bg-red-950/40 text-red-600 flex items-center justify-center flex-shrink-0">
                            <PackageMinus className="w-4 h-4" />
                          </div>
                          <Badge variant="danger" size="sm" dot>
                            Stock Crítico
                          </Badge>
                        </div>

                        <p className="font-bold text-sm text-slate-900 dark:text-slate-100 leading-snug">
                          {a.producto.nombre}
                        </p>
                        <p className="text-[11px] font-mono text-slate-400 mt-0.5">{a.producto.sku}</p>
                        <p className="text-xs text-slate-500 mt-0.5">{a.producto.categoria}</p>

                        <div className="mt-4 pt-3 border-t border-red-200 dark:border-red-900/30 flex items-center justify-between text-xs">
                          <div>
                            <p className="text-slate-500">Stock actual</p>
                            <p className="text-2xl font-black text-red-600 dark:text-red-400 leading-none mt-0.5">
                              {a.stock_actual}
                              <span className="text-sm font-normal ml-1">{a.producto.unidad}</span>
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-slate-500">Mínimo requerido</p>
                            <p className="text-lg font-bold text-slate-700 dark:text-slate-300 leading-none mt-0.5">
                              {a.stock_minimo}
                              <span className="text-xs font-normal ml-1">{a.producto.unidad}</span>
                            </p>
                          </div>
                        </div>

                        <div className="mt-3">
                          {/* Stock bar */}
                          <div className="w-full h-1.5 rounded-full bg-red-100 dark:bg-red-950/40">
                            <div
                              className="h-1.5 rounded-full bg-red-500 transition-all"
                              style={{
                                width: `${Math.min(100, (a.stock_actual / (a.stock_minimo * 2)) * 100)}%`,
                              }}
                            />
                          </div>
                        </div>

                        {a.producto.proveedor && (
                          <p className="text-[11px] text-slate-400 mt-3">
                            Proveedor: <strong>{a.producto.proveedor}</strong>
                          </p>
                        )}

                        <div className="mt-3">
                          <Button
                            size="sm"
                            variant="secondary"
                            className="w-full justify-center text-xs"
                            onClick={() => {
                              setFormMovimiento({
                                ...EMPTY_MOV,
                                producto_id: a.producto_id,
                                tipo: 'PURCHASE',
                              })
                              setModalMovimientoAbierto(true)
                              setTab('alertas')
                            }}
                            leftIcon={<PackagePlus className="w-3.5 h-3.5" />}
                          >
                            Registrar Entrada
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}
        </>
      )}

      {/* ── MODAL: PRODUCTO ──────────────────────────────────────────────────── */}
      <Modal
        isOpen={modalProductoAbierto}
        onClose={() => setModalProductoAbierto(false)}
        title={productoEditando ? 'Editar Producto' : 'Nuevo Producto'}
      >
        <form onSubmit={handleGuardarProducto} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="SKU"
              placeholder="BEL-001"
              value={formProducto.sku ?? ''}
              onChange={(e) => setFormProducto({ ...formProducto, sku: e.target.value })}
              required
            />
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Categoría
              </label>
              <select
                value={formProducto.categoria ?? ''}
                onChange={(e) => setFormProducto({ ...formProducto, categoria: e.target.value })}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
                required
              >
                {CATEGORIAS.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>

          <Input
            label="Nombre del Producto"
            placeholder="Ej: Serum Vitamina C 30ml"
            value={formProducto.nombre ?? ''}
            onChange={(e) => setFormProducto({ ...formProducto, nombre: e.target.value })}
            required
          />

          <Textarea
            label="Descripción (opcional)"
            placeholder="Descripción breve del producto..."
            value={formProducto.descripcion ?? ''}
            onChange={(e) => setFormProducto({ ...formProducto, descripcion: e.target.value })}
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Precio de Venta ($)"
              type="number"
              min="0"
              step="0.01"
              value={formProducto.precio_venta ?? 0}
              onChange={(e) => setFormProducto({ ...formProducto, precio_venta: Number(e.target.value) })}
              required
            />
            <Input
              label="Precio de Costo ($)"
              type="number"
              min="0"
              step="0.01"
              value={formProducto.precio_costo ?? 0}
              onChange={(e) => setFormProducto({ ...formProducto, precio_costo: Number(e.target.value) })}
              required
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <Input
              label="Stock Actual"
              type="number"
              min="0"
              value={formProducto.stock_actual ?? 0}
              onChange={(e) => setFormProducto({ ...formProducto, stock_actual: Number(e.target.value) })}
              required
            />
            <Input
              label="Stock Mínimo"
              type="number"
              min="0"
              value={formProducto.stock_minimo ?? 5}
              onChange={(e) => setFormProducto({ ...formProducto, stock_minimo: Number(e.target.value) })}
              required
            />
            <Input
              label="Unidad"
              placeholder="unidad"
              value={formProducto.unidad ?? ''}
              onChange={(e) => setFormProducto({ ...formProducto, unidad: e.target.value })}
              required
            />
          </div>

          <Input
            label="Proveedor (opcional)"
            placeholder="Nombre del proveedor"
            value={formProducto.proveedor ?? ''}
            onChange={(e) => setFormProducto({ ...formProducto, proveedor: e.target.value })}
          />

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="activo"
              checked={formProducto.activo ?? true}
              onChange={(e) => setFormProducto({ ...formProducto, activo: e.target.checked })}
              className="w-4 h-4 rounded accent-primary-600"
            />
            <label htmlFor="activo" className="text-sm text-slate-700 dark:text-slate-300">
              Producto activo
            </label>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
            <Button
              variant="secondary"
              type="button"
              onClick={() => setModalProductoAbierto(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={guardando}>
              {guardando ? 'Guardando...' : productoEditando ? 'Guardar Cambios' : 'Crear Producto'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* ── MODAL: MOVIMIENTO ────────────────────────────────────────────────── */}
      <Modal
        isOpen={modalMovimientoAbierto}
        onClose={() => setModalMovimientoAbierto(false)}
        title="Registrar Movimiento de Stock"
      >
        <form onSubmit={handleRegistrarMovimiento} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Producto
            </label>
            <select
              value={formMovimiento.producto_id}
              onChange={(e) => setFormMovimiento({ ...formMovimiento, producto_id: Number(e.target.value) })}
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
              required
            >
              <option value={0}>Seleccionar producto...</option>
              {productos.map((p) => (
                <option key={p.id} value={p.id}>
                  [{p.sku}] {p.nombre} — Stock: {p.stock_actual} {p.unidad}
                </option>
              ))}
            </select>
          </div>

          <Select
            label="Tipo de Movimiento"
            value={formMovimiento.tipo}
            onChange={(e) =>
              setFormMovimiento({ ...formMovimiento, tipo: e.target.value as MovimientoInventario })
            }
            options={TIPOS_MOVIMIENTO.map((t) => ({ value: t.value, label: t.label }))}
          />

          <Input
            label={
              formMovimiento.tipo === 'ADJUSTMENT'
                ? 'Nueva cantidad (stock directo)'
                : 'Cantidad'
            }
            type="number"
            min="1"
            value={formMovimiento.cantidad}
            onChange={(e) => setFormMovimiento({ ...formMovimiento, cantidad: Number(e.target.value) })}
            required
          />

          <Textarea
            label="Motivo (opcional)"
            placeholder="Ej: Compra mensual al proveedor..."
            value={formMovimiento.motivo}
            onChange={(e) => setFormMovimiento({ ...formMovimiento, motivo: e.target.value })}
          />

          <Input
            label="Referencia (opcional)"
            placeholder="Ej: OC-2026-007"
            value={formMovimiento.referencia}
            onChange={(e) => setFormMovimiento({ ...formMovimiento, referencia: e.target.value })}
          />

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
            <Button
              variant="secondary"
              type="button"
              onClick={() => setModalMovimientoAbierto(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={guardando || !formMovimiento.producto_id}>
              {guardando ? 'Registrando...' : 'Registrar Movimiento'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
