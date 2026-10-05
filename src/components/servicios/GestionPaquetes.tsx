import { useState, useEffect } from 'react'
import {
  Package,
  Plus,
  Edit2,
  Trash2,
  Clock,
  Percent,
  CheckCircle,
  UserCheck,
} from 'lucide-react'
import { PaqueteServicio, Servicio, Cliente } from '@/types'
import { paquetesService } from '@/services/paquetes.service'
import { serviciosService } from '@/services/servicios.service'
import { clientesService } from '@/services/clientes.service'
import { Modal, Button, Input, Select, Badge, Loader, EmptyState } from '@/components/ui'
import { useToast } from '@/hooks/useToast'

export function GestionPaquetes() {
  const [paquetes, setPaquetes] = useState<PaqueteServicio[]>([])
  const [servicios, setServicios] = useState<Servicio[]>([])
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [cargando, setCargando] = useState(true)

  // Modal Crear / Editar
  const [modalAbierto, setModalAbierto] = useState(false)
  const [paqueteEditando, setPaqueteEditando] = useState<Partial<PaqueteServicio>>({
    nombre: '',
    descripcion: '',
    precio_total: 100,
    precio_original: 120,
    descuento_porcentaje: 15,
    total_sesiones: 5,
    validez_dias: 90,
    servicios_ids: [],
    activo: true,
  })

  // Modal Asignar a Cliente
  const [modalAsignar, setModalAsignar] = useState(false)
  const [paqueteAAsignar, setPaqueteAAsignar] = useState<PaqueteServicio | null>(null)
  const [clienteSeleccionadoId, setClienteSeleccionadoId] = useState<number>(0)
  const [notasAsignacion, setNotasAsignacion] = useState('')

  const { toast } = useToast()

  const cargarDatos = async () => {
    setCargando(true)
    try {
      const [resPaq, resServ, resCli] = await Promise.all([
        paquetesService.getAll(),
        serviciosService.getAll({ activo: 'true' }),
        clientesService.getAll(),
      ])
      if (resPaq.data) setPaquetes(resPaq.data)
      if (resServ.data) setServicios(resServ.data)
      if (resCli.data) {
        setClientes(resCli.data)
        if (resCli.data.length > 0) setClienteSeleccionadoId(resCli.data[0].id)
      }
    } catch (err) {
      toast.error('Error al cargar paquetes', err instanceof Error ? err.message : 'Error')
    } finally {
      setCargando(false)
    }
  }

  useEffect(() => {
    cargarDatos()
  }, [])

  const handleGuardarPaquete = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!paqueteEditando.nombre?.trim() || !paqueteEditando.precio_total) {
      toast.warning('Validación', 'Ingresa el nombre y el precio del paquete')
      return
    }

    try {
      if (paqueteEditando.id) {
        await paquetesService.update(paqueteEditando.id, paqueteEditando)
        toast.success('Paquete actualizado', 'El paquete de sesiones fue modificado')
      } else {
        await paquetesService.create(paqueteEditando as Omit<PaqueteServicio, 'id'>)
        toast.success('Paquete creado', 'El nuevo paquete está disponible en catálogo')
      }
      setModalAbierto(false)
      cargarDatos()
    } catch (err) {
      toast.error('Error al guardar', err instanceof Error ? err.message : 'Error')
    }
  }

  const handleEliminarPaquete = async (id: number) => {
    if (!confirm('¿Estás seguro de retirar este paquete del catálogo?')) return
    try {
      await paquetesService.delete(id)
      toast.success('Paquete eliminado', 'El paquete fue removido')
      cargarDatos()
    } catch (err) {
      toast.error('Error al eliminar', err instanceof Error ? err.message : 'Error')
    }
  }

  const handleConfirmarAsignacion = async () => {
    if (!paqueteAAsignar || !clienteSeleccionadoId) return
    try {
      await paquetesService.asignarACliente(clienteSeleccionadoId, paqueteAAsignar.id, notasAsignacion)
      toast.success(
        'Paquete Asignado',
        `El paquete fue acreditado al cliente con éxito (${paqueteAAsignar.total_sesiones} sesiones)`
      )
      setModalAsignar(false)
      setNotasAsignacion('')
    } catch (err) {
      toast.error('Error', err instanceof Error ? err.message : 'Error al asignar paquete')
    }
  }

  const toggleServicioEnPaquete = (servId: number) => {
    const actuales = paqueteEditando.servicios_ids || []
    if (actuales.includes(servId)) {
      setPaqueteEditando({
        ...paqueteEditando,
        servicios_ids: actuales.filter((id) => id !== servId),
      })
    } else {
      setPaqueteEditando({
        ...paqueteEditando,
        servicios_ids: [...actuales, servId],
      })
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Package className="w-5 h-5 text-primary-500" />
            Catálogo de Paquetes y Bonos de Sesiones
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Crea paquetes combinados con sesiones prepagadas, vigencia en días y descuentos promocionales
          </p>
        </div>

        <Button
          onClick={() => {
            setPaqueteEditando({
              nombre: '',
              descripcion: '',
              precio_total: 100,
              precio_original: 125,
              descuento_porcentaje: 20,
              total_sesiones: 5,
              validez_dias: 90,
              servicios_ids: servicios.length > 0 ? [servicios[0].id] : [],
              activo: true,
            })
            setModalAbierto(true)
          }}
          leftIcon={<Plus className="w-4 h-4" />}
        >
          Nuevo Paquete
        </Button>
      </div>

      {cargando ? (
        <Loader text="Cargando catálogo de paquetes..." />
      ) : paquetes.length === 0 ? (
        <EmptyState
          title="No hay paquetes configurados"
          description="Crea bonos de múltiples sesiones para fidelizar clientes y asegurar ingresos recurrentes."
          actionLabel="Crear Primer Paquete"
          onAction={() => setModalAbierto(true)}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {paquetes.map((p) => (
            <div
              key={p.id}
              className="card p-5 border border-slate-200 dark:border-slate-800 hover:shadow-lg transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-primary-100 dark:bg-primary-950/60 text-primary-600 flex items-center justify-center font-bold">
                      <Package className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100 line-clamp-1">
                        {p.nombre}
                      </h4>
                      <span className="text-[11px] font-semibold text-primary-600 dark:text-primary-400">
                        {p.total_sesiones} sesiones incluidas
                      </span>
                    </div>
                  </div>
                  <Badge variant={p.activo ? 'success' : 'default'} size="sm">
                    {p.activo ? 'ACTIVO' : 'INACTIVO'}
                  </Badge>
                </div>

                <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mt-2">
                  {p.descripcion}
                </p>

                {/* Precios y descuento */}
                <div className="mt-4 p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl flex items-center justify-between">
                  <div>
                    <span className="text-xs text-slate-400 line-through mr-1.5">
                      ${p.precio_original}
                    </span>
                    <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                      ${p.precio_total}
                    </span>
                  </div>
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-primary-600 bg-primary-100/60 dark:bg-primary-950/80 px-2 py-0.5 rounded-lg">
                    <Percent className="w-3 h-3" />
                    {p.descuento_porcentaje}% OFF
                  </span>
                </div>

                <div className="flex items-center gap-4 text-xs text-slate-400 mt-3">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-amber-500" />
                    Vigencia: {p.validez_dias} días
                  </span>
                </div>
              </div>

              {/* Botones de acción */}
              <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <Button
                  size="sm"
                  variant="secondary"
                  leftIcon={<UserCheck className="w-3.5 h-3.5 text-primary-600" />}
                  onClick={() => {
                    setPaqueteAAsignar(p)
                    setModalAsignar(true)
                  }}
                >
                  Asignar a Cliente
                </Button>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => {
                      setPaqueteEditando(p)
                      setModalAbierto(true)
                    }}
                    className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-800"
                    title="Editar"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleEliminarPaquete(p.id)}
                    className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/40 text-slate-400 hover:text-red-500"
                    title="Eliminar"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Crear / Editar Paquete */}
      <Modal
        isOpen={modalAbierto}
        onClose={() => setModalAbierto(false)}
        title={paqueteEditando.id ? 'Editar Paquete' : 'Nuevo Paquete de Sesiones'}
        maxWidth="max-w-2xl"
      >
        <form onSubmit={handleGuardarPaquete} className="space-y-4">
          <Input
            label="Nombre del Paquete"
            placeholder="Ej: Bono 5 Sesiones Anti-Edad..."
            value={paqueteEditando.nombre || ''}
            onChange={(e) => setPaqueteEditando({ ...paqueteEditando, nombre: e.target.value })}
            required
          />

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Descripción Comercial
            </label>
            <textarea
              rows={2}
              placeholder="Detalla lo que incluye este paquete..."
              value={paqueteEditando.descripcion || ''}
              onChange={(e) =>
                setPaqueteEditando({ ...paqueteEditando, descripcion: e.target.value })
              }
              className="input-base text-xs w-full"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Input
              label="Precio Total ($)"
              type="number"
              min="1"
              value={paqueteEditando.precio_total || 0}
              onChange={(e) =>
                setPaqueteEditando({
                  ...paqueteEditando,
                  precio_total: Number(e.target.value),
                })
              }
              required
            />
            <Input
              label="Precio Original ($)"
              type="number"
              min="1"
              value={paqueteEditando.precio_original || 0}
              onChange={(e) =>
                setPaqueteEditando({
                  ...paqueteEditando,
                  precio_original: Number(e.target.value),
                })
              }
            />
            <Input
              label="% Descuento Estimado"
              type="number"
              min="0"
              max="100"
              value={paqueteEditando.descuento_porcentaje || 0}
              onChange={(e) =>
                setPaqueteEditando({
                  ...paqueteEditando,
                  descuento_porcentaje: Number(e.target.value),
                })
              }
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Total de Sesiones Incluidas"
              type="number"
              min="1"
              value={paqueteEditando.total_sesiones || 1}
              onChange={(e) =>
                setPaqueteEditando({
                  ...paqueteEditando,
                  total_sesiones: Number(e.target.value),
                })
              }
              required
            />
            <Input
              label="Validez en Días (Vigencia)"
              type="number"
              min="1"
              value={paqueteEditando.validez_dias || 30}
              onChange={(e) =>
                setPaqueteEditando({
                  ...paqueteEditando,
                  validez_dias: Number(e.target.value),
                })
              }
              required
            />
          </div>

          {/* Servicios que componen el paquete */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
              Servicios Aplicables en este Bono
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-40 overflow-y-auto p-1">
              {servicios.map((s) => {
                const checked = (paqueteEditando.servicios_ids || []).includes(s.id)
                return (
                  <div
                    key={s.id}
                    onClick={() => toggleServicioEnPaquete(s.id)}
                    className={[
                      'p-2.5 rounded-xl border text-xs flex items-center justify-between cursor-pointer transition-all',
                      checked
                        ? 'border-primary-500 bg-primary-50/50 dark:bg-primary-950/20 font-semibold text-primary-900 dark:text-primary-100'
                        : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300',
                    ].join(' ')}
                  >
                    <span>{s.nombre}</span>
                    {checked && <CheckCircle className="w-4 h-4 text-primary-600" />}
                  </div>
                )
              })}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-200 dark:border-slate-700">
            <Button variant="secondary" type="button" onClick={() => setModalAbierto(false)}>
              Cancelar
            </Button>
            <Button type="submit">
              {paqueteEditando.id ? 'Guardar Cambios' : 'Crear Paquete'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal Asignar Paquete a Cliente */}
      <Modal
        isOpen={modalAsignar}
        onClose={() => setModalAsignar(false)}
        title={`Asignar Paquete: ${paqueteAAsignar?.nombre || ''}`}
      >
        <div className="space-y-4">
          <Select
            label="Seleccionar Cliente del Directorio"
            value={clienteSeleccionadoId}
            onChange={(e) => setClienteSeleccionadoId(Number(e.target.value))}
            options={clientes.map((c) => ({
              value: c.id,
              label: `${c.nombre} ${c.apellido || ''} (${c.email})`,
            }))}
          />

          <Input
            label="Notas Internas de Asignación (Opcional)"
            placeholder="Ej: Pago realizado por transferencia, promo de cumpleaños..."
            value={notasAsignacion}
            onChange={(e) => setNotasAsignacion(e.target.value)}
          />

          <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl text-xs space-y-1">
            <p className="font-semibold text-slate-700 dark:text-slate-300">Resumen del paquete:</p>
            <p>• {paqueteAAsignar?.total_sesiones} sesiones disponibles</p>
            <p>• Validez de {paqueteAAsignar?.validez_dias} días desde hoy</p>
            <p>• Precio total: ${paqueteAAsignar?.precio_total}</p>
          </div>

          <div className="flex justify-end gap-2 pt-3">
            <Button variant="secondary" onClick={() => setModalAsignar(false)}>
              Cancelar
            </Button>
            <Button onClick={handleConfirmarAsignacion}>Confirmar Venta y Asignar</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
