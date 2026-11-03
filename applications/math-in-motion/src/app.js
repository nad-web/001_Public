/* Math in Motion · copyright 2026 Noorullah Adel · MIT */
(() => {
  'use strict';
  const { lessons, groups, strands, labs, build, C, W, H, nformat, mediaGroup } = MathMotion;
  const byId = new Map(lessons.map(lesson => [lesson.id,lesson]));
  const languages = document.getElementById('languages');
  const root = document.getElementById('main');
  const STORAGE = 'noorullah.math-in-motion.';
  const modes = ['read','explore','watch'];
  const PAGE = 15;
  const words = {
    en: {
      skip:'Skip to content', nav:'Main navigation', lang:'Language', library:'Library', saved:'Saved', credits:'Credits & licenses',
      credit:'Developed and designed by Noorullah Adel · 2026',
      kicker:'A bilingual mathematics library', heroA:'See math', heroB:'in motion.',
      heroCopy:'From your first number line to neural networks. Read the idea, change the inputs, then watch it play out.',
      start:'Explore the library', featured:'Try compound interest', lessons:'lessons', levels:'learning levels', formats:'lesson formats', voiceCount:'narrations per lesson',
      paths:'Choose a learning level', pathHint:'Start anywhere and follow related topics.', subject:'Subject',
      search:'Search lessons', placeholder:'Try “fractions”, “Zinseszins” or “matrix”',
      all:'All subjects', clear:'Clear filters', more:'Show more lessons', noMatches:'No matching lessons. Try a different topic or clear the filters.',
      noSaved:'Save a lesson to find it here later. Bookmarks are stored in this browser.', savedTitle:'Saved lessons', showing:'of',
      back:'Back to library', save:'Save lesson', unsave:'Remove from saved', related:'Related lessons', relatedHint:'Explore the same subject at other levels.',
      read:'Read', explore:'Explore', watch:'Watch', formula:'Formula or definition', idea:'How it works', example:'Worked example',
      labIntro:'Move a slider to see how the diagram and result change.', reset:'Reset sliders', animate:'Play motion', stop:'Pause motion',
      videoLanguage:'Video language', voice:'Narration voice', male:'Masculine', female:'Feminine', english:'English', german:'German', transcript:'Video transcript',
      videoError:'The video could not load. Check your connection or open the MP4 directly.', videoLink:'Open MP4', chooseWatch:'This video includes on-screen captions.',
      notFound:'Lesson unavailable', notFoundBody:'Open the library to find a published lesson.',
      motionCue: name => `Watch how the diagram changes as we move the slider for ${name}.`,
      original:'The application code, diagrams, text and original lesson video productions are available under the MIT license, subject to the third-party notices.',
      tools:'Video voices are synthesized from publicly sourced voice models. The notes below identify the models, their recording sources, and the tools used at production time.',
      enAttribution:'English narration: John and LJ Speech voices by Bryce Beattie. The source recordings are identified as public domain by the respective model cards.',
      deAttribution:'German narration: Piper German MLS model, using two speakers from Multilingual LibriSpeech by Vineel Pratap and contributors, CC BY 4.0. The app distributes newly synthesized narration.',
      fontAttribution:'The videos render DejaVu Sans glyphs. The DejaVu project retains the applicable Bitstream Vera notices.',
      local:'Language, bookmarks and voice selection are stored locally in your browser. All lessons and media are served from this app folder.'
    },
    de: {
      skip:'Zum Inhalt springen', nav:'Hauptnavigation', lang:'Sprache', library:'Bibliothek', saved:'Merkliste', credits:'Mitwirkende & Lizenzen',
      credit:'Entwickelt und gestaltet von Noorullah Adel · 2026',
      kicker:'Eine zweisprachige Mathematikbibliothek', heroA:'Mathe', heroB:'in Bewegung.',
      heroCopy:'Vom ersten Zahlenstrahl bis zum neuronalen Netz. Lies die Erklärung, ändere die Werte und sieh zu, was passiert.',
      start:'Bibliothek entdecken', featured:'Zinseszins ausprobieren', lessons:'Lektionen', levels:'Lernstufen', formats:'Lernformate', voiceCount:'Sprachfassungen pro Lektion',
      paths:'Wähle eine Lernstufe', pathHint:'Steige überall ein und entdecke verwandte Themen.', subject:'Fachgebiet',
      search:'Lektionen suchen', placeholder:'Zum Beispiel „Brüche“, „Zinseszins“ oder „matrix“',
      all:'Alle Fachgebiete', clear:'Filter zurücksetzen', more:'Weitere Lektionen zeigen', noMatches:'Keine passenden Lektionen. Suche nach einem anderen Thema oder setze die Filter zurück.',
      noSaved:'Merke eine Lektion, um sie hier wiederzufinden. Die Merkliste wird in diesem Browser gespeichert.', savedTitle:'Gemerkt', showing:'von',
      back:'Zurück zur Bibliothek', save:'Lektion merken', unsave:'Aus Merkliste entfernen', related:'Verwandte Lektionen', relatedHint:'Entdecke dasselbe Fachgebiet auf anderen Lernstufen.',
      read:'Lesen', explore:'Entdecken', watch:'Ansehen', formula:'Formel oder Definition', idea:'So funktioniert es', example:'Durchgerechnetes Beispiel',
      labIntro:'Bewege einen Regler und sieh, wie sich die Grafik und das Ergebnis ändern.', reset:'Regler zurücksetzen', animate:'Animation starten', stop:'Animation anhalten',
      videoLanguage:'Videosprache', voice:'Erzählstimme', male:'Männlich', female:'Weiblich', english:'Englisch', german:'Deutsch', transcript:'Videotranskript',
      videoError:'Das Video konnte nicht geladen werden. Prüfe die Verbindung oder öffne die MP4-Datei direkt.', videoLink:'MP4 öffnen', chooseWatch:'Dieses Video enthält sichtbare Untertitel.',
      notFound:'Lektion nicht verfügbar', notFoundBody:'Öffne die Bibliothek, um eine veröffentlichte Lektion zu finden.',
      motionCue: name => `Beobachte, wie sich die Grafik ändert, wenn sich der Regler für ${name} bewegt.`,
      original:'App-Code, Grafiken, Texte und eigene Lektionen-Videoproduktionen stehen unter der MIT-Lizenz. Hinweise zu Drittmaterial bleiben gültig.',
      tools:'Die Videostimmen wurden mit öffentlich verfügbaren Sprachmodellen erzeugt. Die folgenden Hinweise nennen die Modelle, die Aufnahmen und die bei der Produktion verwendeten Werkzeuge.',
      enAttribution:'Englische Erzählstimmen: John und LJ Speech von Bryce Beattie. Laut den Modellkarten sind die Ausgangsaufnahmen gemeinfrei.',
      deAttribution:'Deutsche Erzählstimmen: Piper-Modell für deutsches MLS mit zwei Stimmen aus Multilingual LibriSpeech von Vineel Pratap und Mitwirkenden, CC BY 4.0. Die App enthält neu erzeugte Sprachaufnahmen.',
      fontAttribution:'Für die Schrift in den Videos wurde DejaVu Sans verwendet. Die zugehörigen Hinweise zu Bitstream Vera gelten weiterhin.',
      local:'Sprache, Merkliste und Stimmwahl bleiben lokal im Browser. Alle Lektionen und Medien werden aus diesem App-Ordner geladen.'
    }
  };
  function stored(key,fallback) {
    try { const value=localStorage.getItem(STORAGE+key);return value===null?fallback:JSON.parse(value); }
    catch { return fallback; }
  }
  function remember(key,value) {
    try { localStorage.setItem(STORAGE+key,JSON.stringify(value)); }
    catch { /* This session still works with storage disabled. */ }
  }
  const rawSaved=stored('saved',[]);
  const saved=new Set(Array.isArray(rawSaved)?rawSaved.filter(id=>byId.has(id)):[]);
  const storedVoices=stored('voices',{});
  const voices = {
    en:storedVoices?.en==='male'?'male':'female',
    de:storedVoices?.de==='male'?'male':'female'
  };
  let lang=stored('language','en')==='de'?'de':'en';
  const emptyFilters=()=>({level:'',subject:'',query:'',limit:PAGE});
  const libraryFilters=emptyFilters(), savedFilters=emptyFilters();
  let cleanup=()=>{};
  const t=key=>words[lang][key];
  const named=pair=>pair[lang==='de'?1:0];
  const levelName=id=>groups[id][lang==='de'?2:1];
  const lessonURL=(id,mode='read')=>`#lesson/${id}/${mode}`;
  const normalize=s=>s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/ß/g,'ss');
  const searchIndex=new Map(lessons.map(l=>[l.id,normalize([
    l.id,l.en.formula,l.de.formula,l.en.title,l.de.title,...strands[l.strand],...groups[l.level].slice(1)
  ].join(' '))]));
  const trail={
    fractions:['counting','equivalent-fractions','unlike-fractions'],
    percentages:['fractions','percent-change','compound-interest'],
    'compound-interest':['percentages','exponential','present-value','annuity'],
    derivative:['slope','limits','chain-rule','gradient-descent'],
    'gradient-descent':['derivative','gradient','least-squares','regularization'],
    determinant:['matrix-transform','vectors','eigenvectors'],
    eigenvectors:['vectors','matrix-transform','determinant','pca'],
    pca:['covariance','eigenvectors','dot-product'],
    'logistic-regression':['exponential','least-squares','cross-entropy','softmax'],
    attention:['dot-product','matrix-product','softmax'],
    'black-scholes':['present-value','normal-distribution','portfolio-risk'],
    fourier:['sinusoid','orthogonal-projection','heat-equation','wave-equation']
  };
  function el(tag,attrs={},...children) {
    const node=document.createElement(tag);
    Object.entries(attrs).forEach(([key,value])=>{
      if (value!==undefined && value!==null) node.setAttribute(key,String(value));
    });
    node.append(...children.filter(child=>child!==undefined&&child!==null));
    return node;
  }
  const button=(name,handler,classes='action')=>{
    const b=el('button',{type:'button',class:classes},name); b.addEventListener('click',handler);return b;
  };
  function initChrome() {
    document.documentElement.lang=lang;
    document.getElementById('skip').textContent=t('skip');
    document.querySelector('.header-nav').setAttribute('aria-label',t('nav'));
    document.getElementById('nav-library').textContent=t('library');
    document.getElementById('nav-saved').textContent=t('saved');
    document.getElementById('nav-credits').textContent=t('credits');
    document.getElementById('credit').textContent=t('credit');
    languages.setAttribute('aria-label',t('lang'));
    languages.querySelectorAll('button').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.lang===lang)));
  }
  function getRoute() {
    const [page,id,mode]=location.hash.slice(1).split('/');
    return {page,id,mode:modes.includes(mode)?mode:'read'};
  }
  function card(lesson) {
    return el('a',{class:'lesson-card',href:lessonURL(lesson.id)},
      el('span',{class:'level-num'},`${groups[lesson.level][0]}  ·  ${named(strands[lesson.strand])}`),
      el('h3',{},lesson[lang].title),
      el('span',{class:'mini-formula'},lesson[lang].formula),
      el('span',{class:'card-open'},`${t('read')} · ${t('explore')} · ${t('watch')} →`));
  }
  function hero() {
    return el('section',{class:'hero'},
      el('div',{class:'hero-content'},
        el('p',{class:'eyebrow'},el('span',{class:'orb','aria-hidden':true}),t('kicker')),
        el('h1',{},t('heroA'),' ',el('em',{},t('heroB'))),
        el('p',{class:'hero-copy'},t('heroCopy')),
        el('div',{class:'hero-actions'},
          el('a',{class:'action primary',href:'#library'},`${t('start')} ↓`),
          el('a',{class:'action ghost',href:lessonURL('compound-interest','explore')},`${t('featured')} →`))),
      document.getElementById('hero-art').content.cloneNode(true));
  }
  function browse(savedOnly) {
    const filters=savedOnly?savedFilters:libraryFilters;
    if (!savedOnly) {
      root.append(hero(),el('div',{class:'metrics'},
        ...[[lessons.length,'lessons'],[Object.keys(groups).length,'levels'],[3,'formats'],[4,'voiceCount']].map(([n,label])=>el('span',{class:'metric'},el('strong',{},n),t(label)))));
    }
    const section=el('section',{id:'library','aria-labelledby':'catalog-heading',tabindex:'-1'});
    const levels=el('div',{class:'level-grid'});
    const status=el('span',{'aria-live':'polite'});
    const cards=el('div',{class:'lesson-grid'});
    const empty=el('p',{class:'empty'});
    const more=button(t('more'),()=>{
      filters.limit+=PAGE;
      const firstNew=cards.childElementCount;
      redraw();
      cards.children[firstNew]?.focus();
    });
    const reset=button(t('clear'),()=>{
      Object.assign(filters,emptyFilters());query.value='';subject.value='';redraw();
      query.focus();
    },'plain');
    const query=el('input',{id:'lesson-search',type:'search',value:filters.query,placeholder:t('placeholder'),autocomplete:'off'});
    const subject=el('select',{id:'subject-filter'},el('option',{value:''},t('all')),
      ...Object.entries(strands).map(([id,label])=>el('option',{value:id},named(label))));
    subject.value=filters.subject;
    if (!savedOnly) {
      const heading=el('div',{class:'section-head'},el('h2',{},t('paths')),el('p',{},t('pathHint')));
      Object.entries(groups).forEach(([key,pair])=>{
        const count=lessons.filter(l=>l.level===key).length;
        const b=button('',()=>{filters.level=filters.level===key?'':key;filters.limit=PAGE;redraw();},'level-card');
        b.dataset.level=key;
        b.append(el('span',{class:'level-num'},pair[0]),el('strong',{},levelName(key)),el('span',{},`${count} ${t('lessons')}`));
        levels.append(b);
      });
      section.append(heading,levels);
    }
    section.append(el(savedOnly?'h1':'h2',{id:'catalog-heading',class:'catalog-title library-heading'},t(savedOnly?'savedTitle':'library')),
      el('div',{class:'controls'},el('label',{class:'field',for:'lesson-search'},t('search'),query),el('label',{class:'field',for:'subject-filter'},t('subject'),subject)),
      el('div',{class:'filter-meta'},status,reset),cards,empty,el('div',{class:'load-row'},more));
    root.append(section);
    query.addEventListener('input',()=>{filters.query=query.value;filters.limit=PAGE;redraw();});
    subject.addEventListener('change',()=>{filters.subject=subject.value;filters.limit=PAGE;redraw();});
    function redraw() {
      const terms=normalize(filters.query.trim()).split(/\s+/).filter(Boolean);
      const matched=lessons.filter(l=>(!savedOnly||saved.has(l.id))&&
        (savedOnly||!filters.level||l.level===filters.level)&&
        (!filters.subject||l.strand===filters.subject)&&terms.every(term=>searchIndex.get(l.id).includes(term)));
      const displayed=matched.slice(0,filters.limit);
      cards.replaceChildren(...displayed.map(card));
      levels.querySelectorAll('button').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.level===filters.level)));
      status.textContent=`${displayed.length} ${t('showing')} ${matched.length} ${t('lessons')}`;
      more.hidden=displayed.length===matched.length;
      reset.hidden=!filters.query&&!filters.subject&&(savedOnly||!filters.level);
      empty.hidden=matched.length>0;
      empty.textContent=t(savedOnly&&!saved.size?'noSaved':'noMatches');
    }
    redraw();
  }
  function svg(tag,attrs,text) {
    const node=document.createElementNS('http://www.w3.org/2000/svg',tag);
    Object.entries(attrs).forEach(([key,value])=>{if(value!==null&&value!==undefined)node.setAttribute(key,String(value));});
    if(text!==undefined)node.textContent=text;
    return node;
  }
  function paint(marks) {
    return marks.map(([type,...p])=>{
      if(type==='line'){
        const [x1,y1,x2,y2,c,w,dash]=p;
        return svg(type,{x1,y1,x2,y2,stroke:C[c],'stroke-width':w,'stroke-linecap':'round','stroke-dasharray':dash?'6 5':null});
      }
      if(type==='circle'){
        const [cx,cy,r,c,stroke]=p;return svg(type,{cx,cy,r,fill:C[c],stroke:C[stroke],'stroke-width':stroke?2:null});
      }
      if(type==='rect'){
        const [x,y,width,height,c,o,stroke]=p;return svg(type,{x,y,width,height,fill:C[c],'fill-opacity':o,stroke:C[stroke]});
      }
      if(type==='poly'){
        const [points,c,w,fill,opacity]=p;
        return svg('polyline',{points:points.map(pair=>pair.join(',')).join(' '),stroke:C[c],'stroke-width':w,fill:fill?C[fill]:'none','fill-opacity':opacity,'stroke-linejoin':'round','stroke-linecap':'round'});
      }
      const [x,y,content,c,size,anchor]=p;
      return svg('text',{x,y,fill:C[c],'font-size':size,'text-anchor':anchor},content);
    });
  }
  const formulaBlock=lesson=>el('div',{class:'formula-panel'},el('p',{class:'eyebrow'},t('formula')),el('div',{class:'formula'},lesson[lang].formula));
  function readLesson(lesson,panel) {
    const info=lesson[lang];
    panel.append(formulaBlock(lesson),el('h2',{},t('idea')),el('p',{},info.explanation),
      el('div',{class:'worked'},el('h2',{},t('example')),el('p',{},info.example)));
  }
  function labLesson(lesson,panel) {
    const def=labs[lesson.id], vals=def.controls.map(k=>k.initial);
    let timer=null;
    const diagram=svg('svg',{class:'plot',viewBox:`0 0 ${W} ${H}`,role:'img','aria-label':lesson[lang].title});
    const note=el('output',{class:'lab-note','aria-live':'polite'});
    const sliders=el('div',{class:'slider-grid'});
    const fields=def.controls.map((k,i)=>{
      const id=`lab-knob-${i}`,value=el('span',{class:'slider-value','aria-hidden':'true'},nformat(vals[i],lang));
      const input=el('input',{type:'range',id,min:k.min,max:k.max,step:k.step,value:k.initial});
      const label=el('label',{class:'slider',for:id},el('div',{},el('span',{},k[lang]),value),input);
      input.addEventListener('input',()=>{halt();vals[i]=Number(input.value);update();});
      sliders.append(label);
      return {input,value};
    });
    const motion=button(t('animate'),()=>{
      if (timer!==null) {halt();return;}
      const k=def.controls[0],span=Math.floor((k.max-k.min)/k.step+1e-8);
      let frame=0;
      note.setAttribute('aria-live','off');
      motion.textContent=t('stop');
      timer=window.setInterval(()=>{
        frame++;
        const pos=(1-Math.cos(frame*Math.PI/21))/2;
        vals[0]=Number((k.min+Math.round(pos*span)*k.step).toFixed(8));
        update();
        if(frame===42)halt();
      },100);
    });
    function halt() {
      if(timer!==null) window.clearInterval(timer);
      timer=null; motion.textContent=t('animate');note.setAttribute('aria-live','polite');
    }
    const reset=button(t('reset'),()=>{
      halt();def.controls.forEach((k,i)=>{vals[i]=k.initial;});update();
    },'action ghost');
    function update(){
      const scene=build(lesson.id,vals,lang);
      diagram.replaceChildren(...paint(scene.marks));
      note.textContent=scene.note;
      fields.forEach(({input,value},i)=>{input.value=vals[i];value.textContent=nformat(vals[i],lang);});
    }
    panel.append(formulaBlock(lesson),el('p',{},t('labIntro')),diagram,note,sliders,el('div',{class:'lab-actions'},motion,reset));
    update();
    cleanup=halt;
  }
  function watchLesson(lesson,panel) {
    const language=el('select',{id:'video-language'},
      el('option',{value:'en'},t('english')),el('option',{value:'de'},t('german')));
    language.value=lang;
    const select=el('select',{id:'voice-select'},el('option',{value:'female'},t('female')),el('option',{value:'male'},t('male')));
    const clip=el('video',{class:'video-box',controls:'',playsinline:'',preload:'metadata',width:'608',height:'416'});
    const error=el('p',{hidden:'',role:'status'},t('videoError'));
    const mp4=el('a',{class:'action ghost',target:'_blank',rel:'noopener'},t('videoLink'));
    const transcript=el('div',{});
    function load(){
      const videoLang=language.value,local=lesson[videoLang],word=words[videoLang];
      select.value=voices[videoLang];
      const source=`./media/${mediaGroup(lesson.level,videoLang)}/${videoLang}-${voices[videoLang]}/${lesson.id}.mp4`;
      error.hidden=true;
      mp4.href=source;
      clip.setAttribute('aria-label',local.title);
      clip.src=source;
      transcript.lang=videoLang;
      transcript.replaceChildren(el('p',{},local.explanation),
        el('p',{},word.motionCue(labs[lesson.id].controls[0][videoLang])),el('p',{},local.example));
    }
    clip.addEventListener('error',()=>{error.hidden=false;});
    language.addEventListener('change',load);
    select.addEventListener('change',()=>{voices[language.value]=select.value;remember('voices',voices);load();});
    panel.append(el('div',{class:'video-toolbar'},
      el('label',{class:'field',for:'video-language'},t('videoLanguage'),language),
      el('label',{class:'field',for:'voice-select'},t('voice'),select)),
      clip,error,el('div',{class:'lab-actions'},mp4),
      el('details',{},el('summary',{},t('transcript')),el('p',{},t('chooseWatch')),transcript));
    load();
    cleanup=()=>{clip.pause();clip.removeAttribute('src');clip.load();};
  }
  function showLesson(lesson,mode) {
    const breadcrumb=el('a',{class:'breadcrumb',href:'#library'},`← ${t('back')}`);
    const saveButton=button('',()=>{
      if(saved.has(lesson.id))saved.delete(lesson.id);else saved.add(lesson.id);
      remember('saved',[...saved]);drawSaved();
    },'action ghost');
    function drawSaved(){const yes=saved.has(lesson.id);saveButton.textContent=t(yes?'unsave':'save');saveButton.setAttribute('aria-pressed',String(yes));}
    drawSaved();
    const heading=el('div',{class:'lesson-heading'},el('div',{},
      el('p',{class:'eyebrow'},`${levelName(lesson.level)}  ·  ${named(strands[lesson.strand])}`),
      el('h1',{},lesson[lang].title)),saveButton);
    const panel=el('div',{class:'tab-body',id:'active-panel',role:'tabpanel','aria-labelledby':`tab-${mode}`,tabindex:'0'});
    const tabs=el('div',{class:'tabs',role:'tablist','aria-label':lesson[lang].title});
    modes.forEach((id,index)=>{
      const b=button(t(id),()=>{location.hash=lessonURL(lesson.id,id);},'');
      b.setAttribute('role','tab');
      b.setAttribute('id',`tab-${id}`);
      b.setAttribute('aria-selected',String(id===mode));
      b.setAttribute('tabindex',id===mode?'0':'-1');
      if(id===mode)b.setAttribute('aria-controls','active-panel');
      b.addEventListener('keydown',e=>{
        let next;
        if(e.key==='ArrowLeft')next=modes[(index+2)%3];
        else if(e.key==='ArrowRight')next=modes[(index+1)%3];
        else if(e.key==='Home')next=modes[0];
        else if(e.key==='End')next=modes[2];
        else return;
        e.preventDefault();location.hash=lessonURL(lesson.id,next);
      });
      tabs.append(b);
    });
    const similar=trail[lesson.id]?.map(id=>byId.get(id)).filter(Boolean) ??
      lessons.filter(l=>l.id!==lesson.id&&l.strand===lesson.strand).sort((a,b)=>Number(b.level===lesson.level)-Number(a.level===lesson.level)).slice(0,4);
    const side=el('aside',{class:'side-panel'},el('h2',{},t('related')),
      ...similar.map(l=>el('a',{href:lessonURL(l.id)},`${l[lang].title} →`)),el('p',{class:'small'},t('relatedHint')));
    root.append(breadcrumb,heading,el('div',{class:'lesson-layout'},el('section',{class:'lesson-shell'},tabs,panel),side));
    ({read:readLesson,explore:labLesson,watch:watchLesson})[mode](lesson,panel);
  }
  function credits() {
    const url=(href,label)=>el('a',{href},label);
    root.append(el('article',{class:'credits'},
      el('a',{class:'breadcrumb',href:'#library'},`← ${t('back')}`),
      el('h1',{},t('credits')),el('p',{},t('credit')),
      el('h2',{},'MIT'),el('p',{},t('original'),' ',url('./LICENSE','MIT License')),
      el('h2',{},lang==='de'?'Sprachaufnahmen und Produktion':'Narration and production'),
      el('p',{},t('tools')),
      el('ul',{},el('li',{},t('enAttribution'),' ',url('https://brycebeattie.com/files/tts/','Bryce Beattie')),
        el('li',{},t('deAttribution'),' ',url('https://www.openslr.org/94/','Multilingual LibriSpeech')),
        el('li',{},t('fontAttribution'),' ',url('https://dejavu-fonts.github.io/License.html','DejaVu Fonts'))),
      el('p',{},url('./THIRD_PARTY_NOTICES.md',t('credits'))),el('p',{},t('local'))));
  }
  let current=getRoute();
  function render() {
    cleanup();cleanup=()=>{};
    initChrome();root.replaceChildren();
    const lesson=current.page==='lesson'&&byId.get(current.id);
    if(lesson){document.title=`${lesson[lang].title} · Math in Motion`;showLesson(lesson,current.mode);}
    else {
      document.title='Math in Motion · Noorullah Adel';
      if(current.page==='credits')credits();
      else if(current.page==='lesson'){
        root.append(el('h1',{},t('notFound')),el('p',{},t('notFoundBody')),el('a',{class:'action primary',href:'#library'},t('back')));
      } else browse(current.page==='saved');
    }
  }
  languages.addEventListener('click',e=>{
    const b=e.target.closest('button[data-lang]');
    if(!b||lang===b.dataset.lang)return;
    lang=b.dataset.lang;remember('language',lang);render();
  });
  window.addEventListener('hashchange',()=>{
    const next=getRoute();
    const sameLesson=next.page==='lesson'&&current.page==='lesson'&&next.id===current.id;
    current=next;render();
    if(next.page==='library'){
      const section=document.getElementById('library');section?.scrollIntoView();section?.focus({preventScroll:true});
    }else if(sameLesson){
      document.getElementById(`tab-${next.mode}`)?.focus({preventScroll:true});
    }else{
      window.scrollTo(0,0);root.focus({preventScroll:true});
    }
  });
  document.getElementById('skip').addEventListener('click',e=>{e.preventDefault();root.focus();root.scrollIntoView();});
  document.getElementById('nav-library').addEventListener('click',()=>{
    if(location.hash==='#library')document.getElementById('library')?.scrollIntoView();
  });
  render();
  if(current.page==='library')document.getElementById('library')?.scrollIntoView();
})();
