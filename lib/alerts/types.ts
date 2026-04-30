export type Severity = 'critical' | 'urgent' | 'advisory' | 'opportunity'
export type AlertType = 'weather' | 'fire' | 'road' | 'crime' | 'transit' | 'air'
export type Source = 'msc-cap' | 'msc-aqhi' | '511on' | 'tfs' | 'tps' | 'ttc'

export type GeoPoint = { lat: number, lng: number }

export type Alert = {
  id: string
  source: Source
  type: AlertType
  severity: Severity
  title: string
  description: string
  location: GeoPoint
  radiusMeters?: number
  startsAt: string
  endsAt?: string
  raw: unknown
}

export type LLMSuggestion = {
  alertId: string
  priority: Severity
  headline: string
  actions: { label: string, urgency: 'now' | 'today' | 'this_week' }[]
  reasoning: string
}
