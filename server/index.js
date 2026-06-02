/**
 * Servidor Express de la API Red Vecinal.
 * Proporciona endpoints REST para:
 *  - Obtener alertas activas (GET /api/alertas)
 *  - Crear alerta (POST /api/alertas) con rate-limit por fingerprint
 *  - Asistir / retirar asistencia (POST/DELETE /api/alertas/:id/assist)
 *  - Consultar asistencia actual (GET /api/assists/current)
 * Arranca en el puerto 3001 por defecto.
 */
import express from 'express'
import cors from 'cors'
import { testConnection } from './db.js'
import { fetchAlertas, createAlerta, assistAlerta, hasAssisted, unassistAlerta, currentAssist, canCreateAlert } from './models.js'

const app = express()
const PORT = parseInt(process.env.PORT || '3001')

const corsOptions = {
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173', 'http://localhost:3000', 'capacitor://localhost'],
  methods: ['GET', 'POST', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type'],
}

app.use(cors(corsOptions))
app.options('*', cors(corsOptions))
app.use(express.json())

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' })
})

app.get('/api/alertas', async (_req, res) => {
  try {
    const alertas = await fetchAlertas()
    res.json(alertas)
  } catch (err) {
    console.error('GET /api/alertas error:', err)
    res.status(500).json({ error: 'Error al obtener alertas' })
  }
})

app.post('/api/alertas', async (req, res) => {
  try {
    const { lat, lng, severity, description, num_people, direction, appearance, duration, fingerprint_hash } = req.body

    if (!lat || !lng || !severity || !duration || !fingerprint_hash) {
      return res.status(400).json({ error: 'Faltan campos obligatorios' })
    }

    const allowed = await canCreateAlert(fingerprint_hash)
    if (!allowed) {
      return res.status(429).json({ error: 'Demasiadas alertas seguidas. Espera unos minutos.' })
    }

    const data = { lat, lng, severity, description, num_people, direction, appearance, duration, fingerprint_hash }
    console.log('📝 Creando alerta:', JSON.stringify(data))
    const alerta = await createAlerta(data)
    res.status(201).json(alerta)
  } catch (err) {
    console.error('❌ POST /api/alertas error:', err?.message || err)
    console.error('   Stack:', err?.stack)
    res.status(500).json({ error: 'Error al crear alerta: ' + (err?.message || '') })
  }
})

app.post('/api/alertas/:id/assist', async (req, res) => {
  try {
    const { fingerprint_hash } = req.body
    if (!fingerprint_hash) return res.status(400).json({ error: 'Fingerprint requerido' })

    const active = await currentAssist(fingerprint_hash)
    if (active && active !== req.params.id) {
      return res.status(409).json({ error: 'Ya tienes un Voy activo en otra alerta' })
    }

    const ok = await assistAlerta(req.params.id, fingerprint_hash)
    if (ok) {
      res.json({ success: true })
    } else {
      res.status(409).json({ error: 'Ya has asistido a esta alerta' })
    }
  } catch (err) {
    console.error('POST /api/alertas/:id/assist error:', err)
    res.status(500).json({ error: 'Error al asistir' })
  }
})

app.delete('/api/alertas/:id/assist', async (req, res) => {
  try {
    const { fingerprint_hash } = req.body
    if (!fingerprint_hash) return res.status(400).json({ error: 'Fingerprint requerido' })

    await unassistAlerta(req.params.id, fingerprint_hash)
    res.json({ success: true })
  } catch (err) {
    console.error('DELETE /api/alertas/:id/assist error:', err)
    res.status(500).json({ error: 'Error al retirar asistencia' })
  }
})

app.get('/api/assists/current', async (req, res) => {
  try {
    const fp = req.query.fingerprint_hash
    if (!fp) return res.json({ alert_id: null })

    const alertId = await currentAssist(fp)
    res.json({ alert_id: alertId })
  } catch (err) {
    console.error('GET /api/assists/current error:', err)
    res.status(500).json({ error: 'Error al obtener asistencia actual' })
  }
})

app.get('/api/alertas/:id/assist', async (req, res) => {
  try {
    const fp = req.query.fingerprint_hash
    if (!fp) return res.json({ assisted: false })

    const assisted = await hasAssisted(req.params.id, fp)
    res.json({ assisted })
  } catch (err) {
    console.error('GET /api/alertas/:id/assist error:', err)
    res.status(500).json({ error: 'Error al verificar asistencia' })
  }
})

async function start() {
  const dbOk = await testConnection()
  if (!dbOk) {
    console.error('')
    console.error('⚠️  No se pudo conectar a MySQL.')
    console.error('   Asegúrate de tener Docker instalado y ejecuta:')
    console.error('   docker compose up -d')
    console.error('')
  }

  app.listen(PORT, () => {
    console.log(`✅ Red Vecinal API → http://localhost:${PORT}`)
  })
}

start()
