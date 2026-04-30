import { Alert, Severity } from '../types'

type AqhiFeature = {
  id: string
  geometry: { type: 'Point', coordinates: [number, number] }
  properties: {
    aqhi: number
    forecast_datetime: string
    location_name_en: string
  }
}
type AqhiCollection = { features: AqhiFeature[] }

const aqhiSeverity = (aqhi: number): Severity => {
  if (aqhi >= 10) return 'critical'
  if (aqhi >= 7) return 'urgent'
  if (aqhi >= 4) return 'advisory'
  return 'opportunity'
}

export const toAlerts = (c: AqhiCollection): Alert[] =>
  c.features
    // skip readings <4 (good air) so the map isn't flooded with no-op pins
    .filter(f => f.properties.aqhi >= 4)
    .map(f => ({
      id: `msc-aqhi:${f.id}`,
      source: 'msc-aqhi',
      type: 'air',
      severity: aqhiSeverity(f.properties.aqhi),
      title: `AQHI ${f.properties.aqhi} at ${f.properties.location_name_en}`,
      description: `Air Quality Health Index ${f.properties.aqhi} at ${f.properties.location_name_en}.`,
      location: { lat: f.geometry.coordinates[1], lng: f.geometry.coordinates[0] },
      startsAt: f.properties.forecast_datetime,
      raw: f,
    }))
