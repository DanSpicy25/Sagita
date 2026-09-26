import { useState, useEffect } from 'react'
import { Plus, Mail, Calendar, Clock } from 'lucide-react'
import { Empleado } from '@/types'
import { empleadosService } from '@/services/empleados.service'
import { Button, Avatar, Badge, Loader, Modal, EmptyState } from '@/components/ui'
import { useToast } from '@/hooks/useToast'

const DIAS_NOMBRES = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']

export default function EmpleadosPage() {
  const [empleados, setEmpleados] = useState<Empleado[]>([])
  const [cargando, setCargando] = useState(true)
  const [empleadoSeleccionado, setEmpleadoSeleccionado] = useState<Empleado | null>(null)
  const { toast } = useToast()

  const cargarEmpleados = () => {
    setCargando(true)
    empleadosService
      .getAll()
      .then((res) => {
        if (res.data) setEmpleados(res.data)
      })
      .catch((err) => {
        toast.error('Error al cargar empleados', err instanceof Error ? err.message : 'Error')
      })
      .finally(() => setCargando(false))
  }

  useEffect(() => {
    cargarEmpleados()
  }, [])

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            Equipo y Profesionales
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Gestiona tu personal, asigna especialidades y administra sus horarios laborales
          </p>
        </div>

        <Button
          onClick={() => toast.info('Función en desarrollo', 'Pronto podrás invitar nuevos empleados')}
          leftIcon={<Plus className="w-4 h-4" />}
        >
          Nuevo Empleado
        </Button>
      </div>

      {/* Grid de Empleados */}
      {cargando ? (
        <Loader text="Cargando profesionales..." />
      ) : empleados.length === 0 ? (
        <EmptyState
          title="No hay empleados registrados"
          description="Añade miembros al equipo para asignarles servicios y horarios."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {empleados.map((emp) => (
            <div
              key={emp.id}
              className="card p-6 flex flex-col justify-between border border-slate-100 dark:border-slate-800 hover:shadow-lg transition-all"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className="flex items-center gap-3">
                    <Avatar name={emp.nombre} src={emp.foto} size="lg" />
                    <div>
                      <h4 className="font-bold text-base text-slate-900 dark:text-slate-100">
                        {emp.nombre}
                      </h4>
                      <p className="text-xs text-primary-600 dark:text-primary-400 font-semibold">
                        {emp.especialidad ?? 'Especialista'}
                      </p>
                    </div>
                  </div>
                  <Badge variant={emp.activo ? 'success' : 'default'} dot>
                    {emp.activo ? 'Activo' : 'Inactivo'}
                  </Badge>
                </div>

                {emp.bio && (
                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-3 mb-4">
                    {emp.bio}
                  </p>
                )}

                <div className="space-y-1.5 text-xs text-slate-400">
                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    <span>{emp.email}</span>
                  </div>
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <span className="text-xs text-slate-400 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  {emp.horarios?.length ?? 5} días activos
                </span>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setEmpleadoSeleccionado(emp)}
                >
                  Ver Horario
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Horarios del Empleado */}
      {empleadoSeleccionado && (
        <Modal
          isOpen={true}
          onClose={() => setEmpleadoSeleccionado(null)}
          title={`Horario de ${empleadoSeleccionado.nombre}`}
        >
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-xs text-slate-500 pb-2 border-b border-slate-100 dark:border-slate-800">
              <Calendar className="w-4 h-4 text-primary-500" />
              <span>Jornada laboral habitual por día de la semana:</span>
            </div>

            <div className="space-y-2">
              {empleadoSeleccionado.horarios && empleadoSeleccionado.horarios.length > 0 ? (
                empleadoSeleccionado.horarios.map((h) => (
                  <div
                    key={h.id}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 text-xs font-medium"
                  >
                    <span className="font-bold text-slate-700 dark:text-slate-300 w-16">
                      {DIAS_NOMBRES[h.dia_semana]}
                    </span>
                    <span className="text-slate-500 dark:text-slate-400">
                      {h.hora_inicio} — {h.hora_fin}
                    </span>
                    <Badge variant={h.activo ? 'success' : 'default'} size="sm">
                      {h.activo ? 'Disponible' : 'Libre'}
                    </Badge>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-400 py-4 text-center">
                  Horario estándar de lunes a viernes: 09:00 a 18:00
                </p>
              )}
            </div>

            <div className="flex justify-end pt-4">
              <Button onClick={() => setEmpleadoSeleccionado(null)}>Cerrar</Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}
