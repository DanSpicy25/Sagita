import { useState, useEffect, useCallback } from 'react'
import {
  Shield,
  Lock,
  Plus,
  Edit2,
  Trash2,
  Users,
  Save,
  X,
  CheckSquare,
  Square,
  AlertCircle,
  RefreshCw,
} from 'lucide-react'
import { Badge, Button, Loader, Modal, Input, Textarea, EmptyState, FirstUseHint } from '@/components/ui'
import { rolesService } from '@/services/roles.service'
import { Rol, Permiso } from '@/types'

// ─── Helpers ────────────────────────────────────────────────────────────────

const MODULO_LABELS: Record<string, string> = {
  appointments: 'Citas',
  clients:      'Clientes',
  services:     'Servicios',
  employees:    'Empleados',
  sales:        'Ventas',
  inventory:    'Inventario',
  reports:      'Reportes',
  settings:     'Configuración',
  users:        'Usuarios',
  roles:        'Roles',
}

const MODULO_ORDER = [
  'appointments', 'clients', 'services', 'employees',
  'sales', 'inventory', 'reports', 'settings', 'users', 'roles',
]

function groupByModulo(permisos: Permiso[]): Record<string, Permiso[]> {
  const groups: Record<string, Permiso[]> = {}
  MODULO_ORDER.forEach((m) => { groups[m] = [] })
  permisos.forEach((p) => {
    if (!groups[p.modulo]) groups[p.modulo] = []
    groups[p.modulo].push(p)
  })
  return groups
}

// ─── Role Card ───────────────────────────────────────────────────────────────

interface RolCardProps {
  rol: Rol
  selected: boolean
  onSelect: () => void
  onEdit: () => void
  onDelete: () => void
}

