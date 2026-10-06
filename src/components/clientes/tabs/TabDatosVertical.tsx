import { Save } from 'lucide-react'
import { Button } from '@/components/ui'

interface TabDatosVerticalProps {
  extensiones: Record<string, any>
  onChangeExtensiones: (nuevas: Record<string, any>) => void
  onGuardar: () => Promise<void>
}

export function TabDatosVertical({
  extensiones,
  onChangeExtensiones,
  onGuardar,
}: TabDatosVerticalProps) {
  const entradas = Object.entries(extensiones || {})

  return (
    <div className="space-y-4">
      <div className="p-4 bg-primary-50/50 dark:bg-primary-950/20 rounded-xl border border-primary-100 dark:border-primary-900 text-xs text-slate-600 dark:text-slate-300">
        <p className="font-semibold text-primary-700 dark:text-primary-300 mb-1">
          Extensiones por Vertical Activa
        </p>
        <p>
          Campos personalizados para salud, estética, bienestar o retail sin
          contaminar la estructura base de la plataforma.
        </p>
      </div>

      {entradas.length === 0 ? (
        <p className="text-xs text-slate-400 text-center py-6">
          No hay campos adicionales configurados para la vertical actual.
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {entradas.map(([clave, valor]) => (
            <div key={clave}>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 capitalize">
                {clave.replace(/_/g, ' ')}
              </label>
              <input
                type="text"
                value={String(valor)}
                onChange={(e) => {
                  onChangeExtensiones({
                    ...extensiones,
                    [clave]: e.target.value,
                  })
                }}
                className="input-base text-xs w-full"
              />
            </div>
          ))}
        </div>
      )}

      {entradas.length > 0 && (
        <div className="pt-2 flex justify-end">
          <Button
            type="button"
            onClick={onGuardar}
            leftIcon={<Save className="w-4 h-4" />}
          >
            Guardar Extensiones
          </Button>
        </div>
      )}
    </div>
  )
}
