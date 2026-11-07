import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import vm from 'node:vm';
import { APP_ROOT, runtimeFiles, validateApp, validateReferences, compiledWorker } from '../scripts/files.mjs';
import { buildApp, prepareSource } from '../scripts/build.mjs';
import { createStaticServer } from '../scripts/serve.mjs';

async function fixture(t) {
  const parent = await fs.mkdtemp(path.join(os.tmpdir(), 'sankey-only-'));
  const root = path.join(parent, 'sankey-diagram');
  t.after(() => fs.rm(parent, { recursive: true, force: true }));
  await fs.cp(APP_ROOT, root, {
    recursive: true,
    filter: (source) => !path.relative(APP_ROOT, source).split(path.sep).some((p) => ['dist', 'node_modules'].includes(p)),
  });
  return root;
}
function workerContext(source, overrides = {}) {
  const listeners = new Map();
  const context = vm.createContext({
    self: {
      registration: { scope: 'https://example.test/001_Public/applications/sankey-diagram/' },
      addEventListener: (name, callback) => listeners.set(name, callback),
      clients: { claim: async () => {} },
    },
    location: { origin: 'https://example.test' }, URL, Response,
    ...overrides,
  });
  vm.runInContext(source, context);
  return { listeners, context };
}
test('the app validates after copying only its folder with no parent resources', async (t) => {
  const root = await fixture(t), result = await validateApp(root);
  assert.deepEqual(result.errors, []);
  assert.ok(result.files.includes('src/vendor/LICENSE'));
  const parentFiles = await fs.readdir(path.dirname(root));
  assert.deepEqual(parentFiles, ['sankey-diagram']);
});
test('escaping, missing and external runtime references are rejected', async (t) => {
  const root = await fixture(t);
  await fs.appendFile(path.join(root, 'index.html'), '\n<link href="../outside.css"><img src="./assets/missing.png"><script src="https://example.test/script.js"></script>');
  const { errors } = await validateApp(root);
  assert.ok(errors.some((e) => e.includes('escapes')));
  assert.ok(errors.some((e) => e.includes('missing runtime')));
  assert.ok(errors.some((e) => e.includes('hosted with this app')));
});
test('build publishes runtime only and leaves source, tests and documentation intact', async (t) => {
  const root = await fixture(t), source = await fs.readFile(path.join(root, 'index.html'), 'utf8');
  const output = await buildApp({ root });
  const files = await runtimeFiles(output), errors = await validateReferences(output, files);
  assert.deepEqual(errors, []);
  assert.ok(files.includes('src/app.js'));
  assert.equal(await fs.readFile(path.join(root, 'index.html'), 'utf8'), source);
  for (const name of ['docs', 'tests', 'scripts', 'README.md', 'package.json']) {
    await assert.rejects(() => fs.access(path.join(output, name)));
    await fs.access(path.join(root, name));
  }
});
test('build guards prevent overwriting source folders', async (t) => {
  const root = await fixture(t);
  await assert.rejects(() => buildApp({ root, output: root }), /cannot replace/);
  await assert.rejects(() => buildApp({ root, output: path.join(root, 'src') }), /dist folder/);
  await assert.rejects(() => buildApp({ root, output: path.dirname(root) }), /cannot replace/);
  await fs.access(path.join(root, 'src/app.js'));
});
test('app cache revision changes with runtime files and ignores documentation-only changes', async (t) => {
  const root = await fixture(t), files = await runtimeFiles(root);
  const first = await compiledWorker(root, files);
  await fs.appendFile(path.join(root, 'README.md'), '\nA documentation correction.\n');
  assert.equal(await compiledWorker(root, files), first);
  await fs.appendFile(path.join(root, 'src/styles.css'), '\n/* updated runtime */\n');
  assert.notEqual(await compiledWorker(root, files), first);
  await prepareSource(root);
  const once = await fs.readFile(path.join(root, 'sw.js'), 'utf8');
  await prepareSource(root);
  assert.equal(await fs.readFile(path.join(root, 'sw.js'), 'utf8'), once);
});
test('the prepared worker contains every runtime file at app-relative URLs', async () => {
  const files = await runtimeFiles(), source = await compiledWorker(APP_ROOT, files);
  const { context } = workerContext(source);
  const precache = vm.runInContext('PRECACHE', context);
  assert.match(source, /const CACHE_REVISION = '[0-9a-f]{16}';/);
  for (const name of files.filter((file) => file !== 'sw.js')) assert.ok(precache.includes('./' + name), name);
  assert.ok(precache.every((url) => url.startsWith('./') && !url.includes('..')));
  assert.ok(!precache.some((url) => /README|tests\/|scripts\//.test(url)));
});
test('activation deletes only outdated Sankey caches', async () => {
  const source = await fs.readFile(path.join(APP_ROOT, 'sw.js'), 'utf8');
  const removed = [];
  let cacheName;
  const { listeners, context } = workerContext(source, {
    caches: {
      keys: async () => ['noorullah-sankey-diagram-outdated', cacheName, 'unrelated-cache'],
      delete: async (key) => { removed.push(key); },
    },
  });
  cacheName = vm.runInContext('CACHE_NAME', context);
  let waited;
  listeners.get('activate')({ waitUntil: (promise) => { waited = promise; } });
  await waited;
  assert.deepEqual(removed, ['noorullah-sankey-diagram-outdated']);
});
test('offline navigation returns the cached app and requests outside its scope are untouched', async () => {
  const source = await fs.readFile(path.join(APP_ROOT, 'sw.js'), 'utf8');
  const fallback = new Response('<h1>Sankey Studio</h1>', { headers: { 'content-type': 'text/html' } });
  const { listeners } = workerContext(source, {
    caches: { open: async () => ({ match: async (request) => request === './index.html' ? fallback : undefined }) },
    fetch: async () => { throw new Error('Offline'); },
  });
  let result;
  listeners.get('fetch')({
    request: { method: 'GET', url: 'https://example.test/001_Public/applications/sankey-diagram/?offline=1', mode: 'navigate' },
    respondWith: (promise) => { result = promise; },
  });
  assert.match(await (await result).text(), /Sankey Studio/);
  let outside = false;
  listeners.get('fetch')({
    request: { method: 'GET', url: 'https://example.test/outside/', mode: 'navigate' },
    respondWith: () => { outside = true; },
  });
  assert.equal(outside, false);
});
test('symlinks cannot add external files to the runtime', async (t) => {
  const root = await fixture(t);
  await fs.symlink(path.join(root, 'README.md'), path.join(root, 'assets/external.txt'));
  await assert.rejects(() => runtimeFiles(root), /Symbolic links/);
});
test('a standalone HTTP server resolves every resource under the exact GitHub Pages path', async (t) => {
  const root = await fixture(t), output = await buildApp({ root });
  const basePath = '/001_Public/applications/sankey-diagram/';
  const server = createStaticServer({ root: output, basePath });
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  t.after(() => new Promise((resolve) => server.close(resolve)));
  const origin = 'http://127.0.0.1:' + server.address().port;
  const page = await fetch(origin + basePath);
  assert.equal(page.status, 200);
  assert.match(await page.text(), /Noorullah Adel/);
  for (const file of await runtimeFiles(output)) {
    const response = await fetch(origin + basePath + file);
    assert.equal(response.status, 200, file);
    assert.ok((await response.arrayBuffer()).byteLength > 0, file);
  }
  assert.equal((await fetch(origin + '/src/app.js')).status, 404);
});
