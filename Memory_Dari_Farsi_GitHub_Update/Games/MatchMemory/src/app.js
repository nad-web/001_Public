import {APP,fa,timeText,MODES} from './config.js';
import {CATEGORIES,CARD_MAP} from './cards.js';
import {LEVELS,dailyChallenge,localDay} from './levels.js';
import {Game} from './game.js';
import {Store,bestKey} from './storage.js';
import {shapeArt} from './art.js';
import {PersianAudio} from './audio.js';
import {CUES} from '../assets/audio/cues.js';
import {setupOffline} from './pwa.js';

const $=s=>document.querySelector(s);
const main=$('#main'),dialog=$('#dialog'),store=new Store();
let settings=store.data.settings,game=Game.restore(store.data.current),screen='',hinted=[],mismatchTimer,hintTimer,finishTimer;
let setup={level:1,category:settings.favorites[0]||'nature',categories:settings.favorites.length?[...settings.favorites]:['nature','food'],sequential:false,day:null};
let deferredInstall;
const flowers=['🌷','🌼','🌺','🌻','🪻','🌹','🌸','🪷','🌿','🌳'];
const audio=new PersianAudio(CUES,()=>announce('صدا پخش نشد. دوباره دکمهٔ صدا را لمس کنید و صدای دستگاه را بررسی کنید.'));

