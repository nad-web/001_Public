/* Canonical vector scenes for the interactive lab and the original videos. MIT. */
(() => {
  const labs = Object.create(null);
  const { PI, sin, cos, sqrt, exp, log, abs, round, floor, min, max, hypot } = Math;
  const W = 720, H = 270, TAU = 2 * PI;
  const C = { ink: '#e9edf8', muted: '#acb9d8', grid: '#324364', violet: '#b3a4ff', mint: '#b9f590', blue: '#7ddaff', peach: '#ffb389' };
  const knob = (en, de, min, max, step, initial) => ({ en, de, min, max, step, initial });
  const put = (id, controls, draw) => { labs[id] = { controls, draw }; };
  const series = (n, fn) => Array.from({ length: n }, (_, i) => fn(i));
  const sum = list => list.reduce((a, b) => a + b, 0);
  const choose = (n, k) => k < 0 || k > n ? 0 : series(min(k, n-k), i => (n-i)/(i+1)).reduce((a,b) => a*b, 1);
  const logistic = z => 1 / (1 + exp(-z));
  const nformat = (x, lang, digits = 3) => Number.isFinite(x) ? new Intl.NumberFormat(lang, { maximumFractionDigits: digits, useGrouping: false }).format(abs(x) < 1e-12 ? 0 : x) : '—';
  function scene() {
    const marks = [];
    const line = (x1,y1,x2,y2,c='grid',w=2,dash=false) => marks.push(['line',x1,y1,x2,y2,c,w,dash]);
    const dot = (x,y,r=5,c='mint',stroke=null) => marks.push(['circle',x,y,r,c,stroke]);
    const rect = (x,y,w,h,c='violet',opacity=1,stroke=null) => marks.push(['rect',x,y,w,h,c,opacity,stroke]);
    const poly = (points,c='violet',w=3,fill=null,opacity=1) => {
      if (points.length > 1) marks.push(['poly',points,c,w,fill,opacity]);
    };
    const label = (x,y,txt,c='ink',size=17,anchor='middle') => marks.push(['text',x,y,String(txt),c,size,anchor]);
    function arrow(x,y,a,b,c='mint',w=3) {
      line(x,y,a,b,c,w);
      const theta = Math.atan2(b-y,a-x);
      if (hypot(a-x,b-y) > 8) poly([[a-10*cos(theta-.5),b-10*sin(theta-.5)],[a,b],[a-10*cos(theta+.5),b-10*sin(theta+.5)]],c,w);
    }
    return { marks,line,dot,rect,poly,label,arrow, note:'' };
  }
  function plot(s, [a,b], [c,d], lx='x',ly='y',equal=false) {
    const width=equal?min(596,203*(b-a)/(d-c)):596, height=equal?width*(d-c)/(b-a):203;
    const left=366-width/2, bottom=127.5+height/2;
    const X = x => left + width*(x-a)/(b-a), Y = y => bottom - height*(y-c)/(d-c);
    const pin = (x,y) => [X(x),Y(y)];
    const inside = (x,y) => x >= a-1e-9 && x <= b+1e-9 && y >= c-1e-9 && y <= d+1e-9;
    const tick = value => String(Number(value.toPrecision(4)));
    for (const i of [0,1,2,3,4]) {
      const x=a+(b-a)*i/4, y=c+(d-c)*i/4;
      s.line(X(x),Y(c),X(x),Y(d));
      s.line(X(a),Y(y),X(b),Y(y));
      s.label(X(x),bottom+20,tick(x),'muted',14);
      s.label(left-10,Y(y)+5,tick(y),'muted',14,'end');
    }
    if (a <= 0 && b >= 0) s.line(X(0),Y(c),X(0),Y(d),'muted',1);
    if (c <= 0 && d >= 0) s.line(X(a),Y(0),X(b),Y(0),'muted',1);
    s.label(left+width+29,bottom+19,lx,'muted',15);
    s.label(left-16,bottom-height-10,ly,'muted',15);
    function curve(fn,color='violet', from=a,to=b) {
      let seg=[];
      for (let i=0;i<=128;i++) {
        const x=from+(to-from)*i/128,y=fn(x);
        if (inside(x,y)) seg.push(pin(x,y));
        else if (seg.length) {s.poly(seg,color);seg=[];}
      }
      s.poly(seg,color);
    }
    const points = (pairs,color='mint') => pairs.filter(([x,y])=>inside(x,y)).forEach(([x,y])=>s.dot(...pin(x,y),5,color));
    const path = (pairs,color='mint',w=3) => s.poly(pairs.filter(([x,y])=>inside(x,y)).map(([x,y])=>pin(x,y)),color,w);
    const line = (x,y,u,v,color='mint',dash=false) => {
      if (inside(x,y)&&inside(u,v)) s.line(...pin(x,y),...pin(u,v),color,2,dash);
    };
    const area = (pairs,color='violet') => s.poly(pairs.map(([x,y])=>pin(x,y)),color,2,color,.26);
    const arrow = (x,y,u,v,color='mint') => {
      if (inside(x,y)&&inside(u,v)) s.arrow(...pin(x,y),...pin(u,v),color);
    };
    return { X,Y,pin,curve,points,path,line,area,arrow,inside };
  }
  function columns(s, values, labels, { colors=['violet'], ceiling, floor: lower } = {}) {
    const hi=ceiling ?? max(1,...values), lo=lower ?? min(0,...values);
    const x0=46, span=628, y=v=>220-(v-lo)/(hi-lo)*156;
    const baseline=y(0), w=span/values.length;
    s.line(x0-6,baseline,x0+span+6,baseline,'muted',1);
    values.forEach((v,i)=>{
      const x=x0+(i+.5)*w, yy=y(v), cap=min(65,w*.69);
      s.rect(x-cap/2,min(yy,baseline),cap,max(1,abs(baseline-yy)),colors[i%colors.length],.82);
      s.label(x, v < 0 ? yy+15 : yy-8,Number(v.toFixed(3)),'ink',values.length>12?12:16);
      if (labels[i] !== undefined) s.label(x,246,labels[i],'muted',values.length>12?12:15);
    });
  }
  function numberline(s,a,b,start,end,fmt) {
    const X=x=>55+610*(x-a)/(b-a);
    s.arrow(43,155,678,155,'muted',2);
    const step=max(1,Math.ceil((b-a)/16));
    for (let n=a;n<=b;n+=step) {
      s.line(X(n),149,X(n),161,'muted',1);
      s.label(X(n),183,fmt(n),'muted',14);
    }
    s.dot(X(start),155,6,'violet');s.dot(X(end),155,7,'mint');
    s.line(X(start),148,X(start),105,'violet',1,true);
    s.line(X(end),148,X(end),105,'mint',1,true);
    s.arrow(X(start),103,X(end),103,'mint');
    s.label(X(start),88,fmt(start),'violet',18);s.label(X(end),74,fmt(end),'mint',18);
  }
  function tiles(s, cols, rows, fn, { type='circle', scale=1 }={}) {
    const size=min(51,610/cols,205/rows)*scale, gap=min(7,size*.16);
    const ox=(W-cols*size)/2, oy=(H-rows*size)/2;
    for(let j=0;j<rows;j++) for(let i=0;i<cols;i++) {
      const cell=fn(i,j,j*cols+i);
      if(!cell)continue;
      const [color,txt] = Array.isArray(cell)?cell:[cell,''];
      const x=ox+i*size+size/2,y=oy+j*size+size/2;
      if(type==='circle')s.dot(x,y,(size-gap)/2,color);
      else s.rect(x-(size-gap)/2,y-(size-gap)/2,size-gap,size-gap,color,.85);
      if(txt!=='')s.label(x,y+5,txt,'ink',min(19,size*.44));
    }
  }
  function blocks(s, parts, active, color='violet', other='grid', y=118, secondary=0) {
    const gap=parts>25?2:4, width=min(610,parts*94), w=width/parts, x=(W-width)/2;
    for(let i=0;i<parts;i++)s.rect(x+i*w,y,w-gap,46,i<active?color:i<active+secondary?'mint':other,.88);
  }
  function flow(s, nodes, caption=[]) {
    const space=600/nodes.length, left=(W-space*(nodes.length-1))/2;
    nodes.forEach((text,i)=>{
      const x=left+i*space;
      s.rect(x-space*.31,112,space*.62,57,i===nodes.length-1?'mint':'violet',.16,i===nodes.length-1?'mint':'violet');
      s.label(x,147,text,'ink',min(21,Math.round((space*.69-8)/String(text).length*1.75)));
      if(i>0){s.arrow(x-space*.68,140,x-space*.36,140,'muted',2);if(caption[i-1])s.label(x-space*.5,104,caption[i-1],'muted',15);}
    });
  }
  function build(id, values, lang='en') {
    const lab=labs[id], s=scene(), fmt=(x,digits)=>nformat(x,lang,digits), t=(en,de)=>lang==='de'?de:en;
    s.note=lab.draw(s,values??lab.controls.map(k=>k.initial),fmt,t);
    return s;
  }
  Object.assign(MathMotion,{labs,put,knob,scene,plot,columns,numberline,tiles,blocks,flow,build,series,sum,choose,logistic,C,W,H,PI,TAU,sin,cos,sqrt,exp,log,abs,round,floor,min,max,hypot,nformat});
})();
