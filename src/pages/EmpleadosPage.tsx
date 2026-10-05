import { useState, useEffect } from 'react'
import { Plus, Mail, Phone, Calendar, Clock, Edit2, CheckCircle2 } from 'lucide-react'
import { Empleado, DiaSemana, HorarioEmpleado } from '@/types'
import { empleadosService } from '@/services/empleados.service'
import { Button, Avatar, Badge, Loader, Modal, Input, Textarea, EmptyState } from '@/components/ui'
import { useToast } from '@/hooks/useToast'
import { useModules } from '@/context/ModulesContext'

const DIAS_NOMBRES = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']

interface HorarioFormItem {
  dia_semana: DiaSemana
  hora_inicio: string
  hora_fin: string
  activo: boolean
}

const HORARIOS_DEFAULT: HorarioFormItem[] = [
  { dia_semana: 1, hora_inicio: '09:00', hora_fin: '18:00', activo: true },
  { dia_semana: 2, hora_inicio: '09:00', hora_fin: '18:00', activo: true },
  { dia_semana: 3, hora_inicio: '09:00', hora_fin: '18:00', activo: true },
  { dia_semana: 4, hora_inicio: '09:00', hora_fin: '18:00', activo: true },
  { dia_semana: 5, hora_inicio: '09:00', hora_fin: '18:00', activo: true },
  { dia_semana: 6, hora_inicio: '10:00', hora_fin: '15:00', activo: true },
  { dia_semana: 0, hora_inicio: '10:00', hora_fin: '14:00', activo: false },
]

