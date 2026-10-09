import { useState, useCallback, useRef } from 'react'
import { useToast } from './useToast'

export interface UseOptimisticActionOptions<T, R> {
  /** Acción asíncrona real contra el backend */
  mutate: () => Promise<R>
  /** Transformación optimista inmediata sobre el estado local */
  applyOptimistic: (current: T) => T
  /** Callback opcional en éxito */
  onSuccess?: (result: R) => void
  /** Callback opcional en error (se pasa la función de rollback) */
  onError?: (error: unknown, rollback: () => void) => void
  /** Mensaje de confirmación toast opcional */
  successMessage?: {
    title: string
    message?: string
  }
  /** Mensaje de error toast */
  errorMessage?: {
    title: string
    message?: string
  }
  /** Habilitar botón de "Deshacer" con ventana de tiempo en ms */
  undoWindowMs?: number
  /** Callback ejecutado cuando el usuario presiona "Deshacer" */
  onUndo?: () => void | Promise<void>
}

export function useOptimisticAction<T>() {
  const { toast } = useToast()
  const [isPending, setIsPending] = useState(false)
  const previousStateRef = useRef<T | null>(null)

  const execute = useCallback(
    async <R>(
      currentState: T,
      setState: (updater: T | ((prev: T) => T)) => void,
      options: UseOptimisticActionOptions<T, R>
    ): Promise<{ success: boolean; data?: R; error?: unknown }> => {
      // 1. Guardar estado previo para rollback seguro
      previousStateRef.current = currentState
      const rollback = () => {
        if (previousStateRef.current !== null) {
          setState(previousStateRef.current)
        }
      }

      // 2. Aplicar cambio optimista inmediato
      const optimisticState = options.applyOptimistic(currentState)
      setState(optimisticState)
      setIsPending(true)

      try {
        // 3. Ejecutar llamada al backend
        const result = await options.mutate()
        setIsPending(false)

        // 4. Notificar éxito o configurar toast con acción Deshacer
        if (options.undoWindowMs && options.onUndo) {
          toast.success(
            options.successMessage?.title || 'Operación completada',
            options.successMessage?.message,
            {
              duration: options.undoWindowMs,
              action: {
                label: 'Deshacer',
                onClick: async () => {
                  rollback()
                  try {
                    await options.onUndo?.()
                    toast.info('Cambio deshecho con éxito')
                  } catch {
                    toast.error('No fue posible revertir la operación')
                  }
                },
              },
            }
          )
        } else if (options.successMessage) {
          toast.success(options.successMessage.title, options.successMessage.message)
        }

        options.onSuccess?.(result)
        return { success: true, data: result }
      } catch (err) {
        // 5. En caso de error, rollback automático
        setIsPending(false)
        rollback()

        if (options.onError) {
          options.onError(err, rollback)
        } else {
          toast.error(
            options.errorMessage?.title || 'Error en la operación',
            options.errorMessage?.message || (err instanceof Error ? err.message : 'No se pudo sincronizar con el servidor.'),
            {
              duration: 5000,
              action: {
                label: 'Reintentar',
                onClick: () => {
                  execute(currentState, setState, options)
                },
              },
            }
          )
        }

        return { success: false, error: err }
      }
    },
    [toast]
  )

  return {
    execute,
    isPending,
  }
}

