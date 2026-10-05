import React, { useState, useEffect } from 'react'
import {
  Tag,
  Plus,
  Clock,
  CheckCircle,
  ToggleLeft,
  ToggleRight,
  Flame,
  Zap,
} from 'lucide-react'
import { Promocion } from '@/types'
import { LocalStorageAdapter } from '@/repositories/local/LocalStorageAdapter'
import {
  Button,
  Badge,
  Modal,
  Input,
  Select,
  EmptyState,
} from '@/components/ui'
import { useToast } from '@/hooks/useToast'

const PROMOCIONES_DEFAULT: Promocion[] = [
  {
    id: 1,
    nombre: 'Happy Hour Tardes de Belleza',
    codigo: 'HAPPY-TARDE',
    tipo: 'porcentaje',
    valor: 20, // 20% OFF
    alcance: 'todos',
    solo_primera_compra: false,
    hora_inicio: '14:00',
    hora_fin: '17:00',
    usos_max: 100,
    usos_actuales: 34,
    activo: true,
  },
  {
    id: 2,
    nombre: 'Bienvenida Nuevos Clientes',
    codigo: 'BIENVENIDO10',
    tipo: 'monto_fijo',
    valor: 5000, // $5.000 fijo
    alcance: 'todos',
    solo_primera_compra: true,
    usos_max: 50,
    usos_actuales: 18,
    activo: true,
  },
  {
    id: 3,
    nombre: 'Descuento Primavera Tratamientos',
    codigo: 'SPRING25',
    tipo: 'porcentaje',
    valor: 25,
    alcance: 'servicio',
    referencia_id: 2,
    solo_primera_compra: false,
    fecha_inicio: '2026-09-01',
    fecha_fin: '2026-11-30',
    usos_actuales: 42,
    activo: true,
  },
]

