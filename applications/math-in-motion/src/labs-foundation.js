(() => {
  const {put,knob:k,plot,columns,numberline,tiles,blocks,flow,series,sum,choose,PI,TAU,sin,cos,sqrt,abs,floor,round,min,max,hypot}=MathMotion;
  const amount=(initial=5,min=1,max=12)=>k('Amount','Anzahl',min,max,1,initial);
  const width=(initial=5)=>k('Width','Breite',1,9,1,initial), height=(initial=3)=>k('Height','Höhe',1,8,1,initial);
  const digit=(en,de,value)=>k(en,de,0,9,1,value);
  const theta=(initial=30,lo=0,hi=360)=>k('Angle in degrees','Winkel in Grad',lo,hi,1,initial);
  const pct=(initial=15)=>k('Rate (%)','Satz (%)',0,100,1,initial);
  const steps=(initial=4,maximum=12)=>k('Steps','Schritte',1,maximum,1,initial);
  const capital=k('Principal (€)','Anfangskapital (€)',100,2500,50,1000);
  const years=k('Years','Jahre',1,15,1,3);
  const rate=k('Annual rate (%)','Jahreszins (%)',0,15,.5,5);
  const fmtList=(xs,f)=>xs.map(x=>f(x)).join(', ');
  const addLine=(id,a,b,minus=false)=>{
    put(id,[a,b],(s,[x,y],f)=>{
      const z=minus?x-y:x+y;
      numberline(s,min(-2,x,z)-1,max(12,x,z)+1,x,z,f);
      return `${f(x)} ${minus?'−':'+'} (${f(y)}) = ${f(z)}`;
    });
  };
  put('counting',[amount(5,1,30)],(s,[n],f,t)=>{
    tiles(s, min(10,n),Math.ceil(n/10),(i,j,idx)=>idx<n?(idx===n-1?'mint':'violet'):null);
    return t(`${n} counters`,`${n} Plättchen`);
  });
  put('place-value',[digit('Hundreds','Hunderter',2),digit('Tens','Zehner',4),digit('Ones','Einer',7)],(s,[a,b,c],f,t)=>{
    columns(s,[100*a,10*b,c],['×100','×10','×1'],{colors:['violet','blue','mint'],ceiling:900});
    return `${a} × 100 + ${b} × 10 + ${c} = ${a*100+b*10+c}`;
  });
  addLine('addition',amount(4,0,15),k('Add','Plus',0,12,1,3));
  addLine('subtraction',amount(9,0,18),k('Take away','Minus',0,9,1,3),true);
  addLine('signed-numbers',k('Starting value','Startwert',-10,10,1,2),k('Change','Änderung',-10,10,1,-5));
  put('absolute-value',[k('Position','Position',-12,12,1,-6)],(s,[x],f)=>{
    numberline(s,-12,12,0,x,f);return `abs(${x}) = ${abs(x)}`;
  });
  put('multiplication',[width(4),height(3)],(s,[a,b])=>{
    tiles(s,a,b,(i,j)=>j%2?'blue':'violet');
    return `${a} × ${b} = ${a*b}`;
  });
  put('division',[amount(14,1,28),k('Group size','Gruppengröße',2,8,1,3)],(s,[a,b],f,t)=>{
    const q=floor(a/b),r=a%b;
    tiles(s,b,Math.ceil(a/b),(i,j,idx)=>idx>=a?null:j>=q?'mint':j%2?'blue':'violet');
    return t(`${a} = ${q} × ${b} + ${r} · remainder ${r}`,`${a} = ${q} × ${b} + ${r} · Rest ${r}`);
  });
  put('fractions',[k('Selected parts','Gewählte Teile',0,4,1,3),k('Equal parts','Gleich große Teile',4,10,1,4)],(s,[a,b],f)=> {
    blocks(s,b,a);return `${a}/${b} = ${f(a/b)}`;
  });
  put('equivalent-fractions',[k('Selected quarters','Gewählte Viertel',1,4,1,2),k('Subdivisions','Unterteilungen',1,6,1,2)],(s,[a,b])=>{
    blocks(s,4,a,'violet','grid',65);blocks(s,4*b,a*b,'mint','grid',152);
    return `${a}/4 = ${a*b}/${4*b}`;
  });
  put('fraction-addition',[k('First share','Erster Anteil',0,2,1,1),k('Second share','Zweiter Anteil',0,3,1,2)],(s,[a,b])=>{
    blocks(s,5,a,'violet','grid',110,b);return `${a}/5 + ${b}/5 = ${a+b}/5`;
  });
  put('decimals',[digit('Tenths','Zehntel',3),digit('Hundredths','Hundertstel',7)],(s,[a,b],f)=>{
    tiles(s,10,10,(i,j,idx)=>idx<10*a?'violet':idx<10*a+b?'mint':'grid',{type:'rect'});
    return `${a}/10 + ${b}/100 = ${f((10*a+b)/100,2)}`;
  });
  put('rounding',[k('Whole number','Ganze Zahl',0,99,1,37)],(s,[n],f)=>{
    const low=10*floor(n/10), near=10*floor((n+5)/10);
    numberline(s,low,low+10,n,near,f);return `${n} → ${near}`;
  });
  put('metric-units',[k('Meters','Meter',.1,2.5,.05,1.25)],(s,[m],f)=>{
    const cm=round(m*100), x=v=>55+610*v/250;
    s.line(x(0),120,x(250),120,'muted',2);
    for(let i=0;i<=250;i+=5){s.line(x(i),120,x(i),i%50?128:144,'muted',1);if(i%50===0)s.label(x(i),169,i,'muted',15);}
    s.arrow(x(0),97,x(cm),97,'mint');s.label(x(cm),77,`${cm} cm`,'mint',21);
    return `${f(m)} m = ${cm} cm`;
  });
  function rectangle(id,perimeter) {
    put(id,[width(),height()],(s,[a,b],f,t)=>{
      const u=min(58,560/a,193/b),x=(720-a*u)/2,y=(270-b*u)/2;
      s.rect(x,y,a*u,b*u,'violet',.22,perimeter?'mint':'violet');
      if(!perimeter)for(let i=0;i<a;i++)for(let j=0;j<b;j++)s.rect(x+i*u,y+j*u,u,u,'violet',.14,'violet');
      s.label(360,y-9,a,'mint',18);s.label(x+a*u+20,135,b,'mint',18);
      return perimeter?`2 × (${a} + ${b}) = ${2*(a+b)}`:`${a} × ${b} = ${a*b}`;
    });
  }
  rectangle('perimeter',true);rectangle('rectangle-area',false);
  put('box-volume',[width(4),height(3),k('Layers','Schichten',1,6,1,2)],(s,[a,b,c])=>{
    const u=min(36,340/a,140/(b+c)),dx=u*.5,dy=u*.37;
    const O=[360-a*u/2-b*dx/2,199+b*dy/2];
    const p=(i,j,h)=>[O[0]+i*u+j*dx,O[1]-j*dy-h*u*.6];
    for(let h=0;h<c;h++){
      for(let i=0;i<a;i++)s.poly([p(i,0,h),p(i+1,0,h),p(i+1,0,h+1),p(i,0,h+1),p(i,0,h)],'violet',1,'violet',.38);
      for(let j=0;j<b;j++)s.poly([p(a,j,h),p(a,j+1,h),p(a,j+1,h+1),p(a,j,h+1),p(a,j,h)],'blue',1,'blue',.3);
    }
    for(let i=0;i<a;i++)for(let j=0;j<b;j++)s.poly([p(i,j,c),p(i+1,j,c),p(i+1,j+1,c),p(i,j+1,c),p(i,j,c)],'mint',1,'mint',.28);
    return `${a} × ${b} × ${c} = ${a*b*c}`;
  });
  put('time-elapsed',[k('End minutes after 09:00','Ende in Minuten nach 09:00',20,105,1,65)],(s,[b],f,t)=>{
    const X=x=>55+610*x/110;
    s.line(X(0),149,X(110),149,'muted');
    for(let m=0;m<=100;m+=20){s.line(X(m),142,X(m),156,'muted');s.label(X(m),180,`${9+floor(m/60)}:${String(m%60).padStart(2,'0')}`,'muted',16);}
    s.arrow(X(20),108,X(b),108,'mint');s.label((X(20)+X(b))/2,88,`${b-20} min`,'mint',22);
    return t(`Elapsed time: ${b-20} min`,`Vergangene Zeit: ${b-20} min`);
  });
  put('skip-counting',[amount(2,0,6),k('Common step','Schrittweite',1,7,1,3)],(s,[a,d],f)=>{
    const v=series(6,i=>a+i*d);columns(s,v,['1','2','3','4','5','6'],{colors:['violet','blue'],ceiling:42});
    return fmtList(v,f);
  });
  put('symmetry',[k('Horizontal position','Waagerechte Position',1,6,1,2)],(s,[a],f)=>{
    const p=plot(s,[-8,8],[-2,6],'x','y',true);p.path([[0,1],[a,2],[a+1,4],[0,1]],'violet');p.path([[0,1],[-a,2],[-a-1,4],[0,1]],'mint');p.points([[a,2],[-a,2]]);
    return `(${a}, 2) → (${-a}, 2)`;
  });
  put('gcd',[amount(24,4,44),k('Divisor','Teiler',2,24,1,18)],(s,[a,b])=>{
    let x=a,y=b;
    const rem=[];
    while(y){rem.push([x,y,x%y]);[x,y]=[y,x%y];}
    columns(s,rem.map(r=>r[2]),rem.map((r,i)=>String(i+1)),{colors:['violet','blue','mint'],ceiling:max(a,b)});
    return rem.map(([m,n,r])=>`${m} mod ${n} = ${r}`).join(' → ') + ` · gcd = ${x}`;
  });
  put('unlike-fractions',[k('First denominator','Erster Nenner',2,6,1,2),k('Second denominator','Zweiter Nenner',2,6,1,3)],(s,[a,b])=>{
    blocks(s,a*b,b,'violet','grid',110,a);
    return `1/${a} + 1/${b} = ${a+b}/${a*b}`;
  });
  put('ratios',[k('Scale','Streckfaktor',1,9,1,2)],(s,[n])=>{
    columns(s,[2,3,2*n,3*n],['a','b','ka','kb'],{colors:['violet','mint'],ceiling:28});return `2 : 3 = ${2*n} : ${3*n}`;
  });
  put('percentages',[pct(),k('Base amount','Grundwert',25,500,5,200)],(s,[a,b],f)=>{
    tiles(s,10,10,(i,j,idx)=>idx<a?'mint':'grid',{type:'rect'});
    return `${f(a)} % × ${f(b)} = ${f(a*b/100)}`;
  });
  put('percent-change',[k('Original','Ausgangswert',10,160,5,80),k('New value','Neuer Wert',0,180,5,100)],(s,[a,b],f,t)=>{
    columns(s,[a,b],[t('Before','Vorher'),t('After','Nachher')],{colors:['violet','mint'],ceiling:180});
    return `${f(100*(b-a)/a,2)} %`;
  });
  put('distributive',[height(4),k('First width','Erste Breite',1,6,1,3),k('Second width','Zweite Breite',1,6,1,2)],(s,[a,b,c])=>{
    tiles(s,b+c,a,i=>i<b?'violet':'mint',{type:'rect'});
    return `${a} × (${b} + ${c}) = ${a*b} + ${a*c} = ${a*(b+c)}`;
  });
  put('linear-equation',[k('Coefficient','Koeffizient',1,8,1,3),k('Constant','Konstante',0,9,1,2),k('Right side','Rechte Seite',0,30,1,14)],(s,[a,b,c],f)=>{
    flow(s,[`${a}x + ${b} = ${c}`,`${a}x = ${c-b}`,`x = ${f((c-b)/a)}`],[`− ${b}`,`÷ ${a}`]);return `x = ${f((c-b)/a)}`;
  });
  put('slope',[k('Rise','Anstieg',-6,6,1,6),k('Run','Laufweite',1,6,1,3)],(s,[a,b],f)=>{
    const p=plot(s,[-1,7],[-8,8]);
    p.curve(x=>a*x/b);p.line(0,0,b,0,'blue',true);p.line(b,0,b,a,'mint',true);p.points([[0,0],[b,a]]);
    return `m = ${a}/${b} = ${f(a/b)}`;
  });
  put('triangle-area',[width(8),height(3)],(s,[a,b],f)=>{
    const u=min(60,530/a,190/b),x=(720-a*u)/2,y=(270+b*u)/2;
    s.poly([[x,y],[x+a*u,y],[x,y-b*u],[x,y]],'mint',2,'mint',.28);
    s.poly([[x+a*u,y],[x+a*u,y-b*u],[x,y-b*u],[x+a*u,y]],'violet',2,'violet',.24);
    s.label(360,y+21,a,'mint');s.label(x-19,135,b,'mint');
    return `A = ${a} × ${b}/2 = ${f(a*b/2)}`;
  });
  put('pythagoras',[width(3),height(4)],(s,[a,b],f)=>{
    const corners=[[0,0],[a,0],[0,b]];
    const squares=corners.map(([x,y],i)=>{
      const [u,v]=corners[(i+1)%3], dx=v-y, dy=x-u;
      return [[x,y],[u,v],[u+dx,v+dy],[x+dx,y+dy]];
    });
    const vertices=squares.flat(), xs=vertices.map(p=>p[0]), ys=vertices.map(p=>p[1]);
    const left=min(...xs),right=max(...xs),bottom=min(...ys),top=max(...ys);
    const q=min(570/(right-left),212/(top-bottom));
    const fit=([x,y])=>[360+q*(x-(right+left)/2),135-q*(y-(top+bottom)/2)];
    const colors=['violet','mint','blue'];
    squares.forEach((square,i)=>{
      const points=square.map(fit),color=colors[i];
      s.poly([...points,points[0]],color,2,color,.26);
      const [x,y]=fit([(square[0][0]+square[2][0])/2,(square[0][1]+square[2][1])/2]);
      s.label(x,y+6,[a*a,a*a+b*b,b*b][i],color,17);
    });
    s.poly([...corners,corners[0]].map(fit),'ink',2);
    return `${a}² + ${b}² = ${a*a+b*b} · c = ${f(hypot(a,b))}`;
  });
  put('circles',[k('Radius','Radius',1,8,.25,3)],(s,[r],f)=>{
    s.dot(360,135,13*r,'violet','mint');s.dot(360,135,4,'ink');s.arrow(360,135,360+13*r,135,'ink');
    return `r = ${f(r)} · U ≈ ${f(TAU*r,2)} · A ≈ ${f(PI*r*r,2)}`;
  });
  put('similarity',[k('Scale factor','Streckfaktor',.5,3,.1,2)],(s,[a],f)=>{
    const draw=(x,y,u,color)=>s.poly([[x,y],[x+78*u,y],[x,y-54*u],[x,y]],color,2,color,.24);
    draw(140,208,1,'violet');draw(375,208,a,'mint');return `k = ${f(a)} · k² = ${f(a*a)}`;
  });
  put('mean-median',[k('Largest observation','Größte Beobachtung',3,20,1,10)],(s,[z],f,t)=>{
    const m=(2+3+z)/3;columns(s,[2,3,z],['x₁','x₂','x₃'],{colors:['violet','mint','violet'],ceiling:20});
    const yy=220-m*156/20;s.line(47,yy,675,yy,'peach',2,true);
    return t(`Mean ${f(m)} · median 3`,`Mittelwert ${f(m)} · Median 3`);
  });
  put('simple-probability',[k('Favorable faces','Günstige Seiten',0,6,1,3)],(s,[n],f)=>{
    tiles(s,6,1,i=>[i<n?'violet':'grid',String(i+1)],{type:'rect'});return `P = ${n}/6 = ${f(n/6)}`;
  });
  put('sample-space',[k('First choices','Erste Auswahl',1,6,1,2),k('Second choices','Zweite Auswahl',1,7,1,3)],(s,[a,b])=>{
    tiles(s,b,a,(i,j)=>[j%2?'blue':'violet',`${String.fromCharCode(65+j)}${i+1}`],{type:'rect'});return `${a} × ${b} = ${a*b}`;
  });
  function interest(id,compound) {
    put(id,[capital,rate,years],(s,[a,p,n],f,t)=>{
      const r=p/100,calc=x=>compound?a*(1+r)**x:a*(1+r*x), total=calc(n);
      const pnt=plot(s,[0,16],[0,max(1000,total*1.24)],t('year','Jahr'),'€');
      const pairs=series(n+1,i=>[i,calc(i)]);
      pnt.path(pairs,'violet');pnt.points(pairs);
      return t(`Year ${n}: €${f(total,2)} · interest €${f(total-a,2)}`,`Jahr ${n}: ${f(total,2)} € · Zinsen ${f(total-a,2)} €`);
    });
  }
  interest('simple-interest',false);interest('compound-interest',true);
})();
