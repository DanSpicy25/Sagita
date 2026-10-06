import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Package,
  ShoppingCart,
  Search,
  Barcode,
} from 'lucide-react'
import { Button } from '@/components/ui'
import type { Producto } from '@/types'

export interface PortalCatalogoProductosProps {
  productos: Producto[]
  formatearMoneda: (monto: number) => string
}

export function PortalCatalogoProductos({
  productos,
  formatearMoneda,
}: PortalCatalogoProductosProps) {
  const [busquedaProducto, setBusquedaProducto] = useState('')

  const productosFiltrados = productos.filter((p) => {
    if (!busquedaProducto) return true
    const query = busquedaProducto.toLowerCase()
    return (
      p.nombre.toLowerCase().includes(query) ||
      p.categoria.toLowerCase().includes(query) ||
      (p.codigo_barras && p.codigo_barras.toLowerCase().includes(query)) ||
      `#prd-${String(p.id).padStart(4, '0')}`.toLowerCase().includes(query) ||
      `prd-${p.id}`.toLowerCase().includes(query)
    )
  })

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full space-y-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950/70 text-blue-700 dark:text-blue-300 text-xs font-semibold uppercase tracking-wider mb-2">
            <Package className="w-3.5 h-3.5" />
            <span>Inventario Sagitta Enterprise</span>
          </div>
          <h2 className="text-3xl font-black text-slate-900 dark:text-white">
            Catálogo de Productos & Stock
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Visualización con identificadores oficiales <code className="font-mono font-bold text-primary-600 dark:text-primary-400">#PRD-XXXX</code>, trazabilidad SKU y disponibilidad en tiempo real.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link to="/ventas">
            <Button className="bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-2 shadow-md">
              <ShoppingCart className="w-4 h-4" />
              <span>Cobrar en Punto de Venta (POS)</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Barra de búsqueda y conteo */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="relative w-full sm:w-96">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={busquedaProducto}
            onChange={(e) => setBusquedaProducto(e.target.value)}
            placeholder="Buscar por #PRD, nombre, categoría o código..."
            className="w-full pl-10 pr-4 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="text-xs text-slate-500 dark:text-slate-400">
          Mostrando <strong className="text-slate-800 dark:text-slate-200">{productosFiltrados.length}</strong> de {productos.length} productos
        </div>
      </div>

      {/* Grid de Productos */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {productosFiltrados.map((prod) => {
          const stockAlto = prod.stock_actual > (prod.stock_minimo || 5)
          const stockBajo = prod.stock_actual > 0 && !stockAlto
          const agotado = prod.stock_actual <= 0

          return (
            <div
              key={prod.id}
              className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700">
                    #PRD-{String(prod.id).padStart(4, '0')}
                  </span>
                  <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/60 px-2 py-0.5 rounded">
                    {prod.categoria}
                  </span>
                </div>

                <h3 className="font-bold text-slate-900 dark:text-white text-base group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors line-clamp-1">
                  {prod.nombre}
                </h3>

                {prod.descripcion && (
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                    {prod.descripcion}
                  </p>
                )}

                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs text-slate-500">
                  <span>SKU: <strong className="font-mono text-slate-700 dark:text-slate-300">{prod.sku}</strong></span>
                  {prod.codigo_barras && (
                    <span className="flex items-center gap-1 font-mono text-[11px]">
                      <Barcode className="w-3 h-3 text-slate-400" />
                      {prod.codigo_barras}
                    </span>
                  )}
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <div className="text-lg font-black text-slate-900 dark:text-white">
                    {formatearMoneda(prod.precio_venta)}
                  </div>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span
                      className={`w-2 h-2 rounded-full ${
                        stockAlto
                          ? 'bg-emerald-500'
                          : stockBajo
                          ? 'bg-amber-500'
                          : 'bg-red-500'
                      }`}
                    />
                    <span className="text-[11px] font-medium text-slate-500">
                      {agotado
                        ? 'Agotado'
                        : `${prod.stock_actual} ${prod.unidad || 'uds'} disp.`}
                    </span>
                  </div>
                </div>

                <Link to="/ventas">
                  <Button size="sm" variant="outline" className="text-xs flex items-center gap-1 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-300">
                    <ShoppingCart className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Vender</span>
                  </Button>
                </Link>
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
