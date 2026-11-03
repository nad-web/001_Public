(() => {
  const {put,knob:k,plot,columns,numberline,flow,tiles,series,sum,choose,logistic,PI,TAU,sin,cos,sqrt,abs,exp,log,floor,min,max,hypot}=MathMotion;
  const real=(en,de,min,max,initial,step=.1)=>k(en,de,min,max,step,initial);
  const int=(en,de,min,max,initial)=>real(en,de,min,max,initial,1);
  const years=int('Years','Jahre',1,12,3), rate=real('Rate (%)','Zinssatz (%)',0,20,10,.5);
  const amount=int('Payment (€)','Zahlung (€)',50,200,110), at=real('Input x','Eingabe x',-3,3,1);
  const step=(n=4)=>int('Iteration','Iteration',0,10,n);
  put('present-value',[rate,years],(s,[p,n],f,t)=>{
    const v=110/(1+p/100)**n;
    columns(s,[v,110],[t('Present','Heute'),t('Future','Zukunft')],{colors:['mint','violet'],ceiling:120});
    return `PV = ${f(v,2)} €`;
  });
  put('annuity',[years,rate,amount],(s,[n,p,c],f)=>{
    const v=series(n,i=>c/(1+p/100)**(i+1));
    columns(s,v,v.map((_,i)=>i+1),{ceiling:c});
    return `PV = ${f(sum(v),2)} €`;
  });
  put('npv',[rate,amount],(s,[p,c],f,t)=>{
    const v=c/(1+p/100);
    columns(s,[-100,v],['t = 0','t = 1'],{colors:['peach','mint'],ceiling:205,floor:-125});return `NPV = ${f(v-100,2)} €`;
  });
  put('portfolio-risk',[real('Correlation','Korrelation',-1,1,0,.05),int('First weight (%)','Erstes Gewicht (%)',0,100,50)],(s,[r,n],f)=>{
    const fn=x=>.04*x*x+.04*(1-x)**2+.08*x*(1-x)*r,p=plot(s,[0,1],[0,.046],'w₁','σ²');
    p.curve(fn);p.points([[n/100,fn(n/100)]]);return `σₚ ≈ ${f(100*sqrt(max(0,fn(n/100))),2)} %`;
  });
  const normalCdf=x=>{
    const t=1/(1+.2316419*abs(x)),p=1-exp(-x*x/2)/sqrt(2*PI)*(t*(.319381530+t*(-.356563782+t*(1.781477937+t*(-1.821255978+t*1.330274429)))));
    return x>=0?p:1-p;
  };
  put('black-scholes',[real('Volatility (%)','Volatilität (%)',5,75,20,1),int('Spot (€)','Kurs (€)',65,135,100)],(s,[v,S],f)=>{
    const sig=v/100,call=x=>x*normalCdf((log(x/100)+sig*sig/2)/sig)-100*normalCdf((log(x/100)-sig*sig/2)/sig);
    const p=plot(s,[60,140],[0,65],'S','C');p.curve(call);p.curve(x=>max(0,x-100),'blue');p.points([[S,call(S)]]);
    return `K = 100 · T = 1 · r = 0 · C ≈ ${f(call(S),2)} €`;
  });
  put('newton',[real('Starting point','Startwert',.4,3,2,.05),step(1)],(s,[x,n],f)=>{
    const p=plot(s,[0,4],[-3,10]);p.curve(x=>x*x-2);
    for(let i=0;i<n;i++){const nx=(x+2/x)/2;p.line(x,x*x-2,nx,0,'blue');p.line(nx,0,nx,nx*nx-2,'mint',true);x=nx;}
    p.points([[x,0]]);return `xₖ ≈ ${f(x,6)}`;
  });
  put('bisection',[step(1)],(s,[n],f)=>{
    const p=plot(s,[.8,2.2],[-1.5,3]);p.curve(x=>x*x-2);let a=1,b=2;
    for(let i=0;i<n;i++){const m=(a+b)/2;if(m*m<2)a=m;else b=m;}
    p.line(a,0,b,0,'mint');p.points([[a,0],[b,0]],'mint');return `[${f(a,5)} ; ${f(b,5)}] · Δ = ${f(b-a,5)}`;
  });
  put('euler-method',[real('Step size','Schrittweite',.1,.7,.25,.05)],(s,[h],f)=>{
    const p=plot(s,[0,4],[0,1.12],'t','y');p.curve(x=>exp(-x));
    const coords=series(floor(4/h)+1,i=>[i*h,(1-h)**i]);p.path(coords);p.points(coords);
    return `y₁ = ${f(1-h)} · y(h) ≈ ${f(exp(-h))}`;
  });
  put('trapezoid-rule',[int('Subintervals','Teilintervalle',1,20,3)],(s,[n],f)=>{
    const p=plot(s,[0,1],[0,1.08]),h=1/n;p.curve(x=>x*x,'mint');let a=0;
    for(let i=0;i<n;i++){const x=i*h,y=(i+1)*h;p.area([[x,0],[y,0],[y,y*y],[x,x*x],[x,0]]);a+=h*(x*x+y*y)/2;}
    return `Tₙ ≈ ${f(a,6)} · ∫ = 1/3`;
  });
  put('gradient-descent',[real('Learning rate η','Lernrate η',.05,1.3,.25,.05),step(5)],(s,[eta,n],f,t)=>{
    const p=plot(s,[-5,5],[0,26]),xs=series(n+1,i=>3*(1-2*eta)**i);p.curve(x=>x*x);p.path(xs.map(x=>[x,x*x]),'blue');p.points(xs.map(x=>[x,x*x]));
    return `x₀ = 3 · xₖ ≈ ${f(xs[xs.length-1])} · ${eta>=1?t('no convergence','keine Konvergenz'):t('converges to 0','konvergiert gegen 0')}`;
  });
  put('lagrange-multipliers',[int('Angle in degrees','Winkel in Grad',0,360,45)],(s,[d],f)=>{
    const t=d*PI/180,x=cos(t),y=sin(t),p=plot(s,[-1.65,1.65],[-1.65,1.65],'x','y',true);
    p.path(series(81,i=>[cos(TAU*i/80),sin(TAU*i/80)]),'violet');
    p.curve(z=>x+y-z,'blue');p.points([[x,y]]);p.arrow(x,y,x+.35*x,y+.35*y);
    return `f(x,y) = ${f(x+y)} · max = √2`;
  });
  put('linear-programming',[real('Weight on y','Gewicht für y',.1,3,2)],(s,[b],f)=>{
    const p=plot(s,[0,4],[0,3]);p.area([[0,0],[3,0],[0,2],[0,0]]);p.points([[0,0],[3,0],[0,2]],'blue');
    const z=max(3,2*b);p.curve(x=>(z-x)/b,'mint');p.points(3===2*b?[[3,0],[0,2]]:3>2*b?[[3,0]]:[[0,2]]);
    return `max(x + ${f(b)}y) = ${f(z)}`;
  });
  put('fourier',[int('Odd harmonics','Ungerade Harmonische',1,12,4)],(s,[n])=>{
    const p=plot(s,[-PI,PI],[-1.5,1.5]);p.line(-PI,-1,0,-1,'blue',true);p.line(0,1,PI,1,'blue',true);
    p.curve(x=>4/PI*sum(series(n,i=>sin((2*i+1)*x)/(2*i+1))));return `k = 1, 3, …, ${2*n-1}`;
  });
  function pde(id,heat){
    put(id,[real('Time','Zeit',0,3,.5,.05),int('Mode','Mode',1,5,2)],(s,[t,n],f)=>{
      const p=plot(s,[0,PI],[-1.15,1.15],'x','u'),a=heat?exp(-.4*n*n*t):cos(n*t);
      p.curve(x=>sin(n*x),'blue');p.curve(x=>a*sin(n*x),'mint');return `n = ${n} · t = ${f(t)} · A(t) = ${f(a)}`;
    });
  }
  pde('heat-equation',true);pde('wave-equation',false);
  put('logistic-growth',[real('Growth rate r','Wachstumsrate r',.25,3,1,.05)],(s,[r],f)=>{
    const p=plot(s,[0,10],[0,1.18],'t','y');p.line(0,1,10,1,'blue',true);p.curve(t=>1/(1+9*exp(-r*t)));
    return `K = 1 · y(0) = 0.1 · y′ when y = 0.5: ${f(r/4)}`.replace('when y = 0.5:','(y = ½) =');
  });
  put('dynamical-systems',[real('Parameter r','Parameter r',1,4,2,.025),real('Starting value','Startwert',.05,.95,.5,.025)],(s,[r,a],f)=>{
    const p=plot(s,[0,35],[0,1.03],'n','x'),v=[a];
    for(let i=0;i<35;i++)v.push(r*v[i]*(1-v[i]));
    p.path(v.map((x,i)=>[i,x]));return `x₀ = ${f(a)} · x₃₅ ≈ ${f(v[v.length-1])}`;
  });
  put('markov',[real('Switch A to B','Wechsel A nach B',0,1,.25,.05),step(1)],(s,[r,n],f)=>{
    let b=0;for(let i=0;i<n;i++)b=(1-b)*r+b*.6;
    columns(s,[1-b,b],['A','B'],{colors:['violet','mint'],ceiling:1});
    return `p₍${n}₎ = (${f(1-b)}, ${f(b)}) · P(B → A) = ${f(.4)}`;
  });
  put('random-walk',[int('Steps','Schritte',10,100,60),int('Path seed','Startwert der Pfade',1,20,1)],(s,[n,seed],f)=>{
    const p=plot(s,[0,100],[-35,35],'n','S');
    for(let j=0;j<4;j++){let a=seed+872*j,v=0;const pairs=[[0,0]];
      for(let i=1;i<=n;i++){a=(Math.imul(a,1664525)+1013904223)>>>0;v+=a>=2**31?1:-1;pairs.push([i,v]);}
      p.path(pairs,['violet','blue','mint','peach'][j],2);}
    return `E[Sₙ] = 0 · σ = √${n} ≈ ${f(sqrt(n))}`;
  });
  put('clt',[int('Tosses','Würfe',2,60,16)],(s,[n],f)=>{
    const p=plot(s,[-4.1,4.1],[0,.57],'z','mass/Δz'),sd=sqrt(n)/2;
    for(let i=0;i<=n;i++){const x=(i-n/2)/sd,h=choose(n,i)*.5**n*sd;
      if(abs(x)<4)p.area([[x-.4/sd,0],[x+.4/sd,0],[x+.4/sd,h],[x-.4/sd,h],[x-.4/sd,0]]);}
    p.curve(x=>exp(-x*x/2)/sqrt(2*PI),'mint');return `n = ${n} · Δz = ${f(1/sd)}`;
  });
  put('entropy',[real('Heads probability','Wahrscheinlichkeit für Kopf',0,1,.5,.025)],(s,[p],f)=>{
    const entropy=x=>[x,1-x].reduce((z,a)=>z-(a?a*Math.log2(a):0),0),g=plot(s,[0,1],[0,1.12],'p','H');
    g.curve(entropy);g.points([[p,entropy(p)]]);return `H ≈ ${f(entropy(p))} bit`;
  });
  put('least-squares',[real('Fitted slope','Angepasste Steigung',.25,3,1.5,.05),real('Fitted intercept','Angepasster Achsenabschnitt',0,3,1,.05)],(s,[a,b],f)=>{
    const data=[[0,1],[1,3],[2,5]],p=plot(s,[-.5,3],[0,10]);p.curve(x=>a*x+b);p.points(data,'blue');
    data.forEach(([x,y])=>p.line(x,y,x,a*x+b,'mint',true));
    return `RSS = ${f(sum(data.map(([x,y])=>(y-a*x-b)**2)))}`;
  });
  put('logistic-regression',[real('Score z','Score z',-6,6,0,.1)],(s,[z],f)=>{
    const p=plot(s,[-6,6],[0,1.06],'z','p');p.curve(logistic);p.points([[z,logistic(z)]]);return `p ≈ ${f(100*logistic(z),2)} %`;
  });
  function soft(z,T){const a=z.map(x=>exp(x/T)),d=sum(a);return a.map(x=>x/d);}
  put('softmax',[real('Temperature','Temperatur',.2,3,1,.05),real('First score','Erster Score',0,5,3)],(s,[T,a],f)=>{
    const v=soft([a,2,1],T);columns(s,v,['p₁','p₂','p₃'],{colors:['violet','blue','mint'],ceiling:1});return `Σpᵢ = ${f(sum(v))}`;
  });
  put('cross-entropy',[real('Predicted probability','Prognostizierte Wahrscheinlichkeit',.01,.99,.5,.01),int('True label','Wahres Label',0,1,1)],(s,[p,y],f)=>{
    const fn=x=>-log(y?x:1-x),g=plot(s,[0,1],[0,4.8],'p','L');g.curve(fn);g.points([[p,fn(p)]]);return `y = ${y} · L ≈ ${f(fn(p))}`;
  });
  put('regularization',[real('Penalty λ','Strafgewicht λ',0,5,1,.1)],(s,[l],f)=>{
    const fn=x=>(x-2)**2+l*x*x,g=plot(s,[-1,3],[0,16],'β','L'),m=2/(1+l);
    g.curve(x=>(x-2)**2,'blue');g.curve(fn);g.points([[m,fn(m)]]);return `β* = ${f(m)}`;
  });
  put('relu',[at],(s,[x],f)=>{
    const p=plot(s,[-3,3],[-1,3.2]);p.curve(x=>max(0,x));p.points([[x,max(0,x)]]);return `ReLU(${f(x)}) = ${f(max(0,x))}`;
  });
  put('pca',[int('Projection angle','Projektionswinkel',0,180,25)],(s,[a],f)=>{
    const t=a*PI/180,u=cos(t),v=sin(t),p=plot(s,[-5,5],[-5,5],'x','y',true),data=[[-3,-.5],[-2,.55],[-1,-.75],[1,.75],[2,-.55],[3,.5]];
    p.line(-4*u,-4*v,4*u,4*v,'violet');
    for(const [x,y] of data){const d=x*u+y*v;p.line(x,y,d*u,d*v,'blue',true);p.points([[d*u,d*v]],'mint');}
    p.points(data,'violet');return `Var ≈ ${f(sum(data.map(([x,y])=>(x*u+y*v)**2))/data.length)}`;
  });
  put('attention',[real('First scaled score','Erster skalierter Score',-3,3,0)],(s,[z],f)=>{
    const v=soft([z,0],1);columns(s,v,['w₁ · V₁=2','w₂ · V₂=6'],{colors:['violet','mint'],ceiling:1});
    return `w₁ ≈ ${f(v[0])} · w₂ ≈ ${f(v[1])} · A ≈ ${f(2*v[0]+6*v[1])}`;
  });
  put('modular',[int('Input integer','Ganze Zahl',-24,36,17),int('Modulus','Modul',3,12,12)],(s,[a,n])=>{
    const r=(a%n+n)%n;s.dot(360,135,97,'grid','violet');
    for(let i=0;i<n;i++){const t=i*TAU/n,x=360+97*sin(t),y=135-97*cos(t);s.dot(x,y,13,i===r?'mint':'grid');s.label(x,y+5,i,i===r?'grid':'ink',14);}
    return `${a} ≡ ${r} (mod ${n})`;
  });
  put('groups',[int('Rotation count','Anzahl Drehungen',0,12,3),int('Polygon sides','Ecken des Vielecks',3,9,3)],(s,[a,n])=>{
    const p=i=>[360+92*sin(i*TAU/n),135-92*cos(i*TAU/n)];s.poly(series(n+1,p),'violet',3,'violet',.19);
    s.dot(...p(0),11,'blue');s.dot(...p(a%n),7,'mint');s.arrow(360,135,...p(a%n),'mint');
    return `r^${a} = r^${a%n} (C${n})`;
  });
  put('fields',[int('Nonzero residue','Restklasse ungleich null',1,4,2)],(s,[a])=>{
    const r=series(5,i=>(i*a)%5);tiles(s,5,1,i=>[r[i]===1?'mint':'grid',r[i]],{type:'rect'});
    return `${a} × ${r.indexOf(1)} ≡ 1 (mod 5)`;
  });
  put('metric-spaces',[real('Radius','Radius',.3,2.8,1,.05)],(s,[r],f)=>{
    const p=plot(s,[-3,3],[-3,3],'x','y',true);p.path(series(81,i=>[r*cos(TAU*i/80),r*sin(TAU*i/80)]),'violet');
    p.path([[r,0],[0,r],[-r,0],[0,-r],[r,0]],'mint');p.points([[0,0]]);
    s.label(548,40,'ℓ₂ / ℓ₁','muted',16);return `r = ${f(r)} · ℓ₂ = √(x²+y²) · ℓ₁ = abs(x)+abs(y)`;
  });
  put('topology',[int('Base polygon vertices','Ecken der Grundfläche',3,9,3)],(s,[n])=>{
    const base=series(n,i=>[360+165*cos(i*TAU/n),179+47*sin(i*TAU/n)]),apex=[360,30];
    s.poly([...base,base[0]],'violet',2,'violet',.15);
    base.forEach(point=>{s.line(...apex,...point,'blue',2);s.dot(...point,5,'mint');});s.dot(...apex,7,'mint');
    return `χ = ${n+1} − ${2*n} + ${n+1} = 2`;
  });
  put('measure',[real('Interval length','Intervalllänge',.5,5,3,.25),real('Function height','Funktionshöhe',.5,4,2,.25)],(s,[w,h],f)=>{
    const p=plot(s,[-1,6],[0,5]);p.area([[0,0],[w,0],[w,h],[0,h],[0,0]]);p.line(0,h,w,h,'mint');
    return `∫ f dμ = ${f(h)} × ${f(w)} = ${f(w*h)}`;
  });
  put('complex-analysis',[at,real('Input y','Eingabe y',-3,3,1)],(s,[x,y],f)=>{
    const p=plot(s,[-10,10],[-10,10],'Re','Im',true),u=x*x-y*y,v=2*x*y;
    p.arrow(0,0,x,y,'violet');p.arrow(0,0,u,v,'mint');
    return `uₓ = vᵧ = ${f(2*x)} · uᵧ = −vₓ = ${f(-2*y)}`;
  });
  put('curvature',[at],(s,[x],f)=>{
    const p=plot(s,[-3,3],[0,9.2]);p.curve(z=>z*z);p.curve(z=>x*x+2*x*(z-x),'mint');p.points([[x,x*x]]);
    return `κ = 2/(1+4x²)³⁄² ≈ ${f(2/(1+4*x*x)**1.5)}`;
  });
  put('functional-analysis',[int('First coordinate','Erste Koordinate',-5,5,3),int('Second coordinate','Zweite Koordinate',-5,5,4)],(s,[x,y],f)=>{
    const p=plot(s,[-6,6],[-6,6],'x','y',true);p.arrow(0,0,x,y,'mint');p.path([[0,0],[x,0],[x,y]],'violet');
    return `‖v‖₁ = ${abs(x)+abs(y)} · ‖v‖₂ = ${f(hypot(x,y))}`;
  });
  put('category',[int('Input x','Eingabe x',-5,5,1)],(s,[x])=>{
    const a=[190,192],b=[360,61],c=[530,192];
    s.arrow(...a,...b,'violet');s.arrow(...b,...c,'blue');s.arrow(...a,...c,'mint');
    s.label(245,112,'f: +1');s.label(486,112,'g: ×2');s.label(360,225,'h: 2x + 2','mint');
    s.dot(...a,18,'grid');s.dot(...b,18,'grid');s.dot(...c,18,'grid');s.label(a[0],a[1]+6,x);s.label(b[0],b[1]+6,x+1);s.label(c[0],c[1]+6,2*x+2);
    return `g(f(${x})) = h(${x}) = ${2*x+2}`;
  });
  put('algebraic-geometry',[real('Constant c','Konstante c',-2,5,1,.25)],(s,[c],f,t)=>{
    const p=plot(s,[-3,3],[-3,3],'x','y',true);if(c>0){const r=sqrt(c);p.path(series(81,i=>[r*cos(TAU*i/80),r*sin(TAU*i/80)]),'mint');}else if(c===0)p.points([[0,0]]);
    return `x² + y² = ${f(c)} · ${c>0?t('circle','Kreis'):c===0?t('one point','ein Punkt'):t('empty real locus','leere reelle Punktmenge')}`;
  });
})();
