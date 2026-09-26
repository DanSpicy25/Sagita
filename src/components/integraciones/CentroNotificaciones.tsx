import { useState, useEffect, useRef } from 'react'
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
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setAbierto(false)
      }
    }
    if (abierto) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => document.removeEventListener('mousedown', handleClickOutside)
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
        className="relative p-2 rounded-xl text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        aria-label="Ver notificaciones"
      >
        <Bell className="w-5 h-5" />
        {noLeidas > 0 && (
          <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-primary-600 text-white text-[10px] font-bold flex items-center justify-center ring-2 ring-white dark:ring-slate-900 animate-pulse">
            {noLeidas}
          </span>
        )}
      </button>

      {/* Popover Desplegable */}
      {abierto && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl z-50 overflow-hidden animate-slide-down">
          {/* Header */}
          <div className="p-3.5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm text-slate-800 dark:text-slate-100">
                Notificaciones
              </span>
              {noLeidas > 0 && (
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-primary-50 dark:bg-primary-950/40 text-primary-600 dark:text-primary-400">
                  {noLeidas} nuevas
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              {noLeidas > 0 && (
                <button
                  onClick={handleMarcarTodasLeidas}
                  className="text-[11px] font-semibold text-primary-600 hover:text-primary-700 dark:text-primary-400 flex items-center gap-1"
                >
                  <Check className="w-3 h-3" />
                  Marcar leídas
                </button>
              )}
              <button
                onClick={() => setAbierto(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Lista de Notificaciones */}
          <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
            {notificaciones.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs">
                No tienes notificaciones pendientes.
              </div>
            ) : (
              notificaciones.map((n) => (
                <div
                  key={n.id}
                  onClick={() => handleMarcarLeida(n)}
                  className={[
                    'p-3.5 flex items-start gap-3 text-xs cursor-pointer transition-colors',
                    n.leida
                      ? 'bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/40'
                      : 'bg-primary-50/30 dark:bg-primary-950/20 hover:bg-primary-50/60',
                  ].join(' ')}
                >
                  <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center flex-shrink-0 mt-0.5">
                    {iconosTipo[n.tipo] ?? <Bell className="w-4 h-4 text-slate-400" />}
                  </div>

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
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}

