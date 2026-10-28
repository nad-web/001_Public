# Privacy and local data

Noorullah’s Build Lab has no accounts, analytics, ads, application database, or runtime CDN. The apps and their dependencies are served from the same GitHub Pages site. The QR encoder works locally. Original learning content and prompts ship with the source.

## What is saved

Apps with records, options, plans, palettes, timers, or drafts store them in versioned localStorage keys under `noorullah-lab:<app-id>:v1`. The library’s theme uses `001-public:theme`. The service worker caches runtime files for offline use. Games and developer tools may keep their current interaction only in memory, as each app documents.

Other same-origin code can access localStorage; this is not encrypted confidential storage. Clearing browser data can remove records and offline files. Installed apps and ordinary Safari tabs may use different storage contexts. There is no account-based restore or device synchronization.

## Exports and deletion

Use the relevant app’s JSON, CSV, text, CSS, SVG, or PNG export. Exports are local downloads initiated by the user. Apps that accept data imports validate structure/size before replacing records, and ask for confirmation. Use the app’s reset/delete controls or browser site-data settings to clear saved records.

The clipboard is used only when the user clicks a Copy action. Device speech is used only when the user clicks Listen; available voices and any voice download behavior are controlled by the browser/OS. Notification permission is requested only from its explicit optional button, and can be revoked in browser/device settings.

## Public hosting

GitHub provides hosting after deployment and applies its own hosting and security logging policies. See [GitHub Pages documentation](https://docs.github.com/en/pages/getting-started-with-github-pages/what-is-github-pages) and [GitHub’s Privacy Statement](https://docs.github.com/en/site-policy/privacy-policies/github-general-privacy-statement).

Never commit personal records or credentials into this public repository. The bundled content is public starter content; app-user records are not written into GitHub by these apps.
