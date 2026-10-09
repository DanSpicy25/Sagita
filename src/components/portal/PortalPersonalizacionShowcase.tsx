import { useState } from 'react'
import {
  Palette,
  Check,
  Calendar,
  Users,
} from 'lucide-react'
import { useSector } from '@/context/SectorContext'

interface PresetColor {
  id: string
  nombre: string
  hex: string
  industria: string
}

const PRESET_COLORS: PresetColor[] = [
  { id: 'indigo', nombre: 'Índigo Sagitta', hex: '#6366f1', industria: 'Moderno & Tech' },
  { id: 'emerald', nombre: 'Esmeralda Vital', hex: '#10b981', industria: 'Salud, Spa & Bienestar' },
  { id: 'violet', nombre: 'Violeta Luxe', hex: '#8b5cf6', industria: 'Estética & Belleza Premium' },
  { id: 'rose', nombre: 'Rosa Carmín', hex: '#f43f5e', industria: 'Peluquería & Salones' },
  { id: 'ocean', nombre: 'Azul Océano', hex: '#0284c7', industria: 'Clínicas & Consultorios' },
  { id: 'amber', nombre: 'Ámbar Cálido', hex: '#f59e0b', industria: 'Barberías & Masajes' },
  { id: 'slate', nombre: 'Slate Minimal', hex: '#334155', industria: 'Despachos & Consultoría' },
]

