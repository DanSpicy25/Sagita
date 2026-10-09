import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Check,
  Lock,
  ChevronDown,
  ChevronUp,
  Settings,
  Shield,
  Layers,
  ArrowUpRight,
  AlertCircle,
  Clock,
  Sparkles,
} from 'lucide-react'
import {
  ModuleDefinition,
  ModuleId,
  TenantPlan,
} from '@/types'
import {
  MODULE_ICONS,
  MODULES,
  PLAN_LABEL,
  PLAN_ORDER,
  getTechnicalRequirements,
  getTechnicalDependents,
} from '@/config/modules'
import { Badge, Switch, Tooltip } from '@/components/ui'

export interface ModuloCardProps {
  modulo: ModuleDefinition
  estaHabilitado: boolean
  planTenant: TenantPlan
  onToggle: (id: ModuleId) => void
  onVerDetalles?: (modulo: ModuleDefinition) => void
  onToggleAddon?: (addonKey: string) => void
  isAddonEnabled?: (addonKey: string) => boolean
}

export function ModuloCard({
  modulo,
  estaHabilitado,
  planTenant,
  onToggle,
  onVerDetalles,
  onToggleAddon,
  isAddonEnabled,
}: ModuloCardProps) {
  const navigate = useNavigate()
  const [expandidoAddons, setExpandidoAddons] = useState(false)

  const IconComponent = MODULE_ICONS[modulo.id] || Layers
  const currentPlanLevel = PLAN_ORDER[planTenant] ?? 0
  const requiredPlanLevel = PLAN_ORDER[modulo.minPlan] ?? 0
  const planInsuficiente = currentPlanLevel < requiredPlanLevel
  const esCore = modulo.core
  const esPlanificado = modulo.availability === 'planificado'
  const esParcial = modulo.availability === 'parcial'

  const reqs = getTechnicalRequirements(modulo.id)
  const deps = getTechnicalDependents(modulo.id)

  const targetRoute = modulo.configRoute || modulo.route

  const handleConfigurar = () => {
    if (targetRoute) {
      navigate(targetRoute)
    }
  }

  return (
    <div
      className={[
        'rounded-2xl border p-5 transition-all duration-200 flex flex-col justify-between',
        estaHabilitado && !esPlanificado
          ? 'bg-surface border-border shadow-2xs hover:shadow-card hover:border-primary/30'
          : esPlanificado
          ? 'bg-surface-subtle/50 border-border/60 opacity-85'
          : 'bg-surface/80 border-border/80 opacity-90',
      ].join(' ')}
    >
      <div>
        {/* ── Header: Icon, Titles & Status / Switch ── */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div
              className={[
                'w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-2xs transition-colors',
                estaHabilitado && !esPlanificado
                  ? 'bg-primary text-white shadow-primary/20'
                  : 'bg-surface-subtle border border-border text-text-muted',
              ].join(' ')}
            >
              <IconComponent className="w-5 h-5" />
            </div>

            <div>
              <div className="flex items-center gap-1.5 flex-wrap">
                <h3 className="font-bold text-text text-sm sm:text-base leading-snug">
                  {modulo.label}
                </h3>

                {esCore && (
                  <Badge variant="outline" size="sm" title="Módulo base indispensable del sistema">
                    NÚCLEO
                  </Badge>
                )}

                {/* Status Badges - Strictly reflecting real state */}
                {esPlanificado ? (
                  <Badge variant="default" size="sm">
                    <span className="flex items-center gap-1 text-[10px] text-text-muted">
                      <Clock className="w-2.5 h-2.5" />
                      En Hoja de Ruta
                    </span>
                  </Badge>
                ) : planInsuficiente ? (
                  <Badge variant="warning" size="sm">
                    <span className="flex items-center gap-1 text-[10px]">
                      <Lock className="w-2.5 h-2.5" />
                      Plan {PLAN_LABEL[modulo.minPlan]}
                    </span>
                  </Badge>
                ) : estaHabilitado ? (
                  <Badge variant="success" size="sm">
                    <span className="flex items-center gap-1 text-[10px] font-semibold">
                      <Check className="w-2.5 h-2.5" />
                      Activo
                    </span>
                  </Badge>
                ) : (
                  <Badge variant="info" size="sm">
                    <span className="flex items-center gap-1 text-[10px]">
                      <Sparkles className="w-2.5 h-2.5" />
                      Disponible
                    </span>
                  </Badge>
                )}

                {esParcial && !esPlanificado && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-violet-100 text-violet-800 dark:bg-violet-950/50 dark:text-violet-300 font-medium">
                    Beta
                  </span>
                )}
              </div>

              <p className="text-xs text-text-muted mt-1 leading-relaxed line-clamp-2">
                {modulo.description}
              </p>
            </div>
          </div>

          {/* ── Toggle Switch or Lock State ── */}
          <div className="shrink-0 flex items-center pt-0.5">
            {esCore ? (
              <span
                className="text-[10px] font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-1 rounded-lg flex items-center gap-1"
                title="Módulo indispensable para el funcionamiento de Sagitta"
              >
                <Check className="w-3 h-3 text-emerald-600 dark:text-emerald-400" /> Siempre Activo
              </span>
            ) : esPlanificado ? (
              <Tooltip content="Módulo planificado para próximas versiones. Próximamente disponible.">
                <span className="text-[10px] font-medium text-text-muted bg-surface-subtle border border-border px-2 py-1 rounded-lg flex items-center gap-1 cursor-default">
                  <Clock className="w-3 h-3 text-text-muted" /> Próximamente
                </span>
              </Tooltip>
            ) : planInsuficiente ? (
              <Tooltip content={`Requiere actualizar al plan ${PLAN_LABEL[modulo.minPlan]}`}>
                <div className="flex items-center gap-1 text-[10px] font-semibold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 px-2.5 py-1 rounded-lg">
                  <Lock className="w-3 h-3 text-amber-500" />
                  <span>Requiere {PLAN_LABEL[modulo.minPlan]}</span>
                </div>
              </Tooltip>
            ) : (
              <Switch
                checked={estaHabilitado}
                onChange={() => onToggle(modulo.id)}
                aria-label={`Activar o desactivar módulo ${modulo.label}`}
              />
            )}
          </div>
        </div>

        {/* ── Capabilities Pills ── */}
        <div className="mt-3.5 flex flex-wrap gap-1.5">
          {modulo.capabilities.slice(0, 3).map((cap, idx) => (
            <span
              key={idx}
              className="text-[11px] bg-surface-subtle text-text-muted border border-border-subtle px-2 py-0.5 rounded-md font-normal"
            >
              {cap}
            </span>
          ))}
          {modulo.capabilities.length > 3 && (
            <span className="text-[11px] text-text-muted px-1 py-0.5 font-medium">
              +{modulo.capabilities.length - 3} más
            </span>
          )}
        </div>

        {/* ── Security Permission Tag ── */}
        {modulo.permission && (
          <div className="mt-2.5 flex items-center gap-1.5 text-[11px] text-text-muted">
            <Shield className="w-3 h-3 text-text-muted/70 shrink-0" />
            <span className="text-text-muted/80">Permiso requerido:</span>
            <code className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-surface-subtle border border-border text-text font-semibold">
              {modulo.permission}
            </code>
          </div>
        )}

        {/* ── Dependencies Info ── */}
        {reqs.length > 0 && !esCore && (
          <div className="mt-2 text-[11px] text-amber-600 dark:text-amber-400 flex items-center gap-1">
            <AlertCircle className="w-3 h-3 shrink-0" />
            <span>
              Requiere:{' '}
              <strong>
                {reqs.map((r) => MODULES.find((m) => m.id === r)?.label ?? r).join(', ')}
              </strong>
            </span>
          </div>
        )}

        {deps.length > 0 && estaHabilitado && (
          <div className="mt-1 text-[10px] text-text-muted">
            Necesario para:{' '}
            <span className="font-medium text-text">
              {deps.map((d) => MODULES.find((m) => m.id === d)?.label ?? d).join(', ')}
            </span>
          </div>
        )}
      </div>

      {/* ── Footer: Addons Accordion & Action Buttons ── */}
      <div className="mt-4 pt-3 border-t border-border-subtle">
        {/* Sub-Addons if present */}
        {modulo.addons && modulo.addons.length > 0 && (
          <div className="mb-3">
            <button
              type="button"
              onClick={() => setExpandidoAddons(!expandidoAddons)}
              className="w-full flex items-center justify-between text-xs font-semibold text-text-muted hover:text-text transition-colors cursor-pointer py-1"
            >
              <span className="flex items-center gap-1">
                <span>Complementos ({modulo.addons.length})</span>
              </span>
              {expandidoAddons ? (
                <ChevronUp className="w-3.5 h-3.5" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5" />
              )}
            </button>

            {expandidoAddons && (
              <div className="mt-2 space-y-2 pt-1 border-t border-border-subtle">
                {modulo.addons.map((addon) => {
                  const activo = isAddonEnabled ? isAddonEnabled(addon.key) : false
                  const esAddonPlanificado = addon.availability === 'planificado'

                  return (
                    <div
                      key={addon.key}
                      className="flex items-center justify-between gap-2.5 p-2 rounded-xl bg-surface-subtle border border-border-subtle text-xs"
                    >
                      <div className="pr-1 min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="font-semibold text-text truncate">
                            {addon.label}
                          </span>
                          {esAddonPlanificado && (
                            <span className="text-[9px] uppercase tracking-wider text-text-muted font-bold">
                              Próximamente
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-text-muted mt-0.5 line-clamp-1">
                          {addon.description}
                        </p>
                      </div>

                      <div className="shrink-0">
                        <Switch
                          checked={activo}
                          disabled={!estaHabilitado || esAddonPlanificado}
                          onChange={() => onToggleAddon?.(addon.key)}
                          size="sm"
                          aria-label={`Activar complemento ${addon.label}`}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {/* Direct Action Toolbar */}
        <div className="flex items-center justify-between gap-2">
          {onVerDetalles ? (
            <button
              type="button"
              onClick={() => onVerDetalles(modulo)}
              className="text-xs font-semibold text-text-muted hover:text-text transition-colors cursor-pointer"
            >
              Ficha Técnica
            </button>
          ) : (
            <span className="text-[11px] text-text-muted">
              Plan {PLAN_LABEL[modulo.minPlan]}
            </span>
          )}

          {targetRoute && estaHabilitado && !planInsuficiente && !esPlanificado && (
            <button
              type="button"
              onClick={handleConfigurar}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold bg-surface-subtle hover:bg-surface border border-border hover:border-primary/40 text-text hover:text-primary transition-all cursor-pointer shadow-2xs"
            >
              <Settings className="w-3.5 h-3.5 text-primary" />
              <span>Configurar</span>
              <ArrowUpRight className="w-3 h-3 text-text-muted ml-0.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

