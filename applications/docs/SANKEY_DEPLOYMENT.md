# Publish Sankey Studio to your GitHub repository

**Developer: Noorullah Adel**

Repository: https://github.com/nad-web/001_Public

App folder: applications/sankey-diagram/

Expected app address after successful deployment:
https://nad-web.github.io/001_Public/applications/sankey-diagram/

New applications hub:
https://nad-web.github.io/001_Public/applications/

These are deployment targets, not claims that the update is already online.

## Upload through the GitHub website

No npm, Node.js or Git installation is required on your computer.

1. Extract Sankey_Studio_GitHub_Update.zip.
2. Open its UPLOAD_TO_REPO_ROOT folder. These files are an additive source update, not a replacement for your complete repository.
3. Open the 001_Public repository on GitHub and select the main branch.
4. At the repository root, choose Add file → Upload files. Upload the applications folder from the package and commit it. Upload the folder itself at the repository root so its nested paths are preserved.
5. At the same repository root, upload the package's scripts folder. It contains the updated build, validation and generator plus the new applications helper. Commit it. Keep all other existing scripts.
6. Upload the tests and docs folders from the package, followed by README.md and THIRD_PARTY_NOTICES.md. Existing unrelated files are retained by GitHub's upload operation.
7. The included .gitignore is optional for browser-only publishing but useful for local development. On Mac, press Command + Shift + . in Finder to show it, or create a file named .gitignore in GitHub's editor and copy its contents.
8. Keep the existing .github/workflows/pages.yml file. Do not create a second deployment workflow.
9. Open Actions → Verify and deploy Pages. Wait for the newest run after all batches to finish. If needed, choose Run workflow → main.
10. Open the app address above. Refresh if an older page is cached.

During a partial upload, checks may fail because another batch is still missing. Complete every batch, then inspect the latest workflow run.

Do not upload the ZIP itself as the application. Upload its extracted files. Do not create another 001_Public folder inside your repository.

## Why the root scripts are included

Your current deployment publishes a curated dist folder. Uploading only applications/sankey-diagram would leave the new route out of that build.

The changes publish the applications hub and registered app runtime, retain the existing Vibcoding and MemoryGame routes, and give Sankey Studio an independent content-versioned offline cache.

The registration is kept as prototype until real-device and additional browser-engine checks are recorded. The implemented features are usable; this stage does not claim unperformed device testing.

## First launch

- Open Templates or edit the default illustrative income diagram.
- Use Data for sources, destinations and values.
- Use Nodes & colours for node labels and individual colours.
- Use Design for five themes, six palettes, custom colours, spacing, labels, units and canvas dimensions.
- Use Export for SVG, PNG, JPEG, WebP, CSV and native project backups.
- If a download does not start, use the persistent Save link that appears in Export.
- PDF is provided through the browser's Print / Save as PDF options.

## Install on iPhone and prepare offline access

1. Open the published HTTPS app in Safari.
2. Tap Share → Add to Home Screen.
3. Enable Open as Web App if shown, then tap Add.
4. Open the installed app while online.
5. Wait for Offline ready · works on this device.
6. Switch on airplane mode, reopen the app and check editing and exports.

An installed app can have separate storage from a browser tab. Download a Project JSON backup before changing context or devices. Projects do not automatically synchronise.

## Owner checks after publishing

- New and existing application routes load.
- No missing files appear in the browser console.
- Add, edit, delete and undo a flow.
- Choose themes, palettes and custom colours.
- Verify exported labels, dimensions and colours.
- Download a Project JSON file and reopen it.
- On real iPhone/Android, check touch dragging, file saving and Home Screen launch.
- Test offline reopening after the app reports readiness.
- Try current Safari, Firefox, Chrome and Edge.

## Optional local developer checks

With Node 24 or later:

    npm run check
    npm test
    npm run build
    npm run preview -- --base /001_Public/

No additional runtime dependencies are installed by this update. The layout library is stored in the repository with its licence.
