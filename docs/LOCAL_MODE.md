# Local mode

`pnpm dev` sets `APP_MODE=local` and runs the full app with **zero external services**. Every screen, API route, database query, migration, RLS policy, safety gate, synthesis job, entitlement check, export, and delete is the real production code — only the six outer adapters are swapped.

| Port | Local adapter | What stays real |
|---|---|---|
| DB | pglite at `.data/pglite` (`memory://` in tests); migrations + auth shim auto-applied | schema, migrations, RLS SQL, every repository |
| Auth | HMAC-signed cookie; email OTP code is always `000000` | onboarding, email-link + sign-in flows, sign-out, delete |
| Blob | files under `.data/blobs`, served by the authenticated media proxy | upload, sharp re-encode, export, delete |
| AI | deterministic `ScriptedAi` (keyword-based replies, risk, captions, synthesis) | safety pipeline, bubble parser, context trimming, persistence, synthesis |
| Billing | `/dev/checkout` + `/dev/portal` feed the same `applyBillingEvent` as the real webhook | entitlements, gating, paywall, sync/poll UI |
| Push | `push_outbox` rows, readable at `/dev/outbox` | subscribe routes, tick, nudge copy, idempotency |
| Clock | real time; routes that need to time-travel read `x-pip-test-now` | all local-date / timezone math |

## Dev-only surfaces

Everything under `app/dev/*` and `app/api/dev/*` calls `assertLocalMode()` and returns 404 outside local mode:

- `/dev/gallery` — the Pip mascot expressions, type scale, buttons, moods, bubbles.
- `/dev/checkout`, `/dev/portal` — the mock Stripe surfaces.
- `/dev/outbox` — the push outbox.
- `POST /api/dev/seed` — seed N days of messages + memories through the real repositories.

## Deterministic testing

Playwright builds and serves the production bundle in local mode against fresh data dirs (`.data/e2e`, `.data/e2e-blobs`). The scripted AI makes replies, moods, captions, and risk verdicts deterministic, so assertions are stable. `PIP_SCRIPTED_RISK_FAIL=1` makes the risk classifier throw, to test the fail-safe crisis path.

## Switching to cloud

Set `APP_MODE=cloud` plus the cloud secrets, run `pnpm db:migrate`, and deploy. No code changes. Each `*_PROVIDER` can also be overridden individually (e.g. a cloud DB with the scripted AI for a keyless demo).
