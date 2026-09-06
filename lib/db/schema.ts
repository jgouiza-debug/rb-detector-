import { sql } from "drizzle-orm";
import {
  bigint,
  boolean,
  customType,
  date,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  primaryKey,
  smallint,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

export const senderEnum = pgEnum("sender_t", ["user", "pip", "system"]);
export const msgKindEnum = pgEnum("msg_kind_t", ["text", "photo", "crisis", "pause_offer", "day_ready", "pause_done", "note"]);
export const safetyEnum = pgEnum("safety_t", ["none", "concern", "crisis"]);
export const moodEnum = pgEnum("mood_t", ["bright", "calm", "heavy", "tender", "growing", "mixed"]);
export const captionEnum = pgEnum("caption_t", ["pending", "done", "failed"]);
export const nudgeKindEnum = pgEnum("nudge_kind_t", ["morning", "evening_nudge", "evening_synth", "day_ready", "finalize"]);
export const memoryStatusEnum = pgEnum("memory_status_t", ["ready", "pending", "failed"]);

const tsvector = customType<{ data: string; driverData: string }>({
  dataType() {
    return "tsvector";
  },
});

export interface Prefs {
  morningEnabled?: boolean;
  eveningEnabled?: boolean;
  haptics?: boolean;
  theme?: "system" | "light" | "dark";
}

export interface MessageMeta {
  memoryDate?: string;
  action?: "breathe" | "crisis";
  bubbleIndex?: number;
  bubbleCount?: number;
  mediaIds?: string[];
}

const ts = (name: string) => timestamp(name, { withTimezone: true, mode: "date" });

export const profiles = pgTable("profiles", {
  id: uuid("id").primaryKey(),
  name: text("name"),
  email: text("email"),
  isAnonymous: boolean("is_anonymous").notNull().default(true),
  needsEmailLink: boolean("needs_email_link").notNull().default(false),
  timezone: text("timezone").notNull().default("UTC"),
  morningTime: text("morning_time"),
  eveningTime: text("evening_time"),
  focus: text("focus").array().notNull().default(sql`'{}'::text[]`),
  prefs: jsonb("prefs").$type<Prefs>().notNull().default(sql`'{}'::jsonb`),
  careModeUntil: ts("care_mode_until"),
  onboardedAt: ts("onboarded_at"),
  createdAt: ts("created_at").notNull().defaultNow(),
  updatedAt: ts("updated_at").notNull().defaultNow(),
});

export const messages = pgTable(
  "messages",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => profiles.id, { onDelete: "cascade" }),
    sender: senderEnum("sender").notNull(),
    kind: msgKindEnum("kind").notNull().default("text"),
    text: text("text").notNull().default(""),
    clientId: text("client_id"),
    groupId: uuid("group_id"),
    replyTo: uuid("reply_to"),
    localDate: date("local_date", { mode: "string" }).notNull(),
    safetyLevel: safetyEnum("safety_level").notNull().default("none"),
    meta: jsonb("meta").$type<MessageMeta>().notNull().default(sql`'{}'::jsonb`),
    createdAt: ts("created_at").notNull().defaultNow(),
    search: tsvector("search").generatedAlwaysAs(sql`to_tsvector('english', "text")`),
  },
  (t) => [
    uniqueIndex("messages_user_client").on(t.userId, t.clientId),
    index("messages_user_created").on(t.userId, t.createdAt.desc()),
    index("messages_user_date").on(t.userId, t.localDate),
    index("messages_search").using("gin", t.search),
  ],
);

export const media = pgTable(
  "media",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => profiles.id, { onDelete: "cascade" }),
    messageId: uuid("message_id").references(() => messages.id, { onDelete: "cascade" }),
    keyFull: text("key_full").notNull(),
    keyThumb: text("key_thumb").notNull(),
    width: integer("width").notNull(),
    height: integer("height").notNull(),
    bytes: integer("bytes").notNull(),
    aiCaption: text("ai_caption"),
    placeHint: text("place_hint"),
    sensitive: boolean("sensitive").notNull().default(false),
    captionStatus: captionEnum("caption_status").notNull().default("pending"),
    createdAt: ts("created_at").notNull().defaultNow(),
  },
  (t) => [index("media_user_msg").on(t.userId, t.messageId)],
);

export const memories = pgTable(
  "memories",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => profiles.id, { onDelete: "cascade" }),
    localDate: date("local_date", { mode: "string" }).notNull(),
    title: text("title").notNull().default(""),
    reflection: text("reflection").notNull().default(""),
    mood: moodEnum("mood").notNull().default("mixed"),
    moodLabel: text("mood_label").notNull().default(""),
    highlights: text("highlights").array().notNull().default(sql`'{}'::text[]`),
    entryCount: integer("entry_count").notNull().default(0),
    mediaIds: uuid("media_ids").array().notNull().default(sql`'{}'::uuid[]`),
    sourceHash: text("source_hash").notNull().default(""),
    version: integer("version").notNull().default(0),
    status: memoryStatusEnum("status").notNull().default("pending"),
    resonated: boolean("resonated").notNull().default(false),
    createdAt: ts("created_at").notNull().defaultNow(),
    updatedAt: ts("updated_at").notNull().defaultNow(),
    search: tsvector("search").generatedAlwaysAs(sql`to_tsvector('english', coalesce("title", '') || ' ' || "reflection")`),
  },
  (t) => [
    uniqueIndex("memories_user_date").on(t.userId, t.localDate),
    index("memories_user_date_desc").on(t.userId, t.localDate.desc()),
    index("memories_search").using("gin", t.search),
  ],
);

