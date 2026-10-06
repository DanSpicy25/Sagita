import { Link } from 'react-router-dom'
import {
  Sparkles,
  ShoppingCart,
  Package,
  Printer,
  LayoutDashboard,
  Lock,
  Store,
  Calendar,
} from 'lucide-react'
import { TenantSelector } from '@/components/crm/TenantSelector'
import { Button } from '@/components/ui'
import type { ConfiguracionMarcaBlanca, User } from '@/types'

export interface PortalHeaderProps {
  configuracion: ConfiguracionMarcaBlanca
  nombreMarca: string
  lemaMarca?: string
  isAuthenticated: boolean
  user: User | null
  tabPrincipal: 'reservas' | 'productos' | 'hardware' | 'verticales'
  onSelectTab: (tab: 'reservas' | 'productos' | 'hardware' | 'verticales') => void
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
  return (
    <>
      {/* ─── 0. BARRA SUPERIOR DE ACCESO EMPRESARIAL / SOCIOS ────────────────── */}
      <div className="bg-slate-900 text-slate-300 text-xs border-b border-slate-800 py-2 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span className="flex items-center gap-1.5 font-bold tracking-wider uppercase text-amber-400 bg-amber-950/60 border border-amber-800/60 px-2 py-0.5 rounded text-[11px]">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              Sagitta Enterprise POS
            </span>
            <span className="hidden lg:inline text-slate-400 text-xs">
              Multi-Comercio: Estéticas • Comida Rápida • Retail & Minimarkets • Clínicas
            </span>
          </div>

          <div className="flex items-center gap-2.5 overflow-x-auto scrollbar-none">
            <Link
              to="/ventas"
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-950/70 border border-emerald-800/70 hover:bg-emerald-900/60 text-emerald-300 font-semibold transition-colors"
            >
              <ShoppingCart className="w-3.5 h-3.5" />
              <span>Abrir POS</span>
            </Link>

            <Link
              to="/inventario"
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-800 border border-slate-700 hover:bg-slate-700 text-slate-200 font-medium transition-colors"
            >
              <Package className="w-3.5 h-3.5 text-blue-400" />
              <span>Inventario (#PRD)</span>
            </Link>

            <Link
              to="/hardware"
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-800 border border-slate-700 hover:bg-slate-700 text-slate-200 font-medium transition-colors"
            >
              <Printer className="w-3.5 h-3.5 text-indigo-400" />
              <span>Hardware & Bluetooth</span>
            </Link>

            {isAuthenticated ? (
              <Link
                to="/dashboard"
                className="flex items-center gap-1.5 px-3 py-1 rounded-md bg-primary-600 hover:bg-primary-500 text-white font-semibold transition-colors shadow-sm"
              >
                <LayoutDashboard className="w-3.5 h-3.5" />
                <span>Panel Admin ({user?.nombre ?? 'Staff'})</span>
              </Link>
            ) : (
              <Link
                to="/login"
                className="flex items-center gap-1.5 px-3 py-1 rounded-md bg-primary-600 hover:bg-primary-500 text-white font-semibold transition-colors shadow-sm"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Acceso Staff / Login</span>
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* ─── 1. NAVBAR COMERCIAL ────────────────────────────────────────────── */}
      <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
          {/* Logo y Nombre de Marca (White Label) */}
          <div className="flex items-center gap-3">
            {configuracion.logo_url ? (
              <img
                src={configuracion.logo_url}
                alt={nombreMarca}
                className="h-10 max-w-[160px] object-contain"
              />
            ) : (
              <div className="w-10 h-10 rounded-xl bg-primary-600 flex items-center justify-center text-white shadow-md shadow-primary-500/30">
                <Store className="w-5 h-5" />
              </div>
            )}
            <div>
              <span className="font-bold text-lg tracking-tight block leading-tight text-slate-900 dark:text-white">
                {nombreMarca}
              </span>
              {lemaMarca && (
                <span className="text-xs text-slate-500 dark:text-slate-400 hidden sm:block">
                  {lemaMarca}
                </span>
              )}
            </div>
          </div>

          {/* Menú central por vistas */}
          <nav className="hidden md:flex items-center gap-2 text-sm font-medium">
            <button
              type="button"
              onClick={() => onSelectTab('reservas')}
              className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
                tabPrincipal === 'reservas'
                  ? 'bg-primary-50 dark:bg-primary-950/70 text-primary-600 dark:text-primary-400 font-semibold'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Calendar className="w-4 h-4 text-primary-500" />
              Citas & Agenda
            </button>
            <button
              type="button"
              onClick={() => onSelectTab('productos')}
              className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
                tabPrincipal === 'productos'
                  ? 'bg-primary-50 dark:bg-primary-950/70 text-primary-600 dark:text-primary-400 font-semibold'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Package className="w-4 h-4 text-blue-500" />
              Catálogo #PRD ({totalProductos})
            </button>
            <button
              type="button"
              onClick={() => onSelectTab('hardware')}
              className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
                tabPrincipal === 'hardware'
                  ? 'bg-primary-50 dark:bg-primary-950/70 text-primary-600 dark:text-primary-400 font-semibold'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Printer className="w-4 h-4 text-indigo-500" />
              Hardware POS
            </button>
            <button
              type="button"
              onClick={() => onSelectTab('verticales')}
              className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
                tabPrincipal === 'verticales'
                  ? 'bg-primary-50 dark:bg-primary-950/70 text-primary-600 dark:text-primary-400 font-semibold'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Store className="w-4 h-4 text-emerald-500" />
              Negocios
            </button>
          </nav>

          {/* Acciones derechas */}
          <div className="flex items-center gap-2 sm:gap-3">
            <TenantSelector />

            <Link to="/ventas">
              <Button size="sm" className="hidden sm:inline-flex items-center gap-1.5 shadow-sm bg-emerald-600 hover:bg-emerald-700 text-white">
                <ShoppingCart className="w-3.5 h-3.5" />
                <span>Abrir POS</span>
              </Button>
            </Link>

            {isAuthenticated ? (
              <Link to="/dashboard">
                <Button size="sm" variant="outline" className="items-center gap-1.5">
                  <LayoutDashboard className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Panel</span>
                </Button>
              </Link>
            ) : (
              <Link to="/login">
                <Button size="sm" variant="outline" className="items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Staff</span>
                </Button>
              </Link>
            )}
          </div>
        </div>
      </header>
    </>
  )
}
