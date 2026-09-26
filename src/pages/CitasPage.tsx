import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Calendar as CalIcon, CalendarDays, ListFilter, Receipt } from 'lucide-react'
import { Cita, VistaCalendario, EstadoCita, Factura } from '@/types'
import { citasService } from '@/services/citas.service'
import { pagosService } from '@/services/pagos.service'
import {
  CalendarioMensual,
  CalendarioSemanal,
  VistaLista,
} from '@/components/calendario'
import { FacturaModal } from '@/components/pagos/FacturaModal'
import { Button, Loader, Modal, Badge } from '@/components/ui'
import { useToast } from '@/hooks/useToast'

export default function CitasPage() {
  const [citas, setCitas] = useState<Cita[]>([])
  const [cargando, setCargando] = useState(true)
  const [vista, setVista] = useState<VistaCalendario>('mes')
  const [citaSeleccionada, setCitaSeleccionada] = useState<Cita | null>(null)
  const [facturaModal, setFacturaModal] = useState<Factura | null>(null)
  const { toast } = useToast()

  const cargarCitas = () => {
    setCargando(true)
    citasService
      .getAll()
      .then((res) => {
        if (res.data) setCitas(res.data)
      })
      .catch((err) => {
        toast.error('Error al cargar citas', err instanceof Error ? err.message : 'Error')
      })
      .finally(() => setCargando(false))
  }

  useEffect(() => {
    cargarCitas()
  }, [])

  const handleCancelarCita = async (id: number) => {
    try {
      await citasService.cancel(id)
      toast.success('Cita cancelada', 'La cita fue cancelada exitosamente')
      setCitaSeleccionada(null)
      cargarCitas()
    } catch (err) {
      toast.error('Error al cancelar cita', err instanceof Error ? err.message : 'Error')
    }
  }

  const handleCambiarEstado = async (id: number, nuevoEstado: EstadoCita) => {
    try {
      await citasService.update(id, { estado: nuevoEstado })
      toast.success('Estado actualizado', `La cita ahora está ${nuevoEstado}`)
      setCitaSeleccionada(null)
      cargarCitas()
    } catch (err) {
      toast.error('Error al actualizar estado', err instanceof Error ? err.message : 'Error')
    }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header y Acciones */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            Agenda de Citas
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Administra tus citas en calendario mensual, semanal o vista en lista
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Selector de vistas */}
          <div className="flex items-center p-1 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
            <button
              onClick={() => setVista('mes')}
              className={[
                'flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all',
                vista === 'mes'
                  ? 'bg-primary-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100',
              ].join(' ')}
            >
              <CalendarDays className="w-3.5 h-3.5" />
              Mes
            </button>
            <button
              onClick={() => setVista('semana')}
              className={[
                'flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all',
                vista === 'semana'
                  ? 'bg-primary-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100',
              ].join(' ')}
            >
              <CalIcon className="w-3.5 h-3.5" />
              Semana
            </button>
            <button
              onClick={() => setVista('lista')}
              className={[
                'flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all',
                vista === 'lista'
                  ? 'bg-primary-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100',
              ].join(' ')}
            >
              <ListFilter className="w-3.5 h-3.5" />
              Lista
            </button>
          </div>

          <Link to="/citas/nueva">
            <Button leftIcon={<Plus className="w-4 h-4" />}>
              Nueva Cita
            </Button>
          </Link>
        </div>
      </div>

      {/* Vistas del Calendario */}
      {cargando ? (
        <Loader text="Cargando citas..." />
      ) : vista === 'mes' ? (
        <CalendarioMensual
          citas={citas}
          onSeleccionarCita={(c) => setCitaSeleccionada(c)}
        />
      ) : vista === 'semana' ? (
        <CalendarioSemanal
          citas={citas}
          onSeleccionarCita={(c) => setCitaSeleccionada(c)}
        />
      ) : (
        <VistaLista
          citas={citas}
          onSeleccionarCita={(c) => setCitaSeleccionada(c)}
          onCancelarCita={handleCancelarCita}
        />
      )}

      {/* Modal de Detalle de Cita */}
      {citaSeleccionada && (
        <Modal
          isOpen={true}
          onClose={() => setCitaSeleccionada(null)}
          title="Detalles de la Cita"
          footer={
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-2">
                {citaSeleccionada.estado !== 'confirmada' && (
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => handleCambiarEstado(citaSeleccionada.id, 'confirmada')}
                  >
                    Confirmar
                  </Button>
                )}
                {citaSeleccionada.estado !== 'completada' && (
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => handleCambiarEstado(citaSeleccionada.id, 'completada')}
                  >
                    Completar
                  </Button>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={async () => {
                    const res = await pagosService.getFacturas()
                    const fac = res.data?.find((f) => f.cita_id === citaSeleccionada.id) ?? {
                      id: Date.now(),
                      numero: `FAC-CITA-${citaSeleccionada.id}`,
                      cita_id: citaSeleccionada.id,
                      cliente_id: citaSeleccionada.cliente_id,
                      cliente: citaSeleccionada.cliente,
                      subtotal: citaSeleccionada.precio_total,
                      descuento: 0,
                      total: citaSeleccionada.precio_total,
                      metodo_pago: 'tarjeta' as const,
                      estado: (citaSeleccionada.estado === 'cancelada' ? 'reembolsada' : 'pagada') as 'pagada' | 'reembolsada',
                      items: [
                        {
                          descripcion: citaSeleccionada.servicio?.nombre ?? 'Servicio',
                          cantidad: 1,
                          precio_unitario: citaSeleccionada.precio_total,
                          total: citaSeleccionada.precio_total,
                        },
                      ],
                      created_at: citaSeleccionada.created_at,
                    }
                    setFacturaModal(fac)
                  }}
                  leftIcon={<Receipt className="w-3.5 h-3.5" />}
                >
                  Factura
                </Button>

                {citaSeleccionada.estado !== 'cancelada' && (
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => handleCancelarCita(citaSeleccionada.id)}
                  >
                    Cancelar Cita
                  </Button>
                )}
              </div>
            </div>
          }
        >
          <div className="space-y-4 text-sm">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h4 className="font-bold text-base text-slate-900 dark:text-slate-100">
                  {citaSeleccionada.servicio?.nombre}
                </h4>
                <p className="text-xs text-slate-400">
                  Duración: {citaSeleccionada.servicio?.duracion_base_min} minutos
                </p>
              </div>
              <Badge variant="primary">
                ${citaSeleccionada.precio_total}
              </Badge>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <p className="text-slate-400">Cliente:</p>
                <p className="font-semibold text-slate-800 dark:text-slate-200">
                  {citaSeleccionada.cliente?.nombre}
                </p>
                <p className="text-slate-500">{citaSeleccionada.cliente?.email}</p>
              </div>
              <div>
                <p className="text-slate-400">Profesional:</p>
                <p className="font-semibold text-slate-800 dark:text-slate-200">
                  {citaSeleccionada.empleado?.nombre}
                </p>
                <p className="text-slate-500">{citaSeleccionada.empleado?.especialidad}</p>
              </div>
              <div>
                <p className="text-slate-400">Fecha y Hora:</p>
                <p className="font-semibold text-slate-800 dark:text-slate-200">
                  {citaSeleccionada.fecha_inicio.slice(0, 10)}
                </p>
                <p className="text-slate-500">
                  {citaSeleccionada.fecha_inicio.slice(11, 16)} a {citaSeleccionada.fecha_fin.slice(11, 16)}
                </p>
              </div>
              <div>
                <p className="text-slate-400">Estado Actual:</p>
                <Badge variant="info" dot>
                  {citaSeleccionada.estado}
                </Badge>
              </div>
            </div>

            {citaSeleccionada.notas && (
              <div className="pt-2">
                <p className="text-xs text-slate-400 mb-1">Notas:</p>
                <p className="text-xs bg-slate-50 dark:bg-slate-800/70 p-3 rounded-xl italic">
                  {citaSeleccionada.notas}
                </p>
              </div>
            )}
          </div>
        </Modal>
      )}

      {/* Modal Comprobante / Factura */}
      <FacturaModal
        factura={facturaModal}
        isOpen={!!facturaModal}
        onClose={() => setFacturaModal(null)}
      />
    </div>
  )
}

