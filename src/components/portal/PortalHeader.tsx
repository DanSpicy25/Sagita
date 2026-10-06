import { Link, useNavigate } from 'react-router-dom'
import {
  Sparkles,
  ShoppingCart,
  Package,
  Printer,
  LayoutDashboard,
  Store,
  Calendar,
  Layers,
} from 'lucide-react'
import { TenantSelector } from '@/components/crm/TenantSelector'
import { useAuth } from '@/hooks/useAuth'
import { useToast } from '@/hooks/useToast'
import type { ConfiguracionMarcaBlanca, User } from '@/types'

export interface PortalHeaderProps {
  configuracion: ConfiguracionMarcaBlanca
  nombreMarca: string
  lemaMarca?: string
  isAuthenticated: boolean
  user: User | null
  tabPrincipal: 'reservas' | 'productos' | 'hardware' | 'verticales' | 'modulos'
  onSelectTab: (tab: 'reservas' | 'productos' | 'hardware' | 'verticales' | 'modulos') => void
  totalProductos: number
}

export function PortalHeader({
  configuracion,
  nombreMarca,
  lemaMarca,
  isAuthenticated,
  user,
  tabPrincipal,
  onSelectTab,
  totalProductos,
}: PortalHeaderProps) {
  const navigate = useNavigate()
  const { login } = useAuth()
  const { toast } = useToast()

  const handleAccesoRapido = async () => {
    if (isAuthenticated) {
      navigate('/dashboard')
      return
    }
    try {
      await login({ email: 'supremo@demo.app', password: 'Supremo123!' })
      toast.success('Sesión iniciada', 'Acceso autorizado como Administrador Supremo')
      navigate('/dashboard')
    } catch {
      navigate('/login')
    }
  }

  return (
    <header className="sticky top-0 z-50 backdrop-blur-xl bg-white/85 dark:bg-neutral-950/85 border-b border-black/[0.06] dark:border-white/[0.08] transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Marca y Logo */}
        <div className="flex items-center gap-3 shrink-0">
          {configuracion.logo_url ? (
            <img
              src={configuracion.logo_url}
              alt={nombreMarca}
              className="h-9 max-w-[140px] object-contain rounded-lg"
            />
          ) : (
            <div className="w-9 h-9 rounded-xl bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 flex items-center justify-center font-black tracking-tighter text-sm shadow-sm">
              S
            </div>
          )}
          <div className="cursor-pointer" onClick={() => onSelectTab('reservas')}>
            <span className="font-bold text-base tracking-tight block leading-none text-neutral-900 dark:text-white">
              {nombreMarca}
            </span>
            <span className="text-[11px] text-neutral-500 dark:text-neutral-400 hidden sm:block tracking-normal mt-0.5">
              {lemaMarca || 'Plataforma Comercial & Operativa'}
            </span>
          </div>
        </div>

        {/* Segmented Control Central (Apple Style) */}
        <nav className="hidden lg:flex items-center bg-neutral-100/90 dark:bg-neutral-900/90 p-1 rounded-full border border-black/[0.04] dark:border-white/[0.06]">
          <button
            type="button"
            onClick={() => onSelectTab('reservas')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all flex items-center gap-1.5 ${
              tabPrincipal === 'reservas'
                ? 'bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white shadow-sm'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Citas & Agenda</span>
          </button>

          <button
            type="button"
            onClick={() => onSelectTab('productos')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all flex items-center gap-1.5 ${
              tabPrincipal === 'productos'
                ? 'bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white shadow-sm'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
            }`}
          >
            <Package className="w-3.5 h-3.5" />
            <span>Catálogo #PRD ({totalProductos})</span>
          </button>

          <button
            type="button"
            onClick={() => onSelectTab('hardware')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all flex items-center gap-1.5 ${
              tabPrincipal === 'hardware'
                ? 'bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white shadow-sm'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
            }`}
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Hardware POS</span>
          </button>

          <button
            type="button"
            onClick={() => onSelectTab('verticales')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all flex items-center gap-1.5 ${
              tabPrincipal === 'verticales'
                ? 'bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white shadow-sm'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
            }`}
          >
            <Store className="w-3.5 h-3.5" />
            <span>Negocios</span>
          </button>

          <button
            type="button"
            onClick={() => onSelectTab('modulos')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all flex items-center gap-1.5 ${
              tabPrincipal === 'modulos'
                ? 'bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white shadow-sm'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Módulos (18)</span>
          </button>
        </nav>

        {/* Acciones Rápidas del Header */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
          <TenantSelector />

          <Link
            to="/ventas"
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-900 dark:hover:bg-neutral-800 text-neutral-800 dark:text-neutral-200 transition-colors"
          >
            <ShoppingCart className="w-3.5 h-3.5" />
            <span>Abrir POS</span>
          </Link>

          <button
            type="button"
            onClick={handleAccesoRapido}
            className="inline-flex items-center gap-1.5 px-3 sm:px-3.5 py-1.5 rounded-full text-xs font-semibold bg-neutral-900 hover:bg-neutral-800 text-white dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-100 shadow-sm transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            {isAuthenticated ? (
              <>
                <LayoutDashboard className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Panel ({user?.nombre ? user.nombre.split(' ')[0] : 'Admin'})</span>
                <span className="sm:hidden">Panel</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span className="hidden sm:inline">Panel Admin (1 Clic)</span>
                <span className="sm:hidden">Demo</span>
              </>
            )}
          </button>
        </div>
      </div>
    </header>
  )
}
