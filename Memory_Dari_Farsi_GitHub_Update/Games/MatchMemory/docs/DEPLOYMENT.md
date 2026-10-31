# Publish on the existing GitHub Pages site

Use the exact repository spelling configured in the portfolio: **Nad-Web/001_Public**. The game is case-sensitive at **Games/MatchMemory/**. Do not upload an extra outer ZIP folder into the repository.

The update ZIP contains only new or changed paths, plus a root `START_HERE_HAINBURG.md` guide. It does not require installing npm on your Mac. It includes the necessary edits to `scripts/build.mjs` and `package.json`, the new deployment test, the catalogue launcher/metadata and the complete standalone game.

1. Extract the ZIP on your Mac. Enter the extracted folder until you see `Games`, `Vibcoding`, `scripts`, `tests`, `package.json` and the guide.
2. Open https://github.com/Nad-Web/001_Public on the `main` branch. Stay at the repository root.
3. Choose **Add file → Upload files**. Drag the **contents** of the extracted update folder onto the upload area. Keep all nested folders intact. The update uses fewer than 100 files and no file exceeds GitHub's browser upload size limit.
4. Check that upload paths start with `Games/MatchMemory/`, `Vibcoding/`, `scripts/` or `tests/`; `package.json` and the guide are root files. Accept replacing the same-named files. Existing unrelated apps should remain.
5. Commit with a message such as `Add Dari/Farsi Hainburg memory game with offline Persian audio`.
6. Open **Actions → Verify and deploy Pages**. The existing workflow checks, tests, builds and publishes. Wait for the entire workflow to finish successfully. If it does not start, use **Run workflow** on `main`.
7. The existing site should remain configured under **Settings → Pages → Source: GitHub Actions**. Do not switch to a branch publishing method for this portfolio update. If it is already live with Actions, no setting change is needed.
8. After the deployment succeeds, open:

   **https://nad-web.github.io/001_Public/Games/MatchMemory/**

   The catalogue entry also opens the same standalone game. This is the expected post-publication address; this delivery does not claim that the update has already been pushed or published.

If GitHub does not accept a folder drag, first upload the `Games` folder at the repository root, then upload the remaining update contents in a second batch. Wait until all files have uploaded before committing the batch. A temporary incomplete workflow can fail until the remaining files are committed; publish only after the final workflow succeeds.

## Install on iPhone

Open the published HTTPS address with internet. The top-right **افزودن به آیفون** button gives native-language instructions. In Safari choose **Share → Add to Home Screen**, enable **Open as Web App** if offered, then **Add**. In Chrome on iPhone the current documented route is also **Share → Add to Home Screen**. If Edge does not offer it, open the same URL in Safari. The website cannot programmatically press Apple's final Add button.

Launch once from the new Home Screen icon while online. Wait until the status explicitly says **آماده برای بازی آفلاین**. That message verifies all required game assets, including Persian speech. Turn on Airplane Mode, close/reopen the icon and play a complete round; turn sound on to check local audio. A browser tab and an installed iOS app may have separate storage, so perform the initial setup inside the installed app too.

Reference instructions checked 31 October 2026:

- Apple: https://support.apple.com/en-eg/guide/iphone/iphea86e5236/ios
- Google Chrome for iPhone/iPad: https://support.google.com/chrome/answer/9658361?co=GENIE.Platform%3DiOS&hl=en

## Static hosting and offline details

All game runtime URLs are relative. The manifest starts at `./`, scopes to `./` and declares `fa-AF`/`rtl`. `sw.js` controls only this game folder, uses a scope-specific cache prefix, leaves the portfolio and other games' caches alone and supports audio byte ranges from fully cached MP3 data. A complete new cache is installed before offering an update.

The standalone folder can also be served by another HTTPS static host or `localhost`. A direct `file://` opening is not a PWA installation method. Browser/system cleanup can remove cached website data; if that happens, open online and prepare it again. There is no backend, account, analytics or paid service.

## Optional local Git commands

These commands are optional; browser upload is sufficient. In your existing `001_Public` checkout after copying the update paths:

```bash
git add Games/MatchMemory Vibcoding/catalogue.json Vibcoding/fun/hainburg-memory scripts/build.mjs scripts/serve.mjs package.json tests/hainburg-deployment.test.mjs START_HERE_HAINBURG.md
git commit -m "Add Dari/Farsi Hainburg memory game with offline Persian audio"
git push origin main
```

For future releases, edit `src/config.js`, deliberately update the release version/date, regenerate audio if needed, run `node Games/MatchMemory/scripts/update-cache.mjs`, then run the repository checks and build before committing. Do not hand-edit the generated offline cache list.
