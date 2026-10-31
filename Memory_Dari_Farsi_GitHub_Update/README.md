<p align="center"><img src="assets/brand/mark.svg" width="72" alt="Noorullah’s Build Lab code mark"></p>

# Noorullah’s Build Lab

**Small ideas. Useful things.** Twenty-one open source browser apps by **Noorullah Adel**, in the public repository **Nad-Web/001_Public**.

**Version 1.0.0:** all 20 planned apps are implemented. Every app has its own page, complete source, local interactions, mobile layout, install manifest, and documented scope. The library is an installable web app with a shared offline cache. Publishing the source update to GitHub is still the owner’s step.

**Live library after deployment:** https://nad-web.github.io/001_Public/Vibcoding/

**New game, version 1.1.0:** [باغ حافظهٔ هاینبورگ](Games/MatchMemory/README.md), a standalone Dari/Farsi memory game by Noorullah Adel at `Games/MatchMemory/`, with ten levels, bundled Persian speech and its own offline cache. See [the upload guide](START_HERE_HAINBURG.md).

## Publish without installing anything

Read **[the browser-only update guide](docs/BROWSER_UPDATE.md)**. Upload the extracted source in the documented batches, then use the existing GitHub Actions workflow. No local npm or development-tool installation is required for publishing.

## The collection

| Category | App | Implemented features |
| --- | --- | --- |
| Finance | [Pocket Budget](Vibcoding/finances/pocket-budget/README.md) | Income/expenses, monthly totals, category breakdown, JSON/CSV backup and restore |
| Finance | [Savings Goal](Vibcoding/finances/savings-goal/README.md) | Cent-accurate monthly contributions, progress, timeline comparisons, milestones, export |
| Fun | [Decision Wheel](Vibcoding/fun/decision-wheel/README.md) | Editable options, unbiased random selection, animated wheel, reduced motion, recent results |
| Fun | [Memory Lab](Vibcoding/fun/memory-lab/README.md) | Shuffled matching game, board sizes, move tracking, keyboard operation, restart |
| On the way | [Pack Light](Vibcoding/on-the-way/pack-light/README.md) | Trip templates, custom checklist, progress, local saving, print, JSON backup/restore |
| On the way | [Trip Split](Vibcoding/on-the-way/trip-split/README.md) | Participants, shared expenses, exact cent allocation, balanced settlements, JSON backup/restore |
| Languages | [Deutsch Daily](Vibcoding/languages/deutsch-daily/README.md) | 48 starter cards, topics, reveal/recall, missed-word practice, progress, device pronunciation |
| Languages | [Artikel Trainer](Vibcoding/languages/artikel-trainer/README.md) | 36 nouns, der/die/das questions, correction/examples, missed-word practice, saved progress |
| Productivity | [Focus Flow](Vibcoding/productivity/focus-flow/README.md) | Adjustable work/break sessions, pause/reset, saved deadlines, completion count |
| Productivity | [Week Board](Vibcoding/productivity/week-board/README.md) | Create/edit/complete tasks, day menus, desktop drag/drop, persistent board, backup/restore |
| Learning | [Flashcard Studio](Vibcoding/education/flashcard-studio/README.md) | Card CRUD, shuffled study, recall score, validated import, JSON export |
| Learning | [Quiz Forge](Vibcoding/education/quiz-forge/README.md) | Three starter collections, own-question import/export, evaluation, score, mistake review |
| Developer tools | [JSON Workbench](Vibcoding/developer-tools/json-workbench/README.md) | Format/minify, parsing errors, type/size summary, clipboard, JSON download |
| Developer tools | [Regex Playground](Vibcoding/developer-tools/regex-playground/README.md) | Pattern/flags, safe match highlighting, groups, worker timeout, bounded input |
| Everyday tools | [Unit Converter](Vibcoding/everyday-tools/unit-converter/README.md) | Length, weight, volume, temperature, unit swapping, absolute-zero validation |
| Everyday tools | [QR Studio](Vibcoding/everyday-tools/qr-studio/README.md) | Local UTF-8 QR encoding, error correction, quiet zone, PNG/SVG export |
| Wellbeing | [Break Buddy](Vibcoding/health-wellbeing/break-buddy/README.md) | Configurable work/break rhythm, pause/reset, saved deadlines, optional notifications |
| Wellbeing | [Habit Garden](Vibcoding/health-wellbeing/habit-garden/README.md) | Habits, local-date history, streaks, undo, JSON backup/restore |
| Creative | [Palette Studio](Vibcoding/creative/palette-studio/README.md) | Color generation/editing/locking, contrast calculation, clipboard, CSS export |
| Creative | [Writing Sparks](Vibcoding/creative/writing-sparks/README.md) | 24 original prompts, autosaved editor, word count, text/JSON export and restore |

## Install and use offline

On iPhone, open an app in Safari → Share → Add to Home Screen. Each app and the library have their own manifest and icons. Open online once and wait for the offline-ready message. See [installation and device limits](docs/BROWSER_UPDATE.md).

The offline cache is generated from the actual deployment files and versioned by their content hash. Updates are offered through an explicit reload button so a background worker does not reload an unsaved draft without the user’s action.

## Architecture

- Plain HTML, CSS, browser modules, and Node 24 repository tools.
- All runtime assets hosted with the source; no runtime CDN, trackers, account system, or external application server.
- One vendored runtime library: qrcode-generator 2.0.4, with attribution and MIT notice.
- Shared UI, safe DOM helpers, versioned local storage, import validation, export helpers, and pure tested calculation functions.
- Dedicated source and README/case study per app under `Vibcoding/<category>/<id>/`.
- GitHub Pages serves only the built runtime allowlist; documentation and tooling remain in the public source.

## Optional developer commands

For people who want local development, install Node 24+, then run:

```bash
npm run dev
npm run check
npm test
npm run build
npm run preview -- --base /001_Public/
```

The root tooling has no npm package dependencies. Optional browser QA uses separately installed test packages; see [validation](docs/VALIDATION.md).

## Scope and limits

These are focused first releases, not full commercial platforms. Records are browser-local, with no device synchronization. The German content is a small starter practice set, not a complete course. Money tools calculate in EUR without account connections, market data, investment returns, or payment processing. Browser timers recover on reopening but cannot guarantee notifications while a phone is locked or an app is closed.

See [privacy](docs/PRIVACY.md), [architecture](docs/ARCHITECTURE.md), [contributing](CONTRIBUTING.md), [AI collaboration](docs/VIBE_CODING_PLAYBOOK.md), and [validation evidence](docs/VALIDATION.md).

## License

Original code and original icons: [MIT](LICENSE), copyright Noorullah Adel. The vendored QR encoder retains its own copyright and MIT terms; see [third-party notices](THIRD_PARTY_NOTICES.md).
