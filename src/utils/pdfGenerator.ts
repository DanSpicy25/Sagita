import { Cita, ConfiguracionMarcaBlanca } from '@/types'

/**
 * Convierte color hexadecimal (#rrggbb) a componentes normalizados [0..1] para operadores PDF
 */
function hexToRgb(hex = '#6366f1'): { r: number; g: number; b: number } {
  let clean = hex.replace('#', '').trim()
  if (clean.length === 3) {
    clean = clean
      .split('')
      .map((c) => c + c)
      .join('')
  }
  const num = parseInt(clean, 16) || 0x6366f1
  return {
    r: Number((((num >> 16) & 255) / 255).toFixed(3)),
    g: Number((((num >> 8) & 255) / 255).toFixed(3)),
    b: Number(((num & 255) / 255).toFixed(3)),
  }
}

/**
 * Escapa texto plano para flujos de texto en PDF con codificación WinAnsiEncoding
 */
function escapePdfText(text: string): string {
  if (!text) return ''
  return text
    .replace(/\\/g, '\\\\')
    .replace(/\(/g, '\\(')
    .replace(/\)/g, '\\)')
    .replace(/á/g, '\\341')
    .replace(/é/g, '\\351')
    .replace(/í/g, '\\355')
    .replace(/ó/g, '\\363')
    .replace(/ú/g, '\\372')
    .replace(/Á/g, '\\301')
    .replace(/É/g, '\\311')
    .replace(/Í/g, '\\315')
    .replace(/Ó/g, '\\323')
    .replace(/Ú/g, '\\332')
    .replace(/ñ/g, '\\361')
    .replace(/Ñ/g, '\\321')
    .replace(/ü/g, '\\374')
    .replace(/Ü/g, '\\334')
    .replace(/¿/g, '\\277')
    .replace(/¡/g, '\\241')
}

/**
 * Genera el archivo binario estándar PDF 1.4 de comprobante de cita médica / profesional
 * Compatible nativamente con Android (Chrome, Drive Viewer, Samsung) y PC (Chrome, Edge, Adobe Acrobat)
 */
