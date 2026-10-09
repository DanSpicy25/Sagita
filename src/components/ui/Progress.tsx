export interface ProgressProps {
  value: number
  max?: number
  variant?: 'linear' | 'circular'
  color?: 'primary' | 'success' | 'warning' | 'danger' | 'info'
  size?: 'sm' | 'md' | 'lg'
  showValue?: boolean
  label?: string
  className?: string
}

const linearHeights = {
  sm: 'h-1.5',
  md: 'h-2.5',
  lg: 'h-4',
}

const colorClasses = {
  primary: 'bg-primary',
  success: 'bg-success',
  warning: 'bg-warning',
  danger: 'bg-danger',
  info: 'bg-info',
}

const circleStrokeColors = {
  primary: 'stroke-primary',
  success: 'stroke-success',
  warning: 'stroke-warning',
  danger: 'stroke-danger',
  info: 'stroke-info',
}

export function Progress({
  value,
  max = 100,
  variant = 'linear',
  color = 'primary',
  size = 'md',
  showValue = false,
  label,
  className = '',
}: ProgressProps) {
  const percentage = Math.min(Math.max(0, Math.round((value / max) * 100)), 100)

  if (variant === 'circular') {
    const circleDimensions = {
      sm: { radius: 16, stroke: 3, size: 40 },
      md: { radius: 24, stroke: 4, size: 60 },
      lg: { radius: 36, stroke: 6, size: 88 },
    }
    const { radius, stroke, size: dimSize } = circleDimensions[size]
    const circumference = 2 * Math.PI * radius
    const strokeDashoffset = circumference - (percentage / 100) * circumference

    return (
      <div
        className={`inline-flex flex-col items-center justify-center ${className}`}
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-label={label}
      >
        <div className="relative flex items-center justify-center">
          <svg
            width={dimSize}
            height={dimSize}
            className="-rotate-90 transform"
          >
            {/* Background circle */}
            <circle
              cx={dimSize / 2}
              cy={dimSize / 2}
              r={radius}
              stroke="currentColor"
              strokeWidth={stroke}
              fill="transparent"
              className="text-surface-subtle"
            />
            {/* Value circle */}
            <circle
              cx={dimSize / 2}
              cy={dimSize / 2}
              r={radius}
              stroke="currentColor"
              strokeWidth={stroke}
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              fill="transparent"
              className={`${circleStrokeColors[color]} transition-all duration-300 ease-out`}
            />
          </svg>
          {showValue && (
            <span className="absolute text-xs font-semibold text-text font-mono">
              {percentage}%
            </span>
          )}
        </div>
        {label && <span className="text-xs text-text-muted mt-1">{label}</span>}
      </div>
    )
  }

  return (
    <div
      className={`w-full flex flex-col gap-1.5 ${className}`}
      role="progressbar"
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={max}
      aria-label={label}
    >
      {(label || showValue) && (
        <div className="flex items-center justify-between text-xs font-medium">
          {label && <span className="text-text">{label}</span>}
          {showValue && <span className="text-text-muted font-mono">{percentage}%</span>}
        </div>
      )}
      <div
        className={`w-full bg-surface-subtle rounded-full overflow-hidden border border-border-subtle ${linearHeights[size]}`}
      >
        <div
          className={`h-full rounded-full transition-all duration-300 ease-out ${colorClasses[color]}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}
