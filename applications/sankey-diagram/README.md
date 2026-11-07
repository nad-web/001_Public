# Sankey Studio

**Designed and developed by Noorullah Adel**

Create, edit, customise and export Sankey flow diagrams in your browser. This is a complete, self-contained application: its source, assets, documentation, tests, licences and app tools all belong inside the same sankey-diagram folder.

**GitHub destination:** https://github.com/nad-web/001_Public/tree/main/applications/sankey-diagram

**Website address after deployment:** https://nad-web.github.io/001_Public/applications/sankey-diagram/

Version 0.2.0. Development stage: prototype pending the remaining physical-device/browser acceptance checks.

## Upload this package

1. Extract the ZIP.
2. Open the extracted folder containing this README and index.html.
3. On GitHub, open 001_Public → applications → sankey-diagram.
4. Choose Add file → Upload files.
5. Upload all the extracted files and folders directly into that GitHub folder, preserving the assets, src, docs, scripts and tests folders.
6. Commit the upload.

The ZIP has no UPLOAD_TO_REPO_ROOT wrapper and no additional applications folder. The application files do not need to be uploaded anywhere else. Keep any existing placeholder notes if you wish.

**Publishing is a separate step.** Your current GitHub Pages workflow builds a selected website output and does not automatically include this folder. Add the single documented “Prepare Sankey Studio” step to that existing workflow. All application code stays here. Exact instructions and a copyable YAML snippet are in [the publishing guide](docs/GITHUB_PAGES.md).

A workflow saved inside this folder is not automatically run by GitHub. This package therefore supplies instructions, not a misleading nested deployment workflow.

## What you can do

- Create, edit and remove sources, destinations and flow values.
- Rename nodes and change individual node or ribbon colours.
- Choose five canvas themes and six palettes.
- Adjust backgrounds, gradients, spacing, widths, opacity, labels, units, decimal places and canvas dimensions.
- Drag nodes vertically, move them with the keyboard, zoom, expand the preview and restore automatic layout.
- Undo and redo changes.
- Start with six illustrative diagram templates.
- Paste spreadsheet rows or import CSV, TSV, semicolon-separated data and native project JSON.
- Export SVG, PNG, JPEG and WebP where the browser can encode it.
- Export flow CSV and a fully editable Project JSON backup.
- Print / Save as PDF through the browser print dialog.
- Use local autosave and offline access after the app reports readiness.
- Add the application to an iPhone Home Screen.

No account, backend, API key, external font or runtime CDN is required.

## Files in this application

| File or folder | Purpose |
| --- | --- |
| index.html | Opens Sankey Studio |
| src/ | Application logic, styles, SVG renderer, exports and locally bundled layout library |
| assets/ | Original logo and install icons |
| manifest.webmanifest | App identity, Home Screen icons and launch scope |
| sw.js | App-scoped offline cache |
| app.json | Sankey Studio metadata |
| package.json | Optional local developer commands |
| scripts/ | This application's own validation, build and preview tools |
| tests/ | Sankey model and standalone-hosting tests |
| docs/ | Sankey usage, publishing and validation documentation |
| LICENSE | MIT licence for the original application |
| THIRD_PARTY_NOTICES.md | Attribution for the locally bundled layout engine |

## Create a diagram

The default income diagram contains illustrative data. Edit it, choose Templates or start a new diagram.

In Data, edit existing connections or choose Add a flow. Type existing node names or new ones. New names create nodes automatically. Nodes & colours lets you rename and recolour nodes.

Select a ribbon to customise its colour. Drag a node vertically, or focus it with the keyboard and use Up/Down. Hold Shift for larger steps. Auto layout restores the automatic arrangement.

Design changes the diagram. The sun button changes the editor interface independently.

## Import your data

Use source, target and value columns:

    source,target,value
    Salary,Income,4200
    Income,Rent,1550

CSV quoting, embedded newlines, BOM, tabs and semicolons are supported. Header aliases from/to/amount are recognised. Decimal commas are accepted in semicolon/tab-separated rows. Values must not contain thousands separators or currency symbols.

Use native Project JSON to reopen the full diagram, including styling and positions.

## Choose an export

| Format | What it preserves |
| --- | --- |
| SVG | Sharp vector shapes and text |
| PNG | Lossless pixels and optional transparency |
| JPEG / JPG | Pixels with a solid background |
| WebP | A compact image where encoding is supported |
| Project JSON | Full editable data, colours, settings and positions |
| CSV | Flow data; no diagram styling |
| Print / PDF | The browser's printable diagram output |

Exports include the full diagram, regardless of preview zoom. Use the persistent Save link in Export if a download does not start. The image preview shows the actual generated file.

PNG, JPEG and WebP are flattened images. SVG remains editable as artwork, but arbitrary SVG files cannot be reopened as native projects.

## Local saving and offline use

Your diagram stays in this browser. Nothing is uploaded or synchronised. Download Project JSON backups before changing browser, device or installation context.

For offline use, first open the app online over HTTPS and wait for “Offline ready · works on this device”. Offline resources, storage keys and cache cleanup are scoped to Sankey Studio. Browser storage can still be cleared or evicted; a downloaded project is your backup.

### Install on iPhone

1. Open the published HTTPS app in Safari.
2. Tap Share → Add to Home Screen.
3. Enable Open as Web App if shown, then Add.
4. Open the Home Screen icon online and wait for the offline-ready message.
5. Check editing and exports in airplane mode before relying on offline access.

An installed web app can use a different storage context from its browser tab.

## Limits and data integrity

- Up to 120 nodes and 300 connections; imports are limited to 2 MiB.
- Flow values must be finite, nonnegative and at most 10^15.
- Circular connections and self-links are explicitly rejected.
- Zero-value connections remain in the data but are not drawn.
- Unequal intermediate totals are reported; no balancing flow is silently added.
- Total input counts source nodes once instead of adding every stage.
- Very small flows and long labels may need more canvas space or fewer visible labels.
- Dense diagrams reduce spacing to keep positive flow widths visible.
- Manual node movement can create overlap; Auto layout restores a managed arrangement.
- Raster exports are limited to 16 megapixels and 8192 pixels per side. Use SVG for larger diagrams.
- Native sharing, file saving, PDF options and background behaviour vary with browser and operating system.

## Optional development tools

Use Node 24 or later. There are no npm dependencies to install.

From this application folder:

    npm run check
    npm test
    npm run prepare:offline
    npm run build
    npm run dev

The build writes only browser runtime files into this application's dist folder. Documentation, tests and app tooling remain with the source.

To preview the built output at the exact website path:

    node scripts/serve.mjs dist --base /001_Public/applications/sankey-diagram/

Open the address printed by the server. Serve the app through HTTP/HTTPS; opening index.html as a plain file can block browser module imports.

After editing runtime files, run prepare:offline before creating a raw-source upload ZIP. This refreshes the included source worker's resource list and content revision.

## Validation and attribution

The recorded checks and verification limits are in [the validation report](docs/case-study.md). No universal browser or physical-device guarantee is claimed.

Original application code, design and icons © Noorullah Adel, MIT licensed. The local layout engine is d3-sankey 0.12.3, copyright Mike Bostock, BSD-3-Clause. See THIRD_PARTY_NOTICES.md and src/vendor/LICENSE.
