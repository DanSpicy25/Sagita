import { Link } from 'react-router-dom'
import {
  Store,
  MapPin,
  Phone,
  Mail,
  ShoppingCart,
  Package,
  Printer,
  LayoutDashboard,
  Lock,
} from 'lucide-react'
import type { ConfiguracionMarcaBlanca, Servicio } from '@/types'
import { useSector } from '@/context/SectorContext'

export interface PortalFooterProps {
  configuracion: ConfiguracionMarcaBlanca
  nombreMarca: string
  lemaMarca?: string
  servicios: Servicio[]
  isAuthenticated: boolean
  onSeleccionarServicio: (servicio: Servicio) => void
  onIrAReservas: () => void
}

export function PortalFooter({
  configuracion,
  nombreMarca,
  lemaMarca,
  servicios,
  isAuthenticated,
  onSeleccionarServicio,
  onIrAReservas,
}: PortalFooterProps) {
  const { sector, tokens, mockItems } = useSector()

  return (
    <footer
      id="contacto"
      className="mt-auto bg-slate-950 text-slate-400 border-t border-slate-800 text-xs"
    >
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Columna 1: Info Negocio */}
          <div className="space-y-4 col-span-1 sm:col-span-2">
            <div className="flex items-center gap-2.5 text-white font-bold text-base">
              {configuracion.logo_url ? (
                <img
                  src={configuracion.logo_url}
                  alt={nombreMarca}
                  className="h-8 object-contain"
                />
              ) : (
                <Store className="w-5 h-5 text-zinc-300" />
              )}
              <span>{nombreMarca}</span>
            </div>
            <p className="text-slate-400 text-xs max-w-sm leading-relaxed">
              {lemaMarca || 'Plataforma integral para organizar operaciones, ventas y atención al cliente.'}
            </p>
            <div className="space-y-2 pt-1 text-xs">
              <p className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                <span>Atención presencial en sucursales y operaciones web</span>
              </p>
              {configuracion.telefono_soporte && (
                <p className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                  <span>{configuracion.telefono_soporte}</span>
                </p>
              )}
              {configuracion.email_soporte && (
                <p className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                  <span>{configuracion.email_soporte}</span>
                </p>
              )}
            </div>
          </div>

          {/* Columna 2: Catálogo adaptado al sector */}
          <div className="space-y-3">
            <h4 className="text-white font-bold text-sm">{sector === 'spa' ? 'Servicios' : 'Catálogo'}</h4>
            <ul className="space-y-2">
              {sector === 'spa'
                ? servicios.slice(0, 4).map((s) => (
                    <li key={s.id}>
                      <button
                        type="button"
                        onClick={() => {
                          onIrAReservas()
                          onSeleccionarServicio(s)
                        }}
                        className="hover:text-white transition-colors text-left cursor-pointer"
                      >
                        {s.nombre}
                      </button>
                    </li>
                  ))
                : mockItems.slice(0, 4).map((item) => (
                    <li key={item.id}>
                      <button type="button" onClick={onIrAReservas} className="hover:text-white transition-colors text-left cursor-pointer">
                        {item.nombre}
                      </button>
                    </li>
                  ))}
              <li>
                <button
                  type="button"
                  onClick={onIrAReservas}
                  className="text-zinc-200 hover:text-white transition-colors font-medium cursor-pointer"
                >
                  {sector === 'spa' ? 'Ver agenda y servicios →' : `Ver catálogo de ${tokens.nombre} →`}
                </button>
              </li>
            </ul>
          </div>

          {/* Columna 3: Terminal & POS */}
          <div className="space-y-3">
            <h4 className="text-white font-bold text-sm">Punto de Venta</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/ventas" className="hover:text-white transition-colors flex items-center gap-1.5">
                  <ShoppingCart className="w-3.5 h-3.5 text-zinc-400" />
                  <span>Punto de Venta (POS)</span>
                </Link>
              </li>
              <li>
                <Link to="/inventario" className="hover:text-white transition-colors flex items-center gap-1.5">
                  <Package className="w-3.5 h-3.5 text-zinc-400" />
                  <span>Inventario (#PRD)</span>
                </Link>
              </li>
              <li>
                <Link to="/hardware" className="hover:text-white transition-colors flex items-center gap-1.5">
                  <Printer className="w-3.5 h-3.5 text-zinc-400" />
                  <span>Hardware ESC/POS</span>
                </Link>
              </li>
              <li>
                <Link to="/recepcion" className="hover:text-white transition-colors">
                  Mostrador & Recepción
                </Link>
              </li>
            </ul>
          </div>

          {/* Columna 4: Administración */}
          <div className="space-y-3">
            <h4 className="text-white font-bold text-sm">Gestión & Admin</h4>
            <ul className="space-y-2">
              <li>
                {isAuthenticated ? (
                  <Link to="/dashboard" className="hover:text-white transition-colors flex items-center gap-1.5 font-semibold text-zinc-200">
                    <LayoutDashboard className="w-3.5 h-3.5" />
                    <span>Panel de Control</span>
                  </Link>
                ) : (
                  <Link to="/login" className="hover:text-white transition-colors flex items-center gap-1.5 font-semibold text-zinc-200">
                    <Lock className="w-3.5 h-3.5" />
                    <span>Acceso Staff / Login</span>
                  </Link>
                )}
              </li>
              <li>
                <Link to="/citas" className="hover:text-white transition-colors">
                  Agenda & Citas
                </Link>
              </li>
              <li>
                <Link to="/configuracion" className="hover:text-white transition-colors">
                  Configuración de Marca
                </Link>
              </li>
              <li>
                <Link to="/reportes" className="hover:text-white transition-colors">
                  Reportes y Ventas
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Línea inferior con Copyright */}
        <div className="mt-12 pt-6 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-slate-500 text-xs text-center sm:text-left">
            {configuracion.texto_pie_pagina ||
              `© ${new Date().getFullYear()} ${nombreMarca}. Todos los derechos reservados.`}
          </p>

          <div className="flex items-center gap-4 text-xs text-slate-500">
            <span className="flex items-center gap-1 text-emerald-500">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Sistema En Línea
            </span>
            <span className="text-slate-700">•</span>
            <Link to="/login" className="hover:text-slate-300 transition-colors">
              Ingreso Personal
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