export const subscriptions = pgTable("subscriptions", {
  userId: uuid("user_id")
    .primaryKey()
    .references(() => profiles.id, { onDelete: "cascade" }),
  stripeCustomerId: text("stripe_customer_id").unique(),
  stripeSubscriptionId: text("stripe_subscription_id").unique(),
  status: text("status").notNull().default("none"),
  plan: text("plan").notNull().default("plus"),
  currentPeriodEnd: ts("current_period_end"),
  cancelAtPeriodEnd: boolean("cancel_at_period_end").notNull().default(false),
  lastEventAt: ts("last_event_at"),
  updatedAt: ts("updated_at").notNull().defaultNow(),
});

export const billingEvents = pgTable("billing_events", {
  id: text("id").primaryKey(),
  type: text("type").notNull(),
  userId: uuid("user_id"),
  payload: jsonb("payload").notNull().default(sql`'{}'::jsonb`),
  receivedAt: ts("received_at").notNull().defaultNow(),
  processedAt: ts("processed_at"),
  error: text("error"),
});

export const pushSubscriptions = pgTable("push_subscriptions", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => profiles.id, { onDelete: "cascade" }),
  endpoint: text("endpoint").notNull().unique(),
  p256dh: text("p256dh").notNull(),
  auth: text("auth").notNull(),
  userAgent: text("user_agent"),
  failCount: integer("fail_count").notNull().default(0),
  createdAt: ts("created_at").notNull().defaultNow(),
});

export const nudgeLog = pgTable(
  "nudge_log",
  {
    userId: uuid("user_id")
      .notNull()
      .references(() => profiles.id, { onDelete: "cascade" }),
    kind: nudgeKindEnum("kind").notNull(),
    localDate: date("local_date", { mode: "string" }).notNull(),
    sentAt: ts("sent_at").notNull().defaultNow(),
  },
  (t) => [primaryKey({ columns: [t.userId, t.kind, t.localDate] })],
);

export const usageDaily = pgTable(
  "usage_daily",
  {
    userId: uuid("user_id")
      .notNull()
      .references(() => profiles.id, { onDelete: "cascade" }),
    localDate: date("local_date", { mode: "string" }).notNull(),
    replies: integer("replies").notNull().default(0),
    captions: integer("captions").notNull().default(0),
    syntheses: integer("syntheses").notNull().default(0),
    tokensIn: bigint("tokens_in", { mode: "number" }).notNull().default(0),
    tokensOut: bigint("tokens_out", { mode: "number" }).notNull().default(0),
  },
  (t) => [primaryKey({ columns: [t.userId, t.localDate] })],
);

export const usageGlobal = pgTable("usage_global", {
  localDate: date("local_date", { mode: "string" }).primaryKey(),
  replies: integer("replies").notNull().default(0),
  captions: integer("captions").notNull().default(0),
  syntheses: integer("syntheses").notNull().default(0),
  tokensIn: bigint("tokens_in", { mode: "number" }).notNull().default(0),
  tokensOut: bigint("tokens_out", { mode: "number" }).notNull().default(0),
});

export const safetyEvents = pgTable("safety_events", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => profiles.id, { onDelete: "cascade" }),
  messageId: uuid("message_id"),
  tier: smallint("tier").notNull(),
  verdict: safetyEnum("verdict").notNull(),
  source: text("source").notNull(),
  createdAt: ts("created_at").notNull().defaultNow(),
});

export const pushOutbox = pgTable("push_outbox", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull(),
  payload: jsonb("payload").notNull(),
  createdAt: ts("created_at").notNull().defaultNow(),
});

export const localOtps = pgTable("local_otps", {
  email: text("email").primaryKey(),
  code: text("code").notNull(),
  purpose: text("purpose").notNull().default("link"),
  userId: uuid("user_id"),
  expiresAt: ts("expires_at").notNull(),
});

export const rateLimits = pgTable("rate_limits", {
  key: text("key").primaryKey(),
  count: integer("count").notNull().default(0),
  windowStart: ts("window_start").notNull().defaultNow(),
});

export type Profile = typeof profiles.$inferSelect;
export type Message = typeof messages.$inferSelect;
export type Media = typeof media.$inferSelect;
export type Memory = typeof memories.$inferSelect;
export type Subscription = typeof subscriptions.$inferSelect;
export type BillingEventRow = typeof billingEvents.$inferSelect;
export type PushSubscription = typeof pushSubscriptions.$inferSelect;
