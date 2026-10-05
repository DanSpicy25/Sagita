# Sagitta — Mapa Maestro de Módulos

Este documento define la estructura y descomposición de cada módulo de la plataforma empresarial Sagitta.

---

## Estructura Jerárquica del Producto

```text
CORE (Siempre activo, aislamiento de tenant, auth, seguridad)
  ↓
MÓDULO (Capacidad funcional de negocio, ej. Reservas, POS, Inventario)
  ↓
SUBMÓDULO (Área operativa, ej. Cola Walk-in, Matriz de Permisos, Arqueo de Caja)
  ↓
CAPACIDAD / SUBCAPACIDAD (Acción o flujo concreto)
  ↓
VARIANTE (Estrategia alternativa, ej. precio por profesional vs. precio fijo)
  ↓
COMPLEMENTO / ADDON (Funcionalidad opcional activable independientemente)
  ↓
CONFIGURACIÓN (Parámetros específicos por negocio/sucursal)
  ↓
AUTOMATIZACIÓN (Disparadores, condiciones y acciones vinculadas)
  ↓
INTEGRACIÓN (Conectores con pasarelas, calendarios o APIs externas)
```

---

## Mapa de Módulos

### 1. Operaciones — Reservas y Citas (`/citas`)
* **ID:** `reservas`
* **Categoría:** Operaciones
* **Componentes Principales:** `CitasPage`, `CalendarioMensual`, `CalendarioSemanal`, `VistaLista`, `ModalReprogramarCita`, `TarjetaCita`
* **Submódulos y Capacidades:**
  * Vista mensual, semanal y por lista.
  * Agendamiento administrativo y online.
  * Citas individuales y recurrentes (diaria, semanal, mensual, anual).
  * Modalidad presencial y virtual (con generación de link Google Meet/Zoom).
  * Reprogramación asistida con validación de disponibilidad y asignación de recurso.
  * Cancelación y vinculación automática a facturación / reembolsos.
  * Exportación `.ics`, sincronización con Google Calendar y aviso rápido por WhatsApp.
* **Complementos (Addons):**
  * `reservas.reprogramacion`: Reprogramación asistida validando slots libres.
  * `reservas.grupales`: Cupos por sesión y capacidad (fitness, educación).
  * `reservas.domicilio`: Visitas técnicas y traslados con geolocalización.
  * `reservas.depositos`: Anticipos y cobro parcial antes de confirmar.
  * `reservas.politicas`: Reglas de cancelación, tiempos mínimos y no-show.

---

### 2. Operaciones — Recepción y Mostrador (`/recepcion`)
* **ID:** `recepcion`
* **Categoría:** Operaciones
* **Componentes Principales:** `RecepcionPage`, `TableroColaWalkIn`, `GestionListaEspera`
* **Submódulos y Capacidades:**
  * **Cola Walk-In:** Gestión de clientes que llegan sin cita previa, asignación de turno, estado (esperando, en atención, completado, cancelado) y cálculo de tiempos de espera en mostrador.
  * **Lista de Espera:** Registro de clientes en lista de espera cuando la agenda está completa, notificación y conversión directa a cita cuando se libera un slot.
* **Complementos:**
  * `recepcion.walk_in`: Turnos por orden de llegada con pantalla pública/mostrador.
  * `recepcion.lista_espera`: Fila virtual de clientes para huecos cancelados.

---

### 3. Operaciones — Catálogo de Servicios (`/servicios`)
* **ID:** `servicios`
* **Categoría:** Operaciones
* **Componentes Principales:** `ServiciosPage`, `ModalServicioComercial`, `GestionPaquetes`, `GestionMembresias`
* **Submódulos y Capacidades:**
  * Servicios individuales con duración, precio base, buffer anterior y buffer posterior.
  * Paquetes de sesiones prepagadas con control de saldo de sesiones por cliente.
  * Planes de membresía con periodicidad (mensual, anual), beneficios y servicios incluidos.
  * Extras y complementos comerciales (add-ons del servicio).
