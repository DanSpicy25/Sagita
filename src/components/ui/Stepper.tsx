import { Check } from 'lucide-react'

export interface Step {
  id: number
  title: string
  subtitle?: string
}

interface StepperProps {
  steps: Step[]
  currentStep: number
  onStepClick?: (stepId: number) => void
}

export function Stepper({ steps, currentStep, onStepClick }: StepperProps) {
  return (
    <div className="w-full py-4">
      <div className="flex items-center justify-between relative">
        {/* Línea conectora de fondo */}
        <div className="absolute top-1/2 left-0 right-0 h-0.5 -translate-y-1/2 bg-slate-200 dark:bg-slate-700 z-0" />

        {steps.map((step) => {
          const isCompleted = step.id < currentStep
          const isCurrent = step.id === currentStep
          const isClickable = onStepClick && step.id <= currentStep

          return (
            <div
              key={step.id}
              className="relative z-10 flex flex-col items-center group cursor-default"
              onClick={() => isClickable && onStepClick(step.id)}
            >
              <div
                className={[
                  'w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm transition-all duration-200 border-2',
                  isCompleted
                    ? 'bg-primary-600 border-primary-600 text-white shadow-sm'
                    : isCurrent
                    ? 'bg-white dark:bg-slate-900 border-primary-600 text-primary-600 ring-4 ring-primary-100 dark:ring-primary-950'
                    : 'bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-600 text-slate-400',
                  isClickable ? 'cursor-pointer' : '',
                ].join(' ')}
              >
                {isCompleted ? <Check className="w-5 h-5" /> : step.id}
              </div>
              <div className="mt-2 text-center">
                <p
                  className={[
                    'text-xs font-semibold whitespace-nowrap',
                    isCurrent
                      ? 'text-primary-600 dark:text-primary-400'
                      : isCompleted
                      ? 'text-slate-800 dark:text-slate-200'
                      : 'text-slate-400 dark:text-slate-500',
                  ].join(' ')}
                >
                  {step.title}
                </p>
                {step.subtitle && (
                  <p className="text-[11px] text-slate-400 hidden sm:block">
                    {step.subtitle}
                  </p>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
