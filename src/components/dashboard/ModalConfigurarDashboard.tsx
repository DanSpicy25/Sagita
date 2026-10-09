import { useState } from 'react'
import { RotateCcw, ArrowUp, ArrowDown } from 'lucide-react'
import { Modal, Switch, Button, Badge } from '@/components/ui'
import {
  DASHBOARD_WIDGETS,
  DashboardWidgetId,
  saveWidgetPreferences,
  getWidgetOrder,
  saveWidgetOrder,
  resetWidgetConfig,
} from './dashboardConfig'

export interface ModalConfigurarDashboardProps {
  isOpen: boolean
  onClose: () => void
  preferences: Record<DashboardWidgetId, boolean>
  onSavePreferences: (newPrefs: Record<DashboardWidgetId, boolean>) => void
  onSaveOrder?: (newOrder: DashboardWidgetId[]) => void
}

export function ModalConfigurarDashboard({
  isOpen,
  onClose,
  preferences,
  onSavePreferences,
  onSaveOrder,
}: ModalConfigurarDashboardProps) {
  const [localPrefs, setLocalPrefs] = useState<Record<DashboardWidgetId, boolean>>({
    ...preferences,
  })

  const [localOrder, setLocalOrder] = useState<DashboardWidgetId[]>(() => {
    return getWidgetOrder()
  })

  const toggleWidget = (id: DashboardWidgetId, checked: boolean) => {
    setLocalPrefs((prev) => ({
      ...prev,
      [id]: checked,
    }))
  }

  const handleMove = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1
    if (targetIndex < 0 || targetIndex >= localOrder.length) return

    const newOrder = [...localOrder]
    const temp = newOrder[index]
    newOrder[index] = newOrder[targetIndex]
    newOrder[targetIndex] = temp
    setLocalOrder(newOrder)
  }

  const handleReset = () => {
    const { prefs, order } = resetWidgetConfig()
    setLocalPrefs(prefs)
    setLocalOrder(order)
  }

  const handleSave = () => {
    saveWidgetPreferences(localPrefs)
    saveWidgetOrder(localOrder)
    onSavePreferences(localPrefs)
    onSaveOrder?.(localOrder)
    onClose()
  }

  const widgetMap = new Map(DASHBOARD_WIDGETS.map((w) => [w.id, w]))

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Personalizar Centro de Mando"
      description="Configura qué bloques informativos y paneles deseas ver y reordénalos a tu gusto."
      size="md"
      footer={
        <div className="flex items-center justify-between w-full">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleReset}
            leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
          >
            Restablecer
          </Button>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={onClose}>
              Cancelar
            </Button>
            <Button variant="primary" size="sm" onClick={handleSave}>
              Guardar Cambios
            </Button>
          </div>
        </div>
      }
    >
      <div className="space-y-3 py-1">
        {localOrder.map((widgetId, index) => {
          const w = widgetMap.get(widgetId)
          if (!w) return null

          const isChecked = localPrefs[w.id] ?? true
          const isFirst = index === 0
          const isLast = index === localOrder.length - 1

          return (
            <div
              key={w.id}
              className={[
                'flex items-center justify-between p-3 rounded-xl border transition-colors gap-3 select-none',
                isChecked
                  ? 'border-border bg-surface hover:bg-surface-subtle/50'
                  : 'border-border/60 bg-surface/50 opacity-60',
              ].join(' ')}
            >
              {/* Controles de orden */}
              <div className="flex flex-col gap-0.5 shrink-0">
                <button
                  type="button"
                  disabled={isFirst}
                  onClick={() => handleMove(index, 'up')}
                  className="p-1 rounded text-text-muted hover:text-text hover:bg-surface-subtle disabled:opacity-25 disabled:pointer-events-none transition-colors cursor-pointer"
                  title="Mover arriba"
                  aria-label={`Mover ${w.title} arriba`}
                >
                  <ArrowUp className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  disabled={isLast}
                  onClick={() => handleMove(index, 'down')}
                  className="p-1 rounded text-text-muted hover:text-text hover:bg-surface-subtle disabled:opacity-25 disabled:pointer-events-none transition-colors cursor-pointer"
                  title="Mover abajo"
                  aria-label={`Mover ${w.title} abajo`}
                >
                  <ArrowDown className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-semibold text-text block leading-tight">
                    {w.title}
                  </span>
                  {isChecked ? (
                    <Badge variant="success" size="sm">
                      Activo
                    </Badge>
                  ) : (
                    <Badge variant="default" size="sm">
                      Oculto
                    </Badge>
                  )}
                </div>
                <span className="text-[11px] text-text-muted block mt-0.5 leading-snug">
                  {w.description}
                </span>
              </div>

              <div className="shrink-0 pl-2 border-l border-border-subtle">
                <Switch
                  checked={isChecked}
                  onChange={(checked) => toggleWidget(w.id, checked)}
                  label=""
                  aria-label={`Mostrar u ocultar ${w.title}`}
                />
              </div>
            </div>
          )
        })}
      </div>
    </Modal>
  )
}
