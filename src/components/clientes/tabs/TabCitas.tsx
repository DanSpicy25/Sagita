import { Calendar } from 'lucide-react'
import { Cita, EstadoCita } from '@/types'
import { Badge } from '@/components/ui'

interface TabCitasProps {
  citas: Cita[]
}

const estadoBadges: Record<
  EstadoCita,
  { variant: 'warning' | 'success' | 'danger' | 'default' | 'info'; label: string }
> = {
  pendiente: { variant: 'warning', label: 'Pendiente' },
  confirmada: { variant: 'success', label: 'Confirmada' },
  en_cola: { variant: 'info', label: 'En Cola' },
  en_atencion: { variant: 'warning', label: 'En Atención' },
  completada: { variant: 'default', label: 'Completada' },
  cancelada: { variant: 'danger', label: 'Cancelada' },
  no_asistio: { variant: 'danger', label: 'No asistió' },
  reprogramada: { variant: 'info', label: 'Reprogramada' },
}

export function TabCitas({ citas }: TabCitasProps) {
  if (citas.length === 0) {
    return (
      <div className="text-center py-10 text-slate-400">
        <Calendar className="w-8 h-8 mx-auto mb-2 opacity-50" />
        <p className="text-sm">El cliente aún no tiene citas registradas en el historial.</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 font-semibold border-b border-slate-200 dark:border-slate-700">
            <tr>
              <th className="p-3">Fecha y Hora</th>
              <th className="p-3">Servicio</th>
              <th className="p-3">Profesional</th>
              <th className="p-3">Estado</th>
              <th className="p-3 text-right">Monto</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {citas.map((c) => {
              const badge = estadoBadges[c.estado] || {
                variant: 'default',
                label: c.estado,
              }
              return (
                <tr key={c.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                  <td className="p-3 font-medium text-slate-900 dark:text-slate-100 whitespace-nowrap">
                    {c.fecha_inicio}
                  </td>
                  <td className="p-3 font-semibold text-primary-600 dark:text-primary-400">
                    {c.servicio?.nombre || 'Servicio'}
                  </td>
                  <td className="p-3 text-slate-600 dark:text-slate-300">
                    {c.empleado?.nombre || 'No asignado'}
                  </td>
                  <td className="p-3">
                    <Badge variant={badge.variant} size="sm">
                      {badge.label}
                    </Badge>
                  </td>
                  <td className="p-3 text-right font-bold text-slate-900 dark:text-slate-100">
                    ${c.precio_total}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
