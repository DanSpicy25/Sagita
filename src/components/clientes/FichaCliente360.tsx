import { useState, useEffect } from 'react'
import {
  User,
  Calendar,
  Package,
  FileText,
  FileCheck,
  Layers,
  Phone,
  Mail,
  MapPin,
  Tag,
  ExternalLink,
  DollarSign,
} from 'lucide-react'
import {
  Cliente,
  Cita,
  ClientePaquete,
  ClienteMembresia,
  PaqueteServicio,
  PlanMembresia,
} from '@/types'
import { clientesService } from '@/services/clientes.service'
import { citasService } from '@/services/citas.service'
import { paquetesService } from '@/services/paquetes.service'
import { membresiasService } from '@/services/membresias.service'
import { Modal, Button, Loader } from '@/components/ui'
import { useToast } from '@/hooks/useToast'
import {
  TabPerfil,
  TabCitas,
  TabPaquetesMembresias,
  TabNotasBitacora,
  TabDocumentos,
  TabConsentimientos,
  TabDatosVertical,
} from './tabs'

export interface FichaCliente360Props {
  cliente: Cliente | null
  isOpen: boolean
  onClose: () => void
  onClienteActualizado?: (clienteActualizado: Cliente) => void
}

export type TabExpediente =
  | 'perfil'
  | 'citas'
  | 'paquetes_membresias'
  | 'notas'
  | 'documentos'
  | 'consentimientos'
  | 'vertical'

