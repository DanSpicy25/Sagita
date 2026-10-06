import { useState, useEffect, useMemo } from 'react'
import {
  Users,
  TrendingUp,
  AlertTriangle,
  HeartHandshake,
  Search,
  MessageCircle,
  Eye,
  Flame,
  Award,
  CalendarCheck,
  RefreshCw,
} from 'lucide-react'
import { Cliente } from '@/types'
import { clientesService } from '@/services/clientes.service'
import { Button, Badge, Loader, EmptyState, Card } from '@/components/ui'
import { FichaCliente360 } from '@/components/clientes'
import { useToast } from '@/hooks/useToast'
import { useModules } from '@/context/ModulesContext'

type TabCrm = 'pipeline' | 'reactivacion' | 'segmentos'

interface PipelineStage {
  id: string
  title: string
  color: string
  bg: string
  border: string
  description: string
}

const STAGES: PipelineStage[] = [
  {
    id: 'prospecto',
    title: 'Prospecto / Nuevo',
    color: 'text-blue-500',
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/20',
    description: 'Registrados recientemente sin historial',
  },
  {
    id: 'primera_cita',
    title: 'Primera Visita',
    color: 'text-amber-500',
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/20',
    description: '1 cita completada, en evaluación',
  },
  {
    id: 'recurrente',
    title: 'Cliente Frecuente',
    color: 'text-emerald-500',
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/20',
    description: 'Más de 2 citas completadas',
  },
  {
    id: 'en_riesgo',
    title: 'En Riesgo de Pérdida',
    color: 'text-rose-500',
    bg: 'bg-rose-500/10',
    border: 'border-rose-500/20',
    description: 'Más de 45 días sin agendar',
  },
  {
    id: 'vip',
    title: 'Fidelizado / VIP',
    color: 'text-purple-500',
    bg: 'bg-purple-500/10',
    border: 'border-purple-500/20',
    description: 'Alto valor y recurrencia mensual',
  },
]

