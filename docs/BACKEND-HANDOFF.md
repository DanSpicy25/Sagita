# Backend Handoff — Lyberate Business Platform

> This document is for the backend developer implementing the PHP REST API.  
> The frontend is complete and running with MSW mocks. Replacing mocks with real endpoints requires only changing `VITE_USE_MOCKS=false`.

---

## What Is Complete (Frontend)

| Module | Status | Notes |
|--------|--------|-------|
| Authentication (demo) | ✅ | Login, logout, session restore, 4 demo users |
| Users management | ✅ | CRUD, roles, branch assignment |
| Roles & Permissions | ✅ | Role list, permission matrix editor |
| Clients | ✅ | Full CRUD, search, history |
| Services | ✅ | CRUD, duration variants, buffer times, categories |
| Employees | ✅ | CRUD, schedules, availability, assigned services |
| Appointments | ✅ | Calendar (month/week/list), wizard, states, recurrence |
| Billing / Invoices | ✅ | Invoices, coupons, refunds, packages, wait list |
| Sales / POS | ✅ | Point of sale, cart, payment methods, cash register |
| Inventory | ✅ | Products, stock movements, low-stock alerts |
| Reports | ✅ | KPIs, citas, ventas, clientes, servicios reports |
| Notifications | ✅ | In-app notification center, read/unread |
| Integrations | ✅ | Google Calendar, WhatsApp, Webhooks, Web Push |
| White-label Config | ✅ | Brand, logo, colors, font, footer |
| Multi-tenant | ✅ | Multiple branches/locations |
| i18n | ✅ | ES, EN, PT, FR |
| CRM / API Keys | ✅ | HubSpot, Salesforce, Zoho, API key management |
| Public Booking Portal | ✅ | Client-facing booking without login |
| PWA | ✅ | Manifest, service worker, offline fallback |
| Dashboard | ✅ | Real KPIs from API data |

---

## How to Connect the Backend

1. Set environment variables:
   ```env
   VITE_API_BASE_URL=https://api.yourdomain.com/api
   VITE_USE_MOCKS=false
   VITE_DATA_MODE=api
   ```
2. Rebuild: `npm run build`
3. The frontend will now call your real API instead of MSW mocks.

---

## API Contract

All endpoints follow this response envelope:

**Success:**
```json
{
  "success": true,
  "message": "OK",
  "data": { ... }
}
```

**Paginated:**
```json
{
  "success": true,
  "message": "OK",
  "data": [ ... ],
  "meta": {
    "total": 100,
    "per_page": 25,
    "current_page": 1,
    "last_page": 4
  }
}
```

**Error:**
```json
{
  "success": false,
  "message": "Human-readable error",
  "errors": { "field": ["validation message"] }
}
```

---

## Auth Endpoints

```
POST   /api/auth/login
POST   /api/auth/logout
GET    /api/auth/me
POST   /api/auth/refresh
POST   /api/auth/forgot-password
POST   /api/auth/reset-password
```

**Login Request:**
```json
{ "email": "user@example.com", "password": "secret" }
```
**Login Response data:**
```json
{
  "user": { "id": 1, "nombre": "...", "email": "...", "rol": "admin", "timezone": "America/Bogota" },
  "tokens": { "access_token": "...", "refresh_token": "...", "expires_in": 3600 }
}
```

---

## Users Endpoints

```
GET    /api/usuarios               ?q=search&rol=admin&activo=true
POST   /api/usuarios
GET    /api/usuarios/:id
PUT    /api/usuarios/:id
DELETE /api/usuarios/:id
POST   /api/usuarios/:id/toggle-activo
```

**User object:**
```json
{
  "id": 1, "nombre": "Ana García", "email": "ana@test.com",
  "rol": "admin", "telefono": "+1555...", "sucursal_id": 1,
  "activo": true, "ultimo_login": "ISO8601", "created_at": "ISO8601"
}
```

---

## Clients Endpoints

```
GET    /api/clientes               ?q=search
POST   /api/clientes
GET    /api/clientes/:id
PUT    /api/clientes/:id
DELETE /api/clientes/:id
GET    /api/clientes/:id/historial
```

---

## Services Endpoints

```
GET    /api/servicios              ?activo=true&categoria_id=1
POST   /api/servicios
GET    /api/servicios/:id
PUT    /api/servicios/:id
DELETE /api/servicios/:id
POST   /api/servicios/:id/toggle-activo
```

---

## Employees Endpoints

```
GET    /api/empleados              ?activo=true
POST   /api/empleados
GET    /api/empleados/:id
PUT    /api/empleados/:id
DELETE /api/empleados/:id
GET    /api/empleados/:id/horarios
PUT    /api/empleados/:id/horarios
POST   /api/empleados/:id/dias-libres
DELETE /api/empleados/:id/dias-libres/:diaId
```

---

## Appointments Endpoints

```
GET    /api/citas                  ?fecha=YYYY-MM-DD&estado=confirmada&empleado_id=1
POST   /api/citas
GET    /api/citas/:id
PUT    /api/citas/:id
DELETE /api/citas/:id
GET    /api/citas/disponibilidad   ?empleado_id=1&fecha=YYYY-MM-DD&servicio_id=1
POST   /api/citas/:id/confirmar
POST   /api/citas/:id/cancelar
POST   /api/citas/:id/completar
```

