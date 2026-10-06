import { useState, useMemo } from 'react'
import {
  Clock,
  User,
  Phone,
  Mail,
  CheckCircle2,
  ChevronRight,
  Sparkles,
  Calendar,
  MessageSquare,
  AlertCircle,
  FileDown,
  Printer,
} from 'lucide-react'
import { Button, Input, Badge, Loader } from '@/components/ui'
import { useToast } from '@/hooks/useToast'
import type {
  Servicio,
  Empleado,
  SlotDisponible,
  Cita,
  CategoriaServicio,
  ServicioExtra,
  ConfiguracionMarcaBlanca,
} from '@/types'
import { formatTelefonoVE, handleOnlyNumbersKeyDown } from '@/utils/phone'
import {
  descargarArchivoIcs,
  generarUrlGoogleCalendar,
  generarUrlWhatsApp,
  descargarCitaPdf,
  visualizarCitaPdf,
} from '@/utils/calendar'

function formatLocalDate(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export interface PortalWizardReservaProps {
  cargando: boolean
  servicios: Servicio[]
  categorias: CategoriaServicio[]
  empleados: Empleado[]
  extrasCatalogo: ServicioExtra[]
  slots: SlotDisponible[]
  cargandoSlots: boolean
  fechaSel: string
  onFechaChange: (fecha: string) => void
  empleadoSel: Empleado | null
  onEmpleadoChange: (emp: Empleado) => void
  configuracion: ConfiguracionMarcaBlanca
  formatearMoneda: (monto: number) => string
  onCompletarReserva: (datos: {
    clienteId?: number
    servicio: Servicio
    empleado: Empleado
    fecha: string
    hora: string
    extras: ServicioExtra[]
    duracionTotal: number
    precioTotal: number
    nombreCliente: string
    telefonoCliente: string
    emailCliente: string
    notasCliente: string
  }) => Promise<{ cita: Cita; folio: string }>
  isEmbed?: boolean
}

export function PortalWizardReserva({
  cargando,
  servicios,
  categorias,
  empleados,
  extrasCatalogo,
  slots,
  cargandoSlots,
  fechaSel,
  onFechaChange,
  empleadoSel,
  onEmpleadoChange,
  configuracion,
  formatearMoneda,
  onCompletarReserva,
  isEmbed = false,
}: PortalWizardReservaProps) {
  const { toast } = useToast()

  const [paso, setPaso] = useState<1 | 2 | 3 | 4>(1)
  const [servicioSel, setServicioSel] = useState<Servicio | null>(null)
  const [horaSel, setHoraSel] = useState<string>('')
  const [categoriaFiltro, setCategoriaFiltro] = useState<number | 'todas'>('todas')
  const [extrasSeleccionados, setExtrasSeleccionados] = useState<ServicioExtra[]>([])

  // Datos del cliente
  const [nombreCliente, setNombreCliente] = useState('')
  const [telefonoCliente, setTelefonoCliente] = useState('')
  const [emailCliente, setEmailCliente] = useState('')
  const [notasCliente, setNotasCliente] = useState('')
  const [guardandoCita, setGuardandoCita] = useState(false)

  // Resultado
  const [citaConfirmada, setCitaConfirmada] = useState<Cita | null>(null)
  const [folioReserva, setFolioReserva] = useState<string>('')

  // Duración y precio total
  const duracionExtraMin = useMemo(
    () => extrasSeleccionados.reduce((acc, curr) => acc + (curr.duracion_extra_min || 0), 0),
    [extrasSeleccionados]
  )
  const duracionTotal = (servicioSel?.duracion_base_min || 0) + duracionExtraMin

  const precioTotalExtras = useMemo(
    () => extrasSeleccionados.reduce((acc, curr) => acc + (curr.precio || 0), 0),
    [extrasSeleccionados]
  )
  const precioTotal = (servicioSel?.precio_base || 0) + precioTotalExtras

  // Filtrado de servicios
  const serviciosFiltrados = useMemo(() => {
    if (categoriaFiltro === 'todas') return servicios
    return servicios.filter((s) => s.categoria_id === categoriaFiltro)
  }, [servicios, categoriaFiltro])

  // Subservicios / aditamentos para el servicio elegido
  const extrasDisponibles = useMemo(() => {
    if (!servicioSel) return []
    return extrasCatalogo.filter((e) => e.activo && (e.servicio_id === servicioSel.id || !e.servicio_id))
  }, [extrasCatalogo, servicioSel])

  // Mapa de extras por servicio
  const extrasPorServicio = useMemo(() => {
    const mapa: Record<number, ServicioExtra[]> = {}
    for (const ext of extrasCatalogo) {
      if (ext.activo && ext.servicio_id) {
        if (!mapa[ext.servicio_id]) mapa[ext.servicio_id] = []
        mapa[ext.servicio_id].push(ext)
      }
    }
    return mapa
  }, [extrasCatalogo])

  const toggleExtra = (extra: ServicioExtra) => {
    setExtrasSeleccionados((prev) =>
      prev.some((e) => e.id === extra.id)
        ? prev.filter((e) => e.id !== extra.id)
        : [...prev, extra]
    )
  }

  const handleSeleccionarServicio = (serv: Servicio) => {
    setServicioSel(serv)
    setExtrasSeleccionados([])
    setHoraSel('')
    if (!empleadoSel) {
      const empCompatible = empleados.find((e) => e.activo) ?? empleados[0]
      if (empCompatible) onEmpleadoChange(empCompatible)
    }
    setPaso(2)

    if (!isEmbed) {
      const el = document.getElementById('seccion-reserva')
      if (el) el.scrollIntoView({ behavior: 'smooth' })
    }
  }

  const handleFinalizarReserva = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!servicioSel || !empleadoSel || !fechaSel || !horaSel) {
      toast.warning('Faltan datos', 'Por favor selecciona fecha y horario')
      return
    }
    const slotSeleccionado = slots.find(
      (slot) => slot.hora_inicio.slice(0, 5) === horaSel && slot.disponible
    )
    if (cargandoSlots || !slotSeleccionado) {
      setHoraSel('')
      toast.warning('Horario no disponible', 'Selecciona nuevamente un horario disponible')
      return
    }
    if (!nombreCliente.trim() || !telefonoCliente.trim() || !emailCliente.trim()) {
      toast.warning('Campos incompletos', 'Por favor completa tus datos de contacto')
      return
    }

    setGuardandoCita(true)
    try {
      const res = await onCompletarReserva({
        servicio: servicioSel,
        empleado: empleadoSel,
        fecha: fechaSel,
        hora: horaSel,
        extras: extrasSeleccionados,
        duracionTotal,
        precioTotal,
        nombreCliente: nombreCliente.trim(),
        telefonoCliente: telefonoCliente.trim(),
        emailCliente: emailCliente.trim().toLowerCase(),
        notasCliente,
      })

      setCitaConfirmada(res.cita)
      setFolioReserva(res.folio)
      setPaso(4)
      toast.success('¡Cita Confirmada!', 'Tu reserva ha sido agendada con éxito')
    } catch (err) {
      toast.error(
        'Error al agendar',
        err instanceof Error ? err.message : 'No se pudo completar la reserva'
      )
    } finally {
      setGuardandoCita(false)
    }
  }

  const handleReiniciar = () => {
    setServicioSel(null)
    setExtrasSeleccionados([])
    setHoraSel('')
    setNombreCliente('')
    setTelefonoCliente('')
    setEmailCliente('')
    setNotasCliente('')
    setCitaConfirmada(null)
    setFolioReserva('')
    setPaso(1)
  }

  return (
    <>
      <section
        id="seccion-reserva"
        className={`max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 w-full ${isEmbed ? 'py-4' : 'py-12'}`}
      >
        {/* Indicador de pasos */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-sm mb-8">
          <div className="grid grid-cols-4 gap-2 text-center text-xs font-medium">
            <div
              className={`p-2 rounded-xl transition-all ${
                paso === 1
                  ? 'bg-primary-50 dark:bg-primary-950/60 text-primary-700 dark:text-primary-300 font-bold'
                  : paso > 1
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : 'text-slate-400'
              }`}
            >
              1. Servicio
            </div>
            <div
              className={`p-2 rounded-xl transition-all ${
                paso === 2
                  ? 'bg-primary-50 dark:bg-primary-950/60 text-primary-700 dark:text-primary-300 font-bold'
                  : paso > 2
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : 'text-slate-400'
              }`}
            >
              2. Horario
            </div>
            <div
              className={`p-2 rounded-xl transition-all ${
                paso === 3
                  ? 'bg-primary-50 dark:bg-primary-950/60 text-primary-700 dark:text-primary-300 font-bold'
                  : paso > 3
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : 'text-slate-400'
              }`}
            >
              3. Tus Datos
            </div>
            <div
              className={`p-2 rounded-xl transition-all ${
                paso === 4
                  ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-bold'
                  : 'text-slate-400'
              }`}
            >
              4. Confirmada
            </div>
          </div>
        </div>

        {/* ── PASO 1: CATÁLOGO Y ELECCIÓN DE SERVICIO ── */}
        {paso === 1 && (
          <div id="servicios" className="space-y-6">
            <div className="text-center sm:text-left">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                Elige tu Servicio
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                Haz clic en el tratamiento o servicio que deseas agendar
              </p>
            </div>

            {/* Filtro por categorías */}
            {categorias.length > 0 && (
              <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
                <button
                  type="button"
                  onClick={() => setCategoriaFiltro('todas')}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                    categoriaFiltro === 'todas'
                      ? 'bg-primary-600 text-white shadow-sm'
                      : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:border-primary-300'
                  }`}
                >
                  Todos los Servicios ({servicios.length})
                </button>
                {categorias.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setCategoriaFiltro(cat.id)}
                    className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                      categoriaFiltro === cat.id
                        ? 'bg-primary-600 text-white shadow-sm'
                        : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:border-primary-300'
                    }`}
                  >
                    {cat.nombre}
                  </button>
                ))}
              </div>
            )}

            {/* Listado de Servicios en Cards */}
            {cargando ? (
              <div className="py-12 flex justify-center">
                <Loader text="Cargando catálogo de servicios..." />
              </div>
            ) : serviciosFiltrados.length === 0 ? (
              <div className="text-center py-12 bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-slate-300 dark:border-slate-800">
                <AlertCircle className="w-10 h-10 text-slate-400 mx-auto mb-2" />
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                  No hay servicios disponibles en esta categoría
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {serviciosFiltrados.map((serv) => {
                  const isSelected = servicioSel?.id === serv.id
                  return (
                    <div
                      key={serv.id}
                      onClick={() => setServicioSel(serv)}
                      className={`bg-white dark:bg-slate-900 rounded-2xl border p-5 transition-all flex flex-col justify-between group cursor-pointer ${
                        isSelected
                          ? 'border-neutral-900 dark:border-white ring-2 ring-neutral-900/15 dark:ring-white/20 shadow-lg bg-neutral-50/50 dark:bg-neutral-800/40'
                          : 'border-slate-200 dark:border-slate-800 hover:border-neutral-400 dark:hover:border-neutral-600 hover:shadow-md'
                      }`}
                    >
                      <div>
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <h3
                            className={`font-bold text-base transition-colors ${
                              isSelected
                                ? 'text-primary-600 dark:text-primary-400'
                                : 'text-slate-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400'
                            }`}
                          >
                            {serv.nombre}
                          </h3>
                          <span className="font-extrabold text-base text-primary-600 dark:text-primary-400 shrink-0">
                            {formatearMoneda(serv.precio_base)}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed mb-3">
                          {serv.descripcion || 'Servicio profesional garantizado por nuestro equipo.'}
                        </p>

                        {/* Indicador de aditamentos disponibles */}
                        {extrasPorServicio[serv.id] && extrasPorServicio[serv.id].length > 0 && (
                          <div className="mb-4">
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-primary-50 dark:bg-primary-950/60 text-primary-700 dark:text-primary-300 border border-primary-200/60 dark:border-primary-800/40">
                              <Sparkles className="w-3 h-3 text-primary-500 shrink-0" />
                              <span>{extrasPorServicio[serv.id].length} aditamentos disponibles</span>
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                        <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 font-medium">
                          <Clock className="w-3.5 h-3.5 text-primary-500" />
                          <span>{serv.duracion_base_min} minutos</span>
                        </div>
                        <Button
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleSeleccionarServicio(serv)
                          }}
                          className={`rounded-xl text-xs font-semibold ${
                            isSelected ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900' : ''
                          }`}
                        >
                          <span>{isSelected ? 'Continuar' : 'Reservar'}</span>
                          <ChevronRight className="w-3.5 h-3.5 ml-1" />
                        </Button>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}

            {/* Isla Flotante de Selección Dinámica (Estilo Apple / wilanye.com) */}
            {paso === 1 && servicioSel && (
              <div className="fixed bottom-6 inset-x-0 mx-auto w-[92%] sm:w-[96%] max-w-[480px] z-40 transition-all duration-300 animate-in fade-in slide-in-from-bottom-5">
                <div className="backdrop-blur-2xl bg-neutral-900/95 dark:bg-white/95 text-white dark:text-neutral-900 rounded-2xl px-4 py-3 sm:py-3.5 shadow-[0_16px_48px_rgba(0,0,0,0.28)] flex items-center justify-between border border-white/10 dark:border-black/10 gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 text-[11px] text-neutral-400 dark:text-neutral-500 font-medium truncate">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block shrink-0" />
                      <span>Servicio seleccionado</span>
                      <span>•</span>
                      <span>{servicioSel.duracion_base_min} min</span>
                    </div>
                    <div className="font-bold text-sm sm:text-base truncate text-white dark:text-neutral-900 mt-0.5">
                      {servicioSel.nombre}
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-base sm:text-lg font-extrabold text-white dark:text-neutral-900">
                      {formatearMoneda(servicioSel.precio_base)}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleSeleccionarServicio(servicioSel)}
                      className="inline-flex items-center gap-1.5 px-4 py-2 sm:py-2.5 rounded-xl bg-white text-neutral-900 dark:bg-neutral-900 dark:text-white font-bold text-xs sm:text-sm hover:opacity-90 active:scale-95 transition-all shadow-md"
                    >
                      <span>Elegir Horario</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── PASO 2: PROFESIONAL, FECHA Y HORA ── */}
        {paso === 2 && servicioSel && (
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-primary-600 dark:text-primary-400">
                  Paso 2 de 3
                </span>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                  ¿Quién te atenderá y cuándo?
                </h2>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setPaso(1)}>
                Cambiar servicio
              </Button>
            </div>

            {/* Resumen del servicio elegido y totales dinámicos */}
            <div className="bg-primary-50 dark:bg-primary-950/50 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border border-primary-100 dark:border-primary-900/50">
              <div>
                <p className="text-xs text-primary-700 dark:text-primary-300 font-semibold">
                  Servicio Seleccionado:
                </p>
                <p className="font-bold text-slate-900 dark:text-white text-base">
                  {servicioSel.nombre}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Base: {servicioSel.duracion_base_min} min • Duración estimada: <strong className="text-slate-700 dark:text-slate-300">{duracionTotal} min</strong>
                </p>
              </div>
              <div className="text-left sm:text-right">
                <span className="text-2xl font-black text-primary-600 dark:text-primary-400 block">
                  {formatearMoneda(precioTotal)}
                </span>
                {extrasSeleccionados.length > 0 ? (
                  <span className="text-[11px] text-primary-700 dark:text-primary-300 font-medium">
                    Incluye {extrasSeleccionados.length} aditamento{extrasSeleccionados.length > 1 ? 's' : ''} (+{formatearMoneda(precioTotalExtras)})
                  </span>
                ) : (
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">
                    Pago directo en tienda
                  </span>
                )}
              </div>
            </div>

            {/* Subservicios y Aditamentos Opcionales */}
            {extrasDisponibles.length > 0 && (
              <div className="space-y-3 pt-1">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-primary-500" />
                      <span>Aditamentos y Subservicios Opcionales</span>
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Personaliza tu experiencia agregando complementos a tu {servicioSel.nombre}:
                    </p>
                  </div>
                  {extrasSeleccionados.length > 0 && (
                    <Badge variant="primary" className="text-xs font-semibold">
                      {extrasSeleccionados.length} seleccionado{extrasSeleccionados.length > 1 ? 's' : ''}
                    </Badge>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {extrasDisponibles.map((extra) => {
                    const seleccionado = extrasSeleccionados.some((e) => e.id === extra.id)
                    return (
                      <button
                        key={extra.id}
                        type="button"
                        onClick={() => toggleExtra(extra)}
                        className={`p-3.5 rounded-xl border text-left transition-all flex flex-col justify-between cursor-pointer ${
                          seleccionado
                            ? 'border-primary-600 bg-primary-50/70 dark:bg-primary-950/50 ring-2 ring-primary-500/25 shadow-sm'
                            : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/80 hover:border-slate-300 dark:hover:border-slate-700'
                        }`}
                      >
                        <div>
                          <div className="flex items-start justify-between gap-2 mb-1.5">
                            <span className="font-semibold text-xs sm:text-sm text-slate-900 dark:text-white line-clamp-1">
                              {extra.nombre}
                            </span>
                            <span className="font-bold text-xs text-primary-600 dark:text-primary-400 shrink-0">
                              +{formatearMoneda(extra.precio)}
                            </span>
                          </div>
                          {extra.descripcion && (
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-2 line-clamp-2 leading-relaxed">
                              {extra.descripcion}
                            </p>
                          )}
                        </div>

                        <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-700/60 text-[11px]">
                          <span className="text-slate-400 font-medium">
                            {extra.duracion_extra_min > 0 ? `+${extra.duracion_extra_min} min` : 'Sin tiempo extra'}
                          </span>
                          <span
                            className={`font-semibold px-2 py-0.5 rounded text-[10px] ${
                              seleccionado
                                ? 'bg-primary-600 text-white'
                                : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                            }`}
                          >
                            {seleccionado ? '✓ Añadido' : '+ Agregar'}
                          </span>
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Selector de Profesional */}
            <div>
              <label className="block text-sm font-semibold text-slate-800 dark:text-slate-200 mb-3">
                Selecciona al Profesional
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {empleados.map((emp) => (
                  <button
                    key={emp.id}
                    type="button"
                    onClick={() => {
                      onEmpleadoChange(emp)
                      setHoraSel('')
                    }}
                    className={`flex items-center gap-3 p-3.5 rounded-xl border text-left transition-all ${
                      empleadoSel?.id === emp.id
                        ? 'border-primary-600 bg-primary-50/50 dark:bg-primary-950/40 ring-2 ring-primary-500/20'
                        : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
                    }`}
                  >
                    <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center font-bold text-slate-700 dark:text-slate-200 shrink-0">
                      {emp.nombre.charAt(0)}
                    </div>
                    <div className="overflow-hidden">
                      <p className="font-semibold text-sm truncate text-slate-900 dark:text-white">
                        {emp.nombre}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                        {emp.especialidad || 'Especialista'}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Selector de Fecha */}
            <div>
              <label className="block text-sm font-semibold text-slate-800 dark:text-slate-200 mb-2">
                Selecciona el Día
              </label>
              <input
                type="date"
                value={fechaSel}
                min={formatLocalDate(new Date())}
                onChange={(e) => {
                  onFechaChange(e.target.value)
                  setHoraSel('')
                }}
                className="w-full sm:w-64 px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-medium focus:ring-2 focus:ring-primary-500 focus:outline-none"
              />
            </div>

            {/* Selector de Horarios Disponibles */}
            <div>
              <label className="block text-sm font-semibold text-slate-800 dark:text-slate-200 mb-2">
                Horarios Disponibles para el {fechaSel}
              </label>
              {cargandoSlots ? (
                <div className="py-6 flex justify-center">
                  <Loader text="Consultando disponibilidad..." />
                </div>
              ) : slots.length === 0 ? (
                <p className="text-xs text-slate-500 py-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl px-4 border border-dashed border-slate-200 dark:border-slate-700">
                  No hay horarios disponibles para esta fecha. Intenta con otro día.
                </p>
              ) : (
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
                  {slots.map((slot) => {
                    const horaFormato = slot.hora_inicio.slice(0, 5)
                    const seleccionado = horaSel === horaFormato
                    return (
                      <button
                        key={slot.hora_inicio}
                        type="button"
                        disabled={!slot.disponible}
                        onClick={() => setHoraSel(horaFormato)}
                        className={`py-2 px-3 rounded-xl text-xs font-semibold text-center transition-all ${
                          !slot.disponible
                            ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed line-through'
                            : seleccionado
                            ? 'bg-primary-600 text-white shadow-md'
                            : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-primary-500'
                        }`}
                      >
                        {horaFormato}
                      </button>
                    )
                  })}
                </div>
              )}
            </div>

            <div className="pt-4 flex justify-between items-center border-t border-slate-100 dark:border-slate-800">
              <Button variant="outline" onClick={() => setPaso(1)}>
                Volver
              </Button>
              <Button
                disabled={!horaSel}
                onClick={() => setPaso(3)}
                className="px-6"
              >
                <span>Continuar a tus Datos</span>
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </div>
        )}

        {/* ── PASO 3: FORMULARIO DE CONTACTO DIRECTO (SIN REGISTRO) ── */}
        {paso === 3 && servicioSel && empleadoSel && (
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-primary-600 dark:text-primary-400">
                  Paso 3 de 3 • Confirmación Inmediata
                </span>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                  Ingresa tus Datos de Contacto
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Sin contraseñas ni registros obligatorios. Solo necesitamos tus datos para la cita.
                </p>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setPaso(2)}>
                Modificar fecha
              </Button>
            </div>

            {/* Resumen flotante */}
            <div className="bg-slate-50 dark:bg-slate-800/60 rounded-xl p-4 border border-slate-200 dark:border-slate-700 text-xs space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <span className="text-slate-400 block font-medium">Servicio:</span>
                  <span className="font-bold text-slate-900 dark:text-white">
                    {servicioSel.nombre}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">Atendido por:</span>
                  <span className="font-bold text-slate-900 dark:text-white">
                    {empleadoSel.nombre}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">Fecha y Hora:</span>
                  <span className="font-bold text-primary-600 dark:text-primary-400">
                    {fechaSel} a las {horaSel} ({duracionTotal} min)
                  </span>
                </div>
              </div>

              {extrasSeleccionados.length > 0 && (
                <div className="pt-2 border-t border-slate-200 dark:border-slate-700">
                  <span className="text-slate-400 block font-medium mb-1.5">Aditamentos / Subservicios:</span>
                  <div className="flex flex-wrap gap-2">
                    {extrasSeleccionados.map((ext) => (
                      <span
                        key={ext.id}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-800 dark:text-slate-200 text-xs font-medium"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                        <span>{ext.nombre}</span>
                        <strong className="text-primary-600 dark:text-primary-400">+{formatearMoneda(ext.precio)}</strong>
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="pt-2 border-t border-slate-200 dark:border-slate-700 flex justify-between items-center">
                <span className="font-semibold text-slate-600 dark:text-slate-300">Total a Pagar en Tienda:</span>
                <span className="text-base font-extrabold text-primary-600 dark:text-primary-400">{formatearMoneda(precioTotal)}</span>
              </div>
            </div>

            {/* Formulario sin register */}
            <form onSubmit={handleFinalizarReserva} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Nombre y Apellidos"
                  placeholder="Ej. Laura Martínez"
                  value={nombreCliente}
                  onChange={(e) => setNombreCliente(e.target.value)}
                  leftIcon={<User className="w-4 h-4" />}
                  required
                />
                <Input
                  label="Teléfono / WhatsApp (para recordatorio)"
                  placeholder="+58 412 123 4567"
                  type="tel"
                  value={telefonoCliente}
                  onChange={(e) => setTelefonoCliente(formatTelefonoVE(e.target.value))}
                  onKeyDown={handleOnlyNumbersKeyDown}
                  leftIcon={<Phone className="w-4 h-4" />}
                  required
                />
              </div>

              <Input
                label="Correo Electrónico (para comprobante)"
                placeholder="tu@correo.com"
                type="email"
                value={emailCliente}
                onChange={(e) => setEmailCliente(e.target.value)}
                leftIcon={<Mail className="w-4 h-4" />}
                required
              />

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Notas o Solicitudes Especiales (Opcional)
                </label>
                <textarea
                  rows={3}
                  value={notasCliente}
                  onChange={(e) => setNotasCliente(e.target.value)}
                  placeholder="Escribe alguna observación previa para el profesional..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:ring-2 focus:ring-primary-500 focus:outline-none"
                />
              </div>

              <div className="pt-4 flex justify-between items-center border-t border-slate-100 dark:border-slate-800">
                <Button variant="outline" type="button" onClick={() => setPaso(2)}>
                  Atrás
                </Button>
                <Button
                  type="submit"
                  disabled={guardandoCita}
                  className="px-8 font-bold shadow-md bg-emerald-600 hover:bg-emerald-700 text-white"
                >
                  {guardandoCita ? (
                    <span className="flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Agendando...
                    </span>
                  ) : (
                    <span>Confirmar Cita Ahora</span>
                  )}
                </Button>
              </div>
            </form>
          </div>
        )}

        {/* ── PASO 4: CITA CONFIRMADA EXITOSAMENTE ── */}
        {paso === 4 && citaConfirmada && (
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 sm:p-12 text-center max-w-2xl mx-auto shadow-xl space-y-6">
            <div className="w-20 h-20 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div>
              <span className="inline-block px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-xs font-mono font-bold tracking-wider mb-2">
                Folio Oficial: {folioReserva}
              </span>
              <h2 className="text-3xl font-black text-slate-900 dark:text-white">
                ¡Tu Cita está Confirmada!
              </h2>
              <p className="text-slate-500 dark:text-slate-400 text-sm mt-1 max-w-md mx-auto">
                Hemos reservado tu turno. Te esperamos en la sede en la fecha y hora indicadas.
              </p>
            </div>

            {/* Ficha Resumen de la Cita */}
            <div className="bg-slate-50 dark:bg-slate-800/60 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 text-left text-xs space-y-2.5">
              <div className="flex justify-between">
                <span className="text-slate-500">Cliente:</span>
                <span className="font-semibold text-slate-900 dark:text-white">
                  {nombreCliente} ({telefonoCliente})
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Servicio Principal:</span>
                <span className="font-semibold text-slate-900 dark:text-white">
                  {servicioSel?.nombre}
                </span>
              </div>
              {extrasSeleccionados.length > 0 && (
                <div className="pt-1.5 border-t border-slate-200 dark:border-slate-700 space-y-1">
                  <span className="text-slate-500 font-semibold block">Aditamentos / Subservicios:</span>
                  {extrasSeleccionados.map((ext) => (
                    <div key={ext.id} className="flex justify-between pl-2 text-slate-700 dark:text-slate-300">
                      <span>• {ext.nombre}</span>
                      <span className="font-bold text-primary-600 dark:text-primary-400">+{formatearMoneda(ext.precio)}</span>
                    </div>
                  ))}
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-slate-500">Profesional:</span>
                <span className="font-semibold text-slate-900 dark:text-white">
                  {empleadoSel?.nombre}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Fecha y Hora:</span>
                <span className="font-bold text-primary-600 dark:text-primary-400">
                  {fechaSel} — {horaSel} hrs ({duracionTotal} min)
                </span>
              </div>
              <div className="flex justify-between pt-2 border-t border-slate-200 dark:border-slate-700">
                <span className="text-slate-500 font-semibold">Total a pagar:</span>
                <span className="font-extrabold text-slate-900 dark:text-white text-base">
                  {formatearMoneda(precioTotal)}
                </span>
              </div>
              <div className="flex justify-between pt-2 border-t border-slate-200 dark:border-slate-700 text-xs text-slate-500">
                <span>Modalidad:</span>
                <Badge variant="success">Presencial en tienda</Badge>
              </div>
            </div>

            {/* Acciones de exportación de calendario */}
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <a
                href={generarUrlGoogleCalendar(citaConfirmada)}
                target="_blank"
                rel="noreferrer"
              >
                <Button variant="outline" size="sm" className="gap-2">
                  <Calendar className="w-4 h-4 text-primary-600" />
                  <span>Google Calendar</span>
                </Button>
              </a>

              <Button
                variant="outline"
                size="sm"
                className="gap-2"
                onClick={() => descargarArchivoIcs(citaConfirmada, configuracion.nombre_negocio)}
              >
                <Calendar className="w-4 h-4 text-primary-600" />
                <span>Descargar (.ics)</span>
              </Button>

              <Button
                variant="outline"
                size="sm"
                className="gap-2"
                onClick={() => descargarCitaPdf(citaConfirmada, configuracion)}
              >
                <FileDown className="w-4 h-4 text-primary-600" />
                <span>Descargar PDF</span>
              </Button>

              <Button
                variant="outline"
                size="sm"
                className="gap-2"
                onClick={() => visualizarCitaPdf(citaConfirmada, configuracion)}
              >
                <Printer className="w-4 h-4 text-primary-600" />
                <span>Ver / Imprimir Comprobante</span>
              </Button>

              {configuracion.telefono_soporte && (
                <a
                  href={generarUrlWhatsApp(
                    configuracion.telefono_soporte,
                    `Hola, confirmo mi cita para ${servicioSel?.nombre}${extrasSeleccionados.length > 0 ? ` con ${extrasSeleccionados.length} aditamento(s): ${extrasSeleccionados.map((e) => e.nombre).join(', ')}` : ''} el ${fechaSel} a las ${horaSel}. Total a pagar: ${formatearMoneda(precioTotal)}. Mi nombre es ${nombreCliente}.`
                  )}
                  target="_blank"
                  rel="noreferrer"
                >
                  <Button variant="outline" size="sm" className="gap-2">
                    <MessageSquare className="w-4 h-4 text-emerald-600" />
                    <span>WhatsApp</span>
                  </Button>
                </a>
              )}
            </div>

            <div className="pt-4">
              <Button onClick={handleReiniciar} variant="ghost" size="sm">
                Agendar otra cita
              </Button>
            </div>
          </div>
        )}
      </section>

      {/* ─── 4. CÓMO FUNCIONA (Solo si no está en modo embebido) ─────────────── */}
      {!isEmbed && (
        <section
          id="como-funciona"
          className="py-16 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800"
        >
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white">
                Agendar es Simple y Rápido
              </h2>
              <p className="text-slate-500 dark:text-slate-400 text-sm mt-2">
                Sin registros complicados. Tu tiempo vale oro y cuidamos cada detalle.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-slate-50 dark:bg-slate-800/40 p-6 rounded-2xl border border-slate-200 dark:border-slate-700/60 text-center space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-primary-100 dark:bg-primary-950/80 text-primary-600 dark:text-primary-400 font-bold text-lg flex items-center justify-center mx-auto">
                  1
                </div>
                <h3 className="font-bold text-lg text-slate-900 dark:text-white">
                  Elige tu Servicio
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Revisa nuestro catálogo con precios y duraciones transparentes.
                </p>
              </div>

              <div className="bg-slate-50 dark:bg-slate-800/40 p-6 rounded-2xl border border-slate-200 dark:border-slate-700/60 text-center space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-primary-100 dark:bg-primary-950/80 text-primary-600 dark:text-primary-400 font-bold text-lg flex items-center justify-center mx-auto">
                  2
                </div>
                <h3 className="font-bold text-lg text-slate-900 dark:text-white">
                  Escoge el Horario
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Selecciona al profesional y el turno que mejor se ajuste a tu día a día.
                </p>
              </div>

              <div className="bg-slate-50 dark:bg-slate-800/40 p-6 rounded-2xl border border-slate-200 dark:border-slate-700/60 text-center space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-primary-100 dark:bg-primary-950/80 text-primary-600 dark:text-primary-400 font-bold text-lg flex items-center justify-center mx-auto">
                  3
                </div>
                <h3 className="font-bold text-lg text-slate-900 dark:text-white">
                  Confirmación Inmediata
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Solo ingresa tu nombre y teléfono. Paga directamente al asistir a tu cita.
                </p>
              </div>
            </div>
          </div>
        </section>
      )}
    </>
  )
}
