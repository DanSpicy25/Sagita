import { useNavigate } from 'react-router-dom'
import {
  Sparkles,
  Calendar,
  Package,
  Printer,
  Store,
  Barcode,
  Layers,
  ArrowRight,
  ShieldCheck,
  Zap,
} from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useToast } from '@/hooks/useToast'

export interface PortalHeroProps {
  tabPrincipal: 'reservas' | 'productos' | 'hardware' | 'verticales' | 'modulos'
  onSelectTab: (tab: 'reservas' | 'productos' | 'hardware' | 'verticales' | 'modulos') => void
}

export function PortalHero({ tabPrincipal, onSelectTab }: PortalHeroProps) {
  const navigate = useNavigate()
  const { isAuthenticated, login } = useAuth()
  const { toast } = useToast()

  const handleEntrarAdmin = async () => {
    if (isAuthenticated) {
      navigate('/dashboard')
      return
    }
    try {
      await login({ email: 'supremo@demo.app', password: 'Supremo123!' })
      toast.success('Acceso Autorizado', 'Iniciando en el panel como Administrador Supremo')
      navigate('/dashboard')
    } catch {
      navigate('/login')
    }
  }

  return (
    <section className="relative overflow-hidden bg-white dark:bg-neutral-950 pt-10 pb-10 sm:pt-20 sm:pb-16 border-b border-black/[0.05] dark:border-white/[0.06]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center space-y-6 sm:space-y-7">
        {/* Subtle pill badge */}
        <div className="inline-flex items-center gap-2 px-3 sm:px-3.5 py-1 sm:py-1.5 rounded-full bg-neutral-100 dark:bg-neutral-900 text-neutral-800 dark:text-neutral-200 text-[11px] sm:text-xs font-medium border border-neutral-200/80 dark:border-neutral-800">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Plataforma Empresarial Modular • Multi-Industria</span>
        </div>

        {/* Confident Headline */}
        <div className="space-y-3 sm:space-y-4">
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-neutral-900 dark:text-white leading-[1.12]">
            El software que se adapta a tu negocio,{' '}
            <span className="text-neutral-500 dark:text-neutral-400 font-normal">
              no tu negocio al software.
            </span>
          </h1>

          <p className="text-sm sm:text-base text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto leading-relaxed px-1 sm:px-0">
            Punto de venta táctil, agenda inteligente, expedientes de clientes y control de inventario en una interfaz limpia, rápida y agradable a la vista.
          </p>
        </div>

        {/* Primary Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5 sm:gap-3 pt-1">
          <button
            type="button"
            onClick={handleEntrarAdmin}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 sm:px-7 py-3 sm:py-3.5 rounded-full bg-neutral-900 hover:bg-neutral-800 text-white dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-100 font-semibold text-xs sm:text-sm shadow-md hover:shadow-lg transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <Sparkles className="w-4 h-4 text-amber-300 dark:text-amber-500" />
            <span>Probar Panel Completo (1 Clic)</span>
            <ArrowRight className="w-4 h-4 opacity-70" />
          </button>

          <button
            type="button"
            onClick={() => onSelectTab('modulos')}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 sm:px-6 py-3 sm:py-3.5 rounded-full bg-neutral-100 hover:bg-neutral-200/80 dark:bg-neutral-900 dark:hover:bg-neutral-800 text-neutral-900 dark:text-white border border-neutral-200/80 dark:border-neutral-800 font-semibold text-xs sm:text-sm transition-all"
          >
            <Layers className="w-4 h-4 text-neutral-500" />
            <span>Ver Directorio de 18 Módulos</span>
          </button>
        </div>

        {/* Apple Style Segmented Tab Switcher (Touch Scroll on Mobile) */}
        <div className="pt-2 sm:pt-4 overflow-x-auto scrollbar-none -mx-4 px-4 sm:mx-0 sm:px-0">
          <div className="inline-flex p-1 sm:p-1.5 rounded-2xl bg-neutral-100/90 dark:bg-neutral-900/90 border border-black/[0.04] dark:border-white/[0.06] flex-nowrap sm:flex-wrap justify-start sm:justify-center gap-1 shrink-0">
            <button
              type="button"
              onClick={() => onSelectTab('modulos')}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
                tabPrincipal === 'modulos'
                  ? 'bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white shadow-sm'
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Directorio de Módulos (18)</span>
            </button>

            <button
              type="button"
              onClick={() => onSelectTab('reservas')}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
                tabPrincipal === 'reservas'
                  ? 'bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white shadow-sm'
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Agendar Cita Online</span>
            </button>

            <button
              type="button"
              onClick={() => onSelectTab('productos')}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
                tabPrincipal === 'productos'
                  ? 'bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white shadow-sm'
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
              }`}
            >
              <Package className="w-3.5 h-3.5" />
              <span>Catálogo #PRD</span>
            </button>

            <button
              type="button"
              onClick={() => onSelectTab('hardware')}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
                tabPrincipal === 'hardware'
                  ? 'bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white shadow-sm'
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
              }`}
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Terminal & Impresión</span>
            </button>

            <button
              type="button"
              onClick={() => onSelectTab('verticales')}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
                tabPrincipal === 'verticales'
                  ? 'bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white shadow-sm'
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
              }`}
            >
              <Store className="w-3.5 h-3.5" />
              <span>Por Negocio</span>
            </button>
          </div>
        </div>

        {/* Quality Badges */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-4 max-w-3xl mx-auto text-left">
          <div className="flex items-center gap-2 text-xs text-neutral-700 dark:text-neutral-300 bg-neutral-50 dark:bg-neutral-900/60 p-2.5 rounded-xl border border-neutral-200/60 dark:border-neutral-800/60">
            <Printer className="w-3.5 h-3.5 text-neutral-800 dark:text-neutral-200 shrink-0" />
            <span className="truncate">Térmica Bluetooth (ESC/POS)</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-neutral-700 dark:text-neutral-300 bg-neutral-50 dark:bg-neutral-900/60 p-2.5 rounded-xl border border-neutral-200/60 dark:border-neutral-800/60">
            <Barcode className="w-3.5 h-3.5 text-neutral-800 dark:text-neutral-200 shrink-0" />
            <span className="truncate">Escáner & Códigos #PRD</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-neutral-700 dark:text-neutral-300 bg-neutral-50 dark:bg-neutral-900/60 p-2.5 rounded-xl border border-neutral-200/60 dark:border-neutral-800/60">
            <Zap className="w-3.5 h-3.5 text-neutral-800 dark:text-neutral-200 shrink-0" />
            <span className="truncate">PWA Táctil para Tablets</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-neutral-700 dark:text-neutral-300 bg-neutral-50 dark:bg-neutral-900/60 p-2.5 rounded-xl border border-neutral-200/60 dark:border-neutral-800/60">
            <ShieldCheck className="w-3.5 h-3.5 text-neutral-800 dark:text-neutral-200 shrink-0" />
            <span className="truncate">Multi-Sede & Marca Blanca</span>
          </div>
        </div>
      </div>
    </section>
  )
}
