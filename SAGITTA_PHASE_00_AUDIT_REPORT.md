# SAGITTA — PHASE 00: PRODUCT / UX / UI AUDIT REPORT
**Document ID:** `SAGITTA-AUDIT-P00-2026`  
**Version:** 1.0  
**Date:** October 2026  
**Auditor:** Senior Product Designer + Frontend Architect + UX Engineer  
**Target:** Master UX/UI Redesign — Phase 01 Pre-requisite  

---

## EXECUTIVE SUMMARY

Sagitta is an operational business platform built on React 19, TypeScript (strict), Vite 6, and Tailwind CSS 3.4. It currently features an advanced domain model covering appointment scheduling, customer relationship management (CRM 360°), point of sale (POS) with cash register accounting, hardware peripheral integration (ESC/POS thermal printing & barcode scanning), inventory management (Kardex & BOM recipes), multi-branch (multi-tenant) isolation, and dynamic white-label brand theming.

The system is fundamentally **stable, fully compilable (`tsc -b && vite build` succeeds with 0 errors), and backed by passing unit tests (`vitest` 11/11 tests pass)**.

However, rapid horizontal feature expansion has created several core UX/UI challenges:
1. **Token Inconsistency:** A robust semantic token architecture exists (`src/styles/tokens.css`), yet multiple primitive components (`Card`, `Table`, `Tabs`) bypass these tokens in favor of hardcoded Tailwind palette classes (`slate-900`, `slate-200`, `indigo-600`).
2. **Visual Monotony & Card Sprawl:** Many views rely on repetitive, flat cards that dilute information hierarchy and feel like generic SaaS templates rather than handcrafted, calm software.
3. **Responsive Density Gaps:** Desktop workflows are well-proportioned, but complex dense views (POS cart, weekly calendar grid, permissions matrix) compress excessively on mobile devices without dedicated adaptive views (e.g., bottom sheets, timeline feeds).
4. **Missing First-Run Experience:** There is no onboarding flow, guided setup wizard, or contextual help system to welcome first-time business owners.

This report establishes the baseline truth of the codebase before any visual redesign begins in Phase 01.

---

## 1. CURRENT ARCHITECTURE SUMMARY

### 1.1 Tech Stack & Runtime Environment
- **Core Framework:** React 19.0.0 (`react`, `react-dom`)
- **Language:** TypeScript 5.6.2 running in strict mode (`noImplicitAny`, strict null checks).
- **Bundler & Tooling:** Vite 6.0.5 with `@vitejs/plugin-react` 4.3.4 and `vite-plugin-pwa` 0.21.1.
- **Routing:** React Router DOM 6.27.0 with lazy loading (`React.lazy` + `Suspense`) and route-level RBAC guards (`PrivateRoute`, `Can`).
- **Styling:** Tailwind CSS 3.4.17 with PostCSS and custom CSS design tokens injected via CSS variables.
- **Iconography:** `lucide-react` 0.460.0 exclusively.
- **Data Emulation & Mocks:** Mock Service Worker (MSW 2.6.8) and client-side repository adapters (`LocalStorageAdapter`).
- **Testing:** Vitest 5.0.3 with Vitest CLI runner.

### 1.2 Data Flow & Decoupled Repository Pattern
The application follows a clean 5-layer decoupled architecture:
```
Presentation Layer (Pages & UI Components)
       ↓
Custom Application Hooks (useAuth, useTenant, useModules, useConfiguracion, useToast)
       ↓
Domain Services (citasService, ventasService, inventarioService, etc.)
       ↓
Repository Interfaces (IAppointmentRepository, ISalesRepository, IInventoryRepository, etc.)
       ↓
Data Adapters (Controlled by VITE_DATA_MODE in .env):
   ├── LocalStorageAdapter (VITE_DATA_MODE=local + MockServiceWorker)
   └── apiClient (VITE_DATA_MODE=api -> REST HTTP with Bearer JWT + X-Tenant-ID)
```

