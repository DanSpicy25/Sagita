import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useConfiguracion } from '@/hooks/useConfiguracion'
import { useAuth } from '@/hooks/useAuth'
import { serviciosService } from '@/services/servicios.service'
import { empleadosService } from '@/services/empleados.service'
import { citasService } from '@/services/citas.service'
import { clientesService } from '@/services/clientes.service'
import { pagosService } from '@/services/pagos.service'
import { inventarioService } from '@/services/inventario.service'
import type {
  Servicio,
  Empleado,
  SlotDisponible,
  CategoriaServicio,
  ServicioExtra,
  Producto,
  Cita,
} from '@/types'
import {
  PortalHeader,
  PortalHero,
  PortalWizardReserva,
  PortalCatalogoProductos,
  PortalHardwareShowcase,
  PortalVerticalesShowcase,
  PortalFloatingIsland,
  PortalFooter,
} from '@/components/portal'
import { PortalModulosShowcase } from '@/components/portal/PortalModulosShowcase'

function formatLocalDate(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export default function PortalReservaPage() {
  const [searchParams] = useSearchParams()
  const isEmbed = searchParams.get('embed') === 'true'
  const initialTab = (searchParams.get('tab') as 'reservas' | 'productos' | 'hardware' | 'verticales' | 'modulos') || 'modulos'

  const { configuracion, nombreMarca, lemaMarca } = useConfiguracion()
  const { isAuthenticated, user } = useAuth()

  const formatearMoneda = (monto: number) =>
    `${configuracion.simbolo_moneda || '$'}${monto.toFixed(2)}`

  // Pestaña principal de la Landing (por defecto muestra todos los módulos del sistema)
  const [tabPrincipal, setTabPrincipal] = useState<'reservas' | 'productos' | 'hardware' | 'verticales' | 'modulos'>(initialTab)
  const [isMobileSimulator, setIsMobileSimulator] = useState(false)

  // Estados de catálogos
  const [cargando, setCargando] = useState(true)
  const [servicios, setServicios] = useState<Servicio[]>([])
  const [categorias, setCategorias] = useState<CategoriaServicio[]>([])
  const [empleados, setEmpleados] = useState<Empleado[]>([])
  const [extrasCatalogo, setExtrasCatalogo] = useState<ServicioExtra[]>([])
  const [productos, setProductos] = useState<Producto[]>([])

  // Estados de disponibilidad de agenda
  const [fechaSel, setFechaSel] = useState<string>('')
  const [empleadoSel, setEmpleadoSel] = useState<Empleado | null>(null)
  const [slots, setSlots] = useState<SlotDisponible[]>([])
  const [cargandoSlots, setCargandoSlots] = useState(false)

  // Cargar catálogos iniciales
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
        const empsActivos = (resEmp.data ?? []).filter((empleado) => empleado.activo)
        setEmpleados(empsActivos)
        if (empsActivos.length > 0) {
          setEmpleadoSel(empsActivos[0])
        }
        setExtrasCatalogo(resExt.data ?? [])
        setProductos(resProd.data ?? [])

        // Fecha inicial: mañana
        const manana = new Date()
        manana.setDate(manana.getDate() + 1)
        setFechaSel(formatLocalDate(manana))
      } catch (err) {
        console.error('Error al cargar datos del portal', err)
      } finally {
        setCargando(false)
      }
    }
    cargarCatalogos()
  }, [])

  // Consultar disponibilidad reactiva al cambiar fecha o profesional
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
      .getDisponibilidad(empleadoSel.id, fechaSel)
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
  }, [fechaSel, empleadoSel])

  // Completar cita
  const handleCompletarReserva = async (datos: {
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
  }): Promise<{ cita: Cita; folio: string }> => {
    // 1. Crear o asociar cliente
    const resCli = await clientesService.create({
      nombre: datos.nombreCliente,
      telefono: datos.telefonoCliente,
      email: datos.emailCliente,
      notas: datos.notasCliente,
    })
    const clienteId = resCli.data?.id ?? Date.now()

    // 2. Calcular duraciones y fecha inicio / fin
    const inicio = new Date(`${datos.fecha}T${datos.hora}:00`)
    const fechaInicio = inicio.toISOString()
    const fechaFin = new Date(inicio.getTime() + datos.duracionTotal * 60000).toISOString()

    // 3. Crear cita
    const nombresExtras = datos.extras.map((e) => e.nombre).join(', ')
    const notaFinal = [
      datos.notasCliente ? `[Reserva Web] ${datos.notasCliente}` : '[Reserva Web]',
      nombresExtras ? `Aditamentos: ${nombresExtras}` : null,
    ]
      .filter(Boolean)
      .join(' | ')

    const resCita = await citasService.create({
      cliente_id: clienteId,
      empleado_id: datos.empleado.id,
      servicio_id: datos.servicio.id,
      fecha_inicio: fechaInicio,
      fecha_fin: fechaFin,
      precio_total: datos.precioTotal,
      estado: 'confirmada',
      modalidad: 'presencial',
      notas: notaFinal,
    })

    const folio = `CIT-${resCita.data?.id ?? Date.now()}`
    const citaGuardada: Cita = resCita.data ?? {
      id: Date.now(),
      cliente_id: clienteId,
      empleado_id: datos.empleado.id,
      servicio_id: datos.servicio.id,
      fecha_inicio: fechaInicio,
      fecha_fin: fechaFin,
      precio_total: datos.precioTotal,
      estado: 'confirmada',
      servicio: datos.servicio,
      empleado: datos.empleado,
      cliente: {
        id: clienteId,
        nombre: datos.nombreCliente,
        email: datos.emailCliente,
        telefono: datos.telefonoCliente,
        total_citas: 1,
        created_at: new Date().toISOString(),
      },
      created_at: new Date().toISOString(),
    }

    return { cita: citaGuardada, folio }
  }

  // Si está en modo embebido (iframe / widget embebible)
  if (isEmbed) {
    return (
      <div className="min-h-screen bg-transparent text-slate-800 dark:text-slate-100 p-2 sm:p-4">
        <PortalWizardReserva
          cargando={cargando}
          servicios={servicios}
          categorias={categorias}
          empleados={empleados}
          extrasCatalogo={extrasCatalogo}
          slots={slots}
          cargandoSlots={cargandoSlots}
          fechaSel={fechaSel}
          onFechaChange={setFechaSel}
          empleadoSel={empleadoSel}
          onEmpleadoChange={setEmpleadoSel}
          configuracion={configuracion}
          formatearMoneda={formatearMoneda}
          onCompletarReserva={handleCompletarReserva}
          isEmbed={true}
        />
      </div>
    )
  }

  // Contenido común de las vistas del portal
  const renderContenidoPortal = () => (
    <>
      {/* 0 & 1. Header de Acceso y Marca */}
      <PortalHeader
        configuracion={configuracion}
        nombreMarca={nombreMarca}
        lemaMarca={lemaMarca}
        isAuthenticated={isAuthenticated}
        user={user}
        tabPrincipal={tabPrincipal}
        onSelectTab={setTabPrincipal}
        totalProductos={productos.length}
        isMobileSimulator={isMobileSimulator}
        onToggleMobileSimulator={() => setIsMobileSimulator(!isMobileSimulator)}
      />

      {/* 2. Hero Multi-Comercio */}
      <PortalHero
        tabPrincipal={tabPrincipal}
        onSelectTab={setTabPrincipal}
      />

      {/* 3. Vistas Principales según Tab */}
      {tabPrincipal === 'modulos' && (
        <PortalModulosShowcase />
      )}

      {tabPrincipal === 'reservas' && (
        <PortalWizardReserva
          cargando={cargando}
          servicios={servicios}
          categorias={categorias}
          empleados={empleados}
          extrasCatalogo={extrasCatalogo}
          slots={slots}
          cargandoSlots={cargandoSlots}
          fechaSel={fechaSel}
          onFechaChange={setFechaSel}
          empleadoSel={empleadoSel}
          onEmpleadoChange={setEmpleadoSel}
          configuracion={configuracion}
          formatearMoneda={formatearMoneda}
          onCompletarReserva={handleCompletarReserva}
          isEmbed={false}
        />
      )}

      {tabPrincipal === 'productos' && (
        <PortalCatalogoProductos
          productos={productos}
          formatearMoneda={formatearMoneda}
        />
      )}

      {tabPrincipal === 'hardware' && (
        <PortalHardwareShowcase />
      )}

      {tabPrincipal === 'verticales' && (
        <PortalVerticalesShowcase
          onIrAReservas={() => setTabPrincipal('reservas')}
        />
      )}

      {/* 4. Footer */}
      <PortalFooter
        configuracion={configuracion}
        nombreMarca={nombreMarca}
        lemaMarca={lemaMarca}
        servicios={servicios}
        isAuthenticated={isAuthenticated}
        onSeleccionarServicio={() => setTabPrincipal('reservas')}
        onIrAReservas={() => setTabPrincipal('reservas')}
      />
    </>
  )

  // Modo Simulador de Smartphone para presentaciones en Pantallas Grandes / Laptops
  if (isMobileSimulator) {
    return (
      <div className="min-h-screen bg-neutral-950 flex flex-col items-center justify-center p-2 sm:p-6 text-white font-sans selection:bg-neutral-800">
        {/* Barra superior de control del simulador */}
        <div className="w-full max-w-[430px] flex items-center justify-between py-2 px-4 mb-3 text-xs text-neutral-400 bg-neutral-900/90 rounded-full border border-neutral-800 shadow-lg">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-semibold text-neutral-200">Vista Smartphone (Presentación)</span>
          </div>
          <button
            type="button"
            onClick={() => setIsMobileSimulator(false)}
            className="text-amber-400 hover:text-amber-300 font-bold transition-colors"
          >
            Pantalla Completa ✕
          </button>
        </div>

        {/* Marco de Smartphone iPhone 16 Pro con Dynamic Island */}
        <div className="relative w-full max-w-[420px] h-[860px] max-h-[88vh] bg-[#F6F7F9] dark:bg-[#0A0A0C] text-neutral-900 dark:text-neutral-100 rounded-[48px] border-[10px] border-neutral-800 shadow-[0_30px_90px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col">
          {/* Dynamic Island Notch */}
          <div className="absolute top-2.5 left-1/2 -translate-x-1/2 z-50 w-28 h-6 bg-black rounded-full flex items-center justify-between px-3.5 shadow-md pointer-events-none">
            <div className="w-2 h-2 rounded-full bg-neutral-950" />
            <div className="w-2.5 h-2.5 rounded-full bg-blue-950/80 border border-blue-600/40" />
          </div>

          {/* Contenido con scroll interno */}
          <div className="flex-1 overflow-y-auto scrollbar-none pb-28 pt-2">
            {renderContenidoPortal()}
          </div>

          {/* Isla Flotante fija en la base del mockup */}
          <PortalFloatingIsland
            tabPrincipal={tabPrincipal}
            onSelectTab={setTabPrincipal}
            totalProductos={productos.length}
            isMobileSimulator={isMobileSimulator}
            onToggleMobileSimulator={() => setIsMobileSimulator(false)}
          />
        </div>
      </div>
    )
  }

  // Modo nativo completo (Adaptado 100% para Teléfono Móvil, Tablet y Desktop)
  return (
    <div className="min-h-screen flex flex-col bg-[#F6F7F9] dark:bg-[#0A0A0C] text-neutral-900 dark:text-neutral-100 selection:bg-neutral-900 selection:text-white font-sans overflow-x-hidden safe-pb pb-24 sm:pb-28">
      {renderContenidoPortal()}

      {/* 5. Isla Flotante Dinámica (Dynamic Floating Dock) */}
      <PortalFloatingIsland
        tabPrincipal={tabPrincipal}
        onSelectTab={setTabPrincipal}
        totalProductos={productos.length}
        isMobileSimulator={isMobileSimulator}
        onToggleMobileSimulator={() => setIsMobileSimulator(!isMobileSimulator)}
      />
    </div>
  )
}
