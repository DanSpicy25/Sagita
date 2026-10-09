import { useNavigate } from 'react-router-dom'
import {
  Plus,
  CalendarPlus,
  ShoppingCart,
  UserPlus,
  Clock,
  Printer,
} from 'lucide-react'
import { Dropdown, Button } from '@/components/ui'

export function QuickActionsMenu() {
  const navigate = useNavigate()

  const items = [
    {
      id: 'qa-cita',
      label: 'Nueva Cita',
      icon: <CalendarPlus className="w-4 h-4 text-primary" />,
      onClick: () => navigate('/citas/nueva'),
    },
    {
      id: 'qa-pos',
      label: 'Cobrar en POS',
      icon: <ShoppingCart className="w-4 h-4 text-success" />,
      onClick: () => navigate('/ventas'),
    },
    {
      id: 'qa-walkin',
      label: 'Cliente Walk-in',
      icon: <Clock className="w-4 h-4 text-warning" />,
      onClick: () => navigate('/recepcion'),
    },
    {
      id: 'qa-cli',
      label: 'Nuevo Cliente',
      icon: <UserPlus className="w-4 h-4 text-info" />,
      onClick: () => navigate('/clientes?nuevo=1'),
    },
    {
      id: 'div-1',
      divider: true,
    },
    {
      id: 'qa-hw',
      label: 'Test de Hardware',
      icon: <Printer className="w-4 h-4 text-text-muted" />,
      onClick: () => navigate('/hardware'),
    },
  ]

  return (
    <Dropdown
      trigger={
        <Button
          variant="outline"
          size="sm"
          leftIcon={<Plus className="w-3.5 h-3.5 text-primary" />}
          className="shadow-2xs hidden xl:inline-flex"
        >
          Acción Rápida
        </Button>
      }
      items={items}
      align="right"
      width="w-48"
    />
  )
}

