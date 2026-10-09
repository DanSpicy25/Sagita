import { useState } from 'react'
import {
  Search,
  AlertTriangle,
  CheckCircle2,
  Plus,
  Barcode,
} from 'lucide-react'
import { DEMO_PRODUCTOS, DemoProducto, type DeviceMode } from '../demoData'

export function DemoInventory({ deviceMode: _deviceMode }: { deviceMode?: DeviceMode } = {}) {
  const [productos, setProductos] = useState<DemoProducto[]>(DEMO_PRODUCTOS)
  const [filtroEstado, setFiltroEstado] = useState<'todos' | 'criticos'>('todos')
  const [busqueda, setBusqueda] = useState('')
  const [ajusteExitoso, setAjusteExitoso] = useState<string | null>(null)

  const handleAjustarStock = (id: number, delta: number) => {
    setProductos((prev) =>
      prev.map((p) => {
        if (p.id === id) {
          const nuevoStock = Math.max(0, p.stock + delta)
          setAjusteExitoso(`Se agregaron +${delta} unidades a "${p.nombre}". Nuevo stock: ${nuevoStock}`)
          setTimeout(() => setAjusteExitoso(null), 3000)
          return { ...p, stock: nuevoStock }
        }
        return p
      })
    )
  }

  const productosFiltrados = productos.filter((p) => {
    if (filtroEstado === 'criticos' && p.stock > p.stockMinimo) return false
    if (busqueda.trim()) {
      const q = busqueda.toLowerCase().trim()
      return (
        p.nombre.toLowerCase().includes(q) ||
        p.codigo.toLowerCase().includes(q) ||
        p.categoria.toLowerCase().includes(q)
      )
    }
    return true
  })

  return (
    <div className="space-y-4 animate-fade-in text-text">
      {/* Notificación de ajuste simulado */}
      {ajusteExitoso && (
        <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs font-medium flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{ajusteExitoso}</span>
        </div>
      )}

      {/* Barra de Filtros */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-text-muted absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por código SKU, nombre o categoría..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-border bg-surface text-text focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setFiltroEstado('todos')}
            className={[
              'px-3 py-1.5 rounded-xl text-xs font-semibold cursor-pointer transition-all',
              filtroEstado === 'todos'
                ? 'bg-primary text-white shadow-2xs'
                : 'bg-surface border border-border text-text-muted hover:text-text',
            ].join(' ')}
          >
            Todos ({productos.length})
          </button>
          <button
            onClick={() => setFiltroEstado('criticos')}
            className={[
              'px-3 py-1.5 rounded-xl text-xs font-semibold cursor-pointer transition-all flex items-center gap-1.5',
              filtroEstado === 'criticos'
                ? 'bg-primary text-white shadow-2xs'
                : 'bg-surface border border-border text-amber-600 dark:text-amber-400',
            ].join(' ')}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            Stock Crítico / Bajo
          </button>
        </div>
      </div>

      {/* Tabla de Productos */}
      <div className="overflow-hidden rounded-2xl border border-border bg-surface shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs divide-y divide-border-subtle">
            <thead className="bg-surface-subtle text-text-muted uppercase text-[10px] font-semibold">
              <tr>
                <th className="px-4 py-3">Producto & Código</th>
                <th className="px-4 py-3">Categoría</th>
                <th className="px-4 py-3">Precio Venta</th>
                <th className="px-4 py-3">Estado de Stock</th>
                <th className="px-4 py-3 text-right">Reposición Rápida</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle bg-surface">
              {productosFiltrados.map((prod) => {
                const esAgotado = prod.stock === 0
                const esBajo = prod.stock > 0 && prod.stock <= prod.stockMinimo

                return (
                  <tr key={prod.id} className="hover:bg-surface-subtle/50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={prod.imagen}
                          alt={prod.nombre}
                          className="w-9 h-9 rounded-xl object-cover border border-border shrink-0"
                        />
                        <div>
                          <span className="font-bold text-text block leading-snug">{prod.nombre}</span>
                          <span className="font-mono text-[10px] text-text-muted flex items-center gap-1">
                            <Barcode className="w-3 h-3 text-text-muted/60" /> {prod.codigo}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-3 text-text-muted font-medium">
                      {prod.categoria}
                    </td>

                    <td className="px-4 py-3 font-mono font-bold text-text">
                      ${prod.precio}
                    </td>

                    <td className="px-4 py-3">
                      {esAgotado ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-100 dark:bg-red-950/60 text-red-700 dark:text-red-300">
                          Agotado (0 un)
                        </span>
                      ) : esBajo ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300">
                          <AlertTriangle className="w-2.5 h-2.5" /> Bajo ({prod.stock} un • Mín. {prod.stockMinimo})
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300">
                          Normal ({prod.stock} un)
                        </span>
                      )}
                    </td>

                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => handleAjustarStock(prod.id, 5)}
                        className="px-2.5 py-1 rounded-xl bg-surface-subtle hover:bg-surface border border-border text-text hover:text-primary font-semibold text-[11px] transition-all cursor-pointer inline-flex items-center gap-1 shadow-2xs"
                        title="Simular ingreso de mercadería (+5)"
                      >
                        <Plus className="w-3 h-3 text-primary" /> +5 Unidades
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

