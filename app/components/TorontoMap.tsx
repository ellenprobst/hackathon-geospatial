'use client';

import { useEffect, useReducer, useRef, useState } from 'react';
import type { AlertEvent, DraftPin, UserLocation } from '../types';

const PC: Record<string, string> = {
  CRITICAL: '#E84B3C', URGENT: '#E89B3C', ADVISORY: '#9C9286', OPPORTUNITY: '#5A7A4F',
};
const TORONTO_CENTER: [number, number] = [43.653, -79.384];
const DEFAULT_ZOOM = 12;

function LocationLabel({ x, y, name }: { x: number; y: number; name: string }) {
  const textRef = useRef<SVGTextElement>(null);
  const [textW, setTextW] = useState(0);
  useEffect(() => {
    if (textRef.current) setTextW(textRef.current.getComputedTextLength());
  }, [name]);
  const padX = 6;
  return (
    <>
      <rect x={x + 12} y={y - 22} width={textW + padX * 2} height="16" fill="#0A0A0A" />
      <text ref={textRef} x={x + 12 + padX} y={y - 10} fontSize="10" letterSpacing="2" fill="#F4F2EE" fontFamily="JetBrains Mono" fontWeight="700">{name}</text>
    </>
  );
}

interface TorontoMapProps {
  events: AlertEvent[];
  locations: UserLocation[];
  onPickEvent: (ev: AlertEvent) => void;
  onPickLocation: (loc: UserLocation) => void;
  draftPin: DraftPin | null;
  intensity?: number;
  onMapClick: (pt: { lat: number; lng: number }) => void;
  focusTarget?: { lat: number; lng: number; zoom?: number; ts: number } | null;
}

