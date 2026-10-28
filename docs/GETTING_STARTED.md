# Get started with Noorullah’s Build Lab

For your existing public repository **Nad-Web/001_Public**, follow **[BROWSER_UPDATE.md](BROWSER_UPDATE.md)**. It provides the complete browser-only upload sequence and iPhone installation steps. No local npm, Node.js, Git, or GitHub Desktop installation is required.

Your supplied package contains all source for 20 apps. Extract it before uploading. Preserve the root `Vibcoding` folder and the existing `.github/workflows/pages.yml` publishing workflow. Upload all batches before assessing the final workflow result.

After deployment, the library URL is https://nad-web.github.io/001_Public/Vibcoding/.

For optional local development with Node 24+:

```bash
npm run dev
npm run check
npm test
npm run build
npm run preview -- --base /001_Public/
```

The development preview serves raw source. The build/preview step exercises the actual deployment and generated offline worker. The root tools have no npm package dependencies.

See [architecture](ARCHITECTURE.md), [app development](APP_GUIDE.md), [validation](VALIDATION.md), and [privacy](PRIVACY.md).
