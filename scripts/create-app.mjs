import fs from 'node:fs/promises';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import {
  ROOT,
  readJSON,
  exists,
  isMain,
  SLUG,
  htmlEscape,
  filesUnder,
} from './lib.mjs';

export async function createApp({ root = ROOT, category, id, name }) {
  if (!SLUG.test(category || '') || !SLUG.test(id || '') || id.length > 60)
    throw new Error(
      'Use lowercase hyphenated category and app slugs (app slug: at most 60 characters).',
    );
  const categories = await readJSON(
    path.join(root, 'Vibcoding/categories.json'),
  );
  if (!categories.some((c) => c.id === category))
    throw new Error(`Unknown category: ${category}`);
  const catalogueFile = path.join(root, 'Vibcoding/catalogue.json');
  const apps = await readJSON(catalogueFile);
  const original = apps.find((app) => app.id === id);
  if (original && original.category !== category)
    throw new Error(`App id ${id} is already used in ${original.category}.`);
  const target = path.join(root, 'Vibcoding', category, id);
  if (await exists(target))
    throw new Error(
      `App folder already exists: ${category}/${id}. Nothing was overwritten.`,
    );
  if (original && original.status !== 'planned')
    throw new Error(`App ${id} already exists in the catalogue.`);
  const title = (
    name ||
    original?.name ||
    id
      .split('-')
      .map((s) => s[0].toUpperCase() + s.slice(1))
      .join(' ')
  ).trim();
  if (!title || title.length > 100 || /[\r\n]/.test(title))
    throw new Error('App title must be 1–100 characters on one line.');
  const app = original
    ? { ...original, name: title, status: 'prototype' }
    : {
        id,
        name: title,
        category,
        summary:
          'An early prototype. Define the problem and useful first version before release.',
        status: 'prototype',
        skills: ['HTML', 'CSS', 'JavaScript'],
        brief: {
          problem: 'To be defined in the app README.',
          audience: 'To be defined before implementation.',
          features: ['Define and implement the first useful feature.'],
        },
      };
  const template = path.join(root, 'Vibcoding/_templates/static-app');
  const templateFiles = await filesUnder(template);
  // Own the new directory before writing; never merge into an existing app.
  await fs.mkdir(target);
  const temporaryCatalogue = `${catalogueFile}.${randomUUID()}.tmp`;
  try {
    for (const source of templateFiles) {
      const relative = path.relative(template, source);
      if (relative === 'app.json') continue;
      const destination = path.join(target, relative);
      await fs.mkdir(path.dirname(destination), { recursive: true });
      let content = await fs.readFile(source, 'utf8');
      const tokenTitle = relative.endsWith('.html') ? htmlEscape(title) : title;
      content = content
        .replaceAll('{{APP_NAME}}', tokenTitle)
        .replaceAll('{{APP_ID}}', id)
        .replaceAll('{{CATEGORY}}', category);
      await fs.writeFile(destination, content);
    }
    const manifest = {
      id,
      name: title,
      category,
      status: 'prototype',
      version: '0.0.1',
      entry: 'index.html',
      publicFiles: ['index.html', 'src', 'assets'],
      releasedOn: null,
      screenshot: null,
    };
    await fs.writeFile(
      path.join(target, 'app.json'),
      JSON.stringify(manifest, null, 2) + '\n',
    );
    const next = original
      ? apps.map((item) => (item.id === id ? app : item))
      : [...apps, app];
    await fs.writeFile(
      temporaryCatalogue,
      JSON.stringify(next, null, 2) + '\n',
      { flag: 'wx' },
    );
    await fs.rename(temporaryCatalogue, catalogueFile);
    return target;
  } catch (error) {
    await fs.rm(target, { recursive: true, force: true });
    await fs.rm(temporaryCatalogue, { force: true });
    throw error;
  }
}

if (isMain(import.meta.url)) {
  const [category, id, ...title] = process.argv.slice(2);
  try {
    const folder = await createApp({
      category,
      id,
      name: title.join(' ') || undefined,
    });
    console.log(
      `✓ Created ${folder}\nCatalogue stage: prototype. Implement the app before marking it ready.\nRun npm run check, then npm run dev.`,
    );
  } catch (error) {
    console.error(
      `${error.message}\nUsage: npm run create:app -- <category> <app-slug> ["App Name"]`,
    );
    process.exitCode = 1;
  }
}
