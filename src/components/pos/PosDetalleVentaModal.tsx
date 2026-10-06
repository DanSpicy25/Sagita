import { Printer } from 'lucide-react'
import type { Venta, EstadoVenta } from '@/types'
import { Modal, Button, Badge } from '@/components/ui'

const fmt = (n: number) => `$${n.toFixed(2)}`

const estadoVentaBadge: Record<EstadoVenta, { variant: 'success' | 'warning' | 'danger' | 'default' | 'primary'; label: string }> = {
  PAID:      { variant: 'success', label: 'Pagada' },
  PENDING:   { variant: 'warning', label: 'Pendiente' },
  DRAFT:     { variant: 'default', label: 'Borrador' },
  CANCELLED: { variant: 'danger',  label: 'Cancelada' },
  REFUNDED:  { variant: 'primary', label: 'Reembolsada' },
}

export interface PosDetalleVentaModalProps {
  venta: Venta | null
  onClose: () => void
  onImprimirTicket: (venta: Venta) => void
}

export function PosDetalleVentaModal({
  venta,
  onClose,
  onImprimirTicket,
}: PosDetalleVentaModalProps) {
  if (!venta) return null

  const est = estadoVentaBadge[venta.estado] || { variant: 'default', label: venta.estado }

  return (
    <Modal
      isOpen={!!venta}
      onClose={onClose}
      title={`Detalle de Venta — ${venta.numero}`}
    >
      <div className="space-y-4 text-xs">
        {/* Cabecera de la Venta */}
        <div className="p-3.5 rounded-xl bg-secondary-soft text-text flex items-center justify-between">
          <div>
            <span className="font-semibold text-sm block">
              {venta.cliente?.nombre || 'Venta de Mostrador'}
            </span>
            <span className="text-text-muted">
              {new Date(venta.created_at).toLocaleString()} • Método: {venta.metodo_pago.replace('_', ' ')}
            </span>
          </div>
          <div className="text-right">
            <span className="text-lg font-bold text-primary block">{fmt(venta.total)}</span>
            <Badge variant={est.variant} size="sm">
              {est.label}
            </Badge>
          </div>
        </div>

        {/* Tabla de Ítems */}
        <div>
          <h4 className="font-semibold text-text mb-1.5">Ítems Cobrados ({venta.items.length})</h4>
          <div className="border border-border rounded-lg overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-surface-raised border-b border-border text-text-muted">
                <tr>
                  <th className="px-3 py-2">Concepto</th>
                  <th className="px-3 py-2 text-center">Cant.</th>
                  <th className="px-3 py-2 text-right">P. Unit.</th>
                  <th className="px-3 py-2 text-right">Subtotal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {venta.items.map((i) => (
                  <tr key={i.id}>
                    <td className="px-3 py-2">
                      <span className="font-medium text-text block">{i.nombre}</span>
                      {i.profesional_nombre && (
                        <span className="text-[10px] text-text-muted">
                          Atendido por: {i.profesional_nombre}
                        </span>
                      )}
                    </td>
                    <td className="px-3 py-2 text-center text-text">{i.cantidad}</td>
                    <td className="px-3 py-2 text-right text-text-muted">{fmt(i.precio_unitario)}</td>
                    <td className="px-3 py-2 text-right font-bold text-text">{fmt(i.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Desglose de Totales */}
        <div className="space-y-1.5 pt-2 border-t border-border">
          <div className="flex justify-between text-text-muted">
            <span>Subtotal</span>
            <span className="font-medium text-text">{fmt(venta.subtotal)}</span>
          </div>
          {venta.descuento_global > 0 && (
            <div className="flex justify-between text-text-muted">
              <span>Descuento Aplicado</span>
              <span className="text-emerald-600 font-medium">-{venta.descuento_global}%</span>
            </div>
          )}
          <div className="flex justify-between text-text-muted">
            <span>Impuestos (IVA)</span>
            <span className="font-medium text-text">{fmt(venta.impuesto)}</span>
          </div>
          {venta.propina !== undefined && venta.propina > 0 && (
            <div className="flex justify-between text-text-muted">
              <span>Propina / Gratificación</span>
              <span className="font-medium text-text">+{fmt(venta.propina)}</span>
            </div>
          )}
          <div className="flex justify-between text-text pt-1.5 border-t border-border font-bold text-sm">
            <span>Total Transacción</span>
            <span className="text-primary">{fmt(venta.total)}</span>
          </div>
        </div>

        {/* Pagos Divididos (Split) */}
        {venta.pagos_split && venta.pagos_split.length > 0 && (
          <div className="p-2.5 rounded-lg border border-border">
            <span className="font-semibold block mb-1 text-text">Desglose de Pago Fraccionado</span>
            <div className="space-y-1">
              {venta.pagos_split.map((p, idx) => (
                <div key={idx} className="flex justify-between text-text-muted">
                  <span className="capitalize">{p.metodo.replace('_', ' ')}</span>
                  <span className="font-medium text-text">{fmt(p.monto)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Acciones */}
        <div className="flex justify-between items-center pt-2 border-t border-border">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              onImprimirTicket(venta)
              onClose()
            }}
          >
            <Printer className="w-3.5 h-3.5 mr-1.5" />
            Ticket Térmico
          </Button>

          <Button variant="ghost" size="sm" onClick={onClose}>
            Cerrar
          </Button>
        </div>
      </div>
    </Modal>
  )
}
