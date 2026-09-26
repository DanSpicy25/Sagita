import { useState, useRef, useEffect } from 'react'
import { Globe, Check, ChevronDown } from 'lucide-react'
import { useI18n, IDIOMAS_DISPONIBLES } from '@/hooks/useI18n'
import { useToast } from '@/hooks/useToast'

export function I18nSelector() {
  const { idioma, cambiarIdioma, idiomaInfo } = useI18n()
  const [abierto, setAbierto] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const { toast } = useToast()

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
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setAbierto((o) => !o)}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all text-xs font-semibold text-slate-800 dark:text-slate-200 shadow-xs"
        aria-label="Seleccionar idioma"
      >
        <span className="text-sm">{idiomaInfo.bandera}</span>
        <span className="hidden sm:inline uppercase">{idiomaInfo.codigo}</span>
        <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform ${abierto ? 'rotate-180' : ''}`} />
      </button>

      {abierto && (
        <div className="absolute right-0 mt-2 w-44 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-xl z-50 p-1.5 space-y-1 animate-slide-down">
          <div className="px-2.5 py-1 border-b border-slate-100 dark:border-slate-800 text-[10px] font-bold uppercase text-slate-400 flex items-center gap-1.5">
            <Globe className="w-3 h-3" />
            <span>Seleccionar Idioma</span>
          </div>

          {IDIOMAS_DISPONIBLES.map((lang) => {
            const activo = lang.id === idioma
            return (
              <button
                key={lang.id}
                type="button"
                onClick={() => {
                  cambiarIdioma(lang.id)
                  setAbierto(false)
                  toast.success('Idioma actualizado', `Idioma cambiado a ${lang.nombre}`)
                }}
                className={`w-full px-2.5 py-1.5 rounded-xl text-left flex items-center justify-between text-xs transition-all ${
                  activo
                    ? 'bg-primary-50 dark:bg-primary-950/40 text-primary-700 dark:text-primary-300 font-semibold'
                    : 'hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                }`}
              >
                <span className="flex items-center gap-2">
                  <span>{lang.bandera}</span>
                  <span>{lang.nombre}</span>
                </span>
                {activo && <Check className="w-3.5 h-3.5 text-primary-600" />}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

