/**
 * Modelos de acceso a datos.
 * Cada función encapsula una consulta SQL para la tabla `alertas` y `assists`.
 * - fetchAlertas: devuelve alertas activas no expiradas
 * - createAlerta: inserta nueva alerta con UUID y fecha de expiración
 * - assistAlerta / unassistAlerta: gestiona asistencias (Voy)
 * - currentAssist: comprueba si un fingerprint tiene una asistencia activa
 * - canCreateAlert: rate-limit de 2 alertas cada 5 minutos por fingerprint
 */
import { v4 as uuidv4 } from 'uuid'
import { getPool } from './db.js'

function pool() {
  return getPool()
}

function pad(n) {
  return String(n).padStart(2, '0')
}

function formatDateTime(date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`
}

function calcExpiry(duration) {
  const now = new Date()
  const map = { min15: 15, hour1: 60, hours6: 360, hours24: 1440 }
  now.setMinutes(now.getMinutes() + (map[duration] || 60))
  return formatDateTime(now)
}

function nowStr() {
  return formatDateTime(new Date())
}

function agoStr(minutes) {
  const d = new Date()
  d.setMinutes(d.getMinutes() - minutes)
  return formatDateTime(d)
}

export async function fetchAlertas() {
  const [rows] = await pool().query(
    `SELECT * FROM alertas WHERE status = 'active' AND expires_at > ? ORDER BY created_at DESC`,
    [nowStr()]
  )
  return rows
}

export async function createAlerta(data) {
  const id = uuidv4()
  const expiresAt = calcExpiry(data.duration)
  const createdAt = nowStr()

  await pool().query(
    `INSERT INTO alertas (id, lat, lng, severity, description, num_people, direction, appearance, duration, expires_at, created_at, fingerprint_hash)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [id, data.lat, data.lng, data.severity, data.description, data.num_people, data.direction, data.appearance, data.duration, expiresAt, createdAt, data.fingerprint_hash]
  )

  const [rows] = await pool().query(`SELECT * FROM alertas WHERE id = ?`, [id])
  return rows[0]
}

export async function assistAlerta(alertId, fingerprintHash) {
  const id = uuidv4()
  try {
    await pool().query(
      `INSERT INTO assists (id, alert_id, fingerprint_hash) VALUES (?, ?, ?)`,
      [id, alertId, fingerprintHash]
    )
    return true
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') return false
    throw err
  }
}

export async function hasAssisted(alertId, fingerprintHash) {
  const [rows] = await pool().query(
    `SELECT id FROM assists WHERE alert_id = ? AND fingerprint_hash = ? LIMIT 1`,
    [alertId, fingerprintHash]
  )
  return rows.length > 0
}

export async function unassistAlerta(alertId, fingerprintHash) {
  await pool().query(
    `DELETE FROM assists WHERE alert_id = ? AND fingerprint_hash = ?`,
    [alertId, fingerprintHash]
  )
}

export async function currentAssist(fingerprintHash) {
  const [rows] = await pool().query(
    `SELECT a.id FROM assists AS s
     JOIN alertas AS a ON s.alert_id = a.id
     WHERE s.fingerprint_hash = ? AND a.status = 'active' AND a.expires_at > ?
     LIMIT 1`,
    [fingerprintHash, nowStr()]
  )
  return rows.length > 0 ? rows[0].id : null
}

export async function canCreateAlert(fingerprintHash) {
  const [rows] = await pool().query(
    `SELECT COUNT(*) AS count FROM alertas WHERE fingerprint_hash = ? AND created_at > ?`,
    [fingerprintHash, agoStr(5)]
  )
  return rows[0].count < 2
}
