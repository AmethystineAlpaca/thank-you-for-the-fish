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
// Pick a palette from the actual sprite, so the light follows its body and fins.
const palettes=[
 {hue:8,alternate:328,glow:'#ee9eac',pearl:['#f2b5c4','#ffe4c7','#c7bce8']},
 {hue:38,alternate:348,glow:'#e9ba79',pearl:['#f4c7a3','#f9e8ce','#dabce7']},
 {hue:85,alternate:192,glow:'#e2c78f',pearl:['#e9d9ae','#b8dbe9','#d6c4ed']},
 {hue:165,alternate:218,glow:'#91cce6',pearl:['#b9dfe8','#ccd0ef','#efd0de']},
 {hue:215,alternate:266,glow:'#91bbed',pearl:['#aed5ef','#cbbcec','#f1cbdc']},
 {hue:275,alternate:207,glow:'#beaaec',pearl:['#d6bcec','#efc9dc','#b9dceb']},
 {hue:330,alternate:28,glow:'#e9a9c6',pearl:['#edbed6','#e0c6ed','#f5dfc0']}
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
 const prism=palette.pearl.map(color=>{
  const [h]=hsl(...color.slice(1).match(/../g).map(v=>parseInt(v,16)));
  return `hsl(${h} 72% 65%)`;
 });
 const result={palette,prism,bounds,alternate:null,emission:null};
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
function emissionSource(source,look){
 if(look.emission)return look.emission;
 const emission=document.createElement('canvas');emission.width=source.width;emission.height=source.height;
 const pixels=source.getContext('2d').getImageData(0,0,source.width,source.height),data=pixels.data;
 const tint=look.palette.glow.slice(1).match(/../g).map(v=>parseInt(v,16));
 for(let i=0;i<data.length;i+=4){
  // Bloom comes from illuminated scales and markings, leaving dark eyes and shadows intact.
  const light=(data[i]*.2126+data[i+1]*.7152+data[i+2]*.0722)/255;
  const strength=Math.max(0,Math.min(1,(light-.38)/.48));
  data[i+3]*=strength*strength;
  for(let j=0;j<3;j++)data[i+j]=tint[j]*.35+255*.65;
 }
 emission.getContext('2d').putImageData(pixels,0,0);look.emission=emission;return emission;
}
function sparkles(c,look,source,x,y,dw,dh,t,id,prism){
 const b=look.bounds,left=x+b.left/source.width*dw,top=y+b.top/source.height*dh;
 const width=(b.right-b.left)/source.width*dw,height=(b.bottom-b.top)/source.height*dh;
 const points=[[.18,.1],[.72,.06],[.93,.55],[.38,.72],[.07,.53],[.66,.9],[.5,.32]];
 c.save();
 points.forEach(([px,py],i)=>{
  const phase=t*(prism?2.2:1.8)+i*2.4+id*.63;
  const pulse=Math.pow((Math.sin(phase)+1)/2,3),alpha=.22+pulse*.78;
  const radius=Math.max(1.7,dw*.022)*(i%3===0?1.25:.8)*(.65+pulse*.55);
  const color=prism?look.prism[i%3]:look.palette.glow;
  c.save();c.translate(left+width*px,top+height*py+Math.sin(phase*.6)*dh*.014);
  c.globalAlpha=alpha;c.shadowColor=color;c.shadowBlur=radius*1.8;
  c.fillStyle=color;c.beginPath();
  for(let j=0;j<8;j++){
   const angle=j*Math.PI/4,r=j%2?radius*.22:radius;
   const xx=Math.cos(angle)*r,yy=Math.sin(angle)*r;
   if(j)c.lineTo(xx,yy);else c.moveTo(xx,yy);
  }
  c.closePath();c.fill();c.shadowBlur=0;
  c.fillStyle='#fffdf6';c.beginPath();c.arc(0,0,Math.max(.6,radius*.23),0,Math.PI*2);c.fill();
  c.restore();
 });
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
 const look=trait==='normal'?null:appearance(source,f);
 const body=trait==='alternate'?alternateSource(source,look):source;
 c.save();c.imageSmoothingEnabled=true;c.imageSmoothingQuality='high';
 if(trait==='glow'){
  const radius=Math.max(1.5,dw*.028)*(1+Math.sin(t*1.5)*.12);
  c.filter=`brightness(1.14) saturate(1.12) drop-shadow(0px 0px ${radius}px ${look.palette.glow}ee) drop-shadow(0px 0px ${radius*2.2}px ${look.palette.glow}a0)`;
 }
 Motion.draw(c,body,x,y,dw,dh,t,kind);c.restore();
 if(trait==='glow'){
  const emission=emissionSource(source,look),pulse=.9+Math.sin(t*1.5)*.1;
  c.save();c.globalCompositeOperation='screen';c.globalAlpha=.62*pulse;
  c.filter=`blur(${Math.max(.8,dw*.014)}px)`;Motion.draw(c,emission,x,y,dw,dh,t,kind);
  c.filter='none';c.globalAlpha=.42*pulse;Motion.draw(c,emission,x,y,dw,dh,t,kind);c.restore();
 }
 if(trait==='prism'){
  // A visible opalescent color wave, with the original scale shading underneath.
  let foil=canvas._fishFoil;
  if(!foil){foil=document.createElement('canvas');canvas._fishFoil=foil}
  if(foil.width!==w||foil.height!==h){foil.width=w;foil.height=h}
  const fc=foil.getContext('2d');fc.clearRect(0,0,w,h);
  Motion.draw(fc,source,x,y,dw,dh,t,kind);
  fc.globalCompositeOperation='source-in';
  const shift=Math.sin(t*.85)*dw*.28;
  const pearl=fc.createLinearGradient(x+shift,y,x+dw*.85+shift,y+dh*.35);
  [0,1,2,0,1].forEach((index,i)=>pearl.addColorStop(i/4,look.prism[index]));
  fc.fillStyle=pearl;fc.fillRect(0,0,w,h);fc.globalCompositeOperation='source-over';
  c.save();c.globalCompositeOperation='color';c.globalAlpha=.7;c.drawImage(foil,0,0);
  c.globalCompositeOperation='soft-light';c.globalAlpha=.3;c.drawImage(foil,0,0);c.restore();
  // Mask the travelling reflection separately so it brightens the existing scales.
  fc.clearRect(0,0,w,h);Motion.draw(fc,source,x,y,dw,dh,t,kind);
  fc.globalCompositeOperation='source-in';
  const sweep=x-dw*.5+(t%4.8)/4.8*dw*2;
  const shine=fc.createLinearGradient(sweep,y,sweep+dw*.3,y+dh*.18);
  shine.addColorStop(0,'#fff6ed00');shine.addColorStop(.42,'#e8dfff60');shine.addColorStop(.5,'#fffaf0dd');shine.addColorStop(.58,'#d9edff60');shine.addColorStop(1,'#fff6ed00');
  fc.fillStyle=shine;fc.fillRect(0,0,w,h);fc.globalCompositeOperation='source-over';
  c.save();c.globalCompositeOperation='screen';c.globalAlpha=.7;c.drawImage(foil,0,0);c.restore();
 }
 if(trait==='glow'||trait==='prism')sparkles(c,look,source,x,y,dw,dh,t,f.id,trait==='prism');
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
