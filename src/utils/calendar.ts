import { Cita } from '@/types'

/**
 * Formatea una fecha ISO (2026-09-20 10:00:00) al formato UTC compacto de iCalendar (YYYYMMDDTHHmmSSZ)
 */
function formatoIcsFecha(fechaStr: string): string {
  const d = new Date(fechaStr.replace(' ', 'T'))
  return d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')
}

/**
 * Genera y descarga un archivo .ics estándar para importar en Apple Calendar, Outlook o Google Calendar
 */
export function descargarArchivoIcs(cita: Cita) {
  const dtStart = formatoIcsFecha(cita.fecha_inicio)
  const dtEnd = formatoIcsFecha(cita.fecha_fin)
  const dtStamp = new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')

  const summary = `${cita.servicio?.nombre ?? 'Cita Médica / Profesional'} - Sagitta`
  const description = `Cita con ${cita.empleado?.nombre ?? 'Profesional'} para ${cita.cliente?.nombre ?? 'Cliente'}.${
    cita.enlace_videollamada ? `\\nEnlace Videollamada: ${cita.enlace_videollamada}` : ''
  }${cita.notas ? `\\nNotas: ${cita.notas}` : ''}`
  const location = cita.ubicacion?.direccion ?? (cita.enlace_videollamada ? 'Videollamada en línea' : 'Consultorio Central')

  const icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Sagitta//Sistema de Citas//ES',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:sagitta-cita-${cita.id}-${dtStamp}@sagitta.app`,
    `DTSTAMP:${dtStamp}`,
    `DTSTART:${dtStart}`,
    `DTEND:${dtEnd}`,
    `SUMMARY:${summary}`,
    `DESCRIPTION:${description}`,
    `LOCATION:${location}`,
    'STATUS:CONFIRMED',
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n')

  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.setAttribute('download', `cita-${cita.id}-sagitta.ics`)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

/**
 * Genera el enlace directo para añadir la cita a Google Calendar en el navegador
 */
export function generarUrlGoogleCalendar(cita: Cita): string {
  const dtStart = formatoIcsFecha(cita.fecha_inicio)
  const dtEnd = formatoIcsFecha(cita.fecha_fin)
  const title = encodeURIComponent(`${cita.servicio?.nombre ?? 'Cita'} con ${cita.empleado?.nombre ?? 'Profesional'}`)
  const details = encodeURIComponent(
    `Cita en Sagitta para ${cita.cliente?.nombre ?? 'Cliente'}.${
      cita.enlace_videollamada ? `\nVideollamada: ${cita.enlace_videollamada}` : ''
    }${cita.notas ? `\nNotas: ${cita.notas}` : ''}`
  )
  const location = encodeURIComponent(
    cita.ubicacion?.direccion ?? (cita.enlace_videollamada ? 'Videollamada en línea' : 'Consultorio')
  )

  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${dtStart}/${dtEnd}&details=${details}&location=${location}`
}

/**
 * Genera enlace para enviar recordatorio directo por WhatsApp Web / App
 */
export function generarUrlWhatsApp(telefono: string, mensaje: string): string {
  const cleanPhone = telefono.replace(/[^\d]/g, '')
  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(mensaje)}`
}

