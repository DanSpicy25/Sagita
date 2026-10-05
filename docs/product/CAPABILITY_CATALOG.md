# Sagitta — Catálogo maestro de capacidades

> Fuente de verdad funcional del producto. El registro técnico equivalente vive en
> `src/config/modules.ts` (módulos activables) y `src/config/industries.ts` (presets por sector).
> Mantener ambos sincronizados con este documento.

## Leyendas

**Prioridad comercial**

| Código | Significado |
|---|---|
| EXISTENTE | Funciona hoy en frontend (con datos MSW/localStorage) |
| REFINAMIENTO | Existe pero incompleto, duplicado, huérfano o sin UI |
| ALTA | Siguiente bloque a construir; bloquea ventas a varias verticales |
| MEDIA | Diferenciador; se construye tras ALTA |
| FUTURA | Planificado, requiere base previa |
| EXPERIMENTAL | Exploratorio, validar con clientes antes |

**Estado técnico**: `IMPL` implementado · `PARCIAL` · `MOCK` simula backend/integración · `PH` placeholder (archivo vacío) · `AUS` ausente · `HUÉRF` implementado pero sin ruta/UI que lo use.

**Backend**: `FR` frontend ready (contrato documentado, falta backend) · `BR` backend requerido para que sea real · `IR` integración externa requerida.

**Verticales**: BEL belleza · SAL salud · FIT fitness · AUT automotriz · EDU educación · PRO servicios profesionales · CRE creativos · GAS gastronomía · HOG servicios a domicilio · ALQ alquiler/espacios · MAS mascotas · TUR hospedaje/turismo.

---

## 0. CORE (no desactivable)

| Capacidad | Estado | Prioridad | Backend | Notas |
|---|---|---|---|---|
| Autenticación JWT + refresh | MOCK | EXISTENTE | BR | Tokens en localStorage solo válido en demo. Producción: cookie httpOnly |
| Multi-tenant / multi-sucursal (selector, claves por tenant) | PARCIAL | REFINAMIENTO | BR | `TenantContext` + `LocalStorageAdapter` aíslan por clave; el aislamiento real es del backend |
| Roles y permisos (UI) | PARCIAL | REFINAMIENTO | BR | `ROLE_PERMISSIONS` estático; roles personalizados de `RolesPage` no se aplican aún a usuarios |
| Registro de módulos + perfil de negocio por sucursal | IMPL | ALTA | FR | Nuevo: `modules.ts`, `industries.ts`, `ModulesContext` |
| Feature flags de plataforma | IMPL | EXISTENTE | — | `features.ts` = interruptor global de build |
| Marca blanca / temas / densidad / radios | IMPL | EXISTENTE | FR | `ConfiguracionContext`, `themeEngine`, `themePresets` |
| i18n (es/en/pt/fr) | PARCIAL | REFINAMIENTO | — | Motor listo; cobertura de páginas parcial |
| Auditoría | MOCK | REFINAMIENTO | BR | Tabla y export CSV en `/crm` |
| PWA | IMPL | EXISTENTE | — | vite-plugin-pwa |
| Capa de repositorios local/api | IMPL | EXISTENTE | FR | `VITE_DATA_MODE=local\|api` |
| 2FA, gestión de sesiones activas | AUS | MEDIA | BR | |
| Terminología por sector (Cita/Clase/Orden/Mesa…) | PARCIAL | ALTA | — | Preset en `industries.ts`; aplicado a navegación; falta en páginas |

---

## 1. RESERVAS (Agenda)

