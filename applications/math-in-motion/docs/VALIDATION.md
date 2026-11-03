# Math in Motion validation

This candidate is packaged for upload to `001_Public/applications/math-in-motion/`.

- Catalog validation checks unique IDs, the two localized versions of every lesson, the matching interactive model, every static entry reference, and all 600 expected MP4 files.
- Node tests render the 150 interactive models in both languages at default, minimum, and maximum control values. They also verify selected calculations, including fractions, compound interest, derivatives, determinants, Black–Scholes, and backpropagation.
- The video audit checks that each MP4 contains H.264 video and AAC audio, with compatible pixel format and an actual playback duration. The 600 videos are packaged locally.
- Chrome was used to test the app under `/001_Public/applications/math-in-motion/` at desktop width and in a 390-pixel frame. Tested flows include bilingual search, opening a lesson, changing a slider, saving it, selecting a narration, and playing a local video.
- The deployment YAML was checked against the existing `main` workflow, and the combined local build includes Vibcoding, MemoryGame, Sankey Studio and Math in Motion. The new build step writes its own output directory.
- Physical iPhone Safari, Firefox, and Edge were outside this validation environment. The app uses standard browser controls, app-relative resources, responsive layout and inline H.264/AAC MP4 playback. Browser media support can depend on the device's available codecs. [WebKit video policies](https://webkit.org/blog/6784/new-video-policies-for-ios/) · [MDN media containers](https://developer.mozilla.org/en-US/docs/Web/Media/Guides/Formats/Containers)
