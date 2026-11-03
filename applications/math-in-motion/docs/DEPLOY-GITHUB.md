# Deploy Math in Motion to GitHub Pages

**Repository folder**  
`001_Public/applications/math-in-motion/`

**Published app address after deployment**  
https://nad-web.github.io/001_Public/applications/math-in-motion/

## 1. Upload the app folder

Extract the ZIP. The top-level `math-in-motion` folder should go directly inside `applications/`. Open that new folder on GitHub to confirm that its `index.html` is visible at the top level. If you use GitHub Desktop, copy the entire extracted folder into the cloned repository, commit it, then push to `main`. You can use the browser steps below if you prefer.

### Upload using the GitHub website

GitHub's browser uploader accepts up to 100 files at a time. The video folders are split to fit this limit. [Official upload guide](https://docs.github.com/en/repositories/working-with-files/managing-files/adding-a-file-to-a-repository)

1. Open `001_Public/applications/` on GitHub. Choose **Add file → Create new file**. Name the file `math-in-motion/README.md`, paste the ZIP's app README into the editor, and commit to `main`. If you already created the app folder, open it directly.
2. In the GitHub **math-in-motion** folder, choose **Add file → Upload files**. Drag in the contents of the extracted `math-in-motion` folder except `media/`. You can skip the README if you added it in step 1. Commit. The source folders and `index.html` should appear directly inside `math-in-motion/`.
3. Inside the GitHub **math-in-motion** folder, choose **Add file → Create new file**. Name it `media/README.md`, paste the contents of the extracted `media/README.md`, and commit. Open the new **media** folder on GitHub.
4. In the GitHub **media** folder, choose **Add file → Upload files**. Drag one folder from the extracted **media** folder into the upload area. Check the paths include the level folder and voice subfolder, then commit. Repeat for each folder in the table.

| Drag this folder into GitHub's `media/` folder | MP4 files |
| --- | ---: |
| `primary` | 80 |
| `middle` | 80 |
| `high` | 100 |
| `university-en` | 76 |
| `university-de` | 76 |
| `advanced-en` | 94 |
| `advanced-de` | 94 |

A completed file path looks like `applications/math-in-motion/media/high/de-female/compound-interest.mp4`. The website has the full media library once all seven folders are uploaded.

## 2. Add the build step to the existing Pages workflow

After all files are committed, edit the repository's existing **.github/workflows/pages.yml**. GitHub loads workflows from the repository's `.github/workflows/` directory. This edit tells the shared workflow to include the new standalone app. All of the app's own files belong inside `applications/math-in-motion/`.

Paste this block **after Prepare Sankey Studio and immediately above Upload website**. Align `- name: Prepare Math in Motion` with `- name: Upload website`.

```yaml
      - name: Prepare Math in Motion
        run: |
          node --test applications/math-in-motion/tests/*.test.mjs
          node applications/math-in-motion/tools/build.mjs --output dist/applications/math-in-motion
```

The command validates all lesson and media files and prepares the app's own subfolder inside the same Pages artifact. Commit to `main`, then open **Actions → Verify and deploy Pages**. After the run succeeds, open the published app link above. Try **Zinseszins → Ansehen** to verify the German clip.

## Complete workflow for copy and paste

This version is based on the workflow on `main` at commit `b196cec`. If you have edited that workflow since, add only the step above to preserve your newer edits.

```yaml
name: Verify and deploy Pages

on:
  push:
    branches: [main]
  workflow_dispatch:

permissions:
  contents: read

jobs:
  verify:
    name: Verify source and build
    runs-on: ubuntu-latest
    steps:
      - name: Check out source
        uses: actions/checkout@v7

      - name: Set up Node
        uses: actions/setup-node@v7
        with:
          node-version: '24'
          package-manager-cache: false

      - name: Install from lockfile
        run: npm ci --ignore-scripts

      - name: Check source
        run: npm run check

      - name: Run tests
        run: npm test

      - name: Build portfolio
        run: npm run build

      - name: Prepare Sankey Studio
        run: |
          node applications/sankey-diagram/scripts/check.mjs
          node --test applications/sankey-diagram/tests/*.test.mjs
          node applications/sankey-diagram/scripts/build.mjs --output dist/applications/sankey-diagram

      - name: Prepare Math in Motion
        run: |
          node --test applications/math-in-motion/tests/*.test.mjs
          node applications/math-in-motion/tools/build.mjs --output dist/applications/math-in-motion

      - name: Upload website
        uses: actions/upload-pages-artifact@v4
        with:
          path: dist

  deploy:
    name: Deploy to GitHub Pages
    needs: verify
    runs-on: ubuntu-latest
    permissions:
      pages: write
      id-token: write
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - name: Configure Pages
        uses: actions/configure-pages@v5

      - name: Publish website
        id: deployment
        uses: actions/deploy-pages@v4
```
