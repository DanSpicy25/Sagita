import { useState } from 'react'
import { Package, Award, Plus, CheckCircle } from 'lucide-react'
import { ClientePaquete, ClienteMembresia, PaqueteServicio, PlanMembresia } from '@/types'
import { Button, Badge, Modal, Select } from '@/components/ui'

interface TabPaquetesMembresiasProps {
  paquetesCliente: ClientePaquete[]
  membresiasCliente: ClienteMembresia[]
  catalogoPaquetes: PaqueteServicio[]
  catalogoPlanes: PlanMembresia[]
  onConsumirSesion: (cpId: number) => Promise<void>
  onAsignarPaquete: (paqueteId: number) => Promise<void>
  onAsignarMembresia: (planId: number) => Promise<void>
}

export function TabPaquetesMembresias({
  paquetesCliente,
  membresiasCliente,
  catalogoPaquetes,
  catalogoPlanes,
  onConsumirSesion,
  onAsignarPaquete,
  onAsignarMembresia,
}: TabPaquetesMembresiasProps) {
  const [modalAsignarPaquete, setModalAsignarPaquete] = useState(false)
  const [modalAsignarMembresia, setModalAsignarMembresia] = useState(false)
  const [paqueteAAsignarId, setPaqueteAAsignarId] = useState<number>(
    catalogoPaquetes[0]?.id || 0
  )
  const [planAAsignarId, setPlanAAsignarId] = useState<number>(
    catalogoPlanes[0]?.id || 0
  )

  const handleConfirmarPaquete = async () => {
    if (!paqueteAAsignarId) return
    await onAsignarPaquete(paqueteAAsignarId)
    setModalAsignarPaquete(false)
  }

  const handleConfirmarMembresia = async () => {
    if (!planAAsignarId) return
    await onAsignarMembresia(planAAsignarId)
    setModalAsignarMembresia(false)
  }

  return (
    <div className="space-y-6">
      {/* Sección Paquetes */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
            <Package className="w-4 h-4 text-primary-500" />
            Paquetes y Bonos de Sesiones
          </h4>
          <Button
            size="sm"
            variant="secondary"
            leftIcon={<Plus className="w-3.5 h-3.5" />}
            onClick={() => {
              if (catalogoPaquetes.length > 0 && !paqueteAAsignarId) {
                setPaqueteAAsignarId(catalogoPaquetes[0].id)
              }
              setModalAsignarPaquete(true)
            }}
          >
            Asignar Paquete
          </Button>
        </div>

        {paquetesCliente.length === 0 ? (
          <p className="text-xs text-slate-400 py-3 bg-slate-50 dark:bg-slate-900/40 rounded-xl text-center">
            El cliente no posee paquetes de sesiones activos o comprados.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {paquetesCliente.map((cp) => {
              const usadas = cp.sesiones_consumidas ?? cp.sesiones_usadas ?? 0
              const totales = cp.total_sesiones ?? cp.sesiones_totales ?? 1
              const porcentajeUsado = Math.round((usadas / Math.max(1, totales)) * 100)
              return (
                <div
                  key={cp.id}
                  className="card p-4 border border-slate-200 dark:border-slate-800 space-y-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h5 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                        {cp.paquete?.nombre || 'Paquete de Sesiones'}
                      </h5>
                      <span className="text-xs text-slate-400">
                        Válido hasta: {cp.fecha_vencimiento}
                      </span>
                    </div>
                    <Badge
                      variant={
                        cp.estado === 'activo'
                          ? 'success'
                          : cp.estado === 'agotado'
                          ? 'default'
                          : 'danger'
                      }
                      size="sm"
                    >
                      {cp.estado.toUpperCase()}
                    </Badge>
                  </div>

                  {/* Barra de progreso de sesiones */}
                  <div>
                    <div className="flex justify-between text-xs font-semibold mb-1">
                      <span>
                        {cp.sesiones_usadas} de {cp.sesiones_totales} sesiones usadas
                      </span>
                      <span className="text-primary-600 dark:text-primary-400">
                        {cp.sesiones_restantes} restantes
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-primary-600 h-2 rounded-full transition-all"
                        style={{ width: `${porcentajeUsado}%` }}
                      />
                    </div>
                  </div>

                  {cp.estado === 'activo' && cp.sesiones_restantes > 0 && (
                    <div className="flex justify-end pt-1">
                      <Button
                        size="sm"
                        variant="secondary"
                        leftIcon={<CheckCircle className="w-3.5 h-3.5 text-emerald-500" />}
                        onClick={() => onConsumirSesion(cp.id)}
                      >
                        Consumir 1 Sesión
                      </Button>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Sección Membresías */}
      <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
            <Award className="w-4 h-4 text-amber-500" />
            Membresía / Suscripción Recurrente
          </h4>
          <Button
            size="sm"
            variant="secondary"
            leftIcon={<Plus className="w-3.5 h-3.5" />}
            onClick={() => {
              if (catalogoPlanes.length > 0 && !planAAsignarId) {
                setPlanAAsignarId(catalogoPlanes[0].id)
              }
              setModalAsignarMembresia(true)
            }}
          >
            Suscribir a Membresía
          </Button>
        </div>

        {membresiasCliente.length === 0 ? (
          <p className="text-xs text-slate-400 py-3 bg-slate-50 dark:bg-slate-900/40 rounded-xl text-center">
            El cliente no cuenta con membresías o planes activos.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {membresiasCliente.map((cm) => (
              <div
                key={cm.id}
                className="card p-4 border border-amber-200 dark:border-amber-900/50 bg-amber-50/20 dark:bg-amber-950/10 space-y-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider block">
                      PLAN {cm.plan?.periodicidad}
                    </span>
                    <h5 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                      {cm.plan?.nombre}
                    </h5>
                    <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                      ${cm.plan?.precio} / {cm.plan?.periodicidad}
                    </span>
                  </div>
                  <Badge
                    variant={cm.estado === 'activa' ? 'success' : 'warning'}
                    size="sm"
                  >
                    {cm.estado.toUpperCase()}
                  </Badge>
                </div>

                <div className="text-xs text-slate-600 dark:text-slate-400 space-y-1">
                  <p>Inicio: {cm.fecha_inicio}</p>
                  <p>Próxima Renovación: {cm.fecha_renovacion}</p>
                  {cm.plan?.beneficios && cm.plan.beneficios.length > 0 && (
                    <ul className="list-disc list-inside pt-1 text-[11px] text-slate-500">
                      {cm.plan.beneficios.map((b, idx) => (
                        <li key={idx}>{b}</li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal Asignar Paquete */}
      <Modal
        isOpen={modalAsignarPaquete}
        onClose={() => setModalAsignarPaquete(false)}
        title="Asignar Paquete de Sesiones"
      >
        <div className="space-y-4">
          <Select
            label="Seleccionar Paquete de Sesiones"
            value={paqueteAAsignarId}
            onChange={(e) => setPaqueteAAsignarId(Number(e.target.value))}
            options={catalogoPaquetes.map((p) => ({
              value: p.id,
              label: `${p.nombre} — ${p.total_sesiones} sesiones ($${p.precio_total})`,
            }))}
          />
          <div className="flex justify-end gap-2 pt-3">
            <Button variant="secondary" onClick={() => setModalAsignarPaquete(false)}>
              Cancelar
            </Button>
            <Button onClick={handleConfirmarPaquete}>Confirmar y Asignar</Button>
          </div>
        </div>
      </Modal>

      {/* Modal Asignar Membresía */}
      <Modal
        isOpen={modalAsignarMembresia}
        onClose={() => setModalAsignarMembresia(false)}
        title="Suscribir a Membresía"
      >
        <div className="space-y-4">
          <Select
            label="Seleccionar Plan de Membresía"
            value={planAAsignarId}
            onChange={(e) => setPlanAAsignarId(Number(e.target.value))}
            options={catalogoPlanes.map((m) => ({
              value: m.id,
              label: `${m.nombre} — $${m.precio}/${m.periodicidad}`,
            }))}
          />
          <div className="flex justify-end gap-2 pt-3">
            <Button variant="secondary" onClick={() => setModalAsignarMembresia(false)}>
              Cancelar
            </Button>
            <Button onClick={handleConfirmarMembresia}>Activar Suscripción</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
