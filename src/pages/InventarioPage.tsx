import { useState, useEffect } from 'react'
import {
  Package,
  PackagePlus,
  AlertTriangle,
  RefreshCw,
  Truck,
  Layers,
} from 'lucide-react'
import type { Producto, MovimientoStock, AlertaStock, MovimientoInventario } from '@/types'
import { inventarioService } from '@/services/inventario.service'
import { Loader } from '@/components/ui'
import { useToast } from '@/hooks/useToast'
import {
  ProductosTab,
  MovimientosKardexTab,
  AlertasStockTab,
  GestionProveedoresCompras,
  GestionRecetasBOM,
} from '@/components/inventario'

type TabInventario = 'productos' | 'movimientos' | 'alertas' | 'proveedores' | 'recetas'

export default function InventarioPage() {
  const [tab, setTab] = useState<TabInventario>('productos')
  const [productos, setProductos] = useState<Producto[]>([])
  const [movimientos, setMovimientos] = useState<MovimientoStock[]>([])
  const [alertas, setAlertas] = useState<AlertaStock[]>([])
  const [cargando, setCargando] = useState(true)

  const { toast } = useToast()

  // ─── Data fetching ────────────────────────────────────────────────────────
  const cargarDatos = async () => {
    try {
      setCargando(true)
      const [prodRes, movRes, alertRes] = await Promise.all([
        inventarioService.getProductos(),
        inventarioService.getMovimientos(),
        inventarioService.getAlertasStock(),
      ])

      if (prodRes.data) setProductos(prodRes.data)
      if (movRes.data) setMovimientos(movRes.data)
      if (alertRes.data) setAlertas(alertRes.data)
    } catch (err) {
      toast.error('Error al cargar inventario', err instanceof Error ? err.message : 'Error')
    } finally {
      setCargando(false)
    }
  }

  useEffect(() => {
    cargarDatos()
  }, [])

  // ─── Handlers ─────────────────────────────────────────────────────────────
  const handleGuardarProducto = async (id: number | null, data: Partial<Producto>) => {
    try {
      if (id) {
        await inventarioService.updateProducto(id, data)
        toast.success('Producto actualizado', data.nombre ?? '')
      } else {
        await inventarioService.createProducto(data)
        toast.success('Producto creado exitosamente', data.nombre ?? '')
      }
      await cargarDatos()
    } catch (err) {
      toast.error('Error al guardar producto', err instanceof Error ? err.message : 'Error')
      throw err
    }
  }

  const handleEliminarProducto = async (id: number) => {
    try {
      await inventarioService.deleteProducto(id)
      toast.success('Producto eliminado')
      await cargarDatos()
    } catch (err) {
      toast.error('Error al eliminar producto', err instanceof Error ? err.message : 'Error')
      throw err
    }
  }

  const handleRegistrarMovimiento = async (data: {
    producto_id: number
    tipo: MovimientoInventario
    cantidad: number
    motivo?: string
    referencia?: string
  }) => {
    try {
      await inventarioService.registrarMovimiento(data)
      toast.success('Movimiento registrado en Kardex')
      await cargarDatos()
    } catch (err) {
      toast.error('Error al registrar movimiento', err instanceof Error ? err.message : 'Error')
      throw err
    }
  }

  const handleRegistrarEntradaRapida = async (productoId: number) => {
    const prod = productos.find((p) => p.id === productoId)
    const falta = prod ? Math.max(1, prod.stock_minimo - prod.stock_actual) : 1
    try {
      await inventarioService.registrarMovimiento({
        producto_id: productoId,
        tipo: 'PURCHASE',
        cantidad: falta,
        motivo: 'Reposición rápida de stock crítico',
        referencia: `REP-${Date.now().toString().slice(-6)}`,
      })
      toast.success('Reposición de stock registrada', `+${falta} unidades para ${prod?.nombre}`)
      await cargarDatos()
    } catch (err) {
      toast.error('Error al registrar reposición rápida', err instanceof Error ? err.message : 'Error')
    }
  }

  // KPIs
  const kpiStockCritico = productos.filter((p) => p.activo && p.stock_actual <= p.stock_minimo).length
  const kpiValorInventario = productos.reduce((acc, p) => acc + p.precio_costo * p.stock_actual, 0)

  const tabClass = (t: TabInventario) =>
    [
      'px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-2',
      tab === t
        ? 'bg-primary-600 text-white shadow-sm'
        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800',
    ].join(' ')

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Inventario & Suministro</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Gestión integral de catálogo, trazabilidad Kardex, órdenes de compra y fórmulas BOM
          </p>
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
              Valoración
            </span>
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            ${kpiValorInventario.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
          <p className="text-xs text-slate-400 mt-1">Valor de inventario (costo)</p>
        </div>

        <div className="card p-5 border border-slate-100 dark:border-slate-800">
          <div className="flex items-start justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 flex items-center justify-center">
              <RefreshCw className="w-5 h-5" />
            </div>
            <span className="text-xs font-semibold text-amber-600 bg-amber-50 dark:bg-amber-950/30 px-2 py-0.5 rounded-full">
              Trazabilidad
            </span>
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{movimientos.length}</p>
          <p className="text-xs text-slate-400 mt-1">Movimientos registrados</p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2 overflow-x-auto">
        <button onClick={() => setTab('productos')} className={tabClass('productos')}>
          <Package className="w-4 h-4" />
          Catálogo de Productos ({productos.length})
        </button>
        <button onClick={() => setTab('movimientos')} className={tabClass('movimientos')}>
          <RefreshCw className="w-4 h-4" />
          Kardex de Movimientos ({movimientos.length})
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
        <button onClick={() => setTab('proveedores')} className={tabClass('proveedores')}>
          <Truck className="w-4 h-4" />
          Proveedores & Compras
        </button>
        <button onClick={() => setTab('recetas')} className={tabClass('recetas')}>
          <Layers className="w-4 h-4" />
          Fórmulas & Recetas (BOM)
        </button>
      </div>

      {/* Tab Panels */}
      {cargando ? (
        <Loader text="Cargando datos de inventario..." />
      ) : (
        <>
          {tab === 'productos' && (
            <ProductosTab
              productos={productos}
              onGuardarProducto={handleGuardarProducto}
              onEliminarProducto={handleEliminarProducto}
              onAjustarStockRapido={(p) => {
                setTab('movimientos')
                toast.info(`Navega al Kardex para registrar movimientos de ${p.nombre}`)
              }}
            />
          )}

          {tab === 'movimientos' && (
            <MovimientosKardexTab
              movimientos={movimientos}
              productos={productos}
              onRegistrarMovimiento={handleRegistrarMovimiento}
            />
          )}

          {tab === 'alertas' && (
            <AlertasStockTab
              alertas={alertas}
              onRegistrarEntradaRapida={handleRegistrarEntradaRapida}
              onIrAProveedores={() => setTab('proveedores')}
            />
          )}

          {tab === 'proveedores' && (
            <div className="pt-2">
              <GestionProveedoresCompras />
            </div>
          )}

          {tab === 'recetas' && (
            <div className="pt-2">
              <GestionRecetasBOM />
            </div>
          )}
        </>
      )}
    </div>
  )
}
