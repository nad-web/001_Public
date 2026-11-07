import path from "node:path";
import fs from "node:fs/promises";
import { spawnSync } from "node:child_process";
import { ROOT, discoverApps, filesUnder, exists } from "./lib.mjs";
const apps = await discoverApps();
for (const app of apps) {
  for (const file of (await filesUnder(app.root)).filter((f) =>
    /\.(js|mjs)$/.test(f),
  )) {
    const p = spawnSync(process.execPath, ["--check", file], {
      encoding: "utf8",
    });
    if (p.status !== 0) throw new Error(p.stderr);
  }
  for (const hook of ["scripts/check.mjs", "tools/check.mjs"])
    if (await exists(path.join(app.root, hook))) {
      const p = spawnSync(process.execPath, [path.join(app.root, hook)], {
        stdio: "inherit",
      });
      if (p.status !== 0)
        throw new Error("Application checks failed: " + app.id);
      break;
    }
  if (
    !/name=["']viewport["']/.test(
      await fs.readFile(path.join(app.root, "index.html"), "utf8"),
    )
  )
    throw new Error("Missing viewport: " + app.id);
}
console.log(`Validated ${apps.length} independent applications.`);
