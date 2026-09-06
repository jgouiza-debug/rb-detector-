-- Row-level security. Identical on Supabase and pglite (pglite runs db/local/auth-shim.sql first).
-- Grants are harmless on Supabase (already present) and required on pglite.
GRANT USAGE ON SCHEMA "public" TO anon, authenticated, service_role;--> statement-breakpoint
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA "public" TO authenticated;--> statement-breakpoint
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA "public" TO service_role;--> statement-breakpoint

ALTER TABLE "profiles" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "messages" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "media" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "memories" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "subscriptions" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "push_subscriptions" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "billing_events" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "nudge_log" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "usage_daily" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "usage_global" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "safety_events" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "push_outbox" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "local_otps" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "rate_limits" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint

-- Clients (the anon/authenticated key) may only READ their own rows. Every write goes
-- through the server's service-role connection, which bypasses RLS. Service-only tables
-- (billing_events, nudge_log, usage_*, safety_events, push_outbox, local_otps, rate_limits)
-- get RLS enabled with NO policy, so the client key cannot touch them at all.
CREATE POLICY "profiles_owner_read" ON "profiles" FOR SELECT TO authenticated USING ("id" = (select auth.uid()));--> statement-breakpoint
CREATE POLICY "messages_owner_read" ON "messages" FOR SELECT TO authenticated USING ("user_id" = (select auth.uid()));--> statement-breakpoint
CREATE POLICY "media_owner_read" ON "media" FOR SELECT TO authenticated USING ("user_id" = (select auth.uid()));--> statement-breakpoint
CREATE POLICY "memories_owner_read" ON "memories" FOR SELECT TO authenticated USING ("user_id" = (select auth.uid()));--> statement-breakpoint
CREATE POLICY "subscriptions_owner_read" ON "subscriptions" FOR SELECT TO authenticated USING ("user_id" = (select auth.uid()));--> statement-breakpoint
CREATE POLICY "push_owner_read" ON "push_subscriptions" FOR SELECT TO authenticated USING ("user_id" = (select auth.uid()));
