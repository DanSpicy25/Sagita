import { useState, useEffect } from 'react'
import {
  User,
  Calendar,
  Package,
  Award,
  FileText,
  FileCheck,
  Layers,
  Phone,
  Mail,
  MapPin,
  Plus,
  Save,
  Tag,
  CheckCircle,
  ExternalLink,
  DollarSign,
  Download,
} from 'lucide-react'
import {
  Cliente,
  Cita,
  ClientePaquete,
  ClienteMembresia,
  PaqueteServicio,
  PlanMembresia,
  EstadoCita,
} from '@/types'
import { clientesService } from '@/services/clientes.service'
import { citasService } from '@/services/citas.service'
import { paquetesService } from '@/services/paquetes.service'
import { membresiasService } from '@/services/membresias.service'
import { Modal, Button, Input, Select, Badge, Loader } from '@/components/ui'
import { useToast } from '@/hooks/useToast'
import { formatTelefonoVE, handleOnlyNumbersKeyDown } from '@/utils/phone'

interface ModalExpedienteClienteProps {
  cliente: Cliente | null
  isOpen: boolean
  onClose: () => void
  onClienteActualizado?: (clienteActualizado: Cliente) => void
}

type TabExpediente =
  | 'perfil'
  | 'citas'
  | 'paquetes_membresias'
  | 'notas'
  | 'documentos'
  | 'consentimientos'
  | 'vertical'

const estadoBadges: Record<
  EstadoCita,
  { variant: 'warning' | 'success' | 'danger' | 'default' | 'info'; label: string }
> = {
  pendiente: { variant: 'warning', label: 'Pendiente' },
  confirmada: { variant: 'success', label: 'Confirmada' },
  en_cola: { variant: 'info', label: 'En Cola' },
  en_atencion: { variant: 'warning', label: 'En Atención' },
  completada: { variant: 'default', label: 'Completada' },
  cancelada: { variant: 'danger', label: 'Cancelada' },
  no_asistio: { variant: 'danger', label: 'No asistió' },
  reprogramada: { variant: 'info', label: 'Reprogramada' },
}

