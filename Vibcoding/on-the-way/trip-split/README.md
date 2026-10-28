# Trip Split

**Noorullah’s Build Lab · version 1.0.0 · on-the-way**

Keep shared trip costs understandable from the first coffee.

## Open and install

After this release is deployed: https://nad-web.github.io/001_Public/Vibcoding/on-the-way/trip-split/

On iPhone, open the page in Safari → Share → Add to Home Screen. The in-app Install button explains platform-specific steps. Open online once and wait for the offline-ready message before relying on cached use. See [the browser-only update guide](../../../docs/BROWSER_UPDATE.md).

## Implemented scope

2–20 participants; equal-share expenses in EUR; deterministic cent remainders; exact balances; suggested settlements; JSON backup/restore.

## Limits

Every expense is shared by the whole group. Group membership is fixed while expenses exist. No currency exchange or transfers of money.

## Data

Application records, where used, stay in this browser/device. Installed apps and Safari tabs can have different storage contexts. There is no account or device synchronization. Local data/cache can be cleared by the browser; use exports for important records. Inputs are rendered with safe DOM APIs.

## Source

- `index.html`: branded accessible entry page and install help.
- `src/app.js`: app entry and app-specific behavior.
- `manifest.webmanifest`: individual app installation metadata.
- `assets/`: public assets and attribution notes.
- `docs/case-study.md`: implementation decisions, completed validation, and limits.
- Shared dependencies: `Vibcoding/shared/js/` and `Vibcoding/shared/styles/`.

The app depends on the shared library folders and root brand assets; copying this app folder alone is not a standalone distribution. Its installed web-app experience uses the repository’s complete offline cache.

## Validation

Checked on 28 October 2026: participant entry, uneven expense balances, suggested settlements, and saved trip data. Shared browser verification covered mobile/desktop rendering, manifests, accessible labeling, and no horizontal page overflow at 320, 390, and 1440 px. See [release validation](../../../docs/VALIDATION.md) for the test commands and verification limits.

## Development

Optional local development from the repository root: `npm run dev`. Automated repository checks: `npm run check`, `npm test`, and `npm run build`. Publishing from GitHub’s website does not require installing these tools locally.

## License

Original code and content: repository MIT license. Third-party notices, where applicable, are recorded in the root `THIRD_PARTY_NOTICES.md` and local assets notes.
