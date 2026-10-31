import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import vm from 'node:vm';
import {createHash} from 'node:crypto';
import {releaseAssets} from '../scripts/update-cache.mjs';
import {CUES} from '../assets/audio/cues.js';
import {CARDS} from '../src/cards.js';
const root=new URL('../',import.meta.url);

async function worker({fail='',existing={}}={}){
 const listeners={},map=new Map(),deleted=[];
 const makeCache=()=>({items:new Map(),async put(k,r){this.items.set(k,await r.clone().arrayBuffer());},async match(k){const b=this.items.get(k);return b?new Response(b,{headers:{'Content-Type':k.endsWith('.mp3')?'audio/mpeg':'text/plain'}}):undefined;}});
 const caches={async open(k){if(!map.has(k))map.set(k,makeCache());return map.get(k);},async keys(){return [...map.keys(),...Object.keys(existing)];},async delete(k){deleted.push(k);return map.delete(k);}};
 const self={registration:{scope:'https://example.com/001_Public/MemoryGame/'},clients:{async claim(){}},addEventListener(n,f){listeners[n]=f;},skipWaiting(){}};
 const context=vm.createContext({self,caches,Response,Request,Headers,URL,Set,console,fetch:async request=>{if(request.url.includes(fail)&&fail)throw Error('offline');return new Response('sample '+request.url);}});
 vm.runInContext(await fs.readFile(new URL('sw.js',root),'utf8'),context);
 async function event(name,data={}){let promise;listeners[name]({...data,waitUntil(p){promise=p;},respondWith(p){promise=p;}});return promise?await promise:undefined;}
 return {context,event,caches,map,deleted};
}
test('offline manifest contains all bundled runtime assets and current content hash',async()=>{
 const files=await releaseAssets();const source=await fs.readFile(new URL('sw.js',root),'utf8');const digest=createHash('sha256');
 for(const file of files){digest.update(file);digest.update(await fs.readFile(new URL(file,root)));assert.ok(source.includes(JSON.stringify(file)),`Uncached runtime asset: ${file}`);}
 assert.ok(source.includes(digest.digest('hex').slice(0,14)),'Run the cache generator after changes');
 assert.ok(files.includes('assets/audio/persian.mp3'));assert.ok(files.includes('assets/fonts/Vazirmatn.woff2'));assert.ok(files.includes('assets/images/hainburg-hero.jpg'));assert.ok(files.every(p=>!p.startsWith('/')&&!p.startsWith('http')));
});
test('service worker installs all assets, verifies completeness, and isolates other app caches',async()=>{
 const w=await worker({existing:{'another-game-v1':true,'hainburg-fa:https://other.com/:old':true,'hainburg-fa:https://example.com/001_Public/MemoryGame/:old':true}});await w.event('install');await w.event('activate');
 assert.deepEqual(w.deleted,['hainburg-fa:https://example.com/001_Public/MemoryGame/:old']);let result;await w.event('message',{data:{type:'CHECK_OFFLINE'},ports:[{postMessage(x){result=x;}}]});assert.equal(result.ready,true);assert.equal(result.missing,0);
 const cached=[...w.map.values()][0];cached.items.delete([...cached.items.keys()][0]);await w.event('message',{data:{type:'CHECK_OFFLINE'},ports:[{postMessage(x){result=x;}}]});assert.equal(result.ready,false);
 await w.event('message',{data:{type:'REPAIR_OFFLINE'},ports:[{postMessage(x){result=x;}}]});assert.equal(result.ready,true);
});
test('a failed precache is rejected and cleaned up without replacing other releases',async()=>{
 const w=await worker({fail:'persian.mp3'});await assert.rejects(w.event('install'));assert.equal(w.map.size,0);
});
test('offline navigation works at the nested repository path and ignores unrelated URLs',async()=>{
 const w=await worker();await w.event('install');
 const response=await w.event('fetch',{request:{url:'https://example.com/001_Public/MemoryGame/?homescreen=1',method:'GET',mode:'navigate',headers:new Headers()}});assert.equal(response.status,200);assert.match(await response.text(),/index.html/);
 assert.equal(await w.event('fetch',{request:new Request('https://example.com/001_Public/other-app/')}),undefined);
 assert.equal(await w.event('fetch',{request:new Request('https://other.com/001_Public/MemoryGame/')}),undefined);
});
test('Safari audio byte ranges return correct partial responses from the offline cache',async()=>{
 const w=await worker();await w.event('install');const url='https://example.com/001_Public/MemoryGame/assets/audio/persian.mp3';
 const response=await w.event('fetch',{request:new Request(url,{headers:{Range:'bytes=2-9'}})});assert.equal(response.status,206);assert.equal(response.headers.get('Content-Length'),'8');assert.equal(response.headers.get('Content-Type'),'audio/mpeg');assert.equal((await response.arrayBuffer()).byteLength,8);
 for(const [range,status,length]of [['bytes=-5',206,5],['bytes=0-0',206,1],['bytes=999999-',416,0],['bytes=-0',416,0],['bytes=9-2',416,0],['bytes=1-2,4-5',416,0]]){
  const r=await w.event('fetch',{request:new Request(url,{headers:{Range:range}})});assert.equal(r.status,status,range);assert.equal((await r.arrayBuffer()).byteLength,length,range);
 }
});
test('every native card and all ten developer messages have local non-overlapping audio',async()=>{
 const lines=JSON.parse(await fs.readFile(new URL('assets/audio/transcripts.json',root),'utf8')).lines;
 for(const c of CARDS)assert.ok(CUES[c.key],`Missing voice: ${c.key}`);for(let i=1;i<=10;i++)assert.ok(CUES[`level:${i}`]);
 let end=0;for(const [key,cue]of Object.entries(CUES)){assert.ok(cue.start>=end&&cue.end>cue.start,key);assert.match(lines[key],/[\u0600-\u06ff]/);assert.ok(!/[A-Za-z]/.test(lines[key]));end=cue.end;}
 assert.ok((await fs.stat(new URL('assets/audio/persian.mp3',root))).size>100000);
});
test('PWA metadata is native, relative, standalone and includes actual iPhone icons',async()=>{
 const m=JSON.parse(await fs.readFile(new URL('manifest.webmanifest',root),'utf8'));assert.equal(m.lang,'fa-AF');assert.equal(m.dir,'rtl');assert.equal(m.start_url,'./');assert.equal(m.scope,'./');assert.equal(m.display,'standalone');assert.ok(!/[A-Za-z]/.test(m.name));
 for(const icon of m.icons)assert.ok((await fs.stat(new URL(icon.src,root))).size>0);
});
