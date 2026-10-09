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
      className="md:hidden fixed bottom-0 inset-x-0 z-30 bg-surface/95 text-text border-t border-border shadow-elevated backdrop-blur px-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-1"
      aria-label="Navegación móvil inferior"
    >
      <div className="flex items-center justify-around max-w-md mx-auto">
        {/* 1. Inicio */}
        <NavLink
          to="/dashboard"
          className={({ isActive }) =>
            `flex flex-col items-center justify-center py-1 px-2.5 rounded-lg transition-colors cursor-pointer min-w-[56px] ${
              isActive
                ? 'text-primary font-semibold'
                : 'text-text-muted hover:text-text'
            }`
          }
        >
          {({ isActive }) => (
            <>
              <div
                className={`p-1 rounded-md transition-colors ${
                  isActive ? 'bg-primary-soft' : ''
                }`}
              >
                <LayoutDashboard className="w-5 h-5" />
              </div>
              <span className="text-[10px] mt-0.5 leading-none">Inicio</span>
            </>
          )}
        </NavLink>

        {/* 2. Agenda */}
        <NavLink
          to="/citas"
          className={({ isActive }) =>
            `flex flex-col items-center justify-center py-1 px-2.5 rounded-lg transition-colors cursor-pointer min-w-[56px] ${
              isActive
                ? 'text-primary font-semibold'
                : 'text-text-muted hover:text-text'
            }`
          }
        >
          {({ isActive }) => (
            <>
              <div
                className={`p-1 rounded-md transition-colors ${
                  isActive ? 'bg-primary-soft' : ''
                }`}
              >
                <CalendarDays className="w-5 h-5" />
              </div>
              <span className="text-[10px] mt-0.5 leading-none">Agenda</span>
            </>
          )}
        </NavLink>

        {/* 3. Central Quick Action Button (+) */}
        <div className="flex flex-col items-center justify-center -mt-4 min-w-[56px]">
          <button
            type="button"
            onClick={onOpenQuickActions}
            aria-label="Abrir acciones rápidas"
            className="w-12 h-12 rounded-full bg-primary hover:bg-primary-hover text-white shadow-md flex items-center justify-center border-2 border-surface transition-transform duration-150 active:scale-90 cursor-pointer"
          >
            <Plus className="w-6 h-6 stroke-[2.5]" aria-hidden="true" />
          </button>
          <span className="text-[10px] font-medium text-text-muted mt-0.5 leading-none">
            Rápido
          </span>
        </div>

        {/* 4. POS / Caja */}
        <NavLink
          to="/ventas"
          className={({ isActive }) =>
            `flex flex-col items-center justify-center py-1 px-2.5 rounded-lg transition-colors cursor-pointer min-w-[56px] ${
              isActive
                ? 'text-primary font-semibold'
                : 'text-text-muted hover:text-text'
            }`
          }
        >
          {({ isActive }) => (
            <>
              <div
                className={`p-1 rounded-md transition-colors ${
                  isActive ? 'bg-primary-soft' : ''
                }`}
              >
                <ShoppingCart className="w-5 h-5" />
              </div>
              <span className="text-[10px] mt-0.5 leading-none">POS</span>
            </>
          )}
        </NavLink>

        {/* 5. Menú Drawer Trigger */}
        <button
          type="button"
          onClick={onToggleDrawer}
          aria-label="Abrir menú de navegación completo"
          className="flex flex-col items-center justify-center py-1 px-2.5 rounded-lg text-text-muted hover:text-text transition-colors cursor-pointer min-w-[56px]"
        >
          <div className="p-1 rounded-md">
            <Menu className="w-5 h-5" />
          </div>
          <span className="text-[10px] mt-0.5 leading-none">Más</span>
        </button>
      </div>
    </nav>
  )
}