export function FichaCliente360({
  cliente,
  isOpen,
  onClose,
  onClienteActualizado,
}: FichaCliente360Props) {
  const [tabActiva, setTabActiva] = useState<TabExpediente>('perfil')
  const [formCliente, setFormCliente] = useState<Partial<Cliente>>({})
  const [citasHistorial, setCitasHistorial] = useState<Cita[]>([])
  const [paquetesCliente, setPaquetesCliente] = useState<ClientePaquete[]>([])
  const [membresiasCliente, setMembresiasCliente] = useState<ClienteMembresia[]>([])
  const [catalogoPaquetes, setCatalogoPaquetes] = useState<PaqueteServicio[]>([])
  const [catalogoPlanes, setCatalogoPlanes] = useState<PlanMembresia[]>([])
  const [nuevoTagTexto, setNuevoTagTexto] = useState('')
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
      if (resCatPaq.data) setCatalogoPaquetes(resCatPaq.data)
      if (resCatMem.data) setCatalogoPlanes(resCatMem.data)
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

  // Tags CRM
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

  // Consumir sesión
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

  // Asignar paquete
  const handleAsignarPaquete = async (paqueteId: number) => {
    try {
      await paquetesService.asignarACliente(cliente.id, paqueteId)
      toast.success('Paquete asignado', 'El paquete fue acreditado al cliente con éxito')
      const res = await paquetesService.getClientesPaquetes(cliente.id)
      if (res.data) setPaquetesCliente(res.data)
    } catch (err) {
      toast.error('Error', err instanceof Error ? err.message : 'Error al asignar paquete')
    }
  }

  // Asignar membresía
  const handleAsignarMembresia = async (planId: number) => {
    try {
      await membresiasService.asignarACliente(cliente.id, planId)
      toast.success('Membresía activada', 'El cliente ha sido suscrito al plan')
      const res = await membresiasService.getClientesMembresias(cliente.id)
      if (res.data) setMembresiasCliente(res.data)
    } catch (err) {
      toast.error('Error', err instanceof Error ? err.message : 'Error al asignar membresía')
    }
  }

  // Agregar Nota
  const handleAgregarNota = async (texto: string) => {
    try {
      const res = await clientesService.agregarNota(cliente.id, 'Personal Sagitta', texto)
      toast.success('Nota registrada', 'Se agregó la nota a la bitácora')
      if (res.data) {
        setFormCliente(res.data)
        if (onClienteActualizado) onClienteActualizado(res.data)
      }
    } catch (err) {
      toast.error('Error', err instanceof Error ? err.message : 'Error al agregar nota')
    }
  }

  // Agregar Archivo
  const handleAgregarArchivo = async (nombre: string) => {
    try {
      const res = await clientesService.agregarArchivo(cliente.id, {
        nombre,
        tipo: nombre.endsWith('.pdf') ? 'pdf' : 'documento',
        tamano: '1.5 MB',
      })
      toast.success('Archivo registrado', 'Se vinculó el documento al expediente')
      if (res.data) {
        setFormCliente(res.data)
        if (onClienteActualizado) onClienteActualizado(res.data)
      }
    } catch (err) {
      toast.error('Error', err instanceof Error ? err.message : 'Error al registrar archivo')
    }
  }

  // Registrar Consentimiento
  const handleRegistrarConsentimiento = async (titulo: string) => {
    try {
      const res = await clientesService.registrarConsentimiento(cliente.id, {
        titulo,
        version: '1.0',
      })
      toast.success('Consentimiento guardado', 'Se registró el consentimiento firmado')
      if (res.data) {
        setFormCliente(res.data)
        if (onClienteActualizado) onClienteActualizado(res.data)
      }
    } catch (err) {
      toast.error('Error', err instanceof Error ? err.message : 'Error al registrar consentimiento')
    }
  }

  // Guardar Extensiones Verticales
  const handleGuardarExtensiones = async () => {
    if (!formCliente.extensiones_vertical) return
    try {
      const res = await clientesService.actualizarExtensionesVertical(
        cliente.id,
        formCliente.extensiones_vertical
      )
      toast.success('Campos de vertical actualizados', 'Se guardaron las extensiones')
      if (res.data && onClienteActualizado) onClienteActualizado(res.data)
    } catch (err) {
      toast.error('Error', err instanceof Error ? err.message : 'Error al guardar extensiones')
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
        <div className="bg-surface-subtle p-5 rounded-2xl border border-border flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-primary text-primary-contrast flex items-center justify-center font-bold text-xl shadow-md">
              {cliente.nombre.slice(0, 1).toUpperCase()}
              {cliente.apellido ? cliente.apellido.slice(0, 1).toUpperCase() : ''}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-lg text-text">
                  {cliente.nombre} {cliente.apellido || ''}
                </h3>
                {cliente.documento_identidad && (
                  <span className="text-xs bg-surface border border-border text-text font-mono px-2 py-0.5 rounded-md">
                    {cliente.tipo_documento || 'DOC'}: {cliente.documento_identidad}
                  </span>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-3 text-xs text-text-muted mt-1">
                <span className="flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5 text-primary" />
                  {cliente.email}
                </span>
                {cliente.telefono && (
                  <span className="flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    {cliente.telefono}
                  </span>
                )}
                {cliente.ciudad && (
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                    {cliente.ciudad}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4 pt-3 md:pt-0 border-t md:border-t-0 border-border">
            <div className="text-right">
              <span className="text-xs text-text-muted block">Total Invertido</span>
              <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400 flex items-center justify-end">
                <DollarSign className="w-4 h-4" />
                {cliente.total_gastado || 0}
              </span>
            </div>
            <div className="text-right">
              <span className="text-xs text-text-muted block">Citas Agendadas</span>
              <span className="text-lg font-bold text-primary">
                {cliente.total_citas}
              </span>
            </div>
          </div>
        </div>

        {/* Tags de CRM */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-text-muted flex items-center gap-1">
            <Tag className="w-3 h-3" />
            Etiquetas:
          </span>
          {(formCliente.etiquetas || []).map((t) => (
            <span
              key={t}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-primary-soft text-primary border border-primary/20"
            >
              {t}
              <button
                type="button"
                onClick={() => handleEliminarTag(t)}
                className="hover:text-danger font-bold ml-0.5"
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
              className="text-xs py-1 px-2 rounded-lg border border-border bg-surface focus:outline-none focus:ring-1 focus:ring-primary w-28"
            />
            <Button size="sm" variant="ghost" type="button" onClick={handleAgregarTag}>
              +
            </Button>
          </div>
        </div>

        {/* Barra de Pestañas del Expediente */}
        <div className="flex items-center gap-1 overflow-x-auto border-b border-border pb-2">
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
                    ? 'bg-primary text-primary-contrast shadow-sm'
                    : 'text-text-muted hover:bg-surface-subtle',
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
            {tabActiva === 'perfil' && (
              <TabPerfil
                formCliente={formCliente}
                setFormCliente={setFormCliente}
                onGuardar={handleGuardarPerfil}
              />
            )}

            {tabActiva === 'citas' && <TabCitas citas={citasHistorial} />}

            {tabActiva === 'paquetes_membresias' && (
              <TabPaquetesMembresias
                paquetesCliente={paquetesCliente}
                membresiasCliente={membresiasCliente}
                catalogoPaquetes={catalogoPaquetes}
                catalogoPlanes={catalogoPlanes}
                onConsumirSesion={handleConsumirSesion}
                onAsignarPaquete={handleAsignarPaquete}
                onAsignarMembresia={handleAsignarMembresia}
              />
            )}

            {tabActiva === 'notas' && (
              <TabNotasBitacora
                notas={formCliente.notas_historial || []}
                onAgregarNota={handleAgregarNota}
              />
            )}

            {tabActiva === 'documentos' && (
              <TabDocumentos
                archivos={formCliente.archivos || []}
                onAgregarArchivo={handleAgregarArchivo}
              />
            )}

            {tabActiva === 'consentimientos' && (
              <TabConsentimientos
                consentimientos={formCliente.consentimientos || []}
                onRegistrarConsentimiento={handleRegistrarConsentimiento}
              />
            )}

            {tabActiva === 'vertical' && (
              <TabDatosVertical
                extensiones={formCliente.extensiones_vertical || {}}
                onChangeExtensiones={(nuevas) =>
                  setFormCliente({ ...formCliente, extensiones_vertical: nuevas })
                }
                onGuardar={handleGuardarExtensiones}
              />
            )}
          </div>
        )}
      </div>
    </Modal>
  )
}
