import React, { useState } from 'react'
import {
  RotateCcw,
  AlertTriangle,
} from 'lucide-react'
import { Venta } from '@/types'
import { ventasService } from '@/services/ventas.service'
import { inventarioService } from '@/services/inventario.service'
import { Modal, Button, Textarea } from '@/components/ui'
import { useToast } from '@/hooks/useToast'

export interface ModalDevolucionVentaProps {
  venta: Venta | null
  isOpen: boolean
  onClose: () => void
  onDevolucionExitosa: () => void
}

export function ModalDevolucionVenta({
  venta,
  isOpen,
  onClose,
  onDevolucionExitosa,
}: ModalDevolucionVentaProps) {
  const [itemsSeleccionados, setItemsSeleccionados] = useState<string[]>([])
  const [reintegrarStock, setReintegrarStock] = useState(true)
  const [motivo, setMotivo] = useState('')
  const [procesando, setProcesando] = useState(false)

  const { toast } = useToast()

  if (!venta) return null

  const toggleItem = (itemId: string) => {
    setItemsSeleccionados((prev) =>
      prev.includes(itemId) ? prev.filter((id) => id !== itemId) : [...prev, itemId]
    )
  }

  const itemsADevolver = venta.items.filter((i) =>
    itemsSeleccionados.length === 0 ? true : itemsSeleccionados.includes(i.id)
  )

  const montoDevolucion = itemsADevolver.reduce((acc, i) => acc + i.total, 0)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!motivo.trim()) {
      toast.warning('Motivo requerido', 'Por favor ingresa la razón de la devolución o nota de crédito')
      return
    }

    setProcesando(true)
    try {
      // 1. Si hay productos de retail y se marcó reintegrar stock, devolver al inventario
      if (reintegrarStock) {
        for (const item of itemsADevolver) {
          if (item.tipo === 'producto') {
            await inventarioService.registrarMovimiento({
              producto_id: item.referencia_id,
              tipo: 'RETURN',
              cantidad: item.cantidad,
              motivo: `Devolución de Venta #${venta.numero}: ${motivo}`,
            })
          }
        }
      }

      // 2. Procesar reembolso en ventasService
      await ventasService.reembolsarVenta(venta.id, motivo.trim())

      toast.success(
        'Devolución procesada',
        `Se devolvieron $${montoDevolucion.toLocaleString()} de la venta #${venta.numero}`
      )
      onDevolucionExitosa()
      onClose()
    } catch {
      toast.error('Error al devolver', 'No se pudo procesar la nota de crédito')
    } finally {
      setProcesando(false)
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => !procesando && onClose()}
      title={`Devolución / Nota de Crédito — ${venta.numero}`}
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        <div className="p-3 bg-amber-50 dark:bg-amber-950/30 rounded-xl border border-amber-200 dark:border-amber-900/40 text-amber-800 dark:text-amber-300 flex items-start gap-2.5">
          <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5 text-amber-600" />
          <p>
            Esta acción registrará la anulación/devolución contable de la venta y generará un movimiento de egreso en caja.
          </p>
        </div>

        {/* Selección de ítems */}
        <div>
          <span className="block font-semibold text-slate-700 dark:text-slate-300 mb-2">
            Ítems de la Venta ({venta.items.length})
          </span>
          <div className="space-y-1.5 max-h-48 overflow-y-auto">
            {venta.items.map((item) => (
              <label
                key={item.id}
                className="flex items-center justify-between p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={itemsSeleccionados.length === 0 || itemsSeleccionados.includes(item.id)}
                    onChange={() => toggleItem(item.id)}
                    className="w-3.5 h-3.5 text-primary-600 rounded cursor-pointer"
                  />
                  <div>
                    <span className="font-medium text-slate-800 dark:text-slate-200">
                      {item.nombre}
                    </span>
                    <span className="ml-2 text-[10px] text-slate-400">
                      x{item.cantidad} ({item.tipo})
                    </span>
                  </div>
                </div>
                <span className="font-bold text-slate-900 dark:text-slate-100">
                  ${item.total.toLocaleString()}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Opción Reintegrar Stock */}
        <div className="flex items-center gap-2 p-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl">
          <input
            type="checkbox"
            id="reintegrar-stock"
            checked={reintegrarStock}
            onChange={(e) => setReintegrarStock(e.target.checked)}
            className="w-4 h-4 text-primary-600 rounded cursor-pointer"
          />
          <label
            htmlFor="reintegrar-stock"
            className="text-slate-700 dark:text-slate-300 font-medium cursor-pointer"
          >
            Reintegrar unidades físicas de productos devueltos al almacén
          </label>
        </div>

        {/* Motivo */}
        <Textarea
          label="Motivo de la Devolución *"
          placeholder="Ej: Inconformidad con el servicio, producto dañado, error de cobro..."
          value={motivo}
          onChange={(e) => setMotivo(e.target.value)}
          rows={2}
          required
        />

        {/* Resumen Total */}
        <div className="flex justify-between items-center p-3 bg-red-50 dark:bg-red-950/20 rounded-xl text-red-700 dark:text-red-300">
          <span className="font-medium">Total a Reembolsar:</span>
          <span className="text-base font-black">${montoDevolucion.toLocaleString()}</span>
        </div>

        {/* Acciones */}
        <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
          <Button variant="ghost" type="button" onClick={onClose} disabled={procesando}>
            Cancelar
          </Button>
          <Button
            variant="danger"
            type="submit"
            loading={procesando}
            leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
          >
            Confirmar Devolución
          </Button>
        </div>
      </form>
    </Modal>
  )
}
