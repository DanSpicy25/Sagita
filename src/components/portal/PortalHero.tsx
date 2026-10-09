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
import { useSector, SectorId } from '@/context/SectorContext'

export interface PortalHeroProps {
  tabPrincipal: 'reservas' | 'productos' | 'hardware' | 'verticales' | 'modulos'
  onSelectTab: (tab: 'reservas' | 'productos' | 'hardware' | 'verticales' | 'modulos') => void
}

export function PortalHero({ tabPrincipal, onSelectTab }: PortalHeroProps) {
  const navigate = useNavigate()
  const { isAuthenticated, login } = useAuth()
  const { toast } = useToast()
  const { sector, setSector, allSectors, playTactileClick } = useSector()

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
    <section className="relative overflow-hidden bg-[#F8F9FA] dark:bg-[#09090B] py-10 sm:py-14 border-b border-zinc-200/80 dark:border-zinc-800">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
        {/* Subtle pill badge */}
        <div className="inline-flex items-center gap-2 px-3 sm:px-3.5 py-1 sm:py-1.5 rounded-full bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 text-[11px] sm:text-xs font-medium border border-zinc-200/80 dark:border-zinc-800">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Plataforma Empresarial Modular • Multi-Industria</span>
        </div>

        {/* Confident Headline */}
        <div className="space-y-3 sm:space-y-4">
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 leading-[1.08]">
            Tu negocio, a tu manera.
            <span className="block text-zinc-500 dark:text-zinc-400 font-normal mt-2">
              Todo lo importante, en un solo lugar.
            </span>
          </h1>

          <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto leading-relaxed px-1 sm:px-0">
            Ventas, inventario, equipo y atención conectados en una experiencia sencilla, cómoda y lista para crecer contigo.
          </p>
        </div>

        {/* Primary Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5 sm:gap-3 pt-1">
          <button
            type="button"
            onClick={() => {
              const el = document.getElementById('simulador')
              if (el) el.scrollIntoView({ behavior: 'smooth' })
            }}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 sm:px-7 py-3 sm:py-3.5 rounded-full bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white font-semibold text-xs sm:text-sm shadow-xs transition-all active:scale-[0.98]"
          >
            <Store className="w-4 h-4" />
            <span>Explorar Sagitta</span>
            <ArrowRight className="w-4 h-4 opacity-70" />
          </button>

          <button
            type="button"
            onClick={() => {
              onSelectTab('reservas')
              const el = document.getElementById('reserva') || document.getElementById('servicios')
              if (el) el.scrollIntoView({ behavior: 'smooth' })
            }}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 sm:px-7 py-3 sm:py-3.5 rounded-full bg-white dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-900 dark:text-white border border-zinc-200/90 dark:border-zinc-800 font-semibold text-xs sm:text-sm shadow-xs transition-all active:scale-[0.98]"
          >
            <Calendar className="w-4 h-4" />
            <span>Ver catálogo y reservas</span>
          </button>

          <button
            type="button"
            onClick={handleEntrarAdmin}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 sm:px-6 py-3 sm:py-3.5 rounded-full bg-zinc-100 hover:bg-zinc-200/80 dark:bg-zinc-900 dark:hover:bg-zinc-800 text-zinc-800 dark:text-zinc-200 border border-zinc-200/80 dark:border-zinc-800 font-semibold text-xs sm:text-sm transition-all"
          >
            <Sparkles className="w-4 h-4 text-zinc-600 dark:text-zinc-400" />
            <span>Panel Demo (1 Clic)</span>
          </button>

          <button
            type="button"
            onClick={() => navigate('/demo')}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 sm:px-6 py-3 sm:py-3.5 rounded-full bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 text-zinc-800 dark:text-zinc-200 border border-zinc-200/80 dark:border-zinc-800 font-semibold text-xs sm:text-sm shadow-xs transition-all active:scale-[0.98]"
          >
            <Sparkles className="w-4 h-4 text-zinc-600 dark:text-zinc-400" />
            <span>Demo Center (Ventas)</span>
          </button>
        </div>

        <div className="pt-1 space-y-2">
          <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Elige tu sector para ver Sagitta en acción</p>
          <div className="overflow-x-auto scrollbar-none -mx-4 px-4 sm:mx-0 sm:px-0">
            <div className="inline-flex p-1 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 flex-nowrap sm:flex-wrap justify-start sm:justify-center gap-1">
              {allSectors.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    playTactileClick()
                    setSector(item.id as SectorId)
                  }}
                  aria-pressed={sector === item.id}
                  className={`px-3 sm:px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 whitespace-nowrap ${
                    sector === item.id
                      ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 shadow-sm'
                      : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-zinc-100'
                  }`}
                >
                  <span>{item.iconEmoji}</span>
                  <span>{item.id === 'gastronomia' ? 'Gastronomía & Comida Rápida' : item.id === 'retail' ? 'Retail & Moda' : item.id === 'farmacia' ? 'Farmacias' : 'Spas & Estética'}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="pt-2 sm:pt-4 overflow-x-auto scrollbar-none -mx-4 px-4 sm:mx-0 sm:px-0">
          <div className="inline-flex p-1 sm:p-1.5 rounded-2xl bg-zinc-100 dark:bg-zinc-900/80 border border-zinc-200/80 dark:border-zinc-800 flex-nowrap sm:flex-wrap justify-start sm:justify-center gap-1 shrink-0">
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
              <span>{sector === 'spa' ? 'Citas & Agenda' : 'Catálogo público'}</span>
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
              <span>Módulos (18)</span>
            </button>
          </div>
        </div>

        {/* Quality Badges */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-4 w-full max-w-7xl mx-auto text-left">
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
