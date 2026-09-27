import { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import {
  CalendarDays,
  Clock,
  User,
  Phone,
  Mail,
  MapPin,
  CheckCircle2,
  Lock,
  ChevronRight,
  ArrowRight,
  Sparkles,
  Calendar,
  MessageSquare,
  ShieldCheck,
  AlertCircle,
  Scissors,
  FileDown,
  Printer,
} from 'lucide-react'
import { useConfiguracion } from '@/hooks/useConfiguracion'
import { TenantSelector } from '@/components/crm/TenantSelector'
import { Button, Input, Badge, Loader } from '@/components/ui'
import { useToast } from '@/hooks/useToast'
import { serviciosService } from '@/services/servicios.service'
import { empleadosService } from '@/services/empleados.service'
import { citasService } from '@/services/citas.service'
import { clientesService } from '@/services/clientes.service'
import { pagosService } from '@/services/pagos.service'
import { Servicio, Empleado, SlotDisponible, Cita, CategoriaServicio, ServicioExtra } from '@/types'
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

export default function PortalReservaPage() {
  const { configuracion, nombreMarca, lemaMarca } = useConfiguracion()
  const { toast } = useToast()

  const formatearMoneda = (monto: number) =>
    `${configuracion.simbolo_moneda || '$'}${monto.toFixed(2)}`

  // Estados de carga y catálogos
  const [cargando, setCargando] = useState(true)
  const [servicios, setServicios] = useState<Servicio[]>([])
  const [categorias, setCategorias] = useState<CategoriaServicio[]>([])
  const [empleados, setEmpleados] = useState<Empleado[]>([])
  const [extrasCatalogo, setExtrasCatalogo] = useState<ServicioExtra[]>([])
  const [extrasSeleccionados, setExtrasSeleccionados] = useState<ServicioExtra[]>([])
  const [categoriaFiltro, setCategoriaFiltro] = useState<number | 'todas'>('todas')

  // Estados del Flujo de Reserva
  const [paso, setPaso] = useState<1 | 2 | 3 | 4>(1)
  const [servicioSel, setServicioSel] = useState<Servicio | null>(null)
  const [empleadoSel, setEmpleadoSel] = useState<Empleado | null>(null)
  const [fechaSel, setFechaSel] = useState<string>('')
  const [horaSel, setHoraSel] = useState<string>('')
  const [slots, setSlots] = useState<SlotDisponible[]>([])
  const [cargandoSlots, setCargandoSlots] = useState(false)

  // Datos de contacto del cliente (¡Sin necesidad de cuenta/registro!)
  const [nombreCliente, setNombreCliente] = useState('')
  const [telefonoCliente, setTelefonoCliente] = useState('')
  const [emailCliente, setEmailCliente] = useState('')
  const [notasCliente, setNotasCliente] = useState('')
  const [guardandoCita, setGuardandoCita] = useState(false)

  // Resultado de confirmación
  const [citaConfirmada, setCitaConfirmada] = useState<Cita | null>(null)
  const [folioReserva, setFolioReserva] = useState<string>('')
  const duracionExtraMin = useMemo(
    () => extrasSeleccionados.reduce((acc, curr) => acc + (curr.duracion_extra_min || 0), 0),
    [extrasSeleccionados]
  )
  const duracionTotal = (servicioSel?.duracion_base_min || 0) + duracionExtraMin

  // Cargar datos iniciales
  useEffect(() => {
    async function cargarCatalogos() {
      try {
        const [resServ, resCat, resEmp, resExt] = await Promise.all([
          serviciosService.getAll(),
          serviciosService.getCategorias(),
          empleadosService.getAll(),
          pagosService.getServiciosExtra(),
        ])
        setServicios((resServ.data ?? []).filter((servicio) => servicio.activo))
        setCategorias(resCat.data ?? [])
        setEmpleados((resEmp.data ?? []).filter((empleado) => empleado.activo))
        setExtrasCatalogo(resExt.data ?? [])

        // Fecha por defecto: hoy o mañana
        const hoy = new Date()
        hoy.setDate(hoy.getDate() + 1)
        setFechaSel(formatLocalDate(hoy))
      } catch (err) {
        console.error('Error al cargar datos del portal', err)
      } finally {
        setCargando(false)
      }
    }
    cargarCatalogos()
  }, [])

  // Cargar disponibilidad al cambiar fecha o empleado
  useEffect(() => {
    if (!fechaSel || !empleadoSel) {
      setSlots([])
      setCargandoSlots(false)
      return
    }

    let cancelled = false
    setCargandoSlots(true)
    setSlots([])
    citasService
      .getDisponibilidad(empleadoSel.id, fechaSel, servicioSel?.id, duracionTotal)
      .then((res) => {
        if (!cancelled) setSlots(res.data ?? [])
      })
      .catch(() => {
        if (!cancelled) setSlots([])
      })
      .finally(() => {
        if (!cancelled) setCargandoSlots(false)
      })

    return () => {
      cancelled = true
    }
  }, [fechaSel, empleadoSel, servicioSel, duracionTotal])

  // Filtrar servicios
  const serviciosFiltrados = useMemo(() => {
    if (categoriaFiltro === 'todas') return servicios
    return servicios.filter((s) => s.categoria_id === categoriaFiltro)
  }, [servicios, categoriaFiltro])

  // Subservicios / aditamentos disponibles para el servicio elegido
  const extrasDisponibles = useMemo(() => {
    if (!servicioSel) return []
    return extrasCatalogo.filter((e) => e.activo && (e.servicio_id === servicioSel.id || !e.servicio_id))
  }, [extrasCatalogo, servicioSel])

  // Subservicios agrupados por servicio_id para mostrar badges en catálogo
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

  // Toggle selección de un extra
  const toggleExtra = (extra: ServicioExtra) => {
    setExtrasSeleccionados((prev) =>
      prev.some((e) => e.id === extra.id)
        ? prev.filter((e) => e.id !== extra.id)
        : [...prev, extra]
    )
  }

  // Cálculo de tiempo y precio con extras
  const precioTotalExtras = useMemo(
    () => extrasSeleccionados.reduce((acc, curr) => acc + (curr.precio || 0), 0),
    [extrasSeleccionados]
  )

  const precioTotal = (servicioSel?.precio_base || 0) + precioTotalExtras

  // Seleccionar servicio e iniciar wizard
  const handleSeleccionarServicio = (serv: Servicio) => {
    setServicioSel(serv)
    setExtrasSeleccionados([])
    setHoraSel('')
    // Asignar primer empleado activo disponible por defecto si no hay uno elegido
    const empCompatible = empleados.find((e) => e.activo) ?? empleados[0]
    setEmpleadoSel(empCompatible ?? null)
    setPaso(2)

    // Scroll suave hacia la sección de reserva
    const el = document.getElementById('seccion-reserva')
    if (el) el.scrollIntoView({ behavior: 'smooth' })
  }

  // Confirmar y guardar la cita
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
      // 1. Registrar o asociar cliente
      const resCli = await clientesService.create({
        nombre: nombreCliente.trim(),
        telefono: telefonoCliente.trim(),
        email: emailCliente.trim().toLowerCase(),
        notas: notasCliente,
      })

      const clienteId = resCli.data?.id ?? Date.now()

      // 2. Calcular duraciones y fecha inicio / fin
      const durMin = duracionTotal || 45
      const inicio = new Date(`${fechaSel}T${horaSel}:00`)
      const fechaInicio = inicio.toISOString()
      const fechaFin = new Date(inicio.getTime() + durMin * 60000).toISOString()

      // 3. Crear cita en el sistema
      const nombresExtras = extrasSeleccionados.map((e) => e.nombre).join(', ')
      const notaFinal = [
        notasCliente ? `[Reserva Web] ${notasCliente}` : '[Reserva Web]',
        nombresExtras ? `Aditamentos: ${nombresExtras}` : null,
      ]
        .filter(Boolean)
        .join(' | ')

      const resCita = await citasService.create({
        cliente_id: clienteId,
        empleado_id: empleadoSel.id,
        servicio_id: servicioSel.id,
        fecha_inicio: fechaInicio,
        fecha_fin: fechaFin,
        precio_total: precioTotal,
        estado: 'confirmada',
        modalidad: 'presencial',
        notas: notaFinal,
      })

      const folio = `CIT-${resCita.data?.id ?? Date.now()}`
      setFolioReserva(folio)

      const citaGuardada: Cita = resCita.data ?? {
        id: Date.now(),
        cliente_id: clienteId,
        empleado_id: empleadoSel.id,
        servicio_id: servicioSel.id,
        fecha_inicio: fechaInicio,
        fecha_fin: fechaFin,
        precio_total: precioTotal,
        estado: 'confirmada',
        servicio: servicioSel,
        empleado: empleadoSel,
        cliente: {
          id: clienteId,
          nombre: nombreCliente,
          email: emailCliente,
          telefono: telefonoCliente,
          total_citas: 1,
          created_at: new Date().toISOString(),
        },
        created_at: new Date().toISOString(),
      }

      setCitaConfirmada(citaGuardada)
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

  // Reiniciar para agendar otra
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
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 selection:bg-primary-500 selection:text-white">
      {/* ─── 1. NAVBAR PÚBLICO LIMPIO ────────────────────────────────────────── */}
      <header className="sticky top-0 z-40 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
          {/* Logo y Nombre de Marca (White Label) */}
          <div className="flex items-center gap-3">
            {configuracion.logo_url ? (
              <img
                src={configuracion.logo_url}
                alt={nombreMarca}
                className="h-10 max-w-[160px] object-contain"
              />
            ) : (
              <div className="w-10 h-10 rounded-xl bg-primary-600 flex items-center justify-center text-white shadow-md shadow-primary-500/30">
                <Scissors className="w-5 h-5" />
              </div>
            )}
            <div>
              <span className="font-bold text-lg tracking-tight block leading-tight text-slate-900 dark:text-white">
                {nombreMarca}
              </span>
              {lemaMarca && (
                <span className="text-xs text-slate-500 dark:text-slate-400 hidden sm:block">
                  {lemaMarca}
                </span>
              )}
            </div>
          </div>

          {/* Menú central: Servicios que ofrecemos */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600 dark:text-slate-300">
            <a
              href="#servicios"
              className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors py-1 flex items-center gap-1.5"
            >
              <Sparkles className="w-4 h-4 text-primary-500" />
              Nuestros Servicios
            </a>
            <a
              href="#como-funciona"
              className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors py-1"
            >
              Cómo Funciona
            </a>
            <a
              href="#contacto"
              className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors py-1"
            >
              Ubicación y Contacto
            </a>
          </nav>

          {/* Selectores de sucursal y teléfono directo */}
          <div className="flex items-center gap-2.5">
            <TenantSelector />

            {configuracion.telefono_soporte && (
              <a
                href={`tel:${configuracion.telefono_soporte}`}
                className="hidden lg:flex items-center gap-2 text-xs font-semibold text-primary-700 dark:text-primary-300 bg-primary-50 dark:bg-primary-900/30 border border-primary-200 dark:border-primary-800/50 px-3 py-1.5 rounded-full hover:bg-primary-100 transition-colors"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>{configuracion.telefono_soporte}</span>
              </a>
            )}
          </div>
        </div>
      </header>

      {/* ─── 2. HERO PRINCIPAL ────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-gradient-to-b from-primary-50/60 via-white to-slate-50 dark:from-slate-900 dark:via-slate-950 dark:to-slate-950 py-16 sm:py-24 border-b border-slate-100 dark:border-slate-800">
        <div className="absolute inset-0 bg-[radial-gradient(#6366f1_1px,transparent_1px)] [background-size:20px_20px] opacity-20 pointer-events-none" />

        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center relative z-10 space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-100 dark:bg-primary-950/70 border border-primary-200 dark:border-primary-800 text-primary-700 dark:text-primary-300 text-xs font-semibold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Agendación Rápida • Sin Registros Obligatorios</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight">
            Reserva tu Cita en{' '}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary-600 via-primary-500 to-indigo-600">
              {nombreMarca}
            </span>
          </h1>

          <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
            {lemaMarca ||
              'Selecciona el servicio que deseas, escoge a tu profesional favorito y asegura tu lugar en tiempo real sin trámites largos.'}
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <a href="#servicios">
              <Button size="lg" className="shadow-lg shadow-primary-600/25 px-8">
                <span>Ver Servicios y Horarios</span>
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </a>
            <a href="#como-funciona">
              <Button variant="outline" size="lg">
                ¿Cómo funciona?
              </Button>
            </a>
          </div>

          {/* Mini badges de confianza */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-6 max-w-xl mx-auto text-left">
            <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>Confirmación al instante</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
              <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>Sin cobros por adelantado</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400 col-span-2 sm:col-span-1">
              <Clock className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>Recordatorios por WhatsApp</span>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 3. SECCIÓN DE RESERVA ACTIVA (WIZARD PÚBLICO) ────────────────── */}
      <section
        id="seccion-reserva"
        className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full"
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
                {serviciosFiltrados.map((serv) => (
                  <div
                    key={serv.id}
                    className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 hover:border-primary-500/60 hover:shadow-lg transition-all flex flex-col justify-between group"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <h3 className="font-bold text-base text-slate-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
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
                        onClick={() => handleSeleccionarServicio(serv)}
                        className="rounded-xl text-xs font-semibold"
                      >
                        <span>Reservar</span>
                        <ChevronRight className="w-3.5 h-3.5 ml-1" />
                      </Button>
                    </div>
                  </div>
                ))}
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
                      setEmpleadoSel(emp)
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
                  setFechaSel(e.target.value)
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

        {/* ── PASO 3: FORMULARIO DE CONTACTO DIRECTO (SIN REGISTER) ── */}
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

              <div className="pt-4 flex items-center justify-between border-t border-slate-100 dark:border-slate-800">
                <Button type="button" variant="outline" onClick={() => setPaso(2)}>
                  Atrás
                </Button>
                <Button
                  type="submit"
                  size="lg"
                  isLoading={guardandoCita}
                  className="px-8 font-bold shadow-md shadow-primary-600/20"
                >
                  <CheckCircle2 className="w-5 h-5 mr-2" />
                  <span>Confirmar y Agendar Cita</span>
                </Button>
              </div>
            </form>
          </div>
        )}

        {/* ── PASO 4: CITA CONFIRMADA / ÉXITO ── */}
        {paso === 4 && citaConfirmada && (
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-emerald-200 dark:border-emerald-900/50 p-8 text-center space-y-6 shadow-xl shadow-emerald-500/5">
            <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-950/70 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div>
              <span className="inline-block px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 text-xs font-bold uppercase tracking-wider mb-2">
                Folio: {folioReserva}
              </span>
              <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white">
                ¡Tu Cita ha sido Agendada!
              </h2>
              <p className="text-slate-600 dark:text-slate-400 text-sm mt-1 max-w-md mx-auto">
                Hemos registrado tu reserva para{' '}
                <strong className="text-slate-900 dark:text-white">{nombreCliente}</strong>.
                Te esperamos con gusto en nuestras instalaciones.
              </p>
            </div>

            {/* Tarjeta de Resumen */}
            <div className="bg-slate-50 dark:bg-slate-800/70 rounded-2xl p-6 max-w-md mx-auto text-left border border-slate-200 dark:border-slate-700 space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-500">Servicio:</span>
                <span className="font-semibold text-slate-900 dark:text-white">
                  {servicioSel?.nombre}
                </span>
              </div>
              {extrasSeleccionados.length > 0 && (
                <div className="text-xs space-y-1.5 py-1 border-t border-slate-200/60 dark:border-slate-700/60">
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

      {/* ─── 4. CÓMO FUNCIONA ─────────────────────────────────────────────── */}
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

      {/* ─── 5. FOOTER CON CANDADO ADMINISTRATIVO DISCRETO ───────────────── */}
      <footer
        id="contacto"
        className="mt-auto bg-slate-900 text-slate-400 border-t border-slate-800 text-xs"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Info Negocio */}
            <div className="space-y-3 col-span-1 md:col-span-2">
              <div className="flex items-center gap-2 text-white font-bold text-base">
                {configuracion.logo_url ? (
                  <img
                    src={configuracion.logo_url}
                    alt={nombreMarca}
                    className="h-8 object-contain"
                  />
                ) : (
                  <CalendarDays className="w-6 h-6 text-primary-400" />
                )}
                <span>{nombreMarca}</span>
              </div>
              <p className="text-slate-400 text-xs max-w-sm leading-relaxed">
                {lemaMarca || 'Tu centro de confianza para reservas rápidas y profesionales.'}
              </p>
              <div className="space-y-1.5 pt-1 text-xs">
                <p className="flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-primary-400" />
                  <span>Atención en sucursal y citas programadas</span>
                </p>
                {configuracion.telefono_soporte && (
                  <p className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-primary-400" />
                    <span>{configuracion.telefono_soporte}</span>
                  </p>
                )}
                {configuracion.email_soporte && (
                  <p className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-primary-400" />
                    <span>{configuracion.email_soporte}</span>
                  </p>
                )}
              </div>
            </div>

            {/* Enlaces de Servicios */}
            <div>
              <h4 className="text-white font-semibold mb-3">Servicios</h4>
              <ul className="space-y-2">
                {servicios.slice(0, 4).map((s) => (
                  <li key={s.id}>
                    <a
                      href="#servicios"
                      onClick={() => handleSeleccionarServicio(s)}
                      className="hover:text-white transition-colors"
                    >
                      {s.nombre}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Horarios de Atención */}
            <div>
              <h4 className="text-white font-semibold mb-3">Horario</h4>
              <p className="leading-relaxed">
                Lunes a Viernes: 09:00 - 19:00 hrs
                <br />
                Sábados: 09:00 - 15:00 hrs
                <br />
                Domingos: Cerrado
              </p>
            </div>
          </div>

          {/* Línea final con Marca Blanca y el CANDADO ESCONDIDO PARA LOGIN */}
          <div className="mt-12 pt-6 border-t border-slate-800 flex items-center justify-between">
            <p className="text-slate-500 text-xs">
              {configuracion.texto_pie_pagina ||
                `© ${new Date().getFullYear()} ${nombreMarca}. Todos los derechos reservados.`}
            </p>

            {/* 🔐 CANDADO DISCRETO DE ACCESO ADMINISTRATIVO */}
            <div className="flex items-center gap-4">
              <Link
                to="/login"
                title="Acceso para el personal / Administración"
                aria-label="Acceso administrativo"
                className="text-slate-600 hover:text-slate-400 dark:hover:text-slate-200 transition-colors p-1.5 rounded-lg hover:bg-slate-800/60"
              >
                <Lock className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
