import { useState, useEffect } from 'react'
import {
  Award,
  Plus,
  Edit2,
  Trash2,
  CheckCircle,
  UserCheck,
} from 'lucide-react'
import {
  PlanMembresia,
  Cliente,
  PeriodicidadMembresia,
} from '@/types'
import { membresiasService } from '@/services/membresias.service'
import { clientesService } from '@/services/clientes.service'
import { Modal, Button, Input, Select, Badge, Loader, EmptyState } from '@/components/ui'
import { useToast } from '@/hooks/useToast'

export function GestionMembresias() {
  const [planes, setPlanes] = useState<PlanMembresia[]>([])
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [cargando, setCargando] = useState(true)

  // Modal Crear / Editar
  const [modalAbierto, setModalAbierto] = useState(false)
  const [planEditando, setPlanEditando] = useState<Partial<PlanMembresia>>({
    nombre: '',
    codigo: '',
    descripcion: '',
    precio: 49,
    periodicidad: 'mensual',
    beneficios: ['1 Sesión mensual incluida', '10% de descuento en servicios adicionales'],
    descuento_servicios_extra_porcentaje: 10,
    descuento_productos_porcentaje: 5,
    activo: true,
  })
  const [nuevoBeneficioTexto, setNuevoBeneficioTexto] = useState('')

  // Modal Suscribir Cliente
  const [modalSuscribir, setModalSuscribir] = useState(false)
  const [planASuscribir, setPlanASuscribir] = useState<PlanMembresia | null>(null)
  const [clienteSeleccionadoId, setClienteSeleccionadoId] = useState<number>(0)
  const [notasSuscripcion, setNotasSuscripcion] = useState('')

  const { toast } = useToast()

  const cargarDatos = async () => {
    setCargando(true)
    try {
      const [resPlanes, resCli] = await Promise.all([
        membresiasService.getAll(),
        clientesService.getAll(),
      ])
      if (resPlanes.data) setPlanes(resPlanes.data)
      if (resCli.data) {
        setClientes(resCli.data)
        if (resCli.data.length > 0) setClienteSeleccionadoId(resCli.data[0].id)
      }
    } catch (err) {
      toast.error('Error al cargar membresías', err instanceof Error ? err.message : 'Error')
    } finally {
      setCargando(false)
    }
  }

  useEffect(() => {
    cargarDatos()
  }, [])

  const handleGuardarPlan = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!planEditando.nombre?.trim() || !planEditando.precio) {
      toast.warning('Validación', 'Ingresa el nombre y precio del plan')
      return
    }

    try {
      if (planEditando.id) {
        await membresiasService.update(planEditando.id, planEditando)
        toast.success('Plan actualizado', 'Los cambios en la membresía fueron guardados')
      } else {
        const codigo = planEditando.codigo?.trim() || `MEM-${Date.now().toString().slice(-4)}`
        await membresiasService.create({
          ...planEditando,
          codigo,
        } as Omit<PlanMembresia, 'id'>)
        toast.success('Plan creado', 'El nuevo plan de membresía ya está disponible')
      }
      setModalAbierto(false)
      cargarDatos()
    } catch (err) {
      toast.error('Error al guardar', err instanceof Error ? err.message : 'Error')
    }
  }

  const handleEliminarPlan = async (id: number) => {
    if (!confirm('¿Deseas retirar este plan de membresía del catálogo?')) return
    try {
      await membresiasService.delete(id)
      toast.success('Plan retirado', 'La membresía fue eliminada')
      cargarDatos()
    } catch (err) {
      toast.error('Error al eliminar', err instanceof Error ? err.message : 'Error')
    }
  }

  const handleAgregarBeneficio = () => {
    if (!nuevoBeneficioTexto.trim()) return
    const lista = planEditando.beneficios || []
    setPlanEditando({
      ...planEditando,
      beneficios: [...lista, nuevoBeneficioTexto.trim()],
    })
    setNuevoBeneficioTexto('')
  }

  const handleEliminarBeneficio = (indice: number) => {
    const lista = (planEditando.beneficios || []).filter((_, idx) => idx !== indice)
    setPlanEditando({ ...planEditando, beneficios: lista })
  }

  const handleConfirmarSuscripcion = async () => {
    if (!planASuscribir || !clienteSeleccionadoId) return
    try {
      await membresiasService.asignarACliente(
        clienteSeleccionadoId,
        planASuscribir.id,
        notasSuscripcion
      )
      toast.success(
        'Membresía Activada',
        `Cliente suscrito exitosamente al plan '${planASuscribir.nombre}'`
      )
      setModalSuscribir(false)
      setNotasSuscripcion('')
    } catch (err) {
      toast.error('Error al suscribir', err instanceof Error ? err.message : 'Error')
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-500" />
            Planes de Membresía y Suscripciones Recurrentes
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Configura planes mensuales o anuales con servicios bonificados, descuentos exclusivos y beneficios VIP
          </p>
        </div>

        <Button
          onClick={() => {
            setPlanEditando({
              nombre: '',
              codigo: '',
              descripcion: '',
              precio: 49,
              periodicidad: 'mensual',
              beneficios: ['1 Sesión mensual incluida', '10% de descuento en servicios adicionales'],
              descuento_servicios_extra_porcentaje: 10,
              descuento_productos_porcentaje: 5,
              activo: true,
            })
            setModalAbierto(true)
          }}
          leftIcon={<Plus className="w-4 h-4" />}
        >
          Nuevo Plan
        </Button>
      </div>

      {cargando ? (
        <Loader text="Cargando planes de membresía..." />
      ) : planes.length === 0 ? (
        <EmptyState
          title="No hay planes de membresía configurados"
          description="Crea tu primer plan recurrente para ofrecer suscripciones periódicas a tus clientes."
          actionLabel="Crear Plan de Membresía"
          onAction={() => setModalAbierto(true)}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {planes.map((p) => (
            <div
              key={p.id}
              className="card p-5 border border-slate-200 dark:border-slate-800 hover:shadow-lg transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 flex items-center justify-center font-bold">
                      <Award className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100 line-clamp-1">
                        {p.nombre}
                      </h4>
                      <span className="text-[10px] font-mono text-slate-400 uppercase">
                        {p.codigo}
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

                {/* Precio y frecuencia */}
                <div className="mt-4 p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl flex items-baseline justify-between">
                  <span className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                    ${p.precio}
                  </span>
                  <span className="text-xs text-slate-500 font-semibold capitalize">
                    / {p.periodicidad}
                  </span>
                </div>

                {/* Beneficios */}
                <div className="mt-3 space-y-1.5">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                    Beneficios del Plan:
                  </span>
                  <ul className="text-xs text-slate-600 dark:text-slate-300 space-y-1">
                    {(p.beneficios || []).map((b, idx) => (
                      <li key={idx} className="flex items-start gap-1.5">
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0 mt-0.5" />
                        <span className="line-clamp-1">{b}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Botones de acción */}
              <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <Button
                  size="sm"
                  variant="secondary"
                  leftIcon={<UserCheck className="w-3.5 h-3.5 text-amber-600" />}
                  onClick={() => {
                    setPlanASuscribir(p)
                    setModalSuscribir(true)
                  }}
                >
                  Suscribir Cliente
                </Button>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => {
                      setPlanEditando(p)
                      setModalAbierto(true)
                    }}
                    className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-800"
                    title="Editar"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleEliminarPlan(p.id)}
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

      {/* Modal Crear / Editar Plan */}
      <Modal
        isOpen={modalAbierto}
        onClose={() => setModalAbierto(false)}
        title={planEditando.id ? 'Editar Plan de Membresía' : 'Nuevo Plan de Membresía'}
        maxWidth="max-w-2xl"
      >
        <form onSubmit={handleGuardarPlan} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Nombre del Plan"
              placeholder="Ej: Membresía Oro, Plan Mensual..."
              value={planEditando.nombre || ''}
              onChange={(e) => setPlanEditando({ ...planEditando, nombre: e.target.value })}
              required
            />
            <Input
              label="Código Identificador"
              placeholder="Ej: MEM-ORO..."
              value={planEditando.codigo || ''}
              onChange={(e) => setPlanEditando({ ...planEditando, codigo: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Descripción del Plan
            </label>
            <textarea
              rows={2}
              placeholder="Explica las ventajas exclusivas para los socios de este plan..."
              value={planEditando.descripcion || ''}
              onChange={(e) => setPlanEditando({ ...planEditando, descripcion: e.target.value })}
              className="input-base text-xs w-full"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Precio de la Cuota ($)"
              type="number"
              min="1"
              value={planEditando.precio || 0}
              onChange={(e) => setPlanEditando({ ...planEditando, precio: Number(e.target.value) })}
              required
            />
            <Select
              label="Periodicidad de Cobro"
              value={planEditando.periodicidad || 'mensual'}
              onChange={(e) =>
                setPlanEditando({
                  ...planEditando,
                  periodicidad: e.target.value as PeriodicidadMembresia,
                })
              }
              options={[
                { value: 'mensual', label: 'Mensual' },
                { value: 'trimestral', label: 'Trimestral (cada 3 meses)' },
                { value: 'semestral', label: 'Semestral (cada 6 meses)' },
                { value: 'anual', label: 'Anual (cada año)' },
              ]}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Descuento en Servicios Extra (%)"
              type="number"
              min="0"
              max="100"
              value={planEditando.descuento_servicios_extra_porcentaje || 0}
              onChange={(e) =>
                setPlanEditando({
                  ...planEditando,
                  descuento_servicios_extra_porcentaje: Number(e.target.value),
                })
              }
            />
            <Input
              label="Descuento en Productos (%)"
              type="number"
              min="0"
              max="100"
              value={planEditando.descuento_productos_porcentaje || 0}
              onChange={(e) =>
                setPlanEditando({
                  ...planEditando,
                  descuento_productos_porcentaje: Number(e.target.value),
                })
              }
            />
          </div>

          {/* Lista de Beneficios */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
              Lista de Beneficios del Plan
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Añadir beneficio (ej: 1 Masaje gratis por mes)..."
                value={nuevoBeneficioTexto}
                onChange={(e) => setNuevoBeneficioTexto(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAgregarBeneficio())}
                className="input-base text-xs flex-1"
              />
              <Button type="button" size="sm" onClick={handleAgregarBeneficio}>
                Añadir
              </Button>
            </div>

            <div className="space-y-1.5 pt-1">
              {(planEditando.beneficios || []).map((b, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-800 text-xs border border-slate-200 dark:border-slate-700"
                >
                  <span className="flex items-center gap-1.5">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                    {b}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleEliminarBeneficio(idx)}
                    className="text-slate-400 hover:text-red-500 font-bold px-1"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-200 dark:border-slate-700">
            <Button variant="secondary" type="button" onClick={() => setModalAbierto(false)}>
              Cancelar
            </Button>
            <Button type="submit">
              {planEditando.id ? 'Guardar Cambios' : 'Crear Plan'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal Suscribir Cliente */}
      <Modal
        isOpen={modalSuscribir}
        onClose={() => setModalSuscribir(false)}
        title={`Suscribir Cliente a: ${planASuscribir?.nombre || ''}`}
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
            label="Notas Internas de Suscripción"
            placeholder="Ej: Pago de cuota inicial por tarjeta, contrato firmado..."
            value={notasSuscripcion}
            onChange={(e) => setNotasSuscripcion(e.target.value)}
          />

          <div className="p-3 bg-amber-50 dark:bg-amber-950/40 rounded-xl text-xs space-y-1 text-amber-900 dark:text-amber-200 border border-amber-200 dark:border-amber-900">
            <p className="font-semibold">Resumen de la membresía:</p>
            <p>• Cuota: ${planASuscribir?.precio} / {planASuscribir?.periodicidad}</p>
            <p>• Renovación automática periódica habilitada</p>
          </div>

          <div className="flex justify-end gap-2 pt-3">
            <Button variant="secondary" onClick={() => setModalSuscribir(false)}>
              Cancelar
            </Button>
            <Button onClick={handleConfirmarSuscripcion}>Activar Suscripción</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
