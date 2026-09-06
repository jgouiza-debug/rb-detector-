import { z } from "zod";
import { MOOD_TAGS } from "@/lib/ports/ai";

/** API-facing schemas are LOOSE (no .max/.min): the SDK strips those and would
 * fail the whole parse on an over-length reply. Limits are enforced after parse. */
export const RiskSchema = z.object({
  risk: z.enum(["none", "concern", "crisis"]),
  confidence: z.number(),
  reason: z.string(),
});

export const CaptionSchema = z.object({
  caption: z.string(),
  placeHint: z.string().nullable(),
  sensitive: z.boolean(),
});

export const DaySynthesisSchema = z.object({
  title: z.string(),
  reflection: z.string(),
  mood: z.enum(MOOD_TAGS as unknown as [string, ...string[]]),
  moodLabel: z.string(),
  highlights: z.array(z.string()),
});

export function clampCaption(v: z.infer<typeof CaptionSchema>) {
  return { caption: v.caption.slice(0, 120), placeHint: v.placeHint ? v.placeHint.slice(0, 40) : null, sensitive: v.sensitive };
}

export function clampSynthesis(v: z.infer<typeof DaySynthesisSchema>) {
  return {
    title: v.title.slice(0, 48),
    reflection: v.reflection,
    mood: v.mood,
    moodLabel: v.moodLabel.slice(0, 28),
    highlights: v.highlights.slice(0, 3).map((h) => h.slice(0, 60)),
  };
}
