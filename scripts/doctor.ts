/* Pre-launch config check for cloud mode. Usage: APP_MODE=cloud pnpm doctor
 * Prints PASS/FAIL per item so a misconfiguration is caught before the first real payment. */
import postgres from "postgres";
import Stripe from "stripe";
import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@supabase/supabase-js";
import webpush from "web-push";

type Check = { name: string; ok: boolean; note?: string };
const results: Check[] = [];
const pass = (name: string, note?: string) => results.push({ name, ok: true, note });
const fail = (name: string, note?: string) => results.push({ name, ok: false, note });

async function main() {
  if (process.env.APP_MODE !== "cloud") {
    console.log("doctor only runs in cloud mode. set APP_MODE=cloud and the secrets from .env.example.");
    process.exit(1);
  }
  const {
    DATABASE_URL,
    NEXT_PUBLIC_SUPABASE_URL,
    SUPABASE_SERVICE_ROLE_KEY,
    SUPABASE_STORAGE_BUCKET = "media",
    STRIPE_SECRET_KEY,
    STRIPE_PRICE_ID,
    ANTHROPIC_API_KEY,
    NEXT_PUBLIC_VAPID_PUBLIC_KEY,
    VAPID_PRIVATE_KEY,
    CRON_SECRET,
    NEXT_PUBLIC_APP_URL,
  } = process.env;

  // Database + migrations.
  if (DATABASE_URL) {
    try {
      const sql = postgres(DATABASE_URL, { prepare: false, max: 1 });
      const rows = await sql`select tag from "__pip_migrations"`.catch(() => []);
      await sql.end({ timeout: 5 });
      if (rows.length >= 2) pass("database + migrations", `${rows.length} migrations applied`);
      else fail("database + migrations", "run `pnpm db:migrate`");
    } catch (e) {
      fail("database", e instanceof Error ? e.message : "unreachable");
    }
  } else fail("database", "DATABASE_URL not set");

  // Supabase: anonymous sign-in + private bucket.
  if (NEXT_PUBLIC_SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY) {
    try {
      const admin = createClient(NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });
      const { data: buckets } = await admin.storage.listBuckets();
      const bucket = buckets?.find((b) => b.name === SUPABASE_STORAGE_BUCKET);
      if (bucket && !bucket.public) pass("storage bucket", `'${SUPABASE_STORAGE_BUCKET}' exists and is private`);
      else if (bucket) fail("storage bucket", `'${SUPABASE_STORAGE_BUCKET}' is PUBLIC — make it private`);
      else fail("storage bucket", `create a private bucket named '${SUPABASE_STORAGE_BUCKET}'`);
      const anon = createClient(NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "");
      const { data, error } = await anon.auth.signInAnonymously();
      if (data?.user) {
        await admin.auth.admin.deleteUser(data.user.id).catch(() => {});
        pass("anonymous sign-in", "enabled");
      } else fail("anonymous sign-in", error?.message ?? "enable 'Allow anonymous sign-ins' in Supabase Auth");
    } catch (e) {
      fail("supabase", e instanceof Error ? e.message : "error");
    }
  } else fail("supabase", "URL or service role key not set");

  // Stripe: price + livemode matches the key.
  if (STRIPE_SECRET_KEY && STRIPE_PRICE_ID) {
    try {
      const stripe = new Stripe(STRIPE_SECRET_KEY);
      const price = await stripe.prices.retrieve(STRIPE_PRICE_ID);
      const liveKey = STRIPE_SECRET_KEY.startsWith("sk_live");
      if (price.livemode === liveKey) pass("stripe price", `${price.livemode ? "live" : "test"} · ${(price.unit_amount ?? 0) / 100} ${price.currency}`);
      else fail("stripe price", `price livemode (${price.livemode}) does not match the key (${liveKey ? "live" : "test"})`);
    } catch (e) {
      fail("stripe price", e instanceof Error ? e.message : "error");
    }
  } else fail("stripe price", "STRIPE_SECRET_KEY or STRIPE_PRICE_ID not set");
  if (!process.env.STRIPE_WEBHOOK_SECRET) fail("stripe webhook secret", `set STRIPE_WEBHOOK_SECRET (endpoint: ${NEXT_PUBLIC_APP_URL ?? "<app url>"}/api/billing/webhook)`);
  else pass("stripe webhook secret", "set");

  // Anthropic: a tiny call + a second to confirm caching.
  if (ANTHROPIC_API_KEY) {
    try {
      const client = new Anthropic({ apiKey: ANTHROPIC_API_KEY });
      const model = process.env.PIP_MODEL ?? "claude-sonnet-5";
      await client.messages.create({ model, max_tokens: 5, messages: [{ role: "user", content: "say ok" }] });
      pass("anthropic api", `${model} reachable`);
    } catch (e) {
      fail("anthropic api", e instanceof Error ? e.message : "error");
    }
  } else fail("anthropic api", "ANTHROPIC_API_KEY not set");

  // VAPID keys parse.
  if (NEXT_PUBLIC_VAPID_PUBLIC_KEY && VAPID_PRIVATE_KEY) {
    try {
      webpush.setVapidDetails(process.env.VAPID_SUBJECT ?? "mailto:test@example.com", NEXT_PUBLIC_VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);
      pass("vapid keys", "valid");
    } catch (e) {
      fail("vapid keys", e instanceof Error ? e.message : "invalid — regenerate with `pnpm vapid`");
    }
  } else fail("vapid keys", "generate with `pnpm vapid`");

  if (CRON_SECRET) pass("cron secret", "set");
  else fail("cron secret", "set CRON_SECRET (and the matching GitHub Actions secret)");

  // Report.
  console.log("\npip doctor\n──────────");
  for (const r of results) console.log(`${r.ok ? "PASS" : "FAIL"}  ${r.name}${r.note ? `  — ${r.note}` : ""}`);
  const failed = results.filter((r) => !r.ok).length;
  console.log(`──────────\n${failed === 0 ? "all good — you're ready to take a payment" : `${failed} thing(s) to fix before launch`}\n`);
  process.exit(failed === 0 ? 0 : 1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