| Submódulo / capacidad | Estado | Prioridad | Verticales | Dependencias |
|---|---|---|---|---|
| Wizard admin (servicio → profesional → fecha → confirmación) | IMPL | EXISTENTE | todas | servicios, profesionales |
| Carrito multi-servicio | IMPL | EXISTENTE | BEL, SAL, AUT | |
| Recurrentes (diaria/semanal/mensual/anual) | IMPL | EXISTENTE | SAL, FIT, EDU | |
| Vistas mes / semana / lista | IMPL | EXISTENTE | todas | |
| Online (portal público `/`) | IMPL | EXISTENTE | todas | portal |
| Presencial / virtual (enlace videollamada) | IMPL | EXISTENTE | SAL, PRO, EDU | integración videollamada (IR) |
| Cancelación | IMPL | EXISTENTE | todas | |
| Reprogramación (`ModalReprogramarCita`) | HUÉRF | ALTA | todas | conectar a `CitasPage` |
| Walk-in / cola de turnos (`TableroColaWalkIn`) | HUÉRF→IMPL | ALTA | BEL, AUT, GAS | Conectado en `/recepcion` |
| Lista de espera (`GestionListaEspera`) | HUÉRF→IMPL | ALTA | todas | Conectado en `/recepcion`. **Duplicado** con pestaña "Lista de espera" de Finanzas (`pagos.service`) — unificar |
| Por recurso (sala, cabina, bahía, mesa) | PARCIAL | ALTA | SAL, AUT, ALQ, GAS | recursos |
| Bloqueos de agenda (`GestionBloqueos`) | HUÉRF→IMPL | ALTA | todas | Conectado en `/recursos` |
| Buffers / preparación / limpieza | PARCIAL | EXISTENTE | BEL, SAL | buffer en servicio |
| Motor de disponibilidad con conflictos (`utils/bookingEngine.ts`) | HUÉRF | ALTA | todas | Integrar en `citas.service` (validación de solape recurso+profesional) |
| Grupales / por capacidad (clases, cupos) | AUS | ALTA | FIT, EDU, TUR | capacidad en servicio o recurso |
| Series (paquete de N sesiones agendadas) | AUS | MEDIA | SAL, EDU | paquetes |
| A domicilio (dirección, zona, tiempo de traslado) | AUS | MEDIA | HOG, BEL, MAS | ubicación de cliente |
| Híbrida (aforo presencial + virtual) | AUS | FUTURA | EDU, FIT | grupales |
| Confirmación automática / manual | PARCIAL | ALTA | todas | automatizaciones |
| Recordatorios | PARCIAL | EXISTENTE | todas | automatizaciones, canales (IR) |
| No-show (marcado, penalización, historial) | PARCIAL | ALTA | BEL, SAL | estado `no_asistio` en tipos |
| Depósitos / anticipos para reservar | AUS | ALTA | BEL, SAL, CRE | pagos online (IR) |
| Políticas (antelación mínima, ventana de cancelación, cargo) | AUS | ALTA | todas | configuración |
| Extras / add-ons | IMPL | EXISTENTE | BEL, AUT | |
| Reserva con paquete o membresía (consumo de saldo) | PARCIAL | MEDIA | FIT, BEL | membresías, paquetes |
| Asignación automática de profesional (round-robin, menor carga) | AUS | MEDIA | todas | |
| Overbooking controlado | AUS | EXPERIMENTAL | GAS, TUR | |

## 2. SERVICIOS

| Capacidad | Estado | Prioridad | Notas |
|---|---|---|---|
| CRUD, categorías, duración, buffer | IMPL | EXISTENTE | `ServiciosPage` |
| Ficha comercial (`ModalServicioComercial`) | IMPL | EXISTENTE | |
| Paquetes | IMPL | EXISTENTE | `GestionPaquetes` |
| Membresías | IMPL | EXISTENTE | `GestionMembresias` |
| Insumos / receta por servicio (BOM) | PARCIAL | ALTA | `recetas.service` sin UI (`GestionRecetasBOM` PH) |
| Variantes de precio: fijo, desde, variable, por duración, por profesional, por recurso, por cantidad | PARCIAL | ALTA | Modelar como `estrategia_precio` + reglas, **no** como servicios duplicados |
| Impuestos por servicio | PARCIAL | MEDIA | |
| Comisión por servicio | PARCIAL | MEDIA | `comisiones.service` |
| Disponibilidad propia del servicio (días/horas/sucursales) | AUS | MEDIA | |
| Requisitos (formulario previo, consentimiento) | AUS | MEDIA | documentos |