function el(tag,attrs={},...children){
 const node=document.createElement(tag);
 for(const [k,v]of Object.entries(attrs)){if(v===null||v===undefined||v===false)continue;if(k.startsWith('on'))node.addEventListener(k.slice(2).toLowerCase(),v);else if(k==='class')node.className=v;else if(k==='checked'||k==='disabled')node[k]=v;else node.setAttribute(k,v===true?'':String(v));}
 for(const child of children.flat(Infinity))if(child!==null&&child!==undefined&&child!==false)node.append(child instanceof Node?child:document.createTextNode(String(child)));
 return node;
}
const button=(text,fn,kind='',attrs={})=>el('button',{type:'button',class:`btn ${kind}`,onclick:fn,...attrs},text);
const categoryName=id=>CATEGORIES.find(c=>c.id===id)?.name||'';
const levelOf=id=>LEVELS.find(l=>l.id===id)||LEVELS[0];
const stat=(value,label)=>el('div',{class:'stat'},el('strong',{},value),el('span',{},label));
function announce(text){$('#announcer').textContent='';requestAnimationFrame(()=>{$('#announcer').textContent=text;});}
function warning(){const text=store.warning;$('#storage-warning').hidden=!text;$('#storage-warning').textContent=text;}
function persist(){if(game&&game.status!=='completed')store.data.current=game.snapshot();store.save();warning();}
function clearTimers(){clearTimeout(mismatchTimer);clearTimeout(hintTimer);clearTimeout(finishTimer);hinted=[];}
function applySettings(){document.documentElement.classList.toggle('high-contrast',settings.contrast);document.documentElement.classList.toggle('large-text',settings.largeText);document.documentElement.classList.toggle('reduce-motion',settings.reduceMotion);document.documentElement.classList.toggle('no-card-labels',!settings.showLabels);updateSound();}
function updateSound(){$('#sound-button').textContent=settings.sound?'صدا: روشن':'صدا: خاموش';$('#sound-button').setAttribute('aria-pressed',String(settings.sound));$('#sound-button').setAttribute('aria-label',settings.sound?'خاموش‌کردن صدای فارسی':'روشن‌کردن صدای فارسی');audio.enabled=settings.sound;}
function toggleSound(){settings.sound=!settings.sound;audio.setEnabled(settings.sound);store.data.settings=settings;persist();updateSound();if(settings.sound)audio.play('sound-on');}
function go(route){const hash=`#${route}`;if(location.hash===hash)render();else location.hash=hash;}
function pageHeader(title,description='',back='home'){return el('div',{class:'screen-header'},el('div',{},el('h1',{},title),description&&el('p',{},description)),button('بازگشت ←',()=>go(back),'back'));}
function quote(level){return el('blockquote',{class:'quote'},level.message,el('cite',{},`— ${APP.developer}`));}
function check(label,checked,fn,detail=''){return el('label',{class:'check'},el('input',{type:'checkbox',checked,onchange:e=>fn(e.target.checked)}),el('span',{},label,detail&&el('small',{},detail)));}
function selectMode(value,fn){return el('div',{class:'field'},el('label',{for:'mode-select'},'ریتم بازی'),el('select',{id:'mode-select',onchange:e=>fn(e.target.value)},Object.entries(MODES).map(([id,m])=>el('option',{value:id,selected:id===value},m.name))));}
function openDialog(title,body,actions=[]){
 if(screen==='play'&&game&&['ready','playing'].includes(game.status)){game.pause();clearTimers();persist();render();}
 audio.stop();dialog.replaceChildren(button('×',closeDialog,'dialog-close',{'aria-label':'بستن پنجره'}),el('h2',{id:'dialog-title',tabindex:'-1'},title),...body,el('div',{class:'actions'},...actions));
 if(!dialog.open){if(typeof dialog.showModal==='function')dialog.showModal();else dialog.setAttribute('open','');}
 $('#dialog-title').focus();
}
function closeDialog(){if(typeof dialog.close==='function')dialog.close();else dialog.removeAttribute('open');}
function confirmAction(title,message,action){openDialog(title,[el('p',{},message)],[button('بله، ادامه',()=>{closeDialog();action();},'primary'),button('نه، بازگشت',closeDialog)]);}
function showInstall(){
 if(['playing','ready'].includes(game?.status)){game.pause();clearTimers();persist();render();}
 const isInstalled=matchMedia('(display-mode: standalone)').matches||navigator.standalone===true;
 openDialog('باغ حافظه را همراه خود ببرید',[
  el('div',{class:'install-icon'},el('img',{src:'./assets/icons/favicon.svg',alt:''})),
  el('p',{},isInstalled?'این بازی اکنون از نماد صفحهٔ اصلی باز شده است.':'در آیفون می‌توانید نماد بازی را به صفحهٔ اصلی اضافه کنید.'),
  el('ol',{class:'install-steps'},
   el('li',{},'پیوند بازی را با اینترنت در سافاری یا کروم باز کنید.'),
   el('li',{},'دکمهٔ اشتراک‌گذاری را لمس کنید؛ در بعضی نسخه‌ها در فهرست «بیشتر» است.'),
   el('li',{},'«افزودن به صفحهٔ اصلی» را انتخاب کنید. اگر گزینهٔ «بازشدن به‌صورت برنامه» دیده شد، آن را روشن کنید.'),
   el('li',{},'«افزودن» را لمس کنید. سپس بازی را یک بار از نماد تازه، با اینترنت باز کنید.'),
   el('li',{},'منتظر پیام «آماده برای بازی آفلاین» بمانید. پس از آن، حالت پرواز را روشن و بازی را دوباره باز کنید.')),
  el('p',{class:'small-note'},'این دکمه راهنمای نصب را نشان می‌دهد؛ افزودن نماد به تأیید خود شما در آیفون نیاز دارد. اگر این گزینه در اج دیده نمی‌شود، همین پیوند را در سافاری باز کنید.'),
  el('p',{class:'small-note'},'بازی، تصویرها و صدای فارسی پس از آماده‌سازی بدون اینترنت کار می‌کنند. اگر داده‌های مرورگر پاک شوند، بازی را دوباره با اینترنت باز کنید.'),
 ],[...(deferredInstall?[button('نصب روی این دستگاه',async()=>{const prompt=deferredInstall;deferredInstall=null;await prompt.prompt();closeDialog();},'primary')]:[]),button('متوجه شدم',closeDialog,'primary')]);
}
function renderHome(){
 const title=settings.welcome||'هر جفت،\nیک لبخند.';
 return el('div',{},
  el('section',{class:'hero','aria-label':'خوش آمدید'},
   el('div',{class:'hero-copy'},el('p',{class:'eyebrow'},'یک گردش آرام در باغ خاطره‌ها'),el('h1',{},title),el('p',{class:'lead'},'دو کارت همسان را پیدا کنید؛ با آرامش، به زبان خودتان و با منظره‌ای از هاینبورگ.'),
    el('div',{class:'hero-actions'},button('شروع بازی',()=>go('categories'),'primary'),game&&game.status!=='completed'&&button('ادامهٔ بازی',()=>go('play'),'secondary')),
    el('div',{class:'badges'},el('span',{},'۱۰ مرحله'),el('span',{},'۸ دسته'),el('span',{},'بدون حساب کاربری')),
    el('p',{class:'small-note'},'طراحی و ساخت: نورالله عادل')),
   el('div',{class:'hero-art',role:'img','aria-label':'منظرهٔ واقعی هاینبورگ در هِسِن، آلمان؛ کلیسای سنت وندلین و خانه‌های شهر'},
    el('div',{class:'photo-caption'},APP.location,el('small',{},'عکس: دی‌گوندل · مجوز انتساب ۴٫۰',el('a',{href:'#about'},' · منابع عکس'))))),
  el('nav',{class:'welcome-links','aria-label':'فهرست اصلی'},button('✧ بازی امروز',startDaily),button('❀ باغ و پیشرفت من',()=>go('progress')),button('تنظیمات',()=>go('settings')),button('روش بازی',showRules)),
  el('section',{class:'intro-strip','aria-label':'سه قدم ساده'},
   ...[['۱','دسته‌ای را انتخاب کنید','عددها، طبیعت، وسایل آشنا و چیزهای دیگر.'],['۲','جفت‌ها را پیدا کنید','هر بار دو کارت را برگردانید؛ هیچ عجله‌ای نیست.'],['۳','باغ خود را پرورش دهید','با پایان هر مرحله، یک گل به باغ شما اضافه می‌شود.']].map(([n,t,d])=>el('div',{},el('span',{class:'step-number'},n),el('div',{},el('h3',{},t),el('p',{},d))))));
}
function showRules(){
 openDialog('روش بازی',[
  el('p',{},'هر بار دو کارت را لمس کنید. اگر شکل یا عدد آن‌ها یکسان باشد، جفت پیدا شده است و کارت‌ها باز می‌مانند.'),
  el('p',{},'اگر کارت‌ها متفاوت باشند، پس از چند لحظه برمی‌گردند. جای آن‌ها را به خاطر بسپارید و دوباره امتحان کنید.'),
  el('p',{},'هر دو انتخاب معتبر، یک تلاش حساب می‌شود. راهنما تلاش اضافه نمی‌کند. می‌توانید هر زمان بازی را مکث کنید؛ شمارش زمان در مکث متوقف می‌شود.'),
  el('p',{},'در رایانه، با کلید فاصله یا ورود کارت را باز کنید. کلیدهای پیکان برای جابه‌جایی میان کارت‌ها هستند. در آیفون، کارت را لمس کنید.'),
 ],[button('شنیدن راهنما',()=>{if(!settings.sound){settings.sound=true;audio.setEnabled(true);persist();updateSound();}audio.play('rules');},'secondary'),button('آماده‌ام',closeDialog,'primary')]);
}
function renderCategories(){
 const grid=el('div',{class:'grid categories'},CATEGORIES.map(c=>button('',()=>{setup.category=c.id;setup.day=null;render();},`category ${setup.category===c.id?'selected':''}`,{'aria-pressed':String(setup.category===c.id),'data-category':c.id})));
 [...grid.children].forEach((node,i)=>{const c=CATEGORIES[i];node.append(el('span',{class:'category-icon','aria-hidden':'true'},c.icon),el('h2',{},c.name),el('small',{},c.description));if(setup.category===c.id)node.append(el('span',{class:'selected-badge','aria-hidden':'true'},'✓'));});
 const mixed=el('div',{class:'panel'},el('h2',{},'دسته‌های باغ درهم'),el('p',{},'یک یا چند دسته را انتخاب کنید.'),el('div',{class:'checks-grid'},CATEGORIES.filter(c=>c.id!=='mixed').map(c=>check(c.name,setup.categories.includes(c.id),on=>{setup.categories=on?[...new Set([...setup.categories,c.id])]:setup.categories.filter(x=>x!==c.id);}))));
 return el('section',{class:'screen'},pageHeader('امروز چه چیزی را جفت کنیم؟','یک دستهٔ آشنا برای گردش امروز انتخاب کنید.'),grid,setup.category==='mixed'&&mixed,
  el('div',{class:'panel row'},el('div',{},el('strong',{},`انتخاب شما: ${categoryName(setup.category)}`),el('p',{class:'small-note'},setup.category==='local'?'فقط کارت منظره، عکس واقعی است؛ باقی کارت‌های این دسته، نماد و تصویر عمومی‌اند.':'همهٔ مراحل باز هستند؛ می‌توانید از مرحلهٔ نخست آغاز کنید.')),
   button('انتخاب مرحله ←',()=>{if(setup.category==='mixed'&&!setup.categories.length){announce('لطفاً دست‌کم یک دسته انتخاب کنید.');openDialog('یک دسته انتخاب کنید',[el('p',{},'برای بازی درهم، حداقل یک دسته را علامت بزنید.')],[button('بازگشت',closeDialog,'primary')]);return;}go('levels');},'primary')));
}
function startDaily(){setup={...setup,...dailyChallenge(),sequential:false};go('intro');}
function levelsScreen(){
 const section=el('section',{class:'screen'});const grid=el('div',{class:'grid levels'});
 for(const l of LEVELS){grid.append(button([el('b',{},fa(l.id)),el('strong',{},l.name),el('small',{},`${fa(l.pairs)} جفت · ${fa(l.pairs*2)} کارت`),store.data.completed.includes(l.id)&&el('span',{class:'earned','aria-label':'این مرحله قبلاً کامل شده است'},'🌷')],()=>{setup.level=l.id;setup.day=null;go('intro');},'level',{'data-level':l.id}));}
 section.replaceChildren(pageHeader('قدم بعدی در باغ',`${categoryName(setup.category)} · همهٔ مراحل باز هستند.`,'categories'),grid,
  el('div',{class:'panel'},selectMode(settings.mode,value=>{settings.mode=value;persist();}),check('مرحله‌ها را پشت سر هم بازی کنم',setup.sequential,on=>{setup.sequential=on;}),'انتخاب حالت آرام یا چالش، تعداد کارت‌های هر مرحله را تغییر نمی‌دهد.'));
 return section;
}
function introScreen(){
 const level=levelOf(setup.level);
 return el('section',{class:'screen before-game'},pageHeader(setup.day?'گردش امروز':`مرحلهٔ ${fa(level.id)}`,level.name,'levels'),
  el('div',{class:'stats-row'},stat(fa(level.pairs),'جفت'),stat(categoryName(setup.category),'دسته'),stat(MODES[settings.mode].name,'ریتم بازی')),
  setup.day&&el('p',{class:'small-note'},`برای تاریخ محلی ${fa(setup.day)}؛ هر روز یک دسته و مرحلهٔ تازه انتخاب می‌شود.`),quote(level),
  el('p',{class:'text-muted'},'هر بار دو کارت را لمس کنید. جفت‌های یکسان باز می‌مانند. زمان محدود نیست؛ با آرامش بازی کنید.'),
  el('div',{class:'actions'},button('بزن بریم، شروع کنیم',()=>beginGame(),'primary'),button('شنیدن پیام نورالله',()=>{if(!settings.sound){settings.sound=true;audio.setEnabled(true);persist();updateSound();}audio.play(`level:${level.id}`);})),
  el('p',{class:'small-note'},'راهنما و مکث همیشه در دسترس‌اند. صدا اختیاری است و بدون آن هم می‌توانید کامل بازی کنید.'));
}
function beginGame(force=false){
 if(game&&game.status!=='completed'&&!force){confirmAction('بازی تازه آغاز شود؟','با شروع این دور، بازی نیمه‌تمام قبلی جایگزین می‌شود. نتیجه‌های کامل‌شدهٔ شما باقی می‌ماند.',()=>beginGame(true));return;}
 clearTimers();audio.stop();game=new Game({...setup,mode:settings.mode});persist();go('play');
}
function cardContent(card){
 const art=el('span',{class:`card-art ${card.kind==='number'?'number':''} ${card.kind==='photo'?'photo':''}`,'aria-hidden':'true'});
 if(card.kind==='shape')art.append(shapeArt(card.symbol));else if(card.kind!=='photo')art.textContent=card.symbol;
 return [art,el('span',{class:'card-label','aria-hidden':'true'},card.label)];
}
function updateCard(node,i){
 const matched=game.matched.includes(i),up=matched||game.selected.includes(i)||hinted.includes(i),card=CARD_MAP.get(game.board[i].key);
 node.className=`memory-card${up?' up':''}${matched?' matched':''}${hinted.includes(i)?' hinted':''}`;node.disabled=matched;
 node.setAttribute('aria-label',`کارت ${fa(i+1)}، ${up?`${card.label}${matched?'، جفت پیدا شده':''}`:'پشت‌ورو'}`);
 node.setAttribute('aria-pressed',String(up));node.replaceChildren(el('span',{class:'card-position','aria-hidden':'true'},fa(i+1)),...(up?cardContent(card):[el('img',{class:'back-mark',src:'./assets/icons/favicon.svg',alt:''})]));
}
function boardScreen(){
 if(!game){go('categories');return el('p',{},'دستهٔ بازی را انتخاب کنید.');}
 if(game.status==='paused')return pauseScreen();
 if(game.status==='completed'){go('results');return el('p',{},'باغ شما گل تازه‌ای دارد.');}
 const level=levelOf(game.level),board=el('div',{class:'board','data-size':game.board.length>20?'large':'small',role:'group','aria-label':'کارت‌های بازی؛ از راست به چپ','data-testid':'board'});
 game.board.forEach((c,i)=>{const node=button('',e=>onCard(i,e),'memory-card',{'data-position':i});node.addEventListener('keydown',e=>arrowKey(e,i));updateCard(node,i);board.append(node);});
 const stats=el('div',{class:'game-stats'},el('span',{},'جفت‌ها: ',el('b',{id:'pair-count'},`${fa(game.found)} از ${fa(game.pairs)}`)),el('span',{},'تلاش‌ها: ',el('b',{id:'move-count'},fa(game.moves))),settings.showTime&&el('span',{},'زمان: ',el('b',{id:'elapsed-time',dir:'ltr'},timeText(game.getElapsed()))));
 return el('section',{class:'screen board-screen'},
  el('div',{class:'board-heading'},el('div',{},el('h1',{},`${fa(game.level)} · ${level.name}`),el('p',{},`${categoryName(game.category)} · ${MODES[game.mode].name}`)),button('خانه',()=>leaveGame(),'back')),
  stats,el('div',{class:'progress-track',role:'progressbar','aria-label':'جفت‌های پیدا شده','aria-valuemin':'0','aria-valuemax':game.pairs,'aria-valuenow':game.found},el('div',{class:'progress-fill',style:`width:${game.found/game.pairs*100}%`})),
  el('div',{class:'game-toolbar'},button('مکث Ⅱ',pauseGame),settings.hints&&button('یک راهنما ✧',giveHint,'',{'id':'hint-button'}),button('از نو ↻',restartGame)),
  el('div',{id:'game-feedback',class:'game-feedback'},'دو کارت را انتخاب کنید. با آرامش؛ هیچ عجله‌ای نیست.'),board,
  game.category==='local'&&el('p',{class:'illustration-note'},'کارت منظره، عکس واقعی هاینبورگ است. بقیهٔ کارت‌ها نماد و تصویر عمومی از زندگی محلی هستند.'));
}
function arrowKey(event,i){
 const board=$('.board');if(!board)return;const columns=getComputedStyle(board).gridTemplateColumns.split(' ').length;
 const deltas={ArrowLeft:1,ArrowRight:-1,ArrowDown:columns,ArrowUp:-columns};if(!Object.hasOwn(deltas,event.key)&&!['Home','End'].includes(event.key))return;
 event.preventDefault();let index=event.key==='Home'?0:event.key==='End'?game.board.length-1:i+deltas[event.key];const step=(deltas[event.key]||1)>0?1:-1;
 while(index>=0&&index<game.board.length&&game.matched.includes(index))index+=step;
 if(index>=0&&index<game.board.length)board.children[index].focus();
}
function feedback(message){const node=$('#game-feedback');if(node)node.textContent=message;announce(message);}
function updateBoard(){
 const board=$('.board');if(!board)return;[...board.children].forEach(updateCard);
 $('#pair-count').textContent=`${fa(game.found)} از ${fa(game.pairs)}`;$('#move-count').textContent=fa(game.moves);
 const track=$('.progress-track');track.setAttribute('aria-valuenow',game.found);track.firstChild.style.width=`${game.found/game.pairs*100}%`;
 if($('#hint-button'))$('#hint-button').disabled=game.resolving||game.selected.length>0;
}
function onCard(i,event){
 if(!game)return;hinted=[];clearTimeout(hintTimer);const outcome=game.reveal(i);if(outcome.type==='ignored')return;
 updateBoard();
 if(outcome.type==='reveal'){feedback(`${CARD_MAP.get(game.board[i].key).label}؛ حالا کارت دوم را انتخاب کنید.`);if(settings.readCards)audio.play(game.board[i].key);else audio.play('reveal');}
 if(outcome.type==='mismatch'){
  feedback('این دو کارت همسان نیستند. جای آن‌ها را به خاطر بسپارید.');audio.play('mismatch');
  mismatchTimer=setTimeout(()=>{if(screen==='play'&&game.status==='playing'){game.resolve();updateBoard();feedback('با آرامش ادامه دهید؛ جفت بعدی در انتظار شماست.');persist();}},MODES[game.mode].delay);
 }
 if(outcome.type==='match'){
  feedback(game.pairs-game.found===1?'آفرین! فقط یک جفت دیگر باقی مانده است.':'آفرین! یک جفت پیدا کردید.');audio.play('match');
  if(event.detail===0){const next=[...$('.board').children].find(n=>!n.disabled);next?.focus();}
 }
 if(outcome.type==='complete'){
  store.finish(game,localDay());warning();feedback('چه خوب! همهٔ جفت‌ها پیدا شدند.');
  finishTimer=setTimeout(()=>{if(screen==='play'&&game.status==='completed')go('results');},550);
 }else persist();
}
function giveHint(){
 const pair=game?.hint();if(!pair){feedback('ابتدا انتخاب فعلی را کامل کنید، سپس راهنما را بزنید.');return;}
 hinted=pair;updateBoard();feedback(`کارت‌های ${fa(pair[0]+1)} و ${fa(pair[1]+1)} یک جفت هستند. شماره‌ها از سمت راست آغاز می‌شوند.`);audio.play('hint');persist();
 hintTimer=setTimeout(()=>{hinted=[];if(screen==='play'&&['ready','playing'].includes(game.status))updateBoard();},5000);
}
function pauseGame(){if(!game?.pause())return;clearTimers();persist();render();audio.play('pause');}
function leaveGame(){if(game&&['playing','ready'].includes(game.status))game.pause();clearTimers();persist();go('home');}
function restartGame(){confirmAction('این مرحله از نو آغاز شود؟','جای کارت‌ها دوباره عوض می‌شود و تلاش‌های این دور از صفر شروع می‌شود.',()=>{clearTimers();setup={level:game.level,category:game.category,categories:[...game.categories],sequential:game.sequential,day:game.day};game=null;beginGame(true);});}
function pauseScreen(){return el('section',{class:'pause-screen panel'},el('div',{class:'pause-symbol','aria-hidden':'true'},'Ⅱ'),el('h1',{},'یک لحظه آرامش'),el('p',{},'بازی شما نگه داشته شده است. هر وقت آماده بودید ادامه دهید.'),el('div',{class:'stats-row'},stat(`${fa(game.found)} / ${fa(game.pairs)}`,'جفت‌های پیدا شده'),stat(fa(game.moves),'تلاش')),
 el('div',{class:'actions'},button('ادامهٔ بازی',()=>{game.resume();persist();render();audio.play('resume');},'primary'),button('بازگشت به خانه',()=>go('home'))));}
