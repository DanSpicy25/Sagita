import { useState, useMemo } from 'react'
import { Eye, RotateCcw, Search } from 'lucide-react'
import type { Factura } from '@/types'
import { Button, Badge } from '@/components/ui'

export interface FacturasTabProps {
  facturas: Factura[]
  onVerFactura: (factura: Factura) => void
  onReembolsarFactura: (factura: Factura) => void
}

export function FacturasTab({
  facturas,
  onVerFactura,
  onReembolsarFactura,
}: FacturasTabProps) {
  const [busqueda, setBusqueda] = useState('')
  const [filtroEstado, setFiltroEstado] = useState<string>('todos')

  const facturasFiltradas = useMemo(() => {
    return facturas.filter((f) => {
      const matchBusqueda =
        !busqueda ||
        f.numero.toLowerCase().includes(busqueda.toLowerCase()) ||
        (f.cliente?.nombre ?? '').toLowerCase().includes(busqueda.toLowerCase())
      const matchEstado = filtroEstado === 'todos' || f.estado === filtroEstado
      return matchBusqueda && matchEstado
    })
  }, [facturas, busqueda, filtroEstado])

  return (
    <div className="space-y-4">
      {/* Barra de Filtros */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
          <input
            type="text"
            placeholder="Buscar por número de factura o cliente..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-border bg-surface text-text focus:outline-hidden focus:ring-1 focus:ring-primary"
          />
        </div>

        <select
          value={filtroEstado}
          onChange={(e) => setFiltroEstado(e.target.value)}
          className="text-xs px-3 py-2 rounded-xl border border-border bg-surface text-text focus:outline-hidden"
        >
          <option value="todos">Todos los estados</option>
          <option value="pagada">Pagadas</option>
          <option value="pendiente">Pendientes</option>
          <option value="reembolsada">Reembolsadas</option>
        </select>
      </div>

      {/* Tabla de Facturas */}
      <div className="rounded-xl border border-border bg-surface shadow-xs overflow-hidden">
        {facturasFiltradas.length === 0 ? (
          <div className="py-12 text-center text-text-muted text-xs">
            No se encontraron comprobantes ni facturas registradas.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-surface-raised border-b border-border text-text-muted font-semibold uppercase">
                <tr>
                  <th className="py-3 px-4">Número</th>
                  <th className="py-3 px-4">Cliente</th>
                  <th className="py-3 px-4">Fecha Emisión</th>
                  <th className="py-3 px-4">Método</th>
                  <th className="py-3 px-4">Estado</th>
                  <th className="py-3 px-4 text-right">Total</th>
                  <th className="py-3 px-4 text-center">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border text-text">
                {facturasFiltradas.map((f) => (
                  <tr key={f.id} className="hover:bg-secondary-soft/50 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-primary">
                      {f.numero}
                    </td>
                    <td className="py-3 px-4 font-medium">
                      {f.cliente?.nombre ?? 'Cliente de Mostrador'}
                    </td>
                    <td className="py-3 px-4 text-text-muted whitespace-nowrap">
                      {new Date(f.created_at).toLocaleDateString('es-ES', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </td>
                    <td className="py-3 px-4 capitalize text-text-muted">{f.metodo_pago}</td>
                    <td className="py-3 px-4">
                      <Badge
                        variant={
                          f.estado === 'pagada'
                            ? 'success'
                            : f.estado === 'reembolsada'
                            ? 'danger'
                            : 'warning'
                        }
                        size="sm"
                        dot
                      >
                        {f.estado}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-text">
                      ${f.total.toFixed(2)}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onVerFactura(f)}
                          className="h-7 px-2.5 text-xs"
                        >
                          <Eye className="w-3.5 h-3.5 mr-1" />
                          Ver
                        </Button>
                        {f.estado === 'pagada' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onReembolsarFactura(f)}
                            className="h-7 px-2 text-xs text-amber-600 hover:text-amber-700 hover:bg-amber-50 dark:hover:bg-amber-950/30"
                          >
                            <RotateCcw className="w-3.5 h-3.5 mr-1" />
                            Reembolsar
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