## 3. PROFESIONALES / EMPLEADOS

| Capacidad | Estado | Prioridad | Notas |
|---|---|---|---|
| Directorio, especialidad, jornada | IMPL | EXISTENTE | `EmpleadosPage` (solo lectura) |
| CRUD de empleados | AUS | ALTA | |
| Horarios, pausas, días libres | PARCIAL | ALTA | tipos `HorarioEmpleado`, `DiaLibre` |
| Vacaciones / ausencias con aprobación | AUS | MEDIA | |
| Servicios que presta / sucursales | PARCIAL | ALTA | |
| Tipos: empleado, contratista, freelancer, vendedor | AUS | MEDIA | |
| Comisiones (reglas, liquidación) | PARCIAL | ALTA | servicio existe; UI `GestionComisiones` PH |
| Metas, bonos, propinas | AUS | MEDIA | |
| Agenda personal del profesional (rol empleado) | PARCIAL | MEDIA | |

## 4. RECURSOS

| Capacidad | Estado | Prioridad |
|---|---|---|
| CRUD recursos (tipo, capacidad, estado, sucursal) | HUÉRF→IMPL | EXISTENTE (`/recursos`) |
| Bloqueos y mantenimiento | HUÉRF→IMPL | EXISTENTE (`/recursos`) |
| Asignación a servicios (requiere recurso X) | PARCIAL | ALTA |
| Horario propio del recurso | AUS | MEDIA |
| Plano / mapa (mesas, bahías) | AUS | FUTURA (GAS, AUT) |

## 5. CLIENTES

| Capacidad | Estado | Prioridad |
|---|---|---|
| Directorio, búsqueda, conteo histórico | IMPL | EXISTENTE |
| Expediente: notas, archivos, consentimientos, campos personalizados | IMPL | EXISTENTE (`ModalExpedienteCliente`) |
| Historial de reservas, compras, paquetes, membresías | PARCIAL | ALTA |
| Tipos: persona, empresa, familia/grupo (titular + dependientes) | AUS | ALTA (SAL, EDU, MAS) |
| Segmentos: VIP, recurrente, ocasional, inactivo (calculados) | AUS | ALTA |
| Etiquetas | PARCIAL | ALTA |
| Saldo a favor / crédito del cliente | AUS | MEDIA |
| Fusión de duplicados | AUS | MEDIA |
| Importar / exportar CSV | AUS | ALTA |
| Mascotas / vehículos / pacientes como "sujetos" del cliente | AUS | MEDIA (MAS, AUT, SAL) — entidad genérica `sujeto_servicio` |

## 6. CRM (comercial)

> **Hoy `/crm` no es un CRM**: contiene conectores externos, API keys, OpenAPI y auditoría.
> Se reubica en la navegación como "Desarrolladores" (Configuración). El CRM comercial es AUS.

| Capacidad | Estado | Prioridad |
|---|---|---|
| Leads / prospectos | AUS | MEDIA |
| Pipeline de oportunidades (kanban por etapas) | AUS | MEDIA (PRO, EDU, CRE) |
| Tareas y actividades | AUS | MEDIA |
| Cotizaciones vinculadas a oportunidad | AUS | MEDIA |
| Conectores HubSpot/Salesforce/Zoho | MOCK | FUTURA (IR) |

## 7. POS Y VENTAS

| Capacidad | Estado | Prioridad |
|---|---|---|
| Catálogo servicios + productos, carrito, impuestos, descuentos | IMPL | EXISTENTE (`VentasPage`) |
| Pagos: efectivo, tarjeta, transferencia, mixto | IMPL | EXISTENTE |
| Pagos divididos (`PagoSplit`) | PARCIAL | ALTA |
| Gift cards | PARCIAL | ALTA (servicio sin UI; `GestionGiftCards` PH) |
| Promociones automáticas | PARCIAL | ALTA (servicio sin UI; `GestionPromociones` PH) |
| Cupones | IMPL | EXISTENTE (Finanzas) |
| Propinas | PARCIAL | MEDIA |
| Devoluciones / cambios (`ModalDevolucionVenta` PH) | PARCIAL | ALTA |
| Cobro de cita desde agenda | PARCIAL | ALTA |
| Venta de paquetes/membresías en POS | PARCIAL | MEDIA |
| Crédito del cliente / fiado | AUS | MEDIA |
| Modo offline del POS | AUS | FUTURA |