* **Complementos:**
  * `servicios.paquetes`: Bonos y paquetes multisesión.
  * `servicios.membresias`: Suscripciones recurrentes y beneficios.
  * `servicios.recetas`: Receta de insumos y materiales (BOM) que descuenta inventario.
  * `servicios.precios_variables`: Precios dinámicos por horario, profesional o recurso.

---

### 4. Operaciones — Profesionales y Equipo (`/empleados`)
* **ID:** `profesionales`
* **Categoría:** Operaciones
* **Componentes Principales:** `EmpleadosPage`
* **Submódulos y Capacidades:**
  * Directorio de especialistas, barberos, médicos, entrenadores o técnicos.
  * Especialidades y asignación de servicios específicos.
  * Jornadas de trabajo y horarios semanales con pausas.
* **Complementos:**
  * `profesionales.comisiones`: Reglas de comisiones por servicio o venta de producto.
  * `profesionales.ausencias`: Gestión de vacaciones, permisos y días festivos.

---

### 5. Operaciones — Recursos y Espacios (`/recursos`)
* **ID:** `recursos`
* **Categoría:** Operaciones
* **Componentes Principales:** `RecursosPage`, `GestionRecursos`, `GestionBloqueos`
* **Submódulos y Capacidades:**
  * Gestión de activos físicos o lógicos: cabinas de estética, consultorios, elevadores mecánicos, salas de juntas, mesas o pistas deportivas.
  * Asignación de sucursal, estado (disponible, ocupado, mantenimiento, inactivo) y capacidad simultánea.
  * Bloqueos de agenda para mantenimiento, desinfección o eventos privados.
* **Complementos:**
  * `recursos.bloqueos`: Bloqueos programados con motivo y rango horario.

---

### 6. Clientes — Expediente y CRM (`/clientes`)
* **ID:** `clientes`
* **Categoría:** Clientes
* **Componentes Principales:** `ClientesPage`, `ModalExpedienteCliente`
* **Submódulos y Capacidades:**
  * Directorio de clientes con búsqueda reactiva, teléfono, email y etiquetas.
  * Expediente integral: notas privadas, historial de citas, historial de compras.
  * Documentos y archivos adjuntos (recetas, imágenes antes/después, estudios).
  * Consentimientos informados y firma de términos.
  * Campos personalizados por sector (ej. alergias, tipo de piel, placa del vehículo).

---

### 7. Ventas — Punto de Venta (POS) y Caja (`/ventas`)
* **ID:** `pos`
* **Categoría:** Ventas
* **Componentes Principales:** `VentasPage`
* **Submódulos y Capacidades:**
  * Catálogo unificado de servicios y productos para cobro ágil.
  * Carrito interactivo con cálculo de impuestos (IVA), subtotales y descuentos.
  * Métodos de pago múltiples: efectivo, tarjeta, transferencia bancaria y pagos mixtos.
  * Control de caja: apertura de turno, registro de entradas y salidas de efectivo, arqueo y cierre con cálculo de diferencias.
  * Historial de tickets y comprobantes impresos.
* **Complementos:**
  * `pos.gift_cards`: Venta y canje de tarjetas de regalo / saldo prepagado.
  * `pos.promociones`: Reglas de promociones automáticas (2x1, descuentos por monto).
  * `pos.devoluciones`: Registro de reembolsos y devoluciones a inventario.

---

### 8. Ventas — Facturación y Finanzas (`/finanzas`)
* **ID:** `finanzas`
* **Categoría:** Ventas
* **Componentes Principales:** `PagosPage`, `FacturaModal`, `CuponInput`
* **Submódulos y Capacidades:**
  * Emisión y gestión de comprobantes fiscales/facturas vinculadas a citas y ventas.
  * Generación y descarga de facturas en PDF con membrete del negocio.
  * Gestión de cupones de descuento con código promocional, porcentaje o importe fijo.
  * Administración de reembolsos de servicios cancelados.
* **Complementos:**
  * `finanzas.cotizaciones`: Elaboración de presupuestos antes del servicio.
  * `finanzas.fiscal`: Conexión con facturación electrónica según el país.

---

