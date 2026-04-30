'use client';

import { useState, useEffect } from 'react';
import type { AlertEvent, UserLocation, Priority } from '../types';
import { Icon } from './Icon';

const PRIORITY_CLASS: Record<string, string> = {
  CRITICAL: 'crit', URGENT: 'urg', ADVISORY: 'adv', OPPORTUNITY: 'opp',
};

const KIND_OPTIONS = [
  { k: 'home', label: 'HOME', icon: 'home' },
  { k: 'condo', label: 'CONDO', icon: 'condo' },
  { k: 'office', label: 'OFFICE', icon: 'office' },
  { k: 'school', label: 'SCHOOL', icon: 'school' },
  { k: 'cottage', label: 'COTTAGE', icon: 'cottage' },
];

type RecoTier = { immediate: string[]; hour: string[]; before: string[]; optional: string[] };

// Weather & opportunity events — keyed by priority then persona
const WEATHER_RECO: Record<Priority, Record<string, RecoTier>> = {
  CRITICAL: {
    home:    { immediate: ['Close & lock all windows; bring kids/pets indoors.', 'Move car off the street if branches/flooding likely.'], hour: ['Charge phones + power banks now.', 'Fill bathtub if power loss is possible.'], before: ['Move valuables off basement floor.', 'Photograph property for insurance.'], optional: ['Check on elderly neighbours.'] },
    condo:   { immediate: ['Close balcony doors; stow loose planters & furniture.', 'Stay away from floor-to-ceiling windows.'], hour: ['Charge devices; locate stairwell exit.', 'Fill water bottles in case pumps fail.'], before: ['Unplug non-essential electronics.'], optional: ['Notify your concierge.'] },
    office:  { immediate: ['Move staff away from glass façade.', 'Lock down loose rooftop or balcony items.'], hour: ['Back up local work to cloud.', 'Identify a shelter-in-place spot.'], before: ['Brief team on early-dismissal trigger.'], optional: ['Coordinate with building security.'] },
    school:  { immediate: ['Move students to interior rooms; away from windows.', 'Account for everyone — head count.'], hour: ['Hold dismissal until guidance updates.', 'Prepare emergency comms to parents.'], before: ['Brief after-school staff.'], optional: ['Coordinate with TDSB safety line.'] },
    cottage: { immediate: ['Secure dock lines; pull boat covers.', 'Bring in patio furniture, kayaks, BBQ propane.'], hour: ['Top up generator fuel.', 'Stage flashlights + radio.'], before: ['Photograph shoreline + structures.'], optional: ['Check on neighbours up the road.'] },
  },
  URGENT: {
    home:    { immediate: ['Cover frost-sensitive plants or bring them inside.', 'Disconnect outdoor hoses before the freeze.'], hour: ['Wrap exposed pipes in unheated spaces.', 'Move basement boxes off the floor if flooding is possible.'], before: ['Drip cold-water taps overnight if deep freeze expected.'], optional: ['Stock up on de-icer for walkways.'] },
    condo:   { immediate: ['Bring in balcony plants; check balcony drains.', 'Close windows before the temperature drops.'], hour: ['Charge devices.', 'Stage towels near exterior doors in case of drafts.'], before: ['Plan an alternate commute if ice is forecast.'], optional: ['Notify concierge if balcony drain is blocked.'] },
    office:  { immediate: ['Alert staff to icy conditions for the morning commute.', 'Check building entrance for ice hazards.'], hour: ['Re-time early meetings to account for delays.'], before: ['Forward office line to mobile in case of closures.'], optional: ['Order team breakfast in to avoid early travel.'] },
    school:  { immediate: ['Monitor Environment Canada for school-closure thresholds.', 'Alert bus coordinator to morning road conditions.'], hour: ['Brief reception about late arrivals.'], before: ['Pre-stage sand/salt at all entrances.'], optional: ['Push a weather advisory to the school app.'] },
    cottage: { immediate: ['Pull dockside chairs & cushions.', 'Cover the firewood pile and propane tanks.'], hour: ['Run a generator check.'], before: ['Clean out the eavestroughs before freeze.'], optional: ['Top up groceries from the marina.'] },
  },
  ADVISORY: {
    home:    { immediate: ['Cover tender plants tonight; bring potted ones inside.', 'Disconnect any remaining outdoor hoses.'], hour: ['Limit late outdoor activity if temperature is near zero.'], before: ['Set a reminder to check pipes in the morning.'], optional: ["Ensure pets have warm shelter overnight."] },
    condo:   { immediate: ['Bring balcony plants inside.', 'Close exterior-facing windows before bed.'], hour: ['Check weather app for overnight low.'], before: ['Run air purifier if dry air is a concern.'], optional: ['Keep a light layer accessible for the morning.'] },
    office:  { immediate: ['Flag frost advisory in team chat for early commuters.', 'Reschedule outdoor client meetings if needed.'], hour: ['Check parking lot and building entrance for ice risk.'], before: ['Confirm any remote-work flex for tomorrow morning.'], optional: ['Send a brief weather note to the team.'] },
    school:  { immediate: ['Notify families via school app about frost advisory.', 'Move morning outdoor supervision inside if near-zero.'], hour: ['Brief before-care staff.'], before: ['Salt all entrance walkways before 7 AM.'], optional: ['Update the school website.'] },
    cottage: { immediate: ['Cover the garden beds; bring in tender potted plants.', 'Close screens on the north-facing side.'], hour: ['Verify heating is set properly overnight.'], before: ['Stage extra blankets in guest rooms.'], optional: ['Check on neighbouring properties if you know them.'] },
  },
  OPPORTUNITY: {
    home:    { immediate: ['Water plants deeply this morning.', 'Pull weeds while soil is loose.'], hour: ['Direct-sow tomatoes / peppers / basil.'], before: ['Apply slow-release fertilizer.'], optional: ['Photograph the garden for tracking.'] },
    condo:   { immediate: ['Water balcony pots — they dry first.', 'Re-pot anything root-bound.'], hour: ['Move heat-lovers into direct sun.'], before: ['Clean balcony drains.'], optional: ['Snip herbs to encourage growth.'] },
    office:  { immediate: ['Open windows briefly for air exchange.'], hour: ['Walking 1:1s outdoors.'], before: ['Schedule team patio social.'], optional: ['Photograph the courtyard.'] },
    school:  { immediate: ['Outdoor classroom / nature walk window.', 'Garden club planting session.'], hour: ['Schedule recess outdoors.'], before: ['Plan the field-day rain alternative if weather shifts.'], optional: ['Capture photos for the newsletter.'] },
    cottage: { immediate: ['Best window to plant or transplant.', 'Shock the pool / open the dock.'], hour: ['Trim shoreline branches.', 'Stain the deck.'], before: ['Set out the rain barrels.'], optional: ['Star-gaze tonight.'] },
  },
};

