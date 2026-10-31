import {test} from 'node:test';
import assert from 'node:assert/strict';
import {setupOffline} from '../src/pwa.js';

test('offline readiness waits for the game registration even when the portfolio worker is already ready',async()=>{
 const navDescriptor=Object.getOwnPropertyDescriptor(globalThis,'navigator');
 const secureDescriptor=Object.getOwnPropertyDescriptor(globalThis,'isSecureContext');
 const registration=new EventTarget(),installing=new EventTarget(),serviceWorker=new EventTarget();
 installing.state='installing';registration.installing=installing;registration.active=null;registration.waiting=null;
 let replies=0,rootReadyReads=0;
 Object.defineProperty(serviceWorker,'ready',{get(){rootReadyReads++;return Promise.resolve({active:{state:'activated'}});}});
 serviceWorker.register=async()=>registration;
 Object.defineProperty(globalThis,'navigator',{value:{serviceWorker},configurable:true});
 Object.defineProperty(globalThis,'isSecureContext',{value:true,configurable:true});
 try{
  const status=new EventTarget(),retry=new EventTarget(),update=new EventTarget();status.textContent='not ready';
  const pending=setupOffline({status,retry,update});await new Promise(setImmediate);
  assert.equal(rootReadyReads,0);assert.equal(replies,0);assert.equal(status.textContent,'not ready');
  registration.active={state:'activated',postMessage(data,ports){assert.equal(data.type,'CHECK_OFFLINE');replies++;ports[0].postMessage({ready:true});ports[0].close();}};
  installing.state='activated';installing.dispatchEvent(new Event('statechange'));await pending;
  for(let i=0;i<3;i++)await new Promise(setImmediate);
  assert.equal(replies,1);assert.match(status.textContent,/آماده برای بازی آفلاین/);
 }finally{
  if(navDescriptor)Object.defineProperty(globalThis,'navigator',navDescriptor);else delete globalThis.navigator;
  if(secureDescriptor)Object.defineProperty(globalThis,'isSecureContext',secureDescriptor);else delete globalThis.isSecureContext;
 }
});
