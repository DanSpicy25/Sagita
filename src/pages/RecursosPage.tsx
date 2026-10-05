import { useState } from 'react'
import { DoorOpen, CalendarOff } from 'lucide-react'
import { GestionRecursos, GestionBloqueos } from '@/components/reservas'
import { useModules } from '@/hooks/useModules'

type TabRecursos = 'recursos' | 'bloqueos'

export default function RecursosPage() {
  const [tabActiva, setTabActiva] = useState<TabRecursos>('recursos')
  const { isAddonEnabled, tTerm } = useModules()

  const bloqueosActivo = isAddonEnabled('recursos.bloqueos')
  const recursosTerm = tTerm('recursos', 'Recursos')

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-primary-soft text-primary rounded-lg">
              <DoorOpen className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-text">Gestión de {recursosTerm}</h1>
              <p className="text-xs sm:text-sm text-text-muted mt-0.5">
                Administración de espacios físicos, cabinas, salas, equipos y bloqueos de disponibilidad horaria.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-border pb-3 overflow-x-auto">
        <button
          type="button"
          onClick={() => setTabActiva('recursos')}
          className={[
            'flex items-center gap-2 px-4 py-2 rounded-md text-xs sm:text-sm font-medium whitespace-nowrap transition-colors duration-150',
            tabActiva === 'recursos'
              ? 'bg-primary text-white shadow-sm'
              : 'bg-surface text-text-muted hover:bg-secondary-soft hover:text-text border border-border',
          ].join(' ')}
        >
          <DoorOpen className="w-4 h-4" />
          Directorio de {recursosTerm}
        </button>

        {bloqueosActivo && (
          <button
            type="button"
            onClick={() => setTabActiva('bloqueos')}
            className={[
              'flex items-center gap-2 px-4 py-2 rounded-md text-xs sm:text-sm font-medium whitespace-nowrap transition-colors duration-150',
              tabActiva === 'bloqueos'
                ? 'bg-primary text-white shadow-sm'
                : 'bg-surface text-text-muted hover:bg-secondary-soft hover:text-text border border-border',
            ].join(' ')}
          >
            <CalendarOff className="w-4 h-4" />
            Bloqueos de Agenda y Mantenimiento
          </button>
        )}
      </div>

      {/* Contenido */}
      <div className="mt-4">
        {tabActiva === 'recursos' && <GestionRecursos />}
        {tabActiva === 'bloqueos' && bloqueosActivo && <GestionBloqueos />}
      </div>
    </div>
  )
}
