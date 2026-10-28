import fs from 'node:fs/promises';
import path from 'node:path';
import { ROOT, readJSON, filesUnder, isMain, validateRepository, validateLinks } from './lib.mjs';

export async function buildRepository(root = ROOT) {
  const errors = await validateRepository(root);
  if (errors.length) throw new Error(errors.join('\n'));
  const output = path.join(root, 'dist');
  await fs.rm(output, { recursive: true, force: true });
  await fs.mkdir(output, { recursive: true });
  const copyPublic = async relative => {
    const source = path.join(root, relative);
    const stat = await fs.lstat(source);
    if (stat.isSymbolicLink()) throw new Error(`Cannot publish a symbolic link: ${relative}`);
    const files = stat.isDirectory() ? await filesUnder(source) : [source];
    for (const file of files) {
      const name = path.relative(root,file);
      if (name.split(path.sep).some(part=>part.startsWith('.')) || /\.(?:pem|key|env)$/i.test(file)) throw new Error(`Cannot publish hidden or credential files: ${name}`);
      if (path.extname(file) === '.md') continue;
      const destination = path.join(output,name);
      await fs.mkdir(path.dirname(destination),{recursive:true});
      await fs.copyFile(file,destination);
    }
  };
  for (const relative of ['index.html','portfolio.json','assets','Vibcoding/index.html','Vibcoding/src','Vibcoding/shared','Vibcoding/categories.json','Vibcoding/catalogue.json']) await copyPublic(relative);
  const apps = await readJSON(path.join(root,'Vibcoding/catalogue.json'));
  for (const app of apps.filter(app=>app.status !== 'planned')) {
    const base = `Vibcoding/${app.category}/${app.id}`;
    const manifest = await readJSON(path.join(root,base,'app.json'));
    for (const entry of manifest.publicFiles) await copyPublic(`${base}/${entry}`);
  }
  await fs.writeFile(path.join(output,'.nojekyll'),'');
  const linkErrors = await validateLinks(output);
  if (linkErrors.length) throw new Error(`Built-site links failed:\n${linkErrors.join('\n')}`);
  return output;
}

if (isMain(import.meta.url)) {
  try { console.log(`✓ Built and checked ${await buildRepository()}`); }
  catch (error) { console.error(error.message); process.exitCode = 1; }
}
