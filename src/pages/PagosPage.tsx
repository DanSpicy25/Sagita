import { useState, useEffect } from 'react'
import {
  Receipt,
  Tag,
  RotateCcw,
  Package,
  Plus,
  DollarSign,
  Trash2,
  Bell,
  Eye,
} from 'lucide-react'
import {
  Factura,
  Cupon,
  Reembolso,
  PaqueteServicio,
  ItemListaEspera,
} from '@/types'
import { pagosService } from '@/services/pagos.service'
import { Button, Badge, Loader, Modal, Input, Select, Textarea, EmptyState } from '@/components/ui'
import { FacturaModal } from '@/components/pagos/FacturaModal'
import { useToast } from '@/hooks/useToast'

type TabFinanzas = 'facturas' | 'cupones' | 'reembolsos' | 'paquetes' | 'espera'

export default function PagosPage() {
  const [tabActivo, setTabActivo] = useState<TabFinanzas>('facturas')
  const [facturas, setFacturas] = useState<Factura[]>([])
  const [cupones, setCupones] = useState<Cupon[]>([])
  const [reembolsos, setReembolsos] = useState<Reembolso[]>([])
  const [paquetes, setPaquetes] = useState<PaqueteServicio[]>([])
  const [listaEspera, setListaEspera] = useState<ItemListaEspera[]>([])
  const [cargando, setCargando] = useState(true)

  // Modales
  const [facturaSeleccionada, setFacturaSeleccionada] = useState<Factura | null>(null)
  const [modalCuponAbierto, setModalCuponAbierto] = useState(false)
  const [modalReembolsoAbierto, setModalReembolsoAbierto] = useState(false)
  const [facturaParaReembolso, setFacturaParaReembolso] = useState<Factura | null>(null)
  const [motivoReembolso, setMotivoReembolso] = useState('')

  // Form nuevo cupón
  const [nuevoCupon, setNuevoCupon] = useState({
    codigo: '',
    tipo: 'porcentual' as 'porcentual' | 'fijo',
    valor: 15,
    usos_max: 50,
  })

  const { toast } = useToast()

  const cargarDatos = () => {
    setCargando(true)
    Promise.all([
      pagosService.getFacturas(),
      pagosService.getCupones(),
      pagosService.getReembolsos(),
      pagosService.getPaquetes(),
      pagosService.getListaEspera(),
    ])
      .then(([facRes, cupRes, reemRes, paqRes, espRes]) => {
        if (facRes.data) setFacturas(facRes.data)
        if (cupRes.data) setCupones(cupRes.data)
        if (reemRes.data) setReembolsos(reemRes.data)
        if (paqRes.data) setPaquetes(paqRes.data)
        if (espRes.data) setListaEspera(espRes.data)
      })
      .catch((err) => {
        toast.error('Error al cargar datos financieros', err instanceof Error ? err.message : 'Error')
      })
      .finally(() => setCargando(false))
  }

  useEffect(() => {
    cargarDatos()
  }, [])

  // Métricas financieras calculadas
  const ingresosTotales = facturas
    .filter((f) => f.estado === 'pagada')
    .reduce((acc, f) => acc + f.total, 0)
  const totalReembolsado = reembolsos.reduce((acc, r) => acc + r.monto, 0)

  // Crear cupón
  const handleCrearCupon = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!nuevoCupon.codigo.trim()) return

    try {
      await pagosService.crearCupon({
        codigo: nuevoCupon.codigo.toUpperCase(),
        tipo: nuevoCupon.tipo,
        valor: Number(nuevoCupon.valor),
        usos_max: Number(nuevoCupon.usos_max),
        usos_actuales: 0,
        activo: true,
      })
      toast.success('Cupón creado', `Código ${nuevoCupon.codigo.toUpperCase()} habilitado`)
      setModalCuponAbierto(false)
      setNuevoCupon({ codigo: '', tipo: 'porcentual', valor: 15, usos_max: 50 })
      cargarDatos()
    } catch {
      toast.error('Error', 'No se pudo crear el cupón')
    }
  }

  // Eliminar cupón
  const handleEliminarCupon = async (id: number) => {
    if (!confirm('¿Deseas retirar este código de descuento?')) return
    try {
      await pagosService.eliminarCupon(id)
      toast.success('Cupón retirado', 'El cupón ya no podrá ser aplicado')
      cargarDatos()
    } catch {
      toast.error('Error al eliminar cupón', 'Error en el servidor')
    }
  }

  // Procesar reembolso
  const handleProcesarReembolso = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!facturaParaReembolso || !motivoReembolso.trim()) return

    try {
      await pagosService.solicitarReembolso({
        factura_id: facturaParaReembolso.id,
        monto: facturaParaReembolso.total,
        motivo: motivoReembolso,
      })
      toast.success(
        'Reembolso completado',
        `Se devolvieron $${facturaParaReembolso.total} a ${facturaParaReembolso.cliente?.nombre}`
      )
      setModalReembolsoAbierto(false)
      setFacturaParaReembolso(null)
      setMotivoReembolso('')
      cargarDatos()
    } catch {
      toast.error('Error', 'No se pudo procesar el reembolso')
    }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            Finanzas y Pagos
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Facturación automática, gestión de cupones, reembolsos y paquetes de servicios
          </p>
        </div>

        {tabActivo === 'cupones' && (
          <Button
            onClick={() => setModalCuponAbierto(true)}
            leftIcon={<Plus className="w-4 h-4" />}
          >
            Nuevo Cupón
          </Button>
        )}
      </div>

      {/* KPI Cards Financieros */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card p-5 border border-slate-100 dark:border-slate-800">
          <div className="flex items-start justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 flex items-center justify-center">
              <DollarSign className="w-5 h-5" />
            </div>
            <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30 px-2 py-0.5 rounded-full">
              Cobrado
            </span>
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            ${ingresosTotales}
          </p>
          <p className="text-xs text-slate-400 mt-1">Ingresos netos por reservas</p>
        </div>

        <div className="card p-5 border border-slate-100 dark:border-slate-800">
          <div className="flex items-start justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-primary-50 dark:bg-primary-950/40 text-primary-600 flex items-center justify-center">
              <Receipt className="w-5 h-5" />
            </div>
            <span className="text-xs font-semibold text-primary-600 bg-primary-50 dark:bg-primary-950/30 px-2 py-0.5 rounded-full">
              {facturas.length} docs
            </span>
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            {facturas.filter((f) => f.estado === 'pagada').length}
          </p>
          <p className="text-xs text-slate-400 mt-1">Facturas emitidas y pagadas</p>
        </div>

        <div className="card p-5 border border-slate-100 dark:border-slate-800">
          <div className="flex items-start justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 flex items-center justify-center">
              <RotateCcw className="w-5 h-5" />
            </div>
            <span className="text-xs font-semibold text-amber-600 bg-amber-50 dark:bg-amber-950/30 px-2 py-0.5 rounded-full">
              {reembolsos.length} casos
            </span>
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            ${totalReembolsado}
          </p>
          <p className="text-xs text-slate-400 mt-1">Total devuelto por cancelaciones</p>
        </div>

        <div className="card p-5 border border-slate-100 dark:border-slate-800">
          <div className="flex items-start justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-600 flex items-center justify-center">
              <Tag className="w-5 h-5" />
            </div>
            <span className="text-xs font-semibold text-purple-600 bg-purple-50 dark:bg-purple-950/30 px-2 py-0.5 rounded-full">
              Activos
            </span>
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            {cupones.filter((c) => c.activo).length}
          </p>
          <p className="text-xs text-slate-400 mt-1">Códigos de descuento vigentes</p>
        </div>
      </div>

      {/* Tabs de Navegación */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2 overflow-x-auto">
        <button
          onClick={() => setTabActivo('facturas')}
          className={[
            'px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-2',
            tabActivo === 'facturas'
              ? 'bg-primary-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800',
          ].join(' ')}
        >
          <Receipt className="w-4 h-4" />
          Facturas ({facturas.length})
        </button>

        <button
          onClick={() => setTabActivo('cupones')}
          className={[
            'px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-2',
            tabActivo === 'cupones'
              ? 'bg-primary-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800',
          ].join(' ')}
        >
          <Tag className="w-4 h-4" />
          Cupones de Descuento ({cupones.length})
        </button>

        <button
          onClick={() => setTabActivo('reembolsos')}
          className={[
            'px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-2',
            tabActivo === 'reembolsos'
              ? 'bg-primary-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800',
          ].join(' ')}
        >
          <RotateCcw className="w-4 h-4" />
          Reembolsos ({reembolsos.length})
        </button>

        <button
          onClick={() => setTabActivo('paquetes')}
          className={[
            'px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-2',
            tabActivo === 'paquetes'
              ? 'bg-primary-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800',
          ].join(' ')}
        >
          <Package className="w-4 h-4" />
          Paquetes / Bundles ({paquetes.length})
        </button>

        <button
          onClick={() => setTabActivo('espera')}
          className={[
            'px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-2',
            tabActivo === 'espera'
              ? 'bg-primary-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800',
          ].join(' ')}
        >
          <Bell className="w-4 h-4" />
          Lista de Espera ({listaEspera.length})
        </button>
      </div>

      {/* Contenido del Tab */}
      {cargando ? (
        <Loader text="Cargando registros financieros..." />
      ) : (
        <div>
          {/* TAB 1: FACTURAS */}
          {tabActivo === 'facturas' && (
            <div className="card shadow-card overflow-hidden">
              <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200">
                  Historial de Comprobantes y Facturas
                </h3>
              </div>

              {facturas.length === 0 ? (
                <EmptyState title="No hay facturas registradas" />
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 dark:bg-slate-800/40 text-slate-400 uppercase font-semibold border-b border-slate-100 dark:border-slate-800">
                      <tr>
                        <th className="py-3 px-4">Número</th>
                        <th className="py-3 px-4">Cliente</th>
                        <th className="py-3 px-4">Fecha Emisión</th>
                        <th className="py-3 px-4">Método</th>
                        <th className="py-3 px-4">Estado</th>
                        <th className="py-3 px-4 text-right">Total</th>
                        <th className="py-3 px-4 text-center">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                      {facturas.map((f) => (
                        <tr key={f.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                          <td className="py-3 px-4 font-bold text-primary-600">
                            {f.numero}
                          </td>
                          <td className="py-3 px-4 font-medium">
                            {f.cliente?.nombre ?? 'Cliente'}
                          </td>
                          <td className="py-3 px-4 text-slate-400">
                            {new Date(f.created_at).toLocaleDateString('es-ES', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                            })}
                          </td>
                          <td className="py-3 px-4 capitalize">{f.metodo_pago}</td>
                          <td className="py-3 px-4">
                            <Badge
                              variant={
                                f.estado === 'pagada'
                                  ? 'success'
                                  : f.estado === 'reembolsada'
                                  ? 'danger'
                                  : 'warning'
                              }
                              size="sm"
                              dot
                            >
                              {f.estado}
                            </Badge>
                          </td>
                          <td className="py-3 px-4 text-right font-bold text-slate-900 dark:text-slate-100">
                            ${f.total}
                          </td>
                          <td className="py-3 px-4 text-center">
                            <div className="flex items-center justify-center gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setFacturaSeleccionada(f)}
                                leftIcon={<Eye className="w-3.5 h-3.5" />}
                              >
                                Ver
                              </Button>
                              {f.estado === 'pagada' && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    setFacturaParaReembolso(f)
                                    setModalReembolsoAbierto(true)
                                  }}
                                  className="text-amber-600 hover:text-amber-700"
                                >
                                  Reembolsar
                                </Button>
                              )}
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

          {/* TAB 2: CUPONES */}
          {tabActivo === 'cupones' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {cupones.map((c) => (
                  <div
                    key={c.id}
                    className="card p-5 border border-slate-100 dark:border-slate-800 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <span className="text-base font-black tracking-wider text-primary-600 bg-primary-50 dark:bg-primary-950/40 px-3 py-1 rounded-xl">
                          {c.codigo}
                        </span>
                        <Badge variant={c.activo ? 'success' : 'default'} size="sm" dot>
                          {c.activo ? 'Vigente' : 'Inactivo'}
                        </Badge>
                      </div>

                      <div className="mt-3">
                        <p className="text-2xl font-black text-slate-900 dark:text-slate-100">
                          {c.tipo === 'porcentual' ? `${c.valor}% OFF` : `$${c.valor} OFF`}
                        </p>
                        <p className="text-xs text-slate-400 mt-1">
                          Descuento aplicable en reservas online
                        </p>
                      </div>
                    </div>

                    <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-400">
                      <span>
                        Usos: <strong>{c.usos_actuales}</strong> / {c.usos_max ?? '∞'}
                      </span>
                      <button
                        onClick={() => handleEliminarCupon(c.id)}
                        className="p-1 rounded-lg text-slate-400 hover:text-red-500 transition-colors"
                        aria-label="Eliminar cupón"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: REEMBOLSOS */}
          {tabActivo === 'reembolsos' && (
            <div className="card shadow-card overflow-hidden">
              <div className="p-4 border-b border-slate-100 dark:border-slate-800">
                <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200">
                  Registro de Devoluciones y Reembolsos
                </h3>
              </div>

              {reembolsos.length === 0 ? (
                <EmptyState title="No hay reembolsos procesados" />
              ) : (
                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                  {reembolsos.map((r) => (
                    <div
                      key={r.id}
                      className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 dark:text-slate-100">
                            Reembolso a {r.cliente_nombre ?? 'Cliente'}
                          </span>
                          <Badge variant="success" size="sm" dot>
                            {r.estado}
                          </Badge>
                        </div>
                        <p className="text-slate-500 mt-0.5">
                          Factura #{r.factura_numero} • Motivo: "{r.motivo}"
                        </p>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          {new Date(r.created_at).toLocaleString('es-ES')}
                        </p>
                      </div>

                      <span className="text-base font-black text-red-600 dark:text-red-400">
                        -${r.monto}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: PAQUETES DE SERVICIOS */}
          {tabActivo === 'paquetes' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {paquetes.map((p) => (
                <div
                  key={p.id}
                  className="card p-6 border border-slate-100 dark:border-slate-800 flex flex-col justify-between hover:shadow-lg transition-all"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h4 className="font-bold text-base text-slate-900 dark:text-slate-100">
                        {p.nombre}
                      </h4>
                      <Badge variant="primary" size="sm">
                        -{p.descuento_porcentaje}% Ahorro
                      </Badge>
                    </div>

                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      {p.descripcion}
                    </p>

                    <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-baseline gap-3">
                      <span className="text-2xl font-black text-slate-900 dark:text-slate-100">
                        ${p.precio_total}
                      </span>
                      <span className="text-xs text-slate-400 line-through">
                        ${p.precio_original}
                      </span>
                    </div>
                  </div>

                  <div className="pt-4 mt-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      className="w-full justify-center"
                      onClick={() => toast.success('Paquete seleccionado', `Agregado bundle ${p.nombre}`)}
                    >
                      Promocionar Paquete
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* TAB 5: LISTA DE ESPERA */}
          {tabActivo === 'espera' && (
            <div className="card shadow-card overflow-hidden">
              <div className="p-4 border-b border-slate-100 dark:border-slate-800">
                <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200">
                  Clientes en Lista de Espera por Cancelaciones
                </h3>
              </div>

              {listaEspera.length === 0 ? (
                <EmptyState title="No hay clientes en lista de espera" />
              ) : (
                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                  {listaEspera.map((item) => (
                    <div
                      key={item.id}
                      className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 dark:text-slate-100">
                            {item.cliente?.nombre ?? 'Cliente'}
                          </span>
                          <Badge variant="warning" size="sm" dot>
                            {item.estado}
                          </Badge>
                        </div>
                        <p className="text-slate-500 mt-0.5">
                          Servicio: <strong>{item.servicio?.nombre ?? 'Consulta'}</strong> • Fecha deseada: {item.fecha_deseada} {item.hora_preferente ? `a las ${item.hora_preferente}` : ''}
                        </p>
                        {item.notas && (
                          <p className="text-[11px] text-slate-400 italic mt-0.5">
                            "{item.notas}"
                          </p>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          onClick={() => toast.success('Notificación enviada', `Se avisó a ${item.cliente?.nombre} del turno libre`)}
                        >
                          Notificar Turno Libre
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Modal Factura Detallada */}
      <FacturaModal
        factura={facturaSeleccionada}
        isOpen={!!facturaSeleccionada}
        onClose={() => setFacturaSeleccionada(null)}
        onSolicitarReembolso={(f) => {
          setFacturaSeleccionada(null)
          setFacturaParaReembolso(f)
          setModalReembolsoAbierto(true)
        }}
      />

      {/* Modal Crear Cupón */}
      <Modal
        isOpen={modalCuponAbierto}
        onClose={() => setModalCuponAbierto(false)}
        title="Crear Código de Descuento"
      >
        <form onSubmit={handleCrearCupon} className="space-y-4">
          <Input
            label="Código Promocional"
            placeholder="Ej: PRIMAVERA20"
            value={nuevoCupon.codigo}
            onChange={(e) => setNuevoCupon({ ...nuevoCupon, codigo: e.target.value.toUpperCase() })}
            required
          />

          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Tipo de Descuento"
              value={nuevoCupon.tipo}
              onChange={(e) => setNuevoCupon({ ...nuevoCupon, tipo: e.target.value as 'porcentual' | 'fijo' })}
              options={[
                { value: 'porcentual', label: 'Porcentual (%)' },
                { value: 'fijo', label: 'Monto Fijo ($)' },
              ]}
            />
            <Input
              label={nuevoCupon.tipo === 'porcentual' ? 'Porcentaje (%)' : 'Monto ($)'}
              type="number"
              min="1"
              value={nuevoCupon.valor}
              onChange={(e) => setNuevoCupon({ ...nuevoCupon, valor: Number(e.target.value) })}
              required
            />
          </div>

          <Input
            label="Límite de Usos Máximo"
            type="number"
            min="1"
            value={nuevoCupon.usos_max}
            onChange={(e) => setNuevoCupon({ ...nuevoCupon, usos_max: Number(e.target.value) })}
          />

          <div className="flex justify-end gap-2 pt-4">
            <Button variant="secondary" type="button" onClick={() => setModalCuponAbierto(false)}>
              Cancelar
            </Button>
            <Button type="submit">
              Habilitar Cupón
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal Reembolso */}
      <Modal
        isOpen={modalReembolsoAbierto}
        onClose={() => setModalReembolsoAbierto(false)}
        title="Procesar Reembolso"
      >
        <form onSubmit={handleProcesarReembolso} className="space-y-4 text-xs">
          <p className="text-slate-500">
            Estás por emitir un reembolso para la factura{' '}
            <strong>{facturaParaReembolso?.numero}</strong> por un importe de{' '}
            <strong className="text-slate-900 dark:text-slate-100">${facturaParaReembolso?.total}</strong>.
          </p>

          <Textarea
            label="Motivo del Reembolso"
            placeholder="Ej: Cancelación oportuna del paciente..."
            value={motivoReembolso}
            onChange={(e) => setMotivoReembolso(e.target.value)}
            required
          />

          <div className="flex justify-end gap-2 pt-3">
            <Button variant="secondary" type="button" onClick={() => setModalReembolsoAbierto(false)}>
              Cancelar
            </Button>
            <Button variant="danger" type="submit">
              Confirmar Reembolso
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
