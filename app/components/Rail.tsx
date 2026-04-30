'use client';

import { Icon } from './Icon';

interface RailProps {
  view: string;
  setView: (v: string) => void;
  onAdd: () => void;
  locCount: number;
  alertCount: number;
}

export function Rail({ view, setView, onAdd }: RailProps) {
  return (
    <aside className="rail">
      <div className="brand-mark" title="THE 6 WATCH">
        <svg viewBox="0 0 40 40" fill="none">
          <circle cx="20" cy="20" r="19" fill="#0A0A0A" />
          <circle cx="20" cy="20" r="13" fill="none" stroke="#F4F2EE" strokeWidth="1.2" />
          <circle cx="20" cy="20" r="3.4" fill="#E84B3C" />
          <line x1="20" y1="3" x2="20" y2="7" stroke="#F4F2EE" strokeWidth="1.4" />
          <line x1="20" y1="33" x2="20" y2="37" stroke="#F4F2EE" strokeWidth="1.4" />
          <line x1="3" y1="20" x2="7" y2="20" stroke="#F4F2EE" strokeWidth="1.4" />
          <line x1="33" y1="20" x2="37" y2="20" stroke="#F4F2EE" strokeWidth="1.4" />
          <text x="20" y="17" textAnchor="middle" fontFamily="Inter, sans-serif" fontSize="9" fontWeight="800" fill="#F4F2EE" letterSpacing="-.5">6</text>
        </svg>
      </div>
      <div style={{ height: 14 }} />
      <button className={`rail-icon ${view === 'map' ? 'active' : ''}`} title="Map view" onClick={() => setView('map')}><Icon name="map" /></button>
      <button className={`rail-icon ${view === 'list' ? 'active' : ''}`} title="My locations" onClick={() => setView('list')}><Icon name="list" /></button>
      <button className={`rail-icon ${view === 'history' ? 'active' : ''}`} title="Notification history" onClick={() => setView('history')}><Icon name="bell" /></button>
      <button className="rail-icon" title="Add location" onClick={onAdd}><Icon name="plus" /></button>
      <div className="rail-spacer" />
      <div className="rail-vert">THE 6 WATCH V 0.4 — TOR</div>
    </aside>
  );
}
