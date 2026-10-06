import { useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import type { Cupon } from '@/types'
import { Button, Badge, Modal, Input } from '@/components/ui'

export interface CuponesTabProps {
  cupones: Cupon[]
  onCrearCupon: (cupon: { codigo: string; tipo: 'porcentual' | 'fijo'; valor: number; usos_max: number }) => Promise<void>
  onEliminarCupon: (id: number) => Promise<void>
}

export function CuponesTab({
  cupones,
  onCrearCupon,
  onEliminarCupon,
}: CuponesTabProps) {
  const [modalAbierto, setModalAbierto] = useState(false)
  const [nuevoCupon, setNuevoCupon] = useState({
    codigo: '',
    tipo: 'porcentual' as 'porcentual' | 'fijo',
    valor: 15,
    usos_max: 50,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!nuevoCupon.codigo.trim()) return

    await onCrearCupon({
      codigo: nuevoCupon.codigo.toUpperCase(),
      tipo: nuevoCupon.tipo,
      valor: Number(nuevoCupon.valor),
      usos_max: Number(nuevoCupon.usos_max),
    })

    setModalAbierto(false)
    setNuevoCupon({ codigo: '', tipo: 'porcentual', valor: 15, usos_max: 50 })
  }

  return (
    <div className="space-y-4">
      {/* Botón de Creación */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-sm font-bold text-text">Códigos de Descuento Promocionales</h3>
          <p className="text-xs text-text-muted">Aplica cupones durante la reserva online o el cobro en caja.</p>
        </div>
        <Button variant="primary" size="sm" onClick={() => setModalAbierto(true)}>
          <Plus className="w-3.5 h-3.5 mr-1.5" />
          Nuevo Cupón
        </Button>
      </div>

      {/* Grid de Cupones */}
      {cupones.length === 0 ? (
        <div className="py-12 rounded-xl border border-dashed border-border text-center text-text-muted text-xs">
          No hay cupones de descuento activos.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {cupones.map((c) => (
            <div
              key={c.id}
              className="rounded-xl border border-border bg-surface p-4 flex flex-col justify-between shadow-xs hover:border-primary/40 transition-colors"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span className="text-sm font-black tracking-wider text-primary bg-primary-soft px-2.5 py-1 rounded-lg font-mono">
                    {c.codigo}
                  </span>
                  <Badge variant={c.activo ? 'success' : 'default'} size="sm" dot>
                    {c.activo ? 'Vigente' : 'Inactivo'}
                  </Badge>
                </div>

                <div className="mt-3">
                  <p className="text-2xl font-black text-text">
                    {c.tipo === 'porcentual' ? `${c.valor}% OFF` : `$${c.valor} OFF`}
                  </p>
                  <p className="text-xs text-text-muted mt-1">
                    Descuento aplicable en reservas online y cobros en punto de venta
                  </p>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-border flex items-center justify-between text-xs text-text-muted">
                <span>
                  Usos: <strong>{c.usos_actuales}</strong> / {c.usos_max ?? '∞'}
                </span>
                <button
                  onClick={() => onEliminarCupon(c.id)}
                  className="p-1 rounded-lg text-text-muted hover:text-red-500 transition-colors"
                  title="Eliminar cupón"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Nuevo Cupón */}
      <Modal isOpen={modalAbierto} onClose={() => setModalAbierto(false)} title="Crear Cupón de Descuento">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-medium text-text block mb-1">Código del Cupón *</label>
            <Input
              placeholder="Ej. BIENVENIDA20"
              value={nuevoCupon.codigo}
              onChange={(e) => setNuevoCupon({ ...nuevoCupon, codigo: e.target.value.toUpperCase() })}
              required
              autoFocus
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-text block mb-1">Tipo de Descuento</label>
              <select
                className="w-full text-xs px-2.5 py-2 rounded-lg border border-border bg-surface text-text focus:outline-none focus:ring-1 focus:ring-primary"
                value={nuevoCupon.tipo}
                onChange={(e) =>
                  setNuevoCupon({
                    ...nuevoCupon,
                    tipo: e.target.value as 'porcentual' | 'fijo',
                  })
                }
              >
                <option value="porcentual">Porcentual (%)</option>
                <option value="fijo">Monto Fijo ($)</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-text block mb-1">Valor del Descuento</label>
              <Input
                type="number"
                min="1"
                max={nuevoCupon.tipo === 'porcentual' ? 100 : 10000}
                value={nuevoCupon.valor}
                onChange={(e) => setNuevoCupon({ ...nuevoCupon, valor: Number(e.target.value) })}
                required
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-text block mb-1">Límite Máximo de Usos</label>
            <Input
              type="number"
              min="1"
              value={nuevoCupon.usos_max}
              onChange={(e) => setNuevoCupon({ ...nuevoCupon, usos_max: Number(e.target.value) })}
              required
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-border">
            <Button variant="ghost" size="sm" type="button" onClick={() => setModalAbierto(false)}>
              Cancelar
            </Button>
            <Button variant="primary" size="sm" type="submit">
              Habilitar Cupón
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
