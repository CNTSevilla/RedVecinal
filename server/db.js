import mysql from 'mysql2/promise'

const DB_CONFIG = {
  host: process.env.DB_HOST || '127.0.0.1',
  port: parseInt(process.env.DB_PORT || '3307'),
  user: process.env.DB_USER || 'redvecinal',
  password: process.env.DB_PASSWORD || 'redvecinal_pass',
  database: process.env.DB_NAME || 'redvecinal',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
}

let pool

function createPool() {
  if (pool) return pool
  pool = mysql.createPool(DB_CONFIG)
  return pool
}

export async function testConnection() {
  try {
    const p = createPool()
    await p.query('SELECT 1')
    console.log('✅ MySQL conectado')
    return true
  } catch (err) {
    console.error('❌ MySQL no disponible:', err?.message || err)
    pool = null
    return false
  }
}

export function getPool() {
  if (!pool) createPool()
  return pool
}

export default { getPool, testConnection }