export function generarPdfCitaBytes(
  cita: Cita,
  config?: Partial<ConfiguracionMarcaBlanca>
): Uint8Array {
  const brandName = config?.nombre_negocio || 'Sagitta'
  const brandTagline = config?.lema_negocio || 'Comprobante Oficial de Reserva'
  const supportEmail = config?.email_soporte || ''
  const supportPhone = config?.telefono_soporte || ''
  const website = config?.sitio_web || ''
  const currencySymbol = config?.simbolo_moneda || '$'

  const rgbPrimary = hexToRgb(config?.color_primario || '#6366f1')

  const fechaFormateada = cita.fecha_inicio.slice(0, 10)
  const horaInicio = cita.fecha_inicio.slice(11, 16)
  const horaFin = cita.fecha_fin.slice(11, 16)
  const fechaExpedicion = new Date().toLocaleDateString('es-ES', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })

  // Operadores de dibujo y texto en coordenadas PDF (origen 0,0 en esquina inferior izquierda, A4 = 595.28 x 841.89 pt)
  const streamCommands: string[] = []

  // 1. Franja superior decorativa de marca
  streamCommands.push(
    `${rgbPrimary.r} ${rgbPrimary.g} ${rgbPrimary.b} rg`,
    `0 820 595.28 22 re f`
  )

  // 2. Cabecera: Nombre de Marca y Título
  streamCommands.push(
    `BT`,
    `/F2 20 Tf`,
    `0.1 0.1 0.1 rg`,
    `50 780 Td`,
    `(${escapePdfText(brandName)}) Tj`,
    `ET`
  )

  streamCommands.push(
    `BT`,
    `/F1 9 Tf`,
    `0.45 0.45 0.45 rg`,
    `50 765 Td`,
    `(${escapePdfText(brandTagline)}) Tj`,
    `ET`
  )

  // Badge Estado y Folio (Derecha)
  streamCommands.push(
    `0.94 0.96 0.98 rg`,
    `385 758 160 38 re f`,
    `0.85 0.88 0.92 RG`,
    `1 w`,
    `385 758 160 38 re S`,
    `BT`,
    `/F2 11 Tf`,
    `${rgbPrimary.r} ${rgbPrimary.g} ${rgbPrimary.b} rg`,
    `395 778 Td`,
    `(${escapePdfText(`FOLIO: #${cita.id}`)}) Tj`,
    `ET`,
    `BT`,
    `/F1 8 Tf`,
    `0.4 0.4 0.4 rg`,
    `395 765 Td`,
    `(${escapePdfText(`Estado: ${cita.estado.toUpperCase()}`)}) Tj`,
    `ET`
  )

  // Línea divisoria
  streamCommands.push(`0.88 0.90 0.93 RG`, `0.75 w`, `50 740 m 545 740 l S`)

  // 3. Título del Comprobante
  streamCommands.push(
    `BT`,
    `/F2 14 Tf`,
    `0.1 0.1 0.1 rg`,
    `50 715 Td`,
    `(${escapePdfText('COMPROBANTE DE RESERVA Y CONFIRMACION')}) Tj`,
    `ET`,
    `BT`,
    `/F1 8 Tf`,
    `0.5 0.5 0.5 rg`,
    `50 702 Td`,
    `(${escapePdfText(`Fecha de emisi\\363n: ${fechaExpedicion}`)}) Tj`,
    `ET`
  )

  // 4. Caja de Datos del Servicio (Tarjetón principal)
  streamCommands.push(
    `0.98 0.99 1.0 rg`,
    `50 560 495 125 re f`,
    `0.85 0.88 0.95 RG`,
    `1 w`,
    `50 560 495 125 re S`,
    // Barra lateral de acento
    `${rgbPrimary.r} ${rgbPrimary.g} ${rgbPrimary.b} rg`,
    `50 560 6 125 re f`
  )

  // Textos del servicio
  const servicioNombre = cita.servicio?.nombre || 'Consulta / Servicio'
  const especialista = cita.empleado?.nombre || 'Especialista asignado'
  const especialidad = cita.empleado?.especialidad || 'Atención profesional'

  streamCommands.push(
    `BT`,
    `/F2 13 Tf`,
    `0.12 0.12 0.15 rg`,
    `70 660 Td`,
    `(${escapePdfText(servicioNombre)}) Tj`,
    `ET`,
    `BT`,
    `/F1 9.5 Tf`,
    `0.35 0.35 0.40 rg`,
    `70 642 Td`,
    `(${escapePdfText(`Profesional a cargo: ${especialista} (${especialidad})`)}) Tj`,
    `ET`,
    `BT`,
    `/F2 10 Tf`,
    `0.15 0.15 0.18 rg`,
    `70 618 Td`,
    `(${escapePdfText(`Fecha programada: ${fechaFormateada}`)}) Tj`,
    `ET`,
    `BT`,
    `/F1 9.5 Tf`,
    `0.35 0.35 0.40 rg`,
    `70 600 Td`,
    `(${escapePdfText(`Horario: de ${horaInicio} a ${horaFin} hrs`)}) Tj`,
    `ET`
  )

  // Modalidad o Ubicación
  const modalidadStr = cita.modalidad === 'virtual' || cita.enlace_videollamada
    ? `Modalidad: Online / Videollamada (${cita.enlace_videollamada || 'Enlace asignado'})`
    : `Ubicaci\\363n: ${cita.ubicacion?.nombre || 'Consultorio'} - ${cita.ubicacion?.direccion || 'Sede Central'}`

  streamCommands.push(
    `BT`,
    `/F1 9 Tf`,
    `0.35 0.35 0.40 rg`,
    `70 580 Td`,
    `(${escapePdfText(modalidadStr)}) Tj`,
    `ET`
  )

  // 5. Tabla de Resumen: Cliente y Pagos
  streamCommands.push(
    // Caja Cliente
    `0.98 0.98 0.99 rg`,
    `50 440 240 100 re f`,
    `0.88 0.90 0.93 RG`,
    `0.8 w`,
    `50 440 240 100 re S`,
    `BT`,
    `/F2 10 Tf`,
    `0.15 0.15 0.2 rg`,
    `65 520 Td`,
    `(${escapePdfText('DATOS DEL CLIENTE')}) Tj`,
    `ET`,
    `BT`,
    `/F1 9 Tf`,
    `0.3 0.3 0.3 rg`,
    `65 500 Td`,
    `(${escapePdfText(`Nombre: ${cita.cliente?.nombre || 'Cliente Registrado'}`)}) Tj`,
    `ET`,
    `BT`,
    `/F1 9 Tf`,
    `0.3 0.3 0.3 rg`,
    `65 482 Td`,
    `(${escapePdfText(`Email: ${cita.cliente?.email || 'N/A'}`)}) Tj`,
    `ET`,
    `BT`,
    `/F1 9 Tf`,
    `0.3 0.3 0.3 rg`,
    `65 464 Td`,
    `(${escapePdfText(`Tel\\351fono: ${cita.cliente?.telefono || 'N/A'}`)}) Tj`,
    `ET`,
    // Caja Importe y Pago
    `0.98 0.98 0.99 rg`,
    `305 440 240 100 re f`,
    `0.88 0.90 0.93 RG`,
    `0.8 w`,
    `305 440 240 100 re S`,
    `BT`,
    `/F2 10 Tf`,
    `0.15 0.15 0.2 rg`,
    `320 520 Td`,
    `(${escapePdfText('RESUMEN DE PAGO')}) Tj`,
    `ET`,
    `BT`,
    `/F1 9 Tf`,
    `0.4 0.4 0.4 rg`,
    `320 495 Td`,
    `(${escapePdfText('Precio del Servicio:')}) Tj`,
    `ET`,
    `BT`,
    `/F1 9 Tf`,
    `0.2 0.2 0.2 rg`,
    `465 495 Td`,
    `(${escapePdfText(`${currencySymbol}${cita.precio_total}`)}) Tj`,
    `ET`,
    `0.85 0.85 0.85 RG`,
    `0.5 w`,
    `320 480 m 530 480 l S`,
    `BT`,
    `/F2 11 Tf`,
    `${rgbPrimary.r} ${rgbPrimary.g} ${rgbPrimary.b} rg`,
    `320 460 Td`,
    `(${escapePdfText('TOTAL:')}) Tj`,
    `ET`,
    `BT`,
    `/F2 12 Tf`,
    `${rgbPrimary.r} ${rgbPrimary.g} ${rgbPrimary.b} rg`,
    `460 460 Td`,
    `(${escapePdfText(`${currencySymbol}${cita.precio_total}`)}) Tj`,
    `ET`
  )

  // 6. Notas o Indicaciones (si existen)
  if (cita.notas) {
    streamCommands.push(
      `0.96 0.97 0.98 rg`,
      `50 365 495 55 re f`,
      `0.88 0.90 0.93 RG`,
      `0.8 w`,
      `50 365 495 55 re S`,
      `BT`,
      `/F2 9 Tf`,
      `0.2 0.2 0.2 rg`,
      `65 400 Td`,
      `(${escapePdfText('Instrucciones o Notas Especiales:')}) Tj`,
      `ET`,
      `BT`,
      `/F3 8.5 Tf`,
      `0.4 0.4 0.4 rg`,
      `65 382 Td`,
      `(${escapePdfText(`"${cita.notas.slice(0, 110)}"` )}) Tj`,
      `ET`
    )
  }

  // 7. Simulación de Código de Barras / Validación Digital
  streamCommands.push(
    `0.92 0.94 0.96 rg`,
    `50 260 495 85 re f`,
    `0.85 0.88 0.92 RG`,
    `0.8 w`,
    `50 260 495 85 re S`,
    `BT`,
    `/F2 9.5 Tf`,
    `0.2 0.2 0.2 rg`,
    `70 325 Td`,
    `(${escapePdfText('VALIDACION DE ASISTENCIA Y ACCESO')}) Tj`,
    `ET`,
    `BT`,
    `/F1 8 Tf`,
    `0.45 0.45 0.45 rg`,
    `70 310 Td`,
    `(${escapePdfText('Presenta este comprobante impreso o desde tu m\\363vil al llegar a tu cita.')}) Tj`,
    `ET`
  )

  // Barras decorativas de código
  let barX = 70
  for (let i = 0; i < 28; i++) {
    const barWidth = (i % 3 === 0) ? 3 : 1.5
    streamCommands.push(
      `0.2 0.2 0.25 rg`,
      `${barX} 275 ${barWidth} 22 re f`
    )
    barX += barWidth + 3
  }

  streamCommands.push(
    `BT`,
    `/F1 8 Tf`,
    `0.4 0.4 0.4 rg`,
    `220 282 Td`,
    `(${escapePdfText(`COD-REF: ${cita.id}-${fechaFormateada.replace(/-/g, '')}`)}) Tj`,
    `ET`
  )

  // 8. Términos y Pie de Página
  streamCommands.push(
    `0.88 0.90 0.93 RG`,
    `0.75 w`,
    `50 120 m 545 120 l S`,
    `BT`,
    `/F1 8 Tf`,
    `0.5 0.5 0.5 rg`,
    `50 100 Td`,
    `(${escapePdfText('Pol\\355tica de cancelaci\\363n: Se ruega avisar con al menos 24 horas de antelaci\\363n para reprogramar.')}) Tj`,
    `ET`
  )

  const contactoStr = [
    supportPhone ? `Tel: ${supportPhone}` : '',
    supportEmail ? `Email: ${supportEmail}` : '',
    website ? `Web: ${website}` : '',
  ]
    .filter(Boolean)
    .join('  |  ')

  if (contactoStr) {
    streamCommands.push(
      `BT`,
      `/F1 8 Tf`,
      `0.45 0.45 0.45 rg`,
      `50 85 Td`,
      `(${escapePdfText(contactoStr)}) Tj`,
      `ET`
    )
  }

  streamCommands.push(
    `BT`,
    `/F1 7.5 Tf`,
    `0.6 0.6 0.6 rg`,
    `50 65 Td`,
    `(${escapePdfText(`Documento oficial generado autom\\341ticamente por ${brandName}.`)}) Tj`,
    `ET`
  )

  const streamContent = streamCommands.join('\n')
  const streamLength = new TextEncoder().encode(streamContent).length

  // Construcción de los objetos PDF
  const objects: string[] = []

  // Obj 1: Catálogo
  objects.push(`1 0 obj\n<<\n  /Type /Catalog\n  /Pages 2 0 R\n>>\nendobj`)

  // Obj 2: Pages
  objects.push(`2 0 obj\n<<\n  /Type /Pages\n  /Kids [3 0 R]\n  /Count 1\n>>\nendobj`)

  // Obj 3: Page
  objects.push(
    `3 0 obj\n<<\n  /Type /Page\n  /Parent 2 0 R\n  /MediaBox [0 0 595.28 841.89]\n  /Contents 4 0 R\n  /Resources <<\n    /Font <<\n      /F1 <<\n        /Type /Font\n        /Subtype /Type1\n        /BaseFont /Helvetica\n        /Encoding /WinAnsiEncoding\n      >>\n      /F2 <<\n        /Type /Font\n        /Subtype /Type1\n        /BaseFont /Helvetica-Bold\n        /Encoding /WinAnsiEncoding\n      >>\n      /F3 <<\n        /Type /Font\n        /Subtype /Type1\n        /BaseFont /Helvetica-Oblique\n        /Encoding /WinAnsiEncoding\n      >>\n    >>\n  >>\n>>\nendobj`
  )

  // Obj 4: Stream
  objects.push(`4 0 obj\n<<\n  /Length ${streamLength}\n>>\nstream\n${streamContent}\nendstream\nendobj`)

  // Ensamblado final con cálculo de tabla XREF
  let pdf = `%PDF-1.4\n%\xE2\xE3\xCF\xD3\n`
  const offsets: number[] = [0] // Objeto 0 libre

  for (let i = 0; i < objects.length; i++) {
    offsets.push(new TextEncoder().encode(pdf).length)
    pdf += objects[i] + '\n'
  }

  const startxref = new TextEncoder().encode(pdf).length
  pdf += `xref\n0 ${objects.length + 1}\n`
  pdf += `0000000000 65535 f \n`
  for (let i = 1; i <= objects.length; i++) {
    const offStr = String(offsets[i]).padStart(10, '0')
    pdf += `${offStr} 00000 n \n`
  }

  pdf += `trailer\n<<\n  /Size ${objects.length + 1}\n  /Root 1 0 R\n>>\nstartxref\n${startxref}\n%%EOF`

  return new TextEncoder().encode(pdf)
}

