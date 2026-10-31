export async function setupOffline({status,retry,update}){
 let registration;
 const show=(text,again=false)=>{status.textContent=text;retry.hidden=!again;};
 if(!('serviceWorker'in navigator)||!globalThis.isSecureContext){show('ذخیرهٔ آفلاین در این نشانی در دسترس نیست. بازی را از پیوند امن باز کنید.');return;}
 const verify=async(repair=false)=>{
  if(!registration?.active)return;
  const channel=new MessageChannel();
  const timer=setTimeout(()=>{show('آماده‌سازی آفلاین هنوز تأیید نشده است. با اینترنت دوباره بررسی کنید.',true);},10000);
  channel.port1.onmessage=({data})=>{clearTimeout(timer);channel.port1.close();show(data.ready?'آماده برای بازی آفلاین · صدا و تصویرها ذخیره شد':'ذخیرهٔ آفلاین کامل نیست. به اینترنت وصل شوید و دوباره بررسی کنید.',!data.ready);};
  registration.active.postMessage({type:repair?'REPAIR_OFFLINE':'CHECK_OFFLINE'},[channel.port2]);
 };
 retry.addEventListener('click',async()=>{show('در حال بررسی و ذخیرهٔ فایل‌ها…');try{if(!registration?.active){await install();return;}await registration.update();await verify(true);}catch{show('فعلاً کامل نشد. با اینترنت دوباره تلاش کنید.',true);}});
 async function install(){try {
  registration=await navigator.serviceWorker.register(new URL('../sw.js',import.meta.url),{scope:new URL('../',import.meta.url).pathname,updateViaCache:'none'});
  const offerUpdate=()=>{update.hidden=false;};
  if(registration.waiting)offerUpdate();
  registration.addEventListener('updatefound',()=>{const worker=registration.installing;worker?.addEventListener('statechange',()=>{if(worker.state==='installed'&&registration.active)offerUpdate();if(worker.state==='redundant'&&!registration.active)show('ذخیرهٔ همهٔ فایل‌ها کامل نشد. با اینترنت دوباره تلاش کنید.',true);});});
  let reloading=false;
  navigator.serviceWorker.addEventListener('controllerchange',()=>{if(!reloading){if(update.hidden){verify();}else{reloading=true;location.reload();}}});
  // The portfolio's broader worker can resolve navigator.serviceWorker.ready.
  // Wait for this game's registration specifically, including first installation.
  await new Promise((resolve,reject)=>{
   let watched;
   const cleanup=()=>{clearTimeout(timeout);registration.removeEventListener('updatefound',check);watched?.removeEventListener('statechange',check);};
   const check=()=>{
    if(registration.active?.state==='activated'){cleanup();resolve();return;}
    const worker=registration.installing||registration.waiting||registration.active;
    if(worker&&worker!==watched){watched?.removeEventListener('statechange',check);watched=worker;watched.addEventListener('statechange',check);}
    if(watched?.state==='redundant'){cleanup();reject(new Error('offline installation failed'));}
   };
   const timeout=setTimeout(()=>{cleanup();reject(new Error('offline preparation timeout'));},30000);
   registration.addEventListener('updatefound',check);check();
  });
  await verify();
 }catch{show('آماده‌سازی آفلاین کامل نشد. با اینترنت دوباره تلاش کنید.',true);}}
 update.addEventListener('click',()=>{if(registration?.waiting)registration.waiting.postMessage({type:'ACTIVATE_UPDATE'});});
 await install();
}
