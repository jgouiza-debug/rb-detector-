# Preflight

## FAIL — fixture-completeness

12 route(s) exist that the gate never renders. Add them to screens.ts, or list them in config.allowedDeadEnds with a written reason.

- /
- /checkout/done
- /dev/checkout
- /dev/gallery
- /dev/portal
- /goodbye
- /offline
- /settings/about
- /settings/account
- /settings/data
- /settings/notifications
- /sign-in

## FAIL — state-completeness

3 component(s) render a dialog/sheet/modal that no screen setup appears to open. A state the gate never enters is a state it cannot measure.

- components/chat/VoiceSheet.tsx
- components/settings/DangerZone.tsx
- components/settings/EmailLinkSheet.tsx

## FAIL — token-seal

1 declared namespace(s) are not reset to `initial`, so framework defaults can still resolve behind the design system.

- --font-* — add `--font-*: initial;` to the theme block

## BANNER — fixture-vs-production

FIXTURE CONTENT — generated copy on these screens comes from a test double, not the production path. Score layout, hierarchy and interaction normally. Do NOT score the generated copy as the product's voice.

- fixture: lib/adapters/ai/scripted.ts
- production: lib/adapters/ai/anthropic.ts
- production: lib/ai/prompts/synthesis.ts

## FAIL — checkout-freshness

The working tree is dirty. Screenshots would be rendered from code that is not committed, and advisors reading the tree later may see something different. Commit or stash first.

- M package.json
- ?? .claude/
- ?? gauntlet/config.ts
- ?? gauntlet/rounds/round-09/
- ?? gauntlet/scripts/preflight.ts