export function TorontoMap({ events, locations, onPickEvent, onPickLocation, draftPin, intensity = 1, onMapClick, focusTarget }: TorontoMapProps) {
  const mapEl = useRef<HTMLDivElement>(null);
  const overlayEl = useRef<SVGSVGElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const [size, setSize] = useState({ w: 1400, h: 900 });
  const [, force] = useReducer(x => x + 1, 0);
  const onMapClickRef = useRef(onMapClick);

  useEffect(() => { onMapClickRef.current = onMapClick; }, [onMapClick]);

  useEffect(() => {
    if (!mapEl.current || mapRef.current) return;
    let cancelled = false;
    let L: typeof import('leaflet');
    let cleanup: (() => void) | undefined;

    import('leaflet').then(mod => {
      if (cancelled || !mapEl.current || mapRef.current) return;
      L = mod.default ?? mod;

      // Leaflet default icon fix for webpack bundlers
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      });

      const m = L.map(mapEl.current, {
        center: TORONTO_CENTER,
        zoom: DEFAULT_ZOOM,
        zoomControl: false,
        attributionControl: true,
        preferCanvas: true,
      });

      L.control.zoom({ position: 'bottomright' }).addTo(m);

      L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        maxZoom: 19,
        subdomains: 'abcd',
        attribution: '© OpenStreetMap contributors © CARTO',
      }).addTo(m);

      mapRef.current = m;
      const bump = () => force();
      m.on('move zoom moveend zoomend', bump);

      const ro = new ResizeObserver(([e]) => {
        const { width, height } = e.contentRect;
        if (width > 0 && height > 0) { setSize({ w: width, h: height }); m.invalidateSize(); bump(); }
      });
      if (mapEl.current) ro.observe(mapEl.current);

      m.on('click', (ev: L.LeafletMouseEvent) => {
        onMapClickRef.current({ lat: ev.latlng.lat, lng: ev.latlng.lng });
      });

      bump();
      cleanup = () => { ro.disconnect(); m.remove(); mapRef.current = null; };
    });

    return () => { cancelled = true; cleanup?.(); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!focusTarget || !mapRef.current) return;
    mapRef.current.flyTo([focusTarget.lat, focusTarget.lng], focusTarget.zoom ?? 14, { duration: 0.8 });
  }, [focusTarget]);

  // Forward wheel events (incl. Mac trackpad pinch = wheel + ctrlKey) from SVG overlay
  // pins/blooms onto the Leaflet container, so the map zooms instead of the browser.
  useEffect(() => {
    const svg = overlayEl.current;
    const base = mapEl.current;
    if (!svg || !base) return;

    const handler = (e: WheelEvent) => {
      e.preventDefault();
      e.stopPropagation();
      const synth = new WheelEvent('wheel', {
        bubbles: true,
        cancelable: true,
        deltaX: e.deltaX,
        deltaY: e.deltaY,
        deltaZ: e.deltaZ,
        deltaMode: e.deltaMode,
        clientX: e.clientX,
        clientY: e.clientY,
        screenX: e.screenX,
        screenY: e.screenY,
        ctrlKey: e.ctrlKey,
        shiftKey: e.shiftKey,
        altKey: e.altKey,
        metaKey: e.metaKey,
      });
      base.dispatchEvent(synth);
    };

    svg.addEventListener('wheel', handler, { passive: false });
    return () => svg.removeEventListener('wheel', handler);
  }, []);

  const project = (lat: number, lng: number) => {
    if (!mapRef.current) return { x: 0, y: 0 };
    const p = mapRef.current.latLngToContainerPoint([lat, lng]);
    return { x: p.x, y: p.y };
  };

  const metersToPx = (m: number, lat: number) => {
    if (!mapRef.current) return 50;
    const p1 = mapRef.current.latLngToContainerPoint([lat, 0]);
    const p2 = mapRef.current.latLngToContainerPoint([lat + m / 111320, 0]);
    return Math.abs(p2.y - p1.y);
  };

  return (
    <div className="map">
      <div id="leaflet-base" ref={mapEl} />
      <svg ref={overlayEl} viewBox={`0 0 ${size.w} ${size.h}`} preserveAspectRatio="none" style={{ display: 'block' }}>
        <defs>
          {Object.entries(PC).map(([k, c]) => (
            <radialGradient key={k} id={`bloom-${k}`} cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor={c} stopOpacity={0.62 * intensity} />
              <stop offset="35%" stopColor={c} stopOpacity={0.30 * intensity} />
              <stop offset="100%" stopColor={c} stopOpacity="0" />
            </radialGradient>
          ))}
        </defs>

        {/* Location radius circles — rendered first so event pins sit above them */}
        {locations.map(loc => {
          const { x, y } = project(loc.lat, loc.lng);
          const r = Math.max(40, metersToPx((loc.radiusKm || 1.5) * 1000, loc.lat));
          return (
            <circle key={'lc-' + loc.id} cx={x} cy={y} r={r}
              fill="rgba(10,10,10,.04)" stroke="#0A0A0A" strokeWidth="1"
              strokeDasharray="3 3" opacity=".75" style={{ pointerEvents: 'none' }}
            />
          );
        })}

        <g style={{ mixBlendMode: 'multiply' }}>
          {events.map(ev => {
            const { x, y } = project(ev.lat, ev.lng);
            const r = Math.max(60, metersToPx(ev.radiusM || 1000, ev.lat));
            return (
              <circle key={ev.id} cx={x} cy={y} r={r}
                fill={`url(#bloom-${ev.priority})`}
                style={{ cursor: 'pointer' }}
                onClick={e => { e.stopPropagation(); onPickEvent(ev); }}
              />
            );
          })}
        </g>

        {events.map(ev => {
          const { x, y } = project(ev.lat, ev.lng);
          const c = PC[ev.priority];
          const label = ev.event.toUpperCase();
          const labelW = label.length * 7.4 + 18;
          return (
            <g key={'p-' + ev.id} className="pin" onClick={e => { e.stopPropagation(); onPickEvent(ev); }}>
              <circle className="ring" cx={x} cy={y} r="16" fill="none" stroke={c} strokeWidth="1.2" opacity=".55" />
              <circle cx={x} cy={y} r="4" fill="#0A0A0A" />
              <line x1={x - 12} x2={x - 6} y1={y} y2={y} stroke="#0A0A0A" strokeWidth="1" />
              <line x1={x + 6} x2={x + 12} y1={y} y2={y} stroke="#0A0A0A" strokeWidth="1" />
              <line x1={x} x2={x} y1={y - 12} y2={y - 6} stroke="#0A0A0A" strokeWidth="1" />
              <line x1={x} x2={x} y1={y + 6} y2={y + 12} stroke="#0A0A0A" strokeWidth="1" />
              <rect x={x + 10} y={y - 9} width={labelW} height="16" fill="#0A0A0A" />
              <text x={x + 19} y={y + 2.5} fontSize="10" letterSpacing="1.5" fill="#F4F2EE" fontFamily="JetBrains Mono" fontWeight="700">{label}</text>
            </g>
          );
        })}

        {/* Location marker icons — rendered after event pins so they stay visible */}
        {locations.map(loc => {
          const { x, y } = project(loc.lat, loc.lng);
          return (
            <g key={'l-' + loc.id} className="pin" style={{ cursor: 'pointer' }} onClick={e => { e.stopPropagation(); onPickLocation(loc); }}>
              <rect x={x - 8} y={y - 8} width="16" height="16" fill="#F4F2EE" stroke="#0A0A0A" strokeWidth="1.4" />
              <rect x={x - 3} y={y - 3} width="6" height="6" fill="#0A0A0A" />
              <LocationLabel x={x} y={y} name={(loc.name ?? '').toUpperCase()} />
            </g>
          );
        })}

        {draftPin && draftPin.lat && (() => {
          const { x, y } = project(draftPin.lat, draftPin.lng);
          const r = Math.max(40, metersToPx((draftPin.radiusKm || 1.5) * 1000, draftPin.lat));
          return (
            <g key="draft">
              <circle cx={x} cy={y} r={r} fill="rgba(232,75,60,.08)" stroke="#E84B3C" strokeWidth="1.4" strokeDasharray="4 3" />
              <rect x={x - 9} y={y - 9} width="18" height="18" fill="#F4F2EE" stroke="#E84B3C" strokeWidth="1.6" />
              <rect x={x - 3} y={y - 3} width="6" height="6" fill="#E84B3C" />
              <rect x={x + 14} y={y - 24} width="120" height="16" fill="#E84B3C" />
              <text x={x + 20} y={y - 12} fontSize="10" letterSpacing="2" fill="#F4F2EE" fontFamily="JetBrains Mono" fontWeight="700">+ NEW LOCATION</text>
            </g>
          );
        })()}
      </svg>
    </div>
  );
}
