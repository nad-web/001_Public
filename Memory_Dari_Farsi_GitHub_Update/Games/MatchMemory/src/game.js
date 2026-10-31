import { getPool, CARD_MAP } from './cards.js';
import { LEVELS } from './levels.js';
export function shuffle(items, random = Math.random) {
 const out = [...items];
 for(let i=out.length-1;i>0;i--) { const r=random(); if(!Number.isFinite(r)||r<0||r>=1) throw new Error('Invalid random value'); const j=Math.floor(r*(i+1)); [out[i],out[j]]=[out[j],out[i]]; }
 return out;
}
export function makeBoard(levelId,category,selected=[],random=Math.random) {
 const level=LEVELS.find(l=>l.id===levelId); if(!level) throw new Error('Invalid level');
 const pool=getPool(category,selected); if(pool.length<level.pairs) throw new Error('Not enough cards');
 return shuffle(shuffle(pool,random).slice(0,level.pairs).flatMap(c=>[{key:c.key,uid:`${c.key}/a`},{key:c.key,uid:`${c.key}/b`}]),random);
}
export class Game {
 constructor({level=1,category='nature',categories=[],mode='relaxed',sequential=false,day=null,random=Math.random,id}={}) {
  this.level=level;this.category=category;this.categories=[...categories];this.mode=mode;this.sequential=sequential;this.day=day;
  this.id=id||`${Date.now()}-${Math.random().toString(36).slice(2)}`;
  this.board=makeBoard(level,category,categories,random);this.matched=[];this.selected=[];this.moves=0;this.mismatches=0;this.hints=0;
  this.status='ready';this.elapsed=0;this.startedAt=null;this.resolving=false;this.hasStarted=false;
 }
 get pairs(){ return this.board.length/2; }
 get found(){ return this.matched.length/2; }
 getElapsed(now=Date.now()){return this.elapsed+(this.startedAt===null?0:Math.max(0,now-this.startedAt));}
 reveal(index,now=Date.now()) {
  if(!Number.isInteger(index)||index<0||index>=this.board.length||!['ready','playing'].includes(this.status)||this.resolving||this.matched.includes(index)||this.selected.includes(index))return {type:'ignored'};
  if(this.status==='ready'){this.status='playing';this.hasStarted=true;this.startedAt=now;}
  this.selected.push(index);
  if(this.selected.length===1)return {type:'reveal',index};
  this.moves++;
  if(this.board[this.selected[0]].key===this.board[index].key){
   const pair=[...this.selected];this.matched.push(...pair);this.selected=[];
   if(this.matched.length===this.board.length){this.elapsed=this.getElapsed(now);this.startedAt=null;this.status='completed';return {type:'complete',pair};}
   return {type:'match',pair};
  }
  this.mismatches++;this.resolving=true;return {type:'mismatch',pair:[...this.selected]};
 }
 resolve(){if(this.resolving){this.selected=[];this.resolving=false;}}
 pause(now=Date.now()) {if(!['ready','playing'].includes(this.status))return false;this.elapsed=this.getElapsed(now);this.startedAt=null;this.status='paused';this.resolve();this.selected=[];return true;}
 resume(now=Date.now()){if(this.status!=='paused')return false;this.status=this.hasStarted?'playing':'ready';this.startedAt=this.hasStarted?now:null;return true;}
 hint(){
  if(!['ready','playing'].includes(this.status)||this.selected.length||this.resolving)return null;
  const i=this.board.findIndex((_,i)=>!this.matched.includes(i));if(i<0)return null;
  const j=this.board.findIndex((c,j)=>j!==i&&!this.matched.includes(j)&&c.key===this.board[i].key);
  this.hints++;return [i,j];
 }
 snapshot(now=Date.now()) {
  return {schema:1,id:this.id,level:this.level,category:this.category,categories:[...this.categories],mode:this.mode,sequential:this.sequential,day:this.day,board:this.board.map(c=>({...c})),matched:[...this.matched],moves:this.moves,mismatches:this.mismatches,hints:this.hints,elapsed:this.getElapsed(now),hasStarted:this.hasStarted};
 }
 static restore(s) {
  try {
   if(!s||s.schema!==1||typeof s.id!=='string'||s.id.length>100||!Array.isArray(s.board)||!Array.isArray(s.matched))return null;
   if(!['relaxed','standard','challenge'].includes(s.mode)||typeof s.sequential!=='boolean'||(s.day!==null&&!(typeof s.day==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(s.day))))return null;
   if(!Array.isArray(s.categories)||s.categories.some(c=>typeof c!=='string'))return null;
   const valid=new Set(getPool(s.category,s.categories).map(c=>c.key));
   const level=LEVELS.find(l=>l.id===s.level);if(!level||s.board.length!==level.pairs*2)return null;
   const counts=new Map();const uids=new Set();
   for(const c of s.board){if(!c||!CARD_MAP.has(c.key)||!valid.has(c.key)||typeof c.uid!=='string'||uids.has(c.uid)||![`${c.key}/a`,`${c.key}/b`].includes(c.uid))return null;uids.add(c.uid);counts.set(c.key,(counts.get(c.key)||0)+1);}
   if([...counts.values()].some(n=>n!==2)||new Set(s.matched).size!==s.matched.length||s.matched.some(i=>!Number.isInteger(i)||i<0||i>=s.board.length)||s.matched.length===s.board.length)return null;
   for(const i of s.matched)if(s.matched.filter(j=>s.board[j].key===s.board[i].key).length!==2)return null;
   for(const k of ['moves','mismatches','hints'])if(!Number.isSafeInteger(s[k])||s[k]<0||s[k]>1000000)return null;
   if(s.moves<s.matched.length/2||s.mismatches>s.moves||!Number.isFinite(s.elapsed)||s.elapsed<0||s.elapsed>31536000000||typeof s.hasStarted!=='boolean')return null;
   const game=new Game({level:s.level,category:s.category,categories:s.categories});
   Object.assign(game,{id:s.id,board:s.board.map(({key,uid})=>({key,uid})),matched:[...s.matched],moves:s.moves,mismatches:s.mismatches,hints:s.hints,elapsed:s.elapsed,hasStarted:s.hasStarted,mode:s.mode,sequential:s.sequential,day:s.day,status:'paused'});
   return game;
  }catch{return null;}
 }
}
