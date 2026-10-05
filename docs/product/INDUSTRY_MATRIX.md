# Sagitta — Matriz de Adaptabilidad por Industria

> "Sagitta se adapta al negocio, no el negocio a Sagitta."

Esta matriz detalla cómo se parametriza, configura y comporta Sagitta ante 12 verticales de mercado, demostrando la capacidad del producto para ajustarse a cientos de modelos de negocio sin alterar su código fuente.

---

## 1. Belleza y Cuidado Personal
* **Negocios típicos:** Barberías, peluquerías, salones de manicura, centros de estética, spas.
* **Módulos activos por defecto:** Reservas, Recepción, Servicios, Profesionales, Recursos, Clientes, POS, Finanzas, Inventario, Automatizaciones, Reportes.
* **Terminología adaptada:**
  * Profesional → *Especialista / Estilista / Barbero*
  * Servicio → *Tratamiento / Servicio*
  * Recurso → *Cabina / Sillón / Mesa de manicura*
* **Flujos clave:**
  * Recepción: Cola de turnos walk-in para barberías sin cita previa y lista de espera para estilistas solicitados.
  * Servicios: Servicios con extras comerciales (ej. mascarilla, ampolleta) y bonos/paquetes de 5 sesiones.
  * POS: Venta cruzada de productos de cuidado capilar/facial al pagar el servicio; cálculo automático de comisiones para el estilista.
  * Automatizaciones: Recordatorio 24h antes por WhatsApp; mensaje de reactivación tras 30 días sin visita.

---

## 2. Salud y Bienestar Clínico
* **Negocios típicos:** Consultorios médicos, odontología, fisioterapia, psicología, nutrición, quiropráctica.
* **Módulos activos:** Reservas, Recepción, Servicios, Profesionales, Recursos, Clientes, Finanzas, Inventario, Automatizaciones, Reportes.
* **Terminología adaptada:**
  * Cita → *Consulta*
  * Cliente → *Paciente*
  * Profesional → *Especialista / Médico*
  * Servicio → *Procedimiento / Consulta*
  * Recurso → *Consultorio / Cubículo*
* **Flujos clave:**
  * Clientes: Expediente clínico confidencial con notas médicas fechadas, consentimientos informados firmados digitalmente y carga de estudios radiológicos/analíticas.
  * Reservas: Citas recurrentes para terapias o tratamientos de ortodoncia; modalidad virtual con enlace directo a teleconsulta.
  * Inventario: Control de insumos clínicos y materiales descartables vinculados a la receta del procedimiento (BOM).

---

## 3. Fitness, Deportes y Estudios
* **Negocios típicos:** Gimnasios, estudios de yoga, pilates, boxeo, crossfit, entrenadores personales.
* **Módulos activos:** Reservas, Recepción, Servicios, Profesionales, Recursos, Clientes, POS, Finanzas, Inventario, Automatizaciones, Reportes.
* **Terminología adaptada:**
  * Cita → *Clase / Sesión*
  * Cliente → *Miembro / Atleta*
  * Profesional → *Entrenador / Coach*
  * Servicio → *Disciplina / Programa*
  * Recurso → *Sala / Cancha / Ring*
* **Flujos clave:**
  * Membresías: Planes mensuales, trimestrales y anuales con control de acceso y saldo de clases incluidas.
  * Reservas: Reservas de cupos por clase con aforo máximo y lista de espera automática.
  * POS: Venta de suplementos, bebidas y accesorios deportivos en mostrador.

---

## 4. Automotriz y Talleres
* **Negocios típicos:** Talleres mecánicos, detailing, lavado automotriz, cambio de aceite y mantenimiento preventivo.
* **Módulos activos:** Reservas, Recepción, Servicios, Profesionales, Recursos, Clientes, POS, Finanzas, Inventario, Reportes.
* **Terminología adaptada:**
  * Cita → *Orden de Servicio*
  * Cliente → *Cliente / Propietario*
  * Profesional → *Mecánico / Técnico*
  * Servicio → *Servicio Mecánico / Mantenimiento*
  * Recurso → *Bahía / Elevador / Fosa*
* **Flujos clave:**
  * Clientes: Expediente del vehículo (placa, marca, modelo, VIN, kilometraje) dentro de los campos personalizados del cliente.
  * Servicios: Órdenes que consumen refacciones y lubricantes del inventario al completarse.
  * Finanzas: Presupuestos y cotizaciones previas antes de iniciar la reparación.

---

## 5. Educación, Cursos y Academias
* **Negocios típicos:** Academias de idiomas, clases de música, escuelas de arte, tutorías universitarias, talleres de cocina.
* **Módulos activos:** Reservas, Servicios, Profesionales, Recursos, Clientes, POS, Finanzas, Automatizaciones, Reportes.
* **Terminología adaptada:**
  * Cita → *Clase / Tutoría*
  * Cliente → *Alumno / Estudiante*
  * Profesional → *Profesor / Instructor*
  * Servicio → *Curso / Taller*
  * Recurso → *Aula / Laboratorio / Cabina de ensayo*
* **Flujos clave:**
  * Reservas: Sesiones de tutoría individual o clases grupales con cupo limitado.
  * Servicios: Paquetes de 10 o 20 clases con control de asistencia y saldo.
  * Automatizaciones: Notificaciones de tareas y recordatorios de clase.

---

