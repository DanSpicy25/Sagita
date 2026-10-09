import { useState, useEffect, useCallback } from 'react'
import {
  ShoppingCart,
  History,
  Landmark,
  CheckCircle2,
  Printer,
} from 'lucide-react'
import type {
  ItemVenta,
  Venta,
  SesionCaja,
  MovimientoCaja,
  MetodoPagoVenta,
  PagoSplit,
  Empleado,
} from '@/types'
import { ventasService } from '@/services/ventas.service'
import { serviciosService } from '@/services/servicios.service'
import { inventarioService } from '@/services/inventario.service'
import { empleadosService } from '@/services/empleados.service'
import { DatosVentaPayload } from '@/services/commerceEngine.service'
import { Button, Modal } from '@/components/ui'
import {
  PosTerminal,
  PosHistorialVentas,
  PosCajaControl,
  PosDetalleVentaModal,
  ModalCobroPOS,
  ModalDevolucionVenta,
  TicketTermicoModal,
  CatalogoItem,
} from '@/components/pos'
import { useToast } from '@/hooks/useToast'

type TabVentas = 'pos' | 'historial' | 'caja'

export default function VentasPage() {
  const [tab, setTab] = useState<TabVentas>('pos')
  const { toast } = useToast()

  // ─── POS State ──────────────────────────────────────────────────────────────
  const [catalogoServicios, setCatalogoServicios] = useState<CatalogoItem[]>([])
  const [catalogoProductos, setCatalogoProductos] = useState<CatalogoItem[]>([])
  const [empleados, setEmpleados] = useState<Empleado[]>([])
  const [cartItems, setCartItems] = useState<ItemVenta[]>([])
  const [descuentoGlobal, setDescuentoGlobal] = useState(0)
  const [tasaImpuesto, setTasaImpuesto] = useState(10)
  const [clienteNombre, setClienteNombre] = useState('')
  const [notasVenta, setNotasVenta] = useState('')
  const [procesandoVenta, setProcesandoVenta] = useState(false)

  // ─── Modales ───────────────────────────────────────────────────────────────
  const [modalCobroAbierto, setModalCobroAbierto] = useState(false)
  const [ventaExitosa, setVentaExitosa] = useState<Venta | null>(null)
  const [ventaParaTicket, setVentaParaTicket] = useState<Venta | null>(null)
  const [ventaDetalle, setVentaDetalle] = useState<Venta | null>(null)
  const [ventaParaDevolucion, setVentaParaDevolucion] = useState<Venta | null>(null)

  // ─── Historial & Caja State ────────────────────────────────────────────────
  const [ventas, setVentas] = useState<Venta[]>([])
  const [cargandoVentas, setCargandoVentas] = useState(false)
  const [sesion, setSesion] = useState<SesionCaja | null>(null)
  const [cargandoCaja, setCargandoCaja] = useState(false)

  // ─── Carga de Catálogo y Personal ──────────────────────────────────────────
  const cargarCatalogo = useCallback(() => {
    serviciosService.getAll()
      .then((res) => {
        if (res.data) {
          setCatalogoServicios(
            res.data.map((s) => ({
              id: s.id,
              nombre: s.nombre,
              precio: s.precio_base,
              tipo: 'servicio' as const,
            }))
          )
        }
      })
      .catch(() => {})

    inventarioService.getProductos()
      .then((res) => {
        if (res.data) {
          setCatalogoProductos(
            res.data
              .filter((p) => p.activo)
              .map((p) => ({
                id: p.id,
                nombre: p.nombre,
                precio: p.precio_venta,
                tipo: 'producto' as const,
                stock: p.stock_actual,
                sku: p.sku,
                codigo_barras: p.codigo_barras,
              }))
          )
        }
      })
      .catch(() => {})

    empleadosService.getAll({ activo: 'true' })
      .then((res) => {
        if (res.data) setEmpleados(res.data)
      })
      .catch(() => {})
  }, [])

  useEffect(() => {
    cargarCatalogo()
  }, [cargarCatalogo])

  // ─── Carga de Historial de Ventas ──────────────────────────────────────────
  const cargarVentas = useCallback(() => {
    setCargandoVentas(true)
    ventasService.getVentas()
      .then((r) => { if (r.data) setVentas(r.data) })
      .catch(() => toast.error('Error', 'No se pudieron cargar las ventas'))
      .finally(() => setCargandoVentas(false))
  }, [toast])

  // ─── Carga de Turno de Caja ────────────────────────────────────────────────
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

  // ─── Carrito Actions ───────────────────────────────────────────────────────
  const agregarAlCarrito = (item: CatalogoItem) => {
    if (item.tipo === 'producto' && item.stock !== undefined && item.stock <= 0) {
      toast.warning('Sin existencias', `El producto "${item.nombre}" está agotado en inventario`)
      return
    }

    setCartItems((prev) => {
      const existing = prev.find((i) => i.referencia_id === item.id && i.tipo === item.tipo)
      if (existing) {
        if (item.tipo === 'producto' && item.stock !== undefined && existing.cantidad >= item.stock) {
          toast.warning('Tope de stock', `Solo hay ${item.stock} unidades disponibles en inventario`)
          return prev
        }
        return prev.map((i) =>
          i.id === existing.id
            ? { ...i, cantidad: i.cantidad + 1, total: (i.precio_unitario - i.descuento_item) * (i.cantidad + 1) }
            : i
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
    setNotasVenta('')
    setClienteNombre('')
  }

  // ─── Completar Cobro de Venta (Commerce Engine) ────────────────────────────
  const completarVenta = async (
    metodoOverride?: MetodoPagoVenta,
    pagosSplit?: PagoSplit[],
    propinaOverride?: number
  ) => {
    if (cartItems.length === 0) return
    setProcesandoVenta(true)

    const subtotal = cartItems.reduce((acc, i) => acc + i.total, 0)
    const descuentoAmt = (subtotal * descuentoGlobal) / 100
    const baseImponible = subtotal - descuentoAmt
    const impuestoAmt = (baseImponible * tasaImpuesto) / 100
    const total = baseImponible + impuestoAmt

    try {
      const payload: DatosVentaPayload = {
        cliente: clienteNombre
          ? {
              id: 0,
              nombre: clienteNombre,
              email: '',
              telefono: '',
              total_citas: 0,
              created_at: new Date().toISOString(),
            }
          : undefined,
        items: cartItems,
        subtotal,
        descuento_global: descuentoGlobal,
        impuesto: impuestoAmt,
        total: total + (propinaOverride || 0),
        metodo_pago: metodoOverride || 'efectivo',
        pagos_split: pagosSplit,
        propina: propinaOverride,
        notas: notasVenta || undefined,
        origen: 'pos',
      }

      const res = await ventasService.procesarVentaCompleta(payload)
      if (res.data) {
        setVentaExitosa(res.data.venta)
        limpiarCarrito()
        cargarVentas()
        cargarCaja()
        cargarCatalogo()
        toast.success(
          'Venta registrada',
          `Venta ${res.data.venta.numero} completada con sincronización de inventario y caja.`
        )
      }
    } catch {
      toast.error('Error', 'No se pudo procesar la venta comercial')
    } finally {
      setProcesandoVenta(false)
    }
  }

  // ─── Caja Handlers ─────────────────────────────────────────────────────────
  const handleAbrirCaja = async (monto: number) => {
    try {
      const res = await ventasService.abrirCaja(monto)
      if (res.data) setSesion(res.data)
      toast.success('Caja abierta', `Monto inicial: $${monto.toFixed(2)}`)
    } catch {
      toast.error('Error', 'No se pudo abrir la caja')
    }
  }

  const handleCerrarCaja = async (montoFinal: number) => {
    if (!sesion) return
    try {
      const res = await ventasService.cerrarCaja(sesion.id, montoFinal)
      if (res.data) setSesion(res.data)
      toast.success('Caja cerrada', `Diferencia de arqueo: $${(res.data?.diferencia ?? 0).toFixed(2)}`)
    } catch {
      toast.error('Error', 'No se pudo cerrar la caja')
    }
  }

  const handleRegistrarMovimiento = async (tipo: 'ingreso' | 'egreso', monto: number, descripcion: string) => {
    if (!sesion) return
    try {
      const res = await ventasService.registrarMovimientoCaja({
        sesion_id: sesion.id,
        tipo,
        monto,
        descripcion,
      })
      if (res.data) {
        const mov = res.data as MovimientoCaja
        setSesion((s) => {
          if (!s) return s
          const updated = { ...s, movimientos: [...s.movimientos, mov] }
          if (tipo === 'ingreso') updated.total_ingresos = s.total_ingresos + monto
          else updated.total_egresos = s.total_egresos + monto
          return updated
        })
      }
      toast.success(tipo === 'ingreso' ? 'Ingreso registrado' : 'Egreso registrado', `$${monto.toFixed(2)} — ${descripcion}`)
    } catch {
      toast.error('Error', 'No se pudo registrar el movimiento')
    }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Encabezado */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
          Ventas y Terminal POS
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
          Punto de venta táctil, arqueo de caja y control de transacciones comerciales.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-border pb-2 overflow-x-auto">
        <button
          onClick={() => setTab('pos')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-2 ${
            tab === 'pos' ? 'bg-primary text-white shadow-xs' : 'text-text-muted hover:bg-secondary-soft hover:text-text'
          }`}
        >
          <ShoppingCart className="w-4 h-4" /> Punto de Venta
        </button>
        <button
          onClick={() => setTab('historial')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-2 ${
            tab === 'historial' ? 'bg-primary text-white shadow-xs' : 'text-text-muted hover:bg-secondary-soft hover:text-text'
          }`}
        >
          <History className="w-4 h-4" /> Historial de Ventas
        </button>
        <button
          onClick={() => setTab('caja')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-2 ${
            tab === 'caja' ? 'bg-primary text-white shadow-xs' : 'text-text-muted hover:bg-secondary-soft hover:text-text'
          }`}
        >
          <Landmark className="w-4 h-4" /> Control de Caja
          {sesion?.estado === 'abierta' && <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />}
        </button>
      </div>

      {/* Contenido Modular según Tab */}
      {tab === 'pos' && (
        <PosTerminal
          catalogoServicios={catalogoServicios}
          catalogoProductos={catalogoProductos}
          empleados={empleados}
          cartItems={cartItems}
          descuentoGlobal={descuentoGlobal}
          tasaImpuesto={tasaImpuesto}
          clienteNombre={clienteNombre}
          notasVenta={notasVenta}
          procesandoVenta={procesandoVenta}
          onAddToCart={agregarAlCarrito}
          onUpdateCartItem={actualizarItemCarrito}
          onRemoveCartItem={eliminarItemCarrito}
          onClearCart={limpiarCarrito}
          onSetDescuentoGlobal={setDescuentoGlobal}
          onSetTasaImpuesto={setTasaImpuesto}
          onSetClienteNombre={setClienteNombre}
          onSetNotasVenta={setNotasVenta}
          onOpenCobro={() => setModalCobroAbierto(true)}
        />
      )}

      {tab === 'historial' && (
        <PosHistorialVentas
          ventas={ventas}
          cargando={cargandoVentas}
          onVerDetalle={(v) => setVentaDetalle(v)}
          onVerTicket={(v) => setVentaParaTicket(v)}
          onDevolucion={(v) => setVentaParaDevolucion(v)}
        />
      )}

      {tab === 'caja' && (
        <PosCajaControl
          sesion={sesion}
          cargando={cargandoCaja}
          onAbrirCaja={handleAbrirCaja}
          onCerrarCaja={handleCerrarCaja}
          onRegistrarMovimiento={handleRegistrarMovimiento}
        />
      )}

      {/* ── Modales de Apoyo ── */}
      {modalCobroAbierto && (
        <ModalCobroPOS
          isOpen={modalCobroAbierto}
          onClose={() => setModalCobroAbierto(false)}
          total={
            cartItems.reduce((acc, i) => acc + i.total, 0) -
            (cartItems.reduce((acc, i) => acc + i.total, 0) * descuentoGlobal) / 100 +
            ((cartItems.reduce((acc, i) => acc + i.total, 0) - (cartItems.reduce((acc, i) => acc + i.total, 0) * descuentoGlobal) / 100) * tasaImpuesto) / 100
          }
          subtotal={cartItems.reduce((acc, i) => acc + i.total, 0)}
          descuento={
            (cartItems.reduce((acc, i) => acc + i.total, 0) * descuentoGlobal) / 100
          }
          onConfirmar={async (metodo, pagosSplit, propina) => {
            await completarVenta(metodo, pagosSplit, propina)
          }}
        />
      )}

      {/* Modal Venta Exitosa con Micro-Animación y Ticket */}
      {ventaExitosa && (
        <Modal
          isOpen={!!ventaExitosa}
          onClose={() => setVentaExitosa(null)}
          title="¡Venta Registrada con Éxito!"
        >
          <div className="text-center py-6 px-2 space-y-4">
            <div className="relative inline-flex items-center justify-center">
              <div className="w-16 h-16 rounded-full bg-emerald-50 dark:bg-emerald-950/50 flex items-center justify-center text-emerald-500 animate-bounce-check">
                <CheckCircle2 className="w-12 h-12 stroke-[2.5]" />
              </div>
            </div>

            <div className="space-y-1">
              <span className="font-mono text-xs font-bold px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                Folio: {ventaExitosa.numero}
              </span>
              <h3 className="text-xl font-black text-slate-900 dark:text-slate-100 pt-2">
                Cobro Finalizado
              </h3>
              <p className="text-2xl font-black text-primary-600 dark:text-primary-400 font-mono">
                ${ventaExitosa.total.toFixed(2)}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Inventario y movimientos de caja sincronizados correctamente.
              </p>
            </div>

            <div className="flex justify-center gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
              <Button
                variant="outline"
                size="md"
                className="font-bold text-xs sm:text-sm py-2.5 px-4 rounded-xl"
                onClick={() => {
                  setVentaParaTicket(ventaExitosa)
                  setVentaExitosa(null)
                }}
              >
                <Printer className="w-4 h-4 mr-2" /> Imprimir Ticket
              </Button>
              <Button
                variant="primary"
                size="md"
                className="font-black text-xs sm:text-sm py-2.5 px-5 rounded-xl shadow-xs"
                onClick={() => setVentaExitosa(null)}
              >
                Nueva Venta
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Modal Detalle Venta */}
      {ventaDetalle && (
        <PosDetalleVentaModal
          venta={ventaDetalle}
          onClose={() => setVentaDetalle(null)}
          onImprimirTicket={(v) => setVentaParaTicket(v)}
        />
      )}

      {/* Modal Devolución */}
      {ventaParaDevolucion && (
        <ModalDevolucionVenta
          isOpen={!!ventaParaDevolucion}
          onClose={() => setVentaParaDevolucion(null)}
          venta={ventaParaDevolucion}
          onDevolucionExitosa={() => {
            cargarVentas()
            cargarCaja()
            cargarCatalogo()
          }}
        />
      )}

      {/* Modal Ticket Térmico */}
      {ventaParaTicket && (
        <TicketTermicoModal
          isOpen={!!ventaParaTicket}
          onClose={() => setVentaParaTicket(null)}
          venta={ventaParaTicket}
        />
      )}
    </div>
  )
}
