import { useState, useRef, useEffect } from 'react'
import { Check, ChevronDown, Sparkles } from 'lucide-react'
import { useSector, SectorId } from '@/context/SectorContext'

export function SectorSelector() {
  const { sector, setSector, tokens, allSectors, playTactileClick } = useSector()
  const [abierto, setAbierto] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Cerrar al hacer clic afuera
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setAbierto(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div className="relative inline-block" ref={dropdownRef}>
      {/* Botón Trigger Selector */}
      <button
        type="button"
        onClick={() => {
          playTactileClick()
          setAbierto((o) => !o)
        }}
        className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg border border-border bg-surface-subtle hover:bg-surface transition-all text-xs font-semibold text-text shadow-2xs cursor-pointer group"
        aria-label="Seleccionar vertical o industria comercial"
        title="Cambiar vertical comercial de Sagita en vivo"
      >
        <span className="text-sm shrink-0 transition-transform group-hover:scale-110">
          {tokens.iconEmoji}
        </span>
        <span className="max-w-[130px] truncate hidden sm:inline">
          {tokens.nombre.split('&')[0].trim()}
        </span>
        <span
          className="w-1.5 h-1.5 rounded-full shrink-0"
          style={{ backgroundColor: tokens.accentColor }}
        />
        <ChevronDown
          className={`w-3 h-3 text-text-muted transition-transform duration-200 ${
            abierto ? 'rotate-180 text-text' : ''
          }`}
        />
      </button>

      {/* Menú Desplegable con Efecto de Cristal */}
      {abierto && (
        <div
          className="absolute left-0 mt-1.5 w-64 rounded-xl border border-white/10 bg-neutral-900/95 dark:bg-[#0c0d12]/95 backdrop-blur-xl shadow-2xl p-1.5 z-50 animate-fade-in"
          style={{
            boxShadow: `0 12px 30px -4px rgba(0,0,0,0.8), 0 0 16px -2px ${tokens.accentGlow}`,
          }}
        >
          <div className="px-2.5 py-1.5 border-b border-white/10 mb-1 flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 flex items-center gap-1.5">
              <Sparkles className="w-3 h-3 text-amber-400" />
              <span>Sector Activo</span>
            </span>
            <span className="text-[10px] text-neutral-400 font-mono">En vivo</span>
          </div>

          <div className="space-y-1">
            {allSectors.map((s) => {
              const activo = s.id === sector
              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => {
                    playTactileClick()
                    setSector(s.id as SectorId)
                    setAbierto(false)
                  }}
                  className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                    activo
                      ? 'bg-white/10 text-white font-bold shadow-xs'
                      : 'text-neutral-300 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <span className="text-base">{s.iconEmoji}</span>
                    <span className="truncate">{s.nombre}</span>
                  </div>
                  {activo && (
                    <Check
                      className="w-3.5 h-3.5 shrink-0"
                      style={{ color: tokens.accentColor }}
                    />
                  )}
                </button>
              )
            })}
          </div>

          <div className="mt-1.5 pt-1.5 border-t border-white/10 px-2 text-[10px] text-neutral-400 italic">
            El vocabulario, tokens y reglas de inventario cambian instantáneamente sin recargar la página.
          </div>
        </div>
      )}
    </div>
  )
}

