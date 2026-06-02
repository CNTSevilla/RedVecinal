import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { createAlerta } from '../lib/api'
import { createFingerprint } from '../lib/fingerprint'
import type { CreateAlertaInput } from '../lib/api'

interface Props {
  latlng: { lat: number; lng: number }
  onClose: () => void
  onCreated: () => void
}

const severities = [
  { key: 'sospechoso', color: '#FFC107' },
  { key: 'tension', color: '#FF9800' },
  { key: 'agresion_verbal', color: '#FF5722' },
  { key: 'riesgo_fisico', color: '#E53935' },
  { key: 'emergencia', color: '#B71C1C' },
] as const

const durations = ['min15', 'hour1', 'hours6', 'hours24'] as const

export default function CreateAlertModal({ latlng, onClose, onCreated }: Props) {
  const { t } = useTranslation()
  const [severity, setSeverity] = useState('tension')
  const [description, setDescription] = useState('')
  const [numPeople, setNumPeople] = useState('')
  const [direction, setDirection] = useState('')
  const [appearance, setAppearance] = useState('')
  const [duration, setDuration] = useState('hour1')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    const fp = await createFingerprint()

    const input: CreateAlertaInput = {
      lat: latlng.lat,
      lng: latlng.lng,
      severity,
      description,
      num_people: numPeople ? parseInt(numPeople) : null,
      direction,
      appearance,
      duration,
      fingerprint_hash: fp,
    }

    const result = await createAlerta(input)
    setSubmitting(false)

    if (result) {
      onCreated()
      onClose()
    }
  }

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 10000,
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'center',
        background: 'rgba(0,0,0,0.6)',
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '480px',
          maxHeight: '85vh',
          background: 'var(--bg-secondary)',
          borderRadius: '16px 16px 0 0',
          borderTop: '1px solid var(--border)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          animation: 'slideUp 0.2s ease-out',
        }}
      >
        <style>{`
          @keyframes slideUp {
            from { transform: translateY(100%); }
            to { transform: translateY(0); }
          }
        `}</style>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '12px 16px',
            borderBottom: '1px solid var(--border)',
            flexShrink: 0,
          }}
        >
          <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--red-primary)', margin: 0 }}>
            {t('alerta.create')}
          </h2>
          <button
            onClick={onClose}
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              background: 'var(--bg-tertiary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 18,
              color: 'var(--text-secondary)',
            }}
          >
            ✕
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          style={{
            padding: '16px',
            overflow: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
          }}
        >
          <div>
            <label style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: 6, display: 'block' }}>
              {t('alerta.severity')}
            </label>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {severities.map((s) => (
                <button
                  key={s.key}
                  type="button"
                  onClick={() => setSeverity(s.key)}
                  style={{
                    padding: '8px 14px',
                    borderRadius: 20,
                    fontSize: 13,
                    fontWeight: 600,
                    border: `2px solid ${severity === s.key ? s.color : 'transparent'}`,
                    background: severity === s.key ? s.color + '22' : 'var(--bg-tertiary)',
                    color: severity === s.key ? s.color : 'var(--text-secondary)',
                    transition: 'all 0.15s',
                  }}
                >
                  {t(`alerta.${s.key}`)}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: 6, display: 'block' }}>
              {t('alerta.description')}
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t('alerta.description_placeholder')}
              rows={3}
              style={{ width: '100%' }}
            />
          </div>

          <div style={{ display: 'flex', gap: 12 }}>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: 6, display: 'block' }}>
                {t('alerta.num_people')}
              </label>
              <input
                type="number"
                min="1"
                value={numPeople}
                onChange={(e) => setNumPeople(e.target.value)}
                placeholder={t('alerta.num_people_placeholder')}
                style={{ width: '100%' }}
              />
            </div>
            <div style={{ flex: 2 }}>
              <label style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: 6, display: 'block' }}>
                {t('alerta.direction')}
              </label>
              <input
                value={direction}
                onChange={(e) => setDirection(e.target.value)}
                placeholder={t('alerta.direction_placeholder')}
                style={{ width: '100%' }}
              />
            </div>
          </div>

          <div>
            <label style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: 6, display: 'block' }}>
              {t('alerta.appearance')}
            </label>
            <input
              value={appearance}
              onChange={(e) => setAppearance(e.target.value)}
              placeholder={t('alerta.appearance_placeholder')}
              style={{ width: '100%' }}
            />
          </div>

          <div>
            <label style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: 6, display: 'block' }}>
              {t('alerta.duration')}
            </label>
            <div style={{ display: 'flex', gap: 6 }}>
              {durations.map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setDuration(d)}
                  style={{
                    flex: 1,
                    padding: '8px 0',
                    borderRadius: 8,
                    fontSize: 12,
                    fontWeight: 600,
                    border: `2px solid ${duration === d ? 'var(--red-primary)' : 'transparent'}`,
                    background: duration === d ? 'var(--red-primary)' : 'var(--bg-tertiary)',
                    color: duration === d ? '#fff' : 'var(--text-secondary)',
                    transition: 'all 0.15s',
                  }}
                >
                  {t(`alerta.${d}`)}
                </button>
              ))}
            </div>
          </div>

          <div
            style={{
              fontSize: '12px',
              color: 'var(--text-muted)',
              padding: '8px 10px',
              background: 'var(--bg-tertiary)',
              borderRadius: 8,
              borderLeft: '3px solid var(--warning)',
              marginTop: 4,
            }}
          >
            {t('alerta.no_doxxing')}
          </div>

          <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              style={{
                flex: 1,
                padding: '14px 0',
                borderRadius: 10,
                fontSize: 15,
                fontWeight: 600,
                background: 'var(--bg-tertiary)',
                color: 'var(--text-secondary)',
                opacity: submitting ? 0.5 : 1,
              }}
            >
              {t('alerta.cancel')}
            </button>
            <button
              type="submit"
              disabled={submitting}
              style={{
                flex: 1,
                padding: '14px 0',
                borderRadius: 10,
                fontSize: 15,
                fontWeight: 700,
                background: submitting ? 'var(--red-dark)' : 'var(--red-primary)',
                color: '#fff',
                opacity: submitting ? 0.7 : 1,
              }}
            >
              {submitting ? '...' : t('alerta.submit')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
