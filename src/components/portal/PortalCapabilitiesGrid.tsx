import {
  CalendarDays,
  Printer,
  Users,
  Package,
  ConciergeBell,
  Palette,
  Check,
  Zap,
} from 'lucide-react'

export function PortalCapabilitiesGrid() {
  const capabilities = [
    {
      id: 'agenda',
      icon: CalendarDays,
      badge: 'Cero Choques de Horario',
      titulo: 'Agenda Inteligente con Tiempos de Amortiguación',
      descripcion:
        'Configura tiempos de preparación y transición entre atenciones. Evita que un retraso menor altere el ritmo de trabajo y la experiencia de tus clientes.',
      detalles: [
        'Vistas diaria, semanal y mensual adaptable a pantalla',
        'Buffers de preparación configurables por servicio',
        'Exportación nativa .ICS y enlace dinámico a Google Calendar',
      ],
      colorAccent: 'text-primary bg-primary-soft border-primary/20',
    },
    {
      id: 'pos',
      icon: Printer,
      badge: 'Hardware Nativo',
      titulo: 'Punto de Venta POS & Tickets Térmicos Bluetooth',
      descripcion:
        'Cobra en segundos desde cualquier tablet o laptop. Conexión nativa con impresoras térmicas de 58mm y 80mm vía Web Bluetooth/USB y apertura automática de gaveta de dinero.',
      detalles: [
        'Protocolo binario ESC/POS estándar de la industria',
        'Disparo de pulso para cajón monedero (RJ11 Pin 2/5)',
        'Cobro combinado: Efectivo, Tarjeta, Transferencia y Crédito',
      ],
      colorAccent: 'text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    },
    {
      id: 'crm',
      icon: Users,
      badge: 'Fidelización Activa',
      titulo: 'CRM 360° e historial de clientes',
      descripcion:
        'Conoce mejor a quienes vuelven: consulta sus preferencias, compras anteriores, notas y frecuencia de visita desde un solo lugar.',
      detalles: [
        'Historial de compras, servicios y visitas previas',
        'Notas y preferencias visibles para el equipo',
        'Recordatorios automáticos de seguimiento vía WhatsApp',
      ],
      colorAccent: 'text-zinc-700 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700',
    },
    {
      id: 'inventario',
      icon: Package,
      badge: 'Control de Costos',
      titulo: 'Inventario con Umbral de Reorden & Recetas BOM',
      descripcion:
        'Distingue entre productos de venta y consumibles de uso interno. Recibe alertas antes de quedarte sin existencias.',
      detalles: [
        'Punto de reorden y cálculo de stock crítico',
        'Descuento automático de insumos al completar un servicio',
        'Identificador universal con código de barra #PRD',
      ],
      colorAccent: 'text-amber-600 dark:text-amber-400 bg-amber-500/10 border-amber-500/20',
    },
    {
      id: 'recepcion',
      icon: ConciergeBell,
      badge: 'Atención en Vivo',
      titulo: 'Recepción & Cola de Espera para Clientes Walk-in',
      descripcion:
        'Gestiona la afluencia espontánea en mostrador con un cronómetro de minutos en espera, asignación ágil de profesional y pase directo a la estación de cobro.',
      detalles: [
        'Diferenciación entre citas programadas y clientes sin cita',
        'Verificación de capacidad y disponibilidad',
        'Control de no-shows y reubicación en lista de espera',
      ],
      colorAccent: 'text-rose-600 dark:text-rose-400 bg-rose-500/10 border-rose-500/20',
    },
    {
      id: 'marca_blanca',
      icon: Palette,
      badge: 'Tu Marca, Tus Reglas',
      titulo: 'Marca Blanca Total, Multi-Sede & Personalización',
      descripcion:
        'Sagitta adopta los colores, el logotipo y el vocabulario de tu establecimiento para que cada equipo trabaje con términos familiares.',
      detalles: [
        '7 paletas cromáticas predefinidas o color hexadecimal propio',
        'Personalización de vocabulario sin alterar la lógica de negocio',
        'Conmutación instantánea entre sucursales y sedes de la empresa',
      ],
      colorAccent: 'text-zinc-700 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700',
    },
  ]

  return (
    <section id="capacidades" className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16 border-t border-zinc-200/80 dark:border-zinc-800">
      <div className="text-center max-w-3xl mx-auto space-y-4 mb-12 sm:mb-16">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-soft text-primary text-xs font-semibold uppercase tracking-wider border border-primary/20">
          <Zap className="w-3.5 h-3.5" />
          <span>Capacidades del Sistema</span>
        </div>
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-text tracking-tight">
          La potencia de un ERP, la sencillez de una app táctil
        </h2>
        <p className="text-text-muted text-sm sm:text-base leading-relaxed">
          Cada herramienta fue concebida para resolver los problemas reales que enfrentan los dueños de negocios día a día: agendas desbordadas, errores de cobro y falta de control de inventario.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-7">
        {capabilities.map((cap) => {
          const Icon = cap.icon
          return (
            <div
              key={cap.id}
              className="group p-6 sm:p-7 rounded-3xl bg-surface border border-border shadow-xs hover:border-primary/40 hover:shadow-md transition-all duration-300 flex flex-col justify-between space-y-5"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border ${cap.colorAccent}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-surface-subtle text-text-muted border border-border">
                    {cap.badge}
                  </span>
                </div>

                <h3 className="text-xl font-bold text-text group-hover:text-primary transition-colors">
                  {cap.titulo}
                </h3>

                <p className="text-xs sm:text-sm text-text-muted leading-relaxed">
                  {cap.descripcion}
                </p>
              </div>

              <div className="pt-4 border-t border-border-subtle space-y-2">
                {cap.detalles.map((det, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-xs text-text-muted">
                    <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                    <span className="leading-tight">{det}</span>
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
