/**
 * Formateador de números telefónicos para Venezuela (+58)
 * Restringe la entrada únicamente a números y añade el prefijo internacional automáticamente.
 */

export function formatTelefonoVE(raw: string): string {
  if (!raw || !raw.trim()) return ''

  // Extraer exclusivamente dígitos
  let digits = raw.replace(/\D/g, '')

  // Si el usuario escribió el 58 al principio, removerlo para no duplicar
  if (digits.startsWith('58')) {
    digits = digits.slice(2)
  }
  // Si empezó con 0 (ej. 0412...), remover el 0 inicial
  if (digits.startsWith('0')) {
    digits = digits.slice(1)
  }

  // Limitar a máximo 10 dígitos (código de área/móvil de 3 dígitos + 7 dígitos de abonado)
  digits = digits.slice(0, 10)

  if (!digits) return ''

  if (digits.length <= 3) {
    return `+58 ${digits}`
  } else if (digits.length <= 6) {
    return `+58 ${digits.slice(0, 3)} ${digits.slice(3)}`
  } else {
    return `+58 ${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6)}`
  }
}

/**
 * Previene la entrada de cualquier tecla que no sea numérica o de control
 */
export function handleOnlyNumbersKeyDown(e: React.KeyboardEvent<HTMLInputElement>): void {
  const allowedKeys = [
    'Backspace',
    'Delete',
    'ArrowLeft',
    'ArrowRight',
    'Tab',
    'Enter',
    'Home',
    'End',
    'Escape',
  ]

  // Permitir atajos como Ctrl+A, Ctrl+C, Ctrl+V, Ctrl+Z
  if (e.ctrlKey || e.metaKey) {
    return
  }

  if (!allowedKeys.includes(e.key) && !/^[0-9]$/.test(e.key)) {
    e.preventDefault()
  }
}
