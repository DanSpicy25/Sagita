import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  CalendarDays,
  Plus,
  ShoppingCart,
  Menu,
} from 'lucide-react'

export interface BottomNavProps {
  onOpenQuickActions: () => void
  onToggleDrawer: () => void
}

export function BottomNav({
  onOpenQuickActions,
  onToggleDrawer,
}: BottomNavProps) {
  return (
    <nav
      className="md:hidden fixed bottom-[max(0.75rem,env(safe-area-inset-bottom))] inset-x-3 sm:inset-x-auto sm:left-1/2 sm:-translate-x-1/2 z-40 max-w-md w-[calc(100%-1.5rem)] sm:w-auto ios-dock p-1.5 px-2.5 transition-all select-none"
      aria-label="Navegación móvil"
    >
      <div className="flex items-center justify-around gap-1">
        {/* 1. Inicio */}
        <NavLink
          to="/dashboard"
          className={({ isActive }) =>
            `flex flex-col items-center justify-center py-1.5 px-3 rounded-2xl transition-all cursor-pointer min-w-[58px] ios-press ${
              isActive
                ? 'bg-primary/10 text-primary font-bold shadow-2xs'
                : 'text-text-muted hover:text-text hover:bg-black/[0.03] dark:hover:bg-white/[0.05]'
            }`
          }
        >
          {({ isActive }) => (
            <>
              <div
                className={`transition-transform duration-200 ${
                  isActive ? 'scale-110' : ''
                }`}
              >
                <LayoutDashboard className="w-5 h-5 stroke-[2.2]" />
              </div>
              <span className="text-[10px] mt-0.5 font-medium leading-none tracking-tight">
                Inicio
              </span>
            </>
          )}
        </NavLink>

        {/* 2. Agenda */}
        <NavLink
          to="/citas"
          className={({ isActive }) =>
            `flex flex-col items-center justify-center py-1.5 px-3 rounded-2xl transition-all cursor-pointer min-w-[58px] ios-press ${
              isActive
                ? 'bg-primary/10 text-primary font-bold shadow-2xs'
                : 'text-text-muted hover:text-text hover:bg-black/[0.03] dark:hover:bg-white/[0.05]'
            }`
          }
        >
          {({ isActive }) => (
            <>
              <div
                className={`transition-transform duration-200 ${
                  isActive ? 'scale-110' : ''
                }`}
              >
                <CalendarDays className="w-5 h-5 stroke-[2.2]" />
              </div>
              <span className="text-[10px] mt-0.5 font-medium leading-none tracking-tight">
                Agenda
              </span>
            </>
          )}
        </NavLink>

        {/* Quick action */}
        <div className="flex flex-col items-center justify-center -mt-4 min-w-[60px]">
          <button
            type="button"
            onClick={onOpenQuickActions}
            aria-label="Abrir acciones rápidas"
            className="flex h-12 w-12 items-center justify-center rounded-full border-4 border-[#f2f2f7] bg-primary text-white shadow-md transition-transform duration-200 hover:scale-105 active:scale-95 dark:border-[#000000] cursor-pointer group"
          >
            <Plus className="w-5 h-5 stroke-[2.5] transition-transform duration-200 group-active:rotate-90" aria-hidden="true" />
          </button>
          <span className="text-[10px] font-bold text-text-muted mt-0.5 leading-none">
            Rápido
          </span>
        </div>

        {/* 4. POS / Ventas */}
        <NavLink
          to="/ventas"
          className={({ isActive }) =>
            `flex flex-col items-center justify-center py-1.5 px-3 rounded-2xl transition-all cursor-pointer min-w-[58px] ios-press ${
              isActive
                ? 'bg-primary/10 text-primary font-bold shadow-2xs'
                : 'text-text-muted hover:text-text hover:bg-black/[0.03] dark:hover:bg-white/[0.05]'
            }`
          }
        >
          {({ isActive }) => (
            <>
              <div
                className={`transition-transform duration-200 ${
                  isActive ? 'scale-110' : ''
                }`}
              >
                <ShoppingCart className="w-5 h-5 stroke-[2.2]" />
              </div>
              <span className="text-[10px] mt-0.5 font-medium leading-none tracking-tight">
                POS
              </span>
            </>
          )}
        </NavLink>

        {/* 5. Menú Drawer Trigger */}
        <button
          type="button"
          onClick={onToggleDrawer}
          aria-label="Abrir menú de navegación completo"
          className="flex flex-col items-center justify-center py-1.5 px-3 rounded-2xl text-text-muted hover:text-text hover:bg-black/[0.03] dark:hover:bg-white/[0.05] transition-all cursor-pointer min-w-[58px] ios-press"
        >
          <Menu className="w-5 h-5 stroke-[2.2]" />
          <span className="text-[10px] mt-0.5 font-medium leading-none tracking-tight">
            Más
          </span>
        </button>
      </div>
    </nav>
  )
}
