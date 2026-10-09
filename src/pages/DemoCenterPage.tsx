import React, { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import {
  Sparkles,
  Monitor,
  Tablet,
  Smartphone,
  PhoneCall,
  ArrowRight,
  CheckCircle,
  X,
  Send,
  MessageSquare,
  Zap,
} from 'lucide-react'
import {
  type DemoModuleId,
  type DeviceMode,
  DEMO_PRESENTATIONS,
} from '@/components/demo/demoData'
import { DeviceViewportFrame } from '@/components/demo/DeviceViewportFrame'
import { DemoPresentationSheet } from '@/components/demo/DemoPresentationSheet'
import { DemoDashboard } from '@/components/demo/simulations/DemoDashboard'
import { DemoCalendar } from '@/components/demo/simulations/DemoCalendar'
import { DemoCustomers } from '@/components/demo/simulations/DemoCustomers'
import { DemoServices } from '@/components/demo/simulations/DemoServices'
import { DemoPOS } from '@/components/demo/simulations/DemoPOS'
import { DemoInventory } from '@/components/demo/simulations/DemoInventory'
import { DemoReports } from '@/components/demo/simulations/DemoReports'
import { Button } from '@/components/ui'

export default function DemoCenterPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const initialModule = (searchParams.get('modulo') as DemoModuleId) || 'dashboard'

  const [activeModule, setActiveModule] = useState<DemoModuleId>(
    initialModule in DEMO_PRESENTATIONS ? initialModule : 'dashboard'
  )
  const [deviceMode, setDeviceMode] = useState<DeviceMode>('desktop')
  const [isLeadModalOpen, setIsLeadModalOpen] = useState(false)
  const [leadFormSubmitted, setLeadFormSubmitted] = useState(false)
  const [leadForm, setLeadForm] = useState({
    nombre: '',
    email: '',
    telefono: '',
    empresa: '',
    tamanoEquipo: '1-5',
    comentarios: '',
  })

  // Sync module with URL query parameter
  const handleSelectModule = (modId: DemoModuleId) => {
    setActiveModule(modId)
    setSearchParams({ modulo: modId })
  }

  useEffect(() => {
    const modFromUrl = searchParams.get('modulo') as DemoModuleId
    if (modFromUrl && modFromUrl in DEMO_PRESENTATIONS && modFromUrl !== activeModule) {
      setActiveModule(modFromUrl)
    }
  }, [searchParams])

  const handleLeadSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setLeadFormSubmitted(true)
    setTimeout(() => {
      // Keep open briefly so user sees confirmation
    }, 1500)
  }

  const handleWhatsAppContact = () => {
    const text = encodeURIComponent(
      `Hola equipo de Sagitta, estuve probando el módulo "${DEMO_PRESENTATIONS[activeModule].label}" en el Demo Center y me gustaría solicitar una demostración guiada para mi negocio.`
    )
    window.open(`https://wa.me/?text=${text}`, '_blank')
  }

  // Render the current simulation component
  const renderSimulation = () => {
    switch (activeModule) {
      case 'dashboard':
        return <DemoDashboard deviceMode={deviceMode} />
      case 'calendar':
        return <DemoCalendar deviceMode={deviceMode} />
      case 'customers':
        return <DemoCustomers deviceMode={deviceMode} />
      case 'services':
        return <DemoServices deviceMode={deviceMode} />
      case 'pos':
        return <DemoPOS deviceMode={deviceMode} />
      case 'inventory':
        return <DemoInventory deviceMode={deviceMode} />
      case 'reports':
        return <DemoReports deviceMode={deviceMode} />
      default:
        return <DemoDashboard deviceMode={deviceMode} />
    }
  }

  const moduleKeys: DemoModuleId[] = [
    'dashboard',
    'calendar',
    'customers',
    'services',
    'pos',
    'inventory',
    'reports',
  ]

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-primary selection:text-white">
      {/* 1. Global Sales Demo Alert / Safe Playground Disclaimer */}
      <div className="bg-gradient-to-r from-emerald-950/80 via-slate-900 to-indigo-950/80 border-b border-border/40 px-4 py-2 text-xs flex flex-wrap items-center justify-between gap-3 text-slate-300">
        <div className="flex items-center gap-2">
          <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="font-semibold text-emerald-300">DEMO CENTER EN VIVO:</span>
          <span>Negocio Ficticio de Demostración:</span>
          <strong className="text-white bg-white/10 px-2 py-0.5 rounded text-[11px] font-mono">
            Nova Clinic & Wellness
          </strong>
          <span className="hidden md:inline text-slate-400">
            • Todos los datos son simulados para exhibición comercial segura
          </span>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsLeadModalOpen(true)}
            className="text-xs text-emerald-400 hover:text-emerald-300 font-medium underline flex items-center gap-1"
          >
            <span>¿Eres representante de ventas? Abre la guía guiada</span>
            <ArrowRight className="w-3 h-3" />
          </button>
          <span className="text-slate-600">|</span>
          <Link
            to="/login"
            className="text-xs text-slate-400 hover:text-white transition-colors"
          >
            Iniciar Sesión
          </Link>
        </div>
      </div>

      {/* 2. Top Navigation & Brand Header */}
      <header className="border-b border-slate-800 bg-slate-900/90 backdrop-blur sticky top-0 z-30 px-4 lg:px-8 py-3 flex items-center justify-between gap-4">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-primary to-indigo-500 flex items-center justify-center shadow-lg shadow-primary/25 text-white font-black text-lg">
              S
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold tracking-tight text-white text-base">
                  Sagitta
                </span>
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-primary/20 text-primary border border-primary/30">
                  Demo Center
                </span>
              </div>
              <p className="text-[11px] text-slate-400 leading-none">
                Showcase Interactivo Multidispositivo
              </p>
            </div>
          </Link>
        </div>

        {/* Viewport Selector in Header (Quick Switcher) */}
        <div className="hidden md:flex items-center bg-slate-950/80 p-1 rounded-xl border border-slate-800 shadow-inner">
          <button
            onClick={() => setDeviceMode('desktop')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              deviceMode === 'desktop'
                ? 'bg-slate-800 text-white shadow-xs'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Vista Escritorio (Widescreen)"
          >
            <Monitor className="w-3.5 h-3.5" />
            <span>Escritorio</span>
          </button>
          <button
            onClick={() => setDeviceMode('tablet')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              deviceMode === 'tablet'
                ? 'bg-slate-800 text-white shadow-xs'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Vista Tablet (iPad)"
          >
            <Tablet className="w-3.5 h-3.5" />
            <span>Tablet</span>
          </button>
          <button
            onClick={() => setDeviceMode('mobile')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              deviceMode === 'mobile'
                ? 'bg-slate-800 text-white shadow-xs'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Vista Móvil (Smartphone)"
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Móvil</span>
          </button>
        </div>

        {/* Action CTAs */}
        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={handleWhatsAppContact}
            className="hidden sm:inline-flex border-slate-700 bg-slate-800/80 hover:bg-slate-700 text-slate-200 gap-1.5 text-xs h-9"
          >
            <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
            <span>Consultar por WhatsApp</span>
          </Button>

          <Button
            size="sm"
            onClick={() => setIsLeadModalOpen(true)}
            className="bg-primary hover:bg-primary/90 text-white gap-1.5 text-xs h-9 shadow-md shadow-primary/20"
          >
            <PhoneCall className="w-3.5 h-3.5" />
            <span>Agendar Demo 1-a-1</span>
          </Button>
        </div>
      </header>

      {/* 3. Module Selector Tabs Bar */}
      <nav
        aria-label="Selector de Módulos Demostrativos"
        className="border-b border-slate-800/80 bg-slate-900/60 px-4 lg:px-8 py-2 overflow-x-auto scrollbar-none"
      >
        <div className="flex items-center gap-1.5 min-w-max mx-auto max-w-7xl">
          {moduleKeys.map((modId) => {
            const mod = DEMO_PRESENTATIONS[modId]
            const Icon = mod.icon
            const isActive = modId === activeModule

            return (
              <button
                key={modId}
                onClick={() => handleSelectModule(modId)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium transition-all border ${
                  isActive
                    ? 'bg-primary text-white border-primary shadow-sm shadow-primary/30'
                    : 'bg-slate-800/50 text-slate-300 border-slate-800 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{mod.label}</span>
                {isActive && (
                  <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                )}
              </button>
            )
          })}
        </div>
      </nav>

      {/* 4. Main Stage (Interactive Simulation + Presentation Sheet) */}
      <main className="flex-1 max-w-[1720px] w-full mx-auto p-4 lg:p-6 grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        {/* Left / Center: The Simulation inside the selected Device Frame (xl: 8 cols) */}
        <section className="xl:col-span-8 flex flex-col items-center justify-start min-h-[640px] w-full">
          <DeviceViewportFrame
            mode={deviceMode}
            onChangeMode={setDeviceMode}
            title={`${DEMO_PRESENTATIONS[activeModule].label} — Sagitta`}
            className="w-full shadow-2xl"
          >
            {renderSimulation()}
          </DeviceViewportFrame>

          {/* Quick tips bar underneath frame */}
          <div className="w-full max-w-4xl mt-3 px-4 py-2 rounded-xl bg-slate-900/60 border border-slate-800/60 text-xs text-slate-400 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span>
                <strong>Modo interactivo:</strong> Puedes hacer clic, agregar productos al carrito, filtrar citas o simular cobros sin alterar datos reales.
              </span>
            </div>
            <span className="text-[11px] text-slate-500 font-mono">
              Resolución: {deviceMode === 'desktop' ? '1280×800' : deviceMode === 'tablet' ? '768×1024' : '390×844'}
            </span>
          </div>
        </section>

        {/* Right: The 4-Questions Presentation Sheet Guide (xl: 4 cols) */}
        <section className="xl:col-span-4 sticky top-20 w-full">
          <DemoPresentationSheet
            activeModule={activeModule}
            onSelectModule={handleSelectModule}
            deviceMode={deviceMode}
            onChangeDeviceMode={setDeviceMode}
            onRequestSalesDemo={() => setIsLeadModalOpen(true)}
            className="h-auto max-h-[820px]"
          />
        </section>
      </main>

      {/* 5. Lead Capture & Sales Demo Dialog */}
      {isLeadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 text-slate-100 shadow-2xl relative">
            <button
              onClick={() => {
                setIsLeadModalOpen(false)
                setLeadFormSubmitted(false)
              }}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
              aria-label="Cerrar modal"
            >
              <X className="w-5 h-5" />
            </button>

            {leadFormSubmitted ? (
              <div className="py-8 text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mx-auto">
                  <CheckCircle className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-white">
                  ¡Solicitud Enviada con Éxito!
                </h3>
                <p className="text-sm text-slate-300 max-w-sm mx-auto leading-relaxed">
                  Un especialista de Sagitta te contactará en menos de 2 horas para
                  personalizar tu demostración guiada según las necesidades de{' '}
                  <strong className="text-white">{leadForm.empresa || 'tu negocio'}</strong>.
                </p>
                <div className="pt-4 flex justify-center gap-3">
                  <Button
                    onClick={() => {
                      setIsLeadModalOpen(false)
                      setLeadFormSubmitted(false)
                    }}
                    className="bg-slate-800 hover:bg-slate-700 text-white"
                  >
                    Cerrar y seguir explorando
                  </Button>
                </div>
              </div>
            ) : (
              <div>
                <div className="flex items-center gap-2.5 mb-1">
                  <div className="p-2 rounded-xl bg-primary/20 text-primary border border-primary/30">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">
                      Agendar Demostración Personalizada
                    </h3>
                    <p className="text-xs text-slate-400">
                      Descubre cómo Sagitta se adapta a los flujos específicos de tu negocio
                    </p>
                  </div>
                </div>

                <form onSubmit={handleLeadSubmit} className="mt-5 space-y-3.5 text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-300 font-medium mb-1">
                        Tu Nombre Completo *
                      </label>
                      <input
                        required
                        type="text"
                        value={leadForm.nombre}
                        onChange={(e) =>
                          setLeadForm({ ...leadForm, nombre: e.target.value })
                        }
                        placeholder="Ej. Dra. Marcela Gómez"
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-primary"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-300 font-medium mb-1">
                        Email Corporativo *
                      </label>
                      <input
                        required
                        type="email"
                        value={leadForm.email}
                        onChange={(e) =>
                          setLeadForm({ ...leadForm, email: e.target.value })
                        }
                        placeholder="marcela@clinica.com"
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-primary"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-300 font-medium mb-1">
                        Nombre de tu Negocio *
                      </label>
                      <input
                        required
                        type="text"
                        value={leadForm.empresa}
                        onChange={(e) =>
                          setLeadForm({ ...leadForm, empresa: e.target.value })
                        }
                        placeholder="Ej. Clínica Dermatológica Vital"
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-primary"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-300 font-medium mb-1">
                        WhatsApp / Teléfono *
                      </label>
                      <input
                        required
                        type="tel"
                        value={leadForm.telefono}
                        onChange={(e) =>
                          setLeadForm({ ...leadForm, telefono: e.target.value })
                        }
                        placeholder="+52 55 1234 5678"
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-primary"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-300 font-medium mb-1">
                        Módulo de Mayor Interés
                      </label>
                      <select
                        value={activeModule}
                        onChange={(e) =>
                          setActiveModule(e.target.value as DemoModuleId)
                        }
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-primary"
                      >
                        {moduleKeys.map((key) => (
                          <option key={key} value={key}>
                            {DEMO_PRESENTATIONS[key].label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-slate-300 font-medium mb-1">
                        Tamaño de tu Equipo
                      </label>
                      <select
                        value={leadForm.tamanoEquipo}
                        onChange={(e) =>
                          setLeadForm({ ...leadForm, tamanoEquipo: e.target.value })
                        }
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-primary"
                      >
                        <option value="1">Solo yo (Independiente)</option>
                        <option value="2-5">2 a 5 especialistas</option>
                        <option value="6-15">6 a 15 especialistas</option>
                        <option value="16+">Más de 16 (Multi-sucursal)</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-300 font-medium mb-1">
                      ¿Qué desafío principal deseas resolver? (Opcional)
                    </label>
                    <textarea
                      rows={2}
                      value={leadForm.comentarios}
                      onChange={(e) =>
                        setLeadForm({ ...leadForm, comentarios: e.target.value })
                      }
                      placeholder="Ej. Reducir ausentismo de citas, controlar comisiones de médicos, o sincronizar inventario..."
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-primary resize-none"
                    />
                  </div>

                  <div className="pt-2 flex items-center justify-end gap-2.5">
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => setIsLeadModalOpen(false)}
                      className="text-slate-400 hover:text-white"
                    >
                      Cancelar
                    </Button>
                    <Button
                      type="submit"
                      className="bg-primary hover:bg-primary/90 text-white font-semibold gap-1.5"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Confirmar Solicitud de Demo</span>
                    </Button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

