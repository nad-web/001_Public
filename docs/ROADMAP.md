# Build roadmap

This is a proposal, not a claim of completed apps. The source of truth for app stages is `Vibcoding/catalogue.json`. All 20 initial ideas begin as **planned**.

## Phase 1 — repository foundation

Included in this package:

- Categorized monorepo and source/asset conventions.
- Working searchable portfolio with status and category filters, concept dialogs, light/dark themes, and responsive layouts.
- Reusable app template and generator.
- Registry, manifest, JavaScript syntax, and local static-link checks.
- Tooling regression tests and allowlisted deployment build.
- GitHub Pages workflow, review templates, and setup documentation.

**Owner action still required:** publish the public repository and enable Pages. No individual app is implemented by this foundation.

## Phase 2 — first useful releases

| Order | App | Category | Skills to demonstrate | First release focus |
| --- | --- | --- | --- | --- |
| 1 | Deutsch Daily | languages | Learning UX, state, accessible feedback | Curated words, reveal/recall, local progress |
| 2 | Pocket Budget | finances | Validated forms, data design, calculations | Monthly entries, correct totals, export/reset |
| 3 | Decision Wheel | fun | Interaction, randomness, animation | Editable options, fair selection, reduced motion |
| 4 | Pack Light | on-the-way | Checklists, persistence, print design | Reusable list, custom items, print view |
| 5 | Focus Flow | productivity | Timer accuracy, state transitions | Focus/break sessions, pause/reset, background recovery |

Complete each app’s source, demo, screenshot, documentation, and case study before widening the scope. Three well-explained working apps already provide useful portfolio evidence.

## Phase 3 — broaden the collection

| Category | Further ideas |
| --- | --- |
| finances | Savings Goal |
| fun | Memory Lab |
| on-the-way | Trip Split |
| languages | Artikel Trainer |
| productivity | Week Board |
| education | Flashcard Studio, Quiz Forge |
| developer-tools | JSON Workbench, Regex Playground |
| everyday-tools | Unit Converter, QR Studio |
| health-wellbeing | Break Buddy, Habit Garden |
| creative | Palette Studio, Writing Sparks |

Some concepts need extra care: accurate monetary rounding for Trip Split, bounded execution for Regex Playground, license review for a QR encoder, and intentional date handling for Habit Garden. These are implementation considerations, not completed features.

## Phase 4 — strengthen the portfolio

- Feature a few mature releases on the GitHub profile.
- Add concise case studies, real screenshots, and links to relevant source files.
- Improve designs based on actual use and observed friction.
- Add automated browser checks once the release collection warrants them.
- Introduce framework, API, or backend apps only when their requirements justify the added complexity.

There is no fixed calendar. Prefer useful releases and clear evidence over a large number of unfinished folders.
