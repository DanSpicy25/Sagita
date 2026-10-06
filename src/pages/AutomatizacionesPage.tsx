import { useState, useEffect } from 'react'
import {
  Zap,
  Sparkles,
  Settings2,
  History,
  Workflow,
} from 'lucide-react'
import type { PlantillaMensaje, EjecucionLogAutomatizacion } from '@/types'
import { integracionesService } from '@/services/integraciones.service'
import { automatizacionesService } from '@/services/automatizaciones.service'
import { Loader } from '@/components/ui'
import {
  TableroAutomatizaciones,
  HistorialEjecuciones,
  PreferenciasComunicacion,
  GestionPlantillasMensajes,
} from '@/components/automatizaciones'
import { useToast } from '@/hooks/useToast'

export type TabAutomatizacion = 'reglas' | 'plantillas' | 'preferencias' | 'historial'

export default function AutomatizacionesPage({
  defaultTab = 'reglas',
}: {
  defaultTab?: TabAutomatizacion
}) {
  const [tabActivo, setTabActivo] = useState<TabAutomatizacion>(defaultTab)
  const [plantillas, setPlantillas] = useState<PlantillaMensaje[]>([])
  const [logs, setLogs] = useState<EjecucionLogAutomatizacion[]>([])
  const [cargando, setCargando] = useState(true)

  const { toast } = useToast()

  const cargarDatos = () => {
    setCargando(true)
    Promise.all([
      integracionesService.getPlantillas(),
      automatizacionesService.getLogs(),
    ])
      .then(([planRes, logRes]) => {
        if (planRes.data) setPlantillas(planRes.data)
        if (logRes.data) setLogs(logRes.data)
      })
      .catch((err) => {
        toast.error('Error al cargar automatizaciones', err instanceof Error ? err.message : 'Error')
      })
      .finally(() => setCargando(false))
  }

  const cargarLogs = () => {
    automatizacionesService.getLogs().then((res) => {
      if (res.data) setLogs(res.data)
    })
  }

  const handleLimpiarLogs = async () => {
    if (!confirm('¿Deseas vaciar el historial de ejecuciones de automatización?')) return
    await automatizacionesService.limpiarLogs()
    toast.success('Historial limpiado', 'Se han borrado los logs de auditoría.')
    cargarLogs()
  }

  useEffect(() => {
    cargarDatos()
  }, [])

  const handleGuardarPlantilla = async (id: number, data: Partial<PlantillaMensaje>) => {
    try {
      await integracionesService.actualizarPlantilla(id, data)
      toast.success('Plantilla actualizada con éxito')
      cargarDatos()
    } catch (err) {
      toast.error('Error al actualizar plantilla', err instanceof Error ? err.message : 'Error')
    }
  }

  const tabClass = (t: TabAutomatizacion) =>
    [
      'px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-2',
      tabActivo === t
        ? 'bg-primary-600 text-white shadow-xs'
        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800',
    ].join(' ')

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Workflow className="w-6 h-6 text-amber-500" />
            Automatizaciones & Workflows
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Motor de reglas (Disparador → Condiciones → Acciones), plantillas omnicanal, canales y auditoría
          </p>
        </div>
      </div>

      {/* Tabs de Navegación */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2 overflow-x-auto">
        <button
          onClick={() => setTabActivo('reglas')}
          className={tabClass('reglas')}
        >
          <Zap className="w-4 h-4 text-amber-400" />
          Reglas de Automatización
        </button>

        <button
          onClick={() => setTabActivo('plantillas')}
          className={tabClass('plantillas')}
        >
          <Sparkles className="w-4 h-4 text-primary-300" />
          Plantillas Dinámicas ({plantillas.length})
        </button>

        <button
          onClick={() => setTabActivo('preferencias')}
          className={tabClass('preferencias')}
        >
          <Settings2 className="w-4 h-4 text-blue-400" />
          Canales & Horarios Silenciosos
        </button>

        <button
          onClick={() => setTabActivo('historial')}
          className={tabClass('historial')}
        >
          <History className="w-4 h-4" />
          Historial de Ejecución ({logs.length})
        </button>
      </div>

      {/* Contenido de Tabs */}
      {cargando ? (
        <Loader text="Cargando motor de automatizaciones..." />
      ) : (
        <div className="space-y-6">
          {tabActivo === 'reglas' && (
            <TableroAutomatizaciones onVerLogs={() => setTabActivo('historial')} />
          )}

          {tabActivo === 'plantillas' && (
            <GestionPlantillasMensajes
              plantillas={plantillas}
              onGuardarPlantilla={handleGuardarPlantilla}
            />
          )}

          {tabActivo === 'preferencias' && <PreferenciasComunicacion />}

          {tabActivo === 'historial' && (
            <HistorialEjecuciones
              logs={logs}
              onLimpiarLogs={handleLimpiarLogs}
              onRecargar={cargarLogs}
            />
          )}
        </div>
      )}
    </div>
  )
}