### 1.3 State Management & Context Providers
Global state is organized in hierarchical React Contexts wrapping `AppRoutes` in `src/App.tsx`:
1. `TenantProvider` (`src/context/TenantContext.tsx`): Current branch/franchise, tenant plan (`starter`, `pro`, `enterprise`), persistence in `localStorage`.
2. `ModulesProvider` (`src/context/ModulesContext.tsx`): Active business industry preset (12 verticals), enabled modules, active add-ons, dynamic domain terminology (`tTerm`).
3. `I18nProvider` (`src/context/I18nContext.tsx`): Native lightweight internationalization engine (ES, EN, PT, FR) with zero heavy external runtime dependencies.
4. `ConfiguracionProvider` (`src/context/ConfiguracionContext.tsx`): Live brand customization, white-label toggles, Google Fonts injector, CSS primary color injection.
5. `AppProvider` (`src/context/AppContext.tsx`): Sidebar collapse/open status, theme toggle (dark/light), toast notifications dispatch queue.
6. `AuthProvider` (`src/context/AuthContext.tsx`): Active session, JWT tokens, user role (`supremo`, `admin`, `empleado`, `recepcion`), and reactive RBAC permission checker (`hasPermission`).

---

## 2. EXISTING DESIGN SYSTEM / STYLES

### 2.1 Design Tokens (`src/styles/tokens.css` & `tailwind.config.ts`)
The application defines a comprehensive set of CSS Custom Properties in `src/styles/tokens.css`:
- **Surfaces & Backgrounds:** `--color-bg`, `--color-surface`, `--color-surface-elevated`
- **Text:** `--color-text` (`#0f172a`), `--color-text-muted` (`#64748b`)
- **Borders:** `--color-border` (`#e2e8f0`), `--color-border-subtle` (`#f1f5f9`)
- **Brand & Primaries:** `--color-brand-primary` (dynamically overridden by white-label), `--color-primary-hover`, `--color-primary-soft`
- **Semantic Feedback:** `--color-success`, `--color-warning`, `--color-danger`, `--color-info` (each with `-hover` and `-soft` variants)
- **Geometry (Radii):** `--radius-sm` (6px), `--radius-md` (10px), `--radius-lg` (16px), `--radius-xl` (20px), `--radius-full` (9999px)
- **Elevation (Shadows):** `--shadow-sm`, `--shadow-md`, `--shadow-lg`, `--shadow-soft`, `--shadow-card`
- **Density System:** Configured via `[data-density='compact' | 'comfortable' | 'spacious']` altering input, button, table padding multipliers.

### 2.2 Dynamic Theming Engine (`src/utils/themeEngine.ts`)
The platform supports in-flight design engine updates without page reloads:
- Injects Google Font stylesheets (`DM Sans`, `Inter`, `Roboto`, `Poppins`, `Montserrat`, `Outfit`, `Playfair Display`, `DM Serif Display`).
- Applies CSS variables to document root (`:root`).
- Validates and imports/exports complete themes via JSON schema (`src/utils/themeValidator.ts`).

---

## 3. EXISTING REUSABLE COMPONENTS

All primitive components are exported from `src/components/ui/index.ts`:

