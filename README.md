# pip

**the journal that feels like texting a friend.**

Pip is a journaling + meditation companion you text. Send a thought or a photo, and Pip listens, reflects, and quietly turns your days into a memory timeline you can look back on. No blank pages, no pressure. It's an installable PWA built with Next.js, Supabase, the Anthropic API, and Stripe.

This repo answers the @usevaya.hq / Bolun Li bounty. The full product brief lives in [`docs/handoff/`](docs/handoff).

## Quick start (zero setup)

```bash
pnpm install
pnpm dev          # http://localhost:3000, runs entirely locally
```

`pnpm dev` runs in **local mode** with no external services: an embedded Postgres (pglite) on disk, a filesystem photo store, a deterministic scripted companion, mock checkout, and a push outbox. The whole journey — onboarding, chat, photos, synthesis, timeline, paywall, breathing, export, delete — works and is end-to-end tested without a single API key. See [`docs/LOCAL_MODE.md`](docs/LOCAL_MODE.md).

## Going live

Set `APP_MODE=cloud` and the secrets in [`.env.example`](.env.example), then follow [`docs/SETUP.md`](docs/SETUP.md): create the Supabase project, run `pnpm db:migrate`, create the Stripe product, generate VAPID keys, and deploy to Vercel. `pnpm doctor` checks every piece of the go-live config. The same application code runs in both modes; only the outer adapters swap.

## Commands

| Command | What it does |
|---|---|
| `pnpm dev` | Local-mode dev server (no keys needed) |
| `pnpm verify` | typecheck + lint + unit + integration tests |
| `pnpm test` / `pnpm test:int` / `pnpm test:e2e` | Unit / integration (pglite) / Playwright journeys |
| `pnpm build` / `pnpm start` | Production build / serve |
| `pnpm db:generate` / `pnpm db:migrate` | Generate a migration / apply migrations to `DATABASE_URL` |
| `pnpm vapid` / `pnpm icons` / `pnpm doctor` | Generate push keys / app icons / check cloud config |

## How it's built

Hexagonal ports (`lib/ports`) with local and cloud adapters (`lib/adapters`) chosen by env. One Drizzle schema drives both an embedded Postgres and Supabase, with row-level security tested on pglite. See [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md). Safety and privacy details are in [`docs/SAFETY.md`](docs/SAFETY.md).

## Launch checklist (bounty)

- [ ] `pnpm verify` and `pnpm test:e2e` green.
- [ ] Supabase project: anonymous sign-ins on, private `media` bucket, migrations applied, SMTP attached.
- [ ] Stripe: Pip+ product + monthly price, webhook with the six events, portal enabled.
- [ ] `pnpm doctor` all PASS in the deployed environment.
- [ ] `NEXT_PUBLIC_SW=1` set so the app is installable.
- [ ] GitHub Actions `tick` workflow has `CRON_SECRET` + `APP_URL`.
- [ ] One real payment taken (test card first, then live).
- [ ] Export downloads; delete empties everything.
- [ ] Submit to @usevaya.hq.
