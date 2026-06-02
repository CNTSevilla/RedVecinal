/**
 * Genera un identificador anónimo (huella digital) del navegador.
 * Combina canvas fingerprinting + user agent + color depth + idioma,
 * y lo hashea con SHA-256. No se puede reconstruir la identidad real.
 * Se usa para rate-limit de alertas y control de asistencias.
 */
export async function createFingerprint(): Promise<string> {
  const parts: string[] = []

  const canvas = document.createElement('canvas')
  canvas.width = 200
  canvas.height = 50
  const ctx = canvas.getContext('2d')
  if (ctx) {
    ctx.textBaseline = 'top'
    ctx.font = '14px Arial'
    ctx.fillStyle = '#f60'
    ctx.fillRect(125, 1, 62, 20)
    ctx.fillStyle = '#069'
    ctx.fillText('fp', 2, 15)
    parts.push(canvas.toDataURL())
  }

  parts.push(navigator.userAgent)
  parts.push(screen.colorDepth + '')
  parts.push(navigator.language)

  const hash = await sha256(parts.join('|||'))
  return hash
}

async function sha256(str: string): Promise<string> {
  const buf = new TextEncoder().encode(str)
  const hash = await crypto.subtle.digest('SHA-256', buf)
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}
