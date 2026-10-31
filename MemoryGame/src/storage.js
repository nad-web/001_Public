import { DEFAULTS, MODES } from './config.js';
import { CATEGORIES } from './cards.js';
import { Game } from './game.js';
export const STORAGE_KEY='noorullah: hainburg-memory:fa:v1';
export const freshData=()=>({schema:1,settings:{...DEFAULTS,favorites:[]},completed:[],best:{},history:[],current:null});
export function cleanSettings(input){
 const out={...DEFAULTS,favorites:[]};if(!input||typeof input!=='object')return out;
 for(const k of ['sound','readCards','showTime','showLabels','contrast','largeText','reduceMotion','hints'])if(typeof input[k]==='boolean')out[k]=input[k];
 if(Object.hasOwn(MODES,input.mode))out.mode=input.mode;
 if(typeof input.welcome==='string')out.welcome=input.welcome.trim().slice(0,100);
 if(Array.isArray(input.favorites))out.favorites=[...new Set(input.favorites.filter(c=>c!=='mixed'&&CATEGORIES.some(x=>x.id===c)))];
 return out;
}
const validRecord=r=>r&&typeof r.id==='string'&&r.id.length<101&&Number.isInteger(r.level)&&r.level>=1&&r.level<=10&&CATEGORIES.some(c=>c.id===r.category)&&Object.hasOwn(MODES,r.mode)&&Number.isInteger(r.moves)&&r.moves>=1&&r.moves<1000001&&Number.isFinite(r.elapsed)&&r.elapsed>=0&&r.elapsed<=31536000000&&typeof r.date==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(r.date);
export class Store {
 constructor(storage){try{this.storage=storage===undefined?globalThis.localStorage:storage;}catch{this.storage=null;}this.warning='';this.data=this.load();}
 load(){
  try{const raw=this.storage?.getItem(STORAGE_KEY);if(!raw)return freshData();const s=JSON.parse(raw);if(!s||s.schema!==1)throw new Error('schema');
   const out=freshData();out.settings=cleanSettings(s.settings);
   out.completed=Array.isArray(s.completed)?[...new Set(s.completed.filter(n=>Number.isInteger(n)&&n>=1&&n<=10))]:[];
   out.history=Array.isArray(s.history)?s.history.filter(validRecord).slice(-50):[];
   if(s.best&&typeof s.best==='object')for(const [key,value] of Object.entries(s.best))if(validRecord(value)&&key===bestKey(value))out.best[key]=value;
   out.current=Game.restore(s.current)?.snapshot()||null;
   if(s.current&&!out.current)this.warning='بازی ذخیره‌شده قابل خواندن نبود. می‌توانید یک بازی تازه آغاز کنید.';
   return out;
  }catch{this.warning='اطلاعات ذخیره‌شده قابل خواندن نبود. بازی همچنان آماده است؛ پیشرفت قبلی شاید در دسترس نباشد.';return freshData();}
 }
 save(){try{if(!this.storage)throw new Error('unavailable');this.storage.setItem(STORAGE_KEY,JSON.stringify(this.data));return true;}catch{this.warning='ذخیره‌سازی در این مرورگر در دسترس نیست. این بار می‌توانید بازی کنید، اما پیشرفت پس از بستن صفحه نمی‌ماند.';return false;}}
 clear(){this.data=freshData();this.warning='';try{this.storage?.removeItem(STORAGE_KEY);return true;}catch{this.warning='پاک‌کردن اطلاعات مرورگر ممکن نشد.';return false;}}
 finish(game,date){
  if(game.status!=='completed'||this.data.history.some(h=>h.id===game.id))return {fresh:false,best:false};
  const r={id:game.id,level:game.level,category:game.category,categories:[...game.categories],mode:game.mode,moves:game.moves,elapsed:game.getElapsed(),date};
  const key=bestKey(r);const previous=this.data.best[key];const better=!previous||r.moves<previous.moves||(r.moves===previous.moves&&r.elapsed<previous.elapsed);
  if(better)this.data.best[key]=r;
  if(!this.data.completed.includes(game.level))this.data.completed.push(game.level);
  this.data.history.push(r);this.data.history=this.data.history.slice(-50);this.data.current=null;this.save();return {fresh:true,best:better};
 }
}
export function bestKey({level,category,mode,categories=[]}){return `${level}|${category}|${mode}${category==='mixed'?'|'+[...new Set(categories)].sort().join(','):''}`;}
