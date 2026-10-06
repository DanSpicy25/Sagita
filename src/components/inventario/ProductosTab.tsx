import { useState, useMemo } from 'react'
import {
  Package,
  Plus,
  Pencil,
  Trash2,
  Search,
  ArrowUpCircle,
} from 'lucide-react'
import type { Producto } from '@/types'
import { Button, Badge, Modal, Input, Textarea, EmptyState, Pagination } from '@/components/ui'

const CATEGORIAS = [
  'Productos de Belleza',
  'Insumos Médicos',
  'Suplementos',
  'Ropa y Accesorios',
  'General',
]

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

export interface ProductosTabProps {
  productos: Producto[]
  onGuardarProducto: (id: number | null, data: Partial<Producto>) => Promise<void>
  onEliminarProducto: (id: number) => Promise<void>
  onAjustarStockRapido: (producto: Producto) => void
}

export function ProductosTab({
  productos,
  onGuardarProducto,
  onEliminarProducto,
  onAjustarStockRapido,
}: ProductosTabProps) {
  const [busqueda, setBusqueda] = useState('')
  const [filtroCategoria, setFiltroCategoria] = useState('')
  const [filtroEstado, setFiltroEstado] = useState('')
  const [pagina, setPagina] = useState(1)
  const ITEMS_POR_PAGINA = 10

  // Modal
  const [modalAbierto, setModalAbierto] = useState(false)
  const [productoEditando, setProductoEditando] = useState<Producto | null>(null)
  const [form, setForm] = useState<Partial<Producto>>(EMPTY_PRODUCTO)
  const [guardando, setGuardando] = useState(false)

  const productosFiltrados = useMemo(() => {
    return productos.filter((p) => {
      const q = busqueda.toLowerCase().trim()
      const idFormatted = `#prd-${String(p.id).padStart(4, '0')}`.toLowerCase()
      const matchBusqueda =
        !q ||
        p.nombre.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q) ||
        idFormatted.includes(q) ||
        String(p.id) === q ||
        (p.codigo_barras && p.codigo_barras.toLowerCase().includes(q)) ||
        (p.proveedor ?? '').toLowerCase().includes(q)

      const matchCategoria = !filtroCategoria || p.categoria === filtroCategoria

      const matchEstado =
        !filtroEstado ||
        (filtroEstado === 'activo' && p.activo && p.stock_actual > 0) ||
        (filtroEstado === 'inactivo' && !p.activo) ||
        (filtroEstado === 'sin_stock' && p.stock_actual === 0)

      return matchBusqueda && matchCategoria && matchEstado
    })
  }, [productos, busqueda, filtroCategoria, filtroEstado])

  const totalPaginas = Math.ceil(productosFiltrados.length / ITEMS_POR_PAGINA)
  const productosPaginados = useMemo(() => {
    return productosFiltrados.slice(
      (pagina - 1) * ITEMS_POR_PAGINA,
      pagina * ITEMS_POR_PAGINA
    )
  }, [productosFiltrados, pagina])

  const abrirNuevo = () => {
    setProductoEditando(null)
    setForm(EMPTY_PRODUCTO)
    setModalAbierto(true)
  }

  const abrirEditar = (p: Producto) => {
    setProductoEditando(p)
    setForm({ ...p })
    setModalAbierto(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.nombre?.trim() || !form.sku?.trim()) return
    setGuardando(true)
    try {
      await onGuardarProducto(productoEditando?.id ?? null, form)
      setModalAbierto(false)
    } finally {
      setGuardando(false)
    }
  }

  return (
    <div className="space-y-4">
      {/* Filtros y Acción de Crear */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="flex flex-wrap gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar por #PRD, nombre, SKU o barra..."
              value={busqueda}
              onChange={(e) => {
                setBusqueda(e.target.value)
                setPagina(1)
              }}
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-primary-500"
            />
          </div>

          <div className="relative">
            <select
              value={filtroCategoria}
              onChange={(e) => {
                setFiltroCategoria(e.target.value)
                setPagina(1)
              }}
              className="text-xs px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none"
            >
              <option value="">Todas las categorías</option>
              {CATEGORIAS.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div className="relative">
            <select
              value={filtroEstado}
              onChange={(e) => {
                setFiltroEstado(e.target.value)
                setPagina(1)
              }}
              className="text-xs px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none"
            >
              <option value="">Todos los estados</option>
              <option value="activo">En Stock / Activos</option>
              <option value="sin_stock">Sin Stock (0)</option>
              <option value="inactivo">Inactivos</option>
            </select>
          </div>
        </div>

        <Button
          onClick={abrirNuevo}
          leftIcon={<Plus className="w-4 h-4" />}
          className="w-full sm:w-auto"
        >
          Nuevo Producto (#PRD)
        </Button>
      </div>

      {/* Tabla de Productos */}
      {productosFiltrados.length === 0 ? (
        <EmptyState
          icon={<Package className="w-10 h-10 text-slate-400" />}
          title="No se encontraron productos"
          description="Ajusta los filtros de búsqueda o registra un nuevo ítem en inventario."
          action={
            <Button size="sm" onClick={abrirNuevo} leftIcon={<Plus className="w-4 h-4" />}>
              Crear Producto
            </Button>
          }
        />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 font-semibold text-slate-600 dark:text-slate-300">
              <tr>
                <th className="py-3 px-4">Identificador</th>
                <th className="py-3 px-4">Nombre / SKU</th>
                <th className="py-3 px-4">Categoría</th>
                <th className="py-3 px-4 text-right">Costo</th>
                <th className="py-3 px-4 text-right">P. Venta</th>
                <th className="py-3 px-4 text-center">Stock Actual</th>
                <th className="py-3 px-4 text-center">Estado</th>
                <th className="py-3 px-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {productosPaginados.map((p) => {
                return (
                  <tr
                    key={p.id}
                    className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    <td className="py-2.5 px-4 font-mono font-bold text-slate-700 dark:text-slate-300">
                      #PRD-{String(p.id).padStart(4, '0')}
                    </td>
                    <td className="py-2.5 px-4">
                      <p className="font-semibold text-slate-900 dark:text-slate-100">{p.nombre}</p>
                      <p className="text-[11px] font-mono text-slate-400">SKU: {p.sku}</p>
                    </td>
                    <td className="py-2.5 px-4 text-slate-600 dark:text-slate-400">
                      {p.categoria}
                    </td>
                    <td className="py-2.5 px-4 text-right font-medium text-slate-600 dark:text-slate-400">
                      ${p.precio_costo.toFixed(2)}
                    </td>
                    <td className="py-2.5 px-4 text-right font-bold text-slate-900 dark:text-slate-100">
                      ${p.precio_venta.toFixed(2)}
                    </td>
                    <td className="py-2.5 px-4 text-center">
                      <span className={`inline-flex items-center gap-1 font-mono ${stockColorClass(p.stock_actual, p.stock_minimo)}`}>
                        {p.stock_actual} {p.unidad || 'uds'}
                        <Badge variant={stockVariant(p.stock_actual, p.stock_minimo)} size="sm">
                          {stockLabel(p.stock_actual, p.stock_minimo)}
                        </Badge>
                      </span>
                    </td>
                    <td className="py-2.5 px-4 text-center">
                      <Badge variant={p.activo ? 'success' : 'default'} size="sm">
                        {p.activo ? 'Activo' : 'Inactivo'}
                      </Badge>
                    </td>
                    <td className="py-2.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onAjustarStockRapido(p)}
                          title="Ajustar stock rápido"
                          className="h-7 w-7 p-0 text-slate-500 hover:text-emerald-600"
                        >
                          <ArrowUpCircle className="w-3.5 h-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => abrirEditar(p)}
                          title="Editar producto"
                          className="h-7 w-7 p-0 text-slate-500 hover:text-primary-600"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onEliminarProducto(p.id)}
                          title="Eliminar producto"
                          className="h-7 w-7 p-0 text-slate-500 hover:text-red-600"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Paginación */}
      {totalPaginas > 1 && (
        <Pagination
          currentPage={pagina}
          totalPages={totalPaginas}
          onPageChange={setPagina}
        />
      )}

      {/* Modal Nuevo / Editar Producto */}
      {modalAbierto && (
        <Modal
          isOpen={modalAbierto}
          onClose={() => setModalAbierto(false)}
          title={productoEditando ? `Editar Producto (#PRD-${String(productoEditando.id).padStart(4, '0')})` : 'Nuevo Producto (#PRD)'}
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                label="Nombre del Producto"
                value={form.nombre ?? ''}
                onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                required
                autoFocus
              />
              <Input
                label="Código SKU"
                value={form.sku ?? ''}
                onChange={(e) => setForm({ ...form, sku: e.target.value.toUpperCase() })}
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-slate-700 dark:text-slate-300 block mb-1">
                  Categoría
                </label>
                <select
                  value={form.categoria}
                  onChange={(e) => setForm({ ...form, categoria: e.target.value })}
                  className="w-full text-xs px-2.5 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100"
                >
                  {CATEGORIAS.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <Input
                label="Código de Barras (Opcional)"
                placeholder="EAN-13 / UPC"
                value={form.codigo_barras ?? ''}
                onChange={(e) => setForm({ ...form, codigo_barras: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <Input
                label="Costo ($)"
                type="number"
                step="0.01"
                min="0"
                value={form.precio_costo ?? 0}
                onChange={(e) => setForm({ ...form, precio_costo: Number(e.target.value) })}
                required
              />
              <Input
                label="Precio Venta ($)"
                type="number"
                step="0.01"
                min="0"
                value={form.precio_venta ?? 0}
                onChange={(e) => setForm({ ...form, precio_venta: Number(e.target.value) })}
                required
              />
              <Input
                label="Stock Inicial"
                type="number"
                min="0"
                value={form.stock_actual ?? 0}
                onChange={(e) => setForm({ ...form, stock_actual: Number(e.target.value) })}
                required
              />
              <Input
                label="Stock Mínimo"
                type="number"
                min="1"
                value={form.stock_minimo ?? 5}
                onChange={(e) => setForm({ ...form, stock_minimo: Number(e.target.value) })}
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                label="Unidad de Medida"
                placeholder="unidad, ml, g, caja"
                value={form.unidad ?? 'unidad'}
                onChange={(e) => setForm({ ...form, unidad: e.target.value })}
              />
              <Input
                label="Proveedor Habitual"
                placeholder="Nombre o empresa del proveedor"
                value={form.proveedor ?? ''}
                onChange={(e) => setForm({ ...form, proveedor: e.target.value })}
              />
            </div>

            <Textarea
              label="Descripción / Notas Técnicas"
              rows={2}
              value={form.descripcion ?? ''}
              onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
            />

            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="producto-activo"
                checked={form.activo ?? true}
                onChange={(e) => setForm({ ...form, activo: e.target.checked })}
                className="rounded border-slate-300 text-primary-600 focus:ring-primary-500"
              />
              <label htmlFor="producto-activo" className="text-xs text-slate-700 dark:text-slate-300 font-medium">
                Producto disponible para la venta en POS
              </label>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
              <Button type="button" variant="outline" onClick={() => setModalAbierto(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={guardando}>
                {guardando ? 'Guardando...' : productoEditando ? 'Guardar Cambios' : 'Crear Producto'}
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  )
}
