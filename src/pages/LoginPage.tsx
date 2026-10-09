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
    <main className="min-h-screen bg-[#F8F9FA] dark:bg-[#09090B]">
      <div className="w-full max-w-4xl mx-auto min-h-screen flex items-center justify-center p-4 sm:p-6">
        <section className="w-full bg-white dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-xl overflow-hidden grid grid-cols-1 md:grid-cols-12">
        <aside className="md:col-span-5 p-6 sm:p-8 lg:p-10 bg-zinc-50 dark:bg-zinc-950/50 border-b md:border-b-0 md:border-r border-zinc-200 dark:border-zinc-800 flex flex-col justify-between gap-8">
          <div className="space-y-8">
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-xs font-medium text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Volver al portal</span>
            </Link>

            <div className="space-y-5">
              <div className="flex items-center gap-3">
                {configuracion.logo_url ? (
                  <img src={configuracion.logo_url} alt={nombreMarca} className="max-h-12 max-w-32 object-contain" />
                ) : (
                  <div className="w-11 h-11 rounded-xl bg-zinc-900 dark:bg-zinc-100 text-zinc-50 dark:text-zinc-900 flex items-center justify-center">
                    <CalendarDays className="w-5 h-5" />
                  </div>
                )}
                <div>
                  <h1 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">{nombreMarca}</h1>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">Gestión clara para tu negocio</p>
                </div>
              </div>

              <Badge variant="outline" className="bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700">
                Plataforma Multi-Industria
              </Badge>
              <p className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
                {lemaMarca || 'Una sola plataforma para organizar ventas, equipo, inventario y atención.'}
              </p>
            </div>
          </div>

          <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/70 p-4 space-y-3">
            <div className="flex items-center gap-2 text-sm font-semibold text-zinc-900 dark:text-zinc-100">
              <ShieldAlert className="w-4 h-4 text-zinc-500" />
              <span>Acceso seguro y por roles</span>
            </div>
            <p className="text-xs leading-relaxed text-zinc-500 dark:text-zinc-400">
              Cada integrante accede únicamente a las herramientas que necesita para trabajar.
            </p>
            <div className="flex flex-wrap gap-2 pt-1">
              {['Gastronomía', 'Retail', 'Farmacias', 'Bienestar'].map((sector) => (
                <span key={sector} className="px-2.5 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800 text-[11px] font-medium text-zinc-600 dark:text-zinc-300">
                  {sector}
                </span>
              ))}
            </div>
          </div>
        </aside>

        <div className="md:col-span-7 p-6 sm:p-8 lg:p-10">
          <div className="max-w-md mx-auto space-y-6">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 mb-3">
                <KeyRound className="w-3.5 h-3.5" />
                <span>Panel de Control</span>
              </div>
              <h2 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
                Iniciar sesión
              </h2>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
                Ingresa tus credenciales para continuar.
              </p>
            </div>

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
                className="rounded-xl border-zinc-200 bg-zinc-50 px-3.5 py-2.5 text-sm dark:border-zinc-800 dark:bg-zinc-950/50"
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
                    className="pointer-events-auto hover:text-zinc-900 dark:hover:text-zinc-100"
                    aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                }
                autoComplete="current-password"
                required
                className="rounded-xl border-zinc-200 bg-zinc-50 px-3.5 py-2.5 text-sm dark:border-zinc-800 dark:bg-zinc-950/50"
              />

              <Button
                type="submit"
                className="w-full rounded-xl bg-zinc-900 text-zinc-50 hover:bg-zinc-800 active:scale-[0.98] transition-all font-medium shadow-sm dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white"
                isLoading={isLoading}
                size="lg"
              >
                Iniciar Sesión
              </Button>
            </form>

            <div className="pt-5 border-t border-zinc-200 dark:border-zinc-800 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-xs font-semibold text-zinc-600 dark:text-zinc-300">Acceso rápido de demostración</span>
                <Badge variant="outline" className="text-[10px]">Entorno local</Badge>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => handleAutoCompletar('supremo@demo.app', 'Supremo123!')}
                  className="inline-flex items-center gap-1.5 rounded-full border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/70 px-3 py-2 text-xs font-medium text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                >
                  <ShieldAlert className="w-3.5 h-3.5" /> Supremo
                </button>
                <button
                  type="button"
                  onClick={() => handleAutoCompletar('admin@demo.app', 'Admin123!')}
                  className="inline-flex items-center gap-1.5 rounded-full border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/70 px-3 py-2 text-xs font-medium text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                >
                  <Building2 className="w-3.5 h-3.5" /> Admin tienda
                </button>
                <button
                  type="button"
                  onClick={() => handleAutoCompletar('empleado@tienda.com', 'Empleado123!')}
                  className="inline-flex items-center gap-1.5 rounded-full border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/70 px-3 py-2 text-xs font-medium text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                >
                  <Briefcase className="w-3.5 h-3.5" /> Equipo
                </button>
              </div>
            </div>
          </div>
        </div>
        </section>
      </div>
    </main>
  )
}