| Component | File | Current Status | Key Props / Capabilities |
|---|---|---|---|
| `Avatar` | `src/components/ui/Avatar.tsx` | **GOOD** | Sizes (`xs` to `xl`), fallback initials, status indicator dot (`online`, `offline`, `busy`). |
| `Badge` | `src/components/ui/Badge.tsx` | **GOOD** | Variants (`default`, `primary`, `success`, `warning`, `danger`, `info`), sizes (`sm`, `md`), dot indicator. |
| `Button` | `src/components/ui/Button.tsx` | **NEEDS REFINEMENT** | Variants (`primary`, `secondary`, `ghost`, `danger`, `warning`, `outline`, `success`, `accent`), loading spinner, icons. Uses tokens for colors but fixed Tailwind radii. |
| `Card` | `src/components/ui/Card.tsx` | **INCONSISTENT** | Header, title, description, action slot, footer. Hardcodes `bg-white dark:bg-slate-900 border-slate-200` instead of tokens. |
| `Checkbox` | `src/components/ui/Checkbox.tsx` | **GOOD** | Accessible checkbox with label and description helper text. |
| `ConfirmDialog` | `src/components/ui/ConfirmDialog.tsx` | **GOOD** | Modal confirmation dialog with danger/warning destructive styles. |
| `Dropdown` | `src/components/ui/Dropdown.tsx` | **NEEDS REFINEMENT** | Simple popover dropdown; needs keyboard arrow navigation and focus trapping. |
| `EmptyState` | `src/components/ui/EmptyState.tsx` | **NEEDS REFINEMENT** | Icon, title, description, action button. Lacks contextual illustration options. |
| `ErrorState` | `src/components/ui/ErrorState.tsx` | **GOOD** | Error alert presentation with retry button action. |
| `Input` | `src/components/ui/Input.tsx` | **NEEDS REFINEMENT** | Left/right icon adornments, helper text, error state. Form styling needs token alignment. |
| `Loader` | `src/components/ui/Loader.tsx` | **GOOD** | Spinner with text label, fullscreen overlay option. |
| `Modal` | `src/components/ui/Modal.tsx` | **GOOD** | Escape listener, body scroll locking, backdrop blur, safe-area inset padding, 8 size variants. |
| `Pagination` | `src/components/ui/Pagination.tsx` | **GOOD** | Current page, total pages, responsive next/prev buttons. |
| `Radio` | `src/components/ui/Radio.tsx` | **GOOD** | Radio item with label and description. |
| `Select` | `src/components/ui/Select.tsx` | **NEEDS REFINEMENT** | Native HTML select styled with Tailwind. Needs custom rich select support. |
| `Skeleton` | `src/components/ui/Skeleton.tsx` | **GOOD** | Pulsing placeholder for cards, tables, text lines. |
| `Stepper` | `src/components/ui/Stepper.tsx` | **GOOD** | Horizontal step indicator with completed/current/pending status. |
| `Switch` | `src/components/ui/Switch.tsx` | **GOOD** | Animated toggle switch with accessibility attributes. |
| `Table` | `src/components/ui/Table.tsx` | **INCONSISTENT** | `TableHeader`, `TableBody`, `TableRow`, `TableHead`, `TableCell`. Hardcodes `slate-50`, `slate-200`, `slate-800` colors and padding. |
| `Tabs` | `src/components/ui/Tabs.tsx` | **INCONSISTENT** | Compound component (`Tabs`, `TabsList`, `TabsTrigger`). Hardcodes `slate-100`, `slate-800`. |
| `Textarea` | `src/components/ui/Textarea.tsx` | **NEEDS REFINEMENT** | Multi-line text field, needs auto-grow option. |
| `Toast` | `src/components/ui/Toast.tsx` | **GOOD** | Auto-dismissing toast notifications (`success`, `error`, `warning`, `info`) with queue. |
| `Tooltip` | `src/components/ui/Tooltip.tsx` | **NEEDS REFINEMENT** | Hover-based CSS tooltip; lacks mobile touch fallback. |

---

## 4. CURRENT RESPONSIVE STRATEGY

### 4.1 Shell & Navigation Breakdown
- **Sidebar (`src/components/layout/Sidebar.tsx`):**
  - **Desktop (`≥ 768px`):** Sticky navigation on the left (`sticky top-16 h-[calc(100vh-4rem)]`). Collapses between 240px (`w-60`) and 72px (`w-[4.5rem]`).
  - **Mobile (`< 768px`):** Fixed off-canvas drawer (`fixed top-16 left-0 z-20 h-[calc(100vh-4rem)]`). Toggles via backdrop and burger icon. Auto-closes upon clicking any navigation link.
  - **Branch Switcher:** Desktop renders `TenantSelector` in the Navbar; mobile automatically moves it into the top section of the Sidebar drawer.
- **Navbar (`src/components/layout/Navbar.tsx`):**
  - Compact sticky top bar (`sticky top-0 z-30 h-16`).
  - Search trigger: Full interactive omnibar search trigger with keyboard shortcut hint (`Ctrl+K`) on desktop (`sm:block`); collapses into a compact magnifying glass icon button on mobile.
- **Modal Viewports (`src/components/ui/Modal.tsx`):**
  - Uses `calc(100dvh - 1.5rem)` with dynamic viewport units (`dvh`) and incorporates hardware safe-area insets (`env(safe-area-inset-bottom)`).

### 4.2 Responsive Friction Points
- **Calendar (`CitasPage`):** Month and Week views use 7-column CSS grids that overflow horizontally on mobile screens, requiring manual horizontal swiping. A vertical daily schedule feed is needed on small viewports.
- **POS Checkout (`VentasPage`):** Splitting the screen between the catalog grid and the shopping cart works seamlessly on desktop (`grid-cols-12`), but on mobile the cart drops beneath the catalog, hiding subtotal updates from the cashier unless they scroll.
- **Data Tables (`Table.tsx`):** Uses default horizontal scrolling (`overflow-x-auto`). On mobile viewports under 640px, tables become wide and difficult to scan without responsive card view transformation.

