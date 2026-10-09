import { Link } from 'react-router-dom'
import {
  CalendarDays,
  ShoppingCart,
  Users,
  Package,
  ConciergeBell,
  BarChart2,
  ArrowRight,
  Zap,
  Sparkles,
  UserCheck,
} from 'lucide-react'
import { useRole } from '@/hooks/useRole'

interface AccionItem {
  to: string
  icon: React.ElementType
  title: string
  description: string
  color: string
}

export function WidgetAccionesRapidas() {
  const { isWorker, isReceptionist } = useRole()

  let acciones: AccionItem[] = []

  if (isWorker) {
    acciones = [
      {
        to: '/citas',
        icon: CalendarDays,
        title: 'Mi Agenda',
        description: 'Turnos y citas asignadas hoy',
        color: 'text-primary bg-primary-soft border-primary/20',
      },
      {
        to: '/citas/nueva',
        icon: UserCheck,
        title: 'Agendar Cita',
        description: 'Registrar nueva reserva',
        color: 'text-success bg-success-soft border-success/20',
      },
      {
        to: '/clientes',
        icon: Users,
        title: 'Mis Clientes',
        description: 'Directorio y ficha 360',
        color: 'text-info bg-info-soft border-info/20',
      },
      {
        to: '/servicios',
        icon: Sparkles,
        title: 'Catálogo Servicios',
        description: 'Duraciones y especificaciones',
        color: 'text-secondary bg-secondary-soft border-border',
      },
      {
        to: '/recepcion',
        icon: ConciergeBell,
        title: 'Cola Recepción',
        description: 'Turnos en espera de atención',
        color: 'text-warning bg-warning-soft border-warning/20',
      },
      {
        to: '/citas?vista=semana',
        icon: CalendarDays,
        title: 'Vista Semanal',
        description: 'Planificación de la semana',
        color: 'text-accent bg-accent-soft border-accent/20',
      },
    ]
  } else if (isReceptionist) {
    acciones = [
      {
        to: '/recepcion',
        icon: ConciergeBell,
        title: 'Recepción Walk-in',
        description: 'Clientes espontáneos y mostrador',
        color: 'text-warning bg-warning-soft border-warning/20',
      },
      {
        to: '/ventas',
        icon: ShoppingCart,
        title: 'Terminal POS',
        description: 'Cobrar servicios y productos',
        color: 'text-success bg-success-soft border-success/20',
      },
      {
        to: '/citas/nueva',
        icon: CalendarDays,
        title: 'Agendar Cita',
        description: 'Asistente de reserva paso a paso',
        color: 'text-primary bg-primary-soft border-primary/20',
      },
      {
        to: '/clientes',
        icon: Users,
        title: 'Directorio Clientes',
        description: 'Ficha 360 y contactos',
        color: 'text-info bg-info-soft border-info/20',
      },
      {
        to: '/citas',
        icon: CalendarDays,
        title: 'Agenda General',
        description: 'Calendario completo de la sede',
        color: 'text-secondary bg-secondary-soft border-border',
      },
      {
        to: '/servicios',
        icon: Sparkles,
        title: 'Catálogo Servicios',
        description: 'Tarifas y duraciones activas',
        color: 'text-accent bg-accent-soft border-accent/20',
      },
    ]
  } else {
    // Admin / Gerente / Superadmin
    acciones = [
      {
        to: '/citas/nueva',
        icon: CalendarDays,
        title: 'Agendar Cita',
        description: 'Asistente de reserva paso a paso',
        color: 'text-primary bg-primary-soft border-primary/20',
      },
      {
        to: '/ventas',
        icon: ShoppingCart,
        title: 'Terminal POS',
        description: 'Cobrar servicios y productos',
        color: 'text-success bg-success-soft border-success/20',
      },
      {
        to: '/recepcion',
        icon: ConciergeBell,
        title: 'Recepción Walk-in',
        description: 'Clientes espontáneos y mostrador',
        color: 'text-warning bg-warning-soft border-warning/20',
      },
      {
        to: '/clientes',
        icon: Users,
        title: 'Directorio Clientes',
        description: 'Ficha 360 y contactos',
        color: 'text-info bg-info-soft border-info/20',
      },
      {
        to: '/inventario',
        icon: Package,
        title: 'Control Inventario',
        description: 'Stock, recetas y compras',
        color: 'text-secondary bg-secondary-soft border-border',
      },
      {
        to: '/reportes',
        icon: BarChart2,
        title: 'Analítica BI',
        description: 'Métricas de rendimiento',
        color: 'text-accent bg-accent-soft border-accent/20',
      },
    ]
  }

  return (
    <div className="rounded-2xl bg-surface border border-border shadow-xs overflow-hidden flex flex-col">
      {/* ── Header ── */}
      <div className="p-4 sm:p-5 border-b border-border flex items-center justify-between gap-3 bg-surface-subtle/30">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-primary-soft text-primary flex items-center justify-center shrink-0 border border-primary/20">
            <Zap className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm sm:text-base font-bold font-heading text-text leading-tight">
              {isWorker ? 'Mis Acciones Rápidas' : 'Accesos Rápidos'}
            </h2>
            <span className="text-[11px] text-text-muted">
              {isWorker
                ? 'Operaciones personales a 1 clic'
                : 'Operaciones de mostrador a 1 clic'}
            </span>
          </div>
        </div>
      </div>

      {/* ── Body Grid ── */}
      <div className="p-3.5 sm:p-4 grid grid-cols-2 sm:grid-cols-3 gap-2.5 sm:gap-3 flex-1">
        {acciones.map((act) => {
          const Icon = act.icon
          return (
            <Link
              key={act.to}
              to={act.to}
              className="flex flex-col items-start p-3 rounded-xl bg-surface-subtle/50 hover:bg-surface border border-border hover:border-border-hover shadow-2xs hover:shadow-xs transition-all group cursor-pointer active:scale-[0.98]"
            >
              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center border mb-2 transition-transform group-hover:scale-105 ${act.color}`}
              >
                <Icon className="w-4 h-4" />
              </div>
              <div className="flex items-center justify-between w-full">
                <span className="text-xs font-semibold text-text group-hover:text-primary transition-colors truncate">
                  {act.title}
                </span>
                <ArrowRight className="w-3 h-3 text-text-muted opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
              </div>
              <span className="text-[10px] text-text-muted mt-0.5 line-clamp-1">
                {act.description}
              </span>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
