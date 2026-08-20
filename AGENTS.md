<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Device-Adaptive Dashboard (itechcup-2026)

Next.js 16.3.1 (App Router under `src/`, Tailwind v4 CSS-first config in `src/app/globals.css`, React 19.2.8, Node 26, `@/*` → `./src/*`). Home page renders a device-specific dashboard; views are scaffolds for the team to fill in.

## Project Structure

```
src/
├── app/
│   ├── page.tsx                  # Home (Server Component, reads device type)
│   ├── layout.tsx                # Root layout (Geist fonts)
│   ├── globals.css               # Tailwind v4 config (@theme inline)
│   └── api/
│       ├── sekolah/route.ts      # Schools CRUD
│       └── siswa/route.ts        # Students CRUD
├── components/                   # All 'use client'
│   ├── DashboardView.tsx         # Device dispatcher
│   └── Dashboard{Mobile,Tablet,Desktop}.tsx
├── hooks/
│   ├── use-live-device-type.ts   # matchMedia → device type
│   └── use-dashboard.ts          # Client state
├── lib/
│   ├── device.ts                 # normalizeDeviceType, breakpoints
│   ├── prisma.ts                 # Prisma client singleton
│   ├── get-dashboard-data.ts     # Mock data
│   ├── seed.ts                   # DB seed (npx tsx src/lib/seed.ts)
│   └── test-db.ts                # Connection test
├── types.ts                      # Shared types (DeviceType, DashboardData, …)
└── proxy.ts                      # UA → x-device-type header
```

**Imports:** Always `@/` aliases (`@/lib/prisma`), never relative (`../lib/prisma`).

## Commands

| Task | Command |
|------|---------|
| Dev server | `npm run dev` |
| Production build | `npm run build` (must pass; `/` is dynamic `ƒ`) |
| Lint | `npm run lint` |
| Tests | `node --import ./tsx-hooks.mjs --test` |
| Single test file | `node --import ./tsx-hooks.mjs --test src/path/to/file.test.ts` |
| DB push schema | `npm run db:push` |
| DB seed | `npm run db:seed` |
| DB connection test | `npx tsx src/lib/test-db.ts` |
| Prisma Studio | `npm run db:studio` |

There is **no `npm test` script**. Tests run via Node's built-in test runner with the custom `tsx-hooks.mjs` loader.

## Database

PostgreSQL via Prisma ORM v7 (`prisma-client-js` generator, `@prisma/adapter-pg` driver adapter). Docker Compose provides Postgres 17 on port 5432 (`docker compose up -d`).

### Schema

- **Sekolah** — UUID `id`, unique `npsn`/`emailResmi`, hashed `password`, `namaSekolah`, `namaPenanggungJawab`, `alamatLengkap` (Text), `kontakSekolah`, timestamps. Has `daftarSiswa` relation.
- **Siswa** — UUID `id`, unique `nis`, `kelas`, `sekolahId` FK (cascade delete), `verificationStatus` (enum: `PENDING`/`VERIFIED`/`REJECTED`), optional `catatanPenolakan` (Text), timestamps.

> **Note:** `API.md` still references a removed `jabatanAdmin` field — trust the schema and API route handlers, not `API.md`.

## API Routes

All responses: `{ data?, error? }`. Routes under `src/app/api/`.

| Method | Route | Notes |
|--------|-------|-------|
| GET | `/api/sekolah` | `?search=` filters `namaSekolah`/`npsn`/`emailResmi` |
| POST | `/api/sekolah` | Creates school; validates required fields |
| GET/PUT/DELETE | `/api/sekolah/[id]` | GET includes `daftarSiswa`; DELETE cascades |
| GET | `/api/siswa` | `?sekolahId=` and `?status=` filters |
| POST | `/api/siswa` | Creates student; `verificationStatus` defaults `PENDING` |
| GET/PUT/DELETE | `/api/siswa/[id]` | GET includes `sekolah` |

## Test Conventions

- **Node built-in `node:test`** + `react-dom/server` `renderToString` — no jsdom, no test framework.
- Test files sit next to source (`device.test.ts` beside `device.ts`); imports use explicit `.ts`/`.tsx` extensions (`allowImportingTsExtensions`).
- `tsx-hooks.mjs` transpiles `.tsx` (`.ts` handled by Node 26 native type stripping); also redirects `next/headers` → `next-headers.mock.mjs`.
- Mock device type per test via `globalThis.__TEST_DEVICE_TYPE` (set to `undefined` for "header absent").
- Assert view dispatch with `data-view="mobile|tablet|desktop"` in rendered HTML.
- **Verification checklist:** `node --import ./tsx-hooks.mjs --test` → exit 0; `npm run lint` → exit 0; `npm run build` → exit 0.

## Architecture (request flow)

1. `src/proxy.ts` — reads `userAgent(request).device.type`, normalizes to `mobile|tablet|desktop`, sets `x-device-type` header. **Must live under `src/`** — root-level file compiles but never executes.
2. `src/app/page.tsx` — Server Component: `await headers()` → `normalizeDeviceType()` (fallback `desktop`) → `getDashboardData()` → renders `<DashboardView data initialDeviceType />`.
3. `src/components/DashboardView.tsx` — `'use client'` dispatcher; calls `useLiveDeviceType(initialDeviceType)` and renders the matching view.
4. `src/hooks/use-live-device-type.ts` — `useSyncExternalStore(subscribeToViewport, getViewportDeviceType, () => initialDeviceType)`. Third arg (server snapshot) prevents hydration mismatch; after hydration, `matchMedia` re-renders on resize.

Shared contract: `src/types.ts`, `src/lib/device.ts` (`TABLET_MIN_WIDTH=768`, `DESKTOP_MIN_WIDTH=1024`), `src/lib/get-dashboard-data.ts`, `src/hooks/use-dashboard.ts`.

## Design Rules

- **Never mix responsive breakpoints in a view file.** Mobile = base/`max-*` only; Tablet = `md:` only (768–1023); Desktop = `lg:` only (≥1024). Breakpoint logic lives only in `use-live-device-type.ts` + `src/lib/device.ts`.
- **Never hard-code breakpoint numbers** — import `TABLET_MIN_WIDTH`/`DESKTOP_MIN_WIDTH` from `@/lib/device.ts`.
- Views stay presentational: no `headers()`, no data fetching inside view components.

## Gotchas

- **`proxy.ts` must live under `src/`** — Next 16.3.1 scans only `src/` (`rootDir = join(appDir, '..')`) for `proxy.*`/`middleware.*`. Root-level compiles but manifest stays empty → no header set. Verify with a running server (`curl -H "User-Agent: ...iPhone..." http://localhost:3000/`), not by grepping the compiled bundle. The proxy registers under `/_middleware` in `.next/server/functions-config-manifest.json` (`middleware-manifest.json` stays empty in 16.3.1).
- **Turbopack rejects symlinked `node_modules`** in worktrees. Run `npm ci` in each worktree, don't symlink.
- **`npm run lint` scans `.hive/.worktrees/**/.next`** and reports build-artifact errors unless `eslint.config.mjs` ignores `.hive/**`. Keep both the ignore entry and `/.hive/` in `.gitignore`.
- **Hive worktrees** branch off `main`. Before a dependent task, merge the dependency branch first (`git merge --no-ff hive/<feature>/<NN>-<task>`); commit only the task's own files.
- **`pkill -f "next dev"`** may leave a `next-server (v1)` child holding port 3000 — check `ss -ltnp` and kill the child PID before restarting.