export function GestionPromociones() {
  const [promociones, setPromociones] = useState<Promocion[]>([])
  const [modalAbierto, setModalAbierto] = useState(false)

  // Form State
  const [nombre, setNombre] = useState('')
  const [codigo, setCodigo] = useState('')
  const [tipo, setTipo] = useState<'porcentaje' | 'monto_fijo'>('porcentaje')
  const [valor, setValor] = useState<number>(15)
  const [soloPrimeraCompra, setSoloPrimeraCompra] = useState(false)
  const [usosMax, setUsosMax] = useState<number>(50)
  const [horaInicio, setHoraInicio] = useState('')
  const [horaFin, setHoraFin] = useState('')

  const { toast } = useToast()

  const cargarDatos = () => {
    const guardadas = LocalStorageAdapter.get<Promocion[]>('promociones', PROMOCIONES_DEFAULT)
    if (!guardadas || guardadas.length === 0) {
      LocalStorageAdapter.set('promociones', PROMOCIONES_DEFAULT)
      setPromociones(PROMOCIONES_DEFAULT)
    } else {
      setPromociones(guardadas)
    }
  }

  useEffect(() => {
    cargarDatos()
  }, [])

  const handleToggleActivo = (id: number) => {
    const actualizadas = promociones.map((p) =>
      p.id === id ? { ...p, activo: !p.activo } : p
    )
    LocalStorageAdapter.set('promociones', actualizadas)
    setPromociones(actualizadas)
    toast.info('Estado actualizado', 'La promoción ha cambiado su vigencia')
  }

  const handleCrearPromocion = (e: React.FormEvent) => {
    e.preventDefault()
    if (!nombre.trim()) {
      toast.warning('Campo requerido', 'Ingresa un nombre para la campaña')
      return
    }

    const nueva: Promocion = {
      id: Date.now(),
      nombre: nombre.trim(),
      codigo: codigo.trim().toUpperCase() || undefined,
      tipo,
      valor,
      alcance: 'todos',
      solo_primera_compra: soloPrimeraCompra,
      hora_inicio: horaInicio.trim() || undefined,
      hora_fin: horaFin.trim() || undefined,
      usos_max: usosMax > 0 ? usosMax : undefined,
      usos_actuales: 0,
      activo: true,
    }

    const actualizadas = [nueva, ...promociones]
    LocalStorageAdapter.set('promociones', actualizadas)
    setPromociones(actualizadas)
    setModalAbierto(false)
    toast.success('Promoción Creada', `Campaña "${nueva.nombre}" activada exitosamente`)
  }

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-3">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Flame className="w-5 h-5 text-amber-500" />
            Campañas Promocionales y Descuentos
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Configura descuentos porcentuales, montos fijos por ticket, cupones y happy hours por franja horaria.
          </p>
        </div>

        <Button
          size="sm"
          onClick={() => {
            setNombre('')
            setCodigo('')
            setTipo('porcentaje')
            setValor(15)
            setSoloPrimeraCompra(false)
            setUsosMax(50)
            setHoraInicio('')
            setHoraFin('')
            setModalAbierto(true)
          }}
          leftIcon={<Plus className="w-4 h-4" />}
        >
          Nueva Promoción
        </Button>
      </div>

      {/* Grid de Promociones */}
      {promociones.length === 0 ? (
        <EmptyState
          title="Sin promociones activas"
          description="Crea promociones para incentivar la concurrencia en días u horarios valle."
          icon={<Tag className="w-10 h-10 text-slate-400" />}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {promociones.map((promo) => (
            <div
              key={promo.id}
              className={`p-5 rounded-2xl border shadow-sm flex flex-col justify-between transition-all ${
                promo.activo
                  ? 'bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800'
                  : 'bg-slate-50/50 dark:bg-slate-900/40 border-dashed border-slate-200 dark:border-slate-800 opacity-60'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
                      <Zap className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                        {promo.nombre}
                      </h4>
                      {promo.codigo && (
                        <span className="font-mono text-xs font-semibold text-primary-600 dark:text-primary-400">
                          {promo.codigo}
                        </span>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => handleToggleActivo(promo.id)}
                    className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                    title={promo.activo ? 'Desactivar' : 'Activar'}
                  >
                    {promo.activo ? (
                      <ToggleRight className="w-6 h-6 text-emerald-500" />
                    ) : (
                      <ToggleLeft className="w-6 h-6 text-slate-400" />
                    )}
                  </button>
                </div>

                <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl my-3 flex items-center justify-between">
                  <span className="text-xs text-slate-500">Beneficio:</span>
                  <span className="font-bold text-sm text-slate-900 dark:text-slate-100">
                    {promo.tipo === 'porcentaje' ? `${promo.valor}% OFF` : `$${promo.valor.toLocaleString()} OFF`}
                  </span>
                </div>

                <div className="space-y-1 text-xs text-slate-500">
                  {promo.hora_inicio && promo.hora_fin && (
                    <div className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400 font-medium">
                      <Clock className="w-3.5 h-3.5" />
                      <span>Horario Valle: {promo.hora_inicio} — {promo.hora_fin}</span>
                    </div>
                  )}
                  {promo.solo_primera_compra && (
                    <div className="flex items-center gap-1.5 text-primary-600 dark:text-primary-400">
                      <CheckCircle className="w-3.5 h-3.5" />
                      <span>Válido solo primera cita</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-400">
                <span>
                  Usos: {promo.usos_actuales} {promo.usos_max ? `/ ${promo.usos_max}` : ''}
                </span>
                <Badge variant={promo.activo ? 'success' : 'default'} size="sm">
                  {promo.activo ? 'Activa' : 'Pausada'}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Nueva Promoción */}
      {modalAbierto && (
        <Modal
          isOpen={true}
          onClose={() => setModalAbierto(false)}
          title="Crear Nueva Promoción"
        >
          <form onSubmit={handleCrearPromocion} className="space-y-4">
            <Input
              label="Nombre de la Campaña *"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Ej. Descuento Verano 2026"
              required
            />
            <Input
              label="Código de Cupón (Opcional)"
              value={codigo}
              onChange={(e) => setCodigo(e.target.value)}
              placeholder="Ej. VERANO20"
            />
            <div className="grid grid-cols-2 gap-3">
              <Select
                label="Tipo de Beneficio *"
                value={tipo}
                onChange={(e) => setTipo(e.target.value as any)}
                options={[
                  { value: 'porcentaje', label: 'Porcentaje (%)' },
                  { value: 'monto_fijo', label: 'Monto Fijo ($)' },
                ]}
              />
              <Input
                label={tipo === 'porcentaje' ? 'Descuento (%) *' : 'Descuento ($) *'}
                type="number"
                min={1}
                max={tipo === 'porcentaje' ? 100 : undefined}
                value={valor}
                onChange={(e) => setValor(Number(e.target.value))}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Hora Inicio (Happy Hour)"
                type="time"
                value={horaInicio}
                onChange={(e) => setHoraInicio(e.target.value)}
              />
              <Input
                label="Hora Fin (Happy Hour)"
                type="time"
                value={horaFin}
                onChange={(e) => setHoraFin(e.target.value)}
              />
            </div>

            <Input
              label="Límite Máximo de Usos"
              type="number"
              min={1}
              value={usosMax}
              onChange={(e) => setUsosMax(Number(e.target.value))}
            />

            <div className="flex items-center gap-2 p-3 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs">
              <input
                type="checkbox"
                id="solo-primera"
                checked={soloPrimeraCompra}
                onChange={(e) => setSoloPrimeraCompra(e.target.checked)}
                className="w-4 h-4 text-primary-600 rounded"
              />
              <label htmlFor="solo-primera" className="font-medium text-slate-700 dark:text-slate-300 cursor-pointer">
                Aplicar exclusivamente a primera compra de nuevos clientes
              </label>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
              <Button variant="ghost" type="button" onClick={() => setModalAbierto(false)}>
                Cancelar
              </Button>
              <Button type="submit">Activar Promoción</Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  )
}
