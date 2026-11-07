# Architecture

This repository hosts independent static applications under applications/<slug>/. The website root and applications/index.html share a catalogue generated from those folders and optional app.json metadata. No runtime app registry is maintained separately.

The build copies only runtime files, validates local references inside each app, compiles generic offline manifests, generates legacy redirects and one dist artifact. Sankey's unchanged build handles its own output. New static folders enter the same workflow automatically.

The twenty smaller apps contain local copies of shell, storage, calculation and PWA modules. The maintained starter is templates/static-app. Correct calculation helpers, schemas, QR encoder and starter content are retained; interfaces and hosting were redesigned. Math keeps its local bilingual content and media. Memory Garden keeps its local font, photograph, audio and native engine.

Browser records use compatible existing keys. Smaller apps retain noorullah-lab:<slug>:v1 and {version:1,data}. Detected stale tabs are blocked before writes and asked to export/reload rather than overwrite newer records. Storage denial/quota retains current-visit data for export. Imports are validated with a 16 MiB file cap.

Generic workers embed their core configuration so restart does not depend on network access. Each app's cache prefix includes its scope path. Core updates preserve explicitly saved video caches. Cached video ranges support normal, suffix and invalid-range responses. Old root/game workers retire only their own original caches. Sankey and Memory Garden keep their custom scoped workers.

GitHub Actions uses read-only source permissions by default. Deployment receives pages/id-token permissions in its job. README catalogue commits use contents:write only in the separate job. Public source never contains server credentials. Runtime input is inserted as text, JSON formatting preserves numeric tokens/duplicate names, and regex matching runs in a terminable worker.

This scales to more static apps within hosting/repository limits. It does not supply accounts, private API secrets, server databases or cross-device synchronization. Future apps needing those features require a backend. Large media must stay out of automatic library-wide precaches.

Browser storage is not a multi-user database. Use one tab at a time when editing the same app records; the stale-record checks handle detected conflicts and are not a server transaction system.
