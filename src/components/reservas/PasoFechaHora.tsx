import { SelectorFechaHora } from '@/components/calendario/SelectorFechaHora'
import { Empleado, Servicio } from '@/types'
import { Button } from '@/components/ui'

interface PasoFechaHoraProps {
  empleado?: Empleado
  servicio?: Servicio
  fechaSeleccionada?: string
  horaSeleccionada?: string
  onSeleccionar: (fecha: string, hora: string) => void
  onAnterior: () => void
  onSiguiente: () => void
}

export function PasoFechaHora({
  empleado,
  servicio,
  fechaSeleccionada,
  horaSeleccionada,
  onSeleccionar,
  onAnterior,
  onSiguiente,
}: PasoFechaHoraProps) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
          Paso 3: Selecciona fecha y horario
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Horarios disponibles con {empleado?.nombre ?? 'el profesional'}
        </p>
      </div>

      <SelectorFechaHora
        empleadoId={empleado?.id}
        servicioId={servicio?.id}
        fechaSeleccionada={fechaSeleccionada}
        horaSeleccionada={horaSeleccionada}
        onSeleccionar={onSeleccionar}
      />

      <div className="flex items-center justify-between pt-4">
        <Button variant="secondary" onClick={onAnterior}>
          Atrás
        </Button>
        <Button
          onClick={onSiguiente}
          disabled={!fechaSeleccionada || !horaSeleccionada}
        >
          Confirmar Detalles
        </Button>
      </div>
    </div>
  )
}
