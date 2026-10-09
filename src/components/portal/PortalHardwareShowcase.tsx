import { Link } from 'react-router-dom'
import {
  Printer,
  Receipt,
  Barcode,
  Laptop,
  ShoppingCart,
} from 'lucide-react'
import { Button } from '@/components/ui'

export function PortalHardwareShowcase() {
  return (
    <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16 space-y-8">
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-100 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 text-xs font-semibold uppercase tracking-wider border border-zinc-200 dark:border-zinc-800">
          <Printer className="w-3.5 h-3.5" />
          <span>Conectividad Periférica Industrial</span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white">
          Hardware & Punto de Venta Integrado
        </h2>
        <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base leading-relaxed">
          Sagitta fue programado para tablets y computadoras táctiles, eliminando la necesidad de costosos controladores propietarios. Imprime por Bluetooth o USB y opera cajones monedero directamente desde la web.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="w-12 h-12 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 flex items-center justify-center">
            <Printer className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-lg text-slate-900 dark:text-white">
            Impresión ESC/POS 58mm & 80mm
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            Tickets térmicos personalizables con logo de la marca, encabezados, desglose de ítems con ID #PRD y pie de recibo. Soporte nativo para 32 y 48 columnas.
          </p>
          <div className="pt-2 text-xs font-mono text-zinc-600 dark:text-zinc-400">
            Web Bluetooth & USB Direct
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="w-12 h-12 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 flex items-center justify-center">
            <Receipt className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-lg text-slate-900 dark:text-white">
            Apertura de Cajón Monedero
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            Disparo de pulso estándar por puerto RJ11 (Pin 2 / Pin 5) con comandos de escape binarios que abren la gaveta de dinero automáticamente al registrar un cobro en efectivo.
          </p>
          <div className="pt-2 text-xs font-mono text-zinc-600 dark:text-zinc-400">
            Pulso ESC p 0 25 250
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="w-12 h-12 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 flex items-center justify-center">
            <Barcode className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-lg text-slate-900 dark:text-white">
            Lectores de Barras HID & EAN-13
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            Reconocimiento de lectores láser USB y pistolas Bluetooth en modo emulación de teclado con debounce ultrarrápido (&lt;50ms) y carga automática al carrito POS.
          </p>
          <div className="pt-2 text-xs font-mono text-zinc-600 dark:text-zinc-400">
            EAN-13 • UPC • CODE128
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="w-12 h-12 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
            <Laptop className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-lg text-slate-900 dark:text-white">
            PWA Táctil para Tablets & Offline
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            Diseño optimizado para tablets Android de 10 pulgadas y iPads. Botones táctiles generosos, teclado numérico incorporado y persistencia en LocalStorage ante cortes de energía.
          </p>
          <div className="pt-2 text-xs font-mono text-amber-600 dark:text-amber-400">
            100% Responsive & PWA Ready
          </div>
        </div>
      </div>

      <div className="bg-zinc-900 dark:bg-zinc-900/70 text-zinc-100 rounded-2xl p-6 sm:p-10 text-center space-y-6 border border-zinc-800 shadow-sm">
        <h3 className="text-2xl sm:text-3xl font-black">
          ¿Quieres probar tu impresora térmica o lector ahora mismo?
        </h3>
        <p className="text-zinc-400 text-sm max-w-2xl mx-auto leading-relaxed">
          Accede a nuestro laboratorio interactivo de hardware donde puedes enlazar dispositivos por Bluetooth, imprimir tickets de prueba formateados y verificar el disparo de gaveta.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-4">
          <Link to="/hardware">
            <Button size="lg" className="bg-zinc-100 hover:bg-white text-zinc-900 px-8 shadow-sm">
              <Printer className="w-4 h-4 mr-2" />
              <span>Abrir Laboratorio de Hardware</span>
            </Button>
          </Link>
          <Link to="/ventas">
            <Button size="lg" variant="outline" className="border-zinc-700 text-zinc-200 hover:bg-zinc-800">
              <ShoppingCart className="w-4 h-4 mr-2" />
              <span>Probar en Punto de Venta (POS)</span>
            </Button>
          </Link>
        </div>
      </div>
    </section>
  )
}
