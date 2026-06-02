/**
 * Página principal.
 * Renderiza el mapa Leaflet (MapView) y, cuando se hace clic en el mapa,
 * muestra el modal de creación de alerta (CreateAlertModal).
 * refreshKeyRef fuerza el re-montado de MapView cuando se crea una alerta.
 */
import { useState, useCallback, useRef } from 'react'
import MapView from '../components/MapView'
import CreateAlertModal from '../components/CreateAlertModal'

export default function HomePage() {
  const [modalLatLng, setModalLatLng] = useState<{ lat: number; lng: number } | null>(null)
  const refreshKeyRef = useRef(0)
  const [, setRefreshKey] = useState(0)

  const handleCreated = useCallback(() => {
    setRefreshKey((k) => k + 1)
    refreshKeyRef.current++
  }, [])

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: 'var(--bg-primary)' }}>
      <div style={{ position: 'relative', flex: 1, margin: '8px', borderRadius: '12px', overflow: 'hidden' }}>
        <MapView key={refreshKeyRef.current} onLocationClick={(ll) => setModalLatLng(ll)} />
      </div>
      {modalLatLng && (
        <CreateAlertModal
          latlng={modalLatLng}
          onClose={() => setModalLatLng(null)}
          onCreated={handleCreated}
        />
      )}
    </div>
  )
}
