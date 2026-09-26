import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import { Tenant } from '@/types'
import { crmService } from '@/services/crm.service'

export const TENANTS_MOCK_INICIAL: Tenant[] = [
  {
    id: 'sede-principal',
    nombre: 'Sede Principal (Centro)',
    slug: 'sede-principal',
    plan: 'enterprise',
    activo: true,
    es_principal: true,
    direccion: 'Av. Paseo de la Reforma 405, Piso 12',
    telefono: '+1 555-0100',
    citas_mes: 342,
    limite_citas: 1000,
  },
  {
    id: 'sucursal-norte',
    nombre: 'Sucursal Norte (Polanco)',
    slug: 'sucursal-norte',
    plan: 'pro',
    activo: true,
    es_principal: false,
    direccion: 'Calle Arquímedes 130',
    telefono: '+1 555-0200',
    citas_mes: 185,
    limite_citas: 500,
  },
  {
    id: 'sucursal-sur',
    nombre: 'Sucursal Sur (Coyoacán)',
    slug: 'sucursal-sur',
    plan: 'starter',
    activo: true,
    es_principal: false,
    direccion: 'Av. Miguel Ángel de Quevedo 410',
    telefono: '+1 555-0300',
    citas_mes: 78,
    limite_citas: 200,
  },
]

interface TenantContextValue {
  tenants: Tenant[]
  tenantActivo: Tenant
  cambiarTenant: (tenantId: string) => void
  cargando: boolean
  crearTenant: (nuevo: Partial<Tenant>) => Promise<Tenant>
}

export const TenantContext = createContext<TenantContextValue | undefined>(undefined)

const STORAGE_TENANT_KEY = 'sagitta_active_tenant_id'

export function TenantProvider({ children }: { children: React.ReactNode }) {
  const [tenants, setTenants] = useState<Tenant[]>(TENANTS_MOCK_INICIAL)
  const [tenantActivoId, setTenantActivoId] = useState<string>(() => {
    return localStorage.getItem(STORAGE_TENANT_KEY) ?? 'sede-principal'
  })
  const [cargando, setCargando] = useState(false)

  // Cargar sedes desde la API
  useEffect(() => {
    crmService
      .getTenants()
      .then((res) => {
        if (res.data && res.data.length > 0) {
          setTenants(res.data)
        }
      })
      .catch(() => {
        // Fallback silencioso a mock local
      })
  }, [])

  const cambiarTenant = useCallback((id: string) => {
    setTenantActivoId(id)
    localStorage.setItem(STORAGE_TENANT_KEY, id)
  }, [])

  const crearTenant = useCallback(async (nuevo: Partial<Tenant>) => {
    setCargando(true)
    try {
      const res = await crmService.crearTenant(nuevo)
      const creado = res.data ?? {
        id: `tenant-${Date.now()}`,
        nombre: nuevo.nombre ?? 'Nueva Sucursal',
        slug: nuevo.slug ?? 'nueva-sucursal',
        plan: nuevo.plan ?? 'pro',
        activo: true,
        es_principal: false,
        citas_mes: 0,
        limite_citas: 500,
        ...nuevo,
      }
      setTenants((prev) => [...prev, creado])
      return creado
    } finally {
      setCargando(false)
    }
  }, [])

  const tenantActivo = useMemo(() => {
    return (
      tenants.find((t) => t.id === tenantActivoId) ??
      tenants[0] ??
      TENANTS_MOCK_INICIAL[0]
    )
  }, [tenants, tenantActivoId])

  const value = useMemo<TenantContextValue>(
    () => ({
      tenants,
      tenantActivo,
      cambiarTenant,
      cargando,
      crearTenant,
    }),
    [tenants, tenantActivo, cambiarTenant, cargando, crearTenant]
  )

  return <TenantContext.Provider value={value}>{children}</TenantContext.Provider>
}

export function useTenant() {
  const context = useContext(TenantContext)
  if (!context) {
    throw new Error('useTenant debe usarse dentro de un TenantProvider')
  }
  return context
}