## 8. CAJA Y FINANZAS

| Capacidad | Estado | Prioridad |
|---|---|---|
| Apertura / cierre / arqueo / diferencia | IMPL | EXISTENTE |
| Ingresos / egresos manuales | IMPL | EXISTENTE |
| Reembolsos | IMPL | EXISTENTE |
| Cuentas por cobrar / pagar | AUS | MEDIA |
| Gastos categorizados, utilidad | AUS | MEDIA |
| Múltiples cajas por sucursal | AUS | MEDIA |
| Conciliación con pasarela | AUS | FUTURA (IR) |

## 9. FACTURACIÓN Y DOCUMENTOS

| Capacidad | Estado | Prioridad |
|---|---|---|
| Facturas vinculadas a citas, impresión, PDF (`pdfGenerator`) | IMPL | EXISTENTE |
| Recibos / tickets | IMPL | EXISTENTE |
| Cotizaciones / presupuestos | AUS | ALTA (AUT, PRO, CRE) |
| Notas de crédito / débito | AUS | MEDIA |
| Facturación electrónica fiscal por país | AUS | FUTURA (IR, por país) |
| Plantillas de documentos (contratos, consentimientos, formularios) | PARCIAL | MEDIA (`templateEngine`) |
| Firma digital | AUS | FUTURA |

## 10. INVENTARIO

| Capacidad | Estado | Prioridad |
|---|---|---|
| Productos, categorías, stock, mínimos | IMPL | EXISTENTE |
| Movimientos (compra, venta, ajuste, devolución, pérdida, transferencia) | IMPL | EXISTENTE |
| Alertas de stock bajo | IMPL | EXISTENTE |
| Consumo automático por receta de servicio | PARCIAL | ALTA (`commerceEngine` + `recetas.service`) |
| Variantes / SKU / código de barras | PARCIAL | MEDIA |
| Lotes / series / vencimientos | AUS | MEDIA (SAL, GAS) |
| Almacenes y ubicaciones múltiples | AUS | MEDIA |
| Inventario físico (conteo cíclico) | AUS | MEDIA |

## 11. COMPRAS Y PROVEEDORES

| Capacidad | Estado | Prioridad |
|---|---|---|
| Proveedores, órdenes de compra, recepción | PARCIAL | ALTA (`compras.service` sin UI; `GestionProveedoresCompras` PH) |
| Historial de costos, múltiples proveedores por producto | AUS | MEDIA |
| Reposición sugerida desde alertas | AUS | MEDIA |

## 12. MEMBRESÍAS

| Capacidad | Estado | Prioridad |
|---|---|---|
| Planes por periodicidad, beneficios, servicios incluidos | IMPL | EXISTENTE |
| Asignación a cliente | IMPL | EXISTENTE |
| Pausa / cancelación / upgrade / downgrade / prorrateo | PARCIAL | MEDIA |
| Cobro recurrente | AUS | FUTURA (IR pasarela) |
| Control de acceso (check-in) | AUS | MEDIA (FIT) |

## 13. FIDELIZACIÓN

| Capacidad | Estado | Prioridad |
|---|---|---|
| Puntos por compra / visita | AUS | MEDIA |
| Niveles (tiers) | AUS | MEDIA |
| Recompensas / cashback | AUS | MEDIA |
| Referidos | AUS | FUTURA |

## 14. MARKETING

