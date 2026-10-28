# Version 1.0 validation

**Completed:** 28 October 2026 · **Repository:** Nad-Web/001_Public · **Brand:** Noorullah’s Build Lab

## Results

| Check | Observed result |
| --- | --- |
| Source and metadata check | Passed: registry, all 20 release manifests, JavaScript syntax, and local static references |
| Node unit/tooling suite | **24 tests passed; 0 failures** |
| Deployment build | Passed under the `/001_Public/` project prefix |
| Browser suite | **26 scenarios passed; 0 failures** |
| Runtime pages | All 20 apps opened with their intended interfaces and individual install manifests |
| Responsive layout | No horizontal page overflow at 320, 390, and 1440 px in the checked initial states |
| Accessibility scan | No serious or critical axe violations in the checked mobile initial states, using WCAG A/AA tags |
| Offline use | All 20 apps and the gallery opened after the complete cache was installed and network access was disabled |
| Update behavior | A new cached release waited for the explicit update/reload action, then displayed its new page |
| Visual inspection | Representative desktop and mobile gallery, budget, German practice, palette, and game views inspected |

Browser checks used Chromium 153.0.8010.0 with touch/mobile viewport emulation. Node checks used Node 24.22.1. Browser screenshots were used for internal inspection and are not presented as evidence of a physical iPhone test.

## Meaningful regression coverage

The 14 app-logic tests cover exact decimal-to-cent parsing, rejected monetary inputs, cent conservation across group sizes, settlements reducing every balance to zero, savings rounding, conversion reference values, absolute zero, reference contrast ratios, local calendar boundaries, impossible dates, timer deadline clamping, safe CSV export, import schemas, selection/shuffle invariants, and German collection integrity.

The 10 repository-tooling tests cover registry failures, planned-to-prototype generation without overwriting, path safety, release metadata, allowlisted deployment output, broken references, symbolic links, unregistered app folders, and prefix-aware preview serving. Fixtures remain independent of the actual growing app catalogue.

The 26 browser scenarios are recorded in [browser-validation.json](browser-validation.json). They include an actual user flow for every app, reload persistence where relevant, a complete memory-game round, German recall/article feedback, imported quiz scoring and mistake review, malformed imports, safe text rendering, exported files, and timer pause/reload/completion using a controlled clock.

QR validation independently decoded the generated Unicode QR matrix back into its original text with jsQR, and verified PNG and SVG downloads. Regex validation forced a pathological expression to time out in its worker while leaving the interface usable. Blocked-storage checks opened all 20 apps and verified that a successful action did not hide a persistence warning. Dark-theme checks covered the shared preference and the budget interface’s automated contrast scan.

## Reproduce core checks

The owner can publish without installing tools; GitHub Actions runs these checks online. Optional local development requires Node 24+:

```bash
npm run check
npm test
npm run build
```

## Optional browser runner

`tests/browser.mjs` is included so reviewers can reproduce the behavioral tests. Its QA-only packages are not runtime dependencies or served app assets. In a separate folder outside the repository, install `@playwright/test`, `@axe-core/playwright`, and `jsqr`, then install a Playwright Chromium browser. Point `LAB_QA_MODULES` at that folder’s `node_modules` and run:

```bash
node tests/browser.mjs
```

`CHROMIUM_EXECUTABLE` optionally selects an existing compatible Chromium binary. `LAB_QA_OUTPUT` optionally writes a JSON report; `LAB_QA_ONLY` optionally selects scenario names with a regular expression. Build first. The runner starts and closes its own loopback server. The update scenario temporarily changes only the built deployment files and restores them in its cleanup block.

The optional QA package setup is for developers/reviewers. It is not part of the browser-only publishing steps.

## Limits of this evidence

- This source update has not been uploaded or deployed to the owner’s live GitHub site by the assistant. Verify the final Actions run and actual public URLs after upload.
- A **physical iPhone and Safari installation check remains necessary**. Chromium touch emulation and install metadata do not establish real Safari behavior. The release has not been tested on Firefox or a physical Android device either.
- Automated accessibility scans and selected keyboard controls are useful checks, not a full accessibility audit or certification.
- PWA offline files and browser-local records can be evicted. Installed apps and ordinary browser tabs can have different storage contexts. Keep exports as backups.
- Web timers cannot guarantee background or locked-phone alarms. They recover their saved deadline when reopened.
- The apps are focused first releases with documented bounds, not complete language courses, financial platforms, or native App Store packages.
