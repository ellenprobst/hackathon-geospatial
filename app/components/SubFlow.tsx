'use client';

import { useEffect, useState } from 'react';
import type { DraftPin, Priority, UserLocation } from '../types';
import { Icon } from './Icon';

const KIND_OPTIONS = [
  { k: 'home', label: 'HOME', icon: 'home', recos: ['CRITICAL', 'URGENT', 'ADVISORY'] as Priority[] },
  { k: 'condo', label: 'CONDO', icon: 'condo', recos: ['CRITICAL', 'URGENT'] as Priority[] },
  { k: 'office', label: 'OFFICE', icon: 'office', recos: ['URGENT', 'ADVISORY'] as Priority[] },
  { k: 'school', label: 'SCHOOL', icon: 'school', recos: ['CRITICAL', 'URGENT', 'ADVISORY'] as Priority[] },
  { k: 'cottage', label: 'COTTAGE', icon: 'cottage', recos: ['CRITICAL', 'OPPORTUNITY'] as Priority[] },
];

const PRIORITY_INFO = [
  { k: 'CRITICAL' as Priority, desc: 'Severe wind, flash flood, evacuation orders.' },
  { k: 'URGENT' as Priority, desc: 'Heavy rain, deep freeze, transit disruptions.' },
  { k: 'ADVISORY' as Priority, desc: 'Heatwave, pollen, air quality, filter swaps.' },
  { k: 'OPPORTUNITY' as Priority, desc: 'Perfect planting, fertilize, dry stretch windows.' },
];

const PRIORITY_CLASS: Record<string, string> = {
  CRITICAL: 'crit', URGENT: 'urg', ADVISORY: 'adv', OPPORTUNITY: 'opp',
};

const NOTIF_TYPES = [
  { k: 'push', label: 'PUSH (MOBILE)' },
  { k: 'sms', label: 'TEXT MESSAGE' },
  { k: 'email', label: 'EMAIL' },
  { k: 'voice', label: 'VOICE CALL' },
  { k: 'desktop', label: 'DESKTOP BANNER' },
];

const SUGGESTED_ADDRESSES = [
  { a: '64 Brunswick Ave, Toronto, ON', lat: 43.6650, lng: -79.4065 },
  { a: '1075 Bay St #1804, Toronto, ON', lat: 43.6669, lng: -79.3873 },
  { a: '88 Queen St E, Toronto, ON', lat: 43.6537, lng: -79.3760 },
  { a: '215 Spadina Rd, Toronto, ON', lat: 43.6797, lng: -79.4108 },
  { a: '46 Cottage Rd, Muskoka Lakes, ON', lat: 43.7430, lng: -79.5230 },
];

type SubData = Omit<UserLocation, 'id' | 'lat' | 'lng'>;

interface SubscribePanelProps {
  mode?: 'create' | 'edit';
  initial?: SubData | null;
  draft: DraftPin | null;
  setDraft: (d: DraftPin) => void;
  onClose: () => void;
  onSave: (data: Omit<UserLocation, 'id'>) => void;
}

