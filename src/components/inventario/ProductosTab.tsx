import { useState, useMemo, useRef } from 'react'
import {
  Package,
  Plus,
  Pencil,
  Trash2,
  Search,
  ArrowUpCircle,
  LayoutGrid,
  List,
  Image as ImageIcon,
  Upload,
  X,
} from 'lucide-react'
import type { Producto } from '@/types'
import { Button, Badge, Modal, Input, Textarea, EmptyState } from '@/components/ui'

const CATEGORIAS = [
  'Productos de Belleza',
  'Insumos Médicos',
  'Suplementos',
  'Ropa y Accesorios',
  'General',
]

const PRESET_IMAGENES = [
  {
    label: 'Shampoo / Capilar',
    url: 'https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?auto=format&fit=crop&w=400&q=80',
  },
  {
    label: 'Aceite Corporal',
    url: 'https://images.unsplash.com/photo-1608248597359-54378772a1be?auto=format&fit=crop&w=400&q=80',
  },
  {
    label: 'Insumo Médico',
    url: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=400&q=80',
  },
  {
    label: 'Serum Facial',
    url: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=400&q=80',
  },
  {
    label: 'Crema Hidratante',
    url: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=400&q=80',
  },
  {
    label: 'Mascarilla Facial',
    url: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=400&q=80',
  },
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
  imagen: '',
  proveedor: '',
}

function stockVariant(actual: number, minimo: number): 'danger' | 'warning' | 'success' {
  if (actual <= minimo) return 'danger'
  if (actual <= minimo * 2) return 'warning'
  return 'success'
}

