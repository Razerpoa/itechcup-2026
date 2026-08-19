# Contributing to itechcup-2026

## Quick Start

```bash
git clone <repo-url>
cd itechcup-2026
npm install
docker compose up -d          # start PostgreSQL
npm run db:push               # create tables
npm run db:seed               # optional: sample data
npm run dev                   # http://localhost:3000
```

## Directory Structure

```
src/
├── app/                  # Pages & API routes (Next.js App Router)
│   ├── page.tsx          # Home page — reads device type, renders DashboardView
│   ├── layout.tsx        # Root layout (fonts, metadata)
│   ├── globals.css       # Tailwind v4 config
│   └── api/              # REST endpoints (sekolah/, siswa/)
├── components/           # React components (all 'use client')
│   ├── DashboardView.tsx # Dispatcher — picks mobile/tablet/desktop
│   └── Dashboard{Mobile,Tablet,Desktop}.tsx  # View scaffolds
├── hooks/                # React hooks
│   ├── use-live-device-type.ts  # Viewport → device type
│   └── use-dashboard.ts         # Dashboard client state
├── lib/                  # Utilities & server-side code
│   ├── device.ts         # Breakpoint constants, normalizer
│   ├── prisma.ts         # Prisma client singleton
│   └── get-dashboard-data.ts  # Mock data (swap for real API later)
├── types.ts              # Shared TypeScript types
└── proxy.ts              # UA → x-device-type header (middleware)

prisma/
└── schema.prisma         # Database schema
```

## Adding a New Feature

1. **Components** go in `src/components/`. Name them descriptively (e.g. `StudentTable.tsx`).
2. **Hooks** go in `src/hooks/`. Prefix with `use` (e.g. `use-student-filters.ts`).
3. **Shared types** go in `src/types.ts`. Keep one file until it gets too large.
4. **API routes** go in `src/app/api/<resource>/route.ts`.
5. **Utilities** go in `src/lib/`. If it's a small helper, co-locate it with the feature.

## Import Convention

Always use `@/` aliases — never relative paths:

```ts
// Good
import { prisma } from '@/lib/prisma'
import type { DeviceType } from '@/types'

// Bad
import { prisma } from '../../lib/prisma'
```

The `@/` alias resolves to `./src/` (configured in `tsconfig.json`).

## Design Rules

- **One breakpoint per view file.** Mobile uses base/`max-*`, Tablet uses `md:`, Desktop uses `lg:`. Never mix them.
- **Never hard-code breakpoint numbers.** Import `TABLET_MIN_WIDTH`/`DESKTOP_MIN_WIDTH` from `@/lib/device.ts`.
- **Views stay presentational.** No `headers()`, no data fetching inside view components.

## Testing

Tests use Node's built-in `node:test` — no external test framework.

```bash
# Run all tests
node --import ./tsx-hooks.mjs --test

# Run a single file
node --import ./tsx-hooks.mjs --test src/lib/device.test.ts
```

- Test files live next to source: `device.ts` → `device.test.ts`
- Use explicit `.ts`/`.tsx` extensions in imports
- Mock the device header with `globalThis.__TEST_DEVICE_TYPE`
- Assert view dispatch via `data-view="mobile|tablet|desktop"` in rendered HTML

### TDD Workflow

1. Write a failing test (`node --import ./tsx-hooks.mjs --test`) — verify RED
2. Implement the feature — verify GREEN
3. `npm run lint` — must pass
4. `npm run build` — must pass
5. Commit

## Before a PR

All three must pass:

```bash
node --import ./tsx-hooks.mjs --test   # tests green
npm run lint                           # no lint errors
npm run build                          # production build succeeds
```

## Database

- Schema: `prisma/schema.prisma`
- Push schema: `npm run db:push`
- Seed data: `npm run db:seed`
- Open Prisma Studio: `npm run db:studio`
- Quick connection test: `npx tsx src/lib/test-db.ts`

PostgreSQL runs via Docker Compose (`docker compose up -d`) on port 5432.