export function SubscribePanel({ mode = 'create', initial, draft, setDraft, onClose, onSave }: SubscribePanelProps) {
  const [step, setStep] = useState(1);
  const [d, setD] = useState<SubData>(initial || {
    name: '',
    address: '',
    kind: 'home',
    priorities: ['CRITICAL', 'URGENT', 'ADVISORY'],
    notifs: ['push', 'email'],
    radiusKm: 1.5,
  });

  useEffect(() => {
    if (!draft) return;
    setDraft({ ...draft, radiusKm: d.radiusKm });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [d.radiusKm]);

  const togglePriority = (p: Priority) => {
    setD({ ...d, priorities: d.priorities.includes(p) ? d.priorities.filter(x => x !== p) : [...d.priorities, p] });
  };

  const toggleNotif = (n: string) => {
    setD({ ...d, notifs: d.notifs.includes(n) ? d.notifs.filter(x => x !== n) : [...d.notifs, n] });
  };

  const pickKind = (k: string) => {
    const reco = KIND_OPTIONS.find(o => o.k === k)?.recos ?? [];
    setD({ ...d, kind: k, priorities: reco });
  };

  const canStep1 = d.address && d.kind;
  const canStep2 = d.priorities.length > 0;
  const canStep3 = d.notifs.length > 0 && draft;
  const canSave = d.name && draft;

  const next = () => setStep(s => Math.min(4, s + 1));
  const back = () => setStep(s => Math.max(1, s - 1));

  return (
    <aside className="panel">
      <div className="panel-h">
        <div>
          <div className="ttl">{mode === 'edit' ? 'EDIT LOCATION' : 'NEW LOCATION'}</div>
          <div className="step">STEP {step} OF 4 — {['ADDRESS', 'PRIORITIES', 'NOTIFICATIONS', 'REVIEW'][step - 1]}</div>
        </div>
        <button className="x-btn" onClick={onClose}><Icon name="close" /></button>
      </div>

      <div className="panel-b">
        {step === 1 && (
          <>
            <div className="field">
              <label>ADDRESS</label>
              <input className="input" placeholder="Type or paste an address…" value={d.address} onChange={e => setD({ ...d, address: e.target.value })} />
              <div className="help">Click anywhere on the map to drop a pin, or pick a suggestion below.</div>
            </div>
            <div className="field">
              <label>SUGGESTED</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {SUGGESTED_ADDRESSES.map(s => (
                  <button key={s.a} className="chip" style={{ justifyContent: 'flex-start' }}
                    onClick={() => { setD({ ...d, address: s.a }); setDraft({ lat: s.lat, lng: s.lng, radiusKm: d.radiusKm }); }}>
                    {s.a}
                  </button>
                ))}
              </div>
            </div>
            <div className="field">
              <label>LOCATION TYPE</label>
              <div className="chips">
                {KIND_OPTIONS.map(o => (
                  <button key={o.k} className={`chip ${d.kind === o.k ? 'on' : ''}`} onClick={() => pickKind(o.k)}>
                    <Icon name={o.icon} /> {o.label}
                  </button>
                ))}
              </div>
              <div className="help">We&apos;ll pre-select alert priorities that match this location.</div>
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <div className="field">
              <label>PRIORITY LEVELS <span className="hint">PRE-FILLED FOR {d.kind.toUpperCase()}</span></label>
              <div className="radio-list">
                {PRIORITY_INFO.map(p => {
                  const on = d.priorities.includes(p.k);
                  return (
                    <div key={p.k} className={`radio-row ${on ? 'on' : ''}`} onClick={() => togglePriority(p.k)}>
                      <span className="box" />
                      <span style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1 }}>
                        <span className={`pri-pip ${PRIORITY_CLASS[p.k]}`} />
                        <span style={{ fontWeight: 700, letterSpacing: '.16em' }}>{p.k}</span>
                        <span style={{ color: 'var(--muted)', letterSpacing: '.04em', fontSize: 10 }}>— {p.desc}</span>
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="field">
              <label>QUIET HOURS</label>
              <div className="seg">
                <button className="on">22:00 → 07:00</button>
                <button>NEVER QUIET</button>
                <button>CRITICAL ONLY</button>
              </div>
              <div className="help">Configurable later in settings.</div>
            </div>
          </>
        )}

        {step === 3 && (
          <>
            <div className="field">
              <label>HOW SHOULD WE REACH YOU?</label>
              {NOTIF_TYPES.map(n => (
                <div key={n.k} className="notif-row">
                  <span style={{ flex: 1, letterSpacing: '.12em' }}>{n.label}</span>
                  <span className={`toggle ${d.notifs.includes(n.k) ? 'on' : ''}`} onClick={() => toggleNotif(n.k)} />
                </div>
              ))}
            </div>
            <div className="field">
              <label>RADIUS — {d.radiusKm.toFixed(1)} KM</label>
              <input type="range" min="0.3" max="5" step="0.1" value={d.radiusKm} className="slider"
                onChange={e => setD({ ...d, radiusKm: parseFloat(e.target.value) })} />
              <div className="help">Watch the dashed circle preview update on the map →</div>
            </div>
          </>
        )}

        {step === 4 && (
          <>
            <div className="field">
              <label>NAME THIS LOCATION</label>
              <input className="input" placeholder="e.g. HOME · MOM'S PLACE · OFFICE"
                value={d.name}
                onChange={e => setD({ ...d, name: e.target.value.toUpperCase() })} />
            </div>
            <div className="card" style={{ background: 'transparent' }}>
              <div className="card-h"><span>REVIEW</span><span className="meta">CONFIRM TO ACTIVATE</span></div>
              <div className="card-b">
                <div className="kv"><span className="k">ADDRESS</span><span className="v" style={{ maxWidth: 200, textAlign: 'right' }}>{d.address || '—'}</span></div>
                <div className="kv"><span className="k">TYPE</span><span className="v">{d.kind.toUpperCase()}</span></div>
                <div className="kv"><span className="k">RADIUS</span><span className="v">{d.radiusKm.toFixed(1)} KM</span></div>
                <div className="kv"><span className="k">PRIORITIES</span><span className="v">{d.priorities.join(' · ')}</span></div>
                <div className="kv"><span className="k">NOTIFY VIA</span><span className="v">{d.notifs.map(n => n.toUpperCase()).join(' · ')}</span></div>
              </div>
            </div>
            <div className="help" style={{ marginTop: 10 }}>You can change any of this later from the location list.</div>
          </>
        )}
      </div>

      <div className="panel-f">
        {step > 1 ? (
          <button className="btn ghost" onClick={back}>← BACK</button>
        ) : <span />}
        {step < 4 ? (
          <button
            className="btn"
            disabled={(step === 1 && !canStep1) || (step === 2 && !canStep2) || (step === 3 && !canStep3)}
            style={{ opacity: ((step === 1 && !canStep1) || (step === 2 && !canStep2) || (step === 3 && !canStep3)) ? 0.4 : 1 }}
            onClick={next}
          >
            CONTINUE →
          </button>
        ) : (
          <button className="btn" disabled={!canSave} style={{ opacity: canSave ? 1 : 0.4 }}
            onClick={() => draft && onSave({ ...d, lat: draft.lat, lng: draft.lng, radiusKm: d.radiusKm })}>
            {mode === 'edit' ? 'SAVE CHANGES' : 'ACTIVATE BEACON'}
          </button>
        )}
      </div>
    </aside>
  );
}