export default function EmpleadosPage() {
  const [empleados, setEmpleados] = useState<Empleado[]>([])
  const [cargando, setCargando] = useState(true)
  const [guardando, setGuardando] = useState(false)
  const [empleadoSeleccionado, setEmpleadoSeleccionado] = useState<Empleado | null>(null)
  const [modalFormAbierto, setModalFormAbierto] = useState(false)
  const [empleadoEnEdicion, setEmpleadoEnEdicion] = useState<Empleado | null>(null)

  // Form State
  const [nombre, setNombre] = useState('')
  const [email, setEmail] = useState('')
  const [telefono, setTelefono] = useState('')
  const [especialidad, setEspecialidad] = useState('')
  const [bio, setBio] = useState('')
  const [activo, setActivo] = useState(true)
  const [horariosForm, setHorariosForm] = useState<HorarioFormItem[]>(HORARIOS_DEFAULT)

  const { toast } = useToast()
  const { tTerm } = useModules()
  const profesionalTerm = tTerm('profesional', 'Profesional')
  const profesionalesTerm = tTerm('profesionales', 'Profesionales')

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

  const abrirModalCrear = () => {
    setEmpleadoEnEdicion(null)
    setNombre('')
    setEmail('')
    setTelefono('')
    setEspecialidad('')
    setBio('')
    setActivo(true)
    setHorariosForm(HORARIOS_DEFAULT)
    setModalFormAbierto(true)
  }

  const abrirModalEditar = (emp: Empleado) => {
    setEmpleadoEnEdicion(emp)
    setNombre(emp.nombre || '')
    setEmail(emp.email || '')
    setTelefono(emp.telefono || '')
    setEspecialidad(emp.especialidad || emp.cargo || '')
    setBio(emp.bio || '')
    setActivo(emp.activo)

    if (emp.horarios && emp.horarios.length > 0) {
      const mergedHorarios: HorarioFormItem[] = [1, 2, 3, 4, 5, 6, 0].map((dia) => {
        const h = emp.horarios?.find((item) => item.dia_semana === dia)
        if (h) {
          return {
            dia_semana: dia as DiaSemana,
            hora_inicio: h.hora_inicio,
            hora_fin: h.hora_fin,
            activo: h.activo,
          }
        }
        return {
          dia_semana: dia as DiaSemana,
          hora_inicio: '09:00',
          hora_fin: '18:00',
          activo: false,
        }
      })
      setHorariosForm(mergedHorarios)
    } else {
      setHorariosForm(HORARIOS_DEFAULT)
    }

    setModalFormAbierto(true)
  }

  const toggleDia = (dia: DiaSemana) => {
    setHorariosForm((prev) =>
      prev.map((h) => (h.dia_semana === dia ? { ...h, activo: !h.activo } : h))
    )
  }

  const updateHoraInicio = (dia: DiaSemana, hora: string) => {
    setHorariosForm((prev) =>
      prev.map((h) => (h.dia_semana === dia ? { ...h, hora_inicio: hora } : h))
    )
  }

  const updateHoraFin = (dia: DiaSemana, hora: string) => {
    setHorariosForm((prev) =>
      prev.map((h) => (h.dia_semana === dia ? { ...h, hora_fin: hora } : h))
    )
  }

  const handleGuardarEmpleado = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!nombre.trim() || !email.trim()) {
      toast.warning('Campos requeridos', 'Por favor ingresa nombre y correo electrónico.')
      return
    }

    setGuardando(true)
    try {
      const horariosPayload: HorarioEmpleado[] = horariosForm.map((h, idx) => ({
        id: empleadoEnEdicion?.horarios?.[idx]?.id || Math.floor(Math.random() * 90000) + 1000,
        empleado_id: empleadoEnEdicion?.id || 0,
        dia_semana: h.dia_semana,
        hora_inicio: h.hora_inicio,
        hora_fin: h.hora_fin,
        activo: h.activo,
      }))

      const payload: Partial<Empleado> = {
        nombre: nombre.trim(),
        email: email.trim(),
        telefono: telefono.trim() || undefined,
        especialidad: especialidad.trim() || 'Especialista',
        cargo: especialidad.trim() || 'Especialista',
        bio: bio.trim() || undefined,
        activo,
        horarios: horariosPayload,
      }

      if (empleadoEnEdicion) {
        await empleadosService.update(empleadoEnEdicion.id, payload)
        toast.success('Empleado actualizado', `${nombre} ha sido actualizado correctamente.`)
      } else {
        await empleadosService.create(payload)
        toast.success('Empleado registrado', `${nombre} ha sido añadido al equipo.`)
      }

      setModalFormAbierto(false)
      cargarEmpleados()
    } catch (err) {
      toast.error('Error al guardar', err instanceof Error ? err.message : 'No se pudo guardar el empleado.')
    } finally {
      setGuardando(false)
    }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            Equipo y {profesionalesTerm}
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Gestiona tu personal, asigna especialidades y administra sus horarios laborales
          </p>
        </div>

        <Button
          onClick={abrirModalCrear}
          leftIcon={<Plus className="w-4 h-4" />}
        >
          Nuevo {profesionalTerm}
        </Button>
      </div>

      {/* Grid de Empleados */}
      {cargando ? (
        <Loader text={`Cargando ${profesionalesTerm.toLowerCase()}...`} />
      ) : empleados.length === 0 ? (
        <EmptyState
          title={`No hay ${profesionalesTerm.toLowerCase()} registrados`}
          description="Añade miembros al equipo para asignarles servicios y horarios."
          actionLabel={`Añadir ${profesionalTerm}`}
          onAction={abrirModalCrear}
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
                        {emp.especialidad ?? emp.cargo ?? 'Especialista'}
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
                    <Mail className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                    <span className="truncate">{emp.email}</span>
                  </div>
                  {emp.telefono && (
                    <div className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                      <span>{emp.telefono}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                <span className="text-xs text-slate-400 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  {emp.horarios?.filter((h) => h.activo).length ?? 5} días activos
                </span>

                <div className="flex items-center gap-1.5">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => abrirModalEditar(emp)}
                    title="Editar profesional y horarios"
                  >
                    <Edit2 className="w-3.5 h-3.5 mr-1" />
                    Editar
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setEmpleadoSeleccionado(emp)}
                  >
                    Horario
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Horarios del Empleado (Vista Rápida) */}
      {empleadoSeleccionado && (
        <Modal
          isOpen={true}
          onClose={() => setEmpleadoSeleccionado(null)}
          title={`Horario de ${empleadoSeleccionado.nombre}`}
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs text-slate-500 pb-2 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-primary-500" />
                <span>Jornada laboral habitual por día de la semana:</span>
              </div>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  const emp = empleadoSeleccionado
                  setEmpleadoSeleccionado(null)
                  abrirModalEditar(emp)
                }}
              >
                Editar Horario
              </Button>
            </div>

            <div className="space-y-2">
              {empleadoSeleccionado.horarios && empleadoSeleccionado.horarios.length > 0 ? (
                empleadoSeleccionado.horarios.map((h) => (
                  <div
                    key={h.id || h.dia_semana}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 text-xs font-medium"
                  >
                    <span className="font-bold text-slate-700 dark:text-slate-300 w-24">
                      {DIAS_NOMBRES[h.dia_semana]}
                    </span>
                    <span className="text-slate-500 dark:text-slate-400">
                      {h.activo ? `${h.hora_inicio} — ${h.hora_fin}` : 'Día de descanso'}
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

      {/* Modal Crear / Editar Empleado */}
      {modalFormAbierto && (
        <Modal
          isOpen={true}
          onClose={() => !guardando && setModalFormAbierto(false)}
          title={empleadoEnEdicion ? `Editar a ${empleadoEnEdicion.nombre}` : `Nuevo ${profesionalTerm}`}
        >
          <form onSubmit={handleGuardarEmpleado} className="space-y-4 max-h-[75vh] overflow-y-auto pr-1">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                label="Nombre Completo *"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder="Ej. Valeria Mendoza"
                required
              />
              <Input
                label="Correo Electrónico *"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="valeria@sagitta.io"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                label="Teléfono / WhatsApp"
                value={telefono}
                onChange={(e) => setTelefono(e.target.value)}
                placeholder="+56 9 8765 4321"
              />
              <Input
                label="Especialidad o Cargo"
                value={especialidad}
                onChange={(e) => setEspecialidad(e.target.value)}
                placeholder="Ej. Colorista Senior, Fisioterapeuta"
              />
            </div>

            <Textarea
              label="Biografía / Presentación"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Breve reseña sobre experiencia o certificaciones..."
              rows={2}
            />

            <div className="flex items-center gap-2 p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200/50 dark:border-slate-700/50">
              <input
                type="checkbox"
                id="emp-activo"
                checked={activo}
                onChange={(e) => setActivo(e.target.checked)}
                className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500 cursor-pointer"
              />
              <label htmlFor="emp-activo" className="text-xs font-semibold text-slate-700 dark:text-slate-200 cursor-pointer">
                Profesional Activo (Disponible para reservas y asignación de citas)
              </label>
            </div>

            {/* Configuración de Horario Semanal */}
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Horarios y Días Laborales
                </span>
                <span className="text-[11px] text-slate-400">
                  Marca los días activos y configura los turnos
                </span>
              </div>

              <div className="space-y-2">
                {horariosForm.map((item) => (
                  <div
                    key={item.dia_semana}
                    className={`flex items-center justify-between p-2.5 rounded-lg border text-xs transition-colors ${
                      item.activo
                        ? 'bg-white dark:bg-slate-800/80 border-slate-200 dark:border-slate-700'
                        : 'bg-slate-50/50 dark:bg-slate-900/40 border-dashed border-slate-200 dark:border-slate-800 opacity-60'
                    }`}
                  >
                    <label className="flex items-center gap-2 w-28 cursor-pointer font-medium text-slate-700 dark:text-slate-300">
                      <input
                        type="checkbox"
                        checked={item.activo}
                        onChange={() => toggleDia(item.dia_semana)}
                        className="w-3.5 h-3.5 text-primary-600 rounded cursor-pointer"
                      />
                      <span>{DIAS_NOMBRES[item.dia_semana]}</span>
                    </label>

                    {item.activo ? (
                      <div className="flex items-center gap-1.5">
                        <input
                          type="time"
                          value={item.hora_inicio}
                          onChange={(e) => updateHoraInicio(item.dia_semana, e.target.value)}
                          className="px-2 py-1 text-xs rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200"
                        />
                        <span className="text-slate-400">—</span>
                        <input
                          type="time"
                          value={item.hora_fin}
                          onChange={(e) => updateHoraFin(item.dia_semana, e.target.value)}
                          className="px-2 py-1 text-xs rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200"
                        />
                      </div>
                    ) : (
                      <span className="text-slate-400 italic text-[11px]">Día Libre</span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
              <Button
                variant="ghost"
                type="button"
                onClick={() => setModalFormAbierto(false)}
                disabled={guardando}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                loading={guardando}
                leftIcon={<CheckCircle2 className="w-4 h-4" />}
              >
                {empleadoEnEdicion ? 'Guardar Cambios' : 'Registrar Empleado'}
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  )
}
