import { useState, useMemo } from 'react'
import {
  Package,
  PackageMinus,
  PackagePlus,
  AlertTriangle,
  Search,
  Truck,
} from 'lucide-react'
import type { AlertaStock } from '@/types'
import { Button, Badge } from '@/components/ui'

export interface AlertasStockTabProps {
  alertas: AlertaStock[]
  onRegistrarEntradaRapida: (productoId: number) => void
  onIrAProveedores?: () => void
}

export function AlertasStockTab({
  alertas,
  onRegistrarEntradaRapida,
  onIrAProveedores,
}: AlertasStockTabProps) {
  const [busqueda, setBusqueda] = useState('')

  const alertasFiltradas = useMemo(() => {
    return alertas.filter((a) => {
      const q = busqueda.toLowerCase().trim()
      if (!q) return true
      return (
        a.producto.nombre.toLowerCase().includes(q) ||
        a.producto.sku.toLowerCase().includes(q) ||
        `#prd-${String(a.producto_id).padStart(4, '0')}`.toLowerCase().includes(q) ||
        (a.producto.proveedor ?? '').toLowerCase().includes(q) ||
        a.producto.categoria.toLowerCase().includes(q)
      )
    })
  }, [alertas, busqueda])

  if (alertas.length === 0) {
    return (
      <div className="card p-12 border border-slate-100 dark:border-slate-800 text-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-16 h-16 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 flex items-center justify-center">
            <Package className="w-8 h-8" />
          </div>
          <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100">
            ¡Inventario en Niveles Óptimos!
          </h3>
          <p className="text-sm text-slate-500 max-w-md">
            No hay productos con existencias por debajo del stock mínimo requerido. Todos los insumos y artículos tienen cobertura operativa.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Search & Top Action Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar alertas por producto, SKU, categoría o proveedor..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>

        {onIrAProveedores && (
          <Button
            variant="outline"
            onClick={onIrAProveedores}
            leftIcon={<Truck className="w-4 h-4" />}
          >
            Gestionar Órdenes con Proveedores
          </Button>
        )}
      </div>

      <div className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400 font-medium">
        <AlertTriangle className="w-4 h-4" />
        <span>
          {alertasFiltradas.length}{' '}
          {alertasFiltradas.length === 1 ? 'producto requiere' : 'productos requieren'}{' '}
          reposición prioritaria
        </span>
      </div>

      {/* Grid of Alert Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {alertasFiltradas.map((a) => {
          const ratio = a.stock_minimo > 0 ? (a.stock_actual / a.stock_minimo) * 100 : 0
          const esCritico = a.stock_actual === 0 || a.stock_actual <= Math.ceil(a.stock_minimo / 2)

          return (
            <div
              key={a.producto_id}
              className={`card p-5 border transition-all ${
                esCritico
                  ? 'border-red-300 dark:border-red-900/60 bg-red-50/40 dark:bg-red-950/20'
                  : 'border-amber-200 dark:border-amber-900/40 bg-amber-50/30 dark:bg-amber-950/15'
              }`}
            >
              <div className="flex items-start justify-between gap-2 mb-3">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                    esCritico
                      ? 'bg-red-100 dark:bg-red-950/50 text-red-600'
                      : 'bg-amber-100 dark:bg-amber-950/50 text-amber-600'
                  }`}
                >
                  <PackageMinus className="w-5 h-5" />
                </div>
                <Badge variant={esCritico ? 'danger' : 'warning'} size="sm" dot>
                  {esCritico ? 'Stock Crítico' : 'Stock Bajo'}
                </Badge>
              </div>

              <div className="flex items-center gap-2 mb-1">
                <span className="font-mono text-xs font-bold text-primary-600">
                  #PRD-{String(a.producto_id).padStart(4, '0')}
                </span>
                <span className="font-mono text-[10px] text-slate-400">
                  SKU: {a.producto.sku}
                </span>
              </div>

              <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100 leading-snug">
                {a.producto.nombre}
              </h4>
              <p className="text-xs text-slate-500 mt-0.5">{a.producto.categoria}</p>

              <div className="mt-4 pt-3 border-t border-slate-200/60 dark:border-slate-800 flex items-center justify-between text-xs">
                <div>
                  <p className="text-slate-500">Stock actual</p>
                  <p
                    className={`text-2xl font-black leading-none mt-1 ${
                      esCritico
                        ? 'text-red-600 dark:text-red-400'
                        : 'text-amber-600 dark:text-amber-400'
                    }`}
                  >
                    {a.stock_actual}
                    <span className="text-xs font-normal text-slate-500 ml-1">
                      {a.producto.unidad}
                    </span>
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-slate-500">Mínimo sugerido</p>
                  <p className="text-lg font-bold text-slate-700 dark:text-slate-300 leading-none mt-1">
                    {a.stock_minimo}
                    <span className="text-xs font-normal text-slate-500 ml-1">
                      {a.producto.unidad}
                    </span>
                  </p>
                </div>
              </div>

              {/* Progress bar */}
              <div className="mt-3">
                <div className="w-full h-1.5 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                  <div
                    className={`h-full transition-all ${
                      esCritico ? 'bg-red-500' : 'bg-amber-500'
                    }`}
                    style={{ width: `${Math.min(100, Math.max(5, ratio))}%` }}
                  />
                </div>
                <div className="flex justify-between items-center text-[10px] text-slate-400 mt-1">
                  <span>Déficit: {Math.max(0, a.stock_minimo - a.stock_actual)} {a.producto.unidad}</span>
                  <span>{ratio.toFixed(0)}% del mín</span>
                </div>
              </div>

              {a.producto.proveedor && (
                <div className="mt-3 text-[11px] text-slate-600 dark:text-slate-400 flex items-center gap-1.5 bg-white/60 dark:bg-slate-900/50 p-2 rounded-lg border border-slate-200/50 dark:border-slate-800">
                  <Truck className="w-3.5 h-3.5 text-slate-400" />
                  <span>
                    Proveedor:{' '}
                    <strong className="text-slate-800 dark:text-slate-200">
                      {a.producto.proveedor}
                    </strong>
                  </span>
                </div>
              )}

              <div className="mt-4">
                <Button
                  size="sm"
                  variant="primary"
                  className="w-full justify-center text-xs"
                  onClick={() => onRegistrarEntradaRapida(a.producto_id)}
                  leftIcon={<PackagePlus className="w-3.5 h-3.5" />}
                >
                  Registrar Entrada Rápida
                </Button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