---

## 5. CURRENT ACCESSIBILITY (A11Y) STATUS

Evaluated in accordance with WCAG 2.1 AA and `a11y-debugging` guidelines:

### 5.1 Strengths
- **Modal Dialog Semantics:** `Modal.tsx` implements `role="dialog"`, `aria-modal="true"`, dynamic escape key dismissal, and backdrop click suppression.
- **Interactive Icon Labeling:** Navbar and action buttons supply explicit `aria-label` attributes (e.g., `aria-label="Alternar menú lateral"`, `aria-label="Cambiar tema"`, `aria-label="Cerrar sesión"`).
- **Tab Panel Semantics:** `Tabs.tsx` provides `role="tab"`, `aria-selected={isSelected}`, and disabled state attributes.
- **Safe Area & Contrast Defaults:** Light theme text defaults to `#0f172a` (high contrast on `#ffffff` surfaces).

### 5.2 Areas Requiring Refinement
- **Color Contrast in Secondary Text:** Some secondary labels use `text-slate-400` or `text-text-muted` over light borders, which can dip to 3.8:1 contrast (below the 4.5:1 WCAG AA threshold for body text).
- **Focus Indicators:** Focus rings are scattered across multiple utilities (`focus:ring-primary`, `focus:ring-2`, `focus:outline-none`). A unified, high-contrast, accessible `focus-visible` ring system is required.
- **Reduced Motion Support:** CSS keyframe animations (`fadeIn`, `slideUp`, `slideDown`) do not currently include `@media (prefers-reduced-motion: reduce)` fallbacks.
- **Table Semantics:** Complex data tables in `ReportesPage`, `PagosPage`, and `InventarioPage` lack explicit `<th scope="col">` and `<th scope="row">` associations.

---

## 6. CURRENT INTERACTION PATTERNS

