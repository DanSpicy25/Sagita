import React, { useState, forwardRef } from 'react'
import { useSector } from '@/context/SectorContext'
import { EffervescentParticles } from './EffervescentParticles'

export type TactileButtonVariant =
  | 'primary'
  | 'secondary'
  | 'outline'
  | 'ghost'
  | 'success'
  | 'danger'

export type TactileButtonSize = 'sm' | 'md' | 'lg' | 'xl'

export interface TactileButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: TactileButtonVariant
  size?: TactileButtonSize
  icon?: React.ReactNode
  iconRight?: React.ReactNode
  loading?: boolean
  withSound?: boolean
  withEffervescent?: boolean
  effervescentColor?: string
  fullWidth?: boolean
  children?: React.ReactNode
}

export const TactileButton = forwardRef<HTMLButtonElement, TactileButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      icon,
      iconRight,
      loading = false,
      withSound = true,
      withEffervescent = false,
      effervescentColor,
      fullWidth = false,
      className = '',
      onClick,
      disabled,
      children,
      style,
      ...props
    },
    ref
  ) => {
    const { tokens, playTactileClick } = useSector()
    const [isBursting, setIsBursting] = useState(false)

    // Handlers
    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (disabled || loading) return

      if (withSound) {
        playTactileClick()
      }

      if (withEffervescent) {
        setIsBursting(true)
      }

      if (onClick) {
        onClick(e)
      }
    }

    // Size mappings
    const sizeClasses = {
      sm: 'px-3 py-1.5 text-xs font-semibold gap-1.5 min-h-[32px]',
      md: 'px-4 py-2.5 text-sm font-semibold gap-2 min-h-[42px]',
      lg: 'px-5 py-3 text-base font-bold gap-2.5 min-h-[48px]',
      xl: 'px-6 py-4 text-lg font-bold gap-3 min-h-[56px] tracking-wide',
    }[size]

    // Base sensory tactile physics
    // Base: degradado diagonal, borde superior translúcido, halo inferior suave
    // Hover: elevación milimétrica (-translate-y-0.5), brillo e incremento de halo
    // Active: contracción física táctil (active:scale-[0.96] active:translate-y-0 duration-75)
    const basePhysics =
      'relative inline-flex items-center justify-center select-none font-medium cursor-pointer transition-all duration-150 ease-out border border-transparent disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none'

    const motionPhysics =
      'hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.96] active:duration-75 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-offset-2'

    // Variant styles
    let variantStyles = ''
    let dynamicStyle: React.CSSProperties = {}

    if (variant === 'primary') {
      variantStyles =
        'text-white border-t border-white/30 shadow-lg hover:shadow-xl hover:brightness-105 active:brightness-95'
      dynamicStyle = {
        background: `linear-gradient(135deg, ${tokens.accentColor} 0%, ${tokens.accentHover} 100%)`,
        boxShadow: `0 8px 20px -4px ${tokens.accentGlow}, 0 2px 4px -1px rgba(0,0,0,0.2)`,
        ...style,
      }
    } else if (variant === 'secondary') {
      variantStyles =
        'bg-neutral-800/80 hover:bg-neutral-800 dark:bg-neutral-900/90 dark:hover:bg-neutral-800 text-neutral-100 border-t border-white/20 border-b border-black/40 border-x border-white/10 shadow-md hover:shadow-lg hover:border-white/20 backdrop-blur-md'
      dynamicStyle = { ...style }
    } else if (variant === 'outline') {
      variantStyles =
        'bg-transparent hover:bg-white/[0.06] text-neutral-200 border border-white/20 hover:border-white/40 shadow-xs'
      dynamicStyle = { ...style }
    } else if (variant === 'ghost') {
      variantStyles =
        'bg-transparent hover:bg-white/[0.08] text-neutral-300 hover:text-white border-transparent shadow-none'
      dynamicStyle = { ...style }
    } else if (variant === 'success') {
      variantStyles =
        'bg-gradient-to-tr from-emerald-600 to-teal-500 text-white border-t border-white/30 shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40'
      dynamicStyle = { ...style }
    } else if (variant === 'danger') {
      variantStyles =
        'bg-gradient-to-tr from-rose-600 to-red-500 text-white border-t border-white/30 shadow-lg shadow-rose-500/25 hover:shadow-rose-500/40'
      dynamicStyle = { ...style }
    }

    const radius = tokens.radiusClass

    return (
      <button
        ref={ref}
        type="button"
        disabled={disabled || loading}
        onClick={handleClick}
        style={dynamicStyle}
        className={`${basePhysics} ${motionPhysics} ${variantStyles} ${sizeClasses} ${radius} ${
          fullWidth ? 'w-full' : ''
        } ${className}`}
        {...props}
      >
        {/* Halo de brillo interno en hover */}
        <span
          className="pointer-events-none absolute inset-0 rounded-[inherit] bg-gradient-to-b from-white/15 to-transparent opacity-0 transition-opacity duration-150 hover:opacity-100"
          aria-hidden="true"
        />

        {/* Efecto efervescente de logro con micro-partículas */}
        <EffervescentParticles
          active={isBursting}
          color={effervescentColor || tokens.accentColor}
          onComplete={() => setIsBursting(false)}
        />

        {/* Contenido del botón */}
        {loading ? (
          <span className="flex items-center gap-2">
            <svg
              className="h-4 w-4 animate-spin text-current"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            <span className="truncate">Procesando...</span>
          </span>
        ) : (
          <span className="relative z-10 flex items-center justify-center gap-2 truncate">
            {icon && <span className="shrink-0">{icon}</span>}
            {children && <span className="truncate">{children}</span>}
            {iconRight && <span className="shrink-0">{iconRight}</span>}
          </span>
        )}
      </button>
    )
  }
)

TactileButton.displayName = 'TactileButton'

