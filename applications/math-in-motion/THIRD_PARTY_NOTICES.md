# Third-party notices / Hinweise zu Drittmaterial

**Math in Motion — developed and designed by Noorullah Adel, 2026.**

The original app code, lesson text, diagrams, and original video productions are distributed with this application's [MIT License](LICENSE). The third-party components below retain their own rights and terms. The package contains original scripts, illustrations, and rendered video/audio output. It ships no third-party browser code, voice weights, recordings from the training corpora, fonts, or tool binaries.

## Voice model and recording acknowledgments

| Narration | Source and attribution | Source terms |
| --- | --- | --- |
| English feminine voice | Bryce Beattie, [LJ Speech medium Piper voice](https://huggingface.co/rhasspy/piper-voices/blob/main/en/en_US/ljspeech/medium/MODEL_CARD), based on [The LJ Speech Dataset](https://keithito.com/LJ-Speech-Dataset/) from Keith Ito and Linda Johnson | The model card identifies the source recordings as public domain. |
| English masculine voice | Bryce Beattie, [John medium Piper voice](https://huggingface.co/rhasspy/piper-voices/blob/main/en/en_US/john/medium/MODEL_CARD), based on [LibriVox](https://librivox.org/) recordings. See [the model author's notes](https://brycebeattie.com/files/tts/). | The model card identifies the source recordings as public domain. |
| German feminine and masculine voices | [Piper German MLS medium](https://huggingface.co/rhasspy/piper-voices/blob/main/de/de_DE/mls/medium/MODEL_CARD), synthetic voice indices 10 and 6 respectively. Trained from scratch on [Multilingual LibriSpeech (MLS)](https://www.openslr.org/94/) by Vineel Pratap, Qiantong Xu, Anuroop Sriram and coauthors. | Source dataset [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). |

The narrators read newly authored English and German scripts. The sound is synthesized, level adjusted, captioned and mixed into new MP4 files. Source attributions do not imply endorsement. The [upstream model collection](https://huggingface.co/rhasspy/piper-voices) has its own repository metadata and per-model notices.

## Production tools and font

- [Piper TTS](https://github.com/OHF-Voice/piper1-gpl) version 1.8, GPL-3.0-or-later, generates the narration. The tool is used during production and is separately available upstream.
- [ONNX Runtime](https://github.com/microsoft/onnxruntime), MIT, runs Piper voice model inference during production.
- [FFmpeg](https://ffmpeg.org/legal.html), built here with the GPL-enabled [x264](https://www.videolan.org/developers/x264.html) encoder, encodes the MP4 videos. The FFmpeg project documents the licenses of its builds.
- [Pillow](https://github.com/python-pillow/Pillow/blob/main/LICENSE), HPND, renders video frames during production.
- [DejaVu Sans](https://dejavu-fonts.github.io/License.html) glyphs are rasterized in videos. Bitstream Vera font notices remain applicable to the font. The [original font license](https://dejavu-fonts.github.io/License.html) identifies any additional notices for imported glyphs.

## Deutsch

Englische Stimmen: Bryce Beattie und die in den Modellkarten angegebenen gemeinfreien Aufnahmen. Deutsche Stimmen: Piper German MLS aus Multilingual LibriSpeech von Vineel Pratap und Mitwirkenden unter CC BY 4.0. Die Videostimmen wurden neu synthetisiert. Modelle, ursprüngliche Sprachaufnahmen und die Produktionswerkzeuge werden getrennt von dieser App bereitgestellt. Die vollständigen Quellen und Lizenzlinks stehen oben.
