import { useState } from 'react'
import {
  Sparkles,
  CheckCircle2,
  Circle,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  X,
} from 'lucide-react'
import { ONBOARDING_STEPS, OnboardingStepId } from './onboardingTypes'
import { useOnboarding } from './useOnboarding'
import { Button } from '@/components/ui'

export interface OnboardingChecklistWidgetProps {
  onOpenWizard: (step?: OnboardingStepId) => void
  className?: string
}

export function OnboardingChecklistWidget({
  onOpenWizard,
  className = '',
}: OnboardingChecklistWidgetProps) {
  const {
    data,
    completedCount,
    totalSteps,
    progressPercentage,
    isCompleted,
    isDismissed,
    dismissOnboarding,
  } = useOnboarding()

  const [isExpanded, setIsExpanded] = useState(false)

  // Si el usuario descartó el widget y no está forzado a verse, no renderizar nada (progressive disclosure)
  if (isDismissed && !isCompleted) return null

  // Si está 100% completado, solo mostrar una tarjeta discreta o nada si fue descartado
  if (isCompleted && isDismissed) return null

  return (
    <section
      aria-label="Progreso de Configuración Inicial de Sagitta"
      className={`rounded-2xl border border-primary/20 bg-gradient-to-r from-primary/5 via-surface to-surface-elevated p-4 sm:p-5 shadow-xs transition-all ${className}`}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Lado izquierdo: Título y progreso */}
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-1 rounded-lg bg-primary-soft text-primary">
              <Sparkles className="w-4 h-4" />
            </span>
            <h3 className="text-sm font-bold text-text">
              {isCompleted
                ? '¡Tu negocio está configurado al 100%!'
                : 'Guía de Configuración Inicial'}
            </h3>
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
              {completedCount} de {totalSteps} pasos
            </span>
          </div>

          <p className="text-xs text-text-muted">
            {isCompleted
              ? 'Has completado los pasos clave para operar. Puedes modificar cualquier ajuste en el menú Configuración.'
              : 'Completa estos pasos básicos para habilitar reservas online, control de inventario y punto de venta.'}
          </p>
        </div>

        {/* Lado derecho: Acciones y botón principal */}
        <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-xs text-text-muted hover:text-text font-medium flex items-center gap-1 px-2.5 py-1.5 rounded-lg hover:bg-surface-subtle transition-colors"
          >
            <span>{isExpanded ? 'Ocultar pasos' : 'Ver pasos'}</span>
            {isExpanded ? (
              <ChevronUp className="w-3.5 h-3.5" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5" />
            )}
          </button>

          {!isCompleted && (
            <Button
              size="xs"
              onClick={() => onOpenWizard()}
              className="gap-1.5 font-semibold text-xs shadow-xs"
            >
              <span>Continuar asistente</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          )}

          <button
            type="button"
            onClick={dismissOnboarding}
            className="p-1.5 text-text-muted hover:text-text rounded-lg hover:bg-surface-subtle transition-colors"
            title="Ocultar guía del panel"
            aria-label="Ocultar guía"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Barra de Progreso Lineal */}
      <div className="mt-3 w-full h-1.5 bg-surface-subtle rounded-full overflow-hidden border border-border/40">
        <div
          className="h-full bg-primary transition-all duration-300 rounded-full"
          style={{ width: `${progressPercentage}%` }}
        />
      </div>

      {/* Lista Desplegable de Pasos */}
      {isExpanded && (
        <div className="mt-4 pt-3 border-t border-border/60 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 animate-slide-up">
          {ONBOARDING_STEPS.map((step) => {
            const isDone = data.completedSteps[step.id]
            return (
              <button
                key={step.id}
                onClick={() => onOpenWizard(step.id)}
                className={`p-2.5 rounded-xl border text-left transition-all flex items-start gap-2.5 ${
                  isDone
                    ? 'bg-surface border-border hover:border-primary/40'
                    : 'bg-surface-subtle/80 border-border/80 hover:border-primary'
                }`}
              >
                <div className="mt-0.5 shrink-0">
                  {isDone ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  ) : (
                    <Circle className="w-4 h-4 text-text-muted" />
                  )}
                </div>

                <div className="min-w-0">
                  <span
                    className={`text-xs block leading-tight font-semibold truncate ${
                      isDone ? 'text-text' : 'text-text font-medium'
                    }`}
                  >
                    {step.numero}. {step.titulo}
                  </span>
                  <span className="text-[10px] text-text-muted block truncate mt-0.5">
                    {step.subtitulo}
                  </span>
                </div>
              </button>
            )
          })}
        </div>
      )}
    </section>
  )
}

