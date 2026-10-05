import { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import {
  Clock,
  User,
  Phone,
  Mail,
  MapPin,
  CheckCircle2,
  Lock,
  ChevronRight,
  Sparkles,
  Calendar,
  MessageSquare,
  AlertCircle,
  FileDown,
  Printer,
  ShoppingCart,
  Package,
  LayoutDashboard,
  Store,
  Barcode,
  Search,
  Laptop,
  Check,
  Building2,
  Receipt,
} from 'lucide-react'
import { useConfiguracion } from '@/hooks/useConfiguracion'
import { useAuth } from '@/hooks/useAuth'
import { TenantSelector } from '@/components/crm/TenantSelector'
import { Button, Input, Badge, Loader } from '@/components/ui'
import { useToast } from '@/hooks/useToast'
import { serviciosService } from '@/services/servicios.service'
import { empleadosService } from '@/services/empleados.service'
import { citasService } from '@/services/citas.service'
import { clientesService } from '@/services/clientes.service'
import { pagosService } from '@/services/pagos.service'
import { inventarioService } from '@/services/inventario.service'
import { Servicio, Empleado, SlotDisponible, Cita, CategoriaServicio, ServicioExtra, Producto } from '@/types'
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
  const { isAuthenticated, user } = useAuth()
  const { toast } = useToast()

  const formatearMoneda = (monto: number) =>
    `${configuracion.simbolo_moneda || '$'}${monto.toFixed(2)}`

  // Pestaña principal de la Landing
  const [tabPrincipal, setTabPrincipal] = useState<'reservas' | 'productos' | 'hardware' | 'verticales'>('reservas')

  // Estados de carga y catálogos
  const [cargando, setCargando] = useState(true)
  const [servicios, setServicios] = useState<Servicio[]>([])
  const [categorias, setCategorias] = useState<CategoriaServicio[]>([])
  const [empleados, setEmpleados] = useState<Empleado[]>([])
  const [extrasCatalogo, setExtrasCatalogo] = useState<ServicioExtra[]>([])
  const [extrasSeleccionados, setExtrasSeleccionados] = useState<ServicioExtra[]>([])
  const [categoriaFiltro, setCategoriaFiltro] = useState<number | 'todas'>('todas')

  // Catálogo de productos (#PRD)
  const [productos, setProductos] = useState<Producto[]>([])
  const [busquedaProducto, setBusquedaProducto] = useState('')

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
        const [resServ, resCat, resEmp, resExt, resProd] = await Promise.all([
          serviciosService.getAll(),
          serviciosService.getCategorias(),
          empleadosService.getAll(),
          pagosService.getServiciosExtra(),
          inventarioService.getProductos().catch(() => ({ data: [] })),
        ])
        setServicios((resServ.data ?? []).filter((servicio) => servicio.activo))
        setCategorias(resCat.data ?? [])
        setEmpleados((resEmp.data ?? []).filter((empleado) => empleado.activo))
        setExtrasCatalogo(resExt.data ?? [])
        setProductos(resProd.data ?? [])

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
      {/* ─── 0. BARRA SUPERIOR DE ACCESO EMPRESARIAL / SOCIOS ────────────────── */}
      <div className="bg-slate-900 text-slate-300 text-xs border-b border-slate-800 py-2 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span className="flex items-center gap-1.5 font-bold tracking-wider uppercase text-amber-400 bg-amber-950/60 border border-amber-800/60 px-2 py-0.5 rounded text-[11px]">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              Sagitta Enterprise POS
            </span>
            <span className="hidden lg:inline text-slate-400 text-xs">
              Multi-Comercio: Estéticas • Comida Rápida • Retail & Minimarkets • Clínicas
            </span>
          </div>

          <div className="flex items-center gap-2.5 overflow-x-auto scrollbar-none">
            <Link
              to="/ventas"
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-950/70 border border-emerald-800/70 hover:bg-emerald-900/60 text-emerald-300 font-semibold transition-colors"
            >
              <ShoppingCart className="w-3.5 h-3.5" />
              <span>Abrir POS</span>
            </Link>

            <Link
              to="/inventario"
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-800 border border-slate-700 hover:bg-slate-700 text-slate-200 font-medium transition-colors"
            >
              <Package className="w-3.5 h-3.5 text-blue-400" />
              <span>Inventario (#PRD)</span>
            </Link>

            <Link
              to="/hardware"
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-800 border border-slate-700 hover:bg-slate-700 text-slate-200 font-medium transition-colors"
            >
              <Printer className="w-3.5 h-3.5 text-indigo-400" />
              <span>Hardware & Bluetooth</span>
            </Link>

            {isAuthenticated ? (
              <Link
                to="/dashboard"
                className="flex items-center gap-1.5 px-3 py-1 rounded-md bg-primary-600 hover:bg-primary-500 text-white font-semibold transition-colors shadow-sm"
              >
                <LayoutDashboard className="w-3.5 h-3.5" />
                <span>Panel Admin ({user?.nombre ?? 'Staff'})</span>
              </Link>
            ) : (
              <Link
                to="/login"
                className="flex items-center gap-1.5 px-3 py-1 rounded-md bg-primary-600 hover:bg-primary-500 text-white font-semibold transition-colors shadow-sm"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Acceso Staff / Login</span>
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* ─── 1. NAVBAR COMERCIAL ────────────────────────────────────────────── */}
      <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 shadow-sm">
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
                <Store className="w-5 h-5" />
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

          {/* Menú central por vistas */}
          <nav className="hidden md:flex items-center gap-2 text-sm font-medium">
            <button
              type="button"
              onClick={() => setTabPrincipal('reservas')}
              className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
                tabPrincipal === 'reservas'
                  ? 'bg-primary-50 dark:bg-primary-950/70 text-primary-600 dark:text-primary-400 font-semibold'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Calendar className="w-4 h-4 text-primary-500" />
              Citas & Agenda
            </button>
            <button
              type="button"
              onClick={() => setTabPrincipal('productos')}
              className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
                tabPrincipal === 'productos'
                  ? 'bg-primary-50 dark:bg-primary-950/70 text-primary-600 dark:text-primary-400 font-semibold'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Package className="w-4 h-4 text-blue-500" />
              Catálogo #PRD ({productos.length})
            </button>
            <button
              type="button"
              onClick={() => setTabPrincipal('hardware')}
              className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
                tabPrincipal === 'hardware'
                  ? 'bg-primary-50 dark:bg-primary-950/70 text-primary-600 dark:text-primary-400 font-semibold'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Printer className="w-4 h-4 text-indigo-500" />
              Hardware POS
            </button>
            <button
              type="button"
              onClick={() => setTabPrincipal('verticales')}
              className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
                tabPrincipal === 'verticales'
                  ? 'bg-primary-50 dark:bg-primary-950/70 text-primary-600 dark:text-primary-400 font-semibold'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Store className="w-4 h-4 text-emerald-500" />
              Negocios
            </button>
          </nav>

          {/* Acciones derechas */}
          <div className="flex items-center gap-2 sm:gap-3">
            <TenantSelector />

            <Link to="/ventas">
              <Button size="sm" className="hidden sm:inline-flex items-center gap-1.5 shadow-sm bg-emerald-600 hover:bg-emerald-700 text-white">
                <ShoppingCart className="w-3.5 h-3.5" />
                <span>Abrir POS</span>
              </Button>
            </Link>

            {isAuthenticated ? (
              <Link to="/dashboard">
                <Button size="sm" variant="outline" className="items-center gap-1.5">
                  <LayoutDashboard className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Panel</span>
                </Button>
              </Link>
            ) : (
              <Link to="/login">
                <Button size="sm" variant="outline" className="items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Staff</span>
                </Button>
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* ─── 2. HERO PRINCIPAL MULTI-COMERCIO ─────────────────────────────── */}
      <section className="relative overflow-hidden bg-gradient-to-b from-primary-50/50 via-white to-slate-50 dark:from-slate-900 dark:via-slate-950 dark:to-slate-950 py-12 sm:py-20 border-b border-slate-100 dark:border-slate-800">
        <div className="absolute inset-0 bg-[radial-gradient(#6366f1_1px,transparent_1px)] [background-size:24px_24px] opacity-15 pointer-events-none" />

        <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center relative z-10 space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 dark:bg-slate-800 text-slate-200 border border-slate-700 text-xs font-semibold uppercase tracking-wider shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Plataforma Comercial • PWA Táctil para Tablets & PC</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
            Punto de Venta, Gestión & Reservas para{' '}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary-600 via-indigo-600 to-emerald-600">
              Cualquier Negocio
            </span>
          </h1>

          <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-3xl mx-auto leading-relaxed">
            Desde <strong>puestos de comida rápida</strong> y <strong>minimarkets</strong> hasta <strong>salones de belleza</strong> y <strong>consultorios</strong>. Soporte para impresión térmica Bluetooth (ESC/POS 58mm/80mm), apertura de cajón, lectores de código de barras y códigos de producto <span className="font-mono font-bold text-primary-600 dark:text-primary-400">#PRD-XXXX</span>.
          </p>

          {/* Conmutador de modo / pestañas de la landing */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
            <button
              type="button"
              onClick={() => setTabPrincipal('reservas')}
              className={`px-4 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 transition-all shadow-sm ${
                tabPrincipal === 'reservas'
                  ? 'bg-primary-600 text-white ring-2 ring-primary-500/50'
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:border-primary-400'
              }`}
            >
              <Calendar className="w-4 h-4" />
              <span>Agendar Cita Online</span>
            </button>

            <button
              type="button"
              onClick={() => setTabPrincipal('productos')}
              className={`px-4 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 transition-all shadow-sm ${
                tabPrincipal === 'productos'
                  ? 'bg-blue-600 text-white ring-2 ring-blue-500/50'
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:border-blue-400'
              }`}
            >
              <Package className="w-4 h-4" />
              <span>Catálogo de Productos (#PRD)</span>
            </button>

            <button
              type="button"
              onClick={() => setTabPrincipal('hardware')}
              className={`px-4 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 transition-all shadow-sm ${
                tabPrincipal === 'hardware'
                  ? 'bg-indigo-600 text-white ring-2 ring-indigo-500/50'
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:border-indigo-400'
              }`}
            >
              <Printer className="w-4 h-4" />
              <span>Terminal & Hardware POS</span>
            </button>

            <button
              type="button"
              onClick={() => setTabPrincipal('verticales')}
              className={`px-4 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 transition-all shadow-sm ${
                tabPrincipal === 'verticales'
                  ? 'bg-emerald-600 text-white ring-2 ring-emerald-500/50'
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:border-emerald-400'
              }`}
            >
              <Store className="w-4 h-4" />
              <span>Soluciones por Negocio</span>
            </button>
          </div>

          {/* Mini badges de confianza comercial */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 max-w-3xl mx-auto text-left">
            <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400 bg-white/70 dark:bg-slate-900/60 p-2.5 rounded-lg border border-slate-200/60 dark:border-slate-800/60">
              <Printer className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>Impresión Bluetooth ESC/POS</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400 bg-white/70 dark:bg-slate-900/60 p-2.5 rounded-lg border border-slate-200/60 dark:border-slate-800/60">
              <Barcode className="w-4 h-4 text-indigo-500 shrink-0" />
              <span>Escáner HID y Códigos #PRD</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400 bg-white/70 dark:bg-slate-900/60 p-2.5 rounded-lg border border-slate-200/60 dark:border-slate-800/60">
              <Laptop className="w-4 h-4 text-blue-500 shrink-0" />
              <span>PWA Táctil para Tablets</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400 bg-white/70 dark:bg-slate-900/60 p-2.5 rounded-lg border border-slate-200/60 dark:border-slate-800/60">
              <Building2 className="w-4 h-4 text-amber-500 shrink-0" />
              <span>Multi-Sucursal & Marca Blanca</span>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 3. SECCIÓN DE RESERVA ACTIVA (WIZARD PÚBLICO) ────────────────── */}
      {tabPrincipal === 'reservas' && (
        <>
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
    </>
  )}

      {/* ─── VISTA: CATÁLOGO DE PRODUCTOS (#PRD) ────────────────────────── */}
      {tabPrincipal === 'productos' && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full space-y-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
            <div>
              <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950/70 text-blue-700 dark:text-blue-300 text-xs font-semibold uppercase tracking-wider mb-2">
                <Package className="w-3.5 h-3.5" />
                <span>Inventario Sagitta Enterprise</span>
              </div>
              <h2 className="text-3xl font-black text-slate-900 dark:text-white">
                Catálogo de Productos & Stock
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                Visualización con identificadores oficiales <code className="font-mono font-bold text-primary-600 dark:text-primary-400">#PRD-XXXX</code>, trazabilidad SKU y disponibilidad en tiempo real.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Link to="/ventas">
                <Button className="bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-2 shadow-md">
                  <ShoppingCart className="w-4 h-4" />
                  <span>Cobrar en Punto de Venta (POS)</span>
                </Button>
              </Link>
            </div>
          </div>

          {/* Barra de búsqueda y conteo */}
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="relative w-full sm:w-96">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={busquedaProducto}
                onChange={(e) => setBusquedaProducto(e.target.value)}
                placeholder="Buscar por #PRD, nombre, categoría o código..."
                className="w-full pl-10 pr-4 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400">
              Mostrando <strong className="text-slate-800 dark:text-slate-200">{productos.filter((p) => !busquedaProducto || p.nombre.toLowerCase().includes(busquedaProducto.toLowerCase()) || p.categoria.toLowerCase().includes(busquedaProducto.toLowerCase()) || `prd-${p.id}`.includes(busquedaProducto.toLowerCase())).length}</strong> de {productos.length} productos
            </div>
          </div>

          {/* Grid de Productos */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {productos
              .filter((p) => {
                if (!busquedaProducto) return true
                const query = busquedaProducto.toLowerCase()
                return (
                  p.nombre.toLowerCase().includes(query) ||
                  p.categoria.toLowerCase().includes(query) ||
                  (p.codigo_barras && p.codigo_barras.toLowerCase().includes(query)) ||
                  `#prd-${String(p.id).padStart(4, '0')}`.toLowerCase().includes(query) ||
                  `prd-${p.id}`.toLowerCase().includes(query)
                )
              })
              .map((prod) => {
                const stockAlto = prod.stock_actual > (prod.stock_minimo || 5)
                const stockBajo = prod.stock_actual > 0 && !stockAlto
                const agotado = prod.stock_actual <= 0

                return (
                  <div
                    key={prod.id}
                    className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700">
                          #PRD-{String(prod.id).padStart(4, '0')}
                        </span>
                        <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/60 px-2 py-0.5 rounded">
                          {prod.categoria}
                        </span>
                      </div>

                      <h3 className="font-bold text-slate-900 dark:text-white text-base group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors line-clamp-1">
                        {prod.nombre}
                      </h3>

                      {prod.descripcion && (
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                          {prod.descripcion}
                        </p>
                      )}

                      <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs text-slate-500">
                        <span>SKU: <strong className="font-mono text-slate-700 dark:text-slate-300">{prod.sku}</strong></span>
                        {prod.codigo_barras && (
                          <span className="flex items-center gap-1 font-mono text-[11px]">
                            <Barcode className="w-3 h-3 text-slate-400" />
                            {prod.codigo_barras}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                      <div>
                        <div className="text-lg font-black text-slate-900 dark:text-white">
                          {formatearMoneda(prod.precio_venta)}
                        </div>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span
                            className={`w-2 h-2 rounded-full ${
                              stockAlto
                                ? 'bg-emerald-500'
                                : stockBajo
                                ? 'bg-amber-500'
                                : 'bg-red-500'
                            }`}
                          />
                          <span className="text-[11px] font-medium text-slate-500">
                            {agotado
                              ? 'Agotado'
                              : `${prod.stock_actual} ${prod.unidad || 'uds'} disp.`}
                          </span>
                        </div>
                      </div>

                      <Link to="/ventas">
                        <Button size="sm" variant="outline" className="text-xs flex items-center gap-1 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-300">
                          <ShoppingCart className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Vender</span>
                        </Button>
                      </Link>
                    </div>
                  </div>
                )
              })}
          </div>
        </section>
      )}

      {/* ─── VISTA: HARDWARE, IMPRESORAS Y BLUETOOTH ───────────────────────── */}
      {tabPrincipal === 'hardware' && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full space-y-10">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-100 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300 text-xs font-semibold uppercase tracking-wider">
              <Printer className="w-3.5 h-3.5" />
              <span>Conectividad Periférica Industrial</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white">
              Hardware & Punto de Venta Integrado
            </h2>
            <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base leading-relaxed">
              Sagitta fue programado para tablets y computadoras táctiles, eliminando la necesidad de costosos controladores propietarios. Imprime por Bluetooth o USB y opera cajones monedero directamente desde la web.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <div className="w-12 h-12 rounded-xl bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                <Printer className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-lg text-slate-900 dark:text-white">
                Impresión ESC/POS 58mm & 80mm
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Tickets térmicos personalizables con logo de la marca, encabezados, desglose de ítems con ID #PRD y pie de recibo. Soporte nativo para 32 y 48 columnas.
              </p>
              <div className="pt-2 text-xs font-mono text-indigo-600 dark:text-indigo-400">
                Web Bluetooth & USB Direct
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <Receipt className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-lg text-slate-900 dark:text-white">
                Apertura de Cajón Monedero
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Disparo de pulso estándar por puerto RJ11 (Pin 2 / Pin 5) con comandos de escape binarios que abren la gaveta de dinero automáticamente al registrar un cobro en efectivo.
              </p>
              <div className="pt-2 text-xs font-mono text-emerald-600 dark:text-emerald-400">
                Pulso ESC p 0 25 250
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                <Barcode className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-lg text-slate-900 dark:text-white">
                Lectores de Barras HID & EAN-13
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Reconocimiento de lectores láser USB y pistolas Bluetooth en modo emulación de teclado con debounce ultrarrápido (&lt;50ms) y carga automática al carrito POS.
              </p>
              <div className="pt-2 text-xs font-mono text-blue-600 dark:text-blue-400">
                EAN-13 • UPC • CODE128
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <div className="w-12 h-12 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                <Laptop className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-lg text-slate-900 dark:text-white">
                PWA Táctil para Tablets & Offline
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Diseño optimizado para tablets Android de 10 pulgadas y iPads. Botones táctiles generosos, teclado numérico incorporado y persistencia en LocalStorage ante cortes de energía.
              </p>
              <div className="pt-2 text-xs font-mono text-amber-600 dark:text-amber-400">
                100% Responsive & PWA Ready
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-8 sm:p-12 text-center space-y-6 shadow-xl border border-indigo-900/40">
            <h3 className="text-2xl sm:text-3xl font-black">
              ¿Quieres probar tu impresora térmica o lector ahora mismo?
            </h3>
            <p className="text-slate-300 text-sm max-w-2xl mx-auto leading-relaxed">
              Accede a nuestro laboratorio interactivo de hardware donde puedes enlazar dispositivos por Bluetooth, imprimir tickets de prueba formateados y verificar el disparo de gaveta.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link to="/hardware">
                <Button size="lg" className="bg-indigo-600 hover:bg-indigo-500 text-white px-8 shadow-lg shadow-indigo-600/30">
                  <Printer className="w-4 h-4 mr-2" />
                  <span>Abrir Laboratorio de Hardware</span>
                </Button>
              </Link>
              <Link to="/ventas">
                <Button size="lg" variant="outline" className="border-slate-700 text-slate-200 hover:bg-slate-800">
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  <span>Probar en Punto de Venta (POS)</span>
                </Button>
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ─── VISTA: SOLUCIONES POR VERTICAL DE NEGOCIO ─────────────────────── */}
      {tabPrincipal === 'verticales' && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full space-y-12">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 text-xs font-semibold uppercase tracking-wider">
              <Store className="w-3.5 h-3.5" />
              <span>Adaptable a Todo Comercio</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white">
              Una Sola Plataforma, Infinitos Modelos de Negocio
            </h2>
            <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base leading-relaxed">
              Configura Sagitta en segundos según el rubro de cada cliente. Desde la rapidez de una hamburguesería hasta la elegancia de una clínica o spa.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* 1. Comida Rápida */}
            <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold text-xl">
                  🍔
                </div>
                <h3 className="text-2xl font-black text-slate-900 dark:text-white">
                  Puestos de Comida Rápida & Food Trucks
                </h3>
                <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                  Operación ultrarrápida para despachar pedidos sin fricción. Pensado para ambientes con alta rotación y conexiones inestables.
                </p>
                <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-500" />
                    <span>Tickets de comanda térmica automáticos para cocina</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-500" />
                    <span>Cálculo automático de vuelto en efectivo y múltiples divisas</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-500" />
                    <span>Conexión directa por Bluetooth a impresoras portátiles 58mm</span>
                  </li>
                </ul>
              </div>

              <Link to="/ventas">
                <Button className="w-full bg-amber-600 hover:bg-amber-700 text-white flex items-center justify-center gap-2">
                  <ShoppingCart className="w-4 h-4" />
                  <span>Probar Flujo de Venta Rápida</span>
                </Button>
              </Link>
            </div>

            {/* 2. Salones de Belleza */}
            <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-pink-100 dark:bg-pink-950/60 text-pink-600 dark:text-pink-400 flex items-center justify-center font-bold text-xl">
                  ✂️
                </div>
                <h3 className="text-2xl font-black text-slate-900 dark:text-white">
                  Salones de Belleza, Barberías & Spas
                </h3>
                <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                  Agendamiento inteligente para estilistas, control de turnos, venta de productos de cuidado y fidelización de clientes.
                </p>
                <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-500" />
                    <span>Portal web de reservas sin registro obligatorio</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-500" />
                    <span>Recordatorios instantáneos por WhatsApp y Google Calendar</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-500" />
                    <span>Comisiones por profesional y servicios extras combinables</span>
                  </li>
                </ul>
              </div>

              <button
                type="button"
                onClick={() => setTabPrincipal('reservas')}
                className="w-full py-2.5 px-4 rounded-xl bg-pink-600 hover:bg-pink-700 text-white text-sm font-bold flex items-center justify-center gap-2 transition-colors shadow-sm"
              >
                <Calendar className="w-4 h-4" />
                <span>Ver Wizard de Citas en Vivo</span>
              </button>
            </div>

            {/* 3. Minimarkets y Retail */}
            <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-xl">
                  🏪
                </div>
                <h3 className="text-2xl font-black text-slate-900 dark:text-white">
                  Minimarkets, Bodegas & Tiendas Retail
                </h3>
                <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                  Control milimétrico del stock, escaneo de códigos de barra y cierre de caja diario con alertas de reposición.
                </p>
                <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-500" />
                    <span>Identificadores de inventario #PRD-XXXX y códigos SKU/EAN</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-500" />
                    <span>Caja registradora con apertura de gaveta monedero</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-500" />
                    <span>Historial de movimientos: compras, ventas, mermas y ajustes</span>
                  </li>
                </ul>
              </div>

              <Link to="/inventario">
                <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center gap-2">
                  <Package className="w-4 h-4" />
                  <span>Explorar Módulo de Inventario</span>
                </Button>
              </Link>
            </div>

            {/* 4. Clínicas y Consultorios */}
            <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-xl">
                  🏥
                </div>
                <h3 className="text-2xl font-black text-slate-900 dark:text-white">
                  Clínicas, Consultorios & Servicios
                </h3>
                <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                  Gestión integral de citas médicas o profesionales con historial clínico/cliente y emisión de comprobantes.
                </p>
                <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-500" />
                    <span>Control de salas, boxes y equipamiento médico asignable</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-500" />
                    <span>Ficha y perfil de cliente con notas y citas anteriores</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-500" />
                    <span>Descarga de comprobantes en PDF con firma y datos de marca</span>
                  </li>
                </ul>
              </div>

              <Link to="/citas">
                <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>Ver Panel de Agenda Médica</span>
                </Button>
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ─── 5. FOOTER EMPRESARIAL MULTI-COLUMNA ──────────────────────────── */}
      <footer
        id="contacto"
        className="mt-auto bg-slate-950 text-slate-400 border-t border-slate-800 text-xs"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8">
            {/* Columna 1: Info Negocio */}
            <div className="space-y-4 col-span-1 sm:col-span-2">
              <div className="flex items-center gap-2.5 text-white font-bold text-base">
                {configuracion.logo_url ? (
                  <img
                    src={configuracion.logo_url}
                    alt={nombreMarca}
                    className="h-8 object-contain"
                  />
                ) : (
                  <Store className="w-5 h-5 text-primary-400" />
                )}
                <span>{nombreMarca}</span>
              </div>
              <p className="text-slate-400 text-xs max-w-sm leading-relaxed">
                {lemaMarca || 'Plataforma integral de Punto de Venta (POS), control de stock profesional y agendamiento en tiempo real.'}
              </p>
              <div className="space-y-2 pt-1 text-xs">
                <p className="flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-primary-400 shrink-0" />
                  <span>Atención presencial en sucursales y operaciones web</span>
                </p>
                {configuracion.telefono_soporte && (
                  <p className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-primary-400 shrink-0" />
                    <span>{configuracion.telefono_soporte}</span>
                  </p>
                )}
                {configuracion.email_soporte && (
                  <p className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-primary-400 shrink-0" />
                    <span>{configuracion.email_soporte}</span>
                  </p>
                )}
              </div>
            </div>

            {/* Columna 2: Servicios & Reservas */}
            <div className="space-y-3">
              <h4 className="text-white font-bold text-sm">Servicios</h4>
              <ul className="space-y-2">
                {servicios.slice(0, 4).map((s) => (
                  <li key={s.id}>
                    <button
                      type="button"
                      onClick={() => {
                        setTabPrincipal('reservas')
                        handleSeleccionarServicio(s)
                      }}
                      className="hover:text-white transition-colors text-left"
                    >
                      {s.nombre}
                    </button>
                  </li>
                ))}
                <li>
                  <button
                    type="button"
                    onClick={() => setTabPrincipal('reservas')}
                    className="text-primary-400 hover:text-primary-300 transition-colors font-medium"
                  >
                    Ver todos los servicios →
                  </button>
                </li>
              </ul>
            </div>

            {/* Columna 3: Terminal & POS */}
            <div className="space-y-3">
              <h4 className="text-white font-bold text-sm">Punto de Venta</h4>
              <ul className="space-y-2">
                <li>
                  <Link to="/ventas" className="hover:text-emerald-400 transition-colors flex items-center gap-1.5">
                    <ShoppingCart className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Punto de Venta (POS)</span>
                  </Link>
                </li>
                <li>
                  <Link to="/inventario" className="hover:text-blue-400 transition-colors flex items-center gap-1.5">
                    <Package className="w-3.5 h-3.5 text-blue-400" />
                    <span>Inventario (#PRD)</span>
                  </Link>
                </li>
                <li>
                  <Link to="/hardware" className="hover:text-indigo-400 transition-colors flex items-center gap-1.5">
                    <Printer className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Hardware ESC/POS</span>
                  </Link>
                </li>
                <li>
                  <Link to="/recepcion" className="hover:text-white transition-colors">
                    Mostrador & Recepción
                  </Link>
                </li>
              </ul>
            </div>

            {/* Columna 4: Administración */}
            <div className="space-y-3">
              <h4 className="text-white font-bold text-sm">Gestión & Admin</h4>
              <ul className="space-y-2">
                <li>
                  {isAuthenticated ? (
                    <Link to="/dashboard" className="hover:text-white transition-colors flex items-center gap-1.5 font-semibold text-primary-400">
                      <LayoutDashboard className="w-3.5 h-3.5" />
                      <span>Panel de Control</span>
                    </Link>
                  ) : (
                    <Link to="/login" className="hover:text-white transition-colors flex items-center gap-1.5 font-semibold text-primary-400">
                      <Lock className="w-3.5 h-3.5" />
                      <span>Acceso Staff / Login</span>
                    </Link>
                  )}
                </li>
                <li>
                  <Link to="/citas" className="hover:text-white transition-colors">
                    Agenda & Citas
                  </Link>
                </li>
                <li>
                  <Link to="/configuracion" className="hover:text-white transition-colors">
                    Configuración de Marca
                  </Link>
                </li>
                <li>
                  <Link to="/reportes" className="hover:text-white transition-colors">
                    Reportes y Ventas
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* Línea inferior con Copyright */}
          <div className="mt-12 pt-6 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-slate-500 text-xs text-center sm:text-left">
              {configuracion.texto_pie_pagina ||
                `© ${new Date().getFullYear()} ${nombreMarca}. Todos los derechos reservados.`}
            </p>

            <div className="flex items-center gap-4 text-xs text-slate-500">
              <span className="flex items-center gap-1 text-emerald-500">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Sistema En Línea
              </span>
              <span className="text-slate-700">•</span>
              <Link to="/login" className="hover:text-slate-300 transition-colors">
                Ingreso Personal
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
