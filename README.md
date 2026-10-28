<p align="center"><img src="assets/brand/mark.svg" width="72" alt="001 Public code mark"></p>

# 001 Public — Shukur’s Build Lab

**Small ideas. Useful things.** A growing open source portfolio of browser apps, playful experiments, and practical solutions by **Shukur Adel**.

This repository records the full journey: define a useful problem, build with AI assistance, review the code, test real behavior, and share the result with its source.

**Current stage:** repository foundation complete; 20 app concepts planned; no individual apps released yet. The interactive portfolio catalogue works now. Planned ideas have concept briefs rather than demo links.

## Start here

1. Follow [GETTING_STARTED.md](docs/GETTING_STARTED.md) to run locally, create the public `001_Public` repository, push the source, and enable GitHub Pages.
2. Set your GitHub username with `npm run configure -- YOUR_GITHUB_USERNAME "Shukur Adel"`.
3. Choose one app from [the roadmap](docs/ROADMAP.md) and follow [the app guide](docs/APP_GUIDE.md).

```bash
npm run dev
```

Open **http://127.0.0.1:4173/**. Node 24+ is required for the development tools. The browser site uses plain HTML, CSS, and JavaScript. There are no third-party npm dependencies, fonts, trackers, or runtime CDN requirements in this foundation.

## Collections

| Folder under `Vibcoding/` | Field | Initial ideas |
| --- | --- | --- |
| [finances](Vibcoding/finances/README.md) | Budgets and money tools | Pocket Budget · Savings Goal |
| [fun](Vibcoding/fun/README.md) | Games and playful experiments | Decision Wheel · Memory Lab |
| [on-the-way](Vibcoding/on-the-way/README.md) | Travel and getting around | Pack Light · Trip Split |
| [languages](Vibcoding/languages/README.md) | German and other languages | Deutsch Daily · Artikel Trainer |
| [productivity](Vibcoding/productivity/README.md) | Focus and planning | Focus Flow · Week Board |
| [education](Vibcoding/education/README.md) | Study and practice | Flashcard Studio · Quiz Forge |
| [developer-tools](Vibcoding/developer-tools/README.md) | Tools for developers | JSON Workbench · Regex Playground |
| [everyday-tools](Vibcoding/everyday-tools/README.md) | Practical utilities | Unit Converter · QR Studio |
| [health-wellbeing](Vibcoding/health-wellbeing/README.md) | Personal routines | Break Buddy · Habit Garden |
| [creative](Vibcoding/creative/README.md) | Color and creative practice | Palette Studio · Writing Sparks |

`Vibcoding` intentionally keeps the requested spelling. Keep its capitalization consistent in every URL.

## Repository map

| Path | Purpose |
| --- | --- |
| `index.html` | Entry point that opens the library |
| `Vibcoding/index.html`, `Vibcoding/src/` | Searchable, responsive portfolio with category and status filters, concept dialogs, and light/dark themes |
| `Vibcoding/catalogue.json` | Project concepts and stages; one source of truth for the gallery |
| `Vibcoding/categories.json` | Collection names, slugs, icons, and colors |
| `Vibcoding/<category>/<app-id>/` | Individual apps, created as work begins |
| `Vibcoding/_templates/static-app/` | Reusable app source, assets, manifest, README, and case study |
| `Vibcoding/shared/` | Small shared foundations |
| `assets/brand/` | Original shared brand assets |
| `docs/` | Setup, architecture, roadmap, development, and portfolio guidance |
| `scripts/`, `tests/` | Dependency-free tooling and regression tests |
| `.github/` | Verification, Pages deployment, dependency updates, and review templates |

## Useful commands

| Command | What it does |
| --- | --- |
| `npm run dev` | Serve source locally on port 4173 |
| `npm run configure -- YOUR_GITHUB_USERNAME "Shukur Adel"` | Set your profile and repository links locally |
| `npm run create:app -- languages deutsch-daily` | Start a planned app and mark it prototype |
| `npm run create:app -- fun my-new-app "My New App"` | Scaffold and register a new app idea |
| `npm run check` | Validate registry, manifests, JavaScript syntax, and static local links |
| `npm test` | Test generation, registry failures, deployment output, and preview serving |
| `npm run build` | Create a validated static Pages artifact in `dist/` |
| `npm run preview` | Serve the deployment artifact locally |
| `npm run preview -- --base /001_Public/` | Verify the actual project URL prefix locally |

## Hosting model

The public repository contains all source and assets. **GitHub Pages hosts the browser apps.** Once configured, the expected portfolio URL is `https://YOUR_GITHUB_USERNAME.github.io/001_Public/Vibcoding/`. A future German app would be at `/001_Public/Vibcoding/languages/deutsch-daily/`.

Pages is static hosting: it does not run a Python/Node server, private API credentials, a database, scheduled jobs, or a shared multiuser backend. Client-only apps fit this foundation. A future app needing backend features must document and configure separate hosting while keeping its source here. See [architecture](docs/ARCHITECTURE.md).

## A credible portfolio

Every ready app should include a working demo, complete source, a real screenshot, an explanation of the user problem, technical decisions, observed validation, limitations, and a short account of AI assistance and human review. See [the portfolio guide](docs/PORTFOLIO_GUIDE.md) and [vibe coding playbook](docs/VIBE_CODING_PLAYBOOK.md).

## Quality and contribution

Read [CONTRIBUTING.md](CONTRIBUTING.md), [AGENTS.md](AGENTS.md), [SECURITY.md](SECURITY.md), and [privacy notes](docs/PRIVACY.md). CI verifies and builds every pull request to `main`. Deployment runs from `main` after verification, once Pages is enabled.

See [foundation validation](docs/VALIDATION.md) for checks actually completed and their limits.

## License

[MIT](LICENSE) for original code and original repository assets. Third-party assets and datasets retain their own licenses and must be attributed in the relevant app.
