import fs from "node:fs/promises";
import path from "node:path";
import { createHash } from "node:crypto";
import { pathToFileURL } from "node:url";
import {
  ROOT,
  discoverApps,
  filesUnder,
  exists,
  readJSON,
  validateLinks,
  isMain,
} from "./lib.mjs";
import { writeReadmes } from "./catalogue.mjs";
export async function buildRepository(root = ROOT) {
  const apps = await discoverApps(root),
    output = path.join(root, "dist");
  await fs.rm(output, { recursive: true, force: true });
  await fs.mkdir(output, { recursive: true });
  for (const relative of [
    "index.html",
    "applications/index.html",
    "assets",
    "sw.js",
  ]) {
    await fs.mkdir(path.dirname(path.join(output, relative)), {
      recursive: true,
    });
    await fs.cp(path.join(root, relative), path.join(output, relative), {
      recursive: true,
    });
  }
  await fs.writeFile(path.join(output, ".nojekyll"), "");
  await fs.writeFile(
    path.join(output, "assets/catalog.json"),
    JSON.stringify(
      apps.map(({ root, ...app }) => app),
      null,
      2,
    ),
  );
  for (const app of apps) {
    const dest = path.join(output, "applications", app.id);
    if (app.id === "sankey-diagram") {
      const { buildApp } = await import(
        pathToFileURL(path.join(app.root, "scripts/build.mjs")).href
      );
      await buildApp({ root: app.root, output: dest });
      continue;
    }
    for (const file of await filesUnder(app.root, { runtime: true })) {
      const rel = path.relative(app.root, file);
      if (rel.endsWith(".md") && !/LICENSE|NOTICE|OFL/i.test(rel)) continue;
      const target = path.join(dest, rel);
      await fs.mkdir(path.dirname(target), { recursive: true });
      await fs.copyFile(file, target);
    }
    if (app.offline && (await exists(path.join(dest, "sw.js")))) {
      const files = (await filesUnder(dest)).filter(
        (f) =>
          !f.endsWith(".mp4") &&
          !["sw.js", "offline-manifest.json"].includes(path.basename(f)),
      );
      const hash = createHash("sha256");
      for (const file of files) {
        hash.update(path.relative(dest, file));
        hash.update(await fs.readFile(file));
      }
      const manifest = {
        revision: hash.digest("hex").slice(0, 16),
        files: files.map(
          (f) => "./" + path.relative(dest, f).split(path.sep).join("/"),
        ),
      };
      await fs.writeFile(
        path.join(dest, "offline-manifest.json"),
        JSON.stringify(manifest),
      );
      const worker = path.join(dest, "sw.js");
      await fs.writeFile(
        worker,
        (await fs.readFile(worker, "utf8")).replace(
          "const EMBEDDED_MANIFEST = null;",
          "const EMBEDDED_MANIFEST = " + JSON.stringify(manifest) + ";",
        ),
      );
    }
    const errors = await validateLinks(dest, { allowParentNavigation: true });
    if (errors.length) throw new Error(app.id + ":\n" + errors.join("\n"));
  }
  const redirect = (target) =>
    `<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta http-equiv="refresh" content="0;url=${target}"><title>Application moved</title><a href="${target}">Open application</a><script>location.replace(${JSON.stringify(target)}+location.search+location.hash)</script></html>`;
  for (const [old, slug] of Object.entries(
    await readJSON(path.join(ROOT, "scripts/legacy-routes.json")),
  )) {
    if (!apps.some((a) => a.id === slug)) continue;
    const dest = path.join(output, old);
    await fs.mkdir(dest, { recursive: true });
    await fs.writeFile(
      path.join(dest, "index.html"),
      redirect(
        path
          .relative(dest, path.join(output, "applications", slug))
          .split(path.sep)
          .join("/") + "/",
      ),
    );
  }
  await fs.mkdir(path.join(output, "Vibcoding"), { recursive: true });
  await fs.writeFile(
    path.join(output, "Vibcoding/index.html"),
    redirect("../applications/"),
  );
  // Retire the old game's worker at its exact original URL; the new app has a separate scope.
  if (await exists(path.join(output, "MemoryGame")))
    await fs.copyFile(
      path.join(ROOT, "scripts/retire-memory-worker.js"),
      path.join(output, "MemoryGame/sw.js"),
    );
  const errors = await validateLinks(output);
  if (errors.length) throw new Error(errors.join("\n"));
  await writeReadmes(root);
  return { output, apps: apps.length };
}
if (isMain(import.meta.url)) {
  const result = await buildRepository();
  console.log(`Built ${result.apps} applications at ${result.output}`);
}
