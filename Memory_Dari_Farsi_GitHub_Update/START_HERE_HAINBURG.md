# Hainburg Memory Match — Dari/Farsi update

**Developer: Noorullah Adel / نورالله عادل · Version 1.1.0 · 31 October 2026**

This ZIP is a **drop-in update for your existing `Nad-Web/001_Public` repository**. It contains the entire standalone game plus the small portfolio changes needed to publish it. Your other apps are preserved. You do not need to install npm or any software to publish it.

## Upload using GitHub's website

1. Extract the ZIP on your Mac. Open the extracted folder. You should see **Games**, **Vibcoding**, **scripts**, **tests**, **package.json** and this guide.
2. Open **https://github.com/Nad-Web/001_Public** and select **main**. Stay at the root, where your current `Vibcoding` folder and `package.json` are visible.
3. Click **Add file → Upload files**. Drag **all contents of the extracted folder** into GitHub, including the folders. Do not upload the ZIP itself and do not upload its outer wrapper folder. Keep capitalization exactly as supplied.
4. Wait for the uploads to finish. Replacing the same-named files is intentional. Commit with a message such as **Add Dari/Farsi Hainburg memory game**.
5. Open **Actions → Verify and deploy Pages**. Wait for the complete workflow to turn green. If necessary choose **Run workflow** on `main`. Keep **Settings → Pages → Source: GitHub Actions**, as used by your existing portfolio.
6. After successful publication, open the expected address:

   **https://nad-web.github.io/001_Public/Games/MatchMemory/**

The portfolio also gets a new Dari/Farsi game entry. It opens the same standalone game. This package has not been pushed or published on your behalf.

## Install on your iPhone and play offline

1. Open the published HTTPS link with an internet connection in **Safari**. Chrome can also open the game; the game uses no account/login.
2. The top-right button **افزودن به آیفون** opens the full Dari/Farsi instructions. In Safari choose **Share → Add to Home Screen**, enable **Open as Web App** if offered, then tap **Add**. Chrome for iPhone currently also offers **Share → Add to Home Screen**. If Edge does not show that option, use Safari for installation.
3. Open the game **from the new Home Screen icon while still online**. Wait for **آماده برای بازی آفلاین**. All required code, images, font and Persian audio are then checked as cached.
4. Turn on **Airplane Mode**, close/reopen the icon and try a round. Enable **صدا** to hear the bundled Persian voice. After this setup, gameplay needs no internet. If website data is removed by you or the device, repeat the online setup.

The in-game button shows installation help. iOS requires you to confirm the actual installation through its own menu; a website cannot install an icon without that action. System/browser menu language follows your device settings. The app itself is Dari/Farsi and right-to-left regardless of the phone's default language.

## What is included

- `Games/MatchMemory/`: self-contained game, source, local assets, ten levels, eight categories, manifest, scoped service worker, docs and tests.
- 150 native-language card identities and 169 bundled Persian audio clips, including all ten developer messages. The voice is synthesized Persian; it is not a human recording or a claimed specific Dari accent.
- Genuine Hainburg, Hesse photography with CC BY 4.0 attribution; locally bundled Vazirmatn font and app icons.
- Local progress restoration, pause/restart/hints, garden rewards, daily selection, personalized greeting and favorite categories; larger text, high contrast, reduced motion and keyboard support.
- `Vibcoding/fun/hainburg-memory/` and `Vibcoding/catalogue.json`: catalogue launcher and registration.
- `scripts/build.mjs`: publishes the standalone game at the required nested path. **Do not omit this file**, or the existing Actions build will leave the game out.
- `scripts/serve.mjs`, `package.json`, `tests/hainburg-deployment.test.mjs`: local preview audio type and automated verification integration.

See `Games/MatchMemory/docs/TESTING.md` for actual test results and limits. Chromium gameplay and simulated phone widths were checked; physical iPhone, Safari and Microsoft Edge were not available here. Service-worker behavior was tested automatically, but the HTTP preview could not provide a real secure-origin/offline browser test. The guide includes the final on-device airplane-mode check for you to perform after publishing.

## راهنمای کوتاه به دری / فارسی

فایل فشرده را باز کنید و محتویات آن را در ریشهٔ مخزن خود بارگذاری کنید. پوشهٔ اضافی نسازید. پس از پایان موفق روند انتشار، پیوند بازی را در آیفون باز کنید، دکمهٔ «افزودن به آیفون» را بزنید و راهنما را دنبال کنید. بازی را یک بار از نماد صفحهٔ اصلی با اینترنت باز کنید و منتظر پیام «آماده برای بازی آفلاین» بمانید. سپس بازی، عکس و صدای فارسی بدون اینترنت کار می‌کنند. توسعه‌دهنده: **نورالله عادل**.
