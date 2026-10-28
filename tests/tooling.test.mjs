import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { ROOT, readJSON, exists, validateRepository } from '../scripts/lib.mjs';
import { createApp } from '../scripts/create-app.mjs';
import { buildRepository } from '../scripts/build.mjs';
import { createStaticServer } from '../scripts/serve.mjs';

const fixtureCategories = [
  {
    id: 'languages',
    name: 'Languages',
    icon: 'language',
    color: 'lavender',
    description: 'Language test category.',
  },
  {
    id: 'finances',
    name: 'Finance',
    icon: 'wallet',
    color: 'mint',
    description: 'Finance test category.',
  },
  {
    id: 'fun',
    name: 'Fun',
    icon: 'spark',
    color: 'peach',
    description: 'Fun test category.',
  },
];
const fixtureApps = [
  { id: 'deutsch-daily', name: 'Deutsch Daily', category: 'languages' },
  { id: 'pocket-budget', name: 'Pocket Budget', category: 'finances' },
  { id: 'memory-lab', name: 'Memory Lab', category: 'fun' },
].map((app) => ({
  ...app,
  summary: 'A controlled test concept.',
  status: 'planned',
  skills: ['Testing'],
  brief: {
    problem: 'Test a meaningful tooling behavior.',
    audience: 'Repository developers.',
    features: ['Exercise the relevant workflow.'],
  },
}));

async function fixture(t) {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), '001-public-test-'));
  t.after(() => fs.rm(root, { recursive: true, force: true }));
  // Fixtures own their registry and app directories, so real app releases and
  // new ideas never invalidate the generator's regression tests.
  await fs.cp(ROOT, root, {
    recursive: true,
    filter: (source) => {
      const parts = path.relative(ROOT, source).split(path.sep);
      if (parts.some((part) => ['.git', 'node_modules', 'dist'].includes(part)))
        return false;
      if (
        parts[0] === 'Vibcoding' &&
        parts.length > 1 &&
        !['index.html', 'src', 'shared', '_templates'].includes(parts[1])
      )
        return false;
      return true;
    },
  });
  await fs.writeFile(
    path.join(root, 'Vibcoding/catalogue.json'),
    JSON.stringify(fixtureApps),
  );
  await fs.writeFile(
    path.join(root, 'Vibcoding/categories.json'),
    JSON.stringify(fixtureCategories),
  );
  for (const category of fixtureCategories) {
    const directory = path.join(root, 'Vibcoding', category.id);
    await fs.mkdir(directory, { recursive: true });
    await fs.writeFile(
      path.join(directory, 'README.md'),
      `# ${category.name}\n`,
    );
  }
  return root;
}
async function editCatalogue(root, change) {
  const file = path.join(root, 'Vibcoding/catalogue.json');
  const apps = await readJSON(file);
  change(apps);
  await fs.writeFile(file, JSON.stringify(apps));
}

test('foundation registry is consistent', async () => {
  assert.deepEqual(await validateRepository(), []);
});

test('duplicate IDs, unknown categories, and stages are rejected', async (t) => {
  const root = await fixture(t);
  await editCatalogue(root, (apps) => {
    apps[1].id = apps[0].id;
    apps[1].category = 'missing';
    apps[0].status = 'finished';
  });
  const errors = await validateRepository(root);
  assert.ok(errors.some((e) => e.includes('Duplicate app id')));
  assert.ok(errors.some((e) => e.includes('Unknown category')));
  assert.ok(errors.some((e) => e.includes('Invalid status')));
});

test('generator promotes a planned concept, escapes HTML, and never overwrites', async (t) => {
  const root = await fixture(t);
  const initial = await readJSON(path.join(root, 'Vibcoding/catalogue.json'));
  const target = await createApp({
    root,
    category: 'languages',
    id: 'deutsch-daily',
    name: 'Deutsch <Daily> & Practice',
  });
  const html = await fs.readFile(path.join(target, 'index.html'), 'utf8');
  assert.ok(html.includes('Deutsch &lt;Daily&gt; &amp; Practice'));
  assert.ok(!html.includes('{{APP_'));
  const apps = await readJSON(path.join(root, 'Vibcoding/catalogue.json'));
  assert.equal(apps.length, initial.length);
  assert.equal(apps.find((a) => a.id === 'deutsch-daily').status, 'prototype');
  assert.deepEqual(await validateRepository(root), []);
  await assert.rejects(
    () => createApp({ root, category: 'languages', id: 'deutsch-daily' }),
    /already exists/,
  );
  assert.equal(
    await fs.readFile(path.join(target, 'index.html'), 'utf8'),
    html,
  );
});

