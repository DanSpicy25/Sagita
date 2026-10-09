import { Link } from 'react-router-dom'
import {
  Store,
  Check,
  Calendar,
  Utensils,
  Shirt,
  Pill,
  Flower2,
  ArrowRight,
  Clock,
  Layers,
} from 'lucide-react'
import { Button } from '@/components/ui'
import { useSector, SectorId } from '@/context/SectorContext'

interface VerticalIndustry {
  id: SectorId
  titulo: string
  subtitulo: string
  icono: typeof Store
  emoji: string
  terminoCita: string
  terminoCliente: string
  duracionPromedio: string
  bufferRecomendado: string
  flujoClave: string
  capacidadesDestacadas: string[]
  ejemploServicio: {
    nombre: string
    duracion: string
    tarifa: string
  }
}

const VERTICALES_SISTEMA: VerticalIndustry[] = [
  {
    id: 'gastronomia',
    titulo: 'Gastronomía',
    subtitulo: 'Comandas KDS a cocina, recetas con costeo BOM y control de mesas/salón',
    icono: Utensils,
    emoji: '🍔',
    terminoCita: 'Comanda / Mesa',
    terminoCliente: 'Comensal',
    duracionPromedio: '5 - 12 min',
    bufferRecomendado: 'Partida Cocina',
    flujoClave: 'Despacho directo a pantalla de cocina KDS, alertas de stock mínimo de proteínas y desglose automático de insumos por plato.',
    capacidadesDestacadas: [
      'KDS táctil en tiempo real con tiempos de preparación por partida',
      'Recetas BOM: descuento de gramos e insumos de carne/pan por venta',
      'Impresión de comandas térmicas por comanda, barra o mesa',
    ],
    ejemploServicio: {
      nombre: 'Combo Smash Burger Doble Trufada + Papas Rústicas',
      duracion: '8 min prep',
      tarifa: '$16.50',
    },
  },
  {
    id: 'retail',
    titulo: 'Retail / Moda',
    subtitulo: 'Matriz de tallas y colores, escaneo láser de código #PRD y probadores',
    icono: Shirt,
    emoji: '👗',
    terminoCita: 'Ticket Mostrador',
    terminoCliente: 'Comprador',
    duracionPromedio: '1 - 3 min',
    bufferRecomendado: 'Línea de Caja',
    flujoClave: 'Escaneo veloz de etiquetas con sensor antirrobo, control de inventario multialmacén y venta asistida por dependiente.',
    capacidadesDestacadas: [
      'Matriz multidimensional de tallas (XS a XXL) y variantes de color',
      'Lectura de código de barras #PRD por Bluetooth o cámara PWA',
      'Cobro instantáneo con tickets térmicos de 58mm y 80mm',
    ],
    ejemploServicio: {
      nombre: 'Chaqueta Denim Oversize Índigo (Talla M • Lavado Stone)',
      duracion: '1 min escaneo',
      tarifa: '$48.00',
    },
  },
  {
    id: 'farmacia',
    titulo: 'Farmacias',
    subtitulo: 'Dispensación ética, trazabilidad de lotes, vencimientos y recetas médicas',
    icono: Pill,
    emoji: '💊',
    terminoCita: 'Dispensación',
    terminoCliente: 'Paciente',
    duracionPromedio: '2 - 4 min',
    bufferRecomendado: 'Verificación Ética',
    flujoClave: 'Validación obligatoria de receta médica, bloqueo automático de lotes caducados y control de temperatura de almacenamiento.',
    capacidadesDestacadas: [
      'Trazabilidad por número de lote y semáforo de vencimiento',
      'Registro de cédula médica y verificación de receta en 1 clic',
      'Alertas de medicamentos controlados y sustitutos bioequivalentes',
    ],
    ejemploServicio: {
      nombre: 'Amoxicilina + Ácido Clavulánico 875/125mg (Lote #LT-8821)',
      duracion: '2 min verificación',
      tarifa: '$14.80',
    },
  },
  {
    id: 'spa',
    titulo: 'Spas & Clínicas',
    subtitulo: 'Control estricto de cabinas de relajación, terapeutas y aceites esenciales',
    icono: Flower2,
    emoji: '🌸',
    terminoCita: 'Cita / Sesión',
    terminoCliente: 'Cliente / Huésped',
    duracionPromedio: '60 - 90 min',
    bufferRecomendado: '+15 min (Sanitización)',
    flujoClave: 'La disponibilidad de cabina física y camilla condiciona la cita aunque el terapeuta esté libre. Consumo de insumos por sesión.',
    capacidadesDestacadas: [
      'Bloqueo simultáneo de cabina zen, terapeuta y aparatología',
      'Consumo protocolizado de aceites y toallas en ficha técnica',
      'Agenda con buffers de higienización automáticos entre turnos',
    ],
    ejemploServicio: {
      nombre: 'Ritual Masaje Hot Stones & Aromaterapia Zen',
      duracion: '60 min sesión',
      tarifa: '$75.00',
    },
  },
]

