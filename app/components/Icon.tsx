'use client';

const common = { width: 16, height: 16, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.6, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };

export function Icon({ name }: { name: string }) {
  switch (name) {
    case 'home': return <svg {...common}><path d="M3 11 12 4l9 7"/><path d="M5 10v10h14V10"/></svg>;
    case 'plus': return <svg {...common}><circle cx="12" cy="12" r="9"/><path d="M8 12h8M12 8v8"/></svg>;
    case 'list': return <svg {...common}><path d="M4 6h16M4 12h16M4 18h16"/></svg>;
    case 'bell': return <svg {...common}><path d="M6 16V11a6 6 0 1 1 12 0v5l1.5 2H4.5L6 16z"/><path d="M10 20a2 2 0 0 0 4 0"/></svg>;
    case 'map': return <svg {...common}><path d="M3 6l6-2 6 2 6-2v14l-6 2-6-2-6 2z"/><path d="M9 4v16M15 6v16"/></svg>;
    case 'close': return <svg {...common}><path d="M6 6l12 12M18 6 6 18"/></svg>;
    case 'edit': return <svg {...common}><path d="M4 20h4l10-10-4-4L4 16z"/></svg>;
    case 'trash': return <svg {...common}><path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13"/></svg>;
    case 'share': return <svg {...common}><circle cx="6" cy="12" r="2.5"/><circle cx="18" cy="6" r="2.5"/><circle cx="18" cy="18" r="2.5"/><path d="M8 11l8-4M8 13l8 4"/></svg>;
    case 'condo': return <svg {...common}><rect x="6" y="3" width="12" height="18"/><path d="M9 7h2M13 7h2M9 11h2M13 11h2M9 15h2M13 15h2"/></svg>;
    case 'school': return <svg {...common}><path d="M2 9 12 4l10 5-10 5z"/><path d="M6 11v5c2 2 10 2 12 0v-5"/></svg>;
    case 'office': return <svg {...common}><rect x="3" y="6" width="18" height="14"/><path d="M7 10h2M11 10h2M15 10h2M7 14h2M11 14h2M15 14h2"/></svg>;
    case 'cottage': return <svg {...common}><path d="M3 12 12 5l9 7"/><path d="M5 11v9h14v-9"/><path d="M10 20v-5h4v5"/></svg>;
    case 'pin': return <svg {...common}><path d="M12 22s7-7.5 7-13a7 7 0 1 0-14 0c0 5.5 7 13 7 13z"/><circle cx="12" cy="9" r="2.5"/></svg>;
    case 'play': return <svg {...common}><path d="M8 5v14l11-7z" fill="currentColor"/></svg>;
    case 'pause': return <svg {...common}><rect x="7" y="5" width="3.5" height="14" fill="currentColor"/><rect x="13.5" y="5" width="3.5" height="14" fill="currentColor"/></svg>;
    default: return null;
  }
}
