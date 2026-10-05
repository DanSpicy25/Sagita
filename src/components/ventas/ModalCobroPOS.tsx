import React, { useState } from 'react'
import {
  Banknote,
  CreditCard,
  ArrowLeftRight,
  Gift,
  Smartphone,
  CheckCircle2,
} from 'lucide-react'
import { MetodoPagoVenta, PagoSplit, GiftCard } from '@/types'
import { LocalStorageAdapter } from '@/repositories/local/LocalStorageAdapter'
import { Modal, Button, Input, Badge } from '@/components/ui'
import { useToast } from '@/hooks/useToast'

export interface ModalCobroPOSProps {
  isOpen: boolean
  onClose: () => void
  total: number
  subtotal: number
  descuento: number
  onConfirmar: (metodo: MetodoPagoVenta, pagosSplit?: PagoSplit[], propina?: number) => Promise<void>
}

const METODOS: { id: MetodoPagoVenta; label: string; icon: React.ReactNode }[] = [
  { id: 'efectivo', label: 'Efectivo', icon: <Banknote className="w-4 h-4" /> },
  { id: 'tarjeta', label: 'Tarjeta Débito/Crédito', icon: <CreditCard className="w-4 h-4" /> },
  { id: 'transferencia', label: 'Transferencia Bancaria', icon: <ArrowLeftRight className="w-4 h-4" /> },
  { id: 'pago_movil', label: 'Pago Móvil / QR', icon: <Smartphone className="w-4 h-4" /> },
  { id: 'gift_card', label: 'Gift Card / Canje', icon: <Gift className="w-4 h-4" /> },
]

