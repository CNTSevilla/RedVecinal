/**
 * Sidebar de alertas cercanas (radio 10 km).
 * Muestra tarjetas ordenadas por fecha descendente con:
 * - Barra de color según severidad
 * - Tipo, descripción, tiempo transcurrido, distancia, asistencias
 * Al hacer clic en una tarjeta, el mapa vuela a la ubicación de la alerta.
 */
import { useTranslation } from 'react-i18next'
import type { Alerta } from '../lib/api'

const severityColors: Record<string, string> = {
  sospechoso: '#FFC107',
  tension: '#FF9800',
  agresion_verbal: '#FF5722',
  riesgo_fisico: '#E53935',
  emergencia: '#B71C1C',
}

function ago(iso: string, t: (k: string, o?: Record<string, unknown>) => string): string {
  const diff = Math.round((Date.now() - new Date(iso).getTime()) / 60000)
  if (diff < 1) return t('sidebar.just_now')
  if (diff < 60) return t('sidebar.ago_min', { count: diff })
  const h = Math.floor(diff / 60)
  return t('sidebar.ago_hours', { hours: h, minutes: diff % 60 })
}

function distStr(km: number, t: (k: string, o?: Record<string, unknown>) => string): string {
  if (km < 1) return t('sidebar.distance_m', { count: Math.round(km * 1000) })
  return t('sidebar.distance_km', { distance: km.toFixed(1) })
}

interface AlertCard extends Alerta {
  distance: number
}

interface Props {
  isOpen: boolean
  onClose: () => void
  alertas: AlertCard[]
  onAlertClick: (lat: number, lng: number) => void
}

export default function NearbyAlertsSidebar({ isOpen, onClose, alertas, onAlertClick }: Props) {
  const { t } = useTranslation()

  const sorted = [...alertas].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  )

  return (
    <>
      <div className={`rv-sidebar-overlay ${isOpen ? 'rv-sidebar-overlay--visible' : ''}`} onClick={onClose} />
      <aside className={`rv-sidebar ${isOpen ? 'rv-sidebar--open' : ''}`}>
        <div className="rv-sidebar-header">
          <h2 className="rv-sidebar-title">{t('sidebar.nearby')}</h2>
          <span className="rv-sidebar-count">{alertas.length}</span>
          <button className="rv-sidebar-close" onClick={onClose} aria-label={t('sidebar.close')}>&times;</button>
        </div>
        <div className="rv-sidebar-body">
          {sorted.length === 0 ? (
            <p className="rv-sidebar-empty">{t('sidebar.empty')}</p>
          ) : (
            sorted.map((a) => (
              <button key={a.id} className="rv-card" onClick={() => onAlertClick(a.lat, a.lng)}>
                <div className="rv-card-bar" style={{ background: severityColors[a.severity] || '#E53935' }} />
                <div className="rv-card-body">
                  <div className="rv-card-severity" style={{ color: severityColors[a.severity] || '#E53935' }}>
                    ● {t(`alerta.${a.severity}`)}
                  </div>
                  {a.description && <div className="rv-card-desc">{a.description}</div>}
                  <div className="rv-card-meta">
                    <span>📅 {ago(a.created_at, t)}</span>
                    <span>📍 {distStr(a.distance, t)}</span>
                    <span>✊ {a.assists_count}</span>
                  </div>
                </div>
              </button>
            ))
          )}
        </div>
      </aside>
    </>
  )
}
