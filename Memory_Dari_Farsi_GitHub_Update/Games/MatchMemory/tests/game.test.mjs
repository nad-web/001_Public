import {test} from 'node:test';
import assert from 'node:assert/strict';
import {Game,makeBoard,shuffle} from '../src/game.js';
import {LEVELS,dailyChallenge} from '../src/levels.js';
import {CATEGORIES,CARDS,getPool} from '../src/cards.js';
import {Store,STORAGE_KEY} from '../src/storage.js';
import {APP,fa,timeText} from '../src/config.js';

const groups=board=>{const m=new Map();board.forEach((c,i)=>m.set(c.key,[...(m.get(c.key)||[]),i]));return [...m.values()];};
const matching=g=>groups(g.board)[0];
const wrong=g=>[0,g.board.findIndex(c=>c.key!==g.board[0].key)];
for(const level of LEVELS)for(const category of CATEGORIES){
 test(`valid solvable board: level ${level.id}, ${category.id}`,()=>{
  const board=makeBoard(level.id,category.id,CATEGORIES.filter(c=>c.id!=='mixed').map(c=>c.id));
  assert.equal(board.length,level.pairs*2);assert.equal(new Set(board.map(c=>c.uid)).size,board.length);
  assert.equal(groups(board).length,level.pairs);assert.ok(groups(board).every(p=>p.length===2));
  const g=new Game({level:level.id,category:category.id,categories:['nature','food']});
  for(const [a,b]of groups(g.board)){g.reveal(a,1000);g.reveal(b,2000);}
  assert.equal(g.status,'completed');assert.equal(g.moves,level.pairs);assert.equal(g.found,level.pairs);
 });
}
test('all ten levels have increasing pair counts, translated messages and developer credit',()=>{
 assert.equal(LEVELS.length,10);assert.equal(new Set(LEVELS.map(l=>l.name)).size,10);
 LEVELS.forEach((l,i)=>{assert.equal(l.id,i+1);assert.match(l.message,/[\u0600-\u06ff]/);assert.equal(l.credit,'نورالله عادل');if(i)assert.ok(l.pairs>LEVELS[i-1].pairs);});
});
test('mixed mode excludes visually identical items from different categories',()=>{
 const pool=getPool('mixed',CATEGORIES.filter(c=>c.id!=='mixed').map(c=>c.id));
 assert.equal(new Set(pool.map(c=>`${c.kind}:${c.symbol}`)).size,pool.length);
 assert.ok(pool.length>=20);assert.throws(()=>getPool('mixed',[]));
});
test('cards and branded metadata use native language and Persian numerals',()=>{
 assert.equal(APP.lang,'fa-AF');assert.equal(APP.dir,'rtl');assert.equal(APP.developer,'نورالله عادل');
 assert.ok(CARDS.every(c=>/[\u0600-\u06ff]/.test(c.label)&&!/[A-Za-z]/.test(c.label)));
 assert.equal(fa(2026),'۲۰۲۶');assert.equal(timeText(125000),'۲:۰۵');
});
test('Fisher–Yates preserves all values and accepts injected randomness',()=>{
 assert.deepEqual(shuffle([1,2,3,4],()=>0),[2,3,4,1]);assert.deepEqual(shuffle([]),[]);
 assert.throws(()=>shuffle([1,2],()=>1));assert.throws(()=>makeBoard(11,'nature'));
 assert.throws(()=>makeBoard(1,'invalid'));
});
test('duplicate taps, matched taps and a third card cannot alter scoring',()=>{
 const g=new Game();const [a,b]=matching(g);assert.equal(g.reveal(a,1000).type,'reveal');assert.equal(g.reveal(a,1100).type,'ignored');
 assert.equal(g.reveal(b,1200).type,'match');assert.equal(g.reveal(a,1300).type,'ignored');assert.equal(g.moves,1);
 const h=new Game();const [x,y]=wrong(h);h.reveal(x);assert.equal(h.reveal(y).type,'mismatch');
 assert.equal(h.reveal(h.board.findIndex((_,i)=>i!==x&&i!==y)).type,'ignored');assert.equal(h.moves,1);h.resolve();assert.equal(h.selected.length,0);assert.equal(h.mismatches,1);
});
test('timer starts with first card, freezes on pause, resumes and stops on completion',()=>{
 const g=new Game();assert.equal(g.getElapsed(500),0);const [a,b]=matching(g);g.reveal(a,1000);assert.equal(g.getElapsed(1500),500);
 g.pause(2000);assert.equal(g.getElapsed(99999),1000);assert.equal(g.pause(5000),false);assert.equal(g.reveal(b).type,'ignored');
 g.resume(10000);assert.equal(g.resume(10001),false);assert.equal(g.getElapsed(11000),2000);
 for(const [x,y]of groups(g.board)){g.reveal(x,11000);g.reveal(y,11000);}
 assert.equal(g.status,'completed');assert.equal(g.getElapsed(999999),2000);
});
test('pause before first move preserves ready timer behavior',()=>{
 const g=new Game();g.pause(1000);g.resume(5000);assert.equal(g.status,'ready');assert.equal(g.getElapsed(10000),0);
});
test('pause during mismatch clears only transient selections',()=>{
 const g=new Game();const [a,b]=wrong(g);g.reveal(a);g.reveal(b);g.pause();assert.equal(g.resolving,false);assert.deepEqual(g.selected,[]);assert.equal(g.moves,1);g.resume();assert.notEqual(g.reveal(a).type,'ignored');
});
test('hint names a valid pair without scoring or exposing a third card',()=>{
 const g=new Game();const [a,b]=g.hint();assert.equal(g.board[a].key,g.board[b].key);assert.equal(g.hints,1);assert.equal(g.moves,0);assert.equal(g.status,'ready');assert.deepEqual(g.selected,[]);g.reveal(a);assert.equal(g.hint(),null);
});
test('a saved round restores only validated identities and pauses safely',()=>{
 const g=new Game({level:10,category:'mixed',categories:['nature','food'],mode:'challenge',sequential:true});const [a,b]=matching(g);g.reveal(a,1000);g.reveal(b,2000);
 const snapshot=g.snapshot(3000);const restored=Game.restore(snapshot);assert.ok(restored);assert.equal(restored.status,'paused');assert.equal(restored.found,1);assert.equal(restored.getElapsed(),2000);assert.equal(restored.mode,'challenge');assert.deepEqual(restored.board,g.board);
 const broken=structuredClone(snapshot);broken.board[0].key='<script>';assert.equal(Game.restore(broken),null);
 const bad=structuredClone(snapshot);bad.matched=[a];assert.equal(Game.restore(bad),null);
 const dup=structuredClone(snapshot);dup.board[1]=dup.board[0];assert.equal(Game.restore(dup),null);
 assert.equal(Game.restore({...snapshot,elapsed:NaN}),null);assert.equal(Game.restore({...snapshot,moves:-1}),null);
});
const memory=()=>({value:null,getItem(){return this.value;},setItem(k,v){assert.equal(k,STORAGE_KEY);this.value=v;},removeItem(){this.value=null;}});
test('settings, current round, and native personalized text survive storage',()=>{
 const storage=memory(),store=new Store(storage);store.data.settings.welcome='<b>خوش آمدید</b>';store.data.settings.sound=true;store.data.current=new Game().snapshot();assert.equal(store.save(),true);
 const read=new Store(storage);assert.equal(read.data.settings.sound,true);assert.equal(read.data.settings.welcome,'<b>خوش آمدید</b>');assert.ok(Game.restore(read.data.current));
});
test('corrupted, unavailable, malformed settings and out of quota storage recover',()=>{
 const storage=memory();storage.value='{bad';const bad=new Store(storage);assert.match(bad.warning,/[\u0600-\u06ff]/);assert.equal(bad.data.schema,1);
 const fail=new Store({getItem(){throw Error('blocked');},setItem(){throw Error('quota');}});assert.equal(fail.save(),false);assert.match(fail.warning,/[\u0600-\u06ff]/);
 storage.value=JSON.stringify({schema:1,settings:{mode:'toString',sound:'yes',favorites:['food','nope'],welcome:'a'.repeat(500)},completed:[1,1,50],history:[{id:'bad'}]});const read=new Store(storage);assert.equal(read.data.settings.mode,'relaxed');assert.equal(read.data.settings.sound,false);assert.equal(read.data.settings.welcome.length,100);assert.deepEqual(read.data.settings.favorites,['food']);assert.deepEqual(read.data.completed,[1]);assert.equal(read.data.history.length,0);
});
test('completion updates garden and comparable best once; full reset is scoped',()=>{
 const storage=memory(),store=new Store(storage),g=new Game();for(const[a,b]of groups(g.board)){g.reveal(a,1000);g.reveal(b,2000);}
 assert.deepEqual(store.finish(g,'2026-10-31'),{fresh:true,best:true});assert.deepEqual(store.finish(g,'2026-10-31'),{fresh:false,best:false});
 assert.equal(store.data.history.length,1);assert.deepEqual(store.data.completed,[1]);assert.equal(Object.keys(store.data.best).length,1);assert.equal(new Store(storage).data.history.length,1);
 assert.equal(store.clear(),true);assert.equal(storage.value,null);assert.equal(store.data.history.length,0);
});
test('daily configurations are local, deterministic, valid and update on changed date',()=>{
 const date=new Date(2026,9,31,23,50);assert.deepEqual(dailyChallenge(date),dailyChallenge(date));assert.equal(dailyChallenge(date).day,'2026-10-31');const next=dailyChallenge(new Date(2026,10,1));assert.equal(next.day,'2026-11-01');
 const {level,category}=next;assert.equal(makeBoard(level,category).length,LEVELS[level-1].pairs*2);
});
