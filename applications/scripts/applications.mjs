import fs from 'node:fs/promises';
import path from 'node:path';
const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const PUBLIC = new Set(['index.html', 'src', 'assets', 'data', 'manifest.webmanifest', 'sw.js']);
const exists = (p) => fs.access(p).then(() => true, () => false);
export async function readApplications(root) {
  const file = path.join(root, 'applications/catalogue.json');
  if (!await exists(file)) return [];
  const apps = JSON.parse(await fs.readFile(file, 'utf8'));
  if (!Array.isArray(apps)) throw new Error('applications/catalogue.json must be an array.');
  return apps;
}
export async function validateApplications(root) {
  const errors = [], ids = new Set();
  let apps;
  try { apps = await readApplications(root); } catch (error) { return [error.message]; }
  for (const app of apps) {
    if (!app || !SLUG.test(app.id || '') || ids.has(app.id)) { errors.push('Applications: invalid or duplicate app ID.'); continue; }
    ids.add(app.id);
    if (!SLUG.test(app.category || '') || !['planned', 'prototype', 'ready'].includes(app.status) || typeof app.name !== 'string' || !app.name.trim() || typeof app.summary !== 'string' || !app.summary.trim()) errors.push(app.id + ': invalid catalogue record.');
    if (app.status === 'planned') continue;
    const directory = path.join(root, 'applications', app.id);
    try {
      const metadata = JSON.parse(await fs.readFile(path.join(directory, 'app.json'), 'utf8'));
      for (const key of ['id', 'name', 'category', 'status']) if (metadata[key] !== app[key]) errors.push(app.id + ': app.json ' + key + ' differs from catalogue.');
      if (metadata.entry !== 'index.html') errors.push(app.id + ': entry must be index.html.');
      if (!Array.isArray(metadata.publicFiles) || !metadata.publicFiles.includes('index.html') || metadata.publicFiles.some((entry) => !PUBLIC.has(entry))) errors.push(app.id + ': invalid runtime allowlist.');
      for (const entry of [...(metadata.publicFiles || []).filter((p) => PUBLIC.has(p)), 'README.md', 'docs/case-study.md'])
        if (!await exists(path.join(directory, entry))) errors.push(app.id + ': missing ' + entry);
      if (app.status === 'ready' && (!/^\d+\.\d+\.\d+$/.test(metadata.version || '') || !/^\d{4}-\d{2}-\d{2}$/.test(metadata.releasedOn || '') || metadata.validation !== 'docs/case-study.md'))
        errors.push(app.id + ': ready apps need a version, release date and validation evidence.');
    } catch (error) { errors.push(app.id + ': ' + error.message); }
  }
  return errors;
}
export async function createStandaloneApp({ root, category, id, name, register = false }) {
  if (!SLUG.test(id || '') || id.length > 60 || !SLUG.test(category || '')) throw new Error('Use lowercase hyphenated app and category slugs.');
  const file = path.join(root, 'applications/catalogue.json');
  const apps = await readApplications(root);
  if (apps.some((a) => a.id === id)) throw new Error('App is already registered. Nothing was overwritten.');
  const directory = path.join(root, 'applications', id);
  if (register) {
    if (!await exists(path.join(directory, 'index.html'))) throw new Error('Registration requires an existing index.html.');
    if (await exists(path.join(directory, 'app.json'))) throw new Error('app.json already exists. Nothing was overwritten.');
  } else if (await exists(directory)) throw new Error('App folder already exists. Use --register to register existing source.');
  const title = (name || id).trim();
  if (!title || title.length > 100 || /[\r\n]/.test(title)) throw new Error('App title must be 1–100 characters on one line.');
  const publicFiles = ['index.html', 'src', 'assets'];
  if (register) {
    for (const entry of ['manifest.webmanifest', 'sw.js', 'data']) if (await exists(path.join(directory, entry))) publicFiles.push(entry);
  } else {
    await fs.mkdir(path.join(directory, 'src'), { recursive: true });
    await fs.mkdir(path.join(directory, 'assets'), { recursive: true });
    await fs.mkdir(path.join(directory, 'docs'), { recursive: true });
    const escaped = title.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
    await fs.writeFile(path.join(directory, 'index.html'), '<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>' + escaped + '</title><main><a href="../">App library</a><h1>' + escaped + '</h1><p>Prototype · developed by Noorullah Adel. Implement the intended behaviour before release.</p></main></html>\n');
    await fs.copyFile(path.join(root, 'assets/brand/mark.svg'), path.join(directory, 'assets/logo.svg'));
    await fs.writeFile(path.join(directory, 'README.md'), '# ' + title + '\n\nStage: prototype. Define the problem, features and acceptance criteria before implementation.\n');
    await fs.writeFile(path.join(directory, 'docs/case-study.md'), '# ' + title + ' validation\n\nNo behavioural checks have been completed yet.\n');
  }
  const metadata = { id, name: title, category, status: 'prototype', version: '0.1.0', entry: 'index.html', publicFiles, releasedOn: null, validation: 'docs/case-study.md' };
  await fs.writeFile(path.join(directory, 'app.json'), JSON.stringify(metadata, null, 2) + '\n', { flag: 'wx' });
  apps.push({ id, name: title, category, status: 'prototype', summary: title + ' — an application developed by Noorullah Adel.' });
  await fs.mkdir(path.dirname(file), { recursive: true });
  await fs.writeFile(file, JSON.stringify(apps, null, 2) + '\n');
  return directory;
}
