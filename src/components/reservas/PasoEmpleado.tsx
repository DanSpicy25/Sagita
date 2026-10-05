import { useState, useEffect } from 'react'
import { Check, Sparkles } from 'lucide-react'
import { Empleado } from '@/types'
import { empleadosService } from '@/services/empleados.service'
import { Loader, Button, Avatar } from '@/components/ui'

interface PasoEmpleadoProps {
  empleadoSeleccionado?: Empleado
  onSeleccionar: (empleado: Empleado) => void
  onAnterior: () => void
  onSiguiente: () => void
}

export function PasoEmpleado({
  empleadoSeleccionado,
  onSeleccionar,
  onAnterior,
  onSiguiente,
}: PasoEmpleadoProps) {
  const [empleados, setEmpleados] = useState<Empleado[]>([])
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    empleadosService
      .getAll()
      .then((res) => {
        if (res.data) setEmpleados(res.data)
      })
      .finally(() => setCargando(false))
  }, [])

  if (cargando) {
    return <Loader text="Cargando profesionales disponibles..." />
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
          Paso 2: Selecciona el profesional
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Elige quién te atenderá en tu cita
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {empleados.map((emp) => {
          const esSeleccionado = empleadoSeleccionado?.id === emp.id
          return (
            <div
              key={emp.id}
              onClick={() => onSeleccionar(emp)}
              className={[
                'card p-5 cursor-pointer transition-all border-2 flex items-center justify-between group',
                esSeleccionado
                  ? 'border-primary-600 dark:border-primary-500 bg-primary-50/20 dark:bg-primary-950/20 shadow-md ring-2 ring-primary-100 dark:ring-primary-950'
                  : 'border-transparent hover:border-slate-300 dark:hover:border-slate-600',
              ].join(' ')}
            >
              <div className="flex items-center gap-3.5">
                <Avatar name={emp.nombre} src={emp.foto} size="lg" />
                <div>
                  <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100 group-hover:text-primary-600 transition-colors">
                    {emp.nombre}
                  </h4>
                  <p className="text-xs text-primary-600 dark:text-primary-400 font-medium">
                    {emp.especialidad ?? 'Especialista'}
                  </p>
                  {emp.bio && (
                    <p className="text-xs text-slate-400 mt-1 line-clamp-1 max-w-xs">
                      {emp.bio}
                    </p>
                  )}
                </div>
              </div>

              {esSeleccionado && (
                <span className="w-6 h-6 rounded-full bg-primary-600 text-white flex items-center justify-center flex-shrink-0">
                  <Check className="w-3.5 h-3.5" />
                </span>
              )}
            </div>
          )
        })}

        {/* Opción cualquier empleado */}
        {empleados.length > 0 && (
          <div
            onClick={() => onSeleccionar(empleados[0])}
            className="card p-5 cursor-pointer border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-primary-500 transition-all flex items-center justify-between"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-full bg-primary-50 dark:bg-primary-900/30 text-primary-600 flex items-center justify-center">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                  Cualquier profesional disponible
                </h4>
                <p className="text-xs text-slate-400">
                  Asignaremos automáticamente al primer profesional libre
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between pt-4">
        <Button variant="secondary" onClick={onAnterior}>
          Atrás
        </Button>
        <Button onClick={onSiguiente} disabled={!empleadoSeleccionado}>
          Continuar con Fecha y Hora
        </Button>
      </div>
    </div>
  )
}
