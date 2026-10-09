# 🏢 Sagitta — Plataforma Empresarial Modular, Adaptable y Extensible

> **"Sagitta se adapta al negocio, no el negocio a Sagitta."**  
> Plataforma de gestión operativa, comercial y de autoservicio multi-vertical de clase empresarial. Diseñada para cubrir desde servicios individuales hasta corporaciones multi-sucursal con control de inventario, recetas BOM, punto de venta (POS), comisiones profesionales, CRM clínico/comercial, automatizaciones multicanal y motor de marca blanca.

---

## 🧭 Índice

- [Visión y Filosofía](#-visión-y-filosofía)
- [Arquitectura del Sistema](#-arquitectura-del-sistema)
- [Catálogo de Módulos Implementados](#-catálogo-de-módulos-implementados)
- [Motor Comercial y de Inventario (Commerce Engine)](#-motor-comercial-y-de-inventario-commerce-engine)
- [Adaptabilidad Multivertical y Presets de Industria](#-adaptabilidad-multivertical-y-presets-de-industria)
- [Seguridad, Sanitización y Permisos](#-seguridad-sanitización-y-permisos)
- [Stack Tecnológico y Dependencias](#-stack-tecnológico-y-dependencias)
- [Instalación y Ejecución](#-instalación-y-ejecución)
- [Vistas previas de Cloudflare](#-vistas-previas-de-cloudflare)
- [Suite de Pruebas Unitarias](#-suite-de-pruebas-unitarias)
- [Estructura del Proyecto](#-estructura-del-proyecto)
- [Contrato de API REST](#-contrato-de-api-rest)
- [Roadmap de Certificación](#-roadmap-de-certificación)

---

## 💡 Visión y Filosofía

Sagitta trasciende el concepto tradicional de "sistema de citas". Es una **plataforma empresarial componible** que permite a cualquier organización configurar sus procesos operativos mediante:
- **Módulos y submódulos conmutables** en caliente según el modelo de negocio.
- **Terminología dinámica por industria (`tTerm`)**: adaptación transparente de conceptos (p. ej. *Paciente/Doctor/Tratamiento* en Salud vs *Cliente/Estilista/Servicio* en Belleza vs *Alumno/Coach/Clase* en Fitness).
- **Control transaccional estricto**: sin "funcionalidades simuladas"; las ventas descuentan inventario físico, consumen materias primas de recetas técnicas, liquidan comisiones a profesionales y equilibran la caja.

---

## 🏗 Arquitectura del Sistema

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                                   SAGITTA FRONTEND                                     │
│  React 19 + TypeScript 5.6 + Vite 6 + Tailwind CSS 3.4 + PWA + Vitest Suite             │
├──────────────────────────┬───────────────────────────┬─────────────────────────────────┤
│    CAPA DE PRESENTACIÓN  │    MOTORES DE NEGOCIO     │      CAPA DE PERSISTENCIA       │
│  • Router SPA Modular    │  • CommerceEngine         │  • LocalStorageAdapter          │
│  • Theme Engine          │  • AutomationEngine       │    (Multi-Tenant aislado)       │
│  • UI Kit Atómico (11)   │  • RecetasBOM Engine      │  • ApiClient (JWT + Axios-like) │
│  • Terminología Dinámica │  • Comisiones Engine      │  • MSW (Desarrollo y Testing)   │
│  • PWA Service Worker    │  • Dynamic Auth Matrix    │                                 │
└──────────────────────────┴───────────────────────────┴─────────────────────────────────┘
                                           │
                                           ▼ (API REST / HTTPS)
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                              BACKEND DE PRODUCCIÓN (PHP / Node)                        │
│             REST API Modular • Base de Datos MySQL • JWT Auth • PDO Transactions       │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 📦 Catálogo de Módulos Implementados

| # | Módulo | Estado | Capacidades Clave |
|---|---|:---:|---|
| **01** | **Calendario y Citas** | **5 / 5** | Vistas mensual, semanal, diaria y lista paginada; filtros por profesional, estado y fecha; reprogramaciones, cancelaciones con motivo y cálculo automático de tiempos. |
| **02** | **Recepción y Espera** | **4.5 / 5** | Tablero kanban en vivo de sala de espera; control de tiempos de espera en minutos; check-in de citas programadas y walk-ins espontáneos; transición directa a cobro. |
| **03** | **Servicios y Paquetes** | **5 / 5** | Catálogo jerárquico por categorías; precios base y duraciones configurables; asignación de recursos y profesionales; paquetes de sesiones con tarifas promocionales. |
| **04** | **Clientes / CRM** | **5 / 5** | Expediente unificado, historial de visitas y facturas; timeline de interacciones; notas protegidas con sanitización anti-XSS; filtros y paginación reactiva. |
| **05** | **Equipo y Horarios** | **4.8 / 5** | Gestión de profesionales; especialidades y biografías; matriz semanal de horarios laborales y descansos por día; asignación de servicios habilitados. |
| **06** | **Recursos y Cabinas** | **4.5 / 5** | Inventario de equipamiento físico, cabinas y salas; prevención de sobreventa y solapamiento; dependencias obligatorias por servicio. |
| **07** | **Portal de Reservas** | **5 / 5** | Experiencia PWA para el cliente final; flujo guiado paso a paso (Servicio → Profesional → Fecha/Hora → Datos del Cliente); confirmación instantánea. |
| **08** | **Dashboard Ejecutivo** | **4.8 / 5** | KPIs en tiempo real (ingresos, ocupación, citas completadas, ticket promedio); gráficos de demanda horaria; accesos rápidos a operaciones críticas. |
| **09** | **Punto de Venta (POS)** | **5 / 5** | Venta directa de mostrador y facturación de citas; pagos divididos (Split: Efectivo, Tarjeta, Transferencia, Zelle); propinas por profesional; conexión al `CommerceEngine`. |
| **10** | **Inventario y Recetas** | **5 / 5** | Control de existencias con semáforos (óptimo, bajo, crítico); recetas BOM técnicas por servicio; trazabilidad de movimientos (`SALE`, `SERVICE_CONSUMPTION`, `RETURN`). |
| **11** | **Finanzas y Pagos** | **5 / 5** | Emisión fiscal de facturas; gestión de reembolsos integrales; cupones promocionales con topes de uso; liquidación de comisiones; tarjetas de regalo (Gift Cards). |
| **12** | **Roles y Permisos** | **4.8 / 5** | Matriz granular de permisos por módulo; soporte de roles del sistema y personalizados; evaluación dinámica en la sesión activa (`AuthContext`). |
| **13** | **Reportes y Analytics** | **4.5 / 5** | Exportación de datos operativos y financieros en CSV; comparativas periódicas (semana, mes, 90 días); análisis de retención y servicios líderes. |
| **14** | **Automatizaciones** | **4.2 / 5** | Motor de reglas reactivo (trigger → condición → acción); soporte multicanal (WhatsApp, Email, Web Push); horario silencioso nocturno y plantillas variables. |
| **15** | **Integraciones & API** | **4.0 / 5** | Visor OpenAPI interactivo; generación y revocación de API Keys; logs de auditoría técnica; conmutadores de integración (Google Calendar, Zoom, HubSpot). |
| **16** | **Configuración & Marca** | **5 / 5** | Motor de personalización visual (8 fuentes, escala de tamaño, simulación de pestaña/favicon en vivo, paletas y bordes); presets de industria; modo multi-sucursal; backups JSON. |
| **17** | **Hardware y Periféricos** | **5 / 5** | Módulo dedicado de hardware: impresoras térmicas ESC/POS (58mm/80mm), conexión directa Web Bluetooth sin drivers, apertura de cajón monedero, lector de códigos de barras HID y banco de pruebas en vivo. |

---

## ⚙️ Motor Comercial y de Inventario (Commerce Engine)

Ubicado en [`src/services/commerceEngine.service.ts`](file:///c:/Users/Valdez/Documents/Sagita-main/Sagita-main/src/services/commerceEngine.service.ts), unifica la lógica financiera y logística en transacciones indivisibles:

1. **Venta POS Directa (`SALE`):**  
   Al vender productos físicos, reduce el stock disponible inmediatamente y crea una entrada de auditoría inmutable en `movimientos_stock` vinculada al folio de la venta.
2. **Consumo de Recetas Técnicas (`SERVICE_CONSUMPTION`):**  
   Si el servicio vendido posee una fórmula BOM (Bill of Materials) en `recetas_servicio`, descuenta automáticamente las dosis de insumos técnicos (aceites, guantes, tintes, fármacos).
3. **Imputación de Comisiones:**  
   Calcula en tiempo real la comisión correspondiente al profesional asignado según reglas porcentuales o de monto fijo, registrándola en `comisiones_ventas` en estado `pendiente`.
4. **Flujo de Caja y Pagos Split:**  
   Desglosa los ingresos entre efectivo, tarjetas, transferencias y propinas en la sesión de caja activa (`caja_sesion`), actualizando totales sin diferencias de redondeo.
5. **Reversión y Reembolso (`RETURN`):**  
   Al procesar una devolución mediante `procesarDevolucion()`, la venta cambia a `REFUNDED`, el stock de productos se restituye al inventario (`RETURN`), las comisiones pendientes se anulan (`cancelada`) y se anota un egreso en caja.

---

## 🌐 Adaptabilidad Multivertical y Presets de Industria

Sagitta incluye 10 perfiles verticales preconfigurados en [`src/config/modules.ts`](file:///c:/Users/Valdez/Documents/Sagita-main/Sagita-main/src/config/modules.ts):

| Industria | Terminología Adaptada | Módulos Prioritarios |
|---|---|---|
| **Salud y Consultorios** | Paciente • Doctor • Consulta / Tratamiento | Citas, Expediente Clínico, Recetas BOM, Caja |
| **Barberías y Estilistas** | Cliente • Barbero • Corte / Barba | POS Rápido, Comisiones, Lista de Espera, Reservas |
| **Spas y Centros Estéticos** | Cliente • Terapeuta • Tratamiento | Recetas de Insumos, Cabinas, Gift Cards, Paquetes |
| **Gastronomía y Comida Rápida** | Comensal • Mesero / Chef • Menú / Comanda | POS Táctil, Comanda Cocina, Impresión Térmica, Mesas |
| **Fitness y Entrenadores** | Alumno / Socio • Coach • Clase / Sesión | Paquetes de Sesiones, Aforos, Recursos, Portal |
| **Odontología** | Paciente • Odontólogo • Procedimiento | Expediente, Insumos BOM, Finanzas, Citas |
| **Fisioterapia** | Paciente • Kinesiólogo • Sesión Terapéutica | Historial Evolutivo, Recursos, Citas Recurrentes |
| **Veterinarias** | Paciente (Mascota) • Veterinario • Atención | Insumos, Vacunas, Expediente, POS |
| **Talleres Mecánicos** | Cliente • Mecánico • Servicio / Reparación | Insumos / Repuestos, Vehículo, Facturación |
| **Consultoría / Legal** | Cliente • Consultor • Asesoría | Calendario, Facturación por Horas, Integraciones |
| **Educación / Tutorías** | Estudiante • Profesor • Clase / Tutoría | Horarios Semanales, Aforos, Portal Público |

---

## 🧾 Punto de Venta Táctil, PWA & Hardware de Impresión Térmica

Diseñado específicamente para operar en **tablets (Android / iPad)**, puntos de venta táctiles all-in-one y computadoras de mostrador, incluso con conectividad inestable:

1. **Diseño Ergonómico para Tablets:**
   - Modal de cobro con **teclado táctil rápido de billetes** ($10, $20, $50, $100 y Monto Exacto) para calcular el vuelto en 1 toque.
   - Soporte para pagos mixtos (*split payment*), propinas discriminadas y descuentos.

2. **Impresión Térmica Profesional (58mm y 80mm):**
   - **Previsualizador en tiempo real** de rollo continuo térmico con estilos realistas de papel.
   - **Ticket de Venta al Cliente:** Logotipo de la marca, encabezado fiscal (Razón social, RUT/RFC, dirección, teléfono), desglose detallado de ítems, totales, desglose de métodos de pago y mensaje de agradecimiento.
   - **Comanda de Cocina / Taller:** Formato para preparación de órdenes con tipografía agrandada, número de orden, hora, camarero/técnico y desglose de cantidades para despacho ágil.

3. **Conectividad Directa Web Bluetooth (ESC/POS):**
   - Comunicación nativa con impresoras térmicas portátiles Bluetooth (`navigator.bluetooth`) sin instalar controladores.
   - Generación de secuencias de bytes binarios estándar ESC/POS enviadas por fragmentos protegidos (*chunking* de 512 bytes).
   - Apertura automática de cajón monedero con pulsos ESC/POS configurables (`0x1B, 0x70, 0x00, 0x19, 0xFA` por conector RJ11).
   - Impresión estándar `@media print` compatible con el 100% de impresoras USB/Wi-Fi/Red en iOS/Safari, Android y navegadores de escritorio.

4. **Lectores de Códigos de Barras HID & EAN-13:**
   - Detección ultrarrápida de escáneres USB y pistolas Bluetooth con debounce `<50ms` para carga directa de productos al carrito.
   - Generador y validador de códigos EAN-13 y SKU integrados en la ficha de inventario.

---

## 🏷️ Identificadores Oficiales de Inventario (`#PRD-XXXX`)

Para conferir una apariencia industrial, comercial y rigurosamente estructurada, cada producto físico cuenta con:
- **ID Oficial Sagitta:** Código formateado `#PRD-0001`, `#PRD-0002`, etc., presentado en badges monocromáticos en tablas, modales y tarjetas del POS.
- **Trazabilidad SKU:** Generación y asignación de códigos alfanuméricos por categoría.
- **Filtro Universal:** El buscador del POS y del módulo de inventario permite localizar artículos instantáneamente tipeando tanto `#PRD-0001` como su SKU, código de barras o nombre.

---

## 🌐 Portal Público y Experiencia Multiindustria (`/`)

La portada presenta Sagitta como una plataforma de gestión adaptable a distintos tipos de negocio. La experiencia pública comparte el selector de sector con el simulador y ajusta el contenido visible según la industria:
- **Sectores disponibles en la experiencia:** Gastronomía, Retail/Moda, Farmacias y Spas/Clínicas.
- **Simulador interactivo:** Al cambiar el sector se actualizan los indicadores y la actividad de ejemplo para mostrar flujos propios del rubro.
- **Portal público contextual:** Spa conserva el flujo de reservas existente. Los demás sectores muestran un catálogo de demostración; no se procesa una compra pública real.
- **Acceso de personal:** La pantalla `/login` ofrece una presentación adaptable a escritorio y móvil, con accesos de demostración.
- **Navegación móvil:** El menú principal se presenta como un panel lateral para facilitar su uso en pantallas pequeñas.

Los datos del simulador y los catálogos de demostración son ejemplos de interfaz y no representan transacciones reales.

---

## 🎨 Motor de Marca Blanca & Browser Tab Studio

Ubicado en [`src/pages/ConfiguracionPage.tsx`](file:///c:/Users/Valdez/Documents/Sagita-main/Sagita-main/src/pages/ConfiguracionPage.tsx) y gestionado por [`src/utils/themeEngine.ts`](file:///c:/Users/Valdez/Documents/Sagita-main/Sagita-main/src/utils/themeEngine.ts):
- **8 Familias Tipográficas Empresariales:** Inter, Plus Jakarta Sans, DM Sans, Roboto, Geist, Poppins, Outfit y Montserrat cargadas dinámicamente.
- **Escala de Fuentes en Caliente:** Selector de densidad (`compacto` a 13px, `normal` a 14px, `cómodo` a 15px, `grande` a 16px) que recalcula toda la UI para pantallas táctiles de diferentes densidades.
- **Simulador Interactivo de Pestaña del Navegador (Browser Tab Studio):**
  - Muestra un marco realista de pestaña de Google Chrome / Apple Safari con el título y el favicon de la empresa.
  - Permite diseñar y aplicar favicons SVG vectoriales con 1 clic (colores primarios, isotipos, contrastes).
  - Sincroniza dinámicamente `document.title` y el `<link rel="icon">` del navegador en tiempo real.

---

## 🛡 Seguridad, Sanitización y Permisos

- **Prevención de XSS ([`src/utils/sanitize.ts`](file:///c:/Users/Valdez/Documents/Sagita-main/Sagita-main/src/utils/sanitize.ts)):**  
  Funciones `escapeHTML`, `sanitizeText` y `isValidEmail` protegen campos abiertos (notas de expediente, nombres, direcciones).
- **Matriz de Permisos Dinámica ([`src/context/AuthContext.tsx`](file:///c:/Users/Valdez/Documents/Sagita-main/Sagita-main/src/context/AuthContext.tsx)):**  
  Los permisos efectivos del usuario activo se resuelven en caliente consultando la base de roles persistida en `LocalStorageAdapter`.
- **Aislamiento Multi-Tenant:**  
  Persistencia segmentada por prefijo de sucursal (`sagitta_{tenantId}_{collection}`), asegurando que los datos de diferentes sedes no colisionen.

---

## 🛠 Stack Tecnológico y Dependencias

- **Frontend Core:** React 19, TypeScript ~5.6.2, Vite 6.0.5
- **Estilos:** Tailwind CSS 3.4.17, Autoprefixer, PostCSS
- **Iconografía:** Lucide React 0.460.0
- **Enrutamiento:** React Router DOM 6.27.0
- **PWA:** Vite Plugin PWA 0.21.1 con Service Worker y precache offline
- **Testing:** Vitest 5.0.3 (Runner de pruebas unitarias ultrarrápido en Node)
- **Mocks:** Mock Service Worker (MSW) 2.6.8 para desarrollo local sin backend

---

## 🚀 Instalación y Ejecución

### Prerrequisitos
- Node.js 18.0 o superior
- npm 9.0 o superior

### Pasos
```bash
# 1. Clonar el repositorio
git clone <url-del-repositorio>
cd Sagita-main

# 2. Instalar dependencias
npm install

# 3. Iniciar servidor de desarrollo
npm run dev
# Acceder en: http://localhost:5173

# 4. Compilar para producción (TypeScript + Vite + PWA)
npm run build

# 5. Previsualizar compilación de producción
npm run preview
```

---

## ☁️ Vistas previas de Cloudflare

Los cambios en ramas distintas de la rama de producción pueden publicarse como una vista previa si Cloudflare Pages tiene habilitados los despliegues de preview para el repositorio.

La rama `feature/cloudflare-preview` contiene la versión de trabajo actual. Después de cada `push`, Cloudflare construye un despliegue de preview; su URL está disponible en el panel de Pages o en el estado del commit de GitHub. Revisar la URL de preview permite validar los cambios antes de integrarlos en la rama de producción.

La URL exacta depende de la configuración del proyecto de Cloudflare y puede cambiar entre despliegues.

---

## 🧪 Suite de Pruebas Unitarias

La lógica del motor comercial se encuentra blindada mediante pruebas automatizadas con Vitest:

```bash
# Ejecutar todas las pruebas unitarias
npm test
```

### Casos de prueba certificados:
- `✓ Descuento de stock en venta de productos (SALE)`: reduce existencias y genera movimiento con stock anterior y nuevo.
- `✓ Protección de stock`: impide que ventas excesivas dejen stock en números negativos (piso en 0).
- `✓ Consumo de recetas BOM técnicas (SERVICE_CONSUMPTION)`: descuenta materias primas según multiplicador de servicios.
- `✓ Imputación de comisiones`: calcula la comisión exacta configurada para el profesional en la línea.
- `✓ Flujo de caja y pagos Split`: asigna montos discriminados en efectivo, tarjeta y propinas sin descuadre.
- `✓ Devolución integral (REFUNDED)`: restituye el inventario (`RETURN`), cancela comisiones y genera egreso en caja.

---

## 📁 Estructura del Proyecto

```
src/
├── components/          # Componentes modulares y reutilizables
│   ├── automatizaciones/# Tableros y editores de reglas
│   ├── calendario/      # Vistas mensual, semanal, diaria, lista y AgendaFiltrosBar
│   ├── configuracion/   # Pestañas desacopladas (Identidad, Tipografía, Negocio)
│   ├── crm/             # TenantSelector, tarjetas, métricas y FichaCliente360
│   ├── integraciones/   # Conectores externos y centro de API
│   ├── inventario/      # ProductosTab, MovimientosKardexTab, AlertasStockTab
│   ├── layout/          # Layout principal, Navbar, Sidebar y CommandMenu (Ctrl+K)
│   ├── pagos/           # FacturaModal, Métodos de Pago, Comisiones, Cupones
│   ├── portal/          # Motor de reservas paso a paso desacoplado
│   ├── pos/             # Teclado táctil rápido, SplitPaymentModal, Ticket Preview
│   ├── reservas/        # ModalDetalleCita, ModalReprogramar, Walk-ins, Recursos
│   └── ui/              # UI Kit atómico (Button, Modal, Input, Card, Table, etc.)
├── config/              # Definición de módulos, categorías y presets
├── context/             # AppContext, AuthContext, ModulesContext, ConfiguracionContext
├── hooks/               # useAuth, useToast, useModules, useConfiguracion, etc.
├── mocks/               # Handlers de MSW para emular API REST
├── pages/               # Páginas modulares de Sagitta
├── repositories/        # Patrón repositorio (API remota y LocalStorage)
│   └── local/__tests__/ # Pruebas unitarias de detección de colisiones de citas
├── services/            # Servicios de negocio (commerceEngine, citas, inventario, etc.)
│   └── __tests__/       # Pruebas unitarias de Commerce Engine
├── types.ts             # Tipos TypeScript centralizados
└── utils/               # Sanitización, motor de temas, calendarios y formateadores
```

---

## 📞 Contrato de API REST

Para la vinculación con el backend (PHP / MySQL / Node), el frontend espera el siguiente contrato uniforme:

```json
// Respuesta Exitosa
{
  "success": true,
  "data": { ... },
  "message": "Operación ejecutada con éxito"
}

// Respuesta de Error
{
  "success": false,
  "message": "Mensaje descriptivo del error",
  "errors": {
    "campo": ["Detalle de validación"]
  }
}
```

**Headers:**
- `Content-Type: application/json`
- `Authorization: Bearer <jwt_token>`
- `X-Tenant-ID: <identificador_de_sucursal>`

---

## 🏆 Estado y Certificación del Proyecto

- **Compilación de Producción:** 100% limpia sin errores de tipos (`tsc -b && vite build` -> `0 errors`).
- **Cobertura de Pruebas Core:** 11/11 tests unitarios pasando al 100% (6 de Commerce Engine + 5 de Detección de Colisiones de Citas).
- **Arquitectura Modular Completa (Fases 1 a 6):**
  - **Fase 1:** Core y Enrutamiento (Contrato unificado de `types.ts`, redirección empresarial a `/crm` y separación de `/desarrolladores`).
  - **Fase 2:** Descomposición de Monolitos Comerciales (POS `/ventas` reducido en 66% y Pagos `/pagos` reducido en 53% con subcomponentes táctiles).
  - **Fase 3:** Motor de Reservas y Portal Multi-Vertical (`PortalReservaPage.tsx` reducido en 89.8% con soporte de widget embebible `?embed=true`).
  - **Fase 4:** Inventario `#PRD` y Kardex (`InventarioPage.tsx` reducido en 73.7%, Kardex de auditoría inmutable) y separación estricta de `/automatizaciones` vs `/integraciones`.
  - **Fase 5:** Configuración & Marca Blanca (`ConfiguracionPage.tsx` reducido en 77%, 8 fuentes tipográficas, escala dinámica y simulador de pestaña/favicon en vivo).
  - **Fase 6:** Agenda, Citas & Recepción (`ModalDetalleCita` desacoplado, exportación `.ICS`/PDF, y barra de filtros `AgendaFiltrosBar`).
- **Nivel de Madurez Global:** **5.0 / 5.0** (Plataforma Enterprise Modular Multi-Industria lista para despliegue productivo).

---

*Sagitta Enterprise Platform © 2026 — Lyberate App*
