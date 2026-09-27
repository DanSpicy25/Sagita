import { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { Bell, Check, Calendar, DollarSign, Users, Sparkles, X } from 'lucide-react'
import { Notificacion } from '@/types'
import { integracionesService } from '@/services/integraciones.service'
import { useNavigate } from 'react-router-dom'

const iconosTipo = {
  cita: <Calendar className="w-4 h-4 text-primary-500" />,
  pago: <DollarSign className="w-4 h-4 text-emerald-500" />,
  espera: <Users className="w-4 h-4 text-amber-500" />,
  recordatorio: <Bell className="w-4 h-4 text-purple-500" />,
  sistema: <Sparkles className="w-4 h-4 text-blue-500" />,
}

export function CentroNotificaciones() {
  const [notificaciones, setNotificaciones] = useState<Notificacion[]>([])
  const [abierto, setAbierto] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()

  const cargarNotificaciones = () => {
    integracionesService.getNotificaciones().then((res) => {
      if (res.data) setNotificaciones(res.data)
    })
  }

  useEffect(() => {
    cargarNotificaciones()
  }, [])

  // Cerrar al hacer click afuera
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node
      if (!dropdownRef.current?.contains(target) && !panelRef.current?.contains(target)) {
        setAbierto(false)
      }
    }
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setAbierto(false)
    }
    if (abierto) {
      document.addEventListener('pointerdown', handleClickOutside)
      document.addEventListener('keydown', handleEscape)
    }
    return () => {
      document.removeEventListener('pointerdown', handleClickOutside)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [abierto])

  const noLeidas = notificaciones.filter((n) => !n.leida).length

  const handleMarcarLeida = async (n: Notificacion) => {
    if (!n.leida) {
      await integracionesService.marcarLeida(n.id)
      setNotificaciones((prev) =>
        prev.map((item) => (item.id === n.id ? { ...item, leida: true } : item))
      )
    }
    if (n.enlace) {
      setAbierto(false)
      navigate(n.enlace)
    }
  }

  const handleMarcarTodasLeidas = async () => {
    await integracionesService.marcarTodasLeidas()
    setNotificaciones((prev) => prev.map((item) => ({ ...item, leida: true })))
  }

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Botón de la Campana */}
      <button
        type="button"
        onClick={() => setAbierto(!abierto)}
        className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-lg p-1.5 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100 sm:h-9 sm:w-9"
        aria-label="Ver notificaciones"
        aria-expanded={abierto}
        aria-controls="notification-panel"
        title="Ver notificaciones"
      >
        <Bell className="h-5 w-5" />
        {noLeidas > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary-700 px-1 text-[10px] font-bold text-white ring-2 ring-white dark:ring-slate-900">
            {noLeidas}
          </span>
        )}
      </button>

      {/* Popover Desplegable */}
      {abierto && createPortal(
        <div
          ref={panelRef}
          id="notification-panel"
          role="region"
          aria-label="Notificaciones recientes"
          className="notification-panel fixed z-[60] flex w-[min(24rem,calc(100vw-2rem))] flex-col overflow-hidden rounded-lg border border-slate-200 bg-white shadow-xl animate-slide-down dark:border-slate-800 dark:bg-slate-900"
        >
          {/* Header */}
          <div className="flex shrink-0 items-center justify-between gap-2 border-b border-slate-100 p-3 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                Notificaciones
              </span>
              {noLeidas > 0 && (
                <span className="rounded-full bg-primary-50 px-2 py-0.5 text-[11px] font-semibold text-primary-700 dark:bg-primary-950/40 dark:text-primary-400">
                  {noLeidas} nuevas
                </span>
              )}
            </div>

            <div className="flex shrink-0 items-center gap-1">
              {noLeidas > 0 && (
                <button
                  onClick={handleMarcarTodasLeidas}
                  className="flex items-center gap-1 rounded px-1.5 py-1 text-[11px] font-semibold text-primary-700 hover:bg-primary-50 dark:text-primary-300 dark:hover:bg-primary-950/50"
                >
                  <Check className="w-3 h-3" />
                  Marcar leídas
                </button>
              )}
              <button
                onClick={() => setAbierto(false)}
                aria-label="Cerrar notificaciones"
                title="Cerrar notificaciones"
                className="rounded-md p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Lista de Notificaciones */}
          <div className="min-h-0 flex-1 divide-y divide-slate-100 overflow-y-auto overscroll-contain dark:divide-slate-800">
            {notificaciones.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs">
                No tienes notificaciones pendientes.
              </div>
            ) : (
              notificaciones.map((n) => (
                <button
                  key={n.id}
                  type="button"
                  onClick={() => handleMarcarLeida(n)}
                  className={[
                    'flex w-full items-start gap-3 p-3.5 text-left text-xs transition-colors',
                    n.leida
                      ? 'bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/40'
                      : 'bg-primary-50/30 dark:bg-primary-950/20 hover:bg-primary-50/60',
                  ].join(' ')}
                >
                  <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-slate-100 dark:bg-slate-800">
                    {iconosTipo[n.tipo] ?? <Bell className="w-4 h-4 text-slate-400" />}
                  </span>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <p className="font-semibold text-slate-800 dark:text-slate-100 truncate">
                        {n.titulo}
                      </p>
                      {!n.leida && (
                        <span className="w-2 h-2 rounded-full bg-primary-600 flex-shrink-0" />
                      )}
                    </div>
                    <p className="text-slate-500 dark:text-slate-400 text-[11px] mt-0.5 line-clamp-2">
                      {n.mensaje}
                    </p>
                    <span className="text-[10px] text-slate-400 mt-1 block">
                      {new Date(n.fecha).toLocaleTimeString('es-ES', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      , document.body)}
    </div>
  )
}

