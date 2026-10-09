import { useState } from 'react'
import {
  Search,
  Phone,
  Mail,
  ShieldCheck,
  Star,
  FileText,
} from 'lucide-react'
import { DEMO_CLIENTES, DemoCliente, type DeviceMode } from '../demoData'

export function DemoCustomers({ deviceMode: _deviceMode }: { deviceMode?: DeviceMode } = {}) {
  const [busqueda, setBusqueda] = useState('')
  const [clienteSeleccionado, setClienteSeleccionado] = useState<DemoCliente>(DEMO_CLIENTES[0])

  const clientesFiltrados = DEMO_CLIENTES.filter((c) => {
    if (!busqueda.trim()) return true
    const q = busqueda.toLowerCase().trim()
    return (
      c.nombre.toLowerCase().includes(q) ||
      c.email.toLowerCase().includes(q) ||
      c.etiquetas.some((t) => t.toLowerCase().includes(q))
    )
  })

  return (
    <div className="space-y-4 animate-fade-in text-text">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Columna Izquierda: Directorio & Búsqueda */}
        <div className="space-y-3">
          <div className="relative">
            <Search className="w-4 h-4 text-text-muted absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar por nombre o etiqueta (ej. VIP)..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-border bg-surface text-text placeholder:text-text-muted/70 focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div className="space-y-1.5 max-h-[380px] overflow-y-auto pr-1">
            {clientesFiltrados.map((cliente) => {
              const esSeleccionado = clienteSeleccionado.id === cliente.id

              return (
                <div
                  key={cliente.id}
                  onClick={() => setClienteSeleccionado(cliente)}
                  className={[
                    'p-3 rounded-2xl border transition-all cursor-pointer flex items-center gap-3 text-xs',
                    esSeleccionado
                      ? 'border-primary bg-primary-soft/30 shadow-2xs'
                      : 'border-border bg-surface hover:border-border-hover',
                  ].join(' ')}
                >
                  <img
                    src={cliente.avatar}
                    alt={cliente.nombre}
                    className="w-9 h-9 rounded-full object-cover shrink-0 border border-border"
                  />

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <span className="font-bold text-text truncate">{cliente.nombre}</span>
                      {cliente.etiquetas.includes('VIP') && (
                        <Star className="w-3 h-3 text-amber-500 fill-amber-500 shrink-0" />
                      )}
                    </div>
                    <span className="text-[11px] text-text-muted block truncate">
                      {cliente.telefono}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Columna Derecha: Expediente 360° del Cliente */}
        <div className="md:col-span-2 p-5 rounded-2xl bg-surface border border-border shadow-2xs space-y-5">
          {/* Cabecera del Expediente */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-border">
            <div className="flex items-center gap-3">
              <img
                src={clienteSeleccionado.avatar}
                alt={clienteSeleccionado.nombre}
                className="w-12 h-12 rounded-2xl object-cover border border-border shadow-2xs"
              />
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-base text-text">{clienteSeleccionado.nombre}</h3>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 font-bold">
                    Expediente Activo
                  </span>
                </div>
                <div className="flex items-center gap-3 text-xs text-text-muted mt-1">
                  <span className="flex items-center gap-1">
                    <Phone className="w-3 h-3 text-primary" /> {clienteSeleccionado.telefono}
                  </span>
                  <span className="hidden sm:inline">•</span>
                  <span className="hidden sm:flex items-center gap-1">
                    <Mail className="w-3 h-3 text-primary" /> {clienteSeleccionado.email}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1.5 flex-wrap">
              {clienteSeleccionado.etiquetas.map((tag) => (
                <span
                  key={tag}
                  className="text-[10px] px-2 py-0.5 rounded-lg bg-surface-subtle border border-border font-semibold text-text"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>

          {/* Métricas de Recurrencia y Compras */}
          <div className="grid grid-cols-3 gap-3">
            <div className="p-3 rounded-xl bg-surface-subtle border border-border text-center">
              <span className="text-[10px] font-bold uppercase text-text-muted block">Total Invertido</span>
              <span className="text-base font-bold font-mono text-text mt-0.5 block">
                ${clienteSeleccionado.totalGastado}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-surface-subtle border border-border text-center">
              <span className="text-[10px] font-bold uppercase text-text-muted block">Citas Asistidas</span>
              <span className="text-base font-bold font-mono text-primary mt-0.5 block">
                {clienteSeleccionado.citasHistorial}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-surface-subtle border border-border text-center">
              <span className="text-[10px] font-bold uppercase text-text-muted block">Última Visita</span>
              <span className="text-xs font-semibold text-text mt-1 block">
                {clienteSeleccionado.ultimaVisita}
              </span>
            </div>
          </div>

          {/* Historial Clínico & Notas Confidenciales */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-text uppercase tracking-wider flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-primary" />
              Historial de Procedimientos Recientes
            </h4>

            <div className="p-3.5 rounded-xl bg-surface-subtle border border-border text-xs space-y-2">
              <div className="flex items-center justify-between text-[11px] text-text-muted">
                <span className="font-semibold text-text">Tratamiento Facial Glow Completo</span>
                <span>12 Oct 2026 • Dra. Valeria Montes</span>
              </div>
              <p className="text-text-muted text-[11px] leading-relaxed">
                Paciente presentó excelente respuesta a la mascarilla hidroplástica. Se recomendó continuar con Serum Ácido Hialurónico en rutina matutina. Sin reacciones adversas.
              </p>
              <div className="pt-2 border-t border-border-subtle flex items-center justify-between text-[10px]">
                <span className="text-emerald-600 font-semibold flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" /> Consentimiento firmado electrónicamente
                </span>
                <span className="font-mono font-bold">$75.00 Pagado</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

