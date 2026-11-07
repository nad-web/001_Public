# Get started

[Upload this update](MIGRATION.md) · [Add the next app](ADD_APP.md) · [Architecture](ARCHITECTURE.md).

Every app uses applications/<slug>/index.html and opens at https://nad-web.github.io/001_Public/applications/<slug>/.

With Node 24: run npm ci --ignore-scripts, then npm run dev. The printed preview uses /001_Public/. Re-run after source changes. Before release run npm run check, npm test and npm run build.
