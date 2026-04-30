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

const RECO_LIB: Record<Priority, Record<string, RecoTier>> = {
  CRITICAL: {
    home:    { immediate: ['Close & lock all windows; bring kids/pets indoors.', 'Move car off the street if branches/flooding likely.'], hour: ['Charge phones + power banks now.', 'Fill bathtub if power loss is possible.'], before: ['Move valuables off basement floor.', 'Photograph property for insurance.'], optional: ['Check on elderly neighbours.'] },
    condo:   { immediate: ['Close balcony doors; stow loose planters & furniture.', 'Stay away from floor-to-ceiling windows.'], hour: ['Charge devices; locate stairwell exit.', 'Fill water bottles in case pumps fail.'], before: ['Unplug non-essential electronics.'], optional: ['Notify your concierge.'] },
    office:  { immediate: ['Move staff away from glass façade.', 'Lock down loose rooftop or balcony items.'], hour: ['Back up local work to cloud.', 'Identify a shelter-in-place spot.'], before: ['Brief team on early-dismissal trigger.'], optional: ['Coordinate with building security.'] },
    school:  { immediate: ['Move students to interior rooms; away from windows.', 'Account for everyone — head count.'], hour: ['Hold dismissal until guidance updates.', 'Prepare emergency comms to parents.'], before: ['Brief after-school staff.'], optional: ['Coordinate with TDSB safety line.'] },
    cottage: { immediate: ['Secure dock lines; pull boat covers.', 'Bring in patio furniture, kayaks, BBQ propane.'], hour: ['Top up generator fuel.', 'Stage flashlights + radio.'], before: ['Photograph shoreline + structures.'], optional: ['Check on neighbours up the road.'] },
  },
  URGENT: {
    home:    { immediate: ['Clear gutters of leaves/debris.', 'Park car somewhere not under trees.'], hour: ['Run sump pump test cycle.', 'Move basement boxes off the floor.'], before: ['Drip cold-water taps if deep freeze.'], optional: ['Stock up on quick groceries.'] },
    condo:   { immediate: ['Check balcony drains for blockage.', 'Wipe window seals if leaks are an issue.'], hour: ['Charge devices.', 'Stage towels near doors.'], before: ['Plan an alternate commute route.'], optional: ['Notify concierge of leaks.'] },
    office:  { immediate: ['Share alternate commute options with the team.', 'Check building drainage if at grade-level.'], hour: ['Re-time meetings off the disruption window.'], before: ['Forward office line to mobile.'], optional: ['Order team coffee/lunch in.'] },
    school:  { immediate: ['Update bus routing & parents.', 'Move recess indoors.'], hour: ['Brief reception about late arrivals.'], before: ['Pre-stage rain gear at exits.'], optional: ['Push update to school app.'] },
    cottage: { immediate: ['Pull dockside chairs & cushions.', 'Cover firewood pile.'], hour: ['Run a generator check.'], before: ['Clean out the eavestroughs.'], optional: ['Top up groceries from the marina.'] },
  },
  ADVISORY: {
    home:    { immediate: ['Replace HVAC filter if past 60 days.', 'Close windows on the high-pollen side.'], hour: ['Limit outdoor exertion for sensitive folks.'], before: ['Run a HEPA in the bedroom tonight.'], optional: ["Hydrate; saline rinse if you're reactive."] },
    condo:   { immediate: ['Switch HVAC to recirculate.', 'Shut balcony door.'], hour: ['Wipe down surfaces near vents.'], before: ['Run air purifier overnight.'], optional: ['Stock antihistamines.'] },
    office:  { immediate: ['Switch HVAC mode; keep doors shut.', 'Reschedule outdoor meetings.'], hour: ['Offer remote-work option to sensitive staff.'], before: ['Add a HEPA to the meeting room.'], optional: ['Send a wellness note.'] },
    school:  { immediate: ['Move recess indoors.', 'Notify families of children with asthma.'], hour: ['Brief PE staff.'], before: ['Run room HEPAs through dismissal.'], optional: ['Update the school app.'] },
    cottage: { immediate: ['Skip the burn pile today.', 'Close screens on prevailing-wind side.'], hour: ['Run AC on recirculate.'], before: ['Stage allergy meds.'], optional: ['Reschedule the long paddle.'] },
  },
  OPPORTUNITY: {
    home:    { immediate: ['Water plants deeply this morning.', 'Pull weeds while soil is loose.'], hour: ['Direct-sow tomatoes / peppers / basil.'], before: ['Apply slow-release fertilizer.'], optional: ['Photograph the garden for tracking.'] },
    condo:   { immediate: ['Water balcony pots — they dry first.', 'Re-pot anything root-bound.'], hour: ['Move heat-lovers into direct sun.'], before: ['Clean balcony drains.'], optional: ['Snip herbs to encourage growth.'] },
    office:  { immediate: ['Open windows briefly for air exchange.'], hour: ['Walking 1:1s outdoors.'], before: ['Schedule team patio social.'], optional: ['Photograph the courtyard.'] },
    school:  { immediate: ['Outdoor classroom / nature walk window.', 'Garden club planting session.'], hour: ['Schedule recess outdoors.'], before: ['Plan the field-day rain alternative if weather shifts.'], optional: ['Capture photos for the newsletter.'] },
    cottage: { immediate: ['Best window to plant or transplant.', 'Shock the pool / open the dock.'], hour: ['Trim shoreline branches.', 'Stain the deck.'], before: ['Set out the rain barrels.'], optional: ['Star-gaze tonight.'] },
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
  { id: 'H01', priority: 'ADVISORY', event: 'Smog Watch lifted', action: '', plain: 'Air quality back to normal across midtown.', lat: 0, lng: 0, radiusM: 0, time: '4h ago', area: 'Midtown', source: 'AQHI', conf: 3, ttl: '', resolved: true },
  { id: 'H02', priority: 'URGENT', event: 'Line 1 — signal issue', action: '', plain: 'Subway delays cleared at Bloor-Yonge.', lat: 0, lng: 0, radiusM: 0, time: '9h ago', area: 'Line 1 — Yonge', source: 'TTC', conf: 3, ttl: '', resolved: true },
  { id: 'H03', priority: 'CRITICAL', event: 'Tornado watch — ended', action: '', plain: 'Tornado watch was lifted overnight.', lat: 0, lng: 0, radiusM: 0, time: '14h ago', area: 'GTA West', source: 'EC', conf: 3, ttl: '', resolved: true },
  { id: 'H04', priority: 'OPPORTUNITY', event: 'Stargazing window', action: '', plain: 'Clear skies + new moon last night.', lat: 0, lng: 0, radiusM: 0, time: '22h ago', area: 'GTA', source: 'GardenSense', conf: 2, ttl: '', resolved: true },
];

interface HistoryPanelProps {
  events: AlertEvent[];
  onPick: (ev: AlertEvent) => void;
  onClose: () => void;
}

export function HistoryPanel({ events, onPick, onClose }: HistoryPanelProps) {
  const items = [...events, ...HISTORY_EXTRA];
  return (
    <aside className="panel">
      <div className="panel-h">
        <div>
          <div className="ttl">NOTIFICATION HISTORY</div>
          <div className="step">LAST 24H · {items.length} EVENTS</div>
        </div>
        <button className="x-btn" onClick={onClose}><Icon name="close" /></button>
      </div>
      <div className="panel-b" style={{ padding: 0 }}>
        <div className="hist">
          {items.map(it => (
            <div key={it.id} className="hist-row" onClick={() => onPick(it)}>
              <div className={`pri-bar ${PRIORITY_CLASS[it.priority]}`} />
              <div className="when">{it.time?.toUpperCase()}</div>
              <div>
                <div style={{ fontWeight: 700, fontFamily: 'var(--sans)', fontSize: 13, letterSpacing: '-.005em', textDecoration: it.resolved ? 'line-through' : 'none', textDecorationColor: 'rgba(0,0,0,.25)' }}>{it.event}</div>
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
  onShare: (ev: AlertEvent) => void;
}

type Hit = UserLocation & { km: number };

export function AlertDrawer({ event, locations = [], onClose, onShare }: AlertDrawerProps) {
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
  const recos = RECO_LIB[event.priority]?.[personaKind] || RECO_LIB[event.priority]?.home || { immediate: [], hour: [], before: [], optional: [] };

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
        <div className="pri">PRIORITY · {event.priority}</div>
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
