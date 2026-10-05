import { useState, useEffect } from 'react'
import {
  ListOrdered,
  Plus,
  Calendar,
  XCircle,
  Bell,
  Clock,
  Sparkles,
} from 'lucide-react'
import { ItemListaEspera, EstadoListaEspera, Servicio, Empleado, Recurso } from '@/types'
import { listaEsperaService } from '@/services/listaEspera.service'
import { serviciosService } from '@/services/servicios.service'
import { empleadosService } from '@/services/empleados.service'
import { recursosService } from '@/services/recursos.service'
import { Button, Modal, Badge, Loader } from '@/components/ui'
import { useToast } from '@/hooks/useToast'

interface GestionListaEsperaProps {
  onActualizarCitas?: () => void
}

export function GestionListaEspera({ onActualizarCitas }: GestionListaEsperaProps) {
  const [lista, setLista] = useState<ItemListaEspera[]>([])
  const [servicios, setServicios] = useState<Servicio[]>([])
  const [empleados, setEmpleados] = useState<Empleado[]>([])
  const [recursos, setRecursos] = useState<Recurso[]>([])
  const [cargando, setCargando] = useState(true)
  const [modalNuevoOpen, setModalNuevoOpen] = useState(false)
  const [modalConvertirItem, setModalConvertirItem] = useState<ItemListaEspera | null>(null)

  // Campos para agendar cita desde espera
  const [fechaAgendar, setFechaAgendar] = useState('')
  const [horaInicioAgendar, setHoraInicioAgendar] = useState('10:00')
  const [empleadoAgendarId, setEmpleadoAgendarId] = useState<number | undefined>()
  const [recursoAgendarId, setRecursoAgendarId] = useState<number | undefined>()

  // Formulario nuevo ítem lista de espera
  const [formNombre, setFormNombre] = useState('')
  const [formEmail, setFormEmail] = useState('')
  const [formTelefono, setFormTelefono] = useState('')
  const [formServicioId, setFormServicioId] = useState<number>(0)
  const [formEmpleadoId, setFormEmpleadoId] = useState<number | undefined>()
  const [formFechaDeseada, setFormFechaDeseada] = useState(
    new Date().toISOString().slice(0, 10)
  )
  const [formHoraPreferente, setFormHoraPreferente] = useState('Tarde')
  const [formNotas, setFormNotas] = useState('')

  const { toast } = useToast()

  const cargarDatos = async () => {
    try {
      const [resLista, resServ, resEmp, resRec] = await Promise.all([
        listaEsperaService.getLista(),
        serviciosService.getAll({ activo: 'true' }),
        empleadosService.getAll({ activo: 'true' }),
        recursosService.getAll({ activo: true }),
      ])
      if (resLista.data) setLista(resLista.data)
      if (resServ.data) {
        setServicios(resServ.data)
        if (resServ.data.length > 0 && !formServicioId) {
          setFormServicioId(resServ.data[0].id)
        }
      }
      if (resEmp.data) setEmpleados(resEmp.data)
      if (resRec.data) setRecursos(resRec.data)
    } catch (err) {
      toast.error('Error al cargar lista de espera', err instanceof Error ? err.message : 'Error')
    } finally {
      setCargando(false)
    }
  }

  useEffect(() => {
    cargarDatos()
  }, [])

  const handleCrearItem = async (e: React.FormEvent) => {
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

    try {
      await listaEsperaService.agregar({
        cliente_id: 1,
        cliente: {
          id: 1,
          nombre: formNombre,
          email: formEmail || `${formNombre.toLowerCase().replace(/\s+/g, '')}@cliente.local`,
          telefono: formTelefono,
          total_citas: 0,
          created_at: new Date().toISOString(),
        },
        servicio_id: serv.id,
        servicio: serv,
        empleado_id: emp?.id,
        empleado: emp,
        fecha_deseada: formFechaDeseada,
        hora_preferente: formHoraPreferente,
        notas: formNotas,
      })
      toast.success('Registrado', 'Cliente agregado a la lista de espera')
      setFormNombre('')
      setFormEmail('')
      setFormTelefono('')
      setFormNotas('')
      setModalNuevoOpen(false)
      cargarDatos()
    } catch (err) {
      toast.error('Error', err instanceof Error ? err.message : 'Error')
    }
  }

  const handleNotificar = async (item: ItemListaEspera) => {
    try {
      await listaEsperaService.actualizarEstado(item.id, 'notificado')
      toast.success('Notificación enviada', `Se notificó a ${item.cliente?.nombre || 'cliente'} de disponibilidad`)
      cargarDatos()
    } catch (err) {
      toast.error('Error al notificar', err instanceof Error ? err.message : 'Error')
    }
  }

  const handleAbrirAgendar = (item: ItemListaEspera) => {
    setModalConvertirItem(item)
    setFechaAgendar(item.fecha_deseada || new Date().toISOString().slice(0, 10))
    setHoraInicioAgendar('10:00')
    setEmpleadoAgendarId(item.empleado_id || (empleados[0]?.id ?? undefined))
    setRecursoAgendarId(recursos[0]?.id ?? undefined)
  }

  const handleConfirmarAgendarCita = async () => {
    if (!modalConvertirItem) return
    const duracion = modalConvertirItem.servicio?.duracion_base_min || 30
    const [h, m] = horaInicioAgendar.split(':').map(Number)
    const endMinutes = h * 60 + m + duracion
    const endH = Math.floor(endMinutes / 60)
    const endM = endMinutes % 60
    const horaFinStr = `${String(endH).padStart(2, '0')}:${String(endM).padStart(2, '0')}`

    const fechaInicioCompleta = `${fechaAgendar} ${horaInicioAgendar}`
    const fechaFinCompleta = `${fechaAgendar} ${horaFinStr}`

    try {
      await listaEsperaService.convertirEnCita(
        modalConvertirItem.id,
        fechaInicioCompleta,
        fechaFinCompleta,
        empleadoAgendarId,
        recursoAgendarId
      )
      toast.success('Cita Agendada', `El cliente fue agendado exitosamente para el ${fechaInicioCompleta}`)
      setModalConvertirItem(null)
      await cargarDatos()
      onActualizarCitas?.()
    } catch (err) {
      toast.error('No se pudo agendar la cita', err instanceof Error ? err.message : 'Conflicto de horario')
    }
  }

  const handleEliminar = async (id: number) => {
    try {
      await listaEsperaService.eliminar(id)
      toast.info('Registro eliminado', 'Se quitó el registro de la lista de espera')
      cargarDatos()
    } catch (err) {
      toast.error('Error', err instanceof Error ? err.message : 'Error')
    }
  }

  const badgeEstado: Record<EstadoListaEspera, { variant: 'warning' | 'info' | 'success' | 'danger'; label: string }> = {
    en_espera: { variant: 'warning', label: 'En Espera' },
    notificado: { variant: 'info', label: 'Notificado' },
    convertido: { variant: 'success', label: 'Convertido a Cita' },
    cancelado: { variant: 'danger', label: 'Cancelado' },
  }

  if (cargando) {
    return <Loader text="Cargando lista de espera..." />
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 rounded-xl">
            <ListOrdered className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              Lista de Espera Inteligente
              <Badge variant="warning">{lista.filter((i) => i.estado === 'en_espera').length} activos</Badge>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Registra clientes interesados en horarios copados y asígnales slots liberados con un solo clic
            </p>
          </div>
        </div>

        <Button
          onClick={() => setModalNuevoOpen(true)}
          leftIcon={<Plus className="w-4 h-4" />}
          variant="primary"
        >
          Añadir a Lista de Espera
        </Button>
      </div>

      {/* Tabla de registros */}
      <div className="card p-0 overflow-hidden border border-slate-200 dark:border-slate-700">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 dark:bg-slate-800/80 text-xs font-semibold text-slate-600 dark:text-slate-400 border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="px-5 py-3.5">Cliente</th>
                <th className="px-5 py-3.5">Servicio Solicitado</th>
                <th className="px-5 py-3.5">Profesional Preferente</th>
                <th className="px-5 py-3.5">Fecha y Preferencia</th>
                <th className="px-5 py-3.5">Estado</th>
                <th className="px-5 py-3.5 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {lista.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-slate-400 text-xs italic">
                    No hay solicitudes en lista de espera actualmente.
                  </td>
                </tr>
              ) : (
                lista.map((item) => {
                  const b = badgeEstado[item.estado] ?? { variant: 'default', label: item.estado }
                  return (
                    <tr
                      key={item.id}
                      className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      <td className="px-5 py-3.5">
                        <p className="font-bold text-slate-900 dark:text-slate-100">
                          {item.cliente?.nombre}
                        </p>
                        <p className="text-xs text-slate-400">{item.cliente?.telefono || item.cliente?.email}</p>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="font-medium text-slate-800 dark:text-slate-200">
                          {item.servicio?.nombre}
                        </span>
                        <p className="text-xs text-slate-400">
                          {item.servicio?.duracion_base_min} min
                        </p>
                      </td>
                      <td className="px-5 py-3.5 text-xs text-slate-700 dark:text-slate-300">
                        {item.empleado?.nombre || 'Cualquiera disponible'}
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-800 dark:text-slate-200">
                          <Calendar className="w-3.5 h-3.5 text-primary-500" />
                          <span>{item.fecha_deseada}</span>
                        </div>
                        {item.hora_preferente && (
                          <div className="flex items-center gap-1 text-[11px] text-slate-400 mt-0.5">
                            <Clock className="w-3 h-3 text-amber-500" />
                            <span>Pref: {item.hora_preferente}</span>
                          </div>
                        )}
                      </td>
                      <td className="px-5 py-3.5">
                        <Badge variant={b.variant} dot>
                          {b.label}
                        </Badge>
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {item.estado === 'en_espera' && (
                            <>
                              <Button
                                size="sm"
                                variant="primary"
                                onClick={() => handleAbrirAgendar(item)}
                                leftIcon={<Sparkles className="w-3.5 h-3.5" />}
                              >
                                Agendar Cita
                              </Button>
                              <Button
                                size="sm"
                                variant="secondary"
                                onClick={() => handleNotificar(item)}
                                leftIcon={<Bell className="w-3.5 h-3.5 text-amber-600" />}
                              >
                                Notificar
                              </Button>
                            </>
                          )}
                          <button
                            onClick={() => handleEliminar(item.id)}
                            className="p-1.5 text-slate-400 hover:text-red-500 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                            title="Quitar de la lista"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Añadir a Lista de Espera */}
      <Modal
        isOpen={modalNuevoOpen}
        onClose={() => setModalNuevoOpen(false)}
        title="Registrar en Lista de Espera"
      >
        <form onSubmit={handleCrearItem} className="space-y-4 text-sm">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Nombre del Cliente *
            </label>
            <input
              type="text"
              required
              value={formNombre}
              onChange={(e) => setFormNombre(e.target.value)}
              placeholder="Ej: Sofía Ramírez"
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Teléfono de Contacto
              </label>
              <input
                type="tel"
                value={formTelefono}
                onChange={(e) => setFormTelefono(e.target.value)}
                placeholder="+1 555-0188"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary-500 text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Correo Electrónico
              </label>
              <input
                type="email"
                value={formEmail}
                onChange={(e) => setFormEmail(e.target.value)}
                placeholder="sofia@email.com"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary-500 text-xs"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Servicio Deseado *
            </label>
            <select
              value={formServicioId}
              onChange={(e) => setFormServicioId(Number(e.target.value))}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              {servicios.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.nombre} ({s.duracion_base_min} min)
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Profesional
              </label>
              <select
                value={formEmpleadoId || ''}
                onChange={(e) => setFormEmpleadoId(e.target.value ? Number(e.target.value) : undefined)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary-500 text-xs"
              >
                <option value="">Cualquiera</option>
                {empleados.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.nombre}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Fecha Deseada *
              </label>
              <input
                type="date"
                required
                value={formFechaDeseada}
                onChange={(e) => setFormFechaDeseada(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary-500 text-xs"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Preferencia Horaria / Rango Deseado
            </label>
            <input
              type="text"
              value={formHoraPreferente}
              onChange={(e) => setFormHoraPreferente(e.target.value)}
              placeholder="Ej: Después de las 16:00 o cualquier mañana"
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary-500 text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Notas Adicionales
            </label>
            <textarea
              rows={2}
              value={formNotas}
              onChange={(e) => setFormNotas(e.target.value)}
              placeholder="Detalles o flexibilidad de horarios..."
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary-500 text-xs"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <Button variant="secondary" onClick={() => setModalNuevoOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" variant="primary">
              Guardar en Lista de Espera
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal: Agendar Cita Directa desde Lista de Espera */}
      {modalConvertirItem && (
        <Modal
          isOpen={true}
          onClose={() => setModalConvertirItem(null)}
          title={`Agendar Cita — ${modalConvertirItem.cliente?.nombre}`}
        >
          <div className="space-y-4 text-sm">
            <div className="p-3 bg-primary-50/50 dark:bg-primary-950/20 rounded-xl space-y-1 border border-primary-100 dark:border-primary-900/30">
              <p className="font-bold text-slate-900 dark:text-slate-100">
                {modalConvertirItem.servicio?.nombre}
              </p>
              <p className="text-xs text-slate-500">
                Duración: {modalConvertirItem.servicio?.duracion_base_min} min | Preferencia: {modalConvertirItem.hora_preferente}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Fecha de la Cita *
                </label>
                <input
                  type="date"
                  value={fechaAgendar}
                  onChange={(e) => setFechaAgendar(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary-500 text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Hora de Inicio *
                </label>
                <input
                  type="time"
                  value={horaInicioAgendar}
                  onChange={(e) => setHoraInicioAgendar(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary-500 text-xs"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Profesional
              </label>
              <select
                value={empleadoAgendarId || ''}
                onChange={(e) => setEmpleadoAgendarId(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary-500 text-xs"
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
                Sala o Recurso Físico
              </label>
              <select
                value={recursoAgendarId || ''}
                onChange={(e) => setRecursoAgendarId(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary-500 text-xs"
              >
                {recursos.map((rec) => (
                  <option key={rec.id} value={rec.id}>
                    {rec.nombre} ({rec.tipo} - Capacidad: {rec.capacidad})
                  </option>
                ))}
              </select>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <Button variant="secondary" onClick={() => setModalConvertirItem(null)}>
                Volver
              </Button>
              <Button variant="primary" onClick={handleConfirmarAgendarCita}>
                Confirmar y Agendar
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}
