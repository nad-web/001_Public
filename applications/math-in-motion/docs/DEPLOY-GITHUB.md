# Publish Math in Motion

Keep the complete folder at applications/math-in-motion/ with index.html directly inside it. Published address: https://nad-web.github.io/001_Public/applications/math-in-motion/.

The repository workflow discovers, checks and publishes it automatically. Do not add a manual Math build block or separate Pages deployment. [Upload guide](../../../docs/MIGRATION.md).

The complete repository ZIP includes 600 clips. The update ZIP includes eight corrected clips and leaves 592 existing clips unchanged. Keep all media within this app's media folder. Core lesson/graphics caching excludes videos; use Keep this video offline for a chosen clip.

For a separate app-only export, run node tools/build.mjs --output ../preview/math-in-motion from this folder. It validates source and compiles its core worker manifest. Use an output outside the source folder. Preserve MIT and all voice/production notices.
