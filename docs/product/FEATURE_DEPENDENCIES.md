# Sagitta — Matriz de Dependencias de Capacidades

Este documento clasifica las dependencias del sistema en cuatro niveles rigurosos, garantizando que la plataforma pueda encender o apagar módulos sin romper la estabilidad técnica ni la experiencia del usuario.

---

## 1. Niveles de Dependencia

1. **Dependencia Técnica (Obligatoria):**  
   El módulo B importa tipos, modelos de datos o servicios del módulo A. Si A está inactivo, B no puede operar y se desactiva en cascada automáticamente.
2. **Dependencia Funcional (Recomendada):**  
   El módulo B funciona de forma autónoma sin el módulo A, pero su propuesta de valor se maximiza cuando ambos están activos. No se fuerza su activación.
3. **Dependencia Comercial (Licenciamiento/Plan):**  
   El módulo requiere que la sucursal/tenant tenga contratado un plan mínimo (`starter`, `pro` o `enterprise`).
4. **Complemento Opcional (Add-on):**  
   Una subcapacidad interna de un módulo que puede habilitarse o inhabilitarse individualmente mediante interruptor granular.

---

## 2. Matriz de Dependencias por Módulo

| Módulo | Tipo de Módulo | Dependencia Técnica | Dependencia Funcional | Plan Mínimo | Complementos (Addons) |
|---|---|---|---|---|---|
| **Dashboard** | CORE | Ninguna | Todas | `starter` | KPIs, accesos directos |
| **Reservas** | Módulo | `servicios`, `profesionales` | `recursos`, `recepcion` | `starter` | `reprogramacion`, `grupales`, `domicilio`, `depositos`, `politicas` |
| **Recepción** | Módulo | `reservas` | `profesionales` | `starter` | `walk_in`, `lista_espera` |
| **Servicios** | Módulo | Ninguna | `inventario` | `starter` | `paquetes`, `membresias`, `recetas`, `precios_variables` |
| **Profesionales** | Módulo | Ninguna | `servicios` | `starter` | `comisiones`, `ausencias` |
| **Recursos** | Módulo | Ninguna | `reservas` | `starter` | `bloqueos` |
| **Clientes** | CORE | Ninguna | `reservas`, `pos` | `starter` | Expediente, consentimientos, notas, archivos |
| **POS (Ventas)** | Módulo | Ninguna | `inventario`, `servicios` | `starter` | `gift_cards`, `promociones`, `devoluciones` |
| **Finanzas (Facturación)** | Módulo | Ninguna | `pos`, `reservas` | `starter` | `cotizaciones`, `fiscal` |
| **Inventario** | Módulo | Ninguna | `pos` | `starter` | `lotes`, `almacenes` |
| **Compras** | Módulo | `inventario` | `finanzas` | `starter` | Órdenes de compra, recepción de mercancía |
| **Automatizaciones** | Módulo | Ninguna | `reservas`, `clientes` | `pro` | Reglas personalizadas, plantillas multicanal |
| **Campañas / Marketing** | Módulo | `clientes` | `automatizaciones` | `pro` | Segmentos dinámicos, envíos masivos |
| **CRM Comercial** | Módulo | `clientes` | `finanzas` | `pro` | Pipeline kanban, etapas de oportunidad |
| **Fidelización** | Módulo | `clientes` | `pos` | `pro` | Puntos, niveles, cashback |
| **Portal de Cliente** | Módulo | `clientes` | `reservas` | `pro` | Autoservicio, reprogramaciones, saldo |
| **Reportes** | Módulo | Ninguna | Todos | `starter` | Resumen, citas, ventas, clientes |
| **Usuarios** | CORE | Ninguna | `roles` | `starter` | Cuentas, asignación de rol |
| **Roles y Permisos** | CORE | Ninguna | `usuarios` | `starter` | Matriz de permisos |
| **Módulos y Sector** | CORE | Ninguna | Todos | `starter` | Presets de industria, switch de módulos |
| **Ajustes (Marca Blanca)** | CORE | Ninguna | Todos | `starter` | Temas, fuentes, logos, widgets |
| **Integraciones** | Módulo | Ninguna | `reservas` | `starter` | Calendarios, WhatsApp, Webhooks |
| **Desarrolladores** | Módulo | Ninguna | Todos | `pro` | API Keys, OpenAPI, Auditoría |

---

## 3. Grafo de Cascada de Activación y Desactivación

### Regla de Activación (Hacia Atrás):
Al activar un módulo, Sagitta activa automáticamente sus **requisitos técnicos**:
* Si se activa `recepcion` → se activa `reservas` → se activan `servicios` y `profesionales`.
* Si se activa `compras` → se activa `inventario`.
* Si se activa `crm` → se activa `clientes`.

### Regla de Desactivación (Hacia Adelante):
Al desactivar un módulo, Sagitta desactiva automáticamente sus **módulos dependientes**:
* Si se desactiva `reservas` → se desactiva `recepcion`.
* Si se desactiva `inventario` → se desactiva `compras`.
* Si se desactiva `servicios` → se desactiva `reservas` y `recepcion`.

---

## 4. Matriz de Complementos Granulares (Addons)

Los complementos permiten activar variaciones de negocio sin duplicar módulos:

1. **`recepcion.walk_in`:** Activa la atención presencial sin cita y tablero de turnos.
2. **`recepcion.lista_espera`:** Activa la fila virtual para clientes esperando cancelaciones.
3. **`servicios.paquetes`:** Activa la venta y saldo de paquetes multisesión.
4. **`servicios.membresias`:** Activa el catálogo de suscripciones recurrentes y beneficios.
5. **`servicios.recetas`:** Vincula productos del inventario como consumo directo del servicio.
6. **`recursos.bloqueos`:** Permite registrar bloqueos por desinfección, mantenimiento o cierre temporal.
7. **`pos.promociones`:** Aplica descuentos automáticos parametrizados por reglas de negocio.
8. **`pos.gift_cards`:** Habilita el medio de pago con tarjeta prepago o bono de regalo.
9. **`reservas.reprogramacion`:** Despliega el asistente de cambio de fecha en la agenda.
