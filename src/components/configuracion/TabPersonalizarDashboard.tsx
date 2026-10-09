import { useState } from 'react'
import {
  LayoutDashboard,
  ArrowUp,
  ArrowDown,
  RotateCcw,
  Check,
  Sparkles,
} from 'lucide-react'
import {
  DASHBOARD_WIDGETS,
  DashboardWidgetId,
  getWidgetPreferences,
  saveWidgetPreferences,
  getWidgetOrder,
  saveWidgetOrder,
  resetWidgetConfig,
} from '@/components/dashboard/dashboardConfig'
import { Button, Switch, Badge } from '@/components/ui'
import { useToast } from '@/hooks/useToast'

export function TabPersonalizarDashboard() {
  const { toast } = useToast()

  const [widgetPrefs, setWidgetPrefs] = useState<Record<DashboardWidgetId, boolean>>(() => {
    return getWidgetPreferences()
  })

  const [widgetOrder, setWidgetOrder] = useState<DashboardWidgetId[]>(() => {
    return getWidgetOrder()
  })

  const handleToggle = (id: DashboardWidgetId, visible: boolean) => {
    const updated = { ...widgetPrefs, [id]: visible }
    setWidgetPrefs(updated)
    saveWidgetPreferences(updated)
    toast.success('Preferencia guardada', `Visibilidad del widget actualizada.`)
  }

  const handleMove = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1
    if (targetIndex < 0 || targetIndex >= widgetOrder.length) return

    const newOrder = [...widgetOrder]
    const temp = newOrder[index]
    newOrder[index] = newOrder[targetIndex]
    newOrder[targetIndex] = temp

    setWidgetOrder(newOrder)
    saveWidgetOrder(newOrder)
    toast.success('Orden actualizado', `El widget fue desplazado ${direction === 'up' ? 'hacia arriba' : 'hacia abajo'}.`)
  }

  const handleReset = () => {
    const { prefs, order } = resetWidgetConfig()
    setWidgetPrefs(prefs)
    setWidgetOrder(order)
    toast.info('Dashboard restablecido', 'Se restauró el orden y visibilidad predeterminados de los widgets.')
  }

  // Mapa rápido de metadatos de widgets por ID
  const widgetMetaMap = new Map(DASHBOARD_WIDGETS.map((w) => [w.id, w]))

  return (
    <div className="space-y-6">
      {/* ── Encabezado & Acciones ── */}
      <div className="card p-6 border border-border bg-surface space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="font-bold text-base text-text flex items-center gap-2">
              <LayoutDashboard className="w-5 h-5 text-primary" />
              Personalización del Centro de Mando
            </h3>
            <p className="text-xs text-text-muted mt-1 leading-relaxed">
              Configura los bloques informativos de tu pantalla principal. Muestra u oculta widgets y reorganiza su orden de visualización.
            </p>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={handleReset}
            leftIcon={<RotateCcw className="w-4 h-4" />}
          >
            Restaurar Predeterminados
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* ── Lista Reordenable de Widgets (Izq) ── */}
        <div className="lg:col-span-7 space-y-3">
          <span className="text-[11px] font-bold uppercase tracking-wider text-text-muted block px-1">
            Widgets Activos en el Dashboard (Usa las flechas para reordenar)
          </span>

          {widgetOrder.map((widgetId, index) => {
            const meta = widgetMetaMap.get(widgetId)
            if (!meta) return null

            const isVisible = widgetPrefs[widgetId] ?? true
            const isFirst = index === 0
            const isLast = index === widgetOrder.length - 1

            return (
              <div
                key={widgetId}
                className={[
                  'card p-4 border transition-all flex items-center justify-between gap-3 select-none',
                  isVisible
                    ? 'border-border bg-surface hover:border-primary/40'
                    : 'border-border/60 bg-surface/50 opacity-60',
                ].join(' ')}
              >
                {/* Controles de orden */}
                <div className="flex flex-col gap-0.5 shrink-0">
                  <button
                    type="button"
                    disabled={isFirst}
                    onClick={() => handleMove(index, 'up')}
                    className="p-1 rounded text-text-muted hover:text-text hover:bg-surface-subtle disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer"
                    title="Subir widget"
                    aria-label={`Mover ${meta.title} hacia arriba`}
                  >
                    <ArrowUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    disabled={isLast}
                    onClick={() => handleMove(index, 'down')}
                    className="p-1 rounded text-text-muted hover:text-text hover:bg-surface-subtle disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer"
                    title="Bajar widget"
                    aria-label={`Mover ${meta.title} hacia abajo`}
                  >
                    <ArrowDown className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Número de posición */}
                <span className="font-mono text-xs font-bold text-text-muted w-5 text-center shrink-0">
                  #{index + 1}
                </span>

                {/* Información del Widget */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-xs text-text truncate">
                      {meta.title}
                    </h4>
                    {isVisible ? (
                      <Badge variant="success" size="sm">
                        Visible
                      </Badge>
                    ) : (
                      <Badge variant="default" size="sm">
                        Oculto
                      </Badge>
                    )}
                  </div>
                  <p className="text-[11px] text-text-muted mt-0.5 line-clamp-2">
                    {meta.description}
                  </p>
                </div>

                {/* Switch de visibilidad */}
                <div className="shrink-0 flex items-center gap-2 pl-2 border-l border-border-subtle">
                  <Switch
                    checked={isVisible}
                    onChange={(checked) => handleToggle(widgetId, checked)}
                    label=""
                    aria-label={`Mostrar u ocultar ${meta.title}`}
                  />
                </div>
              </div>
            )
          })}
        </div>

        {/* ── Previsualizador de Estructura de Pantalla (Der) ── */}
        <div className="lg:col-span-5 sticky top-20 card p-5 border border-border bg-surface space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-border">
            <h4 className="font-bold text-xs text-text flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-primary" />
              Vista Previa de la Pantalla Principal
            </h4>
            <span className="text-[10px] text-text-muted font-mono">
              {widgetOrder.filter((id) => widgetPrefs[id] ?? true).length} activos
            </span>
          </div>

          <div className="space-y-2 p-3 bg-surface-subtle/50 rounded-xl border border-border/80">
            {/* Hero Banner Mock */}
            <div className="p-2 rounded-lg bg-primary-soft/30 border border-primary/20 flex items-center justify-between text-[11px] font-semibold text-primary">
              <span>Resumen Hero & Saludo al Dueño</span>
              <span className="text-[9px] uppercase px-1.5 py-0.2 rounded bg-primary text-white font-mono">Fijo</span>
            </div>

            {/* Widgets dinámicos renderizados según orden */}
            {widgetOrder.map((widgetId, i) => {
              const meta = widgetMetaMap.get(widgetId)
              const isVisible = widgetPrefs[widgetId] ?? true
              if (!isVisible) return null

              return (
                <div
                  key={widgetId}
                  className="p-2.5 rounded-lg bg-surface border border-border flex items-center justify-between text-xs animate-fade-in shadow-2xs"
                >
                  <span className="font-medium text-text flex items-center gap-2 truncate">
                    <span className="w-4 h-4 rounded-full bg-surface-subtle font-mono text-[10px] flex items-center justify-center font-bold text-text-muted">
                      {i + 1}
                    </span>
                    <span className="truncate">{meta?.title}</span>
                  </span>
                  <Check className="w-3.5 h-3.5 text-success shrink-0" />
                </div>
              )
            })}
          </div>

          <p className="text-[11px] text-text-muted leading-relaxed">
            Los cambios se guardan automáticamente y se aplican de inmediato en tu próxima visita al Panel Principal.
          </p>
        </div>
      </div>
    </div>
  )
}

