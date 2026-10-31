import fs from 'node:fs/promises';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import {
  ROOT,
  readJSON,
  filesUnder,
  isMain,
  validateRepository,
  validateLinks,
} from './lib.mjs';

export async function buildRepository(root = ROOT) {
  const errors = await validateRepository(root);
  if (errors.length) throw new Error(errors.join('\n'));
  const output = path.join(root, 'dist');
  await fs.rm(output, { recursive: true, force: true });
  await fs.mkdir(output, { recursive: true });
  const copyPublic = async (relative) => {
    const source = path.join(root, relative);
    const stat = await fs.lstat(source);
    if (stat.isSymbolicLink())
      throw new Error(`Cannot publish a symbolic link: ${relative}`);
    const files = stat.isDirectory() ? await filesUnder(source) : [source];
    for (const file of files) {
      const name = path.relative(root, file);
      if (
        name.split(path.sep).some((part) => part.startsWith('.')) ||
        /\.(?:pem|key|env)$/i.test(file)
      )
        throw new Error(`Cannot publish hidden or credential files: ${name}`);
      if (path.extname(file) === '.md') continue;
      const destination = path.join(output, name);
      await fs.mkdir(path.dirname(destination), { recursive: true });
      await fs.copyFile(file, destination);
    }
  };
  for (const relative of [
    'index.html',
    'portfolio.json',
    'manifest.webmanifest',
    'assets',
    'Vibcoding/index.html',
    'Vibcoding/src',
    'Vibcoding/shared',
    'Vibcoding/categories.json',
    'Vibcoding/catalogue.json',
  ])
    await copyPublic(relative);
  const apps = await readJSON(path.join(root, 'Vibcoding/catalogue.json'));
  for (const app of apps.filter((app) => app.status !== 'planned')) {
    const base = `Vibcoding/${app.category}/${app.id}`;
    const manifest = await readJSON(path.join(root, base, 'app.json'));
    for (const entry of manifest.publicFiles)
      await copyPublic(`${base}/${entry}`);
  }
  // Publish the standalone Dari/Farsi game at the owner's requested path.
  for (const entry of ['index.html', 'offline.html', 'manifest.webmanifest', 'sw.js', 'src', 'assets'])
    await copyPublic(`MemoryGame/${entry}`);
  // Mark built HTML so raw-source dev previews do not request a nonexistent worker.
  for (const file of await filesUnder(output)) {
    if (file.endsWith('.html')) {
      const html = await fs.readFile(file, 'utf8');
      await fs.writeFile(
        file,
        html.replace(
          '</head>',
          '<meta name="lab-build" content="1.0.0"></head>',
        ),
      );
    }
  }
  const publicFiles = (await filesUnder(output)).sort();
  const digest = createHash('sha256');
  for (const file of publicFiles) {
    digest.update(path.relative(output, file));
    digest.update(await fs.readFile(file));
  }
  const revision = digest.digest('hex').slice(0, 16);
  const precache = publicFiles.map(
    (file) =>
      './' +
      path
        .relative(output, file)
        .split(path.sep)
        .map(encodeURIComponent)
        .join('/'),
  );
  const worker = (await fs.readFile(path.join(root, 'sw.template.js'), 'utf8'))
    .replace('__CACHE_KEY__', `noorullah-build-lab-001-${revision}`)
    .replace('__PRECACHE__', JSON.stringify(precache));
  await fs.writeFile(path.join(output, 'sw.js'), worker);
  await fs.writeFile(path.join(output, '.nojekyll'), '');
  const linkErrors = await validateLinks(output);
  if (linkErrors.length)
    throw new Error(`Built-site links failed:\n${linkErrors.join('\n')}`);
  return output;
}

if (isMain(import.meta.url)) {
  try {
    // Run the self-contained game's tests in the existing Pages build step.
    const testDirectory = path.join(ROOT, 'MemoryGame', 'tests');
    const gameTests = (await fs.readdir(testDirectory))
      .filter((name) => name.endsWith('.test.mjs'))
      .sort()
      .map((name) => path.join(testDirectory, name));
    if (!gameTests.length) throw new Error('MemoryGame tests are missing. Upload the complete game folder.');
    const checked = spawnSync(process.execPath, ['--test', ...gameTests], { cwd: ROOT, stdio: 'inherit' });
    if (checked.error) throw checked.error;
    if (checked.status !== 0) throw new Error('MemoryGame tests failed.');
    console.log(`✓ Built and checked ${await buildRepository()}`);
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
