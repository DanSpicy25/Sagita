import { useNavigate } from 'react-router-dom'
import {
  Check,
  Layers,
  ArrowUpRight,
} from 'lucide-react'
import { ModuleDefinition, TenantPlan } from '@/types'
import {
  MODULE_ICONS,
  MODULES,
  PLAN_LABEL,
  PLAN_ORDER,
  getTechnicalRequirements,
  getTechnicalDependents,
} from '@/config/modules'
import { Modal, Button, Badge } from '@/components/ui'

export interface ModalDetalleModuloProps {
  isOpen: boolean
  onClose: () => void
  modulo: ModuleDefinition | null
  estaHabilitado: boolean
  planTenant: TenantPlan
  onToggle: () => void
}

export function ModalDetalleModulo({
  isOpen,
  onClose,
  modulo,
  estaHabilitado,
  planTenant,
  onToggle,
}: ModalDetalleModuloProps) {
  const navigate = useNavigate()

  if (!modulo) return null

  const IconComponent = MODULE_ICONS[modulo.id] || Layers
  const currentPlanLevel = PLAN_ORDER[planTenant] ?? 0
  const requiredPlanLevel = PLAN_ORDER[modulo.minPlan] ?? 0
  const planInsuficiente = currentPlanLevel < requiredPlanLevel
  const esCore = modulo.core
  const esPlanificado = modulo.availability === 'planificado'

  const reqs = getTechnicalRequirements(modulo.id)
  const deps = getTechnicalDependents(modulo.id)
  const targetRoute = modulo.configRoute || modulo.route

  const handleIrAConfigurar = () => {
    onClose()
    if (targetRoute) {
      navigate(targetRoute)
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Ficha Técnica: ${modulo.label}`}
      size="lg"
    >
      <div className="p-6 space-y-6">
        {/* ── Cabecera de Módulo ── */}
        <div className="flex items-start gap-4 p-4 rounded-2xl bg-surface-subtle border border-border">
          <div className="w-12 h-12 rounded-2xl bg-primary text-white flex items-center justify-center shrink-0 shadow-sm">
            <IconComponent className="w-6 h-6" />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-bold text-text text-lg">{modulo.label}</h3>

              {esCore && (
                <Badge variant="outline" size="sm">
                  NÚCLEO
                </Badge>
              )}

              {esPlanificado ? (
                <Badge variant="default" size="sm">
                  En Hoja de Ruta
                </Badge>
              ) : planInsuficiente ? (
                <Badge variant="warning" size="sm">
                  Requiere Plan {PLAN_LABEL[modulo.minPlan]}
                </Badge>
              ) : estaHabilitado ? (
                <Badge variant="success" size="sm">
                  Activo en Sucursal
                </Badge>
              ) : (
                <Badge variant="info" size="sm">
                  Disponible para Activar
                </Badge>
              )}
            </div>

            <p className="text-xs text-text-muted mt-1 leading-relaxed">
              {modulo.description}
            </p>
          </div>
        </div>

        {/* ── Especificaciones de Arquitectura ── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-3 rounded-xl border border-border bg-surface">
            <span className="text-[10px] uppercase font-bold text-text-muted block">
              Disponibilidad
            </span>
            <span className="font-semibold text-text mt-0.5 block capitalize">
              {modulo.availability === 'disponible'
                ? 'Operativa'
                : modulo.availability === 'parcial'
                ? 'Parcial / Beta'
                : 'En Hoja de Ruta'}
            </span>
          </div>

          <div className="p-3 rounded-xl border border-border bg-surface">
            <span className="text-[10px] uppercase font-bold text-text-muted block">
              Plan Mínimo
            </span>
            <span className="font-semibold text-text mt-0.5 block">
              {PLAN_LABEL[modulo.minPlan]}
            </span>
          </div>

          <div className="p-3 rounded-xl border border-border bg-surface">
            <span className="text-[10px] uppercase font-bold text-text-muted block">
              Capa de Datos
            </span>
            <span className="font-semibold text-text mt-0.5 block">
              {modulo.backend === 'frontend_ready'
                ? 'Frontend Ready'
                : modulo.backend === 'mock'
                ? 'Persistencia Local'
                : modulo.backend === 'integration_required'
                ? 'API Externa'
                : 'Próximo Backend'}
            </span>
          </div>

          <div className="p-3 rounded-xl border border-border bg-surface">
            <span className="text-[10px] uppercase font-bold text-text-muted block">
              Permiso RBAC
            </span>
            <code className="text-[11px] font-mono text-primary font-bold mt-0.5 block truncate">
              {modulo.permission || 'Público'}
            </code>
          </div>
        </div>

        {/* ── Capacidades Funcionales ── */}
        <div className="space-y-2.5">
          <h4 className="text-xs font-bold text-text uppercase tracking-wider">
            Capacidades Funcionales Incluidas ({modulo.capabilities.length})
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {modulo.capabilities.map((cap, i) => (
              <div
                key={i}
                className="flex items-center gap-2 p-2.5 rounded-xl bg-surface-subtle border border-border-subtle text-xs"
              >
                <div className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 flex items-center justify-center shrink-0">
                  <Check className="w-3 h-3" />
                </div>
                <span className="text-text font-medium">{cap}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── Dependencias del Sistema ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-border">
          <div>
            <h4 className="text-xs font-bold text-text uppercase tracking-wider mb-2">
              Dependencias Requeridas
            </h4>
            {reqs.length === 0 ? (
              <p className="text-xs text-text-muted italic">
                Ninguna dependencia previa requerida.
              </p>
            ) : (
              <div className="flex flex-wrap gap-1.5">
                {reqs.map((r) => {
                  const reqMod = MODULES.find((m) => m.id === r)
                  return (
                    <span
                      key={r}
                      className="text-xs px-2.5 py-1 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-900/50 font-medium"
                    >
                      {reqMod?.label || r}
                    </span>
                  )
                })}
              </div>
            )}
          </div>

          <div>
            <h4 className="text-xs font-bold text-text uppercase tracking-wider mb-2">
              Módulos que dependen de este
            </h4>
            {deps.length === 0 ? (
              <p className="text-xs text-text-muted italic">
                Ningún otro módulo depende obligatoriamente de este.
              </p>
            ) : (
              <div className="flex flex-wrap gap-1.5">
                {deps.map((d) => {
                  const depMod = MODULES.find((m) => m.id === d)
                  return (
                    <span
                      key={d}
                      className="text-xs px-2.5 py-1 rounded-lg bg-surface-subtle text-text border border-border font-medium"
                    >
                      {depMod?.label || d}
                    </span>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        {/* ── Footer / Acciones ── */}
        <div className="pt-4 border-t border-border flex items-center justify-between gap-3">
          <Button variant="outline" onClick={onClose}>
            Cerrar
          </Button>

          <div className="flex items-center gap-2">
            {!esCore && !esPlanificado && !planInsuficiente && (
              <Button
                variant={estaHabilitado ? 'outline' : 'primary'}
                onClick={() => {
                  onToggle()
                }}
              >
                {estaHabilitado ? 'Desactivar Módulo' : 'Activar Módulo'}
              </Button>
            )}

            {targetRoute && estaHabilitado && (
              <Button
                variant="primary"
                onClick={handleIrAConfigurar}
                rightIcon={<ArrowUpRight className="w-4 h-4" />}
              >
                Ir a Configuración
              </Button>
            )}
          </div>
        </div>
      </div>
    </Modal>
  )
}

