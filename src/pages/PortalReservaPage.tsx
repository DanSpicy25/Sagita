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
import { useSector } from '@/context/SectorContext'
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
  PortalProductSimulator,
  PortalCapabilitiesGrid,
  PortalWizardReserva,
  PortalCatalogoProductos,
  PortalHardwareShowcase,
  PortalVerticalesShowcase,
  PortalModulosShowcase,
  PortalPersonalizacionShowcase,
  PortalRolesShowcase,
  PortalDemoSection,
  PortalCtaBanner,
  PortalFooter,
} from '@/components/portal'

function formatLocalDate(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export default function PortalReservaPage() {
  const [searchParams] = useSearchParams()
  const isEmbed = searchParams.get('embed') === 'true'
  const initialTab = (searchParams.get('tab') as 'reservas' | 'productos' | 'hardware' | 'verticales' | 'modulos') || 'reservas'

  const { configuracion, nombreMarca, lemaMarca } = useConfiguracion()
  const { isAuthenticated, user } = useAuth()
  const { sector, tokens, vocabulario, mockItems } = useSector()

  const formatearMoneda = (monto: number) =>
    `${configuracion.simbolo_moneda || '$'}${monto.toFixed(2)}`

  // Pestaña principal de la Landing (por defecto muestra agenda y reservas online)
  const [tabPrincipal, setTabPrincipal] = useState<'reservas' | 'productos' | 'hardware' | 'verticales' | 'modulos'>(initialTab)

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

  // Modo portal completo adaptativo al Sistema Operativo (Pantalla Completa Nativa)
  return (
    <div className="portal-page h-dvh min-h-screen flex flex-col bg-[#f7f5f0] text-zinc-900 selection:bg-[#806331] selection:text-white font-sans overflow-x-hidden overflow-y-auto overscroll-y-contain dark:bg-[#111210] dark:text-zinc-100">
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
      />

      {/* 2. Hero Multi-Comercio */}
      <PortalHero
        simboloMoneda={configuracion.simbolo_moneda || '$'}
        onSelectTab={(tab) => {
          setTabPrincipal(tab)
          if (tab === 'reservas') {
            const el = document.getElementById('reserva')
            if (el) el.scrollIntoView({ behavior: 'smooth' })
          }
        }}
      />

      {/* 3. Vistas Principales según Tab */}
      {tabPrincipal === 'reservas' && (
        <>
          {/* 3. Simulador Interactivo de Interfaz */}
          <div id="simulador">
            <PortalProductSimulator />
          </div>

          {/* 4. Capacidades Principales (Grid de 6 pilares) */}
          <PortalCapabilitiesGrid />

          {/* 5. Adaptación por Vertical de Negocio */}
          <PortalVerticalesShowcase
            onIrAReservas={() => {
              const el = document.getElementById('reserva')
              if (el) el.scrollIntoView({ behavior: 'smooth' })
            }}
          />

          {/* 6. Catálogo de los 18 Módulos */}
          <div id="modulos">
            <PortalModulosShowcase />
          </div>

          {/* 7. Sales Demo Center Showcase */}
          <PortalDemoSection />

          {/* 8. Personalización & Marca Blanca */}
          <PortalPersonalizacionShowcase />

          {/* 9. Seguridad & Permisos por Rol */}
          <PortalRolesShowcase />

          {/* 10. Hardware & Terminal POS */}
          <div id="hardware">
            <PortalHardwareShowcase />
          </div>

          {/* 11. Motor de Agendamiento en Vivo (Preservación de Funcionalidad Real) */}
          <section id="reserva" className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16 border-t border-zinc-200/80 dark:border-zinc-800 scroll-mt-16">
            <div className="text-center max-w-3xl mx-auto space-y-4 mb-8 sm:mb-10">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-soft text-primary text-xs font-semibold uppercase tracking-wider border border-primary/20">
                <span>{sector === 'spa' ? 'Agenda en tiempo real' : `Catálogo de ${tokens.nombre}`}</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">
                {sector === 'spa'
                  ? 'Reserva tu próxima visita'
                  : `Descubre lo que ofrece ${tokens.nombre}`}
              </h2>
              <p className="text-text-muted text-sm sm:text-base leading-relaxed">
                {sector === 'spa'
                  ? 'Elige un servicio, profesional y horario disponible. Recibirás la confirmación de tu cita al instante.'
                  : `Explora ${vocabulario.item.toLowerCase()}s y productos de ejemplo. El catálogo se adapta al sector que elegiste arriba.`}
              </p>
            </div>

            {sector === 'spa' ? (
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
            ) : (
              <div className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {mockItems.map((item) => (
                    <article key={item.id} className="flex flex-col justify-between rounded-2xl border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 p-5 shadow-sm">
                      <div>
                        <span className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400">{item.categoria}</span>
                        <h3 className="mt-2 text-base font-semibold text-zinc-900 dark:text-zinc-100">{item.nombre}</h3>
                        <p className="mt-1 text-xs leading-relaxed text-zinc-500 dark:text-zinc-400">{item.stockOAtributo}</p>
                      </div>
                      <div className="mt-5 flex items-center justify-between gap-3 border-t border-zinc-200/80 dark:border-zinc-800 pt-4">
                        <span className="font-mono text-base font-semibold text-zinc-900 dark:text-zinc-100">
                          {formatearMoneda(item.precio)}
                        </span>
                        <span className="rounded-full bg-zinc-100 dark:bg-zinc-800 px-2.5 py-1 text-[11px] font-medium text-zinc-600 dark:text-zinc-300">
                          {item.codigo}
                        </span>
                      </div>
                    </article>
                  ))}
                </div>
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 rounded-2xl border border-zinc-200/80 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 p-4 sm:px-5">
                  <p className="text-xs text-zinc-600 dark:text-zinc-400">
                    Estás viendo un catálogo de demostración. Cada negocio configura sus propios productos, precios y existencias.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      const simulator = document.getElementById('simulador')
                      if (simulator) simulator.scrollIntoView({ behavior: 'smooth' })
                    }}
                    className="shrink-0 rounded-xl bg-zinc-900 px-4 py-2.5 text-xs font-medium text-zinc-50 shadow-sm transition-all hover:bg-zinc-800 active:scale-[0.98] dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white"
                  >
                    Probar catálogo interactivo
                  </button>
                </div>
              </div>
            )}
          </section>

          {/* 12. CTA Comercial de Cierre */}
          <PortalCtaBanner
            onIrAReservas={() => {
              const el = document.getElementById('reserva')
              if (el) el.scrollIntoView({ behavior: 'smooth' })
            }}
          />
        </>
      )}

      {tabPrincipal === 'modulos' && (
        <div className="pt-8">
          <PortalModulosShowcase />
        </div>
      )}

      {tabPrincipal === 'productos' && (
        <div id="catalogo" className="scroll-mt-20 pt-8">
          <PortalCatalogoProductos
            productos={productos}
            formatearMoneda={formatearMoneda}
          />
        </div>
      )}

      {tabPrincipal === 'hardware' && (
        <div className="pt-8">
          <PortalHardwareShowcase />
        </div>
      )}

      {tabPrincipal === 'verticales' && (
        <div className="pt-8">
          <PortalVerticalesShowcase
            onIrAReservas={() => {
              setTabPrincipal('reservas')
              setTimeout(() => {
                const el = document.getElementById('reserva')
                if (el) el.scrollIntoView({ behavior: 'smooth' })
              }, 100)
            }}
          />
        </div>
      )}

      {/* 4. Footer */}
      <PortalFooter
        configuracion={configuracion}
        nombreMarca={nombreMarca}
        lemaMarca={lemaMarca}
        servicios={servicios}
        isAuthenticated={isAuthenticated}
        onSeleccionarServicio={() => {
          setTabPrincipal('reservas')
          const el = document.getElementById('reserva')
          if (el) el.scrollIntoView({ behavior: 'smooth' })
        }}
        onIrAReservas={() => {
          setTabPrincipal('reservas')
          const el = document.getElementById('reserva')
          if (el) el.scrollIntoView({ behavior: 'smooth' })
        }}
      />
    </div>
  )
}
