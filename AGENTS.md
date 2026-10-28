# Instructions for coding assistants

This repository is Shukur Adel’s public portfolio. Preserve the exact names `001_Public` and `Vibcoding`.

## Scope

- Read the root README, the target category README, and the selected app’s README and case study before editing.
- Work on the requested app or repository concern. Keep unrelated apps unchanged.
- Distinguish planned, prototype, and ready stages honestly. Never invent results, screenshots, usage, or completed tests.
- The root stack is dependency-free HTML/CSS/JavaScript plus Node 24 tooling. Add a framework or dependency only when a concrete requirement warrants it, and document the reason.

## Implementation

- Store all original source and optimized public assets in this repository.
- Use relative URLs. GitHub Pages serves this project under `/001_Public/`.
- Use the generator for new static apps; keep `app.json` and the catalogue consistent.
- Keep application input out of innerHTML and avoid eval. Validate imports and numbers, handle storage failures, and namespace local data per app.
- Use semantic HTML, visible focus, keyboard controls, readable contrast, narrow-screen layouts, and reduced-motion support.
- Keep secrets and personal production data out of source and public assets. Browser-side code cannot keep an API credential secret.
- The deployment build allows only each app’s index.html, src, assets, and optional data directories. For a bundled app, emit browser-ready files into those paths and document its build; do not deploy unresolved package imports.

## Completion

- Run `npm run check`, `npm test`, and `npm run build` for relevant repository changes.
- Test the actual user flow in a browser at desktop and mobile widths, including the `/001_Public/` prefix before release.
- Add meaningful tests for important logic; avoid tests that merely repeat markup.
- Update documentation and case studies with observed evidence and remaining limits.
- Keep a new app `prototype` until its acceptance criteria are fulfilled. A ready app needs a real screenshot, release date, version, and current case study.
