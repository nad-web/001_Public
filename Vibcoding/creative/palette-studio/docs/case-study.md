# Palette Studio — implementation case study

**Release:** 1.0.0 · **Date:** 28 October 2026 · **Author/portfolio owner:** Noorullah Adel

## Problem and audience

A small design project needs a coherent, reusable color palette. Intended audience: Makers starting a personal design project.

## Implemented first version

Five editable colors; locking and regeneration; local palette saving; WCAG contrast ratio; text sample; per-color/CSS clipboard; CSS download.

## Technical decisions

Browser-only HTML, CSS, and ES modules keep this app deployable on GitHub Pages. Shared modules provide safe DOM construction, optional versioned browser storage, exports, import checks, and tested pure functions. App-specific logic remains in its app entry or a clearly named shared engine used by two related apps. Install manifests and a content-versioned service worker support a Home Screen and cached-offline experience without an application server.

## Validation evidence

The browser scenario passed for: locked-color preservation, black/white reference contrast, persistence, and CSS download. All 20 app pages were also checked at 320, 390, and 1440 px for horizontal overflow and at mobile width with axe WCAG A/AA tags; no serious or critical automated violations were found in that checked initial state. The offline test cached the actual deployment and navigated to all 20 apps with the network disabled. Relevant calculation/import invariants are tested in `tests/apps.test.mjs`. Exact suite evidence is recorded in the root validation document.

## AI collaboration

The user selected the portfolio scope, categories, GitHub destination, and Noorullah branding. The assistant generated the implementation and test code, reviewed the source, ran the tests, and corrected observed issues. No claim is made that a human software reviewer independently audited this release.

## Limits and tradeoffs

Contrast uses the WCAG relative-luminance formula. Passing contrast alone does not establish overall accessibility. This release has not yet been uploaded by the owner, and a physical iPhone/Safari installation check is still needed. Browser emulation and Chromium tests do not prove Safari compatibility or guarantee future cache retention.

## Next improvement

Gather feedback from the deployed app and test the real iPhone user flow before extending its scope. Keep source, tests, and the data explanation aligned with any later changes.
