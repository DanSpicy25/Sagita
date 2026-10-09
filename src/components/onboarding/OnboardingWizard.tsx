import { useState } from 'react'
import {
  Clock,
  CreditCard,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  X,
  Plus,
  Trash2,
  Check,
} from 'lucide-react'
import {
  ONBOARDING_STEPS,
  OnboardingServicioDraft,
} from './onboardingTypes'
import { useOnboarding } from './useOnboarding'
import { Button, Input, HelpTooltip } from '@/components/ui'
import { useConfiguracion } from '@/context/ConfiguracionContext'
import { useToast } from '@/hooks/useToast'

export interface OnboardingWizardProps {
  isOpen: boolean
  onClose: () => void
}

export function OnboardingWizard({ isOpen, onClose }: OnboardingWizardProps) {
  const {
    data,
    currentStep,
    goToStep,
    nextStep,
    prevStep,
    updateData,
    markStepCompleted,
    completeOnboarding,
    dismissOnboarding,
    progressPercentage,
    totalSteps,
  } = useOnboarding()

  const { actualizarConfiguracion } = useConfiguracion()
  const { toast } = useToast()

  // Estado local para agregar un nuevo servicio en el paso 2
  const [nuevoServicio, setNuevoServicio] = useState<Omit<OnboardingServicioDraft, 'id'>>({
    nombre: '',
    duracionMin: 45,
    precio: 30,
  })

  if (!isOpen) return null

  const stepMeta = ONBOARDING_STEPS.find((s) => s.id === currentStep)!
  const stepIndex = ONBOARDING_STEPS.findIndex((s) => s.id === currentStep)
  const isFirstStep = stepIndex === 0
  const isLastStep = stepIndex === totalSteps - 1

  const handleNextOrFinish = () => {
    // Marcar el paso actual como completado
    markStepCompleted(currentStep, true)

    if (isLastStep) {
      // Sincronizar configuraciones clave con el sistema si están disponibles
      if (data.nombreNegocio) {
        actualizarConfiguracion({
          nombre_negocio: data.nombreNegocio,
          color_primario: data.colorPrimario,
        })
      }
      completeOnboarding()
      toast.success('¡Configuración completada!', 'Tu espacio en Sagitta está listo para operar')
      onClose()
    } else {
      nextStep()
    }
  }

  const handleSkip = () => {
    markStepCompleted(currentStep, false)
    nextStep()
  }

  const handleClose = () => {
    dismissOnboarding()
    onClose()
  }

  // Manejo de agregar servicio en el paso 2
  const handleAddServicio = () => {
    if (!nuevoServicio.nombre.trim()) return
    const item: OnboardingServicioDraft = {
      id: `srv-${Date.now()}`,
      ...nuevoServicio,
    }
    updateData({
      servicios: [...data.servicios, item],
    })
    setNuevoServicio({ nombre: '', duracionMin: 45, precio: 30 })
  }

  const handleRemoveServicio = (id: string) => {
    updateData({
      servicios: data.servicios.filter((s) => s.id !== id),
    })
  }

  // Toggle de día de apertura en el paso 3
  const toggleDia = (dia: string) => {
    const yaActivo = data.diasApertura.includes(dia)
    const nuevosDias = yaActivo
      ? data.diasApertura.filter((d) => d !== dia)
      : [...data.diasApertura, dia]
    updateData({ diasApertura: nuevosDias })
  }

  const diasSemana = [
    { id: 'lunes', label: 'Lun' },
    { id: 'martes', label: 'Mar' },
    { id: 'miercoles', label: 'Mié' },
    { id: 'jueves', label: 'Jue' },
    { id: 'viernes', label: 'Vie' },
    { id: 'sabado', label: 'Sáb' },
    { id: 'domingo', label: 'Dom' },
  ]

  const paletasColores = [
    { hex: '#6366f1', label: 'Índigo Real' },
    { hex: '#0ea5e9', label: 'Azul Océano' },
    { hex: '#10b981', label: 'Esmeralda' },
    { hex: '#ec4899', label: 'Rosa Magenta' },
    { hex: '#f59e0b', label: 'Ámbar Cálido' },
  ]

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Asistente de Configuración Inicial de Sagitta"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-sm animate-fade-in"
    >
      <div className="bg-surface border border-border rounded-2xl max-w-2xl w-full shadow-2xl flex flex-col max-h-[92vh] overflow-hidden animate-scale-up">
        {/* ── Top Bar con Progreso ── */}
        <div className="p-4 sm:p-5 border-b border-border bg-surface-subtle">
          <div className="flex items-center justify-between gap-3 mb-2.5">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <span className="text-[11px] font-bold uppercase tracking-wider text-primary">
                Asistente de Bienvenida • Sagitta
              </span>
            </div>

            <button
              onClick={handleClose}
              className="p-1.5 text-text-muted hover:text-text rounded-lg hover:bg-surface transition-colors"
              aria-label="Cerrar asistente"
              title="Cerrar asistente (puedes reanudarlo luego)"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Barra de Progreso Lineal */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-text">
                Paso {stepIndex + 1} de {totalSteps}: {stepMeta.titulo}
              </span>
              <span className="text-text-muted font-mono font-medium text-[11px]">
                {progressPercentage}% completado
              </span>
            </div>

            <div className="w-full h-1.5 bg-surface rounded-full overflow-hidden border border-border/50">
              <div
                className="h-full bg-primary transition-all duration-300 rounded-full"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>

          {/* Stepper horizontal táctil */}
          <div className="flex items-center justify-between gap-1 pt-3 overflow-x-auto scrollbar-none">
            {ONBOARDING_STEPS.map((s, idx) => {
              const isCurrent = s.id === currentStep
              const isDone = data.completedSteps[s.id]
              return (
                <button
                  key={s.id}
                  onClick={() => goToStep(s.id)}
                  className={`flex items-center gap-1.5 px-2 py-1 rounded-md text-[11px] font-medium transition-all shrink-0 ${
                    isCurrent
                      ? 'bg-primary text-white shadow-2xs font-semibold'
                      : isDone
                      ? 'text-primary bg-primary-soft hover:bg-primary/20'
                      : 'text-text-muted hover:text-text hover:bg-surface'
                  }`}
                  title={s.titulo}
                >
                  <span className="w-4 h-4 rounded-full flex items-center justify-center text-[10px] border border-current font-bold">
                    {isDone ? <Check className="w-2.5 h-2.5" /> : idx + 1}
                  </span>
                  <span className="hidden sm:inline">{s.titulo}</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* ── Body Interactivo por Paso ── */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5 text-sm">
          {/* Encabezado del Paso */}
          <div>
            <h3 className="text-lg font-bold text-text flex items-center gap-2">
              <span>{stepMeta.subtitulo}</span>
            </h3>
            <p className="text-xs text-text-muted mt-0.5">
              {stepMeta.descripcionCorta}
            </p>
          </div>

          {/* 1. NEGOCIO */}
          {currentStep === 'negocio' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-text mb-1">
                  Nombre Comercial del Negocio *
                </label>
                <Input
                  required
                  value={data.nombreNegocio}
                  onChange={(e) => updateData({ nombreNegocio: e.target.value })}
                  placeholder="Ej. Clínica Dermatológica Vitalia"
                  className="w-full text-sm"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <div className="flex items-center gap-1.5 mb-1">
                    <label className="text-xs font-semibold text-text">
                      Especialidad / Vertical
                    </label>
                    <HelpTooltip content="Sagitta adapta los nombres de salas, especialistas y servicios según tu sector." />
                  </div>
                  <select
                    value={data.vertical}
                    onChange={(e) => updateData({ vertical: e.target.value })}
                    className="w-full bg-surface border border-border rounded-lg px-3 py-2 text-xs text-text focus:outline-none focus:border-primary"
                  >
                    <option value="Salón de Belleza & Estética">Salón de Belleza & Estética</option>
                    <option value="Barbería Tradicional">Barbería Tradicional</option>
                    <option value="Clínica Médica / Consultorio">Clínica Médica / Consultorio</option>
                    <option value="Spa & Bienestar Holístico">Spa & Bienestar Holístico</option>
                    <option value="Fisioterapia & Kinesiología">Fisioterapia & Kinesiología</option>
                    <option value="Estudio de Tatuajes & Piercing">Estudio de Tatuajes & Piercing</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-text mb-1">
                    Teléfono / WhatsApp de Contacto
                  </label>
                  <Input
                    value={data.telefono}
                    onChange={(e) => updateData({ telefono: e.target.value })}
                    placeholder="+52 55 1234 5678"
                    className="w-full text-sm"
                  />
                </div>
              </div>
            </div>
          )}

          {/* 2. SERVICIOS */}
          {currentStep === 'servicios' && (
            <div className="space-y-4">
              <div className="p-3 bg-surface-subtle border border-border rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-text">
                    Agregar un Servicio Principal
                  </span>
                  <HelpTooltip content="La duración en minutos se usará para calcular la disponibilidad exacta en el calendario sin solapamientos." />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5">
                  <div className="sm:col-span-6">
                    <Input
                      placeholder="Nombre (ej. Limpieza Facial Profunda)"
                      value={nuevoServicio.nombre}
                      onChange={(e) =>
                        setNuevoServicio({ ...nuevoServicio, nombre: e.target.value })
                      }
                      className="text-xs"
                    />
                  </div>
                  <div className="sm:col-span-3">
                    <Input
                      type="number"
                      placeholder="Minutos"
                      value={nuevoServicio.duracionMin}
                      onChange={(e) =>
                        setNuevoServicio({
                          ...nuevoServicio,
                          duracionMin: Number(e.target.value) || 30,
                        })
                      }
                      className="text-xs"
                    />
                  </div>
                  <div className="sm:col-span-3">
                    <Input
                      type="number"
                      placeholder="Precio ($)"
                      value={nuevoServicio.precio}
                      onChange={(e) =>
                        setNuevoServicio({
                          ...nuevoServicio,
                          precio: Number(e.target.value) || 0,
                        })
                      }
                      className="text-xs"
                    />
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button
                    type="button"
                    size="xs"
                    variant="outline"
                    onClick={handleAddServicio}
                    disabled={!nuevoServicio.nombre.trim()}
                    className="gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Añadir a la lista</span>
                  </Button>
                </div>
              </div>

              {/* Lista de Servicios Actuales */}
              <div className="space-y-2">
                <span className="text-xs font-semibold text-text block">
                  Servicios en tu catálogo ({data.servicios.length}):
                </span>
                {data.servicios.length === 0 ? (
                  <p className="text-xs text-text-muted italic py-2">
                    Aún no has agregado servicios. Puedes continuar y agregarlos más tarde.
                  </p>
                ) : (
                  <div className="divide-y divide-border border border-border rounded-xl overflow-hidden bg-surface">
                    {data.servicios.map((srv) => (
                      <div
                        key={srv.id}
                        className="p-3 flex items-center justify-between gap-3 text-xs"
                      >
                        <div>
                          <span className="font-semibold text-text block">
                            {srv.nombre}
                          </span>
                          <span className="text-text-muted text-[11px]">
                            {srv.duracionMin} minutos • ${srv.precio}.00
                          </span>
                        </div>
                        <button
                          onClick={() => handleRemoveServicio(srv.id)}
                          className="p-1.5 text-text-muted hover:text-danger rounded-md transition-colors"
                          title="Eliminar servicio"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 3. HORARIOS */}
          {currentStep === 'horarios' && (
            <div className="space-y-4">
              <div>
                <div className="flex items-center gap-1.5 mb-2">
                  <span className="text-xs font-semibold text-text">
                    Días en los que atiendes
                  </span>
                  <HelpTooltip content="Los días desactivados aparecerán en gris en el calendario y no admitirán reservas públicas." />
                </div>
                <div className="flex flex-wrap gap-2">
                  {diasSemana.map((dia) => {
                    const activo = data.diasApertura.includes(dia.id)
                    return (
                      <button
                        key={dia.id}
                        type="button"
                        onClick={() => toggleDia(dia.id)}
                        className={`px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all ${
                          activo
                            ? 'bg-primary text-white border-primary shadow-2xs'
                            : 'bg-surface text-text-muted border-border hover:border-text-muted'
                        }`}
                      >
                        {dia.label}
                      </button>
                    )
                  })}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-2">
                <div>
                  <div className="flex items-center gap-1.5 mb-1">
                    <label className="text-xs font-semibold text-text">
                      Hora de Apertura
                    </label>
                    <Clock className="w-3.5 h-3.5 text-text-muted" />
                  </div>
                  <Input
                    type="time"
                    value={data.horaApertura}
                    onChange={(e) => updateData({ horaApertura: e.target.value })}
                    className="text-xs"
                  />
                </div>
                <div>
                  <div className="flex items-center gap-1.5 mb-1">
                    <label className="text-xs font-semibold text-text">
                      Hora de Cierre
                    </label>
                    <Clock className="w-3.5 h-3.5 text-text-muted" />
                  </div>
                  <Input
                    type="time"
                    value={data.horaCierre}
                    onChange={(e) => updateData({ horaCierre: e.target.value })}
                    className="text-xs"
                  />
                </div>
              </div>
            </div>
          )}

          {/* 4. EQUIPO */}
          {currentStep === 'equipo' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-semibold text-text">
                  Profesional Principal
                </span>
                <HelpTooltip content="Podrás crear cuentas individuales y permisos para cada especialista en el módulo Equipo." />
              </div>

              <div>
                <label className="block text-xs font-semibold text-text mb-1">
                  Nombre Completo
                </label>
                <Input
                  placeholder="Ej. Dra. Marcela González"
                  value={data.primerColaborador.nombre}
                  onChange={(e) =>
                    updateData({
                      primerColaborador: {
                        ...data.primerColaborador,
                        nombre: e.target.value,
                      },
                    })
                  }
                  className="text-xs"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-text mb-1">
                    Especialidad / Rol
                  </label>
                  <Input
                    placeholder="Ej. Cosmetóloga Titular"
                    value={data.primerColaborador.especialidad}
                    onChange={(e) =>
                      updateData({
                        primerColaborador: {
                          ...data.primerColaborador,
                          especialidad: e.target.value,
                        },
                      })
                    }
                    className="text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-text mb-1">
                    Correo Electrónico (Opcional)
                  </label>
                  <Input
                    type="email"
                    placeholder="marcela@tudominio.com"
                    value={data.primerColaborador.email}
                    onChange={(e) =>
                      updateData({
                        primerColaborador: {
                          ...data.primerColaborador,
                          email: e.target.value,
                        },
                      })
                    }
                    className="text-xs"
                  />
                </div>
              </div>
            </div>
          )}

          {/* 5. PAGOS */}
          {currentStep === 'pagos' && (
            <div className="space-y-4">
              <div className="flex items-center gap-1.5 mb-1">
                <span className="text-xs font-semibold text-text">
                  Métodos de Cobro Habilitados
                </span>
                <HelpTooltip content="Estos métodos estarán disponibles en la pantalla táctil de cobro del Punto de Venta (POS)." />
              </div>

              <div className="space-y-2.5">
                <label className="flex items-center justify-between p-3 rounded-xl border border-border bg-surface cursor-pointer hover:bg-surface-subtle transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/15 text-emerald-600 flex items-center justify-center font-bold">
                      $
                    </div>
                    <div>
                      <span className="font-semibold text-text block text-xs">
                        Efectivo en Mostrador
                      </span>
                      <span className="text-[11px] text-text-muted">
                        Cobro físico en caja con cálculo de cambio.
                      </span>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={data.metodosPago.efectivo}
                    onChange={(e) =>
                      updateData({
                        metodosPago: {
                          ...data.metodosPago,
                          efectivo: e.target.checked,
                        },
                      })
                    }
                    className="w-4 h-4 rounded text-primary focus:ring-primary"
                  />
                </label>

                <label className="flex items-center justify-between p-3 rounded-xl border border-border bg-surface cursor-pointer hover:bg-surface-subtle transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-blue-500/15 text-blue-600 flex items-center justify-center">
                      <CreditCard className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="font-semibold text-text block text-xs">
                        Tarjetas de Débito y Crédito
                      </span>
                      <span className="text-[11px] text-text-muted">
                        Terminal POS bancaria o pasarela integrada.
                      </span>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={data.metodosPago.tarjeta}
                    onChange={(e) =>
                      updateData({
                        metodosPago: {
                          ...data.metodosPago,
                          tarjeta: e.target.checked,
                        },
                      })
                    }
                    className="w-4 h-4 rounded text-primary focus:ring-primary"
                  />
                </label>

                <label className="flex items-center justify-between p-3 rounded-xl border border-border bg-surface cursor-pointer hover:bg-surface-subtle transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-purple-500/15 text-purple-600 flex items-center justify-center font-bold text-xs">
                      TR
                    </div>
                    <div>
                      <span className="font-semibold text-text block text-xs">
                        Transferencias / SPEI / QR
                      </span>
                      <span className="text-[11px] text-text-muted">
                        Confirmación con folio de pago electrónico.
                      </span>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={data.metodosPago.transferencia}
                    onChange={(e) =>
                      updateData({
                        metodosPago: {
                          ...data.metodosPago,
                          transferencia: e.target.checked,
                        },
                      })
                    }
                    className="w-4 h-4 rounded text-primary focus:ring-primary"
                  />
                </label>
              </div>
            </div>
          )}

          {/* 6. PERSONALIZACIÓN */}
          {currentStep === 'personalizacion' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <div className="flex items-center gap-1.5 mb-1">
                    <label className="text-xs font-semibold text-text">
                      ¿Cómo llamas a tus citas?
                    </label>
                    <HelpTooltip content="Sagitta cambiará todas las etiquetas de la interfaz para adaptarse a tu jerga comercial." />
                  </div>
                  <select
                    value={data.terminoCita}
                    onChange={(e) =>
                      updateData({
                        terminoCita: e.target.value as 'cita' | 'turno' | 'reserva',
                      })
                    }
                    className="w-full bg-surface border border-border rounded-lg px-3 py-2 text-xs text-text focus:outline-none focus:border-primary"
                  >
                    <option value="cita">Cita (Clínicas, Consultorios)</option>
                    <option value="turno">Turno (Barberías, Salones)</option>
                    <option value="reserva">Reserva (Spas, Hoteles)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-text mb-1">
                    ¿Cómo llamas a tus clientes?
                  </label>
                  <select
                    value={data.terminoCliente}
                    onChange={(e) =>
                      updateData({
                        terminoCliente: e.target.value as 'cliente' | 'paciente' | 'socio',
                      })
                    }
                    className="w-full bg-surface border border-border rounded-lg px-3 py-2 text-xs text-text focus:outline-none focus:border-primary"
                  >
                    <option value="cliente">Cliente (General)</option>
                    <option value="paciente">Paciente (Salud / Médica)</option>
                    <option value="socio">Socio / Miembro (Club / Gimnasio)</option>
                  </select>
                </div>
              </div>

              <div>
                <span className="text-xs font-semibold text-text block mb-2">
                  Color Primario de tu Marca
                </span>
                <div className="flex items-center gap-3">
                  {paletasColores.map((color) => {
                    const isSelected = data.colorPrimario === color.hex
                    return (
                      <button
                        key={color.hex}
                        type="button"
                        onClick={() => updateData({ colorPrimario: color.hex })}
                        className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${
                          isSelected ? 'ring-2 ring-offset-2 ring-primary scale-110' : 'hover:scale-105'
                        }`}
                        style={{ backgroundColor: color.hex }}
                        title={color.label}
                      >
                        {isSelected && <Check className="w-4 h-4 text-white" />}
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>
          )}

          {/* 7. LISTO */}
          {currentStep === 'listo' && (
            <div className="text-center py-4 space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-emerald-500/15 text-emerald-500 flex items-center justify-center mx-auto border border-emerald-500/20 shadow-sm animate-bounce-subtle">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div>
                <h4 className="text-xl font-bold text-text">
                  ¡{data.nombreNegocio || 'Tu Negocio'} está Listo!
                </h4>
                <p className="text-xs text-text-muted max-w-sm mx-auto mt-1">
                  Hemos configurado tu plataforma según tus respuestas. Ya puedes comenzar a registrar citas y emitir tickets de venta.
                </p>
              </div>

              {/* Resumen de configuración en tarjetas */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-left pt-2">
                <div className="p-2.5 rounded-xl bg-surface-subtle border border-border">
                  <span className="text-[10px] uppercase font-bold text-text-muted block">
                    Vertical
                  </span>
                  <span className="text-xs font-bold text-text truncate block">
                    {data.vertical}
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-surface-subtle border border-border">
                  <span className="text-[10px] uppercase font-bold text-text-muted block">
                    Servicios
                  </span>
                  <span className="text-xs font-bold text-text block">
                    {data.servicios.length} activos
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-surface-subtle border border-border">
                  <span className="text-[10px] uppercase font-bold text-text-muted block">
                    Jornada
                  </span>
                  <span className="text-xs font-bold text-text block">
                    {data.horaApertura} - {data.horaCierre}
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-surface-subtle border border-border">
                  <span className="text-[10px] uppercase font-bold text-text-muted block">
                    Vocabulario
                  </span>
                  <span className="text-xs font-bold text-text capitalize block">
                    {data.terminoCita}s • {data.terminoCliente}s
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ── Footer con Botones de Navegación ── */}
        <div className="p-4 sm:p-5 border-t border-border bg-surface-subtle flex items-center justify-between gap-3">
          <div>
            {!isFirstStep && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={prevStep}
                className="gap-1.5 text-xs text-text-muted hover:text-text"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Atrás</span>
              </Button>
            )}
          </div>

          <div className="flex items-center gap-2">
            {stepMeta.esOmitible && !isLastStep && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleSkip}
                className="text-xs text-text-muted hover:text-text"
              >
                Omitir este paso
              </Button>
            )}

            <Button
              type="button"
              size="sm"
              onClick={handleNextOrFinish}
              className="gap-1.5 font-semibold text-xs shadow-sm"
            >
              <span>{isLastStep ? 'Empezar a Operar' : 'Continuar'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

