# Sankey Studio — implementation and validation

Developer: **Noorullah Adel**. Version 0.2.0. Stage: prototype pending physical-device and additional browser-engine acceptance checks.

## Scope

This report covers only Sankey Studio. Its source, assets, licences, tests, app metadata, validation, build and preview tools are all inside the sankey-diagram folder. The application does not require parent-folder assets, a shared catalogue, a shared application library or a parent JavaScript package.

## Architecture

An SVG renderer uses a locally vendored d3-sankey layout. Model, CSV, layout and export code are separate from DOM interactions. Labels are inserted with textContent. The project is schema-versioned and stored under an app-specific local key.

Five diagram themes and six palettes are separate from the editor interface theme. Individual node and ribbon colours can override the defaults. Native Project JSON preserves data, styling and manual positions.

The app has its own manifest and worker scope. Its local build computes an offline resource list and a content revision from only the app's runtime. It omits documentation, tests and developer tools from the built website. Cache cleanup deletes only outdated Sankey caches.

## Standalone checks recorded on 2026-11-03

- App syntax, manifest and app-relative runtime reference checks passed.
- All 22 application tests passed.
- The app was copied to an isolated temporary folder with no parent resources and validated successfully.
- A standalone HTTP integration test served every runtime file successfully under /001_Public/applications/sankey-diagram/.
- Build output contained only runtime files and left the original source, tests and documentation intact.
- Build guards rejected output paths that would overwrite application source.
- Escape paths, missing resources, runtime CDN references and symbolic links were rejected.
- The source worker refresh was deterministic. Runtime changes changed its content revision; documentation-only changes did not.
- The prepared worker covered all runtime files. Offline navigation returned the cached application, and requests outside the app scope were left untouched.
- All six diagram templates produced finite, proportional layouts. A dense 120-node graph retained positive flow widths.
- Source totals, unbalanced totals, zero-valued data, cycle/self-link rejection, schema validation, colour/position/project round-trips, CSV quoting/separators, formula neutralisation and image size limits were checked.

## Editor browser checks recorded during implementation

The Chrome editor was visually inspected at desktop width and in a 390-pixel-wide iframe viewport. The latter is a responsive-layout check rather than a physical iPhone test.

- Editing a flow changed the income example from €5,400 to €5,500 on desktop and €5,700 at phone width. Undo restored it.
- Midnight/Forest themes and Ocean colours changed selection state and appearance.
- Pasted CSV produced three nodes, two flows and total input 100. Reloading restored the saved project.
- A circular connection was rejected without changing the current flows. A valid connection was added and undone.
- The template picker restored the income example.
- Keyboard movement changed a node's SVG position and could be undone.
- SVG decoded at 1440 × 920. PNG, JPEG and WebP decoded at 2880 × 1840 in the actual generated image preview.

## Verification limits

The available browser did not expose completed native downloads, and file-picker automation was denied. Image generation was verified through decoded previews, CSV paste import was checked, and native JSON schema/model round-trips passed automated tests. Physical file-picker/download confirmation is still required.

Physical iPhone/iPad/Android, Safari, Firefox, Edge, native Share, print-to-PDF and HTTPS offline reopening have not been verified in this environment. Offline logic and full resource coverage were tested automatically.

## Supported-data boundaries

Circular networks and negative weights are explicitly rejected. CSV stores flow data; native Project JSON stores the full editable project. Raster images are bounded to a mobile-conscious size. Manual node dragging can create overlap, and very long labels or very small flows may need layout adjustment.
