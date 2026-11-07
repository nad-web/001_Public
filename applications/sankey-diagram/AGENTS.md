# Sankey Studio

Developer: Noorullah Adel.

- Keep this application self-contained. Source, assets, documentation, tests and app tools belong in this folder.
- Do not import files from parent directories or add a runtime CDN.
- Keep relative URLs, app-specific storage keys and app-scoped offline caches.
- Keep developer attribution visible and retain third-party licence notices.
- Validate imported data and use textContent for user-provided labels.
- Run npm run check, npm test and npm run build from this folder after relevant changes.
- Run npm run prepare:offline before distributing a raw-source upload ZIP so the source worker has a current resource list and cache revision.
- Record observed validation in docs/case-study.md. Keep the release stage prototype until remaining device/browser acceptance checks are completed.
- GitHub Pages hosting configuration is separate from the app files. The documented workflow step invokes this app's own build tool; do not move app code outside this folder.
