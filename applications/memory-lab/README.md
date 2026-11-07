# Memory Lab

**Developed and designed by Noorullah Adel · 2026.**

[Open this app](https://nad-web.github.io/public/applications/memory-lab/).

A tiny matching game for a quick mental reset.

## Functions

- Match shuffled card pairs
- Track moves and restart a round
- Offer keyboard navigation and reduced-motion mode

The interface supports responsive forms, keyboard/touch use, light/dark themes and local feedback. Important correct calculations and original starter content are retained.

## Local data and limits

Records stay in this browser/profile. Compatible version-one data keys are retained from the previous address. Nothing synchronizes to another device. Where offered, export important records and restore validated JSON backups (maximum 16 MiB). A stale-tab conflict is reported before overwriting a newer record; export edits and reload. Storage denial retains this visit's data for export.

Browser APIs for clipboard, speech, notifications, media, downloads and offline storage vary. Timer apps are in-tab deadline timers, not reliable locked-phone OS alarms. Financial tools use their labelled assumptions and do not connect to banks or process payments. Starter learning collections are practice examples, not complete courses or formal assessments.

## Standalone folder

Keep index.html, src/, assets/, manifest.webmanifest and sw.js together. This app imports its runtime only from its own folder. The parent ../ link opens the shared application library. The repository build discovers the folder and compiles its core cache. HTTPS or localhost is required for offline/install behavior; file:// module loading is unsupported.

See [future-app/hosting conventions](../../docs/ADD_APP.md) and [current verification](../../docs/VALIDATION.md). Original code/content: [MIT](LICENSE). Preserve any bundled vendor notices.
