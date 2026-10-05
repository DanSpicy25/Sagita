import { useState } from 'react'
import { MessageSquare, Mail, Bell, Sparkles } from 'lucide-react'
import { PlantillaMensaje } from '@/types'
import { Button, Textarea, Input } from '@/components/ui'
import { useToast } from '@/hooks/useToast'

interface PlantillaEditorProps {
  plantilla: PlantillaMensaje
  onGuardar: (id: number, data: Partial<PlantillaMensaje>) => Promise<void>
}

const VARIABLES_DISPONIBLES = [
  { clave: '{cliente}', desc: 'Nombre del paciente' },
  { clave: '{servicio}', desc: 'Nombre del tratamiento' },
  { clave: '{profesional}', desc: 'Nombre del especialista' },
  { clave: '{fecha}', desc: 'Fecha de la cita' },
  { clave: '{hora}', desc: 'Hora pactada' },
  { clave: '{enlace_videollamada}', desc: 'Enlace Meet/Zoom' },
]

export function PlantillaEditor({ plantilla, onGuardar }: PlantillaEditorProps) {
  const [cuerpo, setCuerpo] = useState(plantilla.cuerpo)
  const [asunto, setAsunto] = useState(plantilla.asunto ?? '')
  const [cargando, setCargando] = useState(false)
  const { toast } = useToast()

  const insertarVariable = (variable: string) => {
    setCuerpo((prev) => prev + ` ${variable}`)
  }

  // Previsualización reemplazando variables de muestra
  const vistaPrevia = cuerpo
    .replace(/{cliente}/g, 'Ana García')
    .replace(/{servicio}/g, 'Consulta General')
    .replace(/{profesional}/g, 'Dr. Carlos Pérez')
    .replace(/{fecha}/g, '20 de Septiembre')
    .replace(/{hora}/g, '10:00 AM')
    .replace(/{enlace_videollamada}/g, 'https://meet.google.com/sag-123')

  const handleGuardar = async () => {
    setCargando(true)
    try {
      await onGuardar(plantilla.id, { cuerpo, asunto })
      toast.success('Plantilla actualizada', `Se guardaron los cambios para ${plantilla.nombre}`)
    } catch {
      toast.error('Error', 'No se pudo guardar la plantilla')
    } finally {
      setCargando(false)
    }
  }

  return (
    <div className="card p-5 border border-slate-200 dark:border-slate-800 space-y-4 text-xs">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2">
          {plantilla.canal === 'whatsapp' && <MessageSquare className="w-4 h-4 text-emerald-500" />}
          {plantilla.canal === 'email' && <Mail className="w-4 h-4 text-blue-500" />}
          {plantilla.canal === 'push' && <Bell className="w-4 h-4 text-purple-500" />}
          <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200">{plantilla.nombre}</h4>
        </div>
        <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
          Canal: {plantilla.canal}
        </span>
      </div>

      {plantilla.canal === 'email' && (
        <Input
          label="Línea de Asunto"
          value={asunto}
          onChange={(e) => setAsunto(e.target.value)}
          placeholder="Ej: Confirmación de Cita..."
        />
      )}

      {/* Variables insertables */}
      <div>
        <label className="font-semibold text-slate-600 dark:text-slate-400 mb-1.5 flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-primary-500" />
          Haz clic para insertar variables dinámicas:
        </label>
        <div className="flex flex-wrap gap-1.5">
          {VARIABLES_DISPONIBLES.map((v) => (
            <button
              key={v.clave}
              type="button"
              onClick={() => insertarVariable(v.clave)}
              className="px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-primary-50 dark:hover:bg-primary-950/40 hover:text-primary-600 text-[10px] font-mono font-semibold transition-colors"
              title={v.desc}
            >
              {v.clave}
            </button>
          ))}
        </div>
      </div>

      <Textarea
        label="Cuerpo del Mensaje"
        value={cuerpo}
        onChange={(e) => setCuerpo(e.target.value)}
        rows={4}
      />

      {/* Vista previa en vivo */}
      <div className="p-3.5 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-dashed border-slate-200 dark:border-slate-700">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
          Vista previa del cliente:
        </span>
        <p className="text-slate-700 dark:text-slate-300 whitespace-pre-line text-xs font-sans">
          {vistaPrevia}
        </p>
      </div>

      <div className="flex justify-end pt-2">
        <Button onClick={handleGuardar} isLoading={cargando} size="sm">
          Guardar Plantilla
        </Button>
      </div>
    </div>
  )
}

