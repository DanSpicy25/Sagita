import { useState, useMemo } from 'react'
import {
  Search,
  Eye,
  Printer,
  RotateCcw,
  Banknote,
  CreditCard,
  ArrowLeftRight,
  Smartphone,
  Landmark,
  Gift,
  Layers,
} from 'lucide-react'
import type { Venta, EstadoVenta, MetodoPagoVenta } from '@/types'
import { Badge, Button, Pagination } from '@/components/ui'

const fmt = (n: number) => `$${n.toFixed(2)}`

const estadoVentaBadge: Record<EstadoVenta, { variant: 'success' | 'warning' | 'danger' | 'default' | 'primary'; label: string }> = {
  PAID:      { variant: 'success', label: 'Pagada' },
  PENDING:   { variant: 'warning', label: 'Pendiente' },
  DRAFT:     { variant: 'default', label: 'Borrador' },
  CANCELLED: { variant: 'danger',  label: 'Cancelada' },
  REFUNDED:  { variant: 'primary', label: 'Reembolsada' },
}

const metodoPagoIcon: Record<MetodoPagoVenta, React.ReactNode> = {
  efectivo:      <Banknote className="w-3.5 h-3.5" />,
  tarjeta:       <CreditCard className="w-3.5 h-3.5" />,
  transferencia: <ArrowLeftRight className="w-3.5 h-3.5" />,
  stripe:        <CreditCard className="w-3.5 h-3.5 text-indigo-500" />,
  pago_movil:    <Smartphone className="w-3.5 h-3.5 text-emerald-500" />,
  zelle:         <Smartphone className="w-3.5 h-3.5 text-purple-500" />,
  deposito:      <Landmark className="w-3.5 h-3.5 text-blue-500" />,
  gift_card:     <Gift className="w-3.5 h-3.5 text-amber-500" />,
  mixto:         <Layers className="w-3.5 h-3.5" />,
}

export interface PosHistorialVentasProps {
  ventas: Venta[]
  cargando: boolean
  onVerDetalle: (venta: Venta) => void
  onVerTicket: (venta: Venta) => void
  onDevolucion: (venta: Venta) => void
}

export function PosHistorialVentas({
  ventas,
  cargando,
  onVerDetalle,
  onVerTicket,
  onDevolucion,
}: PosHistorialVentasProps) {
  const [busqueda, setBusqueda] = useState('')
  const [filtroFecha, setFiltroFecha] = useState('')
  const [pagina, setPagina] = useState(1)
  const ITEMS_POR_PAGINA = 10

  const ventasFiltradas = useMemo(() => {
    return ventas.filter((v) => {
      const matchBusq =
        !busqueda ||
        v.numero.toLowerCase().includes(busqueda.toLowerCase()) ||
        (v.cliente?.nombre ?? '').toLowerCase().includes(busqueda.toLowerCase())
      const matchFecha = !filtroFecha || v.created_at.startsWith(filtroFecha)
      return matchBusq && matchFecha
    })
  }, [ventas, busqueda, filtroFecha])

  const totalPaginas = Math.ceil(ventasFiltradas.length / ITEMS_POR_PAGINA)
  const ventasPaginadas = ventasFiltradas.slice(
    (pagina - 1) * ITEMS_POR_PAGINA,
    pagina * ITEMS_POR_PAGINA
  )

  return (
    <div className="space-y-4">
      {/* Barra de Filtros */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
          <input
            type="text"
            placeholder="Buscar por folio (#VEN-...) o cliente..."
            value={busqueda}
            onChange={(e) => {
              setBusqueda(e.target.value)
              setPagina(1)
            }}
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-border bg-surface text-text focus:outline-hidden focus:ring-1 focus:ring-primary"
          />
        </div>
        <input
          type="date"
          value={filtroFecha}
          onChange={(e) => {
            setFiltroFecha(e.target.value)
            setPagina(1)
          }}
          className="text-xs px-3 py-2 rounded-xl border border-border bg-surface text-text focus:outline-hidden"
        />
      </div>

      {/* Tabla de Ventas */}
      <div className="rounded-xl border border-border bg-surface shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-surface-raised border-b border-border text-text-muted font-semibold">
              <tr>
                <th className="px-4 py-3">Folio</th>
                <th className="px-4 py-3">Fecha</th>
                <th className="px-4 py-3">Cliente</th>
                <th className="px-4 py-3">Ítems</th>
                <th className="px-4 py-3">Método</th>
                <th className="px-4 py-3">Estado</th>
                <th className="px-4 py-3 text-right">Total</th>
                <th className="px-4 py-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {cargando ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-text-muted">
                    Cargando historial de ventas...
                  </td>
                </tr>
              ) : ventasPaginadas.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-text-muted">
                    No se encontraron transacciones en el historial.
                  </td>
                </tr>
              ) : (
                ventasPaginadas.map((v) => {
                  const est = estadoVentaBadge[v.estado] || { variant: 'default', label: v.estado }
                  return (
                    <tr key={v.id} className="hover:bg-secondary-soft/50 transition-colors">
                      <td className="px-4 py-3 font-mono font-bold text-text">{v.numero}</td>
                      <td className="px-4 py-3 text-text-muted whitespace-nowrap">
                        {new Date(v.created_at).toLocaleString()}
                      </td>
                      <td className="px-4 py-3 font-medium text-text">
                        {v.cliente?.nombre || 'Venta de Mostrador'}
                      </td>
                      <td className="px-4 py-3 text-text-muted">
                        {v.items.length} {v.items.length === 1 ? 'ítem' : 'ítems'}
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center gap-1.5 capitalize text-text-muted">
                          {metodoPagoIcon[v.metodo_pago]}
                          {v.metodo_pago.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={est.variant} size="sm">
                          {est.label}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-right font-bold text-text">
                        {fmt(v.total)}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="p-1 h-7 w-7"
                            onClick={() => onVerDetalle(v)}
                            title="Ver desglose completo"
                          >
                            <Eye className="w-3.5 h-3.5 text-text-muted" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="p-1 h-7 w-7"
                            onClick={() => onVerTicket(v)}
                            title="Imprimir ticket térmico"
                          >
                            <Printer className="w-3.5 h-3.5 text-text-muted" />
                          </Button>
                          {v.estado === 'PAID' && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="p-1 h-7 w-7 text-amber-600 hover:text-amber-700 hover:bg-amber-50 dark:hover:bg-amber-950/30"
                              onClick={() => onDevolucion(v)}
                              title="Procesar devolución"
                            >
                              <RotateCcw className="w-3.5 h-3.5" />
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Paginación */}
        {totalPaginas > 1 && (
          <div className="p-3 border-t border-border flex justify-end">
            <Pagination
              currentPage={pagina}
              totalPages={totalPaginas}
              onPageChange={setPagina}
            />
          </div>
        )}
      </div>
    </div>
  )
}
