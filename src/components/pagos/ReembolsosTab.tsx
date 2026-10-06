import { useState } from 'react'
import type { Reembolso, Factura } from '@/types'
import { Badge, Modal, Button, Textarea } from '@/components/ui'

export interface ReembolsosTabProps {
  reembolsos: Reembolso[]
  facturaParaReembolso: Factura | null
  modalReembolsoAbierto: boolean
  onCerrarModal: () => void
  onConfirmarReembolso: (factura: Factura, motivo: string) => Promise<void>
}

export function ReembolsosTab({
  reembolsos,
  facturaParaReembolso,
  modalReembolsoAbierto,
  onCerrarModal,
  onConfirmarReembolso,
}: ReembolsosTabProps) {
  const [motivo, setMotivo] = useState('')
  const [procesando, setProcesando] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!facturaParaReembolso || !motivo.trim()) return

    setProcesando(true)
    try {
      await onConfirmarReembolso(facturaParaReembolso, motivo)
      setMotivo('')
    } finally {
      setProcesando(false)
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-bold text-text">Registro de Devoluciones y Reembolsos</h3>
        <p className="text-xs text-text-muted">Historial auditado de devoluciones monetarias vinculadas a cancelaciones.</p>
      </div>

      <div className="rounded-xl border border-border bg-surface shadow-xs overflow-hidden">
        {reembolsos.length === 0 ? (
          <div className="py-12 text-center text-text-muted text-xs">
            No hay reembolsos procesados en el sistema.
          </div>
        ) : (
          <div className="divide-y divide-border">
            {reembolsos.map((r) => (
              <div
                key={r.id}
                className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs hover:bg-secondary-soft/40 transition-colors"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-text">
                      Reembolso a {r.cliente_nombre ?? 'Cliente'}
                    </span>
                    <Badge variant="success" size="sm" dot>
                      {r.estado}
                    </Badge>
                  </div>
                  <p className="text-text-muted mt-0.5">
                    Factura #{r.factura_numero} • Motivo: "{r.motivo}"
                  </p>
                  <p className="text-[11px] text-text-muted mt-0.5">
                    {new Date(r.created_at).toLocaleString('es-ES')}
                  </p>
                </div>

                <span className="text-base font-extrabold text-red-600 dark:text-red-400">
                  -${r.monto.toFixed(2)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal Confirmación de Reembolso */}
      {modalReembolsoAbierto && facturaParaReembolso && (
        <Modal
          isOpen={modalReembolsoAbierto}
          onClose={onCerrarModal}
          title={`Emitir Reembolso — ${facturaParaReembolso.numero}`}
        >
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div className="p-3.5 rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/40 text-text space-y-1">
              <span className="font-semibold block text-red-800 dark:text-red-300">
                Se devolverán ${facturaParaReembolso.total.toFixed(2)}
              </span>
              <p className="text-red-700 dark:text-red-400 text-[11px]">
                Esta acción registrará un egreso en la sesión de caja y marcará la factura como 'reembolsada'.
              </p>
            </div>

            <div>
              <label className="text-xs font-medium text-text block mb-1">
                Motivo / Justificación de la Devolución *
              </label>
              <Textarea
                rows={3}
                placeholder="Ej. Cancelación por fuerza mayor del cliente..."
                value={motivo}
                onChange={(e) => setMotivo(e.target.value)}
                required
                autoFocus
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-border">
              <Button variant="ghost" size="sm" type="button" onClick={onCerrarModal} disabled={procesando}>
                Cancelar
              </Button>
              <Button variant="danger" size="sm" type="submit" disabled={procesando || !motivo.trim()}>
                Confirmar Reembolso
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  )
}
