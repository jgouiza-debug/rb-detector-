-- Make row-level security a real backstop for the SERVER path, not only the
-- client (anon-key/PostgREST) path 0001 already covered.
--
-- Two gaps 0001 left:
--   1. RLS is not FORCED, so the table owner still bypasses its own policies. A
--      server connection that happens to be the owner reads and writes every
--      row regardless of policy. FORCE closes that — a BYPASSRLS role
--      (service_role, or a superuser in local pglite) still bypasses, so the
--      existing service-role writes and the local test connection are
--      unaffected; only an ordinary authenticated connection is now bound.
--   2. Only SELECT policies existed. For enforcement to hold on an authenticated
--      connection (see lib/db/client.ts withUserTx), every write needs a policy
--      whose USING/WITH CHECK pins the row to auth.uid(). Without them an
--      authenticated role could write another user's row (or none at all).
--
-- Service-only tables (billing_events, nudge_log, usage_*, safety_events,
-- push_outbox, local_otps, rate_limits) intentionally keep NO authenticated
-- policy: they are reachable only through the service-role connection, so an
-- authenticated connection is denied outright. They are left as-is.

ALTER TABLE "profiles" FORCE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "messages" FORCE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "media" FORCE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "memories" FORCE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "subscriptions" FORCE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "push_subscriptions" FORCE ROW LEVEL SECURITY;--> statement-breakpoint

-- profiles: keyed on id.
CREATE POLICY "profiles_owner_insert" ON "profiles" FOR INSERT TO authenticated WITH CHECK ("id" = (select auth.uid()));--> statement-breakpoint
CREATE POLICY "profiles_owner_update" ON "profiles" FOR UPDATE TO authenticated USING ("id" = (select auth.uid())) WITH CHECK ("id" = (select auth.uid()));--> statement-breakpoint
CREATE POLICY "profiles_owner_delete" ON "profiles" FOR DELETE TO authenticated USING ("id" = (select auth.uid()));--> statement-breakpoint

-- messages / media / memories / subscriptions / push_subscriptions: keyed on user_id.
CREATE POLICY "messages_owner_insert" ON "messages" FOR INSERT TO authenticated WITH CHECK ("user_id" = (select auth.uid()));--> statement-breakpoint
CREATE POLICY "messages_owner_update" ON "messages" FOR UPDATE TO authenticated USING ("user_id" = (select auth.uid())) WITH CHECK ("user_id" = (select auth.uid()));--> statement-breakpoint
CREATE POLICY "messages_owner_delete" ON "messages" FOR DELETE TO authenticated USING ("user_id" = (select auth.uid()));--> statement-breakpoint

CREATE POLICY "media_owner_insert" ON "media" FOR INSERT TO authenticated WITH CHECK ("user_id" = (select auth.uid()));--> statement-breakpoint
CREATE POLICY "media_owner_update" ON "media" FOR UPDATE TO authenticated USING ("user_id" = (select auth.uid())) WITH CHECK ("user_id" = (select auth.uid()));--> statement-breakpoint
CREATE POLICY "media_owner_delete" ON "media" FOR DELETE TO authenticated USING ("user_id" = (select auth.uid()));--> statement-breakpoint

CREATE POLICY "memories_owner_insert" ON "memories" FOR INSERT TO authenticated WITH CHECK ("user_id" = (select auth.uid()));--> statement-breakpoint
CREATE POLICY "memories_owner_update" ON "memories" FOR UPDATE TO authenticated USING ("user_id" = (select auth.uid())) WITH CHECK ("user_id" = (select auth.uid()));--> statement-breakpoint
CREATE POLICY "memories_owner_delete" ON "memories" FOR DELETE TO authenticated USING ("user_id" = (select auth.uid()));--> statement-breakpoint

CREATE POLICY "subscriptions_owner_insert" ON "subscriptions" FOR INSERT TO authenticated WITH CHECK ("user_id" = (select auth.uid()));--> statement-breakpoint
CREATE POLICY "subscriptions_owner_update" ON "subscriptions" FOR UPDATE TO authenticated USING ("user_id" = (select auth.uid())) WITH CHECK ("user_id" = (select auth.uid()));--> statement-breakpoint
CREATE POLICY "subscriptions_owner_delete" ON "subscriptions" FOR DELETE TO authenticated USING ("user_id" = (select auth.uid()));--> statement-breakpoint

CREATE POLICY "push_owner_insert" ON "push_subscriptions" FOR INSERT TO authenticated WITH CHECK ("user_id" = (select auth.uid()));--> statement-breakpoint
CREATE POLICY "push_owner_update" ON "push_subscriptions" FOR UPDATE TO authenticated USING ("user_id" = (select auth.uid())) WITH CHECK ("user_id" = (select auth.uid()));--> statement-breakpoint
CREATE POLICY "push_owner_delete" ON "push_subscriptions" FOR DELETE TO authenticated USING ("user_id" = (select auth.uid()));
