import { useState, useEffect, useMemo } from 'react'
import {
  Users,
  UserPlus,
  ShieldCheck,
  ShieldAlert,
  Building2,
  Briefcase,
  Search,
  CheckCircle2,
  XCircle,
  Trash2,
  AlertCircle,
  Phone,
  Mail,
  Lock,
} from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useToast } from '@/hooks/useToast'
import { Button, Input, Modal, Badge, Loader } from '@/components/ui'
import { usuariosService } from '@/services/usuarios.service'
import { UsuarioGestion, UserRole, CrearUsuarioPayload } from '@/types'

export default function UsuariosPage() {
  const { user: currentUser } = useAuth()
  const { toast } = useToast()

  const [usuarios, setUsuarios] = useState<UsuarioGestion[]>([])
  const [cargando, setCargando] = useState(true)
  const [busqueda, setBusqueda] = useState('')
  const [filtroRol, setFiltroRol] = useState<string>('todos')

  // Modal nuevo usuario
  const [modalAbierto, setModalAbierto] = useState(false)
  const [guardando, setGuardando] = useState(false)
  const [nuevoNombre, setNuevoNombre] = useState('')
  const [nuevoEmail, setNuevoEmail] = useState('')
  const [nuevoPassword, setNuevoPassword] = useState('')
  const [nuevoRol, setNuevoRol] = useState<UserRole>('empleado')
  const [nuevoTelefono, setNuevoTelefono] = useState('')
  const [nuevaSucursal, setNuevaSucursal] = useState<number>(1)

  // Cargar lista de usuarios
  const cargarUsuarios = async () => {
    setCargando(true)
    try {
      const res = await usuariosService.getAll()
      setUsuarios(res.data ?? [])
    } catch (err) {
      toast.error('Error al cargar usuarios', err instanceof Error ? err.message : '')
    } finally {
      setCargando(false)
    }
  }

  useEffect(() => {
    cargarUsuarios()
  }, [])

  // Filtrado
  const usuariosFiltrados = useMemo(() => {
    return usuarios.filter((u) => {
      const coincideBusqueda =
        u.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
        u.email.toLowerCase().includes(busqueda.toLowerCase())
      const coincideRol = filtroRol === 'todos' || u.rol === filtroRol
      return coincideBusqueda && coincideRol
    })
  }, [usuarios, busqueda, filtroRol])

  // Crear usuario
  const handleCrearUsuario = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!nuevoNombre.trim() || !nuevoEmail.trim() || !nuevoPassword.trim()) {
      toast.warning('Campos obligatorios', 'Por favor llena nombre, email y contraseña')
      return
    }

    setGuardando(true)
    try {
      const payload: CrearUsuarioPayload = {
        nombre: nuevoNombre.trim(),
        email: nuevoEmail.trim().toLowerCase(),
        password: nuevoPassword,
        rol: nuevoRol,
        telefono: nuevoTelefono.trim() || undefined,
        sucursal_id: nuevaSucursal,
      }

      const res = await usuariosService.crear(payload)
      if (res.success && res.data) {
        toast.success(
          'Usuario Creado',
          `Se ha creado el usuario ${res.data.nombre} (${res.data.rol}). Ahora puede iniciar sesión.`
        )
        setModalAbierto(false)
        setNuevoNombre('')
        setNuevoEmail('')
        setNuevoPassword('')
        setNuevoTelefono('')
        setNuevoRol('empleado')
        cargarUsuarios()
      } else {
        toast.error('Error al crear', res.message)
      }
    } catch (err) {
      toast.error('Error', err instanceof Error ? err.message : 'No se pudo crear el usuario')
    } finally {
      setGuardando(false)
    }
  }

  // Desactivar / Activar
  const handleToggleEstado = async (u: UsuarioGestion) => {
    try {
      const res = await usuariosService.actualizar(u.id, { activo: !u.activo })
      if (res.success) {
        toast.info(
          'Estado actualizado',
          `Usuario ${u.nombre} ${!u.activo ? 'activado' : 'desactivado'}`
        )
        cargarUsuarios()
      }
    } catch {
      toast.error('Error', 'No se pudo modificar el estado')
    }
  }

  // Eliminar
  const handleEliminar = async (id: number, nombre: string) => {
    if (id === 1) {
      toast.warning('Protegido', 'No se puede eliminar el usuario Auditor Supremo inicial')
      return
    }
    if (!window.confirm(`¿Estás seguro de que deseas eliminar al usuario ${nombre}?`)) return

    try {
      const res = await usuariosService.eliminar(id)
      if (res.success) {
        toast.success('Eliminado', `Usuario ${nombre} eliminado`)
        cargarUsuarios()
      }
    } catch {
      toast.error('Error', 'No se pudo eliminar el usuario')
    }
  }

  // Renderizar badge de rol
  const renderRolBadge = (rol: UserRole) => {
    switch (rol) {
      case 'superadmin':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
            <ShieldAlert className="w-3.5 h-3.5" />
            Auditor Supremo
          </span>
        )
      case 'admin':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
            <Building2 className="w-3.5 h-3.5" />
            Admin Tienda
          </span>
        )
      case 'empleado':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
            <Briefcase className="w-3.5 h-3.5" />
            Trabajador / Profesional
          </span>
        )
      case 'recepcionista':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
            <Users className="w-3.5 h-3.5" />
            Recepción
          </span>
        )
      default:
        return <Badge>{rol}</Badge>
    }
  }

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              Gestión de Usuarios y Trabajadores
            </h1>
            <Badge variant="outline">Multi-Rol & LocalStorage</Badge>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Administra los auditores supremos, administradores de tienda y trabajadores con acceso al sistema
          </p>
        </div>

        <Button onClick={() => setModalAbierto(true)} className="gap-2 shrink-0">
          <UserPlus className="w-4 h-4" />
          <span>Nuevo Usuario / Trabajador</span>
        </Button>
      </div>

      {/* Banner Informativo */}
      <div className="bg-gradient-to-r from-primary-50 to-indigo-50 dark:from-slate-900 dark:to-slate-800/80 p-4 rounded-2xl border border-primary-100 dark:border-slate-800 flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-primary-600 dark:text-primary-400 shrink-0 mt-0.5" />
        <div className="text-xs text-slate-600 dark:text-slate-300 space-y-1">
          <p className="font-semibold text-slate-900 dark:text-white">
            Persistencia Activa en LocalStorage & Lista para Backend PHP/MySQL
          </p>
          <p>
            Cualquier nuevo administrador o trabajador que registres aquí se guardará en tu navegador y podrá iniciar sesión inmediatamente en la pantalla de login con su correo y contraseña asignada.
          </p>
        </div>
      </div>

      {/* Filtros y Buscador */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="w-full sm:w-80">
          <Input
            placeholder="Buscar por nombre o correo..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            leftIcon={<Search className="w-4 h-4" />}
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1">
          {['todos', 'superadmin', 'admin', 'empleado', 'recepcionista'].map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setFiltroRol(r)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                filtroRol === r
                  ? 'bg-primary-600 text-white shadow-sm'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:border-slate-300'
              }`}
            >
              {r === 'todos'
                ? 'Todos los roles'
                : r === 'superadmin'
                ? 'Supremos'
                : r === 'admin'
                ? 'Admins'
                : r === 'empleado'
                ? 'Trabajadores'
                : 'Recepción'}
            </button>
          ))}
        </div>
      </div>

      {/* Tabla de Usuarios */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
        {cargando ? (
          <div className="py-16 flex justify-center">
            <Loader text="Cargando directorio de usuarios..." />
          </div>
        ) : usuariosFiltrados.length === 0 ? (
          <div className="text-center py-16">
            <AlertCircle className="w-10 h-10 text-slate-400 mx-auto mb-2" />
            <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
              No se encontraron usuarios con ese criterio
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-semibold uppercase tracking-wider">
                  <th className="py-3.5 px-4">Usuario</th>
                  <th className="py-3.5 px-4">Rol en Sistema</th>
                  <th className="py-3.5 px-4">Sede / Tienda</th>
                  <th className="py-3.5 px-4">Contacto</th>
                  <th className="py-3.5 px-4">Estado</th>
                  <th className="py-3.5 px-4">Último Acceso</th>
                  <th className="py-3.5 px-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                {usuariosFiltrados.map((u) => (
                  <tr
                    key={u.id}
                    className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-950/70 text-primary-700 dark:text-primary-300 font-bold flex items-center justify-center shrink-0">
                          {u.nombre.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 dark:text-white">{u.nombre}</p>
                          <p className="text-slate-500 text-[11px]">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">{renderRolBadge(u.rol)}</td>
                    <td className="py-3.5 px-4 text-slate-700 dark:text-slate-300">
                      {u.sucursal_nombre || 'Sede Principal'}
                    </td>
                    <td className="py-3.5 px-4 text-slate-500">
                      {u.telefono || 'Sin teléfono'}
                    </td>
                    <td className="py-3.5 px-4">
                      {u.activo ? (
                        <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Activo
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-slate-400 font-semibold">
                          <XCircle className="w-3.5 h-3.5" />
                          Inactivo
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 text-[11px]">
                      {u.ultimo_login
                        ? new Date(u.ultimo_login).toLocaleString()
                        : 'Sin accesos aún'}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleToggleEstado(u)}
                          title={u.activo ? 'Desactivar acceso' : 'Activar acceso'}
                        >
                          {u.activo ? 'Desactivar' : 'Activar'}
                        </Button>
                        {u.id !== 1 && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEliminar(u.id, u.nombre)}
                            className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/30"
                            title="Eliminar usuario"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal para Crear Nuevo Usuario / Trabajador */}
      <Modal
        isOpen={modalAbierto}
        onClose={() => setModalAbierto(false)}
        title="Crear Nuevo Usuario o Trabajador"
      >
        <form onSubmit={handleCrearUsuario} className="space-y-4 pt-2">
          <Input
            label="Nombre y Apellidos"
            placeholder="Ej. Sofía Hernández"
            value={nuevoNombre}
            onChange={(e) => setNuevoNombre(e.target.value)}
            required
          />

          <Input
            label="Correo Electrónico"
            type="email"
            placeholder="sofia@negocio.com"
            value={nuevoEmail}
            onChange={(e) => setNuevoEmail(e.target.value)}
            leftIcon={<Mail className="w-4 h-4" />}
            required
          />

          <Input
            label="Contraseña de Acceso"
            type="password"
            placeholder="••••••••"
            value={nuevoPassword}
            onChange={(e) => setNuevoPassword(e.target.value)}
            leftIcon={<Lock className="w-4 h-4" />}
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Rol del Usuario
              </label>
              <select
                value={nuevoRol}
                onChange={(e) => setNuevoRol(e.target.value as UserRole)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-medium focus:ring-2 focus:ring-primary-500 focus:outline-none"
              >
                {currentUser?.rol === 'superadmin' && (
                  <option value="superadmin">🛡️ Auditor Supremo / Superadmin</option>
                )}
                <option value="admin">🏢 Administrador de Tienda</option>
                <option value="empleado">💼 Trabajador / Profesional</option>
                <option value="recepcionista">🛎️ Recepcionista</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Sede / Tienda
              </label>
              <select
                value={nuevaSucursal}
                onChange={(e) => setNuevaSucursal(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-medium focus:ring-2 focus:ring-primary-500 focus:outline-none"
              >
                <option value={1}>Sede Principal - Centro</option>
                <option value={2}>Sucursal Norte</option>
              </select>
            </div>
          </div>

          <Input
            label="Teléfono Móvil (Opcional)"
            placeholder="+1 (555) 019-2834"
            value={nuevoTelefono}
            onChange={(e) => setNuevoTelefono(e.target.value)}
            leftIcon={<Phone className="w-4 h-4" />}
          />

          <div className="pt-4 flex justify-end gap-2 border-t border-slate-100 dark:border-slate-800">
            <Button
              type="button"
              variant="outline"
              onClick={() => setModalAbierto(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" isLoading={guardando} className="font-bold">
              Guardar Usuario
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