// Non-weather events — keyed by event category then persona
type EventCategory = 'fire' | 'police' | 'road' | 'transit';

const SOURCE_CATEGORY: Record<string, EventCategory> = {
  'Toronto Fire': 'fire',
  'Toronto Police': 'police',
  '511 Ontario': 'road',
  'TTC Service Alerts': 'transit',
};

const EVENT_RECO: Record<EventCategory, Record<string, RecoTier>> = {
  fire: {
    home:    { immediate: ['Close all windows and doors to limit smoke.', 'Stay out of the affected block until all-clear.'], hour: ['Monitor for smoke smell; call 911 if it spreads to your building.', 'Keep windows closed if you are within 1 km.'], before: ['Ventilate rooms only once authorities give the all-clear.'], optional: ['Check on elderly neighbours after the scene clears.'] },
    condo:   { immediate: ['Close balcony doors immediately.', 'Do not use elevators — locate stairwell exits.'], hour: ['Check with building management for updates.', 'Charge devices in case of evacuation order.'], before: ['Wait for official all-clear before opening windows.'], optional: ['Report any smoke smell to the fire warden on your floor.'] },
    office:  { immediate: ['Seal office windows and exterior doors.', 'Account for all staff.'], hour: ['Pause non-essential work; be ready to evacuate on short notice.', 'Check with building security for updates.'], before: ['Ventilate only after all-clear from fire authorities.'], optional: ['Log incident in the building emergency record.'] },
    school:  { immediate: ['Initiate shelter-in-place; seal classroom windows.', 'Account for all students with an immediate head count.'], hour: ['Hold dismissal until fire department gives the all-clear.', 'Prepare emergency comms to parents.'], before: ['Ventilate rooms once official all-clear received.'], optional: ['Document incident for school board reporting.'] },
    cottage: { immediate: ['Close all windows and doors.', 'Identify escape routes away from the fire direction.'], hour: ['Monitor wind direction — fire spreads fast in rural areas.', 'Alert neighbours along your road.'], before: ['Check roof and eaves for embers once the scene is cleared.'], optional: ['Review your property emergency exit plan.'] },
  },
  police: {
    home:    { immediate: ['Lock all doors and windows now.', 'Stay away from the affected block until police clear the scene.'], hour: ['Monitor local updates; avoid unnecessary trips outside.'], before: ['Check exterior cameras once the scene clears.'], optional: ['Report anything suspicious to the police non-emergency line: 416-808-2222.'] },
    condo:   { immediate: ['Lock your unit door and inform building security.'], hour: ['Avoid ground-floor exits if the scene is near your entrance.', 'Check with the concierge for building status.'], before: ['Review intercom footage if you have access.'], optional: ['Notify the condo management office.'] },
    office:  { immediate: ['Lock lobby access; brief reception staff.', 'Move staff away from street-facing windows.'], hour: ['Restrict external visitor access until the scene is cleared.', 'Check in with any staff who have not reported.'], before: ['Review building access logs once secure.'], optional: ['Brief staff on personal safety protocols.'] },
    school:  { immediate: ['Initiate hold-and-secure or lockdown if directed by police.', 'Account for all students immediately.'], hour: ['Hold all entrances; verify ID of anyone entering.', 'Notify TDSB and parent contacts.'], before: ['Debrief staff and document the incident fully.'], optional: ['Offer emotional support resources to affected students.'] },
    cottage: { immediate: ['Lock all entry points on the property.', 'Avoid isolated trails or roads until the area is cleared.'], hour: ['Check on anyone else on the property.'], before: ['Verify outbuildings and vehicles are secured.'], optional: ['Contact OPP non-emergency if you observe anything further.'] },
  },
  road: {
    home:    { immediate: ['Avoid the affected road; check 511.ontario.ca for a live detour.', 'Budget extra time if you need to travel through the area.'], hour: ['Notify anyone you are meeting of a possible delay.'], before: ['Check 511 for reopening updates before you leave.'], optional: ['Consider delaying the trip if it is not time-sensitive.'] },
    condo:   { immediate: ['Check alternate routes before heading to your parking level.'], hour: ['Factor in extra walk or transit time for the detour.'], before: ['Set a 511 Ontario alert for your regular route.'], optional: ['Use a ride-share if the detour adds significant time.'] },
    office:  { immediate: ['Alert your team to expect delays; share the 511 link.', 'Consider offering remote-work flex for affected commuters.'], hour: ['Adjust meeting start times if attendees are travelling through the closure.'], before: ['Confirm tomorrow\'s commute route is not also affected.'], optional: ['Post the alternate route in team chat.'] },
    school:  { immediate: ['Alert the bus routing coordinator immediately.', 'Widen the late-arrival window for affected routes.'], hour: ['Notify parents via the school app of potential delays.'], before: ['Confirm after-school pickup plans for families on the affected route.'], optional: ['Coordinate with TTC for alternate student transit if needed.'] },
    cottage: { immediate: ['Check 511 and Google Maps for alternate cottage-country routes.', 'Allow extra travel time before you depart.'], hour: ['Consider leaving at a different time to avoid the closure.'], before: ['Watch the 511 alert for estimated clearance time.'], optional: ['Notify anyone expecting you of the potential delay.'] },
  },
  transit: {
    home:    { immediate: ['Check the TTC app or ttc.ca for real-time service updates.', 'Identify the nearest surface alternative (bus or streetcar).'], hour: ['Budget extra time if this route is part of your commute.'], before: ['Set a TTC alert for your line so you get updates automatically.'], optional: ['Consider a ride-share or Bike Share Toronto if the delay is long.'] },
    condo:   { immediate: ['Check TTC real-time arrivals before heading downstairs.', 'Find the nearest surface route alternative.'], hour: ['Allow extra buffer — surface routes run slower in traffic.'], before: ['Save the TTC status page to your phone home screen.'], optional: ['Bike Share Toronto is an option if your destination is close.'] },
    office:  { immediate: ['Alert your team to possible late arrivals.', 'Share the TTC status link in team chat for affected commuters.'], hour: ['Check if any meeting start times need adjusting.'], before: ['Monitor TTC updates until service normalises.'], optional: ['Consider declaring WFH flex if the delay extends into the peak window.'] },
    school:  { immediate: ['Check if any staff or students rely on this line for their commute.', 'Update arrival-time expectations accordingly.'], hour: ['Notify families if the school shuttle uses this line.'], before: ['Monitor TTC updates; brief reception on expected late arrivals.'], optional: ['Brief staff about staggered arrivals if the delay is prolonged.'] },
    cottage: { immediate: ['This TTC disruption does not affect cottage travel — no action needed.'], hour: [], before: [], optional: ['Check the TTC app for your city commute before heading north.'] },
  },
};

