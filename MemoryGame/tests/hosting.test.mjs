import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import http from 'node:http';
import {releaseAssets} from '../scripts/update-cache.mjs';

test('standalone runtime and every asset reference resolve under /001_Public/MemoryGame/',async()=>{
 const root=new URL('../',import.meta.url),prefix='/001_Public/MemoryGame/';
 const files=await releaseAssets(),allowed=new Set([...files,'sw.js']);
 const types={html:'text/html; charset=utf-8',js:'text/javascript',css:'text/css',mp3:'audio/mpeg',webmanifest:'application/manifest+json',png:'image/png',jpg:'image/jpeg',svg:'image/svg+xml',woff2:'font/woff2'};
 const server=http.createServer(async(request,response)=>{
  const path=new URL(request.url,'http://localhost').pathname;
  if(!path.startsWith(prefix)){response.writeHead(404).end();return;}
  const file=path.slice(prefix.length)||'index.html';
  if(!allowed.has(file)){response.writeHead(404).end();return;}
  try{const data=await fs.readFile(new URL(file,root));response.writeHead(200,{'Content-Type':types[file.split('.').pop()]||'application/octet-stream'}).end(data);}
  catch{response.writeHead(404).end();}
 });
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 const base=`http://127.0.0.1:${server.address().port}${prefix}`;
 try{
  const html=await (await fetch(base)).text();assert.match(html,/lang="fa-AF" dir="rtl"/);
  const checked=new Set();
  async function verify(reference,parent){
   const url=new URL(reference,parent);if(!url.href.startsWith(base))throw new Error(`Reference escapes game folder: ${reference}`);
   url.hash='';if(checked.has(url.href))return;checked.add(url.href);
   const response=await fetch(url);assert.equal(response.status,200,url.href);assert.ok((await response.arrayBuffer()).byteLength>0,url.href);
  }
  for(const file of files)await verify(file,base);
  for(const file of files.filter(f=>/\.(html|js|css)$/.test(f))){
   const source=await fs.readFile(new URL(file,root),'utf8');
   const regex=file.endsWith('.html')?/(?:href|src)\s*=\s*["']([^"']+)["']/g:file.endsWith('.css')?/url\(\s*["']?([^)'"\s]+)["']?\s*\)/g:/(?:from\s*|import\s*)["'](\.[^"']+)["']/g;
   for(const match of source.matchAll(regex)){const reference=match[1];if(!/^(?:https?:|#)/.test(reference))await verify(reference,new URL(file,base));}
  }
  const manifest=JSON.parse(await fs.readFile(new URL('manifest.webmanifest',root),'utf8'));
  assert.equal(new URL(manifest.start_url,base).href,base);assert.equal(new URL(manifest.scope,base).href,base);
  for(const icon of manifest.icons)await verify(icon.src,base);
  assert.equal(new URL('../sw.js',new URL('src/pwa.js',base)).pathname,prefix+'sw.js');
  assert.equal((await fetch(base+'tests/game.test.mjs')).status,404);
 }finally{await new Promise(resolve=>server.close(resolve));}
});
