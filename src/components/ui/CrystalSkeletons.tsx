import type React from 'react'
import { useSector } from '@/context/SectorContext'

/* ─── Atomic Shimmer Block ─────────────────────────────────────────────────── */
export interface SkeletonShimmerProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string
  rounded?: string
  width?: string | number
  height?: string | number
}

export function SkeletonShimmer({
  className = '',
  rounded,
  width,
  height,
  style,
  ...props
}: SkeletonShimmerProps) {
  const { tokens } = useSector()
  const radius = rounded ?? tokens.radiusClass

  return (
    <div
      role="status"
      aria-label="Cargando..."
      style={{
        width,
        height,
        ...style,
      }}
      className={`relative overflow-hidden bg-neutral-800/40 dark:bg-white/[0.04] border border-white/5 backdrop-blur-xs ${radius} ${className}`}
      {...props}
    >
      {/* Máscara de brillo angular deslizante anti-pulse */}
      <div
        className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/10 dark:via-white/[0.07] to-transparent animate-glass-shimmer"
        aria-hidden="true"
      />
    </div>
  )
}

/* ─── Skeleton Metric (KPI Card) ───────────────────────────────────────────── */
export interface SkeletonMetricProps {
  className?: string
}

export function SkeletonMetric({ className = '' }: SkeletonMetricProps) {
  const { tokens } = useSector()

  return (
    <div
      className={`relative overflow-hidden p-5 bg-neutral-900/50 dark:bg-neutral-950/60 border border-white/5 backdrop-blur-md shadow-lg ${tokens.radiusClass} ${className}`}
    >
      <div className="flex items-center justify-between mb-4">
        {/* Label placeholder */}
        <SkeletonShimmer className="h-4 w-28" />
        {/* Icon box placeholder */}
        <SkeletonShimmer className="h-9 w-9 rounded-lg" />
      </div>
      {/* Metric value placeholder */}
      <SkeletonShimmer className="h-8 w-36 mb-2" />
      {/* Trend badge / subtitle placeholder */}
      <div className="flex items-center gap-2">
        <SkeletonShimmer className="h-4 w-16 rounded-full" />
        <SkeletonShimmer className="h-3 w-24" />
      </div>

      {/* Shimmer overlay */}
      <div
        className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/10 dark:via-white/[0.06] to-transparent animate-glass-shimmer"
        aria-hidden="true"
      />
    </div>
  )
}

/* ─── Skeleton Card (Catalog / Menu / Item) ────────────────────────────────── */
export interface SkeletonCardProps {
  className?: string
  showImage?: boolean
}

export function SkeletonCard({ className = '', showImage = true }: SkeletonCardProps) {
  const { tokens } = useSector()

  return (
    <div
      className={`relative overflow-hidden p-4 bg-neutral-900/45 dark:bg-neutral-950/50 border border-white/5 backdrop-blur-md flex flex-col justify-between ${tokens.radiusClass} ${className}`}
    >
      <div>
        {/* Image/Icon banner */}
        {showImage && (
          <div className="mb-3.5 relative overflow-hidden rounded-lg bg-neutral-800/30 h-32 w-full flex items-center justify-center">
            <SkeletonShimmer className="w-12 h-12 rounded-full" />
          </div>
        )}

        {/* Title and tags */}
        <div className="flex items-start justify-between gap-2 mb-2">
          <SkeletonShimmer className="h-5 w-3/4" />
          <SkeletonShimmer className="h-4 w-12 rounded-full" />
        </div>

        {/* Subtitle / SKU / Stock note */}
        <SkeletonShimmer className="h-3.5 w-1/2 mb-3" />

        {/* Technical attribute tags */}
        <div className="flex gap-1.5 mb-4">
          <SkeletonShimmer className="h-4 w-14 rounded-md" />
          <SkeletonShimmer className="h-4 w-16 rounded-md" />
        </div>
      </div>

      {/* Footer: Price + Action Button */}
      <div className="pt-3 border-t border-white/5 flex items-center justify-between gap-3">
        <SkeletonShimmer className="h-6 w-20" />
        <SkeletonShimmer className="h-9 w-24 rounded-lg" />
      </div>

      {/* Shimmer sweep */}
      <div
        className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/10 dark:via-white/[0.06] to-transparent animate-glass-shimmer"
        aria-hidden="true"
      />
    </div>
  )
}

/* ─── Skeleton Table (KDS / Queue / Order Rows) ────────────────────────────── */
export interface SkeletonTableProps {
  rows?: number
  cols?: number
  className?: string
}

export function SkeletonTable({ rows = 5, cols = 4, className = '' }: SkeletonTableProps) {
  const { tokens } = useSector()

  return (
    <div
      className={`relative overflow-hidden bg-neutral-900/40 dark:bg-neutral-950/50 border border-white/5 backdrop-blur-md ${tokens.radiusClass} ${className}`}
    >
      {/* Header row */}
      <div className="flex items-center justify-between p-4 border-b border-white/5 bg-white/[0.02]">
        {Array.from({ length: cols }).map((_, c) => (
          <SkeletonShimmer
            key={c}
            className={`h-4 ${c === 0 ? 'w-32' : c === cols - 1 ? 'w-16' : 'w-24 hidden sm:block'}`}
          />
        ))}
      </div>

      {/* Data rows */}
      <div className="divide-y divide-white/5">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex items-center justify-between p-4 gap-3">
            <div className="flex items-center gap-3">
              <SkeletonShimmer className="h-8 w-8 rounded-lg shrink-0" />
              <div className="space-y-1.5">
                <SkeletonShimmer className="h-4 w-36" />
                <SkeletonShimmer className="h-3 w-20" />
              </div>
            </div>
            {Array.from({ length: Math.max(1, cols - 2) }).map((_, c) => (
              <SkeletonShimmer key={c} className="h-4 w-20 hidden sm:block" />
            ))}
            <SkeletonShimmer className="h-8 w-20 rounded-md shrink-0" />
          </div>
        ))}
      </div>

      {/* Shimmer sweep */}
      <div
        className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/10 dark:via-white/[0.06] to-transparent animate-glass-shimmer"
        aria-hidden="true"
      />
    </div>
  )
}

/* ─── Skeleton Transition Wrapper (Fade-up 250ms) ──────────────────────────── */
export interface SkeletonTransitionProps {
  isLoading: boolean
  skeleton: React.ReactNode
  children: React.ReactNode
  className?: string
}

export function SkeletonTransition({
  isLoading,
  skeleton,
  children,
  className = '',
}: SkeletonTransitionProps) {
  if (isLoading) {
    return <div className={`animate-fade-in ${className}`}>{skeleton}</div>
  }

  return (
    <div
      className={`transition-all duration-250 ease-out transform translate-y-0 opacity-100 motion-safe:animate-[fadeInUp_250ms_ease-out] ${className}`}
    >
      {children}
    </div>
  )
}
