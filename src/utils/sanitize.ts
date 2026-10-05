/**
 * Utilidades de sanitización para prevenir ataques XSS e inyecciones en entradas de usuario.
 * Sagitta Enterprise Security Core.
 */

/**
 * Escapa caracteres HTML peligrosos (<, >, &, ", ')
 */
export function escapeHTML(input?: string | null): string {
  if (!input || typeof input !== 'string') return ''
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

/**
 * Sanitiza texto libre eliminando scripts, etiquetas html no deseadas y normalizando espacios
 */
export function sanitizeText(input?: string | null): string {
  if (!input || typeof input !== 'string') return ''
  // Elimina etiquetas <script> e invocaciones javascript:
  let cleaned = input.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
  cleaned = cleaned.replace(/javascript:[^\s]*/gi, '')
  // Elimina todas las etiquetas HTML para texto plano
  cleaned = cleaned.replace(/<\/?[^>]+(>|$)/g, '')
  return cleaned.trim()
}

/**
 * Valida si un email tiene formato seguro y estándar
 */
export function isValidEmail(email?: string | null): boolean {
  if (!email || typeof email !== 'string') return false
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
  return emailRegex.test(email.trim())
}
