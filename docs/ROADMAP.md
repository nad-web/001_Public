# Release roadmap

## Version 1.0 — implemented

All 20 original app concepts, two in each of the 10 categories, now have working browser implementations, local source, mobile layouts, install manifests, documented scope, and validation evidence. The source package must be uploaded by the owner before the existing live site receives the update.

See the root README for the feature matrix and [validation](VALIDATION.md) for completed checks and their limits.

## Owner publication checks

- Upload all source batches using [the browser-only update guide](BROWSER_UPDATE.md).
- Confirm the final GitHub Actions run and Pages deployment succeed.
- Test the actual public URLs and the Home Screen flow on a real iPhone in Safari.
- Export any data before testing browser-data deletion or switching install contexts.

## Next improvements based on feedback

- Add more reviewed German exercises and original quiz collections.
- Improve individual apps in response to real usage rather than adding unrelated infrastructure.
- Extend browser QA to additional engines and a real-device test matrix.
- Consider cloud synchronization only when its requirements, hosting, identity, and privacy implications are explicitly agreed.

No backend, payment processing, market-data feed, full language course, or native App Store package is claimed by version 1.0.
