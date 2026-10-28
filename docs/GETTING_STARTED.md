# Implement your public GitHub app library

This package is prepared locally. It has not created a GitHub repository or published a live site. You will publish it from your own account. Choose **one** publishing route below.

## 1. Extract and run

1. Extract `001_Public.zip`. Open the extracted **001_Public** folder in your editor. The top level should contain `README.md`, `package.json`, `Vibcoding/`, and `.github/`.
2. Install [Node.js 24](https://nodejs.org/en/download) or a newer supported release, and [Git](https://git-scm.com/downloads), if they are not already available.
3. Open a terminal inside that folder. On macOS, Finder can hide names starting with a dot; press **Command + Shift + .** to show them. Keep `.github`, `.gitignore`, and the other supplied configuration files.

```bash
node --version
git --version
npm run configure -- YOUR_GITHUB_USERNAME "Shukur Adel"
npm run check
npm test
npm run build
npm run dev
```

Replace `YOUR_GITHUB_USERNAME` with your actual account name, without `@`. No `npm install` is required for this dependency-free foundation. The supplied lockfile supports CI’s `npm ci` command.

Open **http://127.0.0.1:4173/**. Press **Ctrl + C** in the terminal to stop the preview. Opening the HTML by double-clicking is insufficient because the gallery loads local JSON through HTTP.

## 2A. Publish with GitHub Desktop

This route avoids terminal authentication commands.

1. Install [GitHub Desktop](https://desktop.github.com/download/) and sign in to your GitHub account.
2. Choose **File → Add Local Repository**, and select the extracted `001_Public` folder.
3. If Desktop says this is not a Git repository, use its **create a repository here** option. Keep the existing files, use the name `001_Public`, and do not create another nested `001_Public` folder. If the creation dialog asks about a README, ignore file, or license, retain the supplied files instead of generating replacements.
4. Confirm the repository root contains `Vibcoding/` directly. Commit the existing files with the summary `feat: initialize public app library` if Desktop has not already committed them.
5. Ensure the branch is called **main**. Rename it in **Branch → Rename** if needed; the workflow deploys `main`.
6. Click **Publish repository**. Use **001_Public** as the name and **uncheck “Keep this code private”**. Publish to your own account.
7. In GitHub’s file list, confirm `.github/workflows/pages.yml`, `Vibcoding/`, and `package.json` are present at the repository root.

If `001_Public` already exists on your account, clone that repository and copy these source files into the clone after reviewing existing files. Do not overwrite unrelated work or force-push its history.

## 2B. Publish with Git and GitHub CLI

Use this route instead of 2A if you prefer the terminal. Install [GitHub CLI](https://cli.github.com/) and authenticate in your own terminal. Do not paste tokens into source files or chats.

From the extracted `001_Public` folder:

```bash
gh auth login
git init -b main
git add .
git commit -m "feat: initialize public app library"
gh repo create 001_Public --public --source=. --remote=origin --push
```

If Git asks for your name and email, set them for this repository and retry the commit. You can use the private no-reply email shown in your GitHub account settings.

```bash
git config user.name "Shukur Adel"
git config user.email "YOUR_GITHUB_NOREPLY_EMAIL"
```

The `gh repo create` command is for a new repository. If it already exists, clone it and integrate the files before committing and pushing. Do not run both publishing routes for the same folder.

## 3. Enable live browser demos

1. Open `https://github.com/YOUR_GITHUB_USERNAME/001_Public`.
2. Go to **Settings → Pages**.
3. Under **Build and deployment → Source**, select **GitHub Actions**.
4. Go to **Actions → Verify and deploy Pages → Run workflow**, choose `main`, and run it. If a push already triggered a failed deployment before Pages was enabled, rerun it now.
5. Wait for **Verify source and build** and **Deploy to GitHub Pages** to succeed. Open the deployment URL shown by GitHub.

Your expected URLs are:

| Purpose | URL pattern |
| --- | --- |
| Source repository | `https://github.com/YOUR_GITHUB_USERNAME/001_Public` |
| Portfolio | `https://YOUR_GITHUB_USERNAME.github.io/001_Public/Vibcoding/` |
| Future German app, once created | `https://YOUR_GITHUB_USERNAME.github.io/001_Public/Vibcoding/languages/deutsch-daily/` |

The workflow uploads only the generated `dist/` artifact. Keep `dist/` out of Git; all editable source stays in the repository. You do not need a `gh-pages` branch. Never select “Deploy from a branch” for this supplied workflow.

## 4. Add your portfolio details

- Check `portfolio.json`: your display name, actual GitHub username, and repository name.
- Add the live library URL to the repository’s **About → Website** field.
- Set a short description such as “Open source browser apps, experiments, and practical tools built with AI assistance and human review.”
- Add relevant topics such as `portfolio`, `javascript`, `github-pages`, `web-apps`, and `vibe-coding`.
- Pin the repository to your GitHub profile once you want to showcase it.
- The default MIT license allows reuse with attribution to the copyright notice. Change it before public release if you prefer a different license.

## 5. Start the first app

The suggested first app is **Deutsch Daily**, followed by **Pocket Budget** and **Decision Wheel**. This produces a small set showing learning design, data handling, and interaction skills.

```bash
npm run create:app -- languages deutsch-daily
npm run check
npm run dev
```

Open **http://127.0.0.1:4173/Vibcoding/languages/deutsch-daily/**. The generator creates a prototype starter, not the finished German app. Implement the concept using [APP_GUIDE.md](APP_GUIDE.md), document your work, and release it when its acceptance criteria pass.

## 6. Publish later changes

Stop the dev server if it is still using the terminal. After editing:

```bash
npm run check
npm test
npm run build
git add .
git commit -m "feat(languages): add Deutsch Daily prototype"
git push
```

GitHub Actions checks the new source and updates Pages automatically after a successful push to `main`. For larger changes, create a branch and pull request first; CI runs on the PR, and Pages updates after it merges into `main`.

## Troubleshooting

| Symptom | Fix |
| --- | --- |
| `npm` or `node` not found | Install Node, reopen the terminal, and check `node --version` |
| Catalogue cannot load | Use `npm run dev`; do not open a `file://` URL |
| Preview port already in use | Stop the other server or use `npm run dev -- --port 4174` |
| Pages deployment cannot find a site | Set **Settings → Pages → Source → GitHub Actions**, then rerun the workflow |
| No workflow appears | Confirm `.github/workflows/pages.yml` was included and the default branch is `main` |
| A new app is absent | Use the generator, or validate its catalogue and manifest registration with `npm run check` |
| Broken styles or images on Pages | Use relative URLs and run the prefix preview below |
| GitHub links point nowhere | Set the real username with the configure command, commit, and push |
| App still says prototype | Complete its release checklist and update both metadata files |
| Repository name already taken in your account | Use and review the existing repository; avoid replacing its history |

To test the exact GitHub project prefix:

```bash
npm run build
npm run preview -- --base /001_Public/
```

Open **http://127.0.0.1:4173/001_Public/** and verify the gallery, dialogs, filters, theme, and any app demo.

## Official references

- [GitHub Pages overview](https://docs.github.com/en/pages/getting-started-with-github-pages/what-is-github-pages)
- [Configure a Pages publishing source](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site)
- [Use a custom Pages workflow](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages)
- [GitHub CLI: create a repository from local source](https://cli.github.com/manual/gh_repo_create)

Documentation and workflow action versions checked on 28 October 2026. Future UI labels and versions may change; the official references above are the maintained source.
