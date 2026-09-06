import { Cloud, Contrast, Heart, Sprout, Sun, Waves, type LucideIcon } from "lucide-react";
import type { MoodTag } from "./tokens";

/**
 * A coherent line-icon per mood — the secondary cue next to the mood's colour
 * (which is the primary signal). Replaces the old emoji glyphs so the mood
 * system reads as one crafted set rather than OS-rendered emoji.
 */
export const moodIcon: Record<MoodTag, LucideIcon> = {
  bright: Sun,
  calm: Waves,
  heavy: Cloud,
  tender: Heart,
  growing: Sprout,
  mixed: Contrast,
};
