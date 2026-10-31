const NS='http://www.w3.org/2000/svg';
const forms={
 circle:['circle',{cx:50,cy:50,r:32}],square:['rect',{x:20,y:20,width:60,height:60,rx:4}],
 triangle:['path',{d:'M50 16 86 80H14Z'}],star:['path',{d:'m50 12 11 26 28 3-22 19 7 28-24-15-24 15 7-28-22-19 28-3Z'}],
 heart:['path',{d:'M50 83C-11 46 24 3 50 33 76 3 111 46 50 83Z'}],diamond:['path',{d:'m50 10 36 40-36 40-36-40Z'}],
 hexagon:['path',{d:'m32 17 36 0 20 33-20 33H32L12 50Z'}],pentagon:['path',{d:'m50 12 38 28-15 45H27L12 40Z'}],
 oval:['ellipse',{cx:50,cy:50,rx:38,ry:24}],crescent:['path',{d:'M70 17a36 36 0 1 0 5 64C35 81 24 29 70 17Z'}],
 plus:['path',{d:'M39 14h22v25h25v22H61v25H39V61H14V39h25Z'}],ring:['circle',{cx:50,cy:50,r:30,fill:'none','stroke-width':13}],
 rectangle:['rect',{x:10,y:30,width:80,height:42,rx:4}],trapezoid:['path',{d:'M31 20h38l22 60H9Z'}],
 arrow:['path',{d:'M12 38h44V16l34 34-34 34V62H12Z'}],cross:['path',{d:'m28 14 22 22 22-22 14 14-22 22 22 22-14 14-22-22-22 22-14-14 22-22-22-22Z'}],
 octagon:['path',{d:'M32 12h36l20 20v36L68 88H32L12 68V32Z'}],semicircle:['path',{d:'M12 70a38 38 0 0 1 76 0Z'}],
 wave:['path',{d:'M10 40q10-30 27 0t27 0 27 0M10 65q10-30 27 0t27 0 27 0',fill:'none','stroke-width':9}],
 spiral:['path',{d:'M47 51c14-16 30 14 6 19C20 78 15 24 48 22c47-2 48 67 1 67',fill:'none','stroke-width':8}],
};
export function shapeArt(name){
 const svg=document.createElementNS(NS,'svg');svg.setAttribute('viewBox','0 0 100 100');svg.setAttribute('aria-hidden','true');
 const [tag,attrs]=forms[name]||forms.circle;const p=document.createElementNS(NS,tag);
 p.setAttribute('fill','currentColor');p.setAttribute('stroke','currentColor');p.setAttribute('stroke-width','2');p.setAttribute('stroke-linejoin','round');
 for(const [k,v]of Object.entries(attrs))p.setAttribute(k,v);svg.append(p);return svg;
}