## 6. Servicios Profesionales
* **Negocios típicos:** Despachos de abogados, contadores, consultorías de negocios, arquitectos, peritos.
* **Módulos activos:** Reservas, Servicios, Profesionales, Recursos, Clientes, Finanzas, Automatizaciones, Reportes.
* **Terminología adaptada:**
  * Cita → *Reunión / Asesoría*
  * Cliente → *Cliente / Cuenta*
  * Profesional → *Consultor / Abogado*
  * Servicio → *Asesoría / Proyecto*
  * Recurso → *Sala de Juntas*
* **Flujos clave:**
  * Reservas: Enlace de videollamada para reuniones de trabajo virtuales; buffer de 15 minutos de preparación entre reuniones.
  * Clientes: Expediente del caso con notas legales y archivo de contratos en PDF.
  * Finanzas: Cotizaciones formales y facturas emitidas por honorarios.

---

## 7. Estudios Creativos y Audiovisuales
* **Negocios típicos:** Estudios fotográficos, productoras de video, estudios de grabación musical, agencias creativas.
* **Módulos activos:** Reservas, Servicios, Profesionales, Recursos, Clientes, POS, Finanzas, Inventario, Reportes.
* **Terminología adaptada:**
  * Cita → *Sesión / Rodaje*
  * Cliente → *Cliente / Productor*
  * Profesional → *Fotógrafo / Productor*
  * Servicio → *Paquete de Sesión*
  * Recurso → *Set / Estudio / Equipo de iluminación*
* **Flujos clave:**
  * Recursos: Reserva simultánea obligatoria del fotógrafo y del set/cámara requeridos.
  * Reservas: Cobro de anticipo o depósito previo para apartar la fecha.
  * Finanzas: Facturación detallada con desglose de horas extra de edición y entregables.

---

## 8. Gastronomía y Hostelería
* **Negocios típicos:** Restaurantes, cafeterías de especialidad, salones de té, bares, espacios gastronómicos.
* **Módulos activos:** Reservas, Recepción, Servicios, Recursos, Clientes, POS, Finanzas, Inventario, Reportes.
* **Terminología adaptada:**
  * Cita → *Reserva de Mesa*
  * Cliente → *Comensal*
  * Profesional → *Personal de Sala / Mesero*
  * Servicio → *Experiencia / Menú degustación*
  * Recurso → *Mesa / Terraza / Zona VIP*
* **Flujos clave:**
  * Recepción: Lista de espera en la puerta con aviso al comensal cuando la mesa está lista.
  * Recursos: Gestión de mesas con capacidad de personas por mesa y bloqueos por servicio de almuerzo/cena.
  * POS: Cierre de cuenta ágil con propinas y pagos divididos entre comensales.

---

## 9. Servicios Técnicos y a Domicilio
* **Negocios típicos:** Plomería, electricidad, cerrajería, climatización, limpieza a domicilio, mantenimiento.
* **Módulos activos:** Reservas, Servicios, Profesionales, Clientes, POS, Finanzas, Inventario, Automatizaciones, Reportes.
* **Terminología adaptada:**
  * Cita → *Visita Técnica*
  * Cliente → *Cliente / Propietario*
  * Profesional → *Técnico Especialista*
  * Servicio → *Servicio / Reparación*
  * Recurso → *Vehículo / Equipo especializado*
* **Flujos clave:**
  * Expediente: Registro de dirección exacta, indicaciones de acceso y notas del problema técnico.
  * Finanzas: Cotización en el domicilio y cobro en el POS móvil.
  * Inventario: Repuestos y piezas cargadas en la camioneta técnica.

---

## 10. Mascotas y Veterinaria
* **Negocios típicos:** Clínicas veterinarias, peluquería canina (grooming), guarderías de mascotas, adiestramiento.
* **Módulos activos:** Reservas, Recepción, Servicios, Profesionales, Recursos, Clientes, POS, Finanzas, Inventario, Automatizaciones, Reportes.
* **Terminología adaptada:**
  * Cita → *Consulta / Cita de Baño*
  * Cliente → *Tutor / Dueño*
  * Profesional → *Veterinario / Groomer*
  * Servicio → *Atención / Baño y Corte*
  * Recurso → *Consultorio / Tina / Corral*
* **Flujos clave:**
  * Clientes: Datos del tutor vinculados a la ficha de la mascota (nombre, raza, peso, historial de vacunas).
  * Recepción: Cola de turnos para baño y estética de mascotas.
  * Automatizaciones: Recordatorio de próxima vacuna o desparasitación periódica.

---

## 11. Alquiler de Espacios e Instalaciones
* **Negocios típicos:** Coworkings, salones de eventos, canchas sintéticas de fútbol/pádel, estudios de ensayo.
* **Módulos activos:** Reservas, Servicios, Recursos, Clientes, POS, Finanzas, Reportes.
* **Terminología adaptada:**
  * Cita → *Reserva de Espacio*
  * Cliente → *Arrendatario / Huésped*
  * Profesional → *Responsable / Anfitrión*
  * Servicio → *Tarifa por Hora / Plan de Uso*
  * Recurso → *Cancha / Salón / Cabina*
* **Flujos clave:**
  * Recursos: Vista de disponibilidad por hora y cancha; bloqueo automático de horarios nocturnos o mantenimiento.
  * Membresías: Planes mensuales de coworking con créditos de horas de sala de juntas.
  * Finanzas: Cobro anticipado de la reserva con política de cancelación estricta.

---

## 12. Empresarial General
* **Negocios típicos:** Modelo general multipropósito para empresas de servicios y comercio no especializadas.
* **Módulos activos:** Reservas, Servicios, Profesionales, Clientes, POS, Finanzas, Reportes.
* **Terminología estándar:** Citas, Clientes, Profesionales, Servicios, Recursos.
