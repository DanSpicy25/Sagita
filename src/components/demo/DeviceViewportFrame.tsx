import React from 'react'
import {
  Monitor,
  Tablet,
  Smartphone,
  Lock,
  Wifi,
  Battery,
} from 'lucide-react'
import { DeviceMode, DemoModuleId } from './demoData'

export interface DeviceViewportFrameProps {
  device?: DeviceMode
  onDeviceChange?: (device: DeviceMode) => void
  mode?: DeviceMode
  onChangeMode?: (device: DeviceMode) => void
  activeModuleId?: DemoModuleId
  title?: string
  className?: string
  children: React.ReactNode
}

export function DeviceViewportFrame({
  device,
  onDeviceChange,
  mode,
  onChangeMode,
  activeModuleId = 'dashboard',
  title,
  className = '',
  children,
}: DeviceViewportFrameProps) {
  const currentDevice: DeviceMode = mode || device || 'desktop'
  const handleDeviceChange = (dev: DeviceMode) => {
    onDeviceChange?.(dev)
    onChangeMode?.(dev)
  }
  const simulatedUrl = title
    ? `https://demo.sagitta.app/${title.toLowerCase().replace(/[^a-z0-9]/g, '-')}`
    : `https://demo.sagitta.app/${activeModuleId}`

  return (
    <div className={`space-y-3 ${className}`}>
      {/* ── Barra Superior de Selección de Dispositivo ── */}
      <div className="flex items-center justify-between gap-3 p-2.5 rounded-2xl bg-surface border border-border shadow-2xs">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-text-muted hidden sm:inline ml-1">
            Vista Previa en Dispositivo:
          </span>

          <div className="inline-flex p-1 rounded-xl bg-surface-subtle border border-border">
            <button
              type="button"
              onClick={() => handleDeviceChange('desktop')}
              className={[
                'px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer',
                currentDevice === 'desktop'
                  ? 'bg-surface text-primary shadow-2xs font-bold'
                  : 'text-text-muted hover:text-text',
              ].join(' ')}
              title="Ver en pantalla de escritorio (PC/Mac)"
            >
              <Monitor className="w-3.5 h-3.5" />
              <span>Escritorio</span>
            </button>

            <button
              type="button"
              onClick={() => handleDeviceChange('tablet')}
              className={[
                'px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer',
                currentDevice === 'tablet'
                  ? 'bg-surface text-primary shadow-2xs font-bold'
                  : 'text-text-muted hover:text-text',
              ].join(' ')}
              title="Ver en iPad / Tablet"
            >
              <Tablet className="w-3.5 h-3.5" />
              <span>Tablet</span>
            </button>

            <button
              type="button"
              onClick={() => handleDeviceChange('mobile')}
              className={[
                'px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer',
                currentDevice === 'mobile'
                  ? 'bg-surface text-primary shadow-2xs font-bold'
                  : 'text-text-muted hover:text-text',
              ].join(' ')}
              title="Ver en Smartphone (iOS / Android)"
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>Móvil</span>
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-text-muted">
          <span className="text-[11px] font-mono hidden md:inline truncate max-w-[220px]">
            {simulatedUrl}
          </span>
        </div>
      </div>

      {/* ── Contenedor según Dispositivo ── */}
      <div className="flex justify-center transition-all duration-300">
        {currentDevice === 'desktop' && (
          /* Marco de Navegador de Escritorio */
          <div className="w-full rounded-2xl border border-border bg-surface shadow-card overflow-hidden">
            {/* Browser Chrome Header */}
            <div className="px-4 py-2.5 bg-surface-subtle border-b border-border flex items-center justify-between text-xs text-text-muted">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-red-400" />
                <span className="w-3 h-3 rounded-full bg-amber-400" />
                <span className="w-3 h-3 rounded-full bg-emerald-400" />
              </div>

              <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-surface border border-border text-[11px] font-mono text-text max-w-sm truncate shadow-2xs">
                <Lock className="w-3 h-3 text-emerald-600 shrink-0" />
                <span>{simulatedUrl}</span>
              </div>

              <div className="w-12 text-right">
                <span className="text-[10px] font-bold text-text-muted uppercase">100%</span>
              </div>
            </div>

            {/* Contenido */}
            <div className="p-4 sm:p-6 min-h-[460px] bg-background">
              {children}
            </div>
          </div>
        )}

        {currentDevice === 'tablet' && (
          /* Marco de Tablet (iPad) */
          <div className="w-full max-w-3xl rounded-[32px] border-[10px] border-neutral-800 dark:border-neutral-700 bg-neutral-900 shadow-2xl p-1 overflow-hidden">
            {/* Tablet Header */}
            <div className="px-5 py-2 text-white/70 text-[11px] flex items-center justify-between border-b border-white/10 font-mono">
              <div className="flex items-center gap-1.5">
                <Lock className="w-3 h-3 text-emerald-400" />
                <span>demo.sagitta.app</span>
              </div>
              <div className="flex items-center gap-2">
                <Wifi className="w-3 h-3" />
                <Battery className="w-3.5 h-3.5" />
              </div>
            </div>

            {/* Viewport Tablet */}
            <div className="bg-background rounded-b-[22px] p-4 sm:p-6 min-h-[500px] max-h-[620px] overflow-y-auto">
              {children}
            </div>
          </div>
        )}

        {currentDevice === 'mobile' && (
          /* Marco de Smartphone (iPhone / Galaxy) */
          <div className="w-full max-w-[390px] rounded-[48px] border-[12px] border-neutral-900 dark:border-neutral-800 bg-neutral-950 shadow-2xl overflow-hidden relative">
            {/* Dynamic Island / Notch */}
            <div className="pt-3 px-6 pb-2 text-white text-[11px] flex items-center justify-between font-mono bg-neutral-950">
              <span className="font-bold">9:41</span>
              {/* Dynamic Island Pill */}
              <div className="w-24 h-5 rounded-full bg-black mx-auto border border-white/10" />
              <div className="flex items-center gap-1.5">
                <Wifi className="w-3 h-3" />
                <Battery className="w-3.5 h-3.5" />
              </div>
            </div>

            {/* Mobile Viewport Scroller */}
            <div className="bg-background min-h-[540px] max-h-[580px] overflow-y-auto p-3 text-xs scrollbar-none">
              {children}
            </div>

            {/* Home Indicator Bar */}
            <div className="py-2.5 bg-background border-t border-border-subtle flex justify-center">
              <div className="w-32 h-1 rounded-full bg-neutral-400 dark:bg-neutral-600" />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

