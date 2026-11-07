# Publish Sankey Studio

This guide covers only Sankey Studio.

## Application files

Upload the complete extracted ZIP contents inside:

    001_Public/applications/sankey-diagram/

All source, styles, icons, tests, documentation and app tools remain there. The editor has no runtime dependency on files outside that folder.

Expected app URL after successful publication:

https://nad-web.github.io/001_Public/applications/sankey-diagram/

## One hosting-configuration step for your current workflow

The repository currently uses GitHub Actions to publish a built dist directory. Uploading source into a new folder does not automatically place that source in the published output.

1. Open the existing .github/workflows/pages.yml on GitHub.
2. Click Edit.
3. Locate the step named “Build portfolio”.
4. Immediately after that step, and before “Upload website”, add:

      - name: Prepare Sankey Studio
        run: |
          node applications/sankey-diagram/scripts/check.mjs
          node --test applications/sankey-diagram/tests/*.test.mjs
          node applications/sankey-diagram/scripts/build.mjs --output dist/applications/sankey-diagram

5. Keep the other existing steps and their order.
6. Commit the workflow edit.
7. Wait for the newest workflow run to finish, then open the app URL.

The copyable snippet is also supplied in github-pages-step.yml in this docs folder. The leading indentation is intentional: this is one step inside the existing steps list.

This edits the existing hosting configuration. It does not move or upload application files to the repository root, and it does not require uploading a new root-level script.

Do not create a second competing Pages deployment workflow. A workflow placed under sankey-diagram/.github/workflows would not be discovered by GitHub.

## Already using direct static publishing?

If your hosting already serves this directory as static files, the included index.html, relative resources and prepared sw.js can be served directly. No app build is required for that mode.

Changing the repository's global publishing mode is not required by this package.

## Check after publication

- The app displays “Sankey Studio” and Noorullah Adel's developer credit.
- Editing a value updates the preview.
- Themes, palettes, individual colours and undo/redo work.
- Export SVG and PNG, check the preview, then save the files.
- Download a Project JSON file and reopen it.
- On iPhone, check file saving, touch controls and Home Screen launch.
- Wait for offline readiness before testing airplane mode.
- Verify your target browsers and physical devices before treating the release as ready.
