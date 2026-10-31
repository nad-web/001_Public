# Upload this ZIP inside MemoryGame

Developer: Noorullah Adel / نورالله عادل. Game version: 1.1.0.
Target: Nad-Web/001_Public/MemoryGame/.

## 1. Upload the game folder contents

Extract MemoryGame_Upload.zip on your Mac. Enter the extracted folder and select all of its contents with Command+A. The selected items must include index.html, src, assets, sw.js and manifest.webmanifest.

On GitHub open your existing repository and its MemoryGame folder. Choose Add file → Upload files. Drag the selected contents into that page and commit to main. Upload the items inside the extracted folder; index.html must become MemoryGame/index.html. This ZIP is a standalone game package and contains no portfolio-root update folders.

## 2. Update one existing build file

Your current Pages workflow publishes the dist directory produced by scripts/build.mjs. That script must explicitly copy MemoryGame into dist/MemoryGame/.

The complete replacement text is provided in PAGES_BUILD_SCRIPT.txt inside this game folder. Keep that file's .txt extension inside MemoryGame.

1. Open MemoryGame/PAGES_BUILD_SCRIPT.txt on GitHub and use Copy raw file, or open Raw, select all and copy the text.
2. Return to the repository root, open scripts/build.mjs and click the pencil (Edit this file).
3. Select all existing code, paste the copied complete build-script text, and commit to main.
4. Open Actions → Verify and deploy Pages and wait for the newest run to succeed. The build now also runs the game's tests and publishes only its runtime files.

This is the only required edit outside MemoryGame. The existing lib.mjs remains in the repository's root scripts folder. No local npm installation is needed, and no Pages-source setting change is needed.

## 3. Open the game

Expected address after the updated workflow succeeds:
https://nad-web.github.io/001_Public/MemoryGame/

GitHub Pages uses the repository spelling 001_Public configured in your existing site. Preserve the capital M and G in MemoryGame.

## 4. Install on iPhone

Open the published HTTPS address online. Tap افزودن به آیفون for the native-language installation help. In Safari use Share → Add to Home Screen, turn on Open as Web App if offered, and tap Add. Open the new icon once online and wait for آماده برای بازی آفلاین. Then try Airplane Mode and reopen the icon, including Persian audio. Physical iPhone, Safari and Edge checks remain for the owner to complete.

## Folder contents after upload

| Repository path | Purpose |
| --- | --- |
| MemoryGame/index.html | Main game page |
| MemoryGame/src/ | Game source and styling |
| MemoryGame/assets/ | Local image, font, icons and Persian audio |
| MemoryGame/sw.js | Offline worker scoped to this folder |
| MemoryGame/manifest.webmanifest | Dari/Farsi installation metadata |
| MemoryGame/tests/ | Self-contained game and hosting tests |
| MemoryGame/PAGES_BUILD_SCRIPT.txt | Text to paste into the root scripts/build.mjs |

## راهنمای کوتاه

محتویات این فایل فشرده را داخل پوشهٔ MemoryGame در مخزن خود بارگذاری کنید؛ فایل index.html باید مستقیم داخل همین پوشه قرار بگیرد. سپس متن کامل فایل PAGES_BUILD_SCRIPT.txt را کپی کنید و جای محتوای فایل scripts/build.mjs در ریشهٔ مخزن بگذارید. پس از ثبت تغییرات و پایان موفق انتشار، بازی در پیوند بالا باز می‌شود. به نصب برنامهٔ اضافی یا حساب کاربری بازی نیازی ندارید.
