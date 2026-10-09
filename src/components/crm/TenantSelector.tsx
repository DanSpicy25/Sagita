import { useState, useRef, useEffect } from 'react'
import { Building2, Check, ChevronDown, Plus, Sparkles } from 'lucide-react'
import { useTenant } from '@/hooks/useTenant'
import { Badge, Modal, Button, Input, Select } from '@/components/ui'
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
    <div className="relative inline-block" ref={dropdownRef}>
      {/* Botón Switcher */}
      <button
        type="button"
        onClick={() => setAbierto((o) => !o)}
        className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg border border-border bg-surface-subtle hover:bg-surface transition-all text-xs font-semibold text-text shadow-xs cursor-pointer"
        aria-label="Seleccionar sucursal"
      >
        <Building2 className="w-3.5 h-3.5 text-primary shrink-0" />
        <span className="max-w-[120px] truncate">{tenantActivo.nombre}</span>
        <Badge
          variant={tenantActivo.plan === 'enterprise' ? 'warning' : 'primary'}
          size="sm"
        >
          {tenantActivo.plan.toUpperCase()}
        </Badge>
        <ChevronDown
          className={`w-3.5 h-3.5 text-text-muted transition-transform duration-150 ${
            abierto ? 'rotate-180' : ''
          }`}
        />
      </button>

      {/* Menú Desplegable */}
      {abierto && (
        <div className="absolute left-0 mt-2 w-72 bg-surface-elevated text-text border border-border rounded-xl shadow-elevated z-popover p-2 space-y-1 animate-fade-in">
          <div className="px-3 py-2 border-b border-border-subtle flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-text-muted">
              Sucursales / Sedes
            </span>
            <span className="text-[11px] text-text-muted">{tenants.length} activas</span>
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
                  className={`w-full p-2.5 rounded-lg text-left flex items-center justify-between gap-2 transition-all cursor-pointer ${
                    esActivo
                      ? 'bg-primary-soft text-primary font-semibold'
                      : 'hover:bg-surface-subtle text-text text-xs'
                  }`}
                >
                  <div className="min-w-0">
                    <p className="text-xs font-semibold truncate leading-tight">{t.nombre}</p>
                    <p className="text-[10px] text-text-muted truncate mt-0.5">
                      {t.citas_mes} / {t.limite_citas} citas este mes
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <Badge size="sm" variant={t.plan === 'enterprise' ? 'warning' : 'default'}>
                      {t.plan}
                    </Badge>
                    {esActivo && <Check className="w-3.5 h-3.5 text-primary" />}
                  </div>
                </button>
              )
            })}
          </div>

          <div className="pt-2 border-t border-border-subtle">
            <button
              type="button"
              onClick={() => {
                setAbierto(false)
                setModalNuevaSede(true)
              }}
              className="w-full py-2 px-3 rounded-lg bg-surface-subtle hover:bg-surface text-text text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer border border-border-subtle"
            >
              <Plus className="w-3.5 h-3.5" />
              Añadir Nueva Sede
            </button>
          </div>
        </div>
      )}

      {/* Modal Nueva Sede */}
      <Modal
        isOpen={modalNuevaSede}
        onClose={() => setModalNuevaSede(false)}
        title={
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            <span>Crear Nueva Sede</span>
          </div>
        }
        description="Agrega una nueva sucursal o franquicia a tu cuenta"
        size="sm"
        footer={
          <>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setModalNuevaSede(false)}
            >
              Cancelar
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleCrearSede}
            >
              Crear Sucursal
            </Button>
          </>
        }
      >
        <div className="space-y-4 text-xs">
          <Input
            label="Nombre de la Sucursal"
            value={nuevoNombre}
            onChange={(e) => setNuevoNombre(e.target.value)}
            placeholder="Ej. Sucursal Santa Fe"
          />

          <Select
            label="Plan de Suscripción"
            value={nuevoPlan}
            onChange={(e) => setNuevoPlan(e.target.value as 'starter' | 'pro' | 'enterprise')}
            options={[
              { value: 'starter', label: 'Starter (Hasta 200 citas/mes)' },
              { value: 'pro', label: 'Pro (Hasta 500 citas/mes)' },
              { value: 'enterprise', label: 'Enterprise (Ilimitado + API)' },
            ]}
          />
        </div>
      </Modal>
    </div>
  )
}
