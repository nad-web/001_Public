# Foundation validation

Validation completed on **28 October 2026** for the supplied repository foundation.

## Automated source and tooling checks

- `npm run check` passed: catalogue and category records, implemented-app manifests, JavaScript syntax, and local static references.
- `npm test` passed: **10 tests, 0 failures** covering registry failures, generator behavior and safe naming, release metadata, deployment output, broken references, symbolic links, app registration, and preview serving.
- `npm run build` passed: generated and checked the static deployment artifact.
- GitHub workflow and issue-template YAML parsed successfully; Markdown local links resolved.

The tooling tests use isolated concept fixtures. They were also run successfully in a separate copy after generating the planned Deutsch Daily prototype, so beginning a real app does not break the suite’s assumptions.

## Browser checks

Checked with **Chromium 153.0.8010.0** against the generated deployment artifact under the actual `/001_Public/` project prefix:

- Root redirect, catalogue JSON loading, script modules, styles, and icon paths.
- All 20 planned concepts render with no misleading launch links.
- Category, text, and stage filters; no-results state and filter reset.
- Concept-dialog content, Escape dismissal, and focus return to the opener.
- Light/dark switching, reload persistence, and behavior when localStorage is unavailable.
- No horizontal page overflow at 320, 390, 768, and 1440 pixel viewport widths.
- Desktop light/dark views and mobile views visually inspected.
- No captured page errors or failed HTTP responses in these flows.

In a separate generated-app copy, the browser flow also passed from catalogue → prototype → library. The starter’s add/remove controls, whitespace validation, ten-item limit, safe text rendering, and narrow-screen layout were checked. This verifies the template wiring, not a completed German learning app.

## Limits and checks after publication

The package has not been pushed to a GitHub account. The remote workflow, GitHub Pages settings, repository permissions, and final live domain have not been exercised. Those require the owner’s publishing steps in [GETTING_STARTED.md](GETTING_STARTED.md).

Browser checks cover one Chromium engine and selected user flows. They do not establish a full accessibility audit or Safari/Firefox compatibility. Recheck the actual deployed site and relevant browsers before presenting an individual app as ready.

No individual app’s intended features, language content, financial calculations, or external integrations have been implemented or evaluated yet. Each future app needs its own acceptance criteria and evidence.
