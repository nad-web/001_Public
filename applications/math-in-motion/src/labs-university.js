(() => {
  const {put,knob:k,plot,columns,flow,tiles,series,sum,choose,PI,TAU,sin,cos,sqrt,abs,exp,min,max,hypot}=MathMotion;
  const real=(en,de,min,max,initial,step=.1)=>k(en,de,min,max,step,initial);
  const int=(en,de,min,max,initial)=>real(en,de,min,max,initial,1);
  const at=real('Input x','Eingabe x',-3,3,1);
  const angle=int('Angle in degrees','Winkel in Grad',0,360,45);
  const points=(p,coords,color)=>p.points(coords,color);
  put('limits',[real('Distance to 1','Abstand von 1',.01,1,.35,.01)],(s,[h],f)=>{
    const p=plot(s,[-1,3],[0,4]);p.curve(x=>x+1);
    s.dot(...p.pin(1,2),7,'grid','mint');p.points([[1-h,2-h],[1+h,2+h]],'blue');
    return `f(1−h) = ${f(2-h)} · f(1+h) = ${f(2+h)} · L = 2`;
  });
  put('continuity',[real('Assigned value at 0','Wert bei 0',0,4,3,.25)],(s,[y],f,t)=>{
    const p=plot(s,[-2,2],[-.5,4.5]);p.curve(x=>2+x/2);s.dot(...p.pin(0,2),7,'grid','violet');p.points([[0,y]]);
    return `L = 2 · f(0) = ${f(y)} · ${y===2?t('continuous','stetig'):t('discontinuous','unstetig')}`;
  });
  put('chain-rule',[at],(s,[x],f)=>{
    const p=plot(s,[-3,3],[-1.5,1.5]);p.curve(x=>sin(x*x));p.points([[x,sin(x*x)]]);
    p.curve(z=>sin(x*x)+2*x*cos(x*x)*(z-x),'mint');
    return `g(x) = ${f(x*x)} · f′(g(x)) = ${f(cos(x*x))} · (f∘g)′ = ${f(2*x*cos(x*x))}`;
  });
  put('integration-parts',[real('Upper bound','Obere Grenze',.1,2,1)],(s,[b],f)=>{
    const p=plot(s,[0,2],[0,16]);p.area([[0,0],...series(45,i=>[b*i/44,(b*i/44)*exp(b*i/44)]),[b,0],[0,0]]);
    p.curve(x=>x*exp(x),'mint');return `∫₀ᵇ x exp(x) dx = ${f(exp(b)*(b-1)+1)}`;
  });
  put('fundamental-calculus',[real('Upper bound','Obere Grenze',.1,3,2)],(s,[a],f)=>{
    const p=plot(s,[0,3],[0,4]);p.curve(x=>x,'mint');p.area([[0,0],[a,0],[a,a],[0,0]]);
    p.line(a,0,a,a,'blue',true);return `F(${f(a)}) = ${f(a*a/2)} · F′(${f(a)}) = ${f(a)}`;
  });
  put('taylor',[int('Odd terms','Ungerade Glieder',1,5,2)],(s,[n],f)=>{
    const factorial=k=>series(k,i=>i+1).reduce((a,b)=>a*b,1);
    const p=plot(s,[-5,5],[-2,2]);p.curve(sin,'mint');p.curve(x=>sum(series(n,i=>(-1)**i*x**(2*i+1)/factorial(2*i+1))));
    return `n = ${2*n-1} · sin(0) = 0`;
  });
  put('series-test',[real('Ratio','Quotient',-.9,.9,.5,.05),int('Terms','Glieder',1,25,5)],(s,[r,n],f)=>{
    const v=series(n,i=>(1-r**(i+1))/(1-r)),L=1/(1-r),hi=max(L,1,...v)*1.12;
    const p=plot(s,[0,25],[0,hi],'n','S');p.line(0,L,25,L,'mint',true);p.path(v.map((y,i)=>[i+1,y]));p.points(v.map((y,i)=>[i+1,y]),'blue');
    return `Sₙ = ${f(v[v.length-1])} · S = ${f(L)}`;
  });
  put('partial-derivative',[at,real('Fixed y','Festes y',-3,3,2)],(s,[x,y],f)=>{
    const p=plot(s,[-3,3],[0,19],'x','f');p.curve(z=>z*z+y*y);p.points([[x,x*x+y*y]]);p.curve(z=>x*x+y*y+2*x*(z-x),'mint');
    return `y = ${f(y)} · f(x,y) = ${f(x*x+y*y)} · ∂f/∂x = ${f(2*x)}`;
  });
  put('gradient',[at,real('Input y','Eingabe y',-3,3,2),angle],(s,[x,y,a],f)=>{
    const p=plot(s,[-6,6],[-6,6],'x','y',true), rad=a*PI/180;const ux=cos(rad),uy=sin(rad);
    for(const r of [1,2,3,4,5])p.path(series(65,i=>[r*cos(i*TAU/64),r*sin(i*TAU/64)]),'grid',2);
    p.arrow(x,y,x+.8*x,y+.8*y,'mint');p.arrow(x,y,x+1.7*ux,y+1.7*uy,'blue');p.points([[x,y]]);
    return `∇f = (${f(2*x)}, ${f(2*y)}) · Dᵤf = ${f(2*x*ux+2*y*uy)}`;
  });
  put('double-integral',[int('Subdivisions','Unterteilungen',2,10,6)],(s,[n],f)=>{
    const cols=['grid','violet','blue','mint'];tiles(s,n,n,(i,j)=>cols[min(3,Math.floor((i+n-j-1)*2/n))],{type:'rect'});
    s.label(360,252,'x + y','muted');return `∬ (x + y) dA = 1 · ${n} × ${n}`;
  });
  put('vectors',[real('Scale α','Skala α',-4,4,2,.25),real('Scale β','Skala β',-4,4,3,.25)],(s,[a,b],f)=>{
    const p=plot(s,[-5,5],[-5,5],'x','y',true);p.arrow(0,0,a,0,'violet');p.arrow(a,0,a,b,'blue');p.arrow(0,0,a,b,'mint');
    return `w = (${f(a)}, ${f(b)})`;
  });
  put('dot-product',[angle],(s,[a],f)=>{
    const t=a*PI/180,x=3*cos(t),y=3*sin(t),p=plot(s,[-4,4],[-4,4],'x','y',true);
    p.arrow(0,0,x,y,'violet');p.arrow(0,0,x,0,'mint');p.line(x,y,x,0,'blue',true);
    return `v · (1, 0) = ${f(x)} · proj = (${f(x)}, 0)`;
  });
  put('matrix-transform',[real('Horizontal shear','Horizontale Scherung',-2,2,1,.25)],(s,[a],f)=>{
    const p=plot(s,[-2.5,3.5],[-1,3],'x','y',true);p.path([[0,0],[1,0],[1,1],[0,1],[0,0]],'blue');p.area([[0,0],[1,0],[1+a,1],[a,1],[0,0]]);
    p.arrow(0,0,a,1,'mint');return `e₁ ↦ (1, 0) · e₂ ↦ (${f(a)}, 1)`;
  });
  put('matrix-product',[angle,real('Horizontal stretch','Horizontale Streckung',.25,3,2,.25)],(s,[a,b],f)=>{
    const t=a*PI/180,p=plot(s,[-4,4],[-4,4],'x','y',true),x=cos(t),y=sin(t);
    p.arrow(0,0,b*x,b*y,'violet');p.arrow(0,0,b*x,y,'mint');
    return `RSe₁ = (${f(b*x)}, ${f(b*y)}) · SRe₁ = (${f(b*x)}, ${f(y)})`;
  });
  put('determinant',[real('Horizontal scale','Waagerechte Skala',-3,3,2,.25),real('Vertical scale','Senkrechte Skala',-3,3,3,.25)],(s,[a,b],f)=>{
    const p=plot(s,[-4,4],[-4,4],'x','y',true);p.path([[0,0],[1,0],[1,1],[0,1],[0,0]],'blue');p.area([[0,0],[a,0],[a,b],[0,b],[0,0]],a*b>=0?'mint':'peach');
    return `det A = ${f(a*b)} · |det A| = ${f(abs(a*b))}`;
  });
  put('rank-nullity',[int('Keep vertical direction','Vertikale Richtung erhalten',0,1,0)],(s,[keep],f)=>{
    const p=plot(s,[-3,3],[-3,3],'x','y',true);p.path([[0,0],[2,0],[2,2],[0,2],[0,0]],'blue');p.arrow(0,0,2,0,'mint');if(keep)p.arrow(0,0,0,2,'mint');else p.line(0,-3,0,3,'peach',true);
    return `2 = ${1+keep} + ${1-keep}`;
  });
  put('eigenvectors',[real('Eigenvalue λ₁','Eigenwert λ₁',-3,3,2,.25),real('Eigenvalue λ₂','Eigenwert λ₂',-3,3,3,.25)],(s,[a,b],f)=>{
    const p=plot(s,[-4,4],[-4,4],'x','y',true);p.arrow(0,0,a,0,'violet');p.arrow(0,0,0,b,'mint');p.points([[1,0],[0,1]],'blue');
    return `λ₁ = ${f(a)} · λ₂ = ${f(b)}`;
  });
  put('gaussian-elimination',[int('Row multiplier','Zeilenfaktor',-1,4,2)],(s,[a])=>{
    flow(s,['[2, 3, 8]',`[ ${2-a}, ${3-a}, ${8-3*a} ]`],[`−${a} × [1,1,3]`]);
    return `R₂ = [${2-a}, ${3-a}, ${8-3*a}]`;
  });
  put('complex-numbers',[angle,real('Magnitude','Betrag',.25,3,2,.25)],(s,[a,r],f)=>{
    const p=plot(s,[-4,4],[-4,4],'Re','Im',true),t=a*PI/180,x=r*cos(t),y=r*sin(t);
    p.arrow(0,0,x,y,'violet');p.arrow(0,0,-y,x,'mint');
    return `z = ${f(x)} + (${f(y)})i · iz = ${f(-y)} + (${f(x)})i`;
  });
  put('induction',[int('Square size','Quadratgröße',2,10,5)],(s,[n])=>{
    tiles(s,n,n,(i,j)=>i===n-1||j===n-1?'mint':'violet',{type:'rect'});
    return `${n-1}² + ${2*n-1} = ${n}² = ${n*n}`;
  });
  put('sets',[int('Common elements','Gemeinsame Elemente',0,7,3)],(s,[a])=>{
    s.dot(310,130,95,'grid','violet');s.dot(410,130,95,'grid','mint');
    s.label(260,138,8-a,'violet',26);s.label(360,138,a,'ink',26);s.label(460,138,7-a,'mint',26);
    s.label(280,38,'A','violet');s.label(440,38,'B','mint');
    return `n(A ∪ B) = 8 + 7 − ${a} = ${15-a}`;
  });
  put('logic',[int('Premise p','Voraussetzung p',0,1,1),int('Conclusion q','Folgerung q',0,1,0)],(s,[p,q])=>{
    for(let i=0;i<4;i++){
      const a=i>>1,b=i%2,active=a===p&&b===q,y=72+i*45;
      s.rect(185,y-25,350,36,active?'violet':'grid',active?.55:.5);
      [a,b,Number(!a||b)].forEach((val,j)=>s.label(258+j*100,y,val,active?'ink':'muted'));
    }
    ['p','q','p ⇒ q'].forEach((x,i)=>s.label(258+i*100,33,x));
    return `${p} ⇒ ${q} = ${Number(!p||q)}`;
  });
  put('graphs',[int('Cycle vertices','Knoten im Kreis',3,9,3)],(s,[n])=>{
    const v=series(n,i=>[360+103*cos(i*TAU/n),133+103*sin(i*TAU/n)]);
    v.forEach(([x,y],i)=>{s.line(x,y,...v[(i+1)%n],'violet',3);s.dot(x,y,11,'mint');s.label(x,y+5,2,'grid',13);});
    return `Σ deg(v) = ${n} × 2 = ${n*2}`;
  });
  put('conditional',[int('Given die value above','Würfelwert größer als',0,5,3)],(s,[a],f)=>{
    tiles(s,6,1,i=>[i+1<=a?'grid':i%2?'mint':'violet',i+1],{type:'rect'});const v=3-Math.floor(a/2);
    return `P = ${v}/${6-a} ≈ ${f(v/(6-a))}`;
  });
  put('bayes',[int('Prior (%)','Vorwahrscheinlichkeit (%)',1,45,10),int('True positive rate (%)','Sensitivität (%)',5,100,50),int('False positive rate (%)','Falsch-Positiv-Rate (%)',1,70,6)],(s,[a,b,c],f,t)=>{
    const x=a*b/100,y=(100-a)*c/100;
    columns(s,[x,y],[t('True positives','Richtig positiv'),t('False positives','Falsch positiv')],{colors:['mint','violet']});
    return `P(A ∣ B) ≈ ${f(100*x/(x+y),2)} %`;
  });
  put('expectation',[int('Die faces','Würfelseiten',2,12,6)],(s,[n],f)=>{
    columns(s,series(n,()=>1/n),series(n,i=>i+1),{ceiling:.5});return `E[X] = ${f((n+1)/2)}`;
  });
  put('normal-distribution',[real('Mean μ','Mittelwert μ',-2,2,0,.25),real('Std. deviation σ','Standardabweichung σ',.5,2,1,.05)],(s,[m,d],f)=>{
    const p=plot(s,[-8,8],[0,.85],'x','f'),fn=x=>exp(-(((x-m)/d)**2)/2)/(d*sqrt(2*PI));
    p.curve(fn);p.line(m,0,m,fn(m),'mint',true);return `μ = ${f(m)} · σ = ${f(d)}`;
  });
  put('covariance',[real('Trend','Trend',-1,1,1,.1),real('Noise','Streuung',0,2,.0,.1)],(s,[a,b],f)=>{
    const v=series(11,i=>[(i-5)/2,a*(i-5)/2+b*sin(2*i)]),p=plot(s,[-3,3],[-5,5]);p.points(v);
    const xy=(x,y)=>sum(v.map(r=>r[x]*r[y]))/v.length-(sum(v.map(r=>r[x]))/v.length)*(sum(v.map(r=>r[y]))/v.length);
    return `r = ${f(xy(0,1)/sqrt(xy(0,0)*xy(1,1)))}`;
  });
  put('first-order-ode',[real('Rate k','Rate k',-1.5,.5,-1),real('Initial y','Anfang y',.5,3,2)],(s,[a,b],f)=>{
    const fn=x=>b*exp(a*x),p=plot(s,[0,4],[0,max(3.2,fn(4)*1.1)],'t','y');p.curve(fn);p.points([[0,b],[1,fn(1)]]);
    return `y(1) = ${f(fn(1))}`;
  });
  put('harmonic-motion',[real('Frequency','Kreisfrequenz',.5,3,1,.05),real('Time','Zeit',0,TAU,2,.01)],(s,[w,t],f)=>{
    const p=plot(s,[0,6.3],[-1.2,1.2],'t','x');p.curve(x=>cos(w*x));p.points([[t,cos(w*t)]]);
    return `x(t) = ${f(cos(w*t))} · x″(t) = ${f(-w*w*cos(w*t))}`;
  });
})();
