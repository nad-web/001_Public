import { createHash } from "node:crypto";
import {
  cp,
  mkdir,
  mkdtemp,
  readFile,
  realpath,
  rename,
  rm,
  readdir,
  writeFile,
} from "node:fs/promises";
import path from "node:path";
import { APP_ROOT, check } from "./check.mjs";

const [flag, target, ...rest] = process.argv.slice(2);
if (
  flag !== "--output" ||
  !target ||
  rest.length ||
  path.basename(path.resolve(target)) !== "math-in-motion"
) {
  throw new Error(
    "Usage: node tools/build.mjs --output <directory>/math-in-motion",
  );
}
const output = path.resolve(target);
const source = await realpath(APP_ROOT);
const parent = path.dirname(output);
if (output === source || output.startsWith(source + path.sep))
  throw new Error("Use an output folder outside the source app.");
const { lessons, videos } = await check();
const { publicFiles } = JSON.parse(
  await readFile(path.join(APP_ROOT, "app.json"), "utf8"),
);
await mkdir(parent, { recursive: true });
const realParent = await realpath(parent);
if (
  realParent === source ||
  realParent.startsWith(source + path.sep) ||
  path.join(realParent, path.basename(output)) === source
)
  throw new Error("Use an output folder outside the source app.");
const stage = await mkdtemp(path.join(parent, ".math-in-motion-"));
try {
  for (const entry of publicFiles)
    await cp(path.join(APP_ROOT, entry), path.join(stage, entry), {
      recursive: true,
      errorOnExist: true,
    });
  async function walk(folder) {
    const files = [];
    for (const item of await readdir(folder, { withFileTypes: true })) {
      const file = path.join(folder, item.name);
      if (item.isDirectory()) files.push(...(await walk(file)));
      else if (item.isFile()) files.push(file);
    }
    return files;
  }
  const core = (await walk(stage)).filter(
    (file) =>
      !file.endsWith(".mp4") &&
      !["sw.js", "offline-manifest.json"].includes(path.basename(file)),
  );
  const digest = createHash("sha256");
  for (const file of core) {
    digest.update(path.relative(stage, file));
    digest.update(await readFile(file));
  }
  const manifest = {
    revision: digest.digest("hex").slice(0, 16),
    files: core.map(
      (file) => "./" + path.relative(stage, file).split(path.sep).join("/"),
    ),
  };
  await writeFile(
    path.join(stage, "offline-manifest.json"),
    JSON.stringify(manifest),
  );
  const worker = path.join(stage, "sw.js");
  await writeFile(
    worker,
    (await readFile(worker, "utf8")).replace(
      "const EMBEDDED_MANIFEST = null;",
      "const EMBEDDED_MANIFEST = " + JSON.stringify(manifest) + ";",
    ),
  );
  await rm(output, { recursive: true, force: true });
  await rename(stage, output);
} finally {
  await rm(stage, { recursive: true, force: true });
}
console.log(
  `Prepared Math in Motion: ${lessons} bilingual lessons, ${videos} videos → ${output}`,
);
