# Update Noorullah’s Build Lab — browser only

No npm, Node.js, Git, or editor installation is required on your computer. Your existing GitHub Actions workflow performs the checks and build online.

## What is in this release

All 20 apps from the original roadmap are implemented, two per category. The portfolio and apps use **Noorullah’s Build Lab** and **Noorullah Adel**, with source links to **Nad-Web/001_Public**.

This is a source package ready for your repository. It does not update the live website until you upload it and GitHub successfully deploys it.

## Upload in small batches

1. Download and extract the supplied release ZIP. Open the extracted `001_Public` folder.
2. Open **https://github.com/Nad-Web/001_Public** and select branch **main**.
3. In the repository root, choose **Add file → Upload files**. Upload the extracted root files (`index.html`, `portfolio.json`, `manifest.webmanifest`, `sw.template.js`, `package.json`, `package-lock.json`, and the Markdown/license/configuration files) and the root folders **assets**, **docs**, **scripts**, and **tests**. Keep their existing filenames and paths. Commit as `Update Build Lab core and deployment build`.
4. Open the **Vibcoding** folder on GitHub. Choose **Add file → Upload files** there. From your extracted local `Vibcoding` folder, upload **index.html**, **catalogue.json**, **categories.json**, **src**, **shared**, and **_templates**. Commit as `Update library and shared app foundations`.
5. Stay inside GitHub’s **Vibcoding** folder. Upload these category folders in pairs, committing each batch:

| Batch | Local category folders to drag into GitHub’s Vibcoding upload page |
| --- | --- |
| 1 | `finances`, `fun` |
| 2 | `on-the-way`, `languages` |
| 3 | `productivity`, `education` |
| 4 | `developer-tools`, `everyday-tools` |
| 5 | `health-wellbeing`, `creative` |

Each category folder includes its two apps and their nested source, manifest, documentation, and assets. Upload the category folders themselves while you are **inside Vibcoding on GitHub**. This preserves paths such as `Vibcoding/languages/deutsch-daily/src/app.js`.

6. Keep your working `.github/workflows/pages.yml`. It already calls the root check, test, and build commands, so it works with this release. The source ZIP also includes the workflow and issue templates. To update them, show hidden files in Finder with **Command + Shift + .**, then upload the local `.github` folder from the repository root. There is no need to create a second workflow.
7. Keep each upload below GitHub’s 100-file browser limit. The grouped steps above are designed for that limit. The repository can temporarily fail checks while only some batches are uploaded; complete all batches before troubleshooting the final run.
8. After the last batch, open **Actions → Verify and deploy Pages**. Check the newest run, or click **Run workflow → main → Run workflow**. Wait for verification and deployment to succeed.
9. Open **https://nad-web.github.io/001_Public/Vibcoding/**. Refresh to see the new branding and 20 launch links.

**Important:** upload extracted files and folders, not the release ZIP. Preserve the existing repository name and `Vibcoding` spelling. Keep all unrelated files already in your public repository.

## Check the published update

- The header says Noorullah’s Build Lab.
- The library has 20 launch links and 10 collections.
- Each app opens from its card and returns to the library.
- The browser console has no missing files.
- The install help explains iPhone Home Screen installation.
- After the offline download completes, turn off connectivity and open an app.

## Install on iPhone

1. Open the library or the individual app in **Safari**.
2. Tap **Share**. If needed, scroll through the share actions or edit the available actions.
3. Choose **Add to Home Screen**.
4. If your iOS version shows **Open as Web App**, enable it.
5. Tap **Add**.
6. Open the new Home Screen icon. While still online, tap **Install app** or **Install Build Lab** and wait for **Offline library ready on this device** before relying on offline use.

The library and individual apps each have install metadata. These are installable web apps, not App Store downloads or signed `.ipa` files.

## Browser data and device limits

Records stay on that browser/device. Installed web apps can have separate storage from an ordinary Safari tab; do not assume a draft or budget automatically transfers when you install. Export important data before switching context. Exports can be restored in apps with an import control.

Safari can suspend background pages, particularly when the phone is locked. Focus Flow and Break Buddy recover their saved deadline when reopened, but cannot guarantee an alarm while suspended or closed. Use a phone alarm when exact background delivery matters.

Offline caches and local records can be removed by the browser or by clearing site data. Keep JSON/CSV/text exports as backups. There is no cloud synchronization or user account in this release.

## Official references

- [GitHub browser file uploads](https://docs.github.com/en/repositories/working-with-files/managing-files/adding-a-file-to-a-repository)
- [Apple: turn a website into an iPhone web app](https://support.apple.com/guide/iphone/turn-a-website-into-an-app-iph42ab2f3a7/ios)
- [MDN: offline and background operation](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Guides/Offline_and_background_operation)
