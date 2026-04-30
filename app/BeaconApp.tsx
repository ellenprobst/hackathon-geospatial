'use client';

import { useEffect, useState } from 'react';
import { SEED_EVENTS } from './data/events';
import type { AlertEvent, DraftPin, LayerVisibility, UserLocation } from './types';
import { Rail } from './components/Rail';
import { TopBar } from './components/TopBar';
import { Inspector } from './components/Inspector';
import { TorontoMap } from './components/TorontoMap';
import { AlertDrawer, HistoryPanel, LocationsPanel, ShareModal } from './components/Panels';
import { SubscribePanel } from './components/SubFlow';
import { Icon } from './components/Icon';

const STORAGE_KEY = 'the6watch_locations';

const DEFAULT_LOCATIONS: UserLocation[] = [
  { id: 'L01', name: 'HOME', address: '64 Brunswick Ave, Toronto', kind: 'home', priorities: ['CRITICAL', 'URGENT', 'ADVISORY'], notifs: ['push', 'sms'], radiusKm: 1.5, lat: 43.6650, lng: -79.4065 },
  { id: 'L02', name: 'OFFICE', address: '88 Queen St E, Toronto', kind: 'office', priorities: ['URGENT', 'ADVISORY'], notifs: ['email', 'desktop'], radiusKm: 1.0, lat: 43.6537, lng: -79.3760 },
  { id: 'L03', name: 'COTTAGE', address: '46 Cottage Rd, Muskoka', kind: 'cottage', priorities: ['CRITICAL', 'OPPORTUNITY'], notifs: ['push', 'email'], radiusKm: 3.0, lat: 43.7430, lng: -79.5230 },
];

export default function BeaconApp() {
  const [view, setView] = useState<'map' | 'list' | 'history'>('map');
  const [layers, setLayers] = useState<LayerVisibility>({ CRITICAL: true, URGENT: true, ADVISORY: true, OPPORTUNITY: true });
  const [locations, setLocations] = useState<UserLocation[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved) as UserLocation[];
    } catch {
      // ignore parse / SSR errors
    }
    return DEFAULT_LOCATIONS;
  });

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(locations)); } catch { /* noop */ }
  }, [locations]);

  const [activeAlert, setActiveAlert] = useState<AlertEvent | null>(null);
  const [shareTarget, setShareTarget] = useState<AlertEvent | UserLocation | null>(null);
  const [subOpen, setSubOpen] = useState(false);
  const [subMode, setSubMode] = useState<'create' | 'edit'>('create');
  const [subInitial, setSubInitial] = useState<Omit<UserLocation, 'id' | 'lat' | 'lng'> | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draftPin, setDraftPin] = useState<DraftPin | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [focusTarget, setFocusTarget] = useState<{ lat: number; lng: number; zoom?: number; ts: number } | null>(null);

  const flash = (m: string) => { setToast(m); setTimeout(() => setToast(null), 2200); };

  const visibleEvents = SEED_EVENTS.filter(e => layers[e.priority]);

  const onMapClick = (pt: { lat: number; lng: number }) => {
    if (subOpen) setDraftPin({ lat: pt.lat, lng: pt.lng, radiusKm: draftPin?.radiusKm ?? 1.5 });
  };

  const startCreate = () => {
    setSubMode('create');
    setSubInitial(null);
    setEditingId(null);
    setDraftPin(null);
    setSubOpen(true);
    setView('map');
    setActiveAlert(null);
  };

  const startEdit = (loc: UserLocation) => {
    setSubMode('edit');
    setSubInitial({ name: loc.name, address: loc.address, kind: loc.kind, priorities: loc.priorities, notifs: loc.notifs, radiusKm: loc.radiusKm });
    setEditingId(loc.id);
    setDraftPin({ lat: loc.lat, lng: loc.lng, radiusKm: loc.radiusKm });
    setSubOpen(true);
    setView('map');
  };

  const saveSub = (data: Omit<UserLocation, 'id'>) => {
    if (subMode === 'edit' && editingId) {
      setLocations(L => L.map(l => l.id === editingId ? { ...l, ...data, id: l.id } : l));
      flash('LOCATION UPDATED');
    } else {
      const id = 'L' + (locations.length + 1).toString().padStart(2, '0');
      setLocations(L => [...L, { ...data, id }]);
      flash('BEACON ACTIVATED — ' + data.name);
    }
    setSubOpen(false);
    setDraftPin(null);
    setEditingId(null);
    setView('list');
  };

  const deleteLoc = (loc: UserLocation) => {
    setLocations(L => L.filter(l => l.id !== loc.id));
    flash('LOCATION REMOVED — ' + loc.name);
  };

  const focusLoc = (loc: UserLocation) => {
    setView('map');
    setFocusTarget({ lat: loc.lat, lng: loc.lng, zoom: 14, ts: Date.now() });
    flash('FOCUSED — ' + loc.name);
  };

  const showRightCol = view === 'map' && !subOpen && !activeAlert;
  const sidePanelOpen = subOpen || view === 'list' || view === 'history' || !!activeAlert;

  return (
    <div className="app">
      <Rail
        view={view}
        setView={v => { setView(v as typeof view); setActiveAlert(null); setSubOpen(false); }}
        onAdd={startCreate}
        locCount={locations.length}
        alertCount={visibleEvents.length}
      />

      <main className="stage">
        <TorontoMap
          events={visibleEvents}
          locations={locations}
          intensity={1}
          draftPin={subOpen ? draftPin : null}
          onPickEvent={ev => { setActiveAlert(ev); setSubOpen(false); }}
          onPickLocation={focusLoc}
          onMapClick={onMapClick}
          focusTarget={focusTarget}
        />

        <TopBar alertCount={visibleEvents.length} />

        {showRightCol && (
          <div className="right-col">
            <Inspector events={visibleEvents} layers={layers} setLayers={setLayers} />
            <button className="btn full" onClick={startCreate}><Icon name="plus" /> ADD LOCATION</button>
          </div>
        )}

        <div className={`watermark ${sidePanelOpen ? '' : 'no-right'}`}>
          STRICTLY CONFIDENTIAL — THE 6 WATCH / SYSTEM 416
        </div>

        <div className={`coords ${sidePanelOpen ? '' : 'no-right'}`}>43.6532° N, 79.3832° W · ZOOM 12 · TILE 18.3</div>

        {subOpen && (
          <SubscribePanel
            mode={subMode}
            initial={subInitial}
            draft={draftPin}
            setDraft={setDraftPin}
            onClose={() => { setSubOpen(false); setDraftPin(null); setEditingId(null); }}
            onSave={saveSub}
          />
        )}
        {!subOpen && view === 'list' && (
          <LocationsPanel
            locations={locations}
            onPick={focusLoc}
            onEdit={startEdit}
            onDelete={deleteLoc}
            onShare={setShareTarget}
            onAdd={startCreate}
            onClose={() => setView('map')}
          />
        )}
        {!subOpen && view === 'history' && (
          <HistoryPanel
            events={SEED_EVENTS}
            onPick={ev => { setActiveAlert(ev); setView('map'); }}
            onClose={() => setView('map')}
          />
        )}
        {activeAlert && !subOpen && (
          <AlertDrawer event={activeAlert} locations={locations} onClose={() => setActiveAlert(null)} onShare={setShareTarget} />
        )}

        {shareTarget && <ShareModal thing={shareTarget} onClose={() => setShareTarget(null)} />}

        {toast && <div className="toast">{toast}</div>}
      </main>
    </div>
  );
}
