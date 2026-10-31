import { fa } from './config.js';
export const CATEGORIES = [
  {id:'numbers',name:'عددها',icon:'۱۲',description:'جفت‌های عددی، با رقم‌های فارسی'},
  {id:'shapes',name:'شکل‌ها و رنگ‌ها',icon:'◇',description:'شکل‌های متفاوت؛ رنگ تنها نشانه نیست'},
  {id:'transport',name:'رفت‌وآمد',icon:'🚲',description:'موتر، بایسکل، قطار و همراهان سفر'},
  {id:'objects',name:'وسایل روزمره',icon:'🔑',description:'چیزهای آشنای خانه و زندگی'},
  {id:'nature',name:'جانوران و طبیعت',icon:'🌿',description:'از پروانه‌ها تا درخت‌های سبز'},
  {id:'food',name:'خوراک و نوشیدنی',icon:'🍐',description:'میوه‌ها و مزه‌های آشنا'},
  {id:'local',name:'هاینبورگ و زندگی محلی',icon:'🏡',description:'یک عکس واقعی و تصویرهای نمادین از زندگی محلی'},
  {id:'mixed',name:'باغ درهم',icon:'✧',description:'دسته‌های دلخواه را با هم بازی کنید'},
];
const lists = {
 transport: [ ['🚗','موتر'],['🚲','بایسکل'],['🚌','بس'],['🚆','قطار'],['🚚','موتر باربری'],['🏍️','موتورسایکل'],['🚤','قایق موتوری'],['✈️','هواپیما'],['🚊','تراموا'],['🚜','تراکتور'],['🚁','هلیکوپتر'],['🎈','بالون'],['🛴','اسکوتر'],['🚢','کشتی'],['🚐','موتر مسافربری'],['🚑','آمبولانس'],['🚒','موتر آتش‌نشانی'],['⛵','قایق بادبانی'],['🚀','موشک'],['🚕','تاکسی'] ],
 objects: [ ['🔑','کلید'],['☕','پیاله'],['📖','کتاب'],['⏰','ساعت'],['☂️','چتر'],['💡','چراغ'],['☎️','تلفن'],['👜','کیف'],['👞','کفش'],['🔨','چکش'],['👓','عینک'],['✂️','قیچی'],['👒','کلاه'],['✏️','مداد'],['🪑','چوکی'],['🫖','چای‌جوش'],['🪴','گلدان'],['🪞','آینه'],['📻','رادیو'],['✉️','نامه'] ],
 nature: [ ['🐈','گربه'],['🐕','سگ'],['🐦','پرنده'],['🐟','ماهی'],['🦋','پروانه'],['🌳','درخت'],['🌷','گل لاله'],['🍃','برگ'],['🍎','سیب'],['🍐','ناک'],['☀️','آفتاب'],['🌙','ماه'],['🐇','خرگوش'],['🐢','لاک‌پشت'],['🐌','حلزون'],['🐞','کفشدوزک'],['🐝','زنبور'],['🦆','مرغابی'],['🍄','قارچ'],['🌲','درخت کاج'] ],
 food: [ ['🍞','نان'],['🍵','چای'],['☕','قهوه'],['🥛','شیر'],['🍊','مالته'],['🍉','تربوز'],['🍇','انگور'],['🍌','کیله'],['🍓','توت‌فرنگی'],['🥕','زردک'],['🌽','جواری'],['🥚','تخم‌مرغ'],['🧀','پنیر'],['🍯','عسل'],['💧','آب'],['🍒','گیلاس'],['🍚','برنج'],['🍲','آش'],['🍰','کیک'],['🥣','کاسه'] ],
 local: [ ['photo','منظرهٔ واقعی هاینبورگ'],['🏡','خانهٔ باغ‌دار'],['⛪','کلیسا'],['🌊','کنار رود'],['🌉','پل'],['🌳','درخت کنار راه'],['🚲','بایسکل‌سواری'],['🛤️','راه آهن'],['🌷','باغچه'],['🦆','مرغابی کنار آب'],['🏘️','کوچهٔ خانه‌ها'],['🪑','نیمکت'],['🏠','خانهٔ کوچک'],['⛲','آب‌نما'],['🚶','پیاده‌روی'],['🌻','گل آفتاب‌گردان'],['🏪','دکان محلی'],['🚏','ایستگاه بس'],['🌾','کشتزار'],['🌅','سپیده‌دم'] ],
};
export const SHAPES = [
 ['circle','دایره'],['square','مربع'],['triangle','مثلث'],['star','ستاره'],['heart','قلب'],['diamond','لوزی'],['hexagon','شش‌ضلعی'],['pentagon','پنج‌ضلعی'],['oval','بیضی'],['crescent','هلال'],['plus','علامت جمع'],['ring','حلقه'],['rectangle','مستطیل'],['trapezoid','ذوزنقه'],['arrow','پیکان'],['cross','ضربدر'],['octagon','هشت‌ضلعی'],['semicircle','نیم‌دایره'],['wave','موج'],['spiral','مارپیچ'],
];
export const CARDS = [
 ...Array.from({length:30},(_,i)=>({key:`numbers:${i+1}`,category:'numbers',kind:'number',symbol:fa(i+1),label:`عدد ${fa(i+1)}`})),
 ...SHAPES.map(([symbol,label],i)=>({key:`shapes:${i}`,category:'shapes',kind:'shape',symbol,label})),
 ...Object.entries(lists).flatMap(([category,items])=>items.map(([symbol,label],i)=>({key:`${category}:${i}`,category,kind:symbol==='photo'?'photo':'symbol',symbol,label,illustration:category==='local'&&symbol!=='photo'}))),
];
export const CARD_MAP = new Map(CARDS.map(c=>[c.key,Object.freeze(c)]));
export function getPool(category, selected = []) {
 if(!CATEGORIES.some(c=>c.id===category)) throw new Error('Unknown category');
 const allowed = category==='mixed' ? selected.filter(c=>c!=='mixed'&&CATEGORIES.some(x=>x.id===c)) : [category];
 if(!allowed.length) throw new Error('Select at least one category');
 const seen=new Set();
 return CARDS.filter(c=>{
  if(!allowed.includes(c.category))return false;
  const visual=`${c.kind}:${c.symbol}`;
  if(seen.has(visual))return false;
  seen.add(visual);return true;
 });
}
