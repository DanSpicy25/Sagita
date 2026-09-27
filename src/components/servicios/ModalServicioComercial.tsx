import { useState, useEffect } from 'react'
import {
  Sparkles,
  DollarSign,
  Shield,
  Layers,
  Users,
  Plus,
  Trash2,
  CheckCircle,
} from 'lucide-react'
import {
  Servicio,
  CategoriaServicio,
  Empleado,
  TipoRecurso,
  DuracionServicio,
} from '@/types'
import { Modal, Button, Input, Select } from '@/components/ui'
import { useToast } from '@/hooks/useToast'

interface ModalServicioComercialProps {
  isOpen: boolean
  onClose: () => void
  servicio: Partial<Servicio> | null
  categorias: CategoriaServicio[]
  empleados: Empleado[]
  onGuardar: (servicio: Partial<Servicio>) => Promise<void>
}

type TabModalServicio = 'general' | 'precios' | 'recursos' | 'politicas'

export function ModalServicioComercial({
  isOpen,
  onClose,
  servicio,
  categorias,
  empleados,
  onGuardar,
}: ModalServicioComercialProps) {
  const [tabActiva, setTabActiva] = useState<TabModalServicio>('general')
  const [formData, setFormData] = useState<Partial<Servicio>>({})
  const [duraciones, setDuraciones] = useState<DuracionServicio[]>([])
  const [guardando, setGuardando] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    if (servicio && isOpen) {
      setFormData({
        ...servicio,
        activo: servicio.activo ?? true,
        duracion_base_min: servicio.duracion_base_min || 30,
        precio_base: servicio.precio_base || 50,
        buffer_antes_min: servicio.buffer_antes_min || 0,
        buffer_despues_min: servicio.buffer_despues_min || 5,
        capacidad_maxima: servicio.capacidad_maxima || 1,
        impuesto_porcentaje: servicio.impuesto_porcentaje ?? 16,
        precio_incluye_impuesto: servicio.precio_incluye_impuesto ?? true,
        visible_portal_publico: servicio.visible_portal_publico ?? true,
        anticipacion_minima_horas: servicio.anticipacion_minima_horas || 2,
        anticipacion_maxima_dias: servicio.anticipacion_maxima_dias || 30,
        horas_anticipacion_cancelacion: servicio.horas_anticipacion_cancelacion || 24,
      })
      setDuraciones(servicio.duraciones ? [...servicio.duraciones] : [])
      setTabActiva('general')
    }
  }, [servicio, isOpen])

  const handleAgregarDuracion = () => {
    const nueva: DuracionServicio = {
      id: Date.now(),
      servicio_id: formData.id || 0,
      duracion_min: 60,
      precio: (formData.precio_base || 50) * 1.5,
      etiqueta: 'Sesión Extendida',
    }
    setDuraciones([...duraciones, nueva])
  }

  const handleEliminarDuracion = (id: number) => {
    setDuraciones(duraciones.filter((d) => d.id !== id))
  }

  const handleActualizarDuracion = (id: number, campos: Partial<DuracionServicio>) => {
    setDuraciones(
      duraciones.map((d) => (d.id === id ? { ...d, ...campos } : d))
    )
  }

  const handleToggleEmpleado = (empId: number) => {
    const actuales = formData.empleados_compatibles_ids || []
    if (actuales.includes(empId)) {
      setFormData({
        ...formData,
        empleados_compatibles_ids: actuales.filter((id) => id !== empId),
      })
    } else {
      setFormData({
        ...formData,
        empleados_compatibles_ids: [...actuales, empId],
      })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.nombre?.trim() || !formData.precio_base) {
      toast.warning('Validación', 'El nombre y precio base son obligatorios')
      setTabActiva('general')
      return
    }

    setGuardando(true)
    try {
      await onGuardar({
        ...formData,
        duraciones,
      })
      onClose()
    } catch (err) {
      toast.error('Error', err instanceof Error ? err.message : 'Error al guardar')
    } finally {
      setGuardando(false)
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={formData.id ? `Editar Servicio: ${formData.nombre}` : 'Nuevo Servicio Comercial'}
      maxWidth="max-w-4xl"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Navegación por pestañas */}
        <div className="flex items-center gap-1.5 border-b border-slate-200 dark:border-slate-700 pb-2">
          {[
            { id: 'general', label: 'General & Categoría', icon: Sparkles },
            { id: 'precios', label: 'Precios, Duraciones & Impuestos', icon: DollarSign },
            { id: 'recursos', label: 'Recursos & Personal', icon: Layers },
            { id: 'politicas', label: 'Políticas & Depósitos', icon: Shield },
          ].map((tab) => {
            const Icon = tab.icon
            const esActiva = tabActiva === tab.id
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setTabActiva(tab.id as TabModalServicio)}
                className={[
                  'flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all',
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

        {/* PESTAÑA 1: GENERAL */}
        {tabActiva === 'general' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Nombre del Servicio"
                placeholder="Ej: Consulta Médica, Limpieza Facial..."
                value={formData.nombre || ''}
                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                required
              />

              <Select
                label="Categoría"
                value={formData.categoria_id || ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    categoria_id: e.target.value ? Number(e.target.value) : undefined,
                  })
                }
                options={categorias.map((c) => ({ value: c.id, label: c.nombre }))}
                placeholder="Seleccionar categoría..."
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Descripción Detallada
              </label>
              <textarea
                rows={3}
                placeholder="Explica a tus clientes de qué trata este servicio, qué incluye y los beneficios..."
                value={formData.descripcion || ''}
                onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                className="input-base text-xs w-full"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Color Identificador (Agenda)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={formData.color || '#6366f1'}
                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                    className="w-10 h-10 rounded-xl cursor-pointer border border-slate-200 dark:border-slate-700 p-0.5 bg-transparent"
                  />
                  <span className="text-xs font-mono text-slate-500">{formData.color || '#6366f1'}</span>
                </div>
              </div>

              <div className="flex items-center gap-4 pt-4">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700 dark:text-slate-300">
                  <input
                    type="checkbox"
                    checked={formData.activo ?? true}
                    onChange={(e) => setFormData({ ...formData, activo: e.target.checked })}
                    className="rounded text-primary-600 focus:ring-primary-500"
                  />
                  Servicio Activo en Catálogo
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700 dark:text-slate-300">
                  <input
                    type="checkbox"
                    checked={formData.visible_portal_publico ?? true}
                    onChange={(e) =>
                      setFormData({ ...formData, visible_portal_publico: e.target.checked })
                    }
                    className="rounded text-primary-600 focus:ring-primary-500"
                  />
                  Visible en Portal Público de Clientes
                </label>
              </div>
            </div>
          </div>
        )}

        {/* PESTAÑA 2: PRECIOS, DURACIONES & IMPUESTOS */}
        {tabActiva === 'precios' && (
          <div className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input
                label="Duración Base (minutos)"
                type="number"
                min="5"
                step="5"
                value={formData.duracion_base_min || 30}
                onChange={(e) =>
                  setFormData({ ...formData, duracion_base_min: Number(e.target.value) })
                }
                required
              />
              <Input
                label="Precio Base ($)"
                type="number"
                min="0"
                step="1"
                value={formData.precio_base || 0}
                onChange={(e) =>
                  setFormData({ ...formData, precio_base: Number(e.target.value) })
                }
                required
              />
              <Input
                label="Tasa de Impuesto / IVA (%)"
                type="number"
                min="0"
                max="100"
                value={formData.impuesto_porcentaje ?? 16}
                onChange={(e) =>
                  setFormData({ ...formData, impuesto_porcentaje: Number(e.target.value) })
                }
              />
            </div>

            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700 dark:text-slate-300">
                <input
                  type="checkbox"
                  checked={formData.precio_incluye_impuesto ?? true}
                  onChange={(e) =>
                    setFormData({ ...formData, precio_incluye_impuesto: e.target.checked })
                  }
                  className="rounded text-primary-600 focus:ring-primary-500"
                />
                El precio base ya incluye impuesto
              </label>
            </div>

            {/* Variantes de Duración */}
            <div className="pt-3 border-t border-slate-200 dark:border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h5 className="font-bold text-xs text-slate-900 dark:text-slate-100">
                    Variantes de Duración / Opciones de Sesión
                  </h5>
                  <p className="text-[11px] text-slate-400">
                    Permite a los clientes elegir diferentes duraciones (ej: 30 min, 60 min, 90 min) con precio diferencial.
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="secondary"
                  type="button"
                  leftIcon={<Plus className="w-3.5 h-3.5" />}
                  onClick={handleAgregarDuracion}
                >
                  Añadir Variante
                </Button>
              </div>

              {duraciones.length === 0 ? (
                <p className="text-xs text-slate-400 py-3 bg-slate-50 dark:bg-slate-900/40 rounded-xl text-center">
                  Solo se utiliza la duración base ({formData.duracion_base_min} min). Haz clic en "Añadir Variante" para crear opciones adicionales.
                </p>
              ) : (
                <div className="space-y-2">
                  {duraciones.map((d) => (
                    <div
                      key={d.id}
                      className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700"
                    >
                      <input
                        type="text"
                        placeholder="Etiqueta (ej: Sesión Corta)"
                        value={d.etiqueta || ''}
                        onChange={(e) =>
                          handleActualizarDuracion(d.id, { etiqueta: e.target.value })
                        }
                        className="input-base text-xs flex-1"
                      />
                      <div className="flex items-center gap-1 w-28">
                        <input
                          type="number"
                          placeholder="Minutos"
                          value={d.duracion_min}
                          onChange={(e) =>
                            handleActualizarDuracion(d.id, {
                              duracion_min: Number(e.target.value),
                            })
                          }
                          className="input-base text-xs w-full"
                        />
                        <span className="text-xs text-slate-400">m</span>
                      </div>
                      <div className="flex items-center gap-1 w-28">
                        <span className="text-xs text-slate-400">$</span>
                        <input
                          type="number"
                          placeholder="Precio"
                          value={d.precio}
                          onChange={(e) =>
                            handleActualizarDuracion(d.id, { precio: Number(e.target.value) })
                          }
                          className="input-base text-xs w-full"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => handleEliminarDuracion(d.id)}
                        className="p-1.5 text-slate-400 hover:text-red-500 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/40"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* PESTAÑA 3: RECURSOS & PERSONAL */}
        {tabActiva === 'recursos' && (
          <div className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Select
                label="Tipo de Recurso Requerido"
                value={formData.recurso_requerido_tipo || ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    recurso_requerido_tipo: (e.target.value as TipoRecurso) || undefined,
                  })
                }
                options={[
                  { value: '', label: 'Sin recurso físico obligatorio' },
                  { value: 'sala', label: 'Consultorio / Sala' },
                  { value: 'cabina', label: 'Cabina Estética / Spa' },
                  { value: 'silla', label: 'Sillón / Puesto de Estilismo' },
                  { value: 'equipo', label: 'Equipo Especializado / Láser' },
                  { value: 'generico', label: 'Recurso Genérico' },
                ]}
              />

              <Input
                label="Capacidad Máxima Simultánea"
                type="number"
                min="1"
                value={formData.capacidad_maxima || 1}
                onChange={(e) =>
                  setFormData({ ...formData, capacidad_maxima: Number(e.target.value) })
                }
              />
            </div>

            {/* Profesionales Compatibles */}
            <div className="pt-3 border-t border-slate-200 dark:border-slate-800 space-y-2">
              <h5 className="font-bold text-xs text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-primary-500" />
                Profesionales Habilitados para este Servicio
              </h5>
              <p className="text-[11px] text-slate-400">
                Selecciona qué miembros del equipo pueden prestar este servicio en la agenda.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                {empleados.map((emp) => {
                  const seleccionado = (formData.empleados_compatibles_ids || []).includes(emp.id)
                  return (
                    <div
                      key={emp.id}
                      onClick={() => handleToggleEmpleado(emp.id)}
                      className={[
                        'flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all',
                        seleccionado
                          ? 'border-primary-500 bg-primary-50/50 dark:bg-primary-950/20 text-primary-900 dark:text-primary-100 font-semibold'
                          : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40 text-slate-600 dark:text-slate-400',
                      ].join(' ')}
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-primary-100 dark:bg-primary-900 text-primary-600 flex items-center justify-center font-bold text-xs">
                          {emp.nombre.slice(0, 1)}
                        </div>
                        <span className="text-xs">{emp.nombre}</span>
                      </div>
                      {seleccionado && <CheckCircle className="w-4 h-4 text-primary-600" />}
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        )}

        {/* PESTAÑA 4: POLÍTICAS & DEPÓSITOS */}
        {tabActiva === 'politicas' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Buffer Antes (minutos de preparación)"
                type="number"
                min="0"
                value={formData.buffer_antes_min || 0}
                onChange={(e) =>
                  setFormData({ ...formData, buffer_antes_min: Number(e.target.value) })
                }
              />
              <Input
                label="Buffer Después (minutos de limpieza/recogida)"
                type="number"
                min="0"
                value={formData.buffer_despues_min || 5}
                onChange={(e) =>
                  setFormData({ ...formData, buffer_despues_min: Number(e.target.value) })
                }
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Anticipación Mínima para Reservar (horas)"
                type="number"
                min="0"
                value={formData.anticipacion_minima_horas || 2}
                onChange={(e) =>
                  setFormData({ ...formData, anticipacion_minima_horas: Number(e.target.value) })
                }
              />
              <Input
                label="Anticipación Máxima Vista (días hacia adelante)"
                type="number"
                min="1"
                value={formData.anticipacion_maxima_dias || 30}
                onChange={(e) =>
                  setFormData({ ...formData, anticipacion_maxima_dias: Number(e.target.value) })
                }
              />
            </div>

            {/* Depósito o Seña */}
            <div className="p-4 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200 dark:border-slate-800 space-y-3">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-800 dark:text-slate-200">
                <input
                  type="checkbox"
                  checked={formData.requiere_deposito ?? false}
                  onChange={(e) =>
                    setFormData({ ...formData, requiere_deposito: e.target.checked })
                  }
                  className="rounded text-primary-600 focus:ring-primary-500"
                />
                Requiere Depósito / Seña Previa para Confirmar Cita
              </label>

              {formData.requiere_deposito && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <Select
                    label="Modalidad del Depósito"
                    value={formData.tipo_deposito || 'porcentaje'}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        tipo_deposito: e.target.value as 'monto_fijo' | 'porcentaje',
                      })
                    }
                    options={[
                      { value: 'porcentaje', label: 'Porcentaje del Total (%)' },
                      { value: 'monto_fijo', label: 'Monto Fijo ($)' },
                    ]}
                  />
                  <Input
                    label={
                      formData.tipo_deposito === 'monto_fijo'
                        ? 'Monto del Depósito ($)'
                        : 'Porcentaje del Depósito (%)'
                    }
                    type="number"
                    min="1"
                    value={formData.monto_deposito || 20}
                    onChange={(e) =>
                      setFormData({ ...formData, monto_deposito: Number(e.target.value) })
                    }
                  />
                </div>
              )}
            </div>

            {/* Reglas de Cancelación */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Horas de Anticipación para Cancelar sin Penalidad"
                type="number"
                min="0"
                value={formData.horas_anticipacion_cancelacion || 24}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    horas_anticipacion_cancelacion: Number(e.target.value),
                  })
                }
              />
              <Input
                label="Penalización por Cancelación Tardía ($)"
                type="number"
                min="0"
                value={
                  typeof formData.penalizacion_cancelacion_tardia === 'number'
                    ? formData.penalizacion_cancelacion_tardia
                    : 0
                }
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    penalizacion_cancelacion_tardia: Number(e.target.value),
                  })
                }
              />
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex justify-end gap-2 pt-4 border-t border-slate-200 dark:border-slate-800">
          <Button variant="secondary" type="button" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" loading={guardando}>
            {formData.id ? 'Guardar Cambios' : 'Crear Servicio'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
