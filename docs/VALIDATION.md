# Rebuilt repository validation

**2026-11-07 · Noorullah Adel · manual-upload deliverable.** No GitHub push or public deployment was performed.

This release updates the repository name and published links to `nad-web/public`, with previews under `/public/`. The earlier Chrome interaction/layout evidence in `browser-validation.json` accurately retains its original `/001_Public/` test prefix. The rename does not change app layouts or stored-record keys. The rename-specific checks and fresh ZIP validation are recorded in `rename-validation.json` and `delivery-validation.json`.

| Executed check        | Result                                                                                                                                                              |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Source and app checks | 23 canonical apps; JavaScript/metadata/viewport checks; Math's 150 bilingual lessons/600 media checks; Sankey's existing source check.                              |
| Automated tests       | **154 passed, 0 failed.** Includes repository/data/hosting/worker regressions, Math models, native game state/navigation and unchanged Sankey tests.                |
| Build                 | 23 apps assembled below dist/applications/; static runtime references resolve.                                                                                      |
| Future-app discovery  | Temporary index-only app was published and linked in generated README/catalogue without editing the workflow.                                                       |
| App generator         | Working standalone source produced; escaping, collisions and traversal tested.                                                                                      |
| Sankey protection     | **38 source files** and their file list match the uploaded snapshot byte-for-byte.                                                                                  |
| Video audit           | **600/600** MP4s checked by FFprobe: H.264, yuv420p, AAC, positive duration.                                                                                        |
| Video corrections     | Eight clips changed, 592 unchanged. Original compressed narration audio matches in all eight replacements.                                                          |
| Chrome desktop        | All 23 interfaces opened without observed application errors at the checked initial states.                                                                         |
| Phone-width frames    | All 23 initial interfaces fitted a 320px same-origin frame; content width was 305px with scrollbar.                                                                 |
| Offline/range logic   | Compiled worker starts without network configuration, isolates caches, preserves selected videos and handles byte ranges; localhost server MIME/ranges also tested. |

Interactive Chrome checks exercised budget add/edit and totals; savings rounding; shared-expense settlement; packing completion; task movement; habit completion; flashcard recall; timers; memory-card keyboard focus; wheel selection; vocabulary recall; article correction; quiz score/explanation; JSON preservation; regex matches; unit conversion; palette locking; draft persistence; and a downloaded QR PNG. Math's language/slider controls, inline video/voice selection and phone detail/fit view were checked. The native game started a round, selected cards and paused with the expected attempt count. Detailed records are in browser-validation.json and media-validation.json.

The managed browser preview used HTTP on a non-localhost hostname. It cannot establish real HTTPS service-worker installation or offline playback. The interface reports that limitation; worker/unit checks are separate evidence.

Current physical iPhone Safari/installed-app behavior, native desktop Safari, Firefox, Edge, VoiceOver and long-term storage retention remain **pending**. Desktop phone-width frames are not physical iPhones. No universal/100% compatibility claim is made. Clipboard, speech, codecs, notifications, downloads and background execution depend on browser/OS support. Timers reconcile on return and are not guaranteed OS alarms.

Before release, use the published HTTPS address on those devices, complete the main task, test backups/downloads, keyboard/touch focus, media playback, installation and a verified offline close/reopen/update cycle. Try all four Math voice/language variants and cached-video seeking. Device storage can still be evicted.

## Repeat checks

With Node 24:

```sh
npm ci --ignore-scripts
npm run check
npm test
npm run build
npm run preview
```

Optional tests/browser.mjs is a portable Playwright engine runner, updated for the new architecture but **not executed in this managed session**. Install separately without changing the production lockfile:

```sh
npm install --no-save --package-lock=false playwright
npx playwright install chromium firefox webkit
BROWSER=chromium node tests/browser.mjs
BROWSER=firefox node tests/browser.mjs
BROWSER=webkit node tests/browser.mjs
```

It discovers apps, checks startup/layouts at three widths, JSON preservation and a localhost offline reload. Playwright WebKit supplements testing; it does not replace physical iPhone checks. Production has no Playwright dependency.

Both delivery paths were checked separately: the complete ZIP extracted into a new directory, and the update ZIP overlaid on the original archive without removing obsolete source. Each passed installation, source checks, 154 tests and a 23-app build. See delivery-validation.json.
