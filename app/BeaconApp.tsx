'use client';

import { useState } from 'react';
import { SEED_EVENTS } from './data/events';
import type { AlertEvent, DraftPin, LayerVisibility, UserLocation } from './types';
import { Rail } from './components/Rail';
import { TopBar } from './components/TopBar';
import { Inspector } from './components/Inspector';
import { Scrubber } from './components/Scrubber';
import { TorontoMap } from './components/TorontoMap';
import { AlertDrawer, HistoryPanel, LocationsPanel, ShareModal } from './components/Panels';
import { SubscribePanel } from './components/SubFlow';
import { Icon } from './components/Icon';

export default function BeaconApp() {
  const [view, setView] = useState<'map' | 'list' | 'history'>('map');
  const [layers, setLayers] = useState<LayerVisibility>({ CRITICAL: true, URGENT: true, ADVISORY: true, OPPORTUNITY: true });
  const [locations, setLocations] = useState<UserLocation[]>([]);
  const [activeAlert, setActiveAlert] = useState<AlertEvent | null>(null);
  const [shareTarget, setShareTarget] = useState<AlertEvent | UserLocation | null>(null);
  const [subOpen, setSubOpen] = useState(false);
  const [subMode, setSubMode] = useState<'create' | 'edit'>('create');
  const [subInitial, setSubInitial] = useState<Omit<UserLocation, 'id' | 'lat' | 'lng'> | null>(null);
  const [draftPin, setDraftPin] = useState<DraftPin | null>(null);
  const [offsetH, setOffsetH] = useState(0);
  const [toast, setToast] = useState<string | null>(null);

  const flash = (m: string) => { setToast(m); setTimeout(() => setToast(null), 2200); };

  const visibleEvents = SEED_EVENTS.filter(e => layers[e.priority]);

  const onMapClick = (pt: { lat: number; lng: number }) => {
    if (subOpen) setDraftPin({ lat: pt.lat, lng: pt.lng, radiusKm: draftPin?.radiusKm ?? 1.5 });
  };

  const startCreate = () => {
    setSubMode('create');
    setSubInitial(null);
    setDraftPin(null);
    setSubOpen(true);
    setView('map');
    setActiveAlert(null);
  };

  const startEdit = (loc: UserLocation) => {
    setSubMode('edit');
    setSubInitial({ name: loc.name, address: loc.address, kind: loc.kind, priorities: loc.priorities, notifs: loc.notifs, radiusKm: loc.radiusKm });
    setDraftPin({ lat: loc.lat, lng: loc.lng, radiusKm: loc.radiusKm });
    setSubOpen(true);
    setView('map');
  };

  const saveSub = (data: Omit<UserLocation, 'id'>) => {
    if (subMode === 'edit' && subInitial) {
      setLocations(L => L.map(l => l.name === subInitial.name ? { ...l, ...data } : l));
      flash('LOCATION UPDATED');
    } else {
      const id = 'L' + (locations.length + 1).toString().padStart(2, '0');
      setLocations(L => [...L, { ...data, id }]);
      flash('BEACON ACTIVATED — ' + data.name);
    }
    setSubOpen(false);
    setDraftPin(null);
    setView('list');
  };

  const deleteLoc = (loc: UserLocation) => {
    setLocations(L => L.filter(l => l.id !== loc.id));
    flash('LOCATION REMOVED — ' + loc.name);
  };

  const focusLoc = (loc: UserLocation) => {
    setView('map');
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
        />

        <TopBar alertCount={visibleEvents.length} />

        {showRightCol && (
          <div className="right-col">
            <Inspector events={visibleEvents} layers={layers} setLayers={setLayers} />
            <button className="btn full" onClick={startCreate}><Icon name="plus" /> ADD LOCATION</button>
          </div>
        )}

        <div className={`watermark ${sidePanelOpen ? '' : 'no-right'}`}>
          STRICTLY CONFIDENTIAL — BEACON.TO / SYSTEM 365
        </div>

        <div className="coords">43.6532° N, 79.3832° W · ZOOM 12 · TILE 18.3</div>

        <Scrubber offsetH={offsetH} setOffsetH={setOffsetH} events={SEED_EVENTS} withPanel={sidePanelOpen} />

        {subOpen && (
          <SubscribePanel
            mode={subMode}
            initial={subInitial}
            draft={draftPin}
            setDraft={setDraftPin}
            onClose={() => { setSubOpen(false); setDraftPin(null); }}
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
          <AlertDrawer event={activeAlert} onClose={() => setActiveAlert(null)} onShare={setShareTarget} />
        )}

        {shareTarget && <ShareModal thing={shareTarget} onClose={() => setShareTarget(null)} />}

        {toast && <div className="toast">{toast}</div>}
      </main>
    </div>
  );
}
