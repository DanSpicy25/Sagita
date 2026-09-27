import { useState, useEffect } from 'react'
import {
  CalendarOff,
  Plus,
  Trash2,
  Calendar,
  AlertTriangle,
  Clock,
  Wrench,
  GraduationCap,
  Coffee,
} from 'lucide-react'
import { BloqueoHorario, TipoBloqueo, Empleado, Recurso } from '@/types'
import { bloqueosService } from '@/services/bloqueos.service'
import { empleadosService } from '@/services/empleados.service'
import { recursosService } from '@/services/recursos.service'
import { Button, Modal, Badge, Loader } from '@/components/ui'
import { useToast } from '@/hooks/useToast'

export function GestionBloqueos() {
  const [bloqueos, setBloqueos] = useState<BloqueoHorario[]>([])
  const [empleados, setEmpleados] = useState<Empleado[]>([])
  const [recursos, setRecursos] = useState<Recurso[]>([])
  const [cargando, setCargando] = useState(true)
  const [modalNuevoOpen, setModalNuevoOpen] = useState(false)

  // Form nuevo bloqueo
  const [titulo, setTitulo] = useState('')
  const [tipo, setTipo] = useState<TipoBloqueo>('feriado')
  const [fechaInicio, setFechaInicio] = useState(new Date().toISOString().slice(0, 10))
  const [fechaFin, setFechaFin] = useState(new Date().toISOString().slice(0, 10))
  const [horaInicio, setHoraInicio] = useState('09:00')
  const [horaFin, setHoraFin] = useState('18:00')
  const [todoElDia, setTodoElDia] = useState(true)
  const [empleadoId, setEmpleadoId] = useState<number | undefined>()
  const [recursoId, setRecursoId] = useState<number | undefined>()
  const [motivo, setMotivo] = useState('')

  const { toast } = useToast()

  const cargarDatos = async () => {
    try {
      const [resB, resE, resR] = await Promise.all([
        bloqueosService.getAllBloqueos(),
        empleadosService.getAll({ activo: 'true' }),
        recursosService.getAll({ activo: true }),
      ])
      if (resB.data) setBloqueos(resB.data)
      if (resE.data) setEmpleados(resE.data)
      if (resR.data) setRecursos(resR.data)
    } catch (err) {
      toast.error('Error al cargar bloqueos', err instanceof Error ? err.message : 'Error')
    } finally {
      setCargando(false)
    }
  }

  useEffect(() => {
    cargarDatos()
  }, [])

  const handleCrearBloqueo = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!titulo.trim()) {
      toast.warning('Validación', 'Ingresa un título para el bloqueo')
      return
    }

    const startStr = todoElDia ? fechaInicio : `${fechaInicio} ${horaInicio}`
    const endStr = todoElDia ? fechaFin : `${fechaFin} ${horaFin}`

    try {
      await bloqueosService.createBloqueo({
        titulo,
        tipo,
        fecha_inicio: startStr,
        fecha_fin: endStr,
        todo_el_dia: todoElDia,
        empleado_id: empleadoId,
        recurso_id: recursoId,
        motivo,
      })
      toast.success('Bloqueo registrado', 'El calendario respetará este bloqueo automáticamente')
      setTitulo('')
      setMotivo('')
      setModalNuevoOpen(false)
      cargarDatos()
    } catch (err) {
      toast.error('Error al guardar bloqueo', err instanceof Error ? err.message : 'Error')
    }
  }

  const handleEliminar = async (id: number) => {
    try {
      await bloqueosService.deleteBloqueo(id)
      toast.info('Bloqueo eliminado', 'El período vuelve a estar disponible')
      cargarDatos()
    } catch (err) {
      toast.error('Error al eliminar', err instanceof Error ? err.message : 'Error')
    }
  }

  const getTipoIcono = (t: TipoBloqueo) => {
    switch (t) {
      case 'feriado':
        return <Calendar className="w-4 h-4 text-purple-500" />
      case 'mantenimiento':
        return <Wrench className="w-4 h-4 text-amber-500" />
      case 'capacitacion':
        return <GraduationCap className="w-4 h-4 text-blue-500" />
      case 'personal':
        return <Coffee className="w-4 h-4 text-emerald-500" />
      default:
        return <AlertTriangle className="w-4 h-4 text-rose-500" />
    }
  }

  const tipoBadgeVariant: Record<TipoBloqueo, 'primary' | 'warning' | 'danger' | 'info' | 'default'> = {
    feriado: 'primary',
    mantenimiento: 'warning',
    capacitacion: 'info',
    personal: 'default',
    bloqueo_general: 'danger',
  }

  if (cargando) {
    return <Loader text="Cargando períodos de bloqueo y feriados..." />
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 rounded-xl">
            <CalendarOff className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              Bloqueos de Agenda y Feriados
              <Badge variant="danger">{bloqueos.length}</Badge>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Configura feriados, capacitaciones de personal o mantenimientos de salas y equipos
            </p>
          </div>
        </div>

        <Button
          onClick={() => setModalNuevoOpen(true)}
          leftIcon={<Plus className="w-4 h-4" />}
          variant="primary"
        >
          Nuevo Bloqueo
        </Button>
      </div>

      {/* Tabla de Bloqueos */}
      <div className="card p-0 overflow-hidden border border-slate-200 dark:border-slate-700">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 dark:bg-slate-800/80 text-xs font-semibold text-slate-600 dark:text-slate-400 border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="px-5 py-3.5">Título / Motivo</th>
                <th className="px-5 py-3.5">Tipo</th>
                <th className="px-5 py-3.5">Fecha y Horario</th>
                <th className="px-5 py-3.5">Alcance / Destino</th>
                <th className="px-5 py-3.5 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {bloqueos.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-12 text-slate-400 text-xs italic">
                    No hay bloqueos ni feriados programados.
                  </td>
                </tr>
              ) : (
                bloqueos.map((b) => {
                  const emp = empleados.find((e) => e.id === b.empleado_id)
                  const rec = recursos.find((r) => r.id === b.recurso_id)
                  return (
                    <tr
                      key={b.id}
                      className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2">
                          {getTipoIcono(b.tipo)}
                          <span className="font-bold text-slate-900 dark:text-slate-100">
                            {b.titulo}
                          </span>
                        </div>
                        {b.motivo && <p className="text-xs text-slate-400 mt-0.5">{b.motivo}</p>}
                      </td>
                      <td className="px-5 py-3.5">
                        <Badge variant={tipoBadgeVariant[b.tipo] || 'default'} size="sm">
                          {b.tipo}
                        </Badge>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-1.5 text-xs text-slate-800 dark:text-slate-200 font-semibold">
                          <Clock className="w-3.5 h-3.5 text-primary-500" />
                          <span>
                            {b.fecha_inicio} {b.fecha_fin !== b.fecha_inicio && `hasta ${b.fecha_fin}`}
                          </span>
                        </div>
                        <span className="text-[11px] text-slate-400">
                          {b.todo_el_dia ? 'Todo el día' : 'Horario específico'}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-xs">
                        {emp ? (
                          <span className="text-blue-600 dark:text-blue-400 font-medium">
                            Empleado: {emp.nombre}
                          </span>
                        ) : rec ? (
                          <span className="text-indigo-600 dark:text-indigo-400 font-medium">
                            Recurso: {rec.nombre}
                          </span>
                        ) : (
                          <span className="text-slate-500 italic">Todo el negocio</span>
                        )}
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <button
                          onClick={() => handleEliminar(b.id)}
                          className="p-1.5 text-slate-400 hover:text-red-500 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                          title="Eliminar bloqueo"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Nuevo Bloqueo */}
      <Modal
        isOpen={modalNuevoOpen}
        onClose={() => setModalNuevoOpen(false)}
        title="Crear Período de Bloqueo o Feriado"
      >
        <form onSubmit={handleCrearBloqueo} className="space-y-4 text-sm">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Título del Bloqueo *
            </label>
            <input
              type="text"
              required
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              placeholder="Ej: Feriado Nacional, Mantención Cabina 1, Vacaciones Carlos"
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Tipo de Bloqueo *
              </label>
              <select
                value={tipo}
                onChange={(e) => setTipo(e.target.value as TipoBloqueo)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary-500 text-xs"
              >
                <option value="feriado">Feriado Legal</option>
                <option value="mantenimiento">Mantenimiento de Recurso</option>
                <option value="capacitacion">Capacitación de Personal</option>
                <option value="personal">Ausencia / Asunto Personal</option>
                <option value="bloqueo_general">Bloqueo General</option>
              </select>
            </div>

            <div className="flex items-center pt-5">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700 dark:text-slate-300">
                <input
                  type="checkbox"
                  checked={todoElDia}
                  onChange={(e) => setTodoElDia(e.target.checked)}
                  className="rounded text-primary-600 focus:ring-primary-500"
                />
                Todo el día
              </label>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Fecha Inicio *
              </label>
              <input
                type="date"
                required
                value={fechaInicio}
                onChange={(e) => setFechaInicio(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary-500 text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Fecha Fin *
              </label>
              <input
                type="date"
                required
                value={fechaFin}
                onChange={(e) => setFechaFin(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary-500 text-xs"
              />
            </div>
          </div>

          {!todoElDia && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Hora Inicio
                </label>
                <input
                  type="time"
                  value={horaInicio}
                  onChange={(e) => setHoraInicio(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary-500 text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Hora Fin
                </label>
                <input
                  type="time"
                  value={horaFin}
                  onChange={(e) => setHoraFin(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary-500 text-xs"
                />
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Afecta a Profesional (opcional)
              </label>
              <select
                value={empleadoId || ''}
                onChange={(e) => setEmpleadoId(e.target.value ? Number(e.target.value) : undefined)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary-500 text-xs"
              >
                <option value="">Aplica a todo el negocio</option>
                {empleados.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.nombre}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Afecta a Recurso Físico (opcional)
              </label>
              <select
                value={recursoId || ''}
                onChange={(e) => setRecursoId(e.target.value ? Number(e.target.value) : undefined)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary-500 text-xs"
              >
                <option value="">Ningún recurso específico</option>
                {recursos.map((rec) => (
                  <option key={rec.id} value={rec.id}>
                    {rec.nombre}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Motivo o Detalle Adicional
            </label>
            <textarea
              rows={2}
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              placeholder="Explicación del bloqueo..."
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary-500 text-xs"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <Button variant="secondary" onClick={() => setModalNuevoOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" variant="primary">
              Guardar Bloqueo
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
