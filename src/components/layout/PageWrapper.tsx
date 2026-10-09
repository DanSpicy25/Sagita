import React, { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Navbar } from './Navbar'
import { Sidebar } from './Sidebar'
import { BottomNav } from './BottomNav'
import { MobileDrawer } from './MobileDrawer'
import { MobileQuickActionsSheet } from './MobileQuickActionsSheet'
import { CommandMenu } from './CommandMenu'
import { Breadcrumbs, ToastContainer } from '@/components/ui'
import { MODULES } from '@/config/modules'
import type { BreadcrumbItem } from '@/components/ui'

interface PageWrapperProps {
  children: React.ReactNode
}

// Route metadata for dynamic breadcrumbs
const KNOWN_ROUTES: Record<string, { label: string; parent?: { label: string; href: string } }> = {
  '/dashboard': { label: 'Panel de Control' },
  '/citas': { label: 'Agenda y Calendario' },
  '/citas/nueva': { label: 'Nueva Cita', parent: { label: 'Agenda', href: '/citas' } },
  '/recepcion': { label: 'Recepción & Mostrador' },
  '/servicios': { label: 'Catálogo de Servicios' },
  '/empleados': { label: 'Equipo & Personal' },
  '/recursos': { label: 'Recursos & Cabinas' },
  '/clientes': { label: 'Directorio de Clientes' },
  '/ventas': { label: 'Punto de Venta (POS)' },
  '/finanzas': { label: 'Facturación & Cobros' },
  '/inventario': { label: 'Inventario & Productos' },
  '/automatizaciones': { label: 'Automatizaciones' },
  '/reportes': { label: 'Reportes & Analítica' },
  '/usuarios': { label: 'Gestión de Usuarios' },
  '/roles': { label: 'Roles & Permisos' },
  '/integraciones': { label: 'Integraciones' },
  '/desarrolladores': { label: 'Desarrolladores & API' },
  '/modulos': { label: 'Módulos por Sector' },
  '/configuracion': { label: 'Configuración de Marca' },
  '/crm': { label: 'CRM & Pipeline' },
  '/hardware': { label: 'Banco de Hardware' },
}

export function PageWrapper({ children }: PageWrapperProps) {
  const location = useLocation()
  const navigate = useNavigate()

  // State management for Omnibar, Mobile Drawer, and Mobile Quick Actions
  const [commandOpen, setCommandOpen] = useState(false)
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false)
  const [mobileQuickActionsOpen, setMobileQuickActionsOpen] = useState(false)

  // Global keyboard shortcut: Ctrl+K / Cmd+K to open Command Palette
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setCommandOpen((prev) => !prev)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  // Auto-close mobile drawer on route changes
  useEffect(() => {
    setMobileDrawerOpen(false)
    setMobileQuickActionsOpen(false)
  }, [location.pathname])

  // Compute breadcrumb items
  const breadcrumbItems: BreadcrumbItem[] = []
  const currentRouteMeta = KNOWN_ROUTES[location.pathname]

  if (currentRouteMeta) {
    if (currentRouteMeta.parent) {
      breadcrumbItems.push({
        label: currentRouteMeta.parent.label,
        onClick: () => navigate(currentRouteMeta.parent!.href),
      })
    }
    breadcrumbItems.push({
      label: currentRouteMeta.label,
    })
  } else {
    // Fallback: check MODULES definition
    const matchedModule = MODULES.find((m) => m.route === location.pathname)
    if (matchedModule) {
      breadcrumbItems.push({ label: matchedModule.label })
    } else if (location.pathname !== '/' && location.pathname !== '/dashboard') {
      const segments = location.pathname.split('/').filter(Boolean)
      segments.forEach((seg, i) => {
        const path = `/${segments.slice(0, i + 1).join('/')}`
        const isLast = i === segments.length - 1
        breadcrumbItems.push({
          label: seg.charAt(0).toUpperCase() + seg.slice(1).replace(/-/g, ' '),
          onClick: isLast ? undefined : () => navigate(path),
        })
      })
    }
  }

  const showBreadcrumbs = location.pathname !== '/dashboard' && breadcrumbItems.length > 0

  return (
    <div className="ios-app-shell flex min-h-screen flex-col bg-[var(--color-bg)] text-text font-sans selection:bg-primary/20 selection:text-primary">
      <Navbar
        onOpenCommand={() => setCommandOpen(true)}
        onToggleMobileDrawer={() => setMobileDrawerOpen((prev) => !prev)}
      />

      <div className="flex min-h-0 flex-1 min-w-0 overflow-hidden">
        <Sidebar />

        <main className="min-w-0 flex-1 overflow-y-auto overflow-x-hidden p-3.5 pb-24 sm:p-6 lg:p-8 md:pb-8 animate-fade-in app-main-scroll">
          <div className="mx-auto w-full max-w-[1720px] space-y-4">
            {showBreadcrumbs && (
              <div className="hidden sm:block pb-1">
                <Breadcrumbs
                  items={breadcrumbItems}
                  showHome
                  onHomeClick={() => navigate('/dashboard')}
                />
              </div>
            )}

            {children}
          </div>
        </main>
      </div>

      {/* ── Mobile Tactile Bottom Navigation Dock ───────────────────────────── */}
      <BottomNav
        onOpenQuickActions={() => setMobileQuickActionsOpen(true)}
        onToggleDrawer={() => setMobileDrawerOpen(true)}
      />

      {/* ── Mobile Off-Canvas Drawer ─────────────────────────────────────────── */}
      <MobileDrawer
        isOpen={mobileDrawerOpen}
        onClose={() => setMobileDrawerOpen(false)}
      />

      {/* ── Mobile Contextual Quick Actions Bottom Sheet ─────────────────────── */}
      <MobileQuickActionsSheet
        isOpen={mobileQuickActionsOpen}
        onClose={() => setMobileQuickActionsOpen(false)}
        onOpenSearch={() => {
          setMobileQuickActionsOpen(false)
          setCommandOpen(true)
        }}
      />

      {/* ── Universal Omnibar / Command Palette ─────────────────────────────── */}
      <CommandMenu
        isOpen={commandOpen}
        onClose={() => setCommandOpen(false)}
      />

      {/* ── Global Toast Notifications ──────────────────────────────────────── */}
      <ToastContainer />
    </div>
  )
}
