# SAGITTA — MASTER AUDIT, MODULAR DECOMPOSITION & ENTERPRISE ARCHITECTURE

> **Documento:** Master Audit & Capability Map v2.5  
> **Fecha:** Octubre 2026  
> **Autores:** Principal Product Architect, Senior Frontend Architect, Enterprise SaaS UX/UI Lead, Business Systems Analyst  
> **Código Base:** Sagitta Enterprise Modular (`master`/`main`) — React 19, TypeScript 5.6, Vite 6, Tailwind CSS 3.4  
> **Estado de Validación:** Build `0 errores` (`tsc -b && vite build`), Lint `0 errores` (47 warnings no bloqueantes), Tests Unitarios `6/6 aprobados`.

---

## ÍNDICE GENERAL

1. [A. Resumen Ejecutivo (Executive Summary)](#a-resumen-ejecutivo)
2. [B. Capability Map Completo (Jerarquía 8 Niveles)](#b-capability-map-completo)
3. [C. Matriz de Módulos y Submódulos](#c-matriz-de-módulos-y-submódulos)
4. [D. Arquitectura de Pantallas: Página Actual → Estructura Propuesta](#d-arquitectura-de-pantallas-página-actual--estructura-propuesta)
5. [E. Auditoría de Integridad: Real vs. LocalStore vs. Mock vs. UI-Only](#e-auditoría-de-integridad-funcional)
6. [F. Brechas Funcionales Críticas (Gaps)](#f-brechas-funcionales-críticas)
7. [G. Grafo de Dependencias Técnicas y Funcionales](#g-grafo-de-dependencias)
8. [H. Auditoría de Experiencia de Usuario (UX)](#h-auditoría-ux)
9. [I. Auditoría de Diseño Visual y Erradicación de Estética Genérica de IA](#i-auditoría-visual-ui)
10. [J. Auditoría Responsive y Comportamiento en Tablets](#j-auditoría-responsive)
11. [K. Auditoría Arquitectónica Frontend](#k-auditoría-arquitectónica)
12. [L. Clasificación de Problemas Priorizada (P0 a P4)](#l-clasificación-priorizada-p0-p4)
13. [M. Roadmap de Refinamiento e Implementación](#m-roadmap-de-refinamiento)

---

## A. RESUMEN EJECUTIVO

### 1. Diagnóstico del Producto
Sagitta ha evolucionado desde un asistente monovertical de citas hacia una **suite comercial y operativa híbrida con capacidades multi-industria emergentes**. Sin embargo, presenta una dualidad arquitectónica:
* **Fortalezas Comerciales Clave:** La capa de presentación del Portal Raíz (`/`), el Punto de Venta táctil (`/ventas`), el soporte nativo de Hardware ESC/POS (`/hardware`), el motor de recetas BOM (`CommerceEngine`) y el motor de Marca Blanca (`ConfiguracionContext` y `themeEngine`) demuestran una madurez visual y lógica superior a la media de MVPs.
* **Debilidad Estructural:** La agregación de responsabilidades dentro de páginas monolíticas (por ejemplo, `ClientesPage` acumulando CRUD, fichas, notas y consentimientos; `IntegracionesPage` albergando automatizaciones y webhooks sin separación de dominio; o `ServiciosPage` combinando servicios, paquetes y membresías en pestañas sin URLs profundas).
* **Veredicto de Preparación Comercial:** **4.2 / 5.0**. El producto es vendible como PWA local/offline para comercios independientes, salones y restaurantes rápidos, pero requiere la **descomposición modular estricta y el desacoplamiento de submódulos** para competir como plataforma Enterprise SaaS multi-sucursal escalable.

---

## B. CAPABILITY MAP COMPLETO

Jerarquía canónica de 8 niveles:
`DOMINIO ➔ MÓDULO ➔ SUBMÓDULO ➔ CAPACIDAD ➔ VARIANTE ➔ CONFIGURACIÓN ➔ AUTOMATIZACIÓN ➔ INTEGRACIÓN`

### 1. DOMINIO: CORE & WORKSPACE
* **1.1 Módulo: Identidad & Autenticación**
  * Submódulo: Sesión de Usuario
    * Capacidad: Login multi-rol (Administrador, Especialista, Recepcionista, Cajero)
      * Variante: Email/Password, PIN rápido para POS (tablets)
      * Configuración: Duración de sesión, bloqueo por inactividad
      * Automatización: Alerta por intentos fallidos
      * Integración: JWT / OAuth2 / SSO Google Workspace
  * Submódulo: Control de Acceso Basado en Roles (RBAC)
    * Capacidad: Matriz granular de permisos por módulo y acción (`read`, `write`, `delete`, `manage`)
      * Variante: Roles del sistema inmutables vs. Roles personalizados por empresa
      * Configuración: Asignación por sucursal
* **1.2 Módulo: Organización & Multi-Tenancy**
  * Submódulo: Estructura de Sedes
    * Capacidad: Aislamiento estricto de datos por sucursal (`X-Tenant-ID`)
      * Variante: Sede física, punto de venta móvil, camión/food-truck, tienda online
      * Configuración: Zona horaria, moneda base, datos fiscales por sede
* **1.3 Módulo: Marca Blanca & Personalización**
  * Submódulo: Motor de Identidad Visual (Theme Engine)
    * Capacidad: Inyección dinámica de tokens CSS (8 familias tipográficas, escalas 13px-16px, radios de borde)
      * Variante: Dark Mode profesional (escala tonal slate/zinc) vs. Light Mode empresarial
      * Configuración: Título de pestaña dinámico, Favicon SVG vectorial interactivo

### 2. DOMINIO: OPERACIONES & AGENDA
* **2.1 Módulo: Agenda & Reservas**
  * Submódulo: Calendario Operativo
    * Capacidad: Vistas temporales (Mes, Semana, Día, Línea de Tiempo de Especialistas, Lista)
      * Variante: Cita individual, cita combinada multi-servicio, cita recurrente (diaria/semanal/mensual)
      * Configuración: Intervalos de slot (15, 30, 45, 60 min), buffers de limpieza
      * Automatización: Recordatorios por WhatsApp, confirmación automática 24h antes
      * Integración: Google Calendar bidireccional, archivo `.ics` estándar
  * Submódulo: Gestión de Estados y Turnos
    * Capacidad: Ciclo de vida de la reserva (`confirmada`, `en_atencion`, `completada`, `cancelada`, `no_asistio`)
      * Variante: Reprogramación asistida con validación de conflictos en caliente
      * Configuración: Penalizaciones por no-show, ventana límite de cancelación
* **2.2 Módulo: Recepción & Mostrador**
  * Submódulo: Cola de Atención Física (Walk-In)
    * Capacidad: Tablero kanban en tiempo real de clientes sin cita previa
      * Variante: Asignación al primer profesional libre vs. elección de especialista
      * Configuración: Tiempos máximos de espera tolerados
  * Submódulo: Lista de Espera Inteligente
    * Capacidad: Registro de clientes esperando huecos por cancelación
      * Automatización: Notificación push/WhatsApp al liberarse un slot compatible
* **2.3 Módulo: Recursos Físicos & Infraestructura**
  * Submódulo: Cabinas, Boxes y Equipamiento
    * Capacidad: Asignación obligatoria de recursos físicos por servicio (evita doble reserva de cabina)
      * Variante: Box médico, sillón de peluquería, mesa de restaurante, elevador de taller
      * Configuración: Horarios de mantenimiento y bloqueos preventivos

### 3. DOMINIO: CATÁLOGO COMERCIAL & SERVICIOS
* **3.1 Módulo: Servicios**
  * Submódulo: Catálogo Jerárquico
    * Capacidad: Definición de servicio con duración base, buffers de descanso y precio de venta
      * Variante: Servicio presencial vs. Consulta virtual (con URL de videollamada)
      * Configuración: Estrategias de precio (fijo, por especialista, por horario)
  * Submódulo: Aditamentos & Extras (Add-ons)
    * Capacidad: Servicios complementarios que extienden duración y precio
* **3.2 Módulo: Paquetes & Membresías**
  * Submódulo: Bonos y Paquetes Multisesión
    * Capacidad: Paquetes prepagados con descuento por volumen y conteo regresivo de saldo
  * Submódulo: Membresías Periódicas
    * Capacidad: Planes de suscripción recurrente con beneficios, accesos ilimitados o créditos mensuales
* **3.3 Módulo: Fórmulas Técnicas & Recetas BOM**
  * Submódulo: Consumo de Materias Primas
    * Capacidad: Descuento milimétrico de insumos de inventario por cada servicio completado (ej. tintes, aceites, gasas)

### 4. DOMINIO: CLIENTES & CRM 360°
* **4.1 Módulo: Directorio de Clientes**
  * Submódulo: Ficha de Cliente 360°
    * Capacidad: Expediente centralizado con datos de contacto, historial de citas, facturas y saldo pendiente
      * Variante: Persona natural vs. Empresa (B2B con RIF/RUT y razón social)
  * Submódulo: Documentos & Consentimientos
    * Capacidad: Registro de consentimientos informados, firmas y archivos adjuntos
* **4.2 Módulo: Segmentación & Lealtad**
  * Submódulo: Segmentos Dinámicos
    * Capacidad: Agrupación por comportamiento (Nuevos, VIP, Recurrentes, En riesgo, Inactivos +60 días)
  * Submódulo: Programa de Puntos y Recompensas
    * Capacidad: Acumulación de puntos por importe gastado y canje por servicios o productos

### 5. DOMINIO: PUNTO DE VENTA (POS) & COMERCIO
* **5.1 Módulo: Terminal Punto de Venta (POS)**
  * Submódulo: Caja Registradora Táctil
    * Capacidad: Carrito express optimizado para tablets, búsqueda por código de barras HID y tecla rápida de billetes
      * Variante: Venta directa de mostrador, cobro de comanda de comida rápida, liquidación de cita
      * Configuración: Impuestos discriminados (IVA), descuentos globales o por línea
  * Submódulo: Métodos de Pago Divididos (Split Payment)
    * Capacidad: Desglose de cobro en Efectivo, Tarjeta de Crédito/Débito, Transferencia Bancaria y Zelle
  * Submódulo: Sesiones y Arqueo de Caja
    * Capacidad: Apertura de caja con fondo inicial, registro de entradas/salidas manuales y arqueo de cierre
* **5.2 Módulo: Hardware & Periféricos Industriales**
  * Submódulo: Impresoras Térmicas ESC/POS
    * Capacidad: Impresión directa sin controladores vía Web Bluetooth y USB (formatos 58mm y 80mm)
      * Variante: Ticket fiscal/comercial al cliente vs. Comanda de preparación para cocina/taller
  * Submódulo: Gaveta Monedero & Lectores
    * Capacidad: Disparo de pulso estándar ESC/POS (`0x1B, 0x70`) para apertura automática de cajón RJ11
    * Capacidad: Escaneo por teclado HID con debounce <50ms para pistolas láser
* **5.3 Módulo: Facturación & Finanzas**
  * Submódulo: Comprobantes & Reembolsos
    * Capacidad: Emisión de recibos/facturas en PDF, anulación y devoluciones integrales restituyendo inventario

### 6. DOMINIO: INVENTARIO & CADENA DE SUMINISTRO
* **6.1 Módulo: Inventario Físico**
  * Submódulo: Catálogo de Productos
    * Capacidad: Artículos físicos con identificadores oficiales `#PRD-XXXX`, SKU y código de barras EAN-13
  * Submódulo: Existencias & Movimientos (Kardex)
    * Capacidad: Trazabilidad inmutable de tipos de movimiento (`PURCHASE`, `SALE`, `SERVICE_CONSUMPTION`, `ADJUSTMENT`, `RETURN`, `LOSS`)
    * Capacidad: Alertas de stock mínimo con semáforos de reposición
* **6.2 Módulo: Proveedores & Compras**
  * Submódulo: Gestión de Proveedores
    * Capacidad: Directorio de proveedores con condiciones comerciales y catálogo de compras
  * Submódulo: Órdenes de Compra
    * Capacidad: Creación de órdenes, recepción total o parcial y ajuste automático de existencias y costos

### 7. DOMINIO: PERSONAL, HORARIOS & COMISIONES
* **7.1 Módulo: Equipo Profesional**
  * Submódulo: Perfil y Especialidades
    * Capacidad: Ficha del colaborador, biografía, servicios que puede ejecutar y vinculación a usuario
  * Submódulo: Jornadas y Descansos
    * Capacidad: Matriz semanal de turnos laborales, descansos intermedios y días festivos
* **7.2 Módulo: Liquidación de Comisiones**
  * Submódulo: Reglas de Comisión
    * Capacidad: Cálculo automático por porcentaje de servicio, importe fijo o comisión por venta de producto
    * Capacidad: Reporte de comisiones devengadas, pagadas y saldo acumulado por profesional

### 8. DOMINIO: AUTOMATIZACIONES & MARKETING
* **8.1 Módulo: Motor de Automatizaciones (Workflow Engine)**
  * Submódulo: Reglas Reactivas
    * Capacidad: Constructor Trigger ➔ Condición ➔ Acción (ej. Cita completada ➔ Esperar 2h ➔ Enviar encuesta por WhatsApp)
  * Submódulo: Plantillas Multicanal
    * Capacidad: Mensajes parametrizados con variables (`{{cliente.nombre}}`, `{{cita.fecha}}`, `{{servicio.nombre}}`)
* **8.2 Módulo: Campañas**
  * Submódulo: Envíos Masivos Segmentados
    * Capacidad: Difusión programada para recuperación de clientes inactivos o promociones estacionales

### 9. DOMINIO: ANALÍTICA & REPORTES
* **9.1 Módulo: Inteligencia de Negocio (BI)**
  * Submódulo: Reportes Operativos
    * Capacidad: Tasa de ocupación de sillones/cabinas, índice de cancelación y no-show
  * Submódulo: Reportes Financieros
    * Capacidad: Ventas brutas y netas por categoría, ticket promedio, ventas por método de pago y flujo de caja
    * Capacidad: Exportación limpia a formatos CSV y JSON

---

## C. MATRIZ DE MÓDULOS Y SUBMÓDULOS

| Módulo | Submódulo | Estado Actual | Nivel Madurez (0-5) | Entidades Principales | Operaciones Clave | Verticales |
|---|---|:---:|:---:|---|---|---|
| **Core** | Autenticación | LocalStore / Mock | **4 / 5** | `Usuario`, `Sesion`, `Rol` | Login, logout, cambio de sucursal, guardias de ruta | Todas |
| **Core** | Multi-Tenancy | LocalStore | **4 / 5** | `Tenant`, `Sucursal` | Conmutación de sede, inyección de `X-Tenant-ID` | Todas |
| **Core** | Marca Blanca | Real | **5 / 5** | `ConfiguracionMarcaBlanca` | 8 fuentes, escala en caliente, Browser Tab Studio, favicon SVG | Todas |
| **Agenda** | Calendario Citas | Real | **4.8 / 5** | `Cita`, `Servicio`, `Empleado` | Creación wizard, reprogramación, cancelación, vistas mes/sem/lista | Todas |
| **Agenda** | Walk-in & Espera | LocalStore | **4.5 / 5** | `TurnoWalkIn`, `Espera` | Cola física en mostrador, cálculo de minutos de espera, llamado | Salones, Restaurantes, Clínicas |
| **Agenda** | Recursos Físicos | LocalStore | **4.5 / 5** | `Recurso`, `BloqueoAgenda` | Bloqueos por mantenimiento, validación de capacidad | Clínicas, Spas, Talleres |
| **Catálogo** | Servicios | LocalStore | **4.8 / 5** | `Servicio`, `Categoria` | CRUD, buffers, precios, asignación de profesionales | Todas |
| **Catálogo** | Paquetes/Membresías| LocalStore | **4.5 / 5** | `Paquete`, `Membresia` | Creación de bonos de sesiones y planes recurrentes | Fitness, Spas, Salones |
| **Catálogo** | Recetas BOM | LocalStore / Test | **4.2 / 5** | `RecetaServicio`, `Insumo` | Definición de dosis de materias primas por servicio | Gastronomía, Belleza, Talleres |
| **Clientes** | Directorio & Ficha | LocalStore | **4.8 / 5** | `Cliente`, `Expediente` | Ficha 360°, notas, historial de citas, consentimientos | Todas |
| **Clientes** | CRM & Segmentos | UI-Only | **2.5 / 5** | `Segmento`, `Etiqueta` | Filtrado básico, sin pipeline kanban comercial real | Pro, B2B, Educación |
| **POS** | Caja & Carrito | Real / LocalStore | **4.8 / 5** | `Venta`, `DetalleVenta`, `Caja`| Carrito táctil, billetes rápidos, pagos divididos, arqueo | Todas |
| **POS** | Hardware Periférico| Real | **5 / 5** | `DispositivoESC`, `Impresora` | Web Bluetooth ESC/POS, tickets 58/80mm, cajón RJ11, escáner HID | Retail, Gastronomía, Salones |
| **Inventario**| Control Stock | Real / LocalStore | **4.8 / 5** | `Producto`, `Movimiento` | Identificadores `#PRD-XXXX`, SKU, Kardex, alertas de mínimo | Retail, Almacén, Gastronomía |
| **Inventario**| Compras/Proveedor | LocalStore | **4.0 / 5** | `Proveedor`, `OrdenCompra` | Registro de proveedores, emisión de órdenes de compra | Retail, Gastronomía, Talleres |
| **Personal** | Equipo & Jornadas | LocalStore | **4.5 / 5** | `Empleado`, `Horario` | Directorio, horarios semanales, alta/edición de colaboradores | Todas |
| **Personal** | Comisiones | LocalStore / Test | **4.2 / 5** | `Comision`, `Liquidacion` | Cálculo por servicio/producto, historial devengado | Salones, Spas, Talleres |
| **Marketing** | Automatizaciones | LocalStore | **4.0 / 5** | `ReglaAutomatizacion` | Disparadores por eventos, plantillas, simulación WhatsApp/Email | Todas |
| **Analítica** | Reportes & BI | LocalStore | **4.2 / 5** | `Kpi`, `Metrica`, `Venta` | Dashboards interactivos, desglose por métodos, exportación CSV | Todas |
| **Ajustes** | Roles & Permisos | LocalStore | **4.5 / 5** | `Rol`, `Permiso` | Matriz interactiva de permisos de acceso | Todas |
| **Ajustes** | Presets de Sector | Real | **5 / 5** | `IndustryPreset`, `Termino`| Conmutación dinámica de 10 industrias y adaptación de términos | Todas |

---

## D. ARQUITECTURA DE PANTALLAS: PÁGINA ACTUAL → ESTRUCTURA PROPUESTA

Para erradicar páginas monolíticas y evitar tanto la fragmentación excesiva como el amontonamiento de funciones, se define la siguiente reestructuración:

### 1. Clientes (`ClientesPage.tsx`)
* **Problema Actual:** Una única pantalla de 36.7 kB que renderiza la tabla de clientes, el buscador, el modal de alta, el modal de expediente 360°, la pestaña de notas, consentimientos y archivos.
* **Propuesta Desagregada:**
  * **Página Principal:** `/clientes` ➔ Listado empresarial de clientes con filtros combinados, ordenamiento, selección múltiple y acciones en lote (exportar, etiquetar).
  * **Subvista / Detalle:** `/clientes/:id` (o Drawer contextual amplio para tablets) ➔ Ficha Cliente 360° con pestañas:
    * `Tab 1: Resumen & Métricas` (ticket promedio, última visita, saldo).
    * `Tab 2: Historial de Citas & Servicios`.
    * `Tab 3: Historial de Compras & Facturas POS`.
    * `Tab 4: Notas Técnicas & Ficha Clínica`.
    * `Tab 5: Documentos & Consentimientos`.
  * **Modal Rápido:** `ModalNuevoCliente` optimizado con validación telefónica en 3 campos esenciales.

### 2. Servicios (`ServiciosPage.tsx`)
* **Problema Actual:** Pestañas internas para Servicios, Paquetes de Sesiones y Membresías metidas en el mismo archivo sin rutas profundas.
* **Propuesta Optimizada:**
  * Mantener ruta principal `/servicios` con navegación por **Tabs de URL sincrónica**:
    * `/servicios?tab=catalogo` ➔ Servicios base con categorías, precios y duraciones.
    * `/servicios?tab=paquetes` ➔ Gestión de paquetes y bonos prepagados.
    * `/servicios?tab=membresias` ➔ Planes periódicos de suscripción.
    * `/servicios?tab=recetas` ➔ Fórmulas BOM de consumo de insumos por servicio.
  * Modal drawer: `ModalServicioEditor` para configuración técnica y financiera.

### 3. Inventario (`InventarioPage.tsx`)
* **Problema Actual:** Monolito de 47.6 kB que mezcla productos físicos, Kardex de movimientos, órdenes de compra y proveedores.
* **Propuesta Estructurada:**
  * `/inventario` ➔ Catálogo de productos con identificadores oficiales `#PRD-XXXX`, alertas de stock y buscador rápido.
  * `/inventario/movimientos` (o Tab) ➔ Kardex inmutable con filtros por tipo (`SALE`, `PURCHASE`, `SERVICE_CONSUMPTION`, etc.).
  * `/inventario/compras` (o Tab) ➔ Proveedores y órdenes de compra de reposición.
  * Drawer: `ModalDetalleProducto` con historial de precios de costo, lote y código de barras.

### 4. Integraciones & Automatizaciones (`IntegracionesPage.tsx`)
* **Problema Actual:** Comparte la misma página `/integraciones` y `/automatizaciones` cambiando solo un `defaultTab`.
* **Propuesta Desacoplada:**
  * `/automatizaciones` ➔ Dedicada exclusivamente al Workflow Engine (reglas de triggers, condiciones, plantillas y bitácora de ejecución).
  * `/integraciones` ➔ Conectores externos (Google Calendar, Webhooks, WhatsApp Cloud API, Zoom).
  * `/desarrolladores` (actual `/crm`) ➔ API Keys, OpenAPI Console y auditoría técnica.

---

## E. AUDITORÍA DE INTEGRIDAD FUNCIONAL

### 1. Qué es REAL (100% Funcional de Extremo a Extremo)
* **Commerce Engine (`commerceEngine.service.ts`):** Procesa ventas descontando stock físico, imputa comisiones al profesional, descuenta recetas BOM y procesa reembolsos completos restituyendo existencias.
* **Hardware & ESC/POS (`escpos.ts` y `HardwarePage.tsx`):** Conecta por Web Bluetooth a impresoras térmicas de 58mm y 80mm, envía secuencias binarias de escape con chunking de 512 bytes, abre el cajón monedero por pulso RJ11 y captura códigos de barra HID con debounce.
* **Portal de Entrada Multi-Comercio (`PortalReservaPage.tsx`):** Wizard público con descarga de `.ics`, enlace dinámico a Google Calendar y WhatsApp, catálogo público de productos `#PRD-XXXX` y acceso directo al POS.
* **Motor de Marca Blanca (`themeEngine.ts`):** Aplicación de 8 tipografías, 4 escalas de fuente, selector de paleta corporativa y Browser Tab Studio con favicon vectorial en vivo.
* **Adaptabilidad de Industria (`ModulesContext.tsx` y `industries.ts`):** Activación/desactivación de módulos en caliente y mutación de la terminología de la interfaz (`tTerm`).

### 2. Qué es PERSISTENCIA LOCAL (Funcional en Navegador / Offline)
* **Repositorios Locales (`LocalStorageAdapter.ts`):** Citas, clientes, empleados, inventario, ventas y configuración se almacenan bajo prefijos de sede (`sagitta_{tenantId}_{collection}`). Si no hay internet, el sistema opera con normalidad.

### 3. Qué es MOCK / SIMULADO
* **Integraciones Externas:** La sincronización con Google Calendar y Zoom está simulada localmente (genera los enlaces y archivos `.ics` válidos, pero no invoca la API de Google con OAuth2 en backend).
* **WhatsApp Cloud API:** El sistema genera URLs directas `https://wa.me/` formateadas con mensaje codificado para que el usuario envíe desde su WhatsApp Web/App, pero no cuenta con un webhook broker backend conectado a Meta for Developers.

### 4. Qué Requiere BACKEND FORZOSAMENTE (`BACKEND REQUIRED`)
* **Autenticación con Cookies HttpOnly y 2FA:** La persistencia de tokens JWT en `localStorage` es válida para prototipos y offline PWA, pero en despliegue multi-empresa requiere emisión de cookies seguras y rotación de tokens por servidor.
* **Sincronización Multi-Usuario en Tiempo Real:** Si dos cajeros en distintas tablets venden el último producto simultáneamente, se requiere un bloqueo a nivel de base de datos relacional (PostgreSQL/MySQL con transacciones `SELECT ... FOR UPDATE`).
* **Facturación Fiscal Electrónica:** La emisión de tickets y comprobantes internos en PDF es 100% funcional; el timbrado fiscal ante entidades tributarias (SAT, DIAN, SENIAT, SRI) requiere un microservicio de firma digital en servidor.

---

## F. BRECHAS FUNCIONALES CRÍTICAS (GAPS)

1. **Gestión de Citas Recurrentes en Conflicto:** Aunque se pueden crear citas recurrentes, si una fecha intermedia colisiona con un bloqueo de agenda o con otra cita, no existe un asistente interactivo que ofrezca reubicar únicamente esa fecha en conflicto.
2. **Asignación Automática de Personal (Round-Robin):** Cuando un cliente reserva en el portal sin preferir especialista, el sistema selecciona al primero de la lista en lugar de balancear la carga de trabajo entre el equipo.
3. **Auditoría de Acciones Masivas:** No existe un registro en bitácora cuando un usuario realiza una eliminación o edición masiva de clientes o productos.
4. **Búsqueda Global Unificada (Omnibar `Ctrl+K`):** Falta un modal de comando central que permita saltar a cualquier cita, cliente, producto `#PRD` o módulo desde cualquier pantalla del sistema.

---

## G. GRAFO DE DEPENDENCIAS

```
┌────────────────────────────────────────────────────────────────────────┐
│                              CORE TENANT                               │
│                   (Auth, Tenants, Roles, Marca Blanca)                 │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
           ┌────────────────────────┴────────────────────────┐
           ▼                                                 ▼
┌───────────────────────┐                         ┌──────────────────────┐
│  CATÁLOGO & RECURSOS  │                         │       CLIENTES       │
│  Servicios, Recetas,  │                         │  Ficha 360°, Notas,  │
│  Cabinas, Empleados   │                         │  Historial, Segmentos│
└──────────┬────────────┘                         └──────────┬───────────┘
           │                                                 │
           ├────────────────────────┬────────────────────────┤
           ▼                        ▼                        ▼
┌───────────────────────┐┌───────────────────────┐┌──────────────────────┐
│        AGENDA         ││       INVENTARIO      ││    PUNTO DE VENTA    │
│  Citas, Recepción,    ││  Productos #PRD,      ││   Caja, Cobro Táctil,│
│  Walk-in, Espera      ││  Kardex, Compras      ││   Hardware ESC/POS   │
└──────────┬────────────┘└──────────┬────────────┘└──────────┬───────────┘
           │                        │                        │
           └────────────────────────┼────────────────────────┘
                                    ▼
                      ┌───────────────────────────┐
                      │      COMMERCE ENGINE      │
                      │  Transacciones, Recetas,  │
                      │  Comisiones, Reembolsos   │
                      └─────────────┬─────────────┘
                                    ▼
                      ┌───────────────────────────┐
                      │   AUTOMATIZACIÓN & BI     │
                      │  Triggers, Notificaciones,│
                      │  Reportes y Analítica     │
                      └───────────────────────────┘
```

---

## H. AUDITORÍA UX

1. **Jerarquía Visual y Carga Cognitiva:**
   * Las tablas empresariales deben priorizar columnas vitales: en pantallas medianas, ocultar datos secundarios (como fecha de creación) y mantener siempre visible el identificador (`#PRD-XXXX`, `CIT-XXXX`), el estado con badge y las acciones rápidas.
2. **Prevención de Pérdida de Datos en Formularios:**
   * En formularios extensos (como el expediente del cliente o la creación de recetas), implementar alerta de cambios no guardados si el usuario intenta cerrar el modal accidentalmente.
3. **Feedback de Operaciones Críticas:**
   * En operaciones destructivas (anulación de ventas, eliminación de productos o bloqueo de agenda), reemplazar toasts genéricos por un diálogo modal de confirmación explícita con doble verificación.

---

## I. AUDITORÍA VISUAL (UI REVIEW)

### Principios de Diseño Empresarial Sobrio
* **Erradicación Total de Estética Genérica de IA:**
  * Prohibidos los gradientes púrpuras/rosas chillones como fondos principales de pantalla.
  * Prohibido el glassmorphism excesivo con desenfoques saturados (`backdrop-blur-xl`) que degradan el rendimiento de renderizado en tablets económicas.
  * Bordes sutiles y estandarizados (`border-border` o `border-slate-200 / border-slate-800`), sin sombras flotantes exageradas.
* **Dark Mode Ergonómico:**
  * Uso de escala tonal neutra: fondo base en `slate-950` (#020617) o `zinc-950` (#09090b), superficies de tarjetas en `slate-900` (#0f172a), y bordes en `slate-800` (#1e293b). Contraste WCAG AAA en textos sin encandilamiento.
* **Estandarización de Badges e Indicadores:**
  * Estados con tipografía monoespaciada en identificadores (`font-mono text-xs font-bold`) y semáforos cromáticos tenues con borde suave:
    * Verde Éxito: `bg-emerald-50 text-emerald-700 border-emerald-200` (Dark: `bg-emerald-950/60 text-emerald-400 border-emerald-800/60`).
    * Ámbar Alerta: `bg-amber-50 text-amber-700 border-amber-200` (Dark: `bg-amber-950/60 text-amber-400 border-amber-800/60`).
    * Rojo Peligro: `bg-rose-50 text-rose-700 border-rose-200` (Dark: `bg-rose-950/60 text-rose-400 border-rose-800/60`).

---

## J. AUDITORÍA RESPONSIVE

* **Dispositivos Críticos:**
  * **Tablets Android & iPads (768px a 1024px horizontal):** Es el formato donde se opera el 80% de los Puntos de Venta (POS) y recepciones. La barra lateral (`Sidebar`) debe colapsar automáticamente a modo compacto de iconos (`w-[4.5rem]`) sin tapar el carrito de venta.
  * **Móviles (375px a 430px):** Las tablas complejas deben transicionar a tarjetas condensadas verticales y el selector de sucursal debe situarse dentro del menú de cabecera.
  * **Pantallas de Mostrador (1280px a 1920px):** Soporte para visualización en paralelo de agenda y cola de espera.

---

## K. AUDITORÍA ARQUITECTÓNICA FRONTEND

1. **Separación de Responsabilidades:**
   * La lógica de negocio no debe residir dentro de componentes JSX de vista.
   * `src/components/ui/` debe mantenerse 100% agnóstico al dominio (sin importar tipos de `Cita` o `Producto`).
   * Los servicios en `src/services/` deben delegar la persistencia a `src/repositories/`.
2. **Gestión de Estado:**
   * Centralización de módulos en `ModulesContext`, identidad en `ConfiguracionContext` y sesión en `AuthContext`.
   * Evitar "prop drilling" mediante hooks de dominio específicos (`useModules`, `useConfiguracion`, `useAuth`).

---

## L. CLASIFICACIÓN PRIORIZADA (P0 A P4)

### P0 — Crítico (Rompe la Experiencia o Bloquea Operaciones)
* Ninguno en este momento. La compilación está en 0 errores, lint en 0 errores y el test runner en 100% pasando.

### P1 — Alto (Credibilidad Comercial y Escalabilidad de Datos)
1. **Desagregación de ClientesPage:** Separar la ficha 360° en un componente modular reutilizable con URLs profundas o drawer industrial.
2. **Búsqueda Global Unificada (Omnibar `Ctrl+K`):** Para navegación y localización instantánea de clientes, citas y productos `#PRD-XXXX`.
3. **Validación Cruzada de Conflictos de Cabina/Recurso:** Impedir que el wizard rápido de citas agende dos profesionales en la misma sala simultáneamente.

### P2 — Medio (Refinamiento Funcional & Operativo)
1. **Balanceo de Carga de Profesionales (Round-Robin):** Asignación inteligente al profesional con menor ocupación en citas públicas sin preferencia.
2. **Alertas de Modificaciones No Guardadas:** Intercepción de salida en formularios de expedientes y recetas BOM.
3. **Paginación Uniforme en Todas las Tablas:** Aplicar el componente atómico `Pagination` a inventario y movimientos.

### P3 — Bajo (Pulido Cosmético y Micro-Interacciones)
1. **Shortcuts de Teclado en Punto de Venta:** Atajos de teclado físico (`F2` buscar, `F4` cobrar, `ESC` limpiar carrito) para cajeros rápidos.
2. **Exportador CSV Nativo en Reportes:** Conectar el generador CSV a todas las tablas del módulo analítico.

### P4 — Futuro (Evolución de Ecosistema)
1. **Integración con Pasarelas de Pago Online (Stripe / MercadoPago SDK).**
2. **Conexión Directa con WhatsApp Business API Cloud.**

---

## M. ROADMAP DE IMPLEMENTACIÓN

```
┌────────────────────────────────────────────────────────────────────────┐
│ FASE 1: DESAGREGACIÓN MODULAR & OMNIBAR GLOBAL (P1)                   │
│ • Implementación del Command Menu (Ctrl+K) con búsqueda multi-entidad. │
│ • Descomposición de ClientesPage en Ficha 360° modular por pestañas.  │
│ • Validación estricta de solape de recursos en wizard de citas.        │
├────────────────────────────────────────────────────────────────────────┤
│ FASE 2: EXPERIENCIA TABLET POS & ERGONOMÍA (P2)                       │
│ • Integración de shortcuts de teclado físico para mostrador.           │
│ • Modal de confirmación con doble verificación en acciones críticas.   │
│ • Interceptor de formulario con detección de cambios no guardados.     │
├────────────────────────────────────────────────────────────────────────┤
│ FASE 3: PULIDO VISUAL & ACCESIBILIDAD EMPRESARIAL (P3)                 │
│ • Revisión exhaustiva de contrastes WCAG en Dark Mode tonal.           │
│ • Auditoría de micro-animaciones para dispositivos táctiles de 60Hz.   │
│ • Exportación unificada CSV en todas las vistas de auditoría.          │
└────────────────────────────────────────────────────────────────────────┘
```