function stockLabel(actual: number, minimo: number) {
  if (actual <= 0) return 'Agotado'
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
  const [vista, setVista] = useState<'cuadricula' | 'tabla'>('cuadricula')
  const [productosVisibles, setProductosVisibles] = useState(12)
  const ITEMS_POR_CARGA = 12

  // Modal
  const [modalAbierto, setModalAbierto] = useState(false)
  const [productoEditando, setProductoEditando] = useState<Producto | null>(null)
  const [form, setForm] = useState<Partial<Producto>>(EMPTY_PRODUCTO)
  const [guardando, setGuardando] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

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

  const productosPaginados = useMemo(
    () => productosFiltrados.slice(0, productosVisibles),
    [productosFiltrados, productosVisibles]
  )

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

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (event) => {
      const result = event.target?.result as string
      if (result) {
        setForm((prev) => ({ ...prev, imagen: result }))
      }
    }
    reader.readAsDataURL(file)
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
    <div className="space-y-5">
      {/* ─── Filtros, Vistas y Creación ─── */}
      <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        <div className="flex flex-wrap items-center gap-2">
          {/* Búsqueda */}
          <div className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar por #PRD, nombre, SKU o barra..."
              value={busqueda}
              onChange={(e) => {
                setBusqueda(e.target.value)
                setProductosVisibles(ITEMS_POR_CARGA)
              }}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-hidden focus:ring-1 focus:ring-primary-500 shadow-xs"
            />
          </div>

          {/* Categoría */}
          <select
            value={filtroCategoria}
            onChange={(e) => {
              setFiltroCategoria(e.target.value)
              setProductosVisibles(ITEMS_POR_CARGA)
            }}
            className="text-xs px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-hidden shadow-xs cursor-pointer"
          >
            <option value="">Todas las categorías</option>
            {CATEGORIAS.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>

          {/* Estado */}
          <select
            value={filtroEstado}
            onChange={(e) => {
              setFiltroEstado(e.target.value)
              setProductosVisibles(ITEMS_POR_CARGA)
            }}
            className="text-xs px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-hidden shadow-xs cursor-pointer"
          >
            <option value="">Todos los estados</option>
            <option value="activo">En Stock / Disponibles</option>
            <option value="sin_stock">Sin Stock (0)</option>
            <option value="inactivo">Inactivos</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          {/* Selector de Vista: Cuadrícula vs Tabla */}
          <div className="flex items-center p-0.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100/80 dark:bg-slate-800">
            <button
              onClick={() => {
                setVista('cuadricula')
                setProductosVisibles(ITEMS_POR_CARGA)
              }}
              className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all ${
                vista === 'cuadricula'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
              title="Vista Catálogo / Tarjetas con Foto"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Catálogo</span>
            </button>
            <button
              onClick={() => {
                setVista('tabla')
                setProductosVisibles(ITEMS_POR_CARGA)
              }}
              className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all ${
                vista === 'tabla'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
              title="Vista Lista / Tabla Detallada"
            >
              <List className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Tabla</span>
            </button>
          </div>

          <Button
            onClick={abrirNuevo}
            leftIcon={<Plus className="w-4 h-4" />}
            className="whitespace-nowrap"
          >
            Nuevo Producto
          </Button>
        </div>
      </div>

      {/* ─── Catálogo de Productos / Tabla ─── */}
      {productosFiltrados.length === 0 ? (
        <EmptyState
          icon={<Package className="w-10 h-10 text-slate-400" />}
          title="No se encontraron productos"
          description="Ajusta los filtros de búsqueda o registra un nuevo ítem en inventario con imagen y stock."
          action={
            <Button size="sm" onClick={abrirNuevo} leftIcon={<Plus className="w-4 h-4" />}>
              Crear Producto
            </Button>
          }
        />
      ) : vista === 'cuadricula' ? (
        /* ─── VISTA CATÁLOGO / CUADRÍCULA CON IMÁGENES GRANDES ─── */
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
          {productosPaginados.map((p) => {
            const porcentajeStock = Math.min(
              100,
              Math.max(5, (p.stock_actual / Math.max(1, p.stock_minimo * 2)) * 100)
            )
            const sinStock = p.stock_actual <= 0
            const margen = p.precio_venta > 0
              ? Math.round(((p.precio_venta - p.precio_costo) / p.precio_venta) * 100)
              : 0

            return (
              <div
                key={p.id}
                className="group bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-md transition-all duration-200 flex flex-col overflow-hidden"
              >
                {/* Portada / Imagen */}
                <div className="relative h-48 w-full bg-slate-100 dark:bg-slate-800 overflow-hidden flex items-center justify-center border-b border-slate-100 dark:border-slate-800/80">
                  {p.imagen ? (
                    <img
                      src={p.imagen}
                      alt={p.nombre}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center text-slate-400 p-4">
                      <ImageIcon className="w-9 h-9 mb-1.5 opacity-40 text-slate-400" />
                      <span className="text-[11px] font-medium text-slate-400">Sin imagen</span>
                    </div>
                  )}

                  {/* Badges superiores */}
                  <div className="absolute top-2.5 left-2.5">
                    <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded-lg bg-white/95 dark:bg-slate-900/95 text-slate-700 dark:text-slate-300 shadow-xs border border-slate-200/50 dark:border-slate-700/50 backdrop-blur-xs">
                      #PRD-{String(p.id).padStart(4, '0')}
                    </span>
                  </div>

                  <div className="absolute top-2.5 right-2.5 flex items-center gap-1">
                    <Badge variant={stockVariant(p.stock_actual, p.stock_minimo)} size="sm">
                      {stockLabel(p.stock_actual, p.stock_minimo)}
                    </Badge>
                  </div>

                  {/* Tag categoría inferior */}
                  <div className="absolute bottom-2 left-2">
                    <span className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-slate-900/70 text-white backdrop-blur-xs">
                      {p.categoria}
                    </span>
                  </div>
                </div>

                {/* Contenido del Producto */}
                <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 line-clamp-2 leading-snug title-product">
                      {p.nombre}
                    </h3>
                    <p className="text-xs font-mono text-slate-400 mt-1 truncate">
                      SKU: {p.sku} {p.proveedor ? `• ${p.proveedor}` : ''}
                    </p>
                  </div>

                  {/* Precios & Margen */}
                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                    <div className="flex items-baseline justify-between">
                      <div>
                        <span className="text-[10px] text-slate-400 block">P. Venta</span>
                        <span className="text-base font-extrabold text-slate-900 dark:text-slate-100">
                          ${p.precio_venta.toFixed(2)}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] text-slate-400 block">Costo / Margen</span>
                        <span className="text-xs font-semibold text-slate-500">
                          ${p.precio_costo.toFixed(2)}{' '}
                          <span className="text-emerald-600 dark:text-emerald-400 text-[10px]">
                            (+{margen}%)
                          </span>
                        </span>
                      </div>
                    </div>

                    {/* Barra de Progreso de Stock */}
                    <div className="mt-2.5 space-y-1">
                      <div className="flex justify-between items-center text-[10px]">
                        <span className="text-slate-500 font-medium">Existencias:</span>
                        <span className={`font-mono font-bold ${stockColorClass(p.stock_actual, p.stock_minimo)}`}>
                          {p.stock_actual} {p.unidad || 'uds'}
                        </span>
                      </div>
                      <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-300 ${
                            sinStock
                              ? 'bg-red-500'
                              : p.stock_actual <= p.stock_minimo
                              ? 'bg-amber-500'
                              : 'bg-emerald-500'
                          }`}
                          style={{ width: `${porcentajeStock}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Acciones de Tarjeta */}
                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-1">
                    <button
                      onClick={() => onAjustarStockRapido(p)}
                      className="flex-1 py-1 px-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 hover:text-emerald-600 dark:hover:text-emerald-400 text-[11px] font-semibold text-slate-700 dark:text-slate-300 flex items-center justify-center gap-1 transition-colors"
                      title="Ajuste rápido de inventario"
                    >
                      <ArrowUpCircle className="w-3.5 h-3.5" />
                      <span>Stock</span>
                    </button>
                    <button
                      onClick={() => abrirEditar(p)}
                      className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:text-primary-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      title="Editar producto"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onEliminarProducto(p.id)}
                      className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
                      title="Eliminar producto"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        /* ─── VISTA TABLA TRADICIONAL CON MINIATURAS ─── */
        <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 font-semibold text-slate-600 dark:text-slate-300">
              <tr>
                <th className="py-3 px-4">Producto / Foto</th>
                <th className="py-3 px-4">Identificador</th>
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
                    <td className="py-2.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 overflow-hidden shrink-0 border border-slate-200 dark:border-slate-700 flex items-center justify-center shadow-2xs">
                          {p.imagen ? (
                            <img
                              src={p.imagen}
                              alt={p.nombre}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <Package className="w-5 h-5 text-slate-400" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-slate-900 dark:text-slate-100 truncate max-w-xs">
                            {p.nombre}
                          </p>
                          <p className="text-[11px] font-mono text-slate-400">SKU: {p.sku}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-2.5 px-4 font-mono font-bold text-slate-700 dark:text-slate-300">
                      #PRD-{String(p.id).padStart(4, '0')}
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
                      <span className={`inline-flex items-center gap-1.5 font-mono ${stockColorClass(p.stock_actual, p.stock_minimo)}`}>
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

      {productosFiltrados.length > productosVisibles && (
        <div className="flex flex-col items-center gap-2 py-2">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Mostrando {productosPaginados.length} de {productosFiltrados.length} productos
          </p>
          <Button
            variant="secondary"
            onClick={() => setProductosVisibles((actuales) => actuales + ITEMS_POR_CARGA)}
            className="min-h-11 px-6"
          >
            Ver más productos
          </Button>
        </div>
      )}

      {/* ─── Modal Nuevo / Editar Producto ─── */}
      {modalAbierto && (
        <Modal
          isOpen={modalAbierto}
          onClose={() => setModalAbierto(false)}
          title={
            productoEditando
              ? `Editar Producto (#PRD-${String(productoEditando.id).padStart(4, '0')})`
              : 'Nuevo Producto (#PRD)'
          }
        >
          <form onSubmit={handleSubmit} className="space-y-4 max-h-[80vh] overflow-y-auto pr-1">
            {/* Sección de Imagen */}
            <div className="p-3.5 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700/80 space-y-3">
              <label className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                Fotografía del Producto
              </label>

              <div className="flex flex-col sm:flex-row gap-3 items-center">
                {/* Previsualizador */}
                <div className="relative w-28 h-28 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 overflow-hidden flex items-center justify-center shrink-0 shadow-xs">
                  {form.imagen ? (
                    <>
                      <img
                        src={form.imagen}
                        alt="Previsualización"
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => setForm((prev) => ({ ...prev, imagen: '' }))}
                        className="absolute top-1 right-1 p-1 rounded-full bg-red-600 text-white shadow-xs hover:bg-red-700 transition-colors"
                        title="Quitar imagen"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </>
                  ) : (
                    <div className="flex flex-col items-center justify-center text-slate-400 p-2 text-center">
                      <ImageIcon className="w-8 h-8 mb-1 opacity-40" />
                      <span className="text-[10px] leading-tight">Sin imagen</span>
                    </div>
                  )}
                </div>

                {/* Controles de URL o Subir Archivo */}
                <div className="flex-1 space-y-2 w-full">
                  <div>
                    <label className="text-[11px] text-slate-500 dark:text-slate-400 block mb-1">
                      URL directa de imagen (Web / CDN):
                    </label>
                    <input
                      type="url"
                      placeholder="https://ejemplo.com/foto-producto.jpg"
                      value={form.imagen ?? ''}
                      onChange={(e) => setForm({ ...form, imagen: e.target.value })}
                      className="w-full text-xs px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:outline-hidden focus:ring-1 focus:ring-primary-500"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => fileInputRef.current?.click()}
                      leftIcon={<Upload className="w-3.5 h-3.5" />}
                    >
                      Subir desde mi equipo
                    </Button>
                    <span className="text-[10px] text-slate-400">PNG, JPG, WebP</span>
                  </div>
                </div>
              </div>

              {/* Presets sugeridos */}
              <div className="pt-2 border-t border-slate-200/60 dark:border-slate-700/60">
                <span className="text-[10px] font-semibold text-slate-500 block mb-1.5">
                  O elige una imagen de muestra para tu rubro:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {PRESET_IMAGENES.map((preset) => (
                    <button
                      key={preset.label}
                      type="button"
                      onClick={() => setForm((prev) => ({ ...prev, imagen: preset.url }))}
                      className="px-2 py-1 rounded-lg text-[10px] font-medium border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:border-primary-500 text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

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
                  className="w-full text-xs px-2.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100"
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
              <label
                htmlFor="producto-activo"
                className="text-xs text-slate-700 dark:text-slate-300 font-medium"
              >
                Producto activo y visible para venta en Terminal POS
              </label>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
              <Button type="button" variant="outline" onClick={() => setModalAbierto(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={guardando}>
                {guardando
                  ? 'Guardando...'
                  : productoEditando
                  ? 'Guardar Cambios'
                  : 'Crear Producto'}
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  )
}
