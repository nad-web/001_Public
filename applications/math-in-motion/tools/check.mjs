import { readFile, open, readdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import assert from 'node:assert/strict';
import catalog from './load-catalog.mjs';

export const APP_ROOT = fileURLToPath(new URL('../',import.meta.url));
export const VARIANTS = ['en-female','en-male','de-female','de-male'];

export async function check() {
  const { lessons, groups, strands, labs, build, mediaGroup } = catalog;
  const seen = new Set(), expected = new Set();
  for (const l of lessons) {
    assert.match(l.id,/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
    assert(!seen.has(l.id),`Duplicate lesson: ${l.id}`);
    seen.add(l.id);
    assert(groups[l.level] && strands[l.strand],`Unknown level or subject: ${l.id}`);
    for (const lang of ['en','de']) {
      for (const key of ['title','formula','explanation','example']) {
        assert(l[lang][key]?.trim(),`Missing ${lang} ${key}: ${l.id}`);
      }
      const drawing = build(l.id,undefined,lang);
      assert(drawing.marks.length && drawing.note,`Empty lab: ${l.id}`);
    }
    for (const tag of VARIANTS) expected.add(path.join(mediaGroup(l.level,tag.slice(0,2)),tag,`${l.id}.mp4`));
  }
  assert.deepEqual(new Set(Object.keys(labs)),seen);
  const actual = await readdir(path.join(APP_ROOT,'media'),{recursive:true,withFileTypes:true});
  const found = new Set();
  for (const file of actual) {
    if (file.isDirectory()) continue;
    const filePath = path.join(file.parentPath,file.name);
    assert(file.isFile(),`Unsupported media entry: ${filePath}`);
    const relative = path.relative(path.join(APP_ROOT,'media'),filePath);
    if (relative==='README.md') continue;
    found.add(relative);
    const handle = await open(filePath,'r');
    try {
      const signature = Buffer.alloc(12);
      const { bytesRead } = await handle.read(signature,0,12,0);
      const stat = await handle.stat();
      assert(bytesRead===12 && signature.toString('ascii',4,8)==='ftyp' && stat.size>8000,
        `Invalid or incomplete MP4: ${filePath}`);
    } finally { await handle.close(); }
  }
  assert.deepEqual(found,expected,'Media files must match all four narrations for each lesson');
  const index = await readFile(path.join(APP_ROOT,'index.html'),'utf8');
  for (const [,relative] of index.matchAll(/(?:src|href)="\.\/([^"]+)"/g))
    assert((await readFile(path.join(APP_ROOT,relative))).length,`Empty asset: ${relative}`);
  return { lessons: lessons.length, videos: expected.size };
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  const counts = await check();
  console.log(`Math in Motion: ${counts.lessons} bilingual lessons and ${counts.videos} verified MP4 files.`);
}
