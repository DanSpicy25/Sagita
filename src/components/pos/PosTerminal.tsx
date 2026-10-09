import { useState } from 'react'
import {
  Search,
  Plus,
  Minus,
  Trash2,
  CreditCard,
  User,
  Scissors,
  Package,
} from 'lucide-react'
import type { ItemVenta, Empleado } from '@/types'
import { Button } from '@/components/ui'

export interface CatalogoItem {
  id: number
  nombre: string
  precio: number
  tipo: 'servicio' | 'producto'
  stock?: number
  sku?: string
  codigo_barras?: string
}

type SubTabPOS = 'servicios' | 'productos'

const fmt = (n: number) => `$${n.toFixed(2)}`

interface CartItemRowProps {
  item: ItemVenta
  empleados?: Empleado[]
  stockDisponible?: number
  onUpdate: (id: string, changes: Partial<ItemVenta>) => void
  onRemove: (id: string) => void
}

function CartItemRow({
  item,
  empleados = [],
  stockDisponible,
  onUpdate,
  onRemove,
}: CartItemRowProps) {
  const [eliminando, setEliminando] = useState(false)
  const sub = (item.precio_unitario - item.descuento_item) * item.cantidad
  const stockAlcanzado =
    item.tipo === 'producto' &&
    stockDisponible !== undefined &&
    item.cantidad >= stockDisponible

  const handleEliminarConAnimacion = () => {
    setEliminando(true)
    setTimeout(() => {
      onRemove(item.id)
    }, 300)
  }

  return (
    <div
      className={`flex flex-col gap-2.5 py-3.5 border-b border-slate-100 dark:border-slate-800 last:border-0 transition-all duration-300 ${
        eliminando ? 'opacity-0 -translate-x-6 scale-95' : 'opacity-100'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100 leading-snug truncate">
            {item.nombre}
          </p>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              {fmt(item.precio_unitario)} c/u
            </span>
            {item.tipo === 'servicio' && (
              <span className="text-[10px] px-2 py-0.5 rounded-md bg-violet-50 dark:bg-violet-950/40 text-violet-600 dark:text-violet-400 font-bold">
                Servicio
              </span>
            )}
            {item.tipo === 'producto' && (
              <span className="text-[10px] px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 font-bold">
                Producto
              </span>
            )}
          </div>
        </div>

        {/* Botón de papelera accesible con micro-animación */}
        <button
          type="button"
          onClick={handleEliminarConAnimacion}
          aria-label={`Eliminar ${item.nombre} del ticket`}
          disabled={eliminando}
          className="h-11 w-11 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200/80 dark:border-red-900/50 text-red-600 dark:text-red-400 hover:bg-red-600 hover:text-white dark:hover:bg-red-600 dark:hover:text-white transition-all duration-150 flex items-center justify-center shrink-0 cursor-pointer shadow-xs active:scale-90 disabled:cursor-wait group"
          title="Eliminar este ítem"
        >
          <Trash2
            className={`w-4 h-4 transition-transform group-hover:scale-110 ${
              eliminando ? 'animate-trash-shake text-red-600' : ''
            }`}
          />
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-3 pt-1">
        {/* Controles táctiles de Cantidad (+ / -) con botones grandes y claros */}
        <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-2xl border border-slate-200 dark:border-slate-700/80 shadow-2xs">
          <button
            type="button"
            onClick={() => onUpdate(item.id, { cantidad: Math.max(1, item.cantidad - 1) })}
            aria-label={`Restar una unidad de ${item.nombre}`}
            disabled={item.cantidad <= 1}
            className="h-11 w-11 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:bg-slate-900 hover:text-white dark:hover:bg-slate-100 dark:hover:text-slate-900 hover:border-transparent flex items-center justify-center text-slate-800 dark:text-slate-100 transition-all duration-150 active:scale-90 shadow-xs cursor-pointer disabled:cursor-not-allowed disabled:opacity-45 group"
            title="Restar 1 unidad"
          >
            <Minus className="w-4 h-4 stroke-[2.75] group-active:scale-90" />
          </button>

          <span className="w-8 text-center text-sm sm:text-base font-black text-slate-900 dark:text-slate-100 font-mono select-none">
            {item.cantidad}
          </span>

          <button
            type="button"
            onClick={() =>
              onUpdate(item.id, {
                cantidad: Math.min(item.cantidad + 1, stockDisponible ?? Number.POSITIVE_INFINITY),
              })
            }
            aria-label={`Agregar una unidad de ${item.nombre}`}
            disabled={stockAlcanzado}
            className="h-11 w-11 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:bg-slate-900 hover:text-white dark:hover:bg-slate-100 dark:hover:text-slate-900 hover:border-transparent flex items-center justify-center text-slate-800 dark:text-slate-100 transition-all duration-150 active:scale-90 shadow-xs cursor-pointer disabled:cursor-not-allowed disabled:opacity-45 group"
            title={stockAlcanzado ? 'No hay más existencias disponibles' : 'Sumar 1 unidad'}
          >
            <Plus className="w-4 h-4 stroke-[2.75] group-active:scale-90" />
          </button>
        </div>

        {/* Descuento por ítem */}
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-semibold text-slate-500 whitespace-nowrap">Dto ($):</span>
          <input
            type="number"
            min="0"
            step="0.01"
            value={item.descuento_item}
            onChange={(e) =>
              onUpdate(item.id, {
                descuento_item: Math.max(0, Number(e.target.value)),
              })
            }
            className="w-16 h-8 text-xs font-bold text-center px-1 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:outline-hidden focus:ring-1 focus:ring-primary-500"
          />
        </div>

        {/* Profesional asignado para comisión */}
        {empleados.length > 0 && (
          <select
            value={item.profesional_id || ''}
            onChange={(e) => {
              const empId = Number(e.target.value) || undefined
              const emp = empleados.find((ep) => ep.id === empId)
              onUpdate(item.id, {
                profesional_id: empId,
                profesional_nombre: emp ? emp.nombre : undefined,
              })
            }}
            className="h-8 text-[11px] font-medium px-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 focus:outline-hidden max-w-[130px] cursor-pointer"
            title="Asignar profesional para cálculo de comisión"
          >
            <option value="">👤 Comisión</option>
            {empleados.map((emp) => (
              <option key={emp.id} value={emp.id}>
                {emp.nombre}
              </option>
            ))}
          </select>
        )}

        <div className="ml-auto text-right">
          <span className="text-sm font-black text-slate-900 dark:text-slate-100">
            {fmt(sub)}
          </span>
        </div>
      </div>
    </div>
  )
}

export interface PosTerminalProps {
  catalogoServicios: CatalogoItem[]
  catalogoProductos: CatalogoItem[]
  empleados: Empleado[]
  cartItems: ItemVenta[]
  descuentoGlobal: number
  tasaImpuesto: number
  clienteNombre: string
  notasVenta: string
  procesandoVenta: boolean
  onAddToCart: (item: CatalogoItem) => void
  onUpdateCartItem: (id: string, changes: Partial<ItemVenta>) => void
  onRemoveCartItem: (id: string) => void
  onClearCart: () => void
  onSetDescuentoGlobal: (v: number) => void
  onSetTasaImpuesto: (v: number) => void
  onSetClienteNombre: (v: string) => void
  onSetNotasVenta: (v: string) => void
  onOpenCobro: () => void
}

export function PosTerminal({
  catalogoServicios,
  catalogoProductos,
  empleados,
  cartItems,
  descuentoGlobal,
  tasaImpuesto,
  clienteNombre,
  notasVenta,
  procesandoVenta,
  onAddToCart,
  onUpdateCartItem,
  onRemoveCartItem,
  onClearCart,
  onSetDescuentoGlobal,
  onSetTasaImpuesto,
  onSetClienteNombre,
  onSetNotasVenta,
  onOpenCobro,
}: PosTerminalProps) {
  const [subTab, setSubTab] = useState<SubTabPOS>('servicios')
  const [busqueda, setBusqueda] = useState('')
  const [limpiando, setLimpiando] = useState(false)

  const catalogo = subTab === 'servicios' ? catalogoServicios : catalogoProductos
  const catalogoFiltrado = catalogo.filter((i) => {
    const q = busqueda.toLowerCase().trim()
    if (!q) return true
    const prefix = i.tipo === 'producto' ? 'prd' : 'srv'
    const idFormatted = `#${prefix}-${String(i.id).padStart(4, '0')}`.toLowerCase()
    return (
      i.nombre.toLowerCase().includes(q) ||
      idFormatted.includes(q) ||
      String(i.id) === q ||
      (i.sku && i.sku.toLowerCase().includes(q)) ||
      (i.codigo_barras && i.codigo_barras.toLowerCase().includes(q))
    )
  })

  // Cálculos del Carrito
  const subtotal = cartItems.reduce((acc, i) => acc + i.total, 0)
  const descuentoAmt = (subtotal * descuentoGlobal) / 100
  const baseImponible = subtotal - descuentoAmt
  const impuestoAmt = (baseImponible * tasaImpuesto) / 100
  const total = baseImponible + impuestoAmt

  const handleLimpiarConAnimacion = () => {
    setLimpiando(true)
    setTimeout(() => {
      onClearCart()
      setLimpiando(false)
    }, 400)
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-start">
      {/* ─── Columna Izquierda: Catálogo Interactivo y Botones Táctiles ─── */}
      <div className="lg:col-span-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40">
          {/* Sub-tabs Grandes y Conmutables */}
          <div className="flex gap-2 mb-3">
            <button
              onClick={() => setSubTab('servicios')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer ${
                subTab === 'servicios'
                  ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 shadow-sm'
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
              }`}
            >
              <Scissors className="w-4 h-4" />
              Servicios ({catalogoServicios.length})
            </button>
            <button
              onClick={() => setSubTab('productos')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer ${
                subTab === 'productos'
                  ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 shadow-sm'
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
              }`}
            >
              <Package className="w-4 h-4" />
              Productos ({catalogoProductos.length})
            </button>
          </div>

          {/* Búsqueda Táctil */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder={`Buscar en ${subTab}... (#ID, nombre, SKU o código de barras)`}
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-primary-500 shadow-2xs"
            />
          </div>
        </div>

        {/* Cuadrícula de Ítems del Catálogo */}
        <div className="p-4 max-h-[560px] overflow-y-auto">
          {catalogoFiltrado.length === 0 ? (
            <div className="py-16 text-center text-slate-400 text-sm">
              No se encontraron {subTab} para la búsqueda.
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {catalogoFiltrado.map((item) => {
                const sinStock =
                  item.tipo === 'producto' &&
                  item.stock !== undefined &&
                  item.stock <= 0

                return (
                  <div
                    key={`${item.tipo}-${item.id}`}
                    className={`p-3.5 rounded-2xl border text-left flex flex-col justify-between transition-all duration-200 select-none ${
                      sinStock
                        ? 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 opacity-60 cursor-not-allowed'
                        : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-400 dark:hover:border-slate-600 hover:shadow-md'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono mb-1.5">
                        <span className="font-bold">
                          #{item.tipo === 'producto' ? 'PRD' : 'SRV'}-
                          {String(item.id).padStart(4, '0')}
                        </span>
                        {item.tipo === 'producto' && item.stock !== undefined && (
                          <span
                            className={`font-bold px-1.5 py-0.5 rounded-md ${
                              sinStock
                                ? 'bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400'
                                : item.stock < 5
                                ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400'
                                : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400'
                            }`}
                          >
                            {sinStock ? 'Agotado' : `${item.stock} stock`}
                          </span>
                        )}
                      </div>

                      <p className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100 line-clamp-2 leading-snug">
                        {item.nombre}
                      </p>
                    </div>

                    <div className="mt-3.5 flex items-center justify-between pt-2.5 border-t border-slate-100 dark:border-slate-800">
                      <span className="text-sm sm:text-base font-black text-slate-900 dark:text-slate-100">
                        {fmt(item.precio)}
                      </span>

                      {/* Botón táctil grande con animación para personas con lentes */}
                      <button
                        type="button"
                        disabled={sinStock}
                        onClick={(e) => {
                          e.stopPropagation()
                          if (!sinStock) onAddToCart(item)
                        }}
                        className={`h-11 w-11 rounded-xl flex items-center justify-center font-bold transition-all duration-150 shadow-xs ${
                          sinStock
                            ? 'bg-slate-200 dark:bg-slate-700 text-slate-400 cursor-not-allowed'
                            : 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 hover:bg-slate-700 dark:hover:bg-white active:scale-90 hover:scale-105 cursor-pointer'
                        }`}
                        aria-label={`Añadir ${item.nombre} al ticket`}
                        title="Añadir al ticket"
                      >
                        <Plus className="w-5 h-5 stroke-[2.75]" />
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* ─── Columna Derecha: Ticket de Venta y Cobro Táctil ─── */}
      <div className="lg:col-span-2 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs p-4 sm:p-5 flex flex-col">
        {/* Cabecera del Ticket */}
        <div className="flex items-center justify-between pb-3.5 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <h3 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-slate-100">
              Ticket de Venta
            </h3>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-primary-50 dark:bg-primary-950/40 text-primary-600 dark:text-primary-400 font-black">
              {cartItems.reduce((acc, i) => acc + i.cantidad, 0)} ítems
            </span>
          </div>

          {cartItems.length > 0 && (
            <button
              onClick={handleLimpiarConAnimacion}
              disabled={limpiando}
              className="px-2.5 py-1.5 rounded-xl border border-red-200 dark:border-red-900/60 bg-red-50/70 dark:bg-red-950/40 text-xs font-bold text-red-600 dark:text-red-400 hover:bg-red-600 hover:text-white dark:hover:bg-red-600 dark:hover:text-white flex items-center gap-1.5 transition-all active:scale-90 cursor-pointer shadow-2xs"
              title="Vaciar ticket completo"
            >
              <Trash2
                className={`w-3.5 h-3.5 ${limpiando ? 'animate-trash-shake' : ''}`}
              />
              <span>{limpiando ? 'Vaciando...' : 'Vaciar'}</span>
            </button>
          )}
        </div>

        {/* Cliente y Notas Rápidas */}
        <div className="py-3 border-b border-slate-100 dark:border-slate-800 space-y-2">
          <div className="relative">
            <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Cliente (opcional, ej. Ana López)"
              value={clienteNombre}
              onChange={(e) => onSetClienteNombre(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:outline-hidden focus:ring-1 focus:ring-primary-500"
            />
          </div>
          <div>
            <input
              type="text"
              placeholder="Notas de venta / observaciones (opcional)"
              value={notasVenta}
              onChange={(e) => onSetNotasVenta(e.target.value)}
              className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:outline-hidden focus:ring-1 focus:ring-primary-500"
            />
          </div>
        </div>

        {/* Lista de Ítems en Carrito */}
        <div className="flex-1 min-h-[190px] max-h-[320px] overflow-y-auto pr-1">
          {cartItems.length === 0 ? (
            <div className="py-14 text-center text-slate-400 text-xs sm:text-sm flex flex-col items-center justify-center">
              <Package className="w-10 h-10 mb-2 opacity-40 text-slate-400" />
              <span>El ticket está vacío. Toca un ítem del catálogo para agregarlo.</span>
            </div>
          ) : (
            cartItems.map((item) => (
              <CartItemRow
                key={item.id}
                item={item}
                empleados={empleados}
                stockDisponible={
                  item.tipo === 'producto'
                    ? catalogoProductos.find((producto) => producto.id === item.referencia_id)?.stock
                    : undefined
                }
                onUpdate={onUpdateCartItem}
                onRemove={onRemoveCartItem}
              />
            ))
          )}
        </div>

        {/* Desglose Económico */}
        <div className="pt-3.5 border-t border-slate-100 dark:border-slate-800 space-y-2 text-xs sm:text-sm">
          <div className="flex justify-between text-slate-500 dark:text-slate-400">
            <span>Subtotal</span>
            <span className="font-semibold text-slate-900 dark:text-slate-100">
              {fmt(subtotal)}
            </span>
          </div>

          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span>Descuento global (%)</span>
            <input
              type="number"
              min="0"
              max="100"
              value={descuentoGlobal}
              onChange={(e) =>
                onSetDescuentoGlobal(
                  Math.min(100, Math.max(0, Number(e.target.value)))
                )
              }
              className="w-16 h-8 text-right font-bold px-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100"
            />
          </div>

          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span>IVA / Impuesto (%)</span>
            <input
              type="number"
              min="0"
              max="100"
              value={tasaImpuesto}
              onChange={(e) =>
                onSetTasaImpuesto(
                  Math.min(100, Math.max(0, Number(e.target.value)))
                )
              }
              className="w-16 h-8 text-right font-bold px-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100"
            />
          </div>

          <div className="pt-2.5 border-t border-slate-200 dark:border-slate-700 flex justify-between items-baseline">
            <span className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-slate-100">
              Total a Pagar
            </span>
            <span className="text-2xl font-black text-primary-600 dark:text-primary-400 font-mono">
              {fmt(total)}
            </span>
          </div>
        </div>

        {/* Botón de Cobro Táctil Grande */}
        <div className="mt-4">
          <Button
            variant="primary"
            size="lg"
            className="w-full justify-center font-black text-sm sm:text-base py-3.5 rounded-2xl shadow-md active:scale-98 transition-transform cursor-pointer"
            disabled={cartItems.length === 0 || procesandoVenta}
            onClick={onOpenCobro}
          >
            <CreditCard className="w-5 h-5 mr-2 stroke-[2.5]" />
            Cobrar Ticket {fmt(total)}
          </Button>
        </div>
      </div>
    </div>
  )
}
