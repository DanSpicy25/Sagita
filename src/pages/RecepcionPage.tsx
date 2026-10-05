import { useState } from 'react'
import { ConciergeBell, Users, Clock } from 'lucide-react'
import { TableroColaWalkIn, GestionListaEspera } from '@/components/reservas'
import { useModules } from '@/hooks/useModules'

type TabRecepcion = 'walk_in' | 'lista_espera'

export default function RecepcionPage() {
  const [tabActiva, setTabActiva] = useState<TabRecepcion>('walk_in')
  const { isAddonEnabled, tTerm } = useModules()

  const walkInActivo = isAddonEnabled('recepcion.walk_in')
  const listaEsperaActiva = isAddonEnabled('recepcion.lista_espera')

  const citasTerm = tTerm('citas', 'Citas')
  const clientesTerm = tTerm('clientes', 'Clientes')

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-primary-soft text-primary rounded-lg">
              <ConciergeBell className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-text">Recepción y Mostrador</h1>
              <p className="text-xs sm:text-sm text-text-muted mt-0.5">
                Gestión de atención presencial: turnos por orden de llegada (walk-in) y lista de espera de {clientesTerm.toLowerCase()}.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-border pb-3 overflow-x-auto">
        {walkInActivo && (
          <button
            type="button"
            onClick={() => setTabActiva('walk_in')}
            className={[
              'flex items-center gap-2 px-4 py-2 rounded-md text-xs sm:text-sm font-medium whitespace-nowrap transition-colors duration-150',
              tabActiva === 'walk_in'
                ? 'bg-primary text-white shadow-sm'
                : 'bg-surface text-text-muted hover:bg-secondary-soft hover:text-text border border-border',
            ].join(' ')}
          >
            <Users className="w-4 h-4" />
            Cola de Turnos (Walk-in)
          </button>
        )}

        {listaEsperaActiva && (
          <button
            type="button"
            onClick={() => setTabActiva('lista_espera')}
            className={[
              'flex items-center gap-2 px-4 py-2 rounded-md text-xs sm:text-sm font-medium whitespace-nowrap transition-colors duration-150',
              tabActiva === 'lista_espera'
                ? 'bg-primary text-white shadow-sm'
                : 'bg-surface text-text-muted hover:bg-secondary-soft hover:text-text border border-border',
            ].join(' ')}
          >
            <Clock className="w-4 h-4" />
            Lista de Espera ({citasTerm})
          </button>
        )}
      </div>

      {/* Contenido */}
      <div className="mt-4">
        {tabActiva === 'walk_in' && walkInActivo && (
          <TableroColaWalkIn />
        )}

        {tabActiva === 'lista_espera' && listaEsperaActiva && (
          <GestionListaEspera />
        )}

        {!walkInActivo && !listaEsperaActiva && (
          <div className="p-8 text-center bg-surface border border-border rounded-lg">
            <p className="text-text-muted text-sm">
              Todos los complementos de recepción están desactivados para este negocio. Puedes activarlos desde la sección de Módulos.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
