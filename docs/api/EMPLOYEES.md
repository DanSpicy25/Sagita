# EMPLOYEES MODULE API CONTRACT

## Endpoint
`/api/empleados`
`/api/empleados/:id`
`/api/empleados/:id/horarios`

## Method
- `GET /api/empleados` — Listar profesionales y empleados
- `POST /api/empleados` — Registrar empleado
- `GET /api/empleados/:id` — Perfil y horario de empleado
- `PUT /api/empleados/:id` — Actualizar datos de empleado
- `PUT /api/empleados/:id/horarios` — Actualizar jornada semanal

## Authentication
Bearer JWT Token requerido.

## Required Permission
- Lectura: `employees.read`
- Gestión: `employees.manage`

## Request
```json
{
  "usuario_id": 4,
  "nombre": "Dra. Laura Gómez",
  "email": "laura@sagitta.com",
  "especialidad": "Dermatología",
  "bio": "Médica dermatóloga con 8 años de trayectoria.",
  "activo": true
}
```

## Response
```json
{
  "success": true,
  "message": "Empleado creado",
  "data": {
    "id": 2,
    "usuario_id": 4,
    "nombre": "Dra. Laura Gómez",
    "email": "laura@sagitta.com",
    "especialidad": "Dermatología",
    "bio": "Médica dermatóloga con 8 años de trayectoria.",
    "activo": true
  }
}
```

## Business Rules
- Un empleado puede existir independientemente de tener una cuenta de usuario (`usuario_id` opcional).
- Si el empleado se desactiva (`activo: false`), sus turnos futuros en el agendador deben ser bloqueados.
- Cada día de semana (`dia_semana`: 0 a 6) define un rango de `hora_inicio` y `hora_fin`.
