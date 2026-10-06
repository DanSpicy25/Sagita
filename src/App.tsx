import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from '@/context/AuthContext'
import { AppProvider } from '@/context/AppContext'
import { ConfiguracionProvider } from '@/context/ConfiguracionContext'
import { TenantProvider } from '@/context/TenantContext'
import { ModulesProvider } from '@/context/ModulesContext'
import { I18nProvider } from '@/context/I18nContext'
import { PageWrapper } from '@/components/layout'
import { Loader } from '@/components/ui'
import { useAuth } from '@/hooks/useAuth'

const LoginPage = lazy(() => import('@/pages/LoginPage'))
const DashboardPage = lazy(() => import('@/pages/DashboardPage'))
const CitasPage = lazy(() => import('@/pages/CitasPage'))
const NuevaCitaPage = lazy(() => import('@/pages/NuevaCitaPage'))
const RecepcionPage = lazy(() => import('@/pages/RecepcionPage'))
const ServiciosPage = lazy(() => import('@/pages/ServiciosPage'))
const EmpleadosPage = lazy(() => import('@/pages/EmpleadosPage'))
const RecursosPage = lazy(() => import('@/pages/RecursosPage'))
const ClientesPage = lazy(() => import('@/pages/ClientesPage'))
const PagosPage = lazy(() => import('@/pages/PagosPage'))
const IntegracionesPage = lazy(() => import('@/pages/IntegracionesPage'))
const ConfiguracionPage = lazy(() => import('@/pages/ConfiguracionPage'))
const CrmPage = lazy(() => import('@/pages/CrmPage'))
const CrmDesarrolladoresPage = lazy(() => import('@/pages/CrmDesarrolladoresPage'))
const ModulosPage = lazy(() => import('@/pages/ModulosPage'))
const PortalReservaPage = lazy(() => import('@/pages/PortalReservaPage'))
const UsuariosPage = lazy(() => import('@/pages/UsuariosPage'))
const NotFoundPage = lazy(() => import('@/pages/NotFoundPage'))
const InventarioPage = lazy(() => import('@/pages/InventarioPage'))
const VentasPage = lazy(() => import('@/pages/VentasPage'))
const HardwarePage = lazy(() => import('@/pages/HardwarePage'))
const ReportesPage = lazy(() => import('@/pages/ReportesPage'))
const RolesPage = lazy(() => import('@/pages/RolesPage'))

// ─── Guard de rutas privadas ───────────────────────────────────────────────
function PrivateRoute({
  children,
  requiredPermission,
}: {
  children: React.ReactNode
  requiredPermission?: string
}) {
  const { isAuthenticated, isLoading, hasPermission } = useAuth()
  if (isLoading) return <Loader fullScreen text="Cargando..." />
  if (!isAuthenticated) return <Navigate to="/login" replace />
  if (requiredPermission && !hasPermission(requiredPermission)) {
    return <Navigate to="/dashboard" replace />
  }
  return <PageWrapper>{children}</PageWrapper>
}

// ─── Rutas ─────────────────────────────────────────────────────────────────
function AppRoutes() {
  return (
    <Suspense fallback={<Loader fullScreen text="Cargando..." />}>
      <Routes>
        <Route path="/" element={<PortalReservaPage />} />
        <Route path="/login" element={<LoginPage />} />

      <Route
        path="/dashboard"
        element={
          <PrivateRoute>
            <DashboardPage />
          </PrivateRoute>
        }
      />

      <Route
        path="/citas"
        element={
          <PrivateRoute>
            <CitasPage />
          </PrivateRoute>
        }
      />

      <Route
        path="/citas/nueva"
        element={
          <PrivateRoute>
            <NuevaCitaPage />
          </PrivateRoute>
        }
      />

      {/* Módulo Recepción / Mostrador (Walk-in y Lista de espera) */}
      <Route
        path="/recepcion"
        element={
          <PrivateRoute>
            <RecepcionPage />
          </PrivateRoute>
        }
      />

      <Route
        path="/servicios"
        element={
          <PrivateRoute>
            <ServiciosPage />
          </PrivateRoute>
        }
      />

      <Route
        path="/empleados"
        element={
          <PrivateRoute>
            <EmpleadosPage />
          </PrivateRoute>
        }
      />

      {/* Módulo Recursos y Bloqueos de Agenda */}
      <Route
        path="/recursos"
        element={
          <PrivateRoute>
            <RecursosPage />
          </PrivateRoute>
        }
      />

      <Route
        path="/clientes"
        element={
          <PrivateRoute>
            <ClientesPage />
          </PrivateRoute>
        }
      />

      <Route
        path="/finanzas"
        element={
          <PrivateRoute>
            <PagosPage />
          </PrivateRoute>
        }
      />

      <Route
        path="/usuarios"
        element={
          <PrivateRoute>
            <UsuariosPage />
          </PrivateRoute>
        }
      />

      <Route
        path="/integraciones"
        element={
          <PrivateRoute>
            <IntegracionesPage />
          </PrivateRoute>
        }
      />

      {/* Módulo Automatizaciones directas */}
      <Route
        path="/automatizaciones"
        element={
          <PrivateRoute>
            <IntegracionesPage defaultTab="automatizaciones" />
          </PrivateRoute>
        }
      />

      {/* Fase 5: Configuración y Marca Blanca */}
      <Route
        path="/ajustes"
        element={
          <PrivateRoute>
            <ConfiguracionPage />
          </PrivateRoute>
        }
      />

      {/* Adaptabilidad y Gestión de Módulos */}
      <Route
        path="/modulos"
        element={
          <PrivateRoute>
            <ModulosPage />
          </PrivateRoute>
        }
      />

      {/* DOM-04: CRM y Pipeline Comercial */}
      <Route
        path="/crm"
        element={
          <PrivateRoute>
            <CrmPage />
          </PrivateRoute>
        }
      />

      {/* DOM-07: Desarrolladores, API Keys y Consola OpenAPI */}
      <Route
        path="/desarrolladores"
        element={
          <PrivateRoute>
            <CrmDesarrolladoresPage />
          </PrivateRoute>
        }
      />
      <Route
        path="/configuracion/desarrolladores"
        element={<Navigate to="/desarrolladores" replace />}
      />

      {/* Nuevos módulos */}
      <Route
        path="/ventas"
        element={
          <PrivateRoute>
            <VentasPage />
          </PrivateRoute>
        }
      />

      <Route
        path="/hardware"
        element={
          <PrivateRoute>
            <HardwarePage />
          </PrivateRoute>
        }
      />

      <Route
        path="/inventario"
        element={
          <PrivateRoute>
            <InventarioPage />
          </PrivateRoute>
        }
      />

      <Route
        path="/roles"
        element={
          <PrivateRoute>
            <RolesPage />
          </PrivateRoute>
        }
      />

      <Route
        path="/reportes"
        element={
          <PrivateRoute>
            <ReportesPage />
          </PrivateRoute>
        }
      />

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
    </Suspense>
  )
}

// ─── App raíz ─────────────────────────────────────────────────────────────
export default function App() {
  return (
    <TenantProvider>
      <ModulesProvider>
        <I18nProvider>
          <ConfiguracionProvider>
            <AppProvider>
              <AuthProvider>
                <BrowserRouter>
                  <AppRoutes />
                </BrowserRouter>
              </AuthProvider>
            </AppProvider>
          </ConfiguracionProvider>
        </I18nProvider>
      </ModulesProvider>
    </TenantProvider>
  )
}
