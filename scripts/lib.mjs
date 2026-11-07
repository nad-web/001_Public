import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
export const ROOT = fileURLToPath(new URL("../", import.meta.url));
export const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
export const readJSON = async (file) =>
  JSON.parse(await fs.readFile(file, "utf8"));
export const exists = async (file) =>
  fs.access(file).then(
    () => true,
    () => false,
  );
export const isMain = (url) =>
  process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(url);
export const htmlEscape = (value) =>
  String(value).replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
const excluded = new Set([
  "node_modules",
  "dist",
  "docs",
  "tests",
  "scripts",
  "tools",
  "coverage",
  "test-results",
  "playwright-report",
]);
export async function filesUnder(directory, { runtime = false } = {}) {
  const files = [];
  for (const entry of await fs.readdir(directory, { withFileTypes: true })) {
    if (entry.name.startsWith(".") || excluded.has(entry.name)) continue;
    const file = path.join(directory, entry.name);
    if (entry.isSymbolicLink())
      throw new Error("Symbolic links are unsupported: " + file);
    if (entry.isDirectory())
      files.push(...(await filesUnder(file, { runtime })));
    else if (
      entry.isFile() &&
      !(
        runtime &&
        (/\.(?:py|zip|map|onnx|pem|key|env)$/i.test(entry.name) ||
          /^(?:README|AGENTS|package(?:-lock)?)\./i.test(entry.name) ||
          entry.name === "app.json")
      )
    )
      files.push(file);
  }
  return files;
}
export async function discoverApps(root = ROOT) {
  const apps = [];
  for (const folder of await fs.readdir(path.join(root, "applications"), {
    withFileTypes: true,
  })) {
    if (folder.name.startsWith("_") || folder.name.startsWith(".")) continue;
    if (folder.isSymbolicLink())
      throw new Error("Application symlinks are unsupported");
    if (!folder.isDirectory()) continue;
    if (!SLUG.test(folder.name))
      throw new Error(
        "Use a lowercase hyphenated application folder: " + folder.name,
      );
    const appRoot = path.join(root, "applications", folder.name);
    if (!(await exists(path.join(appRoot, "index.html"))))
      throw new Error("Missing index.html: " + folder.name);
    const meta = (await exists(path.join(appRoot, "app.json")))
      ? await readJSON(path.join(appRoot, "app.json"))
      : {};
    if (meta.id && meta.id !== folder.name)
      throw new Error("app.json id must match folder: " + folder.name);
    for (const field of ["name", "summary", "category", "version"]) {
      if (meta[field] !== undefined && typeof meta[field] !== "string")
        throw new Error("Invalid app.json " + field + ": " + folder.name);
    }
    if (meta.category && !SLUG.test(meta.category))
      throw new Error("Invalid category: " + folder.name);
    if (meta.offline !== undefined && typeof meta.offline !== "boolean")
      throw new Error("offline must be true or false: " + folder.name);
    const html = await fs.readFile(path.join(appRoot, "index.html"), "utf8");
    const title = html
      .match(/<title[^>]*>([^<]+)<\/title>/i)?.[1]
      ?.split(/[·|]/)[0]
      .trim();
    apps.push({
      id: folder.name,
      name: meta.name || title || folder.name,
      summary: meta.summary || "Open this independent browser application.",
      category: meta.category || "other",
      version: meta.version || "1.0.0",
      offline: meta.offline === true,
      root: appRoot,
    });
  }
  return apps.sort((a, b) => a.name.localeCompare(b.name, "en"));
}
export async function validateLinks(
  directory,
  { allowParentNavigation = false } = {},
) {
  const errors = [];
  for (const file of await filesUnder(directory)) {
    const content = await fs.readFile(
      file,
      /\.(?:html|css|js|mjs)$/.test(file) ? "utf8" : undefined,
    );
    if (typeof content !== "string") continue;
    const patterns = file.endsWith(".html")
      ? [/\b(?:src|href)=["']([^"'#]+)["']/g]
      : file.endsWith(".css")
        ? [/url\(["']?([^"')]+)["']?\)/g]
        : [/(?:from\s*|import\s*)['"](\.[^'"]+)['"]/g];
    for (const pattern of patterns)
      for (const match of content.matchAll(pattern)) {
        const ref = match[1].split(/[?#]/)[0];
        if (
          !ref ||
          /^(?:https?:|data:|blob:|mailto:|tel:|#)/i.test(ref) ||
          ref.includes("${")
        )
          continue;
        const target = path.resolve(
            path.dirname(file),
            decodeURIComponent(ref),
          ),
          relative = path.relative(directory, target);
        if (relative.startsWith("..") || path.isAbsolute(relative)) {
          if (
            allowParentNavigation &&
            file.endsWith(".html") &&
            match[0].startsWith("href=") &&
            /^\.\.\/?$/.test(ref)
          )
            continue;
          errors.push(
            "Escaping reference in " +
              path.relative(directory, file) +
              ": " +
              ref,
          );
        } else if (!(await exists(target)))
          errors.push(
            "Missing reference in " +
              path.relative(directory, file) +
              ": " +
              ref,
          );
      }
  }
  return errors;
}
