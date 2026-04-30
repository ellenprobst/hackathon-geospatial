'use client';

export function TopBar({ alertCount }: { alertCount: number }) {
  return (
    <div className="top">
      <div className="title-block">
        <div className="h1"><span className="dot" />THE 6 WATCH</div>
        <div className="sub">@HYPER_LOCAL_AWARENESS / TORONTO · THE 6IX</div>
      </div>
      <div className="stat-block">
        <div className="stat-num">{String(alertCount).padStart(3, '0')}</div>
        <div className="stat-lbl">ACTIVE SIGNALS<br />WITHIN GTA VIEWPORT</div>
      </div>
    </div>
  );
}
