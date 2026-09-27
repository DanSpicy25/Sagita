import { Settings2 } from 'lucide-react'

export function PreferenciasComunicacion() {
  return (
    <div className="card p-5 border border-slate-200 dark:border-slate-800">
      <div className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-slate-100">
        <Settings2 className="w-4 h-4 text-blue-500" />
        Preferencias de comunicación
      </div>
      <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
        Configuración de horarios de silencio, canales activos y remitentess para cada tenant.
      </p>
    </div>
  )
}

export default PreferenciasComunicacion
