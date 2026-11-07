import fs from "node:fs/promises";
import path from "node:path";
import { ROOT, readJSON } from "./lib.mjs";
for (const app of await readJSON(
  path.join(ROOT, "templates/maintained-apps.json"),
)) {
  for (const name of [
    "shell.js",
    "storage.js",
    "pwa.js",
    "logic.js",
    "styles.css",
  ])
    await fs.copyFile(
      path.join(ROOT, "templates/static-app/src", name),
      path.join(ROOT, "applications", app, "src", name),
    );
}
console.log(
  "Synchronized the local UI kit into twenty apps. Individual app logic was retained.",
);