1. **Universal Omnibar (`CommandMenu.tsx` / `Ctrl+K`):**
   - Modal-driven global search across 5 categories: Módulos, Acciones Rápidas, Clientes, Productos (#PRD), Citas.
   - Smooth keyboard navigation (ArrowUp, ArrowDown, Enter, Escape).
2. **Multi-Step Wizards (`NuevaCitaPage.tsx`, `PortalWizardReserva.tsx`):**
   - 4-step progressive disclosure: `Servicio` → `Profesional` → `Fecha y Hora` → `Confirmación`.
   - Dynamic real-time slot generation based on service duration, buffer time, and staff working hours.
3. **POS Checkout Flow (`VentasPage.tsx`):**
   - Interactive cart with quantity steppers, item discounts, split payment selection (Cash, Card, Transfer), and immediate thermal ticket rendering.
4. **Toast Feedback Pipeline (`useToast`):**
   - Floating, non-blocking notification toasts with icons, auto-dismiss timers (3-5s), and manual close triggers.
5. **Contextual Flyout Drawers & Modals:**
   - Client 360° dossiers (`ModalExpedienteCliente`), appointment reschedule modal (`ModalReprogramarCita`), refund processing modal.

---

## 7. CURRENT VISUAL INCONSISTENCIES

1. **Token Adoption vs Tailwind Slate Classes:**
   - Several newer pages and components (`Card.tsx`, `Table.tsx`, `Tabs.tsx`, `ReportesPage.tsx`) use `bg-slate-50`, `bg-slate-900`, `border-slate-200`, `text-slate-700` instead of `bg-surface`, `border-border`, `text-text`, and `text-text-muted`.
   - When a tenant customizes their brand color or switches themes, components with hardcoded slate values do not fully adapt.
2. **Inconsistent Border Radii:**
   - Mixed usage of `rounded-md`, `rounded-lg`, `rounded-xl`, and `rounded-2xl` throughout views, rather than leveraging geometry tokens (`--radius-sm`, `--radius-md`, `--radius-lg`).
3. **Typography Divergence:**
   - Headings alternate between serif display styling (`font-heading` / `font-display`) and sans-serif bold (`font-bold text-slate-900`). The serif display style looks luxurious on landing headers but feels out of place on compact operational forms.
4. **Card Stacking / Visual Weight:**
   - Dashboards and reporting tabs feature multiple nested boxes with borders and shadows, creating visual noise instead of a calm, curated surface hierarchy.

---

## 8. CURRENT UX FRICTION

1. **Omnibar Data Fetching on Open:**
   - `CommandMenu.tsx` initiates simultaneous `Promise.all` queries for all clients, all products, and all appointments every time `Ctrl+K` is triggered. While fast in local development, this will degrade in production without caching or client-side indexing.
2. **Wizard Back Navigation:**
   - In `NuevaCitaPage` and `PortalReservaPage`, pressing the browser's native Back button leaves the page rather than navigating to the previous wizard step.
3. **POS Cash Register Gating:**
   - If a cashier attempts to process a sale while the cash drawer session (`SesionCaja`) is closed, the system prompts them to open caja, but does not inline the opening modal directly into the checkout drawer.
4. **Calendar View Density on Laptops:**
   - The weekly calendar column grid (`CalendarioSemanal`) fits 7 full days with hourly slots from 08:00 to 20:00. On 13-inch laptop displays, appointment tiles compress into small slivers, making client names difficult to read.

---

## 9. EXISTING FEATURES THAT MUST NOT BE BROKEN

The following mission-critical business features are fully working and must be preserved across all subsequent redesign phases:

1. **Booking & Conflict Engine (`src/utils/bookingEngine.ts`):**
   - Exact mathematical slot calculation, buffer times, vacation/day-off exception detection, collision detection for staff and physical resources.
2. **Commercial Calculation Engine (`src/services/commerceEngine.service.ts`):**
   - Subtotal, global discounts, line-item discounts, multi-rate tax calculations, split payment validation, and rounding accuracy.
3. **ESC/POS Thermal Printing & Binary Driver (`src/utils/escpos.ts`):**
   - Web Bluetooth device pairing, raw ESC/POS command generation for 58mm and 80mm paper rolls, cash drawer kick pulse (`ESC p 0 25 250`).
4. **RBAC & Permission Matrix (`src/services/roles.service.ts`, `AuthContext.tsx`):**
   - Fine-grained permission checks across 10 functional modules (`appointments`, `clients`, `services`, `employees`, `sales`, `inventory`, `reports`, `settings`, `users`, `roles`).
   - Protection for system roles (`es_sistema = true`) preventing accidental deletion.
5. **Multi-Tenant & Industry Adaptability (`TenantContext.tsx`, `ModulesContext.tsx`):**
   - Dynamic industry terminology adaptation (`tTerm`), tenant branch switching, module/add-on feature gating.
6. **White-Label & Brand Theming (`ConfiguracionContext.tsx`, `themeEngine.ts`):**
   - Dynamic in-memory CSS variable injection, custom logos, dynamic favicons, Google Fonts injection, white-label suppression of master brand labels.
7. **Offline PWA & Local Storage Adapter (`LocalStorageAdapter.ts`):**
   - Full prototype execution without network connectivity when running in `VITE_DATA_MODE=local`.

---

## 10. BACKEND / FRONTEND BOUNDARIES

Sagitta supports two distinct operational modes:
- **`VITE_DATA_MODE=local`:** Uses `LocalStorageAdapter` and MSW handlers. Data mutations persist locally in the browser's `localStorage`.
- **`VITE_DATA_MODE=api`:** Uses `apiClient` (`src/services/api.client.ts`) issuing real HTTP REST requests to the backend server.

### Backend Dependency Classification:

| Feature / Domain | Frontend Status | Backend Boundary Status | Notes / Limitations |
|---|---|---|---|
| **Auth & Sessions** | **GOOD** | **BACKEND DEPENDENT** | Frontend manages JWT tokens and user objects; multi-device session revocation requires backend auth server. |
| **Appointments & Booking** | **GOOD** | **BACKEND DEPENDENT** | Booking logic executes locally; real-time double-booking prevention under concurrent users requires ACID DB transactions. |
| **POS & Cash Register** | **GOOD** | **BACKEND DEPENDENT** | Cash sessions and sales persist locally; centralized tax compliance and multi-terminal register syncing require backend persistence. |
| **Thermal Printing (ESC/POS)** | **GOOD** | **GOOD** (Client Native) | Executes purely on client browser via Web Bluetooth API or system print dialog (`window.print`). |
| **Inventory & Kardex** | **GOOD** | **BACKEND DEPENDENT** | Stock deductions and movements calculate client-side; warehouse multi-branch transfers require server database locks. |
| **Payment Gateways** | **MOCK** | **BACKEND DEPENDENT** | Split payments, cash, card, and transfer are simulated with instant confirmation. Real card processing requires Stripe / Mercado Pago webhook backend. |
| **External CRM Connectors** | **MOCK** | **BACKEND DEPENDENT** | HubSpot, Salesforce, and Zoho CRM sync triggers are mocked; live OAuth2 handshake and bi-directional background sync require a backend queue. |
| **WhatsApp Business API** | **MOCK** / **GOOD** (wa.me) | **BACKEND DEPENDENT** | Direct `wa.me` links work out of the box in the browser. Server-side WhatsApp Cloud API webhook automation requires backend webhook listener. |
| **Audit Logs & Security** | **GOOD** | **BACKEND DEPENDENT** | Audit events log to localStorage; tamper-proof security auditing requires append-only database storage on server. |

---

## 11. COMPONENTS SAFE TO EXTEND

These components are presentation-focused, modular, and safe to refine, restyle, or expand in Phase 01 and subsequent phases:

1. **`src/components/ui/*` Primitive Library:**
   - Can be safely refactored to consume unified CSS custom properties (`--color-surface`, `--color-border`, `--radius-md`, etc.).
   - Can be enriched with accessible `focus-visible` styling, reduced-motion-friendly transitions, and responsive density variants.
2. **`src/components/layout/Navbar.tsx` & `Sidebar.tsx`:**
   - Safe to enhance with subtle active indicator pills, polished collapse animations, badge counters, and improved mobile drawer gestures.
3. **`src/components/layout/CommandMenu.tsx`:**
   - Safe to restyle with refined card grouping, recent searches memory, and search input debouncing.
4. **`src/components/portal/*` Public Components:**
   - Safe to upgrade with handcrafted typography hierarchy, calmer card surfaces, and smoother micro-interactions without impacting admin logic.
5. **`src/components/clientes/tabs/*` Dossier Tabs:**
   - Isolated presentation tabs inside `FichaCliente360.tsx` (citas, documentos, consentimientos, notas, perfil) that can be individually refined without breaking client records.

---

## 12. COMPONENTS THAT SHOULD NOT BE REWRITTEN WITHOUT REASON

The following files contain complex business algorithms, data serialization, and state contracts. **Do not rewrite them for purely visual reasons**:

1. **`src/utils/bookingEngine.ts` (DO NOT TOUCH):**
   - 639 lines of date-math, buffer calculation, recurrence rules, and conflict detection. Visual changes must only touch presentation components that consume its output.
2. **`src/services/commerceEngine.service.ts` (DO NOT TOUCH):**
   - Validated commercial tax calculations, discounts, split payment math. Covered by unit tests (`commerceEngine.service.test.ts`).
3. **`src/utils/escpos.ts` (DO NOT TOUCH):**
   - Low-level Uint8Array binary byte streaming for thermal receipt printers.
4. **`src/repositories/local/LocalStorageAdapter.ts` (DO NOT TOUCH):**
   - The foundational data layer providing local offline persistence and demo seeding. Modifying its key structure will wipe demo data.
5. **`src/context/AuthContext.tsx` & `TenantContext.tsx` & `ModulesContext.tsx` (DO NOT TOUCH):**
   - Core state machines handling RBAC permissions, branch switching, and vertical domain adaptability.

---

## 13. MISSING PRODUCT EXPERIENCES

To become a commercially credible, friendly, and complete enterprise product, Sagitta lacks several key experiences:

1. **First-Run Onboarding Flow (`MISSING`):**
   - No interactive setup checklist or wizard to guide new business owners through adding their first branch, staff member, service, and tax details.
2. **Interactive Demo Center (`MISSING`):**
   - While `LoginPage` includes 4 demo login buttons, there is no in-app "Demo Showcase" mode where prospective buyers can test industry presets (e.g., switch between Barbería, Clínica Dental, and Taller Mecánico) with single-click sample data generation.
3. **Contextual Help & Micro-Tutorials (`MISSING`):**
   - Complex workflows (BOM recipe consumption, Kardex adjustments, ESC/POS Bluetooth pairing) lack contextual info banners or dismissible tooltips explaining their purpose.
4. **Daily Dashboard Action Center (`NEEDS REFINEMENT`):**
   - `DashboardPage` shows static KPI numbers and a list of upcoming appointments, but lacks an operational action feed (e.g., "3 citas pendientes de confirmación", "2 productos con stock crítico", "Caja sin abrir").
5. **Mobile-First Agenda Timeline View (`MISSING`):**
   - A streamlined, single-column daily schedule timeline tailored for staff viewing their appointments on a smartphone.

---

## 14. RECOMMENDED IMPLEMENTATION ORDER

Aligned with the Master UX/UI Redesign Package:

```
[Phase 00] Audit & Baseline Verification (COMPLETED HERE)
    ↓
[Phase 01] Design System Foundation (Tokens, semantic variables, dark mode, typography, geometry)
    ↓
[Phase 02] Application Shell & Layout (Navbar, Sidebar, CommandMenu, Drawer, responsive breakpoints)
    ↓
[Phase 03] Interaction System (Toasts, dialogs, drawers, stepper, form controls, animations, reduced-motion)
    ↓
[Phase 04] Dashboard & Action Center (Operational KPIs, quick actions, agenda feed, daily business health)
    ↓
[Phase 05] Calendar & Scheduling (Month, week, day, mobile timeline, conflict alerts, booking wizard)
    ↓
[Phase 06] Control Center (Cash register session, POS terminal, ESC/POS printer, hardware sandbox)
    ↓
[Phase 07] Roles & Security (RBAC permission matrix, user directory, branch management, audit log)
    ↓
[Phase 08] Services & Catalog (Services, packages, memberships, recipes/BOM, buffer settings)
    ↓
[Phase 09] Modules & Industry Adaptation (Vertical presets, dynamic terminology, feature toggle manager)
    ↓
[Phase 10] Demo Center (One-click vertical demo switcher, sample data reset, feature showcase)
    ↓
[Phase 11] Onboarding & Help (First-use guided wizard, contextual hints, empty state illustrations)
    ↓
[Phase 12] Landing & Final QA (Public portal, customer booking flow, responsive verification, a11y audit)
```

---

## 15. RISKS & MITIGATION STRATEGIES

| Risk | Severity | Impact | Mitigation Strategy |
|---|---|---|---|
| **Token migration breaking dark mode** | Medium | Contrast issues or invisible text when replacing hardcoded `slate` classes with CSS tokens. | Audit tokens in both light and dark themes simultaneously in Phase 01. Test contrast ratios using web.dev guidelines. |
| **Breaking repository signatures** | High | TypeScript compilation failures across services and mock handlers. | Treat `I*Repository.ts` interfaces as immutable contracts. Never modify method signatures for styling tasks. |
| **Accidental loss of LocalStorage demo state** | Medium | Developers and users lose sample data when switching modes. | Version `LocalStorageAdapter` cache keys safely; never wipe data without explicit user confirmation. |
| **Over-animating operational workflows** | Medium | Cashiers and receptionists experience lag or interaction fatigue during rapid checkouts. | Restrict animations to 150-200ms transitions explaining state change; strictly respect `prefers-reduced-motion`. |
| **Mobile layout breakages on complex grids** | Medium | Week calendar and POS terminal become unusable on phone screens. | Design deliberate mobile-first alternative views (e.g., vertical list for calendar, bottom sheet drawer for POS cart). |

---

## 16. COMPREHENSIVE OBSERVATION & STATUS MATRIX

All evaluated areas categorized under standard classifications:

| Item / Area | File(s) | Category | Classification | Notes |
|---|---|---|---|---|
| TypeScript Compilation | Project Root | Architecture | **GOOD** | `tsc -b` compiles with 0 errors across all 24 pages. |
| Vite Bundler & PWA | `vite.config.ts` | Architecture | **GOOD** | Vite 6 bundles cleanly; PWA Workbox manifests generated. |
| Unit Test Suite | `src/**/__tests__` | Quality | **GOOD** | 11/11 tests pass in Vitest across repository and service layers. |
| Code Linting | `eslint.config.js` | Quality | **NEEDS REFINEMENT** | 0 errors, 58 warnings (mostly hook dependencies and context exports). |
| CSS Tokens | `src/styles/tokens.css` | Design System | **GOOD** | Rich semantic tokens for colors, surfaces, shadows, radii, and density. |
| UI Primitives (`Button`, `Modal`, `Badge`) | `src/components/ui/` | Design System | **GOOD** | High quality, accessible dialogs, badges, and avatars. |
| UI Primitives (`Card`, `Table`, `Tabs`) | `src/components/ui/` | Design System | **INCONSISTENT** | Hardcode `slate` Tailwind classes; bypass CSS variables. |
| Density Engine | `tokens.css`, `index.css` | Design System | **NEEDS REFINEMENT** | Density tokens exist in CSS, but primitive components rarely bind to them. |
| Navigation Shell | `Sidebar.tsx`, `Navbar.tsx` | Navigation | **GOOD** | Responsive, collapsible, includes Omnibar and tenant switcher. |
| Universal Omnibar | `CommandMenu.tsx` | Navigation | **NEEDS REFINEMENT** | Functional Ctrl+K search; needs debouncing/caching on open. |
| Booking Calculation Engine | `bookingEngine.ts` | Domain Core | **DO NOT TOUCH** | Math-intensive slot calculations, buffer times, conflict detection. |
| Commercial Engine | `commerceEngine.service.ts` | Domain Core | **DO NOT TOUCH** | Tax, discount, and split payment math with passing unit tests. |
| Thermal Printing ESC/POS | `escpos.ts` | Hardware Core | **DO NOT TOUCH** | Low-level binary byte stream for thermal receipt printers. |
| Repository Interfaces | `src/repositories/` | Data Layer | **DO NOT TOUCH** | Clean decoupled interfaces (`I*Repository`) preserving architecture. |
| LocalStorage Adapter | `LocalStorageAdapter.ts` | Persistence | **DO NOT TOUCH** | Client-side persistence and demo seed generator. |
| Dashboard Page | `DashboardPage.tsx` | Pages | **NEEDS REFINEMENT** | Functional KPIs; needs operational Action Center and daily alerts. |
| Calendar Page | `CitasPage.tsx` | Pages | **NEEDS REFINEMENT** | Comprehensive views; needs mobile-friendly vertical timeline. |
| Clients 360° Dossier | `ClientesPage.tsx` | Pages | **GOOD** | Rich customer history, documents, consents, tags. |
| POS & Cash Register | `VentasPage.tsx` | Pages | **GOOD** | Complete terminal, split payment, cash register sessions. |
| Hardware Sandbox | `HardwarePage.tsx` | Pages | **GOOD** | Bluetooth printer test, cash drawer kick pulse, barcode tester. |
| Inventory & Kardex | `InventarioPage.tsx` | Pages | **GOOD** | Stock movements, low stock alerts, supplier orders, BOM recipes. |
| RBAC Roles Matrix | `RolesPage.tsx` | Pages | **GOOD** | Complete permission matrix across 10 modules; system role guards. |
| Analytics & Reports | `ReportesPage.tsx` | Pages | **GOOD** | 5 reporting tabs, SVG charts, CSV exports, date filtering. |
| White-Label Settings | `ConfiguracionPage.tsx` | Pages | **GOOD** | Live Google Fonts, custom color palettes, embeddable widget. |
| Industry Adaptability | `ModulosPage.tsx` | Pages | **GOOD** | 12 industry presets, dynamic terminology, add-on toggling. |
| Customer Booking Portal | `PortalReservaPage.tsx` | Public Pages | **GOOD** | Standalone public booking flow with hidden admin access lock. |
| Guided Onboarding Flow | N/A | Experience | **MISSING** | No first-run wizard or progress checklist for new accounts. |
| Interactive Demo Center | N/A | Experience | **MISSING** | No in-app showcase mode for prospects to demo multiple industries. |
| Payment Gateway Processing | `pagosService.ts` | Payments | **MOCK** | Card/transfer payments simulated; real charges require gateway API. |
| External CRM Sync | `crmService.ts` | Integraciones | **MOCK** | HubSpot/Salesforce connectors simulated via MSW handlers. |
| Server Multi-Tenant DB | Backend API | Backend | **BACKEND DEPENDENT** | Concurrent multi-user locking requires live server database. |

---

## CONCLUSION & SIGN-OFF

The Sagitta frontend architecture is in **excellent health**. It has a rock-solid foundation of strict TypeScript interfaces, decoupled repositories, and an extensive feature set spanning operations, point of sale, hardware integration, and multi-tenant adaptability.

Phase 00 confirms that **no emergency architectural rewrites or breaking changes are necessary**. The upcoming Phase 01 should focus squarely on unifying the design token system, eliminating hardcoded color classes, establishing a calm and human-designed visual hierarchy, and setting the stage for an elevated user experience across all devices.

