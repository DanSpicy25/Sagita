import { useState, useEffect, useCallback, useMemo } from 'react'
import {
  OnboardingStepId,
  OnboardingData,
  ONBOARDING_STEPS,
} from './onboardingTypes'

const ONBOARDING_STORAGE_KEY = 'sagitta_onboarding_state'
const ONBOARDING_UPDATED_EVENT = 'sagitta:onboarding-updated'

export const INITIAL_ONBOARDING_DATA: OnboardingData = {
  nombreNegocio: '',
  vertical: 'Salón de Belleza & Estética',
  telefono: '',
  ciudad: '',
  servicios: [
    {
      id: 'srv-1',
      nombre: 'Servicio Principal',
      duracionMin: 45,
      precio: 35,
    },
  ],
  diasApertura: ['lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado'],
  horaApertura: '09:00',
  horaCierre: '19:00',
  primerColaborador: {
    nombre: '',
    especialidad: 'Especialista General',
    email: '',
  },
  metodosPago: {
    efectivo: true,
    tarjeta: true,
    transferencia: false,
  },
  terminoCita: 'cita',
  terminoCliente: 'cliente',
  colorPrimario: '#6366f1',
  completedSteps: {
    negocio: false,
    servicios: false,
    horarios: false,
    equipo: false,
    pagos: false,
    personalizacion: false,
    listo: false,
  },
  isCompleted: false,
  isDismissed: false,
  updatedAt: new Date().toISOString(),
}

export function useOnboarding() {
  const [data, setData] = useState<OnboardingData>(() => {
    try {
      const stored = localStorage.getItem(ONBOARDING_STORAGE_KEY)
      if (stored) {
        return { ...INITIAL_ONBOARDING_DATA, ...JSON.parse(stored) }
      }
    } catch {
      // Fallback a inicial
    }
    return INITIAL_ONBOARDING_DATA
  })

  const [currentStep, setCurrentStep] = useState<OnboardingStepId>('negocio')

  // Sincronizar estado entre pestañas / ventanas
  useEffect(() => {
    const handleUpdate = () => {
      try {
        const stored = localStorage.getItem(ONBOARDING_STORAGE_KEY)
        if (stored) {
          setData({ ...INITIAL_ONBOARDING_DATA, ...JSON.parse(stored) })
        }
      } catch {
        // Ignorar
      }
    }

    window.addEventListener(ONBOARDING_UPDATED_EVENT, handleUpdate)
    return () => window.removeEventListener(ONBOARDING_UPDATED_EVENT, handleUpdate)
  }, [])

  const saveToStorage = useCallback((newData: OnboardingData) => {
    try {
      localStorage.setItem(ONBOARDING_STORAGE_KEY, JSON.stringify(newData))
      window.dispatchEvent(new CustomEvent(ONBOARDING_UPDATED_EVENT))
    } catch {
      // Fallback
    }
  }, [])

  const updateData = useCallback(
    (partial: Partial<OnboardingData>) => {
      setData((prev) => {
        const updated = {
          ...prev,
          ...partial,
          updatedAt: new Date().toISOString(),
        }
        saveToStorage(updated)
        return updated
      })
    },
    [saveToStorage]
  )

  const markStepCompleted = useCallback(
    (stepId: OnboardingStepId, isDone: boolean = true) => {
      setData((prev) => {
        const updatedSteps = {
          ...prev.completedSteps,
          [stepId]: isDone,
        }
        const updated = {
          ...prev,
          completedSteps: updatedSteps,
          updatedAt: new Date().toISOString(),
        }
        saveToStorage(updated)
        return updated
      })
    },
    [saveToStorage]
  )

  const goToStep = useCallback((stepId: OnboardingStepId) => {
    setCurrentStep(stepId)
  }, [])

  const nextStep = useCallback(() => {
    const currentIndex = ONBOARDING_STEPS.findIndex((s) => s.id === currentStep)
    if (currentIndex < ONBOARDING_STEPS.length - 1) {
      setCurrentStep(ONBOARDING_STEPS[currentIndex + 1].id)
    }
  }, [currentStep])

  const prevStep = useCallback(() => {
    const currentIndex = ONBOARDING_STEPS.findIndex((s) => s.id === currentStep)
    if (currentIndex > 0) {
      setCurrentStep(ONBOARDING_STEPS[currentIndex - 1].id)
    }
  }, [currentStep])

  const dismissOnboarding = useCallback(() => {
    updateData({ isDismissed: true })
  }, [updateData])

  const reopenOnboarding = useCallback(() => {
    updateData({ isDismissed: false })
    setCurrentStep('negocio')
  }, [updateData])

  const completeOnboarding = useCallback(() => {
    const allCompleted = { ...data.completedSteps }
    ONBOARDING_STEPS.forEach((s) => {
      allCompleted[s.id] = true
    })
    updateData({
      isCompleted: true,
      isDismissed: false,
      completedSteps: allCompleted,
    })
  }, [data.completedSteps, updateData])

  const resetOnboarding = useCallback(() => {
    try {
      localStorage.removeItem(ONBOARDING_STORAGE_KEY)
      setData(INITIAL_ONBOARDING_DATA)
      setCurrentStep('negocio')
      window.dispatchEvent(new CustomEvent(ONBOARDING_UPDATED_EVENT))
    } catch {
      // Ignorar
    }
  }, [])

  // Métricas de progreso
  const completedCount = useMemo(() => {
    return Object.values(data.completedSteps).filter(Boolean).length
  }, [data.completedSteps])

  const totalSteps = ONBOARDING_STEPS.length

  const progressPercentage = useMemo(() => {
    return Math.round((completedCount / totalSteps) * 100)
  }, [completedCount, totalSteps])

  const isCompleted = data.isCompleted || completedCount === totalSteps
  const isDismissed = data.isDismissed

  return {
    data,
    currentStep,
    goToStep,
    nextStep,
    prevStep,
    updateData,
    markStepCompleted,
    dismissOnboarding,
    reopenOnboarding,
    completeOnboarding,
    resetOnboarding,
    completedCount,
    totalSteps,
    progressPercentage,
    isCompleted,
    isDismissed,
  }
}