export function PortalPersonalizacionShowcase() {
  const { sector, tokens, vocabulario, mockItems } = useSector()
  const [selectedColor, setSelectedColor] = useState<PresetColor>(
    PRESET_COLORS.find((preset) => preset.id === 'slate') || PRESET_COLORS[0]
  )
  const [terminoCita, setTerminoCita] = useState<'Cita' | 'Turno' | 'Reserva'>('Cita')
  const [terminoCliente, setTerminoCliente] = useState<'Cliente' | 'Paciente' | 'Socio'>('Cliente')

  return (
    <section id="personalizacion" className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16 border-t border-zinc-200/80 dark:border-zinc-800">
      <div className="text-center max-w-3xl mx-auto space-y-4 mb-12 sm:mb-16">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-soft text-primary text-xs font-semibold uppercase tracking-wider border border-primary/20">
          <Palette className="w-3.5 h-3.5" />
          <span>Marca Blanca & Adaptabilidad</span>
        </div>
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-text tracking-tight">
          El software que se adapta a tu negocio, no al revés
        </h2>
        <p className="text-text-muted text-sm sm:text-base leading-relaxed">
          Experimenta en vivo cómo Sagitta transforma su paleta cromática y su vocabulario operativo. Configura la plataforma para que hable el idioma exacto de tu sector y tus clientes.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Controles de Configuración Interactiva (Columna Izquierda: 5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* 1. Selector de Color de Marca */}
          <div className="p-5 rounded-3xl bg-surface border border-border shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-text uppercase tracking-wider flex items-center gap-1.5">
                <Palette className="w-4 h-4 text-primary" />
                Color de Acento de Marca
              </span>
              <span className="text-xs font-mono font-semibold" style={{ color: selectedColor.hex }}>
                {selectedColor.hex}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1">
              {PRESET_COLORS.map((color) => {
                const isSelected = selectedColor.id === color.id
                return (
                  <button
                    key={color.id}
                    type="button"
                    onClick={() => setSelectedColor(color)}
                    className={`p-2.5 rounded-2xl border text-left transition-all flex items-center gap-2.5 ${
                      isSelected
                        ? 'border-primary ring-2 ring-primary/20 bg-surface-elevated'
                        : 'border-border bg-surface-subtle hover:border-border-subtle'
                    }`}
                  >
                    <span
                      className="w-4 h-4 rounded-full shrink-0 shadow-xs flex items-center justify-center text-[10px] text-white"
                      style={{ backgroundColor: color.hex }}
                    >
                      {isSelected && <Check className="w-2.5 h-2.5" />}
                    </span>
                    <div className="min-w-0">
                      <span className="text-[11px] font-bold text-text block truncate leading-tight">
                        {color.nombre.split(' ')[0]}
                      </span>
                      <span className="text-[9px] text-text-muted block truncate">
                        {color.industria.split(',')[0]}
                      </span>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          {/* 2. Selector de Vocabulario de Citas */}
          <div className="p-5 rounded-3xl bg-surface border border-border shadow-xs space-y-3">
            <span className="text-xs font-bold text-text uppercase tracking-wider flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-primary" />
              ¿Cómo llamas a las atenciones?
            </span>
            <div className="grid grid-cols-3 gap-2">
              {(['Cita', 'Turno', 'Reserva'] as const).map((termino) => (
                <button
                  key={termino}
                  type="button"
                  onClick={() => setTerminoCita(termino)}
                  className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-all text-center ${
                    terminoCita === termino
                      ? 'bg-primary text-primary-contrast border-primary shadow-xs'
                      : 'bg-surface-subtle text-text-muted border-border hover:text-text'
                  }`}
                >
                  {termino}s
                </button>
              ))}
            </div>
          </div>

          {/* 3. Selector de Vocabulario de Clientes */}
          <div className="p-5 rounded-3xl bg-surface border border-border shadow-xs space-y-3">
            <span className="text-xs font-bold text-text uppercase tracking-wider flex items-center gap-1.5">
              <Users className="w-4 h-4 text-primary" />
              ¿Cómo llamas a tus usuarios?
            </span>
            <div className="grid grid-cols-3 gap-2">
              {(['Cliente', 'Paciente', 'Socio'] as const).map((termino) => (
                <button
                  key={termino}
                  type="button"
                  onClick={() => setTerminoCliente(termino)}
                  className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-all text-center ${
                    terminoCliente === termino
                      ? 'bg-primary text-primary-contrast border-primary shadow-xs'
                      : 'bg-surface-subtle text-text-muted border-border hover:text-text'
                  }`}
                >
                  {termino}s
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Tarjeta de Previsualización Dinámica (Columna Derecha: 7 cols) */}
        <div className="lg:col-span-7">
          <div className="relative rounded-3xl border border-border bg-surface-elevated p-6 sm:p-8 shadow-xl space-y-6">
            {/* Header del Negocio Simulado */}
            <div className="flex items-center justify-between pb-4 border-b border-border-subtle">
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-2xl flex items-center justify-center text-white font-black text-base shadow-sm transition-colors duration-300"
                  style={{ backgroundColor: selectedColor.hex }}
                >
                  S
                </div>
                <div>
                  <h3 className="font-bold text-text text-base">Sagitta • {tokens.nombre}</h3>
                  <p className="text-xs text-text-muted">Portal de autoservicio y gestión</p>
                </div>
              </div>

              <span
                className="text-xs font-semibold px-3 py-1 rounded-full text-white transition-colors duration-300"
                style={{ backgroundColor: selectedColor.hex }}
              >
                Vista previa
              </span>
            </div>

            {/* Simulación de Cita/Turno con la terminología y color elegidos */}
            <div className="p-5 rounded-2xl bg-surface border border-border space-y-4 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-text-muted">
                  {sector === 'spa' ? `Confirmación de ${terminoCita}` : `Vista previa de ${vocabulario.singularUnidad.toLowerCase()}`}
                </span>
                <span className="text-xs font-mono font-semibold text-emerald-600 dark:text-emerald-400">
                  {sector === 'spa' ? 'Estado: Confirmada' : 'Catálogo activo'}
                </span>
              </div>

              <div className="space-y-1">
                <h4 className="text-lg font-bold text-text">
                  {mockItems[0]?.nombre || 'Artículo de ejemplo'}
                </h4>
                <p className="text-xs text-text-muted">
                  Categoría: {mockItems[0]?.categoria || 'General'} • Código: {mockItems[0]?.codigo || '—'}
                </p>
              </div>

              {/* Ficha del Cliente/Paciente/Socio */}
              <div className="p-3.5 rounded-xl bg-surface-subtle border border-border-subtle flex items-center justify-between text-xs">
                <div>
                  <span className="text-[11px] text-text-muted block">Datos del {terminoCliente}:</span>
                  <strong className="text-text">Santiago Valenzuela</strong>
                </div>
                <div className="text-right">
                  <span className="text-[11px] text-text-muted block">Precio:</span>
                  <strong className="text-text font-mono">${(mockItems[0]?.precio || 0).toFixed(2)}</strong>
                </div>
              </div>

              {/* Botón de Acción simulado con el color reactivo */}
              <button
                type="button"
                className="w-full py-3 rounded-xl font-bold text-xs text-white shadow-sm transition-all duration-300 flex items-center justify-center gap-2"
                style={{ backgroundColor: selectedColor.hex }}
              >
                <span>{sector === 'spa' ? `Confirmar ${terminoCita}` : `Añadir a ${vocabulario.singularUnidad.toLowerCase()}`}</span>
              </button>
            </div>

            <p className="text-center text-xs text-text-muted">
              ✨ El cambio de terminología aplica en todos los botones, notificaciones de WhatsApp, tickets térmicos y menús del sistema.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
