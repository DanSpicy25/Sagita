import { useState, useRef, useEffect } from 'react'
import { Building2, Check, ChevronDown, Plus, Sparkles } from 'lucide-react'
import { useTenant } from '@/hooks/useTenant'
import { Badge } from '@/components/ui'
import { useToast } from '@/hooks/useToast'

export function TenantSelector() {
  const { tenants, tenantActivo, cambiarTenant, crearTenant } = useTenant()
  const [abierto, setAbierto] = useState(false)
  const [modalNuevaSede, setModalNuevaSede] = useState(false)
  const [nuevoNombre, setNuevoNombre] = useState('')
  const [nuevoPlan, setNuevoPlan] = useState<'starter' | 'pro' | 'enterprise'>('pro')
  const dropdownRef = useRef<HTMLDivElement>(null)
  const { toast } = useToast()

  // Cerrar dropdown al hacer click afuera
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setAbierto(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleCrearSede = async () => {
    if (!nuevoNombre.trim()) {
      toast.warning('Campo requerido', 'Ingresa el nombre de la sucursal')
      return
    }
    await crearTenant({
      nombre: nuevoNombre.trim(),
      slug: nuevoNombre.toLowerCase().replace(/\s+/g, '-'),
      plan: nuevoPlan,
    })
    toast.success('Sucursal creada', `Se ha agregado ${nuevoNombre} al sistema`)
    setNuevoNombre('')
    setModalNuevaSede(false)
    setAbierto(false)
  }

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Botón Switcher */}
      <button
        type="button"
        onClick={() => setAbierto((o) => !o)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all text-xs font-semibold text-slate-800 dark:text-slate-200 shadow-xs"
        aria-label="Seleccionar sucursal"
      >
        <Building2 className="w-3.5 h-3.5 text-primary-600 shrink-0" />
        <span className="max-w-[130px] truncate">{tenantActivo.nombre}</span>
        <Badge
          variant={tenantActivo.plan === 'enterprise' ? 'warning' : 'primary'}
          size="sm"
        >
          {tenantActivo.plan.toUpperCase()}
        </Badge>
        <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${abierto ? 'rotate-180' : ''}`} />
      </button>

      {/* Menú Desplegable */}
      {abierto && (
        <div className="absolute left-0 mt-2 w-72 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-xl z-50 p-2 space-y-1 animate-slide-down">
          <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Sucursales / Sedes
            </span>
            <span className="text-[11px] text-slate-400">{tenants.length} activas</span>
          </div>

          <div className="max-h-60 overflow-y-auto space-y-1 py-1">
            {tenants.map((t) => {
              const esActivo = t.id === tenantActivo.id
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => {
                    cambiarTenant(t.id)
                    setAbierto(false)
                    toast.info('Sede cambiada', `Ahora visualizando: ${t.nombre}`)
                  }}
                  className={`w-full p-2.5 rounded-xl text-left flex items-center justify-between gap-2 transition-all ${
                    esActivo
                      ? 'bg-primary-50 dark:bg-primary-950/40 text-primary-700 dark:text-primary-300 font-semibold'
                      : 'hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs'
                  }`}
                >
                  <div className="min-w-0">
                    <p className="text-xs font-bold truncate">{t.nombre}</p>
                    <p className="text-[10px] text-slate-400 truncate">
                      {t.citas_mes} / {t.limite_citas} citas este mes
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <Badge size="sm" variant={t.plan === 'enterprise' ? 'warning' : 'default'}>
                      {t.plan}
                    </Badge>
                    {esActivo && <Check className="w-4 h-4 text-primary-600" />}
                  </div>
                </button>
              )
            })}
          </div>

          <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setModalNuevaSede(true)}
              className="w-full py-2 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              Añadir Nueva Sede
            </button>
          </div>
        </div>
      )}

      {/* Modal Nueva Sede */}
      {modalNuevaSede && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-sm w-full p-5 space-y-4 shadow-2xl">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary-600" />
              <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">
                Crear Nueva Sede
              </h3>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-500 font-medium mb-1">Nombre de la Sucursal</label>
                <input
                  type="text"
                  value={nuevoNombre}
                  onChange={(e) => setNuevoNombre(e.target.value)}
                  placeholder="Ej. Sucursal Santa Fe"
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div>
                <label className="block text-slate-500 font-medium mb-1">Plan de Suscripción</label>
                <select
                  value={nuevoPlan}
                  onChange={(e) => setNuevoPlan(e.target.value as 'starter' | 'pro' | 'enterprise')}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-800 dark:text-slate-200"
                >
                  <option value="starter">Starter (Hasta 200 citas/mes)</option>
                  <option value="pro">Pro (Hasta 500 citas/mes)</option>
                  <option value="enterprise">Enterprise (Ilimitado + API)</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setModalNuevaSede(false)}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-500 hover:text-slate-700"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleCrearSede}
                className="px-4 py-1.5 rounded-xl text-xs font-semibold bg-primary-600 text-white hover:bg-primary-700 shadow-sm"
              >
                Crear Sucursal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

