# Repository instructions

This is Noorullah Adel's public application library. Preserve the exact name `public`.

- Every app belongs in `applications/<lowercase-hyphenated-slug>/` and carries its own browser-ready runtime files. Use app-relative URLs.
- The build discovers folders and optional app.json metadata automatically. Do not add manual per-app build steps or maintain a second application registry.
- Keep `applications/sankey-diagram/` byte-for-byte unchanged unless the owner explicitly authorizes changes. A hash fixture verifies the protected source snapshot.
- Read the root README, target app README, and docs/ARCHITECTURE.md before editing.
- Keep compatible browser record keys and import schemas. Validate numbers/imports, handle storage denial and report stale-tab conflicts without overwriting newer records.
- Keep user text out of executable markup. Never commit secrets or user production records to this public repository.
- Use semantic controls, visible focus, touch/keyboard alternatives, responsive layouts and reduced-motion support.
- Offline caches belong to individual apps. Never precache the growing library or delete another app's cache.
- The starter kit lives in templates/static-app. Existing apps have independent copies. npm run sync:ui intentionally updates their kit; app logic stays local.
- Preserve MIT, vendor licenses and local asset/voice provenance.
- Run npm run check, npm test, npm run build. Test the changed flow in a browser below /public/, including phone width. State pending physical-device checks honestly.
