import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import os from "node:os";
import vm from "node:vm";
import { createHash } from "node:crypto";
import { ROOT, discoverApps, readJSON, exists } from "../scripts/lib.mjs";
import { buildRepository } from "../scripts/build.mjs";
import { createApp } from "../scripts/create-app.mjs";
import { createStaticServer } from "../scripts/serve.mjs";
import { createStore } from "../templates/static-app/src/storage.js";
import { formatJSON } from "../applications/json-workbench/src/json-tools.js";
async function fixture(t) {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), "noorullah-apps-"));
  t.after(() => fs.rm(root, { recursive: true, force: true }));
  for (const dir of ["applications", "assets"])
    await fs.mkdir(path.join(root, dir));
  for (const file of ["index.html", "applications/index.html", "sw.js"])
    await fs.writeFile(
      path.join(root, file),
      file.endsWith("html") ? "<title>Library</title>" : "",
    );
  for (const file of ["README.md", "applications/README.md"])
    await fs.writeFile(
      path.join(root, file),
      "<!-- APP_CATALOG_START -->\n<!-- APP_CATALOG_END -->",
    );
  return root;
}
test("canonical folders are unique and every protected Sankey source byte matches the upload", async () => {
  const apps = await discoverApps();
  assert.equal(new Set(apps.map((a) => a.id)).size, apps.length);
  assert(apps.some((a) => a.id === "sankey-diagram"));
  const root = path.join(ROOT, "applications/sankey-diagram"),
    actual = {};
  async function walk(dir) {
    for (const e of await fs.readdir(dir, { withFileTypes: true })) {
      const p = path.join(dir, e.name);
      if (e.isDirectory()) await walk(p);
      else
        actual[path.relative(root, p).split(path.sep).join("/")] = createHash(
          "sha256",
        )
          .update(await fs.readFile(p))
          .digest("hex");
    }
  }
  await walk(root);
  assert.deepEqual(
    actual,
    await readJSON(path.join(ROOT, "tests/fixtures/sankey-sha256.json")),
  );
});
test("a future index-only app is published and linked without editing the workflow", async (t) => {
  const root = await fixture(t),
    app = path.join(root, "applications/future-tool");
  await fs.mkdir(app);
  await fs.writeFile(
    path.join(app, "index.html"),
    '<title>Future Tool</title><script src="./app.js"></script>',
  );
  await fs.writeFile(path.join(app, "app.js"), 'console.log("future");');
  await fs.writeFile(path.join(app, "secret.env"), "excluded");
  await buildRepository(root);
  assert(await exists(path.join(root, "dist/applications/future-tool/app.js")));
  assert(
    !(await exists(
      path.join(root, "dist/applications/future-tool/secret.env"),
    )),
  );
  assert.match(
    await fs.readFile(path.join(root, "README.md"), "utf8"),
    /applications\/future-tool\//,
  );
  await fs.writeFile(
    path.join(app, "index.html"),
    '<script src="../../assets/shared.js"></script>',
  );
  await fs.writeFile(path.join(root, "assets/shared.js"), "");
  await assert.rejects(() => buildRepository(root), /Escaping reference/);
});
test("generated app is self-contained, escaped and rejects collisions or traversal", async (t) => {
  const root = await fixture(t);
  await fs.cp(path.join(ROOT, "templates"), path.join(root, "templates"), {
    recursive: true,
  });
  const app = await createApp({
    root,
    id: "sample-tool",
    name: "Sample <tool>",
  });
  assert.match(
    await fs.readFile(path.join(app, "index.html"), "utf8"),
    /Sample &lt;tool&gt;/,
  );
  assert(await exists(path.join(app, "src/storage.js")));
  await assert.rejects(
    () => createApp({ root, id: "sample-tool", name: "Collision" }),
    /already/,
  );
  await assert.rejects(
    () => createApp({ root, id: "../escape", name: "Escape" }),
    /lowercase/,
  );
  await buildRepository(root);
  const manifest = await readJSON(
    path.join(root, "dist/applications/sample-tool/offline-manifest.json"),
  );
  assert(manifest.files.includes("./src/app.js"));
  assert.match(
    await fs.readFile(
      path.join(root, "dist/applications/sample-tool/sw.js"),
      "utf8",
    ),
    new RegExp(manifest.revision),
  );
});
test("JSON formatting preserves large numeric spellings and duplicate members while enforcing grammar", () => {
  assert.equal(
    formatJSON('{"n":9007199254740993,"n":1e+09}', 0),
    '{"n":9007199254740993,"n":1e+09}',
  );
  assert.match(formatJSON("[1.2300,-0,2E-10]"), /1\.2300/);
  for (const text of [
    "[1,]",
    '{"a":1,}',
    "01",
    "true false",
    '{"a" 2}',
    '"bad\nline"',
  ])
    assert.throws(() => formatJSON(text));
  assert.throws(
    () => formatJSON("[".repeat(152) + "0" + "]".repeat(152)),
    /Nesting/,
  );
});
test("compatible local records prevent stale-tab overwrites and survive unavailable storage", () => {
  const data = new Map([
      ["noorullah-lab:demo:v1", JSON.stringify({ version: 1, data: ["old"] })],
    ]),
    platform = {
      localStorage: {
        getItem: (k) => data.get(k) || null,
        setItem: (k, v) => data.set(k, v),
        removeItem: (k) => data.delete(k),
      },
    };
  const a = createStore("demo", [], Array.isArray, { platform }),
    b = createStore("demo", [], Array.isArray, { platform });
  assert.deepEqual(a.get(), ["old"]);
  a.set([...a.get(), "new"]);
  assert.throws(() => b.set(["stale"]), /another tab/);
  assert.deepEqual(JSON.parse(data.get("noorullah-lab:demo:v1")).data, [
    "old",
    "new",
  ]);
  const warnings = [],
    denied = createStore("blocked", [], Array.isArray, {
      platform: {
        get localStorage() {
          throw new Error("denied");
        },
      },
      onWarning: (x) => warnings.push(x),
    });
  denied.set(["keep for export"]);
  assert.deepEqual(denied.get(), ["keep for export"]);
  assert(warnings.some((x) => x.includes("visit")));
});
test("preview handles project prefixes, folder redirects, video MIME and normal/suffix/invalid ranges", async (t) => {
  const root = await fixture(t);
  await fs.writeFile(path.join(root, "video.mp4"), "0123456789");
  const server = createStaticServer({ root, basePath: "/001_Public/" });
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  t.after(() => new Promise((resolve) => server.close(resolve)));
  const base = `http://127.0.0.1:${server.address().port}/001_Public/`;
  const range = await fetch(base + "video.mp4", {
    headers: { Range: "bytes=0-1" },
  });
  assert.equal(range.status, 206);
  assert.equal(range.headers.get("Content-Type"), "video/mp4");
  assert.equal(await range.text(), "01");
  assert.equal(
    await (
      await fetch(base + "video.mp4", { headers: { Range: "bytes=-3" } })
    ).text(),
    "789",
  );
  assert.equal(
    (await fetch(base + "video.mp4", { headers: { Range: "bytes=90-100" } }))
      .status,
    416,
  );
  assert.equal((await fetch(base + ".git/config")).status, 403);
});
test("compiled offline worker starts without network and preserves other app and saved-video caches", async () => {
  const scope = "https://example.test/001_Public/applications/demo/",
    prefix = "noorullah-app:/001_Public/applications/demo/:",
    events = new Map(),
    stores = new Map();
  function cache(name) {
    if (!stores.has(name)) stores.set(name, new Map());
    const data = stores.get(name);
    return {
      match: async (request) =>
        data.get(typeof request === "string" ? request : request.url)?.clone(),
      put: async (k, r) => data.set(k, r.clone()),
      addAll: async (urls) => {
        for (const url of urls) data.set(url, new Response("core"));
      },
    };
  }
  const caches = {
    open: async (name) => cache(name),
    keys: async () => [...stores.keys()],
    delete: async (name) => stores.delete(name),
  };
  await cache("other-app").put("keep", new Response("keep"));
  await cache(prefix + "old").put("old", new Response("old"));
  await cache(prefix + "videos").put(
    scope + "clip.mp4",
    new Response("0123456789"),
  );
  const context = vm.createContext({
    URL,
    Request,
    Response,
    Headers,
    caches,
    fetch: async () => {
      throw new Error("Network unavailable");
    },
    self: {
      registration: { scope, active: null },
      clients: { claim: async () => {} },
      skipWaiting: async () => {},
      addEventListener: (type, fn) => events.set(type, fn),
    },
  });
  vm.runInContext(
    (
      await fs.readFile(path.join(ROOT, "templates/static-app/sw.js"), "utf8")
    ).replace(
      "const EMBEDDED_MANIFEST = null;",
      "const EMBEDDED_MANIFEST = " +
        JSON.stringify({ revision: "new", files: ["./index.html"] }) +
        ";",
    ),
    context,
  );
  let pending;
  events.get("install")({ waitUntil: (p) => (pending = p) });
  await pending;
  events.get("activate")({ waitUntil: (p) => (pending = p) });
  await pending;
  assert(stores.has("other-app"));
  assert(!stores.has(prefix + "old"));
  assert(stores.has(prefix + "videos"));
  let response;
  events.get("fetch")({
    request: new Request(scope + "clip.mp4", {
      headers: { Range: "bytes=0-1" },
    }),
    respondWith: (p) => (response = p),
  });
  const result = await response;
  assert.equal(result.status, 206);
  assert.equal(await result.text(), "01");
});
