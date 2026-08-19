# itechcup-2026 — Device-Adaptive Dashboard

A Next.js 16.3.1 (App Router) web template whose home page renders a **device-specific dashboard view** — mobile, tablet, or desktop — selected by the visitor's device and corrected live on window resize.

> This project is a competition (IteachCup 2026) template. The dashboard views are **empty scaffolds** ready for the team to fill in.

## Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 16.3.1 (App Router, `src/`) |
| UI | React 19.2.8, Tailwind v4 (CSS-first config in `src/app/globals.css`) |
| Runtime | Node 26 (native TS type stripping) |
| Tests | Node's `node:test` + `react-dom/server` `renderToString` — no jsdom, no framework |

## Getting Started

```bash
npm install
npm run dev        # http://localhost:3000
```

Other commands:

```bash
npm run build      # production build (must pass; / is dynamic ƒ)
npm run lint       # eslint
npm run start      # serve the production build
node --import ./tsx-hooks.mjs --test   # run ALL tests (no npm test script)
node --import ./tsx-hooks.mjs --test src/lib/device.test.ts  # one file
```

## How the Architecture Works

**Request flow:**

1. `src/proxy.ts` — reads the User-Agent, normalizes it to `mobile|tablet|desktop`, and sets the `x-device-type` request header. **Must live under `src/`** (Next 16.3.1 only scans `src/` for proxy/middleware files — a root-level `proxy.ts` never executes).
2. `src/app/page.tsx` (Server Component) — reads `x-device-type` via `await headers()` (fallback `desktop`), fetches dashboard data, and renders `<DashboardView data initialDeviceType />`.
3. `src/components/DashboardView.tsx` — client dispatcher. Calls `useLiveDeviceType(initialDeviceType)` and renders the matching `DashboardMobile` / `DashboardTablet` / `DashboardDesktop` scaffold.
4. `src/hooks/use-live-device-type.ts` — `useSyncExternalStore` over `matchMedia` breakpoints. The third argument (server snapshot = `initialDeviceType`) makes the server HTML and first client render identical → **no hydration mismatch**; after hydration the store re-renders on resize.

**Flat module layout** — `src/`:

```
types.ts                          # DeviceType, DashboardData, DashboardViewProps, DashboardDispatcherProps
components/DashboardView.tsx      # client dispatcher (owns the views record)
components/Dashboard{Mobile,Tablet,Desktop}.tsx   # one view per developer (empty scaffolds)
hooks/use-dashboard.ts            # shared client state: { data, viewState, actions }
hooks/use-live-device-type.ts     # live viewport → device type (matchMedia)
lib/device.ts                     # normalizeDeviceType, deviceTypeFromWidth, breakpoint constants
lib/get-dashboard-data.ts         # mock data provider (seam for a real API later)
```

## Design Rules

- **Never mix responsive breakpoints in a view file.** Mobile = base/`max-*` only; Tablet = `md:` only; Desktop = `lg:` only. All breakpoint logic lives in `use-live-device-type.ts` + `src/lib/device.ts`.
- **Never hard-code breakpoint numbers** — import `TABLET_MIN_WIDTH` (768) / `DESKTOP_MIN_WIDTH` (1024) from `src/lib/device.ts`.
- Views stay **presentational**: no `headers()`, no data fetching inside view components.
- **TDD**: write the failing test first, verify RED, implement, verify GREEN, commit.

## Contributing (Tests)

- `*.test.ts`/`*.test.tsx` live next to source, imported with explicit `.ts`/`.tsx` extensions.
- `tsx-hooks.mjs` transpiles `.tsx` and redirects `next/headers` → `next-headers.mock.mjs`.
- Control the mocked `x-device-type` header with `globalThis.__TEST_DEVICE_TYPE` (`undefined` = absent).
- Assert view dispatch via `data-view="mobile|tablet|desktop"` in the rendered HTML.
- Full check before a PR: `node --import ./tsx-hooks.mjs --test` → exit 0; `npm run lint` → exit 0; `npm run build` → exit 0.

## Known Issues

- **Hive worktrees** reject symlinked `node_modules` (Turbopack). Run a real `npm ci` in each `.hive/.worktrees/<feature>/<task>/`.
- **`npm run lint` from the repo root** will scan `.hive/.worktrees/**/.next` unless `eslint.config.mjs` ignores `.hive/**` — keep that entry.

## Verification Notes

- Server-side UA detection is verified with a real running server, not by grepping the compiled bundle: `npm run build && npm run start`, then e.g. `curl -s -H "User-Agent: Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1" http://localhost:3000/ | grep -o 'data-view="[a-z]*"'` → `mobile`.
- The proxy is registered under `/_middleware` in `.next/server/functions-config-manifest.json`; `.next/server/middleware-manifest.json` stays empty in Next 16.3.1 — don't use it as a check.
