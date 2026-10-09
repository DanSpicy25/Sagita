import { useState } from 'react'
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
  Menu,
  X,
  Zap,
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

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

  const handleNavClick = (tab: 'reservas' | 'productos' | 'hardware' | 'verticales' | 'modulos', anchorId?: string) => {
    onSelectTab(tab)
    setMobileMenuOpen(false)
    if (anchorId) {
      const el = document.getElementById(anchorId)
      if (el) el.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-[#d9d3c7] bg-[#f7f5f0] transition-colors duration-200 dark:border-zinc-800 dark:bg-[#171815]">
      <div className="mx-auto flex h-[4.25rem] w-full max-w-7xl items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
        {/* Marca y Logo */}
        <div className="flex items-center gap-3 shrink-0">
          {configuracion.logo_url ? (
            <img
              src={configuracion.logo_url}
              alt={nombreMarca}
              className="h-9 max-w-[140px] object-contain rounded-lg"
            />
          ) : (
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#334338] text-sm font-black tracking-tighter text-white dark:bg-[#d0b675] dark:text-[#25231d]">
              S
            </div>
          )}
          <div className="cursor-pointer" onClick={() => handleNavClick('reservas')}>
            <span className="font-bold text-base tracking-tight block leading-none text-neutral-900 dark:text-white">
              {nombreMarca}
            </span>
            <span className="text-[11px] text-neutral-500 dark:text-neutral-400 hidden sm:block tracking-normal mt-0.5">
              {lemaMarca || 'Plataforma Comercial & Operativa'}
            </span>
          </div>
        </div>

        {/* Segmented Control Central Desktop (Apple Style) */}
        <nav className="hidden items-center gap-1 lg:flex" aria-label="Navegación del portal">
          <button
            type="button"
            onClick={() => handleNavClick('reservas', 'reserva')}
            className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-2 text-xs font-semibold transition-all duration-200 ease-in-out hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#806331] ${
              tabPrincipal === 'reservas'
                ? 'bg-[#e7e2d8] text-[#3f3a30] dark:bg-zinc-800 dark:text-zinc-100'
                : 'text-neutral-600 hover:bg-[#ece8df] hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-zinc-800/70 dark:hover:text-white'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Portal público</span>
          </button>

          <button
            type="button"
            onClick={() => handleNavClick('productos')}
            className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-2 text-xs font-semibold transition-all duration-200 ease-in-out hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#806331] ${
              tabPrincipal === 'productos'
                ? 'bg-[#e7e2d8] text-[#3f3a30] dark:bg-zinc-800 dark:text-zinc-100'
                : 'text-neutral-600 hover:bg-[#ece8df] hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-zinc-800/70 dark:hover:text-white'
            }`}
          >
            <Package className="w-3.5 h-3.5" />
            <span>Catálogo #PRD ({totalProductos})</span>
          </button>

          <button
            type="button"
            onClick={() => handleNavClick('hardware', 'hardware')}
            className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-2 text-xs font-semibold transition-all duration-200 ease-in-out hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#806331] ${
              tabPrincipal === 'hardware'
                ? 'bg-[#e7e2d8] text-[#3f3a30] dark:bg-zinc-800 dark:text-zinc-100'
                : 'text-neutral-600 hover:bg-[#ece8df] hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-zinc-800/70 dark:hover:text-white'
            }`}
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Hardware POS</span>
          </button>

          <button
            type="button"
            onClick={() => handleNavClick('verticales', 'sectores')}
            className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-2 text-xs font-semibold transition-all duration-200 ease-in-out hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#806331] ${
              tabPrincipal === 'verticales'
                ? 'bg-[#e7e2d8] text-[#3f3a30] dark:bg-zinc-800 dark:text-zinc-100'
                : 'text-neutral-600 hover:bg-[#ece8df] hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-zinc-800/70 dark:hover:text-white'
            }`}
          >
            <Store className="w-3.5 h-3.5" />
            <span>Por Sector</span>
          </button>

          <button
            type="button"
            onClick={() => handleNavClick('modulos', 'modulos')}
            className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-2 text-xs font-semibold transition-all duration-200 ease-in-out hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#806331] ${
              tabPrincipal === 'modulos'
                ? 'bg-[#e7e2d8] text-[#3f3a30] dark:bg-zinc-800 dark:text-zinc-100'
                : 'text-neutral-600 hover:bg-[#ece8df] hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-zinc-800/70 dark:hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Módulos (18)</span>
          </button>
        </nav>

        {/* Acciones Rápidas del Header */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
          <div className="hidden xl:block">
            <TenantSelector />
          </div>

          <Link
            to="/demo"
            className="hidden items-center gap-1.5 rounded-md px-2.5 py-2 text-xs font-semibold text-[#56684d] transition-all duration-200 ease-in-out hover:-translate-y-0.5 hover:bg-[#e8e4da] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#806331] dark:text-[#b9c8af] dark:hover:bg-zinc-800 xl:inline-flex"
            title="Explorar el Demo Center Interactivo para Ventas"
          >
            <Sparkles className="h-4 w-4" />
            <span>Demo Center</span>
          </Link>

          <Link
            to="/ventas"
            className="hidden items-center gap-1.5 rounded-md px-2.5 py-2 text-xs font-semibold text-neutral-700 transition-all duration-200 ease-in-out hover:-translate-y-0.5 hover:bg-[#e8e4da] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#806331] dark:text-neutral-300 dark:hover:bg-zinc-800 xl:inline-flex"
          >
            <ShoppingCart className="w-3.5 h-3.5" />
            <span>Abrir POS</span>
          </Link>

          <button
            type="button"
            onClick={handleAccesoRapido}
            className="inline-flex min-h-10 items-center gap-1.5 rounded-lg bg-[#806331] px-3.5 py-2 text-xs font-bold text-white transition-all duration-200 ease-in-out hover:-translate-y-0.5 hover:bg-[#6d5329] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#806331] focus-visible:ring-offset-2 active:translate-y-0 dark:bg-[#b99a5c] dark:text-[#211d15] dark:hover:bg-[#c8aa6a]"
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

          {/* Botón Menú Móvil */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="rounded-lg p-2 text-neutral-700 transition-all duration-200 ease-in-out hover:-translate-y-0.5 hover:bg-[#e8e4da] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#806331] dark:text-neutral-300 dark:hover:bg-zinc-800 lg:hidden"
            aria-label={mobileMenuOpen ? 'Cerrar menú de navegación' : 'Abrir menú de navegación'}
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      </header>

      {/* Navegación móvil lateral */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        >
          <aside
            className="absolute inset-y-0 left-0 w-[min(88vw,360px)] overflow-y-auto bg-white dark:bg-[#121214] border-r border-zinc-200 dark:border-zinc-800 shadow-xl p-4 pt-[max(1rem,env(safe-area-inset-top))]"
            onClick={(event) => event.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label="Navegación principal"
          >
            <div className="flex items-center justify-between gap-3 pb-4 mb-2 border-b border-zinc-200 dark:border-zinc-800">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-9 h-9 shrink-0 rounded-xl bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 flex items-center justify-center font-bold">S</div>
                <div className="min-w-0">
                  <span className="block text-sm font-semibold text-zinc-900 dark:text-zinc-100 truncate">{nombreMarca}</span>
                  <span className="block text-[11px] text-zinc-500 dark:text-zinc-400">Menú principal</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 rounded-lg text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                aria-label="Cerrar menú"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          <button
            type="button"
            onClick={() => handleNavClick('reservas', 'reserva')}
            className="w-full p-2.5 rounded-xl text-xs font-semibold text-left flex items-center justify-between text-neutral-800 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-900"
          >
            <div className="flex items-center gap-2.5">
              <Calendar className="w-4 h-4 text-zinc-500" />
              <span>Ver catálogo y reservas</span>
            </div>
            <span className="text-[10px] text-zinc-500 font-bold uppercase">Portal</span>
          </button>

          <button
            type="button"
            onClick={() => handleNavClick('reservas', 'simulador')}
            className="w-full p-2.5 rounded-xl text-xs font-semibold text-left flex items-center gap-2.5 text-neutral-800 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-900"
          >
            <Zap className="w-4 h-4 text-zinc-500" />
            <span>Simulador de Interfaz</span>
          </button>

          <button
            type="button"
            onClick={() => handleNavClick('reservas', 'capacidades')}
            className="w-full p-2.5 rounded-xl text-xs font-semibold text-left flex items-center gap-2.5 text-neutral-800 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-900"
          >
            <Layers className="w-4 h-4 text-zinc-500" />
            <span>Capacidades del Sistema</span>
          </button>

          <button
            type="button"
            onClick={() => handleNavClick('verticales', 'sectores')}
            className="w-full p-2.5 rounded-xl text-xs font-semibold text-left flex items-center gap-2.5 text-neutral-800 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-900"
          >
            <Store className="w-4 h-4 text-zinc-500" />
            <span>Por Sector / Industria</span>
          </button>

          <button
            type="button"
            onClick={() => handleNavClick('modulos', 'modulos')}
            className="w-full p-2.5 rounded-xl text-xs font-semibold text-left flex items-center gap-2.5 text-neutral-800 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-900"
          >
            <Layers className="w-4 h-4 text-zinc-500" />
            <span>Catálogo de 18 Módulos</span>
          </button>

          <button
            type="button"
            onClick={() => handleNavClick('hardware', 'hardware')}
            className="w-full p-2.5 rounded-xl text-xs font-semibold text-left flex items-center gap-2.5 text-neutral-800 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-900"
          >
            <Printer className="w-4 h-4 text-zinc-500" />
            <span>Hardware POS & Impresión</span>
          </button>

          <button
            type="button"
            onClick={() => handleNavClick('productos')}
            className="w-full p-2.5 rounded-xl text-xs font-semibold text-left flex items-center gap-2.5 text-neutral-800 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-900"
          >
            <Package className="w-4 h-4 text-zinc-500" />
            <span>Catálogo #PRD ({totalProductos})</span>
          </button>

          <div className="pt-3 border-t border-zinc-200 dark:border-zinc-800 flex items-center gap-2">
            <Link
              to="/demo"
              className="flex-1 py-2 px-3 rounded-xl text-xs font-bold text-center bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
              onClick={() => setMobileMenuOpen(false)}
            >
              Demo Center
            </Link>
            <Link
              to="/ventas"
              className="flex-1 py-2 px-3 rounded-xl text-xs font-bold text-center bg-neutral-100 dark:bg-neutral-900 text-text border border-border"
              onClick={() => setMobileMenuOpen(false)}
            >
              Abrir POS
            </Link>
          </div>
          </aside>
        </div>
      )}
    </>
  )
}