export function ModalExpedienteCliente({
  cliente,
  isOpen,
  onClose,
  onClienteActualizado,
}: ModalExpedienteClienteProps) {
  const [tabActiva, setTabActiva] = useState<TabExpediente>('perfil')
  const [formCliente, setFormCliente] = useState<Partial<Cliente>>({})
  const [citasHistorial, setCitasHistorial] = useState<Cita[]>([])
  const [paquetesCliente, setPaquetesCliente] = useState<ClientePaquete[]>([])
  const [membresiasCliente, setMembresiasCliente] = useState<ClienteMembresia[]>([])
  const [catalogoPaquetes, setCatalogoPaquetes] = useState<PaqueteServicio[]>([])
  const [catalogoPlanes, setCatalogoPlanes] = useState<PlanMembresia[]>([])

  // Formularios internos
  const [nuevaNotaTexto, setNuevaNotaTexto] = useState('')
  const [nuevoTagTexto, setNuevoTagTexto] = useState('')
  const [nuevoArchivoNombre, setNuevoArchivoNombre] = useState('')
  const [nuevoConsentimientoTitulo, setNuevoConsentimientoTitulo] = useState('')

  // Modales de asignación
  const [modalAsignarPaquete, setModalAsignarPaquete] = useState(false)
  const [modalAsignarMembresia, setModalAsignarMembresia] = useState(false)
  const [paqueteAAsignarId, setPaqueteAAsignarId] = useState<number>(0)
  const [planAAsignarId, setPlanAAsignarId] = useState<number>(0)

  const [cargando, setCargando] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    if (cliente && isOpen) {
      setFormCliente({ ...cliente })
      cargarDatosRelacionados(cliente.id)
    }
  }, [cliente, isOpen])

  const cargarDatosRelacionados = async (clienteId: number) => {
    setCargando(true)
    try {
      const [resCitas, resPaqCli, resMemCli, resCatPaq, resCatMem] = await Promise.all([
        citasService.getAll({ cliente_id: String(clienteId) }),
        paquetesService.getClientesPaquetes(clienteId),
        membresiasService.getClientesMembresias(clienteId),
        paquetesService.getAll({ activo: true }),
        membresiasService.getAll({ activo: true }),
      ])

      if (resCitas.data) setCitasHistorial(resCitas.data)
      if (resPaqCli.data) setPaquetesCliente(resPaqCli.data)
      if (resMemCli.data) setMembresiasCliente(resMemCli.data)
      if (resCatPaq.data) {
        setCatalogoPaquetes(resCatPaq.data)
        if (resCatPaq.data.length > 0) setPaqueteAAsignarId(resCatPaq.data[0].id)
      }
      if (resCatMem.data) {
        setCatalogoPlanes(resCatMem.data)
        if (resCatMem.data.length > 0) setPlanAAsignarId(resCatMem.data[0].id)
      }
    } catch (err) {
      toast.error('Error', err instanceof Error ? err.message : 'Error al cargar expediente')
    } finally {
      setCargando(false)
    }
  }

  if (!cliente) return null

  // Guardar Cambios del Perfil
  const handleGuardarPerfil = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const res = await clientesService.update(cliente.id, formCliente)
      toast.success('Cliente actualizado', 'Los datos del expediente fueron guardados')
      if (res.data && onClienteActualizado) {
        onClienteActualizado(res.data)
      }
    } catch (err) {
      toast.error('Error al guardar', err instanceof Error ? err.message : 'Error')
    }
  }

  // Agregar Nota
  const handleAgregarNota = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!nuevaNotaTexto.trim()) return

    try {
      const res = await clientesService.agregarNota(cliente.id, 'Personal Sagitta', nuevaNotaTexto.trim())
      toast.success('Nota registrada', 'Se agregó la nota a la bitácora')
      setNuevaNotaTexto('')
      if (res.data) {
        setFormCliente(res.data)
        if (onClienteActualizado) onClienteActualizado(res.data)
      }
    } catch (err) {
      toast.error('Error', err instanceof Error ? err.message : 'Error al agregar nota')
    }
  }

  // Tags
  const handleAgregarTag = async () => {
    if (!nuevoTagTexto.trim()) return
    const tag = nuevoTagTexto.trim()
    const tagsActuales = formCliente.etiquetas || []
    if (tagsActuales.includes(tag)) {
      setNuevoTagTexto('')
      return
    }
    const nuevosTags = [...tagsActuales, tag]
    try {
      const res = await clientesService.actualizarEtiquetas(cliente.id, nuevosTags)
      setFormCliente({ ...formCliente, etiquetas: nuevosTags })
      setNuevoTagTexto('')
      if (res.data && onClienteActualizado) onClienteActualizado(res.data)
      toast.success('Etiqueta agregada', `Se añadió la etiqueta ${tag}`)
    } catch (err) {
      toast.error('Error', err instanceof Error ? err.message : 'Error al agregar etiqueta')
    }
  }

  const handleEliminarTag = async (tagAEliminar: string) => {
    const nuevosTags = (formCliente.etiquetas || []).filter((t) => t !== tagAEliminar)
    try {
      const res = await clientesService.actualizarEtiquetas(cliente.id, nuevosTags)
      setFormCliente({ ...formCliente, etiquetas: nuevosTags })
      if (res.data && onClienteActualizado) onClienteActualizado(res.data)
    } catch (err) {
      toast.error('Error', err instanceof Error ? err.message : 'Error al remover etiqueta')
    }
  }

  // Agregar Archivo
  const handleAgregarArchivo = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!nuevoArchivoNombre.trim()) return
    try {
      const res = await clientesService.agregarArchivo(cliente.id, {
        nombre: nuevoArchivoNombre.trim(),
        tipo: nuevoArchivoNombre.endsWith('.pdf') ? 'pdf' : 'documento',
        tamano: '1.5 MB',
      })
      toast.success('Archivo registrado', 'Se vinculó el documento al expediente')
      setNuevoArchivoNombre('')
      if (res.data) {
        setFormCliente(res.data)
        if (onClienteActualizado) onClienteActualizado(res.data)
      }
    } catch (err) {
      toast.error('Error', err instanceof Error ? err.message : 'Error al registrar archivo')
    }
  }

  // Agregar Consentimiento
  const handleRegistrarConsentimiento = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!nuevoConsentimientoTitulo.trim()) return
    try {
      const res = await clientesService.registrarConsentimiento(cliente.id, {
        titulo: nuevoConsentimientoTitulo.trim(),
        version: '1.0',
      })
      toast.success('Consentimiento guardado', 'Se registró el consentimiento firmado')
      setNuevoConsentimientoTitulo('')
      if (res.data) {
        setFormCliente(res.data)
        if (onClienteActualizado) onClienteActualizado(res.data)
      }
    } catch (err) {
      toast.error('Error', err instanceof Error ? err.message : 'Error al registrar consentimiento')
    }
  }

  // Consumir Sesión de Paquete
  const handleConsumirSesion = async (cpId: number) => {
    try {
      await paquetesService.consumirSesion(cpId, 'Sesión canjeada en recepción')
      toast.success('Sesión canjeada', 'Se actualizó el saldo de sesiones del cliente')
      const res = await paquetesService.getClientesPaquetes(cliente.id)
      if (res.data) setPaquetesCliente(res.data)
    } catch (err) {
      toast.error('Error', err instanceof Error ? err.message : 'Error al consumir sesión')
    }
  }

  // Asignar Paquete
  const handleAsignarPaquete = async () => {
    if (!paqueteAAsignarId) return
    try {
      await paquetesService.asignarACliente(cliente.id, paqueteAAsignarId)
      toast.success('Paquete asignado', 'El paquete fue acreditado al cliente con éxito')
      setModalAsignarPaquete(false)
      const res = await paquetesService.getClientesPaquetes(cliente.id)
      if (res.data) setPaquetesCliente(res.data)
    } catch (err) {
      toast.error('Error', err instanceof Error ? err.message : 'Error al asignar paquete')
    }
  }

  // Asignar Membresía
  const handleAsignarMembresia = async () => {
    if (!planAAsignarId) return
    try {
      await membresiasService.asignarACliente(cliente.id, planAAsignarId)
      toast.success('Membresía activada', 'El cliente ha sido suscrito al plan')
      setModalAsignarMembresia(false)
      const res = await membresiasService.getClientesMembresias(cliente.id)
      if (res.data) setMembresiasCliente(res.data)
    } catch (err) {
      toast.error('Error', err instanceof Error ? err.message : 'Error al asignar membresía')
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Expediente Comercial 360° — ${cliente.nombre} ${cliente.apellido || ''}`}
      maxWidth="max-w-5xl"
    >
      <div className="space-y-6">
        {/* Banner Resumen del Cliente */}
        <div className="bg-slate-50 dark:bg-slate-900/60 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-primary-600 text-white flex items-center justify-center font-bold text-xl shadow-md">
              {cliente.nombre.slice(0, 1).toUpperCase()}
              {cliente.apellido ? cliente.apellido.slice(0, 1).toUpperCase() : ''}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-lg text-slate-900 dark:text-slate-100">
                  {cliente.nombre} {cliente.apellido || ''}
                </h3>
                {cliente.documento_identidad && (
                  <span className="text-xs bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-mono px-2 py-0.5 rounded-md">
                    {cliente.tipo_documento || 'DOC'}: {cliente.documento_identidad}
                  </span>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400 mt-1">
                <span className="flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5 text-primary-500" />
                  {cliente.email}
                </span>
                {cliente.telefono && (
                  <span className="flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5 text-emerald-500" />
                    {cliente.telefono}
                  </span>
                )}
                {cliente.ciudad && (
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-amber-500" />
                    {cliente.ciudad}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4 pt-3 md:pt-0 border-t md:border-t-0 border-slate-200 dark:border-slate-700">
            <div className="text-right">
              <span className="text-xs text-slate-400 block">Total Invertido</span>
              <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400 flex items-center justify-end">
                <DollarSign className="w-4 h-4" />
                {cliente.total_gastado || 0}
              </span>
            </div>
            <div className="text-right">
              <span className="text-xs text-slate-400 block">Citas Agendadas</span>
              <span className="text-lg font-bold text-primary-600 dark:text-primary-400">
                {cliente.total_citas}
              </span>
            </div>
          </div>
        </div>

        {/* Tags de CRM */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-slate-400 flex items-center gap-1">
            <Tag className="w-3 h-3" />
            Etiquetas:
          </span>
          {(formCliente.etiquetas || []).map((t) => (
            <span
              key={t}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-primary-50 dark:bg-primary-950/40 text-primary-700 dark:text-primary-300 border border-primary-200 dark:border-primary-800"
            >
              {t}
              <button
                type="button"
                onClick={() => handleEliminarTag(t)}
                className="hover:text-red-500 font-bold ml-0.5"
                title="Eliminar etiqueta"
              >
                ×
              </button>
            </span>
          ))}
          <div className="flex items-center gap-1">
            <input
              type="text"
              placeholder="+ Añadir tag"
              value={nuevoTagTexto}
              onChange={(e) => setNuevoTagTexto(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAgregarTag())}
              className="text-xs py-1 px-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:outline-none focus:ring-1 focus:ring-primary-500 w-28"
            />
            <Button size="sm" variant="ghost" type="button" onClick={handleAgregarTag}>
              +
            </Button>
          </div>
        </div>

        {/* Barra de Pestañas del Expediente */}
        <div className="flex items-center gap-1 overflow-x-auto border-b border-slate-200 dark:border-slate-700 pb-2">
          {[
            { id: 'perfil', label: 'Identidad & Contacto', icon: User },
            { id: 'citas', label: `Historial Citas (${citasHistorial.length})`, icon: Calendar },
            { id: 'paquetes_membresias', label: 'Paquetes & Membresías', icon: Package },
            { id: 'notas', label: `Bitácora / Notas (${formCliente.notas_historial?.length || 0})`, icon: FileText },
            { id: 'documentos', label: `Archivos (${formCliente.archivos?.length || 0})`, icon: ExternalLink },
            { id: 'consentimientos', label: `Consentimientos (${formCliente.consentimientos?.length || 0})`, icon: FileCheck },
            { id: 'vertical', label: 'Datos Vertical', icon: Layers },
          ].map((tab) => {
            const Icon = tab.icon
            const esActiva = tabActiva === tab.id
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setTabActiva(tab.id as TabExpediente)}
                className={[
                  'flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all',
                  esActiva
                    ? 'bg-primary-600 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800',
                ].join(' ')}
              >
                <Icon className="w-3.5 h-3.5" />
                {tab.label}
              </button>
            )
          })}
        </div>

        {/* Contenido de Pestañas */}
        {cargando ? (
          <Loader text="Cargando información del expediente..." />
        ) : (
          <div>
            {/* PESTAÑA 1: PERFIL E IDENTIDAD */}
            {tabActiva === 'perfil' && (
              <form onSubmit={handleGuardarPerfil} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Input
                    label="Nombre"
                    value={formCliente.nombre || ''}
                    onChange={(e) => setFormCliente({ ...formCliente, nombre: e.target.value })}
                    required
                  />
                  <Input
                    label="Apellidos"
                    value={formCliente.apellido || ''}
                    onChange={(e) => setFormCliente({ ...formCliente, apellido: e.target.value })}
                  />
                  <div className="grid grid-cols-3 gap-1">
                    <Select
                      label="Tipo Doc."
                      value={formCliente.tipo_documento || 'CI'}
                      onChange={(e) =>
                        setFormCliente({
                          ...formCliente,
                          tipo_documento: e.target.value as any,
                        })
                      }
                      options={[
                        { value: 'CI', label: 'CI' },
                        { value: 'DNI', label: 'DNI' },
                        { value: 'RIF', label: 'RIF' },
                        { value: 'pasaporte', label: 'Pasaporte' },
                        { value: 'otro', label: 'Otro' },
                      ]}
                    />
                    <div className="col-span-2">
                      <Input
                        label="N° Documento"
                        value={formCliente.documento_identidad || ''}
                        onChange={(e) =>
                          setFormCliente({ ...formCliente, documento_identidad: e.target.value })
                        }
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Input
                    label="Correo Electrónico"
                    type="email"
                    value={formCliente.email || ''}
                    onChange={(e) => setFormCliente({ ...formCliente, email: e.target.value })}
                    required
                  />
                  <Input
                    label="Teléfono Principal"
                    type="tel"
                    value={formCliente.telefono || ''}
                    onChange={(e) =>
                      setFormCliente({ ...formCliente, telefono: formatTelefonoVE(e.target.value) })
                    }
                    onKeyDown={handleOnlyNumbersKeyDown}
                  />
                  <Input
                    label="Teléfono Secundario"
                    type="tel"
                    value={formCliente.telefono_secundario || ''}
                    onChange={(e) =>
                      setFormCliente({
                        ...formCliente,
                        telefono_secundario: formatTelefonoVE(e.target.value),
                      })
                    }
                    onKeyDown={handleOnlyNumbersKeyDown}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Input
                    label="Fecha de Nacimiento"
                    type="date"
                    value={formCliente.fecha_nacimiento || ''}
                    onChange={(e) =>
                      setFormCliente({ ...formCliente, fecha_nacimiento: e.target.value })
                    }
                  />
                  <Select
                    label="Género"
                    value={formCliente.genero || 'prefiero_no_decir'}
                    onChange={(e) =>
                      setFormCliente({ ...formCliente, genero: e.target.value as any })
                    }
                    options={[
                      { value: 'femenino', label: 'Femenino' },
                      { value: 'masculino', label: 'Masculino' },
                      { value: 'otro', label: 'Otro' },
                      { value: 'prefiero_no_decir', label: 'Prefiero no especificar' },
                    ]}
                  />
                  <Select
                    label="Canal Preferido de Contacto"
                    value={formCliente.canal_contacto_preferido || 'whatsapp'}
                    onChange={(e) =>
                      setFormCliente({
                        ...formCliente,
                        canal_contacto_preferido: e.target.value as any,
                      })
                    }
                    options={[
                      { value: 'whatsapp', label: 'WhatsApp' },
                      { value: 'email', label: 'Correo Electrónico' },
                      { value: 'telefono', label: 'Llamada Telefónica' },
                      { value: 'sms', label: 'Mensaje SMS' },
                    ]}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-2">
                    <Input
                      label="Dirección de Habitación"
                      placeholder="Calle, avenida, edificio, número de casa..."
                      value={formCliente.direccion || ''}
                      onChange={(e) => setFormCliente({ ...formCliente, direccion: e.target.value })}
                    />
                  </div>
                  <Input
                    label="Ciudad"
                    value={formCliente.ciudad || ''}
                    onChange={(e) => setFormCliente({ ...formCliente, ciudad: e.target.value })}
                  />
                </div>

                <div className="pt-2">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Notas Generales de Atención
                  </label>
                  <textarea
                    rows={2}
                    value={formCliente.notas || ''}
                    onChange={(e) => setFormCliente({ ...formCliente, notas: e.target.value })}
                    placeholder="Preferencias de atención, restricciones, detalles importantes..."
                    className="input-base text-xs w-full"
                  />
                </div>

                <div className="flex justify-end pt-3">
                  <Button type="submit" leftIcon={<Save className="w-4 h-4" />}>
                    Guardar Cambios de Identidad
                  </Button>
                </div>
              </form>
            )}

            {/* PESTAÑA 2: HISTORIAL DE CITAS */}
            {tabActiva === 'citas' && (
              <div className="space-y-3">
                {citasHistorial.length === 0 ? (
                  <div className="text-center py-10 text-slate-400">
                    <Calendar className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">El cliente aún no tiene citas registradas en el historial.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 font-semibold border-b border-slate-200 dark:border-slate-700">
                        <tr>
                          <th className="p-3">Fecha y Hora</th>
                          <th className="p-3">Servicio</th>
                          <th className="p-3">Profesional</th>
                          <th className="p-3">Estado</th>
                          <th className="p-3 text-right">Monto</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {citasHistorial.map((c) => {
                          const badge = estadoBadges[c.estado] || {
                            variant: 'default',
                            label: c.estado,
                          }
                          return (
                            <tr key={c.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                              <td className="p-3 font-medium text-slate-900 dark:text-slate-100 whitespace-nowrap">
                                {c.fecha_inicio}
                              </td>
                              <td className="p-3 font-semibold text-primary-600 dark:text-primary-400">
                                {c.servicio?.nombre || 'Servicio'}
                              </td>
                              <td className="p-3 text-slate-600 dark:text-slate-300">
                                {c.empleado?.nombre || 'No asignado'}
                              </td>
                              <td className="p-3">
                                <Badge variant={badge.variant} size="sm">
                                  {badge.label}
                                </Badge>
                              </td>
                              <td className="p-3 text-right font-bold text-slate-900 dark:text-slate-100">
                                ${c.precio_total}
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* PESTAÑA 3: PAQUETES Y MEMBRESÍAS */}
            {tabActiva === 'paquetes_membresias' && (
              <div className="space-y-6">
                {/* Sección Paquetes */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                      <Package className="w-4 h-4 text-primary-500" />
                      Paquetes y Bonos de Sesiones
                    </h4>
                    <Button
                      size="sm"
                      variant="secondary"
                      leftIcon={<Plus className="w-3.5 h-3.5" />}
                      onClick={() => setModalAsignarPaquete(true)}
                    >
                      Asignar Paquete
                    </Button>
                  </div>

                  {paquetesCliente.length === 0 ? (
                    <p className="text-xs text-slate-400 py-3 bg-slate-50 dark:bg-slate-900/40 rounded-xl text-center">
                      El cliente no posee paquetes de sesiones activos o comprados.
                    </p>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {paquetesCliente.map((cp) => {
                        const usadas = cp.sesiones_consumidas ?? cp.sesiones_usadas ?? 0
                        const totales = cp.total_sesiones ?? cp.sesiones_totales ?? 1
                        const porcentajeUsado = Math.round((usadas / Math.max(1, totales)) * 100)
                        return (
                          <div
                            key={cp.id}
                            className="card p-4 border border-slate-200 dark:border-slate-800 space-y-3"
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <h5 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                                  {cp.paquete?.nombre || 'Paquete de Sesiones'}
                                </h5>
                                <span className="text-xs text-slate-400">
                                  Válido hasta: {cp.fecha_vencimiento}
                                </span>
                              </div>
                              <Badge
                                variant={
                                  cp.estado === 'activo'
                                    ? 'success'
                                    : cp.estado === 'agotado'
                                    ? 'default'
                                    : 'danger'
                                }
                                size="sm"
                              >
                                {cp.estado.toUpperCase()}
                              </Badge>
                            </div>

                            {/* Barra de progreso de sesiones */}
                            <div>
                              <div className="flex justify-between text-xs font-semibold mb-1">
                                <span>
                                  {cp.sesiones_usadas} de {cp.sesiones_totales} sesiones usadas
                                </span>
                                <span className="text-primary-600 dark:text-primary-400">
                                  {cp.sesiones_restantes} restantes
                                </span>
                              </div>
                              <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                                <div
                                  className="bg-primary-600 h-2 rounded-full transition-all"
                                  style={{ width: `${porcentajeUsado}%` }}
                                />
                              </div>
                            </div>

                            {cp.estado === 'activo' && cp.sesiones_restantes > 0 && (
                              <div className="flex justify-end pt-1">
                                <Button
                                  size="sm"
                                  variant="secondary"
                                  leftIcon={<CheckCircle className="w-3.5 h-3.5 text-emerald-500" />}
                                  onClick={() => handleConsumirSesion(cp.id)}
                                >
                                  Consumir 1 Sesión
                                </Button>
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>

                {/* Sección Membresías */}
                <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                      <Award className="w-4 h-4 text-amber-500" />
                      Membresía / Suscripción Recurrente
                    </h4>
                    <Button
                      size="sm"
                      variant="secondary"
                      leftIcon={<Plus className="w-3.5 h-3.5" />}
                      onClick={() => setModalAsignarMembresia(true)}
                    >
                      Suscribir a Membresía
                    </Button>
                  </div>

                  {membresiasCliente.length === 0 ? (
                    <p className="text-xs text-slate-400 py-3 bg-slate-50 dark:bg-slate-900/40 rounded-xl text-center">
                      El cliente no cuenta con membresías o planes activos.
                    </p>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {membresiasCliente.map((cm) => (
                        <div
                          key={cm.id}
                          className="card p-4 border border-amber-200 dark:border-amber-900/50 bg-amber-50/20 dark:bg-amber-950/10 space-y-3"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider block">
                                PLAN {cm.plan?.periodicidad}
                              </span>
                              <h5 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                                {cm.plan?.nombre}
                              </h5>
                              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                                ${cm.plan?.precio} / {cm.plan?.periodicidad}
                              </span>
                            </div>
                            <Badge
                              variant={cm.estado === 'activa' ? 'success' : 'warning'}
                              size="sm"
                            >
                              {cm.estado.toUpperCase()}
                            </Badge>
                          </div>

                          <div className="text-xs text-slate-600 dark:text-slate-400 space-y-1">
                            <p>Inicio: {cm.fecha_inicio}</p>
                            <p>Próxima Renovación: {cm.fecha_renovacion}</p>
                            {cm.plan?.beneficios && cm.plan.beneficios.length > 0 && (
                              <ul className="list-disc list-inside pt-1 text-[11px] text-slate-500">
                                {cm.plan.beneficios.map((b, idx) => (
                                  <li key={idx}>{b}</li>
                                ))}
                              </ul>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* PESTAÑA 4: NOTAS Y BITÁCORA */}
            {tabActiva === 'notas' && (
              <div className="space-y-4">
                <form onSubmit={handleAgregarNota} className="flex gap-2">
                  <textarea
                    rows={2}
                    placeholder="Escribe una nueva nota interna sobre el cliente..."
                    value={nuevaNotaTexto}
                    onChange={(e) => setNuevaNotaTexto(e.target.value)}
                    className="input-base text-xs flex-1"
                    required
                  />
                  <Button type="submit" leftIcon={<Plus className="w-4 h-4" />}>
                    Añadir Nota
                  </Button>
                </form>

                <div className="space-y-2.5">
                  {(formCliente.notas_historial || []).length === 0 ? (
                    <p className="text-xs text-slate-400 text-center py-6">
                      No hay notas registradas en la bitácora aún.
                    </p>
                  ) : (
                    formCliente.notas_historial?.map((n) => (
                      <div
                        key={n.id}
                        className="p-3.5 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200 dark:border-slate-800 text-xs"
                      >
                        <div className="flex items-center justify-between text-slate-400 text-[11px] mb-1">
                          <span className="font-semibold text-slate-700 dark:text-slate-300">
                            {n.autor}
                          </span>
                          <span>{n.fecha}</span>
                        </div>
                        <p className="text-slate-800 dark:text-slate-200 leading-relaxed">
                          {n.texto}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* PESTAÑA 5: ARCHIVOS Y DOCUMENTOS */}
            {tabActiva === 'documentos' && (
              <div className="space-y-4">
                <form onSubmit={handleAgregarArchivo} className="flex gap-2">
                  <Input
                    placeholder="Nombre del documento (ej: Analisis_Clinico.pdf)..."
                    value={nuevoArchivoNombre}
                    onChange={(e) => setNuevoArchivoNombre(e.target.value)}
                    className="flex-1"
                    required
                  />
                  <Button type="submit" leftIcon={<Plus className="w-4 h-4" />}>
                    Vincular Archivo
                  </Button>
                </form>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {(formCliente.archivos || []).length === 0 ? (
                    <p className="text-xs text-slate-400 text-center py-6 col-span-2">
                      No hay archivos o documentos adjuntos en el expediente.
                    </p>
                  ) : (
                    formCliente.archivos?.map((arch) => (
                      <div
                        key={arch.id}
                        className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-between"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-8 h-8 rounded-lg bg-primary-100 dark:bg-primary-950/50 text-primary-600 flex items-center justify-center flex-shrink-0">
                            <FileText className="w-4 h-4" />
                          </div>
                          <div className="min-w-0">
                            <h5 className="font-semibold text-xs text-slate-900 dark:text-slate-100 truncate">
                              {arch.nombre}
                            </h5>
                            <span className="text-[10px] text-slate-400">
                              {arch.fecha} • {arch.tamano || '1.0 MB'}
                            </span>
                          </div>
                        </div>
                        <a
                          href={arch.url}
                          download
                          className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500"
                          title="Descargar"
                        >
                          <Download className="w-4 h-4" />
                        </a>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* PESTAÑA 6: CONSENTIMIENTOS INFORMADOS */}
            {tabActiva === 'consentimientos' && (
              <div className="space-y-4">
                <form onSubmit={handleRegistrarConsentimiento} className="flex gap-2">
                  <Input
                    placeholder="Título del consentimiento (ej: Consentimiento Tratamiento Láser)..."
                    value={nuevoConsentimientoTitulo}
                    onChange={(e) => setNuevoConsentimientoTitulo(e.target.value)}
                    className="flex-1"
                    required
                  />
                  <Button type="submit" leftIcon={<FileCheck className="w-4 h-4" />}>
                    Firmar / Registrar
                  </Button>
                </form>

                <div className="space-y-2">
                  {(formCliente.consentimientos || []).length === 0 ? (
                    <p className="text-xs text-slate-400 text-center py-6">
                      No hay consentimientos informados registrados para este cliente.
                    </p>
                  ) : (
                    formCliente.consentimientos?.map((cons) => (
                      <div
                        key={cons.id}
                        className="p-3.5 bg-emerald-50/50 dark:bg-emerald-950/20 rounded-xl border border-emerald-200 dark:border-emerald-800 flex items-center justify-between"
                      >
                        <div className="flex items-center gap-3">
                          <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                          <div>
                            <h5 className="font-semibold text-xs text-slate-900 dark:text-slate-100">
                              {cons.titulo}
                            </h5>
                            <span className="text-[10px] text-slate-500">
                              Versión {cons.version || '1.0'} • Aceptado el{' '}
                              {(cons.fecha || cons.fecha_firma) ? new Date(cons.fecha || cons.fecha_firma || '').toLocaleDateString() : 'N/D'}
                            </span>
                          </div>
                        </div>
                        <Badge variant="success" size="sm">
                          FIRMADO
                        </Badge>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* PESTAÑA 7: DATOS ESPECÍFICOS POR VERTICAL */}
            {tabActiva === 'vertical' && (
              <div className="space-y-4">
                <div className="p-4 bg-primary-50/50 dark:bg-primary-950/20 rounded-xl border border-primary-100 dark:border-primary-900 text-xs text-slate-600 dark:text-slate-300">
                  <p className="font-semibold text-primary-700 dark:text-primary-300 mb-1">
                    Extensiones por Vertical Activa
                  </p>
                  <p>
                    Campos personalizados para salud, estética, bienestar o veterinaria sin
                    contaminar la estructura base de la plataforma.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(formCliente.extensiones_vertical || {}).map(([clave, valor]) => (
                    <div key={clave}>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 capitalize">
                        {clave.replace(/_/g, ' ')}
                      </label>
                      <input
                        type="text"
                        value={String(valor)}
                        onChange={(e) => {
                          const nuevas = {
                            ...(formCliente.extensiones_vertical || {}),
                            [clave]: e.target.value,
                          }
                          setFormCliente({ ...formCliente, extensiones_vertical: nuevas })
                        }}
                        className="input-base text-xs w-full"
                      />
                    </div>
                  ))}
                </div>

                <div className="pt-2 flex justify-end">
                  <Button
                    type="button"
                    onClick={async () => {
                      if (!formCliente.extensiones_vertical) return
                      const res = await clientesService.actualizarExtensionesVertical(
                        cliente.id,
                        formCliente.extensiones_vertical
                      )
                      toast.success('Campos de vertical actualizados', 'Se guardaron las extensiones')
                      if (res.data && onClienteActualizado) onClienteActualizado(res.data)
                    }}
                    leftIcon={<Save className="w-4 h-4" />}
                  >
                    Guardar Extensiones
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modal Asignar Paquete */}
      <Modal
        isOpen={modalAsignarPaquete}
        onClose={() => setModalAsignarPaquete(false)}
        title="Asignar Paquete de Sesiones"
      >
        <div className="space-y-4">
          <Select
            label="Seleccionar Paquete de Sesiones"
            value={paqueteAAsignarId}
            onChange={(e) => setPaqueteAAsignarId(Number(e.target.value))}
            options={catalogoPaquetes.map((p) => ({
              value: p.id,
              label: `${p.nombre} — ${p.total_sesiones} sesiones ($${p.precio_total})`,
            }))}
          />
          <div className="flex justify-end gap-2 pt-3">
            <Button variant="secondary" onClick={() => setModalAsignarPaquete(false)}>
              Cancelar
            </Button>
            <Button onClick={handleAsignarPaquete}>Confirmar y Asignar</Button>
          </div>
        </div>
      </Modal>

      {/* Modal Asignar Membresía */}
      <Modal
        isOpen={modalAsignarMembresia}
        onClose={() => setModalAsignarMembresia(false)}
        title="Suscribir a Membresía"
      >
        <div className="space-y-4">
          <Select
            label="Seleccionar Plan de Membresía"
            value={planAAsignarId}
            onChange={(e) => setPlanAAsignarId(Number(e.target.value))}
            options={catalogoPlanes.map((m) => ({
              value: m.id,
              label: `${m.nombre} — $${m.precio}/${m.periodicidad}`,
            }))}
          />
          <div className="flex justify-end gap-2 pt-3">
            <Button variant="secondary" onClick={() => setModalAsignarMembresia(false)}>
              Cancelar
            </Button>
            <Button onClick={handleAsignarMembresia}>Activar Suscripción</Button>
          </div>
        </div>
      </Modal>
    </Modal>
  )
}