function RolCard({ rol, selected, onSelect, onEdit, onDelete }: RolCardProps) {
  return (
    <article className={`rounded-lg border transition-colors ${
      selected
        ? 'border-primary-500 bg-primary-50/60 shadow-sm dark:bg-primary-900/20'
        : 'border-slate-200 bg-white hover:border-slate-300 dark:border-slate-700 dark:bg-slate-800/40 dark:hover:border-slate-600'
    }`}>
      <div className="flex items-center gap-3 p-3.5">
        <button
          type="button"
          onClick={onSelect}
          aria-pressed={selected}
          className="flex min-w-0 flex-1 items-start gap-3 rounded text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
        >
          <span className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-md ${
            rol.es_sistema
              ? 'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300'
              : 'bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300'
          }`}>
            {rol.es_sistema ? <Lock className="h-4 w-4" /> : <Shield className="h-4 w-4" />}
          </span>
          <span className="min-w-0 flex-1">
            <span className="flex flex-wrap items-center gap-2">
              <span className="truncate text-sm font-semibold text-slate-900 dark:text-slate-100">
                {rol.nombre}
              </span>
              <Badge variant={rol.activo ? 'success' : 'default'} size="sm">
                {rol.activo ? 'Activo' : 'Inactivo'}
              </Badge>
            </span>
            <span className="mt-1 block line-clamp-2 text-xs leading-5 text-slate-500 dark:text-slate-400">
              {rol.descripcion}
            </span>
            <span className="mt-2 flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
              <Users className="h-3.5 w-3.5" />
              {rol.usuarios_count} usuario{rol.usuarios_count !== 1 ? 's' : ''}
              {rol.es_sistema && <span className="text-slate-400">· Sistema</span>}
            </span>
          </span>
        </button>

        {!rol.es_sistema && (
          <div className="flex shrink-0 items-center gap-1 self-start">
            <button
              type="button"
              onClick={onEdit}
              className="rounded-md p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-primary-700 dark:hover:bg-slate-700"
              title={`Editar ${rol.nombre}`}
              aria-label={`Editar ${rol.nombre}`}
            >
              <Edit2 className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={onDelete}
              className="rounded-md p-2 text-slate-500 transition-colors hover:bg-red-50 hover:text-red-700 dark:hover:bg-red-900/20"
              title={`Eliminar ${rol.nombre}`}
              aria-label={`Eliminar ${rol.nombre}`}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        )}
      </div>
    </article>
  )
}

// ─── Permission Editor ────────────────────────────────────────────────────────

interface PermissionEditorProps {
  rol: Rol
  permisos: Permiso[]
  onSave: (rolId: number, permisoIds: string[]) => Promise<void>
  saving: boolean
}

function PermissionEditor({ rol, permisos, onSave, saving }: PermissionEditorProps) {
  const [selected, setSelected] = useState<Set<string>>(new Set(rol.permisos))

  // Sync when rol changes
  useEffect(() => {
    setSelected(new Set(rol.permisos))
  }, [rol.id, rol.permisos])

  const groups = groupByModulo(permisos)
  const isDirty = [...selected].sort().join() !== [...rol.permisos].sort().join()

  function togglePermiso(id: string) {
    if (rol.es_sistema) return
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function toggleModulo(modulo: string) {
    if (rol.es_sistema) return
    const moduloPermisos = groups[modulo]?.map((p) => p.id) ?? []
    const allSelected = moduloPermisos.every((id) => selected.has(id))
    setSelected((prev) => {
      const next = new Set(prev)
      moduloPermisos.forEach((id) => {
        if (allSelected) next.delete(id)
        else next.add(id)
      })
      return next
    })
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="font-bold text-base text-slate-900 dark:text-slate-100 flex items-center gap-2">
            {rol.es_sistema ? <Lock className="w-4 h-4 text-amber-500" /> : <Shield className="w-4 h-4 text-primary-500" />}
            {rol.nombre}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{rol.descripcion}</p>
        </div>
        {!rol.es_sistema && isDirty && (
          <Button
            size="sm"
            leftIcon={<Save className="w-4 h-4" />}
            onClick={() => onSave(rol.id, [...selected])}
            disabled={saving}
          >
            {saving ? 'Guardando…' : 'Guardar'}
          </Button>
        )}
      </div>

      {rol.es_sistema && (
        <div className="mb-4 flex items-center gap-2 rounded-md border border-amber-200 bg-amber-50 p-3 dark:border-amber-700 dark:bg-amber-900/20">
          <Lock className="w-4 h-4 text-amber-600 dark:text-amber-400 flex-shrink-0" />
          <p className="text-xs text-amber-700 dark:text-amber-300">
            Los roles del sistema son de solo lectura y no pueden modificarse.
          </p>
        </div>
      )}

      <div className="flex-1 space-y-4 overflow-y-auto pr-1">
        {MODULO_ORDER.map((modulo) => {
          const mPermisos = groups[modulo]
          if (!mPermisos || mPermisos.length === 0) return null
          const allChecked = mPermisos.every((p) => selected.has(p.id))
          const someChecked = mPermisos.some((p) => selected.has(p.id))

          return (
            <div key={modulo} className="border-b border-slate-200 pb-4 last:border-0 last:pb-0 dark:border-slate-700">
              {/* Module header */}
              <button
                onClick={() => toggleModulo(modulo)}
                disabled={rol.es_sistema}
                className="flex items-center gap-2 w-full text-left mb-3 group disabled:cursor-default"
              >
                <span className={`w-4 h-4 flex-shrink-0 ${rol.es_sistema ? 'text-slate-300 dark:text-slate-600' : 'text-primary-500'}`}>
                  {allChecked
                    ? <CheckSquare className="w-4 h-4" />
                    : someChecked
                      ? <CheckSquare className="w-4 h-4 opacity-50" />
                      : <Square className="w-4 h-4" />
                  }
                </span>
                <span className="font-semibold text-sm text-slate-900 dark:text-slate-100">
                  {MODULO_LABELS[modulo] ?? modulo}
                </span>
                <span className="text-xs text-slate-400 ml-auto">
                  {mPermisos.filter((p) => selected.has(p.id)).length}/{mPermisos.length}
                </span>
              </button>

              {/* Permission checkboxes */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pl-6">
                {mPermisos.map((p) => (
                  <label
                    key={p.id}
                    className={`flex items-center gap-2 text-xs cursor-pointer rounded-lg px-2 py-1.5 transition-colors ${
                      rol.es_sistema
                        ? 'cursor-default'
                        : 'hover:bg-slate-50 dark:hover:bg-slate-800/40'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={selected.has(p.id)}
                      onChange={() => togglePermiso(p.id)}
                      disabled={rol.es_sistema}
                      className="rounded border-slate-300 text-primary-600 focus:ring-primary-500 disabled:opacity-50"
                    />
                    <span className="text-slate-700 dark:text-slate-300">{p.descripcion}</span>
                  </label>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ─── Create / Edit Modal ──────────────────────────────────────────────────────

interface RolFormData {
  nombre: string
  descripcion: string
}

interface RolModalProps {
  open: boolean
  onClose: () => void
  onSubmit: (data: RolFormData) => Promise<void>
  initial?: Partial<RolFormData>
  title: string
  submitting: boolean
}

function RolModal({ open, onClose, onSubmit, initial, title, submitting }: RolModalProps) {
  const [form, setForm] = useState<RolFormData>({ nombre: '', descripcion: '' })

  useEffect(() => {
    if (open) {
      setForm({ nombre: initial?.nombre ?? '', descripcion: initial?.descripcion ?? '' })
    }
  }, [open, initial?.nombre, initial?.descripcion])

  return (
    <Modal isOpen={open} onClose={onClose} title={title} size="sm">
      <form
        onSubmit={(e) => {
          e.preventDefault()
          onSubmit(form)
        }}
        className="space-y-4"
      >
        <Input
          label="Nombre del Rol"
          value={form.nombre}
          onChange={(e) => setForm((f) => ({ ...f, nombre: e.target.value }))}
          required
          placeholder="Ej: Coordinador de Agenda"
        />
        <Textarea
          label="Descripción"
          value={form.descripcion}
          onChange={(e) => setForm((f) => ({ ...f, descripcion: e.target.value }))}
          rows={3}
          placeholder="Describe brevemente las responsabilidades de este rol…"
        />
        <div className="flex gap-2 border-t border-slate-200 pt-4 dark:border-slate-700">
          <Button type="button" variant="ghost" onClick={onClose} className="flex-1">
            <X className="w-4 h-4 mr-1" /> Cancelar
          </Button>
          <Button type="submit" disabled={submitting || !form.nombre.trim()} className="flex-1">
            {submitting ? 'Guardando…' : 'Guardar'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}

// ─── Delete Confirm Modal ─────────────────────────────────────────────────────

interface DeleteModalProps {
  open: boolean
  rol: Rol | null
  onClose: () => void
  onConfirm: () => Promise<void>
  deleting: boolean
}

function DeleteModal({ open, rol, onClose, onConfirm, deleting }: DeleteModalProps) {
  return (
    <Modal isOpen={open} onClose={onClose} title="Eliminar Rol" size="sm">
      <div className="space-y-4">
        <p className="text-sm text-slate-600 dark:text-slate-300">
          ¿Estás seguro de que deseas eliminar el rol{' '}
          <span className="font-semibold text-slate-900 dark:text-slate-100">"{rol?.nombre}"</span>?
          Esta acción no se puede deshacer.
        </p>
        <div className="flex gap-2">
          <Button type="button" variant="ghost" onClick={onClose} className="flex-1">
            Cancelar
          </Button>
          <Button
            type="button"
            variant="danger"
            onClick={onConfirm}
            disabled={deleting}
            className="flex-1"
          >
            {deleting ? 'Eliminando…' : 'Eliminar'}
          </Button>
        </div>
      </div>
    </Modal>
  )
}

// ─── Main Page ───────────────────────────────────────────────────────────────

export default function RolesPage() {
  const [roles, setRoles] = useState<Rol[]>([])
  const [permisos, setPermisos] = useState<Permiso[]>([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [selectedRol, setSelectedRol] = useState<Rol | null>(null)

  // Modal state
  const [showCreate, setShowCreate] = useState(false)
  const [editRol, setEditRol] = useState<Rol | null>(null)
  const [deleteRol, setDeleteRol] = useState<Rol | null>(null)

  // Operation states
  const [submitting, setSubmitting] = useState(false)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const load = useCallback(async () => {
    try {
      const [rRoles, rPermisos] = await Promise.all([
        rolesService.getRoles(),
        rolesService.getPermisos(),
      ])
      if (rRoles.data) {
        setRoles(rRoles.data)
        if (!selectedRol && rRoles.data.length > 0) {
          setSelectedRol(rRoles.data[0])
        }
      }
      if (rPermisos.data) setPermisos(rPermisos.data)
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setCargando(false)
    }
  }, [selectedRol])

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function handleCreate(data: { nombre: string; descripcion: string }) {
    setSubmitting(true)
    try {
      const res = await rolesService.createRol({ ...data, permisos: [] })
      if (res.data) {
        setRoles((prev) => [...prev, res.data!])
        setSelectedRol(res.data)
      }
      setShowCreate(false)
    } finally {
      setSubmitting(false)
    }
  }

  async function handleEdit(data: { nombre: string; descripcion: string }) {
    if (!editRol) return
    setSubmitting(true)
    try {
      const res = await rolesService.updateRol(editRol.id, data)
      if (res.data) {
        setRoles((prev) => prev.map((r) => r.id === editRol.id ? res.data! : r))
        if (selectedRol?.id === editRol.id) setSelectedRol(res.data)
      }
      setEditRol(null)
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDelete() {
    if (!deleteRol) return
    setDeleting(true)
    try {
      await rolesService.deleteRol(deleteRol.id)
      setRoles((prev) => prev.filter((r) => r.id !== deleteRol.id))
      if (selectedRol?.id === deleteRol.id) setSelectedRol(null)
      setDeleteRol(null)
    } finally {
      setDeleting(false)
    }
  }

  async function handleSavePermisos(rolId: number, permisoIds: string[]) {
    setSaving(true)
    try {
      const res = await rolesService.updateRol(rolId, { permisos: permisoIds })
      if (res.data) {
        setRoles((prev) => prev.map((r) => r.id === rolId ? res.data! : r))
        setSelectedRol(res.data)
      }
    } finally {
      setSaving(false)
    }
  }

  if (cargando) return <Loader text="Cargando roles…" />

  if (error) {
    return (
      <section className="mx-auto max-w-2xl rounded-lg border border-red-200 bg-white p-5 dark:border-red-900 dark:bg-slate-900 sm:p-7" aria-live="polite">
        <div className="flex items-start gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-300">
            <AlertCircle className="h-5 w-5" />
          </span>
          <div className="min-w-0">
            <h1 className="text-base font-semibold text-slate-900 dark:text-slate-100">No se pudieron cargar los roles</h1>
            <p className="mt-1 text-sm leading-6 text-slate-600 dark:text-slate-300">{error}</p>
            <p className="mt-2 text-xs leading-5 text-slate-500 dark:text-slate-400">
              Comprueba la conexión con la API y vuelve a intentarlo.
            </p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              leftIcon={<RefreshCw className="h-4 w-4" />}
              onClick={() => {
                setError(null)
                setCargando(true)
                void load()
              }}
              className="mt-4"
            >
              Reintentar
            </Button>
          </div>
        </div>
      </section>
    )
  }

  return (
    <div className="space-y-5 animate-fade-in">
      <header className="flex flex-col gap-4 border-b border-slate-200 pb-5 dark:border-slate-800 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[10px] font-semibold uppercase text-primary-700 dark:text-primary-300">Acceso y seguridad</p>
          <h1 className="mt-1 font-display text-[30px] leading-tight text-slate-900 dark:text-slate-100">Roles y permisos</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Administra el acceso de cada equipo a Sagitta.
          </p>
        </div>
        <div className="flex items-center justify-between gap-4 sm:justify-end">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            <span className="font-semibold text-slate-800 dark:text-slate-200">{roles.length}</span> roles
          </p>
          <Button
            leftIcon={<Plus className="h-4 w-4" />}
            onClick={() => setShowCreate(true)}
            size="sm"
          >
            Crear rol
          </Button>
        </div>
      </header>

      {/* ── Ayuda Contextual: Principio de Menor Privilegio & Seguridad ── */}
      <FirstUseHint
        hintKey="roles_seguridad"
        title="Principio de Menor Privilegio & Roles del Personal"
        description="Asigna a los empleados únicamente los permisos indispensables para su labor diaria. Los especialistas solo requieren acceso a sus citas y clientes asignados, protegiendo reportes financieros y ajustes del sistema para la administración."
        variant="callout"
      />

      <div className="grid items-start gap-5 lg:grid-cols-[minmax(260px,0.85fr)_minmax(0,1.6fr)]">
        <section className="min-w-0" aria-label="Lista de roles">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">Roles disponibles</h2>
            <span className="text-xs text-slate-400">{roles.length}</span>
          </div>
          {roles.length === 0 ? (
            <EmptyState
              title="Sin roles"
              description="Crea tu primer rol personalizado."
              icon={<Shield className="w-8 h-8 text-slate-300" />}
            />
          ) : (
            roles.map((rol) => (
              <RolCard
                key={rol.id}
                rol={rol}
                selected={selectedRol?.id === rol.id}
                onSelect={() => setSelectedRol(rol)}
                onEdit={() => setEditRol(rol)}
                onDelete={() => setDeleteRol(rol)}
              />
            ))
          )}
        </section>

        <section className="min-w-0" aria-label="Permisos del rol seleccionado">
          {selectedRol ? (
            <div className="card rounded-lg p-4 sm:p-5 lg:sticky lg:top-20">
              <PermissionEditor
                rol={selectedRol}
                permisos={permisos}
                onSave={handleSavePermisos}
                saving={saving}
              />
            </div>
          ) : (
            <div className="card border border-slate-100 dark:border-slate-800 p-10 flex flex-col items-center justify-center text-center gap-3">
              <Shield className="w-10 h-10 text-slate-200 dark:text-slate-700" />
              <p className="text-sm text-slate-400 dark:text-slate-500">
                Selecciona un rol para ver y editar sus permisos
              </p>
            </div>
          )}
        </section>
      </div>

      {/* Modals */}
      <RolModal
        open={showCreate}
        onClose={() => setShowCreate(false)}
        onSubmit={handleCreate}
        title="Crear Nuevo Rol"
        submitting={submitting}
      />

      <RolModal
        open={!!editRol}
        onClose={() => setEditRol(null)}
        onSubmit={handleEdit}
        initial={editRol ?? undefined}
        title="Editar Rol"
        submitting={submitting}
      />

      <DeleteModal
        open={!!deleteRol}
        rol={deleteRol}
        onClose={() => setDeleteRol(null)}
        onConfirm={handleDelete}
        deleting={deleting}
      />
    </div>
  )
}
