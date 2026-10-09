import { useState, useMemo } from 'react'
import {
  Blocks,
  Layers,
  Sparkles,
  Check,
  RotateCcw,
  Code2,
  Building2,
  Shield,
  ArrowRight,
  ExternalLink,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { useModules } from '@/hooks/useModules'
import { useTenant } from '@/context/TenantContext'
import {
  MODULES,
  PLAN_LABEL,
  PLAN_ORDER,
} from '@/config/modules'
import { ALL_INDUSTRIES, getIndustryPreset } from '@/config/industries'
import type { IndustryId, ModuleDefinition, ModuleId } from '@/types'
import { Button, Badge, EmptyState, FirstUseHint } from '@/components/ui'
import {
  ModuloCard,
  ModulosFiltrosBar,
  ModalDetalleModulo,
  ModulosFiltros,
} from '@/components/modulos'
import { useToast } from '@/hooks/useToast'

type TabModulosPage = 'catalogo' | 'sectores' | 'arquitectura'

export default function ModulosPage() {
  const [tabActiva, setTabActiva] = useState<TabModulosPage>('catalogo')

  const {
    industry,
    applyPreset,
    isModuleEnabled,
    isAddonEnabled,
    toggleModule,
    toggleAddon,
    resetToDefaults,
  } = useModules()

  const { tenantActivo } = useTenant()
  const { toast } = useToast()

  const planTenant = tenantActivo?.plan ?? 'starter'
  const planTenantLevel = PLAN_ORDER[planTenant] ?? 0
  const presetActual = getIndustryPreset(industry)

  // Filtros reactivos
  const [filtros, setFiltros] = useState<ModulosFiltros>({
    busqueda: '',
    categoria: 'todas',
    estado: 'todos',
  })

  // Modal de detalles técnicos
  const [moduloSeleccionado, setModuloSeleccionado] = useState<ModuleDefinition | null>(null)

  // Manejo de presets
  const [industriaSeleccionada, setIndustriaSeleccionada] = useState<IndustryId | null>(null)

  const handleAplicarPreset = (id: IndustryId) => {
    applyPreset(id)
    const preset = getIndustryPreset(id)
    toast.success(
      'Preset de industria aplicado',
      `Se configuró la plataforma para "${preset.label}". La terminología y módulos recomendados se han actualizado.`
    )
  }

  // Clasificación de estados para filtros y métricas
  const modulosConEstado = useMemo(() => {
    return MODULES.map((mod) => {
      const requiredLevel = PLAN_ORDER[mod.minPlan] ?? 0
      const isRestrictedByPlan = planTenantLevel < requiredLevel
      const isCurrentlyEnabled = isModuleEnabled(mod.id)
      const esPlanificado = mod.availability === 'planificado'

      let estadoFiltro: 'activo' | 'disponible' | 'restringido' | 'hoja_ruta'
      if (esPlanificado) {
        estadoFiltro = 'hoja_ruta'
      } else if (isRestrictedByPlan) {
        estadoFiltro = 'restringido'
      } else if (isCurrentlyEnabled) {
        estadoFiltro = 'activo'
      } else {
        estadoFiltro = 'disponible'
      }

      return {
        ...mod,
        estadoFiltro,
        isCurrentlyEnabled,
        isRestrictedByPlan,
      }
    })
  }, [isModuleEnabled, planTenantLevel])

  // Contadores de métricas del ecosistema
  const metricas = useMemo(() => {
    const total = modulosConEstado.length
    const activos = modulosConEstado.filter((m) => m.estadoFiltro === 'activo').length
    const disponibles = modulosConEstado.filter((m) => m.estadoFiltro === 'disponible').length
    const restringidos = modulosConEstado.filter((m) => m.estadoFiltro === 'restringido').length
    const hojaRuta = modulosConEstado.filter((m) => m.estadoFiltro === 'hoja_ruta').length
    return { total, activos, disponibles, restringidos, hojaRuta }
  }, [modulosConEstado])

  // Filtrado reactivo en memoria
  const modulosFiltrados = useMemo(() => {
    return modulosConEstado.filter((m) => {
      // 1. Categoría
      if (filtros.categoria !== 'todas' && m.category !== filtros.categoria) {
        return false
      }

      // 2. Estado
      if (filtros.estado === 'activos' && m.estadoFiltro !== 'activo') return false
      if (filtros.estado === 'disponibles' && m.estadoFiltro !== 'disponible') return false
      if (filtros.estado === 'restringidos' && m.estadoFiltro !== 'restringido') return false
      if (filtros.estado === 'hoja_ruta' && m.estadoFiltro !== 'hoja_ruta') return false

      // 3. Búsqueda de texto libre
      if (filtros.busqueda.trim()) {
        const q = filtros.busqueda.toLowerCase().trim()
        const matchTitle = m.label.toLowerCase().includes(q)
        const matchDesc = m.description.toLowerCase().includes(q)
        const matchId = m.id.toLowerCase().includes(q)
        const matchPerm = m.permission?.toLowerCase().includes(q)
        const matchCap = m.capabilities.some((c) => c.toLowerCase().includes(q))
        if (!matchTitle && !matchDesc && !matchId && !matchPerm && !matchCap) {
          return false
        }
      }

      return true
    })
  }, [modulosConEstado, filtros])

  return (
    <div className="space-y-6 animate-fade-in">
      {/* ── Header Principal ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 bg-primary text-white rounded-2xl shadow-sm">
              <Blocks className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-text">
                Centro de Módulos & Extensibilidad
              </h1>
              <p className="text-xs sm:text-sm text-text-muted mt-0.5">
                Adapta Sagitta a tu negocio activando capacidades reales, complementos y presets por sector
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              resetToDefaults()
              toast.info('Valores restablecidos', 'Se restablecieron los módulos predeterminados del sector.')
            }}
            leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
          >
            Restablecer Valores
          </Button>
        </div>
      </div>

      {/* ── Navegación por pestañas superiores ── */}
      <div className="flex items-center gap-2 border-b border-border pb-3">
        {[
          { id: 'catalogo', label: `Catálogo de Módulos (${metricas.total})`, icon: Layers },
          { id: 'sectores', label: `Sector / Industria (${presetActual.label})`, icon: Sparkles },
          { id: 'arquitectura', label: 'Extensibilidad & Arquitectura', icon: Code2 },
        ].map((tab) => {
          const Icon = tab.icon
          const esActiva = tabActiva === tab.id
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setTabActiva(tab.id as TabModulosPage)}
              className={[
                'flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all cursor-pointer',
                esActiva
                  ? 'bg-primary text-white shadow-2xs'
                  : 'bg-surface text-text-muted hover:text-text hover:bg-surface-subtle border border-border',
              ].join(' ')}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          )
        })}
      </div>

      {/* ── PESTAÑA 1: CATÁLOGO DE MÓDULOS ── */}
      {tabActiva === 'catalogo' && (
        <div className="space-y-5">
          {/* Onboarding FirstUseHint */}
          <FirstUseHint
            hintKey="modulos_ecosistema_onboarding"
            title="Ecosistema Modular de Sagitta"
            description="Activa únicamente las funciones que tu empresa utiliza a diario. Los módulos desactivados no saturarán los menús ni la navegación, permitiendo una experiencia limpia y adaptada a tu escala."
            variant="banner"
          />

          {/* Tarjeta de Métricas y Estado de la Sucursal */}
          <div className="p-5 rounded-2xl bg-surface border border-border shadow-2xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border">
              <div className="flex items-center gap-2.5">
                <Building2 className="w-4 h-4 text-primary" />
                <span className="text-xs font-semibold text-text">
                  Sede activa: <strong className="font-bold">{tenantActivo?.nombre || 'Principal'}</strong>
                </span>
                <span className="text-text-muted text-xs">•</span>
                <Badge variant="primary" size="sm">
                  Plan {PLAN_LABEL[planTenant]}
                </Badge>
              </div>

              <div className="flex items-center gap-3 text-xs text-text-muted">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Operativos
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> Plan {PLAN_LABEL.pro}+
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-400" /> Hoja de Ruta
                </span>
              </div>
            </div>

            {/* Grid de Contadores */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 rounded-xl bg-surface-subtle border border-border">
                <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted block">
                  Módulos Activos
                </span>
                <div className="flex items-baseline gap-1.5 mt-0.5">
                  <span className="text-xl font-bold font-mono text-emerald-600 dark:text-emerald-400">
                    {metricas.activos}
                  </span>
                  <span className="text-xs text-text-muted">de {metricas.total}</span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-surface-subtle border border-border">
                <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted block">
                  Disponibles
                </span>
                <div className="flex items-baseline gap-1.5 mt-0.5">
                  <span className="text-xl font-bold font-mono text-sky-600 dark:text-sky-400">
                    {metricas.disponibles}
                  </span>
                  <span className="text-xs text-text-muted">listos para usar</span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-surface-subtle border border-border">
                <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted block">
                  Por Nivel de Plan
                </span>
                <div className="flex items-baseline gap-1.5 mt-0.5">
                  <span className="text-xl font-bold font-mono text-amber-600 dark:text-amber-400">
                    {metricas.restringidos}
                  </span>
                  <span className="text-xs text-text-muted">Pro / Enterprise</span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-surface-subtle border border-border">
                <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted block">
                  En Hoja de Ruta
                </span>
                <div className="flex items-baseline gap-1.5 mt-0.5">
                  <span className="text-xl font-bold font-mono text-text-muted">
                    {metricas.hojaRuta}
                  </span>
                  <span className="text-xs text-text-muted">próximamente</span>
                </div>
              </div>
            </div>
          </div>

          {/* Barra de Filtros, Categorías y Búsqueda */}
          <ModulosFiltrosBar
            filtros={filtros}
            onFiltrosChange={setFiltros}
            totalModulos={metricas.total}
            modulosFiltrados={modulosFiltrados.length}
          />

          {/* Grilla de Módulos o Estado Vacío */}
          {modulosFiltrados.length === 0 ? (
            <EmptyState
              title="No se encontraron módulos"
              description="No hay módulos que coincidan con la búsqueda o los filtros de categoría seleccionados."
              actionLabel="Restablecer Filtros"
              onAction={() =>
                setFiltros({
                  busqueda: '',
                  categoria: 'todas',
                  estado: 'todos',
                })
              }
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {modulosFiltrados.map((mod) => (
                <ModuloCard
                  key={mod.id}
                  modulo={mod}
                  estaHabilitado={mod.isCurrentlyEnabled}
                  planTenant={planTenant}
                  onToggle={(id: ModuleId) => {
                    toggleModule(id)
                    toast.success(
                      mod.isCurrentlyEnabled ? 'Módulo desactivado' : 'Módulo activado',
                      `Se actualizó el estado de "${mod.label}" para tu sucursal.`
                    )
                  }}
                  onVerDetalles={(m) => setModuloSeleccionado(m)}
                  onToggleAddon={(addonKey) => toggleAddon(addonKey)}
                  isAddonEnabled={(addonKey) => isAddonEnabled(addonKey)}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── PESTAÑA 2: PRESETS POR SECTOR ── */}
      {tabActiva === 'sectores' && (
        <div className="space-y-6">
          <div className="p-5 rounded-2xl bg-surface border border-border shadow-2xs text-xs sm:text-sm">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              <h3 className="font-bold text-text text-base">
                Adaptabilidad Multirubro: "Sagitta se adapta a tu negocio, no tu negocio a Sagitta"
              </h3>
            </div>
            <p className="text-text-muted mt-2 leading-relaxed">
              Al seleccionar una industria, Sagitta preconfigura los módulos ideales, habilita complementos sugeridos y adapta automáticamente la terminología de toda la interfaz en tiempo real (por ejemplo, en Salud se denominan <em>Pacientes</em> y <em>Consultas</em>, mientras que en Fitness son <em>Miembros</em> y <em>Clases</em>).
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {ALL_INDUSTRIES.map((ind) => {
              const esActiva = industry === ind.id
              const estaSeleccionada = (industriaSeleccionada ?? industry) === ind.id

              return (
                <div
                  key={ind.id}
                  onClick={() => setIndustriaSeleccionada(ind.id)}
                  className={[
                    'p-5 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between',
                    esActiva
                      ? 'border-primary bg-primary-soft/30 shadow-2xs ring-2 ring-primary/40'
                      : estaSeleccionada
                      ? 'border-text/30 bg-surface shadow-card'
                      : 'border-border bg-surface hover:border-primary/30',
                  ].join(' ')}
                >
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="font-bold text-text text-base">{ind.label}</h3>
                      {esActiva && (
                        <span className="text-[11px] font-bold text-primary bg-primary-soft px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-2xs">
                          <Check className="w-3.5 h-3.5" /> En Uso
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-text-muted mt-2 leading-relaxed">
                      {ind.description}
                    </p>

                    {/* Módulos sugeridos */}
                    <div className="mt-3.5 pt-3 border-t border-border-subtle">
                      <p className="text-[11px] font-bold text-text-muted uppercase tracking-wider mb-1.5">
                        Módulos Clave:
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {ind.modules.slice(0, 4).map((modId) => {
                          const mDef = MODULES.find((m) => m.id === modId)
                          return (
                            <span
                              key={modId}
                              className="text-[11px] bg-surface-subtle text-text border border-border-subtle px-2 py-0.5 rounded-md font-medium"
                            >
                              {mDef?.label || modId}
                            </span>
                          )
                        })}
                        {ind.modules.length > 4 && (
                          <span className="text-[10px] text-text-muted px-1.5 py-0.5">
                            +{ind.modules.length - 4} más
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Términos de Dominio adaptados */}
                    <div className="mt-3.5 pt-2.5 border-t border-border-subtle text-[11px] space-y-1">
                      <div className="flex justify-between">
                        <span className="text-text-muted">Citas:</span>
                        <strong className="text-text font-bold">{ind.terms.citas ?? 'Citas'}</strong>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-text-muted">Clientes:</span>
                        <strong className="text-text font-bold">{ind.terms.clientes ?? 'Clientes'}</strong>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-text-muted">Profesionales:</span>
                        <strong className="text-text font-bold">{ind.terms.profesionales ?? 'Profesionales'}</strong>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-text-muted">Recursos:</span>
                        <strong className="text-text font-bold">{ind.terms.recursos ?? 'Recursos'}</strong>
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 pt-3 border-t border-border">
                    <Button
                      variant={esActiva ? 'secondary' : 'primary'}
                      size="sm"
                      fullWidth
                      disabled={esActiva}
                      onClick={(e) => {
                        e.stopPropagation()
                        handleAplicarPreset(ind.id)
                      }}
                    >
                      {esActiva ? 'Sector Activo' : 'Aplicar este Sector'}
                    </Button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* ── PESTAÑA 3: EXTENSIBILIDAD & ARQUITECTURA ── */}
      {tabActiva === 'arquitectura' && (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-surface border border-border shadow-2xs space-y-4">
            <div className="flex items-center gap-2.5">
              <Code2 className="w-6 h-6 text-primary" />
              <div>
                <h3 className="font-bold text-base text-text">
                  Patrón de Registro de Módulos (Zero Switch Statements)
                </h3>
                <p className="text-xs text-text-muted mt-0.5">
                  Sagitta está diseñado con una arquitectura extensible abierta para incorporar futuras capacidades sin tocar código monolítico.
                </p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-surface-subtle border border-border font-mono text-xs text-text leading-relaxed">
              <p className="text-text-muted">// Añadir un nuevo módulo en src/config/modules.ts:</p>
              <pre className="text-primary mt-2">
{`{
  id: 'nuevo_modulo',
  label: 'Nombre del Módulo',
  description: 'Descripción operativa clara',
  category: 'operaciones',
  route: '/nueva-ruta',
  permission: 'modulo.read',
  availability: 'disponible',
  backend: 'frontend_ready',
  minPlan: 'pro',
  capabilities: ['Capacidad 1', 'Capacidad 2'],
}`}
              </pre>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              <div className="p-4 rounded-xl border border-border bg-surface">
                <Shield className="w-5 h-5 text-primary mb-2" />
                <h4 className="font-bold text-xs text-text">Seguridad & RBAC</h4>
                <p className="text-[11px] text-text-muted mt-1">
                  Cada módulo declara su permiso mínimo exigido, sincronizándose con la matriz de roles y permisos.
                </p>
                <Link
                  to="/roles"
                  className="inline-flex items-center gap-1 text-xs text-primary font-semibold hover:underline mt-3"
                >
                  Ver Matriz de Roles <ArrowRight className="w-3 h-3" />
                </Link>
              </div>

              <div className="p-4 rounded-xl border border-border bg-surface">
                <Layers className="w-5 h-5 text-primary mb-2" />
                <h4 className="font-bold text-xs text-text">Resolución de Dependencias</h4>
                <p className="text-[11px] text-text-muted mt-1">
                  El motor recorre automáticamente el árbol de dependencias transitivas para evitar módulos huérfanos.
                </p>
                <span className="text-[10px] text-text-muted block mt-3 font-mono">
                  getTechnicalRequirements()
                </span>
              </div>

              <div className="p-4 rounded-xl border border-border bg-surface">
                <Code2 className="w-5 h-5 text-primary mb-2" />
                <h4 className="font-bold text-xs text-text">Consola de Desarrolladores</h4>
                <p className="text-[11px] text-text-muted mt-1">
                  Genera claves de API, webhooks y consulta la documentación interactiva OpenAPI de Sagitta.
                </p>
                <Link
                  to="/desarrolladores"
                  className="inline-flex items-center gap-1 text-xs text-primary font-semibold hover:underline mt-3"
                >
                  Abrir API & Desarrolladores <ExternalLink className="w-3 h-3" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal de Ficha Técnica Detallada ── */}
      <ModalDetalleModulo
        isOpen={!!moduloSeleccionado}
        onClose={() => setModuloSeleccionado(null)}
        modulo={moduloSeleccionado}
        estaHabilitado={moduloSeleccionado ? isModuleEnabled(moduloSeleccionado.id) : false}
        planTenant={planTenant}
        onToggle={() => {
          if (moduloSeleccionado) {
            toggleModule(moduloSeleccionado.id)
            setModuloSeleccionado(null)
          }
        }}
      />
    </div>
  )
}
