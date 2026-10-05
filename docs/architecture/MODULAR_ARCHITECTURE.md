# Sagitta — Arquitectura de Plataforma Modular

Este documento técnico describe los fundamentos y patrones arquitectónicos aplicados en la evolución de Sagitta hacia una plataforma empresarial adaptable a múltiples industrias.

---

## 1. Principios Rectores

1. **Sagitta se adapta al negocio, no el negocio a Sagitta:**  
   La terminología, los módulos activos y los complementos operativos se ajustan según la industria y el perfil de la organización sin bifurcar la base de código.
2. **No destruir el núcleo existente:**  
   Todo cambio expande sobre las capas existentes (`repositories`, `services`, `context`, `mocks`) preservando los contratos y la compilación limpia.
3. **Diseño empresarial, sobrio y humano (Cero "AI SaaS look"):**  
   Tipografía estructurada (`DM Sans`, `DM Serif Display`), paletas con tokens semánticos CSS (`tokens.css`), sombras suaves y contrastes verificados según WCAG AA. Cero gradientes estridentes o tarjetas infladas.

---

## 2. Diagrama de Capas de Modularidad

```
┌─────────────────────────────────────────────────────────────┐
│                 INTERRUPTORES GLOBALES                      │
│         src/config/features.ts (PlatformFlag)               │
└──────────────────────────────┬──────────────────────────────┘
                               │
┌──────────────────────────────▼──────────────────────────────┐
│                    CATÁLOGO DE MÓDULOS                      │
│            src/config/modules.ts (MODULES)                  │
└──────────────────────────────┬──────────────────────────────┘
                               │
┌──────────────────────────────▼──────────────────────────────┐
│                   PRESETS POR INDUSTRIA                     │
│         src/config/industries.ts (INDUSTRY_PRESETS)         │
└──────────────────────────────┬──────────────────────────────┘
                               │
┌──────────────────────────────▼──────────────────────────────┐
│             PERFIL DE NEGOCIO POR SUCURSAL                  │
│       src/context/ModulesContext.tsx (BusinessProfile)      │
└──────────────────────────────┬──────────────────────────────┘
                               │
┌──────────────────────────────▼──────────────────────────────┐
│                   CAPA DE NAVEGACIÓN Y UI                   │
│   Sidebar.tsx / Router / Botones condicionales (isAddon)    │
└─────────────────────────────────────────────────────────────┘
```

---

## 3. Resolución en Cascada de Módulos

Para determinar si una funcionalidad debe renderizarse en pantalla:

```typescript
function isModuleEnabled(id: ModuleId): boolean {
  1. Verificar si el platformFlag global de build está encendido.
  2. Verificar si el plan del tenant activo cumple con el minPlan del módulo.
  3. Si el módulo es CORE -> TRUE (siempre disponible).
  4. Si el módulo está en la lista profile.modulos -> TRUE.
  5. En cualquier otro caso -> FALSE.
}
```

Para determinar si un complemento (Add-on) opera:

```typescript
function isAddonEnabled(key: string): boolean {
  1. Extraer el moduleId padre (ej. 'recepcion' de 'recepcion.walk_in').
  2. Si isModuleEnabled(moduleId) es false -> FALSE.
  3. Si key está en profile.complementos -> TRUE.
}
```

---

## 4. Persistencia y Modo Dual de Datos

Sagitta opera bajo un diseño desacoplado de dos niveles:

1. **Modo Demo / Local (`VITE_USE_MOCKS=true`, `VITE_DATA_MODE=local`):**
   * Utiliza `LocalStorageAdapter` con aislamiento multi-sucursal mediante prefijos `sagitta_<tenantId>_<coleccion>`.
   * Interceptores MSW responden con códigos HTTP 200/201/400 reales para simular llamadas de red.
2. **Modo Producción (`VITE_USE_MOCKS=false`, `VITE_DATA_MODE=api`):**
   * `apiClient` (`src/services/api.client.ts`) transmite llamadas REST con token JWT al backend real (PHP/MySQL).

---

## 5. Terminología Adaptable por Dominio

Mediante `useModules().tTerm(key, fallback)` las páginas reemplazan textos fijos por términos adaptados al sector:

```tsx
const { tTerm } = useModules()
const clientesTerm = tTerm('clientes', 'Clientes') 
// Retorna: "Pacientes" en Salud, "Alumnos" en Educación, "Comensales" en Gastronomía.
```

---

## 6. Seguridad y Aislamiento

* **Control en Frontend:**  
  La directiva `<Can permission="..." />` y el guard `PrivateRoute` controlan la visualización de elementos en la UI.
* **Responsabilidad del Backend:**  
  Toda mutación de datos debe validar el token de autorización, verificar los claims del tenant y chequear permisos server-side antes de escribir en la base de datos MySQL.
* **Manejo de Secretos:**  
  En modo demo los tokens se almacenan en `localStorage` únicamente para permitir pruebas en vivo en el navegador. En despliegues de producción comercial, el backend debe emitir cookies `httpOnly` con flags `Secure` y `SameSite=Strict`.

---

## 7. Instrucciones para Nuevos Desarrolladores

Para añadir un nuevo módulo al sistema:
1. Declarar su identificador en `ModuleId` dentro de `src/types.ts`.
2. Registrar su definición en `src/config/modules.ts` especificando categoría, plan mínimo, dependencias técnicas y capacidades.
3. Asignar el icono correspondiente en `MODULE_ICONS`.
4. Si introduce términos específicos, añadir el mapeo en `src/config/industries.ts`.
5. Crear la página en `src/pages/` y registrar la ruta protegida en `src/App.tsx`.
6. Actualizar `docs/product/MODULE_MAP.md` y `docs/product/CAPABILITY_CATALOG.md`.