### 9. Inventario — Control de Stock (`/inventario`)
* **ID:** `inventario`
* **Categoría:** Inventario
* **Componentes Principales:** `InventarioPage`
* **Submódulos y Capacidades:**
  * Catálogo de productos para venta o uso interno con SKU y código de barras.
  * Control de niveles de stock (mínimo, actual y máximo).
  * Registro de movimientos de inventario: compras, ventas, ajustes, mermas/pérdidas y transferencias entre sucursales.
  * Panel de alertas automáticas para reorden de productos con bajo inventario.
* **Complementos:**
  * `inventario.lotes`: Trazabilidad por número de lote y fecha de vencimiento.
  * `inventario.almacenes`: Múltiples almacenes dentro de una misma sucursal.

---

### 10. Marketing — Automatizaciones de Mensajería (`/automatizaciones`)
* **ID:** `automatizaciones`
* **Categoría:** Marketing
* **Componentes Principales:** `IntegracionesPage` (Pestaña Automatizaciones), `TableroAutomatizaciones`, `ModalEditorAutomatizacion`, `GestionPlantillasMensajes`, `HistorialEjecuciones`, `PreferenciasComunicacion`
* **Submódulos y Capacidades:**
  * Motor de reglas: Disparador (trigger) → Condiciones (filters) → Acciones (actions).
  * Disparadores soportados: Cita creada, cita confirmada, cita cancelada, no-show, pago recibido, stock bajo, cumpleaños, cliente inactivo.
  * Canales: WhatsApp, Email, Web Push, SMS, Webhook HTTP.
  * Editor de plantillas de mensajes con variables dinámicas (`{{cliente.nombre}}`, `{{cita.fecha}}`, `{{servicio.nombre}}`).
  * Bitácora en tiempo real con historial de ejecuciones y estado de entrega.

---

### 11. Analítica — Reportes e Inteligencia (`/reportes`)
* **ID:** `reportes`
* **Categoría:** Analítica
* **Componentes Principales:** `ReportesPage`
* **Submódulos y Capacidades:**
  * Resumen ejecutivo con KPIs de facturación, volumen y ticket promedio.
  * Métricas de citas: ocupación, cancelaciones, no-shows y servicios más demandados.
  * Métricas de ventas: distribución por métodos de pago y ventas de productos vs servicios.
  * Análisis de clientes: tasa de recurrencia, clientes frecuentes y valor de vida (LTV).

---

### 12. Configuración — Módulos y Adaptabilidad (`/modulos`)
* **ID:** `modulos`
* **Categoría:** Configuración
* **Componentes Principales:** `ModulosPage`
* **Submódulos y Capacidades:**
  * Selector de presets por industria para configurar en 1 clic la terminología y módulos recomendados.
  * Activación/desactivación granular de módulos con resolución de dependencias técnicas en cascada.
  * Activación/desactivación de complementos (addons).
  * Validación comercial por plan de la sucursal (Starter, Pro, Enterprise).

---

### 13. Configuración — Marca Blanca y Aspecto (`/ajustes`)
* **ID:** `ajustes`
* **Categoría:** Configuración
* **Componentes Principales:** `ConfiguracionPage`, `PrevisualizadorMarcaBlanca`, `GeneradorWidgetEmbebible`
* **Submódulos y Capacidades:**
  * Personalización de identidad corporativa (logo claro, logo oscuro, isotipo, favicon).
  * Selector de paletas cromáticas, color HEX primario y tipografía.
  * Geometría visual: radios de esquinas, estilo de sombras y densidad de la interfaz.
  * Generador de widget embebible `<iframe>` y `<script>` para sitios web externos.

---

### 14. Configuración — Desarrolladores y API (`/crm`)
* **ID:** `desarrolladores`
* **Categoría:** Configuración
* **Componentes Principales:** `CrmDesarrolladoresPage`, `ModalApiKey`, `VisorOpenApi`
* **Submódulos y Capacidades:**
  * Generación de API Keys con permisos granulares (`read`, `write`, `admin`).
  * Consola interactiva OpenAPI v3.0 / Swagger para pruebas de endpoints.
  * Registro de auditoría y seguridad con exportación CSV de accesos y modificaciones.
  * Conectores CRM externos (HubSpot, Salesforce, Zoho).
