/**
 * pointInPolygon: comprueba si un punto está dentro de un polígono (ray casting).
 * isInsideSpain: check multil polígono contra el GeoJSON de España.
 * haversine: distancia entre dos coordenadas en km (fórmula de Haversine).
 */
export function pointInPolygon([px, py]: number[], ring: number[][]): boolean {
  let inside = false
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [xi, yi] = ring[i]
    const [xj, yj] = ring[j]
    if ((yi > py) !== (yj > py) && px < ((xj - xi) * (py - yi)) / (yj - yi) + xi) {
      inside = !inside
    }
  }
  return inside
}

export function isInsideSpain(lng: number, lat: number, polygons: number[][][]): boolean {
  return polygons.some((ring) => pointInPolygon([lng, lat], ring))
}

export function haversine(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371
  const toRad = (d: number) => d * Math.PI / 180
  const dLat = toRad(lat2 - lat1)
  const dLng = toRad(lng2 - lng1)
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}
