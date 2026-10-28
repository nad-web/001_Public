# Third-party notices

## qrcode-generator 2.0.4

- Author: Kazuhiko Arase
- Source: https://github.com/kazuhikoarase/qrcode-generator
- npm package: `qrcode-generator`, version **2.0.4**
- Vendored file: `Vibcoding/everyday-tools/qr-studio/src/vendor/qrcode.mjs`
- License: MIT. Original copyright/license header is retained without modification.
- Adaptation: the app configures its byte conversion using TextEncoder for UTF-8 and renders/exports its matrix using local SVG/canvas code. The encoder itself is unchanged.

Copyright (c) 2009 Kazuhiko Arase

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

“QR Code” is a registered trademark of DENSO WAVE INCORPORATED.

## Original assets and content

The NL app icons and code mark are original code-drawn assets. The German examples, quiz questions, writing prompts, trip templates, and starter flashcards were authored for this project. They are small educational and example collections, not copied course material or external datasets.

## Test-only tools

Playwright, @playwright/test, axe-core through @axe-core/playwright, and jsQR are used only by the optional QA runner. They are not served to site visitors or vendored into the production application. Each retains its own license in its separately installed package.
