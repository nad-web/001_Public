# Contributing

Start with a clear problem, a small scope, and the relevant category. Use the app proposal or bug issue template when helpful. Read [AGENTS.md](AGENTS.md) and [the app guide](docs/APP_GUIDE.md).

Use short branches such as `feat/deutsch-daily` or `fix/catalogue-filter`. Keep changes focused, name commits clearly, and include relevant validation in the pull request.

Before review:

```bash
npm run check
npm test
npm run build
```

For UI changes, test the main flow with keyboard controls, at narrow and desktop widths, and under `/001_Public/`. Document actual behavior and remaining limits. Mark prototypes honestly and include asset licenses.

Keep third-party dependencies justified and pinned through a lockfile where used. Avoid secrets, private data, generated build folders, and large unnecessary binaries. Use public or synthetic examples.

See [the code of conduct](CODE_OF_CONDUCT.md) for collaboration expectations and [security guidance](SECURITY.md) for vulnerability reports.
