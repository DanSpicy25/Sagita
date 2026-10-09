import { useState, useEffect, useMemo } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { Plus, Calendar as CalIcon, CalendarDays, ListFilter, Clock } from 'lucide-react'
import type { Cita, VistaCalendario, EstadoCita, Factura, Empleado } from '@/types'
import { citasService } from '@/services/citas.service'
import { pagosService } from '@/services/pagos.service'
import { empleadosService } from '@/services/empleados.service'
import {
  CalendarioDiario,
  CalendarioMensual,
  CalendarioSemanal,
  VistaLista,
  MobileCitaPreviewSheet,
} from '@/components/calendario'
import { AgendaFiltrosBar, type AgendaFiltros } from '@/components/calendario/AgendaFiltrosBar'
import { FacturaModal } from '@/components/pagos/FacturaModal'
import { ModalReprogramarCita } from '@/components/reservas'
import { ModalDetalleCita } from '@/components/reservas/ModalDetalleCita'
import { Button, Loader } from '@/components/ui'
import { useToast } from '@/hooks/useToast'
import { useConfiguracion } from '@/context/ConfiguracionContext'
import { useModules } from '@/context/ModulesContext'
import { useRole } from '@/hooks/useRole'

export default function CitasPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { isWorker, currentEmpleadoId, user } = useRole()
  const { configuracion } = useConfiguracion()
  const [citas, setCitas] = useState<Cita[]>([])
  const [empleados, setEmpleados] = useState<Empleado[]>([])
  const [cargando, setCargando] = useState(true)
  const [vista, setVista] = useState<VistaCalendario>('mes')
  const [citaSeleccionada, setCitaSeleccionada] = useState<Cita | null>(null)
  const [citaPreviewMobile, setCitaPreviewMobile] = useState<Cita | null>(null)
  const [citaParaReprogramar, setCitaParaReprogramar] = useState<Cita | null>(null)
  const [facturaModal, setFacturaModal] = useState<Factura | null>(null)

  const [filtros, setFiltros] = useState<AgendaFiltros>({
    busqueda: '',
    empleadoId: 'todos',
    estado: 'todos',
  })

  const { toast } = useToast()
  const { tTerm } = useModules()
  const citaTerm = tTerm('cita', 'Cita')
  const citasTerm = tTerm('citas', 'Citas')

  const cargarDatos = () => {
    setCargando(true)
    Promise.all([
      citasService.getAll(),
      empleadosService.getAll(),
    ])
      .then(([citasRes, empRes]) => {
        if (citasRes.data) setCitas(citasRes.data)
        if (empRes.data) {
          const empList = empRes.data
          setEmpleados(empList)

          // Si el usuario es un empleado / profesional, preseleccionar su propia agenda
          if (isWorker) {
            const matchedEmp = empList.find(
              (e) =>
                (currentEmpleadoId && e.id === currentEmpleadoId) ||
                (user?.id && e.usuario_id === user.id) ||
                (user?.email && e.email?.toLowerCase() === user.email.toLowerCase())
            )
            if (matchedEmp) {
              setFiltros((prev) => {
                const urlParam = searchParams.get('empleadoId')
                if (urlParam) {
                  return { ...prev, empleadoId: urlParam === 'todos' ? 'todos' : Number(urlParam) }
                }
                return { ...prev, empleadoId: matchedEmp.id }
              })
            }
          }
        }
      })
      .catch((err) => {
        toast.error(`Error al cargar ${citasTerm.toLowerCase()}`, err instanceof Error ? err.message : 'Error')
      })
      .finally(() => setCargando(false))
  }

  useEffect(() => {
    cargarDatos()
  }, [])

  // Filtrado reactivo de citas
  const citasFiltradas = useMemo(() => {
    return citas.filter((c) => {
      // 1. Filtro por búsqueda de texto
      if (filtros.busqueda.trim()) {
        const q = filtros.busqueda.toLowerCase().trim()
        const idFormatted = `#cit-${String(c.id).padStart(4, '0')}`.toLowerCase()
        const matchCliente = (c.cliente?.nombre ?? '').toLowerCase().includes(q)
        const matchServicio = (c.servicio?.nombre ?? '').toLowerCase().includes(q)
        const matchEmpleado = (c.empleado?.nombre ?? '').toLowerCase().includes(q)
        const matchId = String(c.id) === q || idFormatted.includes(q)
        if (!matchCliente && !matchServicio && !matchEmpleado && !matchId) {
          return false
        }
      }

      // 2. Filtro por empleado
      if (filtros.empleadoId !== 'todos' && c.empleado_id !== filtros.empleadoId) {
        return false
      }

      // 3. Filtro por estado
      if (filtros.estado !== 'todos' && c.estado !== filtros.estado) {
        return false
      }

      return true
    })
  }, [citas, filtros])

  const handleCancelarCita = async (id: number) => {
    try {
      await citasService.cancel(id)
      toast.success(`${citaTerm} cancelada`, `La ${citaTerm.toLowerCase()} fue cancelada exitosamente`)
      setCitaSeleccionada(null)
      setCitaPreviewMobile(null)
      cargarDatos()
    } catch (err) {
      toast.error(`Error al cancelar ${citaTerm.toLowerCase()}`, err instanceof Error ? err.message : 'Error')
    }
  }

  const handleCambiarEstado = async (id: number, nuevoEstado: EstadoCita) => {
    try {
      await citasService.update(id, { estado: nuevoEstado })
      toast.success('Estado actualizado', `La ${citaTerm.toLowerCase()} ahora está ${nuevoEstado}`)
      setCitaSeleccionada(null)
      setCitaPreviewMobile(null)
      cargarDatos()
    } catch (err) {
      toast.error('Error al actualizar estado', err instanceof Error ? err.message : 'Error')
    }
  }

  const handleVerFactura = async (c: Cita) => {
    try {
      const res = await pagosService.getFacturas()
      const fac = res.data?.find((f) => f.cita_id === c.id) ?? {
        id: Date.now(),
        numero: `FAC-CITA-${c.id}`,
        cita_id: c.id,
        cliente_id: c.cliente_id,
        cliente: c.cliente,
        subtotal: c.precio_total,
        descuento: 0,
        total: c.precio_total,
        metodo_pago: 'tarjeta' as const,
        estado: (c.estado === 'cancelada' ? 'reembolsada' : 'pagada') as 'pagada' | 'reembolsada',
        items: [
          {
            descripcion: c.servicio?.nombre ?? 'Servicio',
            cantidad: 1,
            precio_unitario: c.precio_total,
            total: c.precio_total,
          },
        ],
        created_at: c.created_at,
      }
      setFacturaModal(fac)
    } catch {
      toast.error('Error al obtener factura')
    }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header y Acciones */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            Agenda de {citasTerm}
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Administra tus {citasTerm.toLowerCase()} en vista diaria, semanal, mensual o en lista
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Selector de 4 vistas */}
          <div className="flex items-center p-1 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xs">
            <button
              onClick={() => setVista('dia')}
              className={[
                'flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer',
                vista === 'dia'
                  ? 'bg-primary-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100',
              ].join(' ')}
              aria-label="Vista diaria"
            >
              <Clock className="w-3.5 h-3.5" />
              Día
            </button>
            <button
              onClick={() => setVista('semana')}
              className={[
                'flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer',
                vista === 'semana'
                  ? 'bg-primary-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100',
              ].join(' ')}
              aria-label="Vista semanal"
            >
              <CalIcon className="w-3.5 h-3.5" />
              Semana
            </button>
            <button
              onClick={() => setVista('mes')}
              className={[
                'flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer',
                vista === 'mes'
                  ? 'bg-primary-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100',
              ].join(' ')}
              aria-label="Vista mensual"
            >
              <CalendarDays className="w-3.5 h-3.5" />
              Mes
            </button>
            <button
              onClick={() => setVista('lista')}
              className={[
                'flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer',
                vista === 'lista'
                  ? 'bg-primary-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100',
              ].join(' ')}
              aria-label="Vista en lista"
            >
              <ListFilter className="w-3.5 h-3.5" />
              Lista
            </button>
          </div>

          <Link to="/citas/nueva">
            <Button leftIcon={<Plus className="w-4 h-4" />}>
              Nueva {citaTerm}
            </Button>
          </Link>
        </div>
      </div>

      {/* Banner de Contexto Operativo para Trabajadores */}
      {isWorker && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-4 py-2.5 rounded-xl bg-surface-elevated border border-primary/20 text-xs shadow-2xs">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse shrink-0" />
            <span className="text-text font-medium">
              {filtros.empleadoId !== 'todos'
                ? 'Vista activa: Tu agenda de trabajo personal.'
                : 'Vista activa: Agendas de toda la sede.'}
            </span>
          </div>
          <button
            type="button"
            onClick={() => {
              if (filtros.empleadoId !== 'todos') {
                setFiltros((f) => ({ ...f, empleadoId: 'todos' }))
              } else {
                const matchedEmp = empleados.find(
                  (e) =>
                    (currentEmpleadoId && e.id === currentEmpleadoId) ||
                    (user?.id && e.usuario_id === user.id) ||
                    (user?.email && e.email?.toLowerCase() === user.email.toLowerCase())
                )
                if (matchedEmp) {
                  setFiltros((f) => ({ ...f, empleadoId: matchedEmp.id }))
                }
              }
            }}
            className="font-semibold text-primary hover:underline cursor-pointer self-start sm:self-auto text-left"
          >
            {filtros.empleadoId !== 'todos' ? 'Ver toda la sede' : 'Ver solo mi agenda'}
          </button>
        </div>
      )}

      {/* Barra de Filtros Unificada de la Agenda */}
      <AgendaFiltrosBar
        filtros={filtros}
        onFiltrosChange={setFiltros}
        empleados={empleados}
        totalCitas={citas.length}
        citasFiltradas={citasFiltradas.length}
        citasTerm={citasTerm}
      />

      {/* Vistas del Calendario */}
      {cargando ? (
        <Loader text={`Cargando ${citasTerm.toLowerCase()}...`} />
      ) : vista === 'dia' ? (
        <CalendarioDiario
          citas={citasFiltradas}
          empleados={empleados}
          onSeleccionarCita={(c) => setCitaSeleccionada(c)}
          onLongPressCita={(c) => setCitaPreviewMobile(c)}
          onCrearCitaEnFecha={(fecha, hora) => {
            navigate(hora ? `/citas/nueva?fecha=${fecha}&hora=${hora}` : `/citas/nueva?fecha=${fecha}`)
          }}
        />
      ) : vista === 'semana' ? (
        <CalendarioSemanal
          citas={citasFiltradas}
          onSeleccionarCita={(c) => setCitaSeleccionada(c)}
          onLongPressCita={(c) => setCitaPreviewMobile(c)}
          onCrearCitaEnFecha={(fecha, hora) => {
            navigate(hora ? `/citas/nueva?fecha=${fecha}&hora=${hora}` : `/citas/nueva?fecha=${fecha}`)
          }}
        />
      ) : vista === 'mes' ? (
        <CalendarioMensual
          citas={citasFiltradas}
          onSeleccionarCita={(c) => setCitaSeleccionada(c)}
          onLongPressCita={(c) => setCitaPreviewMobile(c)}
          onCrearCitaEnFecha={(fecha) => {
            navigate(`/citas/nueva?fecha=${fecha}`)
          }}
        />
      ) : (
        <VistaLista
          citas={citasFiltradas}
          onSeleccionarCita={(c) => setCitaSeleccionada(c)}
          onLongPressCita={(c) => setCitaPreviewMobile(c)}
          onCancelarCita={handleCancelarCita}
        />
      )}

      {/* Modal Desacoplado de Detalle de Cita */}
      <ModalDetalleCita
        cita={citaSeleccionada}
        isOpen={!!citaSeleccionada}
        onClose={() => setCitaSeleccionada(null)}
        onCambiarEstado={handleCambiarEstado}
        onCancelarCita={handleCancelarCita}
        onReprogramar={(c: Cita) => {
          setCitaParaReprogramar(c)
          setCitaSeleccionada(null)
        }}
        onVerFactura={handleVerFactura}
        configuracion={configuracion}
        citaTerm={citaTerm}
      />

      {/* Mobile Bottom Sheet de Vista Previa Táctil */}
      <MobileCitaPreviewSheet
        cita={citaPreviewMobile}
        isOpen={!!citaPreviewMobile}
        onClose={() => setCitaPreviewMobile(null)}
        onDetalles={(c: Cita) => {
          setCitaPreviewMobile(null)
          setCitaSeleccionada(c)
        }}
        onReprogramar={(c: Cita) => {
          setCitaPreviewMobile(null)
          setCitaParaReprogramar(c)
        }}
        onCobrar={(c: Cita) => {
          setCitaPreviewMobile(null)
          handleVerFactura(c)
        }}
        onCambiarEstado={(id: number, nuevoEstado: EstadoCita) => {
          setCitaPreviewMobile(null)
          handleCambiarEstado(id, nuevoEstado)
        }}
        onCancelar={(id: number) => {
          setCitaPreviewMobile(null)
          handleCancelarCita(id)
        }}
      />

      {/* Modal Comprobante / Factura */}
      <FacturaModal
        factura={facturaModal}
        isOpen={!!facturaModal}
        onClose={() => setFacturaModal(null)}
      />

      {/* Modal Reprogramación Asistida */}
      <ModalReprogramarCita
        cita={citaParaReprogramar}
        isOpen={!!citaParaReprogramar}
        onClose={() => setCitaParaReprogramar(null)}
        onCitaReprogramada={() => {
          setCitaParaReprogramar(null)
          cargarDatos()
          toast.success('Cita reprogramada', 'La cita fue reprogramada correctamente')
        }}
      />
    </div>
  )
}
