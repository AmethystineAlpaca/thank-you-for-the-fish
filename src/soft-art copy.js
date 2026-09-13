/* Reuse the finished image assets. No online generation or network calls at runtime. */
(function(){
const boat=new Image();
const atlases=[
 {file:'fish-0-alpha.png',cuts:[0,.20,.40,.575,.74,1]},
 {file:'fish-1-white.png',cuts:[0,.2,.4,.575,.78,1],whiteBackground:true},
 {file:'fish-2-white.png',cuts:[0,257,479,724,970,1254].map(y=>y/1254),whiteBackground:true,
  regions:{6:[630,257,982,479],7:[982,257,1254,479],8:[0,479,313,710],12:[0,710,313,970]}},
 {file:'fish-3-white.png',cuts:[0,244,510,740,973,1254].map(y=>y/1254),whiteBackground:true,
  regions:{4:[0,244,330,510],5:[330,244,660,510],6:[660,244,940,550],10:[627,550,940,740]}},
 {file:'fish-4-white.png',cuts:[0,255,493,725,977,1254].map(y=>y/1254),whiteBackground:true,
  regions:{13:[313.5,725,627,961],14:[627,725,940,990],17:[313.5,961,627,1254],18:[627,990,940,1254]}}
].map(atlas=>({...atlas,image:new Image()}));
function load(img,file){return new Promise((resolve,reject)=>{img.onload=resolve;img.onerror=()=>reject(Error('Could not load '+file));img.src='assets/soft-sea/'+file})}
const ready=Promise.all([load(boat,'boat.png'),...atlases.map(atlas=>load(atlas.image,atlas.file))]);
const reefSlots=[0,2,3,4,5,6,7,8,9,10,1,11,12,13,14,15,16,17,18,19];
const fishFrames=new Map(),sceneStates=new WeakMap();
const appearances=new Map();
// Alternate palettes follow the original sprite; fluorescence and silver foil are independent.
const neonHues=[135,355,280,205,55];
function glowIndex(f,record){
 // The catch ID already contains randomness and survives reloads, including old saves.
 const seed=String(record?.id??('species-'+f.id));
 let hash=2166136261;
 for(let i=0;i<seed.length;i++)hash=Math.imul(hash^seed.charCodeAt(i),16777619);
 return (hash>>>0)%neonHues.length;
}
function glowAppearance(base,f,record){
 const index=glowIndex(f,record);
 if(!base.glows.has(index)){
  const neon=rgb(neonHues[index],1,.57);
  base.glows.set(index,{neon,neonColor:`rgb(${neon.join(',')})`,luminous:null,emission:null,rim:null,core:null});
 }
 return base.glows.get(index);
}
const palettes=[
 {hue:8,alternate:328,glow:'#ee9eac'},
 {hue:38,alternate:348,glow:'#e9ba79'},
 {hue:85,alternate:192,glow:'#e2c78f'},
 {hue:165,alternate:218,glow:'#91cce6'},
 {hue:215,alternate:266,glow:'#91bbed'},
 {hue:275,alternate:207,glow:'#beaaec'},
 {hue:330,alternate:28,glow:'#e9a9c6'}
];
const hueDistance=(a,b)=>(a-b+540)%360-180;
function hsl(r,g,b){
 r/=255;g/=255;b/=255;
 const max=Math.max(r,g,b),min=Math.min(r,g,b),d=max-min,l=(max+min)/2;
 if(!d)return [0,0,l];
 const h=max===r?((g-b)/d+6)%6:max===g?(b-r)/d+2:(r-g)/d+4;
 return [h*60,d/(1-Math.abs(2*l-1)),l];
}
function rgb(h,s,l){
 const a=s*Math.min(l,1-l);
 return [0,8,4].map(n=>{const k=(n+h/30)%12;return 255*(l-a*Math.max(-1,Math.min(k-3,9-k,1)))});
}
function hashInt(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++)h = Math.imul(h ^ str.charCodeAt(i), 16777619);
  return h >>> 0;
}

function mulberry32(a) {
  return function () {
    let t = a += 0x6D2B79F5;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function rgbaFromHsl(h, s, l, a) {
  const [r, g, b] = rgb(h, s, l).map(v => Math.round(v));
  return `rgba(${r},${g},${b},${a})`;
}

function prismStops(look, id) {
  if (!look.prismVariants) look.prismVariants = new Map();
  if (look.prismVariants.has(id)) return look.prismVariants.get(id);

  const rand = mulberry32(hashInt('prism-' + id));
  const base = look.palette.hue;
  const drift = (rand() - .5) * 30;

  function build(offsets) {
    return offsets.map((off, i) => {
      const h = (base + drift + off + (rand() - .5) * 12 + 360) % 360;
      const s = .62 + rand() * .14;
      const l = .58 + rand() * .10;
      const a = i === offsets.length - 1 ? 0 : (.78 - rand() * .12);
      return [i / (offsets.length - 1), rgbaFromHsl(h, s, l, a)];
    });
  }

  const result = {
    A: build([0, 25, 60, 105, 155]),
    B: build([15, 45, 85, 135, 190])
  };

  look.prismVariants.set(id, result);
  return result;
}
function appearance(source,f){
 if(appearances.has(f.id))return appearances.get(f.id);
 const pixels=source.getContext('2d').getImageData(0,0,source.width,source.height),data=pixels.data;
 const bins=new Float64Array(24),bounds={left:source.width,top:source.height,right:0,bottom:0};
 for(let i=0;i<data.length;i+=4){
  if(data[i+3]>128){
   const x=i/4%source.width,y=Math.floor(i/4/source.width);
   bounds.left=Math.min(bounds.left,x);bounds.right=Math.max(bounds.right,x);
   bounds.top=Math.min(bounds.top,y);bounds.bottom=Math.max(bounds.bottom,y);
  }
  const [h,s,l]=hsl(data[i],data[i+1],data[i+2]);
  if(data[i+3]<128||l<.12||l>.88)continue;
  bins[Math.round(h/15)%24]+=s*s*(1-Math.abs(l-.5));
 }
 const dominant=bins.some(v=>v>0)?bins.indexOf(Math.max(...bins))*15:215;
 const palette=palettes.reduce((best,p)=>Math.abs(hueDistance(p.hue,dominant))<Math.abs(hueDistance(best.hue,dominant))?p:best);

 const result={palette,bounds,alternate:null,glows:new Map()};
 appearances.set(f.id,result);return result;
}
function alternateSource(source,look){
 if(look.alternate)return look.alternate;
 const alternate=document.createElement('canvas');alternate.width=source.width;alternate.height=source.height;
 const ac=alternate.getContext('2d'),pixels=source.getContext('2d').getImageData(0,0,source.width,source.height),data=pixels.data;
 for(let i=0;i<data.length;i+=4){
  if(!data[i+3])continue;
  const [h,s,l]=hsl(data[i],data[i+1],data[i+2]);
  // Keep eyes, pale bellies, stripes and highlights; recolor only pigmented areas.
  const amount=Math.min(1,s/.22)*Math.min(1,Math.max(0,(l-.08)/.16));
  const target=(look.palette.alternate+Math.max(-38,Math.min(38,hueDistance(h,look.palette.hue)*.35))+360)%360;
  const color=rgb(target,Math.min(.62,s*.78),l);
  for(let j=0;j<3;j++)data[i+j]+=(color[j]-data[i+j])*amount;
 }
 ac.putImageData(pixels,0,0);look.alternate=alternate;return alternate;
}
function luminousSource(source,look){
 if(look.luminous)return look.luminous;
 const luminous=document.createElement('canvas');luminous.width=source.width;luminous.height=source.height;
 const emission=document.createElement('canvas');emission.width=source.width;emission.height=source.height;
 const pixels=source.getContext('2d').getImageData(0,0,source.width,source.height),data=pixels.data;
 const lights=emission.getContext('2d').createImageData(source.width,source.height),lightData=lights.data;
 // Remove the original pigments, retaining relief as a translucent dyed membrane.
 const original=new Uint8ClampedArray(data);
 const energy=i=>(original[i]+original[i+1]+original[i+2])/(3*255);
 const w=source.width,h=source.height;
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){
  const i=(y*w+x)*4,alpha=original[i+3];if(!alpha)continue;
  const light=energy(i);
  let relief=0;
  for(const [dx,dy] of [[-2,0],[2,0],[0,-2],[0,2]]){
   const xx=x+dx,yy=y+dy;
   if(xx<0||xx>=w||yy<0||yy>=h)continue;
   const j=(yy*w+xx)*4;
   if(original[j+3]>128)relief=Math.max(relief,Math.abs(light-energy(j)));
  }
  const detail=Math.min(1,relief*3.5);
  const highlight=Math.pow(light,3);
  // Fine original markings glow inside the body; the background remains visible.
  // data[i+3]=alpha*(.12+.20*light+.12*detail);
  data[i + 3] = alpha * (.55 + .20 * light + .10 * detail);
  lightData[i+3]=alpha*(.035+.22*detail+.13*highlight);
  for(let j=0;j<3;j++){
  //  data[i+j]=look.neon[j]*(.48+.52*light);
   data[i + j] = original[i + j] * .55 + look.neon[j] * (.25 + .20 * light);
   const white=.08+.28*highlight+.16*detail;
   lightData[i+j]=look.neon[j]*(1-white)+255*white;
  }
 }
 luminous.getContext('2d').putImageData(pixels,0,0);
 emission.getContext('2d').putImageData(lights,0,0);
 look.luminous=luminous;look.emission=emission;return luminous;
}
function neonContours(source,look){
 if(look.rim)return;
 const w=source.width,h=source.height,pixels=source.getContext('2d').getImageData(0,0,w,h).data;
 const layers=[{key:'rim',radius:3,color:look.neon},{key:'core',radius:1,color:look.neon.map(v=>v*.45+255*.55)}];
 for(const {key,radius,color} of layers){
  const canvas=document.createElement('canvas');canvas.width=w;canvas.height=h;
  const c=canvas.getContext('2d'),edge=c.createImageData(w,h);
  const offsets=Array.from({length:16},(_,i)=>[Math.round(Math.cos(i*Math.PI/8)*radius),Math.round(Math.sin(i*Math.PI/8)*radius)]);
  for(let y=0;y<h;y++)for(let x=0;x<w;x++){
   const i=(y*w+x)*4,alpha=pixels[i+3];if(!alpha)continue;
   let inside=alpha;
   for(const [dx,dy] of offsets){
    const xx=x+dx,yy=y+dy;
    inside=Math.min(inside,xx<0||xx>=w||yy<0||yy>=h?0:pixels[(yy*w+xx)*4+3]);
   }
   // An inner contour follows fins, tails and tentacles without filling their gaps.
   edge.data[i+3]=alpha-inside;
   for(let j=0;j<3;j++)edge.data[i+j]=color[j];
  }
  c.putImageData(edge,0,0);look[key]=canvas;
 }
}
// Silver substrate and reflectivity mask keep eyes, markings and sculpted shading.
function foilSource(source,look){
 if(look.silver)return look.silver;
 const w=source.width,h=source.height;
 const silver=document.createElement('canvas'),mask=document.createElement('canvas');
 silver.width=mask.width=w;silver.height=mask.height=h;
 const pixels=source.getContext('2d').getImageData(0,0,w,h),data=pixels.data;
 const reflect=mask.getContext('2d').createImageData(w,h);
 for(let i=0;i<data.length;i+=4){
  const peak=Math.max(data[i],data[i+1],data[i+2])/255;
  const light=(data[i]*.2126+data[i+1]*.7152+data[i+2]*.0722)/255;
  const energy=light*.65+peak*.35;
  const protection=Math.min(1,Math.max(0,(energy-.09)/.24));
  const metal=Math.min(255,(energy*.86+.1)*255);
  for(let j=0;j<3;j++){
   data[i+j]+=(metal+[0,4,9][j]-data[i+j])*.25*protection;
   reflect.data[i+j]=255;
  }
  reflect.data[i+3]=data[i+3]*protection;
 }
 silver.getContext('2d').putImageData(pixels,0,0);
 mask.getContext('2d').putImageData(reflect,0,0);
 // Fixed irregular facets: only the reflected light changes, never the pattern.
 const points=[],facets=[];
 const noise=n=>{const v=Math.sin(n*127.1+look.bounds.left*3.7)*43758.5453;return v-Math.floor(v)};
 for(let row=0;row<=4;row++)for(let col=0;col<=7;col++){
  points.push([(col+(col>0&&col<7?(noise(row*8+col)-.5)*.65:0))/7,
   (row+(row>0&&row<4?(noise(row*8+col+91)-.5)*.65:0))/4]);
 }
 for(let row=0;row<4;row++)for(let col=0;col<7;col++){
  const a=row*8+col,b=a+1,d=a+8,e=d+1;
  for(const indices of (row+col)%2?[[a,b,d],[b,e,d]]:[[a,b,e],[a,e,d]]){
   facets.push({vertices:indices.map(i=>points[i]),phase:noise(a+facets.length+21)*Math.PI*2});
  }
 }
 look.silver=silver;look.foilMask=mask;look.facets=facets;return silver;
}
function foilReflection(canvas,c,source,look,x,y,dw,dh,t,kind,id){
 let layers=canvas._fishFoil;
 if(!layers){layers=canvas._fishFoil=Array.from({length:2},()=>document.createElement('canvas'))}
 const [foil,mask]=layers,w=canvas.width,h=canvas.height;
 for(const layer of layers)if(layer.width!==w||layer.height!==h){layer.width=w;layer.height=h}
 const fc=foil.getContext('2d'),mc=mask.getContext('2d');
 mc.clearRect(0,0,w,h);Motion.draw(mc,look.foilMask,x,y,dw,dh,t,kind);
 fc.clearRect(0,0,w,h);
 const b=look.bounds,left=x+b.left/source.width*dw,top=y+b.top/source.height*dh;
 const width=(b.right-b.left)/source.width*dw,height=(b.bottom-b.top)/source.height*dh;
 const angle=t*.72+id*.47;
 const prism = prismStops(look, id);
 // Curved diffraction pools reveal local color as the light rolls over the silver.
 function pool(px,py,rx,ry,stops){
  fc.save();fc.translate(left+px*width,top+py*height);fc.scale(rx*width,ry*height);
  const g=fc.createRadialGradient(0,0,0,0,0,1);
  stops.forEach(([at,color])=>g.addColorStop(at,color));
  fc.fillStyle=g;fc.fillRect(-1,-1,2,2);fc.restore();
 }
 const px=.36+.26*Math.sin(angle),py=.42+.2*Math.cos(angle*.83);
//  pool(px,py,.52,.88,[[0,'#ffcf69ee'],[.17,'#b5ed9de0'],[.34,'#22e6d9f0'],[.55,'#388bf3df'],[.74,'#8665e4a0'],[1,'#8665e400']]);
//  pool(.74+.19*Math.cos(angle*.91),.6+.24*Math.sin(angle*.77),.37,.76,
//   [[0,'#9ff5f5e8'],[.29,'#50bdebe0'],[.56,'#8676eea0'],[.78,'#e8a6d850'],[1,'#e8a6d800']]);
 pool(px, py, .52, .88, prism.A);

 pool(
    .74 + .19 * Math.cos(angle * .91),
    .6 + .24 * Math.sin(angle * .77),
    .37, .76,
    prism.B
 );
 fc.globalCompositeOperation='destination-in';fc.drawImage(mask,0,0);fc.globalCompositeOperation='source-over';
 c.save();c.globalCompositeOperation='color';c.globalAlpha=.25;c.drawImage(foil,0,0);
 c.globalCompositeOperation='soft-light';c.globalAlpha=.42;c.drawImage(foil,0,0);c.restore();
 c.save();c.globalCompositeOperation = 'screen';c.globalAlpha = .10;c.filter = 'blur(4px)';c.drawImage(foil, 0, 0);c.restore();
 // Facets catch and release light independently, with a small pearly reflection.
 fc.clearRect(0,0,w,h);
 for(const {vertices,phase} of look.facets){
  const response=Math.sin(angle+phase),flash=Math.pow(Math.max(0,response),10);
  fc.fillStyle=response>0?`rgba(221,244,255,${.025+flash*.2})`:`rgba(42,53,88,${-response*.1})`;
  fc.beginPath();vertices.forEach(([px,py],i)=>{
   const xx=left+px*width,yy=top+py*height;
   if(i)fc.lineTo(xx,yy);else fc.moveTo(xx,yy);
  });fc.closePath();fc.fill();
 }
 pool(px-.1,py-.18,.2,.36,[[0,'#ffffffa8'],[.2,'#efffff68'],[1,'#efffff00']]);
 fc.globalCompositeOperation='destination-in';fc.drawImage(mask,0,0);fc.globalCompositeOperation='source-over';
 c.save();c.drawImage(foil,0,0);c.restore();
 // Prism glow: soft light spilling outside the fish.
 c.save();
 c.globalCompositeOperation='screen';

 // Outer soft glow
 c.globalAlpha=.28;
 c.filter='blur(6px)';
 c.drawImage(foil,0,0);

 // Bright inner glow
 c.globalAlpha=.18;
 c.filter='blur(1.5px)';
 c.drawImage(foil,0,0);

 c.restore();
}
function fish(canvas,f,trait='normal',t=0,catchRecord=null){
 const c=canvas.getContext('2d'),atlas=atlases[Math.floor(f.id/20)],img=atlas?.image;
 c.clearRect(0,0,canvas.width,canvas.height);
 if(!img?.complete||!img.naturalWidth)return;
 // Keep one neutral source per species, with cached palettes and alternate colors.
 let source=fishFrames.get(f.id);
 if(!source){
  source=document.createElement('canvas');source.width=384;source.height=240;
  const sc=source.getContext('2d');
  {
   const slot=f.id<20?reefSlots[f.id]:f.id%20,col=slot%4,row=Math.floor(slot/4);
   const cuts=atlas.cuts;
   // A few long bills and tall fins extend beyond the nominal atlas grid.
   const region=atlas.regions?.[slot];
   const sx=region?region[0]/1254*img.width:col*img.width/4;
   const sy=region?region[1]/1254*img.height:cuts[row]*img.height;
   const sw=region?(region[2]-region[0])/1254*img.width:img.width/4;
   const sh=region?(region[3]-region[1])/1254*img.height:(cuts[row+1]-cuts[row])*img.height;
   const fit=Math.min(source.width/sw,source.height/sh)*.92;
   sc.imageSmoothingEnabled=true;sc.imageSmoothingQuality='high';
   sc.drawImage(img,sx,sy,sw,sh,(source.width-sw*fit)/2,(source.height-sh*fit)/2,sw*fit,sh*fit);
   // White-matte sheets need edge cleanup; transparent sheets retain native alpha.
   if(atlas.whiteBackground){
   // Remove only white background connected to the tile edge, preserving white markings.
   const pixels=sc.getImageData(0,0,384,240),a=pixels.data,seen=new Uint8Array(384*240),queue=[];
   function visit(i){if(i<0||i>=seen.length||seen[i])return;seen[i]=1;const j=i*4;if(a[j+3]===0||(a[j]>238&&a[j+1]>238&&a[j+2]>238)){queue.push(i);a[j+3]=0}}
   for(let x=0;x<384;x++){visit(x);visit(239*384+x)}for(let y=0;y<240;y++){visit(y*384);visit(y*384+383)}
   for(let k=0;k<queue.length;k++){const i=queue[k];if(i%384)visit(i-1);if(i%384<383)visit(i+1);visit(i-384);visit(i+384)}
   sc.putImageData(pixels,0,0);
   }
  }
  fishFrames.set(f.id,source);
 }
 const w=canvas.width,h=canvas.height,scale=catchRecord?Sea.displayScale(catchRecord):.72;
 const dw=w*scale,dh=h*scale,x=(w-dw)/2,y=(h-dh)/2+Math.sin(t*1.7)*h*.008;
 if(trait==='silhouette'){
  // Use the same modern outline, with no color, texture, or animation before discovery.
  c.save();c.drawImage(source,x,(h-dh)/2,dw,dh);
  c.globalCompositeOperation='source-in';c.fillStyle='#263f43';c.fillRect(0,0,w,h);c.restore();return;
 }
 const kind=['octopus','squid','horse','leafy','dumbo','vampire','blanket','garden'].includes(f.shape)?2:['manta','ray','electric'].includes(f.shape)?3:1;
 const base=trait==='normal'?null:appearance(source,f);
 const look=trait==='glow'?glowAppearance(base,f,catchRecord):base;
 const body=trait==='alternate'?alternateSource(source,look):trait==='glow'?luminousSource(source,look):trait==='prism'?foilSource(source,look):source;
 c.save();c.imageSmoothingEnabled=true;c.imageSmoothingQuality='high';
 Motion.draw(c,body,x,y,dw,dh,t,kind);c.restore();
 if(trait==='glow'){
  neonContours(source,look);
  const pulse=.82+.18*(.5+.5*Math.sin(t*1.8+f.id*.63));
  // Transparent dyed tissue, luminous texture and a gently breathing colored edge.
  c.save();c.globalCompositeOperation='screen';c.globalAlpha=pulse;
  Motion.draw(c,look.emission,x,y,dw,dh,t,kind);c.restore();
  c.save();c.globalAlpha=pulse;
  const radius=Math.max(.8,dw*.009);
  c.filter=`drop-shadow(0px 0px ${radius}px ${look.neonColor}) drop-shadow(0px 0px ${radius*2}px ${look.neonColor})`;
  Motion.draw(c,look.rim,x,y,dw,dh,t,kind);c.restore();
  c.save();c.globalAlpha=.65*pulse;
  Motion.draw(c,look.core,x,y,dw,dh,t,kind);c.restore();
 }
 if(trait==='prism')foilReflection(canvas,c,source,look,x,y,dw,dh,t,kind,f.id);
}
function scene(canvas,t,catching=false,record=null,elapsed=null){
 const w=640,h=372;if(canvas.width!==w||canvas.height!==h){canvas.width=w;canvas.height=h}
 const c=canvas.getContext('2d');c.clearRect(0,0,w,h);if(!boat.complete||!boat.naturalWidth)return;
 c.imageSmoothingEnabled=true;c.imageSmoothingQuality='high';
 let state=sceneStates.get(canvas);if(!state){state={caught:false,start:t};sceneStates.set(canvas,state)}
 if(catching&&(!state.caught||state.catchId!==record?.id))state.start=t;
 state.caught=catching;state.catchId=record?.id;
 // Catch time remains independent of the idle clock, including a paused trial catch.
 const age=Math.max(0,elapsed??t-state.start);
 const tug=catching?(age<.2?-Math.sin(age/.2*Math.PI)*.55:Math.exp(-(age-.2)*3)*Math.sin(Math.min(1,(age-.2)/.16)*Math.PI/2)):0;
 c.save();c.translate(w/2,h/2+Math.sin(t*1.2)*2-tug*2);c.rotate(Math.sin(t*.7)*.006);
 const scale=Math.min(w/boat.width,h/boat.height);Motion.draw(c,boat,-boat.width*scale/2,-boat.height*scale/2,boat.width*scale,boat.height*scale,t,0,tug);c.restore();
 const bw=boat.width*scale,bh=boat.height*scale;
 const bobX=(w-bw)/2+bw*.885,bobY=(h-bh)/2+bh*.665;
 // Additional expanding ripples respond to the deformed line and water.
 c.strokeStyle=catching?'#fff5beaa':'#e5ffff66';c.lineWidth=1.3;
 for(let i=0;i<3;i++){const phase=(t*.35+i/3)%1;c.globalAlpha=(1-phase)*.55;c.beginPath();c.ellipse(bobX,bobY,8+phase*(catching?42:22),2+phase*6,0,0,Math.PI*2);c.stroke()}
 c.globalAlpha=1;
 if(catching&&age>=.24&&age<1.1){
  const p=(age-.24)/.86;
  c.save();c.fillStyle='#edffff';c.globalAlpha=1-p;
  for(let i=0;i<7;i++){
   const angle=Math.PI*(1.12+i*.125),radius=12+p*52;
   c.beginPath();c.ellipse(bobX+Math.cos(angle)*radius,bobY+Math.sin(angle)*radius+p*p*30,1.5,2.5,angle,0,Math.PI*2);c.fill();
  }
  c.restore();
  if(record&&Sea.fish[record.species]){
   if(!state.fish){state.fish=document.createElement('canvas');state.fish.width=240;state.fish.height=150}
   fish(state.fish,Sea.fish[record.species],record.trait,t+age*2,record);
   const x=bobX+(w*.53-bobX)*p,y=bobY+(h*.48-bobY)*p-Math.sin(p*Math.PI)*120;
   c.save();c.translate(x,y);c.rotate(-.5+Math.sin(p*Math.PI*3)*.3+p*.8);
   c.globalAlpha=Math.min(1,p*10,(1-p)*8);c.drawImage(state.fish,-100,-62.5,200,125);c.restore();
  }
 }
}
window.Art={fish,scene,ready,catchRevealDelay:1100,style:'soft-sea',upgradedSpecies:Sea.fish.length};
})();
