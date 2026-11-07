# Add a future application

| Item          | Example                                                             |
| ------------- | ------------------------------------------------------------------- |
| Folder        | `applications/invoice-studio/`                                      |
| Entry         | `applications/invoice-studio/index.html`                            |
| Published app | `https://nad-web.github.io/001_Public/applications/invoice-studio/` |
| Main library  | `https://nad-web.github.io/001_Public/applications/`                |

## Browser-only method

Choose a unique lowercase folder name using letters, digits and hyphens. Create that folder under applications, upload index.html and its browser-ready files, then commit to main. The existing workflow discovers, checks and publishes the app. It generates the library card and README tables.

Your index needs ordinary HTML including `<meta name="viewport" content="width=device-width,initial-scale=1">`. Keep scripts in src/, assets in assets/, and data in data/. Use relative links such as `./src/app.js`. Keep all runtime dependencies inside this app; the deliberate `../` navigation link may open the parent library.

An optional app.json sets the card:

```json
{
  "id": "invoice-studio",
  "name": "Invoice Studio",
  "summary": "Create and print invoices in your browser.",
  "category": "productivity",
  "version": "1.0.0",
  "status": "prototype"
}
```

The id must match the folder. Without metadata, the build uses the HTML title and a general description. Existing categories include finances, productivity, education, languages, fun, creative, developer-tools, everyday-tools, on-the-way, health-wellbeing and visualisation. New categories also work with the general card style.

## Recommended files

```text
applications/invoice-studio/
  index.html
  app.json
  README.md
  LICENSE
  manifest.webmanifest
  src/
    app.js
    styles.css
  assets/
  data/
  tests/
```

The build excludes hidden files, node_modules, dist, docs, tests, development scripts/tools, private-key/env/model files and package metadata. Runtime files must be static and ready for a browser. Framework source needs its browser bundle committed inside the app's runtime folders; this workflow does not run arbitrary per-app package builds. Server code and secret API keys need a separate backend.

## Generate a starter, optionally

With Node 24 from the repository root:

```sh
npm run create:app -- invoice-studio "Invoice Studio"
```

This creates a working note-list example with local storage, theme, responsive UI, manifest/icons and a scoped offline worker. Replace the example with the intended app. Update its README/metadata and preserve its licenses.

The UI kit lives in templates/static-app. Each app's runtime is copied locally and independent. npm run sync:ui deliberately updates the twenty maintained apps' local kit. It is not a step required when adding a future app.

## Offline contract

Set `offline: true` only when using the generic worker supplied by the template. The build embeds the content revision and core files into it. MP4s are excluded from automatic caching. An app with a custom worker controls its own contract. Sankey uses its protected build/worker; Memory Garden uses its custom worker.

Offline readiness is verified per app. The main library does not install/download every app. Cache storage can be evicted by a device. Keep exports of user records.

## Check and publish

Run `npm run check`, `npm test` and `npm run build`. The test runner discovers each app's tests/\*.test.mjs. A scripts/check.mjs or tools/check.mjs hook is executed when present. Use npm run dev or npm run preview for the project-prefix preview.

Test the real task, bad inputs, backups/downloads, keyboard/touch controls, 320px layouts, current iPhone Safari and desktop browsers. Record actual results. A phone-width desktop frame is not a physical iPhone test.

Commit the folder to main. No workflow edit is needed for another static app. The README catalogue job uses contents:write; a blocked documentation push does not block the independent website deployment. [Upload guide](MIGRATION.md) · [Architecture](ARCHITECTURE.md).
