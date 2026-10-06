import { useState, useRef } from 'react'
import { AlertCircle, FileJson } from 'lucide-react'
import { Button, Modal } from '@/components/ui'

interface ModalImportarTemaProps {
  isOpen: boolean
  onClose: () => void
  onProcesarImportacion: (jsonContent: string) => Promise<void>
  erroresImportacion: string[]
}

export function ModalImportarTema({
  isOpen,
  onClose,
  onProcesarImportacion,
  erroresImportacion,
}: ModalImportarTemaProps) {
  const [jsonImportar, setJsonImportar] = useState('')
  const [procesando, setProcesando] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = async (event) => {
      const content = event.target?.result as string
      if (content) {
        setJsonImportar(content)
        setProcesando(true)
        try {
          await onProcesarImportacion(content)
        } finally {
          setProcesando(false)
        }
      }
    }
    reader.readAsText(file)
  }

  const handleSubmit = async () => {
    if (!jsonImportar.trim()) return
    setProcesando(true)
    try {
      await onProcesarImportacion(jsonImportar)
    } finally {
      setProcesando(false)
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Importar Configuración de Tema Visual"
      size="lg"
      footer={
        <div className="flex items-center justify-end gap-2">
          <Button variant="secondary" size="sm" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            size="sm"
            disabled={!jsonImportar.trim() || procesando}
            isLoading={procesando}
            onClick={handleSubmit}
          >
            Validar y Aplicar Tema
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
          Puedes cargar un archivo de tema (<code>.json</code>) exportado previamente o pegar el
          contenido JSON en el editor. El sistema validará exhaustivamente la estructura y
          garantizará que no contenga credenciales ni claves privadas.
        </p>

        <div className="flex items-center gap-3">
          <input
            type="file"
            ref={fileInputRef}
            accept=".json,application/json"
            onChange={handleFileChange}
            className="hidden"
          />
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            leftIcon={<FileJson className="w-4 h-4" />}
          >
            Seleccionar Archivo JSON
          </Button>
          <span className="text-xs text-slate-400">o pega el JSON directamente abajo:</span>
        </div>

        <div>
          <textarea
            rows={8}
            value={jsonImportar}
            onChange={(e) => setJsonImportar(e.target.value)}
            placeholder='{\n  "version": "1.0.0",\n  "brand": { "name": "Mi Negocio" },\n  "colors": { "primary": "#2563eb" },\n  "typography": { "fontBody": "Poppins" },\n  "radius": "moderno",\n  "shadows": "subtle",\n  "density": "comfortable",\n  "mode": "light"\n}'
            className="w-full font-mono text-xs p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>

        {erroresImportacion.length > 0 && (
          <div className="p-3.5 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/40 text-xs space-y-1.5 text-red-700 dark:text-red-300">
            <div className="flex items-center gap-1.5 font-bold">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>El tema no pasó la validación de seguridad e integridad:</span>
            </div>
            <ul className="list-disc list-inside space-y-0.5 text-[11px] pl-1">
              {erroresImportacion.map((err, i) => (
                <li key={i}>{err}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </Modal>
  )
}

