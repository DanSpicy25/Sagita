import React, { useState, useRef } from 'react'
import { useSector, SectorMockItem } from '@/context/SectorContext'
import { BioluminescentBadge } from './BioluminescentBadge'

export interface QuickPeekCardProps {
  item: SectorMockItem
  children: React.ReactNode
  placement?: 'top' | 'bottom' | 'right' | 'left'
  className?: string
}

export function QuickPeekCard({
  item,
  children,
  placement = 'top',
  className = '',
}: QuickPeekCardProps) {
  const { tokens, vocabulario } = useSector()
  const [isOpen, setIsOpen] = useState(false)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  const handleMouseEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    timeoutRef.current = setTimeout(() => {
      setIsOpen(true)
    }, 180) // 180ms delay para naturalidad táctil
  }

  const handleMouseLeave = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    timeoutRef.current = setTimeout(() => {
      setIsOpen(false)
    }, 120)
  }

  // Positioning classes
  const placementClasses = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2.5',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2.5',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2.5',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2.5',
  }[placement]

  return (
    <div
      className={`relative inline-block ${className}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onFocus={handleMouseEnter}
      onBlur={handleMouseLeave}
    >
      {/* Elemento disparador */}
      {children}

      {/* Micro-tarjeta flotante de vidrio (Peek Drawer sin clics) */}
      {isOpen && (
        <div
          role="tooltip"
          className={`absolute ${placementClasses} z-50 w-72 pointer-events-none transition-all duration-200 transform scale-100 opacity-100 animate-fade-in`}
        >
          <div
            className={`p-3.5 backdrop-blur-xl bg-neutral-900/95 dark:bg-[#0c0d12]/95 border border-white/10 shadow-2xl shadow-black/80 text-neutral-100 ${tokens.radiusClass}`}
            style={{
              boxShadow: `0 12px 30px -4px rgba(0,0,0,0.8), 0 0 15px -2px ${tokens.accentGlow}`,
            }}
          >
            {/* Header: Categoría & Badge */}
            <div className="flex items-center justify-between gap-2 mb-2 border-b border-white/10 pb-2">
              <span className="text-[10px] uppercase font-mono tracking-wider text-neutral-400">
                {item.categoria}
              </span>
              <BioluminescentBadge
                variant="sector"
                size="sm"
                label={item.codigo}
                pulse={false}
              />
            </div>

            {/* Título & Precio */}
            <div className="flex items-start justify-between gap-2 mb-2">
              <h4 className="text-sm font-bold text-white leading-tight">
                {item.nombre}
              </h4>
              <span
                className="text-sm font-extrabold font-mono shrink-0"
                style={{ color: tokens.accentColor }}
              >
                ${item.precio.toFixed(2)}
              </span>
            </div>

            {/* Datos Técnicos y Stock específico del sector */}
            <div className="bg-white/[0.04] rounded-lg p-2 mb-2.5 space-y-1 text-xs border border-white/5">
              <div className="flex items-center justify-between text-neutral-300">
                <span className="text-neutral-400 font-medium">
                  {vocabulario.stock}:
                </span>
                <span className="font-semibold text-white">
                  {item.stockOAtributo}
                </span>
              </div>
              <div className="flex items-center justify-between text-neutral-300">
                <span className="text-neutral-400 font-medium">Tiempo est.:</span>
                <span className="font-semibold text-neutral-200">
                  ⚡ ~{item.tiempoMin} min
                </span>
              </div>
            </div>

            {/* Nota de preferencia / Protocolo / Receta */}
            <div className="text-[11px] text-neutral-300 bg-neutral-800/60 rounded-md p-2 border-l-2 border-primary" style={{ borderLeftColor: tokens.accentColor }}>
              <span className="font-bold text-neutral-200">Ficha: </span>
              {item.notaTecnica}
            </div>

            {/* Hint sensorial */}
            <div className="mt-2 text-[10px] text-neutral-400 text-center font-mono">
              Vista previa instantánea • Clic para agregar al ticket
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

