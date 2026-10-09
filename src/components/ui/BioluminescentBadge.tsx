import React from 'react'
import { useSector } from '@/context/SectorContext'

export type BioluminescentVariant =
  | 'sector'
  | 'cola'
  | 'preparacion'
  | 'listo'
  | 'completado'
  | 'critico'
  | 'info'

export interface BioluminescentBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BioluminescentVariant
  pulse?: boolean
  dot?: boolean
  label?: string
  icon?: React.ReactNode
  size?: 'sm' | 'md' | 'lg'
}

export function BioluminescentBadge({
  variant = 'sector',
  pulse = true,
  dot = true,
  label,
  icon,
  size = 'md',
  className = '',
  children,
  style,
  ...props
}: BioluminescentBadgeProps) {
  const { tokens } = useSector()

  // Size styling
  const sizeClasses = {
    sm: 'text-[11px] px-2 py-0.5 gap-1 font-medium',
    md: 'text-xs px-2.5 py-1 gap-1.5 font-semibold',
    lg: 'text-sm px-3.5 py-1.5 gap-2 font-bold',
  }[size]

  // Variant themes
  let bgStyle = ''
  let textStyle = ''
  let borderStyle = ''
  let glowStyle = ''
  let dotColor = ''
  let dynamicStyle: React.CSSProperties = {}

  switch (variant) {
    case 'sector':
      textStyle = 'text-white'
      borderStyle = 'border border-white/20'
      dynamicStyle = {
        background: `linear-gradient(135deg, ${tokens.accentSoft} 0%, rgba(255, 255, 255, 0.04) 100%)`,
        borderColor: tokens.accentBorder,
        boxShadow: `0 0 12px ${tokens.accentGlow}`,
        ...style,
      }
      dotColor = tokens.accentColor
      break

    case 'cola':
      bgStyle = 'bg-amber-500/10 dark:bg-amber-500/15'
      textStyle = 'text-amber-400 dark:text-amber-300'
      borderStyle = 'border border-amber-500/30'
      glowStyle = 'shadow-[0_0_10px_rgba(245,158,11,0.25)]'
      dotColor = '#f59e0b'
      dynamicStyle = { ...style }
      break

    case 'preparacion':
      bgStyle = 'bg-blue-500/10 dark:bg-blue-500/15'
      textStyle = 'text-blue-400 dark:text-blue-300'
      borderStyle = 'border border-blue-500/30'
      glowStyle = 'shadow-[0_0_10px_rgba(59,130,246,0.25)]'
      dotColor = '#3b82f6'
      dynamicStyle = { ...style }
      break

    case 'listo':
      bgStyle = 'bg-emerald-500/10 dark:bg-emerald-500/15'
      textStyle = 'text-emerald-400 dark:text-emerald-300'
      borderStyle = 'border border-emerald-500/30'
      glowStyle = 'shadow-[0_0_10px_rgba(16,185,129,0.3)]'
      dotColor = '#10b981'
      dynamicStyle = { ...style }
      break

    case 'completado':
      bgStyle = 'bg-purple-500/10 dark:bg-purple-500/15'
      textStyle = 'text-purple-300 dark:text-purple-200'
      borderStyle = 'border border-purple-500/30'
      glowStyle = 'shadow-[0_0_10px_rgba(168,85,247,0.25)]'
      dotColor = '#a855f7'
      dynamicStyle = { ...style }
      break

    case 'critico':
      bgStyle = 'bg-rose-500/10 dark:bg-rose-500/15'
      textStyle = 'text-rose-400 dark:text-rose-300'
      borderStyle = 'border border-rose-500/35'
      glowStyle = 'shadow-[0_0_12px_rgba(244,63,94,0.35)]'
      dotColor = '#f43f5e'
      dynamicStyle = { ...style }
      break

    case 'info':
    default:
      bgStyle = 'bg-neutral-800/60 dark:bg-neutral-900/70'
      textStyle = 'text-neutral-300'
      borderStyle = 'border border-white/10'
      glowStyle = 'shadow-[0_0_8px_rgba(255,255,255,0.05)]'
      dotColor = '#94a3b8'
      dynamicStyle = { ...style }
      break
  }

  return (
    <span
      style={dynamicStyle}
      className={`inline-flex items-center rounded-full backdrop-blur-md transition-all duration-200 select-none ${bgStyle} ${textStyle} ${borderStyle} ${glowStyle} ${sizeClasses} ${className}`}
      {...props}
    >
      {/* Micro-punto bioluminiscente con halo respirante */}
      {dot && (
        <span className="relative flex h-2 w-2 items-center justify-center">
          {pulse && (
            <span
              className="absolute inline-flex h-full w-full rounded-full opacity-75 animate-ping"
              style={{ backgroundColor: dotColor }}
            />
          )}
          <span
            className="relative inline-flex h-1.5 w-1.5 rounded-full"
            style={{
              backgroundColor: dotColor,
              boxShadow: `0 0 6px ${dotColor}`,
            }}
          />
        </span>
      )}

      {icon && <span className="shrink-0">{icon}</span>}
      {label && <span className="truncate">{label}</span>}
      {children}
    </span>
  )
}

