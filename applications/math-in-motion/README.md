# Math in Motion

**Developed and designed by Noorullah Adel · 2026**  
**Entwickelt und gestaltet von Noorullah Adel · 2026**

https://nad-web.github.io/001_Public/applications/math-in-motion/ 

A standalone mathematics library with **150 lessons in English and German**, from primary arithmetic to university mathematics and advanced applications.

| Level / Lernstufe | Lessons / Lektionen |
| --- | ---: |
| Primary school / Grundschule | 20 |
| Middle school / Mittelstufe | 20 |
| High school / Oberstufe | 25 |
| University / Universität | 38 |
| Advanced and applied / Vertiefung und Anwendung | 47 |
| **Total / Gesamt** | **150** |

Each lesson includes **Read** for the formula or definition and a worked example, **Explore** for a topic-specific visualization with controls and motion, and **Watch** for an original, captioned video. All 150 lessons have English and German video versions, with a choice of feminine or masculine synthesized narration in each language. The 600 MP4s are included. The subject filters cover 12 areas including arithmetic, geometry, calculus, linear algebra, discrete mathematics, statistics, differential equations, pure mathematics, numerical methods, finance, and machine learning.

Jede Lektion umfasst **Lesen**, **Entdecken** und **Ansehen**. Erklärungen, durchgerechnete Beispiele, interaktive Grafiken und Videos stehen auf Deutsch und Englisch bereit. Für jedes Video gibt es pro Sprache eine weibliche und eine männliche synthetische Stimme. Die Lernstufen dienen der Orientierung und entsprechen keinem einzelnen nationalen Lehrplan.

## Publish / Veröffentlichen

Extract the ZIP and put the single `math-in-motion` folder under `001_Public/applications/`. The repository already uses a shared Pages workflow. Follow [the deployment guide](docs/DEPLOY-GITHUB.md) to upload the files and add the app's build step. The guide includes browser-only uploads and the complete workflow based on the existing deployment.

Entpacke das ZIP und lade den Ordner `math-in-motion` unter `001_Public/applications/` hoch. Die [Anleitung](docs/DEPLOY-GITHUB.md) erklärt den Upload und die Einrichtung von GitHub Pages.

- [Curriculum / Themenübersicht](docs/CURRICULUM.md)
- [Validation / Prüfungen](docs/VALIDATION.md)
- [MIT license / MIT-Lizenz](LICENSE)
- [Third-party notices / Hinweise zu Drittmaterial](THIRD_PARTY_NOTICES.md)

## Use and maintain / Nutzung und Pflege

The app uses relative URLs and runs on a static web server. It serves all lesson text, graphics and videos from this folder and needs no account, API key, external media player or runtime package manager. Settings and bookmarks stay in the browser. The mobile layout and inline video controls are designed for iPhone Safari and modern desktop and mobile browsers. Device testing status is listed in the validation notes.

The curriculum is a broad introduction and reference across five levels. Advanced lessons provide selected concepts and worked examples. Chapters and full proof sequences can be developed as the catalog grows.

All authored lesson content lives in `data/`, and `src/labs-*.js` defines the interactive scenes. Video source scenes and the optional offline rendering pipeline live in `tools/`. To run repository checks, use Node 24:

```sh
node --test tests/*.test.mjs
node tools/check.mjs
node tools/build.mjs --output ../preview/math-in-motion
```

The included videos are already encoded. A contributor rebuilding them needs Python with Pillow and Piper TTS 1.8, Node, FFmpeg with x264 and AAC, and DejaVu Sans. Fetch the three voice weights and corresponding JSON configs from the model card links in the notices. Name each pair `en-female.onnx`, `en-male.onnx`, or `de-mls.onnx` and use the suffix `.onnx.json` for each config. Keep them outside the app folder. Run:

```sh
python tools/render-videos.py /path/to/voice-models --german-female 10 --german-male 6
```

The script skips existing output clips. Move outdated variants out of `media/` before rebuilding. Use `--target` with a lesson slug to render only that lesson.
