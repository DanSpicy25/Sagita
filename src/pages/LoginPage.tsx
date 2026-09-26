import { useState, FormEvent } from 'react'
import { Navigate, Link } from 'react-router-dom'
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  CalendarDays,
  ShieldAlert,
  Building2,
  Briefcase,
  ArrowLeft,
  KeyRound,
} from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useToast } from '@/hooks/useToast'
import { useConfiguracion } from '@/hooks/useConfiguracion'
import { Button, Input, Badge } from '@/components/ui'

export default function LoginPage() {
  const { isAuthenticated, login } = useAuth()
  const { toast } = useToast()
  const { configuracion, nombreMarca, lemaMarca } = useConfiguracion()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  if (isAuthenticated) return <Navigate to="/dashboard" replace />

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!email || !password) {
      toast.warning('Campos requeridos', 'Por favor completa todos los campos')
      return
    }
    setIsLoading(true)
    try {
      await login({ email, password })
      toast.success('¡Bienvenido!', 'Has iniciado sesión correctamente en el panel')
    } catch (err) {
      toast.error(
        'Error al iniciar sesión',
        err instanceof Error ? err.message : 'Credenciales incorrectas'
      )
    } finally {
      setIsLoading(false)
    }
  }

  // Helper para autocompletar credenciales demo
  const handleAutoCompletar = (correoDemo: string, passDemo: string) => {
    setEmail(correoDemo)
    setPassword(passDemo)
    toast.info('Credencial cargada', `Seleccionado perfil: ${correoDemo}`)
  }

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-slate-50 dark:bg-slate-950">
      {/* Left — Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary-600 to-primary-900 flex-col items-center justify-center p-12 text-white relative">
        <div className="absolute top-8 left-8">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-xs font-semibold text-white/80 hover:text-white bg-white/10 hover:bg-white/20 px-3 py-2 rounded-xl transition-all"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Volver a la Página de Reservas</span>
          </Link>
        </div>

        <div className="max-w-md text-center space-y-6">
          {configuracion.logo_url ? (
            <img
              src={configuracion.logo_url}
              alt={nombreMarca}
              className="max-h-20 mx-auto object-contain bg-white/10 p-3 rounded-2xl"
            />
          ) : (
            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto">
              <CalendarDays className="w-8 h-8 text-white" />
            </div>
          )}
          <h1 className="text-3xl font-extrabold">{nombreMarca}</h1>
          <p className="text-primary-200 text-sm leading-relaxed">
            {lemaMarca || 'Panel administrativo seguro para gestión de citas, sucursales y personal.'}
          </p>

          <div className="bg-white/10 rounded-2xl p-4 text-left border border-white/10 text-xs space-y-2">
            <p className="font-semibold text-white flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4 text-amber-300" />
              <span>Acceso Administrativo y Auditoría</span>
            </p>
            <p className="text-primary-100">
              Este acceso está reservado para directores, administradores de tienda y trabajadores del establecimiento.
            </p>
          </div>
        </div>
      </div>

      {/* Right — Login form */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-md space-y-6">
          {/* Botón superior móvil para volver */}
          <div className="lg:hidden flex justify-between items-center">
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-primary-600 font-medium"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Ir a Reservas</span>
            </Link>
          </div>

          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 mb-2">
              <KeyRound className="w-3.5 h-3.5 text-primary-500" />
              <span>Panel de Control Interno</span>
            </div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
              Iniciar Sesión
            </h2>
            <p className="text-slate-500 dark:text-slate-400 text-xs mt-1">
              Ingresa tus credenciales autorizadas para acceder al sistema
            </p>
          </div>

          {/* Formulario */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Correo electrónico"
              type="email"
              placeholder="tu@negocio.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              leftIcon={<Mail className="w-4 h-4" />}
              autoComplete="email"
              required
            />
            <Input
              label="Contraseña"
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              leftIcon={<Lock className="w-4 h-4" />}
              rightIcon={
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="hover:text-slate-600 dark:hover:text-slate-200"
                  aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              }
              autoComplete="current-password"
              required
            />

            <Button type="submit" className="w-full font-bold" isLoading={isLoading} size="lg">
              Entrar al Panel
            </Button>
          </form>

          {/* Selector Rápido de Credenciales Demo (Admin Supremo, Admin Tienda, Trabajador) */}
          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Credenciales Demo Rápidas (1 Clic)
              </span>
              <Badge variant="outline">Simulación LocalStorage</Badge>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {/* Botón Admin Supremo */}
              <button
                type="button"
                onClick={() => handleAutoCompletar('supremo@sagitta.app', 'Supremo123!')}
                className="p-2.5 rounded-xl border border-purple-200 dark:border-purple-900/60 bg-purple-50/50 dark:bg-purple-950/30 hover:bg-purple-100/70 dark:hover:bg-purple-900/40 text-left transition-all group"
              >
                <div className="flex items-center gap-1.5 text-purple-700 dark:text-purple-300 font-bold text-xs mb-0.5">
                  <ShieldAlert className="w-3.5 h-3.5" />
                  <span>Supremo</span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                  supremo@sagitta.app
                </p>
              </button>

              {/* Botón Admin Tienda */}
              <button
                type="button"
                onClick={() => handleAutoCompletar('admin@sagitta.com', 'Admin123!')}
                className="p-2.5 rounded-xl border border-blue-200 dark:border-blue-900/60 bg-blue-50/50 dark:bg-blue-950/30 hover:bg-blue-100/70 dark:hover:bg-blue-900/40 text-left transition-all group"
              >
                <div className="flex items-center gap-1.5 text-blue-700 dark:text-blue-300 font-bold text-xs mb-0.5">
                  <Building2 className="w-3.5 h-3.5" />
                  <span>Admin Tienda</span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                  admin@sagitta.com
                </p>
              </button>

              {/* Botón Trabajador */}
              <button
                type="button"
                onClick={() => handleAutoCompletar('empleado@tienda.com', 'Empleado123!')}
                className="p-2.5 rounded-xl border border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/50 dark:bg-emerald-950/30 hover:bg-emerald-100/70 dark:hover:bg-emerald-900/40 text-left transition-all group"
              >
                <div className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-300 font-bold text-xs mb-0.5">
                  <Briefcase className="w-3.5 h-3.5" />
                  <span>Trabajador</span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                  empleado@tienda.com
                </p>
              </button>
            </div>
          </div>

          <div className="text-center pt-2">
            <Link
              to="/"
              className="text-xs text-slate-500 hover:text-primary-600 dark:hover:text-primary-400 font-medium inline-flex items-center gap-1"
            >
              <span>← Volver al Portal Público de Reservas</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
