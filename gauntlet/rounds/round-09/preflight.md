# Preflight

## BANNER — fixture-vs-production

FIXTURE CONTENT — generated copy on these screens comes from a test double, not the production path. Score layout, hierarchy and interaction normally. Do NOT score the generated copy as the product's voice.

- fixture: lib/adapters/ai/scripted.ts
- production: lib/adapters/ai/anthropic.ts
- production: lib/ai/prompts/synthesis.ts

## FAIL — checkout-freshness

The working tree is dirty. Screenshots would be rendered from code that is not committed, and advisors reading the tree later may see something different. Commit or stash first.

- M .claude/skills/ui-gauntlet/scripts/preflight.ts
-  M app/(app)/memory/[date]/page.tsx
-  M app/(app)/settings/subscription/page.tsx
-  M app/(app)/timeline/page.tsx
-  M app/(onboarding)/name/page.tsx
-  M app/(onboarding)/rhythm/page.tsx
-  M app/globals.css
-  M app/goodbye/page.tsx
-  M app/layout.tsx
-  M app/sign-in/page.tsx
