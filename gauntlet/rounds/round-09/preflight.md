# Preflight

## BANNER — fixture-vs-production

FIXTURE CONTENT — generated copy on these screens comes from a test double, not the production path. Score layout, hierarchy and interaction normally. Do NOT score the generated copy as the product's voice.

- fixture: lib/adapters/ai/scripted.ts
- production: lib/adapters/ai/anthropic.ts
- production: lib/ai/prompts/synthesis.ts

## FAIL — checkout-freshness

The working tree is dirty. Screenshots would be rendered from code that is not committed, and advisors reading the tree later may see something different. Commit or stash first.

- M gauntlet/gate.spec.ts
-  M gauntlet/rounds/round-09/gate-report.json
-  M gauntlet/rounds/round-09/gate-report.md
-  M gauntlet/rounds/round-09/screens/goodbye-dark.jpg
-  M gauntlet/rounds/round-09/screens/goodbye-light.jpg
-  M gauntlet/rounds/round-09/screens/meditation-pause-dark.jpg
-  M gauntlet/rounds/round-09/screens/meditation-pause-light.jpg
-  M gauntlet/rounds/round-09/screens/memory-card-light-full.jpg
-  M gauntlet/rounds/round-09/screens/memory-card-light.jpg
-  M gauntlet/rounds/round-09/screens/offline-light.jpg
