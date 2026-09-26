import { useState, useEffect, useCallback } from 'react'
import {
  ShoppingCart,
  History,
  Landmark,
  Search,
  Plus,
  Minus,
  Trash2,
  X,
  CheckCircle2,
  Printer,
  Eye,
  ArrowDownCircle,
  ArrowUpCircle,
  LockKeyhole,
  Unlock,
  User,
  Package,
  Scissors,
  CreditCard,
  Banknote,
  ArrowLeftRight,
  Layers,
  AlertTriangle,
} from 'lucide-react'
import {
  ItemVenta,
  Venta,
  SesionCaja,
  MovimientoCaja,
  MetodoPagoVenta,
  EstadoVenta,
} from '@/types'
import { ventasService } from '@/services/ventas.service'
import { serviciosService } from '@/services/servicios.service'
import { inventarioService } from '@/services/inventario.service'
import { Button, Badge, Loader, Modal, Input, Textarea, EmptyState } from '@/components/ui'
import { useToast } from '@/hooks/useToast'

// ─── Types ───────────────────────────────────────────────────────────────────

type TabVentas = 'pos' | 'historial' | 'caja'
type SubTabPOS = 'servicios' | 'productos'

interface CatalogoItem {
  id: number
  nombre: string
  precio: number
  tipo: 'servicio' | 'producto'
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const estadoVentaBadge: Record<EstadoVenta, { variant: 'success' | 'warning' | 'danger' | 'default' | 'primary'; label: string }> = {
  PAID:      { variant: 'success', label: 'Pagada' },
  PENDING:   { variant: 'warning', label: 'Pendiente' },
  DRAFT:     { variant: 'default', label: 'Borrador' },
  CANCELLED: { variant: 'danger',  label: 'Cancelada' },
  REFUNDED:  { variant: 'primary', label: 'Reembolsada' },
}

const metodoPagoLabel: Record<MetodoPagoVenta, string> = {
  efectivo:      'Efectivo',
  tarjeta:       'Tarjeta',
  transferencia: 'Transferencia',
  mixto:         'Mixto',
}

const metodoPagoIcon: Record<MetodoPagoVenta, React.ReactNode> = {
  efectivo:      <Banknote className="w-4 h-4" />,
  tarjeta:       <CreditCard className="w-4 h-4" />,
  transferencia: <ArrowLeftRight className="w-4 h-4" />,
  mixto:         <Layers className="w-4 h-4" />,
}

const fmt = (n: number) => `$${n.toFixed(2)}`

// ─── POS Cart Item Row ────────────────────────────────────────────────────────

function CartItemRow({
  item,
  onUpdate,
  onRemove,
}: {
  item: ItemVenta
  onUpdate: (id: string, changes: Partial<ItemVenta>) => void
  onRemove: (id: string) => void
}) {
  const sub = (item.precio_unitario - item.descuento_item) * item.cantidad
  return (
    <div className="flex flex-col gap-2 py-3 border-b border-slate-100 dark:border-slate-800 last:border-0">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">{item.nombre}</p>
          <p className="text-[11px] text-slate-400">{fmt(item.precio_unitario)} c/u</p>
        </div>
        <button
          onClick={() => onRemove(item.id)}
          className="text-slate-300 hover:text-red-500 transition-colors shrink-0 mt-0.5"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="flex items-center gap-3">
        {/* Quantity */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => onUpdate(item.id, { cantidad: Math.max(1, item.cantidad - 1) })}
            className="w-6 h-6 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center justify-center transition-colors"
          >
            <Minus className="w-3 h-3" />
          </button>
          <span className="w-6 text-center text-xs font-bold text-slate-900 dark:text-slate-100">{item.cantidad}</span>
          <button
            onClick={() => onUpdate(item.id, { cantidad: item.cantidad + 1 })}
            className="w-6 h-6 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center justify-center transition-colors"
          >
            <Plus className="w-3 h-3" />
          </button>
        </div>

        {/* Item discount */}
        <div className="flex items-center gap-1 flex-1">
          <span className="text-[11px] text-slate-400 whitespace-nowrap">Dto.</span>
          <input
            type="number"
            min="0"
            step="0.01"
            value={item.descuento_item}
            onChange={(e) => onUpdate(item.id, { descuento_item: Math.max(0, Number(e.target.value)) })}
            className="w-16 text-xs px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-1 focus:ring-primary-500"
          />
        </div>

        <span className="text-xs font-bold text-slate-900 dark:text-slate-100 shrink-0">{fmt(sub)}</span>
      </div>
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function VentasPage() {
  const [tab, setTab] = useState<TabVentas>('pos')
  const { toast } = useToast()

  // ── POS State ──────────────────────────────────────────────────────────────
  const [subTabPOS, setSubTabPOS] = useState<SubTabPOS>('servicios')
  const [catalogoServicios, setCatalogoServicios] = useState<CatalogoItem[]>([])
  const [catalogoProductos, setCatalogoProductos] = useState<CatalogoItem[]>([])
  const [busquedaPOS, setBusquedaPOS] = useState('')
  const [cartItems, setCartItems] = useState<ItemVenta[]>([])
  const [descuentoGlobal, setDescuentoGlobal] = useState(0)
  const [tasaImpuesto, setTasaImpuesto] = useState(10)
  const [metodoPago, setMetodoPago] = useState<MetodoPagoVenta>('efectivo')
  const [notasVenta, setNotasVenta] = useState('')
  const [clienteNombre, setClienteNombre] = useState('')
  const [procesandoVenta, setProcesandoVenta] = useState(false)
  const [ventaExitosa, setVentaExitosa] = useState<Venta | null>(null)

  // ── Historial State ────────────────────────────────────────────────────────
  const [ventas, setVentas] = useState<Venta[]>([])
  const [cargandoVentas, setCargandoVentas] = useState(false)
  const [busquedaHistorial, setBusquedaHistorial] = useState('')
  const [filtroFecha, setFiltroFecha] = useState('')
  const [ventaDetalle, setVentaDetalle] = useState<Venta | null>(null)

  // ── Caja State ─────────────────────────────────────────────────────────────
  const [sesion, setSesion] = useState<SesionCaja | null>(null)
  const [cargandoCaja, setCargandoCaja] = useState(false)
  const [montoApertura, setMontoApertura] = useState('')
  const [modalCierreCaja, setModalCierreCaja] = useState(false)
  const [montoCierre, setMontoCierre] = useState('')
  const [modalMovimiento, setModalMovimiento] = useState<'ingreso' | 'egreso' | null>(null)
  const [movMonto, setMovMonto] = useState('')
  const [movDescripcion, setMovDescripcion] = useState('')

  // ─── Load catalogue ────────────────────────────────────────────────────────
  useEffect(() => {
    serviciosService.getAll()
      .then((res) => {
        if (res.data) {
          const mapped: CatalogoItem[] = res.data.map((s) => ({
            id: s.id,
            nombre: s.nombre,
            precio: s.precio_base,
            tipo: 'servicio' as const,
          }))
          setCatalogoServicios(mapped)
        }
      })
      .catch(() => {})

    inventarioService.getProductos()
      .then((res) => {
        if (res.data) {
          const mapped: CatalogoItem[] = res.data
            .filter((p) => p.activo)
            .map((p) => ({
              id: p.id,
              nombre: p.nombre,
              precio: p.precio_venta,
              tipo: 'producto' as const,
            }))
          setCatalogoProductos(mapped)
        }
      })
      .catch(() => {})
  }, [])

  // ─── Load ventas ───────────────────────────────────────────────────────────
  const cargarVentas = useCallback(() => {
    setCargandoVentas(true)
    ventasService.getVentas()
      .then((r) => { if (r.data) setVentas(r.data) })
      .catch(() => toast.error('Error', 'No se pudieron cargar las ventas'))
      .finally(() => setCargandoVentas(false))
  }, [toast])

  // ─── Load caja ─────────────────────────────────────────────────────────────
  const cargarCaja = useCallback(() => {
    setCargandoCaja(true)
    ventasService.getSesionActual()
      .then((r) => setSesion(r.data ?? null))
      .catch(() => toast.error('Error', 'No se pudo cargar la sesión de caja'))
      .finally(() => setCargandoCaja(false))
  }, [toast])

  useEffect(() => {
    if (tab === 'historial') cargarVentas()
    if (tab === 'caja') cargarCaja()
  }, [tab, cargarVentas, cargarCaja])

  // ─── POS: Add to cart ──────────────────────────────────────────────────────
  const agregarAlCarrito = (item: CatalogoItem) => {
    setCartItems((prev) => {
      const existing = prev.find((i) => i.referencia_id === item.id && i.tipo === item.tipo)
      if (existing) {
        return prev.map((i) =>
          i.id === existing.id ? { ...i, cantidad: i.cantidad + 1, total: (i.precio_unitario - i.descuento_item) * (i.cantidad + 1) } : i
        )
      }
      const nuevo: ItemVenta = {
        id: `${item.tipo}-${item.id}-${Date.now()}`,
        tipo: item.tipo,
        referencia_id: item.id,
        nombre: item.nombre,
        precio_unitario: item.precio,
        cantidad: 1,
        descuento_item: 0,
        total: item.precio,
      }
      return [...prev, nuevo]
    })
  }

  const actualizarItemCarrito = (id: string, changes: Partial<ItemVenta>) => {
    setCartItems((prev) =>
      prev.map((i) => {
        if (i.id !== id) return i
        const updated = { ...i, ...changes }
        updated.total = (updated.precio_unitario - updated.descuento_item) * updated.cantidad
        return updated
      })
    )
  }

  const eliminarItemCarrito = (id: string) => {
    setCartItems((prev) => prev.filter((i) => i.id !== id))
  }

  const limpiarCarrito = () => {
    setCartItems([])
    setDescuentoGlobal(0)
    setTasaImpuesto(10)
    setMetodoPago('efectivo')
    setNotasVenta('')
    setClienteNombre('')
  }

  // ─── Totals ────────────────────────────────────────────────────────────────
  const subtotal = cartItems.reduce((acc, i) => acc + i.total, 0)
  const descuentoAmt = (subtotal * descuentoGlobal) / 100
  const baseImponible = subtotal - descuentoAmt
  const impuestoAmt = (baseImponible * tasaImpuesto) / 100
  const total = baseImponible + impuestoAmt

  // ─── Complete sale ─────────────────────────────────────────────────────────
  const completarVenta = async () => {
    if (cartItems.length === 0) {
      toast.error('Carrito vacío', 'Agrega al menos un ítem para continuar')
      return
    }
    setProcesandoVenta(true)
    try {
      const payload: Partial<Venta> = {
        items: cartItems,
        subtotal,
        descuento_global: descuentoGlobal,
        impuesto: impuestoAmt,
        total,
        metodo_pago: metodoPago,
        notas: notasVenta || undefined,
        estado: 'PAID',
      }
      const res = await ventasService.createVenta(payload)
      if (res.data) {
        setVentaExitosa(res.data)
        limpiarCarrito()
      }
    } catch {
      toast.error('Error', 'No se pudo registrar la venta')
    } finally {
      setProcesandoVenta(false)
    }
  }

  // ─── Cash register actions ─────────────────────────────────────────────────
  const abrirCaja = async (e: React.FormEvent) => {
    e.preventDefault()
    const monto = Number(montoApertura)
    if (!monto || monto < 0) return
    try {
      const res = await ventasService.abrirCaja(monto)
      if (res.data) setSesion(res.data)
      toast.success('Caja abierta', `Monto inicial: ${fmt(monto)}`)
      setMontoApertura('')
    } catch {
      toast.error('Error', 'No se pudo abrir la caja')
    }
  }

  const cerrarCaja = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!sesion) return
    const monto = Number(montoCierre)
    if (monto < 0) return
    try {
      const res = await ventasService.cerrarCaja(sesion.id, monto)
      if (res.data) setSesion(res.data)
      setModalCierreCaja(false)
      setMontoCierre('')
      toast.success('Caja cerrada', `Diferencia: ${fmt(res.data?.diferencia ?? 0)}`)
    } catch {
      toast.error('Error', 'No se pudo cerrar la caja')
    }
  }

  const registrarMovimiento = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!sesion || !modalMovimiento) return
    const monto = Number(movMonto)
    if (!monto || monto <= 0 || !movDescripcion.trim()) return
    try {
      const res = await ventasService.registrarMovimientoCaja({
        sesion_id: sesion.id,
        tipo: modalMovimiento,
        monto,
        descripcion: movDescripcion,
      })
      if (res.data) {
        const mov = res.data as MovimientoCaja
        setSesion((s) => {
          if (!s) return s
          const updated = { ...s, movimientos: [...s.movimientos, mov] }
          if (modalMovimiento === 'ingreso') updated.total_ingresos = s.total_ingresos + monto
          else updated.total_egresos = s.total_egresos + monto
          return updated
        })
      }
      toast.success(
        modalMovimiento === 'ingreso' ? 'Ingreso registrado' : 'Egreso registrado',
        `${fmt(monto)} — ${movDescripcion}`
      )
      setModalMovimiento(null)
      setMovMonto('')
      setMovDescripcion('')
    } catch {
      toast.error('Error', 'No se pudo registrar el movimiento')
    }
  }

  // ─── Filtered catalogue ────────────────────────────────────────────────────
  const catalogo = subTabPOS === 'servicios' ? catalogoServicios : catalogoProductos
  const catalogoFiltrado = catalogo.filter((i) =>
    i.nombre.toLowerCase().includes(busquedaPOS.toLowerCase())
  )

  // ─── Filtered ventas ───────────────────────────────────────────────────────
  const ventasFiltradas = ventas.filter((v) => {
    const matchBusq = !busquedaHistorial ||
      v.numero.toLowerCase().includes(busquedaHistorial.toLowerCase()) ||
      (v.cliente?.nombre ?? '').toLowerCase().includes(busquedaHistorial.toLowerCase())
    const matchFecha = !filtroFecha ||
      v.created_at.startsWith(filtroFecha)
    return matchBusq && matchFecha
  })

  // ─── Saldo actual caja ─────────────────────────────────────────────────────
  const saldoActual = sesion
    ? sesion.monto_inicial + sesion.total_ventas + sesion.total_ingresos - sesion.total_egresos
    : 0

  // ─── Tab button helper ─────────────────────────────────────────────────────
  const tabCls = (t: TabVentas) =>
    [
      'px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-2',
      tab === t
        ? 'bg-primary-600 text-white shadow-sm'
        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800',
    ].join(' ')

  // ──────────────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6 animate-fade-in">

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            Ventas y Caja (POS)
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Punto de venta, historial de transacciones y gestión de caja diaria
          </p>
        </div>
      </div>

      {/* ── Tabs ── */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2 overflow-x-auto">
        <button onClick={() => setTab('pos')} className={tabCls('pos')}>
          <ShoppingCart className="w-4 h-4" /> Punto de Venta
        </button>
        <button onClick={() => setTab('historial')} className={tabCls('historial')}>
          <History className="w-4 h-4" /> Historial
        </button>
        <button onClick={() => setTab('caja')} className={tabCls('caja')}>
          <Landmark className="w-4 h-4" /> Caja
          {sesion?.estado === 'abierta' && (
            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
          )}
        </button>
      </div>

      {/* ════════════════════════════════════════════════════════════════
          TAB POS
      ════════════════════════════════════════════════════════════════ */}
      {tab === 'pos' && (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-start">

          {/* Left: Catalogue */}
          <div className="lg:col-span-3 card shadow-card overflow-hidden">
            <div className="p-4 border-b border-slate-100 dark:border-slate-800">
              {/* Sub-tabs */}
              <div className="flex gap-2 mb-3">
                {(['servicios', 'productos'] as SubTabPOS[]).map((st) => (
                  <button
                    key={st}
                    onClick={() => setSubTabPOS(st)}
                    className={[
                      'px-3 py-1.5 rounded-lg text-xs font-semibold capitalize flex items-center gap-1.5 transition-all',
                      subTabPOS === st
                        ? 'bg-primary-50 dark:bg-primary-950/40 text-primary-600'
                        : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800',
                    ].join(' ')}
                  >
                    {st === 'servicios' ? <Scissors className="w-3.5 h-3.5" /> : <Package className="w-3.5 h-3.5" />}
                    {st}
                  </button>
                ))}
              </div>

              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  placeholder={`Buscar ${subTabPOS}...`}
                  value={busquedaPOS}
                  onChange={(e) => setBusquedaPOS(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500/30"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-4 max-h-[500px] overflow-y-auto">
              {catalogoFiltrado.length === 0 ? (
                <div className="col-span-full py-8 text-center text-xs text-slate-400">
                  No hay {subTabPOS} disponibles
                </div>
              ) : (
                catalogoFiltrado.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => agregarAlCarrito(item)}
                    className="p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:border-primary-400 hover:bg-primary-50/50 dark:hover:bg-primary-950/20 text-left transition-all group"
                  >
                    <div className="w-8 h-8 rounded-lg bg-primary-50 dark:bg-primary-950/40 flex items-center justify-center mb-2">
                      {item.tipo === 'servicio'
                        ? <Scissors className="w-4 h-4 text-primary-600" />
                        : <Package className="w-4 h-4 text-primary-600" />
                      }
                    </div>
                    <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 line-clamp-2 mb-1 group-hover:text-primary-700 dark:group-hover:text-primary-400 transition-colors">
                      {item.nombre}
                    </p>
                    <p className="text-sm font-black text-primary-600">{fmt(item.precio)}</p>
                    <div className="mt-2 flex items-center gap-1 text-[11px] text-primary-500 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Plus className="w-3 h-3" /> Agregar
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Right: Cart */}
          <div className="lg:col-span-2 card shadow-card overflow-hidden flex flex-col">
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200 flex items-center gap-2">
                <ShoppingCart className="w-4 h-4 text-primary-600" />
                Carrito
                {cartItems.length > 0 && (
                  <span className="text-[11px] font-semibold bg-primary-100 dark:bg-primary-950/50 text-primary-700 dark:text-primary-400 px-2 py-0.5 rounded-full">
                    {cartItems.length} ítem{cartItems.length > 1 ? 's' : ''}
                  </span>
                )}
              </h3>
              {cartItems.length > 0 && (
                <button
                  onClick={limpiarCarrito}
                  className="text-xs text-slate-400 hover:text-red-500 flex items-center gap-1 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Limpiar
                </button>
              )}
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto max-h-64 px-4">
              {cartItems.length === 0 ? (
                <div className="py-10 text-center text-xs text-slate-400">
                  <ShoppingCart className="w-10 h-10 mx-auto mb-2 opacity-20" />
                  Selecciona servicios o productos del catálogo
                </div>
              ) : (
                cartItems.map((item) => (
                  <CartItemRow
                    key={item.id}
                    item={item}
                    onUpdate={actualizarItemCarrito}
                    onRemove={eliminarItemCarrito}
                  />
                ))
              )}
            </div>

            {/* Config & Totals */}
            <div className="p-4 space-y-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
              {/* Cliente */}
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-slate-400 shrink-0" />
                <input
                  placeholder="Nombre del cliente (opcional)"
                  value={clienteNombre}
                  onChange={(e) => setClienteNombre(e.target.value)}
                  className="flex-1 text-xs px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-primary-500"
                />
              </div>

              {/* Descuento global & IVA */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] font-semibold text-slate-500 block mb-1">Descuento global (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={descuentoGlobal}
                    onChange={(e) => setDescuentoGlobal(Math.min(100, Math.max(0, Number(e.target.value))))}
                    className="w-full text-xs px-2 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-1 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-500 block mb-1">Impuesto (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="30"
                    value={tasaImpuesto}
                    onChange={(e) => setTasaImpuesto(Math.min(30, Math.max(0, Number(e.target.value))))}
                    className="w-full text-xs px-2 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-1 focus:ring-primary-500"
                  />
                </div>
              </div>

              {/* Método de pago */}
              <div>
                <label className="text-[11px] font-semibold text-slate-500 block mb-1.5">Método de pago</label>
                <div className="grid grid-cols-2 gap-1.5">
                  {(['efectivo', 'tarjeta', 'transferencia', 'mixto'] as MetodoPagoVenta[]).map((mp) => (
                    <button
                      key={mp}
                      onClick={() => setMetodoPago(mp)}
                      className={[
                        'px-2 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all',
                        metodoPago === mp
                          ? 'bg-primary-600 text-white'
                          : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-primary-400',
                      ].join(' ')}
                    >
                      {metodoPagoIcon[mp]}
                      {metodoPagoLabel[mp]}
                    </button>
                  ))}
                </div>
              </div>

              {/* Notas */}
              <textarea
                rows={2}
                placeholder="Notas de la venta..."
                value={notasVenta}
                onChange={(e) => setNotasVenta(e.target.value)}
                className="w-full text-xs px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-primary-500 resize-none"
              />

              {/* Totales */}
              <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-3 space-y-1.5 text-xs">
                <div className="flex justify-between text-slate-500">
                  <span>Subtotal</span>
                  <span>{fmt(subtotal)}</span>
                </div>
                {descuentoGlobal > 0 && (
                  <div className="flex justify-between text-emerald-600">
                    <span>Descuento ({descuentoGlobal}%)</span>
                    <span>-{fmt(descuentoAmt)}</span>
                  </div>
                )}
                <div className="flex justify-between text-slate-500">
                  <span>Impuesto ({tasaImpuesto}%)</span>
                  <span>{fmt(impuestoAmt)}</span>
                </div>
                <div className="flex justify-between font-black text-base text-slate-900 dark:text-slate-100 pt-1 border-t border-slate-100 dark:border-slate-800">
                  <span>TOTAL</span>
                  <span className="text-primary-600">{fmt(total)}</span>
                </div>
              </div>

              {/* CTA */}
              <button
                onClick={completarVenta}
                disabled={cartItems.length === 0 || procesandoVenta}
                className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-sm flex items-center justify-center gap-2 transition-colors shadow-lg shadow-emerald-600/20"
              >
                {procesandoVenta ? (
                  <span className="animate-spin w-4 h-4 border-2 border-white/30 border-t-white rounded-full" />
                ) : (
                  <CheckCircle2 className="w-5 h-5" />
                )}
                Completar Venta • {fmt(total)}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════
          TAB HISTORIAL
      ════════════════════════════════════════════════════════════════ */}
      {tab === 'historial' && (
        <div className="space-y-4">
          {/* Filtros */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                placeholder="Buscar por número o cliente..."
                value={busquedaHistorial}
                onChange={(e) => setBusquedaHistorial(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500/30"
              />
            </div>
            <input
              type="date"
              value={filtroFecha}
              onChange={(e) => setFiltroFecha(e.target.value)}
              className="px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-primary-500/30"
            />
          </div>

          {cargandoVentas ? (
            <Loader text="Cargando historial de ventas..." />
          ) : (
            <div className="card shadow-card overflow-hidden">
              {ventasFiltradas.length === 0 ? (
                <EmptyState title="No hay ventas registradas" />
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 dark:bg-slate-800/40 text-slate-400 uppercase font-semibold border-b border-slate-100 dark:border-slate-800">
                      <tr>
                        <th className="py-3 px-4">Número</th>
                        <th className="py-3 px-4">Cliente</th>
                        <th className="py-3 px-4 text-center">Ítems</th>
                        <th className="py-3 px-4">Método</th>
                        <th className="py-3 px-4">Estado</th>
                        <th className="py-3 px-4">Fecha</th>
                        <th className="py-3 px-4 text-right">Total</th>
                        <th className="py-3 px-4 text-center">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                      {ventasFiltradas.map((v) => {
                        const badge = estadoVentaBadge[v.estado]
                        return (
                          <tr key={v.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                            <td className="py-3 px-4 font-bold text-primary-600">{v.numero}</td>
                            <td className="py-3 px-4 font-medium">{v.cliente?.nombre ?? '—'}</td>
                            <td className="py-3 px-4 text-center">{v.items.length}</td>
                            <td className="py-3 px-4 flex items-center gap-1.5 capitalize">
                              {metodoPagoIcon[v.metodo_pago]}
                              {metodoPagoLabel[v.metodo_pago]}
                            </td>
                            <td className="py-3 px-4">
                              <Badge variant={badge.variant} size="sm" dot>{badge.label}</Badge>
                            </td>
                            <td className="py-3 px-4 text-slate-400">
                              {new Date(v.created_at).toLocaleDateString('es-ES', {
                                day: 'numeric', month: 'short', year: 'numeric',
                              })}
                            </td>
                            <td className="py-3 px-4 text-right font-bold text-slate-900 dark:text-slate-100">
                              {fmt(v.total)}
                            </td>
                            <td className="py-3 px-4 text-center">
                              <Button
                                variant="ghost"
                                size="sm"
                                leftIcon={<Eye className="w-3.5 h-3.5" />}
                                onClick={() => setVentaDetalle(v)}
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
              )}
            </div>
          )}
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════
          TAB CAJA
      ════════════════════════════════════════════════════════════════ */}
      {tab === 'caja' && (
        <div className="space-y-4">
          {cargandoCaja ? (
            <Loader text="Cargando sesión de caja..." />
          ) : !sesion || sesion.estado === 'cerrada' ? (
            /* No open session */
            <div className="flex flex-col items-center justify-center py-16 gap-6">
              <div className="w-20 h-20 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                <LockKeyhole className="w-10 h-10 text-slate-400" />
              </div>
              <div className="text-center">
                <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-1">Caja Cerrada</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Ingresa el monto inicial para abrir una nueva sesión de caja
                </p>
              </div>
              <form onSubmit={abrirCaja} className="flex flex-col items-center gap-3 w-full max-w-xs">
                <div className="w-full">
                  <Input
                    label="Monto inicial de caja"
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="Ej: 200.00"
                    value={montoApertura}
                    onChange={(e) => setMontoApertura(e.target.value)}
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-bold text-sm flex items-center justify-center gap-2 transition-colors shadow-lg shadow-primary-600/20"
                >
                  <Unlock className="w-5 h-5" />
                  Abrir Caja
                </button>
              </form>
            </div>
          ) : (
            /* Open session */
            <div className="space-y-4">
              {/* Session header */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 flex items-center justify-center">
                    <Landmark className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-900 dark:text-slate-100 text-sm">Sesión Abierta</p>
                    <p className="text-xs text-slate-400">
                      Desde {new Date(sesion.apertura_at).toLocaleString('es-ES')} • {sesion.usuario}
                    </p>
                  </div>
                  <Badge variant="success" size="sm" dot>Activa</Badge>
                </div>
                <button
                  onClick={() => setModalCierreCaja(true)}
                  className="px-4 py-2 rounded-xl bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 font-semibold text-xs flex items-center gap-2 hover:bg-red-100 dark:hover:bg-red-950/50 transition-colors"
                >
                  <LockKeyhole className="w-4 h-4" />
                  Cerrar Caja
                </button>
              </div>

              {/* KPIs */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: 'Monto Inicial', val: sesion.monto_inicial, color: 'text-slate-700 dark:text-slate-300', bg: 'bg-slate-50 dark:bg-slate-800/40' },
                  { label: 'Ventas del Día', val: sesion.total_ventas, color: 'text-primary-600', bg: 'bg-primary-50 dark:bg-primary-950/30' },
                  { label: 'Ingresos Manuales', val: sesion.total_ingresos, color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-950/30' },
                  { label: 'Egresos', val: sesion.total_egresos, color: 'text-red-600', bg: 'bg-red-50 dark:bg-red-950/30' },
                ].map(({ label, val, color, bg }) => (
                  <div key={label} className={`card p-4 border border-slate-100 dark:border-slate-800 ${bg}`}>
                    <p className="text-[11px] font-semibold text-slate-400 uppercase">{label}</p>
                    <p className={`text-xl font-black mt-1 ${color}`}>{fmt(val)}</p>
                  </div>
                ))}
              </div>

              {/* Saldo actual */}
              <div className="card p-5 border border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-400 font-semibold uppercase">Saldo Actual en Caja</p>
                  <p className="text-3xl font-black text-slate-900 dark:text-slate-100 mt-1">{fmt(saldoActual)}</p>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    leftIcon={<ArrowDownCircle className="w-4 h-4" />}
                    onClick={() => setModalMovimiento('ingreso')}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white border-0"
                  >
                    Ingreso
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    leftIcon={<ArrowUpCircle className="w-4 h-4" />}
                    onClick={() => setModalMovimiento('egreso')}
                    className="text-red-600 border-red-200 hover:bg-red-50"
                  >
                    Egreso
                  </Button>
                </div>
              </div>

              {/* Movements list */}
              <div className="card shadow-card overflow-hidden">
                <div className="p-4 border-b border-slate-100 dark:border-slate-800">
                  <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200">
                    Movimientos de Caja ({sesion.movimientos.length})
                  </h3>
                </div>
                <div className="divide-y divide-slate-100 dark:divide-slate-800 max-h-80 overflow-y-auto">
                  {sesion.movimientos.map((m) => (
                    <div key={m.id} className="px-4 py-3 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-3">
                        <div className={[
                          'w-8 h-8 rounded-lg flex items-center justify-center shrink-0',
                          m.tipo === 'ingreso' || m.tipo === 'apertura'
                            ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600'
                            : m.tipo === 'egreso'
                            ? 'bg-red-50 dark:bg-red-950/40 text-red-600'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-500',
                        ].join(' ')}>
                          {m.tipo === 'ingreso' || m.tipo === 'apertura'
                            ? <ArrowDownCircle className="w-4 h-4" />
                            : m.tipo === 'egreso'
                            ? <ArrowUpCircle className="w-4 h-4" />
                            : <LockKeyhole className="w-4 h-4" />
                          }
                        </div>
                        <div>
                          <p className="font-semibold text-slate-800 dark:text-slate-200 capitalize">{m.tipo}</p>
                          <p className="text-slate-400">{m.descripcion}</p>
                          <p className="text-[11px] text-slate-300 dark:text-slate-600">
                            {new Date(m.created_at).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </div>
                      <span className={[
                        'font-black text-sm',
                        m.tipo === 'egreso' ? 'text-red-600' : 'text-emerald-600',
                      ].join(' ')}>
                        {m.tipo === 'egreso' ? '-' : '+'}{fmt(m.monto)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════
          MODAL: Venta Exitosa
      ════════════════════════════════════════════════════════════════ */}
      <Modal
        isOpen={!!ventaExitosa}
        onClose={() => setVentaExitosa(null)}
        title="¡Venta Completada!"
      >
        {ventaExitosa && (
          <div className="space-y-4 text-xs">
            <div className="flex flex-col items-center gap-2 py-4">
              <div className="w-16 h-16 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 flex items-center justify-center">
                <CheckCircle2 className="w-9 h-9 text-emerald-600" />
              </div>
              <p className="text-2xl font-black text-slate-900 dark:text-slate-100">{fmt(ventaExitosa.total)}</p>
              <p className="text-slate-400 font-semibold">{ventaExitosa.numero}</p>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800/40 rounded-xl p-4 space-y-2">
              {ventaExitosa.items.map((i) => (
                <div key={i.id} className="flex justify-between">
                  <span className="text-slate-600 dark:text-slate-400">
                    {i.nombre} × {i.cantidad}
                  </span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{fmt(i.total)}</span>
                </div>
              ))}
              <div className="border-t border-slate-200 dark:border-slate-700 pt-2 flex justify-between font-black text-slate-900 dark:text-slate-100">
                <span>Total</span>
                <span className="text-primary-600">{fmt(ventaExitosa.total)}</span>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <Button
                variant="secondary"
                className="flex-1 justify-center"
                leftIcon={<Printer className="w-4 h-4" />}
                onClick={() => window.print()}
              >
                Imprimir
              </Button>
              <Button
                className="flex-1 justify-center"
                onClick={() => setVentaExitosa(null)}
              >
                Nueva Venta
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* ════════════════════════════════════════════════════════════════
          MODAL: Detalle de Venta
      ════════════════════════════════════════════════════════════════ */}
      <Modal
        isOpen={!!ventaDetalle}
        onClose={() => setVentaDetalle(null)}
        title={`Detalle — ${ventaDetalle?.numero ?? ''}`}
      >
        {ventaDetalle && (
          <div className="space-y-4 text-xs">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-500">Cliente: <strong className="text-slate-800 dark:text-slate-200">{ventaDetalle.cliente?.nombre ?? '—'}</strong></p>
                <p className="text-slate-400">{new Date(ventaDetalle.created_at).toLocaleString('es-ES')}</p>
              </div>
              <Badge variant={estadoVentaBadge[ventaDetalle.estado].variant} dot>
                {estadoVentaBadge[ventaDetalle.estado].label}
              </Badge>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800/40 rounded-xl p-4 space-y-2">
              <div className="grid grid-cols-4 font-bold text-slate-400 uppercase pb-1 border-b border-slate-200 dark:border-slate-700">
                <span className="col-span-2">Ítem</span>
                <span className="text-center">Cant.</span>
                <span className="text-right">Total</span>
              </div>
              {ventaDetalle.items.map((i) => (
                <div key={i.id} className="grid grid-cols-4 text-slate-700 dark:text-slate-300">
                  <span className="col-span-2 truncate">{i.nombre}</span>
                  <span className="text-center">{i.cantidad}</span>
                  <span className="text-right font-semibold">{fmt(i.total)}</span>
                </div>
              ))}
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-slate-500">
                <span>Subtotal</span><span>{fmt(ventaDetalle.subtotal)}</span>
              </div>
              {ventaDetalle.descuento_global > 0 && (
                <div className="flex justify-between text-emerald-600">
                  <span>Descuento ({ventaDetalle.descuento_global}%)</span>
                  <span>-{fmt((ventaDetalle.subtotal * ventaDetalle.descuento_global) / 100)}</span>
                </div>
              )}
              <div className="flex justify-between text-slate-500">
                <span>Impuesto</span><span>{fmt(ventaDetalle.impuesto)}</span>
              </div>
              <div className="flex justify-between font-black text-sm text-slate-900 dark:text-slate-100 pt-2 border-t border-slate-100 dark:border-slate-800">
                <span>TOTAL</span>
                <span className="text-primary-600">{fmt(ventaDetalle.total)}</span>
              </div>
            </div>

            <div className="flex justify-between text-slate-500 pt-1">
              <span>Método de pago:</span>
              <span className="font-semibold capitalize flex items-center gap-1">
                {metodoPagoIcon[ventaDetalle.metodo_pago]}
                {metodoPagoLabel[ventaDetalle.metodo_pago]}
              </span>
            </div>
            {ventaDetalle.notas && (
              <p className="text-slate-400 italic">Nota: "{ventaDetalle.notas}"</p>
            )}
          </div>
        )}
      </Modal>

      {/* ════════════════════════════════════════════════════════════════
          MODAL: Cerrar Caja
      ════════════════════════════════════════════════════════════════ */}
      <Modal
        isOpen={modalCierreCaja}
        onClose={() => setModalCierreCaja(false)}
        title="Cerrar Sesión de Caja"
      >
        <form onSubmit={cerrarCaja} className="space-y-4 text-xs">
          {sesion && (
            <div className="bg-slate-50 dark:bg-slate-800/40 rounded-xl p-4 space-y-2">
              <div className="flex justify-between text-slate-500">
                <span>Monto inicial</span><span>{fmt(sesion.monto_inicial)}</span>
              </div>
              <div className="flex justify-between text-primary-600">
                <span>Ventas del día</span><span>+{fmt(sesion.total_ventas)}</span>
              </div>
              <div className="flex justify-between text-emerald-600">
                <span>Ingresos manuales</span><span>+{fmt(sesion.total_ingresos)}</span>
              </div>
              <div className="flex justify-between text-red-600">
                <span>Egresos</span><span>-{fmt(sesion.total_egresos)}</span>
              </div>
              <div className="flex justify-between font-black text-slate-900 dark:text-slate-100 pt-2 border-t border-slate-200 dark:border-slate-700">
                <span>Saldo teórico</span><span>{fmt(saldoActual)}</span>
              </div>
            </div>
          )}

          <div className="flex items-center gap-2 bg-amber-50 dark:bg-amber-950/20 rounded-xl p-3 text-amber-700 dark:text-amber-400">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>Cuenta el efectivo físico e ingresa el monto real contado.</span>
          </div>

          <Input
            label="Monto final contado"
            type="number"
            min="0"
            step="0.01"
            placeholder="Ej: 650.00"
            value={montoCierre}
            onChange={(e) => setMontoCierre(e.target.value)}
            required
          />

          {montoCierre && (
            <div className={[
              'rounded-xl p-3 text-center font-bold',
              Number(montoCierre) >= saldoActual
                ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700'
                : 'bg-red-50 dark:bg-red-950/30 text-red-700',
            ].join(' ')}>
              Diferencia: {Number(montoCierre) >= saldoActual ? '+' : ''}{fmt(Number(montoCierre) - saldoActual)}
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" type="button" onClick={() => setModalCierreCaja(false)}>
              Cancelar
            </Button>
            <Button variant="danger" type="submit">
              Confirmar Cierre
            </Button>
          </div>
        </form>
      </Modal>

      {/* ════════════════════════════════════════════════════════════════
          MODAL: Registrar Movimiento (Ingreso/Egreso)
      ════════════════════════════════════════════════════════════════ */}
      <Modal
        isOpen={!!modalMovimiento}
        onClose={() => setModalMovimiento(null)}
        title={modalMovimiento === 'ingreso' ? 'Registrar Ingreso' : 'Registrar Egreso'}
      >
        <form onSubmit={registrarMovimiento} className="space-y-4">
          <Input
            label="Monto"
            type="number"
            min="0.01"
            step="0.01"
            placeholder="0.00"
            value={movMonto}
            onChange={(e) => setMovMonto(e.target.value)}
            required
          />
          <Textarea
            label="Descripción"
            placeholder={modalMovimiento === 'ingreso' ? 'Ej: Pago adelantado...' : 'Ej: Compra de insumos...'}
            value={movDescripcion}
            onChange={(e) => setMovDescripcion(e.target.value)}
            required
          />
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" type="button" onClick={() => setModalMovimiento(null)}>
              Cancelar
            </Button>
            <Button
              type="submit"
              className={modalMovimiento === 'egreso' ? 'bg-red-600 hover:bg-red-700 border-red-600' : ''}
            >
              {modalMovimiento === 'ingreso' ? 'Registrar Ingreso' : 'Registrar Egreso'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
