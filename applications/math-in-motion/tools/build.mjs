import { cp, mkdir, mkdtemp, readFile, realpath, rename, rm } from 'node:fs/promises';
import path from 'node:path';
import { APP_ROOT, check } from './check.mjs';

const [flag, target, ...rest] = process.argv.slice(2);
if (flag !== '--output' || !target || rest.length || path.basename(path.resolve(target))!=='math-in-motion') {
  throw new Error('Usage: node tools/build.mjs --output <directory>/math-in-motion');
}
const output = path.resolve(target);
const source = await realpath(APP_ROOT);
const parent = path.dirname(output);
if (output===source || output.startsWith(source+path.sep))
  throw new Error('Use an output folder outside the source app.');
const { lessons, videos } = await check();
const { publicFiles } = JSON.parse(await readFile(path.join(APP_ROOT,'app.json'),'utf8'));
await mkdir(parent,{recursive:true});
const realParent = await realpath(parent);
if (realParent===source || realParent.startsWith(source+path.sep) || path.join(realParent,path.basename(output))===source)
  throw new Error('Use an output folder outside the source app.');
const stage = await mkdtemp(path.join(parent,'.math-in-motion-'));
try {
  for (const entry of publicFiles)
    await cp(path.join(APP_ROOT,entry),path.join(stage,entry),{recursive:true,errorOnExist:true});
  await rm(output,{recursive:true,force:true});
  await rename(stage,output);
} finally { await rm(stage,{recursive:true,force:true}); }
console.log(`Prepared Math in Motion: ${lessons} bilingual lessons, ${videos} videos → ${output}`);
