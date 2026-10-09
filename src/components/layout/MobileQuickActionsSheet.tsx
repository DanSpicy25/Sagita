import { useNavigate } from 'react-router-dom'
import {
  CalendarPlus,
  ShoppingCart,
  UserPlus,
  Clock,
  Printer,
  Search,
} from 'lucide-react'
import { BottomSheet } from '@/components/ui'

export interface MobileQuickActionsSheetProps {
  isOpen: boolean
  onClose: () => void
  onOpenSearch?: () => void
}

export function MobileQuickActionsSheet({
  isOpen,
  onClose,
  onOpenSearch,
}: MobileQuickActionsSheetProps) {
  const navigate = useNavigate()

  const handleAction = (route?: string, customAction?: () => void) => {
    onClose()
    if (customAction) {
      customAction()
    } else if (route) {
      navigate(route)
    }
  }

  const actions = [
    {
      title: 'Nueva Cita',
      description: 'Reservar servicio y profesional',
      icon: CalendarPlus,
      color: 'text-primary bg-primary-soft border-primary/20',
      route: '/citas/nueva',
    },
    {
      title: 'Cobrar en POS',
      description: 'Terminal de venta y caja táctil',
      icon: ShoppingCart,
      color: 'text-success bg-success-soft border-success/20',
      route: '/ventas',
    },
    {
      title: 'Cliente Walk-in',
      description: 'Recepción y cola de espera',
      icon: Clock,
      color: 'text-warning bg-warning-soft border-warning/20',
      route: '/recepcion',
    },
    {
      title: 'Nuevo Cliente',
      description: 'Dar de alta en directorio',
      icon: UserPlus,
      color: 'text-info bg-info-soft border-info/20',
      route: '/clientes?nuevo=1',
    },
    {
      title: 'Banco de Hardware',
      description: 'Impresora térmica y cajón',
      icon: Printer,
      color: 'text-secondary bg-secondary-soft border-border',
      route: '/hardware',
    },
    {
      title: 'Buscar Global',
      description: 'Omnibar universal (Ctrl+K)',
      icon: Search,
      color: 'text-text bg-surface-subtle border-border',
      action: onOpenSearch,
    },
  ]

  return (
    <BottomSheet
      isOpen={isOpen}
      onClose={onClose}
      title="Acciones Rápidas"
      description="Operativa rápida y accesos directos de mostrador"
    >
      <div className="grid grid-cols-2 gap-3 py-2">
        {actions.map((act) => {
          const Icon = act.icon
          return (
            <button
              key={act.title}
              type="button"
              onClick={() => handleAction(act.route, act.action)}
              className="flex flex-col items-start p-3.5 rounded-[20px] bg-black/[0.03] dark:bg-white/[0.05] border border-black/[0.06] dark:border-white/[0.08] shadow-xs hover:bg-black/[0.05] dark:hover:bg-white/[0.08] transition-all text-left cursor-pointer group ios-press"
            >
              <div
                className={`w-10 h-10 rounded-2xl flex items-center justify-center border mb-2.5 transition-transform group-hover:scale-105 shadow-xs ${act.color}`}
              >
                <Icon className="w-5 h-5" aria-hidden="true" />
              </div>
              <span className="text-xs font-semibold text-text leading-tight group-hover:text-primary transition-colors">
                {act.title}
              </span>
              <span className="text-[10px] text-text-muted mt-0.5 leading-snug line-clamp-1">
                {act.description}
              </span>
            </button>
          )
        })}
      </div>
    </BottomSheet>
  )
}

