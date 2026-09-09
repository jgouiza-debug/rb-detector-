export interface CrisisResource {
  region: string;
  name: string;
  detail: string;
  tel?: string;
  sms?: string;
  href?: string;
}

/**
 * Default resource list: US & Canada baked in, a short international set, and a
 * global fallback. Localize before launching to a non-US/CA audience (see docs/SAFETY.md).
 */
export const CRISIS_RESOURCES: CrisisResource[] = [
  { region: "US & Canada", name: "988 Suicide & Crisis Lifeline", detail: "call or text 988, any time", tel: "988", sms: "988" },
  { region: "US", name: "Crisis Text Line", detail: "text HOME to 741741", sms: "741741" },
  { region: "Canada", name: "Crisis Text Line", detail: "text HOME to 686868", sms: "686868" },
  { region: "UK & Ireland", name: "Samaritans", detail: "call 116 123, free, any time", tel: "116123" },
  { region: "Australia", name: "Lifeline", detail: "call 13 11 14", tel: "131114" },
  // Not every crisis is suicidal. Abuse and domestic-violence disclosures reach
  // the crisis card too now that meaning — not just self-harm keywords — can
  // trip it, so the card has to carry somewhere for those to turn.
  { region: "US", name: "National Domestic Violence Hotline", detail: "call 1-800-799-7233, or text START to 88788", tel: "18007997233", sms: "88788" },
  { region: "UK", name: "National Domestic Abuse Helpline", detail: "call 0808 2000 247, free, any time", tel: "08082000247" },
  { region: "Anywhere", name: "Find a helpline", detail: "findahelpline.com", href: "https://findahelpline.com" },
];

export const EMERGENCY_NOTE = "if you're in immediate danger, please call your local emergency number (911 in the US & Canada, 112 in the EU, 999 in the UK).";
