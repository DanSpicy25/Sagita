import { useState } from 'react'
import {
  Blocks,
  Check,
  ChevronDown,
  ChevronUp,
  Info,
  Layers,
  Lock,
  Sparkles,
  AlertCircle,
} from 'lucide-react'
import { useModules } from '@/hooks/useModules'
import { useTenant } from '@/context/TenantContext'
import {
  MODULES,
  MODULE_CATEGORIES,
  PLAN_LABEL,
  PLAN_ORDER,
  getTechnicalRequirements,
  getTechnicalDependents,
} from '@/config/modules'
import { ALL_INDUSTRIES, getIndustryPreset } from '@/config/industries'
import type { IndustryId, ModuleCategory, ModuleDefinition } from '@/types'
import { Button, Badge } from '@/components/ui'
import { useToast } from '@/hooks/useToast'

type TabModulos = 'modulos' | 'sectores'

export default function ModulosPage() {
  const [tabActiva, setTabActiva] = useState<TabModulos>('modulos')
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState<ModuleCategory | 'todas'>('todas')
  const [expandidoModuloId, setExpandidoModuloId] = useState<string | null>(null)
  const [industriaSeleccionada, setIndustriaSeleccionada] = useState<IndustryId | null>(null)

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
  const presetActual = getIndustryPreset(industry)

  const handleAplicarPreset = (id: IndustryId) => {
    applyPreset(id)
    toast.success('Preset aplicado', `Se configuró la plataforma para el sector "${getIndustryPreset(id).label}"`)
  }

  const modulosFiltrados = MODULES.filter((m) => {
    if (categoriaSeleccionada === 'todas') return true
    return m.category === categoriaSeleccionada
  })

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-primary-soft text-primary rounded-lg">
              <Blocks className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-text">Módulos y Adaptabilidad</h1>
              <p className="text-xs sm:text-sm text-text-muted mt-0.5">
                Adapta Sagitta a las necesidades de tu empresa activando capacidades, complementos y presets por industria.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={resetToDefaults}
            title="Restablecer a la configuración predeterminada de la industria"
          >
            Restablecer Valores
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-border pb-3">
        <button
          type="button"
          onClick={() => setTabActiva('modulos')}
          className={[
            'flex items-center gap-2 px-4 py-2 rounded-md text-xs sm:text-sm font-medium whitespace-nowrap transition-colors duration-150',
            tabActiva === 'modulos'
              ? 'bg-primary text-white shadow-sm'
              : 'bg-surface text-text-muted hover:bg-secondary-soft hover:text-text border border-border',
          ].join(' ')}
        >
          <Layers className="w-4 h-4" />
          Módulos y Capacidades ({MODULES.length})
        </button>

        <button
          type="button"
          onClick={() => setTabActiva('sectores')}
          className={[
            'flex items-center gap-2 px-4 py-2 rounded-md text-xs sm:text-sm font-medium whitespace-nowrap transition-colors duration-150',
            tabActiva === 'sectores'
              ? 'bg-primary text-white shadow-sm'
              : 'bg-surface text-text-muted hover:bg-secondary-soft hover:text-text border border-border',
          ].join(' ')}
        >
          <Sparkles className="w-4 h-4" />
          Sector / Industria: <span className="font-semibold text-text underline">{presetActual.label}</span>
        </button>
      </div>

      {/* TAB 1: Módulos y Capacidades */}
      {tabActiva === 'modulos' && (
        <div className="space-y-6">
          {/* Banner explicativo del negocio */}
          <div className="p-4 bg-surface border border-border rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs sm:text-sm">
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-primary shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-text">
                  Sucursal actual: <span className="font-semibold">{tenantActivo?.nombre}</span> — Plan:{' '}
                  <Badge variant="primary" size="sm">{PLAN_LABEL[planTenant]}</Badge>
                </p>
                <p className="text-text-muted mt-0.5 text-xs">
                  Los módulos se adaptan en tiempo real. Los módulos CORE están siempre disponibles y los módulos no contratados o desactivados no saturarán el menú.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-xs text-text-muted">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500" /> Disponible
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-amber-500" /> Parcial
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-slate-400" /> Planificado
              </span>
            </div>
          </div>

          {/* Filtro por Categorías */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            <button
              type="button"
              onClick={() => setCategoriaSeleccionada('todas')}
              className={[
                'px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap transition-colors',
                categoriaSeleccionada === 'todas'
                  ? 'bg-primary text-white'
                  : 'bg-surface text-text-muted hover:bg-secondary-soft border border-border',
              ].join(' ')}
            >
              Todas las Categorías
            </button>
            {MODULE_CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setCategoriaSeleccionada(cat.id)}
                className={[
                  'px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap transition-colors',
                  categoriaSeleccionada === cat.id
                    ? 'bg-primary text-white'
                    : 'bg-surface text-text-muted hover:bg-secondary-soft border border-border',
                ].join(' ')}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Grilla de Módulos */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {modulosFiltrados.map((modulo: ModuleDefinition) => {
              const estaHabilitado = isModuleEnabled(modulo.id)
              const estaExpandido = expandidoModuloId === modulo.id
              const planInsuficiente = (PLAN_ORDER[planTenant] ?? 0) < (PLAN_ORDER[modulo.minPlan] ?? 0)
              const esCore = modulo.core

              const reqs = getTechnicalRequirements(modulo.id)
              const deps = getTechnicalDependents(modulo.id)

              return (
                <div
                  key={modulo.id}
                  className={[
                    'bg-surface border rounded-lg p-5 transition-all flex flex-col justify-between',
                    estaHabilitado
                      ? 'border-border shadow-card'
                      : 'border-border/60 opacity-80 bg-surface/60',
                  ].join(' ')}
                >
                  <div>
                    {/* Header de Tarjeta */}
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-semibold text-text text-base">{modulo.label}</h3>
                          {esCore && (
                            <Badge variant="outline" size="sm" title="Módulo base indispensable">
                              CORE
                            </Badge>
                          )}
                          {modulo.availability === 'disponible' && (
                            <Badge variant="success" size="sm">Disponible</Badge>
                          )}
                          {modulo.availability === 'parcial' && (
                            <Badge variant="warning" size="sm">Parcial</Badge>
                          )}
                          {modulo.availability === 'planificado' && (
                            <Badge variant="default" size="sm">Planificado</Badge>
                          )}
                        </div>
                        <p className="text-xs text-text-muted mt-1 leading-relaxed">
                          {modulo.description}
                        </p>
                      </div>

                      {/* Switch o Bloqueo */}
                      <div className="shrink-0 flex items-center">
                        {esCore ? (
                          <span
                            className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-1 rounded-md flex items-center gap-1"
                            title="Este módulo es fundamental para el funcionamiento del sistema"
                          >
                            <Check className="w-3.5 h-3.5" /> Activo
                          </span>
                        ) : planInsuficiente ? (
                          <div
                            className="flex items-center gap-1 text-[11px] text-amber-600 bg-amber-50 dark:bg-amber-950/40 px-2 py-1 rounded-md"
                            title={`Requiere plan ${PLAN_LABEL[modulo.minPlan]}`}
                          >
                            <Lock className="w-3.5 h-3.5" />
                            <span>Plan {PLAN_LABEL[modulo.minPlan]}</span>
                          </div>
                        ) : (
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={estaHabilitado}
                              onChange={() => toggleModule(modulo.id)}
                              className="sr-only peer"
                            />
                            <div className="w-9 h-5 bg-border peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary"></div>
                          </label>
                        )}
                      </div>
                    </div>

                    {/* Capacidades principales */}
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {modulo.capabilities.slice(0, 3).map((cap, idx) => (
                        <span
                          key={idx}
                          className="text-[11px] bg-secondary-soft text-text-muted px-2 py-0.5 rounded"
                        >
                          {cap}
                        </span>
                      ))}
                      {modulo.capabilities.length > 3 && (
                        <span className="text-[11px] text-text-muted px-1.5 py-0.5">
                          +{modulo.capabilities.length - 3} más
                        </span>
                      )}
                    </div>

                    {/* Requisitos / Dependencias */}
                    {reqs.length > 0 && !esCore && (
                      <p className="text-[11px] text-text-muted mt-2 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3 text-amber-500" />
                        Requiere:{' '}
                        <span className="font-medium">
                          {reqs.map((r) => MODULES.find((m) => m.id === r)?.label ?? r).join(', ')}
                        </span>
                      </p>
                    )}
                    {deps.length > 0 && estaHabilitado && (
                      <p className="text-[10px] text-text-muted mt-1">
                        Necesario para:{' '}
                        <span>
                          {deps.map((d) => MODULES.find((m) => m.id === d)?.label ?? d).join(', ')}
                        </span>
                      </p>
                    )}
                  </div>

                  {/* Complementos (Addons) expandibles */}
                  {modulo.addons && modulo.addons.length > 0 && (
                    <div className="mt-4 pt-3 border-t border-border/80">
                      <button
                        type="button"
                        onClick={() =>
                          setExpandidoModuloId(estaExpandido ? null : modulo.id)
                        }
                        className="w-full flex items-center justify-between text-xs font-medium text-text-muted hover:text-text transition-colors"
                      >
                        <span>
                          Complementos y Variantes ({modulo.addons.length})
                        </span>
                        {estaExpandido ? (
                          <ChevronUp className="w-3.5 h-3.5" />
                        ) : (
                          <ChevronDown className="w-3.5 h-3.5" />
                        )}
                      </button>

                      {estaExpandido && (
                        <div className="mt-2.5 space-y-2 pt-1">
                          {modulo.addons.map((addon) => {
                            const addonActivo = isAddonEnabled(addon.key)
                            return (
                              <div
                                key={addon.key}
                                className="flex items-center justify-between gap-3 p-2 bg-secondary-soft/50 rounded-md text-xs"
                              >
                                <div className="pr-2">
                                  <div className="flex items-center gap-1.5">
                                    <span className="font-medium text-text">
                                      {addon.label}
                                    </span>
                                    {addon.availability === 'planificado' && (
                                      <span className="text-[9px] uppercase tracking-wider text-slate-400 font-semibold">
                                        Próximamente
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-[11px] text-text-muted mt-0.5">
                                    {addon.description}
                                  </p>
                                </div>

                                <div className="shrink-0">
                                  <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                      type="checkbox"
                                      disabled={!estaHabilitado || addon.availability === 'planificado'}
                                      checked={addonActivo}
                                      onChange={() => toggleAddon(addon.key)}
                                      className="sr-only peer disabled:cursor-not-allowed"
                                    />
                                    <div className="w-7 h-4 bg-border peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-primary peer-disabled:opacity-40"></div>
                                  </label>
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* TAB 2: Sectores e Industrias */}
      {tabActiva === 'sectores' && (
        <div className="space-y-6">
          <div className="p-4 bg-surface border border-border rounded-lg text-xs sm:text-sm">
            <p className="font-medium text-text">
              Personalización por Sector: "Sagitta se adapta al negocio, no el negocio a Sagitta"
            </p>
            <p className="text-text-muted mt-1 leading-relaxed">
              Seleccionar una industria precarga los módulos idóneos, activa complementos recomendados y adapta la terminología en toda la interfaz (por ejemplo, en Salud se habla de <em>Pacientes</em> y <em>Consultas</em>, mientras que en Fitness se habla de <em>Miembros</em> y <em>Clases</em>).
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {ALL_INDUSTRIES.map((ind) => {
              const esActiva = industry === ind.id
              const estaSeleccionada = (industriaSeleccionada ?? industry) === ind.id

              return (
                <div
                  key={ind.id}
                  onClick={() => setIndustriaSeleccionada(ind.id)}
                  className={[
                    'p-5 rounded-lg border cursor-pointer transition-all flex flex-col justify-between',
                    esActiva
                      ? 'border-primary bg-primary-soft/20 shadow-sm ring-1 ring-primary/30'
                      : estaSeleccionada
                      ? 'border-text/30 bg-surface shadow-card'
                      : 'border-border bg-surface hover:border-border-subtle',
                  ].join(' ')}
                >
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="font-semibold text-text text-base">{ind.label}</h3>
                      {esActiva && (
                        <span className="text-[11px] font-semibold text-primary bg-primary-soft px-2 py-0.5 rounded-full flex items-center gap-1">
                          <Check className="w-3 h-3" /> Activo
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-text-muted mt-2 leading-relaxed">
                      {ind.description}
                    </p>

                    <div className="mt-3 pt-3 border-t border-border">
                      <p className="text-[11px] font-medium text-text-muted mb-1.5">
                        Ejemplos de negocios:
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {ind.examples.map((ex, i) => (
                          <span
                            key={i}
                            className="text-[10px] bg-secondary-soft text-text-muted px-2 py-0.5 rounded"
                          >
                            {ex}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Mapeo de Términos */}
                    <div className="mt-3 pt-2 text-[11px] text-text-muted space-y-1">
                      <div className="flex justify-between">
                        <span>Citas se denominan:</span>
                        <strong className="text-text">{ind.terms.citas ?? 'Citas'}</strong>
                      </div>
                      <div className="flex justify-between">
                        <span>Clientes se denominan:</span>
                        <strong className="text-text">{ind.terms.clientes ?? 'Clientes'}</strong>
                      </div>
                      <div className="flex justify-between">
                        <span>Recursos se denominan:</span>
                        <strong className="text-text">{ind.terms.recursos ?? 'Recursos'}</strong>
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
                      {esActiva ? 'Preset en Uso' : 'Aplicar este Sector'}
                    </Button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
