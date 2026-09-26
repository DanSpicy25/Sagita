import { Printer, Calendar, User, CreditCard, RotateCcw } from 'lucide-react'
import { Factura } from '@/types'
import { Modal, Badge, Button } from '@/components/ui'

interface FacturaModalProps {
  factura: Factura | null
  isOpen: boolean
  onClose: () => void
  onSolicitarReembolso?: (factura: Factura) => void
}

const estadoBadges = {
  pagada: { variant: 'success' as const, label: 'Pagada' },
  pendiente: { variant: 'warning' as const, label: 'Pendiente de Pago' },
  reembolsada: { variant: 'danger' as const, label: 'Reembolsada' },
}

export function FacturaModal({
  factura,
  isOpen,
  onClose,
  onSolicitarReembolso,
}: FacturaModalProps) {
  if (!factura) return null

  const handleImprimir = () => {
    window.print()
  }

  const badge = estadoBadges[factura.estado] ?? { variant: 'default' as const, label: factura.estado }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="lg"
      title={`Factura de Servicio #${factura.numero}`}
      footer={
        <div className="flex items-center justify-between w-full print:hidden">
          <div>
            {factura.estado === 'pagada' && onSolicitarReembolso && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onSolicitarReembolso(factura)}
                leftIcon={<RotateCcw className="w-4 h-4 text-amber-500" />}
              >
                Solicitar Reembolso
              </Button>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={handleImprimir}
              leftIcon={<Printer className="w-4 h-4" />}
            >
              Imprimir Comprobante
            </Button>
            <Button size="sm" onClick={onClose}>
              Cerrar
            </Button>
          </div>
        </div>
      }
    >
      <div className="space-y-6 text-sm print:p-0">
        {/* Cabecera Factura */}
        <div className="flex items-start justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
          <div>
            <h3 className="font-extrabold text-xl text-primary-600 tracking-tight">
              Sagitta
            </h3>
            <p className="text-xs text-slate-400">Sistema de Reservas y Gestión Médica</p>
            <p className="text-[11px] text-slate-400 mt-1">RFC / CIF: B-98765432</p>
          </div>

          <div className="text-right">
            <Badge variant={badge.variant} dot>
              {badge.label}
            </Badge>
            <p className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-2">
              Nº {factura.numero}
            </p>
            <p className="text-[11px] text-slate-400">
              Fecha: {new Date(factura.created_at).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })}
            </p>
          </div>
        </div>

        {/* Datos Cliente y Método */}
        <div className="grid grid-cols-2 gap-4 text-xs bg-slate-50 dark:bg-slate-800/40 p-3.5 rounded-xl">
          <div>
            <p className="font-semibold text-slate-400 uppercase tracking-wider text-[10px] mb-1">
              Facturado A
            </p>
            <p className="font-bold text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-primary-500" />
              {factura.cliente?.nombre ?? 'Cliente Registrado'}
            </p>
            <p className="text-slate-500 mt-0.5">{factura.cliente?.email}</p>
            {factura.cliente?.telefono && (
              <p className="text-slate-500">{factura.cliente.telefono}</p>
            )}
          </div>

          <div>
            <p className="font-semibold text-slate-400 uppercase tracking-wider text-[10px] mb-1">
              Método de Pago
            </p>
            <p className="font-bold text-slate-800 dark:text-slate-100 flex items-center gap-1.5 capitalize">
              <CreditCard className="w-3.5 h-3.5 text-primary-500" />
              {factura.metodo_pago}
            </p>
            <p className="text-slate-400 mt-0.5 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              Emitido a las {new Date(factura.created_at).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>
        </div>

        {/* Tabla de Conceptos */}
        <div>
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700 text-slate-400 font-semibold uppercase">
                <th className="py-2">Concepto / Servicio</th>
                <th className="py-2 text-center">Cant.</th>
                <th className="py-2 text-right">Precio Unit.</th>
                <th className="py-2 text-right">Importe</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {factura.items.map((item, idx) => (
                <tr key={idx} className="text-slate-700 dark:text-slate-300">
                  <td className="py-2.5 font-medium">{item.descripcion}</td>
                  <td className="py-2.5 text-center text-slate-500">{item.cantidad}</td>
                  <td className="py-2.5 text-right text-slate-500">${item.precio_unitario}</td>
                  <td className="py-2.5 text-right font-bold text-slate-900 dark:text-slate-100">
                    ${item.total}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Desglose Totales */}
        <div className="flex justify-end pt-2 border-t border-slate-100 dark:border-slate-800">
          <div className="w-64 space-y-1.5 text-xs">
            <div className="flex items-center justify-between text-slate-500">
              <span>Subtotal</span>
              <span>${factura.subtotal}</span>
            </div>

            {factura.descuento > 0 && (
              <div className="flex items-center justify-between text-emerald-600 dark:text-emerald-400 font-medium">
                <span>Descuento {factura.cupon_aplicado ? `(${factura.cupon_aplicado})` : ''}</span>
                <span>-${factura.descuento}</span>
              </div>
            )}

            <div className="flex items-center justify-between text-base font-black text-slate-900 dark:text-slate-100 pt-2 border-t border-slate-200 dark:border-slate-700">
              <span>Total Factura</span>
              <span className="text-primary-600 dark:text-primary-400">${factura.total}</span>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  )
}

