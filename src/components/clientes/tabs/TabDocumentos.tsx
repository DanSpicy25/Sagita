import { useState } from 'react'
import { FileText, Plus, Download } from 'lucide-react'
import { Cliente } from '@/types'
import { Button, Input } from '@/components/ui'

interface TabDocumentosProps {
  archivos: NonNullable<Cliente['archivos']>
  onAgregarArchivo: (nombre: string) => Promise<void>
}

export function TabDocumentos({ archivos, onAgregarArchivo }: TabDocumentosProps) {
  const [nuevoArchivoNombre, setNuevoArchivoNombre] = useState('')
  const [guardando, setGuardando] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!nuevoArchivoNombre.trim()) return

    setGuardando(true)
    try {
      await onAgregarArchivo(nuevoArchivoNombre.trim())
      setNuevoArchivoNombre('')
    } finally {
      setGuardando(false)
    }
  }

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit} className="flex gap-2">
        <Input
          placeholder="Nombre del documento (ej: Analisis_Clinico.pdf)..."
          value={nuevoArchivoNombre}
          onChange={(e) => setNuevoArchivoNombre(e.target.value)}
          className="flex-1"
          required
        />
        <Button
          type="submit"
          disabled={guardando || !nuevoArchivoNombre.trim()}
          leftIcon={<Plus className="w-4 h-4" />}
        >
          {guardando ? 'Guardando...' : 'Vincular Archivo'}
        </Button>
      </form>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {archivos.length === 0 ? (
          <p className="text-xs text-slate-400 text-center py-6 col-span-2">
            No hay archivos o documentos adjuntos en el expediente.
          </p>
        ) : (
          archivos.map((arch) => (
            <div
              key={arch.id}
              className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-between"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-primary-100 dark:bg-primary-950/50 text-primary-600 flex items-center justify-center flex-shrink-0">
                  <FileText className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <h5 className="font-semibold text-xs text-slate-900 dark:text-slate-100 truncate">
                    {arch.nombre}
                  </h5>
                  <span className="text-[10px] text-slate-400">
                    {arch.fecha} • {arch.tamano || '1.0 MB'}
                  </span>
                </div>
              </div>
              <a
                href={arch.url}
                download
                className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500"
                title="Descargar"
              >
                <Download className="w-4 h-4" />
              </a>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
