# Go-live setup

> Local mode needs nothing. This is the checklist for a real, paid, deployed Pip.
> `pnpm doctor` (cloud mode) checks most of these automatically and prints PASS/FAIL.

## 0. Prerequisites

Accounts: Supabase, Stripe, Anthropic, Vercel, and a GitHub repo (for the hourly cron workflow). Node 22, pnpm 10.

## 1. Supabase

1. Create a project. Copy the project URL, the anon key, and the service-role key.
2. **Auth → Providers → Email:** enable it. **Auth → Sign-ups:** turn on **Allow anonymous sign-ins** (required for Pip's onboarding).
3. Recommended: enable a **CAPTCHA (Turnstile)** on anonymous sign-ins to stop bots minting accounts and draining the AI key.
4. Edit the email OTP template to include the `{{ .Token }}` code, and attach a real SMTP provider (Resend or Postmark) under **Auth → SMTP** — the built-in sender is rate-limited to a few emails per hour.
5. **Storage:** create a **private** bucket named `media`.
6. Apply the schema: `DATABASE_URL="<pooler url, port 6543>" pnpm db:migrate`.

## 2. Stripe

1. Create a product **Pip+** with a recurring monthly price (the UI shows `$4.99/mo`; set `NEXT_PUBLIC_PLUS_PRICE_LABEL` to match). Copy the price id.
2. Enable the **Customer Portal** (Billing → Customer portal) with cancel + update payment.
3. Create a **webhook endpoint** at `https://<your-domain>/api/billing/webhook` for: `checkout.session.completed`, `customer.subscription.created`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.paid`, `invoice.payment_failed`. Copy the signing secret.
4. Use **test** keys/price/webhook on Vercel Preview and **live** on Production. `pnpm doctor` asserts the price `livemode` matches the key.
5. Start account activation on day one — live activation can take a while.

## 3. Push (VAPID)

`pnpm vapid` prints a public/private key pair. Set `NEXT_PUBLIC_VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, and `VAPID_SUBJECT=mailto:you@domain`.

## 4. Vercel

Set all vars from `.env.example` (see the matrix below). `APP_MODE=cloud` must be present **at build time**. Deploy.

| Var | Preview | Production |
|---|---|---|
| `APP_MODE` | `cloud` | `cloud` |
| `STRIPE_SECRET_KEY` / `STRIPE_WEBHOOK_SECRET` / `STRIPE_PRICE_ID` | test | live |
| everything else | same | same |

## 5. Scheduler (hourly)

Nudges and daily synthesis need an hourly tick. This repo ships `.github/workflows/tick.yml` (works on any Vercel plan). In GitHub repo settings add secret `CRON_SECRET` (same value as the Vercel env var) and variable `APP_URL` (your deployed URL). Trigger it once from the Actions tab to confirm. (On Vercel Pro you may instead add a `crons` block to `vercel.json`.)

## 6. Verify

Run `pnpm doctor`. Then do a test-mode checkout with card `4242 4242 4242 4242`, confirm the timeline unlocks, and check the Stripe dashboard shows a 200 on the webhook. Switch to live keys and take one real payment. Confirm export downloads and account delete empties every table and the storage prefix.
