import { useState, useRef, useCallback } from 'react'

export interface UseLongPressOptions {
  /** Duración de la pulsación en milisegundos (defecto: 500ms) */
  delay?: number
  /** Umbral máximo de desplazamiento en píxeles antes de cancelar (defecto: 10px) */
  threshold?: number
  /** Callback ejecutado al completar exitosamente la pulsación sostenida */
  onLongPress: (e: React.PointerEvent | React.KeyboardEvent | React.MouseEvent) => void
  /** Callback opcional al cancelar la pulsación antes de tiempo */
  onCancel?: () => void
  /** Callback opcional al iniciar el contacto */
  onStart?: () => void
  /** Si debe prevenir el menú contextual nativo del navegador */
  preventContextMenu?: boolean
}

export function useLongPress({
  delay = 500,
  threshold = 10,
  onLongPress,
  onCancel,
  onStart,
  preventContextMenu = true,
}: UseLongPressOptions) {
  const [isPressing, setIsPressing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [coords, setCoords] = useState<{ x: number; y: number }>({ x: 0, y: 0 })

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const progressIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const startPosRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 })
  const eventRef = useRef<React.PointerEvent | React.KeyboardEvent | null>(null)
  const completedRef = useRef(false)

  const clearTimers = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current)
      progressIntervalRef.current = null
    }
  }, [])

  const cancel = useCallback(() => {
    if (isPressing && !completedRef.current) {
      onCancel?.()
    }
    clearTimers()
    setIsPressing(false)
    setProgress(0)
    completedRef.current = false
  }, [isPressing, onCancel, clearTimers])

  const startPress = useCallback(
    (clientX: number, clientY: number, e: React.PointerEvent | React.KeyboardEvent) => {
      cancel()
      completedRef.current = false
      startPosRef.current = { x: clientX, y: clientY }
      setCoords({ x: clientX, y: clientY })
      eventRef.current = e
      setIsPressing(true)
      setProgress(0)
      onStart?.()

      const startTime = Date.now()
      progressIntervalRef.current = setInterval(() => {
        const elapsed = Date.now() - startTime
        const pct = Math.min(1, elapsed / delay)
        setProgress(pct)
      }, 25)

      timerRef.current = setTimeout(() => {
        completedRef.current = true
        clearTimers()
        setProgress(1)
        setIsPressing(false)
        if (eventRef.current) {
          onLongPress(eventRef.current)
        }
      }, delay)
    },
    [cancel, delay, onStart, onLongPress, clearTimers]
  )

  // Handlers para puntero táctil / ratón
  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      // Ignorar clics que no sean el botón primario
      if (e.button !== 0 && e.pointerType === 'mouse') return
      startPress(e.clientX, e.clientY, e)
    },
    [startPress]
  )

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!isPressing) return
      const dist = Math.hypot(
        e.clientX - startPosRef.current.x,
        e.clientY - startPosRef.current.y
      )
      if (dist > threshold) {
        cancel()
      }
    },
    [isPressing, threshold, cancel]
  )

  const handlePointerUp = useCallback(() => {
    cancel()
  }, [cancel])

  const handlePointerLeave = useCallback(() => {
    cancel()
  }, [cancel])

  const handlePointerCancel = useCallback(() => {
    cancel()
  }, [cancel])

  // Alternativa accesible: atajos de teclado (Shift+F10 o mantener Espacio/Enter)
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === ' ' || e.key === 'Enter') {
        if (!isPressing && !e.repeat) {
          const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
          startPress(rect.left + rect.width / 2, rect.top + rect.height / 2, e)
        }
      } else if (e.shiftKey && e.key === 'F10') {
        // Shift+F10 es el atajo universal de menú contextual / acción secundaria
        e.preventDefault()
        onLongPress(e)
      }
    },
    [isPressing, startPress, onLongPress]
  )

  const handleKeyUp = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === ' ' || e.key === 'Enter') {
        cancel()
      }
    },
    [cancel]
  )

  const handleContextMenu = useCallback(
    (e: React.MouseEvent) => {
      if (preventContextMenu && isPressing) {
        e.preventDefault()
      }
    },
    [preventContextMenu, isPressing]
  )

  return {
    isPressing,
    progress,
    coords,
    handlers: {
      onPointerDown: handlePointerDown,
      onPointerMove: handlePointerMove,
      onPointerUp: handlePointerUp,
      onPointerLeave: handlePointerLeave,
      onPointerCancel: handlePointerCancel,
      onKeyDown: handleKeyDown,
      onKeyUp: handleKeyUp,
      onContextMenu: handleContextMenu,
    },
  }
}

