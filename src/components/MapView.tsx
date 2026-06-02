/**
 * Componente principal del mapa Leaflet.
 * - Renderiza mapa centrado en España con límites geográficos
 * - Marcadores de alertas con clusterización (MarkerCluster)
 * - Ubicación del usuario (círculo azul con pulso)
 * - Popups con info de alerta + botón Voy (asistir)
 * - Persistencia de vista (centro + zoom) en localStorage
 * - Sidebar de alertas cercanas (10 km)
 * - Polling cada 30 segundos
 *
 * Severidades: sospechoso → emergencia (amarillo → rojo oscuro)
 */
import { useEffect, useRef, useCallback, useState, useMemo } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import 'leaflet.markercluster/dist/MarkerCluster.css'
import 'leaflet.markercluster/dist/MarkerCluster.Default.css'
import 'leaflet.markercluster'
import { useTranslation } from 'react-i18next'
import { isInsideSpain, haversine } from '../lib/geo'
import { fetchAlertas, assistAlerta, unassistAlerta, fetchCurrentAssist } from '../lib/api'
import { createFingerprint as genFp } from '../lib/fingerprint'
import type { Alerta } from '../lib/api'
import spainData from '../lib/spain.json'
import NearbyAlertsSidebar from './NearbyAlertsSidebar'

const severityColors: Record<string, string> = {
  sospechoso: '#FFC107',
  tension: '#FF9800',
  agresion_verbal: '#FF5722',
  riesgo_fisico: '#E53935',
  emergencia: '#B71C1C',
}

function iconSvg(d: string) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">${d}</svg>`
  return `data:image/svg+xml;base64,${btoa(svg)}`
}

const LOCATE_PATH = '<circle cx="12" cy="12" r="3"/><path d="M12 2v4m0 12v4m10-10h-4M6 12H2"/>'
const FS_IN = '<path d="M8 3v5H3m13-5v5h5M3 16v5h5m13-5v5h-5"/>'
const FS_OUT = '<path d="M8 3H3v5m13-5h5v5M3 16v5h5m13-5v5h-5"/>'

function formatExpiry(iso: string, t: (k: string, o?: Record<string, unknown>) => string): string {
  const exp = new Date(iso)
  const now = new Date()
  const diff = Math.round((exp.getTime() - now.getTime()) / 60000)
  if (diff <= 0) return t('map.expired')
  if (diff < 60) return t('map.expires_in_min', { count: diff })
  const h = Math.floor(diff / 60)
  const m = diff % 60
  return t('map.expires_in_hours', { hours: h, minutes: m })
}

function formatPublished(iso: string, t: (k: string, o?: Record<string, unknown>) => string): string {
  const created = new Date(iso)
  const now = new Date()
  const diff = Math.round((now.getTime() - created.getTime()) / 60000)
  if (diff < 1) return t('map.just_now')
  if (diff < 60) return t('map.published_ago_min', { count: diff })
  const h = Math.floor(diff / 60)
  const m = diff % 60
  return t('map.published_ago_hours', { hours: h, minutes: m })
}

interface Props {
  onLocationClick: (latlng: { lat: number; lng: number }) => void
}

