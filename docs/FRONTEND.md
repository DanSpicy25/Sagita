# LYBERATE BUSINESS PLATFORM — FRONTEND ARCHITECTURE & GUIDELINES

## 1. Visión General

El frontend de **Lyberate Business Platform** está diseñado como un producto modular, escalable y multi-inquilino (multi-tenant) reutilizable para diversas industrias (salud, belleza, gastronomía, automotriz, servicios profesionales, etc.).

La arquitectura sigue una separación estricta de responsabilidades:
```text
UI (Páginas y Componentes)
  ↓
Hooks de Aplicación (useAuth, useTenant, useConfiguracion, useToast, etc.)
  ↓
Capa de Servicios (citasService, clientesService, ventasService, inventarioService, etc.)
  ↓
Interfaces de Repositorio (IAppointmentRepository, ISalesRepository, etc.)
  ↓
Implementaciones de Repositorio:
  ├── Local Repository (LocalStorage + Semillas Demo)
  └── API Repository (Llamadas HTTP REST via apiClient)
```

---

## 2. Pila Tecnológica

- **Framework:** React 19 con TypeScript estricto.
- **Bundler:** Vite 6.
- **Estilos:** Tailwind CSS 3.4 con variables CSS dinámicas para Marca Blanca (`--color-brand-primary`).
- **Iconografía:** Lucide React exclusivamente.
- **Enrutamiento:** React Router DOM v6 con guardias de ruta (`PrivateRoute`).
- **PWA:** Vite Plugin PWA + Workbox para almacenamiento en caché y experiencia offline.
- **Simulación:** Mock Service Worker (MSW 2.6) + Repositorios Locales con LocalStorage.

---

## 3. Estado Global y Contextos

La aplicación gestiona el estado a través de Contextos de React modulares:

| Contexto | Ubicación | Responsabilidad |
|---|---|---|
| `TenantContext` | `src/context/TenantContext.tsx` | Gestión de sucursales activas, sedes y planes (`starter`, `pro`, `enterprise`). |
| `AuthContext` | `src/context/AuthContext.tsx` | Usuario autenticado, tokens de sesión y matriz reactiva de permisos RBAC. |
| `ConfiguracionContext` | `src/context/ConfiguracionContext.tsx` | Marca Blanca en caliente: inyección de tipografías Google Fonts, logos, favicons y colores primarios. |
| `I18nContext` | `src/context/I18nContext.tsx` | Motor de internacionalización sin dependencias pesadas en 4 idiomas (ES, EN, PT, FR). |
| `AppContext` | `src/context/AppContext.tsx` | Estado del layout (apertura/cierre de sidebar), tema claro/oscuro y sistema de notificaciones Toast. |
| `ReservaContext` | `src/context/ReservaContext.tsx` | Máquina de estado para el Wizard de reservas públicas y carrito de servicios. |

---

## 4. Control de Acceso Basado en Roles (RBAC) en Frontend

El sistema no utiliza roles rígidos cableados; utiliza permisos granulares evaluados en caliente:
```text
USER → ROLE → PERMISSIONS
```

### Componente `<Can>`
Permite renderizar fragmentos de UI condicionalmente según los permisos del usuario actual:
```tsx
import { Can } from '@/components/auth/Can'

<Can permission="inventory.manage">
  <Button onClick={abrirModalCreacion}>Nuevo Producto</Button>
</Can>
```

### Navegación Permission-Aware
La barra lateral (`Sidebar.tsx`) filtra los ítems de menú evaluando si el usuario posee el permiso asignado y si el feature flag está activo:
```tsx
const { hasPermission } = useAuth()
const visibleNavItems = navItems.filter(item => {
  if (item.feature && !isFeatureEnabled(item.feature)) return false
  if (item.permission && !hasPermission(item.permission)) return false
  return true
})
```

---

## 5. Feature Flags

Ubicados en `src/config/features.ts`, permiten activar o apagar módulos sin modificar el código de los componentes:
```ts
export const FEATURES = {
  appointments: true,
  clients: true,
  services: true,
  employees: true,
  sales: true,
  inventory: true,
  billing: true,
  reports: true,
  crm: true,
  notifications: true,
  settings: true,
  roles: true,
}
```

---

## 6. Persistencia y Modos de Datos

El archivo `.env` controla el modo de ejecución:
```env
VITE_DATA_MODE=local   # Utiliza LocalStorage y Repositorios Locales
# o
VITE_DATA_MODE=api     # Utiliza llamadas HTTP reales al Backend
```

Los componentes de UI consumen los servicios sin saber de dónde provienen los datos.
