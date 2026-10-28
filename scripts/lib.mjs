import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const ROOT = fileURLToPath(new URL('../', import.meta.url));
export const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
export const STAGES = new Set(['planned', 'prototype', 'ready']);
export const PUBLIC_NAMES = new Set(['index.html', 'src', 'assets', 'data']);
export const GITHUB_USER = /^[A-Za-z0-9](?:[A-Za-z0-9-]{0,37}[A-Za-z0-9])?$/;
const SKIP = new Set(['.git', 'node_modules', 'dist', 'coverage', 'test-results', 'playwright-report']);

export const readJSON = async file => JSON.parse(await fs.readFile(file, 'utf8'));
export const exists = async file => fs.access(file).then(() => true, () => false);
export const isMain = url => process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(url);
export const htmlEscape = text => text.replace(/[&<>"']/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[c]));

export async function filesUnder(directory) {
  const files = [];
  for (const entry of await fs.readdir(directory, { withFileTypes: true })) {
    if (SKIP.has(entry.name)) continue;
    const full = path.join(directory, entry.name);
    if (entry.isSymbolicLink()) throw new Error(`Symbolic links are not allowed in source assets: ${full}`);
    if (entry.isDirectory()) files.push(...await filesUnder(full));
    else if (entry.isFile()) files.push(full);
  }
  return files;
}

export async function validateRepository(root = ROOT) {
  const errors = [];
  const requireValue = (condition, message) => { if (!condition) errors.push(message); };
  let apps, categories, config;
  try {
    [apps, categories, config] = await Promise.all([
      readJSON(path.join(root, 'Vibcoding/catalogue.json')),
      readJSON(path.join(root, 'Vibcoding/categories.json')),
      readJSON(path.join(root, 'portfolio.json'))
    ]);
  } catch (error) { return [`Invalid repository JSON: ${error.message}`]; }
  if (!Array.isArray(apps) || !Array.isArray(categories)) return ['Catalogue and categories must be arrays.'];
  requireValue(typeof config.ownerName === 'string' && config.ownerName.trim().length > 0, 'portfolio.json: ownerName is required.');
  requireValue(config.githubUsername === '' || GITHUB_USER.test(config.githubUsername || ''), 'portfolio.json: invalid GitHub username.');
  requireValue(/^[A-Za-z0-9._-]+$/.test(config.repository || '') && !['.', '..'].includes(config.repository), 'portfolio.json: invalid repository name.');
  const categoryIds = new Set();
  for (const c of categories) {
    if (!c || typeof c !== 'object') { errors.push('Invalid category.'); continue; }
    requireValue(typeof c.id === 'string' && SLUG.test(c.id), `Invalid category id: ${c.id}`);
    requireValue(!categoryIds.has(c.id), `Duplicate category: ${c.id}`);
    categoryIds.add(c.id);
    requireValue(['mint','peach','blue','lavender','yellow'].includes(c.color), `Invalid category color: ${c.id}`);
    for (const key of ['name','icon','description']) requireValue(typeof c[key] === 'string' && c[key].trim().length > 0, `Category ${c.id}: ${key} is required.`);
    if (SLUG.test(c.id || '')) requireValue(await exists(path.join(root, 'Vibcoding', c.id, 'README.md')), `Missing category README: ${c.id}`);
  }
  const appIds = new Set();
  for (const app of apps) {
    if (!app || typeof app !== 'object') { errors.push('Invalid app entry.'); continue; }
    const validId = typeof app.id === 'string' && SLUG.test(app.id);
    const validCategory = typeof app.category === 'string' && SLUG.test(app.category) && categoryIds.has(app.category);
    requireValue(validId, `Invalid app id: ${app.id}`);
    requireValue(!appIds.has(app.id), `Duplicate app id: ${app.id}`);
    appIds.add(app.id);
    requireValue(validCategory, `Unknown category for ${app.id}: ${app.category}`);
    requireValue(STAGES.has(app.status), `Invalid status for ${app.id}: ${app.status}`);
    for (const key of ['name','summary']) requireValue(typeof app[key] === 'string' && app[key].trim().length > 0, `${app.id}: ${key} is required.`);
    requireValue(Array.isArray(app.skills) && app.skills.length > 0 && app.skills.every(s => typeof s === 'string' && s.trim()), `${app.id}: skills must be nonempty strings.`);
    requireValue(app.brief && ['problem','audience'].every(k => typeof app.brief[k] === 'string' && app.brief[k].trim()) && Array.isArray(app.brief.features) && app.brief.features.length > 0 && app.brief.features.every(f => typeof f === 'string' && f.trim()), `${app.id}: a complete concept brief is required.`);
    if (!validId || !validCategory) continue;
    const appRoot = path.join(root, 'Vibcoding', app.category, app.id);
    if (app.status === 'planned') {
      requireValue(!(await exists(appRoot)), `${app.id}: folder exists but catalogue still says planned. Set prototype when work starts.`);
      continue;
    }
    if (!STAGES.has(app.status)) continue;
    try {
      const manifest = await readJSON(path.join(appRoot, 'app.json'));
      for (const key of ['id','category','status','name']) requireValue(manifest[key] === app[key], `${app.id}: app.json ${key} differs from catalogue.`);
      requireValue(manifest.entry === 'index.html', `${app.id}: entry must be index.html.`);
      requireValue(Array.isArray(manifest.publicFiles) && manifest.publicFiles.includes('index.html') && manifest.publicFiles.every(p => PUBLIC_NAMES.has(p)), `${app.id}: publicFiles may contain only index.html, src, assets, data.`);
      for (const item of manifest.publicFiles || []) {
        if (PUBLIC_NAMES.has(item)) requireValue(await exists(path.join(appRoot, item)), `${app.id}: missing public path ${item}`);
      }
      for (const item of ['README.md','src','assets','docs/case-study.md','index.html']) requireValue(await exists(path.join(appRoot,item)), `${app.id}: missing ${item}`);
      if (app.status === 'ready') {
        requireValue(typeof manifest.releasedOn === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(manifest.releasedOn), `${app.id}: ready apps require releasedOn (YYYY-MM-DD).`);
        requireValue(typeof manifest.version === 'string' && /^\d+\.\d+\.\d+$/.test(manifest.version), `${app.id}: ready apps require a semantic version.`);
        requireValue(typeof manifest.screenshot === 'string' && /^assets\/[a-zA-Z0-9_/-]+\.(png|jpg|webp)$/.test(manifest.screenshot), `${app.id}: ready apps require an assets/ screenshot path.`);
        if (typeof manifest.screenshot === 'string' && /^assets\/[a-zA-Z0-9_/-]+\.(png|jpg|webp)$/.test(manifest.screenshot)) requireValue(await exists(path.join(appRoot,manifest.screenshot)), `${app.id}: screenshot is missing.`);
      }
    } catch (error) { errors.push(`${app.id}: ${error.message}`); }
  }
  // Catch an unregistered app so it cannot silently disappear from the build.
  for (const id of categoryIds) {
    if (!SLUG.test(id || '')) continue;
    const directory = path.join(root,'Vibcoding',id);
    if (!(await exists(directory))) continue;
    for (const entry of await fs.readdir(directory,{withFileTypes:true})) {
      if (entry.isDirectory() && !(apps.some(app => app.category === id && app.id === entry.name))) errors.push(`Unregistered app folder: ${id}/${entry.name}`);
    }
  }
  return errors;
}

export async function validateLinks(directory) {
  const errors = [];
  for (const file of await filesUnder(directory)) {
    const ext = path.extname(file);
    if (!['.html','.css','.js','.mjs'].includes(ext)) continue;
    const source = await fs.readFile(file, 'utf8');
    const refs = ext === '.html' ? [...source.matchAll(/(?:href|src)\s*=\s*["']([^"']+)["']/g)].map(m=>m[1])
      : ext === '.css' ? [...source.matchAll(/url\(\s*["']?([^)'"\s]+)["']?\s*\)/g)].map(m=>m[1])
      : [...source.matchAll(/(?:from\s*|import\s*)["'](\.[^"']+)["']/g)].map(m=>m[1]);
    for (const ref of refs) {
      if (!ref || /^(?:[a-z][a-z0-9+.-]*:|\/\/|#)/i.test(ref)) continue;
      if (ref.startsWith('/')) { errors.push(`${path.relative(directory,file)}: use a relative URL instead of ${ref}`); continue; }
      const clean = decodeURIComponent(ref.split(/[?#]/)[0]);
      if (!clean) continue;
      let target = path.resolve(path.dirname(file), clean);
      const relative = path.relative(directory,target);
      if (relative === '..' || relative.startsWith(`..${path.sep}`)) { errors.push(`${path.relative(directory,file)}: link escapes site: ${ref}`); continue; }
      if (await exists(target) && (await fs.stat(target)).isDirectory()) target = path.join(target, 'index.html');
      if (!(await exists(target))) errors.push(`${path.relative(directory,file)}: missing ${ref}`);
    }
  }
  return errors;
}
