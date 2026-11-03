import { default as catalog } from './load-catalog.mjs';
const { lessons, labs, build, C } = catalog;
const targets = process.argv.slice(2);
const payload = lessons.filter(l => labs[l.id] && (!targets.length || targets.includes(l.level) || targets.includes(l.id))).map(lesson => {
  const control = labs[lesson.id].controls[0];
  const initial = labs[lesson.id].controls.map(k=>k.initial);
  const target = control.initial < (control.min+control.max)/2 ? control.max : control.min;
  const values = Array.from({length:9},(_,i)=>{
    const count=Math.round(((target-control.initial)*i/8)/control.step);
    return [Number((control.initial+count*control.step).toFixed(7)),...initial.slice(1)];
  });
  const modes = Object.fromEntries(['en','de'].map(lang=>[lang,values.map(v=>{
    const {marks,note}=build(lesson.id,v,lang);
    return {marks,note,control:control[lang],value:catalog.nformat(v[0],lang)};
  })]));
  return {...lesson,modes};
});
process.stdout.write(JSON.stringify({colors:C,lessons:payload}));
