import { useState, FormEvent } from 'react'
import { Modal, Button, Input } from '@/components/ui'
import { Key, Copy, Check, ShieldCheck, AlertTriangle } from 'lucide-react'
import { ApiKey } from '@/types'
import { useToast } from '@/hooks/useToast'

interface Props {
  isOpen: boolean
  onClose: () => void
  onCrear: (data: { nombre: string; permisos: 'read' | 'write' | 'admin' }) => Promise<ApiKey | void>
}

export function ModalApiKey({ isOpen, onClose, onCrear }: Props) {
  const [nombre, setNombre] = useState('')
  const [permisos, setPermisos] = useState<'read' | 'write' | 'admin'>('read')
  const [tokenGenerado, setTokenGenerado] = useState<string | null>(null)
  const [copiado, setCopiado] = useState(false)
  const [cargando, setCargando] = useState(false)
  const { toast } = useToast()

  const handleCerrar = () => {
    setNombre('')
    setPermisos('read')
    setTokenGenerado(null)
    setCopiado(false)
    onClose()
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!nombre.trim()) {
      toast.warning('Campo requerido', 'Ingresa una etiqueta para identificar la clave')
      return
    }

    setCargando(true)
    try {
      const res = await onCrear({ nombre: nombre.trim(), permisos })
      if (res && res.token) {
        setTokenGenerado(res.token)
      } else {
        handleCerrar()
      }
    } finally {
      setCargando(false)
    }
  }

  const handleCopiarToken = () => {
    if (!tokenGenerado) return
    navigator.clipboard.writeText(tokenGenerado)
    setCopiado(true)
    setTimeout(() => setCopiado(false), 2200)
    toast.success('Clave copiada', 'Pégala en tu archivo de variables de entorno')
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleCerrar}
      title={tokenGenerado ? '¡Clave de API Generada!' : 'Crear Nueva Clave de API'}
      size="md"
    >
      {tokenGenerado ? (
        <div className="space-y-4">
          <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-xl flex items-start gap-2.5 text-xs text-amber-800 dark:text-amber-200">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Guarda esta clave secreta ahora</p>
              <p>Por seguridad, no podrás volver a consultar este token una vez cierres esta ventana.</p>
            </div>
          </div>

          <div className="space-y-1.5">
            <span className="text-xs text-slate-400">Token secreto (Bearer):</span>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={tokenGenerado}
                className="w-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-slate-800 dark:text-slate-200 focus:outline-none"
              />
              <Button
                variant="secondary"
                size="sm"
                onClick={handleCopiarToken}
                leftIcon={copiado ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
              >
                {copiado ? 'Copiado' : 'Copiar'}
              </Button>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end">
            <Button onClick={handleCerrar} size="sm">
              Entendido y Guardado
            </Button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Nombre o Aplicación"
            placeholder="Ej. Zapier Integración, App Móvil Clientes, ERP SAP"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            hint="Te ayuda a recordar en qué servicio está instalada esta clave"
          />

          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
              Nivel de Permisos (Scopes)
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {[
                {
                  id: 'read' as const,
                  nombre: 'Read (Lectura)',
                  desc: 'Consultar citas, catálogo y disponibilidad',
                },
                {
                  id: 'write' as const,
                  nombre: 'Write (Escritura)',
                  desc: 'Crear citas y registrar clientes',
                },
                {
                  id: 'admin' as const,
                  nombre: 'Admin (Total)',
                  desc: 'Acceso total incluyendo cobros y config',
                },
              ].map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setPermisos(p.id)}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    permisos === p.id
                      ? 'border-primary-500 bg-primary-50/30 dark:bg-primary-950/20 ring-1 ring-primary-500'
                      : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
                  }`}
                >
                  <p className="font-bold text-xs text-slate-900 dark:text-slate-100">{p.nombre}</p>
                  <p className="text-[10px] text-slate-400 mt-0.5 leading-tight">{p.desc}</p>
                </button>
              ))}
            </div>
          </div>

          <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>Las peticiones deberán incluir la cabecera <code>X-API-Key: sag_live_...</code></span>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
            <Button variant="ghost" size="sm" type="button" onClick={handleCerrar}>
              Cancelar
            </Button>
            <Button size="sm" type="submit" isLoading={cargando} leftIcon={<Key className="w-4 h-4" />}>
              Generar Clave
            </Button>
          </div>
        </form>
      )}
    </Modal>
  )
}

