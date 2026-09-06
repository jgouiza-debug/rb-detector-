CREATE TYPE "public"."caption_t" AS ENUM('pending', 'done', 'failed');--> statement-breakpoint
CREATE TYPE "public"."memory_status_t" AS ENUM('ready', 'pending', 'failed');--> statement-breakpoint
CREATE TYPE "public"."mood_t" AS ENUM('bright', 'calm', 'heavy', 'tender', 'growing', 'mixed');--> statement-breakpoint
CREATE TYPE "public"."msg_kind_t" AS ENUM('text', 'photo', 'crisis', 'pause_offer', 'day_ready', 'pause_done', 'note');--> statement-breakpoint
CREATE TYPE "public"."nudge_kind_t" AS ENUM('morning', 'evening_nudge', 'evening_synth', 'day_ready', 'finalize');--> statement-breakpoint
CREATE TYPE "public"."safety_t" AS ENUM('none', 'concern', 'crisis');--> statement-breakpoint
CREATE TYPE "public"."sender_t" AS ENUM('user', 'pip', 'system');--> statement-breakpoint
CREATE TABLE "billing_events" (
	"id" text PRIMARY KEY NOT NULL,
	"type" text NOT NULL,
	"user_id" uuid,
	"payload" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"received_at" timestamp with time zone DEFAULT now() NOT NULL,
	"processed_at" timestamp with time zone,
	"error" text
);
--> statement-breakpoint
CREATE TABLE "local_otps" (
	"email" text PRIMARY KEY NOT NULL,
	"code" text NOT NULL,
	"purpose" text DEFAULT 'link' NOT NULL,
	"user_id" uuid,
	"expires_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "media" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"message_id" uuid,
	"key_full" text NOT NULL,
	"key_thumb" text NOT NULL,
	"width" integer NOT NULL,
	"height" integer NOT NULL,
	"bytes" integer NOT NULL,
	"ai_caption" text,
	"place_hint" text,
	"sensitive" boolean DEFAULT false NOT NULL,
	"caption_status" "caption_t" DEFAULT 'pending' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "memories" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"local_date" date NOT NULL,
	"title" text DEFAULT '' NOT NULL,
	"reflection" text DEFAULT '' NOT NULL,
	"mood" "mood_t" DEFAULT 'mixed' NOT NULL,
	"mood_label" text DEFAULT '' NOT NULL,
	"highlights" text[] DEFAULT '{}'::text[] NOT NULL,
	"entry_count" integer DEFAULT 0 NOT NULL,
	"media_ids" uuid[] DEFAULT '{}'::uuid[] NOT NULL,
	"source_hash" text DEFAULT '' NOT NULL,
	"version" integer DEFAULT 0 NOT NULL,
	"status" "memory_status_t" DEFAULT 'pending' NOT NULL,
	"resonated" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"search" "tsvector" GENERATED ALWAYS AS (to_tsvector('english', coalesce("title", '') || ' ' || "reflection")) STORED
);
--> statement-breakpoint
CREATE TABLE "messages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"sender" "sender_t" NOT NULL,
	"kind" "msg_kind_t" DEFAULT 'text' NOT NULL,
	"text" text DEFAULT '' NOT NULL,
	"client_id" text,
	"group_id" uuid,
	"reply_to" uuid,
	"local_date" date NOT NULL,
	"safety_level" "safety_t" DEFAULT 'none' NOT NULL,
	"meta" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"search" "tsvector" GENERATED ALWAYS AS (to_tsvector('english', "text")) STORED
);
--> statement-breakpoint
CREATE TABLE "nudge_log" (
	"user_id" uuid NOT NULL,
	"kind" "nudge_kind_t" NOT NULL,
	"local_date" date NOT NULL,
	"sent_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "nudge_log_user_id_kind_local_date_pk" PRIMARY KEY("user_id","kind","local_date")
);
--> statement-breakpoint
CREATE TABLE "profiles" (
	"id" uuid PRIMARY KEY NOT NULL,
	"name" text,
	"email" text,
	"is_anonymous" boolean DEFAULT true NOT NULL,
	"needs_email_link" boolean DEFAULT false NOT NULL,
	"timezone" text DEFAULT 'UTC' NOT NULL,
	"morning_time" text,
	"evening_time" text,
	"focus" text[] DEFAULT '{}'::text[] NOT NULL,
	"prefs" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"care_mode_until" timestamp with time zone,
	"onboarded_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "push_outbox" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"payload" jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "push_subscriptions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"endpoint" text NOT NULL,
	"p256dh" text NOT NULL,
	"auth" text NOT NULL,
	"user_agent" text,
	"fail_count" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "push_subscriptions_endpoint_unique" UNIQUE("endpoint")
);
--> statement-breakpoint
CREATE TABLE "rate_limits" (
	"key" text PRIMARY KEY NOT NULL,
	"count" integer DEFAULT 0 NOT NULL,
	"window_start" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "safety_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"message_id" uuid,
	"tier" smallint NOT NULL,
	"verdict" "safety_t" NOT NULL,
	"source" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "subscriptions" (
	"user_id" uuid PRIMARY KEY NOT NULL,
	"stripe_customer_id" text,
	"stripe_subscription_id" text,
	"status" text DEFAULT 'none' NOT NULL,
	"plan" text DEFAULT 'plus' NOT NULL,
	"current_period_end" timestamp with time zone,
	"cancel_at_period_end" boolean DEFAULT false NOT NULL,
	"last_event_at" timestamp with time zone,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "subscriptions_stripe_customer_id_unique" UNIQUE("stripe_customer_id"),
	CONSTRAINT "subscriptions_stripe_subscription_id_unique" UNIQUE("stripe_subscription_id")
);
--> statement-breakpoint
CREATE TABLE "usage_daily" (
	"user_id" uuid NOT NULL,
	"local_date" date NOT NULL,
	"replies" integer DEFAULT 0 NOT NULL,
	"captions" integer DEFAULT 0 NOT NULL,
	"syntheses" integer DEFAULT 0 NOT NULL,
	"tokens_in" bigint DEFAULT 0 NOT NULL,
	"tokens_out" bigint DEFAULT 0 NOT NULL,
	CONSTRAINT "usage_daily_user_id_local_date_pk" PRIMARY KEY("user_id","local_date")
);
--> statement-breakpoint
CREATE TABLE "usage_global" (
	"local_date" date PRIMARY KEY NOT NULL,
	"replies" integer DEFAULT 0 NOT NULL,
	"captions" integer DEFAULT 0 NOT NULL,
	"syntheses" integer DEFAULT 0 NOT NULL,
	"tokens_in" bigint DEFAULT 0 NOT NULL,
	"tokens_out" bigint DEFAULT 0 NOT NULL
);
--> statement-breakpoint
ALTER TABLE "media" ADD CONSTRAINT "media_user_id_profiles_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "media" ADD CONSTRAINT "media_message_id_messages_id_fk" FOREIGN KEY ("message_id") REFERENCES "public"."messages"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "memories" ADD CONSTRAINT "memories_user_id_profiles_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "messages" ADD CONSTRAINT "messages_user_id_profiles_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "nudge_log" ADD CONSTRAINT "nudge_log_user_id_profiles_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "push_subscriptions" ADD CONSTRAINT "push_subscriptions_user_id_profiles_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "safety_events" ADD CONSTRAINT "safety_events_user_id_profiles_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_user_id_profiles_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "usage_daily" ADD CONSTRAINT "usage_daily_user_id_profiles_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "media_user_msg" ON "media" USING btree ("user_id","message_id");--> statement-breakpoint
CREATE UNIQUE INDEX "memories_user_date" ON "memories" USING btree ("user_id","local_date");--> statement-breakpoint
CREATE INDEX "memories_user_date_desc" ON "memories" USING btree ("user_id","local_date" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "memories_search" ON "memories" USING gin ("search");--> statement-breakpoint
CREATE UNIQUE INDEX "messages_user_client" ON "messages" USING btree ("user_id","client_id");--> statement-breakpoint
CREATE INDEX "messages_user_created" ON "messages" USING btree ("user_id","created_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "messages_user_date" ON "messages" USING btree ("user_id","local_date");--> statement-breakpoint
CREATE INDEX "messages_search" ON "messages" USING gin ("search");