# {{APP_NAME}}

> Stage: prototype. The generated starter interaction is not the intended app.

**Category:** {{CATEGORY}} · **App id:** {{APP_ID}}

## Problem and audience

Use the concept in `Vibcoding/catalogue.json` as a starting point. Explain the real problem, who experiences it, and what a useful first version does.

## Features and limits

- Current behavior: the starter accepts and removes up to ten feature ideas in memory.
- Intended features: implement and document them here.
- Storage: the starter keeps no persistent data; reloading clears the sketch.
- Accounts and external services: none in the starter.

## Run

From the repository root:

```bash
npm run dev
```

Open `http://127.0.0.1:4173/Vibcoding/{{CATEGORY}}/{{APP_ID}}/`.

## Project layout

| Path | Purpose |
| --- | --- |
| `index.html` | Browser entry point |
| `src/app.js` | App behavior |
| `src/styles.css` | App styles |
| `assets/` | Original or licensed images, icons, fonts, screenshots |
| `data/` | Optional reviewed public datasets; add to publicFiles if used |
| `app.json` | Stage, version, and deployment allowlist |
| `docs/case-study.md` | Problem, design decisions, checks, and learning |

## Validation

Run the root checks and test the actual app’s behavior in a browser. Record evidence in [the case study](docs/case-study.md). Add meaningful tests for calculations, persistence, or nontrivial behavior when implemented.

```bash
npm run check
npm test
npm run build
```

## Release

Follow [the app guide](../../../docs/APP_GUIDE.md). Mark both the catalogue and app manifest `ready` only after the intended features work. Add the actual release date, version, and `validation: "docs/case-study.md"` to `app.json`; a real screenshot is optional.

## License and attribution

Code inherits the repository MIT license. Record any third-party assets and dataset licenses in `assets/README.md`.
