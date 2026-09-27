import { useState, useEffect, useCallback } from 'react'
import {
  Users,
  Plus,
  Play,
  CheckCircle,
  XCircle,
  Megaphone,
  Clock,
  Sparkles,
  UserCheck,
  DoorOpen,
} from 'lucide-react'
import { TurnoCola, Servicio, Empleado, Recurso } from '@/types'
import { colaService } from '@/services/cola.service'
import { serviciosService } from '@/services/servicios.service'
import { empleadosService } from '@/services/empleados.service'
import { recursosService } from '@/services/recursos.service'
import { Button, Modal, Badge, Loader } from '@/components/ui'
import { useToast } from '@/hooks/useToast'

interface TableroColaWalkInProps {
  onActualizarCitas?: () => void
}

export function TableroColaWalkIn({ onActualizarCitas }: TableroColaWalkInProps) {
  const [turnos, setTurnos] = useState<TurnoCola[]>([])
  const [servicios, setServicios] = useState<Servicio[]>([])
  const [empleados, setEmpleados] = useState<Empleado[]>([])
  const [recursos, setRecursos] = useState<Recurso[]>([])
  const [cargando, setCargando] = useState(true)
  const [modalNuevoOpen, setModalNuevoOpen] = useState(false)
  const [modalAtencionTurno, setModalAtencionTurno] = useState<TurnoCola | null>(null)
  const [empleadoSeleccionadoId, setEmpleadoSeleccionadoId] = useState<number | undefined>()
  const [recursoSeleccionadoId, setRecursoSeleccionadoId] = useState<number | undefined>()

  // Formulario nuevo walk-in
  const [formNombre, setFormNombre] = useState('')
  const [formTelefono, setFormTelefono] = useState('')
  const [formServicioId, setFormServicioId] = useState<number>(0)
  const [formEmpleadoId, setFormEmpleadoId] = useState<number | undefined>()
  const [formRecursoId, setFormRecursoId] = useState<number | undefined>()
  const [formNotas, setFormNotas] = useState('')

  const { toast } = useToast()

  const cargarDatos = useCallback(async () => {
    try {
      const [resCola, resServ, resEmp, resRec] = await Promise.all([
        colaService.getCola(),
        serviciosService.getAll({ activo: 'true' }),
        empleadosService.getAll({ activo: 'true' }),
        recursosService.getAll({ activo: true }),
      ])
      if (resCola.data) setTurnos(resCola.data)
      if (resServ.data) {
        setServicios(resServ.data)
        if (resServ.data.length > 0 && !formServicioId) {
          setFormServicioId(resServ.data[0].id)
        }
      }
      if (resEmp.data) setEmpleados(resEmp.data)
      if (resRec.data) setRecursos(resRec.data)
    } catch (err) {
      toast.error('Error al cargar datos de la cola', err instanceof Error ? err.message : 'Error')
    } finally {
      setCargando(false)
    }
  }, [formServicioId, toast])

  useEffect(() => {
    cargarDatos()
  }, [cargarDatos])

  const handleCrearWalkIn = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formNombre.trim()) {
      toast.warning('Validación', 'Ingresa el nombre del cliente')
      return
    }
    const serv = servicios.find((s) => s.id === formServicioId)
    if (!serv) {
      toast.warning('Validación', 'Selecciona un servicio válido')
      return
    }
    const emp = empleados.find((e) => e.id === formEmpleadoId)
    const rec = recursos.find((r) => r.id === formRecursoId)

    try {
      const res = await colaService.registrarWalkIn({
        cliente_nombre: formNombre,
        cliente_telefono: formTelefono,
        servicio_id: serv.id,
        servicio_nombre: serv.nombre,
        empleado_id: emp?.id,
        empleado_nombre: emp?.nombre,
        recurso_id: rec?.id,
        recurso_nombre: rec?.nombre,
        notas: formNotas,
      })
      toast.success('Turno emitido', `Se registró el turno ${res.data?.codigo_turno}`)
      setFormNombre('')
      setFormTelefono('')
      setFormNotas('')
      setModalNuevoOpen(false)
      await cargarDatos()
      onActualizarCitas?.()
    } catch (err) {
      toast.error('Error al emitir turno', err instanceof Error ? err.message : 'Error')
    }
  }

  const handleLlamar = async (turno: TurnoCola) => {
    try {
      await colaService.llamarTurno(turno.id)
      toast.info('Turno Llamado', `Llamando al cliente ${turno.cliente_nombre} (${turno.codigo_turno})`)
      cargarDatos()
    } catch (err) {
      toast.error('Error', err instanceof Error ? err.message : 'Error')
    }
  }

  const handleAbrirIniciarAtencion = (turno: TurnoCola) => {
    setModalAtencionTurno(turno)
    setEmpleadoSeleccionadoId(turno.empleado_id || (empleados[0]?.id ?? undefined))
    setRecursoSeleccionadoId(turno.recurso_id || (recursos[0]?.id ?? undefined))
  }

  const handleConfirmarInicioAtencion = async () => {
    if (!modalAtencionTurno) return
    const emp = empleados.find((e) => e.id === empleadoSeleccionadoId)
    const rec = recursos.find((r) => r.id === recursoSeleccionadoId)

    try {
      await colaService.iniciarAtencion(
        modalAtencionTurno.id,
        emp?.id,
        emp?.nombre,
        rec?.id,
        rec?.nombre
      )
      toast.success('Atención iniciada', `Turno ${modalAtencionTurno.codigo_turno} en atención`)
      setModalAtencionTurno(null)
      await cargarDatos()
      onActualizarCitas?.()
    } catch (err) {
      toast.error('Error al iniciar atención', err instanceof Error ? err.message : 'Error')
    }
  }

  const handleCompletar = async (turno: TurnoCola) => {
    try {
      await colaService.completarAtencion(turno.id)
      toast.success('Atención completada', `Turno ${turno.codigo_turno} finalizado con éxito`)
      await cargarDatos()
      onActualizarCitas?.()
    } catch (err) {
      toast.error('Error al completar', err instanceof Error ? err.message : 'Error')
    }
  }

  const handleCancelar = async (turno: TurnoCola) => {
    try {
      await colaService.cancelarTurno(turno.id)
      toast.info('Turno cancelado', `El turno ${turno.codigo_turno} fue cancelado`)
      await cargarDatos()
      onActualizarCitas?.()
    } catch (err) {
      toast.error('Error', err instanceof Error ? err.message : 'Error')
    }
  }

  const enEspera = turnos.filter((t) => t.estado === 'en_espera' || t.estado === 'llamado')
  const enAtencion = turnos.filter((t) => t.estado === 'en_atencion')
  const completados = turnos.filter((t) => t.estado === 'completado')

  const minutosTranscurridos = (horaIso: string) => {
    const diffMs = Date.now() - new Date(horaIso).getTime()
    return Math.max(0, Math.floor(diffMs / 60000))
  }

  if (cargando) {
    return <Loader text="Cargando cola de atención en vivo..." />
  }

  return (
    <div className="space-y-6">
      {/* Barra superior del tablero */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-primary-50 dark:bg-primary-950/40 text-primary-600 dark:text-primary-400 rounded-xl">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              Cola de Atención en Vivo (Walk-Ins)
              <span className="flex h-2.5 w-2.5 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Registra clientes presenciales sin cita previa y gestiona el flujo de atención en tiempo real
            </p>
          </div>
        </div>

        <Button
          onClick={() => setModalNuevoOpen(true)}
          leftIcon={<Plus className="w-4 h-4" />}
          variant="primary"
        >
          Nuevo Walk-In
        </Button>
      </div>

      {/* Columnas Kanban de la Cola */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Columna 1: En Espera */}
        <div className="bg-slate-50 dark:bg-slate-900/40 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-500" />
              En Espera
            </h3>
            <Badge variant="warning">{enEspera.length}</Badge>
          </div>

          <div className="space-y-3 min-h-[300px]">
            {enEspera.length === 0 ? (
              <div className="text-center py-12 text-slate-400 text-xs italic bg-white/50 dark:bg-slate-800/40 rounded-xl border border-dashed border-slate-200 dark:border-slate-700">
                No hay clientes esperando
              </div>
            ) : (
              enEspera.map((turno) => {
                const mins = minutosTranscurridos(turno.hora_llegada)
                return (
                  <div
                    key={turno.id}
                    className="p-4 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm space-y-3 hover:border-amber-300 transition-all"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-black text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-950/60 px-2 py-0.5 rounded-lg border border-primary-100 dark:border-primary-800">
                          {turno.codigo_turno}
                        </span>
                        {turno.estado === 'llamado' && (
                          <Badge variant="warning" dot>
                            Llamado
                          </Badge>
                        )}
                      </div>
                      <span className="text-xs text-slate-400 flex items-center gap-1 font-medium">
                        <Clock className="w-3 h-3 text-amber-500" />
                        Hace {mins} min
                      </span>
                    </div>

                    <div>
                      <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                        {turno.cliente_nombre}
                      </h4>
                      <p className="text-xs text-slate-500 font-medium">{turno.servicio_nombre}</p>
                      {turno.cliente_telefono && (
                        <p className="text-xs text-slate-400 mt-0.5">{turno.cliente_telefono}</p>
                      )}
                    </div>

                    {turno.empleado_nombre && (
                      <div className="text-xs text-slate-600 dark:text-slate-300 flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800/80 p-2 rounded-lg">
                        <UserCheck className="w-3.5 h-3.5 text-primary-500" />
                        <span>Prof: {turno.empleado_nombre}</span>
                      </div>
                    )}

                    {turno.notas && (
                      <p className="text-xs text-slate-500 italic bg-amber-50/50 dark:bg-amber-950/20 p-2 rounded-lg border border-amber-100 dark:border-amber-900/30">
                        {turno.notas}
                      </p>
                    )}

                    <div className="flex items-center gap-2 pt-1 border-t border-slate-100 dark:border-slate-800">
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => handleLlamar(turno)}
                        leftIcon={<Megaphone className="w-3.5 h-3.5 text-amber-600" />}
                        className="flex-1"
                      >
                        Llamar
                      </Button>
                      <Button
                        size="sm"
                        variant="primary"
                        onClick={() => handleAbrirIniciarAtencion(turno)}
                        leftIcon={<Play className="w-3.5 h-3.5" />}
                        className="flex-1"
                      >
                        Atender
                      </Button>
                      <button
                        onClick={() => handleCancelar(turno)}
                        className="p-1.5 text-slate-400 hover:text-red-500 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                        title="Cancelar turno"
                      >
                        <XCircle className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>

        {/* Columna 2: En Atención */}
        <div className="bg-slate-50 dark:bg-slate-900/40 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-500" />
              En Atención
            </h3>
            <Badge variant="success">{enAtencion.length}</Badge>
          </div>

          <div className="space-y-3 min-h-[300px]">
            {enAtencion.length === 0 ? (
              <div className="text-center py-12 text-slate-400 text-xs italic bg-white/50 dark:bg-slate-800/40 rounded-xl border border-dashed border-slate-200 dark:border-slate-700">
                No hay atenciones en curso en este momento
              </div>
            ) : (
              enAtencion.map((turno) => (
                <div
                  key={turno.id}
                  className="p-4 rounded-xl bg-white dark:bg-slate-800 border-2 border-emerald-300 dark:border-emerald-700/80 shadow-sm space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-black text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-lg border border-emerald-200 dark:border-emerald-800">
                      {turno.codigo_turno}
                    </span>
                    <Badge variant="success" dot>
                      En Sesión
                    </Badge>
                  </div>

                  <div>
                    <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                      {turno.cliente_nombre}
                    </h4>
                    <p className="text-xs text-slate-500 font-medium">{turno.servicio_nombre}</p>
                  </div>

                  <div className="space-y-1.5 text-xs text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/70 p-2.5 rounded-xl border border-slate-100 dark:border-slate-700">
                    <div className="flex items-center gap-1.5">
                      <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{turno.empleado_nombre || 'Especialista de guardia'}</span>
                    </div>
                    {turno.recurso_nombre && (
                      <div className="flex items-center gap-1.5">
                        <DoorOpen className="w-3.5 h-3.5 text-primary-500" />
                        <span>{turno.recurso_nombre}</span>
                      </div>
                    )}
                  </div>

                  <Button
                    size="sm"
                    variant="primary"
                    onClick={() => handleCompletar(turno)}
                    leftIcon={<CheckCircle className="w-3.5 h-3.5" />}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
                  >
                    Finalizar Atención
                  </Button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Columna 3: Completados Hoy */}
        <div className="bg-slate-50 dark:bg-slate-900/40 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-primary-500" />
              Completados Hoy
            </h3>
            <Badge variant="default">{completados.length}</Badge>
          </div>

          <div className="space-y-2 max-h-[450px] overflow-y-auto pr-1">
            {completados.length === 0 ? (
              <div className="text-center py-12 text-slate-400 text-xs italic bg-white/50 dark:bg-slate-800/40 rounded-xl border border-dashed border-slate-200 dark:border-slate-700">
                Aún no hay turnos finalizados hoy
              </div>
            ) : (
              completados.map((turno) => (
                <div
                  key={turno.id}
                  className="p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/60 text-xs flex items-center justify-between"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-700 dark:text-slate-300">
                        {turno.codigo_turno}
                      </span>
                      <span className="text-slate-900 dark:text-slate-100 font-medium">
                        {turno.cliente_nombre}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400">{turno.servicio_nombre}</p>
                  </div>
                  <Badge variant="default" size="sm">
                    Listo
                  </Badge>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Modal: Registrar Nuevo Walk-In */}
      <Modal
        isOpen={modalNuevoOpen}
        onClose={() => setModalNuevoOpen(false)}
        title="Emitir Turno Walk-In (Cliente Presencial)"
      >
        <form onSubmit={handleCrearWalkIn} className="space-y-4 text-sm">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Nombre del Cliente *
            </label>
            <input
              type="text"
              required
              value={formNombre}
              onChange={(e) => setFormNombre(e.target.value)}
              placeholder="Ej: Laura Méndez"
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Teléfono (opcional para avisar por WhatsApp / SMS)
            </label>
            <input
              type="tel"
              value={formTelefono}
              onChange={(e) => setFormTelefono(e.target.value)}
              placeholder="+1 555-0199"
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Servicio Solicitado *
            </label>
            <select
              value={formServicioId}
              onChange={(e) => setFormServicioId(Number(e.target.value))}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              {servicios.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.nombre} ({s.duracion_base_min} min - ${s.precio_base})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Profesional Preferente
              </label>
              <select
                value={formEmpleadoId || ''}
                onChange={(e) => setFormEmpleadoId(e.target.value ? Number(e.target.value) : undefined)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary-500 text-xs"
              >
                <option value="">Cualquier profesional disponible</option>
                {empleados.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.nombre}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Recurso / Espacio
              </label>
              <select
                value={formRecursoId || ''}
                onChange={(e) => setFormRecursoId(e.target.value ? Number(e.target.value) : undefined)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary-500 text-xs"
              >
                <option value="">Asignación automática</option>
                {recursos.map((rec) => (
                  <option key={rec.id} value={rec.id}>
                    {rec.nombre} ({rec.tipo})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Notas o motivo de la visita
            </label>
            <textarea
              rows={2}
              value={formNotas}
              onChange={(e) => setFormNotas(e.target.value)}
              placeholder="Detalles sobre la urgencia o requerimientos del cliente..."
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary-500 text-xs"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <Button variant="secondary" onClick={() => setModalNuevoOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" variant="primary">
              Generar Turno
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal: Asignar e Iniciar Atención */}
      {modalAtencionTurno && (
        <Modal
          isOpen={true}
          onClose={() => setModalAtencionTurno(null)}
          title={`Iniciar Atención — Turno ${modalAtencionTurno.codigo_turno}`}
        >
          <div className="space-y-4 text-sm">
            <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl space-y-1">
              <p className="font-bold text-slate-900 dark:text-slate-100">
                {modalAtencionTurno.cliente_nombre}
              </p>
              <p className="text-xs text-slate-500">
                Servicio: {modalAtencionTurno.servicio_nombre}
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Asignar Profesional
              </label>
              <select
                value={empleadoSeleccionadoId || ''}
                onChange={(e) => setEmpleadoSeleccionadoId(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                {empleados.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.nombre} ({emp.especialidad})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Asignar Sala / Recurso
              </label>
              <select
                value={recursoSeleccionadoId || ''}
                onChange={(e) => setRecursoSeleccionadoId(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                {recursos.map((rec) => (
                  <option key={rec.id} value={rec.id}>
                    {rec.nombre} ({rec.tipo} - Capacidad: {rec.capacidad})
                  </option>
                ))}
              </select>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <Button variant="secondary" onClick={() => setModalAtencionTurno(null)}>
                Volver
              </Button>
              <Button variant="primary" onClick={handleConfirmarInicioAtencion}>
                Comenzar Atención Ahora
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}
