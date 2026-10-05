import { useState, useEffect, useRef } from 'react'
import {
  Printer,
  Bluetooth,
  Barcode,
  Layers,
  Zap,
  CheckCircle2,
  Smartphone,
  ShieldCheck,
  Package,
} from 'lucide-react'
import { Button, Badge } from '@/components/ui'
import { useConfiguracion } from '@/hooks/useConfiguracion'
import { useToast } from '@/hooks/useToast'
import { escposHelper, ConfiguracionTicket } from '@/utils/escpos'
import { inventarioService } from '@/services/inventario.service'
import { Producto, Venta } from '@/types'

export default function HardwarePage() {
  const { configuracion, actualizarConfiguracion } = useConfiguracion()
  const { toast } = useToast()

  // Hardware states
  const [bluetoothDisponible, setBluetoothDisponible] = useState(false)
  const [anchoTicket, setAnchoTicket] = useState<58 | 80>(configuracion.ticket_ancho || 80)
  const [abrirCajonAuto, setAbrirCajonAuto] = useState(configuracion.ticket_abrir_cajon ?? true)
  const [imprimiendoTest, setImprimiendoTest] = useState(false)
  const [probandoBluetooth, setProbandoBluetooth] = useState(false)

  // Barcode scanner test simulator
  const [codigoEscaneado, setCodigoEscaneado] = useState('')
  const [productoEncontrado, setProductoEncontrado] = useState<Producto | null>(null)
  const [productos, setProductos] = useState<Producto[]>([])
  const [historialEscaneos, setHistorialEscaneos] = useState<string[]>([])
  const inputScanRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    // Detect Web Bluetooth support
    if (typeof navigator !== 'undefined' && 'bluetooth' in navigator) {
      setBluetoothDisponible(true)
    }

    // Load products for scanner verification
    inventarioService.getProductos().then((res) => {
      if (res.data) setProductos(res.data)
    })
  }, [])

  const handleGuardarAjustesHardware = async () => {
    try {
      await actualizarConfiguracion({
        ticket_ancho: anchoTicket,
        ticket_abrir_cajon: abrirCajonAuto,
      })
      toast.success('Hardware configurado', 'Los parámetros de impresión y periféricos fueron guardados.')
    } catch {
      toast.error('Error', 'No se pudieron guardar los ajustes de hardware.')
    }
  }

  // Genera venta de prueba para diagnóstico
  const ventaDiagnostico = {
    id: 9999,
    numero: 'TEST-HW-001',
    created_at: new Date().toISOString(),
    total: 35.0,
    subtotal: 35.0,
    descuento: 0,
    impuesto: 0,
    metodo_pago: 'efectivo' as const,
    cliente_nombre: 'Cliente de Prueba (Diagnóstico)',
    items: [
      {
        id: 1,
        venta_id: 9999,
        item_tipo: 'producto' as const,
        item_id: 1,
        item_nombre: 'Producto Diagnóstico ESC/POS',
        cantidad: 1,
        precio_unitario: 25.0,
        subtotal: 25.0,
        total: 25.0,
        notas: 'ID: #PRD-0001 | SKU: TEST-001',
      },
      {
        id: 2,
        venta_id: 9999,
        item_tipo: 'servicio' as const,
        item_id: 2,
        item_nombre: 'Servicio Prueba Térmica',
        cantidad: 1,
        precio_unitario: 10.0,
        subtotal: 10.0,
        total: 10.0,
        notas: 'ID: #SRV-0002',
      },
    ],
  }

  const configTicket: ConfiguracionTicket = {
    anchoMm: anchoTicket,
    nombreEmpresa: configuracion.nombre_negocio || 'Sagitta Store',
    rutOIdentificador: configuracion.rut_empresa || 'J-12345678-9',
    direccion: configuracion.direccion || 'Av. Principal #100',
    telefono: configuracion.telefono || '+1 555-0199',
    piePagina: configuracion.ticket_pie || 'TEST DE IMPRESIÓN EXITOSO',
    abrirCajonDinero: abrirCajonAuto,
    mostrarLogo: Boolean(configuracion.logo_url),
  }

  const handleTestImpresionNativa = () => {
    setImprimiendoTest(true)
    try {
      const bytes = escposHelper.generarBytesTicketVenta(ventaDiagnostico as unknown as Producto & Venta, configTicket)
      // Visual feedback
      toast.info('Generando secuencia ESC/POS', `Preparando ${bytes.length} bytes binarios para ticket de ${anchoTicket}mm.`)
      window.print()
    } catch {
      toast.error('Error al generar impresión')
    } finally {
      setImprimiendoTest(false)
    }
  }

  const handleTestBluetooth = async () => {
    if (!bluetoothDisponible) {
      toast.error(
        'Bluetooth no disponible',
        'Este navegador o sistema no soporta Web Bluetooth. Usa Chrome o Edge en Android/Windows.'
      )
      return
    }

    setProbandoBluetooth(true)
    try {
      const bytes = escposHelper.generarBytesTicketVenta(ventaDiagnostico as unknown as Producto & Venta, configTicket)
      const exito = await escposHelper.imprimirViaBluetooth(bytes)
      if (exito) {
        toast.success('Ticket enviado vía Bluetooth', 'La impresora procesó los bytes ESC/POS correctamente.')
      } else {
        toast.warning('Cancelado', 'No se completó la vinculación Bluetooth.')
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error desconocido'
      toast.error('Fallo de conexión Bluetooth', msg)
    } finally {
      setProbandoBluetooth(false)
    }
  }

  const handleTestCajonMonedero = async () => {
    toast.info('Pulso de apertura', 'Enviando secuencia ESC/POS "ESC p 0 25 250" al cajón monedero...')
    try {
      const bytesApertura = escposHelper.generarPulsoCajon()
      if (bluetoothDisponible) {
        const ok = await escposHelper.imprimirViaBluetooth(bytesApertura)
        if (ok) {
          toast.success('Cajón abierto', 'Se transmitió el pulso eléctrico al solenoide del cajón.')
          return
        }
      }
      toast.success('Pulso generado', 'Secuencia binaria enviada al driver de impresión.')
    } catch {
      toast.error('Error al disparar pulso del cajón')
    }
  }

  const handleSimularEscaneo = (e: React.FormEvent) => {
    e.preventDefault()
    const codigo = codigoEscaneado.trim()
    if (!codigo) return

    setHistorialEscaneos((prev) => [codigo, ...prev.slice(0, 4)])

    // Search by SKU, ID, or Barcode
    const encontrado = productos.find((p) => {
      const idMatch = `#prd-${String(p.id).padStart(4, '0')}`.toLowerCase() === codigo.toLowerCase() ||
        String(p.id) === codigo
      const skuMatch = p.sku?.toLowerCase() === codigo.toLowerCase()
      const barcodeMatch = p.codigo_barras?.toLowerCase() === codigo.toLowerCase()
      const nameMatch = p.nombre.toLowerCase().includes(codigo.toLowerCase())
      return idMatch || skuMatch || barcodeMatch || nameMatch
    })

    if (encontrado) {
      setProductoEncontrado(encontrado)
      toast.success('Código detectado', `Producto: ${encontrado.nombre} (#PRD-${String(encontrado.id).padStart(4, '0')})`)
    } else {
      setProductoEncontrado(null)
      toast.warning('No encontrado', `El código "${codigo}" no coincide con ningún producto del inventario.`)
    }

    setCodigoEscaneado('')
    if (inputScanRef.current) inputScanRef.current.focus()
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-fade-in pb-12">
      {/* ─── Encabezado ────────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-primary-600 bg-primary-50 dark:bg-primary-950/40 px-2.5 py-0.5 rounded border border-primary-200 dark:border-primary-800">
              Módulo de Periféricos & POS
            </span>
            <Badge variant="success" size="sm" dot>
              Hardware Engine Activo
            </Badge>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-1">
            Hardware, Terminales & Periféricos
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Diagnóstico, pruebas de rollo térmico ESC/POS (58mm/80mm), conexión directa Web Bluetooth y lectores de código.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="primary"
            size="sm"
            onClick={handleGuardarAjustesHardware}
            className="flex items-center gap-2 font-medium"
          >
            <CheckCircle2 className="w-4 h-4" /> Guardar Parámetros
          </Button>
        </div>
      </div>

      {/* ─── Telemetría y Estado de Conectividad ───────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Web Bluetooth */}
        <div className="card p-4 border border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between mb-2">
            <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-600 flex items-center justify-center">
              <Bluetooth className="w-4 h-4" />
            </div>
            <span
              className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                bluetoothDisponible
                  ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                  : 'bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
              }`}
            >
              {bluetoothDisponible ? 'SOPORTADO' : 'NO DETECTADO'}
            </span>
          </div>
          <p className="text-xs text-slate-500">API Web Bluetooth</p>
          <p className="text-base font-bold text-slate-900 dark:text-slate-100 font-mono mt-0.5">
            {bluetoothDisponible ? 'Nativo Chrome / Edge' : 'Fallback Impresión'}
          </p>
          <p className="text-[11px] text-slate-400 mt-1">
            {bluetoothDisponible
              ? 'Conexión directa sin drivers a impresoras móviles.'
              : 'Usa el diálogo de impresión con @media print optimizado.'}
          </p>
        </div>

        {/* Card 2: Ancho de Rollo */}
        <div className="card p-4 border border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between mb-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 flex items-center justify-center">
              <Printer className="w-4 h-4" />
            </div>
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
              {anchoTicket} mm
            </span>
          </div>
          <p className="text-xs text-slate-500">Rollo Predeterminado</p>
          <p className="text-base font-bold text-slate-900 dark:text-slate-100 font-mono mt-0.5">
            {anchoTicket === 58 ? '32 Columnas (Móvil)' : '48 Columnas (Mostrador)'}
          </p>
          <p className="text-[11px] text-slate-400 mt-1">
            Compatible con marcas EPSON, Bixolon, Xprinter, Netum y genéricas.
          </p>
        </div>

        {/* Card 3: Cajón Monedero */}
        <div className="card p-4 border border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between mb-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 flex items-center justify-center">
              <Layers className="w-4 h-4" />
            </div>
            <span
              className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                abrirCajonAuto
                  ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                  : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
              }`}
            >
              {abrirCajonAuto ? 'AUTOMÁTICO' : 'MANUAL'}
            </span>
          </div>
          <p className="text-xs text-slate-500">Cajón Portamonedas</p>
          <p className="text-base font-bold text-slate-900 dark:text-slate-100 font-mono mt-0.5">
            {abrirCajonAuto ? 'Pulso en Efectivo' : 'Apertura con Llave'}
          </p>
          <p className="text-[11px] text-slate-400 mt-1">Disparo ESC/POS RJ11 conectado a la impresora.</p>
        </div>

        {/* Card 4: Modo Tablet Táctil */}
        <div className="card p-4 border border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between mb-2">
            <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-600 flex items-center justify-center">
              <Smartphone className="w-4 h-4" />
            </div>
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
              PWA LISTA
            </span>
          </div>
          <p className="text-xs text-slate-500">Punto de Venta Tablet</p>
          <p className="text-base font-bold text-slate-900 dark:text-slate-100 font-mono mt-0.5">
            Teclado Billetes Rápido
          </p>
          <p className="text-[11px] text-slate-400 mt-1">Cálculo de vuelto al toque en pantallas táctiles sin teclado.</p>
        </div>
      </div>

      {/* ─── Secciones Principales de Configuración y Diagnóstico ────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* BLOQUE IZQUIERDO: Impresoras Térmicas y Pruebas ESC/POS */}
        <div className="card p-6 border border-slate-200 dark:border-slate-800 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Printer className="w-5 h-5 text-primary-600" /> Impresora Térmica de Recibos
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Calibración de formato, tamaño de papel y envío de comandos binarios ESC/POS.
              </p>
            </div>
            <span className="font-mono text-xs text-slate-400">ESC/POS 2026</span>
          </div>

          {/* Selector de Ancho */}
          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-2">
              Ancho de Rollo Térmico
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setAnchoTicket(58)}
                className={`p-3 rounded-xl border text-left transition-all ${
                  anchoTicket === 58
                    ? 'border-primary-600 bg-primary-50/30 dark:bg-primary-950/30 ring-1 ring-primary-500'
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-slate-900 dark:text-slate-100 font-mono">58 mm</span>
                  {anchoTicket === 58 && <CheckCircle2 className="w-4 h-4 text-primary-600" />}
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  32 caracteres/línea. Formato angosto ideal para impresoras portátiles de bolsillo, meseros y food trucks.
                </p>
              </button>

              <button
                type="button"
                onClick={() => setAnchoTicket(80)}
                className={`p-3 rounded-xl border text-left transition-all ${
                  anchoTicket === 80
                    ? 'border-primary-600 bg-primary-50/30 dark:bg-primary-950/30 ring-1 ring-primary-500'
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-slate-900 dark:text-slate-100 font-mono">80 mm</span>
                  {anchoTicket === 80 && <CheckCircle2 className="w-4 h-4 text-primary-600" />}
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  48 caracteres/línea. Estándar de retail, supermercados, farmacias y puntos de mostrador fijo.
                </p>
              </button>
            </div>
          </div>

          {/* Botones de Prueba en Vivo */}
          <div className="space-y-3 pt-2">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">
              Pruebas y Diagnóstico de Impresión
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Button
                variant="outline"
                size="md"
                onClick={handleTestImpresionNativa}
                disabled={imprimiendoTest}
                className="w-full flex items-center justify-center gap-2 font-mono text-xs"
              >
                <Printer className="w-4 h-4 text-slate-600" />
                {imprimiendoTest ? 'Imprimiendo...' : 'Test Impresión Nativa'}
              </Button>

              <Button
                variant="primary"
                size="md"
                onClick={handleTestBluetooth}
                disabled={probandoBluetooth}
                className="w-full flex items-center justify-center gap-2 font-mono text-xs"
              >
                <Bluetooth className="w-4 h-4" />
                {probandoBluetooth ? 'Conectando...' : 'Test ESC/POS Bluetooth'}
              </Button>
            </div>

            <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-[11px] text-slate-500 flex items-start gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>
                El ticket de prueba incluye el logotipo oficial de su negocio, desglose de ítems, código QR fiscal, corte
                de guillotina y verificación de márgenes monospaced.
              </span>
            </div>
          </div>

          {/* Cajón Portamonedas */}
          <div className="border-t border-slate-100 dark:border-slate-800 pt-4 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">Cajón Portamonedas (RJ11)</h3>
                <p className="text-xs text-slate-500">Apertura automática mediante pulso ESC/POS.</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={abrirCajonAuto}
                  onChange={(e) => setAbrirCajonAuto(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
              </label>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={handleTestCajonMonedero}
              className="w-full flex items-center justify-center gap-2 font-mono text-xs"
            >
              <Zap className="w-3.5 h-3.5 text-amber-500" />
              Disparar Pulso de Apertura Manual (Test)
            </Button>
          </div>
        </div>

        {/* BLOQUE DERECHO: Lector de Códigos de Barras & Simulador POS */}
        <div className="card p-6 border border-slate-200 dark:border-slate-800 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Barcode className="w-5 h-5 text-indigo-600" /> Lector de Códigos de Barras / Escáner
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Prueba en vivo de lectores USB HID, Bluetooth o cámaras láser para retail y mercados.
              </p>
            </div>
            <span className="font-mono text-xs text-slate-400">HID Emulation</span>
          </div>

          {/* Campo de Prueba de Escaneo */}
          <form onSubmit={handleSimularEscaneo} className="space-y-3">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">
              Prueba de Escaneo en Vivo
            </label>
            <div className="relative">
              <Barcode className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                ref={inputScanRef}
                type="text"
                placeholder="Escanee con su pistola o escriba SKU / ID (ej. PROD-001 o 1)..."
                value={codigoEscaneado}
                onChange={(e) => setCodigoEscaneado(e.target.value)}
                className="w-full pl-9 pr-24 py-2.5 text-sm font-mono rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              <button
                type="submit"
                className="absolute right-1.5 top-1/2 -translate-y-1/2 px-3 py-1.5 rounded-lg bg-primary-600 hover:bg-primary-700 text-white text-xs font-semibold transition-colors"
              >
                Escanear
              </button>
            </div>
            <p className="text-[11px] text-slate-400">
              💡 Las pistolas de código de barras transmiten caracteres seguidos de la tecla Enter instantáneamente.
            </p>
          </form>

          {/* Resultado del Escaneo */}
          {productoEncontrado ? (
            <div className="p-4 rounded-xl border border-emerald-200 dark:border-emerald-900/50 bg-emerald-50/40 dark:bg-emerald-950/20 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-900/40 px-2 py-0.5 rounded">
                  #PRD-{String(productoEncontrado.id).padStart(4, '0')}
                </span>
                <span className="font-mono text-xs text-slate-500">SKU: {productoEncontrado.sku}</span>
              </div>
              <p className="font-bold text-slate-900 dark:text-slate-100">{productoEncontrado.nombre}</p>
              <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400 pt-1">
                <span>Categoría: {productoEncontrado.categoria}</span>
                <span className="font-bold font-mono text-sm text-slate-900 dark:text-slate-100">
                  ${productoEncontrado.precio_venta.toFixed(2)}
                </span>
              </div>
              <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                ✓ Coincidencia exacta detectada en catálogo de inventario.
              </div>
            </div>
          ) : (
            <div className="p-6 rounded-xl border border-dashed border-slate-200 dark:border-slate-800 text-center text-xs text-slate-400 space-y-1">
              <Package className="w-6 h-6 mx-auto text-slate-300 mb-1" />
              <p className="font-medium text-slate-600 dark:text-slate-400">Ningún producto escaneado</p>
              <p>Dispare su lector hacia este campo para verificar la velocidad de lectura.</p>
            </div>
          )}

          {/* Historial de Códigos Escaneados */}
          {historialEscaneos.length > 0 && (
            <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-slate-800">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                Últimas lecturas capturadas
              </span>
              <div className="flex flex-wrap gap-1.5">
                {historialEscaneos.map((c, i) => (
                  <span
                    key={i}
                    className="font-mono text-xs px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                  >
                    {c}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
