/**
 * LocalStorageAdapter
 * Adaptador centralizado para la persistencia local de datos.
 * Encapsula la serialización, manejo de errores, multi-tenancy y carga de datos demo (seeds).
 */

const STORAGE_PREFIX = 'sagitta_'

export class LocalStorageAdapter {
  /**
   * Obtiene el identificador de la sucursal o tenant activo
   */
  static getActiveTenantId(): string {
    try {
      return localStorage.getItem('sagitta_active_tenant_id') || 'sede-principal'
    } catch {
      return 'sede-principal'
    }
  }

  /**
   * Obtiene la clave completa para un tenant y colección
   */
  private static getKey(collection: string, tenantId?: string): string {
    const tid = tenantId || this.getActiveTenantId()
    return `${STORAGE_PREFIX}${tid}_${collection}`
  }

  /**
   * Obtiene una colección de LocalStorage. Si no existe, inicializa con seedData si fue provisto.
   */
  static getCollection<T>(collection: string, seedData?: T[], tenantId?: string): T[] {
    const key = this.getKey(collection, tenantId)
    try {
      const raw = localStorage.getItem(key)
      if (raw) {
        return JSON.parse(raw) as T[]
      }
      if (!tenantId) {
        const legacyKey = `${STORAGE_PREFIX}${collection}`
        const legacyData = localStorage.getItem(legacyKey)
        if (legacyData) {
          localStorage.setItem(key, legacyData)
          localStorage.removeItem(legacyKey)
          return JSON.parse(legacyData) as T[]
        }
      }
      if (seedData) {
        this.setCollection(collection, seedData, tenantId)
        return seedData
      }
      return []
    } catch (err) {
      console.warn(`[LocalStorageAdapter] Error leyendo colección "${key}":`, err)
      return seedData || []
    }
  }

  /**
   * Guarda una colección completa en LocalStorage
   */
  static setCollection<T>(collection: string, items: T[], tenantId?: string): void {
    const key = this.getKey(collection, tenantId)
    try {
      localStorage.setItem(key, JSON.stringify(items))
    } catch (err) {
      console.error(`[LocalStorageAdapter] Error guardando colección "${key}":`, err)
    }
  }

  static get<T>(collection: string, seedData?: T, tenantId?: string): T {
    return this.getCollection<any>(collection, seedData as any, tenantId) as any
  }

  static set<T>(collection: string, items: T, tenantId?: string): void {
    this.setCollection<any>(collection, items as any, tenantId)
  }

  /**
   * Inserta un elemento en una colección
   */
  static insert<T extends { id?: string | number }>(
    collection: string,
    item: T,
    tenantId?: string
  ): T {
    const items = this.getCollection<T>(collection, [], tenantId)
    const newItem = {
      ...item,
      id: item.id ?? Date.now(),
    }
    items.unshift(newItem)
    this.setCollection(collection, items, tenantId)
    return newItem
  }

  /**
   * Actualiza un elemento existente por su id
   */
  static update<T extends { id?: string | number }>(
    collection: string,
    id: string | number,
    patch: Partial<T>,
    tenantId?: string
  ): T | null {
    const items = this.getCollection<T>(collection, [], tenantId)
    const idx = items.findIndex((it) => String(it.id) === String(id))
    if (idx === -1) return null

    const updated = { ...items[idx], ...patch }
    items[idx] = updated
    this.setCollection(collection, items, tenantId)
    return updated
  }

  /**
   * Elimina un elemento por su id
   */
  static remove<T extends { id?: string | number }>(
    collection: string,
    id: string | number,
    tenantId?: string
  ): boolean {
    const items = this.getCollection<T>(collection, [], tenantId)
    const filtered = items.filter((it) => String(it.id) !== String(id))
    if (filtered.length !== items.length) {
      this.setCollection(collection, filtered, tenantId)
      return true
    }
    return false
  }

  static delete<T extends { id?: string | number }>(
    collection: string,
    id: string | number,
    tenantId?: string
  ): boolean {
    return this.remove<T>(collection, id, tenantId)
  }

  /**
   * Reinicia todas las colecciones locales del sistema
   */
  static clearAll(): void {
    const keysToRemove: string[] = []
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key && key.startsWith(STORAGE_PREFIX)) {
        keysToRemove.push(key)
      }
    }
    keysToRemove.forEach((k) => localStorage.removeItem(k))
  }
}
