import {test} from 'node:test';
import assert from 'node:assert/strict';
import {PersianAudio} from '../src/audio.js';

test('initial metadata and play promises cannot schedule duplicate audio or stop a newer Persian cue',async(t)=>{
 const previousAudio=globalThis.Audio,previousDocument=globalThis.document;
 class FakeAudio extends EventTarget {
  constructor(){super();this.readyState=0;this.currentTime=0;this.dataset={};this.paused=true;this.plays=0;}
  setAttribute(){}load(){}pause(){this.paused=true;}play(){this.plays++;this.paused=false;return Promise.resolve();}
 }
 globalThis.Audio=FakeAudio;globalThis.document={body:{append(){}}};
 const timers=new Map();let id=0;
 t.mock.method(globalThis,'setTimeout',fn=>{timers.set(++id,fn);return id;});t.mock.method(globalThis,'clearTimeout',id=>timers.delete(id));
 try{
  const voice=new PersianAudio({a:{start:1,end:3},b:{start:5,end:9}});voice.setEnabled(true);voice.play('a');
  voice.element.readyState=1;voice.element.dispatchEvent(new Event('loadedmetadata'));await new Promise(setImmediate);
  assert.equal(voice.element.plays,2);assert.equal(timers.size,1);assert.equal(voice.element.currentTime,1);
  const staleCallback=[...timers.values()][0];voice.play('b');await new Promise(setImmediate);assert.equal(voice.element.currentTime,5);assert.equal(timers.size,1);
  staleCallback();assert.equal(voice.element.paused,false,'Old timer must not interrupt the newer clip');
  voice.element.currentTime=9;voice.element.dispatchEvent(new Event('timeupdate'));assert.equal(voice.element.paused,true);
  voice.setEnabled(false);const n=voice.element.plays;voice.play('a');assert.equal(voice.element.plays,n);
 }finally{globalThis.Audio=previousAudio;globalThis.document=previousDocument;}
});
