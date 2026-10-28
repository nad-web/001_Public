# Architecture

## A simple monorepo

`001_Public` is one Git repository holding many independently addressable browser apps under `Vibcoding/<category>/<app-id>/`. The portfolio catalogue is an app of its own at `Vibcoding/index.html`.

The initial stack is semantic HTML, CSS, browser JavaScript modules, and dependency-free Node 24 development tools. This keeps the initial setup small and all runtime assets under your control. Frameworks can be introduced per app when justified.

## Configuration and metadata

| File | Responsibility |
| --- | --- |
| `portfolio.json` | Owner identity and GitHub repository links; a blank username suppresses GitHub links |
| `Vibcoding/categories.json` | Stable category IDs, labels, icons, and colors |
| `Vibcoding/catalogue.json` | App ideas, summaries, stages, skills, and concept briefs |
| `Vibcoding/<category>/<id>/app.json` | Per-app identity, stage, version, entry point, deployment allowlist, release date, and screenshot |

Use lowercase, hyphenated category and app slugs. App IDs are unique across the repository. The generator changes an existing planned record to prototype without creating a duplicate. New IDs create a new record.

| Stage | Required behavior |
| --- | --- |
| `planned` | Concept brief in the registry; no app folder and no demo link |
| `prototype` | Real app folder, valid manifest, source, assets, README, and case study; demo link says prototype |
| `ready` | Intended features implemented and verified; release date, semantic version, real screenshot, and updated case study |

Automated checks enforce structural release metadata. They cannot determine whether a feature is useful or whether the author’s evidence is truthful; that requires human review.

## App source layout

| Path inside an app | Contents |
| --- | --- |
| `index.html` | Browser entry point |
| `src/` | All editable application logic and styles |
| `assets/` | Icons, optimized images, fonts, sound, screenshots, attribution |
| `data/` | Optional reviewed public static data |
| `docs/case-study.md` | Decisions, validation, limitations, AI collaboration |
| `tests/` | Optional meaningful app-specific tests |
| `README.md` | Run instructions and actual feature scope |
| `app.json` | Deployment and release metadata |

## Build and deployment

1. Validate catalogue records, category folders, and app manifests.
2. Create `dist/` from an explicit set of portfolio files and shared runtime assets.
3. Add each implemented app’s `publicFiles`. Allowed top-level entries are `index.html`, `src`, `assets`, and `data`. Markdown documentation is omitted from the site artifact.
4. Reject symbolic links and hidden or credential file extensions in published paths.
5. Check HTML asset links, CSS URLs, and static relative JavaScript imports in the result.
6. Upload and deploy the artifact through the official Pages actions, after repository checks and tooling tests pass.

Documentation, test code, templates, and configuration stay visible in the public source repository but are omitted from the Pages artifact. This is deployment hygiene, not confidentiality: anything committed to this public repository is public.

The checks cover static references; runtime fetch paths and application behavior require browser verification. The builder is a file copier, not a bundler. Do not use bare npm imports, JSX, TypeScript, or unresolved build syntax in a deployed browser entry point. If an app needs a bundler, add a documented app build step before the root deployment build and put its browser-ready output in the allowed paths. Preserve its original source and lockfile in its app folder.

## URL strategy

All internal URLs are relative. The site works under both a local root and GitHub’s project prefix:

- Local gallery: `/Vibcoding/`
- GitHub gallery: `/001_Public/Vibcoding/`
- Future app: `/001_Public/Vibcoding/languages/deutsch-daily/`

No client router or single-page fallback is needed. Each app has its own directory and entry point. Paths are case-sensitive on GitHub Pages.

## Storage and service boundaries

The foundation has no accounts, analytics, remote database, or application backend. The gallery optionally saves only a light/dark preference in localStorage. Future app persistence should be explicitly documented, namespaced by app id and schema version, validated when loaded, and support export or deletion when appropriate.

Browser storage is per origin, not per folder. Other apps on the same origin can access it. It is unsuitable for secrets or confidential records. Progress stays on the same device and browser unless a future synchronization service is deliberately added.

Static files can contain public curated content or synthetic examples. Currency rates, stock prices, live travel information, and AI inference need a defined data source. CORS restrictions, quotas, terms, and attribution must be handled. Calls requiring secret keys belong behind separately hosted server code, never in browser JavaScript or public JSON.

## Growth without unnecessary complexity

Build a few useful apps before adding shared infrastructure. Extract a stable function when multiple apps actually need it. Keep one app’s changes independent of other apps. Separate backend hosting can be added per app without moving its source away from this repository.

See [APP_GUIDE.md](APP_GUIDE.md) for the workflow and [GETTING_STARTED.md](GETTING_STARTED.md) for implementation.
