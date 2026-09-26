import { Menu, Sun, Moon, LogOut, User } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useContext } from 'react'
import { AppContext } from '@/context/AppContext'
import { Button } from '@/components/ui'
import { CentroNotificaciones } from '@/components/integraciones'
import { useConfiguracion } from '@/hooks/useConfiguracion'
import { TenantSelector, I18nSelector } from '@/components/crm'

export function Navbar() {
  const { user, logout } = useAuth()
  const app = useContext(AppContext)
  const { configuracion, nombreMarca } = useConfiguracion()

  const toggleTheme = () => {
    if (!app) return
    app.setTheme(app.theme === 'dark' ? 'light' : 'dark')
  }

  const logoUrl =
    app?.theme === 'dark' && configuracion.logo_dark_url
      ? configuracion.logo_dark_url
      : configuracion.logo_url

  return (
    <header className="h-16 flex items-center justify-between px-6 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 sticky top-0 z-30">
      {/* Left */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={() => app?.toggleSidebar()} aria-label="Toggle sidebar">
          <Menu className="w-5 h-5" />
        </Button>
        {logoUrl ? (
          <img
            src={logoUrl}
            alt={nombreMarca}
            className="h-8 max-w-[140px] object-contain"
          />
        ) : (
          <span className="font-bold text-primary-600 text-lg tracking-tight">
            {nombreMarca}
          </span>
        )}

        {/* Multi-Tenant Switcher */}
        <div className="hidden md:block pl-2 border-l border-slate-200 dark:border-slate-700">
          <TenantSelector />
        </div>
      </div>

      {/* Right */}
      <div className="flex items-center gap-2">
        {/* Selector de Idioma (i18n) */}
        <I18nSelector />

        {/* Notificaciones */}
        <CentroNotificaciones />

        {/* Tema */}
        <Button variant="ghost" size="sm" onClick={toggleTheme} aria-label="Cambiar tema">
          {app?.theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </Button>

        {/* Usuario */}
        <div className="flex items-center gap-2 pl-2 border-l border-slate-200 dark:border-slate-700 ml-1">
          <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center">
            {user?.avatar ? (
              <img src={user.avatar} alt={user.nombre} className="w-8 h-8 rounded-full object-cover" />
            ) : (
              <User className="w-4 h-4 text-primary-600" />
            )}
          </div>
          <div className="hidden md:block">
            <p className="text-sm font-medium leading-tight">{user?.nombre}</p>
            <p className="text-xs text-slate-400 capitalize">{user?.rol}</p>
          </div>
          <Button variant="ghost" size="sm" onClick={logout} aria-label="Cerrar sesión">
            <LogOut className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </header>
  )
}

