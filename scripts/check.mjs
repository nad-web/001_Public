import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { ROOT, filesUnder, validateRepository, validateLinks } from './lib.mjs';

const errors = await validateRepository();
try {
  for (const file of await filesUnder(ROOT)) {
    if (!/\.(?:js|mjs)$/.test(file)) continue;
    const result = spawnSync(process.execPath, ['--check', file], {
      encoding: 'utf8',
    });
    if (result.status !== 0)
      errors.push(
        `${path.relative(ROOT, file)}: ${result.stderr || result.error?.message}`,
      );
  }
  errors.push(...(await validateLinks(ROOT)));
} catch (error) {
  errors.push(error.message);
}
if (errors.length) {
  console.error(errors.map((error) => `✗ ${error}`).join('\n'));
  process.exitCode = 1;
} else
  console.log(
    '✓ Catalogue, app manifests, JavaScript syntax, and local static links are valid.',
  );
