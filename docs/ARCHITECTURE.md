# Architecture — version 1.0

## One repository, twenty independent routes

`001_Public` holds the portfolio and all apps under `Vibcoding/<category>/<id>/`. Every app has a browser entry point and its own install manifest. Shared code is promoted only where multiple apps actually use it: safe DOM construction, data handling, calculations, German exercises, and the timer engine.

| File or path | Role |
| --- | --- |
| `portfolio.json` | Noorullah’s identity and Nad-Web repository links |
| `Vibcoding/categories.json` | Collection IDs, labels, icons, and colors |
| `Vibcoding/catalogue.json` | App descriptions, stages, and skill/feature briefs |
| `Vibcoding/<category>/<id>/app.json` | Version, release date, validation-document path, and runtime allowlist |
| `Vibcoding/<category>/<id>/manifest.webmanifest` | App identity, standalone launch, scope, and install icons |
| `Vibcoding/shared/js/shell.js` | Safe DOM helpers, labels, storage, imports, exports, theme |
| `Vibcoding/shared/js/logic.js` | Tested calculations, date functions, random selection, import schemas |
| `Vibcoding/shared/js/german.js`, `german-data.js` | The shared German practice engine and original exercises |
| `Vibcoding/shared/js/timer.js` | Deadline-based timer behavior shared by Focus Flow and Break Buddy |
| `Vibcoding/shared/js/pwa.js` | Registration, install instructions, offline-ready state, update prompt |
| `sw.template.js` | Content-versioned service-worker source template |
| `scripts/build.mjs` | Runtime allowlist, built-site checks, and service-worker generation |
| `tests/` | Tooling, calculation, and optional browser regression checks |

## Source and runtime boundaries

The source repository contains all implementation files and optimized assets. The deployment artifact contains root entry/configuration/install assets, the catalogue, shared runtime modules, and implemented apps’ declared public files. Allowed app paths are `index.html`, `src`, `assets`, optional `data`, and `manifest.webmanifest`.

Markdown documentation, tests, tooling, and app manifests for release management are omitted from Pages output. Everything committed remains public in the source repository, so this is deployment hygiene rather than confidentiality.

The root build copies browser-ready source; it does not compile TypeScript, JSX, or bare package imports. The QR encoder is vendored as an unchanged browser module with a recorded version and license. No runtime CDN is required.

## PWA and offline model

The builder hashes the actual deployment files, then generates a worker cache name and a complete precache list. The worker’s scope is the repository’s `/001_Public/` prefix. First installation downloads the complete runtime library. Known cached files are served as one coherent release; a newly installed worker waits until pages close or the user explicitly accepts the update/reload action.

The library and individual apps have distinct manifest IDs resolved relative to their directories. All paths remain relative so local root previews and the GitHub project prefix work.

Offline cache is a browser convenience, not permanent storage. Browsers can remove it under storage pressure. Data backups remain the user’s responsibility. There are no push servers, background cron jobs, or guaranteed locked-phone alarms.

## Data and validation

User records are namespaced as `noorullah-lab:<app-id>:v1`. Storage wrappers retain a usable in-memory state when storage is blocked, and show a warning if persistence fails. Loaded and imported records are schema-checked and bounded. JSON files are capped at 1 MB for import. Apps using backups provide explicit replace confirmation.

Money uses integer cents. Group splits conserve every cent; deterministic remainder allocation is documented. Timers store an absolute deadline and recover elapsed time on reopening. Habit dates use local calendar fields rather than UTC date slicing. Regex execution runs in a separate terminable worker.

Browser localStorage is per origin and is not a confidential vault. Apps sharing an origin can access its values. Installed apps and normal tabs may have separate browser storage contexts. No records synchronize to a server or another device.

## Release stages

`planned` means a concept with no app directory. `prototype` means implemented source under development. `ready` requires implemented acceptance criteria, a release date and semantic version, and a current `docs/case-study.md` with actual validation evidence. Screenshots can supplement evidence when requested; they are optional and must never be invented.

The check enforces metadata and paths. It cannot establish semantic correctness by itself. Unit/tooling tests and browser scenarios provide the recorded evidence for this release; a real iPhone/Safari and remote deployment check remain owner follow-up checks.
