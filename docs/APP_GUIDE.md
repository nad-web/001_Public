# Extend the app library

## Start with a clear scope

Read the app/category README, concept brief, and `AGENTS.md`. Define the audience and observable acceptance criteria. Existing apps document their actual version-1 features and limits; keep changes aligned with that scope.

## Generate a new app

The dependency-free Node generator is optional for developers:

```bash
npm run create:app -- creative my-new-app "My New App"
```

It creates the source directory from the template, registers the new ID, and marks the app prototype. It never merges over an existing app. A planned idea changes stage without duplicating its registry record.

## Implement and integrate

Use relative URLs and browser-ready modules. Reuse shared helpers for labeling, safe text rendering, validation, storage, and exports. Keep business logic in its app unless another app needs the same stable behavior. Use integer cents for money and local calendar dates for habit-style data.

For installation, add a unique relative `manifest.webmanifest` using the existing apps as examples and include it in `app.json` → `publicFiles`. Add the shared PWA helper and the build-only registration marker workflow by using the standard shell. The root builder automatically adds the deployed files to the offline worker’s precache.

Allowed public paths are index.html, src, assets, data, and manifest.webmanifest. Source documentation, tests, and runtime credentials do not belong in app runtime assets. Secret API keys need separately hosted server logic; they cannot be hidden in static code.

## Verify

Run source checks, meaningful tests for important logic, and the deployment build. Test actual flows, bad inputs, reloads, exports/imports, keyboard use, and narrow layouts under the `/001_Public/` prefix. Use the optional browser runner when changing shared behavior. Keep verification limits explicit.

## Release and publish

Update the catalogue and app manifest together. A ready app needs a semantic version, actual release date, and `validation: "docs/case-study.md"` pointing to completed evidence. A screenshot is optional supplemental evidence. Record scope, limits, source attribution, and AI assistance honestly.

Publishing through GitHub’s browser UI does not require local Node/npm. Follow [BROWSER_UPDATE.md](BROWSER_UPDATE.md), then verify the live deployment and device flow.
