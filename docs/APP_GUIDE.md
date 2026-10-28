# Build and release an individual app

## 1. Define a useful first version

Read the concept in `Vibcoding/catalogue.json`. Decide the audience, problem, three or fewer first features, observable acceptance criteria, and what stays outside the first version. Record these in the app README and case study when created.

Prefer a browser-only first app with public sample data. Do not add accounts, cloud synchronization, or paid APIs without a specific need.

## 2. Generate the app

Run from the repository root:

```bash
npm run create:app -- languages deutsch-daily
```

This creates `Vibcoding/languages/deutsch-daily/` from the static template and changes that planned catalogue entry to `prototype`. It never overwrites an existing app folder.

To start a new idea:

```bash
npm run create:app -- everyday-tools my-useful-tool "My Useful Tool"
```

The generator registers a new concept with explicit draft descriptions. Replace those descriptions with the actual problem and scope. IDs must be lowercase hyphenated names, at most 60 characters, unique across the repository.

## 3. Implement in small slices

- Replace the generated feature-sketch interface with the intended app.
- Keep the entry at `index.html`; use `src/app.js` and `src/styles.css` or other browser-ready files inside `src/`.
- Keep all original or licensed runtime assets in `assets/`; record their licenses in `assets/README.md`.
- Put optional public data in `data/`. Add `"data"` to `app.json` → `publicFiles` if it is used at runtime.
- Keep links relative; `../../` returns from an app to the library.
- Use semantic forms, associated labels, visible focus, keyboard controls, and clear validation messages.
- Use `textContent` for user input; render trusted static SVG separately.
- Give persisted records an app-specific key and data version. Catch storage and parsing failures. Add export and reset behavior when storing user-created content.
- Avoid placeholders that resemble finished features. Leave the app marked prototype until its intended behavior works.

The generator supplies a tiny feature-list interaction to verify wiring, not an implementation of your app concept.

## 4. Run and verify

```bash
npm run dev
```

Open `http://127.0.0.1:4173/Vibcoding/languages/deutsch-daily/`. Test normal use, empty inputs, incorrect inputs, and the important edge cases. If the app saves data, reload, import invalid data, export, and reset. Test keyboard navigation and a narrow screen.

```bash
npm run check
npm test
npm run build
npm run preview -- --base /001_Public/
```

Open `http://127.0.0.1:4173/001_Public/Vibcoding/languages/deutsch-daily/` and repeat the main user flow. Confirm the portfolio’s demo link works too.

The root `npm test` runs the tooling suite under `tests/`. For app logic, add meaningful Node tests there that import pure functions from the app, or explicitly integrate an app-specific test runner. Merely adding a test file inside an app does not make the root suite execute it.

For example, a budgeting app needs independently checked totals and rounding cases; a vocabulary app needs question selection, answer evaluation, and persistence checks. A copy-only content edit generally needs a visual check, not a redundant test suite.

## 5. Document your evidence

Update:

- `README.md`: actual behavior, run instructions, storage, limits, and attribution.
- `docs/case-study.md`: problem, design decisions, technical tradeoffs, actual checks and findings, and what AI helped with.
- `assets/`: a real screenshot of the working app, e.g. `screenshot.png`.
- `Vibcoding/catalogue.json`: accurate summary, skills, concept features, and stage.
- `app.json`: matching identity and release metadata.

Do not use mockup images as evidence of a working app. Use sample data in screenshots.

## 6. Mark ready

Only once acceptance criteria pass, change the app’s status to `ready` in **both** `app.json` and `Vibcoding/catalogue.json`. Example manifest (set the actual release date):

```json
{
  "id": "deutsch-daily",
  "name": "Deutsch Daily",
  "category": "languages",
  "status": "ready",
  "version": "1.0.0",
  "entry": "index.html",
  "publicFiles": ["index.html", "src", "assets"],
  "releasedOn": "YYYY-MM-DD",
  "screenshot": "assets/screenshot.png"
}
```

The checker requires an existing screenshot file, release date, and semantic version for ready apps. Update or remove any hardcoded prototype badge in the app’s own HTML and README. The gallery then changes its link to **Open app**.

## 7. Review and publish

Commit the complete app source and assets. For substantial work, use a branch and pull request. After verification and merge to `main`, Pages publishes the updated library. Confirm the live demo after deployment; a successful local build is not proof that remote deployment succeeded.

Add a short entry to `CHANGELOG.md`. Keep the case study’s limitations current after each release.

## Add a category later

1. Add a record to `Vibcoding/categories.json` with a unique slug, label, description, supported color, and existing icon name from `Vibcoding/src/icons.js`.
2. Create `Vibcoding/<new-category>/README.md` describing its scope.
3. Add ideas to the catalogue or run the generator for the new category.
4. Update the root collection table and the decorative workbench’s category summary if desired. Gallery filters and numerical counts derive from JSON automatically.
5. Run the normal checks and build.
