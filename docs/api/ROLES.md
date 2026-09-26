# ROLES & PERMISSIONS MODULE API CONTRACT

## Endpoint
`/api/roles`
`/api/roles/:id`
`/api/permisos`

## Method
- `GET /api/roles` — Listar roles definidos en el sistema
- `POST /api/roles` — Crear nuevo rol personalizado
- `GET /api/roles/:id` — Detalle del rol y permisos asociados
- `PUT /api/roles/:id` — Actualizar nombre, descripción o matriz de permisos
- `DELETE /api/roles/:id` — Eliminar rol (sólo si no es rol de sistema y no tiene usuarios asignados)
- `GET /api/permisos` — Catálogo maestro de permisos granulares del sistema

## Authentication
Bearer JWT Token requerido.

## Required Permission
- Gestión de roles: `roles.manage` (reservado para Superadmin).

## Request
```json
{
  "nombre": "Encargado de Almacén",
  "descripcion": "Gestión exclusiva de inventario, stock y proveedores",
  "permisos": [
    "inventory.read",
    "inventory.manage",
    "reports.read"
  ]
}
```

## Response
```json
{
  "success": true,
  "message": "Rol creado exitosamente",
  "data": {
    "id": 5,
    "nombre": "Encargado de Almacén",
    "descripcion": "Gestión exclusiva de inventario, stock y proveedores",
    "permisos": [
      "inventory.read",
      "inventory.manage",
      "reports.read"
    ],
    "activo": true,
    "usuarios_count": 0,
    "es_sistema": false,
    "created_at": "2026-09-25T20:40:00Z"
  }
}
```

## Business Rules
1. Los roles marcados con `es_sistema: true` (`Superadmin`, `Administrador`) están protegidos; la API debe retornar `403 Forbidden` ante cualquier intento de eliminación o modificación de permisos críticos.
2. Un rol asignado a uno o más usuarios no puede ser eliminado; la API debe retornar `409 Conflict`.