**Cita states:** `pendiente | confirmada | cancelada | completada | no_asistio`

---

## Billing Endpoints

```
GET    /api/facturas
POST   /api/facturas
GET    /api/facturas/:id
GET    /api/cupones
POST   /api/cupones
DELETE /api/cupones/:id
POST   /api/cupones/validar        body: { codigo, total }
GET    /api/reembolsos
POST   /api/reembolsos
GET    /api/paquetes
POST   /api/paquetes
GET    /api/servicios-extra
GET    /api/lista-espera
POST   /api/lista-espera
DELETE /api/lista-espera/:id
```

---

## Sales / POS Endpoints

```
GET    /api/ventas                 ?estado=PAID&fecha_desde=YYYY-MM-DD&fecha_hasta=YYYY-MM-DD
POST   /api/ventas
GET    /api/ventas/:id
PUT    /api/ventas/:id
POST   /api/ventas/:id/cancelar
GET    /api/caja/sesion-actual
POST   /api/caja/abrir             body: { monto_inicial }
POST   /api/caja/:id/cerrar        body: { monto_final }
GET    /api/caja/:id/movimientos
POST   /api/caja/movimientos       body: { tipo, monto, descripcion }
```

**Venta states:** `DRAFT | PENDING | PAID | CANCELLED | REFUNDED`
**Movimiento caja types:** `apertura | ingreso | egreso | cierre`

---

## Inventory Endpoints

```
GET    /api/productos               ?categoria=&activo=true&q=search
POST   /api/productos
GET    /api/productos/:id
PUT    /api/productos/:id
DELETE /api/productos/:id
GET    /api/movimientos-stock       ?producto_id=1
POST   /api/movimientos-stock       body: { producto_id, tipo, cantidad, motivo }
GET    /api/alertas-stock
```

**Movement types:** `PURCHASE | SALE | ADJUSTMENT | RETURN | LOSS | TRANSFER`

---

## Roles & Permissions Endpoints

```
GET    /api/roles
POST   /api/roles
GET    /api/roles/:id
PUT    /api/roles/:id
DELETE /api/roles/:id
GET    /api/permisos
```

---

## Reports Endpoints

```
GET    /api/reportes/resumen        ?fecha_desde=&fecha_hasta=
GET    /api/reportes/citas          ?fecha_desde=&fecha_hasta=&estado=
GET    /api/reportes/ventas         ?fecha_desde=&fecha_hasta=
GET    /api/reportes/clientes       ?fecha_desde=&fecha_hasta=
GET    /api/reportes/servicios      ?fecha_desde=&fecha_hasta=
```

---

## Notifications Endpoints

```
GET    /api/notificaciones          ?leida=false
POST   /api/notificaciones/:id/leer
POST   /api/notificaciones/leer-todas
DELETE /api/notificaciones/:id
```

---

## Settings Endpoints

```
GET    /api/configuracion
PUT    /api/configuracion
```

---

## Integrations Endpoints

```
GET    /api/integraciones
PUT    /api/integraciones/:tipo/conectar
POST   /api/integraciones/:tipo/desconectar
GET    /api/webhooks
POST   /api/webhooks
DELETE /api/webhooks/:id
POST   /api/webhooks/:id/ping
GET    /api/notificaciones/plantillas
PUT    /api/notificaciones/plantillas/:id
```

---

## Tenants Endpoints

```
GET    /api/tenants
POST   /api/tenants
GET    /api/tenants/:id
PUT    /api/tenants/:id
```

---

## Entities Reference

All TypeScript interfaces are defined in `src/types.ts`. Key entities:

- `User` — auth user with role
- `Cliente` — business client/customer  
- `Empleado` — staff member (can exist without a User account)
- `Servicio` — bookable service with duration and price
- `Cita` — appointment linking Client + Service + Employee + DateTime
- `Factura` — invoice linked to appointment
- `Venta` — POS sale with cart items
- `SesionCaja` — cash register session
- `Producto` — inventory item with SKU and stock
- `MovimientoStock` — stock in/out record
- `Rol` — permission set assignable to users
- `Tenant` — business branch/location

---

## Permissions List

The frontend checks these string permissions for UI visibility:

```
appointments.read        appointments.create   appointments.update   appointments.delete
clients.read             clients.create        clients.update        clients.delete
services.read            services.create       services.update
employees.read           employees.manage
sales.read               sales.create
inventory.read           inventory.manage
reports.read
settings.manage
users.manage
roles.manage
```

---

## Security Notes

- **Do NOT store real passwords in LocalStorage.** Demo mode stores only mock tokens.
- **All server responses must validate permissions server-side.** Frontend permissions are UI-only.
- **Tenant isolation** must be enforced in every query via `tenant_id` on the backend.
- **JWT access tokens** should expire in ≤ 1 hour. Use refresh tokens for session continuity.
- **API keys** (CRM/developer tokens) must be hashed, not stored in plain text.
