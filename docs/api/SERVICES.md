# SERVICES MODULE API CONTRACT

## Endpoint
`/api/servicios`
`/api/servicios/:id`

## Method
- `GET /api/servicios` — Listar catálogo de servicios
- `POST /api/servicios` — Crear nuevo servicio
- `GET /api/servicios/:id` — Detalle del servicio
- `PUT /api/servicios/:id` — Actualizar servicio
- `DELETE /api/servicios/:id` — Eliminar o desactivar servicio

## Authentication
Bearer JWT Token requerido para mutaciones (`POST`, `PUT`, `DELETE`).
Lectura pública (`GET /api/servicios`) disponible para el portal de agendamiento.

## Required Permission
- Lectura administrativa: `services.read`
- Creación: `services.create`
- Modificación/Baja: `services.update`

## Request
```json
{
  "nombre": "Limpieza Facial Profunda",
  "categoria_id": 2,
  "descripcion": "Tratamiento completo con exfoliación y nutrición dérmica.",
  "duracion_base_min": 60,
  "precio_base": 75,
  "buffer_antes_min": 5,
  "buffer_despues_min": 10,
  "activo": true,
  "color": "#ec4899"
}
```

## Response
```json
{
  "success": true,
  "message": "Servicio registrado",
  "data": {
    "id": 5,
    "nombre": "Limpieza Facial Profunda",
    "categoria_id": 2,
    "descripcion": "Tratamiento completo con exfoliación y nutrición dérmica.",
    "duracion_base_min": 60,
    "precio_base": 75,
    "buffer_antes_min": 5,
    "buffer_despues_min": 10,
    "activo": true,
    "color": "#ec4899"
  }
}
```

## Errors
- `400 Bad Request`: Duración menor o igual a 0 o precio negativo.
- `404 Not Found`: Servicio inexistente.

## Filters
- `activo`: `true` | `false`
- `categoria_id`: Número ID de categoría

## Business Rules
- La desactivación de un servicio (`activo: false`) no cancela citas previas agendadas, pero evita nuevas reservas.
- Los buffers se suman a la duración para calcular el bloqueo total en el calendario del profesional.

## Frontend Expectations
El frontend categoriza los servicios visualmente con badges y chips de duración.
