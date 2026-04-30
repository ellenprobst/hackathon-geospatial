'use client';

import { useEffect, useRef, useState } from 'react';
import type { AlertEvent } from '../types';
import { Icon } from './Icon';

const PRIORITY_CLASS: Record<string, string> = {
  CRITICAL: 'crit', URGENT: 'urg', ADVISORY: 'adv', OPPORTUNITY: 'opp',
};

interface ScrubberProps {
  offsetH: number;
  setOffsetH: (h: number) => void;
  events: AlertEvent[];
  withPanel: boolean;
}

export function Scrubber({ offsetH, setOffsetH, events, withPanel }: ScrubberProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    if (!playing) return;
    const id = setInterval(() => setOffsetH(Math.min(0, offsetH >= 0 ? -24 : offsetH + 0.25)), 60);
    return () => clearInterval(id);
  }, [playing, offsetH, setOffsetH]);

  const pct = ((offsetH + 24) / 24) * 100;

  const handleDrag = (e: MouseEvent | React.MouseEvent) => {
    if (!trackRef.current) return;
    const r = trackRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(r.width, e.clientX - r.left));
    setOffsetH(-24 + (x / r.width) * 24);
  };

  const stamp = (() => {
    const d = new Date(Date.now() + offsetH * 3600 * 1000);
    return d.toLocaleString('en-CA', { month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: false }).toUpperCase();
  })();

  return (
    <div className={`bottom ${withPanel ? 'with-panel' : ''}`}>
      <button className="btn ghost sm" onClick={() => setPlaying(p => !p)} style={{ height: 30, padding: '0 10px' }}>
        <Icon name={playing ? 'pause' : 'play'} /> {playing ? 'PAUSE' : 'REWIND'}
      </button>
      <div className="scrubber">
        <div className="scrub-end">−24H</div>
        <div
          className="scrub-track"
          ref={trackRef}
          onMouseDown={e => {
            handleDrag(e);
            const mv = (ev: MouseEvent) => handleDrag(ev);
            const up = () => { document.removeEventListener('mousemove', mv); document.removeEventListener('mouseup', up); };
            document.addEventListener('mousemove', mv);
            document.addEventListener('mouseup', up);
          }}
        >
          <div className="scrub-line" />
          {Array.from({ length: 25 }, (_, i) => (
            <div key={i} className="scrub-tick" style={{ left: `${(i / 24) * 100}%` }} />
          ))}
          {events.map((ev, i) => (
            <div key={ev.id} className={`scrub-event ${PRIORITY_CLASS[ev.priority]}`} style={{ left: `${20 + (i * 11) % 75}%` }} title={ev.event} />
          ))}
          <div className="scrub-handle" style={{ left: `${pct}%` }} />
        </div>
        <div className="scrub-end">NOW</div>
        <div className="scrub-stamp">{stamp}</div>
      </div>
      <div className="legend">
        <span>HEAT</span>
        <div className="grad" />
        <span>ALERT INTENSITY</span>
      </div>
    </div>
  );
}
