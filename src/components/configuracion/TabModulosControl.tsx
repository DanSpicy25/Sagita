import { useState, useMemo } from 'react'
import {
  Blocks,
  Lock,
  CheckCircle2,
  Sparkles,
  Layers,
  ShieldAlert,
  Search,
} from 'lucide-react'
import { useModules } from '@/hooks/useModules'
import { useTenant } from '@/context/TenantContext'
import {
  MODULES,
  MODULE_CATEGORIES,
  MODULE_ICONS,
  PLAN_LABEL,
  PLAN_ORDER,
} from '@/config/modules'
import type { ModuleCategory, ModuleDefinition, ModuleId } from '@/types'
import { Badge, Switch } from '@/components/ui'
import { useToast } from '@/hooks/useToast'

type EstadoModulo = 'active' | 'available' | 'disabled' | 'restricted'

export function TabModulosControl() {
  const {
    isModuleEnabled,
    toggleModule,
    resetToDefaults,
  } = useModules()

  const { tenantActivo } = useTenant()
  const { toast } = useToast()

  const [categoria, setCategoria] = useState<ModuleCategory | 'todas'>('todas')
  const [filtroEstado, setFiltroEstado] = useState<EstadoModulo | 'todos'>('todos')
  const [busqueda, setBusqueda] = useState('')

  const planTenant = tenantActivo?.plan ?? 'starter'
  const planTenantLevel = PLAN_ORDER[planTenant] ?? 0

  // Clasificación de cada módulo en uno de los 4 estados contractuales
  const modulosConEstado = useMemo(() => {
    return MODULES.map((mod) => {
      const requiredLevel = PLAN_ORDER[mod.minPlan] ?? 0
      const isRestrictedByPlan = planTenantLevel < requiredLevel
      const isCurrentlyEnabled = isModuleEnabled(mod.id)

      let estadoFinal: EstadoModulo
      if (isRestrictedByPlan) {
        estadoFinal = 'restricted'
      } else if (isCurrentlyEnabled) {
        estadoFinal = 'active'
      } else {
        estadoFinal = 'available'
      }

      return {
        ...mod,
        estado: estadoFinal,
      }
    })
  }, [isModuleEnabled, planTenantLevel])

  // Contadores para métricas de resumen
  const stats = useMemo(() => {
    const total = modulosConEstado.length
    const activos = modulosConEstado.filter((m) => m.estado === 'active').length
    const disponibles = modulosConEstado.filter((m) => m.estado === 'available').length
    const restringidos = modulosConEstado.filter((m) => m.estado === 'restricted').length
    return { total, activos, disponibles, restringidos }
  }, [modulosConEstado])

  // Filtrado reactivo
  const modulosFiltrados = useMemo(() => {
    return modulosConEstado.filter((m) => {
      if (categoria !== 'todas' && m.category !== categoria) return false
      if (filtroEstado !== 'todos' && m.estado !== filtroEstado) return false
      if (busqueda.trim()) {
        const q = busqueda.toLowerCase().trim()
        const matchTitle = m.label.toLowerCase().includes(q)
        const matchDesc = m.description.toLowerCase().includes(q)
        const matchId = m.id.toLowerCase().includes(q)
        if (!matchTitle && !matchDesc && !matchId) return false
      }
      return true
    })
  }, [modulosConEstado, categoria, filtroEstado, busqueda])

  const handleToggle = (mod: ModuleDefinition & { estado: EstadoModulo }) => {
    if (mod.core) {
      toast.info('Módulo Esencial', 'Este módulo es parte del núcleo de Sagitta y no puede desactivarse.')
      return
    }
    if (mod.estado === 'restricted') {
      toast.warning(
        'Módulo Restringido',
        `Este módulo requiere el Plan ${PLAN_LABEL[mod.minPlan]} o superior. Tu sucursal cuenta actualmente con el Plan ${PLAN_LABEL[planTenant]}.`
      )
      return
    }
    toggleModule(mod.id as ModuleId)
    toast.success(
      mod.estado === 'active' ? 'Módulo desactivado' : 'Módulo activado',
      `El módulo ${mod.label} ha sido actualizado en tu perfil de negocio.`
    )
  }

  const renderBadgeEstado = (estado: EstadoModulo, minPlan: string) => {
    switch (estado) {
      case 'active':
        return (
          <Badge variant="success" size="sm">
            <span className="flex items-center gap-1 font-semibold">
              <CheckCircle2 className="w-3 h-3" />
              Activo
            </span>
          </Badge>
        )
      case 'available':
        return (
          <Badge variant="info" size="sm">
            <span className="flex items-center gap-1 font-semibold">
              <Sparkles className="w-3 h-3" />
              Disponible
            </span>
          </Badge>
        )
      case 'restricted':
        return (
          <Badge variant="warning" size="sm">
            <span className="flex items-center gap-1 font-semibold">
              <Lock className="w-3 h-3" />
              Plan {PLAN_LABEL[minPlan as keyof typeof PLAN_LABEL] ?? minPlan}
            </span>
          </Badge>
        )
      case 'disabled':
        return (
          <Badge variant="default" size="sm">
            Desactivado
          </Badge>
        )
    }
  }

  return (
    <div className="space-y-6">
      {/* ── Banner de Control y Métricas ── */}
      <div className="card p-6 border border-border bg-surface space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-base text-text flex items-center gap-2">
                <Blocks className="w-5 h-5 text-primary" />
                Matriz de Módulos & Capacidades
              </h3>
              <Badge variant="primary" size="sm">
                Plan {PLAN_LABEL[planTenant]}
              </Badge>
            </div>
            <p className="text-xs text-text-muted mt-1 leading-relaxed">
              Administra qué funciones operan en tu sucursal. Activa o desactiva capacidades según el flujo operativo de tu negocio.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={resetToDefaults}
              className="text-xs font-semibold text-text-muted hover:text-primary transition-colors cursor-pointer"
            >
              Restablecer Valores
            </button>
          </div>
        </div>

        {/* Cuadrícula de Métricas de Módulos */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
          <div className="p-3 rounded-xl bg-surface-subtle border border-border">
            <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted block">
              Módulos Activos
            </span>
            <div className="flex items-baseline gap-1.5 mt-1">
              <span className="text-xl font-bold font-mono text-success">{stats.activos}</span>
              <span className="text-xs text-text-muted">de {stats.total}</span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-surface-subtle border border-border">
            <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted block">
              Disponibles
            </span>
            <div className="flex items-baseline gap-1.5 mt-1">
              <span className="text-xl font-bold font-mono text-info">{stats.disponibles}</span>
              <span className="text-xs text-text-muted">listos para usar</span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-surface-subtle border border-border">
            <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted block">
              Restringidos por Plan
            </span>
            <div className="flex items-baseline gap-1.5 mt-1">
              <span className="text-xl font-bold font-mono text-warning">{stats.restringidos}</span>
              <span className="text-xs text-text-muted">bloqueados</span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-surface-subtle border border-border">
            <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted block">
              Núcleo Esencial (Core)
            </span>
            <div className="flex items-baseline gap-1.5 mt-1">
              <span className="text-xl font-bold font-mono text-primary">
                {modulosConEstado.filter((m) => m.core).length}
              </span>
              <span className="text-xs text-text-muted">siempre activos</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Filtros por Categoría, Estado y Búsqueda ── */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-text-muted absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Buscar módulo por nombre o clave..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="input-base pl-9 text-xs py-2 w-full"
          />
        </div>

        {/* Filtros de Estado */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          {[
            { id: 'todos', label: 'Todos' },
            { id: 'active', label: 'Activos' },
            { id: 'available', label: 'Disponibles' },
            { id: 'restricted', label: 'Restringidos' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setFiltroEstado(item.id as EstadoModulo | 'todos')}
              className={[
                'px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer',
                filtroEstado === item.id
                  ? 'bg-primary text-white shadow-2xs'
                  : 'bg-surface text-text-muted hover:bg-surface-subtle border border-border',
              ].join(' ')}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Selector de Categorías */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-border text-xs">
        <button
          type="button"
          onClick={() => setCategoria('todas')}
          className={[
            'px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors cursor-pointer',
            categoria === 'todas'
              ? 'bg-surface-subtle text-primary font-bold'
              : 'text-text-muted hover:text-text',
          ].join(' ')}
        >
          Todas las categorías
        </button>
        {MODULE_CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            type="button"
            onClick={() => setCategoria(cat.id)}
            className={[
              'px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors cursor-pointer capitalize',
              categoria === cat.id
                ? 'bg-surface-subtle text-primary font-bold'
                : 'text-text-muted hover:text-text',
            ].join(' ')}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* ── Rejilla de Módulos (Legítimos, sin mocks fabricados) ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {modulosFiltrados.map((mod) => {
          const IconComponent = MODULE_ICONS[mod.id] || Layers
          const isRestricted = mod.estado === 'restricted'
          const isActive = mod.estado === 'active'

          return (
            <div
              key={mod.id}
              className={[
                'card p-4 sm:p-5 border transition-all flex flex-col justify-between space-y-3',
                isRestricted
                  ? 'border-border/60 bg-surface/50 opacity-80'
                  : isActive
                  ? 'border-primary/40 bg-surface hover:shadow-card'
                  : 'border-border bg-surface hover:border-border-hover',
              ].join(' ')}
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div
                      className={[
                        'w-10 h-10 rounded-xl flex items-center justify-center shrink-0',
                        isActive
                          ? 'bg-primary-soft text-primary'
                          : isRestricted
                          ? 'bg-warning-soft/30 text-warning'
                          : 'bg-surface-subtle text-text-muted',
                      ].join(' ')}
                    >
                      <IconComponent className="w-5 h-5" />
                    </div>

                    <div>
                      <h4 className="font-bold text-sm text-text flex items-center gap-1.5">
                        {mod.label}
                        {mod.core && (
                          <span className="text-[10px] font-semibold text-primary bg-primary-soft/40 px-1.5 py-0.2 rounded">
                            Core
                          </span>
                        )}
                      </h4>
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-text-muted/80 block">
                        {mod.category}
                      </span>
                    </div>
                  </div>

                  <div className="shrink-0 flex items-center gap-2">
                    {renderBadgeEstado(mod.estado, mod.minPlan)}
                    <Switch
                      checked={isActive}
                      disabled={mod.core || isRestricted}
                      onChange={() => handleToggle(mod)}
                      label=""
                      aria-label={`Activar o desactivar módulo ${mod.label}`}
                    />
                  </div>
                </div>

                <p className="text-xs text-text-muted mt-2.5 leading-relaxed">
                  {mod.description}
                </p>

                {/* Etiquetas de Capacidades */}
                {mod.capabilities && mod.capabilities.length > 0 && (
                  <div className="flex flex-wrap items-center gap-1.5 mt-3 pt-3 border-t border-border-subtle">
                    {mod.capabilities.map((cap) => (
                      <span
                        key={cap}
                        className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-surface-subtle text-text-muted border border-border/40"
                      >
                        {cap}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Pie de Módulo */}
              <div className="flex items-center justify-between text-[11px] text-text-muted pt-2 border-t border-border-subtle">
                <span className="font-mono text-[10px]">
                  ID: #{mod.id}
                </span>

                {isRestricted ? (
                  <span className="text-warning flex items-center gap-1 font-semibold text-[10px]">
                    <ShieldAlert className="w-3 h-3" /> Requiere Plan {PLAN_LABEL[mod.minPlan]}
                  </span>
                ) : (
                  <span className="text-text-muted text-[10px]">
                    Disponibilidad: {mod.availability}
                  </span>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

