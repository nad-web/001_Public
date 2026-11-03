import fs from 'node:fs/promises';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import { APP_ROOT, isMain, validateApp, compiledWorker } from './files.mjs';

function checkDestination(root, output) {
  const relative = path.relative(root, output);
  if (!relative || relative === '..' || root.startsWith(output + path.sep)) throw new Error('Build output cannot replace the application source or an ancestor folder.');
  if (!relative.startsWith('..' + path.sep) && !path.isAbsolute(relative)) {
    if (relative.split(path.sep)[0] !== 'dist') throw new Error('Local build output must be inside this application’s dist folder.');
  } else if (!output.endsWith(path.join('dist', 'applications', 'sankey-diagram'))) {
    throw new Error('External output must end with dist/applications/sankey-diagram.');
  }
}
export async function buildApp({ root = APP_ROOT, output = path.join(root, 'dist') } = {}) {
  root = path.resolve(root); output = path.resolve(output);
  checkDestination(root, output);
  const { files, errors } = await validateApp(root);
  if (errors.length) throw new Error(errors.join('\n'));
  const staging = output + '.staging-' + randomUUID();
  await fs.mkdir(staging, { recursive: true });
  try {
    for (const relative of files) {
      const destination = path.join(staging, relative);
      await fs.mkdir(path.dirname(destination), { recursive: true });
      if (relative === 'sw.js') await fs.writeFile(destination, await compiledWorker(root, files));
      else await fs.copyFile(path.join(root, relative), destination);
    }
    await fs.writeFile(path.join(staging, '.nojekyll'), '');
    await fs.rm(output, { recursive: true, force: true });
    await fs.rename(staging, output);
  } catch (error) { await fs.rm(staging, { recursive: true, force: true }); throw error; }
  return output;
}
export async function prepareSource(root = APP_ROOT) {
  const { files, errors } = await validateApp(root);
  if (errors.length) throw new Error(errors.join('\n'));
  await fs.writeFile(path.join(root, 'sw.js'), await compiledWorker(root, files));
}
if (isMain(import.meta.url)) {
  const args = process.argv.slice(2);
  try {
    if (args.length === 1 && args[0] === '--prepare-source') {
      await prepareSource(); console.log('Sankey Studio source offline cache updated.');
    } else {
      if (args.length && (args.length !== 2 || args[0] !== '--output')) throw new Error('Usage: node scripts/build.mjs [--output path | --prepare-source]');
      const output = args.length ? path.resolve(process.cwd(), args[1]) : path.join(APP_ROOT, 'dist');
      console.log('Sankey Studio built: ' + await buildApp({ output }));
    }
  } catch (error) { console.error(error.message); process.exitCode = 1; }
}
