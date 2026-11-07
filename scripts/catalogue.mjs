import fs from "node:fs/promises";
import path from "node:path";
import { ROOT, discoverApps, isMain } from "./lib.mjs";
export async function writeReadmes(root = ROOT) {
  const apps = await discoverApps(root);
  const safe = (s) =>
    String(s)
      .replace(/\|/g, "\\|")
      .replace(/[\r\n]/g, " ");
  const table = [
    "| Application | Category | Purpose |",
    "| --- | --- | --- |",
    ...apps.map(
      (a) =>
        `| [${safe(a.name)}](https://nad-web.github.io/public/applications/${a.id}/) | ${safe(a.category)} | ${safe(a.summary)} |`,
    ),
  ].join("\n");
  for (const relative of ["README.md", "applications/README.md"]) {
    const file = path.join(root, relative);
    let text = await fs.readFile(file, "utf8");
    text = text.replace(
      /<!-- APP_CATALOG_START -->[\s\S]*?<!-- APP_CATALOG_END -->/,
      "<!-- APP_CATALOG_START -->\n" + table + "\n<!-- APP_CATALOG_END -->",
    );
    await fs.writeFile(file, text);
  }
}
if (isMain(import.meta.url)) await writeReadmes();
