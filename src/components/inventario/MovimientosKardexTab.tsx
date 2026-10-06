import { useState, useMemo } from 'react'
import {
  RefreshCw,
  ArrowUpCircle,
  ArrowDownCircle,
  RotateCcw,
  PackageMinus,
  ArrowLeftRight,
  Search,
  Filter,
  Plus,
  ChevronDown,
} from 'lucide-react'
import type { MovimientoStock, Producto, MovimientoInventario } from '@/types'
import { Button, Badge, Modal, Input, Select, Textarea, EmptyState, Pagination } from '@/components/ui'

export const TIPOS_MOVIMIENTO: { value: MovimientoInventario; label: string }[] = [
  { value: 'PURCHASE', label: 'Compra / Entrada' },
  { value: 'SALE', label: 'Venta / Salida' },
  { value: 'SERVICE_CONSUMPTION', label: 'Consumo por Servicio (BOM)' },
  { value: 'ADJUSTMENT', label: 'Ajuste de Inventario' },
  { value: 'RETURN', label: 'Devolución' },
  { value: 'LOSS', label: 'Pérdida / Merma' },
  { value: 'TRANSFER', label: 'Transferencia' },
]

export function tipoVariant(tipo: MovimientoInventario): 'success' | 'danger' | 'warning' | 'info' | 'default' {
  switch (tipo) {
    case 'PURCHASE': return 'success'
    case 'SALE': return 'info'
    case 'SERVICE_CONSUMPTION': return 'info'
    case 'ADJUSTMENT': return 'default'
    case 'RETURN': return 'warning'
    case 'LOSS': return 'danger'
    case 'TRANSFER': return 'info'
    default: return 'default'
  }
}

export function tipoLabel(tipo: MovimientoInventario) {
  return TIPOS_MOVIMIENTO.find((t) => t.value === tipo)?.label ?? tipo
}

export function tipoIcon(tipo: MovimientoInventario) {
  switch (tipo) {
    case 'PURCHASE': return <ArrowUpCircle className="w-3.5 h-3.5" />
    case 'SALE': return <ArrowDownCircle className="w-3.5 h-3.5" />
    case 'SERVICE_CONSUMPTION': return <ArrowDownCircle className="w-3.5 h-3.5" />
    case 'ADJUSTMENT': return <RefreshCw className="w-3.5 h-3.5" />
    case 'RETURN': return <RotateCcw className="w-3.5 h-3.5" />
    case 'LOSS': return <PackageMinus className="w-3.5 h-3.5" />
    case 'TRANSFER': return <ArrowLeftRight className="w-3.5 h-3.5" />
    default: return <RefreshCw className="w-3.5 h-3.5" />
  }
}

export interface MovimientosKardexTabProps {
  movimientos: MovimientoStock[]
  productos: Producto[]
  onRegistrarMovimiento: (data: {
    producto_id: number
    tipo: MovimientoInventario
    cantidad: number
    motivo?: string
    referencia?: string
  }) => Promise<void>
}

const EMPTY_MOV = {
  producto_id: 0,
  tipo: 'PURCHASE' as MovimientoInventario,
  cantidad: 1,
  motivo: '',
  referencia: '',
}

