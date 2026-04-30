'use client';

import { useState } from 'react';
import type { AlertEvent, UserLocation } from '../types';
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
  onClose: () => void;
  onShare: (ev: AlertEvent) => void;
}

export function AlertDrawer({ event, onClose, onShare }: AlertDrawerProps) {
  if (!event) return null;
  const cls = PRIORITY_CLASS[event.priority];
  return (
    <aside className="drawer">
      <div className={`alert-head ${cls}`}>
        <div className="pri">PRIORITY · {event.priority}</div>
        <div className="ev">{event.event}</div>
        <div className="when">{event.time?.toUpperCase()} · {event.ttl?.toUpperCase()}</div>
      </div>
      <div className="panel-b">
        <div className="field">
          <label>WHAT&apos;S HAPPENING</label>
          <div style={{ fontFamily: 'var(--sans)', fontSize: 15, lineHeight: 1.5, letterSpacing: '-.005em' }}>{event.plain}</div>
        </div>
        <div className="field">
          <label>RECOMMENDED ACTION</label>
          <div style={{ fontSize: 12, lineHeight: 1.55 }}>{event.action}</div>
        </div>
        <div className="card" style={{ background: 'transparent' }}>
          <div className="card-h"><span>SIGNAL DETAIL</span><ConfBars n={event.conf || 3} /></div>
          <div className="card-b">
            <div className="kv"><span className="k">AREA</span><span className="v" style={{ maxWidth: 200, textAlign: 'right' }}>{event.area}</span></div>
            <div className="kv"><span className="k">SOURCE</span><span className="v">{event.source}</span></div>
            <div className="kv"><span className="k">DETECTED</span><span className="v">{event.time}</span></div>
            <div className="kv"><span className="k">EXPIRES</span><span className="v">{event.ttl}</span></div>
          </div>
        </div>
        <div className="divider" />
        <div className="lbl">SUBSCRIBED LOCATIONS HIT</div>
        <div className="help">Showing locations within the affected radius.</div>
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
  const url = `https://beacon.to/s/${id.toLowerCase()}-${Math.floor(Math.random() * 9000 + 1000)}`;
  const [copied, setCopied] = useState(false);

  const copy = () => {
    try { navigator.clipboard.writeText(url); } catch (_) { /* noop */ }
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
