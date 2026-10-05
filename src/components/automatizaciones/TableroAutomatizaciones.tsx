import { useMemo } from 'react'
import { Zap, ArrowRight, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui'

interface TableroAutomatizacionesProps {
  onVerLogs: () => void
}

export function TableroAutomatizaciones({ onVerLogs }: TableroAutomatizacionesProps) {
  const resumen = useMemo(
    () => [
      { label: 'Reglas activas', value: '8' },
      { label: 'Flujos conectados', value: '4' },
      { label: 'Eventos hoy', value: '26' },
    ],
    []
  )

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {resumen.map((item) => (
          <div key={item.label} className="card p-4 border border-slate-200 dark:border-slate-800">
            <p className="text-[11px] uppercase tracking-wider text-slate-400">{item.label}</p>
            <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-slate-100">{item.value}</p>
          </div>
        ))}
      </div>

      <div className="card p-5 border border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-slate-100">
          <Zap className="w-4 h-4 text-amber-500" />
          Motor de automatizaciones
        </div>
        <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
          Las reglas disparan eventos de reserva, pago, recordatorio y CRM con acciones multi-canal y auditoría integrada.
        </p>
        <div className="mt-4 flex items-center gap-2 text-xs text-emerald-600 dark:text-emerald-400">
          <CheckCircle2 className="w-4 h-4" />
          Sistema operativo y lista para pruebas
        </div>
        <div className="mt-6 flex justify-end">
          <Button variant="secondary" size="sm" onClick={onVerLogs} rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
            Ver historial
          </Button>
        </div>
      </div>
    </div>
  )
}

export default TableroAutomatizaciones
