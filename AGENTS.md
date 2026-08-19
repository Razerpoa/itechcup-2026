<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Device-Adaptive Dashboard (itechcup-2026)

Next.js 16.3.1 (App Router under `src/`, Tailwind v4 CSS-first config in `src/app/globals.css`, React 19.2.8, Node 26, `@/*` → `./src/*`). The home page renders a device-specific dashboard view; views are currently **empty scaffolds** for the team to fill in.

## Build & Test Commands

- `npm run dev` — dev server
- `npm run build` — production build (must pass; route `/` is dynamic `ƒ`)
- `npm run lint` — eslint
- `npm run start` — serve the production build (for manual browser checks)
- **Tests: `node --import ./tsx-hooks.mjs --test`** — there is NO `npm test` script. Run a single file by appending its path.

## Database

PostgreSQL via Prisma ORM (v7, `prisma-client-js` generator → imports from `@prisma/client`). Connection uses `@prisma/adapter-pg` driver adapter. Prisma client singleton at `src/lib/prisma.ts`.

### DB Scripts

- `npm run db:push` — push schema to database (no migrations)
- `npm run db:seed` — seed with sample Indonesian school + student data
- `npm run db:studio` — open Prisma Studio GUI
- `npx tsx src/lib/test-db.ts` — quick connection test

### Schema

- **Sekolah** — schools with UUID `id`, unique `npsn`/`emailResmi`, hashed `password`, contact info, timestamps. Has `daftarSiswa` relation.
- **Siswa** — students with UUID `id`, unique `nis`, `kelas`, `sekolahId` FK (cascade delete), `verificationStatus` (enum: `PENDING`/`VERIFIED`/`REJECTED`), optional `catatanPenolakan`, timestamps.

### API Routes (App Router)

All responses use `{ data?, error? }` format.

| Method | Route | Description |
|--------|-------|-------------|
| `GET` | `/api/sekolah` | List all schools. `?search=` filters by `namaSekolah`, `npsn`, or `emailResmi` |
| `POST` | `/api/sekolah` | Create school (body: all required fields) |
| `GET` | `/api/sekolah/[id]` | Get school by UUID (includes `daftarSiswa`) |
| `PUT` | `/api/sekolah/[id]` | Update school by UUID |
| `DELETE` | `/api/sekolah/[id]` | Delete school by UUID (cascades to `Siswa`) |
| `GET` | `/api/siswa` | List all students. Filters: `?sekolahId=`, `?status=PENDING\|VERIFIED\|REJECTED` |
| `POST` | `/api/siswa` | Create student (body: `namaLengkap`, `nis`, `kelas`, `sekolahId`) |
| `GET` | `/api/siswa/[id]` | Get student by UUID (includes `sekolah`) |
| `PUT` | `/api/siswa/[id]` | Update student (can change `verificationStatus`, `catatanPenolakan`) |
| `DELETE` | `/api/siswa/[id]` | Delete student by UUID |

## Test Conventions

- Node's built-in `node:test` + `react-dom/server` `renderToString` — **no jsdom, no test framework**.
- `*.test.ts`/`*.test.tsx` sit next to source; imports use explicit `.ts`/`.tsx` extensions (`allowImportingTsExtensions`).
- `tsx-hooks.mjs` transpiles `.tsx` (`.ts` is handled by Node 26 native type stripping); it also redirects `next/headers` → `next-headers.mock.mjs`.
- Control the mocked `x-device-type` header per test via `globalThis.__TEST_DEVICE_TYPE` (set to `undefined` for "header absent").
- Assert view dispatch with `data-view="mobile|tablet|desktop"` in the rendered HTML.
- Verify with: `node --import ./tsx-hooks.mjs --test` → exit 0, all pass; `npm run lint` → exit 0; `npm run build` → exit 0.

## Architecture (request flow)

1. `src/proxy.ts` — reads `userAgent(request).device.type`, normalizes to `mobile|tablet|desktop`, sets the `x-device-type` request header. **Must live under `src/`** — a root-level `proxy.ts` compiles but never executes (Next 16.3.1 scans only `src/` for proxy/middleware files).
2. `src/app/page.tsx` — Server Component: `await headers()` → `normalizeDeviceType()` (fallback `desktop`) → `getDashboardData()` → renders `<DashboardView data initialDeviceType />`. Server decides the **initial** device only.
3. `src/features/dashboard/components/DashboardView.tsx` — `'use client'` dispatcher; owns the `views` record; calls `useLiveDeviceType(initialDeviceType)` and renders the matching view.
4. `src/features/dashboard/hooks/use-live-device-type.ts` — `useSyncExternalStore(subscribeToViewport, getViewportDeviceType, () => initialDeviceType)`. The third arg (server snapshot) makes SSR/hydration match → **no hydration mismatch**; after hydration, `matchMedia` re-renders the view on resize.
5. `DashboardMobile.tsx` / `DashboardTablet.tsx` / `DashboardDesktop.tsx` — `'use client'` view scaffolds, each receives `data: DashboardData` and calls the shared `useDashboard(data)` hook.

Shared contract: `src/features/dashboard/types.ts` (`DeviceType`, `DashboardData`, `DashboardViewProps`), `lib/device.ts` (normalizer + `deviceTypeFromWidth` + `TABLET_MIN_WIDTH=768`/`DESKTOP_MIN_WIDTH=1024`), `lib/get-dashboard-data.ts` (mock data seam), `hooks/use-dashboard.ts` (client state: `{ data, viewState, actions }`).

## Rules

- **Never mix responsive breakpoints in a view file.** Mobile = base/`max-*` only; Tablet = `md:` only (768–1023); Desktop = `lg:` only (≥1024). The only breakpoint logic in the codebase lives in `use-live-device-type.ts` + `lib/device.ts`.
- **Never hard-code breakpoint numbers** — import `TABLET_MIN_WIDTH`/`DESKTOP_MIN_WIDTH` from `lib/device.ts`.
- Keep views presentational: no `headers()`, no data fetching inside view components.
- TDD: write the failing test first, verify RED, implement, verify GREEN, commit.

## Gotchas

- **`proxy.ts` must live under `src/`** in this `src/app` layout. Next 16.3.1 scans only `src/` (`rootDir = join(appDir, '..')`) for `proxy.*`/`middleware.*`; a root-level file compiles but never executes (the compiled bundle contains it, but the manifest stays empty and no header is set). The proxy is registered under `/_middleware` in `.next/server/functions-config-manifest.json` (`middleware-manifest.json` stays empty in 16.3.1 — don't use it as a check). Any claim that "UA detection sets the header server-side" must be verified with a real running server (e.g. `curl -H "User-Agent: ...iPhone..." http://localhost:3000/` and check `data-view`), not by grepping the compiled bundle.
- **Turbopack rejects symlinked `node_modules`** in worktrees (`Symlink ... is invalid`). Run a real `npm ci` in each `.hive/.worktrees/<feature>/<task>/` worktree.
- **`npm run lint` from the repo root scans `.hive/.worktrees/**/.next` output** and will report hundreds of build-artifact errors unless `eslint.config.mjs` ignores `.hive/**`. Keep that ignore entry and the `/.hive/` entry in `.gitignore`.
- Workers: Hive task worktrees branch off `main`, so before starting a dependent task, merge the completed dependency branch first (`git merge --no-ff hive/<feature>/<NN>-<task> -m "hive: merge <NN>-<task> (dependency)"`); only commit the task's own files in the task commit.
- `pkill -f "next dev"` may leave a `next-server (v1)` child holding port 3000 — check `ss -ltnp` and kill the child PID before restarting a server.
