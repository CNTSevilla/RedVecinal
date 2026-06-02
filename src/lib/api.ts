const API = import.meta.env.VITE_API_URL || '/api'

export interface Alerta {
  id: string
  lat: number
  lng: number
  severity: string
  description: string
  num_people: number | null
  direction: string
  appearance: string
  duration: string
  expires_at: string
  status: string
  assists_count: number
  created_at: string
}

export interface CreateAlertaInput {
  lat: number
  lng: number
  severity: string
  description: string
  num_people: number | null
  direction: string
  appearance: string
  duration: string
  fingerprint_hash: string
}

async function req<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...init,
  })
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body.error || `HTTP ${res.status}`)
  }
  return res.json()
}

export async function fetchAlertas(): Promise<Alerta[]> {
  try {
    return await req<Alerta[]>('/alertas')
  } catch {
    return []
  }
}

export async function createAlerta(input: CreateAlertaInput): Promise<Alerta | null> {
  try {
    return await req<Alerta>('/alertas', {
      method: 'POST',
      body: JSON.stringify(input),
    })
  } catch (err) {
    console.error('Error creating alerta:', err)
    return null
  }
}

export async function assistAlerta(alertId: string, fingerprintHash: string): Promise<boolean> {
  try {
    await req('/alertas/' + alertId + '/assist', {
      method: 'POST',
      body: JSON.stringify({ fingerprint_hash: fingerprintHash }),
    })
    return true
  } catch {
    return false
  }
}

export async function unassistAlerta(alertId: string, fingerprintHash: string): Promise<boolean> {
  try {
    await req('/alertas/' + alertId + '/assist', {
      method: 'DELETE',
      body: JSON.stringify({ fingerprint_hash: fingerprintHash }),
    })
    return true
  } catch {
    return false
  }
}

export async function hasAssisted(alertId: string, fingerprintHash: string): Promise<boolean> {
  try {
    const data = await req<{ assisted: boolean }>('/alertas/' + alertId + '/assist?fingerprint_hash=' + encodeURIComponent(fingerprintHash))
    return data.assisted
  } catch {
    return false
  }
}

export async function fetchCurrentAssist(fingerprintHash: string): Promise<string | null> {
  try {
    const data = await req<{ alert_id: string | null }>('/assists/current?fingerprint_hash=' + encodeURIComponent(fingerprintHash))
    return data.alert_id
  } catch {
    return null
  }
}
