import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { useSector } from '@/context/SectorContext'
import { Sparkles, ArrowRight } from 'lucide-react'
import { Cita, Cliente, Factura, AlertaStock, Producto, ItemListaEspera } from '@/types'
import { citasService } from '@/services/citas.service'
import { clientesService } from '@/services/clientes.service'
import { pagosService } from '@/services/pagos.service'
import { inventarioService } from '@/services/inventario.service'
import { listaEsperaService } from '@/services/listaEspera.service'
import { SkeletonCardGrid, SkeletonTable, ErrorState } from '@/components/ui'
import {
  DashboardHero,
  WidgetMetricasClave,
  WidgetAgendaHoy,
  WidgetColaRecepcion,
  WidgetAlertasOperativas,
  WidgetAccionesRapidas,
  ModalConfigurarDashboard,
  getWidgetPreferences,
  getWidgetOrder,
  DashboardWidgetId,
} from '@/components/dashboard'
import {
  OnboardingChecklistWidget,
  OnboardingWizard,
  OnboardingStepId,
} from '@/components/onboarding'

import { useRole } from '@/hooks/useRole'

export default function DashboardPage() {
  const { isAssignedToUser } = useRole()
  const { tokens } = useSector()
  const [onboardingWizardOpen, setOnboardingWizardOpen] = useState(false)
  const [citas, setCitas] = useState<Cita[]>([])
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [facturas, setFacturas] = useState<Factura[]>([])
  const [alertasStock, setAlertasStock] = useState<AlertaStock[]>([])
  const [productosBajoStock, setProductosBajoStock] = useState<Producto[]>([])
  const [entradasCola, setEntradasCola] = useState<ItemListaEspera[]>([])

  const [cargando, setCargando] = useState(true)
  const [errorCarga, setErrorCarga] = useState<string | null>(null)
  const [modalConfigOpen, setModalConfigOpen] = useState(false)
  const [widgetPrefs, setWidgetPrefs] = useState<Record<DashboardWidgetId, boolean>>(() =>
    getWidgetPreferences()
  )
  const [widgetOrder, setWidgetOrder] = useState<DashboardWidgetId[]>(() =>
    getWidgetOrder()
  )

  const cargarDatos = useCallback(async () => {
    setCargando(true)
    setErrorCarga(null)

    try {
      const [
        resCitas,
        resClientes,
        resFacturas,
        resAlertas,
        resProductos,
        resCola,
      ] = await Promise.all([
        citasService.getAll().catch(() => ({ data: [] })),
        clientesService.getAll().catch(() => ({ data: [] })),
        pagosService.getFacturas().catch(() => ({ data: [] })),
        inventarioService.getAlertasStock().catch(() => ({ data: [] })),
        inventarioService.getProductos().catch(() => ({ data: [] })),
        listaEsperaService.getLista({ estado: 'en_espera' }).catch(() => ({ data: [] })),
      ])

      const citasData = resCitas.data ?? []
      const clientesData = resClientes.data ?? []
      const facturasData = resFacturas.data ?? []
      const alertasData = resAlertas.data ?? []
      const productosData = resProductos.data ?? []
      const colaData = resCola.data ?? []

      // Filtrar productos reales cuyo stock actual es menor o igual al mínimo
      const bajoStock = productosData.filter(
        (p) => p.activo && p.stock_actual <= p.stock_minimo
      )

      setCitas(citasData)
      setClientes(clientesData)
      setFacturas(facturasData)
      setAlertasStock(alertasData)
      setProductosBajoStock(bajoStock)
      setEntradasCola(colaData)
    } catch (err) {
      setErrorCarga(
        err instanceof Error ? err.message : 'Error al sincronizar datos del panel.'
      )
    } finally {
      setCargando(false)
    }
  }, [])

  useEffect(() => {
    cargarDatos()
  }, [cargarDatos])

  const hoyStr = new Date().toISOString().slice(0, 10)
  const citasHoy = citas.filter((c) => c.fecha_inicio.startsWith(hoyStr))
  const citasHoyCount = citasHoy.length
  const citasPendientesCount = citasHoy.filter(
    (c) => c.estado === 'pendiente' || c.estado === 'en_cola'
  ).length

  const misCitasHoy = citasHoy.filter((c) => isAssignedToUser(c))
  const misCitasHoyCount = misCitasHoy.length
  const misCitasPendientesCount = misCitasHoy.filter(
    (c) => c.estado === 'pendiente' || c.estado === 'en_cola'
  ).length

  if (cargando) {
    return (
      <div className="space-y-6 animate-fade-in" aria-busy="true">
        <div className="h-28 rounded-2xl bg-surface-subtle animate-pulse border border-border" />
        <SkeletonCardGrid count={4} cols={4} />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <SkeletonTable rows={4} cols={4} />
          </div>
          <div className="space-y-4">
            <SkeletonCardGrid count={2} cols={2} />
          </div>
        </div>
      </div>
    )
  }

  if (errorCarga) {
    return (
      <div className="py-12">
        <ErrorState
          title="No pudimos cargar tu panel"
          description={errorCarga}
          onRetry={cargarDatos}
        />
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* ── 1. Hero Summary Contextual ── */}
      <DashboardHero
        onOpenConfig={() => setModalConfigOpen(true)}
        citasHoyCount={citasHoyCount}
        citasPendientesCount={citasPendientesCount}
        misCitasHoyCount={misCitasHoyCount}
        misCitasPendientesCount={misCitasPendientesCount}
      />

      {/* ── Acceso Rápido al Mostrador POS Multivertical Camaleónico ── */}
      <section className="relative overflow-hidden p-4 sm:p-5 rounded-2xl bg-neutral-900/90 border border-white/10 text-white shadow-xl backdrop-blur-md">
        <div
          className="pointer-events-none absolute -right-20 -top-20 w-64 h-64 rounded-full opacity-20 filter blur-3xl"
          style={{ background: tokens.accentColor }}
          aria-hidden="true"
        />
        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl border border-white/15 bg-white/[0.04] shadow-md shrink-0"
              style={{
                borderColor: tokens.accentBorder,
                boxShadow: `0 0 16px ${tokens.accentGlow}`,
              }}
            >
              {tokens.iconEmoji}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-extrabold text-white">
                  Mostrador Operativo Camaleónico ({tokens.nombre})
                </h3>
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-white/10 text-neutral-300 font-semibold border border-white/10">
                  Sector Activo
                </span>
              </div>
              <p className="text-xs text-neutral-400 mt-0.5">
                Punto de Venta multivertical de 12 columnas: respuesta física háptica, skeletons de cristal anti-pulse y despacho efervescente.
              </p>
            </div>
          </div>

          <Link
            to="/mostrador"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white transition-all duration-150 shrink-0 cursor-pointer shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 active:scale-95"
            style={{
              background: `linear-gradient(135deg, ${tokens.accentColor} 0%, ${tokens.accentHover} 100%)`,
              boxShadow: `0 4px 16px ${tokens.accentGlow}`,
            }}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Abrir Mostrador POS</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </section>

      {/* ── Guía de Onboarding Progresiva ── */}
      <OnboardingChecklistWidget onOpenWizard={(_step?: OnboardingStepId) => setOnboardingWizardOpen(true)} />

      {/* ── 2. Métricas Clave de la Jornada (Asimétricas y por Rol) ── */}
      {widgetPrefs.metricas && (
        <section aria-label="Métricas clave">
          <WidgetMetricasClave
            citas={citas}
            clientes={clientes}
            facturas={facturas}
          />
        </section>
      )}

      {/* ── 3. Composición Principal en Dos Columnas Ordenada Dinámicamente ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Columna Izquierda (2/3): Agenda Cronológica + Accesos Rápidos */}
        <div className="lg:col-span-2 space-y-6">
          {widgetOrder
            .filter((id) => (id === 'agenda_hoy' || id === 'acciones_rapidas') && widgetPrefs[id])
            .map((id) => {
              if (id === 'agenda_hoy') {
                return (
                  <section key="agenda_hoy" aria-label="Agenda de hoy">
                    <WidgetAgendaHoy citas={citas} onUpdateCitas={setCitas} />
                  </section>
                )
              }
              if (id === 'acciones_rapidas') {
                return (
                  <section key="acciones_rapidas" aria-label="Accesos rápidos">
                    <WidgetAccionesRapidas />
                  </section>
                )
              }
              return null
            })}
        </div>

        {/* Columna Derecha (1/3): Cola Walk-in Recepción + Alertas Operativas */}
        <div className="space-y-6">
          {widgetOrder
            .filter((id) => (id === 'cola_recepcion' || id === 'alertas_operativas') && widgetPrefs[id])
            .map((id) => {
              if (id === 'cola_recepcion') {
                return (
                  <section key="cola_recepcion" aria-label="Recepción y lista de espera">
                    <WidgetColaRecepcion entradas={entradasCola} />
                  </section>
                )
              }
              if (id === 'alertas_operativas') {
                return (
                  <section key="alertas_operativas" aria-label="Alertas operativas">
                    <WidgetAlertasOperativas
                      alertasStock={alertasStock}
                      productosBajoStock={productosBajoStock}
                      facturasPendientes={facturas.filter((f) => f.estado === 'pendiente')}
                    />
                  </section>
                )
              }
              return null
            })}
        </div>
      </div>

      {/* ── 4. Modal de Personalización de Widgets ── */}
      <ModalConfigurarDashboard
        isOpen={modalConfigOpen}
        onClose={() => setModalConfigOpen(false)}
        preferences={widgetPrefs}
        onSavePreferences={setWidgetPrefs}
        onSaveOrder={setWidgetOrder}
      />

      {/* ── 5. Asistente de Inicio / Onboarding Wizard ── */}
      <OnboardingWizard
        isOpen={onboardingWizardOpen}
        onClose={() => setOnboardingWizardOpen(false)}
      />
    </div>
  )
}
