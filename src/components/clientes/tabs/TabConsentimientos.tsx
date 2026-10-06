import { useState } from 'react'
import { FileCheck, CheckCircle } from 'lucide-react'
import { Cliente } from '@/types'
import { Button, Input, Badge } from '@/components/ui'

interface TabConsentimientosProps {
  consentimientos: NonNullable<Cliente['consentimientos']>
  onRegistrarConsentimiento: (titulo: string) => Promise<void>
}

export function TabConsentimientos({
  consentimientos,
  onRegistrarConsentimiento,
}: TabConsentimientosProps) {
  const [nuevoConsentimientoTitulo, setNuevoConsentimientoTitulo] = useState('')
  const [guardando, setGuardando] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!nuevoConsentimientoTitulo.trim()) return

    setGuardando(true)
    try {
      await onRegistrarConsentimiento(nuevoConsentimientoTitulo.trim())
      setNuevoConsentimientoTitulo('')
    } finally {
      setGuardando(false)
    }
  }

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit} className="flex gap-2">
        <Input
          placeholder="Título del consentimiento (ej: Consentimiento Tratamiento Láser)..."
          value={nuevoConsentimientoTitulo}
          onChange={(e) => setNuevoConsentimientoTitulo(e.target.value)}
          className="flex-1"
          required
        />
        <Button
          type="submit"
          disabled={guardando || !nuevoConsentimientoTitulo.trim()}
          leftIcon={<FileCheck className="w-4 h-4" />}
        >
          {guardando ? 'Firmando...' : 'Firmar / Registrar'}
        </Button>
      </form>

      <div className="space-y-2">
        {consentimientos.length === 0 ? (
          <p className="text-xs text-slate-400 text-center py-6">
            No hay consentimientos informados registrados para este cliente.
          </p>
        ) : (
          consentimientos.map((cons) => (
            <div
              key={cons.id}
              className="p-3.5 bg-emerald-50/50 dark:bg-emerald-950/20 rounded-xl border border-emerald-200 dark:border-emerald-800 flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                <div>
                  <h5 className="font-semibold text-xs text-slate-900 dark:text-slate-100">
                    {cons.titulo}
                  </h5>
                  <span className="text-[10px] text-slate-500">
                    Versión {cons.version || '1.0'} • Aceptado el{' '}
                    {cons.fecha || cons.fecha_firma
                      ? new Date(cons.fecha || cons.fecha_firma || '').toLocaleDateString()
                      : 'N/D'}
                  </span>
                </div>
              </div>
              <Badge variant="success" size="sm">
                FIRMADO
              </Badge>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
