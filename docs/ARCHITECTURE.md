# Architecture

## Ports and adapters

All external dependencies sit behind a port interface in `lib/ports/*.ts`. Each has a local and a cloud adapter in `lib/adapters/<port>/<impl>.ts`. The composition root `lib/ports/index.ts` (`getPorts()`) picks adapters from `lib/env.ts`, memoized per process.

| Port | Local | Cloud |
|---|---|---|
| `ClockPort` | testable (env `PIP_FAKE_NOW`) | system time |
| `AuthPort` | HMAC cookie | Supabase Auth (anonymous-first) |
| `BlobPort` | filesystem | Supabase Storage (private bucket) |
| `AiPort` | scripted | Anthropic API (`claude-sonnet-5`) |
| `BillingPort` | mock | Stripe |
| `PushPort` | outbox table | web-push (VAPID) |

`getPorts()`, `assertLocalMode()`, and `setPortsForTests()` are the only entry points.

## Environment

`lib/env.ts` validates lazily (`getEnv()`, memoized) — never at import time, so `next build` and static prerender work with no env file. `APP_MODE` defaults to `local` off Vercel and is refused as `local` on `VERCEL_ENV=production`. Local providers carry safe defaults; cloud providers fail fast with a readable list of missing vars.

## Data

One Drizzle schema (`lib/db/schema.ts`) targets both pglite and Supabase Postgres. Migrations live in `drizzle/` and are applied by a small journal-driven runner (`lib/db/migrate.ts`) that runs `db/local/auth-shim.sql` first on pglite (so `auth.uid()` and the `authenticated`/`service_role` roles exist, matching Supabase). `getDb()` is a process singleton; the server always talks to Postgres over the service connection and scopes every query by `userId` in the repositories (`lib/db/repo/*`). Row-level security is defense-in-depth against the anon key and is tested on pglite (`tests/int/rls.test.ts`): clients may only `SELECT` their own rows, and service-only tables have RLS on with no policy.

## Request layer (Next 16)

App Router with Turbopack. `proxy.ts` (not `middleware.ts`) refreshes the Supabase session and does the signed-out redirect, with an explicit matcher that never touches `/api/*`, the Stripe webhook, cron, the service worker, the manifest, or `/help`. Route handlers are `runtime = "nodejs"`, `dynamic = "force-dynamic"`, with `maxDuration = 60` on the long ones. Fire-and-forget work (photo captioning, lazy synthesis) uses `after()` from `next/server`.

## Money path

`lib/billing/applyEvent.ts` is the single function that the signed Stripe webhook, the checkout-success sync, the Settings refresh, and the local mock all converge on, so the gating logic that ships is the gating logic that's tested. Entitlement is always re-derived server-side from the `subscriptions` row; the client's `plan` is a UI hint only.
