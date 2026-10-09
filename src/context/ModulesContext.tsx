import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import type { BusinessProfile, IndustryId, ModuleId, TermKey } from '@/types'
import { MODULES, PLAN_ORDER, getModule, getTechnicalDependents, getTechnicalRequirements } from '@/config/modules'
import { getIndustryPreset, translateTerm } from '@/config/industries'
import { isFeatureEnabled } from '@/config/features'
import { useTenant } from '@/context/TenantContext'
import { LocalStorageAdapter } from '@/repositories/local/LocalStorageAdapter'

interface ModulesContextValue {
  profile: BusinessProfile
  industry: IndustryId
  setIndustry: (industry: IndustryId) => void
  applyPreset: (industry: IndustryId) => void
  isModuleEnabled: (moduleId: ModuleId) => boolean
  isAddonEnabled: (addonKey: string) => boolean
  enableModule: (moduleId: ModuleId) => void
  disableModule: (moduleId: ModuleId) => void
  toggleModule: (moduleId: ModuleId) => void
  enableAddon: (addonKey: string) => void
  disableAddon: (addonKey: string) => void
  toggleAddon: (addonKey: string) => void
  tTerm: (key: TermKey, fallback: string) => string
  customTerms: Partial<Record<TermKey, string>>
  setCustomTerm: (key: TermKey, value: string) => void
  resetCustomTerms: () => void
  activeModules: ModuleId[]
  activeAddons: string[]
  resetToDefaults: () => void
}

export const ModulesContext = createContext<ModulesContextValue | undefined>(undefined)

const COLLECTION_NAME = 'business_profile'

function createDefaultProfile(tenantId: string, industry: IndustryId = 'general'): BusinessProfile {
  const preset = getIndustryPreset(industry)
  // Módulos iniciales: todos los core + los sugeridos por el preset
  const coreModules = MODULES.filter((m) => m.core).map((m) => m.id)
  const initialModules = Array.from(new Set([...coreModules, ...preset.modules]))

  return {
    id: `profile-${tenantId}`,
    tenant_id: tenantId,
    industria: industry,
    modulos: initialModules,
    complementos: [...preset.addons],
    updated_at: new Date().toISOString(),
  }
}

