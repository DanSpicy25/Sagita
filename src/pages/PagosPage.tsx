import { useState, useEffect } from 'react'
import {
  Receipt,
  Tag,
  RotateCcw,
  Package,
  DollarSign,
  Gift,
  Flame,
  Users,
} from 'lucide-react'
import type { Factura, Cupon, Reembolso, PaqueteServicio } from '@/types'
import { pagosService } from '@/services/pagos.service'
import {
  FacturaModal,
  FacturasTab,
  CuponesTab,
  ReembolsosTab,
  PaquetesFinanzasTab,
  GestionComisiones,
  GestionGiftCards,
  GestionPromociones,
} from '@/components/pagos'
import { useToast } from '@/hooks/useToast'

type TabFinanzas =
  | 'facturas'
  | 'cupones'
  | 'reembolsos'
  | 'paquetes'
  | 'comisiones'
  | 'giftcards'
  | 'promociones'

export default function PagosPage() {
  const [tabActivo, setTabActivo] = useState<TabFinanzas>('facturas')
  const [facturas, setFacturas] = useState<Factura[]>([])
  const [cupones, setCupones] = useState<Cupon[]>([])
  const [reembolsos, setReembolsos] = useState<Reembolso[]>([])
  const [paquetes, setPaquetes] = useState<PaqueteServicio[]>([])
  const [cargando, setCargando] = useState(true)

  // Modales
  const [facturaSeleccionada, setFacturaSeleccionada] = useState<Factura | null>(null)
  const [modalReembolsoAbierto, setModalReembolsoAbierto] = useState(false)
  const [facturaParaReembolso, setFacturaParaReembolso] = useState<Factura | null>(null)

  const { toast } = useToast()

  const cargarDatos = () => {
    setCargando(true)
    Promise.all([
      pagosService.getFacturas(),
      pagosService.getCupones(),
      pagosService.getReembolsos(),
      pagosService.getPaquetes(),
    ])
      .then(([facRes, cupRes, reemRes, paqRes]) => {
        if (facRes.data) setFacturas(facRes.data)
        if (cupRes.data) setCupones(cupRes.data)
        if (reemRes.data) setReembolsos(reemRes.data)
        if (paqRes.data) setPaquetes(paqRes.data)
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

  // Handlers para cupones
  const handleCrearCupon = async (nuevo: {
    codigo: string
    tipo: 'porcentual' | 'fijo'
    valor: number
    usos_max: number
  }) => {
    try {
      await pagosService.crearCupon({
        codigo: nuevo.codigo,
        tipo: nuevo.tipo,
        valor: nuevo.valor,
        usos_max: nuevo.usos_max,
        usos_actuales: 0,
        activo: true,
      })
      toast.success('Cupón creado', `Código ${nuevo.codigo} habilitado exitosamente`)
      cargarDatos()
    } catch {
      toast.error('Error', 'No se pudo crear el cupón')
    }
  }

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

  // Handlers para reembolsos
  const handleProcesarReembolso = async (factura: Factura, motivo: string) => {
    try {
      await pagosService.solicitarReembolso({
        factura_id: factura.id,
        monto: factura.total,
        motivo,
      })
      toast.success(
        'Reembolso completado',
        `Se devolvieron $${factura.total.toFixed(2)} a ${factura.cliente?.nombre ?? 'Cliente'}`
      )
      setModalReembolsoAbierto(false)
      setFacturaParaReembolso(null)
      cargarDatos()
    } catch {
      toast.error('Error', 'No se pudo procesar el reembolso')
    }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
          Facturación y Gestión Financiera
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
          Comprobantes fiscales, reembolsos, cupones, paquetes de servicios y comisiones.
        </p>
      </div>

      {/* KPI Cards Financieros */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="p-4 rounded-xl border border-border bg-surface shadow-xs">
          <div className="flex items-center justify-between text-text-muted">
            <span className="text-xs font-semibold uppercase tracking-wider">Ingresos Netos</span>
            <DollarSign className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="mt-2 text-2xl font-bold text-text">${ingresosTotales.toFixed(2)}</div>
          <div className="mt-1 text-xs text-text-muted">Facturas pagadas</div>
        </div>

        <div className="p-4 rounded-xl border border-border bg-surface shadow-xs">
          <div className="flex items-center justify-between text-text-muted">
            <span className="text-xs font-semibold uppercase tracking-wider">Facturas Emitidas</span>
            <Receipt className="w-4 h-4 text-primary" />
          </div>
          <div className="mt-2 text-2xl font-bold text-text">{facturas.length}</div>
          <div className="mt-1 text-xs text-text-muted">
            {facturas.filter((f) => f.estado === 'pagada').length} pagadas
          </div>
        </div>

        <div className="p-4 rounded-xl border border-border bg-surface shadow-xs">
          <div className="flex items-center justify-between text-text-muted">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Reembolsos</span>
            <RotateCcw className="w-4 h-4 text-amber-500" />
          </div>
          <div className="mt-2 text-2xl font-bold text-text">${totalReembolsado.toFixed(2)}</div>
          <div className="mt-1 text-xs text-text-muted">{reembolsos.length} devoluciones</div>
        </div>

        <div className="p-4 rounded-xl border border-border bg-surface shadow-xs">
          <div className="flex items-center justify-between text-text-muted">
            <span className="text-xs font-semibold uppercase tracking-wider">Cupones Activos</span>
            <Tag className="w-4 h-4 text-purple-500" />
          </div>
          <div className="mt-2 text-2xl font-bold text-text">{cupones.filter((c) => c.activo).length}</div>
          <div className="mt-1 text-xs text-text-muted">Descuentos vigentes</div>
        </div>
      </div>

      {/* Tabs de Navegación */}
      <div className="flex items-center gap-1.5 border-b border-border pb-2 overflow-x-auto text-xs">
        <button
          onClick={() => setTabActivo('facturas')}
          className={`px-3.5 py-2 rounded-xl font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
            tabActivo === 'facturas' ? 'bg-primary text-white shadow-xs' : 'text-text-muted hover:bg-secondary-soft hover:text-text'
          }`}
        >
          <Receipt className="w-3.5 h-3.5" />
          Facturas ({facturas.length})
        </button>

        <button
          onClick={() => setTabActivo('cupones')}
          className={`px-3.5 py-2 rounded-xl font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
            tabActivo === 'cupones' ? 'bg-primary text-white shadow-xs' : 'text-text-muted hover:bg-secondary-soft hover:text-text'
          }`}
        >
          <Tag className="w-3.5 h-3.5" />
          Cupones ({cupones.length})
        </button>

        <button
          onClick={() => setTabActivo('reembolsos')}
          className={`px-3.5 py-2 rounded-xl font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
            tabActivo === 'reembolsos' ? 'bg-primary text-white shadow-xs' : 'text-text-muted hover:bg-secondary-soft hover:text-text'
          }`}
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Reembolsos ({reembolsos.length})
        </button>

        <button
          onClick={() => setTabActivo('paquetes')}
          className={`px-3.5 py-2 rounded-xl font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
            tabActivo === 'paquetes' ? 'bg-primary text-white shadow-xs' : 'text-text-muted hover:bg-secondary-soft hover:text-text'
          }`}
        >
          <Package className="w-3.5 h-3.5" />
          Paquetes ({paquetes.length})
        </button>

        <button
          onClick={() => setTabActivo('comisiones')}
          className={`px-3.5 py-2 rounded-xl font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
            tabActivo === 'comisiones' ? 'bg-primary text-white shadow-xs' : 'text-text-muted hover:bg-secondary-soft hover:text-text'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          Comisiones
        </button>

        <button
          onClick={() => setTabActivo('giftcards')}
          className={`px-3.5 py-2 rounded-xl font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
            tabActivo === 'giftcards' ? 'bg-primary text-white shadow-xs' : 'text-text-muted hover:bg-secondary-soft hover:text-text'
          }`}
        >
          <Gift className="w-3.5 h-3.5" />
          Gift Cards
        </button>

        <button
          onClick={() => setTabActivo('promociones')}
          className={`px-3.5 py-2 rounded-xl font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
            tabActivo === 'promociones' ? 'bg-primary text-white shadow-xs' : 'text-text-muted hover:bg-secondary-soft hover:text-text'
          }`}
        >
          <Flame className="w-3.5 h-3.5" />
          Promociones
        </button>
      </div>

      {/* Contenido Modular según Tab Activo */}
      {cargando ? (
        <div className="py-16 text-center text-text-muted text-xs">
          Cargando datos financieros...
        </div>
      ) : (
        <>
          {tabActivo === 'facturas' && (
            <FacturasTab
              facturas={facturas}
              onVerFactura={(f) => setFacturaSeleccionada(f)}
              onReembolsarFactura={(f) => {
                setFacturaParaReembolso(f)
                setModalReembolsoAbierto(true)
              }}
            />
          )}

          {tabActivo === 'cupones' && (
            <CuponesTab
              cupones={cupones}
              onCrearCupon={handleCrearCupon}
              onEliminarCupon={handleEliminarCupon}
            />
          )}

          {tabActivo === 'reembolsos' && (
            <ReembolsosTab
              reembolsos={reembolsos}
              facturaParaReembolso={facturaParaReembolso}
              modalReembolsoAbierto={modalReembolsoAbierto}
              onCerrarModal={() => {
                setModalReembolsoAbierto(false)
                setFacturaParaReembolso(null)
              }}
              onConfirmarReembolso={handleProcesarReembolso}
            />
          )}

          {tabActivo === 'paquetes' && (
            <PaquetesFinanzasTab paquetes={paquetes} />
          )}

          {tabActivo === 'comisiones' && <GestionComisiones />}
          {tabActivo === 'giftcards' && <GestionGiftCards />}
          {tabActivo === 'promociones' && <GestionPromociones />}
        </>
      )}

      {/* Modal de Detalle de Factura */}
      {facturaSeleccionada && (
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
      )}
    </div>
  )
}
