import React, { useState } from 'react'
import {
  HelpCircle,
  TrendingUp,
  CheckCircle2,
  Smartphone,
  Copy,
  Check,
  PhoneCall,
  Sparkles,
  ArrowRight,
  Monitor,
  Tablet,
  ExternalLink,
} from 'lucide-react'
import {
  type DemoModuleId,
  type DeviceMode,
  DEMO_PRESENTATIONS,
} from './demoData'
import { Button } from '@/components/ui'

interface DemoPresentationSheetProps {
  activeModule: DemoModuleId
  onSelectModule: (module: DemoModuleId) => void
  deviceMode: DeviceMode
  onChangeDeviceMode: (mode: DeviceMode) => void
  onRequestSalesDemo?: () => void
  className?: string
}

export const DemoPresentationSheet: React.FC<DemoPresentationSheetProps> = ({
  activeModule,
  onSelectModule,
  deviceMode,
  onChangeDeviceMode,
  onRequestSalesDemo,
  className = '',
}) => {
  const presentation = DEMO_PRESENTATIONS[activeModule]
  const [copiedPitch, setCopiedPitch] = useState(false)

  const copyPitchToClipboard = async () => {
    const pitchText = `*Sagitta — ${presentation.label}*
${presentation.tagline}

1. ¿Qué es?: ${presentation.queEs}
2. ¿Por qué es útil?: ${presentation.porQueEsUtil}
3. Capacidades clave:
${presentation.quePuedoHacer.map((item) => ` • ${item}`).join('\n')}
4. Experiencia Móvil: ${presentation.comoSeVeEnMovil}`

    try {
      await navigator.clipboard.writeText(pitchText)
      setCopiedPitch(true)
      setTimeout(() => setCopiedPitch(false), 2200)
    } catch {
      // Fallback
    }
  }

  const allModules: DemoModuleId[] = [
    'dashboard',
    'calendar',
    'customers',
    'services',
    'pos',
    'inventory',
    'reports',
  ]

  const ModuleIcon = presentation.icon

  return (
    <aside
      className={`flex flex-col bg-card border border-border/80 rounded-2xl shadow-xl overflow-hidden ${className}`}
      aria-label="Ficha Técnica de Presentación Comercial"
    >
      {/* Top Header */}
      <div className="p-5 border-b border-border/70 bg-gradient-to-r from-primary/10 via-background to-secondary/10">
        <div className="flex items-center justify-between gap-3 mb-2">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-semibold bg-primary/15 text-primary border border-primary/20">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Guía de Presentación Comercial</span>
          </div>

          <button
            onClick={copyPitchToClipboard}
            className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground font-medium px-2 py-1 rounded-lg hover:bg-muted/80 transition-colors"
            title="Copiar guion de ventas de este módulo"
          >
            {copiedPitch ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-500" />
                <span className="text-emerald-500 font-semibold">Copiado</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copiar Pitch</span>
              </>
            )}
          </button>
        </div>

        <div className="flex items-start gap-3 mt-3">
          <div className="p-2.5 rounded-xl bg-primary/15 text-primary shrink-0 border border-primary/20 shadow-sm">
            <ModuleIcon className="w-6 h-6" />
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="text-xl font-bold text-foreground tracking-tight flex items-center gap-2">
              <span>{presentation.label}</span>
              <span className="text-xs font-mono font-normal px-2 py-0.5 rounded-md bg-muted text-muted-foreground">
                Módulo {(allModules.indexOf(activeModule) + 1).toString().padStart(2, '0')}/07
              </span>
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5 leading-snug">
              {presentation.tagline}
            </p>
          </div>
        </div>

        {/* Module Fast Pills */}
        <div className="mt-4 flex flex-wrap gap-1.5">
          {allModules.map((modId) => {
            const mod = DEMO_PRESENTATIONS[modId]
            const isCurrent = modId === activeModule
            return (
              <button
                key={modId}
                onClick={() => onSelectModule(modId)}
                className={`text-xs px-2.5 py-1 rounded-lg font-medium transition-all ${
                  isCurrent
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
              >
                {mod.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* 4 Core Questions Accordion / Cards Body */}
      <div className="flex-1 overflow-y-auto p-5 space-y-4 text-sm divide-y divide-border/40">
        {/* Question 1: ¿Qué es esto? */}
        <section className="pt-2 first:pt-0">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-6 h-6 rounded-lg bg-blue-500/15 text-blue-500 flex items-center justify-center shrink-0">
              <HelpCircle className="w-3.5 h-3.5" />
            </div>
            <h3 className="font-semibold text-foreground text-sm">
              1. ¿Qué es esto?
            </h3>
          </div>
          <p className="text-xs leading-relaxed text-muted-foreground pl-8">
            {presentation.queEs}
          </p>
        </section>

        {/* Question 2: ¿Por qué es útil? */}
        <section className="pt-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-6 h-6 rounded-lg bg-emerald-500/15 text-emerald-500 flex items-center justify-center shrink-0">
              <TrendingUp className="w-3.5 h-3.5" />
            </div>
            <h3 className="font-semibold text-foreground text-sm">
              2. ¿Por qué es útil?
            </h3>
          </div>
          <p className="text-xs leading-relaxed text-muted-foreground pl-8 mb-3">
            {presentation.porQueEsUtil}
          </p>

          {/* Quick Value Metrics */}
          {presentation.kpisClave.length > 0 && (
            <div className="pl-8 grid grid-cols-3 gap-2">
              {presentation.kpisClave.map((kpi, idx) => (
                <div
                  key={idx}
                  className="bg-muted/40 border border-border/50 rounded-lg p-2 text-center"
                >
                  <p className="text-[10px] uppercase font-bold text-muted-foreground truncate">
                    {kpi.label}
                  </p>
                  <p className="text-xs font-bold text-foreground mt-0.5 truncate">
                    {kpi.valor}
                  </p>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Question 3: ¿Qué puedo hacer aquí? */}
        <section className="pt-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-6 h-6 rounded-lg bg-amber-500/15 text-amber-500 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-3.5 h-3.5" />
            </div>
            <h3 className="font-semibold text-foreground text-sm">
              3. ¿Qué puedo hacer aquí?
            </h3>
          </div>
          <div className="pl-8 space-y-1.5">
            {presentation.quePuedoHacer.map((action, idx) => (
              <div
                key={idx}
                className="flex items-start gap-2 text-xs text-muted-foreground bg-muted/20 hover:bg-muted/40 p-2 rounded-lg transition-colors border border-transparent hover:border-border/60"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                <span className="leading-snug">{action}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Question 4: ¿Cómo se ve en móvil? */}
        <section className="pt-4">
          <div className="flex items-center justify-between gap-2 mb-2">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-purple-500/15 text-purple-500 flex items-center justify-center shrink-0">
                <Smartphone className="w-3.5 h-3.5" />
              </div>
              <h3 className="font-semibold text-foreground text-sm">
                4. ¿Cómo se ve en móvil?
              </h3>
            </div>

            {deviceMode !== 'mobile' && (
              <button
                onClick={() => onChangeDeviceMode('mobile')}
                className="inline-flex items-center gap-1 text-[11px] font-medium text-purple-600 dark:text-purple-400 hover:underline"
              >
                <span>Probar vista</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            )}
          </div>
          <p className="text-xs leading-relaxed text-muted-foreground pl-8 mb-3">
            {presentation.comoSeVeEnMovil}
          </p>

          {/* Quick Viewport Switcher Buttons */}
          <div className="pl-8 flex items-center gap-2">
            <button
              onClick={() => onChangeDeviceMode('desktop')}
              className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-medium flex items-center justify-center gap-1.5 border transition-all ${
                deviceMode === 'desktop'
                  ? 'bg-primary/15 text-primary border-primary/30 shadow-xs'
                  : 'bg-muted/40 text-muted-foreground border-border/50 hover:bg-muted'
              }`}
            >
              <Monitor className="w-3.5 h-3.5" />
              <span>Escritorio</span>
            </button>
            <button
              onClick={() => onChangeDeviceMode('tablet')}
              className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-medium flex items-center justify-center gap-1.5 border transition-all ${
                deviceMode === 'tablet'
                  ? 'bg-primary/15 text-primary border-primary/30 shadow-xs'
                  : 'bg-muted/40 text-muted-foreground border-border/50 hover:bg-muted'
              }`}
            >
              <Tablet className="w-3.5 h-3.5" />
              <span>Tablet</span>
            </button>
            <button
              onClick={() => onChangeDeviceMode('mobile')}
              className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-medium flex items-center justify-center gap-1.5 border transition-all ${
                deviceMode === 'mobile'
                  ? 'bg-primary/15 text-primary border-primary/30 shadow-xs'
                  : 'bg-muted/40 text-muted-foreground border-border/50 hover:bg-muted'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>Móvil</span>
            </button>
          </div>
        </section>
      </div>

      {/* Commercial Conversion Footer */}
      <div className="p-4 bg-muted/40 border-t border-border/80 flex flex-col gap-2.5">
        <Button
          onClick={onRequestSalesDemo}
          className="w-full gap-2 shadow-sm font-semibold"
          size="sm"
        >
          <PhoneCall className="w-4 h-4" />
          <span>Solicitar Demo con Asesor</span>
        </Button>

        <div className="flex items-center justify-between text-[11px] text-muted-foreground px-1">
          <span>¿Listo para comenzar hoy?</span>
          <a
            href="/register"
            className="font-medium text-primary hover:underline inline-flex items-center gap-1"
          >
            <span>Crear cuenta gratis</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>
    </aside>
  )
}

