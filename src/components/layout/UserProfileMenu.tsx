import { useNavigate } from 'react-router-dom'
import {
  Settings,
  UserCircle,
  LogOut,
  Shield,
  CalendarDays,
  Users,
  ConciergeBell,
} from 'lucide-react'
import { useRole } from '@/hooks/useRole'
import { Dropdown, Avatar, Badge } from '@/components/ui'
import { useTenant } from '@/hooks/useTenant'

export function UserProfileMenu() {
  const {
    user,
    logout,
    roleLabel,
    isWorker,
    isReceptionist,
    capabilities,
    hasPermission,
  } = useRole()
  const { tenantActivo } = useTenant()
  const navigate = useNavigate()

  const badgeVariant = isWorker
    ? 'secondary'
    : isReceptionist
    ? 'warning'
    : 'primary'

  const items = [
    {
      id: 'hdr-user',
      label: (
        <div className="py-1">
          <p className="text-xs font-semibold text-text leading-tight truncate">
            {user?.nombre}
          </p>
          <p className="text-[10px] text-text-muted truncate mt-0.5">
            {user?.email || 'Sesión iniciada'}
          </p>
          <div className="flex items-center gap-1.5 mt-1.5">
            <Badge variant={badgeVariant} size="sm">
              {roleLabel}
            </Badge>
            {tenantActivo?.nombre && (
              <span className="text-[10px] text-text-muted truncate">
                • {tenantActivo.nombre}
              </span>
            )}
          </div>
        </div>
      ),
      disabled: true,
    },
    {
      id: 'div-1',
      divider: true,
    },
    // Enlaces operativos según rol
    ...(isWorker
      ? [
          {
            id: 'menu-agenda',
            label: 'Mi Agenda',
            icon: <CalendarDays className="w-4 h-4 text-primary" />,
            onClick: () => navigate('/citas'),
          },
          {
            id: 'menu-clientes',
            label: 'Mis Clientes',
            icon: <Users className="w-4 h-4 text-info" />,
            onClick: () => navigate('/clientes'),
          },
        ]
      : []),
    ...(isReceptionist
      ? [
          {
            id: 'menu-recepcion',
            label: 'Recepción Walk-in',
            icon: <ConciergeBell className="w-4 h-4 text-warning" />,
            onClick: () => navigate('/recepcion'),
          },
          {
            id: 'menu-citas',
            label: 'Agenda General',
            icon: <CalendarDays className="w-4 h-4 text-primary" />,
            onClick: () => navigate('/citas'),
          },
        ]
      : []),
    // Enlaces administrativos según permisos
    ...(capabilities.canManageSettings
      ? [
          {
            id: 'menu-cfg',
            label: 'Centro de Control',
            icon: <Settings className="w-4 h-4 text-text-muted" />,
            onClick: () => navigate('/configuracion'),
          },
        ]
      : []),
    ...(capabilities.canManageUsers
      ? [
          {
            id: 'menu-users',
            label: 'Usuarios & Equipo',
            icon: <UserCircle className="w-4 h-4 text-text-muted" />,
            onClick: () => navigate('/usuarios'),
          },
        ]
      : []),
    ...(hasPermission('roles.manage')
      ? [
          {
            id: 'menu-roles',
            label: 'Permisos & Seguridad',
            icon: <Shield className="w-4 h-4 text-text-muted" />,
            onClick: () => navigate('/roles'),
          },
        ]
      : []),
    {
      id: 'div-2',
      divider: true,
    },
    {
      id: 'menu-logout',
      label: 'Cerrar Sesión',
      icon: <LogOut className="w-4 h-4 text-danger" />,
      danger: true,
      onClick: logout,
    },
  ]

  return (
    <Dropdown
      trigger={
        <div className="flex items-center gap-2 p-1 pl-1.5 rounded-lg hover:bg-surface-subtle transition-colors cursor-pointer select-none">
          <Avatar
            src={user?.avatar}
            name={user?.nombre}
            size="sm"
            status="online"
          />
          <div className="hidden lg:block text-left min-w-0 pr-1">
            <p className="text-xs font-semibold text-text leading-tight truncate max-w-[110px]">
              {user?.nombre}
            </p>
            <p className="text-[10px] text-text-muted capitalize truncate leading-tight mt-0.5">
              {roleLabel}
            </p>
          </div>
        </div>
      }
      items={items}
      align="right"
      width="w-60"
    />
  )
}
