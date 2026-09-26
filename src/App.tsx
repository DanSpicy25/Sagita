import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from '@/context/AuthContext'
import { AppProvider } from '@/context/AppContext'
import { ConfiguracionProvider } from '@/context/ConfiguracionContext'
import { TenantProvider } from '@/context/TenantContext'
import { I18nProvider } from '@/context/I18nContext'
import { PageWrapper } from '@/components/layout'
import { Loader } from '@/components/ui'
import { useAuth } from '@/hooks/useAuth'

const LoginPage = lazy(() => import('@/pages/LoginPage'))
const DashboardPage = lazy(() => import('@/pages/DashboardPage'))
const CitasPage = lazy(() => import('@/pages/CitasPage'))
const NuevaCitaPage = lazy(() => import('@/pages/NuevaCitaPage'))
const ServiciosPage = lazy(() => import('@/pages/ServiciosPage'))
const EmpleadosPage = lazy(() => import('@/pages/EmpleadosPage'))
const ClientesPage = lazy(() => import('@/pages/ClientesPage'))
const PagosPage = lazy(() => import('@/pages/PagosPage'))
const IntegracionesPage = lazy(() => import('@/pages/IntegracionesPage'))
const ConfiguracionPage = lazy(() => import('@/pages/ConfiguracionPage'))
const CrmDesarrolladoresPage = lazy(() => import('@/pages/CrmDesarrolladoresPage'))
const PortalReservaPage = lazy(() => import('@/pages/PortalReservaPage'))
const UsuariosPage = lazy(() => import('@/pages/UsuariosPage'))
const NotFoundPage = lazy(() => import('@/pages/NotFoundPage'))
const InventarioPage = lazy(() => import('@/pages/InventarioPage'))
const VentasPage = lazy(() => import('@/pages/VentasPage'))
const ReportesPage = lazy(() => import('@/pages/ReportesPage'))
const RolesPage = lazy(() => import('@/pages/RolesPage'))

// ─── Guard de rutas privadas ───────────────────────────────────────────────
function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth()
  if (isLoading) return <Loader fullScreen text="Cargando..." />
  if (!isAuthenticated) return <Navigate to="/login" replace />
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

      {/* Fase 5: Configuración y Marca Blanca */}
      <Route
        path="/ajustes"
        element={
          <PrivateRoute>
            <ConfiguracionPage />
          </PrivateRoute>
        }
      />

      {/* Fase 6: Escalabilidad, Multi-Tenant y CRM */}
      <Route
        path="/crm"
        element={
          <PrivateRoute>
            <CrmDesarrolladoresPage />
          </PrivateRoute>
        }
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
    </TenantProvider>
  )
}