export function ModulesProvider({ children }: { children: React.ReactNode }) {
  const { tenantActivo } = useTenant()
  const tenantId = tenantActivo?.id || 'sede-principal'
  const tenantPlan = tenantActivo?.plan || 'starter'

  const [profile, setProfile] = useState<BusinessProfile>(() => {
    const saved = LocalStorageAdapter.getCollection<BusinessProfile>(COLLECTION_NAME, [], tenantId)
    if (saved && saved.length > 0 && saved[0].tenant_id === tenantId) {
      return saved[0]
    }
    return createDefaultProfile(tenantId, 'general')
  })

  // Sincronizar al cambiar de tenant activo
  useEffect(() => {
    const saved = LocalStorageAdapter.getCollection<BusinessProfile>(COLLECTION_NAME, [], tenantId)
    if (saved && saved.length > 0 && saved[0].tenant_id === tenantId) {
      setProfile(saved[0])
    } else {
      const initial = createDefaultProfile(tenantId, 'general')
      LocalStorageAdapter.setCollection(COLLECTION_NAME, [initial], tenantId)
      setProfile(initial)
    }
  }, [tenantId])

  const saveProfile = useCallback(
    (newProfile: BusinessProfile) => {
      setProfile(newProfile)
      LocalStorageAdapter.setCollection(COLLECTION_NAME, [newProfile], tenantId)
    },
    [tenantId]
  )

  /**
   * Determina si un módulo está realmente habilitado para operar.
   * Reglas de cascada:
   * 1. Si tiene platformFlag global y está desactivado en build -> false.
   * 2. Si el plan del tenant es inferior al requerido -> false.
   * 3. Si es CORE -> true (siempre disponible para el plan permitido).
   * 4. Si está en la lista de módulos activados del perfil de negocio -> true.
   */
  const isModuleEnabled = useCallback(
    (moduleId: ModuleId): boolean => {
      const mod = getModule(moduleId)
      if (!mod) return false

      // 1. Feature flag global de plataforma
      if (mod.platformFlag && !isFeatureEnabled(mod.platformFlag)) {
        return false
      }

      // 2. Control comercial por plan de la sucursal
      const currentPlanLevel = PLAN_ORDER[tenantPlan] ?? 0
      const requiredPlanLevel = PLAN_ORDER[mod.minPlan] ?? 0
      if (currentPlanLevel < requiredPlanLevel) {
        return false
      }

      // 3. Módulos esenciales de core
      if (mod.core) {
        return true
      }

      // 4. Módulos opcionales configurados
      return profile.modulos.includes(moduleId)
    },
    [profile.modulos, tenantPlan]
  )

  const isAddonEnabled = useCallback(
    (addonKey: string): boolean => {
      // Un addon solo opera si su módulo padre está activo
      const [moduleId] = addonKey.split('.') as [ModuleId]
      if (moduleId && !isModuleEnabled(moduleId)) {
        return false
      }
      return profile.complementos.includes(addonKey)
    },
    [isModuleEnabled, profile.complementos]
  )

  // Activación con resolución automática de requisitos técnicos
  const enableModule = useCallback(
    (moduleId: ModuleId) => {
      const reqs = getTechnicalRequirements(moduleId)
      const toAdd = [moduleId, ...reqs]
      const updatedModulos = Array.from(new Set([...profile.modulos, ...toAdd]))

      saveProfile({
        ...profile,
        modulos: updatedModulos,
        updated_at: new Date().toISOString(),
      })
    },
    [profile, saveProfile]
  )

  // Desactivación con desactivación en cascada de dependientes técnicos
  const disableModule = useCallback(
    (moduleId: ModuleId) => {
      const mod = getModule(moduleId)
      if (mod?.core) return // No se puede desactivar un módulo core

      const dependents = getTechnicalDependents(moduleId)
      const toRemove = new Set([moduleId, ...dependents])
      const updatedModulos = profile.modulos.filter((id) => !toRemove.has(id))

      // También remover addons de los módulos desactivados
      const updatedAddons = profile.complementos.filter((key) => {
        const [modId] = key.split('.') as [ModuleId]
        return !toRemove.has(modId)
      })

      saveProfile({
        ...profile,
        modulos: updatedModulos,
        complementos: updatedAddons,
        updated_at: new Date().toISOString(),
      })
    },
    [profile, saveProfile]
  )

  const toggleModule = useCallback(
    (moduleId: ModuleId) => {
      if (profile.modulos.includes(moduleId)) {
        disableModule(moduleId)
      } else {
        enableModule(moduleId)
      }
    },
    [disableModule, enableModule, profile.modulos]
  )

  const enableAddon = useCallback(
    (addonKey: string) => {
      const [moduleId] = addonKey.split('.') as [ModuleId]
      const mod = getModule(moduleId)
      let modulosList = profile.modulos

      // Si el módulo padre no estaba activo y no es core, activarlo también
      if (mod && !mod.core && !modulosList.includes(moduleId)) {
        const reqs = getTechnicalRequirements(moduleId)
        modulosList = Array.from(new Set([...modulosList, moduleId, ...reqs]))
      }

      saveProfile({
        ...profile,
        modulos: modulosList,
        complementos: Array.from(new Set([...profile.complementos, addonKey])),
        updated_at: new Date().toISOString(),
      })
    },
    [profile, saveProfile]
  )

  const disableAddon = useCallback(
    (addonKey: string) => {
      saveProfile({
        ...profile,
        complementos: profile.complementos.filter((k) => k !== addonKey),
        updated_at: new Date().toISOString(),
      })
    },
    [profile, saveProfile]
  )

  const toggleAddon = useCallback(
    (addonKey: string) => {
      if (profile.complementos.includes(addonKey)) {
        disableAddon(addonKey)
      } else {
        enableAddon(addonKey)
      }
    },
    [disableAddon, enableAddon, profile.complementos]
  )

  const applyPreset = useCallback(
    (industryId: IndustryId) => {
      const preset = getIndustryPreset(industryId)
      const coreModules = MODULES.filter((m) => m.core).map((m) => m.id)
      const mergedModulos = Array.from(new Set([...coreModules, ...preset.modules]))

      saveProfile({
        ...profile,
        industria: industryId,
        modulos: mergedModulos,
        complementos: [...preset.addons],
        updated_at: new Date().toISOString(),
      })
    },
    [profile, saveProfile]
  )

  const setIndustry = useCallback(
    (industryId: IndustryId) => {
      saveProfile({
        ...profile,
        industria: industryId,
        updated_at: new Date().toISOString(),
      })
    },
    [profile, saveProfile]
  )

  const resetToDefaults = useCallback(() => {
    const fresh = createDefaultProfile(tenantId, profile.industria || 'general')
    saveProfile(fresh)
  }, [profile.industria, saveProfile, tenantId])

  const setCustomTerm = useCallback(
    (key: TermKey, value: string) => {
      const current = profile.terminos_personalizados || {}
      saveProfile({
        ...profile,
        terminos_personalizados: {
          ...current,
          [key]: value.trim(),
        },
        updated_at: new Date().toISOString(),
      })
    },
    [profile, saveProfile]
  )

  const resetCustomTerms = useCallback(() => {
    saveProfile({
      ...profile,
      terminos_personalizados: {},
      updated_at: new Date().toISOString(),
    })
  }, [profile, saveProfile])

  const tTerm = useCallback(
    (key: TermKey, fallback: string): string => {
      return translateTerm(profile.industria, key, fallback, profile.terminos_personalizados)
    },
    [profile.industria, profile.terminos_personalizados]
  )

  const activeModules = useMemo(() => {
    return MODULES.filter((m) => isModuleEnabled(m.id)).map((m) => m.id)
  }, [isModuleEnabled])

  const activeAddons = useMemo(() => {
    return profile.complementos.filter((key) => isAddonEnabled(key))
  }, [isAddonEnabled, profile.complementos])

  const value = useMemo<ModulesContextValue>(
    () => ({
      profile,
      industry: profile.industria,
      setIndustry,
      applyPreset,
      isModuleEnabled,
      isAddonEnabled,
      enableModule,
      disableModule,
      toggleModule,
      enableAddon,
      disableAddon,
      toggleAddon,
      tTerm,
      customTerms: profile.terminos_personalizados || {},
      setCustomTerm,
      resetCustomTerms,
      activeModules,
      activeAddons,
      resetToDefaults,
    }),
    [
      profile,
      setIndustry,
      applyPreset,
      isModuleEnabled,
      isAddonEnabled,
      enableModule,
      disableModule,
      toggleModule,
      enableAddon,
      disableAddon,
      toggleAddon,
      tTerm,
      setCustomTerm,
      resetCustomTerms,
      activeModules,
      activeAddons,
      resetToDefaults,
    ]
  )

  return <ModulesContext.Provider value={value}>{children}</ModulesContext.Provider>
}

export function useModules() {
  const context = useContext(ModulesContext)
  if (!context) {
    throw new Error('useModules debe ser utilizado dentro de un ModulesProvider')
  }
  return context
}
