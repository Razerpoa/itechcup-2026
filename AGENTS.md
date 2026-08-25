<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Mitra Muda — Platform Talenta Pelajar Indonesia

Next.js 16.3.1 (App Router under `src/`, Tailwind v4 CSS-first config in `src/app/globals.css`, React 19.2.8, TypeScript 5, `@/*` → `./src/*`).

Mitra Muda adalah platform pemberdayaan talenta pelajar Indonesia yang menghubungkan pelajar dengan UMKM melalui marketplace jasa, sistem verifikasi sekolah, dan sistem transaksi aman tanpa syarat KTP atau rekening bank.

## Project Structure

```
src/
├── app/
│   ├── (auth)/
│   │   ├── layout.tsx            # Auth layout split branding
│   │   ├── login/page.tsx        # Login page (Google OAuth + manual)
│   │   └── register/
│   │       ├── pelajar/page.tsx  # Registrasi Pelajar
│   │       ├── umkm/page.tsx     # Registrasi UMKM
│   │       └── sekolah/page.tsx  # Registrasi Sekolah
│   ├── (dashboard)/
│   │   ├── layout.tsx            # Dashboard shell (Sidebar + Navbar)
│   │   ├── pelajar/
│   │   │   ├── page.tsx          # Dashboard Pelajar
│   │   │   ├── dompet/page.tsx   # Dompet & Tarik Saldo
│   │   │   └── transaksi/[id]/   # Ruang Akad Transaksi & Review
│   │   ├── sekolah/
│   │   │   ├── page.tsx          # Dashboard Sekolah & Verifikasi
│   │   │   └── laporan/page.tsx  # Laporan Kinerja & Analytics
│   │   └── umkm/
│   │       ├── page.tsx          # Dashboard UMKM
│   │       └── proyek/buat/      # Form Buat Lowongan Proyek
│   ├── (marketing)/
│   │   ├── layout.tsx
│   │   └── page.tsx              # Onboarding Role Selection
│   ├── marketplace/
│   │   ├── page.tsx              # Feed Proyek UMKM & Jasa Pelajar
│   │   └── [id]/page.tsx         # Detail Proyek & Lamar
│   ├── profil/[id]/page.tsx      # Portofolio & Profil Publik Siswa
│   ├── api/
│   │   ├── sekolah/route.ts      # Sekolah CRUD + NPSN auto-verification
│   │   ├── pelajar/route.ts      # Pelajar CRUD
│   │   ├── umkm/route.ts         # UMKM CRUD
│   │   ├── proyek/route.ts       # Proyek CRUD & Filters
│   │   └── siswa/route.ts        # Siswa school verification endpoints
│   ├── globals.css               # Tailwind v4 config & Collaborative Vitality theme tokens
│   ├── layout.tsx                # Root layout (Plus Jakarta Sans)
│   └── not-found.tsx             # Custom 404
├── components/
│   ├── ui/                       # Atom components: button, input, card, badge
│   ├── layout/                   # Navbar, Sidebar
│   └── marketplace/              # ProyekCard, JasaCard
├── lib/
│   ├── prisma.ts                 # Prisma ORM v7 client singleton
│   ├── supabase.ts               # Supabase storage & auth helper
│   ├── utils.ts                  # cn(), formatRupiah(), formatDate(), etc.
│   ├── kemendikdasmen.ts         # Kemendikdasmen API lookup integration
│   ├── rate-limiter.ts           # IP & NPSN in-memory rate limiter
│   ├── validate-npsn.ts          # NPSN format validator
│   ├── normalize-school-name.ts  # School name normalization
│   └── compare-school-names.ts   # Exact/minor/critical similarity comparison
├── types/
│   └── index.ts                  # Shared TypeScript type definitions
└── proxy.ts                      # Device-type detection middleware
```

**Imports:** Always `@/` aliases (`@/lib/prisma`), never relative (`../lib/prisma`).

## Commands

| Task | Command |
|------|---------|
| Dev server | `npm run dev` |
| Production build | `npm run build` |
| Lint | `npm run lint` |
| DB push schema | `npm run db:push` |
| DB seed | `npm run db:seed` |
| DB Prisma Studio | `npm run db:studio` |

## Database

PostgreSQL via Prisma ORM v7 (`@prisma/adapter-pg` driver adapter).
Entities:
- `Sekolah`: Profil sekolah, NPSN unik, verifikasi Kemendikdasmen, relasi siswa
- `Pelajar`: Akun siswa, data diri, NIS, status verifikasi sekolah
- `PelajarProfile`: Portofolio, skill, rating, statistik proyek, info e-wallet
- `UMKM`: Profil usaha, nomor WA, verifikasi legalitas (NIB/NPWP/Sosmed)
- `Proyek`: Lowongan proyek dari UMKM, budget, DP, tags, pelamar
- `Jasa`: Katalog listing keahlian pelajar (Basic/Standard/Premium)
- `Lamaran`: Pengajuan proposal proyek dari pelajar ke UMKM
- `Transaksi`: Akad kesepakatan, sistem DP escrow, submit review, status pembayaran

## Design System (Collaborative Vitality)

- **Primary Color:** `#FF9B71` (Pastel Orange)
- **Primary Dark:** `#964825`
- **Background:** `#FAFAFA`
- **Surface:** `#FFFFFF`
- **Typography:** Plus Jakarta Sans
- **Pill Radius:** `rounded-full` for buttons, badges, chips
- **Card Radius:** `rounded-2xl` for containers and cards
