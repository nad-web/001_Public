import path from 'node:path';
import fs from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import { APP_ROOT, validateApp } from './files.mjs';
const errors = [];
try {
  const result = await validateApp();
  errors.push(...result.errors);
  for (const name of [...result.files, ...await fs.readdir(path.join(APP_ROOT, 'scripts')).then((names) => names.map((n) => 'scripts/' + n))]) {
    if (!/\.(?:mjs|js)$/.test(name)) continue;
    const checked = spawnSync(process.execPath, ['--check', path.join(APP_ROOT, name)], { encoding: 'utf8' });
    if (checked.status !== 0) errors.push(name + ': ' + checked.stderr);
  }
} catch (error) { errors.push(error.message); }
if (errors.length) { console.error(errors.join('\n')); process.exitCode = 1; }
else console.log('Sankey Studio: syntax, app-relative dependencies, manifest and runtime files verified.');