| Capacidad | Estado | Prioridad |
|---|---|---|
| Plantillas de mensajes multi-canal | IMPL | EXISTENTE |
| Segmentos dinámicos (inactivos, VIP, cumpleaños) | AUS | MEDIA |
| Campañas (envío masivo programado) | AUS | MEDIA (IR canales) |
| Promociones / cupones | PARCIAL | ALTA |

## 15. AUTOMATIZACIONES

| Capacidad | Estado | Prioridad |
|---|---|---|
| Motor trigger → condición → acción (`automationEngine.service`) | IMPL | EXISTENTE (local) |
| Editor, historial de ejecuciones, preferencias de canal | IMPL | EXISTENTE |
| Delays / pasos encadenados | PARCIAL | MEDIA |
| Acciones: email, WhatsApp, SMS, push | MOCK | — (IR) |
| Acciones: webhook, tarea, etiqueta, cambio de estado, cupón | PARCIAL | MEDIA |
| Ejecución en servidor (cron/colas) | AUS | ALTA (BR) — hoy corre en el navegador |

## 16. REPORTES Y ANALÍTICA

| Capacidad | Estado | Prioridad |
|---|---|---|
| Resumen, citas, ventas, clientes, servicios | IMPL | EXISTENTE |
| Ocupación por recurso/profesional, horas pico | AUS | MEDIA |
| Retención, LTV, frecuencia | AUS | MEDIA |
| Inventario: rotación, mermas | AUS | MEDIA |
| Comisiones y utilidad | AUS | MEDIA |
| Dashboard con widgets configurables por rol/módulo | AUS | FUTURA |

## 17. PORTALES

| Capacidad | Estado | Prioridad |
|---|---|---|
| Portal público de reservas | IMPL | EXISTENTE |
| Widget embebible / snippet | IMPL | EXISTENTE |
| QR a portal | AUS | MEDIA |
| Portal de cliente (mis citas, compras, membresía, puntos, documentos) | AUS | MEDIA (BR auth cliente) |

## 18. INTEGRACIONES Y API

| Capacidad | Estado | Prioridad |
|---|---|---|
| Exportar a Google Calendar / .ics / wa.me (cliente) | IMPL | EXISTENTE (real, sin servidor) |
| Google Calendar / Meet / Zoom sincronización | MOCK | FUTURA (IR) |
| WhatsApp Business / SMS / Email transaccional | MOCK | MEDIA (IR) |
| Web Push | PARCIAL | MEDIA |
| Webhooks salientes con HMAC | MOCK | MEDIA (BR) |
| API keys con scopes | MOCK | MEDIA (BR) |
| Visor OpenAPI | MOCK | EXISTENTE (spec de ejemplo) |
| Stripe / PayPal / pasarelas locales | AUS | FUTURA (IR) |
| Zapier / Make | AUS | FUTURA (vía webhooks) |
| Contabilidad externa | AUS | FUTURA |

---

## Hallazgos de auditoría (resumen)

* **Huérfanos conectados en la sesión 01**: `GestionRecursos`, `GestionBloqueos` → `/recursos`; `TableroColaWalkIn`, `GestionListaEspera` → `/recepcion`.
* **Huérfanos pendientes**: `ModalReprogramarCita`, `utils/bookingEngine.ts`, `components/auth/Can.tsx`, `hooks/useApi.ts`, `promociones.service`.
* **Placeholders vacíos (0 bytes, no importados)**: `ui/{Card,Checkbox,Dropdown,ErrorState,Pagination,Radio,Skeleton,Switch,Table,Tabs,Tooltip}`, `pagos/{GestionComisiones,GestionGiftCards,GestionPromociones}`, `inventario/{GestionProveedoresCompras,GestionRecetasBOM}`, `ventas/{ModalCobroPOS,ModalDevolucionVenta}`.
* **Duplicado**: lista de espera en Finanzas (`pagos.service`) vs `listaEspera.service`.
* **Seguridad (demo)**: contraseñas semilla y tokens en localStorage; aceptable solo con MSW. Ver `docs/architecture/MODULAR_ARCHITECTURE.md §Seguridad`.
