import { useState } from 'react'
import { Tag, Check, X } from 'lucide-react'
import { Cupon } from '@/types'
import { pagosService } from '@/services/pagos.service'
import { Button } from '@/components/ui'

interface CuponInputProps {
  total: number
  cuponAplicado?: Cupon
  descuentoActual?: number
  onAplicarCupon: (descuento: number, cupon?: Cupon) => void
}

export function CuponInput({
  total,
  cuponAplicado,
  descuentoActual = 0,
  onAplicarCupon,
}: CuponInputProps) {
  const [codigo, setCodigo] = useState('')
  const [cargando, setCargando] = useState(false)
  const [errorMensaje, setErrorMensaje] = useState<string | null>(null)

  const handleValidar = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!codigo.trim()) return

    setCargando(true)
    setErrorMensaje(null)

    try {
      const res = await pagosService.validarCupon(codigo, total)
      if (res.data?.valido && res.data.descuento_calculado !== undefined) {
        onAplicarCupon(res.data.descuento_calculado, res.data.cupon)
        setCodigo('')
      } else {
        setErrorMensaje(res.data?.mensaje ?? 'El código no es válido')
      }
    } catch {
      setErrorMensaje('No se pudo verificar el cupón')
    } finally {
      setCargando(false)
    }
  }

  const handleQuitar = () => {
    onAplicarCupon(0, undefined)
    setErrorMensaje(null)
  }

  return (
    <div className="space-y-2">
      <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
        <Tag className="w-3.5 h-3.5 text-primary-500" />
        ¿Tienes un cupón de descuento?
      </label>

      {cuponAplicado ? (
        <div className="flex items-center justify-between p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-xs">
          <div className="flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center">
              <Check className="w-3 h-3" />
            </span>
            <div>
              <span className="font-bold text-emerald-800 dark:text-emerald-200">
                {cuponAplicado.codigo}
              </span>
              <span className="text-emerald-600 dark:text-emerald-400 ml-1.5 font-medium">
                (-${descuentoActual} de descuento)
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={handleQuitar}
            className="p-1 rounded-lg hover:bg-emerald-100 dark:hover:bg-emerald-900 text-emerald-700 dark:text-emerald-300"
            aria-label="Quitar cupón"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <form onSubmit={handleValidar} className="flex gap-2">
          <input
            type="text"
            placeholder="Ej: SAGITTA20, BIENVENIDA10..."
            value={codigo}
            onChange={(e) => {
              setCodigo(e.target.value.toUpperCase())
              setErrorMensaje(null)
            }}
            className="input-base text-xs py-2 uppercase tracking-wider"
          />
          <Button
            type="submit"
            variant="secondary"
            size="sm"
            isLoading={cargando}
            disabled={!codigo.trim()}
          >
            Aplicar
          </Button>
        </form>
      )}

      {errorMensaje && (
        <p className="text-xs text-red-500 animate-fade-in">{errorMensaje}</p>
      )}
    </div>
  )
}

