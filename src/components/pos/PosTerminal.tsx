import { useState } from 'react'
import {
  Search,
  Plus,
  Minus,
  Trash2,
  X,
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
  onUpdate: (id: string, changes: Partial<ItemVenta>) => void
  onRemove: (id: string) => void
}

function CartItemRow({ item, empleados = [], onUpdate, onRemove }: CartItemRowProps) {
  const sub = (item.precio_unitario - item.descuento_item) * item.cantidad
  return (
    <div className="flex flex-col gap-2 py-3 border-b border-border last:border-0">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-text truncate">{item.nombre}</p>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-[11px] text-text-muted">{fmt(item.precio_unitario)} c/u</span>
            {item.tipo === 'servicio' && (
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-primary-soft text-primary font-medium">
                Servicio
              </span>
            )}
            {item.tipo === 'producto' && (
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 font-medium">
                Producto
              </span>
            )}
          </div>
        </div>
        <button
          onClick={() => onRemove(item.id)}
          className="text-text-muted hover:text-red-500 transition-colors shrink-0 mt-0.5"
          title="Eliminar ítem"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {/* Cantidad */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => onUpdate(item.id, { cantidad: Math.max(1, item.cantidad - 1) })}
            className="w-6 h-6 rounded-lg bg-surface border border-border hover:bg-secondary-soft flex items-center justify-center transition-colors text-text"
          >
            <Minus className="w-3 h-3" />
          </button>
          <span className="w-6 text-center text-xs font-bold text-text">{item.cantidad}</span>
          <button
            onClick={() => onUpdate(item.id, { cantidad: item.cantidad + 1 })}
            className="w-6 h-6 rounded-lg bg-surface border border-border hover:bg-secondary-soft flex items-center justify-center transition-colors text-text"
          >
            <Plus className="w-3 h-3" />
          </button>
        </div>

        {/* Descuento por ítem */}
        <div className="flex items-center gap-1">
          <span className="text-[11px] text-text-muted whitespace-nowrap">Dto.</span>
          <input
            type="number"
            min="0"
            step="0.01"
            value={item.descuento_item}
            onChange={(e) => onUpdate(item.id, { descuento_item: Math.max(0, Number(e.target.value)) })}
            className="w-14 text-xs px-2 py-1 rounded-lg border border-border bg-surface text-text focus:outline-hidden focus:ring-1 focus:ring-primary"
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
            className="text-[11px] px-1.5 py-1 rounded-lg border border-border bg-surface text-text focus:outline-hidden max-w-[130px]"
            title="Asignar profesional para cálculo de comisión"
          >
            <option value="">👤 (Comisión)</option>
            {empleados.map((emp) => (
              <option key={emp.id} value={emp.id}>
                {emp.nombre}
              </option>
            ))}
          </select>
        )}

        <span className="text-xs font-bold text-text ml-auto">{fmt(sub)}</span>
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

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-start">
      {/* Columna Izquierda: Catálogo Interactivo */}
      <div className="lg:col-span-3 rounded-xl border border-border bg-surface shadow-xs overflow-hidden">
        <div className="p-4 border-b border-border">
          {/* Sub-tabs */}
          <div className="flex gap-2 mb-3">
            <button
              onClick={() => setSubTab('servicios')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                subTab === 'servicios'
                  ? 'bg-primary-soft text-primary font-bold'
                  : 'text-text-muted hover:bg-secondary-soft hover:text-text'
              }`}
            >
              <Scissors className="w-3.5 h-3.5" />
              Servicios ({catalogoServicios.length})
            </button>
            <button
              onClick={() => setSubTab('productos')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                subTab === 'productos'
                  ? 'bg-primary-soft text-primary font-bold'
                  : 'text-text-muted hover:bg-secondary-soft hover:text-text'
              }`}
            >
              <Package className="w-3.5 h-3.5" />
              Productos ({catalogoProductos.length})
            </button>
          </div>

          {/* Búsqueda */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
            <input
              type="text"
              placeholder={`Buscar en ${subTab}... (#ID, nombre, SKU o código de barras)`}
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs rounded-lg border border-border bg-surface text-text focus:outline-hidden focus:ring-1 focus:ring-primary"
            />
          </div>
        </div>

        {/* Cuadrícula de Ítems */}
        <div className="p-4 max-h-[520px] overflow-y-auto">
          {catalogoFiltrado.length === 0 ? (
            <div className="py-12 text-center text-text-muted text-xs">
              No se encontraron {subTab} para la búsqueda.
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {catalogoFiltrado.map((item) => {
                const sinStock = item.tipo === 'producto' && item.stock !== undefined && item.stock <= 0
                return (
                  <button
                    key={`${item.tipo}-${item.id}`}
                    onClick={() => onAddToCart(item)}
                    disabled={sinStock}
                    className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all ${
                      sinStock
                        ? 'border-border bg-secondary-soft/50 opacity-60 cursor-not-allowed'
                        : 'border-border bg-surface hover:border-primary/50 hover:shadow-xs active:scale-98'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between text-[10px] text-text-muted font-mono mb-1">
                        <span>#{item.tipo === 'producto' ? 'PRD' : 'SRV'}-{String(item.id).padStart(4, '0')}</span>
                        {item.tipo === 'producto' && item.stock !== undefined && (
                          <span className={`font-semibold ${sinStock ? 'text-red-500' : item.stock < 5 ? 'text-amber-500' : 'text-emerald-500'}`}>
                            {sinStock ? 'Agotado' : `${item.stock} en stock`}
                          </span>
                        )}
                      </div>
                      <p className="text-xs font-semibold text-text line-clamp-2">{item.nombre}</p>
                    </div>
                    <div className="mt-3 flex items-center justify-between pt-2 border-t border-border/50">
                      <span className="text-xs font-bold text-primary">{fmt(item.precio)}</span>
                      <span className="p-1 rounded-md bg-secondary-soft text-text hover:bg-primary hover:text-white transition-colors">
                        <Plus className="w-3 h-3" />
                      </span>
                    </div>
                  </button>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* Columna Derecha: Carrito y Totales */}
      <div className="lg:col-span-2 rounded-xl border border-border bg-surface shadow-xs p-4 flex flex-col">
        <div className="flex items-center justify-between pb-3 border-b border-border">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-text">Ticket de Venta</h3>
            <span className="text-[11px] px-2 py-0.5 rounded-full bg-primary-soft text-primary font-bold">
              {cartItems.reduce((acc, i) => acc + i.cantidad, 0)} ítems
            </span>
          </div>
          {cartItems.length > 0 && (
            <button
              onClick={onClearCart}
              className="text-[11px] text-text-muted hover:text-red-500 flex items-center gap-1 transition-colors"
            >
              <Trash2 className="w-3 h-3" /> Limpiar
            </button>
          )}
        </div>

        {/* Cliente y Notas Rápidas */}
        <div className="py-2.5 border-b border-border space-y-2">
          <div className="relative">
            <User className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-text-muted" />
            <input
              type="text"
              placeholder="Cliente (opcional, ej. Ana López)"
              value={clienteNombre}
              onChange={(e) => onSetClienteNombre(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-border bg-surface text-text focus:outline-hidden focus:ring-1 focus:ring-primary"
            />
          </div>
          <div>
            <input
              type="text"
              placeholder="Notas de venta / observaciones (opcional)"
              value={notasVenta}
              onChange={(e) => onSetNotasVenta(e.target.value)}
              className="w-full px-3 py-1.5 text-xs rounded-lg border border-border bg-surface text-text focus:outline-hidden focus:ring-1 focus:ring-primary"
            />
          </div>
        </div>

        {/* Lista de Ítems */}
        <div className="flex-1 min-h-[180px] max-h-[300px] overflow-y-auto pr-1">
          {cartItems.length === 0 ? (
            <div className="py-12 text-center text-text-muted text-xs">
              El ticket está vacío. Agrega ítems del catálogo para comenzar.
            </div>
          ) : (
            cartItems.map((item) => (
              <CartItemRow
                key={item.id}
                item={item}
                empleados={empleados}
                onUpdate={onUpdateCartItem}
                onRemove={onRemoveCartItem}
              />
            ))
          )}
        </div>

        {/* Desglose Económico */}
        <div className="pt-3 border-t border-border space-y-2 text-xs">
          <div className="flex justify-between text-text-muted">
            <span>Subtotal</span>
            <span className="font-medium text-text">{fmt(subtotal)}</span>
          </div>

          <div className="flex items-center justify-between text-text-muted">
            <span className="flex items-center gap-1">
              Descuento global (%)
            </span>
            <input
              type="number"
              min="0"
              max="100"
              value={descuentoGlobal}
              onChange={(e) => onSetDescuentoGlobal(Math.min(100, Math.max(0, Number(e.target.value))))}
              className="w-14 text-right px-1.5 py-0.5 rounded border border-border bg-surface text-text"
            />
          </div>

          <div className="flex items-center justify-between text-text-muted">
            <span>IVA / Impuesto (%)</span>
            <input
              type="number"
              min="0"
              max="100"
              value={tasaImpuesto}
              onChange={(e) => onSetTasaImpuesto(Math.min(100, Math.max(0, Number(e.target.value))))}
              className="w-14 text-right px-1.5 py-0.5 rounded border border-border bg-surface text-text"
            />
          </div>

          <div className="pt-2 border-t border-border flex justify-between items-baseline">
            <span className="text-sm font-bold text-text">Total a Pagar</span>
            <span className="text-xl font-extrabold text-primary">{fmt(total)}</span>
          </div>
        </div>

        {/* Botón de Cobro */}
        <div className="mt-4">
          <Button
            variant="primary"
            size="lg"
            className="w-full justify-center font-bold text-sm shadow-md"
            disabled={cartItems.length === 0 || procesandoVenta}
            onClick={onOpenCobro}
          >
            <CreditCard className="w-4 h-4 mr-2" />
            Cobrar {fmt(total)}
          </Button>
        </div>
      </div>
    </div>
  )
}
