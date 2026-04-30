# THE 6 WATCH — Hackathon Context

Hyper-local awareness app for Toronto. Single-page Next.js 16 app, formerly BEACON.TO, now THE 6 WATCH. Map-first UI with alert blooms, layer toggles, subscribe flow, and a persona-aware alert drawer.

## Stack

- **Next.js 16.2.4** — has breaking changes from training data; check `AGENTS.md` and `node_modules/next/dist/docs/` before writing Next-specific code
- React 19, TypeScript strict mode
- Leaflet 1.9.4 + CARTO Voyager tiles for the basemap; SVG overlays for blooms and pins
- JetBrains Mono + Inter via Google Fonts CDN
- No Tailwind utility usage in practice — all styling lives in `app/globals.css`

## Layout

```
app/
  BeaconApp.tsx          root client component
  components/            Rail, TopBar, Inspector, TorontoMap, Panels, SubFlow, Icon
  data/events.ts         24 hand-enriched alert events (display-shaped)
  globals.css            single source of visual truth
  layout.tsx, page.tsx
  types.ts               AlertEvent, UserLocation, LayerVisibility, DraftPin

lib/alerts/              ingestion scaffold (reference only, not used at runtime)
  adapters/              raw payload → AlertEvent stubs
  mocks/                 real Toronto data snapshots from 6 sources
  types.ts               internal Source enum

TODO.md                  current followup punch list
```

## Data flow (Path B — no live LLM)

The app is fully static. `SEED_EVENTS` in `app/data/events.ts` are hand-authored to look like LLM-enriched output (action, plain, area, conf fields all pre-filled). We chose this path so the demo is bulletproof: no API key in the browser, no network dependency, no rate-limit risk on stage.

The `lib/alerts/` scaffold is reference-only:
- `mocks/` holds real snapshots: AQHI, MSC weather alerts, 511 Ontario, Toronto Fire (XML→JSON), TPS Major Crime Indicators, plus a synthetic TTC mock
- `adapters/` has stubs for `ontario511` and `mscAqhi` — the rest are placeholders

If we ever want a live ingestion path: extend the adapters, add a build script that batches all stubs through Claude, write enriched output to `app/data/events.json`, and import that instead of the hand-authored seed.

The recommendation tiers shown in `Panels.tsx` (`RECO_LIB`) are canned, keyed by `priority × kind`. They are not LLM-generated and don't read `event.action` — that field is unused in the drawer (kept on the type for future use).

## Brand and copy

- **THE 6 WATCH** (not BEACON, not BEACON.TO)
- Tagline: `@HYPER_LOCAL_AWARENESS / TORONTO · THE 6IX`
- Watermark: `STRICTLY CONFIDENTIAL — THE 6 WATCH / SYSTEM 416`
- localStorage key: `the6watch_locations`
- Share URL pattern: `https://the6watch.to/s/...`
- Default seed locations: HOME, OFFICE, COTTAGE

## Designer handoff

The designer ships a zip of plain JSX (Vibestudio-style export) with HTML, components, screenshots, and an embedded Tweaks panel that depends on a `window.useTweaks` / `window.TweaksPanel` runtime we don't have.

Pattern when a new zip lands:

1. Treat the zip as the source of visual truth — CSS, structure, copy, branding
2. Port JSX → TSX manually, adding type annotations
3. Drop the Tweaks panel runtime code (we don't have the harness); cherry-pick standalone pieces inline
4. Cherry-pick standalone helpers (e.g. the Photon geocoder hook, `RECO_LIB`) directly into the TSX files
5. Re-apply repo-side fixes (localStorage persistence, etc.) on top of the port

## Code style

- Match the surrounding file's conventions (semicolons in TSX here)
- No em dashes in commit messages
- Commit messages: single line, no `Co-Authored-By` trailer
- Stage specific files by name, not `git add -A`

## GitHub issues — collaborator handoff

Repo: `ellenprobst/hackathon-geospatial`
Issues: `https://github.com/ellenprobst/hackathon-geospatial/issues`

Issues are the truth-source for handoff between Collin and Ellen.

- **At the start of a session**, run `gh issue list --state open` to see what's outstanding. Surface any open issues that touch the area you're about to work in.
- **For bugs you find that aren't in scope**: open an issue (`gh issue create`) instead of silently fixing or shrugging it off. The other person can pick it up later.
- **For feature requests mentioned in passing**: same — capture them as issues if they're out of the current task's scope.
- **Before committing a fix**, check whether an open issue tracks it; reference it in the commit message (`Closes #12`) so it auto-closes on merge.
- **When you finish a chunk of work** and the other person needs to pick something up: write the next step as an issue, not as inline comments or DMs.

If you're unsure whether something deserves an issue, default to writing one. Issues are cheap; lost context is expensive.
