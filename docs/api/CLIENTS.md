# CLIENTS MODULE API CONTRACT

## Endpoint
`/api/clientes`
`/api/clientes/:id`

## Method
- `GET /api/clientes` — Listar clientes con búsqueda reactiva
- `POST /api/clientes` — Crear nuevo cliente
- `GET /api/clientes/:id` — Detalle de cliente
- `PUT /api/clientes/:id` — Actualizar cliente
- `DELETE /api/clientes/:id` — Eliminar cliente

## Authentication
Bearer JWT Token requerido en cabecera `Authorization: Bearer <access_token>`.

## Required Permission
- Listar/Ver: `clients.read`
- Crear: `clients.create`
- Actualizar: `clients.update`
- Eliminar: `clients.delete`

## Request

### Crear Cliente (`POST /api/clientes`)
```json
{
  "nombre": "Mariana Gómez",
  "email": "mariana@example.com",
  "telefono": "+1 555-0199",
  "timezone": "America/New_York",
  "notas": "Preferencia por turnos en la mañana"
}
```

### Actualizar Cliente (`PUT /api/clientes/:id`)
```json
{
  "nombre": "Mariana Gómez Silva",
  "telefono": "+1 555-0200",
  "notas": "Alergia a ciertos aceites"
}
```

## Response

### Éxito (`200 OK` / `201 Created`)
```json
{
  "success": true,
  "message": "Cliente registrado exitosamente",
  "data": {
    "id": 15,
    "nombre": "Mariana Gómez",
    "email": "mariana@example.com",
    "telefono": "+1 555-0199",
    "timezone": "America/New_York",
    "notas": "Preferencia por turnos en la mañana",
    "total_citas": 0,
    "created_at": "2026-09-25T20:00:00Z"
  }
}
```

## Errors
- `400 Bad Request`: Formato de email inválido o campos requeridos ausentes.
- `401 Unauthorized`: Token ausente o expirado.
- `403 Forbidden`: Permiso `clients.*` insuficientes.
- `404 Not Found`: ID de cliente no existe en la base de datos.
- `409 Conflict`: Ya existe un cliente registrado con el mismo email en este tenant.

Ejemplo:
```json
{
  "success": false,
  "message": "Ya existe un cliente con este correo electrónico",
  "errors": {
    "email": ["El correo electrónico ya está en uso."]
  }
}
```

## Pagination
Soporta parámetros `?page=1&per_page=20`.
Respuesta paginada incluye el objeto `meta`:
```json
"meta": {
  "total": 45,
  "per_page": 20,
  "current_page": 1,
  "last_page": 3
}
```

## Filters
- `q`: Búsqueda textual por nombre, email o teléfono (`?q=mariana`).

## Sorting
- `sort`: `nombre`, `created_at`, `total_citas`.
- `order`: `asc`, `desc` (predeterminado: `desc`).

## Business Rules
1. Los clientes pertenecen estrictamente al tenant activo del token JWT (`tenant_id`).
2. El conteo `total_citas` debe calcularse dinámicamente o mantenerse sincronizado con la tabla de citas.
3. No se debe permitir eliminar un cliente que tenga citas activas o facturas pendientes; se recomienda borrado lógico (`deleted_at`).

## Frontend Expectations
El frontend actualiza en caliente el listado y maneja estados vacíos cuando `data.length === 0`.