/**
 * Descarga directamente el archivo .pdf nativo en el dispositivo (Android o PC)
 */
export function descargarCitaPdf(
  cita: Cita,
  config?: Partial<ConfiguracionMarcaBlanca>
): void {
  const bytes = generarPdfCitaBytes(cita, config)
  const blob = new Blob([bytes], { type: 'application/pdf' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  const brandSlug = (config?.nombre_negocio || 'cita')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '-')
  a.href = url
  a.download = `comprobante-cita-${cita.id}-${brandSlug}.pdf`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

/**
 * Abre una ventana o pestaña con el comprobante de cita estilizado para visualizarlo e imprimirlo
 * (activando en Android la opción nativa "Guardar como PDF" y en PC el diálogo de impresión/PDF)
 */
export function visualizarCitaPdf(
  cita: Cita,
  config?: Partial<ConfiguracionMarcaBlanca>
): void {
  const brandName = config?.nombre_negocio || 'Sagitta'
  const brandTagline = config?.lema_negocio || 'Sistema Inteligente de Gestión de Citas'
  const logoUrl = config?.logo_url || ''
  const primaryColor = config?.color_primario || '#6366f1'
  const supportEmail = config?.email_soporte || ''
  const supportPhone = config?.telefono_soporte || ''
  const website = config?.sitio_web || ''
  const currencySymbol = config?.simbolo_moneda || '$'

  const fechaFormateada = cita.fecha_inicio.slice(0, 10)
  const horaInicio = cita.fecha_inicio.slice(11, 16)
  const horaFin = cita.fecha_fin.slice(11, 16)
  const fechaHoy = new Date().toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  const html = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Comprobante de Cita #${cita.id} - ${brandName}</title>
  <style>
    :root {
      --primary: ${primaryColor};
    }
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      background-color: #f1f5f9;
      color: #0f172a;
      padding: 20px;
      display: flex;
      flex-direction: column;
      align-items: center;
      min-height: 100vh;
    }
    .action-bar {
      width: 100%;
      max-width: 680px;
      margin-bottom: 16px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 10px;
      flex-wrap: wrap;
    }
    .btn {
      padding: 8px 16px;
      border-radius: 8px;
      font-weight: 600;
      font-size: 13px;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      text-decoration: none;
      border: 1px solid transparent;
      transition: all 0.2s;
    }
    .btn-primary {
      background-color: var(--primary);
      color: #ffffff;
    }
    .btn-secondary {
      background-color: #ffffff;
      color: #334155;
      border-color: #cbd5e1;
    }
    .ticket-container {
      width: 100%;
      max-width: 680px;
      background: #ffffff;
      border-radius: 16px;
      box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1);
      overflow: hidden;
      border: 1px solid #e2e8f0;
    }
    .ticket-header {
      background: linear-gradient(135deg, var(--primary) 0%, #1e1b4b 100%);
      color: #ffffff;
      padding: 28px 32px;
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
    }
    .brand-title {
      font-size: 24px;
      font-weight: 800;
      letter-spacing: -0.5px;
    }
    .brand-tagline {
      font-size: 12px;
      color: #cbd5e1;
      margin-top: 4px;
    }
    .ticket-badge {
      background: rgba(255, 255, 255, 0.18);
      padding: 6px 14px;
      border-radius: 9999px;
      font-size: 12px;
      font-weight: 700;
      letter-spacing: 0.5px;
      border: 1px solid rgba(255, 255, 255, 0.3);
    }
    .ticket-body {
      padding: 32px;
    }
    .section-title {
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 1px;
      color: #64748b;
      margin-bottom: 12px;
    }
    .service-card {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-left: 4px solid var(--primary);
      border-radius: 12px;
      padding: 20px;
      margin-bottom: 24px;
    }
    .service-name {
      font-size: 18px;
      font-weight: 700;
      color: #0f172a;
      margin-bottom: 6px;
    }
    .grid-details {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 16px;
      margin-bottom: 24px;
    }
    .detail-item {
      background: #f8fafc;
      padding: 14px;
      border-radius: 10px;
      border: 1px solid #e2e8f0;
    }
    .detail-label {
      font-size: 11px;
      color: #64748b;
      margin-bottom: 4px;
    }
    .detail-value {
      font-size: 14px;
      font-weight: 600;
      color: #0f172a;
    }
    .notes-box {
      background: #fffbeb;
      border: 1px solid #fef3c7;
      color: #92400e;
      padding: 14px;
      border-radius: 10px;
      font-size: 13px;
      margin-bottom: 24px;
    }
    .barcode-section {
      background: #f8fafc;
      border: 1px dashed #cbd5e1;
      border-radius: 12px;
      padding: 20px;
      text-align: center;
      margin-bottom: 24px;
    }
    .barcode-lines {
      display: inline-block;
      height: 38px;
      letter-spacing: 3px;
      font-family: 'Courier New', monospace;
      font-weight: 900;
      font-size: 26px;
      color: #1e293b;
    }
    .ticket-footer {
      border-top: 1px solid #e2e8f0;
      padding-top: 20px;
      font-size: 11px;
      color: #64748b;
      display: flex;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: 8px;
    }
    @media print {
      body {
        background-color: #ffffff;
        padding: 0;
      }
      .action-bar {
        display: none !important;
      }
      .ticket-container {
        border: none;
        box-shadow: none;
        max-width: 100%;
      }
      @page {
        size: A4 portrait;
        margin: 12mm;
      }
    }
  </style>
</head>
<body>
  <div class="action-bar no-print">
    <button class="btn btn-secondary" onclick="window.close()">✕ Cerrar</button>
    <div style="display: flex; gap: 8px;">
      <button class="btn btn-primary" onclick="window.print()">🖨️ Imprimir / Guardar como PDF</button>
    </div>
  </div>

  <div class="ticket-container">
    <div class="ticket-header">
      <div>
        ${logoUrl ? `<img src="${logoUrl}" alt="${brandName}" style="max-height: 36px; margin-bottom: 8px; filter: brightness(0) invert(1);" />` : ''}
        <div class="brand-title">${brandName}</div>
        <div class="brand-tagline">${brandTagline}</div>
      </div>
      <div class="ticket-badge">
        CITA #${cita.id} • ${cita.estado.toUpperCase()}
      </div>
    </div>

    <div class="ticket-body">
      <div class="section-title">Detalles de la Reserva</div>
      <div class="service-card">
        <div class="service-name">${cita.servicio?.nombre || 'Consulta Profesional'}</div>
        <div style="font-size: 13px; color: #475569;">
          Profesional asignado: <strong>${cita.empleado?.nombre || 'Especialista'}</strong>
          ${cita.empleado?.especialidad ? ` (${cita.empleado.especialidad})` : ''}
        </div>
      </div>

      <div class="grid-details">
        <div class="detail-item">
          <div class="detail-label">Fecha Programada</div>
          <div class="detail-value">📅 ${fechaFormateada}</div>
        </div>
        <div class="detail-item">
          <div class="detail-label">Horario de Atención</div>
          <div class="detail-value">⏰ ${horaInicio} - ${horaFin} hrs</div>
        </div>
        <div class="detail-item">
          <div class="detail-label">Cliente Titular</div>
          <div class="detail-value">👤 ${cita.cliente?.nombre || 'Cliente'}</div>
          ${cita.cliente?.telefono ? `<div style="font-size: 11px; color: #64748b; margin-top: 2px;">Tel: ${cita.cliente.telefono}</div>` : ''}
        </div>
        <div class="detail-item">
          <div class="detail-label">Total a Pagar</div>
          <div class="detail-value" style="color: var(--primary); font-size: 16px;">
            ${currencySymbol}${cita.precio_total}
          </div>
        </div>
      </div>

      <div class="detail-item" style="margin-bottom: 24px;">
        <div class="detail-label">Modalidad & Ubicación</div>
        <div class="detail-value">
          ${cita.enlace_videollamada
            ? `💻 Videollamada Online: <a href="${cita.enlace_videollamada}" target="_blank" style="color: var(--primary); text-decoration: underline;">${cita.enlace_videollamada}</a>`
            : `📍 ${cita.ubicacion?.nombre || 'Sede Principal'}: ${cita.ubicacion?.direccion || 'Consultorio Central'}`
          }
        </div>
      </div>

      ${cita.notas ? `
        <div class="notes-box">
          <strong>Indicaciones previas:</strong> ${cita.notas}
        </div>
      ` : ''}

      <div class="barcode-section">
        <div style="font-size: 11px; color: #64748b; margin-bottom: 6px;">CÓDIGO DE VALIDACIÓN DIGITAL</div>
        <div class="barcode-lines">||| | || |||| | ||| || |||</div>
        <div style="font-size: 12px; font-weight: 700; color: #334155; margin-top: 6px;">
          REF-${cita.id}-${fechaFormateada.replace(/-/g, '')}
        </div>
      </div>

      <div class="ticket-footer">
        <div>Emisión: ${fechaHoy}</div>
        <div>
          ${supportPhone ? `Tel: ${supportPhone} • ` : ''}
          ${supportEmail ? `Email: ${supportEmail} • ` : ''}
          ${website ? `Web: ${website}` : ''}
        </div>
      </div>
    </div>
  </div>
</body>
</html>`

  const win = window.open('', '_blank')
  if (win) {
    win.document.open()
    win.document.write(html)
    win.document.close()
  }
}