export function MovimientosKardexTab({
  movimientos,
  productos,
  onRegistrarMovimiento,
}: MovimientosKardexTabProps) {
  const [busqueda, setBusqueda] = useState('')
  const [filtroTipo, setFiltroTipo] = useState<string>('')
  const [pagina, setPagina] = useState(1)
  const ITEMS_POR_PAGINA = 10

  // Modal
  const [modalAbierto, setModalAbierto] = useState(false)
  const [form, setForm] = useState(EMPTY_MOV)
  const [guardando, setGuardando] = useState(false)

  const movimientosFiltrados = useMemo(() => {
    return movimientos.filter((m) => {
      const q = busqueda.toLowerCase().trim()
      const matchBusqueda =
        !q ||
        (m.producto?.nombre ?? '').toLowerCase().includes(q) ||
        (m.producto?.sku ?? '').toLowerCase().includes(q) ||
        `#prd-${String(m.producto_id).padStart(4, '0')}`.toLowerCase().includes(q) ||
        (m.motivo ?? '').toLowerCase().includes(q) ||
        (m.referencia ?? '').toLowerCase().includes(q) ||
        (m.usuario ?? '').toLowerCase().includes(q)

      const matchTipo = !filtroTipo || m.tipo === filtroTipo

      return matchBusqueda && matchTipo
    })
  }, [movimientos, busqueda, filtroTipo])

  const totalPaginas = Math.ceil(movimientosFiltrados.length / ITEMS_POR_PAGINA)
  const movimientosPaginados = useMemo(() => {
    return movimientosFiltrados.slice(
      (pagina - 1) * ITEMS_POR_PAGINA,
      pagina * ITEMS_POR_PAGINA
    )
  }, [movimientosFiltrados, pagina])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.producto_id || form.cantidad <= 0) return
    setGuardando(true)
    try {
      await onRegistrarMovimiento(form)
      setModalAbierto(false)
      setForm(EMPTY_MOV)
    } finally {
      setGuardando(false)
    }
  }

  return (
    <div className="space-y-4">
      {/* Header and Filters */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <div className="flex flex-1 flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar por producto, ref, folio o motivo..."
              value={busqueda}
              onChange={(e) => {
                setBusqueda(e.target.value)
                setPagina(1)
              }}
              className="w-full pl-9 pr-4 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            <select
              value={filtroTipo}
              onChange={(e) => {
                setFiltroTipo(e.target.value)
                setPagina(1)
              }}
              className="pl-9 pr-8 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-primary-500 appearance-none"
            >
              <option value="">Todos los tipos</option>
              {TIPOS_MOVIMIENTO.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
          </div>
        </div>

        <Button
          onClick={() => setModalAbierto(true)}
          leftIcon={<Plus className="w-4 h-4" />}
          className="whitespace-nowrap"
        >
          Registrar Movimiento
        </Button>
      </div>

      {/* Table */}
      <div className="card shadow-card overflow-hidden">
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200">
            Kardex & Historial de Movimientos de Stock
          </h3>
          <span className="text-xs text-slate-400">
            {movimientosFiltrados.length} {movimientosFiltrados.length === 1 ? 'registro' : 'registros'}
          </span>
        </div>

        {movimientosFiltrados.length === 0 ? (
          <EmptyState
            title="No hay movimientos registrados"
            description="No se encontraron movimientos que coincidan con los criterios de búsqueda."
          />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800/40 text-slate-400 uppercase font-semibold border-b border-slate-100 dark:border-slate-800">
                  <tr>
                    <th className="py-3 px-4">Tipo</th>
                    <th className="py-3 px-4">Producto</th>
                    <th className="py-3 px-4 text-center">Cantidad</th>
                    <th className="py-3 px-4 text-center">Anterior → Nuevo</th>
                    <th className="py-3 px-4">Motivo</th>
                    <th className="py-3 px-4">Usuario</th>
                    <th className="py-3 px-4">Fecha</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-700 text-slate-700 dark:text-slate-300">
                  {movimientosPaginados.map((m) => {
                    const esSalida =
                      m.tipo === 'SALE' || m.tipo === 'LOSS' || m.tipo === 'TRANSFER'
                    return (
                      <tr
                        key={m.id}
                        className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors"
                      >
                        <td className="py-3 px-4">
                          <Badge variant={tipoVariant(m.tipo)} size="sm">
                            <span className="flex items-center gap-1">
                              {tipoIcon(m.tipo)}
                              {tipoLabel(m.tipo)}
                            </span>
                          </Badge>
                        </td>
                        <td className="py-3 px-4">
                          <p className="font-medium text-slate-900 dark:text-slate-100">
                            {m.producto?.nombre ?? `Producto #${m.producto_id}`}
                          </p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="font-mono text-[10px] text-primary-600 font-bold">
                              #PRD-{String(m.producto_id).padStart(4, '0')}
                            </span>
                            {m.referencia && (
                              <span className="text-[10px] text-slate-400 font-mono bg-slate-100 dark:bg-slate-800 px-1 rounded">
                                Ref: {m.referencia}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span
                            className={
                              esSalida
                                ? 'text-red-600 dark:text-red-400 font-bold font-mono'
                                : 'text-emerald-600 dark:text-emerald-400 font-bold font-mono'
                            }
                          >
                            {esSalida ? '−' : '+'}{m.cantidad}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center font-mono text-slate-500">
                          {m.cantidad_anterior} → {m.cantidad_nueva}
                        </td>
                        <td className="py-3 px-4 text-slate-500 max-w-[180px] truncate">
                          {m.motivo ?? '—'}
                        </td>
                        <td className="py-3 px-4 text-slate-400 text-[11px]">{m.usuario ?? '—'}</td>
                        <td className="py-3 px-4 text-slate-400 whitespace-nowrap">
                          {new Date(m.created_at).toLocaleString('es-ES', {
                            day: 'numeric',
                            month: 'short',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            <Pagination
              currentPage={pagina}
              totalPages={totalPaginas}
              onPageChange={setPagina}
              totalItems={movimientosFiltrados.length}
              itemsPerPage={ITEMS_POR_PAGINA}
              className="px-4"
            />
          </>
        )}
      </div>

      {/* Modal Registrar Movimiento */}
      <Modal
        isOpen={modalAbierto}
        onClose={() => setModalAbierto(false)}
        title="Registrar Movimiento de Stock"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Producto
            </label>
            <select
              value={form.producto_id}
              onChange={(e) => setForm({ ...form, producto_id: Number(e.target.value) })}
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
              required
            >
              <option value={0}>Seleccionar producto...</option>
              {productos.map((p) => (
                <option key={p.id} value={p.id}>
                  [#PRD-{String(p.id).padStart(4, '0')}] {p.nombre} — Stock actual: {p.stock_actual} {p.unidad}
                </option>
              ))}
            </select>
          </div>

          <Select
            label="Tipo de Movimiento"
            value={form.tipo}
            onChange={(e) =>
              setForm({ ...form, tipo: e.target.value as MovimientoInventario })
            }
            options={TIPOS_MOVIMIENTO.map((t) => ({ value: t.value, label: t.label }))}
          />

          <Input
            label={
              form.tipo === 'ADJUSTMENT'
                ? 'Nueva cantidad (stock directo)'
                : 'Cantidad'
            }
            type="number"
            min="1"
            value={form.cantidad}
            onChange={(e) => setForm({ ...form, cantidad: Number(e.target.value) })}
            required
          />

          <Textarea
            label="Motivo o Justificación (opcional)"
            placeholder="Ej: Compra mensual a proveedor, ajuste por auditoría de almacén, merma..."
            value={form.motivo}
            onChange={(e) => setForm({ ...form, motivo: e.target.value })}
          />

          <Input
            label="Referencia o Folio (opcional)"
            placeholder="Ej: OC-2026-007, TKT-8842, TRANS-B01"
            value={form.referencia}
            onChange={(e) => setForm({ ...form, referencia: e.target.value })}
          />

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
            <Button
              variant="secondary"
              type="button"
              onClick={() => setModalAbierto(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={guardando || !form.producto_id}>
              {guardando ? 'Registrando...' : 'Registrar Movimiento'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
