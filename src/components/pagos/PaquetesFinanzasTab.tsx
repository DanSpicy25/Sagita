import type { PaqueteServicio } from '@/types'
import { Badge, Button } from '@/components/ui'
import { useToast } from '@/hooks/useToast'

export interface PaquetesFinanzasTabProps {
  paquetes: PaqueteServicio[]
}

export function PaquetesFinanzasTab({ paquetes }: PaquetesFinanzasTabProps) {
  const { toast } = useToast()

  if (paquetes.length === 0) {
    return (
      <div className="py-12 rounded-xl border border-dashed border-border text-center text-text-muted text-xs">
        No hay paquetes de sesiones configurados en el catálogo.
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-bold text-text">Paquetes Comerciales y Bonos de Sesiones</h3>
        <p className="text-xs text-text-muted">Bonos prepagados con ahorro por volumen para fidelización de clientes.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {paquetes.map((p) => (
          <div
            key={p.id}
            className="rounded-xl border border-border bg-surface p-5 flex flex-col justify-between shadow-xs hover:border-primary/40 transition-all"
          >
            <div>
              <div className="flex items-start justify-between gap-2 mb-2">
                <h4 className="font-bold text-sm text-text">
                  {p.nombre}
                </h4>
                <Badge variant="primary" size="sm">
                  -{p.descuento_porcentaje}% Ahorro
                </Badge>
              </div>

              <p className="text-xs text-text-muted mt-1">
                {p.descripcion}
              </p>

              <div className="mt-4 pt-3 border-t border-border flex items-baseline gap-3">
                <span className="text-2xl font-black text-text">
                  ${p.precio_total.toFixed(2)}
                </span>
                <span className="text-xs text-text-muted line-through">
                  ${p.precio_original.toFixed(2)}
                </span>
              </div>
            </div>

            <div className="pt-4 mt-2">
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-center"
                onClick={() => toast.success('Paquete seleccionado', `Bundle ${p.nombre} listo para el punto de venta`)}
              >
                Promocionar Paquete
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