const haversineKm = (a: { lat: number; lng: number }, b: { lat: number; lng: number }) => {
  const toRad = (d: number) => d * Math.PI / 180;
  const R = 6371;
  const dLat = toRad(b.lat - a.lat), dLng = toRad(b.lng - a.lng);
  const x = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
};

function ConfBars({ n }: { n: number }) {
  return (
    <span className="conf">
      <span className="bars">
        {[1, 2, 3].map(i => (
          <span key={i} style={{ height: i * 3 + 'px', opacity: i <= n ? 1 : 0.2 }} />
        ))}
      </span>
      {(['LOW', 'MED', 'HIGH'][n - 1] || '—')}
    </span>
  );
}

interface LocationsPanelProps {
  locations: UserLocation[];
  onPick: (loc: UserLocation) => void;
  onEdit: (loc: UserLocation) => void;
  onDelete: (loc: UserLocation) => void;
  onShare: (loc: UserLocation) => void;
  onAdd: () => void;
  onClose: () => void;
}

export function LocationsPanel({ locations, onPick, onEdit, onDelete, onShare, onAdd, onClose }: LocationsPanelProps) {
  return (
    <aside className="panel">
      <div className="panel-h">
        <div>
          <div className="ttl">MY LOCATIONS</div>
          <div className="step">{locations.length} ACTIVE BEACONS</div>
        </div>
        <button className="x-btn" onClick={onClose}><Icon name="close" /></button>
      </div>
      <div className="panel-b" style={{ padding: 0 }}>
        {locations.length === 0 ? (
          <div style={{ padding: '24px 20px', color: 'var(--muted)', fontSize: 11, letterSpacing: '.1em' }}>
            NO LOCATIONS YET — ADD ONE BELOW.
          </div>
        ) : locations.map(loc => {
          const kind = KIND_OPTIONS.find(k => k.k === loc.kind) || { icon: 'home', label: loc.kind?.toUpperCase() };
          return (
            <div key={loc.id} className="loc-row" onClick={() => onPick(loc)}>
              <div className="loc-glyph"><Icon name={kind.icon} /></div>
              <div>
                <div className="loc-name">{loc.name}</div>
                <div className="loc-addr">{loc.address}</div>
                <div className="loc-meta" style={{ marginTop: 4 }}>
                  {loc.priorities.map(p => (
                    <span key={p} style={{ display: 'inline-flex', alignItems: 'center', gap: 3 }}>
                      <span className={`pri-pip ${PRIORITY_CLASS[p]}`} />{p}
                    </span>
                  ))}
                  <span>· {loc.radiusKm.toFixed(1)}KM</span>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 4 }}>
                <button className="btn ghost sm" onClick={e => { e.stopPropagation(); onEdit(loc); }} title="Edit"><Icon name="edit" /></button>
                <button className="btn ghost sm" onClick={e => { e.stopPropagation(); onShare(loc); }} title="Share"><Icon name="share" /></button>
                <button className="btn ghost sm" onClick={e => { e.stopPropagation(); onDelete(loc); }} title="Delete" style={{ color: 'var(--critical)', borderColor: 'var(--critical)' }}><Icon name="trash" /></button>
              </div>
            </div>
          );
        })}
      </div>
      <div className="panel-f">
        <span style={{ fontSize: 10, letterSpacing: '.18em', color: 'var(--muted)' }}>SYNCED 4s AGO</span>
        <button className="btn" onClick={onAdd}><Icon name="plus" /> ADD LOCATION</button>
      </div>
    </aside>
  );
}

