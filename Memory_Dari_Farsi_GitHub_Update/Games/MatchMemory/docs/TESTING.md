# Verification — 31 October 2026

## Executed automated checks

Environment: Linux, Node 24 tooling, dependency-free game/runtime. Persian audio was generated with Piper 1.3.0 and checked using FFprobe; the synthesis environment and model are not deployment dependencies.

| Check | Observed result |
| --- | --- |
| `npm run check` from repository root | Passed: catalogue/manifests, JavaScript syntax and local links |
| `npm test` from repository root | **128 tests passed, 0 failed** |
| Game-only tests included above | **103 tests**, including all 80 level/category combinations |
| `npm run build` | Passed, with the game at `dist/Games/MatchMemory/` |
| Root deployment integration test | Passed: nested `/001_Public/Games/MatchMemory/` page, manifest/worker/assets and local `audio/mpeg` response; tests excluded from publication |
| Audio metadata | Valid MP3, 22,050Hz mono, 2,523,890 bytes, approximately 315 seconds across 169 clips |
| Offline resource manifest | Generated from runtime asset contents; 22 required resources, including local photo/font/Persian audio |

The automated suite tests valid even-sized boards, two cards per identity, shuffle preservation, every level/category combination through completion, matching/mismatch state, duplicate/third-card protection, move counting, pause/resume timing, hint isolation, saved-round validation, corrupted/unavailable storage, settings and progress, idempotent completion, local-date challenges, native metadata/labels, mixed-artwork deduplication and audio clip coverage. A PWA regression check verifies that an already-ready portfolio worker cannot prematurely signal readiness for the game. The audio regression check verifies that initial metadata/play events cannot create duplicate timers or let an old cue stop a newer one.

## Browser behavior actually observed

Desktop **Chromium**, using the production files under the actual repository prefix. Phone layouts used **320px and 390px same-origin iframes inside Chromium**, not physical iPhones or an iOS simulator.

- Welcome screen rendered with the genuine Hainburg photo, local Persian font and Noorullah Adel's native-language developer credit.
- All ten level choices and translated developer greeting were inspected.
- A four-pair numbers round was completed: keyboard Enter selection, matching, a deliberate mismatch, hints, pause, reload/restoration and resume. The result showed four matched pairs and five attempts; the garden received one saved flower, with a personal-best entry.
- The top-right **افزودن به آیفون** help dialog opened with native-language instructions and an explicit explanation of the manual iOS Add step.
- A 40-card local-life board at a nominal 320px iframe had 40 buttons, a 280px board/scroll width and approximately 65px × 124px cards. The iframe's document client/scroll widths were both 305px after the desktop scrollbar; no horizontal overflow was present.
- At 390px, the ordinary welcome and enlarged/high-contrast settings had equal document client/scroll widths (375px with the desktop scrollbar). The large-text 40-card board used three approximately 106px columns with at least 145px card height, without horizontal overflow.
- A custom greeting containing `<b>…</b>` appeared literally as the heading text; the heading contained zero injected `b` elements.
- Mixed-category selection with no categories opened the native-language validation dialog. Selecting numbers then allowed a 40-card mixed round.
- Persian card audio was observed in Chromium with `readyState: 4`, `paused: false`, a position inside the correct local speech cue and no media error. The bundled data covered all 150 card identities, all ten level messages and nine general prompts.

Browser-extension metadata errors observed in the remote Chrome environment were external to the game; they are not reported as application test failures.

## Offline verification boundary

The preview URL was **HTTP on terminal.local**. It was not a secure service-worker origin, and the application correctly displayed that offline preparation was unavailable there. **Actual browser service-worker registration, airplane-mode reopening and Home Screen installation were not verified in this environment.**

The worker itself was executed in an isolated JavaScript harness with Cache/Request/Response behavior. Tests passed for complete precaching, incomplete-install rejection and cleanup, cache readiness/repair, scoped cache deletion that preserves other games, offline navigation under the nested repository path, ignoring unrelated URLs and cached audio byte ranges (including suffix and invalid ranges). These tests validate worker behavior; they do not substitute for real Safari/iPhone tests.

## Checks the owner must perform after HTTPS publication

1. Open the game in current iPhone Safari; check text, audio, pause, reload and one complete round. Repeat basic opening/play in iPhone Chrome and Edge, and desktop Edge if used.
2. Use the in-game installation help to add the Home Screen icon. Open that icon once online and wait for **آماده برای بازی آفلاین**. Browser and installed-app storage can differ.
3. Turn on Airplane Mode, quit/reopen the icon and play with Persian audio. Close/reopen a half-completed round and verify restoration.
4. Turn networking back on for an update, use the explicit update button when offered, and repeat the offline check.

No physical iPhone, native Safari/WebKit, Microsoft Edge, VoiceOver, full accessibility audit, or long-term iOS cache retention test was available here. Browser/OS cleanup may remove website data; the offline-ready status and repair path help detect/recover that condition. No published URL, GitHub push, physical test or successful iOS install is claimed by this source delivery.
