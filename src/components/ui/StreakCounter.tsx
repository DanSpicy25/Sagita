import { useState, useEffect } from 'react'
import { Flame, Sparkles, Trophy, RotateCcw } from 'lucide-react'
import { useSector } from '@/context/SectorContext'

export interface StreakCounterProps {
  className?: string
  showDetails?: boolean
  compact?: boolean
}

export function StreakCounter({
  className = '',
  showDetails = false,
  compact = false,
}: StreakCounterProps) {
  const { streakCount, resetStreak, tokens, playTactileClick } = useSector()
  const [isAnimating, setIsAnimating] = useState(false)
  const [popoverOpen, setPopoverOpen] = useState(false)

  // Disparar animación de chispa cuando el contador cambia
  useEffect(() => {
    if (streakCount > 0) {
      setIsAnimating(true)
      const timer = setTimeout(() => setIsAnimating(false), 600)
      return () => clearTimeout(timer)
    }
  }, [streakCount])

  const targetShiftGoal = 50
  const progressPercent = Math.min(100, Math.round((streakCount / targetShiftGoal) * 100))

  return (
    <div className={`relative inline-flex items-center ${className}`}>
      {/* Botón visual de la barra superior */}
      <button
        type="button"
        onClick={() => {
          playTactileClick()
          setPopoverOpen(!popoverOpen)
        }}
        title="Racha operativa del turno. Clic para ver estadísticas."
        className={`group relative flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full border transition-all duration-150 cursor-pointer select-none ${
          isAnimating ? 'scale-105 shadow-md' : 'hover:scale-[1.02]'
        } bg-neutral-900/80 dark:bg-black/60 border-white/10 hover:border-white/20 text-neutral-200`}
        style={{
          boxShadow: isAnimating
            ? `0 0 16px ${tokens.accentGlow}`
            : '0 2px 8px rgba(0,0,0,0.2)',
        }}
      >
        {/* Icono de chispa / racha con animación activa */}
        <span
          className={`transition-transform duration-300 ${
            isAnimating ? 'scale-125 rotate-12' : 'group-hover:rotate-6'
          }`}
        >
          {streakCount >= 20 ? (
            <Flame className="w-3.5 h-3.5 text-amber-400 fill-amber-400 animate-pulse" />
          ) : (
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
          )}
        </span>

        {/* Texto del contador */}
        {compact ? (
          <span className="font-mono font-bold text-white">
            {streakCount}
          </span>
        ) : (
          <span className="flex items-center gap-1">
            <span className="font-mono font-extrabold text-white">
              {streakCount}
            </span>
            <span className="hidden sm:inline text-neutral-400 font-normal">
              {streakCount === 1 ? 'operación fluida' : 'operaciones fluidas hoy'}
            </span>
          </span>
        )}

        {/* Micro-badge de progreso */}
        <span
          className="ml-0.5 px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold bg-white/10 text-neutral-300"
          style={{ color: tokens.accentColor }}
        >
          {progressPercent}%
        </span>
      </button>

      {/* Popover flotante con detalles de la jornada */}
      {(popoverOpen || showDetails) && (
        <div
          className="absolute top-full mt-2 right-0 sm:left-0 sm:right-auto z-50 w-64 p-3.5 backdrop-blur-xl bg-neutral-900/95 dark:bg-[#0d0e14]/95 border border-white/15 rounded-xl shadow-2xl shadow-black/80 text-neutral-100 animate-fade-in"
          style={{
            boxShadow: `0 12px 28px -4px rgba(0,0,0,0.8), 0 0 16px -2px ${tokens.accentGlow}`,
          }}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-2 pb-2 border-b border-white/10">
            <div className="flex items-center gap-1.5">
              <Trophy className="w-4 h-4 text-amber-400" />
              <span className="text-xs font-bold text-white uppercase tracking-wider">
                Racha de Turno
              </span>
            </div>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                resetStreak()
                playTactileClick()
              }}
              title="Reiniciar contador de racha"
              className="text-neutral-400 hover:text-white p-1 rounded-md hover:bg-white/10 transition-colors"
            >
              <RotateCcw className="w-3 h-3" />
            </button>
          </div>

          {/* Estadísticas */}
          <div className="space-y-2 text-xs mb-3">
            <div className="flex justify-between items-center text-neutral-300">
              <span>Despachos exitosos:</span>
              <span className="font-bold font-mono text-white text-sm">
                {streakCount}
              </span>
            </div>
            <div className="flex justify-between items-center text-neutral-300">
              <span>Meta operativa sugerida:</span>
              <span className="font-medium text-neutral-400 font-mono">
                {targetShiftGoal} ops
              </span>
            </div>

            {/* Barra de progreso visual */}
            <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden mt-1">
              <div
                className="h-full rounded-full transition-all duration-300"
                style={{
                  width: `${progressPercent}%`,
                  background: `linear-gradient(90deg, #f59e0b 0%, ${tokens.accentColor} 100%)`,
                }}
              />
            </div>
          </div>

          <p className="text-[11px] text-neutral-400 italic leading-snug">
            ✨ Cada comanda, ticket o cita finalizada suma a tu racha de velocidad y precisión sin errores.
          </p>
        </div>
      )}
    </div>
  )
}

