# Data and privacy notes

## Repository foundation

The gallery loads its catalogue, categories, styles, scripts, icons, and profile configuration from the same site. It contains no analytics, advertising, accounts, external font requests, or application backend. A light/dark preference may be stored under `001-public:theme`; the theme still works when storage is unavailable.

There are no individual data-collecting apps in the initial foundation. The generated starter keeps feature ideas only in memory for the current page visit.

GitHub Pages is the hosting provider once you publish there. GitHub describes its hosting data collection in its [Pages documentation](https://docs.github.com/en/pages/getting-started-with-github-pages/what-is-github-pages) and [Privacy Statement](https://docs.github.com/en/site-policy/privacy-policies/github-general-privacy-statement).

## Future apps

Each app must describe what it stores, where, for how long, and how the user clears or exports it. Browser-local data is not automatically synchronized and can be cleared by the browser. Folders on the same origin do not isolate localStorage from one another.

Use synthetic or public records in demos and screenshots. Never commit personal financial records, credentials, private documents, or sensitive health data to this public repository. A locally stored record should not be described as encrypted or confidential unless the implementation actually provides and verifies that property.

If an app later adds analytics, remote APIs, account features, or cloud persistence, update its user-facing explanation and documentation to match the real data flow before release.
