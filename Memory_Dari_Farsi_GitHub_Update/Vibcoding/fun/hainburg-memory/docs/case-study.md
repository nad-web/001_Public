# Dari/Farsi Hainburg memory game — implementation evidence

**Implemented release 1.1.0 · 31 October 2026 · Noorullah Adel / نورالله عادل**

The user requested a fully native-language memory game with Hainburg scenery, local offline Persian sound and iPhone installation. The preserved original specification required ten levels and eight categories at `Games/MatchMemory/`. The earlier local implementation was absent from the recovered checkout; the game was rebuilt from that specification while preserving the existing portfolio apps.

The repository generator created this catalogue entry; its launcher opens the standalone game. The existing allowlisted build was extended to copy that game folder and scoped worker. No duplicate runtime, npm package dependency, remote voice API, account or runtime CDN was added.

Behavioral browser checks in desktop Chromium included a complete four-pair round with a mismatch, keyboard selections, hint use, pause, reload/restoration, resume, results, personal best and an earned garden flower. A 40-card local-life board was exercised inside a 320px iframe without horizontal overflow. The 390px layout was inspected too. Persian MP3 playback was observed with readyState 4, advancing time and no media error. The app's top-right iPhone installation help was opened and inspected in Dari/Farsi.

Game/worker/storage/audio tests and the repository checks cover all 80 level/category combinations, state safety, mixed-artwork deduplication, native labels, byte-range responses, transactional cache installation, repair, scoped cache cleanup and publication at `/001_Public/Games/MatchMemory/`. Exact final counts and the validation boundary are maintained in [the game test report](../../../../Games/MatchMemory/docs/TESTING.md).

The preview is HTTP, so real service-worker registration/offline browser navigation was not available there. Worker behavior was tested through an isolated runtime harness; this is not physical Safari/Edge/iPhone verification. The source release is implemented and checked within that limit. The owner must upload the update and perform the documented HTTPS/airplane-mode check on their iPhone before relying on offline availability.

The photograph has verified CC BY 4.0 attribution, and only one local-life identity is a real location photo. Other local-life images are explicitly symbolic system emoji. Text and speech are Persian/Dari content; the generated fa_IR voice is not presented as a human recording or a verified Dari accent. All browser screenshots used during QA were actual renders, not invented visuals.

Implementation and test drafting were assisted by AI. No external human review or actual physical device test is claimed. A useful next improvement is recording the completed physical iPhone/Safari/Edge acceptance checks after publication.