const HISTORY_EXTRA: AlertEvent[] = [
  { id: 'H01', priority: 'ADVISORY', event: 'Smog Watch lifted', action: '', plain: 'Air quality back to normal across midtown.', lat: 0, lng: 0, radiusM: 0, time: '4h ago', area: 'Midtown', source: 'Environment Canada', conf: 3, ttl: '', resolved: true },
  { id: 'H02', priority: 'URGENT', event: 'Line 1 — signal issue', action: '', plain: 'Subway delays cleared at Bloor-Yonge.', lat: 0, lng: 0, radiusM: 0, time: '9h ago', area: 'Line 1 — Yonge', source: 'TTC Service Alerts', conf: 3, ttl: '', resolved: true },
  { id: 'H03', priority: 'CRITICAL', event: 'Tornado watch — ended', action: '', plain: 'Tornado watch was lifted overnight.', lat: 0, lng: 0, radiusM: 0, time: '14h ago', area: 'GTA West', source: 'Environment Canada', conf: 3, ttl: '', resolved: true },
  { id: 'H04', priority: 'OPPORTUNITY', event: 'Stargazing window', action: '', plain: 'Clear skies + new moon last night.', lat: 0, lng: 0, radiusM: 0, time: '22h ago', area: 'GTA', source: 'Environment Canada', conf: 2, ttl: '', resolved: true },
];

