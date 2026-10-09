import { useEffect, useState } from 'react'

export interface Particle {
  id: number
  x: number
  y: number
  size: number
  color: string
  delay: number
}

export interface EffervescentParticlesProps {
  active: boolean
  color?: string
  particleCount?: number
  onComplete?: () => void
  className?: string
}

const DEFAULT_PALETTE = ['#f59e0b', '#ec4899', '#10b981', '#6366f1', '#38bdf8', '#fbbf24']

export function EffervescentParticles({
  active,
  color,
  particleCount = 14,
  onComplete,
  className = '',
}: EffervescentParticlesProps) {
  const [particles, setParticles] = useState<Particle[]>([])

  useEffect(() => {
    if (!active) {
      setParticles([])
      return
    }

    const generated: Particle[] = Array.from({ length: particleCount }).map((_, i) => {
      const angle = (i / particleCount) * 2 * Math.PI + (Math.random() - 0.5) * 0.5
      const distance = 26 + Math.random() * 38
      return {
        id: i,
        x: Math.cos(angle) * distance,
        y: Math.sin(angle) * distance - 8,
        size: 3 + Math.random() * 4,
        color: color || DEFAULT_PALETTE[i % DEFAULT_PALETTE.length],
        delay: Math.random() * 80,
      }
    })

    setParticles(generated)

    const timer = setTimeout(() => {
      setParticles([])
      if (onComplete) onComplete()
    }, 700)

    return () => clearTimeout(timer)
  }, [active, color, particleCount, onComplete])

  if (!active && particles.length === 0) return null

  return (
    <div
      className={`pointer-events-none absolute inset-0 flex items-center justify-center overflow-visible z-30 ${className}`}
      aria-hidden="true"
    >
      {/* Halo de destello central expansivo */}
      <div className="absolute w-12 h-12 rounded-full animate-effervescent bg-white/30 dark:bg-white/20 filter blur-xs" />

      {/* Partículas efervescentes multidireccionales */}
      {particles.map((p) => (
        <span
          key={p.id}
          className="absolute rounded-full animate-particle-burst"
          style={
            {
              width: `${p.size}px`,
              height: `${p.size}px`,
              backgroundColor: p.color,
              boxShadow: `0 0 8px ${p.color}`,
              '--tw-translate-x': `${p.x}px`,
              '--tw-translate-y': `${p.y}px`,
              animationDelay: `${p.delay}ms`,
            } as React.CSSProperties
          }
        />
      ))}
    </div>
  )
}

