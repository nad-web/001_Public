# Math in Motion verification

The current repository checks 150 bilingual lessons, matching interactive models, runtime references and 600 expected video files. Node tests render each model in both languages at default/minimum/maximum controls. Additional regressions cover equivalent-whole widths, equal inverse-function axes, zero inequality coefficient and impossible selections.

All 600 MP4s passed FFprobe checks for H.264, yuv420p, AAC and positive duration. Eight equivalent-fraction/inverse-function clips were corrected; 592 clips remain unchanged. The compressed narration audio matches the original in each corrected clip.

Chrome checks opened equivalent fractions, switched to German, changed subdivisions (2/4 = 6/12), played a local clip and changed the voice. The phone detail diagram remains 720px wide inside its contained panner while the page fits 305px; the fit toggle was checked.

Core caching excludes videos. Selected clips use a scoped media cache with range responses. HTTPS/iPhone installation, native Safari, Firefox, Edge and long-term storage retention remain pending. [Complete repository evidence](../../../docs/VALIDATION.md).
