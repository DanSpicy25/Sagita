import { Link, useNavigate } from 'react-router-dom'
import { Clock, ArrowRight, ConciergeBell, UserCheck } from 'lucide-react'
import { ItemListaEspera } from '@/types'
import { Button, Badge } from '@/components/ui'
import { useSector } from '@/context/SectorContext'

export interface WidgetColaRecepcionProps {
  entradas: ItemListaEspera[]
}

export function WidgetColaRecepcion({ entradas }: WidgetColaRecepcionProps) {
  const navigate = useNavigate()
  const { vocabulario, tokens } = useSector()
  const enEspera = entradas.filter((item) => item.estado === 'en_espera')

  return (
    <div className="rounded-2xl bg-surface border border-border shadow-xs overflow-hidden flex flex-col">
      {/* ── Header ── */}
      <div className="p-4 sm:p-5 border-b border-border flex items-center justify-between gap-3 bg-surface-subtle/30">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-warning-soft text-warning flex items-center justify-center shrink-0 border border-warning/20">
            <ConciergeBell className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm sm:text-base font-bold font-heading text-text leading-tight flex items-center gap-2">
              <span>{vocabulario.cola}</span>
              <span className="text-xs px-2 py-0.5 rounded-full font-mono font-normal bg-surface border border-border text-text-muted">
                {tokens.iconEmoji}
              </span>
            </h2>
            <span className="text-[11px] text-text-muted">
              {enEspera.length} en espera • {vocabulario.accionCompletar}
            </span>
          </div>
        </div>

        <Link
          to="/recepcion"
          className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
        >
          <span>Mostrador</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* ── Body ── */}
      <div className="p-4 flex-1 divide-y divide-border-subtle">
        {enEspera.length === 0 ? (
          <div className="py-8 text-center text-text-muted space-y-2">
            <Clock className="w-8 h-8 mx-auto opacity-40 text-text-muted" />
            <p className="text-xs font-medium text-text">
              Sala de espera despejada
            </p>
            <p className="text-[11px] text-text-muted">
              No hay clientes esperando turno en recepción.
            </p>
            <Button
              variant="outline"
              size="xs"
              onClick={() => navigate('/recepcion')}
              className="mt-2"
            >
              Registrar Walk-in
            </Button>
          </div>
        ) : (
          enEspera.slice(0, 4).map((item, idx) => (
            <div
              key={item.id}
              className="py-3 flex items-center justify-between gap-3 first:pt-0 last:pb-0"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-6 h-6 rounded-full bg-surface-subtle border border-border flex items-center justify-center text-[11px] font-bold text-text-muted shrink-0 font-mono">
                  {idx + 1}
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 truncate">
                    <span className="text-xs font-semibold text-text truncate">
                      {item.cliente?.nombre || 'Cliente Walk-in'}
                    </span>
                    <Badge variant="warning" size="sm">
                      En espera
                    </Badge>
                  </div>
                  <p className="text-[11px] text-text-muted truncate mt-0.5">
                    {item.servicio?.nombre || 'Servicio General'} • {item.hora_preferente || 'Sin hora fija'}
                  </p>
                </div>
              </div>

              <Button
                variant="secondary"
                size="xs"
                onClick={() => navigate('/recepcion')}
                leftIcon={<UserCheck className="w-3 h-3 text-primary" />}
                className="shrink-0"
              >
                Atender
              </Button>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

