import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';
import { createStandaloneApp, validateApplications } from '../scripts/applications.mjs';
const ROOT = fileURLToPath(new URL('../', import.meta.url));

test('standalone registration preserves source and refuses overwrites or path traversal', async (t) => {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), 'sankey-registration-'));
  t.after(() => fs.rm(root, { recursive: true, force: true }));
  const app = path.join(root, 'applications/example');
  await fs.mkdir(path.join(app, 'src'), { recursive: true });
  await fs.mkdir(path.join(app, 'assets'), { recursive: true });
  await fs.mkdir(path.join(app, 'docs'), { recursive: true });
  for (const file of ['index.html', 'README.md', 'docs/case-study.md', 'sw.js']) await fs.writeFile(path.join(app, file), 'ORIGINAL');
  await createStandaloneApp({ root, category: 'visualisation', id: 'example', name: 'Example', register: true });
  assert.equal(await fs.readFile(path.join(app, 'index.html'), 'utf8'), 'ORIGINAL');
  assert.deepEqual(await validateApplications(root), []);
  await assert.rejects(() => createStandaloneApp({ root, category: 'visualisation', id: 'example', register: true }), /already registered/);
  await assert.rejects(() => createStandaloneApp({ root, category: 'visualisation', id: '../escape' }), /slugs/);
  const metadata = JSON.parse(await fs.readFile(path.join(app, 'app.json'), 'utf8'));
  metadata.publicFiles.push('../../private');
  await fs.writeFile(path.join(app, 'app.json'), JSON.stringify(metadata));
  assert.ok((await validateApplications(root)).some((e) => e.includes('allowlist')));
});
test('offline manifest covers every source runtime dependency and stays app-relative', async () => {
  const base = path.join(ROOT, 'applications/sankey-diagram');
  const source = await fs.readFile(path.join(base, 'sw.js'), 'utf8');
  const listeners = new Map();
  const context = vm.createContext({
    self: { addEventListener: (name, fn) => listeners.set(name, fn) },
    URL, Request, Response, location: { origin: 'https://example.test' },
  });
  vm.runInContext(source, context);
  const files = vm.runInContext('PRECACHE', context);
  for (const relative of files) {
    assert.ok(relative.startsWith('./') && !relative.includes('..'));
    if (relative === './') continue;
    assert.ok((await fs.stat(path.join(base, relative))).isFile(), relative);
  }
  for (const file of ['app.js', 'styles.css', 'model.js', 'layout.js', 'render.js', 'export.js', 'samples.js', 'pwa.js'])
    assert.ok(files.includes('./src/' + file), file);
});
test('activating the app worker preserves caches owned by other applications', async () => {
  const source = await fs.readFile(path.join(ROOT, 'applications/sankey-diagram/sw.js'), 'utf8');
  const listeners = new Map(), removed = [];
  let waited;
  vm.runInNewContext(source, {
    self: {
      addEventListener: (name, fn) => listeners.set(name, fn),
      clients: { claim: async () => {} },
    },
    caches: {
      keys: async () => ['noorullah-sankey-diagram-old', 'noorullah-sankey-diagram-source-1.0.0', 'noorullah-build-lab-001-other', 'other-app-cache'],
      delete: async (key) => removed.push(key),
    },
  });
  listeners.get('activate')({ waitUntil: (promise) => { waited = promise; } });
  await waited;
  assert.deepEqual(removed, ['noorullah-sankey-diagram-old']);
});
