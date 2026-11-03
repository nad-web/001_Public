import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
export const APP_ROOT = fileURLToPath(new URL('../', import.meta.url));
export const isMain = (url) => process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(url);
const isWithin = (root, target) => {
  const relative = path.relative(root, target);
  return relative !== '..' && !relative.startsWith('..' + path.sep) && !path.isAbsolute(relative);
};
export async function runtimeFiles(root = APP_ROOT) {
  const files = [];
  async function collect(relative) {
    const full = path.join(root, relative), stat = await fs.lstat(full);
    if (stat.isSymbolicLink()) throw new Error('Symbolic links are not permitted in runtime files: ' + relative);
    if (stat.isDirectory()) {
      for (const entry of await fs.readdir(full)) await collect(path.join(relative, entry));
    } else {
      if (relative.split(path.sep).some((part) => part.startsWith('.')) || /\.(?:env|key|pem)$/i.test(relative))
        throw new Error('Hidden or credential files cannot be published: ' + relative);
      if (relative.endsWith('.md')) return;
      files.push(relative.split(path.sep).join('/'));
    }
  }
  for (const entry of ['index.html', 'manifest.webmanifest', 'sw.js', 'src', 'assets']) await collect(entry);
  return files.sort();
}
export async function validateReferences(root, files) {
  const errors = [];
  const published = new Set(files);
  for (const relative of files) {
    const extension = path.extname(relative);
    if (!['.html', '.css', '.js', '.mjs'].includes(extension)) continue;
    const source = await fs.readFile(path.join(root, relative), 'utf8');
    const refs = extension === '.html'
      ? [...source.matchAll(/(?:href|src)\s*=\s*["']([^"']+)["']/g)].map((m) => m[1])
      : extension === '.css'
        ? [...source.matchAll(/url\(\s*["']?([^)'"\s]+)["']?\s*\)/g)].map((m) => m[1])
        : [...source.matchAll(/(?:from\s*|import\s*)["'](\.[^"']+)["']/g)].map((m) => m[1]);
    for (const ref of refs) {
      if (!ref || ref.startsWith('#') || /^(?:blob:|data:)/i.test(ref)) continue;
      if (/^(?:https?:|\/\/)/i.test(ref)) { errors.push(relative + ': runtime URLs must be hosted with this app: ' + ref); continue; }
      if (ref.startsWith('/')) { errors.push(relative + ': use an app-relative path: ' + ref); continue; }
      let clean;
      try { clean = decodeURIComponent(ref.split(/[?#]/)[0]); } catch { errors.push(relative + ': invalid URL encoding.'); continue; }
      if (!clean) continue;
      let full = path.resolve(root, path.dirname(relative), clean);
      if (!isWithin(path.resolve(root), full)) { errors.push(relative + ': reference escapes the application folder: ' + ref); continue; }
      if (clean.endsWith('/')) full = path.join(full, 'index.html');
      const target = path.relative(root, full).split(path.sep).join('/');
      if (!published.has(target)) errors.push(relative + ': missing runtime file: ' + ref);
    }
  }
  return errors;
}
export async function validateApp(root = APP_ROOT) {
  const files = await runtimeFiles(root);
  const errors = await validateReferences(root, files);
  const manifest = JSON.parse(await fs.readFile(path.join(root, 'manifest.webmanifest'), 'utf8'));
  for (const key of ['id', 'start_url', 'scope']) if (manifest[key] !== './') errors.push('manifest.webmanifest: ' + key + ' must be ./');
  for (const icon of manifest.icons || []) if (!files.includes(icon.src.replace(/^\.\//, ''))) errors.push('Missing PWA icon: ' + icon.src);
  const metadata = JSON.parse(await fs.readFile(path.join(root, 'app.json'), 'utf8'));
  if (metadata.id !== 'sankey-diagram' || metadata.entry !== 'index.html') errors.push('Invalid Sankey Studio app metadata.');
  return { files, errors };
}
export async function compiledWorker(root, files) {
  const original = await fs.readFile(path.join(root, 'sw.js'), 'utf8');
  const template = original
    .replace(/const CACHE_REVISION = '[^']*';/, "const CACHE_REVISION = 'SOURCE';")
    .replace(/const PRECACHE = \[[\s\S]*?\];/, 'const PRECACHE = [];');
  const hash = createHash('sha256').update(template);
  for (const relative of files.filter((name) => name !== 'sw.js')) {
    hash.update(relative);
    hash.update(await fs.readFile(path.join(root, relative)));
  }
  const revision = hash.digest('hex').slice(0, 16);
  const precache = ['./', ...files.filter((name) => name !== 'sw.js').map((name) => './' + name.split('/').map(encodeURIComponent).join('/'))];
  return template
    .replace("const CACHE_REVISION = 'SOURCE';", "const CACHE_REVISION = '" + revision + "';")
    .replace('const PRECACHE = [];', 'const PRECACHE = ' + JSON.stringify(precache, null, 2) + ';');
}