export function ModalCobroPOS({
  isOpen,
  onClose,
  total,
  subtotal,
  descuento,
  onConfirmar,
}: ModalCobroPOSProps) {
  const [metodoSeleccionado, setMetodoSeleccionado] = useState<MetodoPagoVenta>('efectivo')
  const [montoRecibido, setMontoRecibido] = useState<string>(String(total))
  const [propina, setPropina] = useState<number>(0)
  const [codigoGiftCard, setCodigoGiftCard] = useState('')
  const [giftCardValidada, setGiftCardValidada] = useState<GiftCard | null>(null)
  const [procesando, setProcesando] = useState(false)

  const { toast } = useToast()

  const totalConPropina = total + propina
  const vuelto =
    metodoSeleccionado === 'efectivo' && Number(montoRecibido) >= totalConPropina
      ? Number(montoRecibido) - totalConPropina
      : 0

  const handleValidarGiftCard = () => {
    if (!codigoGiftCard.trim()) return
    const cards = LocalStorageAdapter.get<GiftCard[]>('gift_cards', [])
    const found = cards.find(
      (c: GiftCard) => c.codigo.toUpperCase() === codigoGiftCard.trim().toUpperCase() && c.estado === 'activa'
    )

    if (found) {
      if (found.saldo_actual <= 0) {
        toast.error('Tarjeta Agotada', 'Esta tarjeta no tiene saldo disponible')
        setGiftCardValidada(null)
      } else {
        setGiftCardValidada(found)
        toast.success('Tarjeta Válida', `Saldo disponible: $${found.saldo_actual.toLocaleString()}`)
      }
    } else {
      toast.error('Código Inválido', 'No se encontró una tarjeta activa con ese código')
      setGiftCardValidada(null)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (metodoSeleccionado === 'efectivo' && Number(montoRecibido) < totalConPropina) {
      toast.warning('Monto Insuficiente', 'El monto entregado es menor al total a pagar')
      return
    }

    if (metodoSeleccionado === 'gift_card') {
      if (!giftCardValidada) {
        toast.warning('Valida la Tarjeta', 'Ingresa y valida el código de la tarjeta primero')
        return
      }
      if (giftCardValidada.saldo_actual < totalConPropina) {
        toast.warning('Saldo Insuficiente', 'El saldo de la Gift Card no cubre el total de la venta')
        return
      }
    }

    setProcesando(true)
    try {
      let splits: PagoSplit[] | undefined = undefined

      if (metodoSeleccionado === 'gift_card' && giftCardValidada) {
        // Descontar saldo de la tarjeta
        const cards = LocalStorageAdapter.get<GiftCard[]>('gift_cards', [])
        const saldoRestante = giftCardValidada.saldo_actual - totalConPropina
        const actualizadas = cards.map((c: GiftCard) =>
          c.id === giftCardValidada.id
            ? {
                ...c,
                saldo_actual: saldoRestante,
                estado: (saldoRestante <= 0 ? 'agotada' : 'activa') as 'activa' | 'agotada',
                movimientos: [
                  ...c.movimientos,
                  {
                    id: `mov-${Date.now()}`,
                    tipo: 'consumo' as const,
                    monto: totalConPropina,
                    saldo_resultante: saldoRestante,
                    referencia: 'Pago POS en Terminal',
                    fecha: new Date().toISOString().slice(0, 10),
                  },
                ],
              }
            : c
        )
        LocalStorageAdapter.set('gift_cards', actualizadas)

        splits = [
          {
            metodo: 'gift_card',
            monto: totalConPropina,
            gift_card_codigo: giftCardValidada.codigo,
          },
        ]
      }

      await onConfirmar(metodoSeleccionado, splits, propina > 0 ? propina : undefined)
      onClose()
    } catch {
      toast.error('Error al cobrar', 'Ocurrió un error al procesar el pago')
    } finally {
      setProcesando(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={() => !procesando && onClose()} title="Finalizar Cobro en POS">
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        {/* Resumen de Cuenta */}
        <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-1.5">
          <div className="flex justify-between text-slate-500">
            <span>Subtotal:</span>
            <span>${subtotal.toLocaleString()}</span>
          </div>
          {descuento > 0 && (
            <div className="flex justify-between text-emerald-600 font-medium">
              <span>Descuento aplicado:</span>
              <span>-${descuento.toLocaleString()}</span>
            </div>
          )}
          {propina > 0 && (
            <div className="flex justify-between text-primary-600 font-medium">
              <span>Propina / Agradecimiento:</span>
              <span>+${propina.toLocaleString()}</span>
            </div>
          )}
          <div className="flex justify-between font-black text-lg text-slate-900 dark:text-slate-100 pt-2 border-t border-slate-200 dark:border-slate-700">
            <span>Total a Cobrar:</span>
            <span>${totalConPropina.toLocaleString()}</span>
          </div>
        </div>

        {/* Métodos de Pago */}
        <div>
          <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-2">
            Selecciona Medio de Pago
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {METODOS.map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => setMetodoSeleccionado(m.id)}
                className={`p-2.5 rounded-xl border flex flex-col items-center gap-1 text-center transition-all cursor-pointer ${
                  metodoSeleccionado === m.id
                    ? 'border-primary-600 bg-primary-50/50 dark:bg-primary-950/30 text-primary-700 dark:text-primary-300 font-bold shadow-sm'
                    : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400'
                }`}
              >
                {m.icon}
                <span className="text-[11px] leading-tight">{m.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Campo Efectivo / Vuelto */}
        {metodoSeleccionado === 'efectivo' && (
          <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2">
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Monto Entregado ($)"
                type="number"
                value={montoRecibido}
                onChange={(e) => setMontoRecibido(e.target.value)}
                min={1}
                required
              />
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Vuelto a Entregar
                </label>
                <div className="px-3 py-2 text-base font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50/50 dark:bg-emerald-950/30 rounded-xl border border-emerald-200 dark:border-emerald-800">
                  ${vuelto.toLocaleString()}
                </div>
              </div>
            </div>

            {/* Botones Rápidos de Billetes para Pantallas Táctiles / Tablets */}
            <div className="flex flex-wrap items-center gap-1.5 pt-1 border-t border-slate-100 dark:border-slate-800">
              <span className="text-[11px] font-semibold text-slate-400">Rápido:</span>
              <button
                type="button"
                onClick={() => setMontoRecibido(String(totalConPropina))}
                className="px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-[11px] font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 cursor-pointer"
              >
                Exacto (${totalConPropina.toLocaleString()})
              </button>
              {[10, 20, 50, 100].map((b) => (
                <button
                  key={b}
                  type="button"
                  onClick={() => setMontoRecibido(String(b))}
                  className="px-2 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-[11px] font-bold text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 dark:hover:bg-emerald-900 cursor-pointer"
                >
                  ${b}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Campo Gift Card */}
        {metodoSeleccionado === 'gift_card' && (
          <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2">
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
              Código de Tarjeta de Regalo
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Ej. GIFT-2026-VAL"
                value={codigoGiftCard}
                onChange={(e) => setCodigoGiftCard(e.target.value.toUpperCase())}
                className="flex-1 px-3 py-2 font-mono text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 uppercase"
              />
              <Button type="button" variant="secondary" onClick={handleValidarGiftCard}>
                Validar
              </Button>
            </div>
            {giftCardValidada && (
              <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/30 rounded-lg text-emerald-700 dark:text-emerald-300 flex items-center justify-between text-xs">
                <span>Saldo disponible: ${giftCardValidada.saldo_actual.toLocaleString()}</span>
                <Badge variant="success" size="sm">
                  Lista para Canjear
                </Badge>
              </div>
            )}
          </div>
        )}

        {/* Propina */}
        <div className="flex items-center justify-between pt-2">
          <span className="text-slate-500 font-medium">Añadir Propina ($):</span>
          <div className="flex gap-1.5">
            {[0, 1000, 2000, 5000].map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setPropina(m)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors ${
                  propina === m
                    ? 'bg-primary-600 text-white'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                }`}
              >
                {m === 0 ? 'Sin propina' : `+$${m}`}
              </button>
            ))}
          </div>
        </div>

        {/* Acciones */}
        <div className="flex justify-end gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
          <Button variant="ghost" type="button" onClick={onClose} disabled={procesando}>
            Cancelar
          </Button>
          <Button
            type="submit"
            loading={procesando}
            leftIcon={<CheckCircle2 className="w-4 h-4" />}
          >
            Confirmar Pago (${totalConPropina.toLocaleString()})
          </Button>
        </div>
      </form>
    </Modal>
  )
}
