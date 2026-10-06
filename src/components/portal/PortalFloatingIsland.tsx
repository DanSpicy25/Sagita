import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Layers,
  Calendar,
  Package,
  Printer,
  Sparkles,
  Smartphone,
  CheckCircle2,
  X,
  ShieldCheck,
  Zap,
  ArrowRight,
  ShoppingCart,
} from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useToast } from '@/hooks/useToast'

export interface PortalFloatingIslandProps {
  tabPrincipal: 'reservas' | 'productos' | 'hardware' | 'verticales' | 'modulos'
  onSelectTab: (tab: 'reservas' | 'productos' | 'hardware' | 'verticales' | 'modulos') => void
  totalProductos?: number
  isMobileSimulator?: boolean
  onToggleMobileSimulator?: () => void
}

export function PortalFloatingIsland({
  tabPrincipal,
  onSelectTab,
  totalProductos = 12,
  isMobileSimulator = false,
  onToggleMobileSimulator,
}: PortalFloatingIslandProps) {
  const navigate = useNavigate()
  const { isAuthenticated, login, user } = useAuth()
  const { toast } = useToast()
  const [showExecutiveSheet, setShowExecutiveSheet] = useState(false)
  const [ingresando, setIngresando] = useState(false)

  const handleAdminClick = async () => {
    if (isAuthenticated) {
      navigate('/dashboard')
      return
    }
    setIngresando(true)
    try {
      await login({ email: 'supremo@demo.app', password: 'Supremo123!' })
      toast.success('Acceso Autorizado', 'Iniciando en el panel como Administrador')
      navigate('/dashboard')
    } catch {
      navigate('/login')
    } finally {
      setIngresando(false)
    }
  }

  return (
    <>
      {/* ─── Isla Flotante Principal (Floating Dynamic Dock) ─────────────────── */}
      <aside
        aria-label="Navegación Rápida Flotante"
        className="fixed bottom-3 sm:bottom-6 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-1.25rem)] max-w-[460px] animate-ios-slide-up"
      >
        <div className="glass-dock rounded-full p-1.5 flex items-center justify-between gap-1 shadow-[0_20px_50px_rgba(0,0,0,0.45)] border border-white/15">
          {/* 1. Módulos */}
          <button
            type="button"
            onClick={() => onSelectTab('modulos')}
            className={`relative flex flex-col items-center justify-center py-1.5 px-2.5 sm:px-3 rounded-full transition-all active:scale-95 ${
              tabPrincipal === 'modulos'
                ? 'bg-white text-neutral-950 font-bold shadow-md'
                : 'text-neutral-300 hover:text-white hover:bg-white/10'
            }`}
            title="Ver los 18 Módulos"
          >
            <div className="relative">
              <Layers className="w-4 h-4 sm:w-[18px] sm:h-[18px]" />
              <span className="absolute -top-1.5 -right-2 bg-emerald-500 text-[9px] font-black text-black px-1 rounded-full leading-tight">
                18
              </span>
            </div>
            <span className="text-[10px] sm:text-[11px] tracking-tight mt-0.5">Módulos</span>
          </button>

          {/* 2. Citas */}
          <button
            type="button"
            onClick={() => onSelectTab('reservas')}
            className={`flex flex-col items-center justify-center py-1.5 px-2.5 sm:px-3 rounded-full transition-all active:scale-95 ${
              tabPrincipal === 'reservas'
                ? 'bg-white text-neutral-950 font-bold shadow-md'
                : 'text-neutral-300 hover:text-white hover:bg-white/10'
            }`}
            title="Agendar Cita Online"
          >
            <Calendar className="w-4 h-4 sm:w-[18px] sm:h-[18px]" />
            <span className="text-[10px] sm:text-[11px] tracking-tight mt-0.5">Citas</span>
          </button>

          {/* 3. Catálogo */}
          <button
            type="button"
            onClick={() => onSelectTab('productos')}
            className={`flex flex-col items-center justify-center py-1.5 px-2 sm:px-3 rounded-full transition-all active:scale-95 ${
              tabPrincipal === 'productos'
                ? 'bg-white text-neutral-950 font-bold shadow-md'
                : 'text-neutral-300 hover:text-white hover:bg-white/10'
            }`}
            title={`Catálogo de Productos (${totalProductos})`}
          >
            <div className="relative">
              <Package className="w-4 h-4 sm:w-[18px] sm:h-[18px]" />
              {totalProductos > 0 && (
                <span className="absolute -top-1.5 -right-2 bg-neutral-700 text-[9px] font-black text-white px-1 rounded-full leading-tight">
                  {totalProductos}
                </span>
              )}
            </div>
            <span className="text-[10px] sm:text-[11px] tracking-tight mt-0.5">Catálogo</span>
          </button>

          {/* 4. Hardware POS */}
          <button
            type="button"
            onClick={() => onSelectTab('hardware')}
            className={`hidden xs:flex flex-col items-center justify-center py-1.5 px-2 sm:px-3 rounded-full transition-all active:scale-95 ${
              tabPrincipal === 'hardware'
                ? 'bg-white text-neutral-950 font-bold shadow-md'
                : 'text-neutral-300 hover:text-white hover:bg-white/10'
            }`}
            title="Terminal y Hardware"
          >
            <Printer className="w-4 h-4 sm:w-[18px] sm:h-[18px]" />
            <span className="text-[10px] sm:text-[11px] tracking-tight mt-0.5">POS</span>
          </button>

          {/* 4.1 Toggle Simulador (en desktop) */}
          {onToggleMobileSimulator && (
            <button
              type="button"
              onClick={onToggleMobileSimulator}
              className={`hidden md:flex flex-col items-center justify-center py-1.5 px-2 rounded-full transition-all active:scale-95 ${
                isMobileSimulator
                  ? 'bg-white text-neutral-950 font-bold shadow-md'
                  : 'text-neutral-300 hover:text-white hover:bg-white/10'
              }`}
              title="Alternar simulador de smartphone para presentaciones"
            >
              <Smartphone className="w-4 h-4" />
              <span className="text-[10px] tracking-tight mt-0.5">Móvil</span>
            </button>
          )}

          {/* Separador vertical sutil */}
          <div className="h-6 w-[1px] bg-white/20 shrink-0 mx-0.5" />

          {/* 5. Botón Admin Demo Destacado (1 Clic) */}
          <button
            type="button"
            onClick={handleAdminClick}
            disabled={ingresando}
            className="flex items-center gap-1.5 py-2 px-3 sm:px-4 rounded-full bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-400 text-neutral-950 font-bold text-xs sm:text-[13px] shadow-lg shadow-amber-500/20 active:scale-95 transition-all shrink-0 hover:brightness-105"
            title="Acceso instantáneo al panel administrativo"
          >
            {ingresando ? (
              <div className="w-3.5 h-3.5 border-2 border-neutral-950 border-t-transparent rounded-full animate-spin" />
            ) : (
              <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-neutral-950 shrink-0" />
            )}
            <span className="tracking-tight whitespace-nowrap">
              {isAuthenticated ? (user?.nombre ? user.nombre.split(' ')[0] : 'Panel') : 'Demo 1-Clic'}
            </span>
          </button>

          {/* 6. Ficha Ejecutiva / Presentación Sheet */}
          <button
            type="button"
            onClick={() => setShowExecutiveSheet(true)}
            className="p-2 rounded-full text-neutral-300 hover:text-white hover:bg-white/10 transition-all active:scale-95 shrink-0"
            title="Abrir Ficha de Presentación Ejecutiva"
          >
            <Zap className="w-4 h-4 text-amber-300" />
          </button>
        </div>
      </aside>

      {/* ─── Bottom Sheet / Modal de Presentación Ejecutiva para el Socio ───── */}
      {showExecutiveSheet && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-ios-fade-in"
          onClick={() => setShowExecutiveSheet(false)}
        >
          <div
            className="w-full sm:max-w-xl bg-white dark:bg-neutral-900 rounded-t-3xl sm:rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl border border-neutral-200/80 dark:border-neutral-800 animate-ios-slide-up max-h-[90vh] overflow-y-auto safe-pb"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Grabber para móvil */}
            <div className="w-12 h-1.5 bg-neutral-300 dark:bg-neutral-700 rounded-full mx-auto sm:hidden" />

            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 text-xs font-bold border border-emerald-200 dark:border-emerald-800">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Certificación 5.0/5.0 • Producción Lista</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-neutral-900 dark:text-white tracking-tight">
                  Sagitta Enterprise: Resumen Ejecutivo
                </h3>
                <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400">
                  Diseñado para que tu socio presente la plataforma a clientes, franquicias e inversores.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowExecutiveSheet(false)}
                className="p-1.5 rounded-full text-neutral-400 hover:text-neutral-900 dark:hover:text-white bg-neutral-100 dark:bg-neutral-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Puntos de valor clave para vender / presentar */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left">
              <div className="p-3.5 rounded-2xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200/70 dark:border-neutral-700/60 space-y-1">
                <div className="flex items-center gap-2 text-xs font-bold text-neutral-900 dark:text-white">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>100% Desacoplado</span>
                </div>
                <p className="text-[11px] text-neutral-600 dark:text-neutral-400 leading-relaxed">
                  Frontend listo para conectar a cualquier API backend (Node.js, Python, Laravel) sin alterar la interfaz.
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200/70 dark:border-neutral-700/60 space-y-1">
                <div className="flex items-center gap-2 text-xs font-bold text-neutral-900 dark:text-white">
                  <Printer className="w-4 h-4 text-neutral-900 dark:text-white shrink-0" />
                  <span>Hardware Térmico POS</span>
                </div>
                <p className="text-[11px] text-neutral-600 dark:text-neutral-400 leading-relaxed">
                  Impresión directa por Bluetooth Web (ESC/POS 58mm/80mm), apertura de gaveta y lector de código de barras.
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200/70 dark:border-neutral-700/60 space-y-1">
                <div className="flex items-center gap-2 text-xs font-bold text-neutral-900 dark:text-white">
                  <Layers className="w-4 h-4 text-indigo-500 shrink-0" />
                  <span>18 Módulos Operativos</span>
                </div>
                <p className="text-[11px] text-neutral-600 dark:text-neutral-400 leading-relaxed">
                  POS, Agenda, Inventario, Clientes 360, Membresías, Roles RBAC, Automatizaciones y Reportes.
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200/70 dark:border-neutral-700/60 space-y-1">
                <div className="flex items-center gap-2 text-xs font-bold text-neutral-900 dark:text-white">
                  <Smartphone className="w-4 h-4 text-amber-500 shrink-0" />
                  <span>PWA & Touch-First</span>
                </div>
                <p className="text-[11px] text-neutral-600 dark:text-neutral-400 leading-relaxed">
                  Diseñado para teléfonos y tablets. Funciona como app nativa instalable con soporte offline y caché rápido.
                </p>
              </div>
            </div>

            {/* Acciones del Drawer */}
            <div className="space-y-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setShowExecutiveSheet(false)
                  handleAdminClick()
                }}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-full bg-neutral-900 hover:bg-neutral-800 text-white dark:bg-white dark:text-neutral-900 font-bold text-sm shadow-md transition-all active:scale-98"
              >
                <Sparkles className="w-4 h-4 text-amber-300 dark:text-amber-500" />
                <span>Entrar al Panel de Control en Vivo</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="flex items-center justify-between gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setShowExecutiveSheet(false)
                    onSelectTab('modulos')
                  }}
                  className="w-1/2 py-2.5 px-3 rounded-full text-xs font-semibold bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-900 dark:text-white transition-all text-center"
                >
                  Explorar 18 Módulos
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setShowExecutiveSheet(false)
                    navigate('/ventas')
                  }}
                  className="w-1/2 py-2.5 px-3 rounded-full text-xs font-semibold bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-900 dark:text-white transition-all text-center flex items-center justify-center gap-1"
                >
                  <ShoppingCart className="w-3.5 h-3.5" />
                  <span>Probar Caja POS</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

