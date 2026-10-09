import { Link } from 'react-router-dom'
import {
  AlertTriangle,
  Package,
  Receipt,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react'
import { AlertaStock, Factura, Producto } from '@/types'
import { Badge } from '@/components/ui'

export interface WidgetAlertasOperativasProps {
  alertasStock: AlertaStock[]
  productosBajoStock: Producto[]
  facturasPendientes: Factura[]
}

export function WidgetAlertasOperativas({
  alertasStock,
  productosBajoStock,
  facturasPendientes,
}: WidgetAlertasOperativasProps) {
  const hayStockCritico =
    alertasStock.length > 0 || productosBajoStock.length > 0
  const hayFacturasPendientes = facturasPendientes.length > 0
  const totalAlertas =
    (hayStockCritico ? productosBajoStock.length || alertasStock.length : 0) +
    (hayFacturasPendientes ? facturasPendientes.length : 0)

  return (
    <div className="rounded-2xl bg-surface border border-border shadow-xs overflow-hidden flex flex-col">
      {/* ── Header ── */}
      <div className="p-4 sm:p-5 border-b border-border flex items-center justify-between gap-3 bg-surface-subtle/30">
        <div className="flex items-center gap-2.5">
          <div
            className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border ${
              totalAlertas > 0
                ? 'bg-danger-soft text-danger border-danger/20'
                : 'bg-success-soft text-success border-success/20'
            }`}
          >
            {totalAlertas > 0 ? (
              <AlertTriangle className="w-4 h-4" />
            ) : (
              <CheckCircle2 className="w-4 h-4" />
            )}
          </div>
          <div>
            <h2 className="text-sm sm:text-base font-bold font-heading text-text leading-tight">
              Alertas Operativas
            </h2>
            <span className="text-[11px] text-text-muted">
              {totalAlertas > 0
                ? `${totalAlertas} puntos requieren tu atención`
                : 'Sin incidencias críticas'}
            </span>
          </div>
        </div>

        {totalAlertas > 0 && (
          <Badge variant="error" size="sm">
            {totalAlertas} {totalAlertas === 1 ? 'Alerta' : 'Alertas'}
          </Badge>
        )}
      </div>

      {/* ── Body ── */}
      <div className="p-4 flex-1 space-y-3">
        {totalAlertas === 0 ? (
          <div className="py-6 text-center text-text-muted space-y-1.5">
            <CheckCircle2 className="w-8 h-8 mx-auto text-success/60" />
            <p className="text-xs font-semibold text-text">
              Operación al día
            </p>
            <p className="text-[11px] text-text-muted">
              Niveles de inventario estables y sin facturas vencidas.
            </p>
          </div>
        ) : (
          <>
            {/* 1. Alertas de Stock Crítico */}
            {hayStockCritico && (
              <div className="p-3 rounded-xl bg-danger-soft/30 border border-danger/20 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-danger flex items-center gap-1.5">
                    <Package className="w-3.5 h-3.5" />
                    Inventario bajo mínimo
                  </span>
                  <Link
                    to="/inventario"
                    className="text-[11px] font-semibold text-danger hover:underline inline-flex items-center gap-0.5"
                  >
                    <span>Reponer</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>

                <div className="space-y-1.5 text-xs">
                  {productosBajoStock.slice(0, 3).map((p) => (
                    <div
                      key={p.id}
                      className="flex items-center justify-between gap-2 text-text"
                    >
                      <span className="truncate text-xs font-medium">
                        {p.nombre}
                      </span>
                      <span className="font-mono text-[11px] text-danger font-semibold shrink-0">
                        {p.stock_actual} / min {p.stock_minimo}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 2. Facturas Pendientes de Cobro */}
            {hayFacturasPendientes && (
              <div className="p-3 rounded-xl bg-warning-soft/30 border border-warning/20 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-warning-hover flex items-center gap-1.5">
                    <Receipt className="w-3.5 h-3.5 text-warning" />
                    Comprobantes por cobrar
                  </span>
                  <Link
                    to="/finanzas"
                    className="text-[11px] font-semibold text-text hover:underline inline-flex items-center gap-0.5"
                  >
                    <span>Gestionar</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>

                <div className="space-y-1.5 text-xs">
                  {facturasPendientes.slice(0, 2).map((f) => (
                    <div
                      key={f.id}
                      className="flex items-center justify-between gap-2 text-text"
                    >
                      <span className="truncate text-xs text-text-muted">
                        Folio #{f.numero || f.id} • {f.cliente?.nombre || 'Cliente'}
                      </span>
                      <span className="font-mono text-xs font-semibold text-text shrink-0">
                        ${f.total}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

