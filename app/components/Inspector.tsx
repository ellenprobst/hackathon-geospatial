'use client';

import type { AlertEvent, LayerVisibility, Priority, UserLocation } from '../types';

interface InspectorProps {
  events: AlertEvent[];
  layers: LayerVisibility;
  setLayers: (l: LayerVisibility) => void;
  locations?: UserLocation[];
  myLocationsOnly?: boolean;
  setMyLocationsOnly?: (v: boolean) => void;
}

export function Inspector({ events, layers, setLayers, locations = [], myLocationsOnly = false, setMyLocationsOnly }: InspectorProps) {
  const counts = {
    CRITICAL: events.filter(e => e.priority === 'CRITICAL').length,
    URGENT: events.filter(e => e.priority === 'URGENT').length,
    ADVISORY: events.filter(e => e.priority === 'ADVISORY').length,
    OPPORTUNITY: events.filter(e => e.priority === 'OPPORTUNITY').length,
  };

  const toggle = (k: Priority) => setLayers({ ...layers, [k]: !layers[k] });

  return (
    <>
      <div className="card">
        <div className="card-h"><span>INSPECTOR</span><span className="meta">LIVE / 03:42 PM</span></div>
        <div className="card-b">
          <div className="kv"><span className="k">VIEWPORT</span><span className="v">GTA · 41 KM²</span></div>
          <div className="kv"><span className="k">SIGNAL DENSITY</span><span className="v">HIGH</span></div>
          <div className="kv"><span className="k">CONFIDENCE</span><span className="v">±0.04</span></div>
          <div className="kv"><span className="k">FEEDS ACTIVE</span><span className="v">7 / 7</span></div>
        </div>
      </div>

      <div className="card">
        <div className="card-h"><span>ALERT LAYERS</span><span className="meta">{events.length} TOTAL</span></div>
        <div className="card-b">
          <div className="layers">
            <div className="layer" onClick={() => toggle('CRITICAL')}>
              <span className={`swatch ${layers.CRITICAL ? 'on crit' : 'off'}`} /><span>CRITICAL</span><span className="layer-cnt">{counts.CRITICAL}</span>
            </div>
            <div className="layer" onClick={() => toggle('URGENT')}>
              <span className={`swatch ${layers.URGENT ? 'on urg' : 'off'}`} /><span>URGENT</span><span className="layer-cnt">{counts.URGENT}</span>
            </div>
            <div className="layer" onClick={() => toggle('ADVISORY')}>
              <span className={`swatch ${layers.ADVISORY ? 'on adv' : 'off'}`} /><span>ADVISORY</span><span className="layer-cnt">{counts.ADVISORY}</span>
            </div>
            <div className="layer" onClick={() => toggle('OPPORTUNITY')}>
              <span className={`swatch ${layers.OPPORTUNITY ? 'on opp' : 'off'}`} /><span>OPPORTUNITY</span><span className="layer-cnt">{counts.OPPORTUNITY}</span>
            </div>
          </div>
          {locations.length > 0 && setMyLocationsOnly && (
            <div style={{ marginTop: 10, paddingTop: 10, borderTop: '1px solid var(--rule-soft)' }}>
              <div
                className="layer"
                onClick={() => setMyLocationsOnly(!myLocationsOnly)}
                style={{ padding: '4px 0' }}
              >
                <span className={`loc-filter-toggle${myLocationsOnly ? ' on' : ''}`} />
                <span>MY LOCATIONS ONLY</span>
                <span className="layer-cnt">{locations.length} BEACONS</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
