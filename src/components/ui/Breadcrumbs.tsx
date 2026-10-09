import React from 'react'
import { ChevronRight, Home } from 'lucide-react'

export interface BreadcrumbItem {
  label: React.ReactNode
  href?: string
  onClick?: () => void
  icon?: React.ReactNode
}

export interface BreadcrumbsProps {
  items: BreadcrumbItem[]
  separator?: React.ReactNode
  showHome?: boolean
  onHomeClick?: () => void
  className?: string
}

export function Breadcrumbs({
  items,
  separator,
  showHome = false,
  onHomeClick,
  className = '',
}: BreadcrumbsProps) {
  const defaultSeparator = <ChevronRight className="w-3.5 h-3.5 text-text-muted/60" aria-hidden="true" />

  return (
    <nav aria-label="Breadcrumb" className={`flex items-center text-xs ${className}`}>
      <ol className="flex items-center gap-1.5 flex-wrap">
        {showHome && (
          <li className="inline-flex items-center">
            <button
              type="button"
              onClick={onHomeClick}
              aria-label="Inicio"
              className="text-text-muted hover:text-text transition-colors p-1 rounded-md"
            >
              <Home className="w-3.5 h-3.5" />
            </button>
            <span className="ml-1">{separator || defaultSeparator}</span>
          </li>
        )}

        {items.map((item, index) => {
          const isLast = index === items.length - 1

          return (
            <li key={index} className="inline-flex items-center gap-1.5">
              {isLast ? (
                <span
                  aria-current="page"
                  className="font-semibold text-text truncate max-w-[200px]"
                >
                  {item.label}
                </span>
              ) : item.href ? (
                <a
                  href={item.href}
                  className="text-text-muted hover:text-text transition-colors truncate max-w-[160px]"
                >
                  {item.label}
                </a>
              ) : item.onClick ? (
                <button
                  type="button"
                  onClick={item.onClick}
                  className="text-text-muted hover:text-text transition-colors truncate max-w-[160px] cursor-pointer"
                >
                  {item.label}
                </button>
              ) : (
                <span className="text-text-muted truncate max-w-[160px]">{item.label}</span>
              )}

              {!isLast && <span>{separator || defaultSeparator}</span>}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}

