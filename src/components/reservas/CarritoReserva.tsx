import { Trash2, ShoppingBag, Plus } from 'lucide-react'
import { ItemCarrito } from '@/types'
import { Button } from '@/components/ui'

interface CarritoReservaProps {
  items: ItemCarrito[]
  onEliminar: (id: string) => void
  onLimpiar?: () => void
  onContinuar?: () => void
  onAgregarOtro?: () => void
}

export function CarritoReserva({
  items,
  onEliminar,
  onContinuar,
  onAgregarOtro,
}: CarritoReservaProps) {
  const total = items.reduce((acc, item) => acc + item.precio, 0)

  if (items.length === 0) {
    return (
      <div className="card p-6 text-center text-slate-400">
        <ShoppingBag className="w-8 h-8 mx-auto mb-2 opacity-40" />
        <p className="text-sm font-medium">El carrito de reservas está vacío</p>
        <p className="text-xs text-slate-400 mt-1">
          Puedes agregar múltiples servicios a una sola cita
        </p>
      </div>
    )
  }

  return (
    <div className="card p-6 shadow-card space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-slate-100">
          <ShoppingBag className="w-5 h-5 text-primary-600" />
          <span>Servicios en el carrito ({items.length})</span>
        </div>
        {onAgregarOtro && (
          <Button variant="ghost" size="sm" onClick={onAgregarOtro} leftIcon={<Plus className="w-4 h-4" />}>
            Agregar otro
          </Button>
        )}
      </div>

      <div className="divide-y divide-slate-100 dark:divide-slate-800">
        {items.map((item) => (
          <div key={item.id} className="py-3 flex items-center justify-between gap-4">
            <div>
              <h5 className="font-semibold text-sm text-slate-800 dark:text-slate-200">
                {item.servicio.nombre}
              </h5>
              <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                <span>{item.duracion?.duracion_min ?? item.servicio.duracion_base_min} min</span>
                {item.empleado && <span>• con {item.empleado.nombre}</span>}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className="font-bold text-sm text-slate-900 dark:text-slate-100">
                ${item.precio}
              </span>
              <button
                type="button"
                onClick={() => onEliminar(item.id)}
                className="p-1 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
                aria-label="Eliminar del carrito"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Resumen total */}
      <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
        <div>
          <p className="text-xs text-slate-400">Total a pagar</p>
          <p className="text-xl font-bold text-slate-900 dark:text-slate-100">${total}</p>
        </div>
        {onContinuar && (
          <Button onClick={onContinuar} size="md">
            Continuar con la reserva
          </Button>
        )}
      </div>
    </div>
  )
}