export interface PortalVerticalesShowcaseProps {
  onIrAReservas: () => void
}

export function PortalVerticalesShowcase({ onIrAReservas }: PortalVerticalesShowcaseProps) {
  const { sector, setSector, tokens, playTactileClick } = useSector()

  const verticalActual =
    VERTICALES_SISTEMA.find((v) => v.id === sector) || VERTICALES_SISTEMA[0]

  const handleSeleccionarVertical = (id: SectorId) => {
    playTactileClick()
    setSector(id)
  }

  return (
    <section id="sectores" className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16 border-t border-zinc-200/80 dark:border-zinc-800">
      <div className="text-center max-w-3xl mx-auto space-y-3 sm:space-y-4 mb-8 sm:mb-12">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-zinc-100 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 text-xs font-semibold uppercase tracking-wider border border-zinc-200/80 dark:border-zinc-800">
          <Store className="w-3.5 h-3.5" style={{ color: tokens.accentColor }} />
          <span>Herramientas que entienden tu industria</span>
        </div>

        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-zinc-900 dark:text-white tracking-tight leading-tight">
          Especializado para tu sector sin configuraciones complejas
        </h2>

        <p className="text-zinc-600 dark:text-zinc-400 text-xs sm:text-sm md:text-base leading-relaxed">
          Selecciona un sector para ver cómo se adaptan las ventas, el catálogo y las operaciones de tu negocio.
        </p>

        {/* ── Selector de Sectores (Pills Sincronizados con SectorContext) ── */}
        <div className="pt-2 flex items-center justify-center">
          <div className="inline-flex p-1.5 rounded-2xl bg-zinc-100 dark:bg-zinc-900/90 border border-zinc-200/80 dark:border-zinc-800 shadow-sm overflow-x-auto max-w-full gap-1.5">
            {VERTICALES_SISTEMA.map((vert) => {
              const isSelected = sector === vert.id
              const tituloPestana =
                vert.id === 'retail'
                  ? 'Retail / Moda'
                  : vert.id === 'spa'
                  ? 'Spas & Clínicas'
                  : vert.titulo
              return (
                <button
                  key={vert.id}
                  type="button"
                  onClick={() => handleSeleccionarVertical(vert.id)}
                  className={`px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-150 flex items-center gap-2 whitespace-nowrap cursor-pointer select-none ${
                    isSelected
                      ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 shadow-xs'
                      : 'text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white hover:bg-zinc-200/60 dark:hover:bg-zinc-800/60'
                  }`}
                >
                  <span>{vert.emoji}</span>
                  <span>{tituloPestana}</span>
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* ── Tarjeta de Presentación del Sector Activo (Sober Linear Style) ── */}
      <div
        className={`w-full max-w-7xl mx-auto rounded-2xl border border-zinc-200/90 dark:border-zinc-800 bg-white dark:bg-[#121214] p-6 sm:p-9 shadow-sm space-y-7 transition-all duration-300 ${tokens.radiusClass}`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-zinc-200/80 dark:border-zinc-800">
          <div className="flex items-center gap-3.5">
            <span
              className="text-3xl p-3 rounded-2xl bg-zinc-100 dark:bg-zinc-800/80 border border-zinc-200/80 dark:border-zinc-700 shadow-xs shrink-0"
            >
              {verticalActual.emoji}
            </span>
            <div>
              <h3 className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                <span>{verticalActual.titulo}</span>
                <span className="text-xs px-2 py-0.5 rounded-full font-mono bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 font-normal border border-zinc-200/80 dark:border-zinc-700">
                  Sincronizado
                </span>
              </h3>
              <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">{verticalActual.subtitulo}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link to="/mostrador">
              <Button
                size="sm"
                variant="primary"
                className="gap-1.5 text-xs bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white"
              >
                <span>Probar Mostrador POS</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </Link>

            <Link to="/demo">
              <Button size="sm" variant="outline" className="gap-1.5 text-xs text-zinc-700 dark:text-zinc-300 border-zinc-200/80 dark:border-zinc-800">
                <span>Demo Center</span>
              </Button>
            </Link>
          </div>
        </div>

        {/* Grid de 4 Parámetros Clave del Sector */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200/80 dark:border-zinc-800/80 space-y-1">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 block">
              Unidad Operativa
            </span>
            <strong className="text-zinc-900 dark:text-white text-sm font-bold block">{verticalActual.terminoCita}</strong>
          </div>

          <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200/80 dark:border-zinc-800/80 space-y-1">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 block">
              Término Usuario
            </span>
            <strong className="text-zinc-900 dark:text-white text-sm font-bold block">{verticalActual.terminoCliente}</strong>
          </div>

          <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200/80 dark:border-zinc-800/80 space-y-1">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 block">
              Tiempo Promedio
            </span>
            <strong className="text-zinc-900 dark:text-white text-sm font-bold block">{verticalActual.duracionPromedio}</strong>
          </div>

          <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200/80 dark:border-zinc-800/80 space-y-1">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 block">
              Control Específico
            </span>
            <strong className="text-sm font-bold block text-zinc-900 dark:text-white">
              {verticalActual.bufferRecomendado}
            </strong>
          </div>
        </div>

        {/* Flujo Operativo y Ficha de Ejemplo Sectorial Real */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
          <div className="space-y-4">
            <h4 className="text-xs sm:text-sm font-bold text-zinc-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
              <Layers className="w-4 h-4 text-zinc-700 dark:text-zinc-300" />
              <span>Flujo Operativo Especializado</span>
            </h4>
            <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
              {verticalActual.flujoClave}
            </p>

            <ul className="space-y-2 pt-1">
              {verticalActual.capacidadesDestacadas.map((cap, idx) => (
                <li key={idx} className="flex items-start gap-2 text-xs text-zinc-700 dark:text-zinc-300">
                  <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                  <span>{cap}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Tarjeta de Servicio / Ítem de Ejemplo Sectorial Real */}
          <div className="p-5 rounded-xl bg-zinc-50 dark:bg-zinc-900/80 border border-zinc-200/80 dark:border-zinc-800 space-y-4 shadow-xs">
            <div className="flex items-center justify-between text-xs pb-2 border-b border-zinc-200/80 dark:border-zinc-800">
              <span className="font-semibold text-zinc-500 dark:text-zinc-400">Ejemplo de catálogo</span>
              <span className="font-mono font-bold text-sm text-zinc-900 dark:text-white">
                {verticalActual.ejemploServicio.tarifa}
              </span>
            </div>

            <div className="space-y-1">
              <h5 className="font-bold text-zinc-900 dark:text-white text-sm sm:text-base">
                {verticalActual.ejemploServicio.nombre}
              </h5>
              <div className="flex items-center gap-3 text-xs text-zinc-500 dark:text-zinc-400">
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  {verticalActual.ejemploServicio.duracion}
                </span>
                <span>•</span>
                <span className="font-medium text-zinc-700 dark:text-zinc-300">
                  {verticalActual.bufferRecomendado}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={onIrAReservas}
              className="w-full py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white font-semibold text-xs shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Ver en el Motor de Operaciones en Vivo</span>
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
