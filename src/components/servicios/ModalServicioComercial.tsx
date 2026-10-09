import { useState, useEffect } from 'react'
import {
  Sparkles,
  DollarSign,
  Shield,
  Layers,
  Users,
  Plus,
  Trash2,
  CheckCircle2,
  Tag,
  Check,
} from 'lucide-react'
import {
  Servicio,
  CategoriaServicio,
  Empleado,
  TipoRecurso,
  DuracionServicio,
} from '@/types'
import { Modal, Button, Input, Select, Switch } from '@/components/ui'
import { useToast } from '@/hooks/useToast'

export interface ModalServicioComercialProps {
  isOpen: boolean
  onClose: () => void
  servicio: Partial<Servicio> | null
  categorias: CategoriaServicio[]
  empleados: Empleado[]
  onGuardar: (servicio: Partial<Servicio>) => Promise<void>
  onAbrirCategorias?: () => void
}

type TabModalServicio = 'general' | 'precios' | 'recursos' | 'politicas'

const PALETA_COLORES = [
  '#6366f1',
  '#ec4899',
  '#10b981',
  '#f59e0b',
  '#3b82f6',
  '#8b5cf6',
  '#14b8a6',
  '#ef4444',
  '#64748b',
]

export function ModalServicioComercial({
  isOpen,
  onClose,
  servicio,
  categorias,
  empleados,
  onGuardar,
  onAbrirCategorias,
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
        color: servicio.color || '#6366f1',
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
      duracion_min: (formData.duracion_base_min || 30) + 30,
      precio: Math.round((formData.precio_base || 50) * 1.5),
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

  const handleSeleccionarTodosEmpleados = () => {
    const todosIds = empleados.map((e) => e.id)
    const actuales = formData.empleados_compatibles_ids || []
    if (actuales.length === todosIds.length) {
      setFormData({ ...formData, empleados_compatibles_ids: [] })
    } else {
      setFormData({ ...formData, empleados_compatibles_ids: todosIds })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.nombre?.trim() || formData.precio_base === undefined) {
      toast.warning('Validación requerida', 'El nombre y precio base son obligatorios')
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
      toast.error('Error al guardar', err instanceof Error ? err.message : 'Error')
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
        <div className="flex items-center gap-1.5 border-b border-border pb-2 overflow-x-auto scrollbar-none">
          {[
            { id: 'general', label: 'General & Categoría', icon: Sparkles },
            { id: 'precios', label: 'Precios & Subservicios', icon: DollarSign },
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
                  'flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer',
                  esActiva
                    ? 'bg-primary text-white shadow-2xs'
                    : 'text-text-muted hover:text-text hover:bg-surface-subtle',
                ].join(' ')}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            )
          })}
        </div>

        {/* ── PESTAÑA 1: GENERAL ── */}
        {tabActiva === 'general' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Nombre del Servicio *"
                placeholder="Ej: Consulta Médica, Limpieza Facial, Corte..."
                value={formData.nombre || ''}
                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                required
              />

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-medium text-text">Categoría</label>
                  {onAbrirCategorias && (
                    <button
                      type="button"
                      onClick={onAbrirCategorias}
                      className="text-[11px] text-primary hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <Tag className="w-3 h-3" />
                      <span>Gestionar categorías</span>
                    </button>
                  )}
                </div>
                <Select
                  value={formData.categoria_id || ''}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      categoria_id: e.target.value ? Number(e.target.value) : undefined,
                    })
                  }
                  options={[
                    { value: '', label: 'Sin categoría clasificada' },
                    ...categorias.map((c) => ({ value: c.id, label: c.nombre })),
                  ]}
                  placeholder="Seleccionar categoría..."
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-text mb-1">
                Descripción Detallada
              </label>
              <textarea
                rows={3}
                placeholder="Explica qué incluye este servicio, beneficios para el cliente y consideraciones previas..."
                value={formData.descripcion || ''}
                onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-border bg-surface-subtle text-text text-xs placeholder:text-text-muted/60 focus:outline-none focus:ring-2 focus:ring-primary focus:bg-surface transition-all"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center p-3.5 rounded-xl bg-surface-subtle border border-border">
              <div>
                <label className="block text-xs font-medium text-text mb-1.5">
                  Color Identificador (Agenda y Calendario)
                </label>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {PALETA_COLORES.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setFormData({ ...formData, color: c })}
                      className="w-6 h-6 rounded-full border border-border shrink-0 flex items-center justify-center cursor-pointer transition-transform hover:scale-105"
                      style={{ backgroundColor: c }}
                    >
                      {formData.color === c && <Check className="w-3.5 h-3.5 text-white" />}
                    </button>
                  ))}
                  <input
                    type="color"
                    value={formData.color || '#6366f1'}
                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                    className="w-6 h-6 rounded-full cursor-pointer border border-border p-0 bg-transparent shrink-0 ml-1"
                    title="Color personalizado"
                  />
                </div>
              </div>

              <div className="space-y-2 pt-1 md:pt-0">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-text">Servicio Activo en Catálogo</span>
                  <Switch
                    checked={formData.activo ?? true}
                    onChange={(checked) => setFormData({ ...formData, activo: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-text">Visible en Portal Público de Clientes</span>
                  <Switch
                    checked={formData.visible_portal_publico ?? true}
                    onChange={(checked) =>
                      setFormData({ ...formData, visible_portal_publico: checked })
                    }
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── PESTAÑA 2: PRECIOS & SUBSERVICIOS / VARIANTES ── */}
        {tabActiva === 'precios' && (
          <div className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input
                label="Duración Base (minutos) *"
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
                label="Precio Base ($) *"
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

            <div className="flex items-center justify-between p-3 rounded-xl bg-surface-subtle border border-border text-xs">
              <span className="font-medium text-text">El precio base ya incluye impuesto</span>
              <Switch
                checked={formData.precio_incluye_impuesto ?? true}
                onChange={(checked) =>
                  setFormData({ ...formData, precio_incluye_impuesto: checked })
                }
              />
            </div>

            {/* Subservicios / Variantes de Duración */}
            <div className="pt-3 border-t border-border space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-xs text-text">
                    Subservicios & Variantes de Duración
                  </h4>
                  <p className="text-[11px] text-text-muted">
                    Permite a tus clientes elegir duraciones o niveles alternativos con precio diferencial.
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="secondary"
                  type="button"
                  leftIcon={<Plus className="w-3.5 h-3.5 text-primary" />}
                  onClick={handleAgregarDuracion}
                >
                  Añadir Variante
                </Button>
              </div>

              {duraciones.length === 0 ? (
                <div className="text-xs text-text-muted py-4 bg-surface-subtle rounded-xl text-center border border-dashed border-border">
                  Solo se utiliza la duración base ({formData.duracion_base_min} min a ${formData.precio_base}). Haz clic en "Añadir Variante" para crear opciones adicionales (ej. Sesión Express, Sesión Completa).
                </div>
              ) : (
                <div className="space-y-2">
                  {duraciones.map((d) => (
                    <div
                      key={d.id}
                      className="flex items-center gap-2.5 p-2.5 bg-surface-subtle rounded-xl border border-border"
                    >
                      <input
                        type="text"
                        placeholder="Nombre de variante (ej: Sesión Extendida 60 min)"
                        value={d.etiqueta || ''}
                        onChange={(e) =>
                          handleActualizarDuracion(d.id, { etiqueta: e.target.value })
                        }
                        className="flex-1 p-1.5 text-xs rounded-lg border border-border bg-surface text-text focus:outline-none focus:ring-1 focus:ring-primary"
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
                          className="w-full p-1.5 text-xs rounded-lg border border-border bg-surface text-text focus:outline-none focus:ring-1 focus:ring-primary"
                        />
                        <span className="text-xs text-text-muted">min</span>
                      </div>
                      <div className="flex items-center gap-1 w-28">
                        <span className="text-xs text-text-muted">$</span>
                        <input
                          type="number"
                          placeholder="Precio"
                          value={d.precio}
                          onChange={(e) =>
                            handleActualizarDuracion(d.id, { precio: Number(e.target.value) })
                          }
                          className="w-full p-1.5 text-xs rounded-lg border border-border bg-surface text-text focus:outline-none focus:ring-1 focus:ring-primary"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => handleEliminarDuracion(d.id)}
                        className="p-1.5 text-text-muted hover:text-danger rounded-lg hover:bg-danger-soft transition-colors cursor-pointer"
                        title="Eliminar variante"
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

        {/* ── PESTAÑA 3: RECURSOS & PERSONAL ── */}
        {tabActiva === 'recursos' && (
          <div className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Select
                label="Tipo de Recurso Físico Requerido"
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
                  { value: 'equipo', label: 'Equipo Especializado / Máquina' },
                  { value: 'generico', label: 'Recurso Genérico' },
                ]}
              />

              <Input
                label="Capacidad Máxima Simultánea de Clientes"
                type="number"
                min="1"
                value={formData.capacidad_maxima || 1}
                onChange={(e) =>
                  setFormData({ ...formData, capacidad_maxima: Number(e.target.value) })
                }
              />
            </div>

            {/* Asignación de Profesionales */}
            <div className="pt-3 border-t border-border space-y-2.5">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-xs text-text flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-primary" />
                    <span>Personal Habilitado para este Servicio</span>
                  </h4>
                  <p className="text-[11px] text-text-muted">
                    Selecciona qué profesionales pueden prestar este servicio en la agenda.
                  </p>
                </div>
                {empleados.length > 0 && (
                  <button
                    type="button"
                    onClick={handleSeleccionarTodosEmpleados}
                    className="text-xs text-primary hover:underline cursor-pointer"
                  >
                    {(formData.empleados_compatibles_ids || []).length === empleados.length
                      ? 'Deseleccionar todos'
                      : 'Seleccionar todos'}
                  </button>
                )}
              </div>

              {empleados.length === 0 ? (
                <div className="p-4 bg-surface-subtle rounded-xl text-center text-xs text-text-muted border border-dashed border-border">
                  No hay profesionales registrados aún. Cualquier operador podrá agendar este servicio.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                  {empleados.map((emp) => {
                    const seleccionado = (formData.empleados_compatibles_ids || []).includes(emp.id)
                    return (
                      <div
                        key={emp.id}
                        onClick={() => handleToggleEmpleado(emp.id)}
                        className={[
                          'flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all select-none',
                          seleccionado
                            ? 'border-primary bg-primary-soft text-primary font-semibold shadow-2xs'
                            : 'border-border bg-surface hover:bg-surface-subtle text-text',
                        ].join(' ')}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div
                            className={[
                              'w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs shrink-0',
                              seleccionado
                                ? 'bg-primary text-white'
                                : 'bg-surface-subtle text-text-muted border border-border',
                            ].join(' ')}
                          >
                            {emp.nombre.charAt(0)}
                          </div>
                          <span className="text-xs truncate">{emp.nombre}</span>
                        </div>
                        {seleccionado && <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── PESTAÑA 4: POLÍTICAS & DEPÓSITOS ── */}
        {tabActiva === 'politicas' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Buffer Antes (minutos de preparación previa)"
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
                label="Anticipación Máxima Vista en Calendario (días)"
                type="number"
                min="1"
                value={formData.anticipacion_maxima_dias || 30}
                onChange={(e) =>
                  setFormData({ ...formData, anticipacion_maxima_dias: Number(e.target.value) })
                }
              />
            </div>

            {/* Depósito o Seña */}
            <div className="p-4 bg-surface-subtle rounded-xl border border-border space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-text">
                  Requiere Depósito / Seña Previa para Confirmar Cita
                </span>
                <Switch
                  checked={formData.requiere_deposito ?? false}
                  onChange={(checked) =>
                    setFormData({ ...formData, requiere_deposito: checked })
                  }
                />
              </div>

              {formData.requiere_deposito && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-border-subtle">
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

        {/* ── Footer ── */}
        <div className="flex justify-end gap-2 pt-4 border-t border-border">
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
