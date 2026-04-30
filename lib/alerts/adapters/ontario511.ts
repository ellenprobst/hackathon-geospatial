import { Alert, Severity } from '../types'

type Raw511Event = {
  ID: string
  EventType: 'incident' | 'construction' | 'closure'
  RoadwayName: string
  Description: string
  Latitude: number
  Longitude: number
  StartDate: string
  PlannedEndDate?: string
  Severity?: 'Minor' | 'Moderate' | 'Major' | 'Severe'
}

const sevMap: Record<string, Severity> = {
  Severe: 'critical',
  Major: 'urgent',
  Moderate: 'advisory',
  Minor: 'advisory',
}

export const toAlerts = (events: Raw511Event[]): Alert[] =>
  events.map(e => ({
    id: `511on:${e.ID}`,
    source: '511on',
    type: 'road',
    severity: sevMap[e.Severity ?? 'Minor'] ?? 'advisory',
    title: `${e.EventType}: ${e.RoadwayName}`,
    description: e.Description,
    location: { lat: e.Latitude, lng: e.Longitude },
    startsAt: e.StartDate,
    endsAt: e.PlannedEndDate,
    raw: e,
  }))
