import { useState, useCallback } from 'react'
import { ApiResponse } from '@/types'

interface UseApiState<T> {
  data: T | null
  isLoading: boolean
  error: string | null
}

interface UseApiReturn<T> extends UseApiState<T> {
  execute: (...args: unknown[]) => Promise<T | null>
  reset: () => void
}

export function useApi<T>(
  apiFn: (...args: unknown[]) => Promise<T | ApiResponse<T>>
): UseApiReturn<T> {
  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    isLoading: false,
    error: null,
  })

  const execute = useCallback(
    async (...args: unknown[]): Promise<T | null> => {
      setState({ data: null, isLoading: true, error: null })
      try {
        const result = await apiFn(...args)
        // Si la respuesta es ApiResponse, extraemos data
        const data =
          result !== null &&
          typeof result === 'object' &&
          'success' in result
            ? (result as ApiResponse<T>).data ?? null
            : (result as T)
        setState({ data: data as T, isLoading: false, error: null })
        return data as T
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Error inesperado'
        setState({ data: null, isLoading: false, error: message })
        return null
      }
    },
    [apiFn]
  )

  const reset = useCallback(() => {
    setState({ data: null, isLoading: false, error: null })
  }, [])

  return { ...state, execute, reset }
}

