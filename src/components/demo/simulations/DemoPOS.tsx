import { useState } from 'react'
import {
  ShoppingCart,
  Plus,
  Minus,
  CreditCard,
  Banknote,
  CheckCircle2,
  X,
} from 'lucide-react'
import { DEMO_SERVICIOS, DEMO_PRODUCTOS, type DeviceMode } from '../demoData'

interface ItemCarrito {
  id: string
  nombre: string
  precio: number
  cantidad: number
  tipo: 'servicio' | 'producto'
}

export function DemoPOS({ deviceMode: _deviceMode }: { deviceMode?: DeviceMode } = {}) {
  const [carrito, setCarrito] = useState<ItemCarrito[]>([
    {
      id: 's-201',
      nombre: 'Tratamiento Facial Glow Completo',
      precio: 75,
      cantidad: 1,
      tipo: 'servicio',
    },
    {
      id: 'p-301',
      nombre: 'Serum Ácido Hialurónico 2%',
      precio: 38,
      cantidad: 1,
      tipo: 'producto',
    },
  ])

  const [modalCobro, setModalCobro] = useState(false)
  const [ticketEmitido, setTicketEmitido] = useState(false)

  const agregarItem = (item: { id: number; nombre: string; precio: number }, tipo: 'servicio' | 'producto') => {
    const key = `${tipo[0]}-${item.id}`
    setCarrito((prev) => {
      const existe = prev.find((i) => i.id === key)
      if (existe) {
        return prev.map((i) => (i.id === key ? { ...i, cantidad: i.cantidad + 1 } : i))
      }
      return [...prev, { id: key, nombre: item.nombre, precio: item.precio, cantidad: 1, tipo }]
    })
  }

  const cambiarCantidad = (id: string, delta: number) => {
    setCarrito((prev) =>
      prev
        .map((i) => (i.id === id ? { ...i, cantidad: i.cantidad + delta } : i))
        .filter((i) => i.cantidad > 0)
    )
  }

  const subtotal = carrito.reduce((acc, item) => acc + item.precio * item.cantidad, 0)
  const iva = subtotal * 0.16
  const total = subtotal + iva

  const handleFinalizarCobro = () => {
    setModalCobro(false)
    setTicketEmitido(true)
  }

  return (
    <div className="space-y-4 animate-fade-in text-text">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Columna Izquierda: Teclado de Productos y Servicios Táctil */}
        <div className="lg:col-span-2 space-y-4">
          <div>
            <span className="text-xs font-bold text-text uppercase tracking-wider block mb-2">
              Tratamientos & Servicios Populares
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {DEMO_SERVICIOS.slice(0, 4).map((serv) => (
                <button
                  key={serv.id}
                  onClick={() => agregarItem({ id: serv.id, nombre: serv.nombre, precio: serv.precioBase }, 'servicio')}
                  className="p-3 rounded-2xl border border-border bg-surface hover:border-primary/40 hover:bg-surface-subtle transition-all text-left shadow-2xs cursor-pointer flex flex-col justify-between h-24"
                >
                  <span className="text-xs font-bold text-text line-clamp-2 leading-tight">
                    {serv.nombre}
                  </span>
                  <div className="flex items-center justify-between text-xs font-mono font-bold text-primary">
                    <span>${serv.precioBase}</span>
                    <Plus className="w-3.5 h-3.5" />
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div>
            <span className="text-xs font-bold text-text uppercase tracking-wider block mb-2">
              Productos Retail (Cuidado en Casa)
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {DEMO_PRODUCTOS.slice(0, 4).map((prod) => (
                <button
                  key={prod.id}
                  onClick={() => agregarItem({ id: prod.id, nombre: prod.nombre, precio: prod.precio }, 'producto')}
                  className="p-3 rounded-2xl border border-border bg-surface hover:border-primary/40 hover:bg-surface-subtle transition-all text-left shadow-2xs cursor-pointer flex flex-col justify-between h-24"
                >
                  <span className="text-xs font-bold text-text line-clamp-2 leading-tight">
                    {prod.nombre}
                  </span>
                  <div className="flex items-center justify-between text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400">
                    <span>${prod.precio}</span>
                    <Plus className="w-3.5 h-3.5" />
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Columna Derecha: Ticket de Caja en Vivo */}
        <div className="p-4 rounded-2xl bg-surface border border-border shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <span className="text-xs font-bold text-text flex items-center gap-1.5">
                <ShoppingCart className="w-4 h-4 text-primary" />
                Orden en Curso
              </span>
              <span className="text-[11px] text-text-muted">{carrito.length} items</span>
            </div>

            {/* Lista del Carrito */}
            <div className="divide-y divide-border-subtle my-2 max-h-48 overflow-y-auto pr-1">
              {carrito.length === 0 ? (
                <p className="text-xs text-text-muted text-center py-8">
                  El carrito está vacío. Haz clic en un servicio o producto para agregarlo.
                </p>
              ) : (
                carrito.map((item) => (
                  <div key={item.id} className="py-2.5 flex items-center justify-between gap-2 text-xs">
                    <div className="min-w-0 flex-1">
                      <span className="font-semibold text-text block truncate leading-snug">
                        {item.nombre}
                      </span>
                      <span className="text-[10px] text-text-muted font-mono">
                        ${item.precio} c/u
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={() => cambiarCantidad(item.id, -1)}
                        className="w-5 h-5 rounded bg-surface-subtle border border-border flex items-center justify-center text-text-muted hover:text-text cursor-pointer"
                      >
                        <Minus className="w-2.5 h-2.5" />
                      </button>
                      <span className="font-mono font-bold text-xs w-4 text-center">
                        {item.cantidad}
                      </span>
                      <button
                        onClick={() => cambiarCantidad(item.id, 1)}
                        className="w-5 h-5 rounded bg-surface-subtle border border-border flex items-center justify-center text-text-muted hover:text-text cursor-pointer"
                      >
                        <Plus className="w-2.5 h-2.5" />
                      </button>
                    </div>

                    <span className="font-mono font-bold text-text text-right w-12 shrink-0">
                      ${item.precio * item.cantidad}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Totales y Botón de Cobro */}
          <div className="pt-3 border-t border-border space-y-2">
            <div className="space-y-1 text-xs">
              <div className="flex justify-between text-text-muted">
                <span>Subtotal</span>
                <span className="font-mono">${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-text-muted">
                <span>IVA (16%)</span>
                <span className="font-mono">${iva.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm font-bold text-text pt-1 border-t border-border-subtle">
                <span>Total a Cobrar</span>
                <span className="font-mono text-primary text-base">${total.toFixed(2)}</span>
              </div>
            </div>

            <button
              disabled={carrito.length === 0}
              onClick={() => setModalCobro(true)}
              className="w-full py-2.5 rounded-xl bg-primary hover:bg-primary-hover disabled:opacity-40 text-white font-bold text-xs shadow-sm transition-all cursor-pointer flex items-center justify-center gap-2 mt-2"
            >
              <CreditCard className="w-4 h-4" />
              Cobrar Orden (${total.toFixed(2)})
            </button>
          </div>
        </div>
      </div>

      {/* Modal Simulado de Pago */}
      {modalCobro && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-surface rounded-2xl border border-border p-5 max-w-sm w-full space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <span className="font-bold text-sm text-text">Seleccionar Método de Cobro</span>
              <button onClick={() => setModalCobro(false)}>
                <X className="w-4 h-4 text-text-muted" />
              </button>
            </div>

            <div className="p-3 rounded-xl bg-surface-subtle border border-border text-center">
              <span className="text-[10px] uppercase font-bold text-text-muted block">Monto Total</span>
              <span className="text-2xl font-bold font-mono text-primary block mt-0.5">
                ${total.toFixed(2)}
              </span>
            </div>

            <div className="space-y-2">
              <button
                onClick={handleFinalizarCobro}
                className="w-full p-3 rounded-xl border border-border hover:border-primary/50 bg-surface flex items-center justify-between text-xs font-semibold cursor-pointer"
              >
                <span className="flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-primary" /> Tarjeta de Crédito / Débito
                </span>
                <span className="text-[10px] text-text-muted">Terminal POS</span>
              </button>

              <button
                onClick={handleFinalizarCobro}
                className="w-full p-3 rounded-xl border border-border hover:border-primary/50 bg-surface flex items-center justify-between text-xs font-semibold cursor-pointer"
              >
                <span className="flex items-center gap-2">
                  <Banknote className="w-4 h-4 text-emerald-600" /> Efectivo en Caja
                </span>
                <span className="text-[10px] text-text-muted">Apertura cajón</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Simulación de Ticket Emitido */}
      {ticketEmitido && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-surface rounded-2xl border border-border p-5 max-w-xs w-full space-y-4 shadow-xl text-center font-mono text-xs">
            <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 mx-auto flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-text">¡Venta Exitosa!</h4>
              <p className="text-[11px] text-text-muted mt-0.5">Ticket #00482 emitido correctamente</p>
            </div>

            <div className="p-3 bg-surface-subtle border border-dashed border-border rounded-xl text-left space-y-1 text-[11px]">
              <p className="text-center font-bold">NOVA CLINIC & WELLNESS</p>
              <p className="text-center text-[10px] text-text-muted">RFC: NCW-260101-9X1</p>
              <hr className="border-border my-1" />
              {carrito.map((i) => (
                <div key={i.id} className="flex justify-between">
                  <span className="truncate">{i.cantidad}x {i.nombre}</span>
                  <span>${i.precio * i.cantidad}</span>
                </div>
              ))}
              <hr className="border-border my-1" />
              <div className="flex justify-between font-bold text-xs">
                <span>TOTAL:</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>

            <button
              onClick={() => {
                setTicketEmitido(false)
                setCarrito([])
              }}
              className="w-full py-2 rounded-xl bg-primary text-white font-bold text-xs cursor-pointer"
            >
              Nueva Orden de Venta
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

