import { http, HttpResponse } from 'msw'
import { Permiso, Rol } from '@/types'

import { API_BASE_URL as BASE } from '@/config/environment'

// ─── Mock Data ─────────────────────────────────────────────────────────────

export const MOCK_PERMISOS: Permiso[] = [
  // appointments
  { id: 'appointments.read',   modulo: 'appointments', accion: 'read',   descripcion: 'Ver citas' },
  { id: 'appointments.create', modulo: 'appointments', accion: 'create', descripcion: 'Crear citas' },
  { id: 'appointments.update', modulo: 'appointments', accion: 'update', descripcion: 'Editar citas' },
  { id: 'appointments.delete', modulo: 'appointments', accion: 'delete', descripcion: 'Eliminar citas' },
  // clients
  { id: 'clients.read',   modulo: 'clients', accion: 'read',   descripcion: 'Ver clientes' },
  { id: 'clients.create', modulo: 'clients', accion: 'create', descripcion: 'Crear clientes' },
  { id: 'clients.update', modulo: 'clients', accion: 'update', descripcion: 'Editar clientes' },
  { id: 'clients.delete', modulo: 'clients', accion: 'delete', descripcion: 'Eliminar clientes' },
  // services
  { id: 'services.read',   modulo: 'services', accion: 'read',   descripcion: 'Ver servicios' },
  { id: 'services.create', modulo: 'services', accion: 'create', descripcion: 'Crear servicios' },
  { id: 'services.update', modulo: 'services', accion: 'update', descripcion: 'Editar servicios' },
  // employees
  { id: 'employees.read',   modulo: 'employees', accion: 'read',   descripcion: 'Ver empleados' },
  { id: 'employees.manage', modulo: 'employees', accion: 'manage', descripcion: 'Gestionar empleados' },
  // sales
  { id: 'sales.read',   modulo: 'sales', accion: 'read',   descripcion: 'Ver ventas' },
  { id: 'sales.create', modulo: 'sales', accion: 'create', descripcion: 'Crear ventas' },
  // inventory
  { id: 'inventory.read',   modulo: 'inventory', accion: 'read',   descripcion: 'Ver inventario' },
  { id: 'inventory.manage', modulo: 'inventory', accion: 'manage', descripcion: 'Gestionar inventario' },
  // reports
  { id: 'reports.read', modulo: 'reports', accion: 'read', descripcion: 'Ver reportes' },
  // settings
  { id: 'settings.manage', modulo: 'settings', accion: 'manage', descripcion: 'Gestionar configuración' },
  // users
  { id: 'users.manage', modulo: 'users', accion: 'manage', descripcion: 'Gestionar usuarios' },
  // roles
  { id: 'roles.manage', modulo: 'roles', accion: 'manage', descripcion: 'Gestionar roles' },
]

const ALL_PERM_IDS = MOCK_PERMISOS.map((p) => p.id)

export let MOCK_ROLES: Rol[] = [
  {
    id: 1,
    nombre: 'Superadmin',
    descripcion: 'Acceso total al sistema. No puede ser modificado.',
    permisos: ALL_PERM_IDS,
    activo: true,
    usuarios_count: 1,
    created_at: '2025-01-01T00:00:00Z',
    es_sistema: true,
  },
  {
    id: 2,
    nombre: 'Administrador',
    descripcion: 'Acceso a la mayoría de módulos excepto la gestión de roles del sistema.',
    permisos: ALL_PERM_IDS.filter((id) => id !== 'roles.manage'),
    activo: true,
    usuarios_count: 2,
    created_at: '2025-01-02T00:00:00Z',
    es_sistema: true,
  },
  {
    id: 3,
    nombre: 'Recepcionista',
    descripcion: 'Puede gestionar citas y clientes, pero no ver reportes ni configuración.',
    permisos: [
      'appointments.read',
      'appointments.create',
      'appointments.update',
      'clients.read',
      'clients.create',
      'services.read',
    ],
    activo: true,
    usuarios_count: 3,
    created_at: '2025-01-03T00:00:00Z',
    es_sistema: false,
  },
  {
    id: 4,
    nombre: 'Empleado',
    descripcion: 'Solo puede ver las citas asignadas.',
    permisos: ['appointments.read'],
    activo: true,
    usuarios_count: 5,
    created_at: '2025-01-04T00:00:00Z',
    es_sistema: false,
  },
]

// ─── Handlers ──────────────────────────────────────────────────────────────

export const rolesHandlers = [
  // Permisos
  http.get(`${BASE}/permisos`, () =>
    HttpResponse.json({ success: true, message: 'OK', data: MOCK_PERMISOS })
  ),

  // Roles list
  http.get(`${BASE}/roles`, () =>
    HttpResponse.json({ success: true, message: 'OK', data: MOCK_ROLES })
  ),

  // Rol by id
  http.get(`${BASE}/roles/:id`, ({ params }) => {
    const rol = MOCK_ROLES.find((r) => r.id === Number(params.id))
    if (!rol) return HttpResponse.json({ success: false, message: 'No encontrado' }, { status: 404 })
    return HttpResponse.json({ success: true, message: 'OK', data: rol })
  }),

  // Create rol
  http.post(`${BASE}/roles`, async ({ request }) => {
    const body = (await request.json()) as Partial<Rol>
    const nuevo: Rol = {
      id: Date.now(),
      nombre: body.nombre ?? 'Nuevo Rol',
      descripcion: body.descripcion ?? '',
      permisos: body.permisos ?? [],
      activo: true,
      usuarios_count: 0,
      created_at: new Date().toISOString(),
      es_sistema: false,
    }
    MOCK_ROLES.push(nuevo)
    return HttpResponse.json({ success: true, message: 'Rol creado', data: nuevo }, { status: 201 })
  }),

  // Update rol
  http.put(`${BASE}/roles/:id`, async ({ params, request }) => {
    const body = (await request.json()) as Partial<Rol>
    const idx = MOCK_ROLES.findIndex((r) => r.id === Number(params.id))
    if (idx === -1)
      return HttpResponse.json({ success: false, message: 'No encontrado' }, { status: 404 })
    MOCK_ROLES[idx] = { ...MOCK_ROLES[idx], ...body }
    return HttpResponse.json({ success: true, message: 'Rol actualizado', data: MOCK_ROLES[idx] })
  }),

  // Delete rol
  http.delete(`${BASE}/roles/:id`, ({ params }) => {
    const rol = MOCK_ROLES.find((r) => r.id === Number(params.id))
    if (!rol) return HttpResponse.json({ success: false, message: 'No encontrado' }, { status: 404 })
    if (rol.es_sistema)
      return HttpResponse.json({ success: false, message: 'No se puede eliminar un rol del sistema' }, { status: 403 })
    MOCK_ROLES = MOCK_ROLES.filter((r) => r.id !== Number(params.id))
    return HttpResponse.json({ success: true, message: 'Rol eliminado' })
  }),
]
