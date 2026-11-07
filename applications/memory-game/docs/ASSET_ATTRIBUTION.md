# Assets and provenance

## Hainburg photograph

- Local file: `assets/images/hainburg-hero.jpg`.
- Original: **Hainburg (Hessen), Ortsansicht mit der Kirche St. Wendelinus.jpg**.
- Creator: **Dguendel**; photographed 29 June 2014. The Commons file page identifies Hainburg in Hesse, Germany and the Saint Wendelin church. This is the requested German Hainburg near Seligenstadt.
- Source: https://commons.wikimedia.org/wiki/File:Hainburg_(Hessen),_Ortsansicht_mit_der_Kirche_St._Wendelinus.jpg
- Original file: https://upload.wikimedia.org/wikipedia/commons/9/95/Hainburg_%28Hessen%29%2C_Ortsansicht_mit_der_Kirche_St._Wendelinus.jpg
- License: **Creative Commons Attribution 4.0 International**, https://creativecommons.org/licenses/by/4.0/ . The file page explicitly permits sharing and adaptation with attribution and a notice of changes.
- Changes: resized to 1800px maximum width, optimized JPEG compression; CSS cover cropping and a gradient overlay during display.
- Attribution: Dguendel, Hainburg (Hessen), Ortsansicht mit der Kirche St. Wendelinus, CC BY 4.0; resized and recompressed.
- Verified on 31 October 2026. Native-language attribution is visible on the welcome screen and in About; structured metadata is in `assets/images/credits.json`.

The local-life category contains one photo identity. Other local-life cards are explicitly identified as generic symbolic illustrations, rather than invented or misidentified Hainburg landmarks.

## Font

Vazirmatn variable WOFF2, by The Vazirmatn Project Authors. Downloaded from the upstream project: https://github.com/rastikerdar/vazirmatn .

- Asset: https://raw.githubusercontent.com/rastikerdar/vazirmatn/master/fonts/webfonts/Vazirmatn%5Bwght%5D.woff2
- License: **SIL Open Font License 1.1**. The complete upstream license is bundled as `assets/fonts/OFL.txt`.
- Font file unmodified. All font requests at runtime are local.

## Persian audio

The 169 spoken clips were synthesized locally from the original Persian text in `assets/audio/transcripts.json` using **Piper 1.3.0**, `fa_IR-amir-medium`, at 22,050 Hz mono, then combined as a 64kbps MP3 sprite with silent separation. Timing data is in `assets/audio/cues.js`. The synthesis tool and 61MiB ONNX model are development inputs and are not shipped in the game.

- Upstream model card: https://huggingface.co/rhasspy/piper-voices/blob/main/fa/fa_IR/amir/medium/MODEL_CARD
- Model files: https://huggingface.co/rhasspy/piper-voices/tree/main/fa/fa_IR/amir/medium
- The model card identifies the Persian dataset as **CC0**, sourced from https://datacula.com/tts-databases, and says it was fine-tuned from the US English Lessac medium voice. This is the card's statement about training data; it is not a claim that a model binary carries the game's MIT license.
- Piper source: https://github.com/OHF-Voice/piper1-gpl . Piper's GPL runtime and phonemizer data are not redistributed here; only resulting speech of the original game text is bundled.
- The clips are generated Persian speech. There is no voice cloning, no claimed human recording, no claimed Afghan accent, no online TTS call and no English fallback.

## Original and system artwork

The paired-card/leaf logo, PNG app icons derived from it, and geometric shape paths are original code/vector artwork in this project, under the code's MIT license. No brand logos or third-party icon packages are used.

Common-object, animal, transport, food and garden illustrations use Unicode emoji rendered by the installed system emoji font. The project redistributes no Apple/Microsoft/Google emoji artwork files. Their appearance depends on the browser/OS; ordinary system emoji do not require a network request. Card names are always available as native-language text and accessible names. No generated or purported landmark photo is used.
