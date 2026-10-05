# LYBERATE BUSINESS PLATFORM — GUÍA DE INTEGRACIÓN CON LA API BACKEND

## 1. Introducción

Esta guía detalla los pasos para conectar el frontend de **Lyberate Business Platform** con el backend real en PHP / MySQL una vez que los endpoints estén implementados.

---

## 2. Paso a Paso para la Conmutación

### Paso 1: Configurar Variables de Entorno
Crea o edita tu archivo `.env.production` (o `.env.local`):
```env
# URL base de tu API REST PHP
VITE_API_BASE_URL=https://api.tudominio.com/api

# Desactivar interceptor de MSW
VITE_USE_MOCKS=false

# Activar modo de datos API
VITE_DATA_MODE=api
```

### Paso 2: Recompilar la Aplicación
```bash
npm run build
```
Al cambiar `VITE_DATA_MODE=api`, el contenedor de repositorios (`src/repositories/index.ts`) inyectará automáticamente las instancias de `ApiAppointmentRepository`, `ApiClientRepository`, `ApiSalesRepository`, etc., en lugar de los repositorios locales.

---

## 3. Autenticación y Cabeceras HTTP

El cliente HTTP central (`src/services/api.client.ts`) gestiona automáticamente el token de acceso:

1. **Cabeceras obligatorias enviadas por el frontend:**
   ```http
   Content-Type: application/json
   Accept: application/json
   Authorization: Bearer <access_token>
   ```

2. **Gestión de Sesión Expirada (401 Unauthorized):**
   Si la API responde con código HTTP `401`, el cliente frontend:
   - Limpia `sagitta_token` y `sagitta_refresh_token` de `localStorage`.
   - Redirige inmediatamente al usuario a la pantalla `/login`.

---

## 4. Estructura de Respuestas Requerida

El frontend espera un envoltorio estándar en todas las respuestas JSON:

### Respuesta Exitosa:
```json
{
  "success": true,
  "message": "Operación completada con éxito",
  "data": { ... }
}
```

### Respuesta con Error de Validación (422 o 400):
```json
{
  "success": false,
  "message": "Los datos suministrados no son válidos",
  "errors": {
    "campo_especifico": ["Mensaje de error para el usuario."]
  }
}
```

---

## 5. Configuración de CORS en el Servidor PHP

El backend debe autorizar las peticiones de origen cruzado para permitir el consumo desde el dominio del frontend (por ejemplo, en Cloudflare Pages):

```php
header("Access-Control-Allow-Origin: https://app.tudominio.com");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, Accept");
header("Access-Control-Allow-Credentials: true");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}
```

---

## 6. Herramientas de Prueba Embebidas

El panel administrativo incluye en `/crm` (Pestaña "Documentación API") una consola interactiva OpenAPI / Swagger conectada con la especificación OpenAPI v3.0 descargable para probar cabeceras, rutas y payloads directamente antes de desplegar a producción.
