# Publish Memory Garden

Developer: Noorullah Adel / نورالله عادل · 2026 · version 2.0.0.

Canonical folder: applications/memory-game/. Address after publication: https://nad-web.github.io/001_Public/applications/memory-game/.

The root workflow discovers, checks and publishes this folder automatically. No per-app build step is needed. A redirect/retirement worker is generated for the old MemoryGame address. Compatible records retain the existing key on the same browser/profile.

[Repository upload guide](../../../docs/MIGRATION.md). On iPhone use the in-game installation help and Safari's Share → Add to Home Screen. Open online and wait for verified readiness before offline testing. Physical iPhone verification remains pending.

After runtime changes run node scripts/update-cache.mjs from this app folder, then repository checks. Keep this app's custom scoped worker. Asset attribution remains in ASSET_ATTRIBUTION.md and the native About screen.