export default function CrmPage() {
  const [tabActivo, setTabActivo] = useState<TabCrm>('pipeline')
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [cargando, setCargando] = useState(true)
  const [busqueda, setBusqueda] = useState('')
  const [clienteSeleccionado, setClienteSeleccionado] = useState<Cliente | null>(null)
  const [modalExpedienteAbierto, setModalExpedienteAbierto] = useState(false)

  const { toast } = useToast()
  const { tTerm } = useModules()
  const clienteTerm = tTerm('cliente', 'Cliente')
  const clientesTerm = tTerm('clientes', 'Clientes')

  const cargarClientes = async () => {
    setCargando(true)
    try {
      const res = await clientesService.getAll()
      if (res.success && res.data) {
        setClientes(res.data)
      } else {
        toast.error('Error', 'No se pudieron cargar los contactos del CRM')
      }
    } catch {
      toast.error('Error', 'Error al consultar el servicio de CRM')
    } finally {
      setCargando(false)
    }
  }

  useEffect(() => {
    cargarClientes()
  }, [])

  // Clasificador de Clientes por etapa del Pipeline
  const clasificarCliente = (c: Cliente): string => {
    const totalCitas = c.total_citas || 0
    const tags = c.etiquetas || []
    if (tags.includes('VIP') || tags.includes('vip') || (c.total_gastado && c.total_gastado > 300)) {
      return 'vip'
    }
    if (tags.includes('En Riesgo') || tags.includes('inactivo')) {
      return 'en_riesgo'
    }
    if (totalCitas >= 2) return 'recurrente'
    if (totalCitas === 1) return 'primera_cita'
    return 'prospecto'
  }

  // Filtrado general por búsqueda
  const clientesFiltrados = useMemo(() => {
    if (!busqueda.trim()) return clientes
    const q = busqueda.toLowerCase()
    return clientes.filter(
      (c) =>
        c.nombre.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        (c.telefono && c.telefono.includes(q))
    )
  }, [clientes, busqueda])

  // Agrupamiento para Kanban
  const columnasKanban = useMemo(() => {
    const mapa: Record<string, Cliente[]> = {
      prospecto: [],
      primera_cita: [],
      recurrente: [],
      en_riesgo: [],
      vip: [],
    }

    clientesFiltrados.forEach((c) => {
      const etapa = clasificarCliente(c)
      if (mapa[etapa]) {
        mapa[etapa].push(c)
      } else {
        mapa.prospecto.push(c)
      }
    })

    return mapa
  }, [clientesFiltrados])

  // Clientes para reactivación (>30 días de inactividad o en riesgo)
  const clientesReactivacion = useMemo(() => {
    return clientesFiltrados.filter((c) => {
      const etapa = clasificarCliente(c)
      return etapa === 'en_riesgo'
    })
  }, [clientesFiltrados])

  // Métricas de CRM
  const metricas = useMemo(() => {
    const total = clientes.length
    const vips = clientes.filter((c) => clasificarCliente(c) === 'vip').length
    const enRiesgo = clientes.filter((c) => clasificarCliente(c) === 'en_riesgo').length
    const activos = clientes.filter((c) => ['recurrente', 'vip'].includes(clasificarCliente(c))).length
    const retencion = total > 0 ? Math.round((activos / total) * 100) : 0

    return { total, vips, enRiesgo, retencion }
  }, [clientes])

  const abrirExpediente = (cliente: Cliente) => {
    setClienteSeleccionado(cliente)
    setModalExpedienteAbierto(true)
  }

  const enviarWhatsAppReactivacion = (cliente: Cliente) => {
    if (!cliente.telefono) {
      toast.warning('Aviso', 'El contacto no tiene número de teléfono registrado')
      return
    }
    const cleanPhone = cliente.telefono.replace(/\D/g, '')
    const mensaje = encodeURIComponent(
      `¡Hola ${cliente.nombre}! Te extrañamos en nuestro establecimiento. Tenemos una cortesía especial para tu próxima visita. ¿Te gustaría agendar esta semana?`
    )
    window.open(`https://wa.me/${cleanPhone}?text=${mensaje}`, '_blank')
  }

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-text">CRM & Relación con {clientesTerm}</h1>
            <Badge variant="primary">Comercial</Badge>
          </div>
          <p className="text-sm text-text-secondary mt-1">
            Gestión de embudo de retención, pipeline de conversión y reactivación de contactos.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={cargarClientes}
            leftIcon={<RefreshCw className={`w-4 h-4 ${cargando ? 'animate-spin' : ''}`} />}
          >
            Actualizar
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 flex items-center justify-between border-border bg-surface">
          <div>
            <p className="text-xs text-text-secondary font-medium">Contactos Totales</p>
            <p className="text-2xl font-bold text-text mt-1">{metricas.total}</p>
          </div>
          <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
            <Users className="w-5 h-5" />
          </div>
        </Card>

        <Card className="p-4 flex items-center justify-between border-border bg-surface">
          <div>
            <p className="text-xs text-text-secondary font-medium">Tasa de Retención</p>
            <p className="text-2xl font-bold text-emerald-500 mt-1">{metricas.retencion}%</p>
          </div>
          <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-500">
            <TrendingUp className="w-5 h-5" />
          </div>
        </Card>

        <Card className="p-4 flex items-center justify-between border-border bg-surface">
          <div>
            <p className="text-xs text-text-secondary font-medium">{clientesTerm} VIP</p>
            <p className="text-2xl font-bold text-purple-500 mt-1">{metricas.vips}</p>
          </div>
          <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-500">
            <Award className="w-5 h-5" />
          </div>
        </Card>

        <Card className="p-4 flex items-center justify-between border-border bg-surface">
          <div>
            <p className="text-xs text-text-secondary font-medium">En Riesgo de Pérdida</p>
            <p className="text-2xl font-bold text-rose-500 mt-1">{metricas.enRiesgo}</p>
          </div>
          <div className="p-2.5 rounded-xl bg-rose-500/10 text-rose-500">
            <AlertTriangle className="w-5 h-5" />
          </div>
        </Card>
      </div>

      {/* Navegación de Pestañas & Buscador */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border pb-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setTabActivo('pipeline')}
            className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
              tabActivo === 'pipeline'
                ? 'bg-primary text-white shadow-sm'
                : 'text-text-secondary hover:text-text hover:bg-surface'
            }`}
          >
            Embudo Pipeline
          </button>
          <button
            onClick={() => setTabActivo('reactivacion')}
            className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors flex items-center gap-1.5 ${
              tabActivo === 'reactivacion'
                ? 'bg-primary text-white shadow-sm'
                : 'text-text-secondary hover:text-text hover:bg-surface'
            }`}
          >
            <Flame className="w-4 h-4 text-amber-500" />
            Reactivación ({clientesReactivacion.length})
          </button>
          <button
            onClick={() => setTabActivo('segmentos')}
            className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
              tabActivo === 'segmentos'
                ? 'bg-primary text-white shadow-sm'
                : 'text-text-secondary hover:text-text hover:bg-surface'
            }`}
          >
            Segmentación RFM
          </button>
        </div>

        <div className="relative min-w-[260px]">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" />
          <input
            type="text"
            placeholder={`Buscar en ${clientesTerm.toLowerCase()}...`}
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="w-full text-sm pl-9 pr-3 py-1.5 rounded-lg border border-border bg-surface text-text placeholder:text-text-secondary/60 focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
      </div>

      {/* Contenido según Tab */}
      {cargando ? (
        <Loader text={`Cargando embudo de ${clientesTerm.toLowerCase()}...`} />
      ) : (
        <>
          {/* TAB 1: KANBAN PIPELINE */}
          {tabActivo === 'pipeline' && (
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 overflow-x-auto pb-4">
              {STAGES.map((stage) => {
                const items = columnasKanban[stage.id] || []
                return (
                  <div
                    key={stage.id}
                    className="flex flex-col rounded-xl border border-border bg-surface/50 min-w-[260px] p-3 space-y-3"
                  >
                    <div className="flex items-center justify-between pb-2 border-b border-border">
                      <div className="flex items-center gap-2">
                        <span className={`w-2.5 h-2.5 rounded-full ${stage.bg} border ${stage.border}`} />
                        <span className="text-xs font-bold text-text">{stage.title}</span>
                      </div>
                      <Badge variant="default" size="sm">
                        {items.length}
                      </Badge>
                    </div>

                    <p className="text-[11px] text-text-secondary">{stage.description}</p>

                    <div className="space-y-2.5 flex-1 max-h-[600px] overflow-y-auto pr-1">
                      {items.length === 0 ? (
                        <div className="p-4 text-center text-xs text-text-secondary/60 border border-dashed border-border rounded-lg">
                          Sin contactos en esta etapa
                        </div>
                      ) : (
                        items.map((c) => (
                          <div
                            key={c.id}
                            onClick={() => abrirExpediente(c)}
                            className="p-3 rounded-lg border border-border bg-surface hover:border-primary/50 transition-all cursor-pointer shadow-xs space-y-2 group"
                          >
                            <div className="flex items-start justify-between">
                              <p className="text-sm font-semibold text-text group-hover:text-primary transition-colors">
                                {c.nombre}
                              </p>
                              <Eye className="w-3.5 h-3.5 text-text-secondary opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>

                            {c.email && (
                              <p className="text-xs text-text-secondary truncate">{c.email}</p>
                            )}

                            <div className="flex items-center justify-between pt-1 border-t border-border/50 text-[11px] text-text-secondary">
                              <span>{c.total_citas ?? 0} citas</span>
                              {c.total_gastado !== undefined && (
                                <span className="font-medium text-text">
                                  ${c.total_gastado.toFixed(2)}
                                </span>
                              )}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {/* TAB 2: REACTIVACIÓN DE INACTIVOS */}
          {tabActivo === 'reactivacion' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl border border-amber-500/20 bg-amber-500/10 flex items-start gap-3">
                <Flame className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-sm font-semibold text-text">Campaña Rápida de Recuperación</h3>
                  <p className="text-xs text-text-secondary mt-0.5">
                    Estos contactos llevan semanas sin agendar o muestran señales de deserción.
                    Lánzales un recordatorio o promoción con un solo clic.
                  </p>
                </div>
              </div>

              {clientesReactivacion.length === 0 ? (
                <EmptyState
                  title="No hay clientes en riesgo"
                  description="¡Excelente! Toda tu cartera de clientes se mantiene activa y recurrente."
                />
              ) : (
                <div className="border border-border rounded-xl bg-surface overflow-hidden">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-surface/80 border-b border-border text-xs uppercase text-text-secondary font-semibold">
                      <tr>
                        <th className="px-4 py-3">{clienteTerm}</th>
                        <th className="px-4 py-3">Contacto</th>
                        <th className="px-4 py-3">Historial</th>
                        <th className="px-4 py-3">Estado</th>
                        <th className="px-4 py-3 text-right">Acción Rápida</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {clientesReactivacion.map((c) => (
                        <tr key={c.id} className="hover:bg-surface-secondary/40 transition-colors">
                          <td className="px-4 py-3">
                            <p className="font-medium text-text">{c.nombre}</p>
                            <span className="text-xs text-text-secondary">{c.documento_identidad || 'Sin doc'}</span>
                          </td>
                          <td className="px-4 py-3">
                            <p className="text-xs text-text">{c.email}</p>
                            <p className="text-xs text-text-secondary">{c.telefono || 'Sin teléfono'}</p>
                          </td>
                          <td className="px-4 py-3 text-xs">
                            <p className="font-medium text-text">{c.total_citas || 0} visitas</p>
                            <p className="text-text-secondary">Gasto: ${c.total_gastado?.toFixed(2) || '0.00'}</p>
                          </td>
                          <td className="px-4 py-3">
                            <Badge variant="danger" size="sm">
                              En Riesgo
                            </Badge>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {c.telefono && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => enviarWhatsAppReactivacion(c)}
                                  className="text-emerald-500 border-emerald-500/30 hover:bg-emerald-500/10"
                                  title="Enviar WhatsApp de cortesía"
                                >
                                  <MessageCircle className="w-3.5 h-3.5" />
                                </Button>
                              )}
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => abrirExpediente(c)}
                                title="Ver Ficha 360"
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: SEGMENTACIÓN RFM */}
          {tabActivo === 'segmentos' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <Card className="p-4 border-border bg-surface space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-text flex items-center gap-2">
                    <Award className="w-4 h-4 text-purple-500" />
                    Segmento VIP (Champions)
                  </h3>
                  <Badge variant="primary" size="sm">
                    {columnasKanban.vip.length}
                  </Badge>
                </div>
                <p className="text-xs text-text-secondary">
                  Clientes de mayor volumen de compra y lealtad. Candidatos idóneos para programas de recompensas premium.
                </p>
                <div className="pt-2 border-t border-border space-y-2 max-h-48 overflow-y-auto">
                  {columnasKanban.vip.map((c) => (
                    <div
                      key={c.id}
                      onClick={() => abrirExpediente(c)}
                      className="text-xs p-2 rounded-lg bg-surface-secondary/40 hover:bg-surface-secondary flex items-center justify-between cursor-pointer"
                    >
                      <span className="font-medium text-text">{c.nombre}</span>
                      <span className="text-text-secondary">${c.total_gastado?.toFixed(2) || '0'}</span>
                    </div>
                  ))}
                </div>
              </Card>

              <Card className="p-4 border-border bg-surface space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-text flex items-center gap-2">
                    <CalendarCheck className="w-4 h-4 text-emerald-500" />
                    Clientes Recurrentes (Frecuentes)
                  </h3>
                  <Badge variant="success" size="sm">
                    {columnasKanban.recurrente.length}
                  </Badge>
                </div>
                <p className="text-xs text-text-secondary">
                  Visitan el negocio con regularidad constante. Clientes base para fidelización mediante cupones y puntos.
                </p>
                <div className="pt-2 border-t border-border space-y-2 max-h-48 overflow-y-auto">
                  {columnasKanban.recurrente.map((c) => (
                    <div
                      key={c.id}
                      onClick={() => abrirExpediente(c)}
                      className="text-xs p-2 rounded-lg bg-surface-secondary/40 hover:bg-surface-secondary flex items-center justify-between cursor-pointer"
                    >
                      <span className="font-medium text-text">{c.nombre}</span>
                      <span className="text-text-secondary">{c.total_citas} citas</span>
                    </div>
                  ))}
                </div>
              </Card>

              <Card className="p-4 border-border bg-surface space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-text flex items-center gap-2">
                    <HeartHandshake className="w-4 h-4 text-blue-500" />
                    Nuevos / Primera Visita
                  </h3>
                  <Badge variant="default" size="sm">
                    {columnasKanban.prospecto.length + columnasKanban.primera_cita.length}
                  </Badge>
                </div>
                <p className="text-xs text-text-secondary">
                  En proceso de onboarding. Requieren seguimiento posterior al servicio para garantizar una segunda reserva.
                </p>
                <div className="pt-2 border-t border-border space-y-2 max-h-48 overflow-y-auto">
                  {[...columnasKanban.prospecto, ...columnasKanban.primera_cita].map((c) => (
                    <div
                      key={c.id}
                      onClick={() => abrirExpediente(c)}
                      className="text-xs p-2 rounded-lg bg-surface-secondary/40 hover:bg-surface-secondary flex items-center justify-between cursor-pointer"
                    >
                      <span className="font-medium text-text">{c.nombre}</span>
                      <span className="text-text-secondary">{c.email}</span>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          )}
        </>
      )}

      {/* Expediente 360° Modal */}
      {modalExpedienteAbierto && clienteSeleccionado && (
        <FichaCliente360
          cliente={clienteSeleccionado}
          isOpen={modalExpedienteAbierto}
          onClose={() => {
            setModalExpedienteAbierto(false)
            setClienteSeleccionado(null)
          }}
          onClienteActualizado={() => {
            cargarClientes()
          }}
        />
      )}
    </div>
  )
}
