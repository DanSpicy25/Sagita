# APPOINTMENTS MODULE API CONTRACT

## Endpoint
`/api/citas`
`/api/citas/:id`
`/api/citas/disponibilidad`

## Method
- `GET /api/citas` — Listado de citas agendadas
- `POST /api/citas` — Crear nueva cita
- `GET /api/citas/:id` — Detalle de cita
- `PUT /api/citas/:id` — Actualizar o reprogramar cita
- `DELETE /api/citas/:id` — Cancelar cita
- `GET /api/citas/disponibilidad` — Calcular turnos y horarios libres

## Authentication
- Endpoints administrativos: Bearer JWT con permiso `appointments.read` / `appointments.create`.
- Portal público (`/`): Permite `POST /api/citas` y `GET /api/citas/disponibilidad` sin autenticación previa (guest booking).

## Required Permission
- Listar/Ver: `appointments.read`
- Crear: `appointments.create`
- Modificar: `appointments.update`
- Cancelar: `appointments.delete`

## Request

### Crear Cita (`POST /api/citas`)
```json
{
  "cliente_id": 1,
  "empleado_id": 2,
  "servicio_id": 1,
  "duracion_id": 1,
  "fecha_inicio": "2026-09-30T10:00:00Z",
  "fecha_fin": "2026-09-30T10:30:00Z",
  "estado": "confirmada",
  "precio_total": 50,
  "notas": "Cita de control",
  "modalidad": "presencial"
}
```

### Consultar Disponibilidad (`GET /api/citas/disponibilidad?empleado_id=2&fecha=2026-09-30&servicio_id=1&duracion_min=55`)

`duracion_min` es opcional. Cuando se envía, representa la duración total solicitada en minutos, incluyendo complementos; la disponibilidad debe reservar ese intervalo completo. Si se omite, el servidor usa la duración base del servicio.

## Response

### Cita Creada / Detalle
```json
{
  "success": true,
  "message": "Cita agendada exitosamente",
  "data": {
    "id": 101,
    "cliente_id": 1,
    "cliente": {
      "id": 1,
      "nombre": "Ana García",
      "telefono": "+1 555-0101"
    },
    "empleado_id": 2,
    "empleado": {
      "id": 2,
      "nombre": "Dr. Carlos Pérez"
    },
    "servicio_id": 1,
    "servicio": {
      "id": 1,
      "nombre": "Consulta General",
      "duracion_base_min": 30
    },
    "fecha_inicio": "2026-09-30T10:00:00Z",
    "fecha_fin": "2026-09-30T10:30:00Z",
    "estado": "confirmada",
    "precio_total": 50,
    "modalidad": "presencial",
    "created_at": "2026-09-25T20:30:00Z"
  }
}
```

### Disponibilidad
```json
{
  "success": true,
  "message": "OK",
  "data": [
    { "hora_inicio": "09:00", "hora_fin": "09:30", "disponible": true },
    { "hora_inicio": "09:30", "hora_fin": "10:00", "disponible": false },
    { "hora_inicio": "10:00", "hora_fin": "10:30", "disponible": true }
  ]
}
```

## Errors
- `400 Bad Request`: Formato de fecha inválido o servicio inactivo.
- `409 Conflict`: Conflicto de horario (el profesional o recurso ya está reservado en ese intervalo).
  ```json
  {
    "success": false,
    "message": "El horario seleccionado ya no se encuentra disponible",
    "errors": {
      "fecha_inicio": ["Conflicto con la cita existente #45."]
    }
  }
  ```

## Pagination & Filters
- `fecha`: Filtra por día específico (`YYYY-MM-DD`).
- `estado`: `pendiente`, `confirmada`, `cancelada`, `completada`, `no_asistio`.
- `empleado_id`: Filtra por profesional específico.

## Business Rules
1. Se deben respetar los buffers pre y post servicio (`buffer_antes_min`, `buffer_despues_min`).
2. Al cancelar una cita, su estado cambia a `cancelada` y libera el intervalo horario para nuevos turnos.
3. Si la modalidad es `virtual`, se debe generar un enlace de videoconferencia (Google Meet o Zoom).

## Frontend Expectations
El frontend muestra badges de colores según estado:
- `pendiente`: amarillo / warning
- `confirmada`: verde / success
- `completada`: azul / info
- `cancelada`: rojo / danger
