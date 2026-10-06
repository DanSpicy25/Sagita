import { useState } from 'react'
import {
  LockKeyhole,
  Unlock,
  ArrowDownCircle,
  ArrowUpCircle,
} from 'lucide-react'
import type { SesionCaja } from '@/types'
import { Button, Modal, Input, Badge } from '@/components/ui'

const fmt = (n: number) => `$${n.toFixed(2)}`

export interface PosCajaControlProps {
  sesion: SesionCaja | null
  cargando: boolean
  onAbrirCaja: (monto: number) => Promise<void>
  onCerrarCaja: (montoFinal: number) => Promise<void>
  onRegistrarMovimiento: (tipo: 'ingreso' | 'egreso', monto: number, descripcion: string) => Promise<void>
}

export function PosCajaControl({
  sesion,
  cargando,
  onAbrirCaja,
  onCerrarCaja,
  onRegistrarMovimiento,
}: PosCajaControlProps) {
  const [modalAbrir, setModalAbrir] = useState(false)
  const [montoApertura, setMontoApertura] = useState('')
  const [modalCierre, setModalCierre] = useState(false)
  const [montoCierre, setMontoCierre] = useState('')
  const [modalMov, setModalMov] = useState<'ingreso' | 'egreso' | null>(null)
  const [movMonto, setMovMonto] = useState('')
  const [movDescripcion, setMovDescripcion] = useState('')

  const saldoActual = sesion
    ? sesion.monto_inicial + sesion.total_ventas + sesion.total_ingresos - sesion.total_egresos
    : 0

  const handleAbrirSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const val = Number(montoApertura)
    if (val < 0) return
    await onAbrirCaja(val)
    setModalAbrir(false)
    setMontoApertura('')
  }

  const handleCerrarSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const val = Number(montoCierre)
    if (val < 0) return
    await onCerrarCaja(val)
    setModalCierre(false)
    setMontoCierre('')
  }

  const handleMovSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!modalMov) return
    const val = Number(movMonto)
    if (val <= 0 || !movDescripcion.trim()) return
    await onRegistrarMovimiento(modalMov, val, movDescripcion)
    setModalMov(null)
    setMovMonto('')
    setMovDescripcion('')
  }

  if (cargando) {
    return (
      <div className="py-16 text-center text-text-muted text-xs">
        Cargando estado del turno de caja...
      </div>
    )
  }

  if (!sesion || sesion.estado === 'cerrada') {
    return (
      <div className="rounded-xl border border-border bg-surface p-8 text-center max-w-md mx-auto shadow-xs">
        <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 text-text-muted flex items-center justify-center mx-auto mb-3">
          <LockKeyhole className="w-6 h-6" />
        </div>
        <h3 className="text-base font-bold text-text">La Caja Está Cerrada</h3>
        <p className="text-xs text-text-muted mt-1 mb-6">
          Para comenzar a registrar cobros en el terminal POS debes abrir un turno de caja con fondo inicial.
        </p>
        <Button variant="primary" size="md" onClick={() => setModalAbrir(true)} className="w-full justify-center">
          <Unlock className="w-4 h-4 mr-2" />
          Abrir Turno de Caja
        </Button>

        {/* Modal Abrir Caja */}
        <Modal isOpen={modalAbrir} onClose={() => setModalAbrir(false)} title="Apertura de Caja">
          <form onSubmit={handleAbrirSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-medium text-text block mb-1">Monto Inicial en Efectivo ($)</label>
              <Input
                type="number"
                min="0"
                step="0.01"
                placeholder="0.00"
                value={montoApertura}
                onChange={(e) => setMontoApertura(e.target.value)}
                required
                autoFocus
              />
              <span className="text-[11px] text-text-muted mt-1 block">
                Fondo base para dar cambio al inicio de jornada.
              </span>
            </div>
            <div className="flex justify-end gap-2 pt-2 border-t border-border">
              <Button variant="ghost" size="sm" type="button" onClick={() => setModalAbrir(false)}>
                Cancelar
              </Button>
              <Button variant="primary" size="sm" type="submit">
                Confirmar Apertura
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Resumen del Turno */}
      <div className="rounded-xl border border-border bg-surface shadow-xs p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-text">Turno de Caja Activo</h3>
              <Badge variant="success" size="sm" dot>
                Abierta
              </Badge>
            </div>
            <p className="text-xs text-text-muted mt-0.5">
              Apertura: {new Date(sesion.apertura_at).toLocaleString()} • Responsable: {sesion.usuario}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setModalMov('ingreso')}
              className="text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900/40"
            >
              <ArrowDownCircle className="w-3.5 h-3.5 mr-1.5" />
              Ingreso Extra
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setModalMov('egreso')}
              className="text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-900/40"
            >
              <ArrowUpCircle className="w-3.5 h-3.5 mr-1.5" />
              Retiro / Gasto
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setModalCierre(true)}
              className="text-red-600 dark:text-red-400 border-red-200 dark:border-red-900/40"
            >
              <LockKeyhole className="w-3.5 h-3.5 mr-1.5" />
              Arqueo & Cierre
            </Button>
          </div>
        </div>

        {/* Cifras de la Sesión */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 pt-4 text-xs">
          <div>
            <span className="text-text-muted block">Fondo Inicial</span>
            <span className="text-base font-bold text-text">{fmt(sesion.monto_inicial)}</span>
          </div>
          <div>
            <span className="text-text-muted block">Ventas Turno</span>
            <span className="text-base font-bold text-emerald-600 dark:text-emerald-400">
              +{fmt(sesion.total_ventas)}
            </span>
          </div>
          <div>
            <span className="text-text-muted block">Ingresos Varios</span>
            <span className="text-base font-bold text-blue-600 dark:text-blue-400">
              +{fmt(sesion.total_ingresos)}
            </span>
          </div>
          <div>
            <span className="text-text-muted block">Egresos / Gastos</span>
            <span className="text-base font-bold text-red-600 dark:text-red-400">
              -{fmt(sesion.total_egresos)}
            </span>
          </div>
          <div className="col-span-2 sm:col-span-1 pt-2 sm:pt-0 border-t sm:border-t-0 border-border">
            <span className="text-text-muted block font-semibold">Saldo Teórico</span>
            <span className="text-lg font-extrabold text-primary">{fmt(saldoActual)}</span>
          </div>
        </div>
      </div>

      {/* Historial de Movimientos de la Sesión */}
      <div className="rounded-xl border border-border bg-surface shadow-xs overflow-hidden">
        <div className="p-4 border-b border-border font-semibold text-xs text-text">
          Movimientos Registrados en este Turno ({sesion.movimientos.length})
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-surface-raised border-b border-border text-text-muted font-semibold">
              <tr>
                <th className="px-4 py-2.5">Tipo</th>
                <th className="px-4 py-2.5">Concepto / Descripción</th>
                <th className="px-4 py-2.5">Hora</th>
                <th className="px-4 py-2.5 text-right">Monto</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {sesion.movimientos.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-text-muted">
                    No se han registrado movimientos en este turno aún.
                  </td>
                </tr>
              ) : (
                sesion.movimientos.map((mov) => {
                  const isIngreso = mov.tipo === 'ingreso' || mov.tipo === 'apertura'
                  return (
                    <tr key={mov.id} className="hover:bg-secondary-soft/50">
                      <td className="px-4 py-2.5">
                        <Badge variant={isIngreso ? 'success' : 'danger'} size="sm">
                          {mov.tipo}
                        </Badge>
                      </td>
                      <td className="px-4 py-2.5 font-medium text-text">{mov.descripcion}</td>
                      <td className="px-4 py-2.5 text-text-muted">
                        {new Date(mov.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td className={`px-4 py-2.5 text-right font-bold ${isIngreso ? 'text-emerald-600' : 'text-red-500'}`}>
                        {isIngreso ? '+' : '-'}{fmt(mov.monto)}
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Ingreso / Egreso */}
      {modalMov && (
        <Modal
          isOpen={!!modalMov}
          onClose={() => setModalMov(null)}
          title={modalMov === 'ingreso' ? 'Registrar Ingreso a Caja' : 'Registrar Salida / Retiro de Caja'}
        >
          <form onSubmit={handleMovSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-medium text-text block mb-1">Monto ($) *</label>
              <Input
                type="number"
                min="0.01"
                step="0.01"
                value={movMonto}
                onChange={(e) => setMovMonto(e.target.value)}
                placeholder="0.00"
                required
                autoFocus
              />
            </div>
            <div>
              <label className="text-xs font-medium text-text block mb-1">Motivo / Detalle *</label>
              <Input
                value={movDescripcion}
                onChange={(e) => setMovDescripcion(e.target.value)}
                placeholder={modalMov === 'ingreso' ? 'Ej. Depósito cambio menor' : 'Ej. Compra insumos urgentes'}
                required
              />
            </div>
            <div className="flex justify-end gap-2 pt-2 border-t border-border">
              <Button variant="ghost" size="sm" type="button" onClick={() => setModalMov(null)}>
                Cancelar
              </Button>
              <Button variant="primary" size="sm" type="submit">
                Guardar Movimiento
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Modal Cierre / Arqueo */}
      <Modal isOpen={modalCierre} onClose={() => setModalCierre(false)} title="Arqueo y Cierre de Caja">
        <form onSubmit={handleCerrarSubmit} className="space-y-4 text-xs">
          <div className="p-3 rounded-lg bg-secondary-soft text-text space-y-1">
            <div className="flex justify-between">
              <span>Saldo Teórico Esperado:</span>
              <span className="font-bold">{fmt(saldoActual)}</span>
            </div>
            <span className="text-[10px] text-text-muted block">
              Calculado según saldo inicial, ventas cobradas y movimientos manuales.
            </span>
          </div>

          <div>
            <label className="text-xs font-medium text-text block mb-1">Monto Físico Contado en Caja ($) *</label>
            <Input
              type="number"
              min="0"
              step="0.01"
              value={montoCierre}
              onChange={(e) => setMontoCierre(e.target.value)}
              placeholder="Total billetes y monedas"
              required
              autoFocus
            />
          </div>

          {montoCierre !== '' && (
            <div className="p-3 rounded-lg border border-border">
              <div className="flex justify-between items-center">
                <span>Diferencia de Cuadre:</span>
                <span
                  className={`font-bold ${
                    Number(montoCierre) - saldoActual === 0
                      ? 'text-emerald-600'
                      : Number(montoCierre) - saldoActual < 0
                      ? 'text-red-500'
                      : 'text-blue-600'
                  }`}
                >
                  {fmt(Number(montoCierre) - saldoActual)}
                </span>
              </div>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2 border-t border-border">
            <Button variant="ghost" size="sm" type="button" onClick={() => setModalCierre(false)}>
              Cancelar
            </Button>
            <Button variant="primary" size="sm" type="submit">
              Confirmar Cierre de Turno
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
