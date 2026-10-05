import { useState, useEffect, useMemo } from 'react'
import {
  Plus,
  Search,
  Mail,
  Phone,
  Calendar,
  Tag,
  DollarSign,
  Eye,
  Filter,
} from 'lucide-react'
import { Cliente, TipoDocumentoCliente, CanalContactoCliente } from '@/types'
import { clientesService } from '@/services/clientes.service'
import { Button, Input, Select, Modal, Loader, EmptyState, Pagination } from '@/components/ui'
import { ModalExpedienteCliente } from '@/components/clientes/ModalExpedienteCliente'
import { useToast } from '@/hooks/useToast'
import { useModules } from '@/context/ModulesContext'
import { sanitizeText } from '@/utils/sanitize'
import { formatTelefonoVE, handleOnlyNumbersKeyDown } from '@/utils/phone'

export default function ClientesPage() {
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [busqueda, setBusqueda] = useState('')
  const [filtroTag, setFiltroTag] = useState<string>('todos')
  const [cargando, setCargando] = useState(true)

  // Expediente 360°
  const [clienteSeleccionado, setClienteSeleccionado] = useState<Cliente | null>(null)
  const [modalExpedienteAbierto, setModalExpedienteAbierto] = useState(false)

  // Modal Nuevo Cliente
  const [modalNuevoAbierto, setModalNuevoAbierto] = useState(false)
  const [nuevoCliente, setNuevoCliente] = useState<Partial<Cliente>>({
    nombre: '',
    apellido: '',
    tipo_documento: 'CI',
    documento_identidad: '',
    email: '',
    telefono: '',
    ciudad: '',
    direccion: '',
    canal_contacto_preferido: 'whatsapp',
    etiquetas: [],
    notas: '',
  })
  const [tagInput, setTagInput] = useState('')

  const { toast } = useToast()
  const { tTerm } = useModules()
  const clienteTerm = tTerm('cliente', 'Cliente')
  const clientesTerm = tTerm('clientes', 'Clientes')
  const citasTerm = tTerm('citas', 'Citas')

  const [pagina, setPagina] = useState(1)
  const ITEMS_POR_PAGINA = 9

  const cargarClientes = (q?: string) => {
    setCargando(true)
    clientesService
      .getAll(q)
      .then((res) => {
        if (res.data) setClientes(res.data)
      })
      .catch((err) => {
        toast.error('Error al cargar clientes', err instanceof Error ? err.message : 'Error')
      })
      .finally(() => setCargando(false))
  }

  useEffect(() => {
    setPagina(1)
    const timer = setTimeout(() => {
      cargarClientes(busqueda)
    }, 300)
    return () => clearTimeout(timer)
  }, [busqueda, filtroTag])

  // Obtener lista única de tags para filtros
  const tagsDisponibles = useMemo(() => {
    const setTags = new Set<string>()
    clientes.forEach((c) => {
      c.etiquetas?.forEach((t) => setTags.add(t))
    })
    return Array.from(setTags)
  }, [clientes])

  const clientesFiltrados = useMemo(() => {
    if (filtroTag === 'todos') return clientes
    return clientes.filter((c) => c.etiquetas?.includes(filtroTag))
  }, [clientes, filtroTag])

  const totalPaginas = Math.ceil(clientesFiltrados.length / ITEMS_POR_PAGINA)
  const clientesPaginados = useMemo(() => {
    return clientesFiltrados.slice((pagina - 1) * ITEMS_POR_PAGINA, pagina * ITEMS_POR_PAGINA)
  }, [clientesFiltrados, pagina])

  const handleCrear = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!nuevoCliente.nombre?.trim() || !nuevoCliente.email?.trim()) {
      toast.warning('Campos requeridos', 'Nombre y correo electrónico son obligatorios')
      return
    }

    try {
      const clienteSanitizado = {
        ...nuevoCliente,
        nombre: sanitizeText(nuevoCliente.nombre),
        apellido: sanitizeText(nuevoCliente.apellido),
        direccion: sanitizeText(nuevoCliente.direccion),
        ciudad: sanitizeText(nuevoCliente.ciudad),
        notas: sanitizeText(nuevoCliente.notas),
      }
      await clientesService.create(clienteSanitizado)
      toast.success(`${clienteTerm} registrado`, `El ${clienteTerm.toLowerCase()} fue agregado al directorio con éxito`)
      setModalNuevoAbierto(false)
      setNuevoCliente({
        nombre: '',
        apellido: '',
        tipo_documento: 'CI',
        documento_identidad: '',
        email: '',
        telefono: '',
        ciudad: '',
        direccion: '',
        canal_contacto_preferido: 'whatsapp',
        etiquetas: [],
        notas: '',
      })
      setTagInput('')
      cargarClientes()
    } catch (err) {
      toast.error('Error al registrar', err instanceof Error ? err.message : 'Error')
    }
  }

  const handleAbrirExpediente = (c: Cliente) => {
    setClienteSeleccionado(c)
    setModalExpedienteAbierto(true)
  }

  const handleActualizarClienteEnLista = (clienteActualizado: Cliente) => {
    setClientes((prev) =>
      prev.map((c) => (c.id === clienteActualizado.id ? clienteActualizado : c))
    )
    setClienteSeleccionado(clienteActualizado)
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            Directorio de {clientesTerm}
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Expediente 360°, historial de atención, paquetes de sesiones, membresías y preferencias
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Buscar por nombre, correo, cédula..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="input-base pl-9 text-xs py-2 w-full"
            />
          </div>

          <Button
            onClick={() => setModalNuevoAbierto(true)}
            leftIcon={<Plus className="w-4 h-4" />}
          >
            Nuevo {clienteTerm}
          </Button>
        </div>
      </div>

      {/* Filtros por Etiquetas / Tags */}
      {tagsDisponibles.length > 0 && (
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          <span className="text-xs font-semibold text-slate-400 flex items-center gap-1 mr-1">
            <Filter className="w-3.5 h-3.5" />
            Segmentos:
          </span>
          <button
            type="button"
            onClick={() => setFiltroTag('todos')}
            className={[
              'px-3 py-1 rounded-xl text-xs font-semibold whitespace-nowrap transition-all',
              filtroTag === 'todos'
                ? 'bg-primary-600 text-white shadow-sm'
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700',
            ].join(' ')}
          >
            Todos ({clientes.length})
          </button>
          {tagsDisponibles.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => setFiltroTag(tag)}
              className={[
                'px-3 py-1 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1',
                filtroTag === tag
                  ? 'bg-primary-600 text-white shadow-sm'
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700',
              ].join(' ')}
            >
              <Tag className="w-3 h-3" />
              {tag}
            </button>
          ))}
        </div>
      )}

      {/* Grid de clientes */}
      {cargando ? (
        <Loader text={`Cargando directorio de ${clientesTerm.toLowerCase()}...`} />
      ) : clientesFiltrados.length === 0 ? (
        <EmptyState
          title={`No se encontraron ${clientesTerm.toLowerCase()}`}
          description={`Agrega nuevos ${clientesTerm.toLowerCase()} para llevar su historial de ${citasTerm.toLowerCase()}, membresías y datos comerciales.`}
          actionLabel={`Agregar ${clienteTerm}`}
          onAction={() => setModalNuevoAbierto(true)}
        />
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {clientesPaginados.map((c) => (
              <div
                key={c.id}
                onClick={() => handleAbrirExpediente(c)}
                className="card p-5 flex flex-col justify-between hover:shadow-lg transition-all border border-slate-100 dark:border-slate-800 cursor-pointer group"
              >
                <div>
                  <div className="flex items-start gap-3.5 mb-3">
                    <div className="w-11 h-11 rounded-2xl bg-primary-100 dark:bg-primary-950/60 text-primary-600 flex items-center justify-center font-bold text-sm flex-shrink-0 group-hover:bg-primary-600 group-hover:text-white transition-colors shadow-sm">
                      {c.nombre.slice(0, 1)}
                      {c.apellido ? c.apellido.slice(0, 1) : ''}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-1">
                        <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100 truncate group-hover:text-primary-600 transition-colors">
                          {c.nombre} {c.apellido || ''}
                        </h4>
                        {c.documento_identidad && (
                          <span className="text-[10px] font-mono text-slate-400 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">
                            {c.documento_identidad}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-400 truncate flex items-center gap-1 mt-0.5">
                        <Mail className="w-3 h-3 flex-shrink-0" />
                        {c.email}
                      </p>
                      {c.telefono && (
                        <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                          <Phone className="w-3 h-3 flex-shrink-0" />
                          {c.telefono}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Etiquetas */}
                  {c.etiquetas && c.etiquetas.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-3">
                      {c.etiquetas.map((t) => (
                        <span
                          key={t}
                          className="text-[10px] font-semibold bg-primary-50 dark:bg-primary-950/40 text-primary-700 dark:text-primary-300 px-2 py-0.5 rounded-md border border-primary-200/60 dark:border-primary-800/60"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Footer de métricas */}
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-400">
                  <span className="flex items-center gap-1 font-semibold text-primary-600 dark:text-primary-400">
                    <Calendar className="w-3.5 h-3.5" />
                    {c.total_citas} {citasTerm.toLowerCase()}
                  </span>

                  {c.total_gastado !== undefined && (
                    <span className="flex items-center gap-0.5 font-bold text-emerald-600 dark:text-emerald-400">
                      <DollarSign className="w-3.5 h-3.5" />
                      {c.total_gastado} total
                    </span>
                  )}

                  <span className="text-slate-400 text-[11px] group-hover:text-primary-500 font-medium flex items-center gap-0.5">
                    <Eye className="w-3 h-3" />
                    Expediente
                  </span>
                </div>
              </div>
            ))}
          </div>

          <Pagination
            currentPage={pagina}
            totalPages={totalPaginas}
            onPageChange={setPagina}
            totalItems={clientesFiltrados.length}
            itemsPerPage={ITEMS_POR_PAGINA}
          />
        </>
      )}

      {/* Modal Expediente 360° */}
      <ModalExpedienteCliente
        cliente={clienteSeleccionado}
        isOpen={modalExpedienteAbierto}
        onClose={() => {
          setModalExpedienteAbierto(false)
          setClienteSeleccionado(null)
        }}
        onClienteActualizado={handleActualizarClienteEnLista}
      />

      {/* Modal Registrar Nuevo Cliente */}
      <Modal
        isOpen={modalNuevoAbierto}
        onClose={() => setModalNuevoAbierto(false)}
        title={`Registrar Nuevo ${clienteTerm} en el Directorio`}
        maxWidth="max-w-2xl"
      >
        <form onSubmit={handleCrear} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Nombre"
              placeholder="Ej: Laura..."
              value={nuevoCliente.nombre || ''}
              onChange={(e) => setNuevoCliente({ ...nuevoCliente, nombre: e.target.value })}
              required
            />
            <Input
              label="Apellidos"
              placeholder="Ej: Morales..."
              value={nuevoCliente.apellido || ''}
              onChange={(e) => setNuevoCliente({ ...nuevoCliente, apellido: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Select
              label="Tipo Documento"
              value={nuevoCliente.tipo_documento || 'CI'}
              onChange={(e) =>
                setNuevoCliente({ ...nuevoCliente, tipo_documento: e.target.value as TipoDocumentoCliente })
              }
              options={[
                { value: 'CI', label: 'Cédula (CI)' },
                { value: 'DNI', label: 'DNI' },
                { value: 'RIF', label: 'RIF' },
                { value: 'pasaporte', label: 'Pasaporte' },
                { value: 'otro', label: 'Otro' },
              ]}
            />
            <div className="sm:col-span-2">
              <Input
                label="Número de Identificación"
                placeholder="Ej: V-18442991"
                value={nuevoCliente.documento_identidad || ''}
                onChange={(e) =>
                  setNuevoCliente({ ...nuevoCliente, documento_identidad: e.target.value })
                }
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Correo Electrónico"
              type="email"
              placeholder="laura@ejemplo.com"
              value={nuevoCliente.email || ''}
              onChange={(e) => setNuevoCliente({ ...nuevoCliente, email: e.target.value })}
              required
            />
            <Input
              label="Teléfono / WhatsApp"
              type="tel"
              placeholder="+58 412 123 4567"
              value={nuevoCliente.telefono || ''}
              onChange={(e) =>
                setNuevoCliente({ ...nuevoCliente, telefono: formatTelefonoVE(e.target.value) })
              }
              onKeyDown={handleOnlyNumbersKeyDown}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Ciudad"
              placeholder="Ej: Caracas"
              value={nuevoCliente.ciudad || ''}
              onChange={(e) => setNuevoCliente({ ...nuevoCliente, ciudad: e.target.value })}
            />
            <Select
              label="Canal Preferido de Contacto"
              value={nuevoCliente.canal_contacto_preferido || 'whatsapp'}
              onChange={(e) =>
                setNuevoCliente({
                  ...nuevoCliente,
                  canal_contacto_preferido: e.target.value as CanalContactoCliente,
                })
              }
              options={[
                { value: 'whatsapp', label: 'WhatsApp' },
                { value: 'email', label: 'Correo Electrónico' },
                { value: 'telefono', label: 'Llamada' },
                { value: 'sms', label: 'SMS' },
              ]}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Etiquetas Iniciales (CRM)
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Escribe etiqueta (ej: VIP) y presiona Enter..."
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    if (tagInput.trim()) {
                      const tags = nuevoCliente.etiquetas || []
                      if (!tags.includes(tagInput.trim())) {
                        setNuevoCliente({
                          ...nuevoCliente,
                          etiquetas: [...tags, tagInput.trim()],
                        })
                      }
                      setTagInput('')
                    }
                  }
                }}
                className="input-base text-xs flex-1"
              />
              <Button
                type="button"
                size="sm"
                variant="secondary"
                onClick={() => {
                  if (tagInput.trim()) {
                    const tags = nuevoCliente.etiquetas || []
                    if (!tags.includes(tagInput.trim())) {
                      setNuevoCliente({
                        ...nuevoCliente,
                        etiquetas: [...tags, tagInput.trim()],
                      })
                    }
                    setTagInput('')
                  }
                }}
              >
                Añadir
              </Button>
            </div>
            {(nuevoCliente.etiquetas || []).length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-2">
                {nuevoCliente.etiquetas?.map((t) => (
                  <span
                    key={t}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs bg-primary-100 text-primary-800 dark:bg-primary-950 dark:text-primary-300"
                  >
                    {t}
                    <button
                      type="button"
                      onClick={() =>
                        setNuevoCliente({
                          ...nuevoCliente,
                          etiquetas: nuevoCliente.etiquetas?.filter((tag) => tag !== t),
                        })
                      }
                      className="font-bold hover:text-red-500"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Notas Iniciales
            </label>
            <textarea
              rows={2}
              placeholder="Preferencias o detalles iniciales..."
              value={nuevoCliente.notas || ''}
              onChange={(e) => setNuevoCliente({ ...nuevoCliente, notas: e.target.value })}
              className="input-base text-xs w-full"
            />
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-200 dark:border-slate-700">
            <Button variant="secondary" type="button" onClick={() => setModalNuevoAbierto(false)}>
              Cancelar
            </Button>
            <Button type="submit">Guardar Cliente</Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