function resultScreen(){
 if(!game||game.status!=='completed'){go('progress');return el('p',{},'پیشرفت شما');}
 const level=levelOf(game.level),best=store.data.best[bestKey(game)],newBest=best?.id===game.id;
 return el('section',{class:'screen result'},el('div',{class:'result-flower','aria-hidden':'true'},flowers[game.level-1]),el('h1',{},'چه خوب! باغ شما شکوفا شد.'),el('p',{class:'text-muted'},`مرحلهٔ ${fa(game.level)}، ${level.name} را کامل کردید.`),
  el('div',{class:'stats-row'},stat(fa(game.pairs),'جفت پیدا شد'),stat(fa(game.moves),'تلاش'),settings.showTime&&stat(timeText(game.getElapsed()),'زمان بازی')),
  newBest&&el('p',{class:'best-tag'},'بهترین نتیجهٔ شخصی شما در این مرحله و حالت'),
  el('p',{},'یک گل این مرحله به باغ شما اضافه شد. می‌توانید هر مرحله را هر چند بار که دوست دارید بازی کنید.'),quote(level),
  el('div',{class:'actions'},game.level<10&&button('مرحلهٔ بعد ←',()=>{setup={level:game.level+1,category:game.category,categories:[...game.categories],sequential:game.sequential,day:null};if(game.sequential)beginGame(true);else go('intro');},'primary'),button('دوباره همین مرحله',()=>{setup={level:game.level,category:game.category,categories:[...game.categories],sequential:game.sequential,day:null};beginGame(true);},game.level===10?'primary':''),button('دیدن باغ من',()=>go('progress')),button('خانه',()=>go('home'))));
}
function progressScreen(){
 const history=[...store.data.history].reverse();
 return el('section',{class:'screen'},pageHeader('باغ کوچک شما','گل‌ها یادگاریِ مرحله‌هایی هستند که کامل کرده‌اید.'),
  el('div',{class:'stats-row'},stat(fa(store.data.completed.length),'مرحلهٔ کامل‌شده'),stat(fa(history.length),'دور در سابقهٔ اخیر')),
  el('div',{class:'garden','aria-label':'گل‌های مرحله‌های کامل‌شده'},store.data.completed.length?[...store.data.completed].sort((a,b)=>a-b).map(id=>el('div',{class:'garden-plant'},el('span',{'aria-hidden':'true'},flowers[id-1]),el('small',{},`مرحلهٔ ${fa(id)}`))):el('p',{class:'empty'},'پس از پایان نخستین مرحله، اولین گل شما اینجا می‌روید.')),
  el('div',{class:'panel'},el('h2',{},'گردش‌های اخیر'),history.length?el('ul',{class:'history-list'},history.map(r=>el('li',{},el('div',{class:'row'},el('strong',{},`${levelOf(r.level).name} · ${categoryName(r.category)}`),el('span',{},`${fa(r.moves)} تلاش`)),el('small',{},`${MODES[r.mode].name} · ${fa(r.date)}${settings.showTime?` · ${timeText(r.elapsed)}`:''}`)))):el('p',{class:'empty'},'هنوز دوری ثبت نشده است؛ یک بازی کوتاه آغاز کنید.')),
  el('p',{class:'small-note'},'۵۰ دور اخیر نگه داشته می‌شود. بهترین نتیجه برای هر مرحله، دسته و ریتم با کمترین تلاش و سپس کمترین زمان مقایسه می‌شود. این نتیجه‌ها فقط مربوط به همین بازی هستند.'),
  el('div',{class:'actions'},button('بازی تازه',()=>go('categories'),'primary'),button('پاک‌کردن پیشرفت',()=>confirmAction('پیشرفت پاک شود؟','سابقه، بهترین نتیجه‌ها، گل‌ها و بازی نیمه‌تمام پاک می‌شوند. تنظیمات شما باقی می‌ماند.',()=>{store.data.completed=[];store.data.history=[];store.data.best={};store.data.current=null;game=null;store.save();warning();render();}),'danger')));
}
function settingChange(key,value){settings[key]=value;store.data.settings=settings;if(key==='sound'){audio.setEnabled(value);if(value)audio.play('sound-on');}applySettings();persist();}
function settingsScreen(){
 return el('section',{class:'screen settings'},pageHeader('بازی به سلیقهٔ شما','تغییرها به‌صورت خودکار روی همین دستگاه نگه داشته می‌شوند.'),
  el('div',{class:'panel'},el('h2',{},'دیدن و خواندن'),
   check('نوشته‌های بزرگ‌تر',settings.largeText,on=>settingChange('largeText',on),'کارت‌ها در موبایل در سه ستون نمایش داده می‌شوند.'),
   check('تفاوت رنگ بیشتر',settings.contrast,on=>settingChange('contrast',on)),check('حرکت و پویانمایی کمتر',settings.reduceMotion,on=>settingChange('reduceMotion',on)),check('نام کارت‌ها دیده شود',settings.showLabels,on=>settingChange('showLabels',on))),
  el('div',{class:'panel'},el('h2',{},'صدای فارسی'),check('صدا روشن باشد',settings.sound,on=>settingChange('sound',on),'گفتار فارسی در خود بازی ذخیره شده و پس از آماده‌سازی آفلاین پخش می‌شود.'),check('نام کارت نخست خوانده شود',settings.readCards,on=>settingChange('readCards',on)),button('آزمایش صدا',()=>{settingChange('sound',true);render();audio.play('sound-on');},'secondary'),el('p',{class:'small-note'},'صدا با گفتارساز فارسی تولید شده است؛ تقلید صدای شخص خاصی نیست. نوشته‌ها به دری / فارسی‌اند. برای شنیدن، صدای دستگاه را هم بلند کنید.')),
  el('div',{class:'panel'},el('h2',{},'ریتم و کمک'),selectMode(settings.mode,on=>{settingChange('mode',on);render();}),el('p',{class:'small-note'},MODES[settings.mode].description),check('راهنمای اختیاری فعال باشد',settings.hints,on=>settingChange('hints',on)),check('زمان بازی دیده شود',settings.showTime,on=>settingChange('showTime',on)),el('p',{class:'small-note'},'ریتم تازه از دور بعدی اعمال می‌شود. هیچ حالتی محدودیت زمان ندارد.')),
  el('div',{class:'panel'},el('h2',{},'پیام خوش‌آمد دلخواه'),el('div',{class:'field'},el('label',{for:'welcome-input'},'در صفحهٔ نخست چه نوشته شود؟'),el('input',{id:'welcome-input',type:'text',maxlength:'100',value:settings.welcome,placeholder:'مثلاً: به باغ خاطره‌های ما خوش آمدید',oninput:e=>settingChange('welcome',e.target.value.slice(0,100))})),el('p',{class:'small-note'},'خالی بگذارید تا پیام اصلی بازی نمایش داده شود. این متن جایی فرستاده نمی‌شود.')),
  el('div',{class:'panel'},el('h2',{},'دسته‌های دلخواه من'),el('div',{class:'checks-grid'},CATEGORIES.filter(c=>c.id!=='mixed').map(c=>check(c.name,settings.favorites.includes(c.id),on=>{settingChange('favorites',on?[...new Set([...settings.favorites,c.id])]:settings.favorites.filter(x=>x!==c.id));setup.categories=[...settings.favorites];if(settings.favorites.length)setup.category=settings.favorites[0];})))),
  el('div',{class:'panel'},el('h2',{},'اطلاعات روی این دستگاه'),el('p',{},'حساب کاربری، تبلیغ، ردیابی و همگام‌سازی آنلاین وجود ندارد. پیشرفت در همین مرورگر یا برنامه نگه داشته می‌شود.'),
   el('div',{class:'actions'},button('پاک‌کردن همهٔ اطلاعات این بازی',()=>confirmAction('همهٔ اطلاعات پاک شود؟','تنظیمات، گل‌ها، بهترین نتیجه‌ها و بازی نیمه‌تمام پاک می‌شوند. فایل‌های لازم برای بازی آفلاین باقی می‌مانند.',()=>{store.clear();game=null;settings=store.data.settings;audio.setEnabled(false);setup={level:1,category:'nature',categories:['nature','food'],sequential:false,day:null};applySettings();warning();render();}),'danger'))));
}
function aboutScreen(){return el('section',{class:'screen about'},pageHeader('دربارهٔ باغ حافظه'),
 el('div',{class:'panel'},el('h2',{},APP.name),el('p',{},'یک بازی آرام جفت‌کردن کارت‌ها برای بزرگسالان، خانواده‌ها و هر کسی که از بازی حافظه لذت می‌برد.'),el('p',{},`طراحی و ساخت: ${APP.developer}`),el('p',{},`نسخهٔ ${fa(APP.version)} · انتشار: ${fa(APP.releasedOn)}`),el('p',{},'زبان برنامه: دری / فارسی · جهت نوشته‌ها: راست به چپ'),el('p',{},'۱۰ مرحله از ۴ تا ۲۰ جفت؛ ۸ دسته؛ بازی امروز؛ گل‌های یادگاری و پیشرفت روی دستگاه خودتان.')),
 el('div',{class:'panel'},el('h2',{},'بازی برای لذت و تمرین'),el('p',{},'باغ حافظهٔ هاینبورگ یک بازی سرگرمی و تمرین است. وسیلهٔ پزشکی نیست و بیماری یا اختلال حافظه را تشخیص نمی‌دهد، پیشگیری نمی‌کند و درمان نمی‌کند. نتیجه‌ها فقط عملکرد شما در همین بازی را نشان می‌دهند. اگر دربارهٔ تغییر حافظه نگرانی دارید، با متخصص سلامت مشورت کنید.')),
 el('div',{class:'panel credits'},el('h2',{},'منابع تصویر و صدا'),el('p',{},'عکس واقعی: منظرهٔ هاینبورگ در هِسِن با کلیسای سنت وندلین؛ عکاس: دی‌گوندل؛ تاریخ عکس: ۲۹ ژوئن ۲۰۱۴. عکس برای نمایش کوچک و فشرده شده و در صفحه برش نمایشی دارد.'),el('p',{},el('a',{href:'https://commons.wikimedia.org/wiki/File:Hainburg_(Hessen),_Ortsansicht_mit_der_Kirche_St._Wendelinus.jpg',target:'_blank',rel:'noopener noreferrer'},'صفحهٔ اصلی عکس'), ' · ',el('a',{href:'https://creativecommons.org/licenses/by/4.0/',target:'_blank',rel:'noopener noreferrer'},'مجوز انتساب کریتیو کامنز ۴٫۰')),
 el('p',{},'نشانهٔ بازی و شکل‌های هندسی در همین پروژه ساخته شده‌اند. نمادهای تصویری کارت‌ها از شکلک‌های دستگاه استفاده می‌کنند؛ شکل آن‌ها ممکن است میان دستگاه‌ها فرق کند. در دستهٔ محلی، فقط کارت منظره یک عکس واقعی است.'),
 el('p',{},'قلم: وزیرمتن، با مجوز آزاد قلم. صدای فارسی: تولیدشده با گفتارساز پایپر و مدل «امیر»؛ گفتار محلی در بستهٔ بازی قرار دارد. همهٔ متن‌های شنیداری در فایل منبع صدا آمده‌اند.'),
 el('p',{},'دکمه‌های بیرونی منابع، برای بازشدن به اینترنت نیاز دارند؛ خود بازی به این صفحه‌ها وابسته نیست.')),
 el('div',{class:'actions'},button('راهنمای نصب روی آیفون',showInstall,'primary'),button('روش بازی',showRules)));
}
function render(){
 const route=location.hash.slice(1)||'home';
 if(route!=='play'&&screen==='play'&&game&&['ready','playing'].includes(game.status)){game.pause();persist();}
 clearTimers();audio.stop();screen=route;
 const screens={home:renderHome,categories:renderCategories,levels:levelsScreen,intro:introScreen,play:boardScreen,results:resultScreen,progress:progressScreen,settings:settingsScreen,about:aboutScreen};
 main.replaceChildren((screens[route]||renderHome)());applySettings();warning();
 main.querySelector('h1')?.setAttribute('tabindex','-1');main.querySelector('h1')?.focus({preventScroll:true});window.scrollTo(0,0);
 if(route==='results'&&game?.status==='completed')audio.play('complete');
}

$('#install-help').addEventListener('click',showInstall);
$('.skip-link').addEventListener('click',event=>{event.preventDefault();main.focus();});
$('#sound-button').addEventListener('click',toggleSound);
$('#version').textContent=`نسخهٔ ${fa(APP.version)}`;
window.addEventListener('hashchange',render);
window.addEventListener('beforeinstallprompt',event=>{event.preventDefault();deferredInstall=event;});
document.addEventListener('visibilitychange',()=>{if(document.hidden){if(game&&['ready','playing'].includes(game.status)){game.pause();clearTimers();persist();if(screen==='play')render();}audio.stop();}});
window.addEventListener('pagehide',()=>{if(game?.pause())persist();audio.stop();});
let ticks=0;
setInterval(()=>{if(!game||game.status!=='playing')return;const timer=$('#elapsed-time');if(timer)timer.textContent=timeText(game.getElapsed());if(++ticks%10===0)persist();},1000);
applySettings();render();
setupOffline({status:$('#offline-status'),retry:$('#retry-offline'),update:$('#update-app')});
