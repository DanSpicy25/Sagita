import { useState } from 'react'
import { Plus } from 'lucide-react'
import { Cliente } from '@/types'
import { Button } from '@/components/ui'

interface TabNotasBitacoraProps {
  notas: NonNullable<Cliente['notas_historial']>
  onAgregarNota: (texto: string) => Promise<void>
}

export function TabNotasBitacora({ notas, onAgregarNota }: TabNotasBitacoraProps) {
  const [nuevaNotaTexto, setNuevaNotaTexto] = useState('')
  const [guardando, setGuardando] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!nuevaNotaTexto.trim()) return

    setGuardando(true)
    try {
      await onAgregarNota(nuevaNotaTexto.trim())
      setNuevaNotaTexto('')
    } finally {
      setGuardando(false)
    }
  }

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit} className="flex gap-2">
        <textarea
          rows={2}
          placeholder="Escribe una nueva nota técnica / bitácora sobre el cliente..."
          value={nuevaNotaTexto}
          onChange={(e) => setNuevaNotaTexto(e.target.value)}
          className="input-base text-xs flex-1"
          required
        />
        <Button
          type="submit"
          disabled={guardando || !nuevaNotaTexto.trim()}
          leftIcon={<Plus className="w-4 h-4" />}
        >
          {guardando ? 'Guardando...' : 'Añadir Nota'}
        </Button>
      </form>

      <div className="space-y-2.5">
        {notas.length === 0 ? (
          <p className="text-xs text-slate-400 text-center py-6">
            No hay notas registradas en la bitácora aún.
          </p>
        ) : (
          notas.map((n) => (
            <div
              key={n.id}
              className="p-3.5 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200 dark:border-slate-800 text-xs"
            >
              <div className="flex items-center justify-between text-slate-400 text-[11px] mb-1">
                <span className="font-semibold text-slate-700 dark:text-slate-300">
                  {n.autor}
                </span>
                <span>{n.fecha}</span>
              </div>
              <p className="text-slate-800 dark:text-slate-200 leading-relaxed">
                {n.texto}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
