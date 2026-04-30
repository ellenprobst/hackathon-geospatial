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
      <div className="brand-mark">B</div>
      <div style={{ height: 14 }} />
      <button className={`rail-icon ${view === 'map' ? 'active' : ''}`} title="Map view" onClick={() => setView('map')}><Icon name="map" /></button>
      <button className={`rail-icon ${view === 'list' ? 'active' : ''}`} title="My locations" onClick={() => setView('list')}><Icon name="list" /></button>
      <button className={`rail-icon ${view === 'history' ? 'active' : ''}`} title="Notification history" onClick={() => setView('history')}><Icon name="bell" /></button>
      <button className="rail-icon" title="Add location" onClick={onAdd}><Icon name="plus" /></button>
      <div className="rail-spacer" />
      <div className="rail-vert">BEACON.TO V 0.4 — TOR</div>
    </aside>
  );
}