test('generator rejects path traversal, unknown categories, and reused IDs', async (t) => {
  const root = await fixture(t);
  await assert.rejects(
    () => createApp({ root, category: 'languages', id: '../../escape' }),
    /slugs/,
  );
  await assert.rejects(
    () => createApp({ root, category: 'unknown', id: 'safe-name' }),
    /Unknown category/,
  );
  await assert.rejects(
    () => createApp({ root, category: 'finances', id: 'deutsch-daily' }),
    /already used/,
  );
});

test('new ideas are registered once and release metadata is required', async (t) => {
  const root = await fixture(t);
  const target = await createApp({
    root,
    category: 'fun',
    id: 'new-example',
    name: 'New Example',
  });
  assert.deepEqual(await validateRepository(root), []);
  const manifest = await readJSON(path.join(target, 'app.json'));
  manifest.status = 'ready';
  await fs.writeFile(path.join(target, 'app.json'), JSON.stringify(manifest));
  await editCatalogue(root, (apps) => {
    apps.find((a) => a.id === 'new-example').status = 'ready';
  });
  const errors = await validateRepository(root);
  assert.ok(errors.some((e) => e.includes('releasedOn')));
  assert.ok(errors.some((e) => e.includes('validation')));
});

test('build includes runtime files and leaves tooling, templates, and app documentation out', async (t) => {
  const root = await fixture(t);
  await createApp({ root, category: 'languages', id: 'deutsch-daily' });
  const output = await buildRepository(root);
  for (const file of [
    'index.html',
    '.nojekyll',
    'Vibcoding/index.html',
    'Vibcoding/catalogue.json',
    'Vibcoding/languages/deutsch-daily/src/app.js',
    'assets/brand/mark.svg',
  ])
    assert.ok(await exists(path.join(output, file)), file);
  for (const file of [
    '.git',
    '.github',
    'docs',
    'scripts',
    'tests',
    'package.json',
    'README.md',
    'Vibcoding/_templates',
    'Vibcoding/shared/README.md',
    'Vibcoding/languages/deutsch-daily/app.json',
    'Vibcoding/languages/deutsch-daily/docs',
    'Vibcoding/languages/deutsch-daily/assets/README.md',
  ])
    assert.equal(await exists(path.join(output, file)), false, file);
});

test('build rejects a broken asset reference before deployment', async (t) => {
  const root = await fixture(t);
  const target = await createApp({ root, category: 'fun', id: 'memory-lab' });
  await fs.appendFile(
    path.join(target, 'index.html'),
    '\n<img src="./assets/missing.png" alt="Missing">',
  );
  await assert.rejects(
    () => buildRepository(root),
    /missing.*assets\/missing.png/,
  );
});

test('symlinks in published assets are rejected', async (t) => {
  const root = await fixture(t);
  await fs.symlink(
    path.join(root, 'portfolio.json'),
    path.join(root, 'assets/leak.json'),
  );
  await assert.rejects(() => buildRepository(root), /Symbolic links/);
});

test('unregistered app folders are caught', async (t) => {
  const root = await fixture(t);
  await fs.mkdir(path.join(root, 'Vibcoding/fun/unregistered'));
  assert.ok(
    (await validateRepository(root)).some((e) =>
      e.includes('Unregistered app folder'),
    ),
  );
});

test('preview serves the repository prefix, redirects directories, and blocks hidden files', async (t) => {
  const root = await fixture(t);
  await fs.writeFile(path.join(root, '.env'), 'PRIVATE_SENTINEL');
  const server = createStaticServer({ root, basePath: '/001_Public/' });
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  t.after(() => new Promise((resolve) => server.close(resolve)));
  const base = `http://127.0.0.1:${server.address().port}`;
  const page = await fetch(`${base}/001_Public/Vibcoding/`);
  assert.equal(page.status, 200);
  assert.equal(
    await page.text(),
    await fs.readFile(path.join(root, 'Vibcoding/index.html'), 'utf8'),
  );
  const json = await fetch(`${base}/001_Public/Vibcoding/catalogue.json`);
  assert.equal(json.status, 200);
  assert.deepEqual(await json.json(), fixtureApps);
  const directory = await fetch(`${base}/001_Public/Vibcoding`, {
    redirect: 'manual',
  });
  assert.equal(directory.status, 301);
  assert.equal(directory.headers.get('location'), '/001_Public/Vibcoding/');
  const hidden = await fetch(`${base}/001_Public/.env`);
  assert.equal(hidden.status, 403);
  assert.ok(!(await hidden.text()).includes('PRIVATE_SENTINEL'));
  assert.equal((await fetch(`${base}/Vibcoding/`)).status, 404);
  const head = await fetch(`${base}/001_Public/assets/brand/mark.svg`, {
    method: 'HEAD',
  });
  assert.equal(head.status, 200);
  assert.equal(await head.text(), '');
  assert.ok(head.headers.get('content-type').startsWith('image/svg+xml'));
});
