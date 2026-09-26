# Lyberate Business Platform — Architecture

## Stack

| Layer | Technology |
|-------|-----------|
| UI Framework | React 19 |
| Language | TypeScript (strict) |
| Build Tool | Vite 6 |
| Styling | Tailwind CSS 3.4 |
| Routing | React Router 6 |
| Icons | Lucide React |
| Mock API | MSW 2 (Mock Service Worker) |
| PWA | vite-plugin-pwa (Workbox) |

## Data Flow

```
UI Components
    ↓
Hooks (useAuth, useToast, useConfiguracion, useTenant, useI18n)
    ↓
Services (citasService, clientesService, ventasService, inventarioService, ...)
    ↓
apiClient (src/services/api.client.ts)
    ↓
┌─────────────────────────────────┐
│ MSW Interceptor (dev/demo)      │
│   ↓                             │
│ Mock handlers (src/mocks/)      │
│ — in-memory state + demo data   │
└─────────────────────────────────┘
    OR
┌─────────────────────────────────┐
│ Real Backend API (production)   │
│ VITE_USE_MOCKS=false            │
│ VITE_DATA_MODE=api              │
└─────────────────────────────────┘
```

## Environment Variables

| Variable | Dev Value | Purpose |
|----------|-----------|---------|
| `VITE_API_BASE_URL` | `http://localhost:8000/api` | Backend base URL |
| `VITE_USE_MOCKS` | `true` | Activate MSW mocks |
| `VITE_DATA_MODE` | `local` | `local` or `api` |
| `VITE_APP_NAME` | `Lyberate Business Platform` | App display name |

## Directory Structure

```
src/
├── components/
│   ├── ui/           — Design system primitives (Button, Input, Modal, Badge, ...)
│   ├── layout/       — Navbar, Sidebar, PageWrapper
│   ├── calendario/   — Calendar views (Monthly, Weekly, List, TimeSlot selector)
│   ├── reservas/     — Appointment wizard steps
│   ├── pagos/        — Invoice modal, coupon input, extras selector
│   ├── integraciones/ — Notification center, webhook modal, template editor
│   ├── configuracion/ — White-label previewer, widget generator
│   └── crm/          — Tenant selector, i18n selector, API key modal, OpenAPI viewer
│
├── config/
│   └── features.ts   — Feature flags
│
├── context/
│   ├── AppContext.tsx         — Sidebar state, theme, toast
│   ├── AuthContext.tsx        — Authentication state
│   ├── ConfiguracionContext.tsx — White-label config
│   ├── TenantContext.tsx      — Multi-tenant / multi-branch
│   ├── I18nContext.tsx        — Internationalization (es/en/pt/fr)
│   └── ReservaContext.tsx     — Booking wizard state
│
├── hooks/
│   ├── useAuth.ts
│   ├── useToast.ts
│   ├── useConfiguracion.ts
│   ├── useTenant.ts
│   └── useI18n.ts
│
├── mocks/
│   ├── browser.ts            — MSW worker setup
│   └── handlers/             — One handler file per module
│
├── pages/
│   ├── DashboardPage.tsx
│   ├── CitasPage.tsx
│   ├── NuevaCitaPage.tsx
│   ├── ServiciosPage.tsx
│   ├── EmpleadosPage.tsx
│   ├── ClientesPage.tsx
│   ├── PagosPage.tsx         — Billing, coupons, refunds
│   ├── VentasPage.tsx        — POS + Cash register
│   ├── InventarioPage.tsx    — Products + stock movements
│   ├── ReportesPage.tsx      — Reports and analytics
│   ├── UsuariosPage.tsx
│   ├── RolesPage.tsx
│   ├── IntegracionesPage.tsx
│   ├── CrmDesarrolladoresPage.tsx
│   ├── ConfiguracionPage.tsx
│   ├── PortalReservaPage.tsx — Public booking portal
│   ├── LoginPage.tsx
│   └── NotFoundPage.tsx
│
├── services/               — One service per module, all use apiClient
├── types.ts               — All TypeScript interfaces
└── utils/
    └── calendar.ts        — ICS generation, Google Calendar URLs
```

## Multi-Tenancy

The frontend supports multiple tenants (branches/franchises) via `TenantContext`.  
Each tenant has an `id`, `slug`, `plan`, and `activo` flag.  
The active tenant is stored in `localStorage` and shown in the Navbar via `TenantSelector`.  
**Security isolation** is the backend's responsibility.

## Authentication

Demo mode uses MSW to simulate JWT auth.  
Tokens are stored in `localStorage` (`sagitta_token`, `sagitta_refresh_token`).  
The `apiClient` automatically adds `Authorization: Bearer <token>` to all requests.  
On 401, it clears tokens and redirects to `/login`.

## Roles and Permissions

Roles are defined in the backend but exposed via `/api/roles` and `/api/permisos`.  
Frontend uses role/permission data for **UI-only** access control (show/hide elements).  
**Real enforcement must happen server-side.**

Demo roles:
- `superadmin` — all permissions
- `admin` — most permissions
- `recepcionista` — appointments + clients
- `empleado` — appointments read only

## Feature Flags

`src/config/features.ts` exports `FEATURES` object.  
All features default to `true`. Can be toggled without code changes.
