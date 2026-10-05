import { useState } from 'react'
import {
  Printer,
  Bluetooth,
  Utensils,
  Receipt,
  Copy,
} from 'lucide-react'
import { Venta } from '@/types'
import { Modal, Button } from '@/components/ui'
import { useConfiguracion } from '@/hooks/useConfiguracion'
import { useToast } from '@/hooks/useToast'
import { escposHelper, ConfiguracionTicket } from '@/utils/escpos'

export interface TicketTermicoModalProps {
  isOpen: boolean
  onClose: () => void
  venta: Venta | null
  montoRecibido?: number
  vuelto?: number
}

export function TicketTermicoModal({
  isOpen,
  onClose,
  venta,
  montoRecibido,
  vuelto,
}: TicketTermicoModalProps) {
  const { configuracion, nombreMarca, lemaMarca } = useConfiguracion()
  const { toast } = useToast()

  const [tipoTicket, setTipoTicket] = useState<'cliente' | 'comanda'>('cliente')
  const [anchoPapel, setAnchoPapel] = useState<58 | 80>(80)
  const [imprimiendoBT, setImprimiendoBT] = useState(false)

  if (!venta) return null

  const configTicket: ConfiguracionTicket = {
    anchoMm: anchoPapel,
    nombreEmpresa: nombreMarca || 'Sagitta Business',
    lema: lemaMarca || 'Punto de Venta Profesional',
    direccion: configuracion.direccion || 'Casa Matriz',
    telefono: configuracion.telefono || '+56 9 1234 5678',
    rutOIdentificador: configuracion.rut_empresa || 'RUT 76.543.210-K',
    piePagina: '¡Gracias por su visita! Vuelva pronto.',
    mostrarLogo: true,
    abrirCajonDinero: true,
  }

  // 1. Impresión Estándar del Navegador (Diálogo nativo optimizado con @media print)
  const handleImprimirNativo = () => {
    window.print()
  }

  // 2. Impresión Directa Web Bluetooth (ESC/POS sin drivers en tablets)
  const handleImprimirBluetooth = async () => {
    setImprimiendoBT(true)
    try {
      const bytes =
        tipoTicket === 'cliente'
          ? escposHelper.generarBytesTicketVenta(venta, configTicket)
          : escposHelper.generarBytesComandaCocina(venta, configTicket)

      await escposHelper.imprimirViaBluetooth(bytes)
      toast.success('Ticket Enviado', 'Impresión Bluetooth completada exitosamente')
    } catch (err) {
      toast.warning(
        'Impresión Bluetooth no conectada',
        err instanceof Error ? err.message : 'No se pudo conectar a la impresora'
      )
    } finally {
      setImprimiendoBT(false)
    }
  }

  const handleCopiarTexto = () => {
    const lineas = [
      configTicket.nombreEmpresa,
      configTicket.direccion,
      `Folio: ${venta.numero}`,
      `Fecha: ${new Date(venta.created_at).toLocaleString()}`,
      '--------------------------------',
      ...venta.items.map((it) => `${it.cantidad}x ${it.nombre} - $${it.total.toLocaleString()}`),
      '--------------------------------',
      `TOTAL: $${venta.total.toLocaleString()}`,
      `Método: ${venta.metodo_pago.toUpperCase()}`,
      configTicket.piePagina,
    ].join('\n')

    navigator.clipboard.writeText(lineas)
    toast.info('Copiado', 'Texto del ticket copiado al portapapeles')
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Ticket Térmico de Venta"
      size="md"
    >
      <div className="space-y-4">
        {/* Controles de Configuración del Ticket */}
        <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 bg-slate-100 dark:bg-slate-800/60 rounded-xl text-xs">
          {/* Selector Tipo */}
          <div className="flex rounded-lg bg-white dark:bg-slate-900 p-0.5 border border-slate-200 dark:border-slate-700">
            <button
              type="button"
              onClick={() => setTipoTicket('cliente')}
              className={`px-3 py-1 rounded-md font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                tipoTicket === 'cliente'
                  ? 'bg-primary-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <Receipt className="w-3.5 h-3.5" />
              <span>Cliente</span>
            </button>
            <button
              type="button"
              onClick={() => setTipoTicket('comanda')}
              className={`px-3 py-1 rounded-md font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                tipoTicket === 'comanda'
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <Utensils className="w-3.5 h-3.5" />
              <span>Comanda Cocina</span>
            </button>
          </div>

          {/* Selector Ancho de Rollo */}
          <div className="flex items-center gap-1">
            <span className="text-slate-500 font-medium text-[11px]">Rollo:</span>
            <button
              type="button"
              onClick={() => setAnchoPapel(80)}
              className={`px-2 py-1 rounded font-bold text-[11px] ${
                anchoPapel === 80
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                  : 'text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              80 mm
            </button>
            <button
              type="button"
              onClick={() => setAnchoPapel(58)}
              className={`px-2 py-1 rounded font-bold text-[11px] ${
                anchoPapel === 58
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                  : 'text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              58 mm
            </button>
          </div>
        </div>

        {/* ─── Vista Previa Realista de Rollo Térmico ─── */}
        <div className="flex justify-center py-2 bg-slate-200 dark:bg-slate-950/70 p-4 rounded-xl overflow-x-auto">
          <div
            id="ticket-termico-impresion"
            className={`bg-white text-black p-5 rounded shadow-lg font-mono text-xs leading-tight transition-all select-all ${
              anchoPapel === 58 ? 'w-[260px]' : 'w-[320px]'
            }`}
            style={{ fontFamily: '"Courier New", Courier, monospace' }}
          >
            {tipoTicket === 'cliente' ? (
              /* Ticket Cliente */
              <div className="space-y-2">
                {/* Logo o Marca */}
                <div className="text-center space-y-1">
                  {configuracion.logo_url && configTicket.mostrarLogo && (
                    <img
                      src={configuracion.logo_url}
                      alt={configTicket.nombreEmpresa}
                      className="max-h-12 max-w-[140px] mx-auto object-contain grayscale contrast-200 mb-1"
                    />
                  )}
                  <h2 className="font-black text-sm uppercase tracking-wide">
                    {configTicket.nombreEmpresa}
                  </h2>
                  {configTicket.lema && (
                    <p className="text-[10px] text-gray-700">{configTicket.lema}</p>
                  )}
                  {configTicket.rutOIdentificador && (
                    <p className="text-[10px]">{configTicket.rutOIdentificador}</p>
                  )}
                  {configTicket.direccion && (
                    <p className="text-[10px]">{configTicket.direccion}</p>
                  )}
                  {configTicket.telefono && (
                    <p className="text-[10px]">Tel: {configTicket.telefono}</p>
                  )}
                </div>

                <div className="border-b border-dashed border-gray-400 my-2" />

                {/* Info Venta */}
                <div className="text-[11px] space-y-0.5">
                  <div className="flex justify-between">
                    <span>FOLIO:</span>
                    <span className="font-bold">{venta.numero}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>FECHA:</span>
                    <span>{new Date(venta.created_at).toLocaleDateString()} {new Date(venta.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  {venta.cliente?.nombre && (
                    <div className="flex justify-between">
                      <span>CLIENTE:</span>
                      <span className="font-semibold truncate max-w-[150px]">{venta.cliente.nombre}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>MÉTODO:</span>
                    <span className="font-bold uppercase">{venta.metodo_pago}</span>
                  </div>
                </div>

                <div className="border-b border-dashed border-gray-400 my-2" />

                {/* Líneas de Items */}
                <div className="space-y-1">
                  <div className="flex justify-between font-bold text-[10px] text-gray-700 pb-1 border-b border-gray-300">
                    <span>CANT / ARTÍCULO</span>
                    <span>TOTAL</span>
                  </div>
                  {venta.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-start text-[11px]">
                      <div className="pr-2">
                        <span>{item.cantidad}x </span>
                        <span className="font-medium">{item.nombre}</span>
                      </div>
                      <span className="font-bold shrink-0">
                        ${item.total.toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="border-b border-dashed border-gray-400 my-2" />

                {/* Subtotales y Total */}
                <div className="space-y-1 text-[11px]">
                  <div className="flex justify-between">
                    <span>SUBTOTAL:</span>
                    <span>${venta.subtotal.toLocaleString()}</span>
                  </div>
                  {venta.descuento_global > 0 && (
                    <div className="flex justify-between font-semibold">
                      <span>DESCUENTO:</span>
                      <span>-${venta.descuento_global.toLocaleString()}</span>
                    </div>
                  )}
                  {venta.propina && venta.propina > 0 && (
                    <div className="flex justify-between">
                      <span>PROPINA:</span>
                      <span>+${venta.propina.toLocaleString()}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm font-black pt-1 border-t border-gray-400">
                    <span>TOTAL A PAGAR:</span>
                    <span>${venta.total.toLocaleString()}</span>
                  </div>
                  {montoRecibido !== undefined && montoRecibido > 0 && (
                    <>
                      <div className="flex justify-between pt-1">
                        <span>PAGÓ CON:</span>
                        <span>${montoRecibido.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between font-bold text-gray-900">
                        <span>SU VUELTO / CAMBIO:</span>
                        <span>${(vuelto || 0).toLocaleString()}</span>
                      </div>
                    </>
                  )}
                </div>

                <div className="border-b border-dashed border-gray-400 my-2" />

                {/* Pie de Página */}
                <div className="text-center text-[10px] space-y-1 pt-1">
                  <p className="font-bold">{configTicket.piePagina}</p>
                  <p className="text-[9px] text-gray-500">Sagitta PWA POS Engine</p>
                </div>
              </div>
            ) : (
              /* Comanda Cocina / Taller */
              <div className="space-y-3">
                <div className="text-center">
                  <span className="bg-black text-white px-2 py-0.5 text-xs font-black uppercase tracking-wider">
                    COMANDA DE PREPARACIÓN
                  </span>
                  <h1 className="text-2xl font-black mt-2">
                    ORDEN #{venta.numero.split('-').pop() || venta.id}
                  </h1>
                  <p className="text-[11px] font-bold">
                    Hora: {new Date().toLocaleTimeString()}
                  </p>
                  {venta.cliente?.nombre && (
                    <p className="text-xs font-semibold">Para: {venta.cliente.nombre}</p>
                  )}
                </div>

                <div className="border-b-2 border-black my-2" />

                <div className="space-y-2">
                  {venta.items.map((item, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-xs font-black">
                      <span className="w-5 h-5 border-2 border-black inline-flex items-center justify-center shrink-0">
                        {item.cantidad}
                      </span>
                      <div>
                        <p className="text-sm font-black">{item.nombre}</p>
                        {item.tipo === 'servicio' && (
                          <p className="text-[10px] font-normal text-gray-600">Servicio en Cabina/Mesa</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {venta.notas && (
                  <div className="mt-3 p-2 border-2 border-dashed border-black rounded text-[11px]">
                    <span className="font-black uppercase block">OBSERVACIONES:</span>
                    <span>{venta.notas}</span>
                  </div>
                )}

                <div className="border-b-2 border-black my-2" />
                <div className="text-center text-[10px] font-bold">
                  *** FIN DE COMANDA ***
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Botones de Acción */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
          <Button variant="ghost" size="sm" onClick={handleCopiarTexto} leftIcon={<Copy className="w-4 h-4" />}>
            Copiar Texto
          </Button>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={handleImprimirBluetooth}
              loading={imprimiendoBT}
              leftIcon={<Bluetooth className="w-4 h-4 text-blue-500" />}
              title="Conectar e imprimir vía Web Bluetooth a impresora portátil"
            >
              Impresora Bluetooth
            </Button>
            <Button
              onClick={handleImprimirNativo}
              leftIcon={<Printer className="w-4 h-4" />}
            >
              Imprimir Ticket
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  )
}
