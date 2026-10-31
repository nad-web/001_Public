// Generated release worker. Edit this template, then run scripts/update-cache.mjs.
// Classic worker + imported synchronous range helper support Safari versions
// that do not yet support module service workers.
const REVISION='__REVISION__';
const FILES=__FILES__;
const SCOPE=self.registration.scope;
const PREFIX=`hainburg-fa:${SCOPE}:`;
const CACHE=PREFIX+REVISION;
const urls=FILES.map(path=>new URL(path,SCOPE).href);
const allowed=new Set(urls);

self.addEventListener('install',event=>{
 event.waitUntil((async()=>{
  const cache=await caches.open(CACHE);
  // A failed installation never replaces the current complete release.
  try{for(const url of urls){const response=await fetch(new Request(url,{cache:'reload'}));if(!response.ok)throw new Error('Missing offline asset');await cache.put(url,response);}}
  catch(error){await caches.delete(CACHE);throw error;}
 })());
});
self.addEventListener('activate',event=>event.waitUntil((async()=>{
 for(const key of await caches.keys())if(key.startsWith(PREFIX)&&key!==CACHE)await caches.delete(key);
 await self.clients.claim();
})()));

function byteRange(header,length){
 const match=/^bytes=(\d*)-(\d*)$/.exec(header||'');if(!match||(!match[1]&&!match[2])||length<=0)return null;
 let start,end;
 if(!match[1]){const suffix=Number(match[2]);if(!Number.isSafeInteger(suffix)||suffix<=0)return null;start=Math.max(0,length-suffix);end=length-1;}
 else{start=Number(match[1]);end=match[2]?Math.min(Number(match[2]),length-1):length-1;}
 if(!Number.isSafeInteger(start)||!Number.isSafeInteger(end)||start<0||start>=length||end<start)return null;
 return {start,end};
}
async function ranged(response,header){
 const data=await response.arrayBuffer(),length=data.byteLength,range=byteRange(header,length);
 if(!range)return new Response(null,{status:416,headers:{'Content-Range':`bytes */${length}`}});
 const headers=new Headers(response.headers);headers.set('Content-Range',`bytes ${range.start}-${range.end}/${length}`);headers.set('Content-Length',String(range.end-range.start+1));headers.set('Accept-Ranges','bytes');headers.delete('Content-Encoding');
 return new Response(data.slice(range.start,range.end+1),{status:206,headers});
}
self.addEventListener('fetch',event=>{
 const request=event.request;if(request.method!=='GET')return;
 const url=new URL(request.url);if(url.origin!==new URL(SCOPE).origin||!url.href.startsWith(SCOPE))return;
 url.search='';url.hash='';
 let key=url.href;
 if(request.mode==='navigate'&&(url.pathname===new URL(SCOPE).pathname||url.pathname===new URL('index.html',SCOPE).pathname))key=new URL('index.html',SCOPE).href;
 if(!allowed.has(key))return;
 event.respondWith((async()=>{
  const cache=await caches.open(CACHE);let response=await cache.match(key);
  if(!response){try{response=await fetch(new Request(key,{cache:'reload'}));if(response.ok)await cache.put(key,response.clone());}catch{return new Response('فایل آفلاین در دسترس نیست. یک بار با اینترنت باز کنید.',{status:503,headers:{'Content-Type':'text/plain; charset=utf-8'}});}}
  if(request.headers.has('Range')&&response.status===200)return ranged(response,request.headers.get('Range'));
  return response;
 })());
});
self.addEventListener('message',event=>{
 if(event.data?.type==='ACTIVATE_UPDATE'){self.skipWaiting();return;}
 if(['CHECK_OFFLINE','REPAIR_OFFLINE'].includes(event.data?.type))event.waitUntil((async()=>{
  const cache=await caches.open(CACHE);let missing=0;
  for(const url of urls){
   if(await cache.match(url))continue;
   if(event.data.type==='REPAIR_OFFLINE')try{const response=await fetch(new Request(url,{cache:'reload'}));if(response.ok){await cache.put(url,response);continue;}}catch{/* Report missing assets rather than claiming offline readiness. */}
   missing++;
  }
  event.ports[0]?.postMessage({ready:missing===0,missing,revision:REVISION});
 })());
});
