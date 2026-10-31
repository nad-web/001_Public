import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import {buildRepository} from '../scripts/build.mjs';
import {createStaticServer} from '../scripts/serve.mjs';

test('portfolio deploys the standalone Farsi game and serves local audio at the repository prefix',async()=>{
 const output=await buildRepository();
 for(const file of ['index.html','manifest.webmanifest','sw.js','src/app.js','assets/audio/persian.mp3','assets/audio/cues.js','assets/fonts/Vazirmatn.woff2','assets/icons/apple-touch-icon.png','assets/images/hainburg-hero.jpg'])
  assert.ok((await fs.stat(path.join(output,'Games/MatchMemory',file))).size>0,file);
 const server=createStaticServer({root:output,basePath:'/001_Public/'});await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 try{
  const base=`http://127.0.0.1:${server.address().port}/001_Public/Games/MatchMemory/`;
  const response=await fetch(base);assert.equal(response.status,200);assert.match(await response.text(),/lang="fa-AF" dir="rtl"/);
  const audio=await fetch(base+'assets/audio/persian.mp3');assert.equal(audio.status,200);assert.equal(audio.headers.get('Content-Type'),'audio/mpeg');assert.ok((await audio.arrayBuffer()).byteLength>100000);
  const worker=await fetch(base+'sw.js');assert.equal(worker.status,200);assert.match(await worker.text(),/CHECK_OFFLINE/);
  assert.equal((await fetch(base+'tests/game.test.mjs')).status,404);
 }finally{await new Promise(resolve=>server.close(resolve));}
});
