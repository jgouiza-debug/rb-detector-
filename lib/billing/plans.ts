export type Plan = "free" | "plus";

export interface Entitlement {
  plan: Plan;
  /** null = unlimited timeline (plus); a number = days visible (free). */
  windowDays: number | null;
}

export const FREE_WINDOW_DAYS = 7;
