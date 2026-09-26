# 📅 Sagitta — Sistema de Reservas y Citas

> Plataforma web para gestionar reservas, citas, empleados y clientes de forma profesional.  
> Diseño premium con modo oscuro, PWA instalable y conexión a API REST externa.

---

## 🧭 Índice

- [¿Qué es Sagitta?](#-qué-es-sagitta)
- [Stack tecnológico](#-stack-tecnológico)
- [Arquitectura del proyecto](#-arquitectura-del-proyecto)
- [Estructura de archivos](#-estructura-de-archivos)
- [Variables de entorno](#-variables-de-entorno)
- [Cómo correr el proyecto](#-cómo-correr-el-proyecto)
- [Sistema de mocks (MSW)](#-sistema-de-mocks-msw)
- [Plan de fases](#-plan-de-fases)
- [Flujo de trabajo Git](#-flujo-de-trabajo-git)
- [Convenciones de código](#-convenciones-de-código)
- [Equipo](#-equipo)

---

## 🚀 ¿Qué es Sagitta?

Sagitta es un sistema de reservas y citas online diseñado para negocios de servicios (salones, clínicas, consultorios, centros de bienestar, etc.). Permite:

- Reservar citas en pocos pasos seleccionando servicio, empleado y horario
- Gestionar múltiples empleados, ubicaciones y servicios
- Cobrar en línea, emitir facturas y aplicar cupones
- Sincronizar con Google Calendar y enviar recordatorios por WhatsApp
- Ver métricas del negocio en un dashboard en tiempo real

### División de responsabilidades

| Área | Responsable | Tecnología |
|------|-------------|------------|
| **Frontend** | Silvio | React 19 + TypeScript + Vite |
| **Backend** | Compañero | PHP nativo REST API + MySQL |

El frontend consume la API REST del backend mediante `fetch` con autenticación JWT. En desarrollo, los endpoints se simulan con **MSW (Mock Service Worker)** para trabajar de forma independiente.

---

## 🛠 Stack Tecnológico

### Frontend
| Tecnología | Versión | Propósito |
|-----------|---------|----------|
| React | 19 | UI reactiva con componentes |
| TypeScript | 5.6 | Tipado estricto, sin `any` implícitos |
| Vite | 6 | Bundler y servidor de desarrollo |
| Tailwind CSS | 3.4 | Estilos utilitarios + dark mode |
| react-router-dom | v6 | Enrutamiento SPA con guards |
| lucide-react | 0.460 | Iconografía consistente y ligera |
| vite-plugin-pwa | 0.21 | PWA: Service Worker + manifest |
| MSW | 2.6 | Mock de API para desarrollo offline |

### Backend (compañero)
| Tecnología | Propósito |
|-----------|----------|
| PHP nativo | REST API modular |
| MySQL | Base de datos relacional |
| JWT | Autenticación stateless |
| PDO | Conexión segura a base de datos |

---

## 🏗 Arquitectura del Proyecto

```
┌─────────────────────────┐         API REST (JSON + JWT)         ┌──────────────────────┐
│   FRONTEND (Silvio)     │  ──────────────────────────────────▶  │  BACKEND (compañero) │
│                         │                                        │                      │
│  React 19 + TypeScript  │  ◀──────────────────────────────────  │  PHP + MySQL         │
│  Vite + Tailwind + PWA  │         Respuestas JSON                │                      │
│  localhost:5173         │                                        │  localhost:8000      │
└─────────────────────────┘                                        └──────────────────────┘
           │
           │  En desarrollo (VITE_USE_MOCKS=true)
           ▼
┌─────────────────────────┐
│   MSW Service Worker    │  ← Intercepta llamadas y devuelve datos mock
│   (sin backend real)    │
└─────────────────────────┘
```

### Flujo de autenticación
```
Login → POST /api/auth/login → JWT token → localStorage
Cada request → Authorization: Bearer <token>
Token expirado → Redirige a /login automáticamente
```

---

## 📁 Estructura de Archivos

```
sagitta/
│
├── 📄 index.html                   # Entry point HTML con Inter font y meta PWA
├── 📦 package.json                 # Dependencias y scripts
├── ⚙️  vite.config.ts               # Vite: plugin React + PWA + proxy /api
├── 🎨 tailwind.config.ts           # Paleta, dark mode, animaciones
├── 🔧 tsconfig.app.json            # TypeScript strict para src/
├── 🔧 tsconfig.node.json           # TypeScript para vite.config.ts
│
├── 🌍 .env.development             # API local + mocks activados
├── 🌍 .env.production              # API real del backend
├── 📋 .env.example                 # Template para el equipo
│
├── public/
│   ├── manifest.json               # PWA: nombre, colores, iconos
│   └── mockServiceWorker.js        # Service Worker de MSW (auto-generado)
│
└── src/
    │
    ├── main.tsx                    # Bootstrap: activa MSW si VITE_USE_MOCKS=true
    ├── App.tsx                     # Router + Providers + rutas privadas/públicas
    ├── types.ts                    # Todas las interfaces TypeScript del proyecto
    ├── vite-env.d.ts               # Tipos de import.meta.env
    ├── index.css                   # Tailwind base + componentes globales + scrollbar
    │
    ├── context/
    │   ├── AuthContext.tsx         # Estado de autenticación: user, isAuthenticated, login/logout
    │   ├── AppContext.tsx          # Estado global: tema (dark/light), sidebar, sistema de toasts
    │   ├── ReservaContext.tsx      # Estado del wizard de reservas: pasos, carrito, servicios, fechas
    │   ├── ConfiguracionContext.tsx # Estado de Marca Blanca: branding, colores, fuentes, favicon dinámico
    │   ├── TenantContext.tsx       # Estado Multi-Tenant: sucursal activa, cuota de citas y cambio de sede
    │   └── I18nContext.tsx         # Estado multi-idioma (ES, EN, PT, FR) con diccionarios reactivos
    │
    ├── hooks/
    │   ├── useAuth.ts              # Acceso rápido al AuthContext
    │   ├── useApi.ts               # Hook genérico con estados: data, isLoading, error
    │   ├── useToast.ts             # Acceso al sistema de notificaciones toast
    │   ├── useConfiguracion.ts     # Acceso al contexto de Marca Blanca y personalización
    │   ├── useTenant.ts            # Acceso a la sucursal activa y conmutación de tenant
    │   └── useI18n.ts              # Acceso a traducciones y selector de idioma
    │
    ├── utils/
    │   └── calendar.ts             # Generador iCalendar (.ics) RFC 5545, Google Calendar y links WhatsApp
    │
    ├── services/
    │   ├── api.client.ts           # Cliente HTTP: JWT automático, manejo 401, authService
    │   ├── citas.service.ts        # CRUD de citas y consulta de disponibilidad
    │   ├── servicios.service.ts    # CRUD de servicios y categorías del negocio
    │   ├── empleados.service.ts    # Directorio de profesionales, horarios y disponibilidad
    │   ├── clientes.service.ts     # Directorio de clientes y búsqueda
    │   ├── pagos.service.ts        # Facturación, cupones, reembolsos, paquetes y lista de espera
    │   ├── integraciones.service.ts # Google Calendar, Meet, Zoom, Webhooks, Push y WhatsApp
    │   ├── configuracion.service.ts # Configuración general, identidad y directrices de marca blanca
    │   └── crm.service.ts          # Multi-tenant, sincronización CRM, API Keys y Audit Logs
    │
    ├── components/
    │   ├── ui/
    │   │   ├── Button.tsx          # Botón con variantes primary/secondary/ghost/danger + loading
    │   │   ├── Input.tsx           # Input con label, error, hint, iconos laterales
    │   │   ├── Select.tsx          # Select desplegable accesible con icono
    │   │   ├── Textarea.tsx        # Textarea responsivo para notas y descripciones
    │   │   ├── Modal.tsx           # Modal con backdrop blur, cierre Escape, animación
    │   │   ├── Toast.tsx           # Notificaciones success/error/warning/info
    │   │   ├── Loader.tsx          # Spinner con variante fullScreen + backdrop
    │   │   ├── Badge.tsx           # Etiquetas con variantes y tamaño configurable
    │   │   ├── Avatar.tsx          # Foto de perfil o iniciales del usuario
    │   │   ├── Stepper.tsx         # Indicador de progreso paso a paso para wizards
    │   │   ├── EmptyState.tsx      # Estado vacío visual con icono y CTA
    │   │   └── index.ts            # Barrel export de todos los UI
    │   │
    │   ├── layout/
    │   │   ├── Navbar.tsx          # Barra superior: logo dinámico, TenantSelector, I18nSelector, usuario
    │   │   ├── Sidebar.tsx         # Menú lateral colapsable con NavLinks activos
    │   │   ├── PageWrapper.tsx     # Composición: Navbar + Sidebar + main + ToastContainer
    │   │   └── index.ts            # Barrel export
    │   │
    │   ├── calendario/
    │   │   ├── CalendarioMensual.tsx # Vista en cuadrícula de 30/31 días con citas del día
    │   │   ├── CalendarioSemanal.tsx # Rejilla horaria semanal (lunes a domingo)
    │   │   ├── VistaLista.tsx        # Listado de citas con búsqueda y filtros por estado
    │   │   ├── SelectorFechaHora.tsx # Selector interactivo de slots y días
    │   │   └── index.ts
    │   │
    │   ├── reservas/
    │   │   ├── PasoServicio.tsx      # Paso 1: Selección de servicio y duración
    │   │   ├── PasoEmpleado.tsx      # Paso 2: Elección de profesional o asignación automática
    │   │   ├── PasoFechaHora.tsx     # Paso 3: Selección de día y horario disponible
    │   │   ├── PasoConfirmacion.tsx  # Paso 4: Resumen, citas recurrentes, add-ons y cupones
    │   │   ├── CarritoReserva.tsx    # Modal de reservas múltiples en una sola transacción
    │   │   ├── TarjetaCita.tsx       # Tarjeta individual con .ics, WhatsApp y botón de videollamada
    │   │   └── index.ts
    │   │
    │   ├── pagos/
    │   │   ├── FacturaModal.tsx      # Comprobante / factura detallada imprimible
    │   │   ├── CuponInput.tsx        # Validación y aplicación en vivo de códigos promocionales
    │   │   ├── ServiciosExtraSelector.tsx # Selector de tratamientos add-ons para citas
    │   │   ├── ModalListaEspera.tsx  # Modal para ingresar a lista de espera
    │   │   └── index.ts
    │   │
    │   ├── integraciones/
    │   │   ├── CentroNotificaciones.tsx # Dropdown interactivo en campana del Navbar
    │   │   ├── ModalWebhook.tsx      # Modal para crear webhooks con firma HMAC SHA-256
    │   │   ├── PlantillaEditor.tsx   # Editor de plantillas WhatsApp/Email/Push con preview
    │   │   └── index.ts
    │   │
    │   ├── configuracion/
    │   │   ├── PrevisualizadorMarcaBlanca.tsx # Mockup en vivo de browser, navbar y hero
    │   │   ├── GeneradorWidgetEmbebible.tsx   # Snippet iframe/script y opciones de embed
    │   │   └── index.ts
    │   │
    │   └── crm/
    │       ├── TenantSelector.tsx    # Dropdown de sucursales en Navbar con badge de plan
    │       ├── I18nSelector.tsx      # Selector de idioma en Navbar con banderas (ES, EN, PT, FR)
    │       ├── ModalApiKey.tsx       # Modal para generar tokens de API con scopes
    │       ├── VisorOpenApi.tsx      # Visor interactivo Swagger/OpenAPI v3.0 con curl
    │       └── index.ts
    │
    ├── pages/
    │   ├── LoginPage.tsx           # Login split: branding dinámico + formulario der
    │   ├── DashboardPage.tsx       # Dashboard con KPIs operativos, citas del día y accesos
    │   ├── CitasPage.tsx           # Gestión de citas (vistas: mes, semana, lista + modal de detalle)
    │   ├── NuevaCitaPage.tsx       # Asistente de reservas paso a paso con carrito y recurrencia
    │   ├── ServiciosPage.tsx       # Catálogo de servicios, categorías y buffer times
    │   ├── EmpleadosPage.tsx       # Directorio de profesionales y visor de horarios laborales
    │   ├── ClientesPage.tsx        # Directorio de clientes con búsqueda y registro
    │   ├── PagosPage.tsx           # Panel de finanzas: facturas, cupones, reembolsos y lista de espera
    │   ├── IntegracionesPage.tsx   # Hub de integraciones: Calendarios, Meet/Zoom, WhatsApp, Push y Webhooks
    │   ├── ConfiguracionPage.tsx   # Panel de configuración general y marca blanca total (/ajustes)
    │   ├── CrmDesarrolladoresPage.tsx # Hub de CRM, API Keys, OpenAPI y Audit Logs (/crm)
    │   └── NotFoundPage.tsx        # Página 404 con botón de regreso
    │
    └── mocks/
        ├── browser.ts              # Setup MSW Service Worker
        └── handlers/
            ├── auth.handlers.ts          # Mock: POST /login, GET /me, POST /logout
            ├── citas.handlers.ts         # Mock: CRUD /citas y /citas/disponibilidad
            ├── servicios.handlers.ts     # Mock: CRUD /servicios y /categorias-servicio
            ├── empleados.handlers.ts     # Mock: /empleados, horarios y slots
            ├── clientes.handlers.ts      # Mock: /clientes y búsqueda reactiva
            ├── pagos.handlers.ts         # Mock: facturas, cupones, reembolsos, paquetes y lista de espera
            ├── integraciones.handlers.ts # Mock: integraciones, webhooks, notificaciones y plantillas
            ├── configuracion.handlers.ts # Mock: configuración del negocio y marca blanca
            ├── crm.handlers.ts           # Mock: multi-tenant, conectores CRM, API keys y audit logs
            └── index.ts                  # Agrupa todos los handlers (crece con cada fase)
```

---

## 🌍 Variables de Entorno

Copia `.env.example` y renómbralo según el entorno:

```bash
# Desarrollo — con mocks (no necesitas el backend corriendo)
VITE_API_BASE_URL=http://localhost:8000/api
VITE_USE_MOCKS=true
VITE_APP_NAME=Sagitta

# Producción — apunta a la API real del backend
VITE_API_BASE_URL=https://api.sagitta.com/api
VITE_USE_MOCKS=false
VITE_APP_NAME=Sagitta
```

> ⚠️ Los archivos `.env.development` y `.env.production` están en `.gitignore`. Nunca subas credenciales reales.

---

## 💻 Cómo Correr el Proyecto

### Requisitos
- Node.js 18+
- npm 9+

### Instalación

```bash
# 1. Clonar el repo
git clone https://github.com/Lyberate-app/Sagitta.git
cd Sagitta

# 2. Instalar dependencias
npm install

# 3. Crear archivo de entorno (copiar el ejemplo)
cp .env.example .env.development

# 4. Correr en modo desarrollo (con mocks, sin necesitar el backend)
npm run dev
# → http://localhost:5173

# Credenciales mock para probar:
# Email: admin@sagitta.com  /  Password: cualquiera
```

### Scripts disponibles

| Comando | Descripción |
|---------|------------|
| `npm run dev` | Servidor de desarrollo con HMR |
| `npm run build` | Build de producción (TypeScript + Vite) |
| `npm run preview` | Previsualizar el build de producción |
| `npm run lint` | Verificar errores de estilo |

---

## 🎭 Sistema de Mocks (MSW)

**MSW (Mock Service Worker)** intercepta las llamadas HTTP en el browser y devuelve datos simulados cuando `VITE_USE_MOCKS=true`.

### Cómo funciona
```
Frontend hace fetch("/api/auth/login")
        ↓
Service Worker intercepta la petición
        ↓
Handler en src/mocks/handlers/auth.handlers.ts responde con JSON mock
        ↓
Frontend recibe respuesta como si fuera el backend real
```

### Agregar un nuevo mock (Fase 2+)
```typescript
// src/mocks/handlers/citas.handlers.ts
import { http, HttpResponse } from 'msw'

export const citasHandlers = [
  http.get('/api/citas', () => {
    return HttpResponse.json({ success: true, data: [...] })
  }),
]

// src/mocks/handlers/index.ts
import { citasHandlers } from './citas.handlers'
export const handlers = [...authHandlers, ...citasHandlers]
```

### Desactivar mocks (conectar al backend real)
```bash
# .env.development
VITE_USE_MOCKS=false
```

---

## 🗺 Plan de Fases

### Fase 1 — Scaffolding y Autenticación ✅ `COMPLETADA`
**Rama:** `feat/fase-1-scaffolding`  
**Descripción:** Base técnica completa del proyecto. Todo lo que se crea aquí es la columna vertebral que usarán todas las fases siguientes.

**Lo que incluye:**
- Configuración de Vite, TypeScript, Tailwind y PWA
- Sistema de autenticación JWT completo (login, logout, restauración de sesión)
- Roles de usuario: Admin, Gerente, Empleado, Cliente
- Sistema de toasts, dark mode y sidebar colapsable
- Componentes UI reutilizables (Button, Input, Modal, Toast, Loader, Badge)
- Cliente HTTP con interceptores automáticos de JWT
- MSW configurado para trabajar sin backend
- Páginas: Login, Dashboard base, 404

**Lo que puede ver el compañero backend en el PR:**
- Contrato de autenticación esperado (endpoints, formato JSON)
- Cómo el frontend guarda y envía el JWT

---

### Fase 2 — Sistema de Reservas Core ✅ `COMPLETADA`
**Rama:** `feat/fase-2-reservas`  
**Descripción:** El corazón del sistema. Flujo completo de reservas de punta a punta con wizard progresivo, vistas flexibles de calendario y gestión operativa.

**Lo implementado:**
- **Asistente paso a paso (Wizard):** Selección progresiva (Servicio/Duración → Empleado → Fecha/Hora → Resumen y Notas)
- **Función de carrito:** Reserva de múltiples servicios en una sola transacción (`CarritoReserva.tsx`)
- **Citas recurrentes:** Soporte para programar citas diarias, semanales, mensuales o anuales
- **Vistas flexibles de agenda:**
  - `CalendarioMensual`: Cuadrícula con citas resumidas por día
  - `CalendarioSemanal`: Rejilla horaria semanal (lunes a domingo, 08:00 a 18:00)
  - `VistaLista`: Tabla/tarjetas con filtros en tiempo real por estado y buscador de texto
- **Selector interactivo de fecha y hora:** Detección de disponibilidad en mañana y tarde con slots dinámicos
- **Catálogo de servicios:** CRUD de servicios, categorías, duraciones personalizadas y buffer times (antes/después)
- **Directorio de profesionales:** Asignación de especialidades, estado activo y visor de horarios laborales habituales
- **Directorio de clientes:** Búsqueda reactiva por nombre/correo, conteo histórico de citas y registro rápido
- **Dashboard actualizado:** KPIs en vivo, listado de próximas citas y accesos directos
- **Mocks MSW completos:** Handlers de `citas`, `servicios`, `empleados` y `clientes`

**Endpoints que el compañero backend debe implementar:**
- `GET /api/citas`, `POST /api/citas`, `PUT /api/citas/{id}`, `DELETE /api/citas/{id}`
- `GET /api/citas/disponibilidad?empleado_id={id}&fecha={YYYY-MM-DD}`
- `GET /api/servicios`, `POST /api/servicios`, `PUT /api/servicios/{id}`, `DELETE /api/servicios/{id}`
- `GET /api/categorias-servicio`
- `GET /api/empleados`, `GET /api/empleados/{id}/horario`, `GET /api/empleados/{id}/disponibilidad`
- `GET /api/clientes`, `POST /api/clientes`

---

### Fase 3 — Pagos y Finanzas ✅ `COMPLETADA`
**Rama:** `feat/fase-3-pagos`  
**Descripción:** Monetización del sistema, facturación automática, cupones, reembolsos, add-ons, paquetes promocionales y lista de espera.

**Lo implementado:**
- **Facturación automática:** Generación de comprobante fiscal con número correlativo, desglose de subtotal, descuentos y total, soporte para impresión directa (`window.print`) y visualización en modal (`FacturaModal.tsx`).
- **Cupones de descuento:** Validación de códigos promocionales (`BIENVENIDA10`, `SAGITTA20`, `DESCUENTO15`) con cálculo de descuento porcentual y fijo en tiempo real (`CuponInput.tsx`), y panel administrativo para crear y retirar cupones.
- **Gestión de reembolsos:** Registro y procesamiento de devoluciones para facturas pagadas con motivo de cancelación (`PagosPage.tsx`).
- **Servicios Extra (Add-ons):** Selección de tratamientos adicionales que incrementan duración y costo (`ServiciosExtraSelector.tsx`), integrados en el asistente de reservas.
- **Paquetes promocionales (Bundles):** Agrupación de servicios con descuento especial visible en el catálogo de finanzas.
- **Lista de espera:** Registro de clientes en lista de espera (`ModalListaEspera.tsx`) con fecha deseada, hora preferente y botón de notificación ante cancelaciones.
- **Panel integral de Finanzas (`/finanzas`):** KPIs clave (ingresos cobrados, facturas emitidas, total reembolsado y cupones activos), tabla completa de facturas y pestañas para cada módulo.
- **Integración con Citas:** Botón directo en el detalle de citas para consultar factura o solicitar reembolso.

**Endpoints que el compañero backend debe implementar:**
- `GET /api/facturas`, `GET /api/facturas/{id}`, `POST /api/facturas`
- `POST /api/cupones/validar`, `GET /api/cupones`, `POST /api/cupones`, `DELETE /api/cupones/{id}`
- `GET /api/reembolsos`, `POST /api/reembolsos`
- `GET /api/paquetes`, `POST /api/paquetes`
- `GET /api/servicios-extra`
- `GET /api/lista-espera`, `POST /api/lista-espera`, `DELETE /api/lista-espera/{id}`

---

### Fase 4 — Integraciones y Notificaciones ✅ `COMPLETADA`
**Rama:** `feat/fase-4-integraciones`  
**Descripción:** Conectar Sagitta con el ecosistema de herramientas del negocio: calendarios externos, videollamadas automáticas, mensajería WhatsApp, alertas Push y webhooks seguros.

**Lo implementado:**
- **Google Calendar & Apple / Outlook (.ics):**
  - Generador y descargador de archivos `.ics` bajo estándar RFC 5545 (`src/utils/calendar.ts`) para integración universal con iOS, macOS y Microsoft Outlook.
  - Generador de enlaces web directos a Google Calendar (`generarGoogleCalendarUrl`) con parámetros automáticos de fecha, título, ubicación y descripción.
  - Sincronización y vinculación de cuenta de Google Calendar desde el hub de integraciones.
- **Videollamadas y Telemedicina (Google Meet & Zoom):**
  - Soporte de campo `modalidad` (`presencial` | `virtual`) y `enlace_videollamada` en las citas (`src/types.ts`).
  - Creación y asignación de salas virtuales de Google Meet y Zoom para teleconsultas.
  - Botón interactivo "Unirse a Videollamada" integrado en las tarjetas de citas (`TarjetaCita.tsx`).
- **WhatsApp Automatizado (WhatsApp Business Cloud API):**
  - Integración para envío de recordatorios 24 horas antes y confirmaciones instantáneas.
  - Botón de envío directo por WhatsApp con plantilla preformateada en cada cita (`generarWhatsAppUrl`).
- **Centro de Notificaciones en Tiempo Real:**
  - Dropdown interactivo con icono de campana en el `Navbar` (`CentroNotificaciones.tsx`) con contador de no leídas, selector de tipo (sistema, cita, pago, recordatorio), marcado como leída y limpieza general.
- **Notificaciones Web Push en Navegador:**
  - Integración y simulador de Web Push API mediante Service Worker para alertas en tiempo real al staff y clientes.
- **Webhooks y Eventos Externos con HMAC:**
  - Sistema de registro de endpoints Webhook con clave secreta criptográfica (`secret_key`) para validación de firma HMAC SHA-256.
  - Selector de eventos suscritos (`cita.creada`, `cita.actualizada`, `cita.cancelada`, `pago.completado`, `reembolso.creado`, etc.).
  - Modal de alta (`ModalWebhook.tsx`), copia rápida de Secret Key y disparador de ping de prueba en vivo (`POST /api/webhooks/{id}/probar`).
- **Editor de Plantillas de Mensajes:**
  - Personalizador visual de plantillas para WhatsApp, Email y Web Push (`PlantillaEditor.tsx`) con inserción de variables dinámicas (`{{cliente}}`, `{{servicio}}`, `{{fecha}}`, `{{hora}}`, `{{profesional}}`, `{{enlace_videollamada}}`) y vista previa en vivo tipo chat.
- **Panel Hub de Integraciones (`/integraciones`):**
  - 4 Pestañas operativas: *Calendarios & Videollamadas*, *WhatsApp Automatizado*, *Email & Web Push*, y *Webhooks & API*.
  - Handlers MSW completos en `src/mocks/handlers/integraciones.handlers.ts`.

**Endpoints que el compañero backend debe implementar:**
- `GET /api/integraciones`: Listar servicios vinculados y estado (`conectado`/`desconectado`)
- `POST /api/integraciones/{id}/toggle`: Conectar o desvincular un proveedor externo
- `GET /api/webhooks`, `POST /api/webhooks`, `DELETE /api/webhooks/{id}`: CRUD de endpoints receptores
- `POST /api/webhooks/{id}/probar`: Disparar ping de prueba con payload mock y verificar HTTP status code
- `GET /api/notificaciones`: Listar notificaciones del usuario autenticado
- `PUT /api/notificaciones/{id}/leer`, `PUT /api/notificaciones/marcar-todas-leidas`: Actualizar estado de lectura
- `GET /api/plantillas-mensaje`, `PUT /api/plantillas-mensaje/{id}`: Lectura y edición de plantillas transaccionales
- `POST /api/whatsapp/enviar-recordatorio`: Endpoint backend para despachar mensaje a través del proveedor WhatsApp

---

### Fase 5 — Panel Admin, Personalización y Marca Blanca (White Label) 🔄 `EN DESARROLLO`
**Rama:** `feat/fase-5-admin`  
**Descripción:** Módulo central de configuración para revendedores y negocios: personalización de identidad corporativa, paletas dinámicas, tipografías, supresión total de marca base, widget embebible y dashboard analítico.

**Lo implementado (Módulo de Marca Blanca y Configuración):**
- **Identidad Corporativa Dinámica:**
  - Configuración de nombre comercial del negocio y lema/eslogan.
  - Inyección reactiva en el `<title>` del navegador (`document.title`) y favicon dinámico.
  - Carga de logotipos para tema claro, tema oscuro e isotipo reducido para barra colapsada.
  - Reemplazo en caliente de logos y títulos en `Navbar.tsx` y `LoginPage.tsx`.
- **Directivas Estrictas de Marca Blanca (White Label):**
  - Toggle maestro de Marca Blanca: suprime cualquier mención a "Sagitta" o enlaces a la plataforma creadora.
  - Ocultación de &quot;Powered by&quot; y reemplazo del texto de Copyright del pie de página.
- **Personalización Visual & Temas:**
  - 8 Paletas de color: *Índigo Sagitta*, *Esmeralda Vital*, *Violeta Luxe*, *Rosa Carmín*, *Azul Océano*, *Ámbar Cálido*, *Slate Minimal* y selector *Personalizado HEX*.
  - Inyección de CSS Custom Properties (`--color-brand-primary`).
  - Selector de fuentes tipográficas (*Inter*, *Roboto*, *Poppins*, *Montserrat*, *Outfit*) con inyección dinámica de Google Fonts.
  - Configuración de curvatura de esquinas (`cuadrado`, `suave`, `moderno`, `pronunciado`).
- **Previsualizador en Tiempo Real (`PrevisualizadorMarcaBlanca.tsx`):**
  - Panel sticky interactivo que simula una ventana de navegador, barra de navegación, banner de bienvenida y pie de página conforme el usuario ajusta colores, logos y textos.
- **Generador de Widget Embebible (`GeneradorWidgetEmbebible.tsx`):**
  - Generador de código `<iframe>` y `<script>` responsivo con selector de altura y tema para insertar el motor de reservas en sitios externos (WordPress, Wix, Shopify, etc.).
- **Datos Regionales y Soporte:**
  - Moneda principal (USD, EUR, MXN, COP, ARS, etc.), símbolo, zona horaria y formato horario (12h/24h).
  - Canales de atención: email de soporte, teléfono/WhatsApp y enlaces a términos legales.

**Directivas y Esquema de Base de Datos para el Compañero Backend (MySQL):**
```sql
CREATE TABLE IF NOT EXISTS configuracion_negocio (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre_negocio VARCHAR(120) NOT NULL DEFAULT 'Sagitta',
  lema_negocio VARCHAR(255) NULL,
  logo_url TEXT NULL,
  logo_dark_url TEXT NULL,
  logo_icono_url TEXT NULL,
  favicon_url TEXT NULL,
  color_primario VARCHAR(10) NOT NULL DEFAULT '#6366f1',
  paleta_predefinida VARCHAR(30) NOT NULL DEFAULT 'indigo',
  fuente_tipografica VARCHAR(50) NOT NULL DEFAULT 'Inter',
  radio_esquinas VARCHAR(20) NOT NULL DEFAULT 'moderno',
  marca_blanca_activa TINYINT(1) NOT NULL DEFAULT 0,
  ocultar_marca_sistema TINYINT(1) NOT NULL DEFAULT 0,
  texto_pie_pagina TEXT NULL,
  mostrar_powered_by TINYINT(1) NOT NULL DEFAULT 1,
  texto_powered_by VARCHAR(120) NULL,
  email_soporte VARCHAR(120) NULL,
  telefono_soporte VARCHAR(50) NULL,
  sitio_web VARCHAR(255) NULL,
  moneda VARCHAR(10) NOT NULL DEFAULT 'USD',
  simbolo_moneda VARCHAR(5) NOT NULL DEFAULT '$',
  zona_horaria VARCHAR(60) NOT NULL DEFAULT 'America/New_York',
  formato_hora ENUM('12h', '24h') NOT NULL DEFAULT '12h',
  formato_fecha VARCHAR(20) NOT NULL DEFAULT 'DD/MM/YYYY',
  url_terminos TEXT NULL,
  url_privacidad TEXT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

**Endpoints que el compañero backend debe implementar:**
- `GET /api/configuracion`: Obtener configuración actual del negocio y marca blanca
- `PUT /api/configuracion`: Actualizar campos de marca blanca y personalización
- `POST /api/configuracion/reset`: Restablecer a valores por defecto del sistema

**Resto de la Fase 5 (En Proceso):**
- **Dashboard de métricas (KPIs):** ingresos, ocupación, tasa de cancelación, conversiones
- **Gráficos interactivos:** líneas, barras, donut
- **Permisos granulares por rol:** qué puede ver y hacer cada rol
- **GDPR:** panel para que el cliente elimine sus propios datos

---

### Fase 6 — Escalabilidad, Multi-Tenant, i18n y CRM ✅ `COMPLETADA`
**Rama:** `feat/fase-6-crm`  
**Descripción:** Escalabilidad empresarial para convertir Sagitta en una plataforma SaaS completa: multi-sucursal/multi-negocio, soporte multi-idioma (i18n), integración bidireccional con CRMs (HubSpot, Salesforce), claves de API pública para desarrolladores y bitácora de auditoría (Audit Logs).

**Lo implementado:**
- **Arquitectura Multi-Tenant (Multi-Sede):**
  - Selector de sucursal (`TenantSelector.tsx`) integrado en la barra de navegación con indicador del plan activo (*Starter*, *Pro*, *Enterprise*).
  - Contexto `TenantContext.tsx` con aislamiento de datos y conmutación de tenant persistida en `localStorage` y cabecera HTTP `X-Tenant-ID`.
  - Capacidad para crear nuevas sucursales o franquicias desde la interfaz.
- **Internacionalización y Multi-Idioma (i18n):**
  - Contexto liviano y reactivo `I18nContext.tsx` con diccionarios para **Español (ES)**, **Inglés (EN)**, **Portugués (PT)** y **Francés (FR)**.
  - Selector de idioma en el Navbar (`I18nSelector.tsx`) con banderas y detección automática del navegador.
- **Conectores CRM (HubSpot, Salesforce, Pipedrive, Zoho):**
  - Tarjetas de integración con estado en vivo, cuenta conectada, recuento de registros sincronizados y botón de *Sincronizar Ahora*.
  - Sincronización bidireccional de clientes como Contactos y citas como Deals/Oportunidades comerciales.
- **Portal de Desarrolladores y Claves de API (`ApiKey`):**
  - Generador de tokens secretos de API (`sag_live_...`) con modal (`ModalApiKey.tsx`), copiado seguro y niveles de permiso (`read`, `write`, `admin`).
  - Capacidad de revocar tokens en tiempo real.
- **Explorador OpenAPI / Swagger v3.0 (`VisorOpenApi.tsx`):**
  - Especificación de endpoints (`/api/citas`, `/api/citas/disponibilidad`, `/api/servicios`), cabeceras requeridas, generador de comandos `cURL` interactivo y consola para probar respuestas en vivo.
- **Bitácora de Auditoría Empresarial (Audit Logs):**
  - Registro cronológico detallado: usuario, email, rol, acción, módulo, dirección IP, severidad (`info`, `warning`, `error`) y detalles.
  - Filtros en tiempo real por severidad, buscador por texto y **exportación directa a CSV descargable**.
- **Página Centralizada:**
  - Nueva ruta y módulo accesible en `/crm` y en el menú lateral ([`CrmDesarrolladoresPage.tsx`](file:///c:/Users/Silvio/Documents/SistemaDeCitas/Sagitta/src/pages/CrmDesarrolladoresPage.tsx)).

**Directivas y Esquema SQL para el Compañero Backend (MySQL):**
```sql
-- 1. Tabla de Sucursales / Tenants
CREATE TABLE IF NOT EXISTS tenants (
  id VARCHAR(64) PRIMARY KEY,
  nombre VARCHAR(120) NOT NULL,
  slug VARCHAR(120) UNIQUE NOT NULL,
  plan ENUM('starter', 'pro', 'enterprise') NOT NULL DEFAULT 'pro',
  activo TINYINT(1) NOT NULL DEFAULT 1,
  es_principal TINYINT(1) NOT NULL DEFAULT 0,
  direccion VARCHAR(255) NULL,
  telefono VARCHAR(50) NULL,
  citas_mes INT DEFAULT 0,
  limite_citas INT DEFAULT 500,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Tabla de Tokens de API para Desarrolladores
CREATE TABLE IF NOT EXISTS api_keys (
  id INT AUTO_INCREMENT PRIMARY KEY,
  tenant_id VARCHAR(64) NOT NULL,
  nombre VARCHAR(120) NOT NULL,
  token_hash VARCHAR(255) NOT NULL,
  permisos ENUM('read', 'write', 'admin') NOT NULL DEFAULT 'read',
  activo TINYINT(1) NOT NULL DEFAULT 1,
  ultimo_uso TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
);

-- 3. Tabla de Bitácora de Auditoría
CREATE TABLE IF NOT EXISTS audit_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  tenant_id VARCHAR(64) NOT NULL,
  usuario VARCHAR(120) NOT NULL,
  email VARCHAR(120) NOT NULL,
  rol VARCHAR(50) NOT NULL,
  accion VARCHAR(120) NOT NULL,
  modulo VARCHAR(50) NOT NULL,
  ip VARCHAR(45) NOT NULL,
  detalles TEXT NULL,
  nivel ENUM('info', 'warning', 'error') NOT NULL DEFAULT 'info',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
);
```

**Endpoints que el compañero backend debe implementar:**
- `GET /api/tenants`, `POST /api/tenants`, `PUT /api/tenants/{id}`
- `GET /api/crm/conectores`, `PUT /api/crm/conectores/{id}`, `POST /api/crm/conectores/{id}/sync`
- `GET /api/api-keys`, `POST /api/api-keys`, `DELETE /api/api-keys/{id}`
- `GET /api/audit-logs?search={search}&nivel={nivel}`

---

### Portal Público de Reservas, Candado Oculto y Gestión de Roles ✅ `COMPLETADA`
**Rama:** `feat/portal-reserva-y-roles`  
**Descripción:** Entrada pública a la plataforma con agendación directa para clientes sin registro obligatorio, acceso administrativo camuflado mediante un icono de candado al pie de página, soporte multi-rol con persistencia en `localStorage` (Auditor Supremo, Admin de Tienda, Trabajador, Recepcionista) y módulo administrativo para dar de alta nuevos administradores y trabajadores.

**Lo implementado:**
- **Portal Público de Reservas (`/`):**
  - La raíz ya no redirige a `/login`; presenta un portal elegante de reservas directas.
  - **Navbar Público:** Muestra la identidad corporativa (Marca Blanca), enlaces a los servicios ofrecidos, información de contacto/WhatsApp directo, selector de sede e idioma. **Sin botones visibles de login ni registro de clientes**.
  - **Flujo de Agendación sin Registro:**
    1. Catálogo de servicios interactivo con filtros de categoría, duraciones y precios.
    2. Selector de profesional y selector en tiempo real de turnos libres (mañana y tarde).
    3. Formulario ágil de datos de contacto (Nombre, Teléfono/WhatsApp, Correo, Notas especiales) sin requerir contraseñas.
    4. Confirmación instantánea con número de folio, detalles del servicio, botón para Google Calendar, descarga de `.ics` universal y aviso a WhatsApp.
  - **Candado de Acceso Oculto:**
    - Al final del pie de página (footer), se ubica un discreto icono de candado (`Lock`) que dirige a `/login` para el dueño, administradores o auditores supremos.
- **Acceso Administrativo y Roles (`/login`):**
  - Soporte de roles diferenciados con botones demo de **1 solo clic**:
    - 🛡️ **Auditor Supremo / Superadmin:** `supremo@sagitta.app` / `Supremo123!` (acceso total y auditorías).
    - 🏢 **Admin de Tienda:** `admin@sagitta.com` / `Admin123!` (gestión de tienda, finanzas y personal).
    - 💼 **Trabajador / Profesional:** `empleado@tienda.com` / `Empleado123!` (agenda y atención).
    - 🛎️ **Recepcionista:** `recepcion@tienda.com` / `Recepcion123!` (citas y cobros).
  - Enlace de retorno al portal público de reservas.
- **Módulo de Gestión de Usuarios y Trabajadores (`/usuarios`):**
  - Directorio completo con buscador, filtros por rol, estado activo/inactivo y última fecha de conexión.
  - Modal para agregar nuevos administradores y trabajadores con asignación de rol, contraseña y sucursal.
  - Sincronización en caliente con `localStorage` (`sagitta_usuarios`), permitiendo que cualquier nuevo trabajador o admin creado pueda iniciar sesión al instante con sus credenciales.
- **Enrutamiento y Menú:**
  - Elemento *"Usuarios"* añadido a la barra lateral administrativa (`Sidebar.tsx`).
  - Ruta `/usuarios` protegida con guard de autenticación.

**Directivas y Esquema SQL para el Compañero Backend (MySQL):**
```sql
CREATE TABLE IF NOT EXISTS usuarios (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(120) NOT NULL,
  email VARCHAR(120) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  rol ENUM('superadmin', 'admin', 'gerente', 'empleado', 'recepcionista', 'cliente') NOT NULL DEFAULT 'empleado',
  telefono VARCHAR(50) NULL,
  sucursal_id VARCHAR(64) NULL,
  activo TINYINT(1) NOT NULL DEFAULT 1,
  timezone VARCHAR(60) NOT NULL DEFAULT 'America/New_York',
  ultimo_login TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (sucursal_id) REFERENCES tenants(id) ON DELETE SET NULL
);
```

**Endpoints que el compañero backend debe implementar:**
- `POST /api/auth/login`: Autenticación con verificación de `password_hash` (`bcrypt`) y retorno de JWT + perfil de usuario.
- `GET /api/auth/me`: Retornar perfil del usuario según el token JWT enviado en la cabecera `Authorization`.
- `POST /api/auth/logout`: Invalidación de token o sesión activa.
- `GET /api/usuarios`: Listar usuarios del tenant o sistema (según rol del solicitante).
- `POST /api/usuarios`: Registrar nuevo usuario (validar que administradores solo creen roles iguales o inferiores).
- `PUT /api/usuarios/{id}`: Actualizar datos, rol, sucursal o estado activo del usuario.
- `DELETE /api/usuarios/{id}`: Desactivar o eliminar usuario del sistema.

---

## 🌿 Flujo de Trabajo Git

### Estrategia de ramas
```
main          ← Producción estable. Solo merges aprobados.
  └── dev     ← Integración continua. Base para crear features.
        ├── feat/fase-1-scaffolding   ✅
        ├── feat/fase-2-reservas      🔄 (próxima)
        └── feat/...
```

### Convención de commits
```bash
feat: nueva funcionalidad
fix: corrección de bug
chore: mantenimiento, dependencias, configuración
style: cambios de estilos sin lógica
refactor: refactorización sin cambio de comportamiento
docs: documentación
test: pruebas
```

### Proceso para colaborar
```bash
# 1. Crear rama desde dev (nunca desde main)
git checkout dev
git pull origin dev
git checkout -b feat/nombre-feature

# 2. Desarrollar y commitear
git add .
git commit -m "feat: descripción clara"

# 3. Push y abrir Pull Request
git push origin feat/nombre-feature
# PR hacia `dev`, no hacia `main`

# 4. Code review y merge
# Después del merge, `dev` → `main` para releases
```

---

## 📐 Convenciones de Código

### TypeScript
- **Strict mode activado** — no `any` implícitos
- Todas las interfaces en `src/types.ts`
- Componentes nombrados con PascalCase
- Hooks con prefijo `use`
- Servicios con sufijo `.service.ts`

### Componentes React
```tsx
// ✅ Correcto — funcional con tipos explícitos
interface Props {
  title: string
  onClose: () => void
}
export function MyComponent({ title, onClose }: Props) { ... }

// ❌ Evitar — default exports anónimos sin tipos
export default ({ title }) => <div>{title}</div>
```

### Llamadas a la API
```typescript
// ✅ Usar siempre los servicios, nunca fetch directo en componentes
import { citasService } from '@/services/citas.service'
const citas = await citasService.getAll()

// ❌ Evitar
const res = await fetch('/api/citas', { headers: ... })
```

### Estilos
```tsx
// ✅ Clases de CSS global definidas en index.css
<div className="card">...</div>
<button className="btn-primary">...</button>

// ✅ Tailwind para casos específicos
<div className="flex items-center gap-4 p-6">...</div>
```

---

## 👥 Equipo

| Rol | Responsable | Área |
|-----|-------------|------|
| Frontend Developer | Silvio | React, TypeScript, UI/UX |
| Backend Developer | TBD | PHP, MySQL, REST API |

---

## 📞 Contrato de API

> Para el compañero backend: el frontend espera este formato en **todos** los endpoints.

```json
// ✅ Respuesta exitosa
{
  "success": true,
  "data": { ... },
  "message": "OK"
}

// ❌ Error
{
  "success": false,
  "message": "Descripción del error",
  "errors": { "campo": ["El campo es requerido"] }
}
```

**Headers requeridos en todas las respuestas:**
```
Content-Type: application/json
Access-Control-Allow-Origin: http://localhost:5173
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS
Access-Control-Allow-Headers: Content-Type, Authorization
```

**Autenticación:**  
Todos los endpoints protegidos leen el header: `Authorization: Bearer <jwt_token>`

---

*Sagitta © 2026 — Lyberate App*

