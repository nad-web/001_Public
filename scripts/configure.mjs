import fs from 'node:fs/promises';
import path from 'node:path';
import { ROOT, readJSON, GITHUB_USER } from './lib.mjs';

const [username, ...owner] = process.argv.slice(2);
if (!GITHUB_USER.test(username || '')) {
  console.error(
    'Usage: npm run configure -- YOUR_GITHUB_USERNAME ["Your Display Name"]',
  );
  process.exitCode = 1;
} else {
  const file = path.join(ROOT, 'portfolio.json');
  const config = await readJSON(file);
  config.githubUsername = username;
  if (owner.length) config.ownerName = owner.join(' ').trim();
  await fs.writeFile(file, JSON.stringify(config, null, 2) + '\n');
  console.log(
    `✓ Repository links configured for https://github.com/${username}/${config.repository}`,
  );
  console.log(
    'This only edits local configuration; it does not create or publish a GitHub repository.',
  );
}
