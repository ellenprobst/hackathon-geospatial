export type Priority = 'CRITICAL' | 'URGENT' | 'ADVISORY' | 'OPPORTUNITY';

export interface AlertEvent {
  id: string;
  priority: Priority;
  event: string;
  action: string;
  plain: string;
  lat: number;
  lng: number;
  radiusM: number;
  area: string;
  time: string;
  ttl: string;
  source: string;
  conf: number;
  resolved?: boolean;
}

export interface UserLocation {
  id: string;
  name: string;
  address: string;
  kind: string;
  priorities: Priority[];
  notifs: string[];
  radiusKm: number;
  lat: number;
  lng: number;
}

export interface LayerVisibility {
  CRITICAL: boolean;
  URGENT: boolean;
  ADVISORY: boolean;
  OPPORTUNITY: boolean;
}

export interface DraftPin {
  lat: number;
  lng: number;
  radiusKm: number;
}
