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
import { useSector } from '@/context/SectorContext'

export interface PortalCatalogoProductosProps {
  productos: Producto[]
  formatearMoneda: (monto: number) => string
}

export function PortalCatalogoProductos({
  productos,
  formatearMoneda,
}: PortalCatalogoProductosProps) {
  const { tokens } = useSector()
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
    <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16 space-y-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-zinc-200 dark:border-zinc-800 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 text-xs font-semibold uppercase tracking-wider mb-2 border border-zinc-200 dark:border-zinc-800">
            <Package className="w-3.5 h-3.5" />
            <span>{tokens.nombre} · Inventario</span>
          </div>
          <h2 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">
            Catálogo de {tokens.nombre}
          </h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Consulta artículos, categorías, identificadores y existencias disponibles.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link to="/ventas">
            <Button className="bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white text-white flex items-center gap-2 shadow-sm">
              <ShoppingCart className="w-4 h-4" />
              <span>Cobrar en Punto de Venta (POS)</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Barra de búsqueda y conteo */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-white dark:bg-zinc-900/60 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
        <div className="relative w-full sm:w-96">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            value={busquedaProducto}
            onChange={(e) => setBusquedaProducto(e.target.value)}
            placeholder="Buscar por #PRD, nombre, categoría o código..."
            className="w-full pl-10 pr-4 py-2 text-sm rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-400"
          />
        </div>
        <div className="text-xs text-zinc-500 dark:text-zinc-400">
          Mostrando <strong className="text-zinc-800 dark:text-zinc-200">{productosFiltrados.length}</strong> de {productos.length} productos
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
              className="bg-white dark:bg-zinc-900/60 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-700">
                    #PRD-{String(prod.id).padStart(4, '0')}
                  </span>
                  <span className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400 bg-zinc-50 dark:bg-zinc-800/60 px-2 py-0.5 rounded">
                    {prod.categoria}
                  </span>
                </div>

                <h3 className="font-bold text-zinc-900 dark:text-zinc-100 text-base group-hover:text-zinc-600 dark:group-hover:text-white transition-colors line-clamp-1">
                  {prod.nombre}
                </h3>

                {prod.descripcion && (
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 line-clamp-2">
                    {prod.descripcion}
                  </p>
                )}

                <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between text-xs text-zinc-500">
                  <span>SKU: <strong className="font-mono text-zinc-700 dark:text-zinc-300">{prod.sku}</strong></span>
                  {prod.codigo_barras && (
                    <span className="flex items-center gap-1 font-mono text-[11px]">
                      <Barcode className="w-3 h-3 text-zinc-400" />
                      {prod.codigo_barras}
                    </span>
                  )}
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
                <div>
                  <div className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
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
                    <span className="text-[11px] font-medium text-zinc-500">
                      {agotado
                        ? 'Agotado'
                        : `${prod.stock_actual} ${prod.unidad || 'uds'} disp.`}
                    </span>
                  </div>
                </div>

                <Link to="/ventas">
                  <Button size="sm" variant="outline" className="text-xs flex items-center gap-1 hover:bg-zinc-100 hover:text-zinc-900 hover:border-zinc-400">
                    <ShoppingCart className="w-3.5 h-3.5 text-zinc-600" />
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