export default function MapView({ onLocationClick }: Props) {
  const { t } = useTranslation()
  const mapRef = useRef<L.Map | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const userMarkerRef = useRef<L.CircleMarker | null>(null)
  const userPulseRef = useRef<L.CircleMarker | null>(null)
  const polygonsRef = useRef<number[][][]>([])
  const clusterRef = useRef<L.MarkerClusterGroup | null>(null)
  const fpRef = useRef('')
  const userAssistRef = useRef<string | null>(null)
  const [allAlertas, setAllAlertas] = useState<Alerta[]>([])
  const [userPosition, setUserPosition] = useState<{ lat: number; lng: number } | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const handleMapClick = useCallback((e: L.LeafletMouseEvent) => {
    if (polygonsRef.current.length === 0) return
    if (isInsideSpain(e.latlng.lng, e.latlng.lat, polygonsRef.current)) {
      onLocationClick({ lat: e.latlng.lat, lng: e.latlng.lng })
    }
  }, [onLocationClick])

  const fmtPopup = (a: Alerta, severityColor: string, severityLabel: string) => {
    const isAssisting = userAssistRef.current === a.id
    const blocked = userAssistRef.current !== null && userAssistRef.current !== a.id

    const voy = t('asistir.voy')
    const asistiendo = t('asistir.asistiendo')
    let btnHtml
    if (isAssisting) {
      btnHtml = `<button class="rv-btn-assist rv-btn-active" data-id="${a.id}" data-fp="${fpRef.current}">✊ ${asistiendo}</button>`
    } else if (blocked) {
      btnHtml = `<button class="rv-btn-assist rv-btn-blocked" data-id="${a.id}" data-fp="${fpRef.current}" disabled>🔒 ${voy}</button>`
    } else {
      btnHtml = `<button class="rv-btn-assist" data-id="${a.id}" data-fp="${fpRef.current}">✊ ${voy}</button>`
    }

    return `
      <div class="rv-popup">
        <div class="rv-popup-title" style="color:${severityColor}">● ${severityLabel}</div>
        ${a.description ? `<div class="rv-popup-desc">${a.description}</div>` : ''}
        ${a.num_people ? `<div class="rv-popup-row">👥 <span>${a.num_people} ${t('alerta.people_abbr')}</span></div>` : ''}
        ${a.direction ? `<div class="rv-popup-row">🚶 <span>${a.direction}</span></div>` : ''}
        ${a.appearance ? `<div class="rv-popup-row">👕 <span>${a.appearance}</span></div>` : ''}
        <div class="rv-popup-row rv-popup-time">📅 <span>${formatPublished(a.created_at, t)}</span></div>
        <div class="rv-popup-row rv-popup-time">🕐 <span>${formatExpiry(a.expires_at, t)}</span></div>
        <div class="rv-popup-assist">
          ${btnHtml}
          <span class="rv-count" id="count-${a.id}">${a.assists_count}</span>
          <span class="rv-count-label">${t('asistir.people')}</span>
        </div>
      </div>
    `
  }

  const loadAlertas = useCallback(async () => {
    if (!clusterRef.current || !fpRef.current) return
    const alertas = await fetchAlertas()
    setAllAlertas(alertas)
    clusterRef.current.clearLayers()

    alertas.forEach((a: Alerta) => {
      const color = severityColors[a.severity] || '#E53935'
      const label = t(`alerta.${a.severity}`)

      const marker = L.circleMarker([a.lat, a.lng], {
        radius: 10,
        fillColor: color,
        color: '#fff',
        weight: 2,
        opacity: 1,
        fillOpacity: 0.85,
      })

      marker.bindPopup(() => fmtPopup(a, color, label), {
        className: '',
        closeButton: true,
      })

      marker.on('popupopen', () => {
        setTimeout(() => {
          document.querySelectorAll('.rv-btn-assist').forEach((btn) => {
            btn.removeEventListener('click', handleAssistClick)
            btn.addEventListener('click', handleAssistClick)
          })
        }, 50)
      })

      clusterRef.current!.addLayer(marker)
    })
  }, [t])

  const NEARBY_RADIUS_KM = 10

  const nearbyAlertas = useMemo(() => {
    if (!userPosition) return []
    return allAlertas
      .map((a) => ({ ...a, distance: haversine(userPosition.lat, userPosition.lng, a.lat, a.lng) }))
      .filter((a) => a.distance <= NEARBY_RADIUS_KM)
  }, [allAlertas, userPosition])

  const handleAlertClick = useCallback((lat: number, lng: number) => {
    const map = mapRef.current
    if (!map) return
    map.flyTo([lat, lng], 15, { duration: 1 })
    setSidebarOpen(false)
  }, [])

  const handleAssistClick = async (e: Event) => {
    const btn = e.currentTarget as HTMLButtonElement
    const alertId = btn.dataset.id!
    const fingerprintHash = btn.dataset.fp!
    btn.disabled = true

    const voy = t('asistir.voy')
    const asistiendo = t('asistir.asistiendo')

    if (userAssistRef.current === alertId) {
      btn.textContent = '...'
      const ok = await unassistAlerta(alertId, fingerprintHash)
      if (ok) {
        userAssistRef.current = null
        btn.textContent = `✊ ${voy}`
        btn.disabled = false
        btn.classList.remove('rv-btn-active')
        const countEl = document.getElementById(`count-${alertId}`)
        if (countEl) countEl.textContent = String(Math.max(0, parseInt(countEl.textContent || '1') - 1))
        syncPopupButtons()
      } else {
        btn.textContent = `✊ ${asistiendo}`
        btn.disabled = false
      }
      return
    }

    btn.textContent = '...'
    const ok = await assistAlerta(alertId, fingerprintHash)
    if (ok) {
      userAssistRef.current = alertId
      btn.textContent = `✊ ${asistiendo}`
      btn.classList.add('rv-btn-active')
      const countEl = document.getElementById(`count-${alertId}`)
      if (countEl) countEl.textContent = String(parseInt(countEl.textContent || '0') + 1)
      syncPopupButtons()
    } else {
      const current = await fetchCurrentAssist(fingerprintHash)
      userAssistRef.current = current
      if (current === alertId) {
        btn.textContent = `✊ ${asistiendo}`
        btn.classList.add('rv-btn-active')
        syncPopupButtons()
      } else {
        btn.textContent = `✊ ${voy}`
        btn.disabled = false
      }
    }
  }

  function syncPopupButtons() {
    const voy = t('asistir.voy')
    const asistiendo = t('asistir.asistiendo')
    document.querySelectorAll('.leaflet-popup-content .rv-popup-assist').forEach((el) => {
      const btn = el.querySelector('.rv-btn-assist') as HTMLButtonElement | null
      if (!btn) return
      const aid = btn.dataset.id
      if (!aid) return
      const isAssisting = userAssistRef.current === aid
      const blocked = userAssistRef.current !== null && userAssistRef.current !== aid
      if (isAssisting) {
        btn.textContent = `✊ ${asistiendo}`
        btn.disabled = false
        btn.classList.remove('rv-btn-blocked')
        btn.classList.add('rv-btn-active')
      } else if (blocked) {
        btn.textContent = `🔒 ${voy}`
        btn.disabled = true
        btn.classList.remove('rv-btn-active')
        btn.classList.add('rv-btn-blocked')
      } else {
        btn.textContent = `✊ ${voy}`
        btn.disabled = false
        btn.classList.remove('rv-btn-active', 'rv-btn-blocked')
      }
    })
  }

  useEffect(() => {
    if (mapRef.current || !containerRef.current) return

    genFp().then(async (fpH) => {
      fpRef.current = fpH
      const assist = await fetchCurrentAssist(fpH)
      userAssistRef.current = assist
      loadAlertas()
    })

    let savedView: { lat: number; lng: number; zoom: number } | null = null
    try {
      const raw = localStorage.getItem('mapView')
      if (raw) savedView = JSON.parse(raw)
    } catch {}

    const map = L.map(containerRef.current, {
      center: savedView ? [savedView.lat, savedView.lng] : [40.4168, -3.7038],
      zoom: savedView ? savedView.zoom : 6,
      minZoom: 5,
      maxZoom: 19,
      zoomControl: false,
      doubleClickZoom: true,
      maxBounds: [[27.0, -19.5], [44.5, 5.0]],
      maxBoundsViscosity: 0.8,
    })

    L.control.zoom({ position: 'bottomright' }).addTo(map)

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: 'OSM',
    }).addTo(map)

    L.control.scale({ position: 'bottomleft', metric: true, imperial: false }).addTo(map)

    const btnStyle = 'width:44px;height:44px;background:#1a1a1a;border:1px solid #333;border-radius:8px;cursor:pointer;display:flex;align-items:center;justify-content:center;margin-top:8px;color:#fff'

    const LocateControl = L.Control.extend({
      onAdd() {
        const btn = L.DomUtil.create('button')
        btn.innerHTML = `<img src="${iconSvg(LOCATE_PATH)}" width="22" height="22" alt="${t('map.locate')}" />`
        btn.style.cssText = btnStyle
        btn.onmouseenter = () => { btn.style.background = '#252525' }
        btn.onmouseleave = () => { btn.style.background = '#1a1a1a' }
        L.DomEvent.on(btn, 'click', () => { map.locate({ setView: true, maxZoom: 16 }) })
        return btn
      },
    })
    map.addControl(new LocateControl({ position: 'bottomright' }))

    const FullscreenControl = L.Control.extend({
      onAdd() {
        const btn = L.DomUtil.create('button')
        btn.innerHTML = `<img src="${iconSvg(FS_OUT)}" width="22" height="22" alt="${t('map.fullscreen')}" />`
        btn.style.cssText = btnStyle
        btn.onmouseenter = () => { btn.style.background = '#252525' }
        btn.onmouseleave = () => { btn.style.background = '#1a1a1a' }
        L.DomEvent.on(btn, 'click', () => {
          const isFs = !document.fullscreenElement
          if (isFs) document.documentElement.requestFullscreen()
          else document.exitFullscreen()
          btn.innerHTML = `<img src="${iconSvg(isFs ? FS_IN : FS_OUT)}" width="22" height="22" alt="${t('map.fullscreen')}" />`
          setTimeout(() => map.invalidateSize(), 300)
        })
        return btn
      },
    })
    map.addControl(new FullscreenControl({ position: 'bottomright' }))

    const rings: number[][][] = []
    const extract = (geom: any) => {
      if (geom.type === 'Polygon') rings.push(geom.coordinates[0])
      else if (geom.type === 'MultiPolygon') geom.coordinates.forEach((poly: any) => rings.push(poly[0]))
    }
    if (spainData.type === 'FeatureCollection') {
      (spainData as any).features.forEach((f: any) => extract(f.geometry))
    } else {
      extract((spainData as any).geometry || spainData)
    }
    polygonsRef.current = rings

    L.geoJSON(spainData as any, {
      style: { color: '#E53935', weight: 2, opacity: 0.6, fill: false },
    }).addTo(map)

    clusterRef.current = L.markerClusterGroup({
      chunkedLoading: true,
      maxClusterRadius: 50,
      spiderfyOnMaxZoom: true,
      showCoverageOnHover: false,
      iconCreateFunction: (cluster) => {
        const count = cluster.getChildCount()
        const color = count > 5 ? '#E53935' : count > 2 ? '#FF9800' : '#FFC107'
        return L.divIcon({
          html: `<div style="background:${color};color:#fff;width:40px;height:40px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:14px;border:3px solid #fff;box-shadow:0 2px 8px rgba(0,0,0,0.3)">${count}</div>`,
          className: '',
          iconSize: L.point(40, 40),
        })
      },
    })
    map.addLayer(clusterRef.current)

    mapRef.current = map

    map.locate({ setView: false, watch: false })

    map.on('locationfound', (e) => {
      const { lat, lng } = e.latlng
      setUserPosition({ lat, lng })
      if (userPulseRef.current) {
        userPulseRef.current.setLatLng([lat, lng])
      } else {
        userPulseRef.current = L.circleMarker([lat, lng], {
          radius: 14, fillColor: '#42A5F5', color: '#42A5F5', weight: 2, opacity: 0.3, fillOpacity: 0.2,
          className: 'user-location-pulse',
        }).addTo(map)
      }
      if (userMarkerRef.current) {
        userMarkerRef.current.setLatLng([lat, lng])
      } else {
        userMarkerRef.current = L.circleMarker([lat, lng], {
          radius: 7, fillColor: '#42A5F5', color: '#fff', weight: 3, opacity: 1, fillOpacity: 1,
        })
          .addTo(map)
          .bindPopup(
            `<div class="rv-popup">
              <div class="rv-popup-title" style="color:#42A5F5">📍 ${t('map.your_location')}</div>
              <div class="rv-popup-privacy">🔒 ${t('map.location_privacy')}</div>
            </div>`,
            { closeButton: true, className: '' }
          )
      }
    })

    map.on('locationerror', () => {
      setUserPosition(null)
    })

    map.on('click', handleMapClick)

    map.on('moveend', () => {
      const c = map.getCenter()
      localStorage.setItem('mapView', JSON.stringify({ lat: c.lat, lng: c.lng, zoom: map.getZoom() }))
    })

    const ro = new ResizeObserver(() => { map.invalidateSize() })
    ro.observe(containerRef.current)

    return () => {
      ro.disconnect()
      map.off('click', handleMapClick)
      map.remove()
      mapRef.current = null
      userMarkerRef.current = null
      userPulseRef.current = null
    }
  }, [t, handleMapClick])

  useEffect(() => {
    if (!clusterRef.current) return
    loadAlertas()
    const interval = setInterval(loadAlertas, 30_000)
    return () => clearInterval(interval)
  }, [loadAlertas])

  const toggleIconSvg = '<path d="M3 6h18M3 12h18M3 18h18"/>'

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <div
        ref={containerRef}
        style={{ width: '100%', height: '100%', borderRadius: '12px', overflow: 'hidden' }}
      />
      {userPosition && (
        <button
          className={`rv-sidebar-toggle ${sidebarOpen ? 'rv-sidebar-toggle--active' : ''}`}
          onClick={() => setSidebarOpen((v) => !v)}
          aria-label={t('sidebar.nearby')}
        >
          <img src={iconSvg(toggleIconSvg)} width="22" height="22" alt={t('sidebar.nearby')} />
        </button>
      )}
      <NearbyAlertsSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        alertas={nearbyAlertas}
        onAlertClick={handleAlertClick}
      />
    </div>
  )
}
