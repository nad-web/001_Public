import fs from "node:fs/promises";
import path from "node:path";
import { ROOT, SLUG, exists, htmlEscape, isMain } from "./lib.mjs";
export async function createApp({
  root = ROOT,
  id,
  name,
  category = "other",
} = {}) {
  if (!SLUG.test(id || "") || id.length > 60)
    throw new Error(
      "Use a lowercase hyphenated folder name, up to 60 characters.",
    );
  if (typeof name !== "string" || !name.trim() || name.length > 100)
    throw new Error("Choose an application name up to 100 characters.");
  if (!SLUG.test(category)) throw new Error("Use a lowercase category.");
  const destination = path.join(root, "applications", id);
  if (await exists(destination))
    throw new Error("An application already uses this folder.");
  await fs.mkdir(destination, { recursive: true });
  try {
    const template = path.join(root, "templates/static-app");
    for (const name of await fs.readdir(template))
      await fs.cp(path.join(template, name), path.join(destination, name), {
        recursive: true,
        errorOnExist: true,
        force: false,
      });
    for (const file of ["index.html", "README.md", "src/app.js"]) {
      const target = path.join(destination, file);
      await fs.writeFile(
        target,
        (await fs.readFile(target, "utf8"))
          .replaceAll("{{APP_ID}}", id)
          .replaceAll(
            "{{APP_NAME}}",
            file.endsWith(".html") ? htmlEscape(name) : name,
          ),
      );
    }
    await fs.writeFile(
      path.join(destination, "app.json"),
      JSON.stringify(
        {
          id,
          name,
          category,
          summary: "An independent browser application.",
          version: "0.1.0",
          offline: true,
          status: "prototype",
        },
        null,
        2,
      ),
    );
    await fs.writeFile(
      path.join(destination, "manifest.webmanifest"),
      JSON.stringify(
        {
          id: "./",
          name,
          short_name: name.slice(0, 24),
          start_url: "./",
          scope: "./",
          display: "standalone",
          theme_color: "#146d64",
          background_color: "#f4f5f1",
          icons: [
            {
              src: "./assets/icon-192.png",
              sizes: "192x192",
              type: "image/png",
            },
            {
              src: "./assets/icon-512.png",
              sizes: "512x512",
              type: "image/png",
            },
          ],
        },
        null,
        2,
      ),
    );
    return destination;
  } catch (error) {
    await fs.rm(destination, { recursive: true, force: true });
    throw error;
  }
}
if (isMain(import.meta.url)) {
  const [id, ...words] = process.argv.slice(2);
  console.log(
    await createApp({
      id,
      name:
        words.join(" ") ||
        id
          ?.split("-")
          .map((x) => x[0].toUpperCase() + x.slice(1))
          .join(" "),
    }),
  );
}
