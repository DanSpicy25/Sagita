import { Link } from 'react-router-dom'
import {
  Sparkles,
  LayoutDashboard,
  CalendarDays,
  Users,
  Scissors,
  ShoppingCart,
  Package,
  BarChart3,
  ArrowRight,
  Laptop,
} from 'lucide-react'
import { Button } from '@/components/ui'

const DEMO_MODULES_LIST = [
  {
    id: 'dashboard',
    titulo: 'Panel Principal',
    descripcion: 'Ventas del día, actividad y alertas de operación.',
    icon: LayoutDashboard,
  },
  {
    id: 'calendar',
    titulo: 'Agenda & Calendario',
    descripcion: 'Buffers de amortiguación, vistas semanal/diaria y sincronización .ICS.',
    icon: CalendarDays,
  },
  {
    id: 'customers',
    titulo: 'Clientes & CRM 360°',
    descripcion: 'Historial, preferencias y seguimiento de cada cliente.',
    icon: Users,
  },
  {
    id: 'services',
    titulo: 'Servicios & Tarifas',
    descripcion: 'Precios, disponibilidad, variantes y paquetes.',
    icon: Scissors,
  },
  {
    id: 'pos',
    titulo: 'Punto de Venta POS',
    descripcion: 'Tickets térmicos Bluetooth (ESC/POS) y apertura de gaveta de dinero.',
    icon: ShoppingCart,
  },
  {
    id: 'inventory',
    titulo: 'Inventario & Reorden',
    descripcion: 'Punto de reorden automático y control de productos de venta y uso interno.',
    icon: Package,
  },
  {
    id: 'reports',
    titulo: 'Reportes & Finanzas',
    descripcion: 'Cierre ciego de caja, arqueo de turno y comisiones de personal.',
    icon: BarChart3,
  },
]

export function PortalDemoSection() {
  return (
    <section id="demo-center" className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16 border-t border-zinc-200/80 dark:border-zinc-800">
      <div className="rounded-2xl bg-white dark:bg-zinc-900/60 border border-zinc-200/80 dark:border-zinc-800 p-6 sm:p-10 shadow-sm">
        <div className="w-full mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 text-xs font-semibold uppercase tracking-wider border border-zinc-200 dark:border-zinc-700">
            <Sparkles className="w-3.5 h-3.5 text-zinc-500" />
            <span>Sales Demo Center Integrado</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-text tracking-tight">
            Prueba la experiencia comercial interactiva
          </h2>

          <p className="text-text-muted text-sm sm:text-base leading-relaxed max-w-2xl mx-auto">
            Accede al centro de demostración guiado. Explora los 7 módulos con las respuestas a las 4 preguntas de negocio: ¿Qué es?, ¿Por qué es útil?, ¿Cómo funciona? y ¿Cómo se ve en Desktop, Tablet y Móvil?
          </p>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link to="/demo">
              <Button
                size="md"
                className="gap-2 px-7 py-3.5 text-sm font-bold shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all"
              >
                <Sparkles className="w-4 h-4 text-zinc-500" />
                <span>Abrir Sales Demo Center</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>

            <Link to="/login">
              <Button
                size="md"
                variant="outline"
                className="gap-2 px-6 text-sm font-semibold"
              >
                <Laptop className="w-4 h-4" />
                <span>Acceso Directo con 1 Clic</span>
              </Button>
            </Link>
          </div>

          {/* Grid de los 7 Módulos de Demo */}
          <div className="pt-8 grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5 text-left">
            {DEMO_MODULES_LIST.map((mod) => {
              const Icon = mod.icon
              return (
                <Link
                  key={mod.id}
                  to={`/demo?modulo=${mod.id}`}
                  className="p-3 rounded-2xl bg-surface border border-border hover:border-primary/40 hover:shadow-xs transition-all flex flex-col justify-between space-y-2 group"
                >
                  <div className="w-8 h-8 rounded-xl bg-surface-subtle group-hover:bg-primary-soft text-text group-hover:text-primary transition-colors flex items-center justify-center">
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <strong className="text-xs font-bold text-text block truncate group-hover:text-primary transition-colors">
                      {mod.titulo}
                    </strong>
                    <span className="text-[10px] text-text-muted line-clamp-2 mt-0.5 leading-snug">
                      {mod.descripcion}
                    </span>
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
