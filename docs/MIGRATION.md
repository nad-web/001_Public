# Upload the rebuilt application repository

**Developed and designed by Noorullah Adel · 2026.** The repository now has 23 canonical app folders. Sankey Studio's 38 source files are unchanged.

## Choose a package

| Package                  | What it contains                                             | Use                                                          |
| ------------------------ | ------------------------------------------------------------ | ------------------------------------------------------------ |
| `001_Public_Rebuilt.zip` | Complete clean source, all 600 Math videos, unchanged Sankey | Recommended with GitHub Desktop                              |
| `001_Public_Update.zip`  | Only added/changed files compared with your uploaded archive | Apply to your existing repository; never an empty repository |

The update omits every Sankey file and 592 unchanged Math videos. Eight corrected clips are included. Both ZIPs contain a top folder `001_Public`. Extract the ZIP and copy the **contents inside that folder** into the root of your existing GitHub repository. Do not create `001_Public/001_Public/`. Do not upload the ZIP as a single file.

Keep your original archive as a rollback copy. Export important local records from the old apps before deploying. The new app paths retain compatible data keys on the same origin/browser/profile; installed iPhone apps and other devices can have separate storage.

## Recommended: GitHub Desktop

1. Clone your existing `nad-web/001_Public` repository in GitHub Desktop, or fetch/pull its latest main branch if already cloned.
2. Extract the complete ZIP. Copy everything inside its `001_Public` folder into the cloned repository, replacing matching files. Include the root `.github` folder. On macOS, Command+Shift+. shows hidden folders when needed. Preserve `.git` and your history.
3. For a clean source tree, remove the old root `MemoryGame` folder and the old category/shared folders inside `Vibcoding`. Keep the new `Vibcoding/index.html` redirect. The new build ignores obsolete source locations if you leave them temporarily. [REMOVED_FILES.txt](REMOVED_FILES.txt) lists obsolete paths compared with the uploaded snapshot. Keep unrelated new work.
4. Review the changes. `applications/sankey-diagram/` should show no modifications. The old game now lives at `applications/memory-game/`.
5. Commit to main and push. You are updating the existing repository, not creating another repository.
6. On GitHub open **Settings → Pages** and select **GitHub Actions** as the source. Keep the included root `.github/workflows/pages.yml` as the single Pages deployment workflow. Remove any other workflow that would deploy a competing Pages artifact.
7. Open **Actions → Verify and deploy Pages**. Wait for verification and deployment to succeed. A separate catalogue job may commit refreshed README links.
8. Open `https://nad-web.github.io/001_Public/applications/`. Launch an app card and test its main task. If an old cached screen remains, reload online; use an offered update control, or close the app's open tabs and reopen it.

No local Node/npm installation is needed for this method. GitHub runs the checks and build.

## Browser-only upload

Use the smaller update package with your existing repository. Upload root files to the root, `applications` contents into `applications/`, and the workflow into root `.github/workflows/`. If a hidden folder cannot be dragged, open the existing pages.yml, choose Edit and replace its complete contents with the included file.

GitHub's website accepts up to 100 files per upload and 25 MiB per file. Upload the 20 smaller app folders in separate batches; upload Memory Garden's source and assets in separate batches. Keep every extracted relative path. Upload Math's changed source and eight included clips into their current folders; existing unchanged videos remain in place.

For a full-package browser upload, Math media is split into primary (80), middle (80), high (100), university-en (76), university-de (76), advanced-en (94), advanced-de (94). Upload each folder into `applications/math-in-motion/media/`. GitHub Desktop is easier for the full repository.

Intermediate commits can fail while upload batches are incomplete. Finish every batch and rerun the workflow. Preserve the unchanged Sankey folder.

## Exact upload destinations

| Extracted files                                         | Destination in existing repository |
| ------------------------------------------------------- | ---------------------------------- |
| index.html, README.md, package.json, lockfile, policies | `001_Public/` root                 |
| `.github/workflows/pages.yml`                           | Root `.github/workflows/`          |
| scripts/, assets/, docs/, templates/, tests/            | Root                               |
| applications/index.html and applications/README.md      | `applications/`                    |
| Each app folder                                         | `applications/<folder-name>/`      |

The workflow creates dist itself. Do not upload dist, node_modules, temporary output or a .git directory from another checkout. The protected Sankey app's old standalone deployment guide remains unchanged; follow this root guide for the combined repository.

## Canonical addresses and redirects

Every app uses `https://nad-web.github.io/001_Public/applications/<folder-name>/`.

Examples: `pocket-budget/`, `memory-game/`, `math-in-motion/`, `sankey-diagram/`.

Old `Vibcoding/<category>/<app>/` links and `/001_Public/MemoryGame/` are built as redirects. Retirement workers at the old root/game URLs remove only their own former caches. The new apps use isolated scopes. Browser records are local and are not synchronized between devices.

## Every future app

1. Add `applications/my-new-app/index.html` and all its browser-ready JS, CSS, images and data inside that folder.
2. Optionally add app.json for its title, summary and category.
3. Commit to main and wait for the existing workflow.
4. Open `https://nad-web.github.io/001_Public/applications/my-new-app/`.

Only the folder name after applications changes. No per-app edit to pages.yml, root HTML or a central list is needed. The live library is generated during build. The workflow refreshes repository README tables as a separate documentation commit.

If branch protection blocks that documentation push, the website still deploys. Run `npm run catalogue` and commit the README updates yourself, or permit the catalogue job under your repository rules. [Full future-app guide](ADD_APP.md).

## Troubleshooting

- Check the failed Actions step. The build reports missing files, invalid folder names and escaping runtime references.
- Keep index.html directly inside each app folder, without a second nested ZIP folder.
- Use `./src/app.js`, not `/src/app.js`; the site is below `/001_Public/`.
- Finish all uploads before diagnosing missing media.
- If verification passes but deployment fails, confirm the Pages source and github-pages environment allow main.
- Clearing browser site data can remove local records; export before using that recovery option.

References: [Pages custom workflows](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages) · [GitHub file upload limits](https://docs.github.com/en/repositories/working-with-files/managing-files/adding-a-file-to-a-repository).
