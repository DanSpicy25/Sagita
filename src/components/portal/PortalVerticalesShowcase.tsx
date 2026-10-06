import { Link } from 'react-router-dom'
import {
  Store,
  Check,
  ShoppingCart,
  Calendar,
  Package,
} from 'lucide-react'
import { Button } from '@/components/ui'

export interface PortalVerticalesShowcaseProps {
  onIrAReservas: () => void
}

export function PortalVerticalesShowcase({ onIrAReservas }: PortalVerticalesShowcaseProps) {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full space-y-12">
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 text-xs font-semibold uppercase tracking-wider">
          <Store className="w-3.5 h-3.5" />
          <span>Adaptable a Todo Comercio</span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white">
          Una Sola Plataforma, Infinitos Modelos de Negocio
        </h2>
        <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base leading-relaxed">
          Configura Sagitta en segundos según el rubro de cada cliente. Desde la rapidez de una hamburguesería hasta la elegancia de una clínica o spa.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* 1. Comida Rápida */}
        <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold text-xl">
              🍔
            </div>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white">
              Puestos de Comida Rápida & Food Trucks
            </h3>
            <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
              Operación ultrarrápida para despachar pedidos sin fricción. Pensado para ambientes con alta rotación y conexiones inestables.
            </p>
            <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-500" />
                <span>Tickets de comanda térmica automáticos para cocina</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-500" />
                <span>Cálculo automático de vuelto en efectivo y múltiples divisas</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-500" />
                <span>Conexión directa por Bluetooth a impresoras portátiles 58mm</span>
              </li>
            </ul>
          </div>

          <Link to="/ventas">
            <Button className="w-full bg-amber-600 hover:bg-amber-700 text-white flex items-center justify-center gap-2">
              <ShoppingCart className="w-4 h-4" />
              <span>Probar Flujo de Venta Rápida</span>
            </Button>
          </Link>
        </div>

        {/* 2. Salones de Belleza */}
        <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-pink-100 dark:bg-pink-950/60 text-pink-600 dark:text-pink-400 flex items-center justify-center font-bold text-xl">
              ✂️
            </div>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white">
              Salones de Belleza, Barberías & Spas
            </h3>
            <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
              Agendamiento inteligente para estilistas, control de turnos, venta de productos de cuidado y fidelización de clientes.
            </p>
            <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-500" />
                <span>Portal web de reservas sin registro obligatorio</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-500" />
                <span>Recordatorios instantáneos por WhatsApp y Google Calendar</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-500" />
                <span>Comisiones por profesional y servicios extras combinables</span>
              </li>
            </ul>
          </div>

          <button
            type="button"
            onClick={onIrAReservas}
            className="w-full py-2.5 px-4 rounded-xl bg-pink-600 hover:bg-pink-700 text-white text-sm font-bold flex items-center justify-center gap-2 transition-colors shadow-sm cursor-pointer"
          >
            <Calendar className="w-4 h-4" />
            <span>Ver Wizard de Citas en Vivo</span>
          </button>
        </div>

        {/* 3. Minimarkets y Retail */}
        <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-xl">
              🏪
            </div>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white">
              Minimarkets, Bodegas & Tiendas Retail
            </h3>
            <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
              Control milimétrico del stock, escaneo de códigos de barra y cierre de caja diario con alertas de reposición.
            </p>
            <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-500" />
                <span>Identificadores de inventario #PRD-XXXX y códigos SKU/EAN</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-500" />
                <span>Caja registradora con apertura de gaveta monedero</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-500" />
                <span>Historial de movimientos: compras, ventas, mermas y ajustes</span>
              </li>
            </ul>
          </div>

          <Link to="/inventario">
            <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center gap-2">
              <Package className="w-4 h-4" />
              <span>Explorar Módulo de Inventario</span>
            </Button>
          </Link>
        </div>

        {/* 4. Clínicas y Consultorios */}
        <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-xl">
              🏥
            </div>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white">
              Clínicas, Consultorios & Servicios
            </h3>
            <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
              Gestión integral de citas médicas o profesionales con historial clínico/cliente y emisión de comprobantes.
            </p>
            <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-500" />
                <span>Control de salas, boxes y equipamiento médico asignable</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-500" />
                <span>Ficha y perfil de cliente con notas y citas anteriores</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-500" />
                <span>Descarga de comprobantes en PDF con firma y datos de marca</span>
              </li>
            </ul>
          </div>

          <Link to="/citas">
            <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center gap-2">
              <Calendar className="w-4 h-4" />
              <span>Ver Panel de Agenda Médica</span>
            </Button>
          </Link>
        </div>
      </div>
    </section>
  )
}