interface HistoryPanelProps {
  events: AlertEvent[];
  onPick: (ev: AlertEvent) => void;
  onClose: () => void;
}

const PRIORITIES: Priority[] = ['CRITICAL', 'URGENT', 'ADVISORY', 'OPPORTUNITY'];
const PRI_SHORT: Record<string, string> = { CRITICAL: 'CRIT', URGENT: 'URGENT', ADVISORY: 'ADVIS', OPPORTUNITY: 'OPP' };
const PRI_DOT: Record<string, string> = { CRITICAL: 'crit', URGENT: 'urg', ADVISORY: 'adv', OPPORTUNITY: 'opp' };
const SOURCE_ABBR: Record<string, string> = {
  'Toronto Fire': 'FIRE',
  '511 Ontario': 'TRAFFIC',
  'Toronto Police': 'POLICE',
  'TTC Service Alerts': 'TRANSIT',
  'Environment Canada': 'WEATHER',
};

export function HistoryPanel({ events, onPick, onClose }: HistoryPanelProps) {
  const items = [...events, ...HISTORY_EXTRA];

  const [priFilter, setPriFilter] = useState<Set<Priority>>(new Set());
  const [srcFilter, setSrcFilter] = useState<Set<string>>(new Set());
  const [hideResolved, setHideResolved] = useState(false);

  const allSources = Array.from(new Set(items.map(it => it.source))).sort();

  const togglePri = (p: Priority) => setPriFilter(prev => {
    const next = new Set(prev);
    next.has(p) ? next.delete(p) : next.add(p);
    return next;
  });

  const toggleSrc = (s: string) => setSrcFilter(prev => {
    const next = new Set(prev);
    next.has(s) ? next.delete(s) : next.add(s);
    return next;
  });

  const filtered = items.filter(it => {
    if (priFilter.size > 0 && !priFilter.has(it.priority)) return false;
    if (srcFilter.size > 0 && !srcFilter.has(it.source)) return false;
    if (hideResolved && it.resolved) return false;
    return true;
  });

  return (
    <aside className="panel">
      <div className="panel-h">
        <div>
          <div className="ttl">NOTIFICATION HISTORY</div>
          <div className="step">
            LAST 24H · {filtered.length}{filtered.length !== items.length ? `/${items.length}` : ''} EVENTS
          </div>
        </div>
        <button className="x-btn" onClick={onClose}><Icon name="close" /></button>
      </div>
      <div className="hist-filters">
        <div className="hist-filter-label">PRIORITY</div>
        <div className="hist-filter-row">
          {PRIORITIES.map(p => (
            <button key={p} className={`chip${priFilter.has(p) ? ' on' : ''}`} onClick={() => togglePri(p)}>
              <span className={`dot ${PRI_DOT[p]}`} />
              {PRI_SHORT[p]}
            </button>
          ))}
        </div>
        <div className="hist-filter-label" style={{ marginTop: 10, display: 'flex', justifyContent: 'space-between' }}>
          <span>SOURCE</span>
          <button
            className={`chip${hideResolved ? ' on' : ''}`}
            onClick={() => setHideResolved(s => !s)}
            style={{ padding: '2px 7px', fontSize: 9 }}
          >
            ACTIVE ONLY
          </button>
        </div>
        <div className="hist-filter-row">
          {allSources.map(s => (
            <button key={s} className={`chip${srcFilter.has(s) ? ' on' : ''}`} onClick={() => toggleSrc(s)}>
              {SOURCE_ABBR[s] ?? s}
            </button>
          ))}
        </div>
      </div>
      <div className="panel-b" style={{ padding: 0 }}>
        <div className="hist">
          {filtered.length === 0 ? (
            <div style={{ padding: '24px 20px', color: 'var(--muted)', fontSize: 11, letterSpacing: '.1em' }}>
              NO EVENTS MATCH FILTERS.
            </div>
          ) : filtered.map(it => (
            <div key={it.id} className="hist-row" onClick={() => onPick(it)}>
              <div className={`pri-bar ${PRIORITY_CLASS[it.priority]}`} />
              <div className="when">{it.time?.toUpperCase()}</div>
              <div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                  <span style={{ fontWeight: 700, fontFamily: 'var(--sans)', fontSize: 13, letterSpacing: '-.005em', textDecoration: it.resolved ? 'line-through' : 'none', textDecorationColor: 'rgba(0,0,0,.25)' }}>{it.event}</span>
                  {it.resolved && <span style={{ fontSize: 9, fontFamily: 'var(--sans)', fontWeight: 600, letterSpacing: '.12em', color: 'var(--muted)', background: 'var(--rule-soft)', borderRadius: 3, padding: '1px 5px', flexShrink: 0 }}>EXPIRED</span>}
                </div>
                <div style={{ fontSize: 10, color: 'var(--muted)', letterSpacing: '.06em', marginTop: 2 }}>{it.area} · {it.source}</div>
              </div>
              <div className="arrow">›</div>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}

interface AlertDrawerProps {
  event: AlertEvent | null;
  locations?: UserLocation[];
  onClose: () => void;
  onBack?: () => void;
  onShare: (ev: AlertEvent) => void;
}

type Hit = UserLocation & { km: number };

export function AlertDrawer({ event, locations = [], onClose, onBack, onShare }: AlertDrawerProps) {
  const storageKey = `the6watch_checks_${event?.id}`;
  const [done, setDone] = useState<Record<string, boolean>>(() => {
    if (!event?.id || typeof window === 'undefined') return {};
    try { return JSON.parse(localStorage.getItem(storageKey) || '{}'); } catch { return {}; }
  });
  const [snoozed, setSnoozed] = useState(false);

  useEffect(() => {
    if (!event?.id) return;
    try { localStorage.setItem(storageKey, JSON.stringify(done)); } catch { /* quota */ }
  }, [done, storageKey, event?.id]);

  if (!event) return null;
  const cls = PRIORITY_CLASS[event.priority];

  const hits: Hit[] = locations
    .map(loc => {
      const km = haversineKm({ lat: event.lat, lng: event.lng }, { lat: loc.lat, lng: loc.lng });
      const reach = (event.radiusM || 1000) / 1000 + (loc.radiusKm || 1.5);
      return km <= reach ? { ...loc, km } : null;
    })
    .filter((x): x is Hit => x !== null)
    .sort((a, b) => a.km - b.km);

  const personaKind = hits[0]?.kind || 'home';
  const empty: RecoTier = { immediate: [], hour: [], before: [], optional: [] };
  const eventCategory = SOURCE_CATEGORY[event.source];
  const recos: RecoTier = eventCategory
    ? (EVENT_RECO[eventCategory]?.[personaKind] || EVENT_RECO[eventCategory]?.home || empty)
    : (WEATHER_RECO[event.priority]?.[personaKind] || WEATHER_RECO[event.priority]?.home || empty);

  const tier = (key: string, label: string, items: string[]) => {
    if (!items || !items.length) return null;
    return (
      <div style={{ marginBottom: 14 }}>
        <div className="lbl" style={{ marginBottom: 6, display: 'flex', justifyContent: 'space-between' }}>
          <span>{label}</span>
          <span style={{ color: 'var(--muted-2)' }}>{items.filter((_, i) => done[`${key}-${i}`]).length}/{items.length}</span>
        </div>
        {items.map((t, i) => {
          const k = `${key}-${i}`;
          const on = !!done[k];
          return (
            <div key={i} className={`radio-row ${on ? 'on' : ''}`} onClick={() => setDone(d => ({ ...d, [k]: !d[k] }))} style={{ borderBottom: '1px dashed var(--rule-soft)' }}>
              <span className="box" />
              <span style={{ flex: 1, fontSize: 12, lineHeight: 1.45, textDecorationLine: on ? 'line-through' : 'none', textDecorationColor: on ? 'rgba(0,0,0,.35)' : 'transparent', color: on ? 'var(--muted)' : 'var(--ink)' }}>{t}</span>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <aside className="drawer">
      <div className={`alert-head ${cls}`}>
        <div className="alert-head-top">
          {onBack ? (
            <button className="back-btn" onClick={onBack} aria-label="Back to history"><span style={{ fontSize: 13, lineHeight: 1 }}>‹</span> HISTORY</button>
          ) : (
            <div className="pri">PRIORITY · {event.priority}</div>
          )}
        </div>
        {onBack && <div className="pri" style={{ marginTop: 2 }}>PRIORITY · {event.priority}</div>}
        <div className="ev">{event.event}</div>
        <div className="when">{event.time?.toUpperCase()} · {event.ttl?.toUpperCase()}</div>
      </div>
      <div className="panel-b">
        <div className="field" style={{ marginBottom: 14 }}>
          <div style={{ fontFamily: 'var(--sans)', fontSize: 14, lineHeight: 1.5, letterSpacing: '-.005em' }}>{event.plain}</div>
        </div>

        {hits.length > 0 && (
          <div className="card" style={{ background: 'transparent', marginBottom: 14 }}>
            <div className="card-h"><span>AFFECTS YOUR LOCATIONS</span><span className="meta">{hits.length} HIT</span></div>
            <div className="card-b" style={{ padding: '4px 12px' }}>
              {hits.map(h => (
                <div key={h.id} className="kv">
                  <span className="k" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span className="pri-pip" style={{ background: 'var(--ink)' }} />
                    <span style={{ letterSpacing: '.16em' }}>{h.name}</span>
                  </span>
                  <span className="v">{h.km.toFixed(1)} KM AWAY</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="lbl" style={{ marginBottom: 8, display: 'flex', justifyContent: 'space-between' }}>
          <span>WHAT TO DO</span>
          <span style={{ color: 'var(--muted-2)' }}>FOR {personaKind.toUpperCase()}</span>
        </div>

        {tier('imm', 'IMMEDIATE', recos.immediate)}
        {tier('hr', 'WITHIN THE HOUR', recos.hour)}
        {tier('be', 'BEFORE IT ENDS', recos.before)}
        {tier('op', 'OPTIONAL', recos.optional)}

        <div className="divider" />
        <div className="card" style={{ background: 'transparent' }}>
          <div className="card-h"><span>SIGNAL DETAIL</span><ConfBars n={event.conf || 3} /></div>
          <div className="card-b">
            <div className="kv"><span className="k">AREA</span><span className="v" style={{ maxWidth: 200, textAlign: 'right' }}>{event.area}</span></div>
            <div className="kv"><span className="k">SOURCE</span><span className="v">{event.source}</span></div>
            <div className="kv"><span className="k">DETECTED</span><span className="v">{event.time}</span></div>
            <div className="kv"><span className="k">EXPIRES</span><span className="v">{event.ttl}</span></div>
            <div className="kv"><span className="k">WHY YOU?</span><span className="v" style={{ maxWidth: 200, textAlign: 'right' }}>{hits.length > 0 ? `${hits[0].name} within ${hits[0].km.toFixed(1)} km` : 'In your viewport'}</span></div>
          </div>
        </div>

        <div className="divider" />
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          <button className="chip" onClick={() => setSnoozed(s => !s)}>{snoozed ? 'SNOOZED · 1H' : 'SNOOZE 1H'}</button>
          <button className="chip">SHARE WITH HOUSEHOLD</button>
          <button className="chip">CALL 311</button>
        </div>
      </div>
      <div className="panel-f">
        <button className="btn ghost" onClick={onClose}>DISMISS</button>
        <button className="btn" onClick={() => onShare(event)}><Icon name="share" /> SHARE</button>
      </div>
    </aside>
  );
}

interface ShareModalProps {
  thing: AlertEvent | UserLocation | null;
  onClose: () => void;
}

export function ShareModal({ thing, onClose }: ShareModalProps) {
  const id = thing ? ('id' in thing ? thing.id : '') : 'X';
  const name = thing ? ('name' in thing ? thing.name : 'event' in thing ? (thing as AlertEvent).event : 'BEACON') : 'BEACON';
  const url = `https://the6watch.to/s/${id.toLowerCase()}-${Math.floor(Math.random() * 9000 + 1000)}`;
  const [copied, setCopied] = useState(false);

  const copy = () => {
    try { navigator.clipboard.writeText(url); } catch { /* noop */ }
    setCopied(true);
    setTimeout(() => setCopied(false), 1400);
  };

  return (
    <div className="modal-wrap" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-h">
          <span>SHARE — {name}</span>
          <button className="x-btn" onClick={onClose}><Icon name="close" /></button>
        </div>
        <div className="modal-b">
          <div className="lbl">PUBLIC LINK</div>
          <div className="copy-row">
            <input readOnly value={url} />
            <button onClick={copy}>{copied ? 'COPIED ✓' : 'COPY'}</button>
          </div>
          <div className="help" style={{ marginTop: 10 }}>Anyone with this link can view live alerts for this location/event. Pin position is fuzzed by 200m for privacy.</div>
          <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
            <button className="chip">SMS</button>
            <button className="chip">EMAIL</button>
            <button className="chip">SLACK</button>
            <button className="chip">QR CODE</button>
          </div>
        </div>
      </div>
    </div>
  );
}
