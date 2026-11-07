import fs from "node:fs/promises";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { ROOT, discoverApps, exists } from "./lib.mjs";
const files = [];
for (const dir of [
  path.join(ROOT, "tests"),
  ...(await discoverApps()).map((a) => path.join(a.root, "tests")),
])
  if (await exists(dir))
    files.push(
      ...(await fs.readdir(dir))
        .filter((f) => f.endsWith(".test.mjs"))
        .map((f) => path.join(dir, f)),
    );
const p = spawnSync(process.execPath, ["--test", ...files], {
  stdio: "inherit",
});
process.exitCode = p.status ?? 1;
